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
exports.handleRecentlyPlayed = void 0;
const DBFormatter_1 = require("../utils/DBFormatter");
const DBServices_1 = require("../services/DBServices");
const AuthServices_1 = require("../services/AuthServices");
const SpotifyServices_1 = require("../services/SpotifyServices");
const handleRecentlyPlayed = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("\n");
    console.log("-------------------------------------------------------------------");
    console.log("\n");
    console.log("HANDLE RECENT PLAYED JOB AT: " + new Date());
    const sessions = yield (0, DBServices_1.getDBSessions)();
    if (!sessions) {
        console.error("ERROR: NO SESSIONS OR FAILURE TO FETCH SESSIONS");
        return;
    }
    for (let i = 0; i < sessions.length; i++) {
        console.log("\n");
        console.log("--------------------------------------------------------");
        console.log("\nNEXT SESSION: " + sessions[i].sess.user_id);
        let recentlyPlayed = [];
        //Get access token from DB or by refreshing
        let accessToken = yield (0, AuthServices_1.checkAccessToken)(sessions[i].sess.expires_at, sessions[i].sess.refresh_token, sessions[i].sess.access_token, sessions[i]);
        //if access token present and viable, fetch user recently played and push to array
        if (!accessToken) {
            console.log("ERROR: ACCESS TOKEN FAILURE");
            continue;
        }
        console.log("ACCESS TOKEN SUCCESS");
        //Get user recently played using access token
        const data = yield (0, SpotifyServices_1.getRecentlyPlayed)(accessToken);
        if (data.items.length === 0) {
            console.log("CLIENT ERROR: NO TRACKS IN RECENTLY PLAYED");
            continue;
        }
        console.log("TRACKS FOUND IN RECENTLY PLAYED: " + data.items.length);
        recentlyPlayed = data.items.map((track) => {
            //Format the data to be written to DB
            return (0, DBFormatter_1.formatToTrackDB)(track.track.uri, sessions[i].sess.user_id, track.played_at);
        });
        //Get recently played tracks of current user from DB
        //Convert them to only the time they were played at for comparison
        const dbRecentlyPlayed = yield (0, DBServices_1.getDBRecentlyPlayed)(sessions[i].sess.user_id, new Date());
        if (dbRecentlyPlayed.length === 0) {
            console.log("CLIENT ERROR: NO SONGS IN DB");
            console.log("WRITING ALL TRACKS FOUND IN API TO DB");
            const queryStrRecentlyPlayed = recentlyPlayed
                .map((track) => {
                return `('${track.song_uri}', '${track.user_id}', '${track.played_at}')`;
            })
                .join();
            try {
                (0, DBServices_1.insertRecentlyPlayedIntoDB)(queryStrRecentlyPlayed);
            }
            catch (error) {
                console.log(error);
            }
            continue;
        }
        console.log("TRACKS FOUND IN DB: " + dbRecentlyPlayed.length);
        const filteredRecentlyPlayed = recentlyPlayed.filter((rowOne) => !dbRecentlyPlayed.some((rowTwo) => new Date(rowTwo.played_at).getTime() ===
            new Date(rowOne.played_at).getTime()));
        if (filteredRecentlyPlayed.length === 0) {
            console.log("NO SONGS TO WRITE TO DB");
        }
        else {
            console.log("NEW SONGS FOUND TO WRITE TO DB:");
            console.log("\n");
            filteredRecentlyPlayed.forEach((track) => {
                console.log(track);
            });
            console.log("LENGTH OF API TRACKS: " + recentlyPlayed.length);
            console.log("LENGTH OF FILTERED TRACKS: " + filteredRecentlyPlayed.length);
            const queryStrRecentlyPlayed = filteredRecentlyPlayed
                .map((track) => {
                return `('${track.song_uri}', '${track.user_id}', '${track.played_at}')`;
            })
                .join();
            try {
                (0, DBServices_1.insertRecentlyPlayedIntoDB)(queryStrRecentlyPlayed);
                console.log("WRITING NEW SONGS TO DB SUCCESS!");
            }
            catch (error) {
                console.log(error);
            }
            console.log("\n");
        }
        console.log("SESSION FINISHED");
    }
});
exports.handleRecentlyPlayed = handleRecentlyPlayed;
