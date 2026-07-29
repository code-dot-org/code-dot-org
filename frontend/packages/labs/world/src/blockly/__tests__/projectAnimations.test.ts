import {describe, expect, it} from 'vitest';

import {projectAnimationIds} from '../projectAnimations';

describe('projectAnimationIds', () => {
  const anim = (animations: Record<string, unknown>) =>
    JSON.stringify({type: 'animation', animations});

  it('collects animation ids from every animation .anim in the project', () => {
    const ids = projectAnimationIds({
      'animations/pulse.anim': anim({pulse: {frames: []}}),
      'animations/more.anim': anim({spin: {frames: []}, bob: {frames: []}}),
      'worlds/platform.config.json': JSON.stringify({id: 'x'}), // not a .anim
      'scenes/main.js': "console.log('hi')", // not JSON
      'actors/broken.anim': '{not valid', // malformed
    });
    expect(ids.sort()).toEqual(['bob', 'pulse', 'spin']);
  });

  it('dedupes ids and returns [] when there are none', () => {
    expect(
      projectAnimationIds({
        'a.anim': anim({dup: {frames: []}}),
        'b.anim': anim({dup: {frames: []}}),
      }),
    ).toEqual(['dup']);
    expect(projectAnimationIds({})).toEqual([]);
  });
});
