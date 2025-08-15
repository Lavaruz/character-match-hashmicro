"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const limiter_1 = require("../configs/limiter");
const encription_helper_1 = require("../configs/encription-helper");
const userRouter = (0, express_1.Router)();
userRouter.post('/login', limiter_1.authLimiter, encription_helper_1.decryptBody, user_controller_1.userLogin);
userRouter.post('/register', limiter_1.authLimiter, encription_helper_1.decryptBody, user_controller_1.userCreate);
userRouter.post('/logout', user_controller_1.userLogout);
exports.default = userRouter;
//# sourceMappingURL=user.router.js.map