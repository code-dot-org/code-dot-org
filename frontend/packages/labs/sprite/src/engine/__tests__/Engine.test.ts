import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import p5 from 'p5';
import {afterEach, describe, expect, it, vi} from 'vitest';

import 'vitest-canvas-mock';

import type {SpriteP5} from '../../sprites';
import type {RuntimeAnimationList} from '../../types';
import {SpriteLabEngine} from '../Engine';
import type {ProgramError} from '../interpreter/ProgramRunner';

(p5 as unknown as {disableFriendlyErrors: boolean}).disableFriendlyErrors =
  true;

// jsdom decodes no images, so costumes are not cropped.
vi.mock('../../imageTrim', async importOriginal => ({
  ...(await importOriginal<typeof import('../../imageTrim')>()),
  trimAnimationListImages: async (list: RuntimeAnimationList) => list,
}));

const NATIVE_SPRITE_LAB = readFileSync(
  join(
    __dirname,
    '../../../../../../../dashboard/config/libraries/NativeSpriteLab.interpreted.js',
  ),
  'utf8',
);

const engines: SpriteLabEngine[] = [];

afterEach(() => {
  engines.splice(0).forEach(engine => engine.destroy());
  vi.useRealTimers();
});

function image(name: string, extra = {}): RuntimeAnimationList {
  return {
    orderedKeys: [name],
    propsByKey: {
      [name]: {
        name,
        frameSize: {x: 50, y: 50},
        frameCount: 1,
        looping: true,
        frameDelay: 2,
        dataURI: `data:${name}`,
        ...extra,
      },
    },
  };
}

async function makeEngine(images: RuntimeAnimationList = image('cat')) {
  const engine: SpriteLabEngine = new SpriteLabEngine({
    container: document.body,
    images: () => images,
    loadLibrary: async () => NATIVE_SPRITE_LAB,
    loadImage: async (): Promise<p5.Image> =>
      (engine.p5 as unknown as p5).createImage(50, 50),
  });
  engines.push(engine);
  await engine.initForLevel({});
  return engine;
}

/** Runs `code` and holds the draw loop, so each `frame` is one frame. */
async function start(engine: SpriteLabEngine, code: string) {
  engine.setDrawPaused(true);
  await engine.runProgram(code, null);
  const p = engine.p5 as SpriteP5;
  // p5 draws once after setup even when not looping.
  await vi.waitFor(() => expect(p.frameCount).toBeGreaterThan(0));
  return p;
}

async function frame(engine: SpriteLabEngine, count = 1) {
  for (let i = 0; i < count; i++) {
    await (engine.p5 as unknown as p5).redraw();
  }
}

describe('SpriteLabEngine', () => {
  it('runs global code and then the draw loop', async () => {
    const engine = await makeEngine();
    await start(
      engine,
      [
        'var s = makeNewSpriteAnon("cat", locationAt(100, 300));',
        'repeatForever(function () { moveInDirection({id: s}, 2, "East"); });',
      ].join('\n'),
    );
    const sprite = engine.library?.nativeSpriteMap[0];
    expect(sprite?.getAnimationLabel()).toBe('cat');
    const x = sprite?.x as number;
    await frame(engine, 3);
    expect(sprite?.x).toBe(x + 6);
  });

  it('gives the program p5 functions and the helper library', async () => {
    const engine = await makeEngine();
    await start(
      engine,
      'var r = randomNumber(5, 5); var c = randColor(); var n = random(1, 1);',
    );
    expect(engine.runner?.evaluateWatchExpression('r')).toBe(5);
    expect(engine.runner?.evaluateWatchExpression('c')).toMatch(/^rgb|^#/);
    expect(engine.runner?.evaluateWatchExpression('n')).toBe(1);
  });

  it('a rerun starts over with the new program', async () => {
    const engine = await makeEngine();
    await start(engine, 'makeNewSpriteAnon("cat"); makeNewSpriteAnon("cat");');
    expect(engine.p5?.allSprites.length).toBe(2);
    await engine.runProgram('makeNewSpriteAnon("cat");', null);
    expect(engine.p5?.allSprites.length).toBe(1);
    expect(Object.keys(engine.library?.nativeSpriteMap ?? {})).toEqual(['0']);
  });

  it('reports an execution error and keeps drawing', async () => {
    const engine = await makeEngine();
    const errors: ProgramError[] = [];
    engine.onExecutionError = (error: ProgramError) => errors.push(error);
    await start(engine, 'makeNewSpriteAnon("cat");\nnope();');
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(2);
    const before = engine.p5?.frameCount as number;
    await frame(engine);
    expect(engine.p5?.frameCount).toBe(before + 1);
  });

  it('skips a block whose costume the project lacks', async () => {
    const engine = await makeEngine();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await start(engine, 'makeNewSpriteAnon("dog"); makeNewSpriteAnon("dog");');
    expect(engine.p5?.allSprites.length).toBe(0);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('hands the first frame of a run to captureFirstFrame', async () => {
    const engine = await makeEngine();
    const onFrame = vi.fn();
    engine.captureFirstFrame(onFrame);
    await start(engine, '');
    await frame(engine);
    expect(onFrame).toHaveBeenCalledOnce();
    expect(onFrame.mock.calls[0][0]).toBeInstanceOf(HTMLCanvasElement);
    await frame(engine);
    expect(onFrame).toHaveBeenCalledOnce();
  });

  it('jumps scenes after the delay, frozen until the next run', async () => {
    const engine = await makeEngine();
    const onGoToScene = vi.fn();
    engine.onGoToScene = onGoToScene;
    const onStart = vi.fn();
    engine.onSceneJumpStart = onStart;
    await start(engine, 'goToScene("next");');
    expect(onGoToScene).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(onGoToScene).toHaveBeenCalledWith('next'), {
      timeout: 2000,
    });
    expect(onStart).toHaveBeenCalledOnce();
    const count = engine.p5?.frameCount as number;
    await frame(engine);
    // Frozen: the frame is counted but nothing runs.
    expect(engine.p5?.frameCount).toBe(count + 1);
    const onLand = vi.fn();
    engine.onSceneJumpLand = onLand;
    await engine.runProgram('', null);
    expect(onLand).toHaveBeenCalledOnce();
  });

  it('pausing stops the library clock', async () => {
    const engine = await makeEngine();
    await start(engine, '');
    expect(engine.library?.currentPauseStartTime).toBeGreaterThan(0);
    engine.setDrawPaused(false);
    expect(engine.library?.currentPauseStartTime).toBe(0);
    engine.setDrawPaused(true);
  });

  it('decodes a costume the preload skipped when a block asks for it', async () => {
    const images: RuntimeAnimationList = {
      orderedKeys: ['cat', 'dog'],
      propsByKey: {...image('cat').propsByKey, ...image('dog').propsByKey},
    };
    const engine = await makeEngine(images);
    engine.setDrawPaused(true);
    await engine.runProgram(
      'var s = makeNewSpriteAnon("cat"); setAnimation({id: s}, "d" + "og");',
      new Set(['cat']),
    );
    const sprite = engine.library?.nativeSpriteMap[0];
    await vi.waitFor(() => expect(sprite?.getAnimationLabel()).toBe('dog'));
  });
});
