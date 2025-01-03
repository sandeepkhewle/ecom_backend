import { Schema, model } from 'mongoose';
import amazon from './interface';



let amazonSchema = new Schema({
    name : String,
    expires_in:  String,
    token_type:  String,
    refresh_token:  String,
    access_token:  String,
}, { timestamps: true })



export default model<amazon>('amazons', amazonSchema);