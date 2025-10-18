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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const recently_played_controller_1 = require("./controllers/recently-played.controller");
const top_played_controller_1 = require("./controllers/top-played.controller");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("SUCCESS: " + Date.now());
});
app.get("/add-recently-played", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, recently_played_controller_1.handleRecentlyPlayed)();
        res.status(201).send("Success");
    }
    catch (error) {
        res.status(500).send("Error");
    }
}));
app.get("/add-top-track", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, top_played_controller_1.handleTopPlayed)();
        res.status(201).send("Success");
    }
    catch (error) {
        res.status(500).send("Error");
    }
}));
app.listen(process.env.PORT, () => {
    logger_1.baseLogger.info(`Server is Fire at http://localhost:${process.env.PORT}`);
});
