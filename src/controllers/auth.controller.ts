import { Request, Response } from "express";
import {
    handleAuthCallback,
    initiateSpotifyAuth,
} from "../services/auth.service";
import { baseLogger } from "../utils/logger";

export const handleSpotifyAuthLogin = async (req: Request, res: Response) => {
    try {
        const url = await initiateSpotifyAuth();
        res.redirect(url);
        baseLogger.info("AUTH: Auth login complete");
    } catch (err) {
        baseLogger.error({ err }, "AUTH: Auth login failed");
        res.status(500).send("Spotify auth failed");
    }
};

export const handleSpotifyAuthCallback = async (
    req: Request,
    res: Response
) => {
    try {
        const { code } = req.query;
        if (!code) {
            baseLogger.error("AUTH: Auth callback failed - missing code");
            return res.status(400).send("Missing code");
        }

        await handleAuthCallback(req, code as string);
        baseLogger.info("AUTH: Auth callback complete");
        res.redirect(process.env.FRONTEND_URL!);
    } catch (err) {
        baseLogger.error({ err }, "AUTH: Auth callback failed");
        res.status(500).send("Spotify auth failed");
    }
};
