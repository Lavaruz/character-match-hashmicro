import express, {Response, Request, NextFunction} from "express";
import { verifyWebRoute } from "../configs/jwt";

const webRouter = express.Router();

/* General Route */
webRouter.get("/login", (req:Request, res:Response) => {
  res.render("login");
});

webRouter.get("/register", (req:Request, res:Response) => {
  res.render("register");
});

/* Authenticated Route - Need Login! */
webRouter.get('/', verifyWebRoute, (req, res) => {
    res.render('check');
});

export = webRouter;
