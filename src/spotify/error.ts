import { getLogger } from "../utils/logContext";

type SpotifyErrorResponse = {
    error: string;
    error_description?: string;
};

export const handleSpotifyError = async (res: Response) => {
    const logger = getLogger();
    const err: SpotifyErrorResponse = await res.json();

    logger.error({ err, status: res.status }, "API: Spotify error");
    throw new Error(
        `HTTP Error: (${res.status}): ${
            err.error_description || JSON.stringify(err)
        }`
    );
};
