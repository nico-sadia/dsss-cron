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
exports.spotifyClient = void 0;
const lib_1 = require("../lib");
const request_1 = require("../spotify/request");
exports.spotifyClient = {
    getRecentlyPlayed: (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield (0, request_1.spotifyRequest)({
            url: lib_1.RECENTLY_PLAYED_URL,
            payload: {
                method: "GET",
            },
            params: {
                limit: 50,
                after: new Date().setHours(0, 0, 0),
            },
            accessToken: accessToken,
        });
        return data;
    }),
    modifyPlaylist: (_a) => __awaiter(void 0, [_a], void 0, function* ({ accessToken, action, playlistId, trackUri, }) {
        const data = yield (0, request_1.spotifyRequest)({
            url: lib_1.PLAYLIST_URL + playlistId + "/tracks",
            payload: {
                method: action,
                body: JSON.stringify({ uris: [trackUri] }),
            },
            accessToken: accessToken,
        });
        return data;
    }),
};
