import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CodeData } from '../data/data';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService, private readonly mailerService: MailerService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    const passwordValid = await bcrypt.compare(password, user.password);
    if(user?.email !== email || !passwordValid){
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


  private codes = new Map<string, CodeData>();

  async sendResetCode(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    this.codes.set(email, { code, expiresAt });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Código para restablecer contraseña',
      text: `Tu código de recuperación es: ${code}`,
    });

    return { message: 'Código enviado al correo' };
  }

  verifyCode(email: string, code: string): boolean {
    const data = this.codes.get(email);
    if (!data) return false;
    if (data.code !== code) return false;
    if (Date.now() > data.expiresAt) return false;
    return true;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const valid = this.verifyCode(email, code);
    if (!valid) {
      return { success: false, message: 'Código inválido o expirado' };
    }
  
    const hashed = await bcrypt.hash(newPassword, 10);
  
    try {
      // ✅ Actualiza la contraseña real del usuario en la base de datos
      await this.prisma.user.update({
        where: { email },
        data: { password: hashed },
      });
  
      this.codes.delete(email);
  
      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      return {
        success: false,
        message: 'No se pudo actualizar la contraseña. Verifica que el correo exista.',
      };
    }
  }

}
