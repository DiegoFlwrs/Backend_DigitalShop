import { Module } from '@nestjs/common';
import { PorfileService } from './services/porfile.service';
import { PorfileController } from './controllers/porfile.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PorfileService, PrismaService],
  controllers: [PorfileController]
})
export class PorfileModule {}
