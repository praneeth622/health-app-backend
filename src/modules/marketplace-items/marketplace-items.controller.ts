import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { MarketplaceItemsService } from './marketplace-items.service';
// Import class-based DTOs for Swagger documentation
import {
  CreateMarketplaceItemDto as CreateMarketplaceItemSwaggerDto,
  CreateMarketplaceReviewDto as CreateMarketplaceReviewSwaggerDto,
  CreateMarketplaceOrderDto as CreateMarketplaceOrderSwaggerDto,
} from './dto/create-marketplace-item.dto';
import {
  UpdateMarketplaceItemDto as UpdateMarketplaceItemSwaggerDto,
  GetMarketplaceItemDto as GetMarketplaceItemSwaggerDto,
  GetUserMarketplaceItemsDto as GetUserMarketplaceItemsSwaggerDto,
} from './dto/update-marketplace-item.dto';
// Import Zod types for validation
import {
  CreateMarketplaceItemDto,
  UpdateMarketplaceItemDto,
  CreateMarketplaceReviewDto,
  CreateMarketplaceOrderDto,
  GetMarketplaceItemDto,
  GetUserMarketplaceItemsDto,
} from './dto/marketplace-item.zod';
import { MarketplaceCategory, ListingStatus } from './entities/marketplace-item.entity';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  createMarketplaceItemSchema,
  updateMarketplaceItemSchema,
  createMarketplaceReviewSchema,
  createMarketplaceOrderSchema,
  getMarketplaceItemSchema,
  getUserMarketplaceItemsSchema,
} from './dto/marketplace-item.zod';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceItemsController {
  constructor(private readonly marketplaceItemsService: MarketplaceItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new marketplace item' })
  @ApiBody({ type: CreateMarketplaceItemSwaggerDto })
  @ApiResponse({
    status: 201,
    description: 'Marketplace item created successfully',
    schema: {
      example: {
        id: 'item-uuid-here',
        title: 'Premium Whey Protein Powder - Vanilla',
        description: 'High-quality whey protein powder with 25g protein per serving...',
        category: 'supplements',
        price: 45.99,
        available_slots: 3,
        condition: 'new',
        status: 'active',
        images: ['https://example.com/protein1.jpg'],
        tags: ['protein', 'whey', 'vanilla', 'fitness'],
        location: 'San Francisco, CA',
        is_digital: false,
        brand: 'Optimum Nutrition',
        shipping_cost: 5.99,
        user_id: 'seller-uuid',
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(createMarketplaceItemSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMarketplaceItemDto: CreateMarketplaceItemDto) {
    return await this.marketplaceItemsService.create(createMarketplaceItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all marketplace items with filters' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiQuery({ name: 'category', description: 'Filter by category', required: false, enum: MarketplaceCategory })
  @ApiQuery({ name: 'minPrice', description: 'Minimum price filter', required: false, type: 'number' })
  @ApiQuery({ name: 'maxPrice', description: 'Maximum price filter', required: false, type: 'number' })
  @ApiQuery({ name: 'location', description: 'Filter by location', required: false })
  @ApiQuery({ name: 'search', description: 'Search in title, description, brand', required: false })
  @ApiQuery({ name: 'sortBy', description: 'Sort field', required: false, enum: ['created_at', 'price', 'views_count', 'favorites_count', 'rating'] })
  @ApiQuery({ name: 'sortOrder', description: 'Sort order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'isDigital', description: 'Filter digital products', required: false, type: 'boolean' })
  @ApiQuery({ name: 'isFeatured', description: 'Filter featured items', required: false, type: 'boolean' })
  @ApiResponse({
    status: 200,
    description: 'Marketplace items retrieved successfully',
    schema: {
      example: {
        items: [
          {
            id: 'item-uuid-1',
            title: 'Premium Whey Protein Powder',
            category: 'supplements',
            price: 45.99,
            condition: 'new',
            images: ['https://example.com/protein1.jpg'],
            location: 'San Francisco, CA',
            is_featured: false,
            seller: {
              id: 'seller-uuid',
              name: 'John Doe',
              profile_image: 'https://example.com/profile.jpg'
            },
            views_count: 125,
            favorites_count: 8,
            rating: 4.5,
            created_at: '2025-06-25T12:00:00.000Z'
          }
        ],
        total: 50,
        page: 1,
        limit: 20,
        total_pages: 3
      }
    }
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category') category?: MarketplaceCategory,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('isDigital') isDigital?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;
    const isDigitalBool = isDigital ? isDigital === 'true' : undefined;
    const isFeaturedBool = isFeatured ? isFeatured === 'true' : undefined;

    return await this.marketplaceItemsService.findAll(
      pageNum,
      limitNum,
      category,
      minPriceNum,
      maxPriceNum,
      location,
      search,
      sortBy,
      sortOrder,
      isDigitalBool,
      isFeaturedBool,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get marketplace statistics' })
  @ApiResponse({
    status: 200,
    description: 'Marketplace statistics',
    schema: {
      example: {
        total_items: 150,
        active_items: 125,
        total_orders: 89,
        total_revenue: 4567.89,
        categories_stats: {
          supplements: 45,
          fitness_equipment: 32,
          nutrition: 28,
          wellness_products: 20
        }
      }
    }
  })
  async getMarketplaceStats() {
    return await this.marketplaceItemsService.getMarketplaceStats();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get marketplace items for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false, enum: ListingStatus })
  @ApiResponse({ status: 200, description: 'User marketplace items retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ZodValidationPipe(getUserMarketplaceItemsSchema))
  async findByUser(
    @Param() params: GetUserMarketplaceItemsDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: ListingStatus,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    return await this.marketplaceItemsService.findByUser(
      params.userId,
      pageNum,
      limitNum,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get marketplace item by ID' })
  @ApiParam({ name: 'id', description: 'Item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Marketplace item details',
    schema: {
      example: {
        id: 'item-uuid',
        title: 'Premium Whey Protein Powder - Vanilla',
        description: 'Detailed description...',
        category: 'supplements',
        price: 45.99,
        available_slots: 3,
        condition: 'new',
        status: 'active',
        images: ['https://example.com/protein1.jpg'],
        specifications: {
          weight: '2 lbs',
          servings: '30',
          flavor: 'Vanilla'
        },
        seller: {
          id: 'seller-uuid',
          name: 'John Doe',
          profile_image: 'https://example.com/profile.jpg',
          created_at: '2025-01-01T00:00:00.000Z'
        },
        reviews: [
          {
            id: 'review-uuid',
            rating: 5,
            comment: 'Excellent product!',
            reviewer: {
              id: 'reviewer-uuid',
              name: 'Jane Smith',
              profile_image: 'https://example.com/jane.jpg'
            },
            created_at: '2025-06-20T10:00:00.000Z'
          }
        ],
        views_count: 126,
        favorites_count: 8,
        rating: 4.5,
        reviews_count: 12
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @UsePipes(new ZodValidationPipe(getMarketplaceItemSchema))
  async findOne(@Param() params: GetMarketplaceItemDto) {
    return await this.marketplaceItemsService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update marketplace item' })
  @ApiParam({ name: 'id', description: 'Item ID (UUID)' })
  @ApiBody({ type: UpdateMarketplaceItemSwaggerDto })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @UsePipes(new ZodValidationPipe(getMarketplaceItemSchema))
  async update(
    @Param() params: GetMarketplaceItemDto,
    @Body(new ZodValidationPipe(updateMarketplaceItemSchema)) updateDto: UpdateMarketplaceItemDto,
  ) {
    return await this.marketplaceItemsService.update(params.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete marketplace item' })
  @ApiParam({ name: 'id', description: 'Item ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @UsePipes(new ZodValidationPipe(getMarketplaceItemSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: GetMarketplaceItemDto): Promise<void> {
    await this.marketplaceItemsService.remove(params.id);
  }

  // Reviews endpoints
  @Post('reviews')
  @ApiOperation({ summary: 'Create a review for marketplace item' })
  @ApiBody({ type: CreateMarketplaceReviewSwaggerDto })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid rating or already reviewed' })
  @ApiResponse({ status: 404, description: 'Item or user not found' })
  @UsePipes(new ZodValidationPipe(createMarketplaceReviewSchema))
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Body() createReviewDto: CreateMarketplaceReviewDto) {
    return await this.marketplaceItemsService.createReview(createReviewDto);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews for marketplace item' })
  @ApiParam({ name: 'id', description: 'Item ID (UUID)' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Reviews per page', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Item reviews retrieved successfully',
    schema: {
      example: {
        reviews: [
          {
            id: 'review-uuid',
            rating: 5,
            comment: 'Excellent product! Fast shipping.',
            images: ['https://example.com/review1.jpg'],
            reviewer: {
              id: 'user-uuid',
              name: 'Jane Smith',
              profile_image: 'https://example.com/jane.jpg'
            },
            created_at: '2025-06-20T10:00:00.000Z'
          }
        ],
        total: 12,
        page: 1,
        limit: 10,
        total_pages: 2,
        average_rating: 4.5
      }
    }
  })
  @UsePipes(new ZodValidationPipe(getMarketplaceItemSchema))
  async getItemReviews(
    @Param() params: GetMarketplaceItemDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return await this.marketplaceItemsService.getItemReviews(params.id, pageNum, limitNum);
  }

  // Favorites endpoints
  @Post(':id/favorite')
  @ApiOperation({ summary: 'Add item to favorites' })
  @ApiParam({ name: 'id', description: 'Item ID (UUID)' })
  @ApiQuery({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Item added to favorites' })
  @ApiResponse({ status: 400, description: 'Item already in favorites' })
  @ApiResponse({ status: 404, description: 'Item or user not found' })
  @HttpCode(HttpStatus.CREATED)
  async addToFavorites(
    @Param('id') itemId: string,
    @Query('userId') userId: string,
  ) {
    return await this.marketplaceItemsService.addToFavorites(itemId, userId);
  }

  @Delete(':id/favorite')
  @ApiOperation({ summary: 'Remove item from favorites' })
  @ApiParam({ name: 'id', description: 'Item ID (UUID)' })
  @ApiQuery({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Item removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromFavorites(
    @Param('id') itemId: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    await this.marketplaceItemsService.removeFromFavorites(itemId, userId);
  }

  @Get('favorites/:userId')
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'User favorites retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserFavorites(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    return await this.marketplaceItemsService.getUserFavorites(userId, pageNum, limitNum);
  }

  // Orders endpoints
  @Post('orders')
  @ApiOperation({ summary: 'Create an order for marketplace item' })
  @ApiBody({ type: CreateMarketplaceOrderSwaggerDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      example: {
        id: 'order-uuid',
        quantity: 2,
        unit_price: 45.99,
        total_price: 91.98,
        shipping_cost: 5.99,
        status: 'pending',
        item_id: 'item-uuid',
        buyer_id: 'buyer-uuid',
        seller_id: 'seller-uuid',
        created_at: '2025-06-25T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Not enough items available' })
  @ApiResponse({ status: 404, description: 'Item or user not found' })
  @UsePipes(new ZodValidationPipe(createMarketplaceOrderSchema))
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateMarketplaceOrderDto) {
    return await this.marketplaceItemsService.createOrder(createOrderDto);
  }
}
