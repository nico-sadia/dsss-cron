import { Session, dbClient } from "../db";
import { spotifyAuthClient } from "../spotify";
import { getLogger } from "../utils/logContext";
import { baseLogger } from "../utils/logger";

export const checkAccessToken = async (
    expireTime: number,
    refreshToken: string,
    sessionAccessToken: string,
    session: Session
) => {
    const logger = getLogger();

    //Get recently played tracks using access token from DB or by refreshing
    if (expireTime > Date.now()) {
        logger.info("AUTH: Access token still valid");
        return sessionAccessToken;
    }

    logger.info("AUTH: Fetching new access token");
    const accessToken = await spotifyAuthClient.getRefreshToken(refreshToken);
    if (accessToken) {
        logger.info("DB: Updating access token in db");
        await dbClient.updateDBAccessToken(accessToken, session);
    }
    return accessToken;
};

export const initiateSpotifyAuth = async () => {
    return spotifyAuthClient.getAuthonizationUrl();
};

export const handleAuthCallback = async (code: string) => {
    const tokens = await spotifyAuthClient.getAuthTokens(code);
    baseLogger.debug({ tokens: tokens });
};
