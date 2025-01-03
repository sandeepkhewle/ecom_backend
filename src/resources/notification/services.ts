import notificationModel from './model'
import iNotification from './interface'
class notificationServices {
    private notificationModel = notificationModel;
    public async create(body: iNotification | object): Promise<iNotification> {
        try {
            // const user = await this.userModel.findById(id).populate('company_id');
            return await this.notificationModel.create(body);;
        } catch (error: any) {
            throw error
        }
    }
    public async fetchSingleNotification(id: string | any): Promise<iNotification | any> {
        try {
            return await this.notificationModel.findOne({ _id: id }).populate(['company', 'createdBy']);
        } catch (error) {
            throw error
        }
    }
    public async fetchAllhNotification(): Promise<iNotification | Array<object>> {
        try {
            return await this.notificationModel.find({});
        } catch (error: any) {
            throw error
        }
    }
    public async updateNotification(id: string, body: iNotification | object): Promise<iNotification | any> {
        try {
            return await this.notificationModel.findOneAndUpdate({ _id: id }, { ...body, updateAt: new Date() }, { new: true });
        } catch (error) {
            throw error
        }
    }
    public async deleteNotification(id: string): Promise<iNotification | any> {
        try {
            return await this.notificationModel.findOneAndDelete({ _id: id });
        } catch (error) {
            throw error
        }
    }

}

export default notificationServices