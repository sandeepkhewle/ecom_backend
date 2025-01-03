import { Schema, model } from 'mongoose';
import ShipRocket from './interface';



let shipRocketSchema = new Schema({
    name : String,
    token:  String,
}, { timestamps: true })

let pickuplocationsSchema = new Schema({
    zone : String,
    pickuplocation:  String,
    states:  Array,
    email: String,
    phone: String,
    name: String,
    address: String,
    address_2: String,
    city: String,
    state: String,
    country: String,
    pin_code: String,
    pickup_location: String,
    pincode :  String

}, { timestamps: true })





const pickuplocations =  model<any>('pickuplocations', pickuplocationsSchema);
export {pickuplocations}
export default model<ShipRocket>('shipRockets', shipRocketSchema);