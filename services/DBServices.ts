import { db } from "../src";

export const getDBSessions = async () => {
    try {
        return await db.manyOrNone("SELECT sid, sess FROM session");
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getDBRecentlyPlayed = async (userID: string) => {
    return await db.each(
        "SELECT song_uri, user_id, played_at FROM listen_history WHERE user_id = $1 AND date(played_at) = $2",
        [userID, new Date()],
        (row) => {
            row.played_at = row.played_at.toISOString();
        }
    );
};

export const insertRecentlyPlayedIntoDB = async (values: string) => {
    await db.any(
        "INSERT INTO listen_history (song_uri, user_id, played_at) VALUES " +
            values +
            ";"
    );
};
