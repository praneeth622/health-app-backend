import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarketplaceItemsService } from './marketplace-items.service';
import { CreateMarketplaceItemDto } from './dto/create-marketplace-item.dto';
import { UpdateMarketplaceItemDto } from './dto/update-marketplace-item.dto';

@Controller('marketplace-items')
export class MarketplaceItemsController {
  constructor(private readonly marketplaceItemsService: MarketplaceItemsService) {}

  @Post()
  create(@Body() createMarketplaceItemDto: CreateMarketplaceItemDto) {
    return this.marketplaceItemsService.create(createMarketplaceItemDto);
  }

  @Get()
  findAll() {
    return this.marketplaceItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketplaceItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarketplaceItemDto: UpdateMarketplaceItemDto) {
    return this.marketplaceItemsService.update(+id, updateMarketplaceItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketplaceItemsService.remove(+id);
  }
}
