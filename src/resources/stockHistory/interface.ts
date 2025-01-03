import { Document, Types } from "mongoose";

/**
 * StockHistory Interface.
 */
export default interface iStockHistory extends Document {
  productId: string | Types.ObjectId;
  quantity: number;
  type: "add" | "deduct";
  userId: string | Types.ObjectId;
  note: string;
}
