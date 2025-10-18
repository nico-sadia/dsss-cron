"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.baseLogger = void 0;
const pino_1 = __importDefault(require("pino"));
exports.baseLogger = (0, pino_1.default)({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    transport: process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "HH:MM:ss",
                ignore: "pid,hostname",
            },
        }
        : undefined,
});
// Files can add context such as type of job to base logger
const createLogger = (context) => exports.baseLogger.child(context);
exports.createLogger = createLogger;
