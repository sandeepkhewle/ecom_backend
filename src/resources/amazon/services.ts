import axios from "axios";
import ShipRocketModel from "./model";
import HttpException from "@/utils/http.exception";
import { v4 as uuidv4 } from 'uuid';
import { pickuplocations } from "../ShipRocket/model";
import { iShipRocketOrderStatus } from '@/resources/order/interface'
import AWSSES from "@/utils/gobalServices/sesAws";
class AmazonService {
    private ShipRocketModel = ShipRocketModel;
    private pickuplocationsModel = pickuplocations;
    private emailService = new AWSSES();

    public async axiosMethod(url: string, method: string, token: any, body?: any , contentType?:string): Promise<any> {
        try {
            const config = {
                method: method,
                url: url,
                maxBodyLength: Infinity,
                data: body ? body : {},
                headers: {
                    'Content-Type': contentType ? contentType : 'application/json',
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
                "grant_type": process.env.amazon_grant_type,
                "refresh_token": process.env.amazon_refresh_token,
                "client_id": process.env.amazon_client_id,
                "client_secret": process.env.amazon_client_secret
            }
            console.log("body--------", body);
            const token: any = await this.axiosMethod(`https://api.amazon.com/auth/o2/token`, 'post', "", body,"application/x-www-form-urlencoded")

            const tokenUpdate = await this.ShipRocketModel.findOneAndUpdate({ name: "token" }, { token: token?.data?.token }, { upsert: true, new: true })
            console.log("tokenUpdate--------", tokenUpdate);
            return token
        } catch (error: any) {
            console.log("getToken", error);
            throw new HttpException(500, error)

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

export default AmazonService