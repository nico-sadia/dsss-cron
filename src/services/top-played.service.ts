import { dbClient, SpotifyUser, TrackDB } from "../db";
import { spotifyClient } from "../spotify";
import { getLogger, runWithContext } from "../utils/logContext";
import { baseLogger } from "../utils/logger";
import { checkAccessToken } from "./auth.service";

export const processAllTopPlayedUsers = async () => {
    const users: SpotifyUser[] = await dbClient.getSpotifyUsers();

    if (!users) {
        baseLogger.error(
            { job: "topPlayed" },
            "DB: No users found - aborting job"
        );
        return;
    }

    for (const user of users) {
        try {
            await runWithContext(
                { job: "topPlayed", userId: user.user_id },
                () => processUser(user)
            );
        } catch (err) {
            baseLogger.error(
                { job: "topPlayed", err, userId: user.user_id },
                "JOB: Failed to process user"
            );
            continue;
        }
    }
};

const processUser = async (user: SpotifyUser) => {
    const logger = getLogger();

    logger.info({ userId: user.user_id }, "JOB: Processing next user");

    if (!user.playlist_id) {
        logger.error("DB: No playlist given to add song to");
        return;
    }

    //Get access token from DB or by refreshing
    let accessToken: string = await checkAccessToken(user.user_id);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dbRecentlyPlayed = await dbClient.getRecentlyPlayed(
        user.user_id,
        yesterday
    );

    if (dbRecentlyPlayed.length === 0) {
        logger.warn("DB: No tracks found in db");
        return;
    }

    logger.info("DB: Tracks found in DB");
    logger.debug({ trackCount: dbRecentlyPlayed.length });

    let trackListCount: TrackDB[] = [];

    //Start by selecting the first track name and comparing it to all the track names in the list
    //Return early if trackListCount already has existing track in array (skip redundant iterations)
    //Increment to count if present
    //Add name of track and count to array
    dbRecentlyPlayed.forEach((trackName: TrackDB) => {
        let count = 0;
        const currentURI = trackName.song_uri;

        if (
            trackListCount.filter((track) => track.song_uri === currentURI)
                .length > 0
        )
            return;
        dbRecentlyPlayed.forEach((trackToCheck: TrackDB) => {
            if (trackToCheck.song_uri === currentURI) count++;
        });

        trackListCount.push({
            played_at: trackName.played_at,
            user_id: trackName.user_id,
            song_uri: currentURI,
            count: count,
        });
    });

    //Sort the list of track counts
    trackListCount = trackListCount.sort((a, b) => b.count! - a.count!);

    const maxLength = 3;
    const listLength = Math.min(maxLength, dbRecentlyPlayed.length);
    logger.debug(`RESULT: List of top ${listLength} played tracks`);
    for (let i = 0; i < listLength; i++) {
        baseLogger.debug(
            {
                index: i,
                song_uri: trackListCount[i].song_uri,
                count: trackListCount[i].count,
            },
            `TRACK #${i}: ${trackListCount[i].song_uri} | ${trackListCount[i].count}`
        );
    }

    spotifyClient.playlist.addItemsToPlaylist(
        accessToken,
        user.playlist_id,
        trackListCount[0].song_uri
    );

    logger.info("API: Added top song to playlist successfully");
};
