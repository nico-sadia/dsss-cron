import { dbClient, Session, TrackDB } from "../db";
import { spotifyClient } from "../spotify";
import { getLogger, runWithContext } from "../utils/logContext";
import { baseLogger } from "../utils/logger";
import { checkAccessToken } from "./auth.service";

export const processAllTopPlayedSessions = async () => {
    const sessions: Session[] = await dbClient.getDBSessions();

    if (!sessions) {
        baseLogger.error(
            { job: "recentlyPlayed" },
            "DB: No sessions found - aborting job"
        );
        return;
    }

    for (const session of sessions) {
        try {
            await runWithContext(
                { job: "topPlayed", userId: session.sess.user_id },
                () => processSession(session)
            );
        } catch (err) {
            baseLogger.error(
                { job: "topPlayed", err, userId: session.sess.user_id },
                "JOB: Failed to process session"
            );
            continue;
        }
    }
};

const processSession = async (session: Session) => {
    const logger = getLogger();

    logger.info(
        { userId: session.sess.user_id },
        "JOB: Processing next session"
    );

    if (!session.sess.playlist_id) {
        logger.error("DB: No playlist given to add song to");
        return;
    }

    //Get access token from DB or by refreshing
    let accessToken: string = await checkAccessToken(
        session.sess.expires_at,
        session.sess.refresh_token,
        session.sess.access_token,
        session
    );

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dbRecentlyPlayed = await dbClient.getDBRecentlyPlayed(
        session.sess.user_id,
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

    spotifyClient.modifyPlaylist({
        accessToken: accessToken,
        action: "POST",
        playlistId: session.sess.playlist_id,
        trackUri: trackListCount[0].song_uri,
    });

    logger.info("API: Added top song to playlist successfully");
};
