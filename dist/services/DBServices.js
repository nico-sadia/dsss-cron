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
exports.updateDBAccessToken = exports.insertRecentlyPlayedIntoDB = exports.getDBRecentlyPlayed = exports.getDBSessions = void 0;
const database_1 = require("../db/database");
const getDBSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield database_1.db.manyOrNone("SELECT sid, sess FROM session");
    }
    catch (error) {
        console.log("DB ERROR");
        console.error(error);
        return null;
    }
});
exports.getDBSessions = getDBSessions;
const getDBRecentlyPlayed = (userID, date) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("DB DATE: " + date);
    return yield database_1.db.each("SELECT song_uri, user_id, played_at FROM listen_history WHERE user_id = $1 AND date(played_at AT TIME ZONE 'Europe/London') = date($2 AT TIME ZONE 'Europe/London')", [userID, date], (row) => {
        row.played_at = row.played_at.toISOString();
    });
});
exports.getDBRecentlyPlayed = getDBRecentlyPlayed;
const insertRecentlyPlayedIntoDB = (values) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.any("INSERT INTO listen_history (song_uri, user_id, played_at) VALUES " +
        values +
        ";");
});
exports.insertRecentlyPlayedIntoDB = insertRecentlyPlayedIntoDB;
const updateDBAccessToken = (accessToken, session) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("UPDATING ACCESS TOKEN");
    try {
        yield database_1.db.multiResult("UPDATE session SET sess = jsonb_set(sess, '{access_token}', $1, false) WHERE sid = $2; UPDATE session SET sess = jsonb_set(sess, '{expires_at}', to_jsonb($3), false) WHERE sid = $4", [
            `"${accessToken}"`,
            session.sid,
            Date.now() + 3600 * 1000,
            session.sid,
        ]);
        console.log("UPDATING DB SUCCESS");
    }
    catch (error) {
        console.error(error);
    }
});
exports.updateDBAccessToken = updateDBAccessToken;
