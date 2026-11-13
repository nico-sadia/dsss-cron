import { getLogger } from "../utils/logContext";

type SpotifyErrorResponse = {
    error?: string | { status?: number; message?: string };
    error_description?: string;
};

export class SpotifyApiError extends Error {
    constructor(
        readonly status: number,
        readonly code: string,
        message: string
    ) {
        super(message);
        this.name = "SpotifyApiError";
    }
}

export class SpotifyReauthRequiredError extends Error {
    readonly code = "SPOTIFY_REAUTH_REQUIRED";

    constructor() {
        super("Reconnect your Spotify account to continue.");
        this.name = "SpotifyReauthRequiredError";
    }
}

export const handleSpotifyError = async (res: Response): Promise<never> => {
    const logger = getLogger();
    const err: SpotifyErrorResponse = await res
        .json()
        .catch(() => ({ error: "unknown_error" }));
    const code =
        typeof err.error === "string"
            ? err.error
            : String(err.error?.status ?? "spotify_error");
    const message =
        err.error_description ??
        (typeof err.error === "object" ? err.error.message : undefined) ??
        code;

    logger.error({ err, status: res.status }, "API: Spotify error");
    throw new SpotifyApiError(res.status, code, message);
};
