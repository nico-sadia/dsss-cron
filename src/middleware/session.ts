import session from "express-session";
import { db } from "../db/database";

export const sessionMiddleware = session({
    store: new (require("connect-pg-simple")(session))({
        pgPromise: db,
        createTableIfMissing: false,
        tableName: "session",
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 24 * 365 * 10000 },
});
