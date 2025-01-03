import { Document } from 'mongoose';

export default interface iPaymentSysteam extends Document {
    amount : String,
    paymentMode : String,
    companyName : String,
    paymentDate : String,
    paymentClearingDate : String,
    transactionId : String,
    nameOfBank : String,
    recordedBy : String,
    paymentByName : String,
    paymentAgainstInvoiceNo : String,
    comapany_id : String
    receiver_id : String
    receiverName : String


}
