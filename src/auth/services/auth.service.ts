import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CodeData } from '../data/data';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
      userId: user.id, 
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

  async validateOrCreateSocialUser(profile: {
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
    providerId: string;
    picture?: string;
  }) {
    // Buscar usuario existente por email o providerId
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: profile.email },
          { providerId: profile.providerId, provider: profile.provider },
        ],
      },
    });

    // Si no existe, crear nuevo usuario
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
          provider: profile.provider,
          providerId: profile.providerId,
          active: true,
          // Asignar rol por defecto (ajusta según tu lógica de roles)
          roles: {
            create: {
              role: {
                connect: { id: 1 }, // Asume que tienes un rol 'user'
              },
            },
          },
          // Crear carrito vacío para el nuevo usuario
          cart: {
            create: {},
          },
        },
      });
    }

    return user;
  }

  async generateJWT(user: any) {
  const payload = { 
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles?.map((role: any) => role.role.name) || [] 
  };
  return {
    token: this.jwtService.sign(payload),
    user,
  };
}

  async verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error("Token inválido");
  return payload;
}

}
