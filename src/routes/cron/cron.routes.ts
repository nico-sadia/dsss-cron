import express from "express";
import { handleRecentlyPlayed } from "../../controllers/recently-played.controller";
import { handleTopPlayed } from "../../controllers/top-played.controller";

const cronRouter = express.Router();

cronRouter.use((req, res, next) => {
    if (req.path === "/") return next();
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(403).json({ error: "Forbidden" });
    }
    next();
});

cronRouter.post("/add-recently-played", async (req, res) => {
    try {
        await handleRecentlyPlayed();
        res.status(201).send("Success");
    } catch (error) {
        res.status(500).send("Error");
    }
});

cronRouter.post("/add-top-track", async (req, res) => {
    try {
        await handleTopPlayed();
        res.status(201).send("Success");
    } catch (error) {
        res.status(500).send("Error");
    }
});

export default cronRouter;
