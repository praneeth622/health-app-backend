import { z } from 'zod';
import { MarketplaceCategory, ItemCondition, ListingStatus } from '../entities/marketplace-item.entity';

export const createMarketplaceItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(10),
  category: z.nativeEnum(MarketplaceCategory),
  price: z.number().min(0),
  available_slots: z.number().int().min(0).optional(),
  condition: z.nativeEnum(ItemCondition).optional(),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().max(200).optional(),
  is_digital: z.boolean().optional(),
  specifications: z.record(z.any()).optional(),
  brand: z.string().max(100).optional(),
  shipping_info: z.string().optional(),
  shipping_cost: z.number().min(0).optional(),
  user_id: z.string().uuid(),
});

export const updateMarketplaceItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(10).optional(),
  category: z.nativeEnum(MarketplaceCategory).optional(),
  price: z.number().min(0).optional(),
  available_slots: z.number().int().min(0).optional(),
  condition: z.nativeEnum(ItemCondition).optional(),
  status: z.nativeEnum(ListingStatus).optional(),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().max(200).optional(),
  is_digital: z.boolean().optional(),
  specifications: z.record(z.any()).optional(),
  brand: z.string().max(100).optional(),
  shipping_info: z.string().optional(),
  shipping_cost: z.number().min(0).optional(),
  is_featured: z.boolean().optional(),
});

export const createMarketplaceReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  item_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const createMarketplaceOrderSchema = z.object({
  quantity: z.number().int().min(1),
  notes: z.string().optional(),
  shipping_address: z.record(z.any()).optional(),
  item_id: z.string().uuid(),
  buyer_id: z.string().uuid(),
});

export const getMarketplaceItemSchema = z.object({
  id: z.string().uuid(),
});

export const getUserMarketplaceItemsSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateMarketplaceItemDto = z.infer<typeof createMarketplaceItemSchema>;
export type UpdateMarketplaceItemDto = z.infer<typeof updateMarketplaceItemSchema>;
export type CreateMarketplaceReviewDto = z.infer<typeof createMarketplaceReviewSchema>;
export type CreateMarketplaceOrderDto = z.infer<typeof createMarketplaceOrderSchema>;
export type GetMarketplaceItemDto = z.infer<typeof getMarketplaceItemSchema>;
export type GetUserMarketplaceItemsDto = z.infer<typeof getUserMarketplaceItemsSchema>;