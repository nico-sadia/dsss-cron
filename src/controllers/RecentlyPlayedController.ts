import { type Session, type TrackDB } from "../lib/types";
import { formatToTrackDB } from "../utils/DBFormatter";
import {
    getDBSessions,
    getDBRecentlyPlayed,
    insertRecentlyPlayedIntoDB,
} from "../services/DBServices";
import { checkAccessToken } from "../services/AuthServices";
import { getRecentlyPlayed } from "../services/SpotifyServices";

const handleRecentlyPlayed = async () => {
    console.log("\n");
    console.log(
        "-------------------------------------------------------------------"
    );
    console.log("\n");
    console.log("HANDLE RECENT PLAYED JOB AT: " + new Date());

    const sessions: Session[] | null = await getDBSessions();

    if (!sessions) {
        console.error("ERROR: NO SESSIONS OR FAILURE TO FETCH SESSIONS");
        return;
    }

    for (let i = 0; i < sessions.length; i++) {
        console.log("\n");
        console.log("--------------------------------------------------------");
        console.log("\nNEXT SESSION: " + sessions[i].sess.user_id);

        let recentlyPlayed: TrackDB[] = [];

        //Get access token from DB or by refreshing
        let accessToken: string | undefined = await checkAccessToken(
            sessions[i].sess.expires_at,
            sessions[i].sess.refresh_token,
            sessions[i].sess.access_token,
            sessions[i]
        );

        //if access token present and viable, fetch user recently played and push to array
        if (!accessToken) {
            console.log("ERROR: ACCESS TOKEN FAILURE");
            continue;
        }

        console.log("ACCESS TOKEN SUCCESS");

        //Get user recently played using access token
        const data = await getRecentlyPlayed(accessToken);

        if (data.items.length === 0) {
            console.log("CLIENT ERROR: NO TRACKS IN RECENTLY PLAYED");
            continue;
        }

        console.log("TRACKS FOUND IN RECENTLY PLAYED: " + data.items.length);
        recentlyPlayed = data.items.map((track) => {
            //Format the data to be written to DB
            return formatToTrackDB(
                track.track.uri,
                sessions[i].sess.user_id,
                track.played_at
            );
        });

        //Get recently played tracks of current user from DB
        //Convert them to only the time they were played at for comparison
        const dbRecentlyPlayed = await getDBRecentlyPlayed(
            sessions[i].sess.user_id,
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
            try {
                insertRecentlyPlayedIntoDB(queryStrRecentlyPlayed);
            } catch (error) {
                console.log(error);
            }
            continue;
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
            filteredRecentlyPlayed.forEach((track) => {
                console.log(track);
            });
            console.log("LENGTH OF API TRACKS: " + recentlyPlayed.length);
            console.log(
                "LENGTH OF FILTERED TRACKS: " + filteredRecentlyPlayed.length
            );
            const queryStrRecentlyPlayed = filteredRecentlyPlayed
                .map((track) => {
                    return `('${track.song_uri}', '${track.user_id}', '${track.played_at}')`;
                })
                .join();

            try {
                insertRecentlyPlayedIntoDB(queryStrRecentlyPlayed);
                console.log("WRITING NEW SONGS TO DB SUCCESS!");
            } catch (error) {
                console.log(error);
            }

            console.log("\n");
        }
        console.log("SESSION FINISHED");
    }
};

export { handleRecentlyPlayed };
