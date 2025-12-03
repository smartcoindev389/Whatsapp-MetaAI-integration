import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString, MinLength } from 'class-validator';

class CreateShopDto {
  @IsString()
  @MinLength(1)
  name: string;
}

@Controller('shops')
@UseGuards(JwtAuthGuard)
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() createShopDto: CreateShopDto) {
    return this.shopsService.create(user.id, createShopDto.name);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.shopsService.findByOwner(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }
}

