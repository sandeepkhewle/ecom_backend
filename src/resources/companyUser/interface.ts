import { Document } from 'mongoose'
export default interface User extends Document {
    firstName: String;
    lastName: String;
    emailId: String;
    phoneNo: String;
    profilePic: String;
    password: String;
    role: String;
    reportingToRole: String;
    lastLogIn: Date;
    lastUpdatedBy: String;
    createBy: String;
    createdByName: String;
    reportingTo: String;
    company_id: String;
    otp: String,
    otpTime: Date,
    adminDocs: {
        uploadDate: Date,
        fileUrl: String,
        approval: Boolean
    };
    docs: {
        uploadDate: Date,
        fileUrl: String,
        fileType: String,
        fileName: String,
        extension: String
    },

    isValidPassword(password: String): Promise<Error | boolean>;
}


