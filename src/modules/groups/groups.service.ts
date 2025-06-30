import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { 
  Group, 
  GroupMembership, 
  MembershipRole, 
  MembershipStatus,
  GroupType,
  GroupCategory 
} from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMembership)
    private readonly membershipRepository: Repository<GroupMembership>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create(createGroupDto);
    const savedGroup = await this.groupRepository.save(group);

    // Auto-add creator as owner
    await this.addMembership(savedGroup.id, createGroupDto.owner_id, MembershipRole.OWNER);

    return this.findOne(savedGroup.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    category?: GroupCategory,
    type?: GroupType,
    search?: string,
  ): Promise<{
    groups: Group[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.owner', 'owner')
      .where('group.is_active = :isActive', { isActive: true });

    if (category) {
      queryBuilder.andWhere('group.category = :category', { category });
    }

    if (type) {
      queryBuilder.andWhere('group.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(group.name ILIKE :search OR group.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [groups, total] = await queryBuilder
      .orderBy('group.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      groups,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id, is_active: true },
      relations: ['owner', 'memberships', 'memberships.user'],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    
    Object.assign(group, updateGroupDto);
    await this.groupRepository.save(group);
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const group = await this.findOne(id);
    group.is_active = false;
    await this.groupRepository.save(group);
  }

  async joinGroup(groupId: string, joinGroupDto: JoinGroupDto): Promise<GroupMembership> {
    const group = await this.findOne(groupId);

    // Check if already a member
    const existingMembership = await this.membershipRepository.findOne({
      where: { group_id: groupId, user_id: joinGroupDto.user_id },
    });

    if (existingMembership) {
      throw new ForbiddenException('User is already a member of this group');
    }

    // Check group capacity
    if (group.max_members && group.member_count >= group.max_members) {
      throw new ForbiddenException('Group is at maximum capacity');
    }

    const status = group.type === GroupType.PRIVATE ? MembershipStatus.PENDING : MembershipStatus.ACTIVE;
    
    // 🔧 Fix: Create membership object with proper typing
    const membershipData: Partial<GroupMembership> = {
      group_id: groupId,
      user_id: joinGroupDto.user_id,
      role: MembershipRole.MEMBER,
      status,
      join_message: joinGroupDto.join_message,
      joined_at: status === MembershipStatus.ACTIVE ? new Date() : null,
    };

    const membership = this.membershipRepository.create(membershipData);
    const savedMembership = await this.membershipRepository.save(membership);

    // Update member count if auto-approved
    if (status === MembershipStatus.ACTIVE) {
      await this.groupRepository.increment({ id: groupId }, 'member_count', 1);
    }

    return savedMembership;
  }

  private async addMembership(groupId: string, userId: string, role: MembershipRole): Promise<GroupMembership> {
    // 🔧 Fix: Create membership object with proper typing
    const membershipData: Partial<GroupMembership> = {
      group_id: groupId,
      user_id: userId,
      role,
      status: MembershipStatus.ACTIVE,
      joined_at: new Date(),
    };

    const membership = this.membershipRepository.create(membershipData);
    const savedMembership = await this.membershipRepository.save(membership);
    
    await this.groupRepository.increment({ id: groupId }, 'member_count', 1);

    return savedMembership;
  }

  async getGroupMembers(groupId: string): Promise<GroupMembership[]> {
    await this.findOne(groupId); // Ensure group exists

    return this.membershipRepository.find({
      where: { group_id: groupId, status: MembershipStatus.ACTIVE },
      relations: ['user'],
      order: { joined_at: 'DESC' },
    });
  }

  // 🔧 Additional useful methods
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const membership = await this.membershipRepository.findOne({
      where: { group_id: groupId, user_id: userId, status: MembershipStatus.ACTIVE },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new ForbiddenException('Group owner cannot leave the group');
    }

    membership.status = MembershipStatus.LEFT;
    await this.membershipRepository.save(membership);

    // Decrement member count
    await this.groupRepository.decrement({ id: groupId }, 'member_count', 1);
  }

  async updateMembershipRole(groupId: string, userId: string, newRole: MembershipRole): Promise<GroupMembership> {
    const membership = await this.membershipRepository.findOne({
      where: { group_id: groupId, user_id: userId, status: MembershipStatus.ACTIVE },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    membership.role = newRole;
    return this.membershipRepository.save(membership);
  }
}
