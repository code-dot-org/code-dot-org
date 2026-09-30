import {describe, expect, it, vi} from 'vitest';

import {makeImage, makeInstance} from '../../../sprites/__tests__/harness';
import type {RuntimeAnimationList} from '../../../types';
import {AnimationTable} from '../AnimationTable';
import {loadImageOnDemand, preloadSceneImages} from '../preload';

// jsdom decodes no images, so cropping (covered in imageTrim.test.ts) is
// replaced by marking each image it would have seen.
vi.mock('../../../imageTrim', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../imageTrim')>()),
  trimAnimationListImages: vi.fn(async (list: RuntimeAnimationList) => ({
    orderedKeys: list.orderedKeys,
    propsByKey: Object.fromEntries(
      list.orderedKeys.map(key => {
        const props = list.propsByKey[key];
        return [
          key,
          props.dataURI
            ? {...props, dataURI: `${props.dataURI}#trimmed`}
            : props,
        ];
      }),
    ),
  })),
}));

function list(...names: string[]): RuntimeAnimationList {
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  names.forEach(name => {
    propsByKey[name] = {
      name,
      frameSize: {x: 10, y: 10},
      frameCount: 1,
      looping: true,
      frameDelay: 2,
      dataURI: name === 'pending' ? undefined : `data:${name}`,
    };
  });
  return {orderedKeys: names, propsByKey};
}

async function setup() {
  const p = await makeInstance();
  const loadImage = vi.fn(async () => makeImage(p, 10, 10));
  return {
    p,
    loadImage,
    table: new AnimationTable(p, {multiFrame: true, loadImage}),
  };
}

describe('preloadSceneImages', () => {
  it('ANI-37: loads the cropped images the scene references', async () => {
    const {p, table, loadImage} = await setup();
    await preloadSceneImages(table, list('cat', 'dog'), new Set(['cat']));
    expect(loadImage).toHaveBeenCalledExactlyOnceWith('data:cat#trimmed');
    expect(Object.keys(p.predefinedAnimations ?? {})).toEqual(['cat']);
  });

  it('loads everything without a reference set', async () => {
    const {p, table} = await setup();
    await preloadSceneImages(table, list('cat', 'dog', 'pending'), null);
    expect(Object.keys(p.predefinedAnimations ?? {}).sort()).toEqual([
      'cat',
      'dog',
    ]);
  });

  it("drops the previous scene's images", async () => {
    const {p, table} = await setup();
    const project = list('cat', 'dog');
    await preloadSceneImages(table, project, new Set(['cat']));
    await preloadSceneImages(table, project, new Set(['dog']));
    expect(Object.keys(p.predefinedAnimations ?? {})).toEqual(['dog']);
  });
});

describe('loadImageOnDemand', () => {
  it('loads one image by name', async () => {
    const {p, table} = await setup();
    const project = list('cat', 'dog');
    await preloadSceneImages(table, project, new Set(['cat']));
    expect(await loadImageOnDemand(table, project, 'dog')).toBe(true);
    expect(Object.keys(p.predefinedAnimations ?? {}).sort()).toEqual([
      'cat',
      'dog',
    ]);
  });

  it('is false for a name the project lacks', async () => {
    const {table} = await setup();
    expect(await loadImageOnDemand(table, list('cat'), 'dog')).toBe(false);
  });
});
