import { TRACK_URL } from "../../lib";
import { spotifyRequest } from "../request";

export const track = {
    getTrack: async (trackId: string, accessToken: string) => {
        const data = await spotifyRequest({
            url: TRACK_URL + `/${trackId}`,
            payload: {},
            accessToken: accessToken,
        });

        return data;
    },
};
