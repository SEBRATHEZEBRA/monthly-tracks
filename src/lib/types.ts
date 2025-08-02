export interface TransformedTrack {
  title: string;
  artist: string;
  id: string;
  addedAt: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
}

export interface SpotifyIdResponse {
  id: string;
}

export interface SpotifyTracksResponse {
  items: {
    track: {
      name: string;
      artists: { name: string }[];
      id: string;
    };
    added_at: string;
  }[];
}

export interface SpotifyPlaylistResponse {
  items: {
    name: string;
  }[];
}