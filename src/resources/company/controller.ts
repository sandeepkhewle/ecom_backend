import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interface/controller.interface';
import HttpException from '@/utils/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/company/validation';
import companyService from '@/resources/company/service';
import { queryMiddleware } from '@/middleware/queryMiddleware';
import catchAsync from '@/utils/catchAsync';
// import upload from '@/middleware/multerMiddelware';
import authenticatedMiddleware from '@/middleware/authenticated.middleware';
import { upload, multiUpload } from '@/middleware/multerMiddelware'
import aclMiddleware from '@/middleware/aclMiddleware';
import statesListService from '@/utils/gobalServices/statelistService';

class companyController implements Controller {
    public path = '/company';
    public router = Router();
    private companyService = new companyService();
    private statesListService = new statesListService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        //Register company api route

        
        this.router.get(
            `${this.path}/stateList`, queryMiddleware, this.fetchStateList
        );

        this.router.get(
            `${this.path}/districtList`, queryMiddleware, this.fetchDistrictList
        );


        this.router.post(
            `${this.path}/create`, upload, validationMiddleware(validate.create), this.registerCompany
        );

        this.router.post(
            `${this.path}/editCompanyAddresss`, authenticatedMiddleware, aclMiddleware, this.updateCompanyAddresss
        );

        this.router.post(
            `${this.path}/addCompanyAddresss`, authenticatedMiddleware, aclMiddleware, this.addCompanyAddresss
        );

        //upload document for company 
        this.router.post(
            `${this.path}/documents`, multiUpload, validationMiddleware(validate.update), queryMiddleware, this.uploadDocs
        );

        //update single company by _id api route
        this.router.patch(
            `${this.path}/update/:companyId`, upload, authenticatedMiddleware, aclMiddleware, validationMiddleware(validate.update), this.updateCompany
        );

        //get single company  api route
        this.router.get(
            `${this.path}/:companyId`, queryMiddleware, this.fetchSingleCompany
        );



        //update company api route
        this.router.get(
            `${this.path}/`, this.fetchAllCompanys
        );

     

        // Delete comapny by _id api route 
        this.router.delete(
            `${this.path}/:companyId`, queryMiddleware, this.deleteCompany
        )

        // Delete doc by _id api route 
        this.router.delete(
            `${this.path}/document/one`, authenticatedMiddleware, queryMiddleware, this.deleteDocument
        )
    

    }

    //Register company api function
    private registerCompany = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("req.body-----------------", req.body);
            console.log("req.file-----------------", req.file);
            let body = req.body
            const company = await this.companyService.create(body, req.file);
            res.status(201).json({ payload: company });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

    //fetchStateList company api function
    private fetchStateList = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try { 
            let {state} = req.query
            const states = await this.statesListService.getStatesList(state);
            res.status(201).json({ payload: states });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

    //fetch district List company api function
    private fetchDistrictList = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try { 
            let {district} = req.query
            const states = await this.statesListService.getDistrictsList(district);
            res.status(201).json({ payload: states });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

    //Update company Address
    private updateCompanyAddresss = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("req.body-----------------", req.body, req.user);
            let body = req.body
            let companyId = req.user.company_id ? req.user.company_id : req.body.company_id
            const company = await this.companyService.updateCompanyAddresss(companyId, body?.id, body?.shippingAddress, body?.billingAddress, body?.address, body?.city, body?.locality, body?.state, body?.pincode);
            res.status(201).json({ payload: company });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

    //Add company Address
    private addCompanyAddresss = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("req.body-----------------", req.body, req.user);
            let body = req.body
            let companyId = req.user.company_id ? req.user.company_id : req.body.company_id
            const company = await this.companyService.addCompanyAddresss(companyId, body?.addShippingAddress, body?.addBillingAddress, body?.address, body?.city, body?.locality, body?.state, body?.pincode);
            res.status(201).json({ payload: company });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

    private uploadDocs = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("req.body-----------------", req.body);
            console.log("req.files-----------------", req.files);
            let body = req.body
            const company = await this.companyService.uploadMultiDocs(body, req.files);
            res.status(201).json({ message: "Documents Upload Succesfully" });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

    private deleteDocument = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            // console.log("req.body-----------------", req.body);
            // console.log("req.files-----------------", req.files);
            console.log("req.query-----------------", req.query);
            let { docId, company_id } = req.query
            // console.log(company_Id, docId);
            // let companyId = req.user?.company_id ? req.user?.company_id : company_Id

            const company = await this.companyService.deleteDoc(docId, company_id);
            res.status(201).json({ message: "Document deleted Succesfully" });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

    //get single company by _id api function
    private fetchSingleCompany = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { companyId } = req.params;

            const singleCompany = await this.companyService.findSingleCompany(companyId);
            res.status(200).json({ payload: singleCompany });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    })

    //get all company list api function
    private fetchAllCompanys = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const companys = await this.companyService.findAllCompany();
            res.status(200).json({ payload: companys });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });


    //update company api function
    private updateCompany = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("updateComapny", req.body, req.user);
            let { companyId } = req.params;
            // if (req.user.company_id) companyId = req.user.company_id
            const updateCompany = await this.companyService.updateCompany(companyId, req.body);
            res.status(200).json({ payload: updateCompany });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });

    // Delete comapny by _id api function 
    private deleteCompany = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { companyId } = req.params;
            const deleteCompany = await this.companyService.deleteCompany(companyId);
            res.status(200).json({ payload: "Company Delete Successfully" });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });


    private addCredit = catchAsync(async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const addCreditRes = await this.companyService.addCredit(req.body);
            res.status(200).json({ payload: addCreditRes});
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });


}

export default companyController;
