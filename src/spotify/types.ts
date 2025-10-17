export type Track = {
    name: string;
    uri: string;
    href: string;
    id: string;
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

export type ModifyPlaylistProps = {
    accessToken: string;
    action: "POST" | "DELETE";
    playlistId: string;
    trackUri: string;
    addPosition?: number;
    deletePosition?: number;
};
