import mongoose from 'mongoose';
import iNotification from './interface'
const notificationSchema = new mongoose.Schema({

    notification: { type: String },
    notificationType : String,
    createdAt: { type: Date, default: new Date() },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "companys"},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'companyusers' },
    // orders: { type: String, default: mongoose.Types.ObjectId, ref: 'orders', required: true }

});
const Notification = mongoose.model<iNotification>("notification", notificationSchema)


export default  Notification; 
