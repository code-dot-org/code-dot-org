import type {Page} from '@playwright/test';
import {readFileSync} from 'fs';
import path from 'path';

// Replace the lesson's real videos, whose audio layout a spec cannot rely on.

/** A scene of a json video document; see apps/src/jsonVideo. */
interface JsonVideoScene {
  duration: string;
  speech: string;
  html: string;
  audio?: string;
}

interface JsonVideoDocument {
  audio?: string;
  scenes: JsonVideoScene[];
}

/** Twelve seconds of silence, inlined as the lesson pipeline inlines clips. */
const SILENT_CLIP =
  'data:audio/wav;base64,' +
  readFileSync(path.join(__dirname, '../fixtures/silence.wav')).toString(
    'base64',
  );

// 30s so no scene boundary, which also starts a clip, falls inside a poll.
const scene = (label: string, audio?: string): JsonVideoScene => ({
  duration: '30s',
  speech: label,
  html:
    '<div style="display:flex;align-items:center;justify-content:center;' +
    'height:100vh;background:#1f1976;color:#fff;font:700 3rem sans-serif">' +
    `${label}</div>`,
  ...(audio ? {audio} : {}),
});

/** Narrated per scene with no top-level track, as the lesson pipeline emits. */
export const SCENE_NARRATED_VIDEO: JsonVideoDocument = {
  scenes: [scene('Scene one', SILENT_CLIP), scene('Scene two', SILENT_CLIP)],
};
export const SCENE_NARRATED_VIDEO_SECONDS = 60;

/** One top-level track over a silent scene: how the older videos are built. */
export const MAIN_TRACK_VIDEO: JsonVideoDocument = {
  audio: SILENT_CLIP,
  scenes: [scene('Main track')],
};
export const MAIN_TRACK_VIDEO_SECONDS = 30;

/** Hands out documents by order of first request: the page picks the keys. */
export async function serveJsonVideos(
  page: Page,
  documents: JsonVideoDocument[],
): Promise<void> {
  const byKey = new Map<string, JsonVideoDocument>();
  await page.route('**/json_videos/*/content', route => {
    const key = new URL(route.request().url()).pathname.split('/').at(-2)!;
    if (!byKey.has(key)) {
      const next = documents[byKey.size];
      if (!next) {
        return route.fulfill({status: 404});
      }
      byKey.set(key, next);
    }
    return route.fulfill({json: byKey.get(key)});
  });
}
