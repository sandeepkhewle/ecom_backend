import { Document, Schema } from "mongoose";

/**
 * Product Interface.
 */
export default interface Product extends Document {
  productName: string; // Name of the product
  productCategory: string; // Category of the product
  productInfo: string; // Information about the product
  productDesc: string; // Description of the product
  servingSize: string; // Serving size of the product
  productWeightInGrams: number; // Weight of the product in grams
  productMainImage: string; // Main image of the product
  productImages: string[]; // Array of additional images for the product
  mrp: number; // Maximum Retail Price
  sellPrice: number; // Selling price of the product
  active: boolean; // Indicates if the product is active
  productCode: string; // Unique code for the product
  hsnCode: string; // HSN code of the product
  productTag: string; // Tag associated with the product
  disclaimer: string; // Disclaimer for the product
  rating: number; // Rating of the product
  directions: string; // Directions for use
  nutritionalInformation: string; // Nutritional information
  ingredientList: string; // List of ingredients
  stock: number; // Stock quantity
  breadth: number; // Stock quantity
  length: number; // Stock quantity
  height: number; // Stock quantity
  keyPoints: { imageName: string; text: string }[]; // Key points of the product
  category: Schema.Types.ObjectId; // Category of the product
  createdBy: string; // User who created the product
  bestSelling: boolean; // Indicates if the product is a best seller
  updatedBy: string; // User who last updated the product
  gstRateInPercentage: number; // GST rate in percentage
  reviews: string; // Category of the product
  FAQs: string; // Category of the product
  subCategories: string[]; // Sub categories of the product
  howDoesItTaste: string; // How does it taste
  // variants: any;
}

export interface ProductWithUserId extends Product {
  userId: string | Schema.Types.ObjectId;
}
