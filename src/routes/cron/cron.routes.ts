import express from "express";
import { addRecentlyPlayed } from "../../controllers/recently-played.controller";
import { addTopPlayed } from "../../controllers/top-played.controller";

const cronRouter = express.Router();

// cronRouter.use((req, res, next) => {

//     const auth = req.headers.authorization;
//     if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
//         return res.status(403).json({ error: "Forbidden" });
//     }
//     next();
// });

cronRouter.get("/add-recently-played", addRecentlyPlayed);
cronRouter.get("/add-top-song", addTopPlayed);

export default cronRouter;
