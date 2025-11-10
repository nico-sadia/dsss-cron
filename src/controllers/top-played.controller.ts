import { Request, Response } from "express";
import { processAllTopPlayedUsers } from "../services/top-played.service";
import { baseLogger } from "../utils/logger";

export const addTopPlayed = async (req: Request, res: Response) => {
    try {
        await processAllTopPlayedUsers();
        baseLogger.info("JOB: Recently played job complete");
        return res.status(201).json({ message: "Success" });
    } catch (err) {
        baseLogger.error({ err }, "JOB: Recently played job failed");
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
