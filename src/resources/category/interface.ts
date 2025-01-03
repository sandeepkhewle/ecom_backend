import { Document } from 'mongoose'
export default interface category extends Document {
 category : String,
 description : String,
 status : String,
 categoryImage : String,
 subCategory :[{
    category : String,
    subCategoryImage : String,
 }]

}
