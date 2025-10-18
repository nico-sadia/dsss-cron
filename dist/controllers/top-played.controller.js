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
exports.handleTopPlayed = void 0;
const top_played_service_1 = require("../services/top-played.service");
const logger_1 = require("../utils/logger");
const handleTopPlayed = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, top_played_service_1.processAllTopPlayedSessions)();
        logger_1.baseLogger.info("JOB: Recently played job complete");
    }
    catch (err) {
        logger_1.baseLogger.error({ err }, "JOB: Recently played job failed");
    }
});
exports.handleTopPlayed = handleTopPlayed;
