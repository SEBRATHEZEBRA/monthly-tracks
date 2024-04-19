import { TransformedTrack } from '@/lib/types';

const getAccessToken = async (): Promise<any> => {
  const refreshToken: string | undefined = process.env.NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN;
  console.log("refresh_token:", refreshToken);

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

  return response.json();
};

export const savedTracks = async (): Promise<TransformedTrack[]> => {
  const { access_token } = await getAccessToken();
  let offset =  0;

  const response = await fetch(`https://api.spotify.com/v1/me/tracks?offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
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

  console.log("tracks:" , tracks);
  return tracks;


};
