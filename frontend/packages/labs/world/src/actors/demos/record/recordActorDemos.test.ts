// Recording the actor demos into strip PNGs.
//
// Not a test, despite the name and the file it lives in — the same build step
// wearing the same disguise as `rules/demos/record/recordRuleDemos`, and run by
// the same command:
//
//   yarn build:demos
//
// It needs a DOM for the same reason: an actor is Blockly JSON and the thing
// that compiles one is the headless generator. It needs no browser for a
// different one — the pictures here are drawings this repository makes, so the
// strip writer blits the pixels `generate-sprites` drew rather than decoding
// the PNGs it encoded from them.
//
// The output is gitignored and served, like the rule strips: `public/demos/`.

import {mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

import {drawStrip, rgb, type Cell} from '../../../rules/demos/record/strip';
import {DEMO_BACKGROUND, DEMO_FPS} from '../../../rules/demos/types';
import {ACTOR_DEMOS} from '../index';
import {ACTOR_DEMO_SIZE, type ActorDemo} from '../types';

import {actorDemoFrame, stageActorDemo, stepActorDemo} from './stage';

/** Play a demo, keeping one frame every so often. */
async function play(id: string, demo: ActorDemo): Promise<Cell[][]> {
  const staged = await stageActorDemo(id, demo);
  const frames: Cell[][] = [];
  const ticks = Math.round(demo.seconds * 60);
  const every = Math.round(60 / DEMO_FPS);
  for (let tick = 0; tick < ticks; tick++) {
    stepActorDemo(staged, demo, tick, () => {
      if (tick % every === 0) {
        frames.push(actorDemoFrame(id, staged.world, demo));
      }
    });
  }
  return frames;
}

describe('recording the actor demos', () => {
  it('writes a strip per demo', async () => {
    const {encodePng} = createRequire(import.meta.url)(
      '../../../../scripts/generate-sprites.mjs',
    ) as {encodePng: (rgba: Uint8Array, w: number, h: number) => Buffer};

    const out = join(__dirname, '../../../../public/demos/actors');
    mkdirSync(out, {recursive: true});

    const written: string[] = [];
    for (const [id, demo] of Object.entries(ACTOR_DEMOS)) {
      const frames = await play(id, demo);
      const pixels = drawStrip(frames, ACTOR_DEMO_SIZE, rgb(DEMO_BACKGROUND));
      writeFileSync(
        join(out, `${id}.png`),
        encodePng(
          pixels,
          ACTOR_DEMO_SIZE.width * frames.length,
          ACTOR_DEMO_SIZE.height,
        ),
      );
      written.push(`${id} (${frames.length} frames)`);
    }

    console.log(
      `actor demos: wrote ${written.join(', ')} to public/demos/actors/`,
    );
    expect(written.length).toBe(Object.keys(ACTOR_DEMOS).length);
  }, 120000);
});
