import { Request, Response, NextFunction } from 'express';
import token from '@/utils/token';
import Token from '@/utils/interface/token.interface';
import HttpException from '@/utils/http.exception';
import jwt from 'jsonwebtoken';

declare module 'express' {
    interface Request {
        user?: any;
    }
}

async function authenticatedMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {

    
    const bearer = req.headers.authorization;
 console.log(bearer);
 
    
    if (!bearer || !bearer.startsWith('Bearer ')) {
      if (req.user) return next(); // for guest user
      return next(new HttpException(401, "Unauthorised"));
    }
    
    const accessToken = bearer.split('Bearer ')[1].trim();
    try {

      
        const payload: Token | jwt.JsonWebTokenError = await token.verifyToken(accessToken,req.body.pageId);
        if (payload instanceof jwt.JsonWebTokenError) {
            return next(new HttpException(401, 'Unauthorised'));
        }

        if (!payload) {
            return next(new HttpException(401, 'Unauthorised'));
        }
        req.user = payload;
        return next();
    } catch (error) {
        return next(new HttpException(401, 'Unauthorised'));
    }
}

export default authenticatedMiddleware;
