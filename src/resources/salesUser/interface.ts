import { Document } from 'mongoose';

export default interface company extends Document {
    salesId: String,
    password: String,
    fullName: String,
    mobile: String,
    emailId: String,
    dob: String,
    age: String,
    address: String,
    city: String,
    state: String,
    country: String,
    joiningDate: Date,
    post: String,
    status: String,
    role: String,
    roleId: Number,
    profilePic: String,
    remark: String,
    reportingTo: String,
    reportingToRole: String,
    updatedBy: String,
    gstNumber : String
    otp: String,
    otpTime: Date,
    otpVerified: { type: Boolean, default: false },
    sessionId: String,
    sessionTime: Date,
    sessionVerified: { type: Boolean, default: false },
    isValidPassword(password: String): Promise<Error | boolean>;

}
