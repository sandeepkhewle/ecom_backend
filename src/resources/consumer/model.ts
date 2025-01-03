import { Model, Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import iConsumer from "./interface";
import { any } from "joi";

// Extend the Mongoose Document with your interface
interface iConsumerDocument extends iConsumer, Document {
  isValidPassword(password: string): Promise<boolean>;
}

interface ConsumerModel extends Model<iConsumerDocument> {
  findOneOrCreate(
    params: { query: any; data: any },
    callback?: (arg: iConsumerDocument) => any
  ): Promise<iConsumerDocument>;
}

const ConsumerSchema = new Schema<iConsumerDocument>(
  {
    name: {
      type: String,
      index: true,
      required: [true, "Name required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password required"],
    },
    otp: String,
    otpTime: Date,
    otpVerified: { type: Boolean, default: false },
    emailId: {
      type: String,
      required: [true, "EmailId required"],
      index: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    gstNumber: {
      type: String,
      validate: [validateGSTNumber, "{PATH} - invalid GST number"], // Example validation
    },
    phoneNo: {
      type: String,
      index: true,
    },
    defaultAddress: {
      address: String,
      city: String,
      district: String,
      taluka: String,
      state: String,
      pincode: String,
      country: String,
    },
    address: [
      {
        address: String,
        city: String,
        district: String,
        taluka: String,
        state: String,
        pincode: String,
        country: String,
      },
    ],
  },
  { timestamps: true }
);

// Create text index for search
ConsumerSchema.index({ name: "text", phoneNo: "text", emailId: "text" });

// Method to check if the password is valid
ConsumerSchema.methods.isValidPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Static method to find one or create
ConsumerSchema.statics.findOneOrCreate = async function (
  params: { query: any; data: any },
  callback?: (arg: iConsumerDocument) => any
) {
  const { query, data } = params;
  const obj = await this.findOne(query);

  if (obj && callback) return callback(obj);
  return obj || this.create(data);
};

// function to validate GST number
function validateGSTNumber(gstNumber: string) {
  const gstNumberRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  return gstNumberRegex.test(gstNumber);
}

// Define the Consumer model
const ConsumerModel = model<iConsumerDocument, ConsumerModel>(
  "consumers",
  ConsumerSchema
);

export default ConsumerModel;
