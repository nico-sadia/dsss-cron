import { USER_PLAYLISTS_URL, USER_PROFILE_URL } from "../../lib";
import { spotifyRequest } from "../request";
import { UserPlaylistsResponse, UserProfile } from "../types";

export const user = {
    getUserProfile: async (accessToken: string) => {
        const data = await spotifyRequest<UserProfile>({
            url: USER_PROFILE_URL,
            payload: {},
            accessToken: accessToken,
        });

        return data;
    },
    getUserPlaylists: async (accessToken: string) => {
        const data = await spotifyRequest<UserPlaylistsResponse>({
            url: USER_PLAYLISTS_URL,
            payload: {},
            accessToken: accessToken,
        });
        return data;
    },
};
