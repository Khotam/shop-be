import { Application } from "express";
import express from "express";
import dotenv from "dotenv";
import cache from "./handlers/cache-handlers";
import { mainHandler } from "./handlers/main-handler";
import { responseHandler } from "./handlers/response-handler";

dotenv.config();

const app: Application = express();
const PORT = process.env.port || 3001;

app.use(express.json());
app.get("/", (req, res) => res.json({ ping: "pong" }));
app.get("/products", cache.get, mainHandler, cache.set, responseHandler);
app.use("*", mainHandler, responseHandler);

app.listen(PORT, () => console.log(`App running at http://localhost:${PORT}`));
