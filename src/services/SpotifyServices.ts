import { RecentlyPlayed } from "../lib/types";

const RECENTLY_PLAYED_URL =
    "https://api.spotify.com/v1/me/player/recently-played";

const limit = 50;

export const getRecentlyPlayed = async (accessToken: string) => {
    const after = new Date().setHours(0, 0, 0);
    console.log("RECENTLY PLAYED DATE: " + after);

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
    data.items.forEach((track) => {
        console.log(track.track.name + ": " + track.played_at);
    });
    return data;
};
