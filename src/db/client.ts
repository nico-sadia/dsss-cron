import { db } from "../db/database";
import { handleDbError } from "./error";
import { type Session } from "./types";

export const dbClient = {
    getDBSessions: async () => {
        return await db
            .manyOrNone("SELECT sid, sess FROM session")
            .catch(handleDbError);
    },

    getDBRecentlyPlayed: async (userID: string, date: Date) => {
        console.log("DB DATE: " + date);

        return await db
            .each(
                "SELECT song_uri, user_id, played_at FROM listen_history WHERE user_id = $1 AND date(played_at AT TIME ZONE 'Europe/London') = date($2 AT TIME ZONE 'Europe/London')",
                [userID, date],
                (row) => {
                    row.played_at = row.played_at.toISOString();
                }
            )
            .catch(handleDbError);
    },

    insertRecentlyPlayedIntoDB: async (values: string) => {
        await db
            .any(
                "INSERT INTO listen_history (song_uri, user_id, played_at) VALUES " +
                    values +
                    ";"
            )
            .catch(handleDbError);
    },

    updateDBAccessToken: async (accessToken: string, session: Session) => {
        console.log("UPDATING ACCESS TOKEN");
        await db
            .multiResult(
                "UPDATE session SET sess = jsonb_set(sess, '{access_token}', $1, false) WHERE sid = $2; UPDATE session SET sess = jsonb_set(sess, '{expires_at}', to_jsonb($3), false) WHERE sid = $4",
                [
                    `"${accessToken}"`,
                    session.sid,
                    Date.now() + 3600 * 1000,
                    session.sid,
                ]
            )
            .catch(handleDbError);
        console.log("UPDATING DB SUCCESS");
    },
};
