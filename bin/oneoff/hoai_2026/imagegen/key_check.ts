// Keys each frame named on stdin as the lab would and prints how much of its
// border came out clear. validate_images --keys runs this with `npx tsx`
// from apps/, whose tsconfig resolves the @cdo imports removeBackground.ts
// needs.
//
// Each input line is JSON: {"path": ..., "key": "#FF00FF" or null,
// "soft": bool}. A frame with a key is keyed with it, as a character set's
// frames are (keyOutColor); one without is keyed from its top-left pixel,
// as a single sprite or block is (keyOutBackground). Each output line is
// {"path": ..., "cleared": 0..1} or {"path": ..., "error": ...}.

import * as fs from 'fs';
import {createRequire} from 'module';
import * as path from 'path';

import {
  keyOutBackground,
  keyOutColor,
} from '../../../../apps/src/p5lab/spritelab/lab2/ai/images/removeBackground';

// pngjs is an apps/ dependency; this file sits outside apps/.
const {PNG} = createRequire(
  path.join(__dirname, '../../../../apps/package.json'),
)('pngjs');

// How deep a band of the frame's edge is measured, in model pixels.
const RING = 4;

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function borderCleared(data: Uint8Array, width: number, height: number) {
  let clear = 0;
  let all = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x >= RING && y >= RING && x < width - RING && y < height - RING) {
        continue;
      }
      all++;
      if (data[(y * width + x) * 4 + 3] < 128) {
        clear++;
      }
    }
  }
  return all ? clear / all : 0;
}

for (const line of fs.readFileSync(0, 'utf8').split('\n')) {
  if (!line.trim()) {
    continue;
  }
  const {path: file, key, soft} = JSON.parse(line);
  try {
    const png = PNG.sync.read(fs.readFileSync(file));
    const data = new Uint8ClampedArray(png.data.buffer, 0, png.data.length);
    if (key) {
      keyOutColor(data, png.width, png.height, rgb(key), {soft});
    } else {
      keyOutBackground(data, png.width, png.height, {soft});
    }
    const cleared = borderCleared(png.data, png.width, png.height);
    console.log(JSON.stringify({path: file, cleared}));
  } catch (error) {
    console.log(JSON.stringify({path: file, error: String(error)}));
  }
}
