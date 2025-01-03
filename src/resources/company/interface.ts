import { Document } from 'mongoose';

export default interface company extends Document {
    name: String;
    phoneNo: String;
    emailId: String;
    companyLogo: String;
    companyInvoiceNo: String;
    website: String;
    companyAddress: {
        address: String,
        city: String,
        locality: String,
        state: String,
        pincode: String,
    }
    defaultBillingAddress: {
        address: String,
        city: String,
        locality: String,
        state: String,
        pincode: String,
    }
    billingAddress: Array<{
        address: String,
        city: String,
        locality: String,
        state: String,
        pincode: String,
    }>;
    shippingAddress: Array<{
        address: String,
        city: String,
        locality: String,
        state: String,
        pincode: String,
    }>
    docs: Array<{
        uploadDate: Date,
        fileUrl: String,
        fileType: String,
        fileName: String,
        extension: String
    }>
    gstNumber: String,
    panNumber: String,
    roles: Array<String>,
    lastEmployeNo: Number,
    lastOrderNo: Number,
    lastInvoiceNo: Number

    isValidPassword(password: String): Promise<Error | boolean>;

}
