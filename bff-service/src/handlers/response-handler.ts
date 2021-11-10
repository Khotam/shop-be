import { Request, Response } from "express";

export const responseHandler = (req: Request, res: Response) => {
  return res.status(res.locals.status).json(res.locals.data);
};
