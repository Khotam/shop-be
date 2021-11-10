"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const mainHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { originalUrl, body } = req;
    const recipient = originalUrl.split("/")[1];
    const recipientURL = process.env[recipient];
    if (recipientURL) {
        const axiosConfig = Object.assign(Object.assign({}, (Object.keys(req.body || {}).length > 0 && { data: body })), { method: req.method, headers: { "Content-Type": "application/json" } });
        try {
            const response = yield (0, axios_1.default)(`${recipientURL}${originalUrl}`, axiosConfig);
            res.locals = response;
            //   console.log(`response`, response);
            // res.status(response.status).json(response.data);
            return next();
        }
        catch (error) {
            if (error.response) {
                const { data, status } = error.response;
                res.status(status).json({ data });
            }
            else {
                res.status(500).json({ error: error.message });
            }
        }
    }
    else {
        res.status(502).json({ response: "Cannot process request" });
    }
});
exports.mainHandler = mainHandler;
//# sourceMappingURL=main-handler.js.map