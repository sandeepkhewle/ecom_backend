import { Request, Response, NextFunction, response } from "express";
import HttpException from '@/utils/http.exception';

function errorMiddleware(
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const status = error.status ? error.status : 500
    const message = error.message ? error.message : "Something went Wrong"

    res.status(status).send({
        status,
        message
    })
}

export default errorMiddleware;