// The check tests' view of a lesson as the world it was written as
// (`support/worldView`): unedited, it writes back the lesson exactly.

import {describe, expect, it} from 'vitest';

import {LESSONS} from '../lessons';

import {withWorld, worldOf} from './support/worldView';

describe.each(Object.keys(LESSONS))('the %s lesson, seen as a world', id => {
  it('is the same screen and map when written back', () => {
    const source = LESSONS[id as keyof typeof LESSONS].source;
    expect(withWorld(source, worldOf(source)).files).toEqual(source.files);
  });
});
