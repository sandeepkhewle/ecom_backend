import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import iCompanyUser from './interface'

const companyuserSchema = new mongoose.Schema({
    firstName: { type: String, trim: true, lowercase: true, required: [true, "first name is required"], index: true },
    lastName: { type: String, index: true, lowercase: true, trim: true },
    emailId: { type: String, index: true, unique: true, trim: true },
    phoneNo: { type: String, index: true },
    password: { type: String, required: [true, "password required"] },
    role: String,
    reportingToRole: String,
    lastLogIn: Date,
    lastUpdatedBy: String,
    createBy: String,
    otp: String,
    otpTime: Date,
    access: {
        seeDashboard: { type: Boolean, default: false },
        seeUsers: { type: Boolean, default: false },
        seeOrders: { type: Boolean, default: false }, 
        seeAccount: { type: Boolean, default: false },
        seeReport: { type: Boolean, default: false },
        seeCart: { type: Boolean, default: true },
        seeAboutCompany: { type: Boolean, default: false },
        seeProduct: { type: Boolean, default: true },
        seeTemplates: { type: Boolean, default: true },
        seeMyProduct: { type: Boolean, default: true },

    },
    editAccess : {
        addUsers: { type: Boolean, default: false },
        addProduct: { type: Boolean, default: false },
        addMyProduct: { type: Boolean, default: false },
        addTemplates: { type: Boolean, default: false },

    },
    otpVerified: { type: Boolean, default: false },
    adminDocs: {
        uploadDate: Date,
        fileUrl: String,
        approval: { type: Boolean, default: false }
    },
    docs: {
        uploadDate: Date,
        fileUrl: String,
        fileType: String,
        fileName: String,
        extension: String
    },
    department: String,
    nameOfReportingTo: String,
    reportingTo: { type: String, default: mongoose.Types.ObjectId, ref: "companyusers" },
    company_id: { type: String, default: mongoose.Types.ObjectId, ref: "companys" },

}, { timestamps: true });

companyuserSchema.index({ firstName: "text", lastName: "text", emailId: "text", phoneNo: "text" })

companyuserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

companyuserSchema.methods.isValidPassword = async function (password: string): Promise<Error | boolean> {
    console.log('isValidPassword');
    console.log('send pass', password, 'stored pass', this.password);

    return await bcrypt.compare(password, this.password);
};

export default mongoose.model<iCompanyUser>("companyusers", companyuserSchema);
