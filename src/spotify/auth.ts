import { REFRESH_TOKEN_URL, SpotifyErrorResponse } from "../lib/index";

export const getRefreshToken = async (refresh_token: string) => {
    var payload = {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                new (Buffer as any).from(
                    process.env.CLIENT_ID + "2:" + process.env.CLIENT_SECRET
                ).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refresh_token,
        }),
    };

    const res: Response = await fetch(REFRESH_TOKEN_URL, payload);

    if (!res.ok) {
        const error: SpotifyErrorResponse = await res.json();
        throw new Error(
            `Failed to refresh token (${res.status}): ${
                error.error_description || JSON.stringify(error)
            }`
        );
    }

    const data = await res.json();
    // console.log(`CODE ${res.status}: REFRESH TOKEN SUCCESS`);
    return data.access_token;
};
