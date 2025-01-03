import mongoose, { Schema, model } from 'mongoose';
import iPaymentSysteam from './interface';
import bcrypt from 'bcrypt'

const paymentSysteamSchema = new Schema(
    {
        amount : String,
        paymentType : String,
        paymentDate : String,
        
        prevCredit : String,
        newCredit : String,
        creditAssignByName : String,
        creditAssignDate : String,
        reduceCreditReason : String,

        paymentClearingDate : String,
        nameOfBank : String,
        transactionId : String,
        paymentAgainstInvoiceNo : String,
        // recordedBy : String,

        chequeNo : String,
        companyName : String,
        amountReceiverName : String,
        paymentByName : String,
        amountReceiverId : {type : mongoose.Schema.Types.ObjectId , ref : "salesUsers"},
        comapany_id : {type : mongoose.Schema.Types.ObjectId , ref : "companys"},
    }, { timestamps: true }
);



export default model<iPaymentSysteam>('paymentSysteam', paymentSysteamSchema);
