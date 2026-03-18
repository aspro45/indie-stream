import fs from "fs";
import path from "path";
import { MediaItem } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "media.json");

/**
 * Ensure the data directory and JSON file exist.
 */
function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2), "utf-8");
  }
}

/**
 * Read all media items from the JSON store.
 */
export function getAllMedia(): MediaItem[] {
  ensureStore();
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw) as MediaItem[];
}

/**
 * Get a single media item by ID.
 */
export function getMediaById(id: string): MediaItem | undefined {
  const items = getAllMedia();
  return items.find((item) => item.id === id);
}

/**
 * Add a new media item to the store.
 */
export function addMedia(item: MediaItem): void {
  const items = getAllMedia();
  items.push(item);
  fs.writeFileSync(STORE_PATH, JSON.stringify(items, null, 2), "utf-8");
}
