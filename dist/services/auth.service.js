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
exports.checkAccessToken = void 0;
const db_1 = require("../db");
const spotify_1 = require("../spotify");
const logContext_1 = require("../utils/logContext");
const checkAccessToken = (expireTime, refreshToken, sessionAccessToken, session) => __awaiter(void 0, void 0, void 0, function* () {
    const logger = (0, logContext_1.getLogger)();
    //Get recently played tracks using access token from DB or by refreshing
    if (expireTime > Date.now()) {
        logger.info("AUTH: Access token still valid");
        return sessionAccessToken;
    }
    logger.info("AUTH: Fetching new access token");
    const accessToken = yield (0, spotify_1.getRefreshToken)(refreshToken);
    if (accessToken) {
        logger.info("DB: Updating access token in db");
        yield db_1.dbClient.updateDBAccessToken(accessToken, session);
    }
    return accessToken;
});
exports.checkAccessToken = checkAccessToken;
