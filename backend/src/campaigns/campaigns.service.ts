import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('campaign-sender') private campaignQueue: Queue,
  ) {}

  async create(wabaAccountId: string, templateId: string | null, contactNumbers: string[]) {
    // Validate WABA account exists
    const wabaAccount = await this.prisma.wabaAccount.findUnique({
      where: { id: wabaAccountId },
    });

    if (!wabaAccount) {
      this.logger.warn(`WABA account not found: ${wabaAccountId}`);
      throw new NotFoundException('WABA account not found');
    }

    // Validate template if provided
    if (templateId) {
      const template = await this.prisma.template.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        this.logger.warn(`Template not found: ${templateId}`);
        throw new NotFoundException('Template not found');
      }

      if (template.status !== 'approved') {
        this.logger.warn(`Template ${templateId} is not approved (status: ${template.status})`);
        throw new BadRequestException(`Template must be approved. Current status: ${template.status}`);
      }

      if (template.wabaAccountId !== wabaAccountId) {
        this.logger.warn(`Template ${templateId} does not belong to WABA ${wabaAccountId}`);
        throw new BadRequestException('Template does not belong to this WABA account');
      }
    }

    // Validate contact numbers
    if (!contactNumbers || contactNumbers.length === 0) {
      throw new BadRequestException('Contact numbers list cannot be empty');
    }

    if (contactNumbers.length > 10000) {
      this.logger.warn(`Campaign with ${contactNumbers.length} contacts exceeds recommended limit`);
    }

    try {
      const campaign = await this.prisma.campaign.create({
        data: {
          wabaAccountId,
          templateId,
          contactCount: contactNumbers.length,
          status: 'created',
        },
      });

      this.logger.log(`Created campaign ${campaign.id} with ${contactNumbers.length} contacts`);

      // Create campaign jobs
      const jobs = await Promise.all(
        contactNumbers.map((toNumber) =>
          this.prisma.campaignJob.create({
            data: {
              campaignId: campaign.id,
              toNumber,
              status: 'pending',
            },
          }),
        ),
      );

      this.logger.log(`Created ${jobs.length} campaign jobs for campaign ${campaign.id}`);

      // Enqueue jobs for processing
      let enqueuedCount = 0;
      for (const job of jobs) {
        try {
          await this.campaignQueue.add('send-campaign-message', {
            campaignId: campaign.id,
            jobId: job.id,
            wabaAccountId,
            templateId,
            toNumber: job.toNumber,
          });
          enqueuedCount++;
        } catch (error) {
          this.logger.error(`Failed to enqueue job ${job.id}:`, error);
          // Continue with other jobs even if one fails
        }
      }

      this.logger.log(`Enqueued ${enqueuedCount}/${jobs.length} jobs for campaign ${campaign.id}`);

      // Update campaign status
      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'sending' },
      });

      return campaign;
    } catch (error) {
      this.logger.error(`Failed to create campaign for WABA ${wabaAccountId}:`, error);
      throw error;
    }
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        jobs: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const sentCount = campaign.jobs.filter((j) => j.status === 'sent').length;
    const failedCount = campaign.jobs.filter((j) => j.status === 'failed').length;

    return {
      ...campaign,
      sentCount,
      failedCount,
      deliveredCount: 0, // TODO: Calculate from message statuses
      readCount: 0, // TODO: Calculate from message statuses
    };
  }

  async findAll(wabaAccountId: string) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { wabaAccountId },
      include: {
        jobs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => {
      const sentCount = campaign.jobs.filter((j) => j.status === 'sent').length;
      const failedCount = campaign.jobs.filter((j) => j.status === 'failed').length;
      return {
        ...campaign,
        sentCount,
        failedCount,
        deliveredCount: 0,
        readCount: 0,
      };
    });
  }
}

