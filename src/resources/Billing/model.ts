import mongoose from "mongoose";
import iBilling from "@/resources/Billing/interface";
let BillingSchema = new mongoose.Schema(
  {
    billingId: {
      type: String,
      default: mongoose.Types.ObjectId,
      unique: true,
      index: true,
    },
    invoiceNo: { type: String, index: true },
    userId: { type: String, index: true },
    fullName: { type: String, index: true },
    phoneNo: { type: String, index: true },
    emailId: { type: String, index: true },
    companyName: String,
    address: String,
    gstNo: String,
    link: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
    note: String,
    date: { type: Date, index: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, // discount in amount
    amount: Number, // actual amount
    discountAmt: Number, // final discounted amount
    taxAmt: Number, // tax amount
    total: Number,
    finalAmount: Number,
    shippingCharges: Number,
    paidAmount: { type: Number, default: 0 },
    pendingAmount: Number,
    dueDate: Date,
    paymentId: [String],
    paymentStatus: {
      type: String,
      enum: ["Partial", "Pending", "Paid", "WriteOff"],
      default: "Pending",
      index: true,
    },
    invoiceStatus: {
      type: String,
      enum: ["Cancelled", "Success", "Closed"],
      default: "Success",
    },
    gstChargedOn: String,
    gstStatus: String,
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "consumers",
    },
    createdBy: String,
    updatedBy: String,
    createdByName: String,
    updatedByName: String,
    comment: String,
    billType: String,
    customerGSTNo: String,
    lastPaymentId: String,
    lastPaymentcomment: String,
    assignedTo: String,
    assignedToName: String,
    autoRenewal: { type: Boolean, default: false },
    isLatest: { type: Boolean, default: true },
    resale: {
      status: Boolean,
      price: Number,
    },
    // need to remove this
    createDate: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

BillingSchema.index({
  invoiceNo: "text",
  fullName: "text",
  phoneNo: "text",
  paymentStatus: "text",
});
BillingSchema.index({ invoiceNo: 1, company_id: 1 }, { unique: true });


const invoiceNoSchema = new mongoose.Schema({
  lastInvoiceNo : String,
  name : String
});



const invoiceNoModel =  mongoose.model<any>("invoices", invoiceNoSchema);
export {invoiceNoModel}

export default mongoose.model<iBilling>("billings", BillingSchema);
