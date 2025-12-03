import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString, IsArray, IsOptional } from 'class-validator';

class CreateCampaignDto {
  @IsString()
  wabaAccountId: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsArray()
  contactNumbers: string[];
}

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Post()
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(
      createCampaignDto.wabaAccountId,
      createCampaignDto.templateId || null,
      createCampaignDto.contactNumbers,
    );
  }

  @Get()
  async findAll(@Query('wabaAccountId') wabaAccountId: string) {
    return this.campaignsService.findAll(wabaAccountId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }
}

