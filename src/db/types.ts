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
    user_id: string;
};

export type CookieData = {};

export type SpotifyUser = {
    user_id: string;
    access_token: string;
    refresh_token: string;
    playlist_id: string | null;
    expires_at: number;
};
