// app/api/monthly-playlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createMonthlyPlaylist } from "@/lib/createPlaylist";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { month, year } = await request.json().catch(() => ({}));
  if (typeof month !== "string" || typeof year !== "string") {
    return NextResponse.json(
      { error: "Request body must be { month: string, year: string }" },
      { status: 400 }
    );
  }

  try {
    const playlistName = await createMonthlyPlaylist(
      session.accessToken as string,
      month,
      year
    );
    return NextResponse.json({ playlistName });
  } catch (err: unknown) {
    let message: string;
    if (err instanceof Error) {
      message = err.message;
    } else {
      message = String(err);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
