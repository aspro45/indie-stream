import { MediaItem } from "./types";

const KV_KEY = "indie_stream_media";

// In-memory fallback for local dev (when Vercel KV env vars aren't set)
let localStore: MediaItem[] = [];

function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Read all media items from the store.
 */
export async function getAllMedia(): Promise<MediaItem[]> {
  if (!isKVAvailable()) {
    return localStore;
  }
  const { kv } = await import("@vercel/kv");
  const items = await kv.get<MediaItem[]>(KV_KEY);
  return items ?? [];
}

/**
 * Get a single media item by ID.
 */
export async function getMediaById(id: string): Promise<MediaItem | undefined> {
  const items = await getAllMedia();
  return items.find((item) => item.id === id);
}

/**
 * Add a new media item to the store.
 */
export async function addMedia(item: MediaItem): Promise<void> {
  if (!isKVAvailable()) {
    localStore = [item, ...localStore];
    return;
  }
  const { kv } = await import("@vercel/kv");
  const items = await getAllMedia();
  await kv.set(KV_KEY, [item, ...items]);
}
