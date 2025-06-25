import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceItemsService } from './marketplace-items.service';
import { MarketplaceItemsController } from './marketplace-items.controller';
import { 
  MarketplaceItem, 
  MarketplaceReview, 
  MarketplaceFavorite, 
  MarketplaceOrder 
} from './entities/marketplace-item.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketplaceItem, 
      MarketplaceReview, 
      MarketplaceFavorite, 
      MarketplaceOrder
    ]),
    UsersModule,
  ],
  controllers: [MarketplaceItemsController],
  providers: [MarketplaceItemsService],
  exports: [MarketplaceItemsService],
})
export class MarketplaceItemsModule {}
