// import { Router, Response, Request } from "express";
// import { NextFunction } from "express-serve-static-core";
// import Controller from "../../utils/interface/controller.interface";
// import companyProductMapServices from "./services";
// import { queryMiddleware } from "@/middleware/queryMiddleware";
// import { upload } from "@/middleware/multerMiddelware";
// import authenticatedMiddleware from "@/middleware/authenticated.middleware";
// import aclMiddleware from "@/middleware/aclMiddleware";


// class companyProductMap implements Controller {
//     public path = '/companyProductMap';
//     public router = Router();
//     private companyProductMapServices = new companyProductMapServices();

//     constructor() {
//         this.initialiseRoutes();
//     }
//     private initialiseRoutes(): void {
//         this.router.get(
//             `${this.path}/all/:id`, authenticatedMiddleware, aclMiddleware, this.fetchAllCompanyProducts
//         );
//         this.router.post(
//             `${this.path}/`, upload, authenticatedMiddleware, aclMiddleware, this.registerProduct
//         );
//         // this.router.get(
//         //     `${this.path}/:id`, queryMiddleware, authenticatedMiddleware, aclMiddleware, this.fetchSingleProduct
//         // );
//         this.router.get(
//             `${this.path}/fetchToolProduct/:id`, queryMiddleware, this.singleProductForTool
//         );
//         this.router.patch(
//             `${this.path}/update`, queryMiddleware, upload, this.updateProduct
//         );
//         this.router.patch(
//             `${this.path}/updateToolProduct`, queryMiddleware, upload, this.updateToolProduct
//         );
//         this.router.post(
//             `${this.path}/addImgTool`, queryMiddleware, upload, this.addImgTool
//         );
//         this.router.get(
//             `${this.path}/featchAssets/:id`, queryMiddleware, this.featchImgTool
//         );
//         this.router.delete(
//             `${this.path}/:id`, queryMiddleware, authenticatedMiddleware, aclMiddleware, this.deleteProduct
//         );
        
//     }

//     private registerProduct = async (
//         req: Request,
//         res: Response,
//         next: NextFunction
//     ): Promise<Response | void> => {
//         const body = req.body;
//         const file = req?.file;
//         const user = req?.user;
//         console.log('file');

//         const product = await this.companyProductMapServices.createProduct(body, file ,user.company_id);
//         res.status(201).json({
//             payload: product
//         })
//     }
//     // private fetchSingleProduct = async (
//     //     req: Request,
//     //     res: Response,
//     //     next: NextFunction
//     // ): Promise<Response | void> => {
//     //     const { id } = req.params
//     //     const product = await this.companyProductMapServices.fetchSingleProduct(id)
//     //     res.status(201).json({
//     //         payload: product
//     //     })
//     // }
//     // private fetchAllProducts = async (
//     //     req: Request,
//     //     res: Response,
//     //     next: NextFunction
//     // ): Promise<Response | void> => {
//     //     const {catogeryId} = req.query;
//     //     console.log(catogeryId);
        
//     //     const product = await this.companyProductMapServices.fetchAllProducts(catogeryId)
//     //     res.status(201).json({
//     //         payload: product,
//     //         status : 201
//     //     })
//     // }
//     private fetchAllCompanyProducts = async (
//         req: Request,
//         res: Response,
//         next: NextFunction
//         ): Promise<Response | void> => {
//         const {catogeryId} = req.query;
//         // const { id } = req.params;
//         const { company_id  } = req.user;
//         console.log("companyId", company_id);

//         const product = await this.companyProductMapServices.fetchAllCompanyProducts(company_id)
//         res.status(201).json({
//             payload: product
//         })
//     }
//     private updateProduct = async (
//         req: Request,
//         res: Response,
//         next: NextFunction
//     ): Promise<Response | void> => {
//         const body = req.body;
//         const { id } = req.query;
//         const file = req?.file;
//         const product = await this.companyProductMapServices.updateProduct(id, body, file);
//         res.status(201).json({
//             payload: product
//         })
//     }
//     private updateToolProduct = async (
//         req: Request,
//         res: Response,
//         next: NextFunction
//     ): Promise<Response | void> => {
//         const body = req.body;
//         const company_id = req.body.company_id;
//         const { id } = req.query;
//         const file = req?.file;
//         const product = await this.companyProductMapServices.updateToolProduct(id, body, file ,company_id);
//         res.status(201).json({
//             payload: product
//         })
//     }
//     private addImgTool = async (
//         req: Request,
//         res: Response,
//         next: NextFunction
//     ): Promise<Response | void> => {
//         const body = req.body;
//         const file = req?.file;
//         const product = await this.companyProductMapServices.addImgInTool( body, file);
//         res.status(201).json({
//             payload: product
//         })
//     }
//     private featchImgTool = async (
//         req: Request,
//         res: Response,
//         next: NextFunction
//     ): Promise<Response | void> => {
//        const {id} = req.params
//         const product = await this.companyProductMapServices.FetachImgInTool( id);
//         res.status(201).json({
//             payload: product
//         })
//     }

//     private deleteProduct = async (
//         req: Request,
//         res: Response,
//         next: NextFunction
//     ): Promise<Response | void> => {
//         const { id } = req.params;
//         const product = await this.companyProductMapServices.deleteProduct(id);
//         res.status(201).json({
//             payload: product
//         })
//     }

//     private singleProductForTool = async (
//         req: Request,
//         res: Response,
//         next: NextFunction
//     ): Promise<Response | void> => {
//         try {
//             const { id } = req.params;
//             if(!id) throw new Error('id required')
//             const product = await this.companyProductMapServices.singleProductForTool(id);
//             res.status(201).json({
//                 payload: product
//             })
//         } catch (error) {
//             res.status(401).json({
//                 status : 401,
//                 error : error
//             })
//         }
    
//     }
// }

// export default companyProductMap;