import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionUtil } from '../common/utils/encryption.util';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WabaService {
  private readonly metaApiVersion: string;
  private readonly metaAppId: string;
  private readonly metaAppSecret: string;
  private readonly frontendCallbackUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.metaApiVersion = configService.get<string>('META_API_VERSION') || 'v21.0';
    this.metaAppId = configService.get<string>('META_APP_ID') || '';
    this.metaAppSecret = configService.get<string>('META_APP_SECRET') || '';
    this.frontendCallbackUrl = configService.get<string>('FRONTEND_CALLBACK_URL') || '';
  }

  async getEmbeddedSignupUrl(shopId: string, state?: string): Promise<string> {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/waba/embedded/callback`;
    const scopes = 'whatsapp_business_messaging,whatsapp_business_management,business_management';
    
    const url = `https://www.facebook.com/v${this.metaApiVersion}/dialog/oauth?` +
      `client_id=${this.metaAppId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state || shopId}&` +
      `response_type=code`;

    return url;
  }

  async handleCallback(code: string, state: string) {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.get(
        `https://graph.facebook.com/v${this.metaApiVersion}/oauth/access_token`,
        {
          params: {
            client_id: this.metaAppId,
            client_secret: this.metaAppSecret,
            redirect_uri: `${process.env.APP_URL || 'http://localhost:3000'}/waba/embedded/callback`,
            code,
          },
        },
      );

      const accessToken = tokenResponse.data.access_token;

      // Get business info
      const businessResponse = await axios.get(
        `https://graph.facebook.com/v${this.metaApiVersion}/me/businesses`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!businessResponse.data.data || businessResponse.data.data.length === 0) {
        throw new BadRequestException('No business accounts found');
      }

      const businessId = businessResponse.data.data[0].id;

      // Get WABA info
      const wabaResponse = await axios.get(
        `https://graph.facebook.com/v${this.metaApiVersion}/${businessId}/owned_whatsapp_business_accounts`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!wabaResponse.data.data || wabaResponse.data.data.length === 0) {
        throw new BadRequestException('No WABA accounts found');
      }

      const wabaId = wabaResponse.data.data[0].id;

      // Get phone numbers
      const phoneResponse = await axios.get(
        `https://graph.facebook.com/v${this.metaApiVersion}/${wabaId}/phone_numbers`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!phoneResponse.data.data || phoneResponse.data.data.length === 0) {
        throw new BadRequestException('No phone numbers found');
      }

      const phoneId = phoneResponse.data.data[0].id;
      const displayNumber = phoneResponse.data.data[0].display_phone_number || phoneResponse.data.data[0].verified_name;

      // Encrypt and store token
      const encryptedToken = EncryptionUtil.encrypt(accessToken);

      // Check if WABA already exists
      const existingWaba = await this.prisma.wabaAccount.findUnique({
        where: { wabaId },
      });

      let wabaAccount;
      if (existingWaba) {
        wabaAccount = await this.prisma.wabaAccount.update({
          where: { wabaId },
          data: {
            shopId: state,
            phoneId,
            displayNumber,
            encryptedToken,
            tokenExpiresAt: null, // TODO: Extract from token if available
          },
        });
      } else {
        wabaAccount = await this.prisma.wabaAccount.create({
          data: {
            shopId: state,
            wabaId,
            phoneId,
            displayNumber,
            encryptedToken,
          },
        });
      }

      // Register webhook (async, don't wait)
      this.registerWebhook(wabaId, accessToken).catch(console.error);

      return {
        wabaId: wabaAccount.wabaId,
        phoneId: wabaAccount.phoneId,
        displayNumber: wabaAccount.displayNumber,
        webhookVerified: wabaAccount.webhookVerified,
      };
    } catch (error) {
      console.error('WABA callback error:', error);
      throw new BadRequestException('Failed to process WABA connection: ' + error.message);
    }
  }

  private async registerWebhook(wabaId: string, accessToken: string) {
    try {
      const webhookUrl = `${process.env.APP_URL || 'http://localhost:3000'}/webhooks/meta`;
      const verifyToken = this.configService.get<string>('META_VERIFY_TOKEN') || 'default-verify-token';

      await axios.post(
        `https://graph.facebook.com/v${this.metaApiVersion}/${wabaId}/subscribed_apps`,
        {
          subscribed_fields: ['messages', 'message_status'],
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            access_token: accessToken,
          },
        },
      );
    } catch (error) {
      console.error('Webhook registration error:', error);
    }
  }
}

