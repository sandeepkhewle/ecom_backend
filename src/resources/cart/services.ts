import { randomUUID } from "crypto";
import { iCart, iCartProduct } from "./interface";
import cartModel from "./model";
import mongoose from "mongoose";
import { validateParams } from "@/utils/helpers";
import {finalGSTCal, igstCal, stateGst} from "@/utils/gobalServices/gstCalculate";
import calWeight from "@/utils/gobalServices/weight";

/**
 * Service class for handling cart operations.
 */
class Cart {
  private cartModel = cartModel;

  /**
   * Processes cart operations based on the provided command.
   * @param cartId - The ID of the cart.
   * @param userId - The ID of the user owning the cart.
   * @param body - The request body containing command and product details.
   * @returns The result of the cart operation.
   */
  public async cartSystem(
    cartId: string,
    userId: string,
    body: any
  ): Promise<any> {
    try {
      const command = body.command;
      const product: iCartProduct = this.constructProduct(body);
      const orConditions = [];

      if (cartId) {
        orConditions.push({ cartId });
      }

      if (userId) {
        orConditions.push({ consumer: userId });
      }
      let cartOwner = await this.cartModel.findOne({ $or: orConditions });

      switch (command) {
        case "add":
          return this.add(cartId, cartOwner, userId, product);
        case "increaseQuantity":
          return this.changeQuantity(
            cartOwner,
            cartId,
            userId,
            product,
            "increase"
          );
        case "decreaseQuantity":
          return this.changeQuantity(
            cartOwner,
            cartId,
            userId,
            product,
            "decrease"
          );
        case "deleteAllProduct":
          return this.clearCart(userId, cartId);
        case "deleteOneProduct":
          return this.removeProduct(cartOwner, userId, cartId, body);
        case "fetchCart":
          return this.fetchCart(userId, cartId);
        case "assignCart":
          return this.assignCart({ cartId, userId });
        case "removeUserCart":
          return this.removeUserCart(cartOwner, userId);
        default:
          throw new Error("Invalid command");
      }
    } catch (error) {
      console.error("Error in cartSystem:", error);
      throw error;
    }
  }

  public async validateStock(cartId: string) {
    const cart = await this.cartModel.findOne({ cartId });
    if (!cart) throw new Error("Cart not found");

    return this.cartModel.validateStock(cart.products, false);
  }

  /**
   * Constructs a product object from the request body.
   * @param body - The request body containing product details.
   * @returns The constructed product object.
   */
  private constructProduct(body: any): iCartProduct {
    const product: iCartProduct = {
      gstRateInPercentage: body.gstRateInPercentage,
      price: Number(body.price),
      quantity: Number(body.quantity),
      name: body.productName,
      totalPrice: Number(body.price) * Number(body.quantity),
      productId: body.product_id,
    };
    return product;
  }

  /**
   * Adds a product to the cart or creates a new cart if it doesn't exist.
   * @param cartId - The ID of the cart.
   * @param cartOwner - The current cart owner.
   * @param userId - The ID of the user owning the cart.
   * @param product - The product to be added to the cart.
   * @returns The updated cart or the newly created cart.
   */
  private async add(
    cartId: string,
    cartOwner: any,
    userId: string,
    product: iCartProduct
  ) {
    if (!cartOwner) {
      const newCart = {
        cartId: cartId || randomUUID(),
        consumer: userId,
        products: [product],
        totalProductsPrice: product.totalPrice,
      };
      return await this.cartModel.create(newCart);
    }

    const updatedProducts = this.updateProductArray(
      cartOwner.products,
      product,
      "add"
    );

    const conditions: Record<string, any> = {};
    if (userId) {
      conditions.consumer = userId;
    } else if (cartId) {
      conditions.cartId = cartId;
    }

    return await this.cartModel.findOneAndUpdate(
      conditions,
      {
        products: updatedProducts,
      },
      { new: true }
    );
  }

  /**
   * Updates the product array based on the command (add or remove).
   * @param arr - The current array of products in the cart.
   * @param product - The product to be updated.
   * @param command - The command indicating whether to add or remove the product.
   * @returns The updated array of products.
   */
  private updateProductArray(
    arr: iCartProduct[],
    product: iCartProduct,
    command: string
  ): iCartProduct[] {
    let isExist = false;
    const products = arr.map((item) => {
      if (this.isSameProduct(item, product)) {
        item.quantity =
          command === "add"
            ? item.quantity + product.quantity
            : product.quantity;
        item.totalPrice = item.price * item.quantity;
        isExist = true;
      }
      return item;
    });
    if (command === "add" && !isExist) return products.concat(product);
    return products;
  }

