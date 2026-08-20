// Recording the rule demos into strip PNGs.
//
// Not a test, despite the name and the file it lives in. It is a build step
// that needs a DOM — the rules are Blockly JSON, and the thing that compiles
// them is the headless generator — so vitest is what runs it, through a config
// of its own:
//
//   yarn build:rule-demos
//
// NO BROWSER. `build-effect-stills` drives Playwright and its header calls the
// browser in the build path a cost it pays reluctantly; this pays nothing,
// because a demo actor wears no picture and an actor with no picture is drawn
// as a plain rectangle by the real driver too. So the strip is painted into a
// byte array and encoded by the PNG writer `generate-sprites` already had.
//
// The output is gitignored and served, like the backdrops: `public/demos/`.

import {mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

import {
  ALL_STOCK_SOURCES,
  compileStockRules,
} from '../../__tests__/support/compileStockRules';
import {RULE_DEMOS} from '../index';
import {DEMO_BACKGROUND, DEMO_SIZE, viewOrigin, type RuleDemo} from '../types';

import {drawStrip, rgb, type Box} from './strip';

/**
 * Every stock rule, by the path a demo names it with, in DEPENDENCY ORDER.
 *
 * All of them, rather than the ones today's demos happen to need: a demo
 * declares its `rules` and the union is what would have to be assembled here
 * otherwise — a second list, kept in step by hand, whose failure mode is the
 * one this already hit ("Cannot read properties of undefined"). Compiling a
 * rule nobody asks for costs milliseconds.
 *
 * The order is the order: a rule is evaluated against the ones before it.
 */

/** Frames a second in the recording — not the simulation's rate. */
const FPS = 12;

/**
 * Play a demo, keeping one frame every so often.
 *
 * The world still ticks at sixty a second, because that is what the rules were
 * written against and a rule stepped at twelve would fall differently. Only the
 * KEEPING is at twelve: a two-second demo is then twenty-four cells rather than
 * a hundred and twenty, which is the difference between a strip worth serving
 * and one nobody would.
 */
function play(
  demo: RuleDemo,
  modules: Parameters<RuleDemo['build']>[0],
): Box[][] {
  const {world} = demo.build(modules);
  const frames: Box[][] = [];
  const ticks = Math.round(demo.seconds * 60);
  const every = Math.round(60 / FPS);
  for (let tick = 0; tick < ticks; tick++) {
    if (tick % every === 0) {
      const view = viewOrigin(world);
      frames.push(
        world.renderSnapshot().map(state => {
          const id = (state.actor as unknown as {id: string}).id;
          const look = demo.look(id, state.actor);
          return {
            id,
            x: state.x - view.x,
            y: state.y - view.y,
            width: look.width,
            height: look.height,
            colour: rgb(look.colour),
          };
        }),
      );
    }
    world.tick(1 / 60);
  }
  return frames;
}

describe('recording the rule demos', () => {
  it('writes a strip per demo', async () => {
    const modules = await compileStockRules(ALL_STOCK_SOURCES);
    const {encodePng} = createRequire(import.meta.url)(
      '../../../../scripts/generate-sprites.mjs',
    ) as {encodePng: (rgba: Uint8Array, w: number, h: number) => Buffer};

    const out = join(__dirname, '../../../../public/demos');
    mkdirSync(out, {recursive: true});

    const written: string[] = [];
    for (const [id, demo] of Object.entries(RULE_DEMOS)) {
      const frames = play(demo, modules);
      const pixels = drawStrip(frames, DEMO_SIZE, rgb(DEMO_BACKGROUND));
      writeFileSync(
        join(out, `${id}.png`),
        encodePng(pixels, DEMO_SIZE.width * frames.length, DEMO_SIZE.height),
      );
      written.push(`${id} (${frames.length} frames)`);
    }

    console.log(`rule demos: wrote ${written.join(', ')} to public/demos/`);
    expect(written.length).toBe(Object.keys(RULE_DEMOS).length);
  }, 60000);
});
