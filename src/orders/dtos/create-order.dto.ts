import { IsOptional, IsString } from "class-validator";

export class CreateOrderDto{
    @IsOptional()
    @IsString()
    shippingAddress?: string;
    @IsOptional()
    @IsString()
    notes?: string;
}