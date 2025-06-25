import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarketplaceCategory, ItemCondition } from '../entities/marketplace-item.entity';

export class CreateMarketplaceItemDto {
  @ApiProperty({
    description: 'Item title',
    example: 'Premium Whey Protein Powder - Vanilla',
    maxLength: 255,
  })
  title: string;

  @ApiProperty({
    description: 'Detailed item description',
    example: 'High-quality whey protein powder with 25g protein per serving. Perfect for post-workout recovery. Unopened container, expires 2026.',
  })
  description: string;

  @ApiProperty({
    description: 'Item category',
    enum: MarketplaceCategory,
    example: MarketplaceCategory.SUPPLEMENTS,
  })
  category: MarketplaceCategory;

  @ApiProperty({
    description: 'Item price in USD',
    example: 45.99,
    minimum: 0,
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Number of items available',
    example: 3,
    minimum: 0,
    default: 1,
  })
  available_slots?: number;

  @ApiPropertyOptional({
    description: 'Item condition',
    enum: ItemCondition,
    example: ItemCondition.NEW,
    default: ItemCondition.NEW,
  })
  condition?: ItemCondition;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: ['https://example.com/protein1.jpg', 'https://example.com/protein2.jpg'],
    type: [String],
  })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Searchable tags',
    example: ['protein', 'whey', 'vanilla', 'fitness'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Item location (for physical items)',
    example: 'San Francisco, CA',
    maxLength: 200,
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a digital product/service',
    example: false,
    default: false,
  })
  is_digital?: boolean;

  @ApiPropertyOptional({
    description: 'Product specifications',
    example: {
      weight: '2 lbs',
      servings: '30',
      flavor: 'Vanilla',
      expiry_date: '2026-12-31'
    },
  })
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Brand name',
    example: 'Optimum Nutrition',
    maxLength: 100,
  })
  brand?: string;

  @ApiPropertyOptional({
    description: 'Shipping information',
    example: 'Ships within 2-3 business days. Carefully packaged to prevent damage.',
  })
  shipping_info?: string;

  @ApiPropertyOptional({
    description: 'Shipping cost in USD',
    example: 5.99,
    minimum: 0,
  })
  shipping_cost?: number;

  @ApiProperty({
    description: 'Seller user ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  user_id: string;
}

export class CreateMarketplaceReviewDto {
  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiPropertyOptional({
    description: 'Review comment',
    example: 'Excellent protein powder! Great taste and mixability. Fast shipping too!',
  })
  comment?: string;

  @ApiPropertyOptional({
    description: 'Review images',
    example: ['https://example.com/review1.jpg'],
    type: [String],
  })
  images?: string[];

  @ApiProperty({
    description: 'Item ID being reviewed',
    example: 'item-uuid-here',
    format: 'uuid',
  })
  item_id: string;

  @ApiProperty({
    description: 'Reviewer user ID',
    example: 'user-uuid-here',
    format: 'uuid',
  })
  user_id: string;
}

export class CreateMarketplaceOrderDto {
  @ApiProperty({
    description: 'Quantity to purchase',
    example: 2,
    minimum: 1,
  })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Please ship carefully - fragile item',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Shipping address',
    example: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'USA'
    },
  })
  shipping_address?: Record<string, any>;

  @ApiProperty({
    description: 'Item ID to purchase',
    example: 'item-uuid-here',
    format: 'uuid',
  })
  item_id: string;

  @ApiProperty({
    description: 'Buyer user ID',
    example: 'user-uuid-here',
    format: 'uuid',
  })
  buyer_id: string;
}
