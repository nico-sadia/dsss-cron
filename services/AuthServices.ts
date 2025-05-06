import request from "request";
import { updateDBAccessToken } from "./DBServices";
import { Session } from "../lib/types";

const REFRESH_TOKEN_URL = "https://accounts.spotify.com/api/token";

export const getRefreshToken = async (refresh_token: string) => {
    var authOptions = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                new (Buffer as any).from(
                    process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
                ).toString("base64"),
        },
        form: {
            grant_type: "refresh_token",
            refresh_token: refresh_token,
        },
        json: true,
    };

    const accessToken: string | undefined = await new Promise(
        (resolve, reject) => {
            request.post(authOptions, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log("REFRESH TOKEN SUCCESS");
                    resolve(body.access_token);
                } else {
                    console.log("REFRESH TOKEN ERROR " + response.statusCode);
                    console.log(error);
                    reject();
                }
            });
        }
    );

    return accessToken;
};

export const checkAccessToken = async (
    expireTime: number,
    refreshToken: string,
    sessionAccessToken: string,
    session: Session
) => {
    //Get recently played tracks using access token from DB or by refreshing
    if (expireTime < Date.now()) {
        console.log("REFRESHING ACCESS TOKEN");
        const accessToken = await getRefreshToken(refreshToken);
        accessToken
            ? updateDBAccessToken(accessToken, session)
            : console.log("ACCESS TOKEN REFRESH ERROR");
        return accessToken;
    } else {
        console.log("NO REFRESH NEEDED");
        return sessionAccessToken;
    }
};
