import { Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PorfileService {
    constructor(private prisma: PrismaService) { }

    @UseGuards(AuthGuard('jwt'))
    async perfil(id: number) {
        return this.prisma.user.findUnique(
            {
                where: {
                    id: Number(id)
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        );
    }

}
