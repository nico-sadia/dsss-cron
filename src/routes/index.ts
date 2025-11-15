import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import cronRouter from "./cron/cron.routes";
import spotifyApiRouter from "./spotify/api.routes";
import spotifyAuthRouter from "./spotify/auth.routes";

const router = Router();

// Middleware
spotifyApiRouter.use(requireAuth);

router.use("/cron", cronRouter);
router.use("/auth", spotifyAuthRouter);
router.use("/api", spotifyApiRouter);

export default router;
