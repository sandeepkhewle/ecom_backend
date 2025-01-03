import mongoose from "mongoose";

/**
 * Product Schema Definition.
 * @type {mongoose.Schema}
 */
const stockHistorySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
    batchId: { type: String },
    // varientType: { type: String },
    quantity: { type: Number },
    type: { type: String, enum: ["add", "deduct"] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    note: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("stockHistory", stockHistorySchema);
