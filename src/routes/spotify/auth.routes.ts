import { Router } from "express";
import {
    handleSessionValidation,
    handleSpotifyAuthCallback,
    handleSpotifyAuthLogin,
} from "../../controllers/auth.controller";

const spotifyAuthRouter = Router();

spotifyAuthRouter.get("/status", handleSessionValidation);

spotifyAuthRouter.get("/login", handleSpotifyAuthLogin);

spotifyAuthRouter.get("/callback", handleSpotifyAuthCallback);

export default spotifyAuthRouter;
