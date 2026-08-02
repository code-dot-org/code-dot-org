// What a `play animation` block may name.
//
// The project's own animations, and nothing else. There are no built-ins to
// play: an animation is frames of an image, both of them files, and a project
// draws only what it holds. The last row is how you get more.

import {afterEach, describe, expect, it} from 'vitest';

import {IMPORT_ANIMATION_VALUE} from '../../appearance/appearanceImport';
import {animationOptions, setProjectAnimations} from '../animationOptions';

// Registry is module state; reset it between cases.
afterEach(() => setProjectAnimations([]));

describe('animationOptions', () => {
  it('offers nothing but a way in when the project has no animations', () => {
    expect(animationOptions()).toEqual([['(import…)', IMPORT_ANIMATION_VALUE]]);
  });

  it('offers the project’s animations, deduped, with Title Case labels', () => {
    setProjectAnimations(['pulse', 'coinSpin', 'pulse']);
    const options = animationOptions();

    expect(options).toContainEqual(['Pulse', 'pulse']);
    expect(options.filter(([, id]) => id === 'pulse')).toHaveLength(1);
    expect(options.map(([, id]) => id)).toEqual([
      'pulse',
      'coinSpin',
      IMPORT_ANIMATION_VALUE,
    ]);
  });

  it('always ends with the import row', () => {
    // A project with no animations still needs a way to get one, and a project
    // with several still needs a way to get another.
    setProjectAnimations(['pulse']);
    const last = animationOptions().at(-1);
    expect(last).toEqual(['(import…)', IMPORT_ANIMATION_VALUE]);
  });
});
