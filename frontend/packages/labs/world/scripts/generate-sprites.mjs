// Draws World Lab's built-in appearance assets. Two kinds:
//   - static sprites: one `${name}.png` image;
//   - animations: a horizontal spritesheet `${name}.png` of N frames.
// Pure Node: a minimal RGBA PNG encoder over `node:zlib`, no image dependency.
//
// The BYTES reach the lab through `write-stock-assets.mjs`, which bakes them
// into `src/appearance/stockImages.ts` as data URLs — a project owns every image
// it draws, so an import copies one in rather than pointing at a file the
// runtime serves. Nothing loads these over the network.
//
// `generateSprites(dir)` writes the PNGs out as files, which nothing in the lab
// needs. It is kept because it is how you LOOK at a drawing: render to a
// scratch directory and open them, rather than editing arithmetic blind.
//
// SPRITE_NAMES / ANIMATION_SPECS / SPRITE_SIZE are the source of truth the
// library mirrors in src/appearance/stock.ts (a test keeps them in sync).

import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {deflateSync} from 'node:zlib';

export const SPRITE_SIZE = 32;
export const SPRITE_NAMES = [
  'player',
  'ground',
  'coin',
  'box',
  'ball',
  // An asteroids-shaped set: something to fly, something to break, something to
  // break it with. All three point UP unrotated, because `facing` is (0,-1)
  // turned by the actor's rotation — a drawing that pointed right would fly
  // sideways the moment anything used it (rules/drive).
  'ship',
  'asteroid',
  'shot',
];
export const ANIMATION_SPECS = {
  coinSpin: {frames: 6, frameRate: 12},
  playerWalk: {frames: 4, frameRate: 8},
  switch: {frames: 6, frameRate: 12},
  shipThrust: {frames: 4, frameRate: 12},
  asteroidSpin: {frames: 8, frameRate: 10},
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
  /**
   * Fill a polygon, even-odd, so a concave outline works.
   *
   * The ship needs it: its tail is a notch, which is the one thing discs and
   * rectangles cannot say. Tested at pixel CENTRES, matching how `ellipse`
   * decides, so a shape drawn both ways lines up.
   */
  const polygon = (points, color) => {
    let minY = h;
    let maxY = 0;
    for (const [, py] of points) {
      minY = Math.min(minY, Math.floor(py));
      maxY = Math.max(maxY, Math.ceil(py));
    }
    for (let y = Math.max(0, minY); y <= Math.min(h - 1, maxY); y++) {
      for (let x = 0; x < w; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const [xi, yi] = points[i];
          const [xj, yj] = points[j];
          if (
            yi > py !== yj > py &&
            px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
          ) {
            inside = !inside;
          }
        }
        if (inside) put(x, y, color);
      }
    }
  };
  return {data, w, h, put, disc, ellipse, roundRect, rect, polygon};
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

// ── The asteroids set ────────────────────────────────────────────────────────
// Shared so the still and its animation cannot drift: `ship` and `shipThrust`
// draw the same hull, `asteroid` and `asteroidSpin` the same rock.

const HULL = [
  [16, 3],
  [26, 26],
  [16, 20],
  [6, 26],
];
const HULL_EDGE = [64, 74, 96];
const HULL_FILL = [214, 222, 235];

/** Shrink a ring of points toward a centre — an outline is the shape, twice. */
const shrink = (points, cx, cy, by) =>
  points.map(([x, y]) => [cx + (x - cx) * by, cy + (y - cy) * by]);

function shipHull(c) {
  c.polygon(HULL, HULL_EDGE);
  c.polygon(shrink(HULL, 16, 18, 0.62), HULL_FILL);
  c.disc(16, 13, 2.2, [70, 130, 200]); // the cockpit, so the nose is readable
}

/**
 * The flame, pointing back out of the notch.
 *
 * Drawn from the tail rather than from the centre so it reads as coming OUT of
 * the ship; `length` is what flickers.
 */
function shipFlame(c, length) {
  c.polygon(
    [
      [11, 20],
      [21, 20],
      [16, 20 + length],
    ],
    [244, 132, 42],
  );
  c.polygon(
    [
      [13, 20],
      [19, 20],
      [16, 20 + length * 0.62],
    ],
    [255, 214, 120],
  );
}

// NINE radii turned by eighths of a circle: nine never maps onto itself at 45
// degrees, so every frame is a real rotation rather than the same silhouette
// relabelled, and eight of them come back round to the start.
//
// Nine rather than seven, and 12–15 rather than 11–15: seven wide-swinging
// vertices made a wedge with a bite out of it, which reads as a broken pie
// chart. A rock wants many small facets, not few deep ones.
const ROCK_RADII = [13.2, 14.6, 12.4, 15, 13.8, 12.2, 14.4, 12.8, 13.6];
const ROCK_PITS = [
  [6, 40, 2.6],
  [7.5, 170, 2.0],
  [5, 275, 1.6],
];

