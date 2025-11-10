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

    // const userId = await dbClient.getSpotifyUserIdFromSession(sessionId);
    const sessionExists = await dbClient.sessionExists(sessionId);

    baseLogger.debug({ session_exists: sessionExists });

    sessionExists
        ? res.status(200).json({ isAuthenticated: sessionExists.exists })
        : res.status(404).json({ isAuthenticated: false });
});

authRouter.get("/login", handleSpotifyAuthLogin);
authRouter.get("/callback", handleSpotifyAuthCallback);

export default authRouter;
