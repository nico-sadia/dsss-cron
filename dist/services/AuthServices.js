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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAccessToken = exports.getRefreshToken = void 0;
const request_1 = __importDefault(require("request"));
const DBServices_1 = require("./DBServices");
const REFRESH_TOKEN_URL = "https://accounts.spotify.com/api/token";
const getRefreshToken = (refresh_token) => __awaiter(void 0, void 0, void 0, function* () {
    var authOptions = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization: "Basic " +
                new Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString("base64"),
        },
        form: {
            grant_type: "refresh_token",
            refresh_token: refresh_token,
        },
        json: true,
    };
    const accessToken = yield new Promise((resolve, reject) => {
        request_1.default.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log("REFRESH TOKEN SUCCESS");
                resolve(body.access_token);
            }
            else {
                console.log("REFRESH TOKEN ERROR " + response.statusCode);
                console.log(error);
                reject();
            }
        });
    });
    return accessToken;
});
exports.getRefreshToken = getRefreshToken;
const checkAccessToken = (expireTime, refreshToken, sessionAccessToken, session) => __awaiter(void 0, void 0, void 0, function* () {
    //Get recently played tracks using access token from DB or by refreshing
    if (expireTime < Date.now()) {
        console.log("REFRESHING ACCESS TOKEN");
        const accessToken = yield (0, exports.getRefreshToken)(refreshToken);
        accessToken
            ? (0, DBServices_1.updateDBAccessToken)(accessToken, session)
            : console.log("ACCESS TOKEN REFRESH ERROR");
        return accessToken;
    }
    else {
        console.log("NO REFRESH NEEDED");
        return sessionAccessToken;
    }
});
exports.checkAccessToken = checkAccessToken;
