import { dbClient, Session, TrackDB } from "../db";
import { RecentlyPlayed, spotifyClient } from "../spotify";
import { formatToTrackDB } from "../utils/DBFormatter";
import { checkAccessToken } from "./auth.service";

export const processAllRecentlyPlayedSessions = async () => {
    const sessions: Session[] = await dbClient.getDBSessions();

    if (!sessions) {
        console.error("ERROR: NO SESSIONS");
        return;
    }

    for (const session of sessions) {
        try {
            await processSession(session);
        } catch (err) {
            console.error(
                `Failed to process session ${session.sess.user_id}: `,
                err
            );
            continue;
        }
    }
};

export const processSession = async (session: Session) => {
    console.log("\n");
    console.log("--------------------------------------------------------");
    console.log("\nNEXT SESSION: " + session.sess.user_id);

    //Get access token from DB or by refreshing
    let accessToken: string = await checkAccessToken(
        session.sess.expires_at,
        session.sess.refresh_token,
        session.sess.access_token,
        session
    );

    //Get user recently played using access token
    let spotifyData: RecentlyPlayed = await spotifyClient.getRecentlyPlayed(
        accessToken
    );

    if (!spotifyData || !spotifyData.items || spotifyData.items.length === 0) {
        console.log("CLIENT ERROR: NO TRACKS IN RECENTLY PLAYED");
        return;
    }

    console.log("TRACKS FOUND IN RECENTLY PLAYED: " + spotifyData.items.length);
    const formattedTracks: TrackDB[] = spotifyData.items.map((track) => {
        //Format the data to be written to DB
        return formatToTrackDB(
            track.track.uri,
            session.sess.user_id,
            track.played_at
        );
    });

    await insertNewTracks(session.sess.user_id, formattedTracks);
};

const insertNewTracks = async (userId: string, tracks: TrackDB[]) => {
    //Get recently played tracks of current user from DB
    //Convert them to only the time they were played at for comparison
    const dbTracks = await dbClient.getDBRecentlyPlayed(userId, new Date());

    const newTracks = tracks.filter(
        (t) =>
            !dbTracks.some(
                (db) =>
                    new Date(db.played_at).getTime() ===
                    new Date(t.played_at).getTime()
            )
    );

    if (newTracks.length === 0) {
        console.log("NO NEW TRACKS TO WRITE TO DB");
        return;
    }

    const newTracksQueryStr = newTracks
        .map((t) => `('${t.song_uri}', '${t.user_id}', '${t.played_at}')`)
        .join();

    console.log("NEW SONGS FOUND TO WRITE TO DB:");
    console.log("\n");
    console.log("LENGTH OF API TRACKS: " + tracks.length);
    console.log("LENGTH OF FILTERED TRACKS: " + newTracks.length);

    dbClient.insertRecentlyPlayedIntoDB(newTracksQueryStr);

    console.log("WRITING NEW SONGS TO DB SUCCESS!");
    console.log("\n");

    // // Case 1: All tracks are new
    // if (dbTracks.length === 0) {
    //     console.log("CLIENT ERROR: NO SONGS IN DB");
    //     console.log("WRITING ALL TRACKS FOUND IN API TO DB");
    //     const queryStrRecentlyPlayed = tracks
    //         .map((track) => {
    //             return `('${track.song_uri}', '${track.user_id}', '${track.played_at}')`;
    //         })
    //         .join();

    //     dbClient.insertRecentlyPlayedIntoDB(queryStrRecentlyPlayed);
    //     return;
    // }

    // // Case 2: Tracks are partially new (some tracks already in db)
    // console.log("TRACKS FOUND IN DB: " + dbTracks.length);
    // const filteredRecentlyPlayed = tracks.filter(
    //     (rowOne) =>
    //         !dbTracks.some(
    //             (rowTwo) =>
    //                 new Date(rowTwo.played_at).getTime() ===
    //                 new Date(rowOne.played_at).getTime()
    //         )
    // );

    // if (filteredRecentlyPlayed.length === 0) {
    //     console.log("NO SONGS TO WRITE TO DB");
    // } else {
    //     console.log("NEW SONGS FOUND TO WRITE TO DB:");
    //     console.log("\n");
    //     console.log("LENGTH OF API TRACKS: " + tracks.length);
    //     console.log(
    //         "LENGTH OF FILTERED TRACKS: " + filteredRecentlyPlayed.length
    //     );
    //     const queryStrRecentlyPlayed = filteredRecentlyPlayed
    //         .map((track) => {
    //             return `('${track.song_uri}', '${track.user_id}', '${track.played_at}')`;
    //         })
    //         .join();

    //     dbClient.insertRecentlyPlayedIntoDB(queryStrRecentlyPlayed);
    //     console.log("WRITING NEW SONGS TO DB SUCCESS!");
    //     console.log("\n");
    // }
};
