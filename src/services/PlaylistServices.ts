import { PLAYLIST_URL } from "../lib";
import { spotifyRequest } from "../spotify/request";
const TEST_PLAYLIST_ID = "4naXlXSJa2uYrQ6lgmlPhs";

type PlaylistAction = "POST" | "DELETE";

type ModifyPlaylistProps = {
    accessToken: string;
    action: PlaylistAction;
    playlistId: string;
    trackUri: string;
    addPosition?: number;
    deletePosition?: number;
};

export const modifyPlaylist = async ({
    accessToken,
    action,
    playlistId,
    trackUri,
    addPosition,
}: ModifyPlaylistProps) => {
    const data = await spotifyRequest({
        url: PLAYLIST_URL + playlistId + "/tracks",
        payload: {
            method: action,
            body: JSON.stringify({ uris: [trackUri], position: addPosition }),
        },
        accessToken: accessToken,
    });
    console.log(data);

    return data;
};
