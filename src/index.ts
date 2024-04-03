import express, { Application } from "express";
import dotenv from "dotenv";
import pgPromise from "pg-promise";
import { CronJob } from "cron";
import { Session, TrackDB } from "../lib/types";
import {
    addTopPlayedTrack,
    getRecentlyPlayed,
} from "../services/SpotifyServices";
import { CheckAccessToken, getRefreshToken } from "../services/AuthServices";
import { formatToTrackDB } from "../utils/DBFormatter";
import {
    getDBRecentlyPlayed,
    getDBSessions,
    insertRecentlyPlayedIntoDB,
} from "../services/DBServices";

dotenv.config();

const app: Application = express();

app.use(express.json());

const pgp = pgPromise();
const cn = {
    host: "localhost",
    port: 5432,
    database: "spotify_tracker_db",
    user: "postgres",
    password: process.env.DB_PASSWORD,
};

const db = pgp(cn);

const handleRecentlyPlayed = async () => {
    console.log("\n\n\n");
    console.log("NEW HANDLE RECENT PLAYED JOB AT: " + new Date());

    const sessions: Session[] = await getDBSessions();

    if (!sessions) return;

    for (let i = 0; i < sessions.length; i++) {
        console.log("\nNEXT SESSION");

        let recentlyPlayed: TrackDB[] = [];

        //Get access token from DB or by refreshing
        let accessToken: string | undefined = await CheckAccessToken(
            sessions[i].sess.expires_at,
            sessions[i].sess.refresh_token,
            sessions[i].sess.access_token,
            sessions[i]
        );

        //if access token present and viable, fetch user recently played and push to array
        if (!accessToken) {
            console.log("ACCESS TOKEN FAILURE");
            continue;
        }

        console.log("ACCESS TOKEN SUCCESS");

        //Get user recently played using access token
        const data = await getRecentlyPlayed(accessToken);

        if (data.items.length === 0) {
            console.log("NO TRACKS IN RECENTLY PLAYED");
            continue;
        }

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
            sessions[i].sess.user_id
        );

        if (dbRecentlyPlayed.length === 0) {
            console.log("NO SONGS IN DB");
            const queryStrRecentlyPlayed = recentlyPlayed
                .map((track) => {
                    return `('${track.song_uri}', '${track.user_id}', '${track.played_at}')`;
                })
                .join();

            console.log("QUERY STR: ");
            console.log(queryStrRecentlyPlayed);

            try {
                insertRecentlyPlayedIntoDB(queryStrRecentlyPlayed);
            } catch (error) {
                console.log(error);
            }
        } else {
            const filteredRecentlyPlayed = recentlyPlayed.filter(
                (rowOne) =>
                    !dbRecentlyPlayed.some(
                        (rowTwo) => rowTwo.played_at === rowOne.played_at
                    )
            );

            if (filteredRecentlyPlayed.length === 0) {
                console.log("NO SONGS TO WRITE TO DB");
            } else {
                console.log("NEW SONGS FOUND TO WRITE TO DB");
                console.log("LENGTH OF API TRACKS: " + recentlyPlayed.length);
                console.log(
                    "LENGTH OF FILTERED TRACK: " + filteredRecentlyPlayed.length
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
            }
            console.log("\n");
        }
        console.log("SESSION FINISHED");
    }
};

const handleTopPlayedTrack = async () => {
    console.log("\n\n\n");
    console.log("NEW TOP PLAYED TRACK JOB AT: " + new Date(Date.now()));

    const sessions: Session[] = await getDBSessions();

    if (!sessions) return;

    for (let i = 0; i < sessions.length; i++) {
        console.log("\nNEXT SESSION");

        //Get access token from DB or by refreshing
        let accessToken: string | undefined = await CheckAccessToken(
            sessions[i].sess.expires_at,
            sessions[i].sess.refresh_token,
            sessions[i].sess.access_token,
            sessions[i]
        );

        //if access token present and viable, fetch user recently played and push to array
        if (!accessToken) {
            console.log("ACCESS TOKEN FAILURE");
            continue;
        }

        console.log("ACCESS TOKEN SUCCESS");

        const dbRecentlyPlayed = await getDBRecentlyPlayed(
            sessions[i].sess.user_id
        );

        if (dbRecentlyPlayed.length === 0) {
            console.log("NO TRACKS IN DB");
            continue;
        }

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
        console.log(trackListCount[0]);
    }
};

const handleRecentlyPlayedJob = CronJob.from({
    cronTime: "0 */2 * * *",
    onTick: async () => await handleRecentlyPlayed(),
    start: true,
});

const test = CronJob.from({
    cronTime: "0 */2 * * *",
    onTick: () => console.log("Test: " + new Date().getTime),
    start: true,
});

app.get("/", async (req, res) => {
    res.send("SUCCESS");
});

app.get("/session", async (req, res) => {
    const response = await fetch("http://localhost:5173/auth/test-session", {
        credentials: "include",
    });
    const data = await response.text();
    res.send(data);
});

app.get("/refresh-token", async (req, res) => {
    const result = await getRefreshToken(
        "AQAWRndelsSYjhJdCLqfMWPBwVKmhJ-RdNrJEinoT5KDl9muu2NNRS-P2VildJkFfdp-1wcjjBWqvhrtOpk0DeyiJs3sQzxFhDSD58OXqOQywcsrtHgYbeunjXs64ef1et8"
    );
    res.send(result);
});

app.get("/test", async (req, res) => {
    await handleTopPlayedTrack();
    res.send("hi");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is Fire at http://localhost:${process.env.PORT}`);
});

export { db };
