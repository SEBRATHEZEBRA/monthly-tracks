// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import type { JWT } from "next-auth/jwt";

// 1) A little refresh routine
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const basic = Buffer.from(
      `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
      method: "POST",
    });

    if (!response.ok) throw await response.json();

    const refreshed = await response.json();
    return {
      ...token,
      accessToken: refreshed.access_token,
      // expires_in is in seconds
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      // Spotify sometimes doesn’t return a new refresh_token, so fall back
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("🔄 Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope:
            "user-read-email playlist-read-private playlist-modify-private playlist-modify-public",
          show_dialog: "true",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // 2a) When you first sign in, store access/refresh tokens & expiry
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token!,
          refreshToken: account.refresh_token!,
          accessTokenExpires: Date.now() + Number(account.expires_in!) * 1000,
        };
      }

      // 2b) If token still valid, just return it
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // 2c) Otherwise refresh
      return refreshAccessToken(token);
    },

    // 3) Make the fresh accessToken available in the session
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
