import salesUserModel from './model';
import iSalesUser from '@/resources/salesUser/interface';
import token from '@/utils/token';
import HttpException from '@/utils/http.exception';
import mailjetService from '@/utils/gobalServices/mailer.service';
import bcrypt from 'bcrypt'
import companyService from '../company/service';
class salesUserService {
    private mailjetService = new mailjetService();
    private companyService = new companyService();
    private salesUserModel = salesUserModel;

    public async login(data: any): Promise<object | Error> {
        try {
            console.log("data.emailId", data.emailId);
            const user = await this.salesUserModel.findOne({ emailId: data.emailId });
            if (!user) throw new HttpException(401, 'Unable to find user with that email address');
            if (await user.isValidPassword(data.password)) {
                console.log('Password match');
                const newToken = token.createToken(user, "24h");
                return {
                    success: true,
                    user: {
                        _id: user._id,
                        emailId: user.emailId,
                        fullName: user.fullName,
                        role: user.role,
                        roleId: user.roleId,
                        token: newToken
                    }
                }
            }
            else throw new HttpException(401, "Wrong Credentials");
        } catch (error) {
            throw error;
        }
    }

    public async create(body: iSalesUser | any): Promise<iSalesUser> {
        try {

            console.log(body);
            if (body.role === 'vendor') {
                let access: any = {};
                let editAccess: any = {};
                // console.log(Math.floor(100000 + Math.random() * 900000).toString());
                // console.log(new Date (new Date().setDate(new Date().getDate() + 1)) );
                const sessionId = Math.floor(100000 + Math.random() * 900000).toString()
                const sessionTime = new Date(new Date().setDate(new Date().getDate() + 1))

                access.seeReport = body.seeReport;
                access.seeDashboard = body.seeDashboard;
                access.seeUsers = body.seeUsers;
                access.seeOrders = body.seeOrders;
                access.seeCompanys = body.seeCompanys;
                access.seeProduct = body.seeProduct;
                access.seeBills = body.seeBills;
                access.seeVendors = body.seeVendors;

                editAccess.addCompany = body.addCompany;
                editAccess.addVendor = body.addVendor;
                editAccess.addProduct = body.addProduct;
                editAccess.addTemplate = body.addTemplate;
                editAccess.addOrderStatus = body.addOrderStatus;
                editAccess.addUsers = body.addUsers;


                body.access = access
                body.editAccess = editAccess
                body.sessionId = sessionId
                body.sessionTime = sessionTime
                body.password = Math.floor(100000 + Math.random() * 900000).toString()
                const vendor = await this.salesUserModel.create(body);
                console.log(vendor.emailId)
                const url = `https://${body.baseUrl}/salesPanel/vendors/FullvendorRegister/?id=${sessionId}`
                const link = `<div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgA…DoKCC8Fi54BLUn/X/8F+GFCqA4+HZAwAAAABJRU5ErkJggg==" alt="obc image" width="200" height="200" ><a href=${url}> form </a></div>`

                if (vendor && link) {
                    this.mailjetService.mailer(body.emailId, 'Please complete you registration', 'open this form', 'open this form', link, [])
                    return vendor;
                }

            }
            const user = await this.salesUserModel.create(body);
            return user;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    public async updateVendorInfo(id: string, body: iSalesUser | any): Promise<iSalesUser | any> {
        try {
            console.log("updateObj", body);
            let updateObj = { ...body }

            if (updateObj.password) {
                updateObj.password = await bcrypt.hash(updateObj.password, 10)
            }
            const vendor: iSalesUser | null = await this.salesUserModel.findOne({ sessionId: id });
            if (vendor && vendor.sessionTime > new Date()) {
                updateObj.sessionId = ''
                updateObj.sessionTime = ''
                const user = await this.salesUserModel.findOneAndUpdate({ sessionId: id }, { ...updateObj }, { new: true })
                return user;
            } else {
                throw new Error('session timeout');
            }
        } catch (error) {
            console.error(error);
            throw new Error("Unable to update user");
        }
    }
    public async changeSalesUserPassword(id: string, body: iSalesUser | any): Promise<iSalesUser | any> {
        try {
            let access: any = {};
            let editAccess: any = {};
            let updateObj = { ...body }
            console.log("id", id);

            let checkUser : iSalesUser | any = await this.salesUserModel.findById({_id : id});
            
            if (updateObj.password) {
                updateObj.password = await bcrypt.hash(updateObj.password, 10)
            }
            console.log("access", body);
            
            if (body.createdBy) {
                access.seeDashboard = body.seeDashboard ?  body.seeDashboard : false;
                access.seeUsers = body.seeUsers ?  body.seeUsers : false;
                access.seeOrders = body.seeOrders ?  body.seeOrders : false;
                access.seeCompanys = body.seeCompanys ?  body.seeCompanys : false;
                access.seeProduct = body.seeProduct ?  body.seeProduct : false;
                access.seeBills = body.seeBills ?  body.seeBills : false;
                access.seeVendors = body.seeVendors ?  body.seeVendors : false;
                access.seeReport = body.seeReport ?  body.seeReport : false;


                editAccess.addCompany = body.addCompany ?  body.addCompany : false;
                editAccess.addVendor = body.addVendor ?  body.addVendor : false;
                editAccess.addUsers = body.addUsers ?  body.addUsers : false;
                editAccess.addProduct = body.addProduct ?  body.addProduct : false;
                editAccess.addTemplate = body.addTemplate ?  body.addTemplate : false;
                editAccess.addOrderStatus = body.addOrderStatus ?  body.addOrderStatus : false;

                updateObj.access = access
                updateObj.editAccess = editAccess
            }

            if(updateObj.hasOwnProperty("access") && updateObj.hasOwnProperty("editAccess")){
                console.log("send mail");
                await this.mailjetService.mailer(
                  checkUser?.emailId,
                  "Change Restriction",
                  "",
                  "Your MIXXO Sales-Panel Restriction Change Please Re-Login",
                  `<h4>Your MIXXO Sales-Panel Restriction Change Please Re-Login</h4> <a href="https://www.themixxo.com/login/eHqRW2c9">Login</a>`,
                  []
                );
            }
            
            const user = await this.salesUserModel.findOneAndUpdate({ _id: id }, { ...updateObj }, { new: true })
            return user;
        } catch (error) {
            console.error(error);
            throw new Error("Unable to update user");
        }
    }

    public async fetchAllUser(): Promise<iSalesUser | Array<object>> {
        try {
            // companyId to be add
            const user = await this.salesUserModel.find({}, {
                _id: 0,
                orderNo: 1,
                invoiceNo: 1,
                orderStatus: 1,
                status: 1,
                actualAmount: 1,
                discountAmount: 1
            });
            return user;
        } catch (error) {
            throw new Error("Unable to fetch user");
        }
    }

    public async fetchSingleUser(id: string | any): Promise<iSalesUser | any> {
        try {
            const user = await this.salesUserModel.findOne({ _id: id })
            return user;
        } catch (error) {
            console.log(error);
            throw new Error("Unable to fetch order");
        }
    }
    public async fetchVendorList(): Promise<iSalesUser | any> {
        try {
            const vendorList = await this.salesUserModel.find({ role: 'vendor' })
            return vendorList;
        } catch (error) {
            console.log(error);
            throw new Error("Unable to fetch vendor list");
        }
    }

    public async delete(id: string): Promise<iSalesUser | any> {
        try {
            const user = await this.salesUserModel.findOneAndDelete({ _id: id })
            return user;
        } catch (error) {
            console.log(error);
            throw new Error("Unable to delete order");
        }
    }

    public async tableQuery(query: any[], countQuery: any[]): Promise<object> {
        try {
            console.log(query[0]);

            const queryData = await this.salesUserModel.aggregate(query);
            const queryCount = await this.salesUserModel.aggregate(countQuery);
            let count = 0
            if (queryCount[0] && queryCount[0].count) count = (queryCount[0].count);
            return { queryData: queryData, count: count };
        } catch (error) {
            throw error;
        }
    }

    public async findByEmailAndUpdate(emailId: string, body: iSalesUser | any): Promise<iSalesUser | any> {
        try {
            return await this.salesUserModel.findOneAndUpdate({ emailId: emailId }, { ...body }, { new: true });
        } catch (error) {
            throw error
        }
    }

    public async ManagerList(): Promise<iSalesUser | any> {
        try {
            return await this.salesUserModel.find({ role: 'relationshipManager' });
        } catch (error) {
            throw error
        }
    }
    public async assignManagerToCompany(company_id: string,relationshipManagerId: string): Promise<iSalesUser | any> {
        try {   
                return await this.companyService.assignManagerOfObk(company_id,relationshipManagerId)
        } catch (error) {
            throw error
        }
    }



}

export default salesUserService;
