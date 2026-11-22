// gta6-clipper-01 entry (Node 22, standard library only).
//
// The entry is the video itself, so this program has one job: hand the gate the
// video's YouTube address. It reads VIDEO.json from the repository root, checks
// that the address is a YouTube video URL (shorts/<id>, watch?v=<id> or youtu.be/<id>,
// the id 11 characters of A-Z a-z 0-9 _ -), and copies it to /output/VIDEO.json.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in
// for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const VIDEO_URL = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?#].*)?$/;

export function readVideo(source: string): string {
  const parsed: unknown = JSON.parse(readFileSync(source, 'utf8'));
  const url = typeof parsed === 'object' && parsed !== null ? (parsed as { url?: unknown }).url : undefined;
  if (typeof url !== 'string' || !VIDEO_URL.test(url)) {
    throw new Error(`VIDEO.json holds no YouTube video address: ${JSON.stringify(url)}`);
  }
  return url;
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const source = join(BOT_DIR, 'VIDEO.json');
  const url = readVideo(source);
  copyFileSync(source, join(OUTPUT_DIR, 'VIDEO.json'));
  console.log(`video: ${url}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    main();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
