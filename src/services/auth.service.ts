import { Request } from "express";
import { dbClient } from "../db";
import { spotifyClient } from "../spotify";
import { getLogger } from "../utils/logContext";
import { baseLogger } from "../utils/logger";

export const checkAccessToken = async (userId: string) => {
    const logger = getLogger();
    const user = await dbClient.getSpotifyUserFromUserId(userId);
    if (!user) throw new Error("User not found");

    const { access_token, refresh_token, expires_at } = user;

    if (expires_at > Date.now()) {
        return access_token;
    }

    logger.info("AUTH: Fetching new access token");
    const newAccessToken = await spotifyClient.auth.getRefreshToken(
        refresh_token
    );

    if (!newAccessToken) throw new Error("Failed to refresh access token");

    logger.info("DB: Updating access token in db");
    await dbClient.updateAccessToken(userId, newAccessToken);

    return newAccessToken;
};

export const initiateSpotifyAuth = async () => {
    return spotifyClient.auth.getAuthonizationUrl();
};

export const handleAuthCallback = async (req: Request, code: string) => {
    const tokens = await spotifyClient.auth.getAuthTokens(code);
    const userData = await spotifyClient.user.getUserProfile(
        tokens.access_token
    );

    baseLogger.info({ user_id: userData.id });
    baseLogger.info({ sid: req.sessionID });

    req.session.user_id = userData.id;

    await dbClient.upsertSpotifyUser(
        userData.id,
        tokens.access_token,
        tokens.refresh_token
    );
};

export const validateUserSession = async (req: Request) => {
    const sessionId = req.sessionID;
    const sessionExists = await dbClient.sessionExists(sessionId);

    if (!sessionExists) {
        baseLogger.warn("AUTH: Invalid session, user must log in");
        throw new Error("Session does not exist, please login with spotify");
    }

    return sessionExists.exists;
};
