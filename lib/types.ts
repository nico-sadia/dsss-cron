export type RecentlyPlayed = {
    items: RecentlyPlayedTrack[];
    next: string;
    limit: number;
};

export type RecentlyPlayedTrack = {
    context: {};
    played_at: string;
    track: TrackDetail;
};

export type TrackDB = {
    song_uri: string;
    user_id: string;
    played_at: string;
    count?: number;
};

export type TrackDetail = {
    name: string;
    uri: string;
    href: string;
    id: string;
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
