import {
  getUsOnlyAiCurriculumWarning,
  US_ONLY_AI_COURSES,
  US_ONLY_AI_UNITS,
} from '@cdo/apps/aichat/usOnlyAiCurriculum';

describe('getUsOnlyAiCurriculumWarning', () => {
  it('names the affected units when a whole course is assigned', () => {
    const warning = getUsOnlyAiCurriculumWarning({
      courseVersionName: 'ai-discoveries-2026',
    });

    expect(warning).toContain('Thinking Critically About AI');
    expect(warning).toContain('Other units are unaffected');
  });

  it('lists every affected unit for a course with more than one', () => {
    const warning = getUsOnlyAiCurriculumWarning({
      courseVersionName: 'ai-foundations-year1-2026',
    });

    expect(warning).toContain('AI-Powered Threats and Defenses');
    expect(warning).toContain('AI and Algorithmic Decisions');
  });

  // A teacher who has narrowed to one unit is told about that unit, and there
  // are no sibling units to call unaffected.
  it('uses the unit wording when the section is assigned an affected unit', () => {
    const warning = getUsOnlyAiCurriculumWarning({
      courseVersionName: 'ai-discoveries-2026',
      unitName: 'thinking-critically-about-ai-2026',
    });

    expect(warning).toContain('This unit includes levels');
    expect(warning).not.toContain('Other units are unaffected');
  });

  it('warns about the unit when a single-unit course is assigned', () => {
    // Such a course carries the same slug as course and as unit.
    const warning = getUsOnlyAiCurriculumWarning({
      courseVersionName: 'ai-powered-threats-and-defenses-2026',
      unitName: 'ai-powered-threats-and-defenses-2026',
    });

    expect(warning).toContain('This unit includes levels');
  });

  it('returns undefined for curriculum that is not affected', () => {
    expect(
      getUsOnlyAiCurriculumWarning({
        courseVersionName: 'csd-2026',
        unitName: 'csd1-2026',
      })
    ).toBeUndefined();
  });

  it('returns undefined when no course is assigned', () => {
    expect(getUsOnlyAiCurriculumWarning({})).toBeUndefined();
  });
});

describe('US_ONLY_AI_COURSES / US_ONLY_AI_UNITS', () => {
  // Slugs, not titles: they are matched against Section.courseVersionName and
  // Section.unitName, which the server fills from Unit#name / UnitGroup#name.
  it('are keyed by slug', () => {
    const keys = [
      ...Object.keys(US_ONLY_AI_COURSES),
      ...Object.keys(US_ONLY_AI_UNITS),
    ];

    expect(keys.length).toBeGreaterThan(0);
    keys.forEach(key => expect(key).toMatch(/^[a-z0-9-]+$/));
  });
});
