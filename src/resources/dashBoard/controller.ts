import { Router, Request, Response, NextFunction } from "express";
import Controller from "utils/interface/controller.interface";
import HttpException from "@/utils/http.exception";
import catchAsync from "@/utils/catchAsync";
import otpService from "@/utils/gobalServices/otp.service";
import Dashboard from "@/resources/dashBoard/services";


// Dashboard content API
class dashBoardController implements Controller {
    public path = '/dashboard';
    public router = Router();
    public Dashboard = new Dashboard();

    constructor() {
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post(`${this.path}/salesPanel/getTotalSales`,  this.getTotalSales);
        this.router.post(`${this.path}/salesPanel/getSalesTrend`,  this.getSalesTrend);
        this.router.post(`${this.path}/salesPanel/getSalesPerProductsCategory`,  this.getSalesPerProductsCategory);
        this.router.post(`${this.path}/salesPanel/getRevenueByChannel`,  this.getRevenueByChannel);
        this.router.post(`${this.path}/salesPanel/getRepeatAndNewOrders`,  this.getRepeatAndNewOrders);
        this.router.post(`${this.path}/salesPanel/getProductsStocks`,  this.getProductsStocks);
        this.router.post(`${this.path}/salesPanel/getProductPerformance`,  this.getProductPerformance);
        this.router.post(`${this.path}/salesPanel/getPopulareProducts`,  this.getPopulareProducts);
        this.router.post(`${this.path}/salesPanel/getOrderStatus`,  this.getOrderStatus);
        this.router.post(`${this.path}/salesPanel/getLowStockProducts`,  this.getLowStockProducts);
        this.router.post(`${this.path}/salesPanel/getAverageOrderFinalAmount`,  this.getAverageOrderFinalAmount);
    }


    private getTotalSales = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const totalSales = await this.Dashboard.getTotalSales(req.body);
            res.status(200).json({ totalSales })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getSalesTrend = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getSalesTrend = await this.Dashboard.getSalesTrend(req.body);
            res.status(200).json({ getSalesTrend })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getSalesPerProductsCategory = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getSalesPerProductsCategory = await this.Dashboard.getSalesPerProductsCategory(req.body);
            res.status(200).json({ getSalesPerProductsCategory })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getRevenueByChannel = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getRevenueByChannel = await this.Dashboard.getRevenueByChannel(req.body);
            res.status(200).json({ getRevenueByChannel })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getRepeatAndNewOrders = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getRepeatAndNewOrders = await this.Dashboard.getRepeatAndNewOrders(req.body);
            res.status(200).json({ getRepeatAndNewOrders })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getProductsStocks = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getProductsStocks = await this.Dashboard.getProductsStocks(req.body);
            res.status(200).json({ getProductsStocks })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getProductPerformance = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getProductPerformance = await this.Dashboard.getProductPerformance(req.body);
            res.status(200).json({ getProductPerformance })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getPopulareProducts = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getPopulareProducts = await this.Dashboard.getPopulareProducts(req.body);
            res.status(200).json({ getPopulareProducts })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getOrderStatus = await this.Dashboard.getOrderStatus(req.body);
            res.status(200).json({ getOrderStatus })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getLowStockProducts = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getLowStockProducts = await this.Dashboard.getLowStockProducts(req.body);
            res.status(200).json({ getLowStockProducts })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
    private getAverageOrderFinalAmount = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const getAverageOrderFinalAmount = await this.Dashboard.getAverageOrderFinalAmount(req.body);
            res.status(200).json({ getAverageOrderFinalAmount })
        } catch (error : any) {
            next(new HttpException(error.statusCode, error.message));
        }
    });
}

export default dashBoardController;