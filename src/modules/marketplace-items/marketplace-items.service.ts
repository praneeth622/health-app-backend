import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, IsNull } from 'typeorm';
import { 
  MarketplaceItem, 
  MarketplaceReview, 
  MarketplaceFavorite,
  MarketplaceOrder,
  MarketplaceCategory,
  ListingStatus
} from './entities/marketplace-item.entity';
import { 
  CreateMarketplaceItemDto, 
  CreateMarketplaceReviewDto,
  CreateMarketplaceOrderDto
} from './dto/create-marketplace-item.dto';
import { UpdateMarketplaceItemDto } from './dto/update-marketplace-item.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class MarketplaceItemsService {
  constructor(
    @InjectRepository(MarketplaceItem)
    private readonly marketplaceItemRepository: Repository<MarketplaceItem>,
    @InjectRepository(MarketplaceReview)
    private readonly reviewRepository: Repository<MarketplaceReview>,
    @InjectRepository(MarketplaceFavorite)
    private readonly favoriteRepository: Repository<MarketplaceFavorite>,
    @InjectRepository(MarketplaceOrder)
    private readonly orderRepository: Repository<MarketplaceOrder>,
    private readonly usersService: UsersService,
  ) {}

  async create(createMarketplaceItemDto: CreateMarketplaceItemDto): Promise<MarketplaceItem> {
    // Validate seller exists
    await this.usersService.findOne(createMarketplaceItemDto.user_id);

    // Validate price
    if (createMarketplaceItemDto.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    // Validate available_slots
    if (createMarketplaceItemDto.available_slots && createMarketplaceItemDto.available_slots < 0) {
      throw new BadRequestException('Available slots cannot be negative');
    }

    const marketplaceItem = this.marketplaceItemRepository.create(createMarketplaceItemDto);
    return await this.marketplaceItemRepository.save(marketplaceItem);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    category?: MarketplaceCategory,
    minPrice?: number,
    maxPrice?: number,
    location?: string,
    search?: string,
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    isDigital?: boolean,
    isFeatured?: boolean,
  ): Promise<{
    items: MarketplaceItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.marketplaceItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.seller', 'seller')
      .where('item.status = :status', { status: ListingStatus.ACTIVE })
      .andWhere('item.available_slots > 0');

    // Apply filters
    if (category) {
      queryBuilder.andWhere('item.category = :category', { category });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('item.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('item.price <= :maxPrice', { maxPrice });
    }

    if (location) {
      queryBuilder.andWhere('item.location ILIKE :location', { location: `%${location}%` });
    }

    if (search) {
      queryBuilder.andWhere(
        '(item.title ILIKE :search OR item.description ILIKE :search OR item.brand ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isDigital !== undefined) {
      queryBuilder.andWhere('item.is_digital = :isDigital', { isDigital });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('item.is_featured = :isFeatured', { isFeatured });
    }

    // Apply sorting
    const validSortFields = ['created_at', 'price', 'views_count', 'favorites_count', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    queryBuilder.orderBy(`item.${sortField}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const items = await queryBuilder
      .skip(skip)
      .take(limit)
      .select([
        'item.id',
        'item.title',
        'item.description',
        'item.category',
        'item.price',
        'item.available_slots',
        'item.condition',
        'item.images',
        'item.location',
        'item.is_digital',
        'item.is_featured',
        'item.brand',
        'item.shipping_cost',
        'item.views_count',
        'item.favorites_count',
        'item.rating',
        'item.reviews_count',
        'item.created_at',
        'seller.id',
        'seller.name',
        'seller.profile_image',
      ])
      .getMany();

    return {
      items,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, incrementViews: boolean = true): Promise<MarketplaceItem> {
    const item = await this.marketplaceItemRepository.findOne({
      where: { id, status: ListingStatus.ACTIVE },
      relations: ['seller', 'reviews', 'reviews.reviewer'],
      select: {
        seller: {
          id: true,
          name: true,
          profile_image: true,
          created_at: true,
        },
        reviews: {
          id: true,
          rating: true,
          comment: true,
          images: true,
          is_verified_purchase: true,
          created_at: true,
          reviewer: {
            id: true,
            name: true,
            profile_image: true,
          }
        }
      }
    });

    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }

    // Increment view count
    if (incrementViews) {
      await this.marketplaceItemRepository.update(id, {
        views_count: item.views_count + 1,
      });
      item.views_count += 1;
    }

    return item;
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: ListingStatus,
  ): Promise<{
    items: MarketplaceItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    // Validate user exists
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;
    const whereCondition: any = { user_id: userId };

    if (status) {
      whereCondition.status = status;
    }

    const [items, total] = await this.marketplaceItemRepository.findAndCount({
      where: whereCondition,
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      items,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateMarketplaceItemDto: UpdateMarketplaceItemDto): Promise<MarketplaceItem> {
    const item = await this.marketplaceItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }

    // Validate price if being updated
    if (updateMarketplaceItemDto.price !== undefined && updateMarketplaceItemDto.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    // Validate available_slots if being updated
    if (updateMarketplaceItemDto.available_slots !== undefined && updateMarketplaceItemDto.available_slots < 0) {
      throw new BadRequestException('Available slots cannot be negative');
    }

    Object.assign(item, updateMarketplaceItemDto);
    return await this.marketplaceItemRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.marketplaceItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }

    await this.marketplaceItemRepository.remove(item);
  }

  // Review Methods
  async createReview(createReviewDto: CreateMarketplaceReviewDto): Promise<MarketplaceReview> {
    // Validate rating range
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Validate item exists
    const item = await this.findOne(createReviewDto.item_id, false);
    
    // Validate user exists
    await this.usersService.findOne(createReviewDto.user_id);

    // Check if user already reviewed this item
    const existingReview = await this.reviewRepository.findOne({
      where: {
        item_id: createReviewDto.item_id,
        user_id: createReviewDto.user_id,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this item');
    }

    const review = this.reviewRepository.create(createReviewDto);
    const savedReview = await this.reviewRepository.save(review);

    // Update item rating and review count
    await this.updateItemRating(createReviewDto.item_id);

    return savedReview;
  }

  async getItemReviews(
    itemId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    reviews: MarketplaceReview[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    average_rating: number;
  }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { item_id: itemId },
      relations: ['reviewer'],
      select: {
        reviewer: {
          id: true,
          name: true,
          profile_image: true,
        }
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    // Calculate average rating
    const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average_rating = total > 0 ? Math.round((ratingSum / total) * 100) / 100 : 0;

    return {
      reviews,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      average_rating,
    };
  }

  // Favorites Methods
  async addToFavorites(itemId: string, userId: string): Promise<MarketplaceFavorite> {
    // Validate item exists
    await this.findOne(itemId, false);
    
    // Validate user exists
    await this.usersService.findOne(userId);

    // Check if already favorited
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { item_id: itemId, user_id: userId },
    });

    if (existingFavorite) {
      throw new BadRequestException('Item already in favorites');
    }

    const favorite = this.favoriteRepository.create({
      item_id: itemId,
      user_id: userId,
    });

    const savedFavorite = await this.favoriteRepository.save(favorite);

    // Update favorites count
    await this.marketplaceItemRepository.increment(
      { id: itemId },
      'favorites_count',
      1
    );

    return savedFavorite;
  }

  async removeFromFavorites(itemId: string, userId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { item_id: itemId, user_id: userId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);

    // Update favorites count
    await this.marketplaceItemRepository.decrement(
      { id: itemId },
      'favorites_count',
      1
    );
  }

  async getUserFavorites(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    favorites: MarketplaceFavorite[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    await this.usersService.findOne(userId);

    const skip = (page - 1) * limit;

    const [favorites, total] = await this.favoriteRepository.findAndCount({
      where: { user_id: userId },
      relations: ['item', 'item.seller'],
      select: {
        item: {
          id: true,
          title: true,
          price: true,
          images: true,
          condition: true,
          is_digital: true,
          seller: {
            id: true,
            name: true,
            profile_image: true,
          }
        }
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      favorites,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  // Order Methods
  async createOrder(createOrderDto: CreateMarketplaceOrderDto): Promise<MarketplaceOrder> {
    const item = await this.findOne(createOrderDto.item_id, false);

    // Check availability
    if (item.available_slots < createOrderDto.quantity) {
      throw new BadRequestException('Not enough items available');
    }

    // Validate buyer exists
    await this.usersService.findOne(createOrderDto.buyer_id);

    // Calculate total price
    const unit_price = item.price;
    const total_price = unit_price * createOrderDto.quantity;
    const shipping_cost = item.shipping_cost || 0;

    const order = this.orderRepository.create({
      ...createOrderDto,
      unit_price,
      total_price,
      shipping_cost,
      seller_id: item.user_id,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Update available slots
    await this.marketplaceItemRepository.update(item.id, {
      available_slots: item.available_slots - createOrderDto.quantity,
      sold_count: item.sold_count + createOrderDto.quantity,
    });

    return savedOrder;
  }

  // Utility Methods
  private async updateItemRating(itemId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg_rating')
      .addSelect('COUNT(review.id)', 'review_count')
      .where('review.item_id = :itemId', { itemId })
      .getRawOne();

    const avgRating = parseFloat(result.avg_rating) || 0;
    const reviewCount = parseInt(result.review_count) || 0;

    await this.marketplaceItemRepository.update(itemId, {
      rating: Math.round(avgRating * 100) / 100,
      reviews_count: reviewCount,
    });
  }

  async getMarketplaceStats(): Promise<{
    total_items: number;
    active_items: number;
    total_orders: number;
    total_revenue: number;
    categories_stats: Record<string, number>;
  }> {
    const total_items = await this.marketplaceItemRepository.count();
    const active_items = await this.marketplaceItemRepository.count({
      where: { status: ListingStatus.ACTIVE, available_slots: Between(1, 999999) },
    });

    const total_orders = await this.orderRepository.count();
    
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_price)', 'total_revenue')
      .where('order.status != :status', { status: 'cancelled' })
      .getRawOne();

    const total_revenue = parseFloat(revenueResult.total_revenue) || 0;

    // Get category stats
    const categoryStats = await this.marketplaceItemRepository
      .createQueryBuilder('item')
      .select('item.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('item.status = :status', { status: ListingStatus.ACTIVE })
      .groupBy('item.category')
      .getRawMany();

    const categories_stats = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total_items,
      active_items,
      total_orders,
      total_revenue,
      categories_stats,
    };
  }
}
