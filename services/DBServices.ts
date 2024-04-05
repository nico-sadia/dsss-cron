import { type Session } from "../lib/types";
import { db } from "../db/database";

export const getDBSessions = async () => {
    try {
        return await db.manyOrNone("SELECT sid, sess FROM session");
    } catch (error) {
        console.log("DB ERROR");
        console.error(error);
        return null;
    }
};

export const getDBRecentlyPlayed = async (userID: string, date: Date) => {
    console.log("DB DATE: " + date);

    return await db.each(
        "SELECT song_uri, user_id, played_at FROM listen_history WHERE user_id = $1 AND date(played_at AT TIME ZONE 'Europe/London') = $2",
        [userID, date],
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

export const updateDBAccessToken = async (
    accessToken: string,
    session: Session
) => {
    console.log("UPDATING ACCESS TOKEN");
    try {
        await db.multiResult(
            "UPDATE session SET sess = jsonb_set(sess, '{access_token}', $1, false) WHERE sid = $2; UPDATE session SET sess = jsonb_set(sess, '{expires_at}', to_jsonb($3), false) WHERE sid = $4",
            [
                `"${accessToken}"`,
                session.sid,
                Date.now() + 3600 * 1000,
                session.sid,
            ]
        );
        console.log("UPDATING DB SUCCESS");
    } catch (error) {
        console.error(error);
    }
};
