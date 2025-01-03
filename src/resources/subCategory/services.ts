import subCategoryModel from './model';
import iSubCategory from '@/resources/subCategory/interface';
import HttpException from '@/utils/http.exception';
import awsService from '@/utils/gobalServices/aws.service';

class subCategoryService {
    private subCategoryModel = subCategoryModel;
    private awsService = new awsService();
    public async create(body: iSubCategory | any, file: any): Promise<iSubCategory> {
        try {
          console.log("body", body);
          // let categoryArr = JSON.parse(body?.category)
          console.log("file", file);
          // if (!categoryArr.length) {
          //     throw new HttpException(500, 'please select main category...')
          // }

          // body.subCategory.category = body.subCategory;
          // const obj = {
          //     category : body.subCategory
          // } : any

          if (file.subCategoryImage) {
            body.subCategoryImage = await this.awsService.uploadFileToAWS(
              "subCategoryImage",
              file.subCategoryImage
            );
          }

          if (file.subCategoryBannerImage) {
            body.subCategoryBannerImage = await this.awsService.uploadFileToAWS(
              "subCategoryImage",
              file.subCategoryBannerImage
            );
          }
          if (file.subCategoryMobileImage) {
            body.subCategoryMobileImage = await this.awsService.uploadFileToAWS(
              "subCategoryImage",
              file.subCategoryMobileImage
            );
          }
          const category = await this.subCategoryModel.create({ ...body });
          return category;
        } catch (error: any) {
            console.log(error);
            throw new Error(error);
        }
    }

    public async update(id: any, body: iSubCategory | any, file: any): Promise<iSubCategory | any> {
        try {
            let updateObj = { ...body }
            if (file.subCategoryImage) {
                updateObj.subCategoryImage = await this.awsService.uploadFileToAWS(
                  "subCategoryImage",
                  file.subCategoryImage
                );
              }
    
              if (file.subCategoryBannerImage) {
                updateObj.subCategoryBannerImage = await this.awsService.uploadFileToAWS(
                  "subCategoryImage",
                  file.subCategoryBannerImage
                );
              }
              if (file.subCategoryMobileImage) {
                updateObj.subCategoryMobileImage = await this.awsService.uploadFileToAWS(
                  "subCategoryImage",
                  file.subCategoryMobileImage
                );
              }

            // if (typeof updateObj?.category === 'string') {
            //     let categoryArr = JSON.parse(updateObj?.category)
            //     if (!categoryArr.length) {
            //         delete updateObj.category
            //     }else{
            //         updateObj.category = categoryArr
            //     }
            // }
            console.log("updateObj", updateObj);
            const category = await this.subCategoryModel.findByIdAndUpdate({ _id: id }, { ...updateObj }, { new: true })
            // // console.log(category);

            return category;
        } catch (error) {
            console.error(error);
            throw new Error("Unable to update category");
        }
    }

    public async fetchAllSubCategory(): Promise<iSubCategory | Array<object>> {
        try {
            // companyId to be add
            const user = await this.subCategoryModel.find({});
            return user;
        } catch (error) {
            throw new Error("Unable to fetch all Category");
        }
    }
    // fetch sub category using main category id
    public async fetchAllSubCategoryUsingMainCategory(mainCategory: string): Promise<iSubCategory | Array<object>> {
        try {
            // companyId to be add
            const user = await this.subCategoryModel.find({ category: mainCategory });
            return user;
        } catch (error) {
            throw new Error("Unable to fetch all Category");
        }
    }

    public async fetchSubCategoryList(): Promise<iSubCategory | Array<object>> {
        try {
            // companyId to be add
            const user = await this.subCategoryModel.find({}).select('category')
            return user;
        } catch (error) {
            throw new Error("Unable to fetch all Category");
        }
    }


    public async fetchSubCategoryWithId(id: string | any): Promise<iSubCategory | Array<object>> {
        try {
            // companyId to be add
            // const user = await this.subCategoryModel.find({category : id})
            const user = await this.subCategoryModel.aggregate(
                [
                    {
                        $match: {
                            "category": id
                        }
                    },

                    { "$unwind": "$category" },

                    {
                        $addFields: {
                            convertedId: { $toObjectId: "$category" }
                        }
                    },


                    {
                        "$lookup": {
                            "from": "categorys",
                            "localField": "convertedId",
                            "foreignField": "_id",
                            "as": "categorys"
                        }
                    },
                    { "$unwind": "$categorys" },
                    {
                        "$group": {
                            "_id": "$_id",
                            "categorysObj": { "$push": "$categorys" },
                            "status": { "$first": "$status" },
                            "updatedAt": { "$first": "$updatedAt" },
                            "createdAt": { "$first": "$createdAt" },
                            "subCategory": { "$first": "$subCategory" },
                            "subCategoryImage": { "$first": "$subCategoryImage" },

                        }
                    }
                ]
            )
            return user;
        } catch (error) {
            throw new Error("Unable to fetch all Category");
        }
    }

    public async fetchSingleOrder(orderId: any): Promise<iSubCategory | any> {
        try {
            console.log("orderId-----", orderId);

            const user = await this.subCategoryModel.findOne({ _id: orderId })
            return user;
        } catch (error) {
            console.log(error);
            throw new Error("Unable to fetch order");
        }
    }

    public async delete(id: string): Promise<iSubCategory | any> {
        console.log(id);

        try {
            const user = await this.subCategoryModel.findOneAndDelete({ _id: id })
            return user;
        } catch (error) {
            console.log(error);
            throw new Error("Unable to delete order");
        }
    }
    // change order approval status
    public async changeStatus(orderId: string, status: string, userData: object | any): Promise<iSubCategory | any> {
        try {
            console.log(orderId, userData.id);
            // const {userId} = userData;
            const orderStatus = await this.subCategoryModel.findOneAndUpdate({ _id: orderId, reportingTo: userData.id }, { status: status }, { new: true });
            if (orderStatus)
                return orderStatus;
        } catch (error) {
            throw new Error("Unable to change order status");
        }
    }

    public async changeOrderStatus(obj: object, id: string): Promise<iSubCategory | any> {
        try {
            console.log(obj, id);

            const orderStatus = await this.subCategoryModel.findOneAndUpdate({ _id: id }, { ...obj }, { new: true });
            return orderStatus;
        } catch (error) {
            throw new Error("Unable to change order status");
        }
    }

    public async tableQuery(query: any[], countQuery: any[]): Promise<object> {
        try {
            const queryData = await this.subCategoryModel.aggregate(query);
            const queryCount = await this.subCategoryModel.aggregate(countQuery);
            let count = 0
            if (queryCount[0] && queryCount[0].count) count = (queryCount[0].count);
            return { queryData: queryData, count: count };
        } catch (error) {
            throw error;
        }
    }



}

export default subCategoryService;
