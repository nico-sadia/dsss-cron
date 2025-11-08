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
        await db
            .none(
                `UPDATE session
                SET sess = jsonb_set(
                    jsonb_set(sess, '{access_token}', to_jsonb($1), false),
                    '{expires_at}', to_jsonb($2), false
                )
                WHERE sid = $3`,
                [accessToken, Date.now() + 3600 * 1000, session.sid]
            )
            .catch(handleDbError);
    },

    upsertSpotifyUser: async (
        userId: string,
        accessToken: string,
        refreshToken: string
    ) => {
        await db.none(
            `INSERT INTO spotify_users 
                (user_id, access_token, refresh_token, expires_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id)
                DO UPDATE SET
                access_token = EXCLUDED.access_token,
                refresh_token = EXCLUDED.refresh_token,
                expires_at = $4,
                updated_at = now();`,
            [userId, accessToken, refreshToken, 3600 * 1000]
        );
    },
};
