import { Document } from "mongoose";

export default interface notification extends Document{
    notification : string,
    notificationType : string,
    createdAt : Date,
    company : string,
    createdBy : string,
}
