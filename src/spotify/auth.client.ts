import querystring from "querystring";
import { AUTH_TOKEN_URL } from "../lib/index";
import { generateRandomString } from "../utils/helpers";
import { handleSpotifyError } from "./error";

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

export const spotifyAuthClient = {
    getAuthonizationUrl: async () => {
        const state = generateRandomString(16);
        const scope = "user-read-private user-read-email";

        return (
            "https://accounts.spotify.com/authorize?" +
            querystring.stringify({
                response_type: "code",
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state,
            })
        );
    },
    getAuthTokens: async (code: string) => {
        const authOptions = {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    new (Buffer as any).from(
                        client_id + ":" + client_secret
                    ).toString("base64"),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code.toString(),
                redirect_uri: redirect_uri!.toString(),
            }),
            json: true,
        };

        const res = await fetch(
            "https://accounts.spotify.com/api/token",
            authOptions
        );

        if (!res.ok) await handleSpotifyError(res);
        return res.json(); // { access_token, refresh_token, expires_in }
    },
    getRefreshToken: async (refresh_token: string) => {
        const payload = {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    new (Buffer as any).from(
                        process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
                    ).toString("base64"),
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refresh_token,
            }),
        };

        const res = await fetch(AUTH_TOKEN_URL, payload);
        if (!res.ok) await handleSpotifyError(res);
        const data = await res.json();
        return data.access_token;
    },
};
