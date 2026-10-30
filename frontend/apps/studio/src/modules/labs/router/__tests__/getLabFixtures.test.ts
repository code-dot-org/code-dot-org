import {describe, it, expect} from 'vitest';

import {labFixturesExportName} from '../getLabFixtures';

describe('labFixturesExportName', () => {
  it('PascalCases a single-word lab key', () => {
    expect(labFixturesExportName('music')).toBe('MusicFixtures');
  });

  it('PascalCases each segment of a kebab-cased lab key', () => {
    // The turbo generator produces hyphenated keys like `dance-party`; the
    // named export drops the hyphen and capitalizes each segment.
    expect(labFixturesExportName('dance-party')).toBe('DancePartyFixtures');
  });

  it('handles keys with more than two segments', () => {
    expect(labFixturesExportName('a-b-c')).toBe('ABCFixtures');
  });

  it('leaves an already-capitalized segment intact', () => {
    expect(labFixturesExportName('weblab2')).toBe('Weblab2Fixtures');
  });
});
