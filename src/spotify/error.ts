import { getLogger } from "../utils/logContext";

type SpotifyErrorResponse = {
    error: string;
    error_description?: string;
};

export const handleSpotifyError = async (res: Response) => {
    const logger = getLogger();
    const error: SpotifyErrorResponse = await res.json();

    logger.error({ error, status: res.status }, "API: Spotify error");
    throw new Error(
        `HTTP Error: (${res.status}): ${
            error.error_description || JSON.stringify(error)
        }`
    );
};
