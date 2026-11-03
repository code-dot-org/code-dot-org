// `play tween`, and the tweens it may name (specs/TWEENS_AS_DATA_PLAN.md).

import {describe, expect, it} from 'vitest';

// Imported for its side effect: the shadows are registered as the module
// loads, so a test that never loads it sees an empty registry.
import '../domainBlocks';
import {TWEEN_HEAD} from '../pageHeads';
import {setProjectTweens, tweenExport, tweenOptions} from '../tweens';
import {shadowsFor} from '../valueShadow';

describe('the tweens a project holds', () => {
  it('are offered by actor and name, and stored by path and id', () => {
    // The id outlives the name: renaming a tween keeps every `play tween`
    // pointing at it, and two both called "fade" stay told apart.
    setProjectTweens([
      {module: 'actors/pad', id: 'fade', name: 'fade', actor: 'Pad'},
      {module: 'actors/pad', id: 'fade-2', name: 'fade', actor: 'Pad'},
    ]);
    expect(tweenOptions()).toEqual([
      ['Pad: fade', 'actors/pad#fade'],
      ['Pad: fade', 'actors/pad#fade-2'],
    ]);
    setProjectTweens([]);
  });

  it('say so in words when there are none', () => {
    // A dropdown with no options cannot be built, and `play tween` then
    // generates nothing — the bargain `use trait` makes with "(none)".
    expect(tweenOptions()).toEqual([['(no tweens yet)', '']]);
  });

  it('are exported under a name an identifier can hold', () => {
    expect(tweenExport('fade-out')).toBe('FadeOutTween');
    expect(tweenExport('!!!')).toBe('Tween');
  });
});

describe('the seconds a new tween starts with', () => {
  it('is one, and not an empty socket', () => {
    // An empty socket generates `0`, and a tween of no length lands on its
    // destinations the frame it starts: indistinguishable from one that did
    // not run.
    const seconds = shadowsFor(TWEEN_HEAD)?.find(
      entry => entry.name === 'SECONDS',
    );
    expect(seconds?.shadow).toEqual({type: 'math_number', fields: {NUM: 1}});
  });
});
