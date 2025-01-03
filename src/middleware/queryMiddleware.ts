import { Request, Response, NextFunction } from "express";

interface LooseObject {
    [key: string]: string | any,
}

let query: LooseObject = {}
const queryMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    Object.keys(req.query).map(q =>
        query[q] = req.query[q]
    )
    Object.keys(req.params).map(q =>
        query[q] = req.params[q]
    )
    req.query = query
    next();
}


export { query, queryMiddleware }; 