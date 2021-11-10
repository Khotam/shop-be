"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
const responseHandler = (req, res) => {
    return res.status(res.locals.status).json(res.locals.data);
};
exports.responseHandler = responseHandler;
//# sourceMappingURL=response-handler.js.map