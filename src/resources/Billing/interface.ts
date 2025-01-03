/** @format */

import { Document } from "mongoose";

export default interface Billing extends Document {
  billingId: { type: String; unique: true; index: true };
  invoiceNo: { type: String; unique: true; index: true };
  branchId: { type: String; index: true };
  userId: { type: String; index: true };
  fullName: { type: String; index: true };
  phoneNo: { type: String; index: true };
  emailId: { type: String; index: true };
  companyName: String;
  branchName: String;
  centreName: String;
  branchAddress: String;
  memberAddress: String;
  gstNo: String;
  link: String;
  // subscriptionDetails: { type: String, index: true },
  itemList: [{
      name: String,
      itmeType: String,
      id: String, // this id will be used to assign this item to user
      planId: String,
      planName: String,
      packageId: String,
      packageName: String,
      trainerName: String,
      startDate: Date,
      validity: Date,
      endDate: Date,
      discount: { type: Number, default: 0 }, // discount in amomunt
      amount: Number, // actual amount
      discountAmt: Number, // final discounted amount
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
      gstTotal: { type: Number, default: 0 }, // addition of all gst
      total: Number,
      gstChargedOn: String,
      taxPercent: Number,
      sessionId: String,
      commissionAmount: Number,
      productId: String,
      quantity: Number,
      itemName: String,
      transferTo: String,
      transferToName: String,
      transferDate: Date,
      transferFrom: String,
      transferFromName: String
  }],
  note: String;
  date: { type: Date; index: true };
  cgst: { type: Number; default: 0 };
  sgst: { type: Number; default: 0 };
  igst: { type: Number; default: 0 };
  gstTotal: { type: Number; default: 0 };
  key: String;
  discount: { type: Number; default: 0 }; // discount in amount
  amount: Number; // actual amount
  discountAmt: Number; // final discounted amount
  taxAmt: Number; // tax amount
  total: Number;
  finalAmount: Number;
  shippingCharges: Number;
  paidAmount: { type: Number; default: 0 };
  pendingAmount: Number;
  writeOffAmount: Number;
  writeOffDate: Date;
  dueDate: Date;
  paymentId: [String];
  paymentStatus: {
    type: String;
    enum: ["Partial", "Pending", "Paid", "WriteOff"];
    default: "Pending";
    index: true;
  };
  invoiceStatus: {
    type: String;
    enum: ["Cancelled", "Success", "Closed"];
    default: "Success";
  };
  logo: String;
  gstChargedOn: String;
  gstStatus: String;
  createdBy: String;
  updatedBy: String;
  createdByName: String;
  updatedByName: String;
  comment: String;
  manualRecpritNumber: String;
  billType: String;
  memberGSTNo: String;
  lastPaymentId: String;
  lastPaymentcomment: String;
  assignedTo: String;
  assignedToName: String;
  autoRenewal: { type: Boolean; default: false };
  isLatest: { type: Boolean; default: true };
  resale: {
    status: Boolean;
    price: Number;
  };
  // need to remove this dates
  createDate: Date;
  updatedAt: Date;
}
