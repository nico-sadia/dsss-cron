export type SpotifyErrorResponse = {
    error: string;
    error_description?: string;
};

export type RecentlyPlayed = {
    items: RecentlyPlayedTrack[];
    next: string;
    limit: number;
};

export type RecentlyPlayedTrack = {
    context: {};
    played_at: string;
    track: Track;
};

export type TrackDB = {
    song_uri: string;
    user_id: string;
    played_at: string;
    count?: number;
};

export type Track = {
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

export type PlaylistTracks = {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: PlaylistTrackObject[];
};

export type PlaylistTrackObject = {
    added_at: string | null;
    added_by: any;
    is_local: boolean;
    track: Track;
};
