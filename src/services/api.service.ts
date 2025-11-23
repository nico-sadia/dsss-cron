import { dbClient } from "../db";
import { spotifyClient } from "../spotify";
import { baseLogger } from "../utils/logger";
import { checkAccessToken } from "./auth.service";

export const fetchTrack = async (userId: string, trackId: string) => {
    const accessToken = await checkAccessToken(userId);
    const track = await spotifyClient.track.getTrack(trackId, accessToken);
    return track;
};

export const fetchTracks = async (userId: string, trackIds: string) => {
    const accessToken = await checkAccessToken(userId);
    const tracks = await spotifyClient.track.getTracks(trackIds, accessToken);
    return tracks;
};

export const fetchUserProfile = async (userId: string) => {
    const accessToken = await checkAccessToken(userId);
    const userProfile = await spotifyClient.user.getUserProfile(accessToken);
    return userProfile;
};

export const fetchUserPlaylists = async (userId: string) => {
    const accessToken = await checkAccessToken(userId);
    const userPlaylists = await spotifyClient.user.getUserPlaylists(
        accessToken
    );
    return userPlaylists;
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

export const fetchTopSongSummaries = async (
    userId: string,
    {
        from,
        to,
        limit = 50,
        offset = 0,
    }: { from?: Date; to?: Date; limit?: number; offset?: number }
) => {
    const user = await dbClient.getSpotifyUserFromUserId(userId);

    if (!user) {
        baseLogger.error("API: User does not exist");
        throw new Error("User does not exist");
    }

    if (from && to) {
        return await dbClient.getTopSongSummariesInRange(
            userId,
            user.timezone,
            {
                from: from,
                to: to,
                limit: limit,
                offset: offset,
            }
        );
    }

    return await dbClient.getTopSongSummaries(userId, {
        limit: limit,
        offset: offset,
    });
};

export const fetchListenHistory = async (
    userId: string,
    {
        from,
        to,
        limit,
        offset = 0,
    }: { from?: Date; to?: Date; limit?: number; offset?: number }
) => {
    const user = await dbClient.getSpotifyUserFromUserId(userId);

    if (!user) {
        baseLogger.error("API: User does not exist");
        throw new Error("User does not exist");
    }

    if (from && to) {
        return await dbClient.getListenHistoryInRange(userId, user.timezone, {
            from: from,
            to: to,
            limit: limit,
            offset: offset,
        });
    }

    return await dbClient.getListenHistory(userId, {
        limit: limit,
        offset: offset,
    });
};

export const updateSavedPlaylist = async (
    userId: string,
    playlistId: string
) => {
    await dbClient.updateSavedPlaylist(userId, playlistId);
};
