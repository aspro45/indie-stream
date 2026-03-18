import { NextResponse } from "next/server";
import { getAllMedia } from "@/lib/mediaStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const media = getAllMedia();
    return NextResponse.json({ media });
  } catch (error) {
    console.error("Failed to get media:", error);
    return NextResponse.json({ media: [] });
  }
}
