import { savedTracks } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET() {
  const tracks = await savedTracks();
  return NextResponse.json({ tracks }, { status: 200 });
}