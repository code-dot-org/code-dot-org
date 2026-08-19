import {gifDurationMs} from '@cdo/apps/pythonlab/pythonHelpers/gifDuration';

// Gifs written by Pillow, the encoder the theater's python package uses.
// Three frames held 1.2s, 2.5s, and 0s (the closing frame carries no delay).
const THREE_FRAME_GIF =
  'R0lGODlhBAAEAIEAAP8AAAAAAAAAAAAAACH5BAR4AAAALAAAAAAEAAQAAAgJAAEIHEiwIICAACH5' +
  'BAX6AAEALAAAAAAEAAQAgQD/AAAAAAAAAAAAAAgJAAEIHEiwIICAACH5BAUAAAEALAAAAAAEAAQA' +
  'gQAA/wAAAAAAAAAAAAgJAAEIHEiwIICAADs=';
// A single frame, so no delay at all.
const ONE_FRAME_GIF =
  'R0lGODdhBAAEAIEAAP8AAAAAAAAAAAAAACH5BAQAAAAALAAAAAAEAAQAAAgJAAEIHEiwIICAADs=';

function bytesOf(base64: string) {
  return Uint8Array.from(Buffer.from(base64, 'base64'));
}

describe('gifDurationMs', () => {
  it('adds up the frame delays', () => {
    expect(gifDurationMs(bytesOf(THREE_FRAME_GIF))).toBe(3700);
  });

  it('returns zero for a gif that holds one frame', () => {
    expect(gifDurationMs(bytesOf(ONE_FRAME_GIF))).toBe(0);
  });

  it('returns null for bytes that are not a gif', () => {
    expect(gifDurationMs(new Uint8Array([1, 2, 3]))).toBeNull();
    expect(gifDurationMs(new Uint8Array(0))).toBeNull();
    expect(gifDurationMs(Uint8Array.from(Buffer.from('not a gif at all')))).toBeNull();
  });

  it('returns null for a gif that is cut short', () => {
    const truncated = bytesOf(THREE_FRAME_GIF).slice(0, 60);

    expect(gifDurationMs(truncated)).toBeNull();
  });
});
