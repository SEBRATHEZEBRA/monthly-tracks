import { TransformedTrack } from '@/lib/types';

const getAccessToken = async (): Promise<any> => {
  const refreshToken: string | undefined = process.env.NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN;  
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken || "",
    }).toString(),
  });
  const { access_token } = await response.json();

  return access_token;
};

const getUserId = async (accessToken: string): Promise<string> => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { id } = await response.json();

  return id;
}

const createPlaylist = async (accessToken: string, userId: string, playlistName: string): Promise<string> => {
  const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
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
  });
  const { id } = await response.json();

  return id;
}

const addToPlaylist = async (accessToken: string, playlistId: string, trackIds: string[]): Promise<void> => {
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
}

const fetchTracks = async (accessToken: string, offset: number, limit: number): Promise<TransformedTrack[]> => {
  const response = await fetch(`https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { items } = await response.json();

  const tracks: TransformedTrack[] = items.map((item: { track: any; added_at: any; }) => {
    const track = item.track;
    const title = track.name;
    const artist = track.artists.map((artist: { name: any; }) => artist.name).join(', ');
    const id = track.id;
    const addedAt = item.added_at;
  
    return { title, artist, id, addedAt };
  });

  return tracks
};


const getMonthsTrackIds = async (accessToken: string, targetMonth: number, targetYear: number): Promise<string[]> => {
  let offset =  0, limit = 30, allTracks: TransformedTrack[] = [], prevTracks: TransformedTrack[] = [];
  let tracks = await fetchTracks(accessToken, offset, limit);
  let lastDate = new Date(tracks[tracks.length - 1].addedAt);

  while ((lastDate.getFullYear() > targetYear)
    || (lastDate.getMonth() >= targetMonth && lastDate.getFullYear() === targetYear)) {
    prevTracks = tracks;
    allTracks = allTracks.concat(prevTracks);
    offset += limit;
    tracks = await fetchTracks(accessToken, offset, limit);
    lastDate = new Date(tracks[tracks.length - 1].addedAt);
  }
  allTracks = allTracks.concat(tracks);
  allTracks = allTracks.filter((track) => {
    const addedAt = new Date(track.addedAt);
    return addedAt.getFullYear() === targetYear && addedAt.getMonth() === targetMonth;
  });
  
  return allTracks.map((track) => track.id);
}

const monthNameToNumber = (monthName: string): number => {
  const date = new Date(`${monthName} 1, 2000`);
  return date.getMonth();
};

// TODO: 
// Error check for duplicate playlists
export const createMonthlyPlaylist = async (month: string, year: string): Promise<String> => {
  const playlistName = `${month}-${year.slice(2)}`;
  const accessToken = await getAccessToken();
  const userId = await getUserId(accessToken);
  const monthNumber = monthNameToNumber(month);
  const yearNumber = parseInt(year);
  const trackIds = await getMonthsTrackIds(accessToken, monthNumber, yearNumber);
  const playlistId = await createPlaylist(accessToken, userId, playlistName);
  await addToPlaylist(accessToken, playlistId, trackIds);

  return playlistName;
};