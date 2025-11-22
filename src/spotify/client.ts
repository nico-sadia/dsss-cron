import { auth } from "./client/auth";
import { player } from "./client/player";
import { playlist } from "./client/playlist";
import { track } from "./client/track";
import { user } from "./client/user";

export const spotifyClient = {
    user,
    playlist,
    player,
    auth,
    track,
};

export type SpotifyClient = typeof spotifyClient;
