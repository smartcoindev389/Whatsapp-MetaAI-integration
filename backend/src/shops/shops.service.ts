import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, name: string) {
    return this.prisma.shop.create({
      data: {
        name,
        ownerId,
      },
    });
  }

  async findOne(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        waba: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async findByOwner(ownerId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId },
      include: {
        waba: true,
      },
    });
  }
}

