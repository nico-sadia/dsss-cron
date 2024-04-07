import express, { Application } from "express";
import dotenv from "dotenv";
import { CronJob } from "cron";
import { handleRecentlyPlayed } from "../controllers/RecentlyPlayedController";
import { handleTopPlayed } from "../controllers/TopPlayedController";

dotenv.config();

const app: Application = express();

app.use(express.json());

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

app.get("/add-recently-played", async (req, res) => {
    try {
        await handleRecentlyPlayed();
        res.status(201).send("Success");
    } catch (error) {
        res.status(500).send("Error");
    }
});

app.get("/add-top-track", async (req, res) => {
    try {
        await handleTopPlayed();
        res.status(201).send("Success");
    } catch (error) {
        res.status(500).send("Error");
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is Fire at http://localhost:${process.env.PORT}`);
});
