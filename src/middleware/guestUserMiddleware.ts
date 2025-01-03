import { Request, Response, NextFunction } from "express";

async function guestUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const id = req.headers["x-guest-user-id"];
  if (id) {
    req.user = { type: "guest", cartId: id };
  }
  next();
}

export default guestUserMiddleware;
