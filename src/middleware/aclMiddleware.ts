import { Request, Response, NextFunction } from 'express';
import HttpException from '@/utils/http.exception';
import acl from '@/utils/JsonData/ACL.json'
declare module 'express' {
    interface Request {
        user?: any;
    }
}

async function aclMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const path = req.route.path;
        const method = req.method;
        const role = req.user.role;
        const aclList = JSON.parse(JSON.stringify((acl)));
        const roleAccess = aclList[role]

        const pageAccess = aclList[role].page.find((ele: any) => {
            if (ele.path === path && ele.method === method) {
                return ele;
            }
        });
        if (role === 'salesUser' || 'businessOwners') {
            return next();
        }
        
        
        if (pageAccess) {
            return next();
        } else {
            throw next(new HttpException(403, 'access denied'))
        }

    } catch (error) {
        return next(new HttpException(401, 'access denied'));
    }
}

export default aclMiddleware;
