import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getShelbyClient, getAccount, getShelbyRetrievalUrl } from "@/lib/shelby";
import { addMedia } from "@/lib/mediaStore";
import { MediaItem } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const walletAddress = formData.get("walletAddress") as string | null;

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required." },
        { status: 400 }
      );
    }

    // Determine media type from MIME
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");

    if (!isVideo && !isAudio) {
      return NextResponse.json(
        { error: "Only audio and video files are supported." },
        { status: 400 }
      );
    }

    // Read file into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a unique blob name
    const id = uuidv4();
    const extension = file.name.split(".").pop() || "bin";
    const blobName = `media/${id}.${extension}`;

    // Upload to Shelby
    const shelbyClient = getShelbyClient();
    const account = getAccount();

    await shelbyClient.upload({
      signer: account,
      blobData: buffer,
      blobName: blobName,
      expirationMicros: (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000, // 30 days
    });

    // Save metadata — store upload wallet if provided
    const mediaItem: MediaItem = {
      id,
      title,
      type: isVideo ? "video" : "audio",
      blobName,
      accountAddress: account.accountAddress.toString(),
      uploaderWallet: walletAddress || undefined,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
      mimeType: file.type,
    };

    addMedia(mediaItem);

    return NextResponse.json({
      success: true,
      media: mediaItem,
      streamUrl: getShelbyRetrievalUrl(mediaItem.accountAddress, blobName),
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed. Please check your Shelby API key and account credentials.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
