import Link from "next/link";
import MediaCard from "@/components/MediaCard";
import { getAllMedia } from "@/lib/mediaStore";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const media = getAllMedia().sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <main className="page-container">
      <div className="feed-page">
        <div className="feed-page__header">
          <div>
            <h1 className="feed-page__title">Discover</h1>
            <p className="feed-page__subtitle">
              Stream indie music and videos from the decentralized web
            </p>
          </div>
          <Link href="/upload" className="btn btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Upload
          </Link>
        </div>

        {media.length === 0 ? (
          <div className="feed-page__empty">
            <div className="feed-page__empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
            </div>
            <h2>No media yet</h2>
            <p>Be the first to upload content to the decentralized network!</p>
            <Link href="/upload" className="btn btn--primary btn--lg">
              Upload your first track
            </Link>
          </div>
        ) : (
          <div className="feed-grid">
            {media.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
