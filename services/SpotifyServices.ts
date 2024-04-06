import { RecentlyPlayed } from "../lib/types";

const RECENTLY_PLAYED_URL =
    "https://api.spotify.com/v1/me/player/recently-played";
const PLAYLIST_URL = "https://api.spotify.com/v1/playlists/";

const limit = 50;
const after = new Date().setHours(0, 0, 0);

export const getRecentlyPlayed = async (accessToken: string) => {
    const payload = {
        headers: {
            Authorization: `Bearer  ${accessToken}`,
        },
    };

    const response: Response = await fetch(
        `${RECENTLY_PLAYED_URL}?limit=${limit}&after=${after}`,
        payload
    );
    const data: RecentlyPlayed = await response.json();
    return data;
};

export const addTopPlayedTrack = async (
    accessToken: string,
    trackURI: string,
    playlistID: string
) => {
    const payload = {
        method: "POST",
        headers: {
            Authorization: `Bearer  ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackURI] }),
    };

    const response = await fetch(
        PLAYLIST_URL + playlistID + "/tracks",
        payload
    );

    const data = await response.json();
    console.log(data);

    return response;
};
