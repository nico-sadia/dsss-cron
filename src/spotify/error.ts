import { SpotifyErrorResponse } from "../lib";

export const handleSpotifyError = async (res: Response) => {
    const error: SpotifyErrorResponse = await res.json();
    throw new Error(
        `HTTP Error: (${res.status}): ${
            error.error_description || JSON.stringify(error)
        }`
    );
};
