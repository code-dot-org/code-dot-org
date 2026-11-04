import type {Page} from '@playwright/test';
import {deflateSync} from 'node:zlib';

import {mockDcdo} from './dcdo';

/**
 * Stands in for the AI gateway behind Sprite Lab in Lab2's image generation,
 * which the browser calls directly (apps/src/aiGateway/generateText.ts) after
 * fetching an access token from dashboard. Both calls are intercepted here:
 * the token answers with Turnstile disabled, so no challenge script loads,
 * and every generation answers with a fixed pixel-art picture. The safety
 * judges are turned off by their DCDO flag, and answered as safe if one is
 * asked anyway.
 */

const AI_GATEWAY_URL = 'https://ai-gateway.code.org';
const IMAGE_SAFETY_DCDO_KEY = 'spritelab-lab2-image-safety-enabled';

/** The picture every generation returns: 1024px square, 32px art pixels. */
const IMAGE_PX = 1024;
const BLOCK_PX = 32;

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(Buffer.from(type, 'ascii'), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/** An RGB PNG from a pixel function, encoded with no dependencies. */
function encodePng(
  size: number,
  pixel: (x: number, y: number) => [number, number, number],
): Buffer {
  const raw = new Uint8Array(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1);
    raw[row] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y);
      raw.set([r, g, b], row + 1 + x * 3);
    }
  }
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, size);
  view.setUint32(4, size);
  header.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', new Uint8Array(deflateSync(raw))),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

/**
 * A pixel-art figure on a flat magenta key color, which the lab floods to
 * transparency. Backgrounds keep the same picture: they are flattened, not
 * keyed. The figure is a 12 by 16 block body with a lighter head, standing
 * on the bottom edge as a character would.
 */
function fakePicture(): string {
  const key: [number, number, number] = [255, 0, 255];
  const body: [number, number, number] = [60, 120, 220];
  const head: [number, number, number] = [240, 200, 120];
  const blocks = IMAGE_PX / BLOCK_PX;
  const png = encodePng(IMAGE_PX, (x, y) => {
    const bx = Math.floor(x / BLOCK_PX);
    const by = Math.floor(y / BLOCK_PX);
    const left = blocks / 2 - 6;
    const inBody = bx >= left && bx < left + 12 && by >= blocks - 16;
    if (!inBody) {
      return key;
    }
    return by < blocks - 12 ? head : body;
  });
  return png.toString('base64');
}

let pictureBase64: string | undefined;

/**
 * Route the gateway and its token endpoint for `page`. Call after the page
 * is on the target host, since the safety flag is a cookie on that host.
 * Returns the number of pictures handed out so far, as a function.
 */
export async function fakeImageGeneration(page: Page): Promise<() => number> {
  pictureBase64 ??= fakePicture();
  let pictures = 0;
  await mockDcdo(page, IMAGE_SAFETY_DCDO_KEY, false);
  await page.route('**/ai_gateway/access_token', route =>
    route.fulfill({
      json: {token: 'fake-token', turnstileEnforcementMode: 'disabled'},
    }),
  );
  await page.route(`${AI_GATEWAY_URL}/**`, route => {
    const body = route.request().postDataJSON() as {output?: unknown} | null;
    if (body?.output) {
      // A safety judge asking for a classification.
      return route.fulfill({
        json: {text: '', finishReason: 'stop', output: {classification: 'OK'}},
      });
    }
    pictures += 1;
    return route.fulfill({
      json: {
        text: '',
        finishReason: 'stop',
        files: [{mediaType: 'image/png', base64: pictureBase64}],
      },
    });
  });
  return () => pictures;
}
