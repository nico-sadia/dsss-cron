import { processAllTopPlayedSessions } from "../services/top-played.service";
import { baseLogger } from "../utils/logger";

export const handleTopPlayed = async () => {
    try {
        await processAllTopPlayedSessions();
        baseLogger.info("JOB: Recently played job complete");
    } catch (err) {
        baseLogger.error({ err }, "JOB: Recently played job failed");
    }
};
