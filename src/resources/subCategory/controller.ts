import { Router, Request, Response, NextFunction } from "express";
import Controller from "utils/interface/controller.interface";
import validationMiddelware from "@/middleware/validation.middleware";
import HttpException from "@/utils/http.exception";
import subCategoryService from "./services";
import { queryMiddleware } from "@/middleware/queryMiddleware";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import aclMiddleware from "@/middleware/aclMiddleware";
import { upload } from "@/middleware/multerMiddelware";
import { multerConfig } from "@/middleware/multerMiddelware";

const subCategoryUpload = multerConfig.fields([
  { name: "subCategoryImage", maxCount: 1 },
  { name: "subCategoryBannerImage", maxCount: 1 },
  { name: "subCategoryMobileImage", maxCount: 1 },
]);

class subCategoryController implements Controller {
  public path = "/subCategory";
  public router = Router();
  public subCategoryService = new subCategoryService();

  constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      subCategoryUpload,
      authenticatedMiddleware,
      aclMiddleware,
      queryMiddleware,
      this.register
    );
    this.router.patch(
      `${this.path}/update/:id`,
      subCategoryUpload,
      authenticatedMiddleware,
      aclMiddleware,
      queryMiddleware,
      this.updateSubCategory
    );
    this.router.delete(
      `${this.path}/remove/:id`,
      authenticatedMiddleware,
      aclMiddleware,
      queryMiddleware,
      this.removeSubCategory
    );
    this.router.get(`${this.path}/fetch`, this.fetchAllSubCategory);
    this.router.get(
      `${this.path}/fetchSubCategoryListWithId`,
      this.fetchSubCategoryListWithId
    );
  }

  private register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      console.log("req.body", req.body, req.user);
      const body = req.body;
      const files: any = req.files;
      const subCategoryImage = files?.subCategoryImage?.[0];
      const subCategoryBannerImage = files?.subCategoryBannerImage?.[0];
      const subCategoryMobileImage = files?.subCategoryMobileImage?.[0];
      const file = {
        subCategoryImage,
        subCategoryBannerImage,
        subCategoryMobileImage,
      };

      let user = await this.subCategoryService.create(body, file);
      res.status(201).json({ payload: user });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private updateSubCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const body = req.body;
      const { id } = req.params;
      const files: any = req.files;
      const subCategoryImage = files?.subCategoryImage?.[0];
      const subCategoryBannerImage = files?.subCategoryBannerImage?.[0];
      const subCategoryMobileImage = files?.subCategoryMobileImage?.[0];
      const file = {
        subCategoryImage,
        subCategoryBannerImage,
        subCategoryMobileImage,
      };
      console.log(id);
      console.log(file);

      const user = await this.subCategoryService.update(id, body, file);
      res.status(201).json({ payload: user });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private fetchAllSubCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userData = await this.subCategoryService.fetchAllSubCategory();
      res.status(201).json({ payload: userData });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };
  private fetchSubCategoryList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userData = await this.subCategoryService.fetchSubCategoryList();
      res.status(201).json({ payload: userData });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private removeSubCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const userData = await this.subCategoryService.delete(id);
      res.status(201).json({ payload: userData });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  private fetchSubCategoryListWithId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const id = req.query.id;
      console.log("id------------", id);

      const userData = await this.subCategoryService.fetchSubCategoryWithId(id);
      res.status(201).json({ payload: userData });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };
}

export default subCategoryController;