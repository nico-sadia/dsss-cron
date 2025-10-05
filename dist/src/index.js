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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const RecentlyPlayedController_1 = require("../controllers/RecentlyPlayedController");
const TopPlayedController_1 = require("../controllers/TopPlayedController");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// const RecentlyPlayedJob = CronJob.from({
//     cronTime: "0 */2 * * *",
//     onTick: async () => await handleRecentlyPlayed(),
//     start: true,
// });
// const TopPlayedTrackJob = CronJob.from({
//     cronTime: "10 0 * * *",
//     onTick: async () => await handleTopPlayed(),
//     start: true,
// });
app.get("/", (req, res) => {
    res.send("SUCCESS: " + Date.now());
});
app.get("/add-recently-played", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, RecentlyPlayedController_1.handleRecentlyPlayed)();
        res.status(201).send("Success");
    }
    catch (error) {
        res.status(500).send("Error");
    }
}));
app.get("/add-top-track", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, TopPlayedController_1.handleTopPlayed)();
        res.status(201).send("Success");
    }
    catch (error) {
        res.status(500).send("Error");
    }
}));
app.listen(process.env.PORT, () => {
    console.log(`Server is Fire at http://localhost:${process.env.PORT}`);
});
