import { processAllRecentlyPlayedSessions } from "../services/recently-played.service";
import { baseLogger } from "../utils/logger";

export const handleRecentlyPlayed = async () => {
    try {
        await processAllRecentlyPlayedSessions();
        baseLogger.info("JOB: Recently played job complete");
    } catch (err) {
        baseLogger.error({ err }, "JOB: Recently played job failed");
    }
};
