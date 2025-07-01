export class OrderItemResponse {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export class OrderResponseDto {
  id: number;
  total: number;
  status: string;
  createdAt: Date;
  items: OrderItemResponse[];
  user:{
    name:string,
    email:string
  }
}
