"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MediaCard from "@/components/MediaCard";
import { MediaItem } from "@/lib/types";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function ProfilePage() {
  const { account, connected } = useWallet();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    async function loadMedia() {
      try {
        const res = await fetch("/api/media");
        const data = await res.json();
        if (account?.address) {
          const addr = account.address.toString().toLowerCase();
          const userMedia = data.media.filter(
            (item: MediaItem) =>
              item.accountAddress.toLowerCase() === addr ||
              item.uploaderWallet?.toLowerCase() === addr
          );
          setMedia(userMedia);
          setTotalSize(
            userMedia.reduce((sum: number, item: MediaItem) => sum + item.fileSize, 0)
          );
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    loadMedia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address?.toString()]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (!connected || !account) {
    return (
      <main className="page-container">
        <div className="profile-page">
          <div className="profile-page__not-connected">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 10h20" />
              <circle cx="17" cy="15" r="1.5" />
            </svg>
            <h2>Connect Your Wallet</h2>
            <p>Connect your Aptos wallet to view your uploads and manage your content.</p>
          </div>
        </div>
      </main>
    );
  }

  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <main className="page-container">
      <div className="profile-page">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header__avatar">
            <div
              className="profile-header__avatar-inner"
              style={{
                background: `linear-gradient(135deg, hsl(${
                  parseInt(account.address.toString().slice(2, 6), 16) % 360
                }, 70%, 50%), hsl(${
                  (parseInt(account.address.toString().slice(2, 6), 16) + 60) % 360
                }, 70%, 40%))`,
              }}
            />
          </div>
          <div className="profile-header__info">
            <h1 className="profile-header__title">My Profile</h1>
            <p className="profile-header__address">
              <code>{truncateAddress(account.address.toString())}</code>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat__value">{media.length}</span>
            <span className="profile-stat__label">Uploads</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">
              {media.filter((m) => m.type === "video").length}
            </span>
            <span className="profile-stat__label">Videos</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">
              {media.filter((m) => m.type === "audio").length}
            </span>
            <span className="profile-stat__label">Audio</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{formatFileSize(totalSize)}</span>
            <span className="profile-stat__label">Total Size</span>
          </div>
        </div>

        {/* Uploads */}
        <div className="profile-uploads">
          <div className="profile-uploads__header">
            <h2>My Uploads</h2>
            <Link href="/upload" className="btn btn--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Upload New
            </Link>
          </div>

          {loading ? (
            <div className="profile-uploads__loading">
              <div className="player__spinner" />
              <p>Loading your uploads...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="profile-uploads__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>You haven&apos;t uploaded anything yet</p>
              <Link href="/upload" className="btn btn--primary">
                Upload your first track
              </Link>
            </div>
          ) : (
            <div className="feed-grid">
              {media
                .sort(
                  (a, b) =>
                    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
                )
                .map((item) => (
                  <MediaCard key={item.id} media={item} />
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
