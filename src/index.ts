import dotenv from "dotenv";
import express, { Application } from "express";
import { handleRecentlyPlayed } from "./controllers/recently-played.controller";
import { handleTopPlayed } from "./controllers/top-played.controller";
import { baseLogger } from "./utils/logger";

dotenv.config();

const app: Application = express();

app.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(403).json({ error: "Forbidden" });
    }
    next();
});

app.use(express.json());

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
    baseLogger.info(`Server is Fire at http://localhost:${process.env.PORT}`);
});
