import { processAllRecentlyPlayedSessions } from "../services/recently-played.service";

const handleRecentlyPlayed = async () => {
    try {
        await processAllRecentlyPlayedSessions();
        console.log("Recently played job success");
    } catch (err) {
        console.error("Recently played job failed", err);
    }
};

export { handleRecentlyPlayed };
