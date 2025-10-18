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
exports.processAllTopPlayedSessions = void 0;
const db_1 = require("../db");
const spotify_1 = require("../spotify");
const logContext_1 = require("../utils/logContext");
const logger_1 = require("../utils/logger");
const auth_service_1 = require("./auth.service");
const processAllTopPlayedSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield db_1.dbClient.getDBSessions();
    if (!sessions) {
        logger_1.baseLogger.error({ job: "recentlyPlayed" }, "DB: No sessions found - aborting job");
        return;
    }
    for (const session of sessions) {
        try {
            yield (0, logContext_1.runWithContext)({ job: "topPlayed", userId: session.sess.user_id }, () => processSession(session));
        }
        catch (err) {
            logger_1.baseLogger.error({ job: "topPlayed", err, userId: session.sess.user_id }, "JOB: Failed to process session");
            continue;
        }
    }
});
exports.processAllTopPlayedSessions = processAllTopPlayedSessions;
const processSession = (session) => __awaiter(void 0, void 0, void 0, function* () {
    const logger = (0, logContext_1.getLogger)();
    logger.info({ userId: session.sess.user_id }, "JOB: Processing next session");
    if (!session.sess.playlist_id) {
        logger.error("DB: No playlist given to add song to");
        return;
    }
    //Get access token from DB or by refreshing
    let accessToken = yield (0, auth_service_1.checkAccessToken)(session.sess.expires_at, session.sess.refresh_token, session.sess.access_token, session);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dbRecentlyPlayed = yield db_1.dbClient.getDBRecentlyPlayed(session.sess.user_id, yesterday);
    if (dbRecentlyPlayed.length === 0) {
        logger.warn("DB: No tracks found in db");
        return;
    }
    logger.info("DB: Tracks found in DB");
    logger.debug({ trackCount: dbRecentlyPlayed.length });
    let trackListCount = [];
    //Start by selecting the first track name and comparing it to all the track names in the list
    //Return early if trackListCount already has existing track in array (skip redundant iterations)
    //Increment to count if present
    //Add name of track and count to array
    dbRecentlyPlayed.forEach((trackName) => {
        let count = 0;
        const currentURI = trackName.song_uri;
        if (trackListCount.filter((track) => track.song_uri === currentURI)
            .length > 0)
            return;
        dbRecentlyPlayed.forEach((trackToCheck) => {
            if (trackToCheck.song_uri === currentURI)
                count++;
        });
        trackListCount.push({
            played_at: trackName.played_at,
            user_id: trackName.user_id,
            song_uri: currentURI,
            count: count,
        });
    });
    //Sort the list of track counts
    trackListCount = trackListCount.sort((a, b) => b.count - a.count);
    const maxLength = 3;
    const listLength = Math.min(maxLength, dbRecentlyPlayed.length);
    logger.debug(`RESULT: List of top ${listLength} played tracks`);
    for (let i = 0; i < listLength; i++) {
        logger_1.baseLogger.debug({
            index: i,
            song_uri: trackListCount[i].song_uri,
            count: trackListCount[i].count,
        }, `TRACK #${i}: ${trackListCount[i].song_uri} | ${trackListCount[i].count}`);
    }
    spotify_1.spotifyClient.modifyPlaylist({
        accessToken: accessToken,
        action: "POST",
        playlistId: session.sess.playlist_id,
        trackUri: trackListCount[0].song_uri,
    });
    logger.info("API: Added top song to playlist successfully");
});
