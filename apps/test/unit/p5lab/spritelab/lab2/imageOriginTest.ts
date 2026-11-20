import {
  countImageOrigins,
  imageOrigin,
  originOfImageInRole,
} from '@cdo/apps/p5lab/spritelab/lab2/imageOrigin';
import {
  RuntimeAnimationList,
  RuntimeAnimationProps,
} from '@cdo/apps/p5lab/spritelab/lab2/types';

const generation = {
  prompt: 'a red dragon',
} as RuntimeAnimationProps['generation'];
const image = (props: Partial<RuntimeAnimationProps>) =>
  ({name: 'a', frameCount: 1, ...props} as RuntimeAnimationProps);
const listOf = (...images: RuntimeAnimationProps[]): RuntimeAnimationList => ({
  orderedKeys: images.map((_, i) => `k${i}`),
  propsByKey: Object.fromEntries(images.map((props, i) => [`k${i}`, props])),
});

describe('imageOrigin', () => {
  it('names a picture as the prompt made it', () => {
    expect(imageOrigin({generation, edited: false, fromGeneration: true})).toBe(
      'generated'
    );
  });

  it('names an AI picture the student then drew on', () => {
    expect(imageOrigin({edited: true, fromGeneration: true})).toBe(
      'generatedThenEdited'
    );
  });

  it('names a picture drawn by hand', () => {
    expect(imageOrigin({edited: true, fromGeneration: false})).toBe('drawn');
    expect(imageOrigin({edited: true})).toBe('drawn');
  });

  it('names an upload or a supplied picture as other', () => {
    expect(imageOrigin({edited: false})).toBe('other');
    expect(imageOrigin({})).toBe('other');
  });
});

describe('countImageOrigins', () => {
  it('counts every image once', () => {
    const list = listOf(
      image({generation}),
      image({generation}),
      image({edited: true, fromGeneration: true}),
      image({edited: true}),
      image({})
    );
    expect(countImageOrigins(list)).toEqual({
      generated: 2,
      generatedThenEdited: 1,
      drawn: 1,
      other: 1,
    });
  });

  it('counts nothing in an empty list', () => {
    expect(countImageOrigins({orderedKeys: [], propsByKey: {}})).toEqual({
      generated: 0,
      generatedThenEdited: 0,
      drawn: 0,
      other: 0,
    });
  });
});

describe('originOfImageInRole', () => {
  const list = listOf(
    image({role: 'pet', edited: true}),
    image({role: 'hero', edited: true, fromGeneration: true}),
    image({role: 'hero', generation})
  );

  it('reads the first image in the list that carries the role', () => {
    expect(originOfImageInRole(list, 'hero')).toBe('generatedThenEdited');
    expect(originOfImageInRole(list, 'pet')).toBe('drawn');
  });

  it('has no answer without a role, or without an image in it', () => {
    expect(originOfImageInRole(list, undefined)).toBeUndefined();
    expect(originOfImageInRole(list, 'villain')).toBeUndefined();
  });
});
