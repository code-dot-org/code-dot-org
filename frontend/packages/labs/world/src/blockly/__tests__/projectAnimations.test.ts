import {describe, expect, it} from 'vitest';

import {projectAnimationIds} from '../projectAnimations';

describe('projectAnimationIds', () => {
  const anim = (animations: Record<string, unknown>) =>
    JSON.stringify({type: 'animation', animations});

  it('collects animation ids from every animation .json in the project', () => {
    const ids = projectAnimationIds({
      'animations/pulse.json': anim({pulse: {frames: []}}),
      'animations/more.json': anim({spin: {frames: []}, bob: {frames: []}}),
      'worlds/platform.config.json': JSON.stringify({id: 'x'}), // not an animation
      'scenes/main.js': "console.log('hi')", // not JSON
      'actors/broken.json': '{not valid', // malformed
    });
    expect(ids.sort()).toEqual(['bob', 'pulse', 'spin']);
  });

  it('dedupes ids and returns [] when there are none', () => {
    expect(
      projectAnimationIds({
        'a.json': anim({dup: {frames: []}}),
        'b.json': anim({dup: {frames: []}}),
      }),
    ).toEqual(['dup']);
    expect(projectAnimationIds({})).toEqual([]);
  });
});
