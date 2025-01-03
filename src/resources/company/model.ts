import mongoose, { Schema, model } from 'mongoose';
import iCompany from './interface';
import bcrypt from 'bcrypt'

const CompanySchema = new Schema(
    {
        name: { type: String, index: true, required: [true, 'Name required'], lowercase: true, trim: true },
        emailId: { type: String, required: [true, 'EmailId required'], index: true, lowercase: true, trim: true, unique: true },
        phoneNo: { type: String, index: true },
        companyLogo: String,
        website: String,
        companyAddress: {
            address: String,
            district: String,
            taluka: String,
            state: String,
            pincode: String,
        },
        defaultBillingAddress: {
            address: String,
            district: String,
            taluka: String,
            state: String,
            pincode: String,
        },
        billingAddress: [{
            address: String,
            district: String,
            taluka: String,
            state: String,
            pincode: String,
        }],
        shippingAddress: [{
            address: String,
            district: String,
            taluka: String,
            state: String,
            pincode: String,
        }],
        gstNumber: {type : String , required: [true, 'GST Number required']},
        panNumber: String,
        roles: [String],
        docs: [{
            uploadDate: Date,
            fileUrl: String,
            fileType: String,
            fileName: String,
            extension: String
        }],
        credit : { 
            creditLimit : {type : Number , default : 0},
            availableCredit : {type : Number , default : 0},
            creditUtilized : {type : Number , default : 0}
         },
        // password: { type: String, required: [true, "password required"] },
        lastEmployeNo: { type: Number, default: 0 },
        lastOrderNo: { type: Number, default: 0 },
        lastInvoiceNo: { type: Number, default: 0 },

        relationshipManager : {type : mongoose.Schema.Types.ObjectId , ref : "salesUsers"},
    }, { timestamps: true }
);


// CompanySchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         return next();
//     }
//     const hash = await bcrypt.hash(this.password, 10);
//     this.password = hash;
//     next();
// });

// CompanySchema.methods.isValidPassword = async function (password: string): Promise<Error | boolean> {
//     return await bcrypt.compare(password, this.password);
// };

CompanySchema.index({ name: 'text', phoneNo: 'text', emailId: 'text' })

export default model<iCompany>('companys', CompanySchema);
