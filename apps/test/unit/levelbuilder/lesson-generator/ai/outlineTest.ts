import {
  LESSON_LEVEL_COUNT,
  lessonLevelCap,
} from '@cdo/apps/levelbuilder/lesson-generator/ai/outline';

describe('lessonLevelCap', () => {
  it('unlocks the higher ceiling only when drafting rules are present', () => {
    expect(lessonLevelCap(undefined)).toBe(LESSON_LEVEL_COUNT.max);
    expect(lessonLevelCap('  ')).toBe(LESSON_LEVEL_COUNT.max);
    expect(lessonLevelCap('Pair vocab with a check.')).toBe(
      LESSON_LEVEL_COUNT.maxWithDraftingRules
    );
  });
});
