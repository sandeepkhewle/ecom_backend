import { Types } from "mongoose";

export interface iCartProduct {
  gstRateInPercentage: string;
  price: number;
  quantity: number;
  name: string;
  totalPrice: number;
  productId: Types.ObjectId;
}

export interface iCart {
  cartId: string;
  browserDetails?: object;
  products: iCartProduct[];
  totalProductsPrice: number;
  consumer: Types.ObjectId;
}
