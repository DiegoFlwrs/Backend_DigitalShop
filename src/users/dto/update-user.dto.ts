import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto{
  name: string;
  email: string;
  password: string;
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