const rockPoints = turn =>
  ROCK_RADII.map((r, i) => {
    const a = turn + (i * 2 * Math.PI) / ROCK_RADII.length;
    return [16 + r * Math.cos(a), 16 + r * Math.sin(a)];
  });

function rock(c, turn) {
  const points = rockPoints(turn);
  c.polygon(points, [92, 94, 106]);
  c.polygon(shrink(points, 16, 16, 0.82), [143, 146, 158]);
  // Craters carried round with the rock, so it reads as turning rather than as
  // an outline wobbling in place.
  for (const [dist, deg, size] of ROCK_PITS) {
    const a = turn + (deg * Math.PI) / 180;
    c.disc(
      16 + dist * Math.cos(a),
      16 + dist * Math.sin(a),
      size,
      [110, 112, 124],
    );
  }
}

const STATIC = {
  player: c => playerBody(c),
  ground(c) {
    // Fill the whole cell so the drawn tile is an exact 32x32 square: its top
    // edge is the cell top, matching the collision box (rules/collision.ts), so
    // an actor rests on the visible grass rather than floating above it.
    c.rect(0, 0, 32, 32, [107, 74, 43]); // soil fills the tile
    c.rect(0, 0, 32, 6, [90, 160, 44]); // grass top strip
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
  ship: c => shipHull(c),
  asteroid: c => rock(c, 0),
  shot(c) {
    // A short bolt rather than a dot, so it reads as travelling — and vertical,
    // so it still points the way it was fired once rotation is applied.
    c.roundRect(14, 10, 5, 13, 2.5, [255, 196, 84]);
    c.roundRect(15, 12, 3, 9, 1.5, [255, 248, 214]);
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
  // A tile-mounted switch: a lever on a base that sweeps from one side (frame 0)
  // to the other (last frame). The engine plays it non-looping, so it flips once
  // and holds; the knob shifts red (off) -> green (on) as it crosses.
  // The ship under power: the same hull, with a flame that flickers rather than
  // pulsing evenly — a smooth in-and-out reads as breathing, not burning.
  shipThrust(c, t) {
    // Long enough that the SHORT frames still clear the hull: the tail sits at
    // y=26, so a plume under about six pixels is drawn entirely underneath the
    // ship and the flicker reads as the flame cutting out.
    shipFlame(c, [11, 8, 10, 9][t]);
    shipHull(c);
  },
  // The rock turning. An eighth of a circle per frame, seven sides.
  asteroidSpin(c, t, frames) {
    rock(c, (t * 2 * Math.PI) / frames);
  },
  switch(c, t, frames) {
    c.roundRect(6, 21, 20, 9, 3, [78, 84, 94]); // housing on the tile
    c.roundRect(6, 21, 20, 3, 3, [120, 128, 140]); // top highlight
    c.disc(16, 22, 2.5, [40, 44, 52]); // pivot
    const denom = Math.max(1, frames - 1);
    const rad = ((135 - (90 * t) / denom) * Math.PI) / 180; // 135deg -> 45deg
    const L = 11;
    const tipX = 16 + L * Math.cos(rad);
    const tipY = 22 - L * Math.sin(rad);
    for (let s = 0; s <= 16; s++) {
      // The lever arm: a thick metal line from the pivot to the knob.
      const x = 16 + ((tipX - 16) * s) / 16;
      const y = 22 + ((tipY - 22) * s) / 16;
      c.disc(x, y, 1.4, [176, 182, 190]);
    }
    const f = t / denom;
    c.disc(tipX, tipY, 3.5, [
      Math.round(220 + (90 - 220) * f),
      Math.round(72 + (200 - 72) * f),
      Math.round(62 + (90 - 62) * f),
    ]); // knob: red (off) -> green (on)
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

/**
 * Every stock image, as `{name: pngBuffer}`.
 *
 * The bytes, with nowhere to put them: `generateSprites` writes them to disk for
 * the demo's vendor directory, and `write-stock-assets.mjs` writes them into the
 * lab's source as data URLs, which is what an import copies into a project.
 */
export function stockImages() {
  const images = {};
  for (const name of SPRITE_NAMES) {
    const c = canvas(SPRITE_SIZE);
    STATIC[name](c);
    images[name] = encodePng(c.data, SPRITE_SIZE, SPRITE_SIZE);
  }
  for (const [name, {frames}] of Object.entries(ANIMATION_SPECS)) {
    const sheet = canvas(SPRITE_SIZE * frames, SPRITE_SIZE);
    for (let t = 0; t < frames; t++) {
      const frame = canvas(SPRITE_SIZE);
      ANIMATION_FRAME[name](frame, t, frames);
      blit(sheet, frame, t * SPRITE_SIZE);
    }
    images[name] = encodePng(sheet.data, SPRITE_SIZE * frames, SPRITE_SIZE);
  }
  return images;
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
