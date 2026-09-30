import type p5 from 'p5';
import {describe, expect, it, vi} from 'vitest';

import {Animation} from '../../../sprites';
import {makeImage, makeInstance} from '../../../sprites/__tests__/harness';
import type {SpriteP5} from '../../../sprites/types';
import type {RuntimeAnimationList, RuntimeAnimationProps} from '../../../types';
import {AnimationTable} from '../AnimationTable';

type Props = Partial<RuntimeAnimationProps> & {name: string};

function list(...entries: Props[]): RuntimeAnimationList {
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  entries.forEach((entry, i) => {
    propsByKey[`k${i}`] = {
      frameSize: {x: 100, y: 100},
      frameCount: 1,
      looping: true,
      frameDelay: 2,
      dataURI: `data:${entry.name}`,
      ...entry,
    };
  });
  return {orderedKeys: Object.keys(propsByKey), propsByKey};
}

/** A table whose decoder makes a 400x100 image for any URL. */
async function setup(multiFrame = true) {
  const p = await makeInstance();
  const loadImage = vi.fn<(url: string) => Promise<p5.Image>>(async () =>
    makeImage(p, 400, 100),
  );
  return {p, loadImage, table: new AnimationTable(p, {multiFrame, loadImage})};
}

function entry(p: SpriteP5, name: string) {
  return p.predefinedAnimations?.[name];
}

describe('AnimationTable', () => {
  it('ANI-27: fills the instance table by name', async () => {
    const {p, table, loadImage} = await setup();
    await table.load(list({name: 'cat'}));
    expect(loadImage).toHaveBeenCalledWith('data:cat');
    expect(table.has('cat')).toBe(true);

    const sprite = p.createSprite(0, 0);
    sprite.setAnimation('cat');
    expect(sprite.getAnimationLabel()).toBe('cat');
  });

  it('ANI-36: a multi-frame image becomes a grid animation', async () => {
    const {p, table} = await setup();
    await table.load(
      list({
        name: 'walk',
        frameCount: 4,
        frameSize: {x: 100, y: 100},
        looping: false,
        frameDelay: 7,
      }),
    );
    const animation = entry(p, 'walk') as Animation;
    expect(animation).toBeInstanceOf(Animation);
    expect(animation.images).toHaveLength(4);
    expect(animation.getWidth()).toBe(100);
    expect(animation.looping).toBe(false);
    expect(animation.frameDelay).toBe(7);
  });

  it('ANI-36: every other image is a still', async () => {
    const {p, table} = await setup();
    await table.load(list({name: 'rock'}));
    expect(entry(p, 'rock')).not.toBeInstanceOf(Animation);
  });

  it('ANI-35: classic loads a multi-frame image as a still', async () => {
    const {p, table} = await setup(false);
    await table.load(list({name: 'walk', frameCount: 4}));
    expect(entry(p, 'walk')).not.toBeInstanceOf(Animation);
  });

  it('ANI-38: an unchanged entry keeps its object', async () => {
    const {p, table, loadImage} = await setup();
    await table.load(list({name: 'cat'}));
    const first = entry(p, 'cat');
    await table.load(list({name: 'cat'}));
    expect(entry(p, 'cat')).toBe(first);
    expect(loadImage).toHaveBeenCalledTimes(1);
  });

  it('ANI-38: changed data loads again', async () => {
    const {p, table} = await setup();
    await table.load(list({name: 'cat'}));
    const first = entry(p, 'cat');
    await table.load(list({name: 'cat', dataURI: 'data:cat2'}));
    expect(entry(p, 'cat')).not.toBe(first);
  });

  it('skips images whose data has not arrived', async () => {
    const {p, table, loadImage} = await setup();
    await table.load(list({name: 'cat', dataURI: undefined}));
    expect(loadImage).not.toHaveBeenCalled();
    expect(entry(p, 'cat')).toBeUndefined();
  });

  it('leaves out an image that fails to decode', async () => {
    const {p, table, loadImage} = await setup();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    loadImage.mockRejectedValueOnce(new Error('bad'));
    await table.load(list({name: 'cat'}, {name: 'dog'}));
    expect(entry(p, 'cat')).toBeUndefined();
    expect(entry(p, 'dog')).toBeDefined();
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });

  it('keeps the latest data when loads overlap', async () => {
    const {p, table, loadImage} = await setup();
    const images: Record<string, p5.Image> = {
      'data:old': makeImage(p, 1, 1),
      'data:new': makeImage(p, 2, 2),
    };
    let releaseOld = () => {};
    loadImage.mockImplementation(
      (url: string) =>
        new Promise<p5.Image>(resolve => {
          if (url === 'data:old') {
            releaseOld = () => resolve(images[url]);
          } else {
            resolve(images[url]);
          }
        }),
    );
    const old = table.load(list({name: 'cat', dataURI: 'data:old'}));
    await table.load(list({name: 'cat', dataURI: 'data:new'}));
    releaseOld();
    await old;
    expect(entry(p, 'cat')).toBe(images['data:new']);
  });

  it('prune removes every name not kept', async () => {
    const {p, table} = await setup();
    await table.load(list({name: 'cat'}, {name: 'dog'}));
    table.prune(new Set(['dog']));
    expect(entry(p, 'cat')).toBeUndefined();
    expect(table.has('cat')).toBe(false);
    expect(entry(p, 'dog')).toBeDefined();
  });
});
