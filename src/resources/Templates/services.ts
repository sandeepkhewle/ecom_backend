import tamplateServiceModel from './model'
import categoryModel from '../category/model'
import iTamplate from './interface';
import HttpException from '../../utils/http.exception';
import awsService from '@/utils/gobalServices/aws.service';
import fs from 'fs';
class tamplateService {
    private tamplateModel = tamplateServiceModel;
    private categoryModel = categoryModel;
    private awsService = new awsService();

    public async create (body: any, file: any, company_id : string): Promise<iTamplate> {
        try {

            if (file) {
                body.productMainImage = await this.awsService.uploadFileToAWS("productsImages", file)
            }
            // await this.categoryModel.findOne({ category: body.productCatogery })
            body.company_id = company_id;
            if(!body.company_id) throw new HttpException(500,"please send company_id")
            if(!body.product_id) throw new HttpException(500,"please send product Id")

            const product = await this.tamplateModel.create({ ...body });
            return product;
        } catch (error) {
            console.error(error);
            throw error
        }
    }

 

       // table company  map template query
       public async tamplatesTableQuery(query: any[], countQuery: any[]): Promise<object> {
        try {
            const queryData = await this.tamplateModel.aggregate(query);
            const queryCount = await this.tamplateModel.aggregate(countQuery);
            console.log(queryData);

            let count = 0;
            if (queryCount[0] && queryCount[0].count) count = queryCount[0].count;
            return { queryData: queryData, count: count };
        } catch (error) {
            throw error;
        }
    }

       // find one template an return
       public async findOneTemplate(id: any): Promise<iTamplate | null> {
        try {
           const template = await this.tamplateModel.findById(id)
            return template
        } catch (error) {
            throw error;
        }
    }


       // save tool configuration
       public async updateToolTamplate(body: any, file: any): Promise<iTamplate | any> {
        try {
            if (file) {
                body.productMainImage = await this.awsService.uploadFileToAWS("productsImages", file)
            }
            const product = await this.tamplateModel.findByIdAndUpdate({ _id: body.tamplateId }, { ...body });
            console.log(product);

            return product;
        } catch (error) {
            console.error(error);
            throw error
        }
    }
}

export default tamplateService;