import { Router, Response, Request, NextFunction } from "express";
import Controller from "../../utils/interface/controller.interface";
import productServices from "./services";
import { queryMiddleware } from "@/middleware/queryMiddleware";
import { multiUpload, upload } from "@/middleware/multerMiddelware";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import aclMiddleware from "@/middleware/aclMiddleware";
import tableService from "@/utils/gobalServices/table.service";
import mongoose from "mongoose";

class ProductController implements Controller {
  public path = "/product";
  public router = Router();
  private productServices = new productServices();
  private tableService = new tableService();

  constructor() {
    this.initializeRoutes();
  }

  /**
   * Initializes the routes for the product controller.
   */
  private initializeRoutes(): void {
    this.router.post(`${this.path}/allProducts`, this.fetchAllProducts);
    this.router.get(`${this.path}/landingPage`, this.landingPage);
    this.router.post(
      `${this.path}/companyProducts`,
      authenticatedMiddleware,
      aclMiddleware,
      this.fetchAllCompanyProducts
    );
    this.router.post(
      `${this.path}/`,
      multiUpload,
      authenticatedMiddleware,
      aclMiddleware,
      this.registerProduct
    );
    this.router.post(
      `${this.path}/createObkProduct`,
      upload,
      authenticatedMiddleware,
      aclMiddleware,
      this.createObkProduct
    );
    this.router.get(
      `${this.path}/:id`,
      queryMiddleware,
      this.fetchSingleProduct
    );
    this.router.patch(
      `${this.path}/update`,
      queryMiddleware,
      upload,
      this.updateProduct
    );

    this.router.post(
      `${this.path}/addProductImages`,
      upload,

      this.addProductImages
    );

    this.router.delete(
      `${this.path}/:id`,
      queryMiddleware,
      authenticatedMiddleware,
      aclMiddleware,
      this.deleteProduct
    );

    this.router.patch(
      `${this.path}/:id/updateStock`,
      queryMiddleware,
      authenticatedMiddleware,
      aclMiddleware,
      this.updateProductStock
    );
  }

  /**
   * Registers a new product.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with the created product or an error message.
   */
  private registerProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { body, files } = req;
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const product = await this.productServices.createProduct(
        { ...body, userId },
        files
      );
      res.status(201).json({ payload: product });
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  /**
   * Fetches a single product by its ID.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with the fetched product or an error message.
   */
  private fetchSingleProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const product = await this.productServices.fetchSingleProduct(id);
      res.status(200).json({ payload: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Fetches all products with pagination.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with the products and pagination status.
   */
  private fetchAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const page = req.body.page;
      const product = await this.tableService.chooseTable(page, req);
      res.status(200).json({ payload: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Retrieves landing page data.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with landing page data.
   */
  private landingPage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const product = await this.productServices.landingPage();
      res.status(200).json({ payload: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  private updateProductStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      let userId = new mongoose.Types.ObjectId(req.user.id);
      const product = await this.productServices.updateProductStock({
        ...req.body,
        userId,
      });
      res.status(200).json({ payload: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * add product images
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with the updated product.
   */
  private addProductImages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.body;
      const product = await this.productServices.addProductImages(id, req.file);
      res.status(200).json({ payload: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Updates a product.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with the updated product.
   */
  private updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { body, file } = req;
      const { id } = req.query;
      const product = await this.productServices.updateProduct(id, body, file);
      res.status(200).json({ payload: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Deletes a product by its ID.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with the deleted product.
   */
  private deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const product = await this.productServices.deleteProduct(id);
      res.status(200).json({ payload: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Fetches all company products.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with all company products.
   */
  private fetchAllCompanyProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const page = req.body.page;
      const { company_id } = req.user;
      const product = await this.tableService.chooseTable(page, req);
      res.status(200).json({ payload: product });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  /**
   * Creates a new Obk product.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function.
   * @returns JSON response with the created Obk product.
   */
  private createObkProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { body, file } = req;
      const product = await this.productServices.createProduct(body, file);
      res.status(201).json({ payload: product });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };
}

export default ProductController;