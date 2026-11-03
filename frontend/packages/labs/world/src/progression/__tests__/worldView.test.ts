// The check tests' view of a lesson as a world (`support/worldView`):
// unedited, it writes back the lesson exactly. A lesson with no level of its
// own, or made from the starter, has no such view.

import {describe, expect, it} from 'vitest';

import {LESSONS} from '../lessons';

import {withWorld, worldOf} from './support/worldView';

/** Made from the starter project, not written as a lesson's screen. */
const FROM_THE_STARTER = new Set(['story/watch']);

const withALevel = Object.keys(LESSONS).filter(
  id =>
    !FROM_THE_STARTER.has(id) &&
    Object.values(LESSONS[id as keyof typeof LESSONS].source.files).some(
      file => file.name === 'main.map',
    ),
);

describe.each(withALevel)('the %s lesson, seen as a world', id => {
  it('is the same screen and map when written back', () => {
    const source = LESSONS[id as keyof typeof LESSONS].source;
    expect(withWorld(source, worldOf(source)).files).toEqual(source.files);
  });
});
