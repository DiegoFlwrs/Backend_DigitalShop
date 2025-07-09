import { Controller, Get, Param } from '@nestjs/common';
import { PorfileService } from '../services/porfile.service';

@Controller('porfile')
export class PorfileController {
    constructor(private readonly profileService: PorfileService) {}

    @Get('data/:id')
    async getProfileId(@Param('id') id: number) {
        return this.profileService.perfil(id);
      }

}
