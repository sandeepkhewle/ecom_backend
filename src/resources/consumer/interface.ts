import { Document } from "mongoose";

export default interface iConsumer extends Document {
  name: string;
  lastName: string;
  firstName: string;
  phoneNo: string;
  emailId: string;
  defaultAddress: {
    address: string;
    city: string;
    district: string;
    taluka: string;
    state: string;
    pincode: string;
    country: string;
  };
  address: Array<{
    address: string;
    city: string;
    district: string;
    taluka: string;
    state: string;
    pincode: string;
    country: string;
  }>;
  gstNumber?: string;
  isVerified: boolean;
  password: string;
  otp: String;
  otpTime: Date;
  otpVerified: { type: Boolean; default: false };
  isValidPassword(password: string): Promise<boolean>;
}
