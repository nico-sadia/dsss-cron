import dotenv from "dotenv";
import { Router } from "express";
import session from "express-session";
import {
    handleSpotifyAuthCallback,
    handleSpotifyAuthLogin,
} from "../../controllers/auth.controller";
import { db } from "../../db/database";

dotenv.config();

const sess = session({
    store: new (require("connect-pg-simple")(session))({
        pgPromise: db,
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 24 * 365 * 10000,
    },
});

const authRouter = Router();
authRouter.use(sess);

authRouter.get("/login", async (req, res) => {
    await handleSpotifyAuthLogin(res);
});

authRouter.get("/callback", async (req, res) => {
    await handleSpotifyAuthCallback(req, res);
});

export default authRouter;
