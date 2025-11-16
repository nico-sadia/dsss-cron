import { Request, Response } from "express";
import { fetchSavedPlaylist, fetchUserProfile } from "../services/api.service";

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userProfile = await fetchUserProfile(req.session.user_id!);
        res.status(200).json(userProfile);
    } catch (err) {
        res.status(500).json({
            err: err,
            message: "Failed to get user profile",
        });
    }
};

export const getSavedPlaylist = async (req: Request, res: Response) => {
    try {
        const savedPlaylist = await fetchSavedPlaylist(req.session.user_id!);
        res.status(200).json(savedPlaylist);
    } catch (err) {
        res.status(500).json({
            err: err,
            message: "Failed to get saved playlist",
        });
    }
};
