import { dbClient, SpotifyUser, TrackDB } from "../db";
import { RecentlyPlayed, spotifyClient } from "../spotify";
import { formatToTrackDB } from "../utils/DBFormatter";
import { getLogger, runWithContext } from "../utils/logContext";
import { baseLogger } from "../utils/logger";
import { checkAccessToken } from "./auth.service";

export const processAllRecentlyPlayedUsers = async () => {
    const users: SpotifyUser[] = await dbClient.getSpotifyUsers();

    if (!users) {
        baseLogger.error(
            { job: "recentlyPlayed" },
            "DB: No users found - aborting job"
        );
        return;
    }

    for (const user of users) {
        try {
            await runWithContext(
                { job: "recentlyPlayed", userId: user.user_id },
                () => processUser(user)
            );
        } catch (err) {
            baseLogger.error(
                { job: "recentlyPlayed", err, userId: user.user_id },
                "JOB: Failed to process user"
            );
            continue;
        }
    }
};

const processUser = async (user: SpotifyUser) => {
    const logger = getLogger();
    logger.info("JOB: Processing next user");

    //Get access token from DB or by refreshing
    let accessToken: string = await checkAccessToken(
        user.expires_at,
        user.refresh_token,
        user.access_token,
        user.user_id
    );

    //Get user recently played using access token
    let spotifyData: RecentlyPlayed = await spotifyClient.getRecentlyPlayed(
        accessToken
    );

    if (!spotifyData || !spotifyData.items || spotifyData.items.length === 0) {
        logger.warn("API: No tracks found in recently played");
        return;
    }

    logger.debug(
        { trackCount: spotifyData.items.length },
        "API: Fetched tracks from recently played"
    );
    const formattedTracks: TrackDB[] = spotifyData.items.map((track) => {
        //Format the data to be written to DB
        return formatToTrackDB(track.track.uri, user.user_id, track.played_at);
    });

    await insertNewTracks(user.user_id, formattedTracks);
};

const insertNewTracks = async (userId: string, tracks: TrackDB[]) => {
    const logger = getLogger();
    //Get recently played tracks of current user from DB
    //Convert them to only the time they were played at for comparison
    const dbTracks = await dbClient.getRecentlyPlayed(userId, new Date());

    const newTracks = tracks.filter(
        (t) =>
            !dbTracks.some(
                (db) =>
                    new Date(db.played_at).getTime() ===
                    new Date(t.played_at).getTime()
            )
    );

    if (newTracks.length === 0) {
        logger.warn("DB: No new tracks to insert");
        return;
    }

    const newTracksQueryStr = newTracks
        .map((t) => `('${t.song_uri}', '${t.user_id}', '${t.played_at}')`)
        .join();

    logger.info("DB: Songs found to insert");
    logger.debug(
        { trackCount: tracks.length },
        "API: Tracks fetched from Spotify"
    );
    logger.debug({ trackCount: newTracks.length }, "DIFF: New tracks");

    dbClient.insertRecentlyPlayed(newTracksQueryStr);

    logger.info("DB: Inserted songs successfully");
};
