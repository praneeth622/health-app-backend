import { Module } from '@nestjs/common';
import { MarketplaceItemsService } from './marketplace-items.service';
import { MarketplaceItemsController } from './marketplace-items.controller';

@Module({
  controllers: [MarketplaceItemsController],
  providers: [MarketplaceItemsService],
})
export class MarketplaceItemsModule {}
