import mongoose, {
  UpdateQuery,
  Model,
  Schema,
  model,
  Document,
} from "mongoose";
import { iCart, iCartProduct } from "./interface";
import iProduct from "../product/interface";
import HttpException from "@/utils/http.exception";

interface iCartDocument extends iCart, Document {}

interface CartModel extends Model<iCartDocument> {
  validateStock(
    products: iCartProduct[],
    throwError: boolean
  ): Promise<Record<string, number>>;
}

const productSchema = new mongoose.Schema(
  {
    gstRateInPercentage: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    name: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
  },
  { _id: false } // Prevents creating _id for each sub-document
);

const cartSchema = new Schema<iCartDocument>(
  {
    cartId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    browserDetails: {
      type: Object,
      required: false,
    },
    products: {
      type: [productSchema],
      required: true,
      validate: [arrayLimit, "{PATH} exceeds the limit of 100"], // Example validation
    },
    totalProductsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consumers",
    },
  },
  { timestamps: true }
);

function arrayLimit(val: any[]) {
  return val.length <= 100;
}

cartSchema.statics.validateStock = async function (
  cartProducts: iCartProduct[],
  throwError: boolean = true
) {
  const cartProductIds = cartProducts.map((product: iCartProduct) =>
    product.productId.toString()
  );

  const ProductModel = (await import("../product/model")).default;
  const products = await ProductModel.find({ _id: { $in: cartProductIds } });

  const availableStocks: Record<string, number> = {};
  cartProducts.forEach((cartProduct: iCartProduct) => {
    const product = products.find(
      (p: iProduct) => p._id.toString() === cartProduct.productId.toString()
    );
    if (product && product.stock - cartProduct.quantity < 0) {
      availableStocks[product._id.toString()] = product.stock;
    }
  });

  if (Object.keys(availableStocks).length) {
    if (throwError)
      throw new HttpException(
        400,
        `Insufficient Stock for product(s): ${products
          .filter((product) => {
            return !isNaN(availableStocks[product._id.toString()]);
          })
          .map((product) => product.productName)
          .join(", ")}`,
        { availableStocks }
      );
  }
  return availableStocks;
};

cartSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as UpdateQuery<any>; // Get the update query
  if (update?.products?.length) {
    const currentDoc = await this.model.findOne(this.getQuery());
    const currrentProducts = (currentDoc?.products || []).reduce(
      (acc: Record<string, iCartProduct>, item: iCartProduct) => {
        acc[item.productId.toString()] = item;
        return acc;
      },
      {}
    );

    const updatedQtyProducts = update.products.filter(
      (product: iCartProduct) => {
        if (currrentProducts[product.productId.toString()]) {
          return (
            product.quantity !==
            currrentProducts[product.productId.toString()].quantity
          );
        }
        return true;
      }
    );

    const validateStock = await Carts.validateStock(updatedQtyProducts, false);

    const validateStockId = Object.keys(validateStock);

    if (validateStockId) {
      update.products = update.products.map((product: iCartProduct) => {
        if (validateStockId.includes(product.productId.toString())) {
          product.quantity = validateStock[product.productId.toString()];
          product.totalPrice = product.price * product.quantity;
        }
        return product;
      });
    }
  }
  next();
});

cartSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    doc.totalProductsPrice = doc.products.reduce(
      (acc: number, item: iCartProduct) => acc + Number(item.totalPrice),
      0
    );
    await doc.save();
  }
});

const Carts = model<iCartDocument, CartModel>("Carts", cartSchema);

export default Carts;
