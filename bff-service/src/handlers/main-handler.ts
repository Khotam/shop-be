import axios, { Method } from "axios";
import { NextFunction, Request, Response } from "express";

export const mainHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { originalUrl, body } = req;
  const recipient = originalUrl.split("/")[1];
  const recipientURL = process.env[recipient];
  if (recipientURL) {
    const axiosConfig = {
      ...(Object.keys(req.body || {}).length > 0 && { data: body }),
      method: req.method as Method,
      headers: { "Content-Type": "application/json" },
    };

    try {
      const response = await axios(
        `${recipientURL}${originalUrl}`,
        axiosConfig
      );
      res.locals = response;
      //   console.log(`response`, response);
      // res.status(response.status).json(response.data);
      return next();
    } catch (error) {
      if (error.response) {
        const { data, status } = error.response;
        res.status(status).json({ data });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  } else {
    res.status(502).json({ response: "Cannot process request" });
  }
};
