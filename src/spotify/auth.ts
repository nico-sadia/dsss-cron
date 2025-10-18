import { REFRESH_TOKEN_URL } from "../lib/index";
import { handleSpotifyError } from "./error";

export const getRefreshToken = async (refresh_token: string) => {
    var payload = {
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

    const res: Response = await fetch(REFRESH_TOKEN_URL, payload);
    if (!res.ok) await handleSpotifyError(res);
    const data = await res.json();
    return data.access_token;
};
