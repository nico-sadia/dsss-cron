import "express-session";

declare module "express-session" {
    interface SessionData {
        user_id: string;
        expires_at: number;
        access_token: string;
        refresh_token: string;
        playlist_id: string;
    }
}
