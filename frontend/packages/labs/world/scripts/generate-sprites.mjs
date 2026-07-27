// Generates World Lab's built-in appearance assets under public/vendor/sprites/,
// so the preview surface loads them as self-hosted files (no CDN, no runtime
// network — like the other vendor assets). Two kinds:
//   - static sprites: one `${name}.png` image;
//   - animations: a horizontal spritesheet `${name}.png` of N frames.
// Pure Node: a minimal RGBA PNG encoder over `node:zlib`, no image dependency.
// SPRITE_NAMES / ANIMATION_SPECS / SPRITE_SIZE are the source of truth the
// driver mirrors in src/sprites.ts (a test keeps them in sync).

import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {deflateSync} from 'node:zlib';

export const SPRITE_SIZE = 32;
export const SPRITE_NAMES = ['player', 'ground', 'coin', 'box', 'ball'];
export const ANIMATION_SPECS = {
  coinSpin: {frames: 6, frameRate: 12},
  playerWalk: {frames: 4, frameRate: 8},
};

// ── A tiny RGBA canvas (w × h, h defaults to w) ──────────────────────────────
function canvas(w, h = w) {
  const data = new Uint8Array(w * h * 4); // transparent
  const put = (x, y, [r, g, b, a = 255]) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = (y * w + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  };
  const ellipse = (cx, cy, rx, ry, color) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        if (nx * nx + ny * ny <= 1) put(x, y, color);
      }
    }
  };
  const disc = (cx, cy, radius, color) =>
    ellipse(cx, cy, radius, radius, color);
  const roundRect = (x0, y0, rw, rh, radius, color) => {
    for (let y = y0; y < y0 + rh; y++) {
      for (let x = x0; x < x0 + rw; x++) {
        const dx = Math.max(x0 + radius - x, x - (x0 + rw - 1 - radius), 0);
        const dy = Math.max(y0 + radius - y, y - (y0 + rh - 1 - radius), 0);
        if (dx * dx + dy * dy <= radius * radius) put(x, y, color);
      }
    }
  };
  const rect = (x0, y0, rw, rh, color) => roundRect(x0, y0, rw, rh, 0, color);
  return {data, w, h, put, disc, ellipse, roundRect, rect};
}

/** Copy a frame canvas into a sheet canvas at column `dx`. */
function blit(sheet, frame, dx) {
  for (let y = 0; y < frame.h; y++) {
    for (let x = 0; x < frame.w; x++) {
      const s = (y * frame.w + x) * 4;
      const d = (y * sheet.w + (dx + x)) * 4;
      for (let k = 0; k < 4; k++) sheet.data[d + k] = frame.data[s + k];
    }
  }
}

// ── Drawing ──────────────────────────────────────────────────────────────────
function playerBody(c) {
  c.roundRect(3, 3, 26, 24, 7, [58, 123, 213]); // blue body
  c.disc(12, 13, 2.6, [255, 255, 255]); // eyes
  c.disc(20, 13, 2.6, [255, 255, 255]);
  c.disc(12, 13, 1.2, [20, 30, 50]);
  c.disc(20, 13, 1.2, [20, 30, 50]);
}

const STATIC = {
  player: c => playerBody(c),
  ground(c) {
    c.rect(0, 8, 32, 24, [107, 74, 43]); // soil
    c.rect(0, 8, 32, 6, [90, 160, 44]); // grass top
  },
  coin(c) {
    c.disc(16, 16, 13, [244, 196, 48]);
    c.disc(16, 16, 9, [255, 224, 120]);
    c.disc(16, 16, 5, [244, 196, 48]);
  },
  box(c) {
    c.rect(2, 2, 28, 28, [120, 78, 38]);
    c.rect(4, 4, 24, 24, [217, 138, 61]);
    for (let d = 0; d < 24; d++) {
      c.put(4 + d, 4 + d, [120, 78, 38]);
      c.put(27 - d, 4 + d, [120, 78, 38]);
    }
  },
  ball(c) {
    c.disc(16, 16, 13, [224, 72, 62]);
    c.disc(12, 12, 4, [255, 170, 165]);
  },
};

// Each animation draws frame `t` (0..frames-1) into a SPRITE_SIZE canvas.
const ANIMATION_FRAME = {
  // A coin spinning about its vertical axis: the disc squashes horizontally to
  // an edge and back. Colour shifts toward the darker rim at the thin frames.
  coinSpin(c, t, frames) {
    const wf = Math.max(0.12, Math.abs(Math.cos((Math.PI * t) / frames)));
    const gold = wf > 0.4 ? [244, 196, 48] : [196, 150, 30];
    c.ellipse(16, 16, 13 * wf, 13, gold);
    c.ellipse(16, 16, 9 * wf, 9, [255, 224, 120]);
  },
  // The player walking: body plus two legs that alternate lifting.
  playerWalk(c, t) {
    playerBody(c);
    const lift = [
      [0, 3],
      [1, 1],
      [3, 0],
      [1, 1],
    ][t];
    c.rect(11, 27, 4, 5 - lift[0], [40, 78, 150]); // left leg
    c.rect(17, 27, 4, 5 - lift[1], [40, 78, 150]); // right leg
  },
};

// ── PNG encoding (RGBA, 8-bit, no filtering) ─────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, dataBuf) {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), dataBuf]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(dataBuf.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(rgba, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, y * width * 4, width * 4).copy(
      raw,
      y * (width * 4 + 1) + 1,
    );
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Write every built-in sprite and animation PNG into `outDir`. */
export function generateSprites(outDir) {
  mkdirSync(outDir, {recursive: true});
  for (const name of SPRITE_NAMES) {
    const c = canvas(SPRITE_SIZE);
    STATIC[name](c);
    writeFileSync(
      join(outDir, `${name}.png`),
      encodePng(c.data, SPRITE_SIZE, SPRITE_SIZE),
    );
  }
  for (const [name, {frames}] of Object.entries(ANIMATION_SPECS)) {
    const sheet = canvas(SPRITE_SIZE * frames, SPRITE_SIZE);
    for (let t = 0; t < frames; t++) {
      const frame = canvas(SPRITE_SIZE);
      ANIMATION_FRAME[name](frame, t, frames);
      blit(sheet, frame, t * SPRITE_SIZE);
    }
    writeFileSync(
      join(outDir, `${name}.png`),
      encodePng(sheet.data, SPRITE_SIZE * frames, SPRITE_SIZE),
    );
  }
  return {sprites: SPRITE_NAMES, animations: Object.keys(ANIMATION_SPECS)};
}
