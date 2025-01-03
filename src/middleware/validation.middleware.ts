import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi, { object } from 'joi';
import iCompany from '@/resources/company/interface'
function validationMiddleware(schema: Joi.Schema): RequestHandler {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };
        const body: iCompany = req.body
        try {
            const value = await schema.validateAsync(
                { ...body },
                validationOptions
            );
            // req.body = value;
            next();
        } catch (e: any) {
            const errors: string[] = [];
            e.details.forEach((error: Joi.ValidationErrorItem) => {
                errors.push(error.message);
            });
            res.status(400).send({ errors: errors });
        }
    };
}

export default validationMiddleware;
