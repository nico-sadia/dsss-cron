import { Router } from "express";
import cronRouter from "./cron/cron.routes";
import authRouter from "./spotify/auth.routes";

const router = Router();
router.use("/cron", cronRouter);
router.use("/auth", authRouter);

export default router;
