"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyRecentlyPlayed = exports.formatToTrackDB = void 0;
const formatToTrackDB = (songURI, userID, playedAt) => {
    return {
        song_uri: songURI,
        user_id: userID,
        played_at: playedAt,
    };
};
exports.formatToTrackDB = formatToTrackDB;
const stringifyRecentlyPlayed = (songUR) => { };
exports.stringifyRecentlyPlayed = stringifyRecentlyPlayed;
