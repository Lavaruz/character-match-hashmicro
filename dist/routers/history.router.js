"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const history_controller_1 = require("../controllers/history.controller");
const jwt_1 = require("../configs/jwt");
const limiter_1 = require("../configs/limiter");
const encription_helper_1 = require("../configs/encription-helper");
const historyRouter = (0, express_1.Router)();
historyRouter.get('/', jwt_1.requireAuth, history_controller_1.historyGetAll);
historyRouter.post('/check', jwt_1.requireAuth, limiter_1.historiesLimiter, encription_helper_1.decryptBody, history_controller_1.historyCheckMatch);
historyRouter.put('/:id', jwt_1.requireAuth, limiter_1.historiesLimiter, encription_helper_1.decryptBody, history_controller_1.historyUpdate);
historyRouter.delete('/:id', jwt_1.requireAuth, limiter_1.historiesLimiter, history_controller_1.historyDelete);
exports.default = historyRouter;
//# sourceMappingURL=history.router.js.map