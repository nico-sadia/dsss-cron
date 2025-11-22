import { db } from "../db/database";
import { handleDbError } from "./error";
import { SpotifyUser } from "./types";

export const dbClient = {
    getSessions: async () => {
        return await db
            .manyOrNone("SELECT sid, sess FROM session")
            .catch(handleDbError);
    },

    getSpotifyUsers: async () => {
        return await db
            .manyOrNone(
                `SELECT 
                    user_id, access_token, playlist_id, refresh_token, expires_at, timezone
                FROM 
                    spotify_users`
            )
            .catch(handleDbError);
    },

    getRecentlyPlayed: async (
        userId: string,
        from: Date,
        to: Date,
        timezone: string
    ) => {
        return await db
            .manyOrNone(
                `SELECT 
                    song_uri,
                    user_id, 
                    played_at
                FROM 
                    listen_history 
                WHERE 
                    user_id = $1 
                AND 
                    played_at >= ($2 AT TIME ZONE $4) AT TIME ZONE 'UTC'
                AND 
                    played_at < ($3 AT TIME ZONE $4) AT TIME ZONE 'UTC'
                `,
                [userId, from, to, timezone]
                // (row) => {
                //     row.played_at = row.played_at.toISOString();
                // }
            )
            .catch(handleDbError);
    },

    getSavedPlaylist: async (userId: string) => {
        return await db
            .oneOrNone<{ playlist_id: string | null }>(
                `SELECT 
                    playlist_id
                FROM 
                    spotify_users
                WHERE 
                    user_id = $1
            `,
                [userId]
            )
            .catch(handleDbError);
    },

    getSpotifyUserIdFromSession: async (sessionId: string) => {
        return await db
            .oneOrNone<string>(
                `SELECT 
                    sess->>'user_id' AS "userId"
                FROM 
                    session
                WHERE 
                    sid = $1
                `,
                [sessionId]
            )
            .catch(handleDbError);
    },

    getSpotifyUserFromUserId: async (userId: string) => {
        return await db
            .oneOrNone<SpotifyUser>(
                `SELECT 
                    user_id, access_token, refresh_token, playlist_id, expires_at, timezone
                FROM 
                    spotify_users
                WHERE
                    user_id = $1
                `,
                [userId]
            )
            .catch(handleDbError);
    },

    getTopSongSummariesInRange: async (
        userId: string,
        from: Date,
        to: Date,
        timezone: string,
        limit: number,
        offset: number
    ) => {
        return await db
            .manyOrNone(
                `SELECT
                user_id, song_uri, play_count
            FROM 
                top_song_summaries
            WHERE   
                user_id = $1
            AND
                summary_date >= ($2 AT TIME ZONE $4) AT TIME ZONE 'UTC'
            AND 
                summary_date < ($3 AT TIME ZONE $4) AT TIME ZONE 'UTC'
            ORDER BY summary_date DESC
            LIMIT $5 OFFSET $6
            `,
                [userId, from, to, timezone, limit, offset]
            )
            .catch(handleDbError);
    },

    getTopSongSummaries: async (
        userId: string,
        limit: number,
        offset: number
    ) => {
        return await db
            .manyOrNone(
                `SELECT
                user_id, song_uri, play_count
            FROM 
                top_song_summaries
            WHERE
                user_id = $1
            ORDER BY summary_date DESC
            LIMIT $2 OFFSET $3
            `,
                [userId, limit, offset]
            )
            .catch(handleDbError);
    },

    insertRecentlyPlayed: async (values: string) => {
        await db
            .none(
                `INSERT INTO listen_history (song_uri, user_id, played_at) VALUES ` +
                    values +
                    ";"
            )
            .catch(handleDbError);
    },

    insertTopSongSummary: async (
        userId: string,
        song_uri: string,
        playCount: number
    ) => {
        await db
            .none(
                `INSERT INTO
                    top_song_summaries (user_id, song_uri, play_count, summary_date)
                VALUES
                    ($1, $2, $3, $4);`,
                [userId, song_uri, playCount, new Date()]
            )
            .catch(handleDbError);
    },

    updateAccessToken: async (userId: string, accessToken: string) => {
        await db
            .none(
                `UPDATE 
                    spotify_users
                SET 
                    access_token = $1, expires_at = $2
                WHERE 
                    user_id = $3`,
                [accessToken, Date.now() + 3600 * 1000, userId]
            )
            .catch(handleDbError);
    },

    upsertSpotifyUser: async (
        userId: string,
        accessToken: string,
        refreshToken: string
    ) => {
        await db
            .none(
                `INSERT INTO 
                    spotify_users (user_id, access_token, refresh_token, expires_at)
                VALUES 
                    ($1, $2, $3, $4)
                ON CONFLICT 
                    (user_id)
                DO UPDATE SET
                    access_token = EXCLUDED.access_token,
                    refresh_token = EXCLUDED.refresh_token,
                    expires_at = $4,
                    updated_at = now();`,
                [userId, accessToken, refreshToken, 3600 * 1000]
            )
            .catch(handleDbError);
    },

    updateSavedPlaylist: async (userId: string, playlistId: string) => {
        await db
            .none(
                `UPDATE spotify_users
                SET
                    playlist_id = $1
                WHERE
                    user_id = $2
            `,
                [playlistId, userId]
            )
            .catch(handleDbError);
    },

    sessionExists: async (sessionId: string) => {
        return await db
            .oneOrNone<{ exists: boolean }>(
                `SELECT EXISTS (
                SELECT 
                    1
                FROM 
                    session
                WHERE 
                    sid = $1
            )`,
                [sessionId]
            )
            .catch(handleDbError);
    },
};
