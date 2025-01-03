import companyUserModel from './model';
import salesUserModel from '../salesUser/model';
import iCompanyUser from './interface';
import token from '../../utils/token';
import HttpException from '../../utils/http.exception';
import awsService from '../../utils/gobalServices/aws.service';
import bcrypt from 'bcrypt';
import mailjetService from '../../utils/gobalServices/mailer.service';

class companyUserService {
    private companyUserModel = companyUserModel;
    private salesUserModel = salesUserModel;
    private mailjetService = new mailjetService();
    private awsService = new awsService();

    public async register(body: iCompanyUser | any, file: any): Promise<iCompanyUser | any> {
        try {
            console.log("body-------------------------", body.role);

            let access: any = {};
            let editAccess: any = {};
            const userAlreadyEmail = await this.companyUserModel.findOne({ emailId: body.emailId });
            if (userAlreadyEmail) {
                throw new HttpException(501, 'email address already exist');
            }

            if (body?.role === "admin") {
                access.seeDashboard = true;
                access.seeUsers = true;
                access.seeOrders = true;
                access.seeAccount = true;
                access.seeProduct = true;
                access.seeReport = true;
                access.seeCart = true;
                access.seeAboutCompany = true;
                editAccess.addUsers = true;
                editAccess.addProduct = true;
                editAccess.addMyProduct = true;
                editAccess.addTemplates = true;
            }


            if (body.createdBy) {
                let createdBy: any = await this.companyUserModel.findById({ _id: body.createdBy });
                if (createdBy.role !== "admin") {
                    throw new HttpException(501, 'Your Not Allowed To Create The User');
                }
                access.seeDashboard = body.seeDashboard;
                access.seeUsers = body.seeUsers;
                access.seeOrders = body.seeOrders;
                access.seeAccount = body.seeAccount;
                access.seeProduct = body.seeProduct;
                access.seeReport = body.seeReport;
                access.seeCart = body.seeCart;
                access.seeAboutCompany = body.seeAboutCompany;
                editAccess.addUsers = body.addUsers;
                editAccess.addProduct = body.addProduct;
                editAccess.addMyProduct = body.addMyProduct;
                editAccess.addTemplates = body.addTemplates;

            }
            body.access = access;
            body.editAccess = editAccess;

            if (body.reportingTo !== 'self') {

                let user = await this.companyUserModel.findOne({ _id: body.reportingTo });
                body.nameOfReportingTo = user?.firstName + " " + user?.lastName
                let email = user?.emailId as string;
                if (file) {
                    const awsFolder = `company/companyuser/docs`;
                    let nameArray = file.originalname.split('.');
                    let extension = nameArray[nameArray.length - 1];
                    const fileUrl = await this.awsService.uploadFileToAWS(awsFolder, file);
                    body.adminDocs = {
                        uploadDate: new Date(),
                        fileUrl: fileUrl,
                        approval: false
                    }
                }
                if (email && user) {
                    console.log(email);
                    let message1 = `we are selecting you as approver of the ${body.firstName} ${body.lastName}`
                    let message2 = `your order will be approved by ${user.firstName} ${user.lastName}`
                    this.mailjetService.mailer(email, 'Otp', '', message1, '', [])
                    this.mailjetService.mailer(body.emailId, 'Otp', '', message2, '', [])
                }
                return await this.companyUserModel.create(body);

            } else {
                let user = await this.companyUserModel.findOne({ _id: body.reportingTo });
                body.nameOfReportingTo = user?.firstName + " " + user?.lastName
                let email = body?.emailId as string;
                if (file) {
                    const awsFolder = `company/companyuser/docs`;
                    let nameArray = file.originalname.split('.');
                    let extension = nameArray[nameArray.length - 1];
                    const fileUrl = await this.awsService.uploadFileToAWS(awsFolder, file);
                    body.adminDocs = {
                        uploadDate: new Date(),
                        fileUrl: fileUrl,
                        approval: false
                    }
                }
                if (email && body) {
                    console.log(email);
                    let message1 = `we are selecting you as approver of the ${body.firstName} ${body.lastName}`
                    let message2 = `your order will be approved by ${body.firstName} ${body.lastName}`
                    this.mailjetService.mailer(email, 'Otp', '', message1, '', [])
                    this.mailjetService.mailer(body.emailId, 'Otp', '', message2, '', [])
                }
                let newUser = await this.companyUserModel.create(body);
                await this.companyUserModel.findByIdAndUpdate({ _id: newUser._id }, { reportingTo: newUser._id }, { new: true });
                return newUser
            }
        } catch (error: any) {
            console.log("eeeeeee", error);
            throw error
        }
    }
    
