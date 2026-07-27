// Generates World Lab's built-in sprite images as real PNG files under
// public/vendor/sprites/, so the preview surface loads them as self-hosted
// assets (no CDN, no runtime network — like the other vendor assets). A single
// image per sprite for now; spritesheets/animations are later work
// (GLOSSARY.md). Pure Node: a minimal RGBA PNG encoder over `node:zlib`, no
// image dependency. `SPRITE_NAMES` is the source of truth the driver preloads.

import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {deflateSync} from 'node:zlib';

export const SPRITE_NAMES = ['player', 'ground', 'coin', 'box', 'ball'];
const SIZE = 32;

// ── A tiny RGBA canvas ───────────────────────────────────────────────────────
function canvas(size) {
  const data = new Uint8Array(size * size * 4); // transparent
  const put = (x, y, [r, g, b, a = 255]) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  };
  const disc = (cx, cy, radius, color) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= radius * radius) put(x, y, color);
      }
    }
  };
  const roundRect = (x0, y0, w, h, radius, color) => {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        const dx = Math.max(x0 + radius - x, x - (x0 + w - 1 - radius), 0);
        const dy = Math.max(y0 + radius - y, y - (y0 + h - 1 - radius), 0);
        if (dx * dx + dy * dy <= radius * radius) put(x, y, color);
      }
    }
  };
  const rect = (x0, y0, w, h, color) => roundRect(x0, y0, w, h, 0, color);
  return {data, put, disc, roundRect, rect};
}

// ── The sprite set ───────────────────────────────────────────────────────────
const DRAW = {
  player(c) {
    c.roundRect(3, 3, 26, 26, 7, [58, 123, 213]); // blue body
    c.disc(12, 14, 2.6, [255, 255, 255]); // eyes
    c.disc(20, 14, 2.6, [255, 255, 255]);
    c.disc(12, 14, 1.2, [20, 30, 50]);
    c.disc(20, 14, 1.2, [20, 30, 50]);
  },
  ground(c) {
    c.rect(0, 8, 32, 24, [107, 74, 43]); // soil
    c.rect(0, 8, 32, 6, [90, 160, 44]); // grass top
  },
  coin(c) {
    c.disc(16, 16, 13, [244, 196, 48]); // gold
    c.disc(16, 16, 9, [255, 224, 120]); // highlight ring
    c.disc(16, 16, 5, [244, 196, 48]);
  },
  box(c) {
    c.rect(2, 2, 28, 28, [120, 78, 38]); // border
    c.rect(4, 4, 24, 24, [217, 138, 61]); // crate face
    for (let d = 0; d < 24; d++) {
      c.put(4 + d, 4 + d, [120, 78, 38]); // diagonal slats
      c.put(27 - d, 4 + d, [120, 78, 38]);
    }
  },
  ball(c) {
    c.disc(16, 16, 13, [224, 72, 62]); // red
    c.disc(12, 12, 4, [255, 170, 165]); // shine
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
function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'latin1');
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(rgba, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  // 10,11,12 = compression/filter/interlace = 0
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(
      raw,
      y * (size * 4 + 1) + 1,
    );
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Write every built-in sprite PNG into `outDir`; returns the names written. */
export function generateSprites(outDir) {
  mkdirSync(outDir, {recursive: true});
  for (const name of SPRITE_NAMES) {
    const c = canvas(SIZE);
    DRAW[name](c);
    writeFileSync(join(outDir, `${name}.png`), encodePng(c.data, SIZE));
  }
  return SPRITE_NAMES;
}
