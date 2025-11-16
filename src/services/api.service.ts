import { dbClient } from "../db";
import { spotifyClient } from "../spotify";
import { baseLogger } from "../utils/logger";
import { checkAccessToken } from "./auth.service";

export const fetchUserProfile = async (userId: string) => {
    const accessToken = await checkAccessToken(userId);
    const userProfile = await spotifyClient.user.getUserProfile(accessToken);
    return userProfile;
};

export const fetchSavedPlaylist = async (userId: string) => {
    const savedPlaylistUri = await dbClient.getSavedPlaylist(userId);

    if (!savedPlaylistUri?.playlist_id) {
        baseLogger.warn("API: Saved playlist uri does not exist in db");
        throw new Error("User has not saved playlist");
    }

    const accessToken = await checkAccessToken(userId);
    const savedPlaylist = await spotifyClient.playlist.getPlaylist(
        savedPlaylistUri.playlist_id,
        accessToken
    );

    return savedPlaylist;
};
