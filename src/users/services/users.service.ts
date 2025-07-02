import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { roles, password, ...userData } = createUserDto;

    if (!roles || roles.length !== 1 || roles[0] !== 1) {
      throw new ForbiddenException('Solo se permite asignar el rol con ID 1.');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: {
          create: [{ roleId: 1 }],
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async createSR(createUserDto: CreateUserDto) {
    const { roles, password, ...userData } = createUserDto;

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: {
          create: roles.map((roleId) => ({ roleId })),
        },
      },
      include: {
        roles: { include: { role: true } },
      },
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
