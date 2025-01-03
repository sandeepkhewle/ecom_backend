import productModel from "./model";
import companyProductMapModel from "../companyProductMap/model";
import companyProductAssetsMap from "../companyProAssestMap/model";
import categoryModel from "../category/model";
import iProduct from "./interface";
import HttpException from "../../utils/http.exception";
import awsService from "../../utils/gobalServices/aws.service";
import templateService from "../../resources/Templates/services";
import mongoose, { ObjectId } from "mongoose";
import { file } from "pdfkit";
import { validateParams } from "@/utils/helpers";
import iStockHistory from "../stockHistory/interface";
import { error } from "console";

/**
 * Service class for managing products.
 */
class ProductServices {
  private product = productModel;
  private categoryModel = categoryModel;
  private companyProductMapModel = companyProductMapModel;
  private companyProductAssetsMap = companyProductAssetsMap;
  private awsService = new awsService();
  private templateService = new templateService();

  /**
   * Create a new product.
   * @param body - Product details.
   * @param files - Image files for the product.
   * @returns Created product.
   */
  public async createProduct(body: any, files: any): Promise<iProduct> {
    try {
      // Parse subCategorys if it is a string.
      if (typeof body.subCategories === "string") {
        body.subCategories = JSON.parse(body.subCategories);
      }

      // Upload product main image if provided.
      if (files) {
        const uploadPromises = [];
        for (const file of files) {
          uploadPromises.push(
            this.awsService.uploadFileToAWS("uploads", file)
          );
        }
        const [productMainImage, ...additonalImages] = await Promise.all(
          uploadPromises
        );
        body.productMainImage = productMainImage;
        body.productImages = [productMainImage].concat(additonalImages);
      }

      // Fetch category ID from the category model.
      const fetchedCategory = await this.categoryModel.findOne({
        category: body.productCatogery,
      });
      body.category = fetchedCategory?._id;
      body.productCategory = fetchedCategory?.category;

      // Parse subCategorys if it is a string.
      if (body?.subCategories?.length > 0) {
        body.subCategories = body.subCategories.map(
          (subCat: any) => new mongoose.Types.ObjectId(subCat)
        );
      }

      // Create and return the new product.
      const product = await this.product.createWithStock(body);
      if (!product) throw new Error("Unable to create product.");

      return product;
    } catch (error: any) {
      throw new HttpException(400, error.message);
    }
  }

  /**
   * Fetch a single product by ID.
   * @param id - Product ID.
   * @returns Product with the given ID.
   */
  public async fetchSingleProduct(id: string): Promise<iProduct | null> {
    try {
      return await this.product.findById(id).populate("category");
    } catch (error) {
      throw new HttpException(401, "Unable to find product.");
    }
  }

  /**
   * Fetch all products for a given category.
   * @param categoryId - Category ID.
   * @returns List of products for the specified category.
   */
  public async fetchAllProducts(
    categoryId: string | null
  ): Promise<iProduct[]> {
    try {
      return await this.product
        .find({
          category: categoryId || null,
          company_id: { $exists: false },
        })
        .populate("category");
    } catch (error) {
      throw new HttpException(401, "Unable to find products.");
    }
  }

  /**
   * Fetch all products for the landing page.
   * @returns List of all products.
   */
  public async landingPage(): Promise<iProduct[]> {
    try {
      return await this.product.find({}).populate("category");
    } catch (error) {
      throw new HttpException(401, "Unable to find products.");
    }
  }

  public async addProductImages(productId: string, file: any) {
    try {
      const product = await this.product.findById(productId);
      const productImage: any = await this.awsService.uploadFileToAWS(
        "productsImages",
        file
      );
      if (!product) throw new HttpException(400, "Unable to find products.");
      product.productImages.push(productImage);
      return product.save();
    } catch (error) {
      throw new HttpException(401, "Unable to find products.");
    }
  }

  /**
   * Update an existing product.
   * @param id - Product ID.
   * @param body - Product details to update.
   * @param file - New image file for the product.
   * @returns Updated product.
   */
  public async updateProduct(
    id: any,
    body: any,
    file: any
  ): Promise<iProduct | null> {
    try {
      let configuration;

      // Parse configuration if it is a string.
      if (typeof body.configuration === "string") {
        configuration = JSON.parse(body.configuration);
      }

      // Upload new product main image if provided.
      if (file) {
        body.productMainImage = await this.awsService.uploadFileToAWS(
          "productsImages",
          file
        );
        // put this image at yhe top of the list

        const product: any = await this.product.findById(id);
        //remove first image from list
        body.productImages = [body.productMainImage].concat(
          product.productImages.slice(1)
        );
      }

      // Fetch category ID from the category model.
      const fetchedCategory = await this.categoryModel.findOne({
        category: body.productCatogery,
      });
      body.category = fetchedCategory?._id;

      // Parse subCategorys if it is a string.
      if (body?.subCategories?.length > 0) {
        body.subCategories = body.subCategories.map(
          (subCat: any) => new mongoose.Types.ObjectId(subCat)
        );
      }

      // Update and return the product.
      return await this.product.findByIdAndUpdate(
        id,
        { ...body, configuration },
        { new: true }
      );
    } catch (error) {
      throw new HttpException(401, "Unable to update product.");
    }
  }

  /**
   * Delete a product by ID.
   * @param id - Product ID.
   * @returns Deletion confirmation.
   */
  public async deleteProduct(id: string): Promise<any> {
    try {
      // Delete product and related mappings.
      const deletedProduct = await this.product.findByIdAndDelete(id);
      if (!deletedProduct) {
        throw new HttpException(404, "Product not found.");
      }

      return { message: "Product deleted successfully." };
    } catch (error) {
      throw new HttpException(401, "Unable to delete product.");
    }
  }

  /**
   * Fetch product data and count based on aggregation queries.
   * @param query - The aggregation query to fetch product data.
   * @param countQuery - The aggregation query to count the total records.
   * @returns An object containing product data and the total count of records.
   */
  public async tableQuery(query: any[], countQuery: any[]): Promise<object> {
    try {
      const [queryData, queryCount] = await Promise.all([
        this.product.aggregate(query),
        this.product.aggregate(countQuery),
      ]);

      let count = 0;

      // Check if count query results contain a valid count
      if (queryCount[0] && queryCount[0].count) {
        count = queryCount[0].count;
      }

      return { queryData, count };
    } catch (error: any) {
      console.error("Error fetching product data:", error);
      throw new Error("Failed to fetch product data");
    }
  }

  /**
   * update product stock
   * @param id - Product ID.
   * @param varientType - Product varient type.
   * @param quantity - Product quantity.
   * @param note - why upadtae.
   * @param opration - opration type
   * @returns Updated product.
   */

  public async updateProductStock(params: iStockHistory): Promise<any> {
    try {
      validateParams(params, ["productId", "quantity", "type", "userId"]);
      const product = await this.product.updateStock(params);
      if (!product) {
        throw new Error("Unable to update product");
      }
      return product;
    } catch (error: any) {
      throw new HttpException(400, error?.message || "Unable to update product.");
    }
  }


  public async getProductsStocks():Promise<any>{
    try {
      return await this.product.find({}).select(['productName','stock']);
      
    } catch (error) {
      console.log(error);
      
    }
  }

  public async lowStockProducts():Promise<any>{
    try {
      return await this.product.find({stock :{ $lte: 1000 }}).select(['productName','stock']);
      
    } catch (error) {
      console.log(error);
      
    }
  }
}

export default ProductServices;
