import type {Page} from '@playwright/test';
import {WaveFile} from 'wavefile';

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

/** 8-bit PCM silence, as the data URI the lesson pipeline inlines clips as. */
function silentWavDataUri(seconds: number, sampleRate = 8000): string {
  const wav = new WaveFile();
  // 0x80 is the zero level of unsigned 8-bit PCM.
  wav.fromScratch(
    1,
    sampleRate,
    '8',
    new Uint8Array(seconds * sampleRate).fill(0x80),
  );
  return wav.toDataURI();
}

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
  scenes: [
    scene('Scene one', silentWavDataUri(12)),
    scene('Scene two', silentWavDataUri(12)),
  ],
};
export const SCENE_NARRATED_VIDEO_SECONDS = 60;

/** One top-level track over a silent scene: how the older videos are built. */
export const MAIN_TRACK_VIDEO: JsonVideoDocument = {
  audio: silentWavDataUri(12),
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
