import dotenv from "dotenv";
import { Router } from "express";
import {
    handleSpotifyAuthCallback,
    handleSpotifyAuthLogin,
} from "../../controllers/auth.controller";
import { sessionMiddleware } from "../../middleware/session";

dotenv.config();

const authRouter = Router();
authRouter.use(sessionMiddleware);

authRouter.get("/login", async (req, res) => {
    await handleSpotifyAuthLogin(res);
});

authRouter.get("/callback", async (req, res) => {
    await handleSpotifyAuthCallback(req, res);
});

export default authRouter;
