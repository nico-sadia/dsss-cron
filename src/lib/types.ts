export type TrackDB = {
    song_uri: string;
    user_id: string;
    played_at: string;
    count?: number;
};

export type Session = {
    sid: string;
    sess: SessionData;
};

export type SessionData = {
    cookie: CookieData;
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user_id: string;
    playlist_id: string;
};

export type CookieData = {};
