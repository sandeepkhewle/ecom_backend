import mongoose, { Model, Schema, model, Document, Query } from "mongoose";
import iProduct, { ProductWithUserId } from "./interface";
import iStockHistory from "../stockHistory/interface";
import { UpdateQuery } from "mongoose";

interface iProductDocument extends iProduct, Document {}

interface ProductModel extends Model<iProductDocument> {
  createWithStock(body: ProductWithUserId): Promise<iProductDocument>;
  updateStock(body: iStockHistory): Promise<any>;
}

/**
 * Product Schema Definition.
 * @type {mongoose.Schema}
 */
const productSchema = new Schema<iProductDocument>(
  {
    productName: {
      type: String,
      index: true,
      trim: true,
      lowercase: true,
    },
    productCategory: {
      type: String,
      index: true,
    },
    productInfo: {
      type: String,
    },
    productDesc: {
      type: String,
    },
    servingSize: {
      type: String,
    },
    productWeightInGrams: {
      type: Number,
    },
    breadth: {
      type: Number,
    },
    height: {
      type: Number,
    },
    length: {
      type: Number,
    },
    productMainImage: {
      type: String,
    },
    productImages: [String],
    mrp: {
      type: Number,
      default: 0,
    },
    sellPrice: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    productCode: {
      type: String,
    },
    hsnCode: {
      type: String,
    },
    productTag: {
      type: String,
    },
    disclaimer: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    directions: {
      type: String,
    },
    nutritionalInformation: {
      type: String,
    },
    ingredientList: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    keyPoints: [
      {
        imageName: String,
        text: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subCategorys",
      },
    ],
    // variants: [
    //   {
    //     productCode: { type: String, trim: true },
    //     hsnCode: { type: String, trim: true },
    //     servingSize: { type: Number },
    //     type: { type: String, trim: true, lowecase: true },
    //     price: { type: Number },
    //     mrp: { type: Number },
    //     stock: { type: Number },
    //   },
    // ],
    createdBy: {
      type: String,
    },
    bestSelling: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
    },
    gstRateInPercentage: {
      type: Number,
      default: 0,
    },
    howDoesItTaste: {
      type: String,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reviews",
      },
    ],
    FAQs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FAQs",
      },
    ],
  },
  { timestamps: true }
);

// Create a text index on productName and productCategory fields.
productSchema.index({ productName: "text", productCategory: "text" });

/**
 * Static method to calculate product code.
 * @param lastProductCode - The last used product code.
 * @returns The new product code.
 */
productSchema.statics.calculate = function (lastProductCode: number): number {
  let productCode: number = lastProductCode;
  return productCode;
};

productSchema.statics.createWithStock = async function (
  body: ProductWithUserId
): Promise<iProduct | null> {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction
  let product: iProduct | null = null;

  try {
    // 1. Add a new product
    product = await this.create(body);
    if (!product) throw new Error("Unable to create product.");

    // 2.create stock history
    const stackHistoryModel = (await import("../stockHistory/model")).default;
    stackHistoryModel.create({
      productId: product._id,
      quantity: product.stock,
      type: "add",
      note: "Opening Stock",
      userId: body.userId,
    });

    // Commit the transaction
    await session.commitTransaction();
    console.log("Transaction committed successfully.");
  } catch (err) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    console.error("Transaction aborted due to error:", err);
  } finally {
    // End the session
    session.endSession();
  }
  return product;
};

productSchema.statics.updateStock = async function (body: iStockHistory) {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction
  let product: iProduct | null = null;

  try {
    let condition = {};

    if (body.type === "add") {
      condition = { $inc: { stock: body.quantity } };
    } else if (body.type === "deduct") {
      condition = { $inc: { stock: -body.quantity } };
    } else {
      throw new Error("Invalid stock opreation");
    }

    // 1. Add a new product
    product = await this.findOneAndUpdate({ _id: body.productId }, condition);
    if (!product) throw new Error("Unable to create product.");

    let userId: string | mongoose.Types.ObjectId = body.userId;
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    // 2.create stock history
    const stackHistoryModel = (await import("../stockHistory/model")).default;
    stackHistoryModel.create({
      productId: product._id,
      quantity: body.quantity,
      type: body.type,
      note: body.note,
      userId,
    });
    // Commit the transaction
    await session.commitTransaction();
    console.log("Transaction committed successfully.");
  } catch (err) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    console.error("Transaction aborted due to error:", err);
    throw err;
  } finally {
    // End the session
    session.endSession();
  }

  return product;
};

productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as UpdateQuery<any>; // Get the update query
  if (update?.$inc?.stock && update.$inc.stock < 0) {
    // for deduct stock action
    const productDoc = await this.model.findOne(this.getQuery());
    if (productDoc?.stock + update.$inc.stock < 0) {
      const error = new Error("Unable to upadate stock.");
      return next(error);
    }
  }
  next();
});

// Create and export the Product model.
const Products = model<iProductDocument, ProductModel>(
  "Products",
  productSchema
);
// const Products = mongoose.model<iProduct>("Products", productSchema);
export default Products;
