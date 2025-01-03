import categoryModel from "./model";
import iCategory from "@/resources/category/interface";
import HttpException from "@/utils/http.exception";
import awsService from "@/utils/gobalServices/aws.service";
import mongoose from "mongoose";

/**
 * Service class for handling category-related operations.
 */
class CategoryService {
  private categoryModel = categoryModel;
  private awsService = new awsService();

  /**
   * Creates a new category.
   * @param body - The category details.
   * @param file - The image file for the category.
   * @returns The created category.
   */
  public async create(body: iCategory | any, file: any): Promise<iCategory> {
    try {
      // Upload category image if provided
      if (file.categoryImage) {
        body.categoryImage = await this.awsService.uploadFileToAWS(
          "categoryImages",
          file.categoryImage
        );
      }

      if (file.categoryBannerImage) {
        body.categoryBannerImage = await this.awsService.uploadFileToAWS(
          "categoryImages",
          file.categoryBannerImage
        );
      }

      if (file.categoryBannerMobileImage) {
        body.categoryBannerMobileImage = await this.awsService.uploadFileToAWS(
          "categoryImages",
          file.categoryBannerMobileImage
        );
      }

      if (body?.subCategories?.length > 0) {
        body.subCategories = JSON.parse(body.subCategories).map(
          (subCat: any) => new mongoose.Types.ObjectId(subCat)
        );
      }
      // Create and return the new category
      const category = await this.categoryModel.create({ ...body });
      return category;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw new Error("Unable to create category");
    }
  }

  /**
   * Updates an existing category.
   * @param id - The ID of the category to update.
   * @param body - The updated category details.
   * @param file - The new image file for the category (if any).
   * @returns The updated category.
   */
  public async update(
    id: any,
    body: iCategory | any,
    file: any
  ): Promise<iCategory | any> {
    try {
      let updateObj = { ...body };
      // Upload new category image if provided
      if (file.categoryImage) {
        updateObj.categoryImage = await this.awsService.uploadFileToAWS(
          "categoryImages",
          file.categoryImage
        );
      }

      if (file.categoryBannerImage) {
        updateObj.categoryBannerImage = await this.awsService.uploadFileToAWS(
          "categoryImages",
          file.categoryBannerImage
        );
      }

      if (file.categoryBannerMobileImage) {
        updateObj.categoryBannerMobileImage = await this.awsService.uploadFileToAWS(
          "categoryImages",
          file.categoryBannerMobileImage

        )
      }
      // Update and return the category
      console.log({ updateObj });

      if (body?.subCategories?.length > 0) {
        updateObj.subCategories = JSON.parse(updateObj.subCategories).map(
          (subCat: any) => new mongoose.Types.ObjectId(subCat)
        );
      }

      const category = await this.categoryModel.findByIdAndUpdate(
        { _id: id },
        { ...updateObj },
        { new: true }
      );
      return category;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Unable to update category");
    }
  }

  /**
   * Fetches all categories.
   * @returns An array of all categories.
   */
  public async fetchAllCategory(): Promise<iCategory | Array<object>> {
    try {
      // const categories = await this.categoryModel.find({});
      const categories = await this.categoryModel.find({}).populate('subCategories')
      return categories;
    } catch (error) {
      throw new Error("Unable to fetch all categories");
    }
  }

  /**
   * Fetches a list of category names.
   * @returns An array of categories with only the 'category' field.
   */
  public async fetchCategoryList(): Promise<iCategory | Array<object>> {
    try {
      const categoryList = await this.categoryModel.find({}).select("category");
      return categoryList;
    } catch (error) {
      throw new Error("Unable to fetch category list");
    }
  }

  /**
   * Fetches a single category by ID.
   * @param orderId - The ID of the category to fetch.
   * @returns The requested category.
   */
  public async fetchSingleOrder(orderId: any): Promise<iCategory | any> {
    try {
      const category = await this.categoryModel.findOne({ _id: orderId });
      return category;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw new Error("Unable to fetch category");
    }
  }

  /**
   * Deletes a category by ID.
   * @param id - The ID of the category to delete.
   * @returns The deleted category.
   */
  public async delete(id: string): Promise<iCategory | any> {
    try {
      const deletedCategory = await this.categoryModel.findOneAndDelete({
        _id: id,
      });
      return deletedCategory;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error("Unable to delete category");
    }
  }

  /**
   * Changes the status of an order.
   * @param orderId - The ID of the order.
   * @param status - The new status to set.
   * @param userData - The user data to verify the update.
   * @returns The updated order status.
   */
  public async changeStatus(
    orderId: string,
    status: string,
    userData: object | any
  ): Promise<iCategory | any> {
    try {
      const updatedStatus = await this.categoryModel.findOneAndUpdate(
        { _id: orderId, reportingTo: userData.id },
        { status: status },
        { new: true }
      );
      return updatedStatus;
    } catch (error) {
      throw new Error("Unable to change order status");
    }
  }

  /**
   * Updates an order's status based on provided data.
   * @param obj - The status update data.
   * @param id - The ID of the order to update.
   * @returns The updated order.
   */
  public async changeOrderStatus(
    obj: object,
    id: string
  ): Promise<iCategory | any> {
    try {
      const updatedOrder = await this.categoryModel.findOneAndUpdate(
        { _id: id },
        { ...obj },
        { new: true }
      );
      return updatedOrder;
    } catch (error) {
      throw new Error("Unable to change order status");
    }
  }

  /**
   * Executes a table query and returns data and count.
   * @param query - The aggregation pipeline query.
   * @param countQuery - The aggregation pipeline query for counting.
   * @returns An object containing query data and count.
   */
  public async tableQuery(query: any[], countQuery: any[]): Promise<object> {
    try {
      const queryData = await this.categoryModel.aggregate(query);
      const queryCount = await this.categoryModel.aggregate(countQuery);
      let count = 0;
      if (queryCount[0] && queryCount[0].count) {
        count = queryCount[0].count;
      }
      return { queryData: queryData, count: count };
    } catch (error) {
      throw new Error("Error executing table query");
    }
  }

  public async cateogorySales(): Promise<object> {
    try {
        return this.categoryModel.aggregate(
          [
            {
              $lookup: {
                from: 'orders',
                localField: "_id",
                foreignField: "itemList.productCatogryId",
                as: "result"
              }
            }
          ]
        )
    } catch (error) {
      throw new Error("Error executing table query");
    }
  }
}

export default CategoryService;
