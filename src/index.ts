import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import router from "./routes";
import { baseLogger } from "./utils/logger";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Service awake: " + Date.now());
});

app.use(router);

app.listen(process.env.PORT, () => {
    baseLogger.info(`Server is Fire at http://localhost:${process.env.PORT}`);
});
