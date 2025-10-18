import { processAllRecentlyPlayedSessions } from "../services/recently-played.service";
import { baseLogger } from "../utils/logger";

const handleRecentlyPlayed = async () => {
    try {
        await processAllRecentlyPlayedSessions();
        baseLogger.info("JOB: Recently played job success");
    } catch (error) {
        baseLogger.error({ error }, "JOB: Recently played job failed");
    }
};

export { handleRecentlyPlayed };
