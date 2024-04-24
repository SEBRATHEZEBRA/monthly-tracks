import { DynamoDBClient, PutItemCommand, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Table } from "sst/node/table";
import { Config } from 'sst/node/config';
import fetch from "node-fetch";
import { SpotifyIdResponse, SpotifyPlaylistResponse, SpotifyTokenResponse, SpotifyTracksResponse, TransformedTrack } from './types';

const client = new DynamoDBClient({});

const getAccessToken = async (): Promise<any> => {
  const refreshToken: string | undefined = Config.SPOTIFY_REFRESH_TOKEN;  
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${Config.SPOTIFY_CLIENT_ID}:${Config.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken || "",
    }).toString(),
  });
  const { access_token } = await response.json() as SpotifyTokenResponse;

  return access_token;
};

const getUserId = async (accessToken: string): Promise<string> => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { id } = await response.json() as SpotifyIdResponse;

  return id;
}

const getPlaylists = async (accessToken: string, userId: string): Promise<any> => {
  const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { items } = await response.json() as SpotifyPlaylistResponse
  const names = items.map((item: { name: string; }) => item.name);

  return names;
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
  const { id } = await response.json() as SpotifyIdResponse;

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
  const { items } = await response.json() as SpotifyTracksResponse;

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

const createMonthlyPlaylist = async (month: string, year: string): Promise<String> => {
  const playlistName = `${month} ${year.slice(2)}`;
  const accessToken = await getAccessToken();
  const userId = await getUserId(accessToken);
  const playlists = await getPlaylists(accessToken, userId);
  if (playlists.includes(playlistName)) {
    return "Playlist already exists";
  }
  
  const monthNumber = monthNameToNumber(month);
  const yearNumber = parseInt(year);
  const trackIds = await getMonthsTrackIds(accessToken, monthNumber, yearNumber);
  const playlistId = await createPlaylist(accessToken, userId, playlistName);
  await addToPlaylist(accessToken, playlistId, trackIds);

  return playlistName;
};

const putItem = async (params: PutItemCommandInput) => {
  try {
    await client.send(new PutItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};

export const handler = async(event: APIGatewayProxyEvent) => {
  let data, params, playlistName;

  if (event.body) {
    data = JSON.parse(event.body);
    playlistName = `${data.month}-${(data.year.slice(2) ?? new Date().getFullYear())}`;
    params = {
      TableName: Table.users.tableName,
      Item: {
        userId: { S: data.userId },
        playlistId: { S: playlistName },
        createdAt: { S: new Date().toISOString() },
      },
    };
    await createMonthlyPlaylist(data.month, data.year);
    putItem(params);
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "No data provided" }),
    };
  }
};
