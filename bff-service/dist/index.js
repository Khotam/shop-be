"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cache_handlers_1 = __importDefault(require("./handlers/cache-handlers"));
const main_handler_1 = require("./handlers/main-handler");
const response_handler_1 = require("./handlers/response-handler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.port || 3001;
app.use(express_1.default.json());
app.get("/", (req, res) => res.json({ ping: "pong" }));
app.get("/products", cache_handlers_1.default.get, main_handler_1.mainHandler, cache_handlers_1.default.set, response_handler_1.responseHandler);
app.use("*", main_handler_1.mainHandler, response_handler_1.responseHandler);
app.listen(PORT, () => console.log(`App running at http://localhost:${PORT}`));
//# sourceMappingURL=index.js.map