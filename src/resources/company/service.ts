import companyModel from './model';
import iCompany from './interface';
import catchAsync from '../../utils/catchAsync';
import token from '../../utils/token';
import awsService from '../../utils/gobalServices/aws.service';
import { IceServer } from 'aws-sdk/clients/kinesisvideosignalingchannels';
import HttpException from '../../utils/http.exception';
import orderService from '../order/service';

class companyService {
    private company = companyModel;
    private awsService = new awsService();
    private orderService = new orderService();

    //Create a new company
    public async create(body: any, file: any): Promise<iCompany> {
        try {
            let createObj: any = {
                name: body?.name,
                emailId: body?.emailId,
                phoneNo: body?.phoneNo,
                website: body?.website,
                gstNumber: body?.gstNumber,
                panNumber: body?.panNumber,
                roles: body?.roles,
                companyAddress: {
                    address: "",
                    district: "",
                    taluka: "",
                    state: "",
                    pincode: "",
                },
                defaultBillingAddress: {
                    address: "",
                    district: "",
                    taluka: "",
                    state: "",
                    pincode: "",
                },
                shippingAddress: [{
                    address: "",
                    district: "",
                    taluka: "",
                    state: "",
                    pincode: "",
                }],
                billingAddress: [{
                    address: "",
                    district: "",
                    taluka: "",
                    state: "",
                    pincode: "",
                }]
            };
            if (file) {
                createObj.companyLogo = await this.awsService.uploadFileToAWS("companyLogos", file)
            }
            if (body.address) {
                createObj.companyAddress.address = body.address
                createObj.defaultBillingAddress.address = body.address
            }
            if (body.district) {
                createObj.companyAddress.district = body.district
                createObj.defaultBillingAddress.district = body.district
            }
            if (body.taluka) {
                createObj.companyAddress.taluka = body.taluka
                createObj.defaultBillingAddress.taluka = body.taluka
            }
            if (body.state) {
                createObj.companyAddress.state = body.state
                createObj.defaultBillingAddress.state = body.state
            }
            if (body.pincode) {
                createObj.companyAddress.pincode = body.pincode
                createObj.defaultBillingAddress.pincode = body.pincode
            }

            //push shipping address to shippingAddress.  
            if (createObj.companyAddress) {
                createObj.shippingAddress = [createObj.companyAddress]
            }
            //push billing address to billingAddress.  
            if (createObj.defaultBillingAddress) {
                createObj.billingAddress = [createObj.defaultBillingAddress]
            }
            return await this.company.create(createObj);;
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    //Get single company
    public async findSingleCompany(id: string): Promise<iCompany | any> {
        try {
            return await this.company.findById({ _id: id }).select("-password").populate('relationshipManager')
        } catch (error: any) {
            console.error(error);
            // throw new Error('Unable to find company');
            throw new Error(error.message)
        }
    }

    //Get all company
    public async findAllCompany(): Promise<iCompany | Promise<object[]>> {
        try {
            return await this.company.find({});;
        } catch (error: any) {
            // console.error(error);
            // throw new Error('Unable to find companys');
            throw new Error(error.message)
        }
    }


    //update company by _id
    public async updateCompany(id: string, body: object): Promise<iCompany | any> {
        try {
            return await this.company.findOneAndUpdate({ _id: id }, { ...body }, { new: true });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    //update company by _id
    public async incrementCounts(company_id: string, incObj: object): Promise<iCompany | any> {
        try {
            let updateObj = { $inc: incObj }
            return await this.company.findOneAndUpdate({ _id: company_id }, updateObj, { new: true });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    //Delete company by _id
    public async deleteCompany(id: string): Promise<iCompany | any> {
        try {
            await this.company.findOneAndDelete({ _id: id });
            return;
        } catch (error) {
            // console.error(error);
            // throw new Error('unable to delete company ');
            throw error
        }
    }

    // Servcie For table service
    public async tableQuery(query: any[], countQuery: any[]): Promise<object> {
        try {
            const queryData = await this.company.aggregate(query);
            const queryCount = await this.company.aggregate(countQuery);
            let count = 0
            if (queryCount[0] && queryCount[0].count) count = (queryCount[0].count);
            return { queryData: queryData, count: count };
        } catch (error) {
            throw error;
        }
    }

    //Upload single documents
    public async uploadDocs(body: any, file: any): Promise<any> {
        try {
            const companyId = body.companyId;
            const fileName = body.fileName ? body.fileName : file?.originalname;
            const awsFolder = `company/${companyId}/docs`;
            const uploadDate = new Date();
            let nameArray = file.originalname.split('.');
            let extension = nameArray[nameArray.length - 1];
            if (file) {
                const url = await this.awsService.uploadFileToAWS(awsFolder, file);
                const uploadDocument = await this.company.findOneAndUpdate({ _id: companyId }, {
                    $push: { docs: [{ fileName, fileUrl: url, uploadDate, extension, fileType: file.mimetype }] }, updatedBy: companyId,
                    updatedAt: new Date()
                }, { new: true });
                return uploadDocument
            }
        } catch (error) {
            throw error
        }
    }

    // Upload multiple documents
    public async uploadMultiDocs(body: any, files: any): Promise<any> {
        try {
            console.log("uploadMultiDocs----------", [body]);

            const companyId = body.companyId;
            const awsFolder = `company/${companyId}/docs`;
            files.forEach((e1: any, index: any) => {
                let nameArray = e1.originalname.split('.');
                let extension = nameArray[nameArray.length - 1];
                let fileName = body.fileName ? body.fileName[index] : e1.originalname;
                this.awsService.uploadFileToAWS(awsFolder, e1).then(url => {
                    this.updateDoc({ fileName: fileName, fileUrl: url, uploadDate: new Date(), extension: extension, fileType: e1.mimetype }, companyId)
                })
            })
            return;
        } catch (error) {
            throw error
        }
    }

    // update single doc 
    private async updateDoc(doc: any, companyId: any): Promise<any> {
        try {
            const uploadDocument = await this.company.findOneAndUpdate({ _id: companyId }, {
                $push: { docs: doc }, updatedAt: new Date()
            }, { new: true });
            return uploadDocument;
        } catch (error) {
            throw error
        }
    }

    // delete  document 
    public async deleteDoc(docId: any, companyId: any): Promise<any> {
        try {
            console.log("docId , companyId", docId, companyId);

            const uploadDocument = await this.company.findOneAndUpdate({ _id: companyId }, {
                $pull: { docs: { _id: docId } }, updatedAt: new Date()
            }, { new: true });
            return uploadDocument;
        } catch (error) {
            throw error
        }
    }

    //update company Addresss
    public async updateCompanyAddresss(companyId: string, id: string, shippingAddress: Boolean, billingAddress: Boolean, address: string, district: string, taluka: string, state: string, pincode: string): Promise<iCompany | any> {
        try {
            let matchObj = {}
            let updateObj = {}
            if (shippingAddress == true) {
                matchObj = { _id: companyId, "shippingAddress._id": id }
                updateObj = {
                    "shippingAddress.$.address": address,
                    "shippingAddress.$.district": district,
                    "shippingAddress.$.taluka": taluka,
                    "shippingAddress.$.state": state,
                    "shippingAddress.$.pincode": pincode
                }
            }
            if (billingAddress == true) {
                matchObj = { _id: companyId, "billingAddress._id": id }
                updateObj = {
                    "billingAddress.$.address": address,
                    "billingAddress.$.district": district,
                    "billingAddress.$.taluka": taluka,
                    "billingAddress.$.state": state,
                    "billingAddress.$.pincode": pincode
                }
            }
            return await this.company.findOneAndUpdate(matchObj, updateObj, { new: true });
        } catch (error) {
            throw error
        }
    }

    //add company Addresss
    public async addCompanyAddresss(companyId: string, addShippingAddress: Boolean, addBillingAddress: Boolean, address: string, district: string, taluka: string, state: string, pincode: string): Promise<iCompany | any> {
        try {
            let matchObj = { _id: companyId }
            let updateObj = {}
            if (addShippingAddress == true) {
                updateObj = {
                    $push: {
                        shippingAddress: {
                            address: address,
                            district: district,
                            taluka: taluka,
                            state: state,
                            pincode: pincode,
                        }
                    }
                }
            }
            if (addBillingAddress == true) {
                updateObj = {
                    $push: {
                        billingAddress: {
                            address: address,
                            district: district,
                            taluka: taluka,
                            state: state,
                            pincode: pincode,
                        }
                    }
                }
            }
            return await this.company.findOneAndUpdate(matchObj, updateObj, { new: true });
        } catch (error) {
            throw error
        }


    }
    public addCredit = async (body: any): Promise<any> => {
        let credit: any = {
            creditLimit: 0,
            availableCredit: 0,
            creditUtilized: 0
        };
        try {
            const company: any = await this.company.findById({ _id: body.company_id });
            if (!company) {
                throw new HttpException(500, 'company not exist')
            }
            let prevCredit = Number(company.credit.creditLimit);
            let newCredit: Number = Number(body.credit)
            // if(body.creditType === 'add'){
            //      newCredit = Number(company.credit.creditLimit) + Number(body.credit);
            // }else if(body.creditType === 'reduce'){
            //      newCredit = Number(company.credit.creditLimit) - Number(body.credit);

            // }
            // if (Number(company.credit.creditUtilized) > 0) {
            let availableCredit = Number(newCredit) - Number(company.credit.creditUtilized)
            let creditUtilized = Number(newCredit) - Number(availableCredit);
            credit.availableCredit = availableCredit;
            credit.creditUtilized = creditUtilized;

            // } else if (Number(company.credit.creditUtilized) === 0) {
            //     let availableCredit = Number(newCredit) - Number(company.credit.creditUtilized)
            //     let creditUtilized = Number(newCredit) - Number(availableCredit);
            //     credit.availableCredit = availableCredit;
            //     credit.creditUtilized = creditUtilized;
            // }
            credit.creditLimit = newCredit;


            const updatedCredit = await this.company.findByIdAndUpdate({ _id: body.company_id }, { credit: credit }, { new: true });

            return { ...updatedCredit, prevCredit }
        } catch (error) {
            throw error
        }

    }
    // public reduceCredit = async (body: any): Promise<any> => {
    //     let credit: any = {
    //         creditLimit: 0,
    //         availableCredit: 0,
    //         creditUtilized: 0
    //     };
    //     try {
    //         const company: any = await this.company.findById({ _id: body.company_id });
    //         if (!company) {
    //             throw new HttpException(500, 'company not exist')
    //         }
    //         let prevCredit = Number(company.credit.creditLimit);
    //         const newCredit = Number(company.credit.creditLimit) - Number(body.credit);

    //         let availableCredit = Number(newCredit) - Number(company.credit.creditUtilized)
    //         let creditUtilized = Number(newCredit) - Number(availableCredit);
    //         credit.availableCredit = availableCredit;
    //         credit.creditUtilized = creditUtilized;

    //         credit.creditLimit = newCredit;


    //         const updatedCredit = await this.company.findByIdAndUpdate({ _id: body.company_id }, { credit: credit }, { new: true });

    //         return { ...updatedCredit, prevCredit }
    //     } catch (error) {
    //         return error
    //     }

    // }

    public addPayment = async (body: any): Promise<any> => {
        let credit: any = {
            creditLimit: 0,
            availableCredit: 0,
            creditUtilized: 0
        };
        try {
            const company: any = await this.company.findById({ _id: body.company_id });
            if (!company) {
                throw new HttpException(500, 'company not exist')
            }
            console.log(company.credit.creditUtilized < body.amount);

            if (company.credit.creditUtilized < body.amount) {
                throw new HttpException(500, `You  cannot add more than ${company.credit.creditUtilized}. Increase company credit limit and try again`)
            }
            credit.creditLimit = company.credit.creditLimit;
            credit.availableCredit = Number(company.credit.availableCredit) + Number(body.amount)
            credit.creditUtilized = Number(company.credit.creditUtilized) - Number(body.amount);

            return await this.company.findByIdAndUpdate({ _id: body.company_id }, { credit: credit }, { new: true });

        } catch (error) {
            throw error
        }

    }
    // public checkCredit = async (company_id: any): Promise<any> => {

    //     try {
    //         return await companyModel.findById({ _id: company_id }).select('credit')

    //     } catch (error) {
    //         return error
    //     }

    // }

    // public deductCredit = async (body: any): Promise<any> => {
    //     console.log("deduct body------",body);

    //     try {
    //         const company: any = await companyModel.findById({ _id: body.company_id });
    //         if (!company) {
    //             throw new HttpException(500, 'company not exist')
    //         }

    //         if (company.credit < body.credit) {
    //             throw new HttpException(500, 'your credit is not enough for this order')
    //         }
    //         const newCredit = Number(company.credit) - Number(body.credit)
    //         const updatedCredit = await companyModel.findByIdAndUpdate({ _id: body.company_id }, { credit: newCredit }, { new: true });
    //         console.log("deductCredit",updatedCredit);

    //         return updatedCredit
    //     } catch (error) {
    //         return error
    //     }

    // }


    // for check order price and deduct credit
    public updateCredit = async (company_id: string, order: any): Promise<any> => {

        try {
            console.log("body---------------", company_id);
            let prevAvailableCredit: any
            let prevCreditUtilized: any
            let creditUtilized: any
            let availableCredit: any
            const company: any = await this.company.findById({ _id: company_id });

            prevAvailableCredit = company.credit.availableCredit;
            prevCreditUtilized = company.credit.creditUtilized;

            let creditUsed: any = await this.orderService.CreditCounter(company_id, order);   
            if(prevCreditUtilized > 0 &&  prevAvailableCredit > 0){
                availableCredit = (Number(prevAvailableCredit) - Number(creditUsed)).toFixed(2);
                creditUtilized  = (Number(prevCreditUtilized) + Number(creditUsed)).toFixed(2);
            }else{
                availableCredit = (Number(company.credit.creditLimit) - Number(creditUsed)).toFixed(2);
                creditUtilized  = (Number(company.credit.creditLimit) - Number(availableCredit)).toFixed(2);
            }
            let creditObj = { creditLimit: company.credit.creditLimit, availableCredit: availableCredit, creditUtilized: creditUtilized }

            return await this.company.findByIdAndUpdate({ _id: company_id }, { credit: creditObj }, { new: true })
        } catch (error) {
            return error
        }

    }




    public assignManagerOfObk = async (company_id: string, relationshipManagerId: string): Promise<any> => {

        try {
            return await this.company.findByIdAndUpdate({ _id: company_id }, { relationshipManager: relationshipManagerId }, { new: true });
        } catch (error) {
            return error
        }

    }

}

export default companyService;
