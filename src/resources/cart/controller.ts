// package
import { Router, Request, Response, NextFunction } from "express";

// interface
import Controller from "utils/interface/controller.interface";

// service
import cartService from "./services";

// utils
import HttpException from "@/utils/http.exception";
import { queryMiddleware } from "@/middleware/queryMiddleware";

// middleware
import catchAsync from "@/utils/catchAsync";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import guestUserMiddleware from "@/middleware/guestUserMiddleware";
import { errorResponse } from "@/utils/helpers";

class cartController implements Controller {
  public path = "/cart";
  public router = Router();
  public cartService = new cartService();

  constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    // cart
    this.router.post(
      `${this.path}/`,
      guestUserMiddleware,
      authenticatedMiddleware,
      queryMiddleware,
      this.cart
    );

    this.router.post(
      `${this.path}/validate_stock`,
      guestUserMiddleware,
      authenticatedMiddleware,
      queryMiddleware,
      this.validateStock
    );

    this.router.post(
      `${this.path}/update_available_stock`,
      guestUserMiddleware,
      authenticatedMiddleware,
      queryMiddleware,
      this.updateValidateStock
    );
  }

  //cart system
  private cart = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        console.log("/cart", req.user);
        let userId = req.user.id;
        let cartId = req.user.cartId;
        // console.log("/cart", userId);
        const cart = await this.cartService.cartSystem(
          cartId,
          userId,
          req.body
        );

        res.status(200).json({ payload: cart });
      } catch (error: any) {
        errorResponse(res, error);
      }
    }
  );

  private validateStock = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        console.log("/cart/validate_stock", req.user);
        let cartId = req.body.cartId || req.user.cartId;
        await this.cartService.validateStock(cartId).then((availableStocks) => {
          const payload: any = {
            success: Object.keys(availableStocks)?.length === 0,
          };
          if (!payload.success) payload.availableStocks = availableStocks;
          res.status(200).json(payload);
        });
      } catch (error: any) {
        errorResponse(res, error);
      }
    }
  );

  private updateValidateStock = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        console.log("/cart/update_available_stock", req.user);
        let cartId = req.user.cartId;
        let payload: any = {};
        await this.cartService.updateCartStock(cartId).then((validateStock) => {
          payload.updatedProducts = validateStock;
        });
        res.status(200).json({ ...payload, success: true });
      } catch (error: any) {
        errorResponse(res, error);
      }
    }
  );
}

export default cartController;