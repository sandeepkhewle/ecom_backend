import mongoose from "mongoose";
import product from './interface'
const templateSchema = new mongoose.Schema({
    tamplateName : { type: String, index: true, trim: true, lowecase: true },
    // productCatogery: { type: String, index: true },
    // productSubCatogery: { type: String, index: true, lowecase: true },
    productInfo : String,
    productDesc: String,
    productSize: String,
    productMainImage: String,
    productImages: [String],
    createdBy: String,
    decidedPrice: { type: Number , default : 0 },
    sellPrice: { type: Number , default : 0 },
    mrp: { type: Number , default : 0 },
    updatedBy: String,
    configuration : Object,
    live : {type : Boolean , default : false},
    assets : [{
        productToolImage : String,
        productId : String,
        id : { type :  mongoose.Schema.Types.ObjectId },
    }],
    companyProductMaps: { type: mongoose.Schema.Types.ObjectId, ref: 'companyProductMaps' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companys' },
}, { timestamps: true });
templateSchema.index({ tamplateName : "text", productCatogery: "text" })

const tamplates = mongoose.model<product>("templates", templateSchema);
export default tamplates;  