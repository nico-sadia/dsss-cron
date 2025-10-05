import { PLAYLIST_URL, PlaylistTracks } from "../lib";

export const getPlaylistTracks = async (
    accessToken: string,
    playlistId: string
) => {
    const payload = {
        headers: {
            Authorization: `Bearer  ${accessToken}`,
        },
    };

    const response = await fetch(
        PLAYLIST_URL + playlistId + "/tracks",
        payload
    );

    const data: PlaylistTracks = await response.json();

    return data;
};
