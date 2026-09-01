import {
  getUsOnlyAiCurriculumWarnings,
  US_ONLY_CHAT_COURSES,
  US_ONLY_CHAT_UNITS,
  US_ONLY_TUTOR_COURSES,
  US_ONLY_TUTOR_UNITS,
} from '@cdo/apps/aichat/usOnlyAiCurriculum';

describe('getUsOnlyAiCurriculumWarnings', () => {
  describe('AI Chat levels', () => {
    it('names the affected units when a whole course is assigned', () => {
      const [warning] = getUsOnlyAiCurriculumWarnings({
        courseVersionName: 'ai-foundations-exploring-ai-and-cs-2026',
      });

      expect(warning).toContain('AI-Powered Threats and Defenses');
      expect(warning).toContain('Other units are unaffected');
    });

    // A teacher narrowed to one unit has no sibling units to be told about.
    it('uses the unit wording when that unit is assigned', () => {
      const [warning] = getUsOnlyAiCurriculumWarnings({
        courseVersionName: 'ai-foundations-exploring-ai-and-cs-2026',
        unitName: 'ai-powered-threats-and-defenses-2026',
      });

      expect(warning).toContain('This unit includes levels');
      expect(warning).not.toContain('Other units are unaffected');
    });
  });

  describe('AI Tutor', () => {
    it('warns for a course whose units are built in Web Lab 2', () => {
      const warnings = getUsOnlyAiCurriculumWarnings({
        courseVersionName: 'ai-discoveries-2026',
      });

      const tutor = warnings.find(w => w.includes('AI Tutor'));
      expect(tutor).toContain('Web Development');
    });

    it('warns for an assigned Web Lab 2 unit', () => {
      const warnings = getUsOnlyAiCurriculumWarnings({
        courseVersionName: 'ai-discoveries-2026',
        unitName: 'web-development-2026',
      });

      expect(warnings.some(w => w.includes('Web Lab 2'))).toBe(true);
    });

    // csd2-2026 was rebuilt in Web Lab 2 but never asks students to use the
    // tutor, so it is exempt -- see Unit::NAMES_EXEMPT_FROM_ESSENTIAL_AI_CHAT_TOOLS.
    it('stays quiet for the exempt CSD unit', () => {
      expect(US_ONLY_TUTOR_UNITS).not.toHaveProperty('csd2-2026');
      expect(
        getUsOnlyAiCurriculumWarnings({unitName: 'csd2-2026'})
      ).toStrictEqual([]);
    });

    // Tutor-available levels still work without it, so they earn no warning.
    it('stays quiet for a course where the tutor is optional', () => {
      expect(
        getUsOnlyAiCurriculumWarnings({courseVersionName: 'aiml-2025'})
      ).toStrictEqual([]);
    });
  });

  it('reports both impacts when a course has each', () => {
    const warnings = getUsOnlyAiCurriculumWarnings({
      courseVersionName: 'ai-foundations-year1-2026',
    });

    expect(warnings).toHaveLength(2);
    expect(warnings.some(w => w.includes('Other units are unaffected'))).toBe(
      true
    );
    expect(warnings.some(w => w.includes('AI Tutor'))).toBe(true);
  });

  it('returns nothing for unaffected curriculum or no assignment', () => {
    expect(
      getUsOnlyAiCurriculumWarnings({
        courseVersionName: 'csd-2026',
        unitName: 'csd1-2026',
      })
    ).toStrictEqual([]);
    expect(getUsOnlyAiCurriculumWarnings({})).toStrictEqual([]);
  });
});

describe('curriculum lists', () => {
  // Slugs, not titles: matched against Section.courseVersionName and
  // Section.unitName, which the server fills from UnitGroup#name / Unit#name.
  it('are keyed by slug', () => {
    const keys = [
      ...Object.keys(US_ONLY_CHAT_COURSES),
      ...Object.keys(US_ONLY_CHAT_UNITS),
      ...Object.keys(US_ONLY_TUTOR_COURSES),
      ...Object.keys(US_ONLY_TUTOR_UNITS),
    ];

    expect(keys.length).toBeGreaterThan(0);
    keys.forEach(key => expect(key).toMatch(/^[a-z0-9-]+$/));
  });
});
