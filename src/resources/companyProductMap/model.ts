import mongoose from "mongoose";
import product from './interface'
const companyProductMapSchema = new mongoose.Schema({
    productName: { type: String, index: true, trim: true, lowecase: true },
    // productCatogery: { type: String, index: true },
    // productSubCatogery: { type: String, index: true, lowecase: true },
    productInfo : String,
    productDesc: String,
    productSize: String,
    productMainImage: String,
    productImages: [String],
    sellPrice: { type: Number , default : 0 },
    decidedPrice: { type: Number , default : 0 },
    mrp: { type: Number , default : 0 },
    createdBy: String,
    updatedBy: String,
    configuration : Object,
    live : {type : Boolean , default : false},
    assets : [{
        productToolImage : String,
        productId : String,
        id : { type :  mongoose.Schema.Types.ObjectId },
    }],
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companys' },
}, { timestamps: true });
companyProductMapSchema.index({ productName: "text", productCatogery: "text" })

const companyProductMap = mongoose.model<product>("companyProductMaps", companyProductMapSchema);
export default companyProductMap;  