import { dbClient, type Session } from "../db";
import { processRecentlyPlayedSession } from "../services/recently-played.service";

const handleRecentlyPlayed = async () => {
    console.log("\n");
    console.log(
        "-------------------------------------------------------------------"
    );
    console.log("\n");
    console.log("HANDLE RECENT PLAYED JOB AT: " + new Date());

    const sessions: Session[] = await dbClient.getDBSessions();

    if (!sessions) {
        console.error("ERROR: NO SESSIONS OR FAILURE TO FETCH SESSIONS");
        return;
    }

    for (const session of sessions) {
        try {
            await processRecentlyPlayedSession(session);
        } catch (err) {
            console.error(
                `Failed to process session ${session.sess.user_id}: `,
                err
            );
            continue;
        }
    }

    console.log("\n");
    console.log(
        "-------------------------------------------------------------------"
    );
    console.log("\n");
    console.log("Recently played service complete");
};

export { handleRecentlyPlayed };
