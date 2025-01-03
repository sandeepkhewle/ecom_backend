import { Router, Request, Response, NextFunction } from "express";
import Controller from "utils/interface/controller.interface";
import HttpException from "@/utils/http.exception";
import salesUserService from "./service";
import catchAsync from "@/utils/catchAsync";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import aclMiddleware from "@/middleware/aclMiddleware";
import otpService from "@/utils/gobalServices/otp.service";
import Dashboard from "@/resources/dashBoard/services";


class companyUserController implements Controller {
    public path = '/salesUser';
    public router = Router();
    public salesUserService = new salesUserService();
    public Dashboard = new Dashboard();
    public otpService = new otpService();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {

        // Login SalesUser
        this.router.post(
            `${this.path}/login`, this.login
        );

        this.router.post(
            `${this.path}/create`, authenticatedMiddleware, aclMiddleware, this.create
        );
        this.router.patch(
            `${this.path}/completeVendorInfo/:sessionId`, this.completeVendorInfo
        );
        this.router.patch(
            `${this.path}/changePassword/:id`, this.changePassword
        );

        this.router.get(
            `${this.path}/fetchsingleuser/:userId`, authenticatedMiddleware, aclMiddleware, this.fetchSingleUser
        );
        this.router.patch(
            `${this.path}/updateSalesUser/:userId`, authenticatedMiddleware, aclMiddleware, this.updateSalesUser
        );
        this.router.get(
            `${this.path}/fetchVendorList`, authenticatedMiddleware, aclMiddleware, this.fetchVendorList
        );
        this.router.get(
            `${this.path}/fetchManagerList`, authenticatedMiddleware, aclMiddleware, this.fetchManagerList
        );
        this.router.patch(
            `${this.path}/assignManager`, authenticatedMiddleware, aclMiddleware, this.assignManager
        );

    }

    // Login for Sales user
    private login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const data = await this.salesUserService.login({ ...req.body });
            // if (token) {
            //     let time = new Date(new Date().setHours(new Date().getHours() + 1));
            // }
            res.status(200).json(data);
        } catch (error: any) {
            // next(new HttpException(400, error.message));
            console.error(error.message);
            res.status(error.status).json({ error: error.message, status: error.status })
        }
    };

    private create = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let user = await this.salesUserService.create(req.body)
            res.status(201).json({ payload: user });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    })
    private completeVendorInfo = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { sessionId } = req.params;
            let user = await this.salesUserService.updateVendorInfo(sessionId, req.body);

            res.status(201).json({ payload: user });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    })
    private changePassword = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { id } = req.params;
            let user = await this.salesUserService.changeSalesUserPassword(id, req.body)
            console.log(user);

            res.status(201).json({ payload: user });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    })


    //update company user api route
    private fetchSingleUser = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const userData = await this.salesUserService.fetchSingleUser(req.params.userId);
            res.status(201).json({ payload: userData });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    })
    //update company user api route
    private updateSalesUser = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const userData = await this.salesUserService.changeSalesUserPassword(req.params.userId, req.body);
            res.status(201).json({ payload: userData });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    })

    //feych vendor user api route
    private fetchVendorList = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const userData = await this.salesUserService.fetchVendorList();
            res.status(201).json({ payload: userData });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    })
    //fetch RelationshipManager list
    private fetchManagerList = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const userData = await this.salesUserService.ManagerList();
            res.status(201).json({ payload: userData });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    })
    //assign RelationshipManager to company
    private assignManager = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const {company_id , relationshipManagerId} = req.body;
            const userData = await this.salesUserService.assignManagerToCompany(company_id , relationshipManagerId);
            res.status(201).json({ payload: userData });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    })



}
export default companyUserController;