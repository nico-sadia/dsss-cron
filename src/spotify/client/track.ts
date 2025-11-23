import { TRACK_URL } from "../../lib";
import { spotifyRequest } from "../request";
import { Track } from "../types";

export const track = {
    getTrack: async (trackId: string, accessToken: string) => {
        const data: Track = await spotifyRequest({
            url: TRACK_URL + `/${trackId}`,
            payload: {},
            accessToken: accessToken,
        });

        return data;
    },

    getTracks: async (tracksIds: string, accessToken: string) => {
        const url = new URL(TRACK_URL);
        url.searchParams.set("ids", tracksIds);
        const data: Track[] = await spotifyRequest({
            url: url.toString(),
            payload: {},
            accessToken: accessToken,
        });

        return data;
    },
};
