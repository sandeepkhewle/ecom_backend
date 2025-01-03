import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interface/controller.interface';
import HttpException from '@/utils/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/company/validation';
import notificationServices from '@/resources/notification/services';
import { query, queryMiddleware } from '@/middleware/queryMiddleware';
import { any } from 'joi';

class notificationController implements Controller {
    public path = '/notification';
    public router = Router();
    private notificationService = new notificationServices();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}/:id`, queryMiddleware, this.registernotification
        );
        this.router.get(
            `${this.path}/:id`, queryMiddleware, this.fetchSinglenotification
        )
        this.router.patch(
            `${this.path}/:notificationId`, queryMiddleware, this.updatenotification
        )
        this.router.delete(
            `${this.path}/:notificationId`, queryMiddleware, this.deletenotification
        )
        this.router.get(
            `${this.path}/all`, this.fetchAllnotifications
        )
    }

    private registernotification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const body = req.body;
            // const {id} = req.params;
            const notification = await this.notificationService.create(body);
            res.status(201).json({ payload: notification });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    };
    private fetchSinglenotification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { id } = req.query;
            console.log(id);

            const singlenotification = await this.notificationService.fetchSingleNotification(id);

            res.status(200).json({ payload: singlenotification });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    }
    private fetchAllnotifications = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const notifications = await this.notificationService.fetchAllhNotification();
            res.status(200).json({ payload: notifications });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    }

    private updatenotification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const body = req.body;
            const updatenotification = await this.notificationService.updateNotification(id, body);
            res.status(200).json({ payload: updatenotification });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));

        }
    }

    private deletenotification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const deletenotification = await this.notificationService.deleteNotification(id);
            res.status(200).json({ payload: deletenotification });
        } catch (error: any) {
            next(new HttpException(error.statusCode, error.message));
        }
    }
}

export default notificationController;
