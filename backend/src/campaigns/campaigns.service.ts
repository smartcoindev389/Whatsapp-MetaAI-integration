import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('campaign-sender') private campaignQueue: Queue,
  ) {}

  async create(wabaAccountId: string, templateId: string | null, contactNumbers: string[]) {
    const campaign = await this.prisma.campaign.create({
      data: {
        wabaAccountId,
        templateId,
        contactCount: contactNumbers.length,
        status: 'created',
      },
    });

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

    // Enqueue jobs for processing
    for (const job of jobs) {
      await this.campaignQueue.add('send-campaign-message', {
        campaignId: campaign.id,
        jobId: job.id,
        wabaAccountId,
        templateId,
        toNumber: job.toNumber,
      });
    }

    // Update campaign status
    await this.prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: 'sending' },
    });

    return campaign;
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

