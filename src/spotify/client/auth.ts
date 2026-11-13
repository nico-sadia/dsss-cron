import querystring from "querystring";
import { AUTH_TOKEN_URL } from "../../lib";
import { handleSpotifyError } from "../error";
import { SpotifyTokenResponse } from "../types";

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

export const auth = {
    getAuthorizationUrl: async (state: string) => {
        const scope =
            "user-read-private user-read-email user-top-read user-read-recently-played playlist-modify-public playlist-modify-private playlist-read-collaborative";

        return (
            "https://accounts.spotify.com/authorize?" +
            querystring.stringify({
                response_type: "code",
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state,
            })
        );
    },
    getAuthTokens: async (code: string): Promise<SpotifyTokenResponse> => {
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
        return (await res.json()) as SpotifyTokenResponse;
    },

    getRefreshToken: async (
        refresh_token: string
    ): Promise<SpotifyTokenResponse> => {
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
        return (await res.json()) as SpotifyTokenResponse;
    },
};
