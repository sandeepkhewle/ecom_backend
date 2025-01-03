import mongoose from "mongoose";
const FAQSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    status: { type: String, enum: ["Active", "InActive"], default: "Active" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
  },
  { timestamps: true }
);
// FAQSchema.index({});

const FAQs = mongoose.model("FAQs", FAQSchema);
export default FAQs;
