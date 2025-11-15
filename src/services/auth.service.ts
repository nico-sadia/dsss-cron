import { Request } from "express";
import { dbClient } from "../db";
import { spotifyAuthClient, spotifyClient } from "../spotify";
import { getLogger } from "../utils/logContext";
import { baseLogger } from "../utils/logger";

export const checkAccessToken = async (userId: string) => {
    const logger = getLogger();
    const user = await dbClient.getSpotifyUserFromUserId(userId);
    if (!user) throw new Error("User not found");

    const { access_token, refresh_token, expires_at } = user;

    if (expires_at > Date.now()) {
        logger.info("AUTH: Access token still valid");
        return access_token;
    }

    logger.info("AUTH: Fetching new access token");
    const newAccessToken = await spotifyAuthClient.getRefreshToken(
        refresh_token
    );

    if (!newAccessToken) throw new Error("Failed to refresh access token");

    logger.info("DB: Updating access token in db");
    await dbClient.updateAccessToken(userId, newAccessToken);

    return newAccessToken;
};

export const initiateSpotifyAuth = async () => {
    return spotifyAuthClient.getAuthonizationUrl();
};

export const handleAuthCallback = async (req: Request, code: string) => {
    const tokens = await spotifyAuthClient.getAuthTokens(code);
    const userData = await spotifyClient.getUserProfile(tokens.access_token);

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
    baseLogger.debug({ session_id: req.sessionID });

    const sessionExists = await dbClient.sessionExists(sessionId);

    baseLogger.debug({ session_exists: sessionExists });

    if (!sessionExists) {
        baseLogger.warn("AUTH: Invalid session, user must log in");
        throw new Error("Session does not exist, please login with spotify");
    }

    return sessionExists;
};
