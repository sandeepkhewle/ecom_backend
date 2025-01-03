import { Router, Request, Response, NextFunction } from "express";
import Controller from "utils/interface/controller.interface";
import validationMiddleware from "@/middleware/validation.middleware";
import HttpException from "@/utils/http.exception";
import billService from "./services";
import { queryMiddleware } from "@/middleware/queryMiddleware";
import accountService from "@/utils/gobalServices/account.service";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import path from 'path'

class BillController implements Controller {
  public path = '/bill'; // API route path
  public router = Router(); // Express router instance
  public billService = new billService(); // Service for bill-related operations
  public accountService = new accountService(); // Service for account-related operations

  constructor() {
    this.initRoutes(); // Initialize routes in the constructor
  }

  // Initialize API routes and their corresponding handlers
  private initRoutes(): void {
    // Route to create a new bill; requires authentication and query middleware
    this.router.post(
      `${this.path}/create`,
      authenticatedMiddleware,
      queryMiddleware,
      this.register
    );

    this.router.get(
      `${this.path}/createBill`,

      this.createBiil
    );

    // Uncomment the following lines if bill month-wise fetching is needed in the future
    // this.router.post(
    //   `${this.path}/fetchbillmonth`,
    //   authenticatedMiddleware,
    //   queryMiddleware,
    //   this.fetchBillMonthWise
    // );
  }

  // Handler to create a new bill
  private register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      console.log("Request body:", req.body);
      console.log("User data:", req.user);

      // Extract request body and user data
      const body = req.body;
      const userData = req.user;

      // Create a new bill using the account service
      const user = await this.accountService.createBill(body, userData);

      // Send a successful response with the created bill data
      res.status(201).json({ payload: user });
    } catch (error: any) {
      // Handle errors and pass them to the error handling middleware
      next(new HttpException(400, error.message));
    }
  }

  private createBiil = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      console.log(
        "createBill",req.query
      );
      
      // Extract request body and user data
      const id:any = req.query.id;
      // Create a new bill using the account service
      const user:any = await this.billService.billCreation(id);
      const filePath = path.join(__dirname,`../../../public/Invoice`,`${user}.pdf`); // replace with your file path
      console.log("filePath",filePath);
      
      res.download(filePath, 'sample.pdf', (err) => {
        if (err) {
          console.log('Error sending file:', err);
          res.status(500).send('Error sending file');
        }
      });

      // Send a successful response with the created bill data
      // res.status(201).json({ payload: user });
    } catch (error: any) {
      // Handle errors and pass them to the error handling middleware
      next(new HttpException(400, error.message));
    }
  }
}

export default BillController;