  /**
   * Checks if two products are the same based on their identifiers.
   * @param item - The item in the cart.
   * @param product - The product to be compared.
   * @returns True if the products are the same; otherwise, false.
   */
  private isSameProduct(item: iCartProduct, product: iCartProduct): boolean {
    return item.productId.equals(product.productId);
  }

  /**
   * Calculates the total price of all products in the cart.
   * @param products - The array of products in the cart.
   * @returns The total price of the products.
   */
  private calculateTotalPrice(products: iCartProduct[]): number {
    return products.reduce((acc, item) => acc + item.totalPrice, 0);
  }

  /**
   * Changes the quantity of a product in the cart.
   * @param cartOwner - The current cart owner.
   * @param userId - The ID of the user owning the cart.
   * @param product - The product whose quantity is to be changed.
   * @param action - The action to be performed (increase or decrease).
   * @returns The updated cart.
   */
  private async changeQuantity(
    cartOwner: any,
    cartId: string,
    userId: string,
    product: iCartProduct,
    action: string
  ) {
    const updatedProducts = this.updateProductArray(
      cartOwner.products,
      product,
      action
    );

    const conditions: Record<string, any> = {};
    if (userId) {
      conditions.consumer = userId;
    } else if (cartId) {
      conditions.cartId = cartId;
    }

    return await this.cartModel.findOneAndUpdate(
      conditions,
      {
        products: updatedProducts,
      },
      { new: true }
    );
  }

  /**
   * Clears all products from the cart.
   * @param userId - The ID of the user owning the cart.
   * @returns The updated cart with no products.
   */
  private async clearCart(userId: string, cartId: string) {
    const conditions: Record<string, any> = {};
    if (userId) {
      conditions.consumer = userId;
    } else if (cartId) {
      conditions.cartId = cartId;
    }
    return await this.cartModel.findOneAndUpdate(
      conditions,
      { products: [], totalProductsPrice: 0 },
      { new: true }
    );
  }

  /**
   * Removes a specific product from the cart.
   * @param cartOwner - The current cart owner.
   * @param userId - The ID of the user owning the cart.
   * @param body - The request body containing the product details to be removed.
   * @returns The updated cart without the removed product.
   */
  private async removeProduct(
    cartOwner: any,
    userId: string,
    cartId: string,
    body: any
  ) {
    const updatedProducts = cartOwner.products.filter(
      (item: iCartProduct) => !this.isSameProduct(item, body)
    );

    const conditions: Record<string, any> = {};
    if (userId) {
      conditions.consumer = userId;
    } else if (cartId) {
      conditions.cartId = cartId;
    }
    return await this.cartModel.findOneAndUpdate(
      conditions,
      {
        products: updatedProducts,
      },
      { new: true }
    );
  }

  private async assignCart(params: Record<string, any>) {
    validateParams(params, ["cartId", "userId"]);
    const { cartId, userId } = params;

    // delete existing user cart first
    await this.cartModel.deleteOne({ consumer: userId });

    return await this.cartModel.findOneAndUpdate(
      { cartId: cartId },
      { consumer: new mongoose.Types.ObjectId(userId) }
    );
  }

  private async removeUserCart(cartOwner: any, userId: string) {
    if (cartOwner) return await cartOwner.remove();
    return await this.cartModel.deleteOne({ consumer: userId });
  }

  /**
   * upadtae cart stock quntity with available stock
   * @param cartId - The current cart owner.
   * @return The updated cart.
   */
  public async updateCartStock(cartId: string) {
    const cart = await this.cartModel.findOne({ cartId });
    if (!cart) throw new Error("Cart not found");

    const validateStock = this.cartModel.validateStock(cart.products, false);

    const stock = await validateStock;
    const products = cart.products.map((product) => {
      if (stock[product.productId.toString()] !== undefined) {
        product.quantity = stock[product.productId.toString()];
        product.totalPrice = product.price * product.quantity;
      }
      return product;
    });

    await this.cartModel.findOneAndUpdate(
      { cartId },
      { products },
      { new: true }
    ); // update the cart document in the database

    return validateStock;
  }

  /**
   * Fetches the cart for a specific user.
   * @param userId - The ID of the user owning the cart.
   * @returns The user's cart with populated product details.
   */
  private async fetchCart(userId: string, cartId: string , gstNumber?:string) {
    const conditions: Record<string, any> = {};

    if (userId) {
      conditions.consumer = userId;
    } else if (cartId) {
      conditions.cartId = cartId;
    }
    let cart: any = await this.cartModel
      .findOne(conditions)
      .populate("products.productId");

      let gstAndProducts =  finalGSTCal(cart,gstNumber)
      let totalWeight = calWeight(cart?.products)
      
      let newCart:any = {...cart?._doc , ...gstAndProducts } 
    return {...newCart  ,sgst: gstAndProducts?.sgst , cgst: gstAndProducts?.cgst , totalWeight }
  }

}

export default Cart;
