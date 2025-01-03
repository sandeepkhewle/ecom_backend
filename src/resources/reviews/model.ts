import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema(
  {
    userEmailId: { type: String, trim: true },
    rating: { type: Number, default: 0 },
    isVerifiedBuyer: { type: Boolean, default: false },
    userName: String,
    review: { title: String, text: String, image: [String] },
    createdBy: String,
    updatedBy: String,
    productId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Products" }],
  },
  { timestamps: true }
);
// reviewSchema.index({});

const Reviews = mongoose.model("reviews", reviewSchema);
export default Reviews;
