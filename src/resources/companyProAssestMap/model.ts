import mongoose from "mongoose";
import product from './interface'
const companyProductAssetsMapSchema = new mongoose.Schema({
    assets : [{
        live : {type : Boolean , default : false},
        productToolImage : String
    }],
    companyUser: { type: String , default :  mongoose.Schema.Types.String, ref: "companyUser" },
    company_id: { type: mongoose.Schema.Types.String, ref: 'companys' },
}, { timestamps: true });

const companyProductAssetsMap = mongoose.model<product>("companyProductAssetsMaps", companyProductAssetsMapSchema);
export default companyProductAssetsMap; 