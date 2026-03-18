import Link from "next/link";
import { MediaItem } from "@/lib/types";

interface MediaCardProps {
  media: MediaItem;
}

export default function MediaCard({ media }: MediaCardProps) {
  // Generate a unique gradient based on the media ID
  const hashCode = media.id.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const hue1 = Math.abs(hashCode % 360);
  const hue2 = (hue1 + 40) % 360;

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
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
    <Link href={`/watch/${media.id}`} className="media-card">
      <div
        className="media-card__thumbnail"
        style={{
          background: `linear-gradient(135deg, hsl(${hue1}, 60%, 25%), hsl(${hue2}, 70%, 15%))`,
        }}
      >
        <div className="media-card__type-badge">
          {media.type === "video" ? "🎬" : "🎵"}
        </div>
        <div className="media-card__play-overlay">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>
      <div className="media-card__info">
        <h3 className="media-card__title">{media.title}</h3>
        <div className="media-card__meta">
          <span>{formatDate(media.uploadedAt)}</span>
          <span className="media-card__dot">·</span>
          <span>{formatFileSize(media.fileSize)}</span>
          <span className="media-card__dot">·</span>
          <span className="media-card__type">{media.type}</span>
        </div>
      </div>
    </Link>
  );
}
