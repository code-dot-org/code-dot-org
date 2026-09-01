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

      // Unit-scoped copy speaks about the assignment itself; only the
      // course-scoped copy enumerates units or reassures about siblings.
      expect(warning).not.toContain('The following units');
      expect(warning).not.toContain('Other units are unaffected');
    });

    // Narrowing the section to an unaffected unit must not raise the course
    // warning about units the teacher is not teaching.
    it('stays quiet when the assigned unit is unaffected', () => {
      expect(
        getUsOnlyAiCurriculumWarnings({
          courseVersionName: 'ai-foundations-exploring-ai-and-cs-2026',
          unitName: 'problem-solving-with-ai-2026',
        })
      ).toStrictEqual([]);
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

    it('warns for an assigned Web Lab 2 unit, and only about that unit', () => {
      const warnings = getUsOnlyAiCurriculumWarnings({
        courseVersionName: 'ai-discoveries-2026',
        unitName: 'web-development-2026',
      });

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('AI Tutor');
      // Not the course warning about Thinking Critically About AI, which this
      // teacher has not assigned.
      expect(warnings[0]).not.toContain('The following units');
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
    expect(warnings.some(w => w.includes('AI Tutor'))).toBe(true);
    // The tutor warning names further affected units in this course, so the
    // chat warning must not claim the rest of it is fine.
    expect(warnings.some(w => w.includes('Other units are unaffected'))).toBe(
      false
    );
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
