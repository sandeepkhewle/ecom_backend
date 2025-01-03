import { Router, Request, Response, NextFunction } from "express";
import Controller from "utils/interface/controller.interface";
import validationMiddelware from "@/middleware/validation.middleware";
import validate from "./validation";
import HttpException from "@/utils/http.exception";
import consumerService from "./services";
import { queryMiddleware } from "@/middleware/queryMiddleware";
import catchAsync from "@/utils/catchAsync";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import { upload } from "../../middleware/multerMiddelware";
import otpService from "@/utils/gobalServices/otp.service";
import aclMiddleware from "@/middleware/aclMiddleware";
import guestUserMiddleware from "@/middleware/guestUserMiddleware";

class ConsumerController implements Controller {
  public path = "/consumer";
  public router = Router();
  private consumerService = new consumerService();
  private otpService = new otpService();

  constructor() {
    this.initRoutes();
  }

  // Initialize routes for the consumer endpoints
  private initRoutes(): void {
    // Route to register a new consumer
    this.router.post(
      `${this.path}/add`,
      upload,
      validationMiddelware(validate.create),
      queryMiddleware,
      this.userRegister
    );

    // Route for consumer login
    this.router.post(
      `${this.path}/login`,
      guestUserMiddleware,
      queryMiddleware,
      validationMiddelware(validate.login),
      this.login
    );

    // get otp for login
    this.router.post(`${this.path}/getOtp`, this.getOtp);

    // consumer login  with otp
    this.router.post(
      `${this.path}/loginWithOtp`,
      guestUserMiddleware,
      queryMiddleware,
      this.loginWithOtp
    );

    // Route to fetch all users
    this.router.get(
      `${this.path}/allUser`,
      authenticatedMiddleware,
      aclMiddleware,
      this.fetchAllUsers
    );

    // Route to fetch a single user by ID
    this.router.get(
      `${this.path}/:userId`,
      authenticatedMiddleware,
      queryMiddleware,
      this.fetchSingleUser
    );

    // Route to update a user
    this.router.patch(
      `${this.path}/:userId`,
      queryMiddleware,
      validationMiddelware(validate.update),
      authenticatedMiddleware,
      aclMiddleware,
      this.update
    );

    // Route to update user password
    this.router.patch(
      `${this.path}/updatePassword/:userId`,
      queryMiddleware,
      validationMiddelware(validate.update),
      this.updatePassword
    );

    // Route to send OTP
    this.router.post(`${this.path}/sendOtp`, this.sendOtp);

    // Route to verify OTP
    this.router.post(`${this.path}/verifyOtp`, this.verifyOtp);
  }

  // Handler for consumer login
  private login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const data = await this.consumerService.login({ ...req.body });
      res.status(200).json(data);
    } catch (error: any) {
      console.error("Login error:", error);
      res
        .status(error.status || 500)
        .json({ error: error.message, status: error.status });
    }
  };


  private loginWithOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const data = await this.consumerService.loginWithOtp({ ...req.body });
      res.status(200).json(data);
    } catch (error: any) {
      console.error("Login error:", error);
      res
        .status(error.status || 500)
        .json({ error: error.message, status: error.status });
    }
  };

  // handler to get otp for login
  private getOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const data = await this.otpService.sendOtp(req.body.emailId);
      res.status(200).json(data);
    } catch (error: any) {
      res
        .status(error.status || 500)
        .json({ error: error.message, status: error.status });
    }
  };

  // Handler to register a new consumer
  private userRegister = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const user = await this.consumerService.register(req.body);
        res.status(201).json({ payload: user });
      } catch (error: any) {
        res
          .status(error.status || 500)
          .json({ error: error.message, status: error.status });
      }
    }
  );

  // Handler to update a user by ID
  private update = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const user = await this.consumerService.update(
          req.params.userId,
          req.body
        );
        res.status(200).json({ payload: user });
      } catch (error: any) {
        res
          .status(error.status || 500)
          .json({ error: error.message, status: error.status });
      }
    }
  );

  // Handler to update a user's password
  private updatePassword = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const user = await this.consumerService.updatePassword(
          req.params.userId,
          req.body
        );
        res.status(200).json({ payload: user });
      } catch (error: any) {
        res
          .status(error.status || 500)
          .json({ error: error.message, status: error.status });
      }
    }
  );

  // Handler to fetch all users
  private fetchAllUsers = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const userData = await this.consumerService.fetchAllUsers();
        res.status(200).json({ payload: userData });
      } catch (error: any) {
        res
          .status(error.status || 500)
          .json({ error: error.message, status: error.status });
      }
    }
  );

  // Handler to fetch a single user by ID
  private fetchSingleUser = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const userData = await this.consumerService.fetchSingleUser(
          req.params.userId
        );
        res.status(200).json({ payload: userData });
      } catch (error: any) {
        res
          .status(error.status || 500)
          .json({ error: error.message, status: error.status });
      }
    }
  );

  // Handler to send OTP
  private sendOtp = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const user = await this.otpService.sendOtp(req.body.emailId);
        res.status(200).json("OTP sent successfully");
      } catch (error: any) {
        res
          .status(error.status || 500)
          .json({ error: error.message, status: error.status });
      }
    }
  );

  // Handler to verify OTP
  private verifyOtp = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const user = await this.otpService.verifyOtp(
          req.body.emailId,
          req.body.otp,
          req.body.role,
          req.body.id
        );
        res.status(200).json({ payload: user });
      } catch (error: any) {
        res
          .status(error.status || 500)
          .json({ error: error.message, status: error.status });
      }
    }
  );
}

export default ConsumerController;
