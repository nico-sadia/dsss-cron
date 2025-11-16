import { Router } from "express";
import {
    getSavedPlaylist,
    getUserProfile,
} from "../../controllers/api.controller";

const spotifyApiRouter = Router();

spotifyApiRouter.get("/user-profile", getUserProfile);
spotifyApiRouter.get("/saved-playlist", getSavedPlaylist);

export default spotifyApiRouter;
