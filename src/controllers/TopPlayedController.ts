import { type Session, type TrackDB } from "../lib/types";
import { getDBSessions, getDBRecentlyPlayed } from "../services/DBServices";
import { checkAccessToken } from "../services/AuthServices";
import { modifyPlaylist } from "../services/PlaylistServices";

const handleTopPlayed = async () => {
    console.log("\n");
    console.log(
        "-------------------------------------------------------------------"
    );
    console.log("\n");
    console.log("TOP PLAYED TRACK JOB AT: " + new Date(Date.now()));

    const sessions: Session[] | null = await getDBSessions();

    if (!sessions) {
        console.error("ERROR: NO SESSIONS OR FAILURE TO FETCH SESSIONS");
        return;
    }

    for (let i = 0; i < sessions.length; i++) {
        console.log("\nNEXT SESSION: " + sessions[i].sess.user_id);

        if (!sessions[i].sess.playlist_id) {
            console.error("ERROR: NO PLAYLIST FOR SAVE GIVEN");
            continue;
        }

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

        const yesterday = new Date();
        // new Date().setDate(new Date().getDate() - 1)

        const dbRecentlyPlayed = await getDBRecentlyPlayed(
            sessions[i].sess.user_id,
            yesterday
        );

        if (dbRecentlyPlayed.length === 0) {
            console.log("CLIENT ERROR: NO TRACKS IN DB");
            continue;
        }

        console.log("TRACKS FOUND IN DB: " + dbRecentlyPlayed.length);

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

        console.log("TOP PLAYED TRACKS:");
        for (let i = 0; i < trackListCount.length; i++) {
            console.log(
                `TRACK #${i}: ` +
                    trackListCount[i].song_uri +
                    " | " +
                    trackListCount[i].count
            );
        }

        try {
            modifyPlaylist({
                accessToken,
                action: "POST",
                playlistId: sessions[i].sess.playlist_id,
                trackUri: trackListCount[0].song_uri,
            });
        } catch (error) {
            console.error(error);
        }
        console.log("SUCCESS!");
    }
    console.log("ADDING TOP TRACK PROCESS COMPLETE");
};

export { handleTopPlayed };
