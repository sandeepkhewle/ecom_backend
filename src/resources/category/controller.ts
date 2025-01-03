import { Router, Request, Response, NextFunction } from "express";
import Controller from "utils/interface/controller.interface";
import HttpException from "@/utils/http.exception";
import categoryService from "./services";
import { queryMiddleware } from "@/middleware/queryMiddleware";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import aclMiddleware from "@/middleware/aclMiddleware";
import { multerConfig } from "@/middleware/multerMiddelware";

const categoryUpload = multerConfig.fields([
  { name: "categoryImage", maxCount: 1 },
  { name: "categoryBannerImage", maxCount: 1 },
  { name: "categoryBannerMobileImage", maxCount: 1 },
]);

/**
 * Controller class for handling category-related operations.
 */
class CategoryController implements Controller {
  public path = "/category";
  public router = Router();
  public categoryService = new categoryService();

  constructor() {
    this.initRoutes();
  }

  /**
   * Initializes routes for category operations.
   */
  private initRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      categoryUpload,
      authenticatedMiddleware,
      aclMiddleware,
      queryMiddleware,
      this.register
    );
    this.router.patch(
      `${this.path}/update/:id`,
      categoryUpload,
      authenticatedMiddleware,
      aclMiddleware,
      queryMiddleware,
      this.updateCategory
    );
    this.router.delete(
      `${this.path}/remove/:id`,
      authenticatedMiddleware,
      aclMiddleware,
      queryMiddleware,
      this.removeCategory
    );
    this.router.get(`${this.path}/fetch`, this.fetchAllCategory);
    this.router.get(`${this.path}/fetchCategoryList`, this.fetchCategoryList);
  }

  /**
   * Registers a new category.
   * @param req - The request object containing category details.
   * @param res - The response object to send the result.
   * @param next - The next middleware function.
   * @returns A response with the created category.
   */
  private register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.files);
      const body = req.body;
      const files: any = req.files;
      const categoryImage = files?.categoryImage?.[0];
      const categoryBannerImage = files?.categoryBannerImage?.[0];
      const categoryBannerMobileImage = files?.categoryBannerMobileImage?.[0];
      const file = {
        categoryImage,
        categoryBannerImage,
        categoryBannerMobileImage,
      };
      const category = await this.categoryService.create(body, file);
      res.status(200).json({ payload: category });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * Updates an existing category.
   * @param req - The request object containing category details and ID.
   * @param res - The response object to send the result.
   * @param next - The next middleware function.
   * @returns A response with the updated category.
   */
  private updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const body = req.body;
      const { id } = req.params;
      const files: any = req.files;
      const categoryImage = files?.categoryImage?.[0];
      const categoryBannerImage = files?.categoryBannerImage?.[0];
      const categoryBannerMobileImage = files?.categoryBannerMobileImage?.[0];
      const file = {
        categoryImage,
        categoryBannerImage,
        categoryBannerMobileImage,
      };
      console.log("Category ID:", id);
      console.log("Uploaded file:", file);
      console.log("Request body:", body);
      const updatedCategory = await this.categoryService.update(id, body, file);
      res.status(200).json({ payload: updatedCategory });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * Fetches all categories.
   * @param req - The request object.
   * @param res - The response object to send the result.
   * @param next - The next middleware function.
   * @returns A response with all categories.
   */
  private fetchAllCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const categories = await this.categoryService.fetchAllCategory();
      res.status(200).json({ payload: categories });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * Fetches a list of categories.
   * @param req - The request object.
   * @param res - The response object to send the result.
   * @param next - The next middleware function.
   * @returns A response with the category list.
   */
  private fetchCategoryList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const categoryList = await this.categoryService.fetchCategoryList();
      res.status(200).json({ payload: categoryList });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * Removes a category.
   * @param req - The request object containing category ID.
   * @param res - The response object to send the result.
   * @param next - The next middleware function.
   * @returns A response confirming the removal of the category.
   */
  private removeCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const result = await this.categoryService.delete(id);
      res.status(200).json({ payload: result });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };
}

export default CategoryController;
