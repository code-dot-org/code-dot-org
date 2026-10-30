// The check tests' view of a lesson as the world it was written as
// (`support/worldView`): unedited, it writes back the lesson exactly. A
// lesson made from the starter rather than a world has no such view.

import {describe, expect, it} from 'vitest';

import {LESSONS} from '../lessons';
import {worldMadeInto} from '../lessons/asScreen';

import {withWorld, worldOf} from './support/worldView';

const writtenAsWorlds = Object.keys(LESSONS).filter(id =>
  worldMadeInto(LESSONS[id as keyof typeof LESSONS].source),
);

describe.each(writtenAsWorlds)('the %s lesson, seen as a world', id => {
  it('is the same screen and map when written back', () => {
    const source = LESSONS[id as keyof typeof LESSONS].source;
    expect(withWorld(source, worldOf(source)).files).toEqual(source.files);
  });
});
