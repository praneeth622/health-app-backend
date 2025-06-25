import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MarketplaceCategory {
  SUPPLEMENTS = 'supplements',
  FITNESS_EQUIPMENT = 'fitness_equipment',
  NUTRITION = 'nutrition',
  WELLNESS_PRODUCTS = 'wellness_products',
  CLOTHING = 'clothing',
  BOOKS_GUIDES = 'books_guides',
  SERVICES = 'services',
  COACHING = 'coaching',
  MEAL_PLANS = 'meal_plans',
  WORKOUT_PROGRAMS = 'workout_programs'
}

export enum ItemCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  DIGITAL = 'digital' // For digital products/services
}

export enum ListingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD_OUT = 'sold_out',
  PENDING = 'pending',
  REMOVED = 'removed'
}

@Entity('marketplace_items')
@Index(['category', 'status', 'created_at'])
@Index(['user_id', 'status'])
export class MarketplaceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: MarketplaceCategory })
  category: MarketplaceCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 1 })
  available_slots: number;

  @Column({ type: 'int', default: 0 })
  sold_count: number; // Track how many sold

  @Column({ type: 'enum', enum: ItemCondition, default: ItemCondition.NEW })
  condition: ItemCondition;

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.ACTIVE })
  status: ListingStatus;

  @Column({ type: 'json', nullable: true })
  images: string[]; // Array of image URLs

  @Column({ type: 'json', nullable: true })
  tags: string[]; // Searchable tags

  @Column({ type: 'varchar', length: 200, nullable: true })
  location: string; // For physical items

  @Column({ type: 'boolean', default: false })
  is_digital: boolean; // Digital products/services

  @Column({ type: 'boolean', default: false })
  is_featured: boolean; // Featured listings

  @Column({ type: 'json', nullable: true })
  specifications: Record<string, any>; // Product specs (size, weight, etc.)

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'text', nullable: true })
  shipping_info: string; // Shipping details

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  shipping_cost: number;

  @Column({ type: 'int', default: 0 })
  views_count: number; // Track views

  @Column({ type: 'int', default: 0 })
  favorites_count: number; // Track favorites

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number; // Average rating

  @Column({ type: 'int', default: 0 })
  reviews_count: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  seller: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @OneToMany(() => MarketplaceReview, review => review.item)
  reviews: MarketplaceReview[];

  @OneToMany(() => MarketplaceFavorite, favorite => favorite.item)
  favorites: MarketplaceFavorite[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('marketplace_reviews')
@Index(['item_id', 'user_id'], { unique: true }) // One review per user per item
export class MarketplaceReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'json', nullable: true })
  images: string[]; // Review images

  @Column({ type: 'boolean', default: true })
  is_verified_purchase: boolean;

  @ManyToOne(() => MarketplaceItem, item => item.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: MarketplaceItem;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  reviewer: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('marketplace_favorites')
@Index(['item_id', 'user_id'], { unique: true })
export class MarketplaceFavorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MarketplaceItem, item => item.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: MarketplaceItem;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('marketplace_orders')
@Index(['buyer_id', 'status', 'created_at'])
@Index(['seller_id', 'status', 'created_at'])
export class MarketplaceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  shipping_cost: number;

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'], default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string; // Order notes

  @Column({ type: 'json', nullable: true })
  shipping_address: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tracking_number: string;

  @ManyToOne(() => MarketplaceItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_id' })
  item: MarketplaceItem;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ type: 'uuid' })
  buyer_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ type: 'uuid' })
  seller_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
