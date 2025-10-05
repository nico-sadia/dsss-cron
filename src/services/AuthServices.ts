import { updateDBAccessToken } from "./DBServices";
import { Session } from "../lib/index";
import { getRefreshToken } from "../spotify";

export const checkAccessToken = async (
    expireTime: number,
    refreshToken: string,
    sessionAccessToken: string,
    session: Session
) => {
    //Get recently played tracks using access token from DB or by refreshing
    if (expireTime > Date.now()) {
        console.log("NO REFRESH NEEDED");
        return sessionAccessToken;
    }
    try {
        console.log("REFRESHING ACCESS TOKEN");
        const accessToken = await getRefreshToken(refreshToken);
        if (accessToken) await updateDBAccessToken(accessToken, session);
        return accessToken;
    } catch (err) {
        console.error(err);
    }
};
