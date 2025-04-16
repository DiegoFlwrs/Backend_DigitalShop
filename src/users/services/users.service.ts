import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { roles, ...userData } = createUserDto;
    return this.prisma.user.create({
      data: {
        ...userData,
        roles: { create: roles.map(roleId => ({ roleId })) },
      },
      include: { roles: { include: { role: true } } },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { roles: { include: { role: true } } },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { active: false },
    });
  }
}