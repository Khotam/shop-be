import { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 2 });

const getUrlFromRequest = (req: Request) => {
  const url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;

  return url;
};

const set = (req: Request, res: Response, next: NextFunction) => {
  const url = getUrlFromRequest(req);
  cache.set(url, res.locals.data);

  return next();
};

const get = (req: Request, res: Response, next: NextFunction) => {
  const url = getUrlFromRequest(req);
  const content = cache.get(url);
  if (content) {
    return res.status(200).json({ data: content });
  }

  return next();
};

export default {
  get,
  set,
};
