import { Router } from "express";
import { cronRouter } from "./cron/cron.routes";

const router = Router();
router.use("/cron", cronRouter);

export default router;
