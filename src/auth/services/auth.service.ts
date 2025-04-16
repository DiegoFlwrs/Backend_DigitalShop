import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
      
    if(user?.email !== email || user?.password !== password){
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword; 
  }

  async login(user: any) {
    
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(r => r.role.name), 
    };
    
    return {
      access_token: this.jwtService.sign(payload), 
      user, 
    };
  }
}
