import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionUtil } from '../common/utils/encryption.util';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessagesService {
  private readonly metaApiVersion: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.metaApiVersion = configService.get<string>('META_API_VERSION') || 'v21.0';
  }

  async sendMessage(wabaAccountId: string, to: string, body: string) {
    const wabaAccount = await this.prisma.wabaAccount.findUnique({
      where: { id: wabaAccountId },
    });

    if (!wabaAccount) {
      throw new NotFoundException('WABA account not found');
    }

    const accessToken = EncryptionUtil.decrypt(wabaAccount.encryptedToken);

    try {
      // Send via Meta Graph API
      const response = await axios.post(
        `https://graph.facebook.com/v${this.metaApiVersion}/${wabaAccount.phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const messageId = response.data.messages[0].id;

      // Find or create conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          wabaAccountId,
          contactNumber: to,
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            wabaAccountId,
            contactNumber: to,
          },
        });
      }

      // Store message
      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          wabaAccountId,
          messageId,
          from: wabaAccount.phoneId,
          to,
          direction: 'outbound',
          status: 'sent',
          body,
          rawPayload: response.data,
        },
      });

      return message;
    } catch (error) {
      console.error('Send message error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to send message: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  async sendTemplateMessage(wabaAccountId: string, to: string, templateName: string, language: string, parameters?: any[]) {
    const wabaAccount = await this.prisma.wabaAccount.findUnique({
      where: { id: wabaAccountId },
    });

    if (!wabaAccount) {
      throw new NotFoundException('WABA account not found');
    }

    const accessToken = EncryptionUtil.decrypt(wabaAccount.encryptedToken);

    try {
      const payload: any = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
        },
      };

      if (parameters && parameters.length > 0) {
        payload.template.components = [
          {
            type: 'body',
            parameters: parameters.map((p) => ({ type: 'text', text: p })),
          },
        ];
      }

      const response = await axios.post(
        `https://graph.facebook.com/v${this.metaApiVersion}/${wabaAccount.phoneId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const messageId = response.data.messages[0].id;

      // Find or create conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          wabaAccountId,
          contactNumber: to,
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            wabaAccountId,
            contactNumber: to,
          },
        });
      }

      // Store message
      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          wabaAccountId,
          messageId,
          from: wabaAccount.phoneId,
          to,
          direction: 'outbound',
          status: 'sent',
          body: `Template: ${templateName}`,
          rawPayload: response.data,
        },
      });

      return message;
    } catch (error) {
      console.error('Send template error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to send template: ' + (error.response?.data?.error?.message || error.message));
    }
  }
}

