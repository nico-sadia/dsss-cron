import { PLAYLIST_URL, RECENTLY_PLAYED_URL } from "../lib";
import { spotifyRequest } from "../spotify/request";
import { ModifyPlaylistProps, RecentlyPlayed } from "./types";

export const spotifyClient = {
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

    modifyPlaylist: async ({
        accessToken,
        action,
        playlistId,
        trackUri,
    }: ModifyPlaylistProps) => {
        const data = await spotifyRequest({
            url: PLAYLIST_URL + playlistId + "/tracks",
            payload: {
                method: action,
                body: JSON.stringify({ uris: [trackUri] }),
            },
            accessToken: accessToken,
        });
        console.log(data);

        return data;
    },
};
