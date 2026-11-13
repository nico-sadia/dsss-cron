import { Response } from "express";
import { SpotifyReauthRequiredError } from "../spotify/error";

export const sendApiError = (
    res: Response,
    err: unknown,
    message: string
) => {
    if (err instanceof SpotifyReauthRequiredError) {
        return res.status(401).json({
            code: err.code,
            message: err.message,
        });
    }

    return res.status(500).json({ message });
};
