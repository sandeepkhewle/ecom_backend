import { Router, Request, Response, NextFunction } from "express";
import Controller from "utils/interface/controller.interface";
import validationMiddelware from "@/middleware/validation.middleware"
import validate from "./validation"
import HttpException from "@/utils/http.exception";
import companyUserService from "./services";
import { queryMiddleware } from "@/middleware/queryMiddleware";
import catchAsync from "@/utils/catchAsync";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import { upload } from "../../middleware/multerMiddelware";
import otpService from "@/utils/gobalServices/otp.service";
import aclMiddleware from "@/middleware/aclMiddleware";
class companyUserController implements Controller {
    public path = '/user';
    public router = Router();
    public companyUserService = new companyUserService();
    public otpService = new otpService();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {

        //Register company user api route
        this.router.post(`${this.path}/add`, upload, validationMiddelware(validate.create), queryMiddleware, this.userRegister);

        // Login CompanyUser
        this.router.post(`${this.path}/login`, queryMiddleware, validationMiddelware(validate.login), this.login);

        //get all company Admin  api route
        this.router.get(`${this.path}/fetchcompanyAdmin`, queryMiddleware, authenticatedMiddleware, aclMiddleware, this.fetchCompanyAdmin);

        //get all company user list api route
        this.router.get(`${this.path}/allUser`, authenticatedMiddleware, aclMiddleware, this.fetchAlluser);

        //get single company user by _id api route
        this.router.get(`${this.path}/:userId`, authenticatedMiddleware, aclMiddleware, queryMiddleware, this.fetchSingleUser);

        //update company user api route
        this.router.patch(`${this.path}/:userId`, queryMiddleware, validationMiddelware(validate.update), authenticatedMiddleware, aclMiddleware, this.update);
        //update company user password  api route
        this.router.patch(`${this.path}/updatePassword/:userId`, queryMiddleware, validationMiddelware(validate.update), this.updatePassword);

        //send Otp
        this.router.post(`${this.path}/sendOtp`, this.sendOtp);

        //Verify Otp
        this.router.post(`${this.path}/verifyOtp`, this.verifyOtp);


    }


    // Login for company user
    private login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("hello");
            console.log("req.body", req.body);

            const data = await this.companyUserService.login({ ...req.body });
            res.status(200).json(data);
        } catch (error: any) {
            console.error(error);
            // next(new HttpException(400, error.message));
            res.status(error.status).json({ error: error.message, status: error.status })
        }
    };

    //Register company user api route
    private userRegister = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log('user/add', req.body);
            let user = await this.companyUserService.register(req.body, req.file);
            res.status(201).json({ payload: user });
        } catch (error: any) {
            res.status(error.status).json({ error: error.message, status: error.status })
        }
    })

    //get single company user by _id api route
    private update = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const user = await this.companyUserService.update(req.params.userId, req.body);
            res.status(201).json({ payload: user });
        } catch (error: any) {
            res.status(error.status).json({ error: error.message, status: error.status })

        }
    })
    //update password api route
    private updatePassword = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const user = await this.companyUserService.updatePassword(req.params.userId, req.body);
            res.status(201).json({ payload: user });
        } catch (error: any) {
            res.status(error.status).json({ error: error.message, status: error.status })

        }
    })

    //get all company user list api route
    private fetchAlluser = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let company_id = req.user.company_id;
            const userData = await this.companyUserService.fetchAllUser(company_id);
            res.status(201).json({ payload: userData });
        } catch (error: any) {
            res.status(error.status).json({ error: error.message, status: error.status })

        }
    })

    //update company user api route
    private fetchSingleUser = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const userData = await this.companyUserService.fetchSingleUser(req.params.userId);
            res.status(201).json({ payload: userData });
        } catch (error: any) {
            res.status(error.status).json({ error: error.message, status: error.status })

        }
    })

    //get company Admin api function
    private fetchCompanyAdmin = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let { company_id, role } = req.query;
            if (!role) role = 'admin';
            console.log("user", req.query);
            if (req.user.company_id) company_id = req.user.company_id
            const companyAdmin = await this.companyUserService.findCompanyAdmin(company_id, role);
            console.log(companyAdmin);

            res.status(200).json({ payload: companyAdmin });
        } catch (error: any) {
            res.status(error.status).json({ error: error.message, status: error.status })

        }
    });



    //Send Otp
    private sendOtp = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("user/sendOtp", req.body);
            const user = await this.otpService.sendOtp(req.body?.emailId);
            res.status(201).json({ payload: user });
        } catch (error: any) {
            res.status(error.status).json({ error: error.message, status: error.status })

        }
    })

    //Send Otp
    private verifyOtp = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const user = await this.otpService.verifyOtp(req.body.emailId, req.body.otp, req.body.role, req.body.id);
            res.status(201).json({ payload: user });
        } catch (error: any) {
            res.status(error.status).json({ error: error.message, status: error.status })

        }
    })
}

export default companyUserController;