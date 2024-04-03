import request from "request";
import { db } from "../src";
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
                    console.log("REFRESH TOKEN ERROR");
                    reject();
                }
            });
        }
    );

    return accessToken;
};

export const updateDBAccessToken = async (
    accessToken: string,
    session: Session
) => {
    console.log("UPDATING ACCESS TOKEN");
    try {
        await db.multiResult(
            "UPDATE session SET sess = jsonb_set(sess, '{access_token}', $1, false) WHERE sid = $2; UPDATE session SET sess = jsonb_set(sess, '{expires_at}', to_jsonb($3), false) WHERE sid = $4",
            [
                `"${accessToken}"`,
                session.sid,
                Date.now() + 3600 * 1000,
                session.sid,
            ]
        );
        console.log("UPDATING DB SUCCESS");
    } catch (error) {
        console.error(error);
    }
};

export const CheckAccessToken = async (
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
