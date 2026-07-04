// Coverage for the registry tag enumeration (F0-T12): lets a dev-shell
// scenario selector discover a lab's registered tags without a hand-kept
// list. Imports `../index` (not `../fixtures` directly) so the sections
// handlers' module-level `registerMockFixture` calls have already run.

import {describe, expect, it} from 'vitest';

import {getRegisteredFixtureTags} from '../index';

describe('getRegisteredFixtureTags', () => {
  it('returns the four registered sections tags for teacher-dashboard', () => {
    expect(getRegisteredFixtureTags('teacher-dashboard')).toEqual([
      'sections-empty',
      'sections-one',
      'sections-many-ordered',
      'sections-archived-mixed',
    ]);
  });

  it('returns an empty array for a lab key with no registered tags', () => {
    expect(getRegisteredFixtureTags('no-such-lab')).toEqual([]);
  });
});
