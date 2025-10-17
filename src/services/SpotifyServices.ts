import { RECENTLY_PLAYED_URL } from "../lib";
import { RecentlyPlayed } from "../lib/types";
import { spotifyRequest } from "../spotify/request";

export const getRecentlyPlayed = async (accessToken: string) => {
    const data = await spotifyRequest<RecentlyPlayed>({
        url: RECENTLY_PLAYED_URL,
        payload: {
            method: "GET",
        },
        params: {
            limit: 50,
            after: new Date().setHours(0, 0, 0),
        },
        accessToken: accessToken,
    });

    data.items.forEach((track) => {
        console.log(track.track.name + ": " + track.played_at);
    });
    return data;
};
