import { NextRequest, NextResponse } from "next/server";
import { getAllMedia, addMedia } from "@/lib/mediaStore";
import { getShelbyRetrievalUrl } from "@/lib/shelby";
import { MediaItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const media = await getAllMedia();
    return NextResponse.json({ media });
  } catch (error) {
    console.error("Failed to get media:", error);
    return NextResponse.json({ media: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, type, blobName, accountAddress, uploaderWallet, fileSize, mimeType } = body;

    if (!id || !title || !blobName || !accountAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const mediaItem: MediaItem = {
      id,
      title,
      type,
      blobName,
      accountAddress,
      uploaderWallet,
      uploadedAt: new Date().toISOString(),
      fileSize,
      mimeType,
    };

    await addMedia(mediaItem);

    return NextResponse.json({
      success: true,
      media: mediaItem,
      streamUrl: getShelbyRetrievalUrl(accountAddress, blobName),
    });
  } catch (error) {
    console.error("Failed to save media metadata:", error);
    return NextResponse.json({ error: "Failed to save metadata" }, { status: 500 });
  }
}
