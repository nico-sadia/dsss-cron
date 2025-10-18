"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAllRecentlyPlayedSessions = void 0;
const db_1 = require("../db");
const spotify_1 = require("../spotify");
const DBFormatter_1 = require("../utils/DBFormatter");
const logContext_1 = require("../utils/logContext");
const logger_1 = require("../utils/logger");
const auth_service_1 = require("./auth.service");
const processAllRecentlyPlayedSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield db_1.dbClient.getDBSessions();
    if (!sessions) {
        logger_1.baseLogger.error({ job: "recentlyPlayed" }, "DB: No sessions found - aborting job");
        return;
    }
    for (const session of sessions) {
        try {
            yield (0, logContext_1.runWithContext)({ job: "recentlyPlayed", userId: session.sess.user_id }, () => processSession(session));
        }
        catch (err) {
            logger_1.baseLogger.error({ job: "recentlyPlayed", err, userId: session.sess.user_id }, "JOB: Failed to process session");
            continue;
        }
    }
});
exports.processAllRecentlyPlayedSessions = processAllRecentlyPlayedSessions;
const processSession = (session) => __awaiter(void 0, void 0, void 0, function* () {
    const logger = (0, logContext_1.getLogger)();
    logger.info("JOB: Processing next session");
    //Get access token from DB or by refreshing
    let accessToken = yield (0, auth_service_1.checkAccessToken)(session.sess.expires_at, session.sess.refresh_token, session.sess.access_token, session);
    //Get user recently played using access token
    let spotifyData = yield spotify_1.spotifyClient.getRecentlyPlayed(accessToken);
    if (!spotifyData || !spotifyData.items || spotifyData.items.length === 0) {
        logger.warn("API: No tracks found in recently played");
        return;
    }
    logger.debug({ trackCount: spotifyData.items.length }, "API: Fetched tracks from recently played");
    const formattedTracks = spotifyData.items.map((track) => {
        //Format the data to be written to DB
        return (0, DBFormatter_1.formatToTrackDB)(track.track.uri, session.sess.user_id, track.played_at);
    });
    yield insertNewTracks(session.sess.user_id, formattedTracks);
});
const insertNewTracks = (userId, tracks) => __awaiter(void 0, void 0, void 0, function* () {
    const logger = (0, logContext_1.getLogger)();
    //Get recently played tracks of current user from DB
    //Convert them to only the time they were played at for comparison
    const dbTracks = yield db_1.dbClient.getDBRecentlyPlayed(userId, new Date());
    const newTracks = tracks.filter((t) => !dbTracks.some((db) => new Date(db.played_at).getTime() ===
        new Date(t.played_at).getTime()));
    if (newTracks.length === 0) {
        logger.warn("DB: No new tracks to insert");
        return;
    }
    const newTracksQueryStr = newTracks
        .map((t) => `('${t.song_uri}', '${t.user_id}', '${t.played_at}')`)
        .join();
    logger.info("DB: Songs found to insert");
    logger.debug({ trackCount: tracks.length }, "API: Tracks fetched from Spotify");
    logger.debug({ trackCount: newTracks.length }, "DIFF: New tracks");
    db_1.dbClient.insertRecentlyPlayedIntoDB(newTracksQueryStr);
    logger.info("DB: Inserted songs successfully");
});
