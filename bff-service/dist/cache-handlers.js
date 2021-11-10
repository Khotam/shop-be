"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 10 });
const getUrlFromRequest = (req) => {
    const url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    return url;
};
const set = (req, res, next) => {
    const url = getUrlFromRequest(req);
    cache.set(url, res.locals.data);
    return next();
};
const get = (req, res, next) => {
    const url = getUrlFromRequest(req);
    const content = cache.get(url);
    if (content) {
        return res.status(200).json({ data: content });
    }
    return next();
};
exports.default = {
    get,
    set,
};
//# sourceMappingURL=cache-handlers.js.map