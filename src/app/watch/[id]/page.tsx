import { notFound } from "next/navigation";
import Link from "next/link";
import MediaPlayer from "@/components/MediaPlayer";
import { getMediaById } from "@/lib/mediaStore";
import { getShelbyRetrievalUrl } from "@/lib/shelby";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const media = getMediaById(id);

  if (!media) {
    notFound();
  }

  const streamUrl = getShelbyRetrievalUrl(media.accountAddress, media.blobName);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <main className="page-container">
      <div className="watch-page">
        <Link href="/" className="watch-page__back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to feed
        </Link>

        <div className="watch-page__player">
          <MediaPlayer
            src={streamUrl}
            type={media.type}
            title={media.title}
            mimeType={media.mimeType}
          />
        </div>

        <div className="watch-page__info">
          <h1 className="watch-page__title">{media.title}</h1>
          <div className="watch-page__meta">
            <span className="watch-page__badge">
              {media.type === "video" ? "🎬 Video" : "🎵 Audio"}
            </span>
            <span>{formatDate(media.uploadedAt)}</span>
            <span>{formatFileSize(media.fileSize)}</span>
          </div>
          <div className="watch-page__shelby-info">
            <div className="shelby-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Stored on Shelby Protocol
            </div>
            <p className="watch-page__blob-name">
              <code>{media.blobName}</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
