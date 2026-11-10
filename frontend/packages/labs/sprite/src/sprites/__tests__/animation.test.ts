import type p5 from 'p5';
import {describe, expect, it, vi} from 'vitest';

import {Animation, SpriteSheet} from '../animation';
import {tintImageData, tintPixel} from '../animation/tint';
import type {SpriteP5} from '../types';

import {
  clearCanvasEvents,
  drawImageCalls,
  frame,
  frames,
  makeImage,
  makeInstance,
  recordP5,
} from './harness';

type Triple = [number, boolean, boolean];

function run(animation: Animation, updates: number): Triple[] {
  const seen: Triple[] = [];
  for (let i = 0; i < updates; i++) {
    animation.update();
    seen.push([
      animation.getFrame(),
      animation.playing,
      animation.frameChanged,
    ]);
  }
  return seen;
}

function frameIndices(animation: Animation, updates: number): number[] {
  return run(animation, updates).map(triple => triple[0]);
}

async function withImages(): Promise<{
  p: SpriteP5;
  images: (count: number, w?: number, h?: number) => p5.Image[];
}> {
  const p = await makeInstance();
  return {
    p,
    images: (count, w = 10, h = 10) =>
      Array.from({length: count}, () => makeImage(p, w, h)),
  };
}

describe('animation.md', () => {
  describe('sprite sheets', () => {
    it.each([
      [
        400,
        100,
        100,
        100,
        4,
        [
          [0, 0],
          [100, 0],
          [200, 0],
          [300, 0],
        ],
      ],
      [
        250,
        200,
        100,
        100,
        7,
        [
          [0, 0],
          [100, 0],
          [200, 0],
          [0, 100],
          [100, 100],
          [200, 100],
          [0, 0],
        ],
      ],
      [
        200,
        100,
        100,
        100,
        5,
        [
          [0, 0],
          [100, 0],
          [0, 0],
          [100, 0],
          [0, 0],
        ],
      ],
      [
        300,
        300,
        100,
        150,
        2,
        [
          [0, 0],
          [100, 0],
        ],
      ],
    ])(
      'CMP-27, ANI-1..ANI-3: a %ix%i image cut into %ix%i frames, %i of them',
      async (w, h, fw, fh, n, origins) => {
        const p = await makeInstance();
        const sheet = p.loadSpriteSheet(makeImage(p, w, h), fw, fh, n);
        expect(sheet).toBeInstanceOf(p.SpriteSheet);
        expect(sheet.frames.map(r => [r.frame.x, r.frame.y])).toEqual(origins);
        expect(sheet.frames.map(r => r.name)).toEqual(origins.map((_, i) => i));
        for (const record of sheet.frames) {
          expect([record.frame.width, record.frame.height]).toEqual([fw, fh]);
        }
        expect([
          sheet.frame_width,
          sheet.frame_height,
          sheet.num_frames,
        ]).toEqual([fw, fh, n]);
      },
    );

    it('ANI-1, ANI-2: the list form', async () => {
      const p = await makeInstance();
      const image = makeImage(p, 50, 50);
      const frames = [
        {name: 'a', frame: {x: 0, y: 0, width: 10, height: 20}},
        {name: 'b', frame: {x: 10, y: 0, width: 30, height: 20}},
      ];
      const sheet = new p.SpriteSheet(image, frames);
      expect(sheet.image).toBe(image);
      expect(sheet.frames).toEqual(frames);
      expect(sheet.frames[1]).toBe(frames[1]);
      expect([sheet.frame_width, sheet.frame_height, sheet.num_frames]).toEqual(
        [0, 0, 2],
      );
    });

    it('CMP-28, ANI-4: a clone shares the image and copies the rectangles', async () => {
      const p = await makeInstance();
      const sheet = p.loadSpriteSheet(makeImage(p, 200, 100), 100, 100, 2);
      const copy = sheet.clone();
      expect(copy).toBeInstanceOf(SpriteSheet);
      expect(copy.image).toBe(sheet.image);
      expect([copy.frame_width, copy.frame_height, copy.num_frames]).toEqual([
        100, 100, 2,
      ]);
      expect(copy.frames[1].frame).toEqual(sheet.frames[1].frame);
      expect(copy.frames[1].frame).not.toBe(sheet.frames[1].frame);
      expect(copy.frames[1].name).toBeUndefined();
    });
  });

  describe('animation objects', () => {
    it('ANI-5..ANI-9: a new animation over a 400x100 sheet', async () => {
      const p = await makeInstance();
      const sheet = p.loadSpriteSheet(makeImage(p, 400, 100), 100, 100, 4);
      const a = p.loadAnimation(sheet);
      expect(a).toBeInstanceOf(p.Animation);
      expect(a.spriteSheet).toBe(sheet);
      expect(a.images.length).toBe(4);
      expect(a.images[2]).toBe(sheet.frames[2].frame);
      expect([a.getWidth(), a.getHeight(), a.frameDelay]).toEqual([
        100, 100, 4,
      ]);
      expect([a.playing, a.looping, a.visible, a.frameChanged]).toEqual([
        true,
        true,
        true,
        false,
      ]);
      expect([a.getFrame(), a.getLastFrame(), a.offX, a.offY]).toEqual([
        0, 3, 0, 0,
      ]);
      expect(a.getFrameImage()).toBe(sheet.frames[0].frame);
    });

    it('ANI-5: the image-list form keeps argument order', async () => {
      const {p, images} = await withImages();
      const [x, y] = [...images(1, 30, 40), ...images(1, 5, 6)];
      const a = new p.Animation(x, y);
      expect(a.images).toEqual([x, y]);
      expect(a.spriteSheet).toBeUndefined();
      expect([a.getWidth(), a.getHeight()]).toEqual([30, 40]);
    });

    it('ANI-10: a clone', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.frameDelay = 7;
      a.changeFrame(2);
      a.stop();
      a.looping = false;
      a.offX = 5;
      a.visible = false;
      a.update();
      const b = a.clone();
      expect(b.getFrame()).toBe(0);
      expect([b.frameDelay, b.playing, b.looping, b.offX, b.visible]).toEqual([
        7,
        false,
        false,
        5,
        true,
      ]);
      expect(b.images).not.toBe(a.images);
      expect(b.images).toEqual(a.images);
      expect(b.images[0]).toBe(a.images[0]);
      b.play();
      b.frameDelay = 1;
      b.update();
      // A fresh update count: the first update is n = 1.
      expect(b.getFrame()).toBe(1);
    });

    it('ANI-10: a clone of a sheet animation clones the sheet, same image', async () => {
      const p = await makeInstance();
      const sheet = p.loadSpriteSheet(makeImage(p, 400, 100), 100, 100, 4);
      const a = p.loadAnimation(sheet);
      const b = a.clone();
      expect(b.spriteSheet).not.toBe(sheet);
      expect(b.spriteSheet!.image).toBe(sheet.image);
      expect(b.images[1]).toBe(a.images[1]);
    });
  });

  describe('advancing', () => {
    it('ANI-11: 4 frames, delay 4, looping', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      const t = true;
      const f = false;
      expect(run(a, 13)).toEqual([
        [0, t, f],
        [0, t, f],
        [0, t, f],
        [1, t, t],
        [1, t, f],
        [1, t, f],
        [1, t, f],
        [2, t, t],
        [2, t, f],
        [2, t, f],
        [2, t, f],
        [3, t, t],
        [3, t, f],
      ]);
      expect(frameIndices(a, 4)).toEqual([3, 3, 0, 0]);
    });

    it('ANI-11: 3 frames, delay 1, not looping', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(3));
      a.frameDelay = 1;
      a.looping = false;
      expect(run(a, 5)).toEqual([
        [1, true, true],
        [2, true, true],
        [2, false, false],
        [2, false, false],
        [2, false, false],
      ]);
    });

    it('ANI-11: 3 frames, delay 2, not looping', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(3));
      a.frameDelay = 2;
      a.looping = false;
      expect(run(a, 8)).toEqual([
        [0, true, false],
        [1, true, true],
        [1, true, false],
        [2, true, true],
        [2, true, false],
        [2, false, false],
        [2, false, false],
        [2, false, false],
      ]);
    });

    it('CMP-25, ANI-13: delay 0 never advances', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.frameDelay = 0;
      expect(run(a, 6)).toEqual(Array(6).fill([0, true, false]));
    });

    it('CMP-25, ANI-13: delay 2.5 advances on exact multiples', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.frameDelay = 2.5;
      expect(frameIndices(a, 10)).toEqual([0, 0, 0, 0, 1, 1, 1, 1, 1, 2]);
    });

    it('CMP-25, ANI-13: delay -2 behaves as 2', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.frameDelay = -2;
      expect(frameIndices(a, 6)).toEqual([0, 1, 1, 2, 2, 3]);
    });

    it('CMP-24, ANI-12: stop, play and a new delay keep the update count', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      const seen: number[] = [];
      for (let n = 1; n <= 12; n++) {
        if (n === 2) a.stop();
        if (n === 6) a.play();
        if (n === 9) a.frameDelay = 3;
        a.update();
        seen.push(a.getFrame());
      }
      expect(seen).toEqual([0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 3]);
    });

    it('ANI-11, ANI-29: a single frame stops at its first update', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(1, 30, 40));
      a.update();
      expect([a.playing, a.getFrame(), a.getWidth(), a.getHeight()]).toEqual([
        false,
        0,
        30,
        40,
      ]);
    });

    it('ANI-15: nextFrame and previousFrame', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.changeFrame(3);
      a.nextFrame();
      expect([a.getFrame(), a.playing]).toEqual([0, false]);
      const b = new Animation(...images(4));
      b.looping = false;
      b.changeFrame(3);
      b.nextFrame();
      expect([b.getFrame(), b.playing]).toEqual([3, false]);
      const c = new Animation(...images(4));
      c.previousFrame();
      expect([c.getFrame(), c.playing]).toEqual([3, false]);
      const d = new Animation(...images(4));
      d.looping = false;
      d.previousFrame();
      expect(d.getFrame()).toBe(0);
      d.changeFrame(2);
      d.previousFrame();
      d.nextFrame();
      expect(d.getFrame()).toBe(2);
    });

    it('CMP-26, ANI-14: changeFrame clamps above, not below, and keeps playing', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.changeFrame(10);
      expect([a.getFrame(), a.playing]).toEqual([3, true]);
      a.changeFrame(-1);
      expect([a.getFrame(), a.getWidth(), a.getHeight()]).toEqual([-1, 1, 1]);
      expect(a.getFrameImage()).toBeUndefined();
      a.changeFrame(2.5);
      expect([a.getFrame(), a.getWidth()]).toEqual([2.5, 1]);
      a.stop();
      a.changeFrame(1);
      expect([a.getFrame(), a.playing]).toEqual([1, false]);
    });

    it('ANI-16: play, stop, rewind', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.stop();
      expect(a.playing).toBe(false);
      a.changeFrame(2);
      a.rewind();
      expect(a.getFrame()).toBe(0);
      a.play();
      expect(a.playing).toBe(true);
    });

    it('ANI-17: goToFrame(2) from 0, delay 4, 14 updates', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.goToFrame(2);
      const seen = run(a, 14).map(([f, playing]) => [f, playing]);
      expect(seen).toEqual([
        [0, true],
        [0, true],
        [0, true],
        [1, true],
        [1, true],
        [1, true],
        [1, true],
        [2, true],
        [2, true],
        [2, true],
        [2, true],
        [2, false],
        [2, false],
        [2, false],
      ]);
    });

    it('ANI-17: goToFrame out of range does nothing; backward steps down; play clears the target', async () => {
      const {images} = await withImages();
      const a = new Animation(...images(4));
      a.stop();
      a.goToFrame(4);
      a.goToFrame(-1);
      expect(a.playing).toBe(false);
      a.changeFrame(3);
      a.frameDelay = 1;
      a.goToFrame(1);
      expect(a.playing).toBe(true);
      expect(frameIndices(a, 3)).toEqual([2, 1, 1]);
      expect(a.playing).toBe(false);
      a.goToFrame(3);
      a.play();
      a.update();
      expect(a.getFrame()).toBe(2);
    });
  });

  describe("a sprite's animations", () => {
    async function table(): Promise<SpriteP5> {
      const p = await makeInstance();
      const walkSheet = p.loadSpriteSheet(makeImage(p, 400, 100), 100, 100, 4);
      const jumpSheet = p.loadSpriteSheet(makeImage(p, 160, 80), 80, 80, 2);
      p.predefinedAnimations = {
        walk: p.loadAnimation(walkSheet),
        jump: p.loadAnimation(jumpSheet),
        rock: makeImage(p, 50, 70),
      };
      return p;
    }

    it('ANI-18: a new sprite has no animation', async () => {
      const p = await table();
      const s = p.createSprite();
      expect(s.getAnimationLabel()).toBe('');
      expect(s.animation).toBeUndefined();
      expect(s.frameDelay).toBeUndefined();
      s.frameDelay = 3;
      expect(s.frameDelay).toBeUndefined();
    });

    it('ANI-21, ANI-22, ANI-28: setAnimation, frames, delay, switching and the unknown name', async () => {
      const p = await table();
      const s = p.createSprite();
      s.setAnimation('walk');
      const entry = p.predefinedAnimations!.walk as Animation;
      expect(s.getAnimationLabel()).toBe('walk');
      expect(s.animation).not.toBe(entry);
      expect(s.animation!.images).toEqual(entry.images);
      expect([s.width, s.height, s.frameDelay]).toEqual([100, 100, 4]);

      const seen: number[] = [];
      for (let i = 0; i < 10; i++) {
        await frame(p);
        seen.push(s.animation!.getFrame());
      }
      expect(seen).toEqual([0, 0, 0, 1, 1, 1, 1, 2, 2, 2]);

      s.frameDelay = 2;
      expect(entry.frameDelay).toBe(4);
      expect(s.animation!.frameDelay).toBe(2);

      s.setAnimation('jump');
      expect([s.width, s.height, s.animation!.getFrame()]).toEqual([80, 80, 0]);

      s.setAnimation('walk');
      expect([s.animation!.getFrame(), s.frameDelay]).toEqual([0, 4]);

      s.setAnimation('rock');
      const rock = p.predefinedAnimations!.rock;
      expect(s.animation!.images.length).toBe(1);
      expect(s.animation!.images[0]).toBe(rock);
      expect([s.width, s.height, s.frameDelay]).toEqual([50, 70, 4]);

      expect(() => s.setAnimation('nope')).toThrow(
        'Unable to find an animation named "nope".  Please make sure the animation exists.',
      );
      expect(s.getAnimationLabel()).toBe('rock');
    });

    it('ANI-21: the same name keeps frame, count and playing state', async () => {
      const p = await table();
      const s = p.createSprite();
      s.setAnimation('walk');
      await frames(p, 4);
      s.pause();
      const current = s.animation;
      s.setAnimation('walk');
      expect(s.animation).toBe(current);
      expect([s.animation!.getFrame(), s.animation!.playing]).toEqual([
        1,
        false,
      ]);
      s.setAnimation('jump');
      s.setAnimation('walk');
      expect([s.animation!.getFrame(), s.animation!.playing]).toEqual([
        0,
        true,
      ]);
    });

    it('CMP-5, ANI-19: scale and stretch size a new animation', async () => {
      const p = await table();
      const a = p.createSprite();
      a.scale = 0.5;
      a.setAnimation('walk');
      expect([a.width, a.height]).toEqual([50, 50]);
      const b = p.createSprite();
      b.setAnimation('walk');
      b.width = 50;
      b.setAnimation('jump');
      expect([b.width, b.height]).toEqual([20, 80]);
    });

    it('ANI-19: addAnimation keeps the first as current and still resizes', async () => {
      const {p, images} = await withImages();
      const s = p.createSprite();
      const a = new Animation(...images(1, 100, 100));
      const b = new Animation(...images(1, 40, 60));
      const stored = s.addAnimation('m', a);
      expect(stored).not.toBe(a);
      s.addAnimation('n', b);
      expect(s.getAnimationLabel()).toBe('m');
      expect(s.animation).toBe(stored);
      expect([s.width, s.height]).toEqual([40, 60]);
      const [x, y] = images(2, 7, 8);
      const listed = s.addAnimation('list', x, y) as Animation;
      expect(listed.images).toEqual([x, y]);
    });

    it('ANI-19: a non-string label prints an error and returns -1', async () => {
      const {p, images} = await withImages();
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      const s = p.createSprite();
      expect(s.addAnimation(3 as unknown as string, images(1)[0])).toBe(-1);
      expect(log).toHaveBeenCalled();
      expect(s.animation).toBeUndefined();
      log.mockRestore();
    });

    it('ANI-20: changeAnimation to an unknown label prints and changes nothing', async () => {
      const p = await table();
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      const s = p.createSprite();
      s.setAnimation('walk');
      const before = s.animation;
      s.changeAnimation('zzz');
      expect(log).toHaveBeenCalledWith(
        'changeAnimation error: no animation labeled zzz',
      );
      expect(s.getAnimationLabel()).toBe('walk');
      expect(s.animation).toBe(before);
      log.mockRestore();
    });

    it('ANI-20: changeAnimation does not clone, rewind or resize', async () => {
      const {p, images} = await withImages();
      const s = p.createSprite();
      const m = s.addAnimation(
        'm',
        new Animation(...images(3, 10, 10)),
      ) as Animation;
      const n = s.addAnimation(
        'n',
        new Animation(...images(1, 50, 50)),
      ) as Animation;
      m.changeFrame(2);
      s.changeAnimation('n');
      s.changeAnimation('m');
      expect(s.animation).toBe(m);
      expect(m.getFrame()).toBe(2);
      expect(n).not.toBe(m);
      expect([s.width, s.height]).toEqual([50, 50]);
    });

    it('ANI-23: a removed sprite does not advance', async () => {
      const p = await table();
      const s = p.createSprite();
      s.setAnimation('walk');
      s.frameDelay = 1;
      s.remove();
      await frames(p, 2);
      expect(s.animation!.getFrame()).toBe(0);
    });

    it('ANI-23: stored animations that are not current do not advance', async () => {
      const p = await table();
      const s = p.createSprite();
      s.setAnimation('walk');
      const walk = s.animation!;
      walk.frameDelay = 1;
      s.addAnimation('other', p.predefinedAnimations!.jump as Animation);
      s.changeAnimation('other');
      await frames(p, 2);
      expect(walk.getFrame()).toBe(0);
      expect(s.animation!.getFrame()).toBe(0);
    });

    it('ANI-24: frame changes never alter the size', async () => {
      const {p, images} = await withImages();
      p.predefinedAnimations = {
        mixed: new Animation(...images(1, 10, 10), ...images(1, 40, 20)),
      };
      const s = p.createSprite();
      s.setAnimation('mixed');
      s.animation!.changeFrame(1);
      await frame(p);
      expect([s.width, s.height]).toEqual([10, 10]);
    });

    it('ANI-25: play rewinds a finished, stopped, non-looping animation', async () => {
      const {p, images} = await withImages();
      const s = p.createSprite();
      s.addAnimation('m', new Animation(...images(4)));
      const a = s.animation!;
      a.looping = false;
      a.changeFrame(3);
      s.pause();
      expect(a.playing).toBe(false);
      s.play();
      expect([a.getFrame(), a.playing]).toEqual([0, true]);
      a.changeFrame(2);
      a.stop();
      s.play();
      expect(a.getFrame()).toBe(2);
      const bare = p.createSprite();
      expect(() => {
        bare.play();
        bare.pause();
      }).not.toThrow();
    });

    it('ANI-26: delay is the runtime’s, not an animation setting', async () => {
      const p = await table();
      const s = p.createSprite() as ReturnType<SpriteP5['createSprite']> & {
        delay?: number;
      };
      expect('delay' in s).toBe(false);
      s.setAnimation('walk');
      s.delay = 1;
      expect(s.frameDelay).toBe(4);
    });

    it('ANI-28: frames shown by drawSprites after a mid-draw costume change', async () => {
      const p = await table();
      const s = p.createSprite();
      const shown: number[] = [];
      await frame(p, () => s.setAnimation('walk'));
      shown.push(s.animation!.getFrame());
      for (let k = 1; k <= 8; k++) {
        await frame(p, () => {
          p.drawSprites();
          shown.push(s.animation!.getFrame());
        });
      }
      expect(shown).toEqual([0, 0, 0, 0, 1, 1, 1, 1, 2]);
    });

    it('ANI-40: stop holds the frame and changeFrame shows in the same draw', async () => {
      const p = await table();
      const s = p.createSprite(100, 100);
      s.setAnimation('walk');
      s.frameDelay = 1;
      let source: number | undefined;
      await frame(p, () => {
        s.animation!.stop();
        s.animation!.changeFrame(3);
        clearCanvasEvents(p);
        p.drawSprites();
        source = drawImageCalls(p)[0].props.sx;
      });
      expect(source).toBe(300);
      await frames(p, 3);
      expect(s.animation!.getFrame()).toBe(3);
    });

    it('CMP-6, ANI-41: the natural size can be reset to the frame size, keeping the stretch', async () => {
      const p = await table();
      const s = p.createSprite();
      s.scale = 0.5;
      s.setAnimation('walk');
      s.width = 100;
      expect([s.width, s.height]).toEqual([100, 50]);
      s.setNaturalSize(s.animation!.getWidth(), s.animation!.getHeight());
      expect([s.width, s.height]).toEqual([200, 100]);
    });
  });

  describe('drawing', () => {
    it('ANI-30..ANI-32: frame 2 of a sheet, scaled and mirrored', async () => {
      const p = await makeInstance();
      const sheet = p.loadSpriteSheet(makeImage(p, 400, 100), 100, 50, 8);
      p.predefinedAnimations = {sheet: p.loadAnimation(sheet)};
      const s = p.createSprite(200, 150);
      s.setAnimation('sheet');
      s.scale = 0.5;
      s.mirrorX(-1);
      s.animation!.changeFrame(2);
      clearCanvasEvents(p);
      s.display();
      const [call] = drawImageCalls(p);
      const {sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight} = call.props;
      expect([sx, sy, sWidth, sHeight]).toEqual([200, 0, 100, 50]);
      expect([dx, dy, dWidth, dHeight]).toEqual([-50, -25, 100, 50]);
      expect(call.transform.map(v => v + 0)).toEqual([
        -0.5, 0, 0, 0.5, 200, 150,
      ]);
    });

    it('ANI-30, ANI-31: a still, rotated 90', async () => {
      const p = await makeInstance();
      p.predefinedAnimations = {still: makeImage(p, 60, 40)};
      const s = p.createSprite(100, 100);
      s.setAnimation('still');
      s.rotation = 90;
      clearCanvasEvents(p);
      s.display();
      const [call] = drawImageCalls(p);
      const {sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight} = call.props;
      expect([sx, sy, sWidth, sHeight]).toEqual([0, 0, 60, 40]);
      expect([dx, dy, dWidth, dHeight]).toEqual([-30, -20, 60, 40]);
      const expected = [0, 1, -1, 0, 100, 100];
      call.transform.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 10));
    });

    it('ANI-31: a still with width doubled', async () => {
      const p = await makeInstance();
      p.predefinedAnimations = {still: makeImage(p, 60, 40)};
      const s = p.createSprite(100, 100);
      s.setAnimation('still');
      s.width = 120;
      clearCanvasEvents(p);
      s.display();
      const [call] = drawImageCalls(p);
      const {dx, dy, dWidth, dHeight} = call.props;
      expect([dx, dy, dWidth, dHeight]).toEqual([-30, -20, 60, 40]);
      expect(call.transform).toEqual([2, 0, 0, 1, 100, 100]);
    });

    it('ANI-32: an index that names no image draws nothing and warns', async () => {
      const {p, images} = await withImages();
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      const s = p.createSprite();
      s.addAnimation('m', new Animation(...images(2)));
      s.animation!.changeFrame(-1);
      clearCanvasEvents(p);
      s.display();
      expect(drawImageCalls(p)).toEqual([]);
      expect(log).toHaveBeenCalledWith('Warning undefined frame -1');
      log.mockRestore();
    });

    it('ANI-33: an invisible animation draws nothing, and drawing does not advance it', async () => {
      const {p, images} = await withImages();
      const s = p.createSprite();
      s.addAnimation('m', new Animation(...images(2)));
      s.animation!.frameDelay = 1;
      s.display();
      s.display();
      expect(s.animation!.getFrame()).toBe(0);
      s.animation!.visible = false;
      const stop = recordP5(p);
      s.display();
      expect(stop().some(call => call[0] === 'image')).toBe(false);
    });

    it('CMP-23, ANI-34: a tinted frame is drawn from a tinted copy; the tint does not persist', async () => {
      const p = await makeInstance();
      const sheet = p.loadSpriteSheet(makeImage(p, 400, 100), 100, 50, 8);
      p.predefinedAnimations = {sheet: p.loadAnimation(sheet)};
      const s = p.createSprite(200, 150);
      s.setAnimation('sheet');
      s.tint = '#ff0000';
      const stop = recordP5(p);
      s.display();
      s.display();
      const images = stop().filter(call => call[0] === 'image');
      expect(images[0][1]).not.toBe(sheet.image);
      expect(images[1][1]).toBe(images[0][1]);
      expect(images[0].slice(2)).toEqual([0, 0, 100, 50, 0, 0, 100, 50]);
      s.tint = null;
      const again = recordP5(p);
      s.display();
      expect(again().find(call => call[0] === 'image')![1]).toBe(sheet.image);
    });
  });

  describe('tint', () => {
    it('CMP-23, ANI-34: an opaque tint multiplies an opaque pixel', () => {
      const out = tintPixel([0.8, 0.6, 0.4, 1], [1, 0, 0, 1]);
      [0.8, 0, 0, 1].forEach((v, i) => expect(out[i]).toBeCloseTo(v, 12));
    });

    it('CMP-23, ANI-34: a tint with alpha 0 squares the colour', () => {
      const out = tintPixel([0.8, 0.6, 0.4, 1], [1, 0, 0, 0]);
      [0.64, 0.36, 0.16, 1].forEach((v, i) =>
        expect(out[i]).toBeCloseTo(v, 12),
      );
    });

    it('CMP-23, ANI-34: a half-transparent pixel comes out at alpha 0.75', () => {
      expect(tintPixel([0.8, 0.6, 0.4, 0.5], [1, 0, 0, 1])[3]).toBe(0.75);
    });

    it('CMP-23, ANI-34: 8-bit image data is tinted and rounded', () => {
      const data = new Uint8ClampedArray([204, 153, 102, 255, 0, 0, 0, 0]);
      expect([...tintImageData(data, [255, 0, 0, 255])]).toEqual([
        204, 0, 0, 255, 0, 0, 0, 0,
      ]);
    });
  });
});
