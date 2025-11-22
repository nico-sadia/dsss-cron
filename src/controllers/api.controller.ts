import { Request, Response } from "express";
import {
    fetchSavedPlaylist,
    fetchTopSongSummaries,
    fetchTrack,
    fetchUserPlaylists,
    fetchUserProfile,
    updateSavedPlaylist as updateSavedPlaylistService,
} from "../services/api.service";
import { baseLogger } from "../utils/logger";

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

export const getUserPlaylists = async (req: Request, res: Response) => {
    try {
        const userPlaylists = await fetchUserPlaylists(req.session.user_id!);
        res.status(200).json(userPlaylists);
    } catch (err) {
        res.status(500).json({
            err: err,
            message: "Failed to get user playlists",
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

export const getTrack = async (req: Request, res: Response) => {
    const { trackId } = req.params;
    try {
        const track = await fetchTrack(req.session.user_id!, trackId);
        res.status(200).json(track);
    } catch (err) {
        res.status(500).json({
            err: err,
            message: "Failed to get track",
        });
    }
};

export const getTopSongSummaries = async (req: Request, res: Response) => {
    const { from, to, limit, offset } = req.query;
    try {
        const topSongSummaries = await fetchTopSongSummaries(
            req.session.user_id!,
            {
                from: new Date(from as string),
                to: new Date(to as string),
                limit: Number(limit),
                offset: Number(offset),
            }
        );
        baseLogger.debug(topSongSummaries);
        res.status(200).json(topSongSummaries);
    } catch (err) {
        res.status(500).json({
            err: err,
            message: "Failed to get top song summaries",
        });
    }
};

export const updateSavedPlaylist = async (req: Request, res: Response) => {
    try {
        await updateSavedPlaylistService(
            req.session.user_id!,
            req.body.playlistId
        );
        res.status(200).json({
            message: "Saved playlist updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            err: err,
            message: "Failed to update saved playlist",
        });
    }
};
