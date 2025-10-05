import { Session } from "../lib/types";
import { checkAccessToken } from "../services/AuthServices";
import { getDBSessions, getRowCount } from "../services/DBServices";
import { modifyPlaylist } from "../services/PlaylistServices";
import { getPlaylistTracks } from "../spotify/playlist";

const TEST_PLAYLIST_ID = "4naXlXSJa2uYrQ6lgmlPhs";

export const getRowCountListenHistory = async (tableName: string) => {
    return await getRowCount(tableName);
};

export const removeTrackFromPlaylist = async () => {
    const sessions: Session[] | null = await getDBSessions();

    if (!sessions) {
        console.error("ERROR: NO SESSIONS OR FAILURE TO FETCH SESSIONS");
        return;
    }

    for (let i = 0; i < sessions.length; i++) {
        console.log("\nNEXT SESSION: " + sessions[i].sess.user_id);

        if (!sessions[i].sess.playlist_id) {
            console.error("ERROR: NO PLAYLIST FOR SAVE GIVEN");
            continue;
        }

        //Get access token from DB or by refreshing
        let accessToken: string | undefined = await checkAccessToken(
            sessions[i].sess.expires_at,
            sessions[i].sess.refresh_token,
            sessions[i].sess.access_token,
            sessions[i]
        );

        //if access token present and viable, fetch user recently played and push to array
        if (!accessToken) {
            console.log("ERROR: ACCESS TOKEN FAILURE");
            continue;
        }

        console.log("ACCESS TOKEN SUCCESS");

        const deletePositions = (
            await getPlaylistTracks(accessToken, TEST_PLAYLIST_ID)
        ).items.length;

        console.log("DELETE POS: " + deletePositions);

        await modifyPlaylist({
            accessToken,
            action: "DELETE",
            playlistId: TEST_PLAYLIST_ID,
            trackUri: "spotify:track:0P4OHmZ7t092na79ElH7F5",
            deletePosition: deletePositions,
        });
    }
};
