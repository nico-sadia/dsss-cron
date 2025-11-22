import { NextFunction, Request, Response } from "express";

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
