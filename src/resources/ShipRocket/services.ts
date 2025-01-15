import axios from "axios";
import ShipRocketModel from "./model";
import HttpException from "@/utils/http.exception";
import { v4 as uuidv4 } from 'uuid';
import { pickuplocations } from "../ShipRocket/model";
import { iShipRocketOrderStatus } from '@/resources/order/interface'
import AWSSES from "@/utils/gobalServices/sesAws";
class ShipRocket {
    private ShipRocketModel = ShipRocketModel;
    private pickuplocationsModel = pickuplocations;
    private emailService = new AWSSES();

    public async axiosMethod(url: string, method: string, token: any, body?: any): Promise<any> {
        try {
            const config = {
                method: method,
                url: url,
                maxBodyLength: Infinity,
                data: body ? body : {},
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ``
                }
            }

            console.log("config=======================", config);
            const res = await axios(config)

            return res
        } catch (error: any) {
            console.log("axiosMethod error----------", JSON.stringify(error?.response?.data?.errors));
            // throw new HttpException(error.status , error)
            return error

        }
    }


    public async getToken() {
        try {
            const body = {
                "email": process.env.shipRocket_email,
                "password": process.env.shipRocket_password
            }
            console.log("body--------", body);
            const token: any = await this.axiosMethod(`${process.env.shipRocketUrl}/auth/login`, 'post', "", body)

            const shipmentCharge = await this.ShipRocketModel.findOneAndUpdate({ name: "token" }, { token: token?.data?.token }, { upsert: true, new: true })
            console.log("shipmentCharge--------", shipmentCharge);
            return shipmentCharge
        } catch (error: any) {
            console.log("getToken", error);
            throw new HttpException(500, error)

        }
    }

    public async findPickUpLocation(delivery_postcode: string): Promise<any> {
        try {
            const dp = delivery_postcode.toString().slice(0, 2)

            return await this.pickuplocationsModel.findOne({ states: { $in: [dp] } })
        } catch (error) {
            console.log("error", error);

        }
    }




    public async getShipmentCharges(body: any) {
        try {
            let pickupLocation = await this.findPickUpLocation(body?.delivery_postcode)
            if (!pickupLocation) {
                throw new HttpException(500, "Can not find pickup location")
            }
            let delivery_postcode = body?.delivery_postcode;
            let cod = body?.cod || 0
            let weight: number = Number(body?.weight)
            let qc_check = body?.qc_check;
            let pickup_postcode = pickupLocation?.pincode;
            console.log("weight", weight);

            let token: any = await this.ShipRocketModel.findOne({ name: "token" })
            let shipmentCharge: any = await this.axiosMethod(`${process.env.shipRocketUrl}/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&cod=${cod}&weight=${weight}&qc_check=${qc_check}`, 'get', token?.token)

            if (shipmentCharge?.status === 401 || shipmentCharge?.status === 502) {
                token = await this.getToken()
                shipmentCharge = await this.axiosMethod(`${process.env.shipRocketUrl}/courier/serviceability/?pickup_postcode=${pickupLocation}&delivery_postcode=${delivery_postcode}&cod=${cod}&weight=${weight}&qc_check=${qc_check}`, 'get', token?.token)
            }

            if (shipmentCharge?.response?.data?.status_code === 403 || shipmentCharge?.response?.data?.status_code === 422) {
                throw new HttpException(shipmentCharge?.response?.data?.status_code, shipmentCharge?.response?.data?.message)
            }
            console.log("shipmentCharge?.response?.data", shipmentCharge?.data?.data?.available_courier_companies);

            return this.chippestCourier(shipmentCharge?.data?.data?.available_courier_companies)
        } catch (error: any) {
            console.log("getShipmentCharges----------", error);
            throw new HttpException(error?.status, error)

        }
    }

    public async chippestCourier(data: any) {
        // return data?.sort((a: any, b: any) => a?.rate - b?.rate)[0];
        return data.find((co:any)=> co?.courier_company_id == 6)
    }

    public async createShipmentOrder(body: any) {
        try {
            // console.log("createShipmentOrder", body);

            const shipmentOrderId: string = uuidv4();
            const data = {
                order_id: shipmentOrderId,
                order_date: body.order_date,
                courier_id: body.courier_company_id,
                billing_customer_name: body?.billing_customer_name,
                billing_last_name: body?.billing_last_name,
                billing_address: body?.billing_address,
                billing_city: body?.billing_city,
                billing_pincode: body?.billing_pincode,
                billing_state: body?.billing_state,
                billing_country: body?.billing_country,
                billing_email: body?.billing_email,
                billing_phone: body?.billing_phone,
                shipping_is_billing: body?.shipping_is_billing,
                order_items: body?.order_items,
                payment_method: body?.payment_method,
                sub_total: body?.sub_total,
                length: body?.length,
                breadth: body?.breadth,
                height: body?.height,
                weight: body?.weight,
                pickup_location: body?.pickup_location,
                vendor_details: body?.vendor_details

            };
            let token: any = await this.ShipRocketModel.findOne({ name: "token" });
            let res: any = await this.axiosMethod(`${process.env.shipRocketUrl}/shipments/create/forward-shipment`, `post`, token?.token, JSON.stringify(data));
            if (res?.status === 401 || res?.status === 502) {
                token = await this.getToken()
                res = await this.axiosMethod(`${process.env.shipRocketUrl}/shipments/create/forward-shipment`, `post`, token?.token, JSON.stringify(data));
            }

            return { res, shipmentOrderId: shipmentOrderId }
        } catch (error: any) {
            console.log("createShipmentOrder----------", error);
            throw new HttpException(error?.status, error)
        }
    }

    public async trackShipment(shipment_id: string) {
        try {
            let token: any = await this.ShipRocketModel.findOne({ name: "token" });
            let res: any = await this.axiosMethod(`${process.env.shipRocketUrl}/courier/track/shipment/${shipment_id}`, `get`, token?.token);

            if (res?.status === 401 || res?.status === 502) {
                token = await this.getToken();
                res = await this.axiosMethod(`${process.env.shipRocketUrl}/courier/track/shipment/${shipment_id}`, `get`, token?.token);
            }
            if (res?.status === 200) return res?.data
        } catch (error) {
            console.log("error", error);

        }
    }

    public async cancelOrder(body:any) {
        try {
            let token: any = await this.ShipRocketModel.findOne({ name: "token" });
            let res: any = await this.axiosMethod(`${process.env.shipRocketUrl}/orders/cancel`, `post`, token?.token, JSON.stringify(body));

            if (res?.status === 401 || res?.status === 502) {
                token = await this.getToken();
                res = await this.axiosMethod(`${process.env.shipRocketUrl}/orders/cancel`, `post`, token?.token, JSON.stringify(body));
            }
           
            // console.log("cancel order",res?.data)
            if (res?.status === 200) {
                return res?.data
            }else{
                throw new HttpException(res?.status , res?.response?.data?.message)
            }
        } catch (error) {
            console.log("error", error);
            throw error
        }
    }

    public async webHookForOrderStatus(body: iShipRocketOrderStatus, order: any) {
        try {
            if (body.current_status_id === 20) {
                let emailObj = {
                    toAddress: order?.emailId,
                    ccAddress: process.env.ecomMail,
                    text: `Your Shipment current status is ${body?.current_status}`,
                    html: "",
                    Subject: "Order Status",
                    replyToAddress: process.env.ecomMail,
                    sendFile: false,
                }
                await this.emailService.sendMail(emailObj?.toAddress,emailObj?.ccAddress,emailObj?.text,emailObj?.html,emailObj?.Subject,emailObj?.replyToAddress,emailObj?.sendFile)
            }
        } catch (error) {
            console.log("shiprocket webhook", error);

        }
    }




}

export default ShipRocket