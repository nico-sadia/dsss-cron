import { Request, Response } from "express";
import { fetchUserProfile } from "../services/api.service";
import { baseLogger } from "../utils/logger";

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        baseLogger.debug({ session: req.session });
        const userProfile = await fetchUserProfile(req.session.user_id!);
        res.status(200).json(userProfile);
    } catch (err) {
        res.status(500).json({
            err: err,
            message: "Failed to get user profile",
        });
    }
};
