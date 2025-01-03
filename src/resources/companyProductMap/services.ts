// import companyProductMapServicesModel from './model'
// import categoryModel from '../category/model'
// import iProduct from './interface';
// import HttpException from '../../utils/http.exception';
// import awsService from '@/utils/gobalServices/aws.service';
// import fs from 'fs';
// class companyProductMapServices {
//     private product = companyProductMapServicesModel;
//     private categoryModel = categoryModel;
//     private awsService = new awsService();

//     public async createProduct(body: any, file: any, company_id : string): Promise<iProduct> {
//         try {

//             if (file) {
//                 body.productMainImage = await this.awsService.uploadFileToAWS("productsImages", file)
//             }
//             // await this.categoryModel.findOne({ category: body.productCatogery })
//             body.company_id = company_id;
//             if(!body.product_id) throw new HttpException(400,"please send product Id")
//             const product = await this.product.create({ ...body });
//             return product;
//         } catch (error) {
//             console.error(error);
//             throw new HttpException(400, "Unable to create product");
//         }
//     }
//     // public async fetchSingleProduct(id: string): Promise<iProduct | any> {
//     //     try {
//     //         const product = await this.product.findById(id);
//     //         return product;
//     //     } catch (error) {
//     //         console.error(error);
//     //         throw new HttpException(401, "Unable to find  product");
//     //     }
//     // }

//     // public async fetchAllProducts(catogeryId: any): Promise<iProduct | any> {
//     //     try {

//     //         const product = await this.product.find({ category: catogeryId ? catogeryId : null, company_id: { $exists: false } }).populate('category')
//     //         return product;
//     //     } catch (error) {
//     //         console.error(error);
//     //         throw new HttpException(401, "Unable to find  products ");
//     //     }
//     // }
//     public async fetchAllCompanyProducts(company_id: string): Promise<iProduct | any> {
//         try {
//             const product = await this.product.find({ company_id: company_id});

//             return product;
//         } catch (error) {
//             console.error(error);
//             throw new HttpException(401, "Unable to find company products ");
//         }
//     }
//     // edit product
//     public async updateProduct(id: any, body: any, file: any): Promise<iProduct | any> {
//         try {
//             // console.log("id", id);
//             // console.log("body", body);

//             if (file) {
//                 console.log(file);
//                 body.productMainImage = await this.awsService.uploadFileToAWS("productsImages", file)
//             }
//             const featchCategory = await this.categoryModel.findOne({ category: body.productCatogery })
//             body.category = featchCategory?._id;
//             const product = await this.product.findByIdAndUpdate({ _id: id }, { ...body }, { new: true });
//             console.log(product);

//             return product;
//         } catch (error) {
//             console.error(error);
//             throw new HttpException(401, "Unable to update  products ");
//         }
//     }
//     // save tool configuration
//     public async updateToolProduct(id: string | any, body:  any, file: any , company_id : string): Promise<iProduct | any> {
//         try {
//             // console.log("id", id);
//             // console.log("body", body);

//             if (file) {
//                 console.log(file);
//                 body.productMainImage = await this.awsService.uploadFileToAWS("productsImages", file)
//             }
//             const product = await this.product.findByIdAndUpdate({ product_id : id , company_id : company_id  }, { configuration: body },{new : true});
//             console.log(product);

//             return product;
//         } catch (error) {
//             console.error(error);
//             throw new HttpException(401, "Unable to update  products ");
//         }
//     }
//     public async addImgInTool(body: any, file: any): Promise<iProduct | any> {
//         try {
//             console.log("id", body.productId);
//             // console.log("body", body);

//             if (file) {
//                 console.log(file);
//                 body.productToolImage = await this.awsService.uploadFileToAWS("productsToolImages", file)
//             }
//             console.log(body);

//             const product = await this.product.findOneAndUpdate({ _id: body.productId }, { $push: { assets: body } });
//             console.log(product);

//             return product;
//         } catch (error) {
//             console.error(error);
//             throw new HttpException(401, "Unable to update  products ");
//         }
//     }
//     public async FetachImgInTool(id: any): Promise<iProduct | any> {
//         try {
//             console.log("id", id);


//             const assets = await this.product.findById({ _id: id }).select('assets')
//             console.log(assets);

//             return assets;
//         } catch (error) {
//             console.error(error);
//             throw new HttpException(401, "Unable to featch  assets ");
//         }
//     }

//     public async deleteProduct(id: string): Promise<iProduct | any> {
//         try {
//             const product = await this.product.findByIdAndDelete({ _id: id });
//             return product;
//         } catch (error) {
//             console.error(error);
//             throw new HttpException(401, "Unable to delete  products ");
//         }
//     }

//     public async singleProductForTool(id: string): Promise<iProduct | any> {
//         try {
//             const product = await this.product.findById(id);
//             return product;
//         } catch (error) {
//             console.error(error);
//             throw new HttpException(401, "Unable to find  product for tool");
//         }
//     }
// }

// export default companyProductMapServices;