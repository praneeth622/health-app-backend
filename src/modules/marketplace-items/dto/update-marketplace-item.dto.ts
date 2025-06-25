import { ApiPropertyOptional } from '@nestjs/swagger';
import { MarketplaceCategory, ItemCondition, ListingStatus } from '../entities/marketplace-item.entity';

export class UpdateMarketplaceItemDto {
  @ApiPropertyOptional({
    description: 'Updated item title',
    example: 'Premium Whey Protein Powder - Vanilla (SALE!)',
    maxLength: 255,
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description',
    example: 'High-quality whey protein powder with 25g protein per serving. NOW ON SALE!',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated category',
    enum: MarketplaceCategory,
    example: MarketplaceCategory.SUPPLEMENTS,
  })
  category?: MarketplaceCategory;

  @ApiPropertyOptional({
    description: 'Updated price',
    example: 39.99,
    minimum: 0,
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'Updated available slots',
    example: 5,
    minimum: 0,
  })
  available_slots?: number;

  @ApiPropertyOptional({
    description: 'Updated condition',
    enum: ItemCondition,
    example: ItemCondition.LIKE_NEW,
  })
  condition?: ItemCondition;

  @ApiPropertyOptional({
    description: 'Updated listing status',
    enum: ListingStatus,
    example: ListingStatus.ACTIVE,
  })
  status?: ListingStatus;

  @ApiPropertyOptional({
    description: 'Updated images',
    example: ['https://example.com/new-protein1.jpg'],
    type: [String],
  })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Updated tags',
    example: ['protein', 'whey', 'vanilla', 'sale'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Updated location',
    example: 'Oakland, CA',
    maxLength: 200,
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Updated digital status',
    example: true,
  })
  is_digital?: boolean;

  @ApiPropertyOptional({
    description: 'Updated specifications',
    example: {
      weight: '2 lbs',
      servings: '30',
      flavor: 'Vanilla',
      expiry_date: '2026-12-31',
      on_sale: true
    },
  })
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Updated brand',
    example: 'Optimum Nutrition',
    maxLength: 100,
  })
  brand?: string;

  @ApiPropertyOptional({
    description: 'Updated shipping info',
    example: 'Free shipping for orders over $50! Ships within 1-2 business days.',
  })
  shipping_info?: string;

  @ApiPropertyOptional({
    description: 'Updated shipping cost',
    example: 0, // Free shipping
    minimum: 0,
  })
  shipping_cost?: number;

  @ApiPropertyOptional({
    description: 'Featured status',
    example: true,
  })
  is_featured?: boolean;
}

export class GetMarketplaceItemDto {
  @ApiPropertyOptional({
    description: 'Item ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  id: string;
}

export class GetUserMarketplaceItemsDto {
  @ApiPropertyOptional({
    description: 'User ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  userId: string;
}
