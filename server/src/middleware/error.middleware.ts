import type { Request, Response, NextFunction } from "express";
import { log } from "node:console";

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);
    
    res.status(500).json({
    message: "Internal server error",
  });
}