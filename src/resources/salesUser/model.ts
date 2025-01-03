import mongoose, { Schema, model } from 'mongoose';
import iSalesUser from './interface';
import pad from 'pad';
import bcrypt from 'bcrypt';


let salesUserSchema = new Schema({
    salesId: { type: String, index: true },
    password: { type: String, required: [true, "password required"] },
    firstName: String,
    lastName: String,
    mobile: String,
    emailId: { type: String, require: true, unique: true, trim: true, lowercase: true, index: true },
    dob: String,
    age: String,
    address: String,
    district: String,
    state: String,
    country: String,
    joiningDate: Date,
    post: { type: String, index: true },
    status: String,
    role: { type: String, require: true, enum: ['admin', 'salesuser', 'businessOwners','marketingUser','productUser','designUser','procurementUser','channelManager','logisticPartner','channelPartner','relationshipManager','vendor'] },
    access: {
        seeDashboard: { type: Boolean, default: false },
        seeUsers: { type: Boolean, default: false },
        seeOrders: { type: Boolean, default: true },
        seeCompanys: { type: Boolean, default: false },
        seeProduct: { type: Boolean, default: false },
        seeBills: { type: Boolean, default: false },
        seeVendors: { type: Boolean, default: false },
        seeReport: { type: Boolean, default: false }
    },
    editAccess : {
        addCompany: { type: Boolean, default: false },
        addVendor: { type: Boolean, default: false },
        addUsers: { type: Boolean, default: false },
        addProduct: { type: Boolean, default: false },
        addTemplate: { type: Boolean, default: false },
        addOrderStatus:{ type: Boolean, default: false }

    },
    roleId: { type: Number, default: 1 },
    profilePic: String,
    remark: String,
    reportingTo: String,
    reportingToRole: String,
    updatedBy: String,
    gstNumber: String,
    otp: String,
    otpTime: Date,
    otpVerified: { type: Boolean, default: false },
    sessionId: String,
    sessionTime: Date,
    sessionVerified: { type: Boolean, default: false },
    dateOfJoining: String,
    panNumber: String,
    website: String,
    companyEmailId: String,
    companyName: String,
}, { timestamps: true })

let salesCounterSchema = new Schema({
    salesNo: {
        type: Number,
        default: 0
    }
});


let counter1 = mongoose.model('salesCounter', salesCounterSchema);

salesUserSchema.pre('save', async function (next) {
    let doc = this;
    counter1.findOneAndUpdate({}, {
        $inc: {
            salesNo: 1
        }
    }, { new: true, upsert: true }, function (error, counter1) {
        console.log("counter1 " + JSON.stringify(counter1));
        let salesNoPad = pad(4, JSON.stringify(counter1.salesNo), '0')
        if (error)
            return next(error);
        doc.salesId = "MIXXO" + salesNoPad;
        next();
    });
});

salesUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    // if(this.password !== undefined){

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    // }
    next();
})

salesUserSchema.methods.isValidPassword = async function (password: string): Promise<Error | boolean> {
    return await bcrypt.compare(password, this.password);
};

export default model<iSalesUser>('salesUsers', salesUserSchema);