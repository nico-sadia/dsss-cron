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
exports.addTopPlayedTrack = exports.getRecentlyPlayed = void 0;
const RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played";
const PLAYLIST_URL = "https://api.spotify.com/v1/playlists/";
const limit = 50;
const getRecentlyPlayed = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const after = new Date().setHours(0, 0, 0);
    console.log("RECENTLY PLAYED DATE: " + after);
    const payload = {
        headers: {
            Authorization: `Bearer  ${accessToken}`,
        },
    };
    const response = yield fetch(`${RECENTLY_PLAYED_URL}?limit=${limit}&after=${after}`, payload);
    const data = yield response.json();
    data.items.forEach((track) => {
        console.log(track.track.name + ": " + track.played_at);
    });
    return data;
});
exports.getRecentlyPlayed = getRecentlyPlayed;
const addTopPlayedTrack = (accessToken, trackURI, playlistID) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        method: "POST",
        headers: {
            Authorization: `Bearer  ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackURI] }),
    };
    const response = yield fetch(PLAYLIST_URL + playlistID + "/tracks", payload);
    const data = yield response.json();
    console.log(data);
    return response;
});
exports.addTopPlayedTrack = addTopPlayedTrack;
