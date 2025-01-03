import mongoose from "mongoose";
import ICategory from './interface';

/**
 * Schema definition for the Category model.
 */
const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      unique: [true, "Category name must be unique"],
      required: [true, "Category name is required"], // More descriptive error message
    },
    categoryImage: {
      type: String,
    },
    categoryBannerImage: {
      type: String,
    },
    categoryBannerMobileImage: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "Active", // Default status value
    },
    color: {
      type: String,
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subCategorys",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICategory>("Categories", categorySchema);
