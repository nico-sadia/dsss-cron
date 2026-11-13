import { Request } from "express";
import { dbClient } from "../db";
import { spotifyClient } from "../spotify";
import { getLogger } from "../utils/logContext";
import { baseLogger } from "../utils/logger";
import { generateRandomString } from "../utils/helpers";
import {
    SpotifyApiError,
    SpotifyReauthRequiredError,
} from "../spotify/error";
import { SpotifyTokenResponse } from "../spotify/types";

export const checkAccessToken = async (userId: string) => {
    const logger = getLogger();
    const user = await dbClient.getSpotifyUserFromUserId(userId);
    if (!user) throw new Error("User not found");

    const { access_token, refresh_token, expires_at } = user;

    if (user.spotify_reauth_required) {
        throw new SpotifyReauthRequiredError();
    }

    if (expires_at > Date.now()) {
        return access_token;
    }

    logger.info("AUTH: Fetching new access token");
    let tokens: SpotifyTokenResponse;
    try {
        tokens = await spotifyClient.auth.getRefreshToken(refresh_token);
    } catch (err) {
        if (err instanceof SpotifyApiError && err.code === "invalid_grant") {
            await dbClient.markSpotifyReauthRequired(userId);
            throw new SpotifyReauthRequiredError();
        }
        throw err;
    }

    if (!tokens.access_token) {
        throw new Error("Failed to refresh access token");
    }

    logger.info("DB: Updating access token in db");
    await dbClient.updateAccessToken(
        userId,
        tokens.access_token,
        Date.now() + tokens.expires_in * 1000,
        tokens.refresh_token
    );

    return tokens.access_token;
};

export const initiateSpotifyAuth = async (req: Request) => {
    const state = generateRandomString(32);
    req.session.oauth_state = state;
    return spotifyClient.auth.getAuthorizationUrl(state);
};

export const handleAuthCallback = async (req: Request, code: string) => {
    const tokens = await spotifyClient.auth.getAuthTokens(code);
    if (!tokens.refresh_token) {
        throw new Error("Spotify authorization response did not include a refresh token");
    }

    const userData = await spotifyClient.user.getUserProfile(
        tokens.access_token
    );

    baseLogger.info({ user_id: userData.id });
    baseLogger.info({ sid: req.sessionID });

    req.session.user_id = userData.id;

    await dbClient.upsertSpotifyUser(
        userData.id,
        tokens.access_token,
        tokens.refresh_token,
        Date.now() + tokens.expires_in * 1000
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
