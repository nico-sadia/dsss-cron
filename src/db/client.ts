import { db } from "../db/database";
import { handleDbError } from "./error";

export const dbClient = {
    getSessions: async () => {
        return await db
            .manyOrNone("SELECT sid, sess FROM session")
            .catch(handleDbError);
    },

    getSpotifyUsers: async () => {
        return await db
            .manyOrNone(
                `SELECT user_id, access_token, refresh_token, expires_at
                FROM spotify_users`
            )
            .catch(handleDbError);
    },

    getRecentlyPlayed: async (userID: string, date: Date) => {
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

    insertRecentlyPlayed: async (values: string) => {
        await db
            .any(
                "INSERT INTO listen_history (song_uri, user_id, played_at) VALUES " +
                    values +
                    ";"
            )
            .catch(handleDbError);
    },

    updateAccessToken: async (userId: string, accessToken: string) => {
        await db
            .none(
                `UPDATE spotify_users
                SET access_token = $1, expires_at = $2
                WHERE user_id = $3`,
                [accessToken, Date.now() + 3600 * 1000, userId]
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
