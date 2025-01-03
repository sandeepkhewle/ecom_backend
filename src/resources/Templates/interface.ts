import { Document } from "mongoose";

export default interface product extends Document {
    productId: String,
    productName: String,
    productCatogery: String,
    productInfo: String,
    productSize: String,
    productMainImage: String,
    productImages: [String],
    quantity: Number,
    buyPrice: Number,
    sellPrice: Number,
    createdAt: Date,
    createdBy: String,
    updateBy: String,
}