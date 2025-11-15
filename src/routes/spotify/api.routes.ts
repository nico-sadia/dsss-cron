import { Router } from "express";
import { getUserProfile } from "../../controllers/api.controller";

const spotifyApiRouter = Router();

spotifyApiRouter.get("/user-profile", getUserProfile);

export default spotifyApiRouter;
