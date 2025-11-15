import { spotifyClient } from "../spotify";
import { checkAccessToken } from "./auth.service";

export const fetchUserProfile = async (userId: string) => {
    const accessToken = await checkAccessToken(userId);
    const userProfile = await spotifyClient.getUserProfile(accessToken);
    return userProfile;
};
