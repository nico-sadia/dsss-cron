import { Router } from "express";
import {
    getListenHistory,
    getSavedPlaylist,
    getTopSongSummaries,
    getTrack,
    getTracks,
    getUserPlaylists,
    getUserProfile,
    updateSavedPlaylist,
} from "../../controllers/api.controller";
import { requireAuth } from "../../middleware/requireAuth";

const spotifyApiRouter = Router();

// Middleware
spotifyApiRouter.use(requireAuth);

spotifyApiRouter.get("/user-profile", getUserProfile);
spotifyApiRouter.get("/user-playlists", getUserPlaylists);
spotifyApiRouter.get("/saved-playlist", getSavedPlaylist);
spotifyApiRouter.get("/top-song-summaries", getTopSongSummaries);
spotifyApiRouter.get("/listen-history", getListenHistory);
spotifyApiRouter.get("/tracks/:trackId", getTrack);
spotifyApiRouter.get("/tracks", getTracks);
spotifyApiRouter.patch("/saved-playlist", updateSavedPlaylist);

export default spotifyApiRouter;
