import { Router, Request, Response, NextFunction } from "express";
// import Controller from "../utils/interface/controller.interface";
import Controller from '../../utils/interface/controller.interface'
// import validationMiddelware from "@/middleware/validation.middleware"
import validationMiddelware from "../../middleware/validation.middleware"
import validate from "./validation"
import HttpException from "../../utils/http.exception";
import orderService from "./service";
import { queryMiddleware } from "../../middleware/queryMiddleware";
import accountService from "../../utils/gobalServices/account.service";
import authenticatedMiddleware from "../../middleware/authenticated.middleware";
import aclMiddleware from "../../middleware/aclMiddleware";
import ConsumerService from "../consumer/services";
import guestUserMiddleware from "@/middleware/guestUserMiddleware";
import cartService from "../cart/services";

class companyUserController implements Controller {
  public path = "/order";
  public router = Router();
  public orderService = new orderService();
  public accountService = new accountService();
  public cartService = new cartService();

  constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      guestUserMiddleware,
      authenticatedMiddleware,
      queryMiddleware,
      this.register
    );
    this.router.patch(
      `${this.path}/update`,
      authenticatedMiddleware,
      aclMiddleware,
      queryMiddleware,
      this.updateorder
    );
    this.router.get(
      `${this.path}/fetch`,
      authenticatedMiddleware,
      aclMiddleware,
      this.fetchAlluser
    );
    this.router.get(
      `${this.path}/fetchOne/:orderId`,
      authenticatedMiddleware,
      aclMiddleware,
      queryMiddleware,
      this.fetchSingleOrder
    );
    this.router.post(
      `${this.path}/:orderNo/payment_callback`, // webhook for hdfc payment gateway
      this.paymentCallback
    );
    this.router.post(
      `${this.path}/:orderNo/fetch_status`,
      this.fetchOrderStatus
    );
    this.router.post(
      `${this.path}/trackOrder`, this.trackShipment
  );
    this.router.post(
      `${this.path}/shipWebhook`, this.webhookController
  );
    this.router.post(
      `${this.path}/cancelOrder`, this.cancelOrderController
  );
  }

  private paymentCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // await await this.orderService.orderPaymentWebhook(req.body);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private fetchOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const orderNo = req.params.orderNo as string;
      const payload = await this.orderService.fetchandUpdateOrderStatus(
        orderNo
      );
      res.status(201).json({ payload });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      console.log("req.body", req.body, req.user);
      const body = req.body;
      let userData = req.user;
      if (userData?.type === "guest") {
        const { cartId } = userData;
        const consumerService = new ConsumerService();
        userData = await consumerService
          .createGuestUser({
            ...body.user,
            address: body.shippingAddress,
          })
          .then(async (user) => {
            if (cartId) {
              // assign guest user cart to newly created user
              await this.cartService.cartSystem(cartId, user.id, {
                command: "assignCart",
              });
            }
            return user;
          });
      }
      // let user = await this.accountService.createBill(body, userData)
      let user = await this.accountService
        .createBill(body, userData)
        .then(async (data) => {
          await this.cartService.cartSystem("", userData.id, {
            command: "removeUserCart",
          });
          return data;
        });
      res.status(201).json({ payload: user });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private updateorder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const body = req.body;
      const { orderId } = req.query;
      const user = await this.orderService.update(orderId, body);
      res.status(201).json({ payload: user });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private fetchAlluser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { orderId } = req.params;

      const userData = await this.orderService.fetchAllOrder();
      res.status(201).json({ payload: userData });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { orderId } = req.params;
      const userData = await this.orderService.delete(orderId);
      res.status(201).json({ payload: userData });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private fetchSingleOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { orderId } = req.query;
      console.log(orderId);

      const userData = await this.orderService.fetchSingleOrder(orderId);
      res.status(201).json({ payload: userData });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private trackShipment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        console.log("/order/trackOrder");
        const data = await this.orderService.fetchOrderAndTrackingRecord(req.body?.shipment_id,req.body?.orderId);
        res.status(200).json(data);
    } catch (error: any) {
        // next(new HttpException(400, error.message));
        console.error(error.message);
        res.status(error.status).json({ error: error.message, status: error.status })
    }
};

  private webhookController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        console.log("/order/webhookService");
        const data = await this.orderService.webhookService(req.body);
        res.status(200).json(data);
    } catch (error: any) {
        // next(new HttpException(400, error.message));
        console.error(error.message);
        res.status(error.status).json({ error: error.message, status: error.status })
    }
};

  private cancelOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        console.log("/order/cancelOrderController");
        const data = await this.orderService.cancelOrderService(req.body);
        res.status(200).json(data);
    } catch (error: any) {
        // next(new HttpException(400, error.message));
        console.error(error.message);
        res.status(error.status).json({ error: error.message, status: error.status })
    }
};
}



export default companyUserController;