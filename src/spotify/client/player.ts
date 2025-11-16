import { RECENTLY_PLAYED_URL } from "../../lib";
import { spotifyRequest } from "../request";
import { RecentlyPlayed } from "../types";

export const player = {
    getRecentlyPlayed: async (accessToken: string) => {
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
        return data;
    },
};
