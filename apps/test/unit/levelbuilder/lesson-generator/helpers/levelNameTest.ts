import {
  levelNameFor,
  prefixedName,
  sublevelNameFor,
} from '@cdo/apps/levelbuilder/lesson-generator/helpers/levelName';
import {LevelSpec} from '@cdo/apps/levelbuilder/lesson-generator/types';

const spec = (over: Partial<LevelSpec>): LevelSpec => ({
  key: 'k',
  id: 'intro',
  labType: 'panels',
  description: '',
  generate: true,
  ...over,
});

describe('prefixedName', () => {
  it('joins prefix and id, or returns the bare id without a prefix', () => {
    expect(prefixedName('csd-u1', 'intro')).toBe('csd-u1-intro');
    expect(prefixedName('', 'intro')).toBe('intro');
  });
});

describe('levelNameFor', () => {
  it('names a new card from the prefix and id', () => {
    expect(levelNameFor(spec({id: ' intro '}), 'csd-u1')).toBe('csd-u1-intro');
  });

  it('keeps an existing level under its own name regardless of prefix', () => {
    const existing = spec({
      id: 'intro',
      existing: {
        activityIndex: 0,
        sectionIndex: 0,
        scriptLevel: {
          activitySectionPosition: 1,
          levels: [{id: '7', name: 'old-unit-intro'}],
        },
      },
    });
    expect(levelNameFor(existing, 'renamed')).toBe('old-unit-intro');
  });
});

describe('sublevelNameFor', () => {
  it('names a new sublevel under its parent', () => {
    expect(sublevelNameFor(spec({id: ' art '}), 'u1-choose')).toBe(
      'u1-choose-art'
    );
  });

  it('keeps an existing sublevel under its own name', () => {
    expect(
      sublevelNameFor(spec({id: 'art', existingName: 'old-choose-art'}), 'new')
    ).toBe('old-choose-art');
  });
});
