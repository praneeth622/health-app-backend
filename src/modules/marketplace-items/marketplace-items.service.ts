import { Injectable } from '@nestjs/common';
import { CreateMarketplaceItemDto } from './dto/create-marketplace-item.dto';
import { UpdateMarketplaceItemDto } from './dto/update-marketplace-item.dto';

@Injectable()
export class MarketplaceItemsService {
  create(createMarketplaceItemDto: CreateMarketplaceItemDto) {
    return 'This action adds a new marketplaceItem';
  }

  findAll() {
    return `This action returns all marketplaceItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marketplaceItem`;
  }

  update(id: number, updateMarketplaceItemDto: UpdateMarketplaceItemDto) {
    return `This action updates a #${id} marketplaceItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} marketplaceItem`;
  }
}
