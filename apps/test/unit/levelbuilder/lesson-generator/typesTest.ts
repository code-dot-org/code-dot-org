import {
  BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES,
  formatLabTypeList,
  labTypeFromRailsType,
  SUPPORTED_LAB_TYPES,
} from '@cdo/apps/levelbuilder/lesson-generator/types';

describe('labTypeFromRailsType', () => {
  it('maps every supported lab type back from its STI name', () => {
    expect(labTypeFromRailsType('BubbleChoice')).toBe('bubbleChoice');
    expect(labTypeFromRailsType('Pythonlab')).toBe('pythonlab');
    expect(labTypeFromRailsType('FreeResponse')).toBe('freeResponse');
  });

  it('is case-sensitive on the STI name', () => {
    expect(labTypeFromRailsType('bubblechoice')).toBeUndefined();
  });

  it('returns undefined for unknown or missing types', () => {
    expect(labTypeFromRailsType('Karel')).toBeUndefined();
    expect(labTypeFromRailsType(undefined)).toBeUndefined();
  });
});

describe('formatLabTypeList', () => {
  it('quotes and comma-separates the lab types', () => {
    expect(formatLabTypeList(['panels', 'weblab2'])).toBe(
      '"panels", "weblab2"'
    );
  });
});

describe('lab type registries', () => {
  it('keeps sublevel-allowed types a subset of the supported types', () => {
    for (const labType of BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES) {
      expect(SUPPORTED_LAB_TYPES).toContain(labType);
    }
    expect(BUBBLE_CHOICE_SUBLEVEL_LAB_TYPES).not.toContain('bubbleChoice');
  });
});
