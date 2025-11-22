import { PLAYLIST_URL } from "../../lib";
import { spotifyRequest } from "../request";
import { Playlist } from "../types";

export const playlist = {
    getPlaylist: async (playlistId: string, accessToken: string) => {
        const data = await spotifyRequest<Playlist>({
            url: PLAYLIST_URL + `/${playlistId}`,
            payload: {},
            accessToken: accessToken,
        });

        return data;
    },

    addItemsToPlaylist: async (
        accessToken: string,
        playlistId: string,
        trackUri: string
    ) => {
        const data = await spotifyRequest({
            url: PLAYLIST_URL + `${playlistId}` + "/tracks",
            payload: {
                method: "POST",
                body: JSON.stringify({ uris: [trackUri] }),
            },
            accessToken: accessToken,
        });
        return data;
    },
};
