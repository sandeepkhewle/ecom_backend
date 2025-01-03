import { Router, Request, Response, NextFunction } from "express";
import Controller from "utils/interface/controller.interface";
import HttpException from "@/utils/http.exception";
import shipRocketServices from "./services";
import catchAsync from "@/utils/catchAsync";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import aclMiddleware from "@/middleware/aclMiddleware";
import otpService from "@/utils/gobalServices/otp.service";
import Dashboard from "@/resources/dashBoard/services";


class ShipRocketController implements Controller {
    public path = '/shipment';
    public router = Router();
    public shipRocketServices = new shipRocketServices();
    public Dashboard = new Dashboard();
    public otpService = new otpService();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {

        // Login SalesUser
        this.router.post(
            `${this.path}/fetchShipCharge`, this.fetchShipCharge
        );

    
    }

    private fetchShipCharge = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            console.log("/shipment/fetchShipCharge");
            const data = await this.shipRocketServices.getShipmentCharges(req.body);
            res.status(200).json(data);
        } catch (error: any) {
            // next(new HttpException(400, error.message));
            console.error(error.message);
            res.status(error.status).json({ error: error.message, status: error.status })
        }
    };

   

   



}
export default ShipRocketController;