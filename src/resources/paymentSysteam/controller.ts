import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interface/controller.interface';
import HttpException from '@/utils/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/company/validation';
import paymentSysteamService from '@/resources/paymentSysteam/service';
import { queryMiddleware } from '@/middleware/queryMiddleware';
import catchAsync from '@/utils/catchAsync';
// import upload from '@/middleware/multerMiddelware';
import authenticatedMiddleware from '@/middleware/authenticated.middleware';
import { upload, multiUpload } from '@/middleware/multerMiddelware'
import aclMiddleware from '@/middleware/aclMiddleware';
import statesListService from '@/utils/gobalServices/statelistService';

class companyController implements Controller {
    public path = '/paymentSysteam';
    public router = Router();
    private paymentSysteamService = new paymentSysteamService();
    private statesListService = new statesListService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        //Register company api route


        //add and update credit in company
        this.router.patch(
            `${this.path}/credit/add`, this.addCredit
        );

        this.router.patch(
            `${this.path}/credit/reduce`, this.reduceCredit
        );
        this.router.patch(
            `${this.path}/payment/add`, this.addPayment
        );
        //show statement of company
        // this.router.get(
        //     `${this.path}/statement/show`, this.showCreditStatement
        // );


    }

    // add creadit
    private addCredit = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const credit = await this.paymentSysteamService.addCreditStatement({...req.body , creditType : "add"});
            res.status(200).json({ payload: "credit added Successfully" });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    // reduce creadit
    private reduceCredit = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("/credit/reduce",req.body);
            const credit = await this.paymentSysteamService.addCreditStatement({...req.body , creditType : "reduce"});
            res.status(200).json({ payload: "credit reduce Successfully" });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    // show all payment statement
    // private showCreditStatement = catchAsync(async (
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ): Promise<Response | void> => {
    //     try {
    //         const company_id  = req.query.company_id

    //         const credit = await this.paymentSysteamService.showCreditStatement(company_id);
    //         res.status(200).json({ payload: credit });
    //     } catch (error: any) {
    //         next(new HttpException(error.statusCode, error.message));
    //     }
    // });
    // add payment statement
    private addPayment = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("/paymentSystem/payment/add---------",req.body);
            const credit = await this.paymentSysteamService.addPaymentStatement(req.body);
            res.status(200).json({ payload: credit });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

}

export default companyController;
