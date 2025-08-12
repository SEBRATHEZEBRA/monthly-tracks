import {
  SpotifyIdResponse,
  SpotifyPlaylistResponse,
  SpotifyTrack,
  SpotifyTracksResponse,
  TransformedTrack,
} from "./types";

export const getUserId = async (accessToken: string): Promise<string> => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { id } = (await response.json()) as SpotifyIdResponse;

  return id;
};

export const getPlaylists = async (
  accessToken: string,
  userId: string
): Promise<string[]> => {
  const response = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const { items } = (await response.json()) as SpotifyPlaylistResponse;
  const names = items.map((item: { name: string }) => item.name);

  return names;
};

export const createPlaylist = async (
  accessToken: string,
  userId: string,
  playlistName: string
): Promise<string> => {
  const response = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        public: false,
        description: "Monthly playlist created by monthly-tracks 🕺",
      }),
    }
  );
  const { id } = (await response.json()) as SpotifyIdResponse;

  return id;
};

export const addToPlaylist = async (
  accessToken: string,
  playlistId: string,
  trackIds: string[]
): Promise<void> => {
  await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: trackIds.map((id) => `spotify:track:${id}`),
    }),
  });
};

export const fetchTracks = async (
  accessToken: string,
  offset: number,
  limit: number
): Promise<TransformedTrack[]> => {
  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const { items } = (await response.json()) as SpotifyTracksResponse;

  const tracks: TransformedTrack[] = items.map(
    (item: { track: SpotifyTrack; added_at: string }) => {
      const track = item.track;
      const title = track.name;
      const artist = track.artists
        .map((artist: { name: string }) => artist.name)
        .join(", ");
      const id = track.id;
      const addedAt = item.added_at;

      return { title, artist, id, addedAt };
    }
  );

  return tracks;
};

export const getMonthsTrackIds = async (
  accessToken: string,
  targetMonth: number,
  targetYear: number
): Promise<string[]> => {
  const limit = 30;
  let offset = 0,
    allTracks: TransformedTrack[] = [],
    prevTracks: TransformedTrack[] = [];
  let tracks = await fetchTracks(accessToken, offset, limit);
  let lastDate = new Date(tracks[tracks.length - 1].addedAt);

  while (
    lastDate.getFullYear() > targetYear ||
    (lastDate.getMonth() >= targetMonth &&
      lastDate.getFullYear() === targetYear)
  ) {
    prevTracks = tracks;
    allTracks = allTracks.concat(prevTracks);
    offset += limit;
    tracks = await fetchTracks(accessToken, offset, limit);
    lastDate = new Date(tracks[tracks.length - 1].addedAt);
  }
  allTracks = allTracks.concat(tracks);
  allTracks = allTracks.filter((track) => {
    const addedAt = new Date(track.addedAt);
    return (
      addedAt.getFullYear() === targetYear && addedAt.getMonth() === targetMonth
    );
  });

  return allTracks.map((track) => track.id);
};

export const monthNameToNumber = (monthName: string): number => {
  const date = new Date(`${monthName} 1, 2000`);
  return date.getMonth();
};

export const createMonthlyPlaylist = async (
  accessToken: string,
  month: string,
  year: string
): Promise<string> => {
  const playlistName = `${month} ${year.slice(2)}`;
  const userId = await getUserId(accessToken);
  const playlists = await getPlaylists(accessToken, userId);
  if (playlists.includes(playlistName)) {
    return `Playlist ${playlistName} already exists`;
  }

  const monthNumber = monthNameToNumber(month);
  const yearNumber = parseInt(year);
  const trackIds = await getMonthsTrackIds(
    accessToken,
    monthNumber,
    yearNumber
  );
  const playlistId = await createPlaylist(accessToken, userId, playlistName);
  await addToPlaylist(accessToken, playlistId, trackIds);

  return playlistName;
};
