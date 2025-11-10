import { Request, Response } from "express";
import { processAllRecentlyPlayedUsers } from "../services/recently-played.service";
import { baseLogger } from "../utils/logger";

export const addRecentlyPlayed = async (req: Request, res: Response) => {
    try {
        await processAllRecentlyPlayedUsers();
        baseLogger.info("JOB: Recently played job complete");
        return res.status(201).json({ message: "Success" });
    } catch (err) {
        baseLogger.error({ err }, "JOB: Recently played job failed");
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
