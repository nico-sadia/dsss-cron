export type Image = {
    url: string;
    height: number;
    width: number;
};

export type Owner = {
    href: string;
    id: string;
    uri: string;
    display_name: string | null;
};

export type Track = {
    album: Album;
    artists: SimplifiedArtist[];
    disc_number: number;
    duration: number;
    explicit: boolean;
    href: string;
    id: string;
    name: string;
    popularity: number;
    track_number: number;
    uri: string;
};

export type Album = {
    album_type: string;
    total_tracks: number;
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: "year" | "month" | "day";
    uri: string;
    artists: SimplifiedArtist[];
};

export type SimplifiedArtist = {
    href: string;
    id: string;
    name: string;
    uri: string;
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

export type Playlist = {
    description: string | null;
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: Owner;
    public: boolean;
    snapshot_id: string;
    tracks: PlaylistTracks;
};

export type PlaylistTracks = {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: PlaylistTrack[];
};

export type PlaylistTrack = {
    added_at: string | null;
    added_by: any;
    is_local: boolean;
    track: Track;
};

export type UserProfile = {
    display_name: string;
    email: string;
    followers: UserFollowers;
    href: string;
    id: string;
    uri: string;
};

type UserFollowers = {
    href: string | null;
    total: number;
};
