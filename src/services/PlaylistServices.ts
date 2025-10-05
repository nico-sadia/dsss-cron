import { PLAYLIST_URL } from "../lib";
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
    deletePosition,
}: ModifyPlaylistProps) => {
    const body =
        action === "POST"
            ? { uris: [trackUri], position: addPosition }
            : { tracks: [{ uri: trackUri, positions: [deletePosition] }] };

    const payload = {
        method: action,
        headers: {
            Authorization: `Bearer  ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };

    const response = await fetch(
        PLAYLIST_URL + TEST_PLAYLIST_ID + "/tracks",
        payload
    );

    const data = await response.json();
    console.log(data);

    return response;
};
