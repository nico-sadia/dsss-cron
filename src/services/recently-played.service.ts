import { dbClient, Session, TrackDB } from "../db";
import { RecentlyPlayed, spotifyClient } from "../spotify";
import { formatToTrackDB } from "../utils/DBFormatter";
import { checkAccessToken } from "./auth.service";

export const processRecentlyPlayedSession = async (session: Session) => {
    console.log("\n");
    console.log("--------------------------------------------------------");
    console.log("\nNEXT SESSION: " + session.sess.user_id);

    let recentlyPlayed: TrackDB[] = [];

    //Get access token from DB or by refreshing
    let accessToken: string | undefined = await checkAccessToken(
        session.sess.expires_at,
        session.sess.refresh_token,
        session.sess.access_token,
        session
    );

    //if access token present and viable, fetch user recently played and push to array
    if (!accessToken) {
        console.log("ERROR: ACCESS TOKEN FAILURE");
        return;
    }

    console.log("ACCESS TOKEN SUCCESS");

    //Get user recently played using access token
    let data: RecentlyPlayed = await spotifyClient.getRecentlyPlayed(
        accessToken
    );

    if (!data || !data.items || data.items.length === 0) {
        console.log("CLIENT ERROR: NO TRACKS IN RECENTLY PLAYED");
        return;
    }

    console.log("TRACKS FOUND IN RECENTLY PLAYED: " + data.items.length);
    recentlyPlayed = data.items.map((track) => {
        //Format the data to be written to DB
        return formatToTrackDB(
            track.track.uri,
            session.sess.user_id,
            track.played_at
        );
    });

    //Get recently played tracks of current user from DB
    //Convert them to only the time they were played at for comparison
    const dbRecentlyPlayed = await dbClient.getDBRecentlyPlayed(
        session.sess.user_id,
        new Date()
    );
    if (dbRecentlyPlayed.length === 0) {
        console.log("CLIENT ERROR: NO SONGS IN DB");
        console.log("WRITING ALL TRACKS FOUND IN API TO DB");
        const queryStrRecentlyPlayed = recentlyPlayed
            .map((track) => {
                return `('${track.song_uri}', '${track.user_id}', '${track.played_at}')`;
            })
            .join();

        dbClient.insertRecentlyPlayedIntoDB(queryStrRecentlyPlayed);
        return;
    }

    console.log("TRACKS FOUND IN DB: " + dbRecentlyPlayed.length);
    const filteredRecentlyPlayed = recentlyPlayed.filter(
        (rowOne) =>
            !dbRecentlyPlayed.some(
                (rowTwo) =>
                    new Date(rowTwo.played_at).getTime() ===
                    new Date(rowOne.played_at).getTime()
            )
    );

    if (filteredRecentlyPlayed.length === 0) {
        console.log("NO SONGS TO WRITE TO DB");
    } else {
        console.log("NEW SONGS FOUND TO WRITE TO DB:");
        console.log("\n");
        console.log("LENGTH OF API TRACKS: " + recentlyPlayed.length);
        console.log(
            "LENGTH OF FILTERED TRACKS: " + filteredRecentlyPlayed.length
        );
        const queryStrRecentlyPlayed = filteredRecentlyPlayed
            .map((track) => {
                return `('${track.song_uri}', '${track.user_id}', '${track.played_at}')`;
            })
            .join();

        dbClient.insertRecentlyPlayedIntoDB(queryStrRecentlyPlayed);
        console.log("WRITING NEW SONGS TO DB SUCCESS!");
        console.log("\n");
    }
};
