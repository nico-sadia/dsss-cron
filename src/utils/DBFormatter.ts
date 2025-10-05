import { stringify } from "querystring";

export const formatToTrackDB = (
    songURI: string,
    userID: string,
    playedAt: string
) => {
    return {
        song_uri: songURI,
        user_id: userID,
        played_at: playedAt,
    };
};

export const stringifyRecentlyPlayed = (songUR: string) => {};
