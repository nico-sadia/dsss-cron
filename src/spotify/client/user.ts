import { USER_PROFILE_URL } from "../../lib";
import { spotifyRequest } from "../request";
import { UserProfile } from "../types";

export const user = {
    getUserProfile: async (accessToken: string) => {
        const data = await spotifyRequest<UserProfile>({
            url: USER_PROFILE_URL,
            payload: {},
            accessToken: accessToken,
        });

        return data;
    },
};
