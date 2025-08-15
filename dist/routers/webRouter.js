"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const jwt_1 = require("../configs/jwt");
const webRouter = express_1.default.Router();
/* General Route */
webRouter.get("/login", (req, res) => {
    res.render("login");
});
webRouter.get("/register", (req, res) => {
    res.render("register");
});
/* Authenticated Route - Need Login! */
webRouter.get('/', jwt_1.verifyWebRoute, (req, res) => {
    res.render('check');
});
module.exports = webRouter;
//# sourceMappingURL=webRouter.js.map