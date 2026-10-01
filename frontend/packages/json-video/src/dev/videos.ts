import type {JsonVideoData, JsonVideoScene} from '../index';

// Silent 8-bit PCM WAV, so the audio elements have something real to decode
// without a media fixture in the repo.
function silentWavBytes(seconds: number, sampleRate = 8000): ArrayBuffer {
  const samples = seconds * sampleRate;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  ascii(8, 'WAVEfmt ');
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  ascii(36, 'data');
  view.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128); // 8-bit PCM silence
  return buffer;
}

// The lesson pipeline inlines each clip as a data URI, so these do too.
function silentWavDataUri(seconds: number): string {
  const bytes = new Uint8Array(silentWavBytes(seconds));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

// Scenes are 30 s so nothing in a test's polling window crosses a boundary.
const scene = (label: string, audio?: string): JsonVideoScene => ({
  duration: '30s',
  speech: label,
  html:
    '<div style="display:flex;align-items:center;justify-content:center;' +
    'height:100vh;background:#1f1976;color:#fff;font:700 3rem sans-serif">' +
    `${label}</div>`,
  ...(audio ? {audio} : {}),
});

const toHref = (video: JsonVideoData) =>
  'data:application/json,' + encodeURIComponent(JSON.stringify(video));

// The two shapes the element has to handle: narration on each scene with no
// top-level track (how the lesson pipeline emits videos), and one top-level
// track over a silent scene (how the older examples are built).
export const DEV_VIDEOS = [
  {
    description: 'Narrated per scene, no top-level track (1:00)',
    href: toHref({
      scenes: [
        scene('Scene one', silentWavDataUri(12)),
        scene('Scene two', silentWavDataUri(12)),
      ],
    }),
  },
  {
    description: 'One top-level track over a silent scene (0:30)',
    href: toHref({
      audio: silentWavDataUri(12),
      scenes: [scene('Main track')],
    }),
  },
];