    public async update(id: string, body: iCompanyUser | any): Promise<iCompanyUser | any> {
        try {
            console.log("body", body);
            const user:iCompanyUser | any = await this.companyUserModel.findById({ _id: id });

            if (body.createdBy) {
                let createdBy: any = await this.companyUserModel.findById({ _id: body.createdBy });
                if (createdBy.role !== "admin") {
                    throw new Error('Your Not Allowed To Change The User Permission');
                }



                let access: any = {};
                let editAccess: any = {};

                access.seeDashboard = body.seeDashboard ? body.seeDashboard : false;
                access.seeUsers = body.seeUsers ? body.seeUsers : false;
                access.seeOrders = body.seeOrders ? body.seeOrders : false;
                access.seeAccount = body.seeAccount ? body.seeAccount : false;
                access.seeProduct = body.seeProduct ? body.seeProduct : false;
                access.seeReport = body.seeReport ? body.seeReport : false;
                access.seeCart = body.seeCart ? body.seeCart : false;
                access.seeAboutCompany = body.seeAboutCompany ? body.seeAboutCompany : false;

                editAccess.addUsers = body.addUsers ? body.addUsers : false;
                editAccess.addProduct = body.addProduct ? body.addProduct : false;
                editAccess.addMyProduct = body.addMyProduct ? body.addMyProduct : false;
                editAccess.addTemplates = body.addTemplates ? body.addTemplates : false;

                body.access = access;
                body.editAccess = editAccess;
            }
            if(body.hasOwnProperty("access") && body.hasOwnProperty("editAccess")){
                console.log("send mail");
                await this.mailjetService.mailer(user?.emailId ,"Change Restriction","","Your OBK Restriction Change Please Re-Login",`<h4>Your OBK Restriction Change Please Re-Login</h4> <a href="https://www.openboxkoncepts.com/login">Login</a>`,[])
            }
            if (body.reportingTo) {
                const reportingToUser = await this.companyUserModel.findById({ _id: body.reportingTo });
                body.nameOfReportingTo = reportingToUser?.firstName + " " + reportingToUser?.lastName;
            }
            if (body.password) body.password = await bcrypt.hash(body.password, 10);
            return await this.companyUserModel.findOneAndUpdate({ _id: id }, { ...body }, { new: true });
        } catch (error) {
            throw error
        }
    }
    public async updatePassword(id: string, body: iCompanyUser | any): Promise<iCompanyUser | any> {
        try {

            if (body.pageId === 'eHqRW2c9') {
                body.password = await bcrypt.hash(body.password, 10);
                return await this.salesUserModel.findOneAndUpdate({ _id: id }, { ...body }, { new: true });
            } else {
                body.password = await bcrypt.hash(body.password, 10);
                return await this.companyUserModel.findOneAndUpdate({ _id: id }, { ...body }, { new: true });
            }
        } catch (error) {
            throw error
        }
    }

    public async findByEmailAndUpdate(emailId: string, body: iCompanyUser | any): Promise<iCompanyUser | any> {
        try {
            return await this.companyUserModel.findOneAndUpdate({ emailId: emailId }, { ...body }, { new: true });
        } catch (error) {
            throw error
        }
    }

    public async fetchAllUser(company_id: String): Promise<iCompanyUser | Array<object>> {
        try {
            return await this.companyUserModel.find({ company_id }).populate('company_id');
        } catch (error) {
            throw error
        }
    }

    public async fetchSingleUser(id: any): Promise<iCompanyUser | any> {
        try {

            // return await this.companyUserModel.findOne({ _id: id }).populate(['company_id', 'reportingTo']);
            return await this.companyUserModel.findOne({ _id: id }).populate([{
                path: 'company_id',
                populate: {
                    path: 'relationshipManager',
                }
            },
            {
                path: 'reportingTo',
            },
            ])
        } catch (error) {
            throw error
        }
    }

    // Servcie For table service
    public async tableQuery(query: any[], countQuery: any[]): Promise<object> {
        try {
            console.log("query", query);

            const queryData = await this.companyUserModel.aggregate(query);
            const queryCount = await this.companyUserModel.aggregate(countQuery);
            let count = 0
            if (queryCount[0] && queryCount[0].count) count = (queryCount[0].count);
            return { queryData: queryData, count: count };
        } catch (error) {
            throw error;
        }
    }

    // comman api for company user and obk sales user
    public async login(data: any): Promise<object | Error> {
        try {
            let user: any = {};
            if (data.pageId === 'eHqRW2c9') {
                user = await this.salesUserModel.findOne({ emailId: data.emailId });
            } else {
                user = await this.companyUserModel.findOne({ emailId: data.emailId });
            }
            // const user = await this.companyUserModel.findOne({ emailId: data.emailId });
            if (!user) throw new HttpException(401, 'Unable to find user with that email address');
            if (await user.isValidPassword(data.password)) {
                console.log('Password match');
                const newToken = token.createToken(user, "24h");
                return {
                    userId: user._id,
                    salesId: user.salesId,
                    company_id: user.company_id,
                    emailId: user.emailId,
                    fullName: user.fullName || `${user.firstName} ${user.lastName}`,
                    role: user.role,
                    access: user.access,
                    editAccess: user.editAccess,
                    token: newToken
                }
            }
            else throw new HttpException(401, 'Wrong credentials');

        } catch (error) {
            throw error;
        }
    }


    //Get  company Admin
    public async findCompanyAdmin(company_id: string | any, role: string | any): Promise<object | any> {
        try {
            console.log("findOne", company_id, role);
            return await this.companyUserModel.findOne({ company_id: company_id, role: role }).populate('company_id');
        } catch (error) {
            // console.error(error);
            // throw new Error('Unable to find company Admin');
            throw error
        }
    }

}


export default companyUserService;
