import { Router, Response, Request } from "express";
import { NextFunction } from "express-serve-static-core";
import Controller from "../../utils/interface/controller.interface";
import tamplateServices from "./services";
import { queryMiddleware } from "@/middleware/queryMiddleware";
import { upload } from "@/middleware/multerMiddelware";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import aclMiddleware from "@/middleware/aclMiddleware";


class tamplateController implements Controller {
    public path = '/tamplate';
    public router = Router();
    private tamplateServices = new tamplateServices();

    constructor() {
        this.initialiseRoutes();
    }
    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}/create`, authenticatedMiddleware, aclMiddleware, this.registerTamplate
        );
        this.router.patch(
            `${this.path}/update`, upload, authenticatedMiddleware, aclMiddleware, this.updateTamplate
        );
  
        
    }

    private registerTamplate = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
    try {
        const body = req.body;
        const file = req?.file;
        const user = req?.user;
        console.log('file',user,file,body);

        const product = await this.tamplateServices.create(body, file ,user.company_id);
        res.status(201).json({
            payload: product
        })
    } catch (error) {
        res.status(500).send(error)
    }
    }
    private updateTamplate = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
      try {
        const body = req.body;
        const file = req?.file;
        const user = req?.user;
        console.log('file');

        const product = await this.tamplateServices.updateToolTamplate(body, file);
        res.status(201).json({
            payload: product
        })
      } catch (error) {
        res.status(500).send(error)
      }
    }
    
}

export default tamplateController