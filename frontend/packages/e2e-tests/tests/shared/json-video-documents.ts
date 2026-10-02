import type {Page} from '@playwright/test';

// Documents for <json-video>, served in place of the lesson's own videos so a
// spec knows how each one is authored. The element plays a video's top-level
// `audio` track through one <audio> element and each scene's own `audio`
// clip through another; which a video uses is decided when it is authored,
// and the real documents live in S3.

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
  const samples = seconds * sampleRate;
  const buf = Buffer.alloc(44 + samples, 0x80);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate, 28);
  buf.writeUInt16LE(1, 32);
  buf.writeUInt16LE(8, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples, 40);
  return 'data:audio/wav;base64,' + buf.toString('base64');
}

// Scenes are long enough that no scene boundary (which also starts a scene
// clip) falls inside a test's polling window.
const scene = (label: string, audio?: string): JsonVideoScene => ({
  duration: '30s',
  speech: label,
  html:
    '<div style="display:flex;align-items:center;justify-content:center;' +
    'height:100vh;background:#1f1976;color:#fff;font:700 3rem sans-serif">' +
    `${label}</div>`,
  ...(audio ? {audio} : {}),
});

/** Narration on each scene and no top-level track: how the pipeline emits videos. */
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

/**
 * Answer the page's json video content requests with the given documents,
 * handed out in order of first request: the first video key the page asks for
 * gets documents[0], the next new key documents[1], and so on; a key asked
 * for again (the carousel going back) gets the document it had. The lesson's
 * own videos are never fetched.
 */
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
