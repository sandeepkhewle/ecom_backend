import paymentSysteamModel from './model';

import awsService from '@/utils/gobalServices/aws.service';
import { IceServer } from 'aws-sdk/clients/kinesisvideosignalingchannels';
import HttpException from '@/utils/http.exception';
import orderService from '../order/service';
import companyService from '../company/service';

class paymentSystemService {
    private paymentSysteamModel = paymentSysteamModel;
    private orderService = new orderService();
    private companyService = new companyService();


    public addCreditStatement = async (body: any): Promise<any> => {

        try {
            let newCredit:any  = {};
                newCredit = await this.companyService.addCredit({ company_id: body.company_id, credit: body?.credit , creditType : body.creditType})
                console.log("newCredit", newCredit);
                
                body.newCredit = newCredit._doc.credit.creditLimit;
                body.prevCredit = newCredit.prevCredit;
                console.log("body--------", body);
            if (newCredit === null) {
                throw new HttpException(500, 'credit not assign')
            } else {
                return await this.paymentSysteamModel.create(body);
            }

        } catch (error) {
            throw error
        }

    }

    // public showCreditStatement = async (company_id: string | any): Promise<any> => {

    //     try {
    //         return await this.paymentSysteamModel.findById({ company_id: company_id })

    //     } catch (error) {
    //         throw error
    //     }

    // }

    public async showCreditStatementQuery(query: any[], countQuery: any[]): Promise<object> {
        try {
            const queryData = await this.paymentSysteamModel.aggregate(query);
            const queryCount = await this.paymentSysteamModel.aggregate(countQuery);
            console.log(queryData);

            let count = 0;
            if (queryCount[0] && queryCount[0].count) count = queryCount[0].count;
            return { queryData: queryData, count: count };
        } catch (error) {
            throw error;
        }
    }

    public addPaymentStatement = async (body:any): Promise<any> => {
        try {
            await this.companyService.addPayment(body);
            return await this.paymentSysteamModel.create(body);

        } catch (error) {
            throw error
        }

    }
    
    // public checkCredit = async (company_id: any): Promise<any> => {

    //     try {
    //         return await this.paymentSysteamModel.findById({ _id: company_id }).select('credit')

    //     } catch (error) {
    //         return error
    //     }

    // }

    // public deductCredit = async (body: any): Promise<any> => {

    //     try {
    //         const company: any = await this.paymentSysteamModel.findById({ _id: body.company_id });
    //         if (!company) {
    //             throw new HttpException(500, 'company not exist')
    //         }

    //         if (company.credit < body.credit) {
    //             throw new HttpException(500, 'your credit is not enough for this order')
    //         }
    //         const newCredit = Number(company.credit) - Number(body.credit)
    //         const updatedCredit = await this.paymentSysteamModel.findByIdAndUpdate({ _id: body.company_id }, { credit: newCredit }, { new: true });
    //         return updatedCredit
    //     } catch (error) {
    //         return error
    //     }

    // }


    // public showCredit = async (company_id: any): Promise<any> => {

    //     try {
    //         const company: any = await this.paymentSysteamModel.findById({ _id: company_id });

    //         let creditDetails :any = await  this.orderService.CreditCounter(company_id);

    //         let availableCredit : any = (Number(company.credit) - Number(creditDetails.usedCredit)).toFixed(2);
    //         return {  totalCredit  : company.credit , availableCredit  , pendingOrdersCredit :  creditDetails.creditPending} 
    //     } catch (error) {
    //         return error
    //     }

    // }


    // public addCreditFun = async (company_id: any , credit : any): Promise<any> => {

    //     try {
    //         const company: any = await this.paymentSysteamModel.findById({ _id: company_id });

    //         let creditDetails :any = await  this.companyService.addCredit(company_id,credit);

    //         let availableCredit : any = (Number(company.credit) - Number(creditDetails.usedCredit)).toFixed(2);
    //         return {  totalCredit  : company.credit , availableCredit  , pendingOrdersCredit :  creditDetails.creditPending} 
    //     } catch (error) {
    //         return error
    //     }

    // }


}

export default paymentSystemService;
