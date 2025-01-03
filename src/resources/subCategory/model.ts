import mongoose from "mongoose";
import ISubCategory from './interface'

const subCategorySchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      unique: true,
      lowwercase: true,
      required: [true, "same subCategory not created"],
    },
    subCategoryImage: String,
    subCategoryBannerImage: String,
    subCategoryMobileImage: String,
    description: String,
    status: { type: String, enum: ["Active", "InActive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model<ISubCategory>("subCategorys", subCategorySchema);