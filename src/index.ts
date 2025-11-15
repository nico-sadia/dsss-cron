import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import { sessionMiddleware } from "./middleware/session";
import router from "./routes";
import { baseLogger } from "./utils/logger";

dotenv.config();

const app: Application = express();

app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(sessionMiddleware);

app.get("/", (req, res) => {
    res.send("Service awake: " + Date.now());
});

app.use(router);

app.listen(process.env.PORT, () => {
    baseLogger.info(`Server is Fire at http://localhost:${process.env.PORT}`);
});
