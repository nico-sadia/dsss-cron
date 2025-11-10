import dotenv from "dotenv";
import { Router } from "express";
import {
    handleSpotifyAuthCallback,
    handleSpotifyAuthLogin,
} from "../../controllers/auth.controller";
import { dbClient } from "../../db";
import { sessionMiddleware } from "../../middleware/session";
import { baseLogger } from "../../utils/logger";

dotenv.config();

const authRouter = Router();
authRouter.use(sessionMiddleware);

authRouter.get("/", async (req, res) => {
    const sessionId = req.sessionID;
    baseLogger.debug({ session_id: req.sessionID });

    const userId = await dbClient.getSpotifyUserIdFromSession(sessionId);

    baseLogger.debug({ user_id: userId });

    userId ? res.status(200).json(userId) : res.status(404).json(userId);
});

authRouter.get("/login", handleSpotifyAuthLogin);
authRouter.get("/callback", handleSpotifyAuthCallback);

export default authRouter;
