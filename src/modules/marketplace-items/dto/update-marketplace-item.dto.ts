import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketplaceItemDto } from './create-marketplace-item.dto';

export class UpdateMarketplaceItemDto extends PartialType(CreateMarketplaceItemDto) {}
