/**
 * Courses and units whose AI Chat levels use a model that is only available in
 * the US. A teacher outside the US cannot run those levels, so we name the
 * units rather than warning vaguely about "some models".
 *
 * Hand-maintained snapshot taken 2026-08-31, keyed by the slugs the section
 * already carries: Section.courseVersionName is the course, Section.unitName
 * the unit. Nothing here is fetched, so a teacher sees the warning without an
 * extra request.
 *
 * TEMPORARY. Levels are blocked today because a US only model has no fallback.
 * Once models fall back to an available provider there is nothing to warn
 * about and this file, its helper and its copy all delete together.
 *
 * Regenerate against real curriculum with:
 *   Unit.joins(:levels).merge(Level.with_us_only_aichat_model).distinct.pluck(:name)
 *
 * AI Tutor is deliberately absent. It has no per-level model, so it is
 * unavailable in every unit that offers it -- listing those would name most of
 * the catalog and tell teachers nothing useful.
 */

/** Course slug -> titles of its units whose AI Chat levels are blocked. */
export const US_ONLY_AI_COURSES: Record<string, string[]> = {
  'ai-discoveries-2026': ['Thinking Critically About AI'],
  'ai-foundations-designing-and-building-with-ai-2026': [
    'AI and Algorithmic Decisions',
  ],
  'ai-foundations-exploring-ai-and-cs-2026': [
    'AI-Powered Threats and Defenses',
  ],
  'ai-foundations-year1-2026': [
    'AI-Powered Threats and Defenses',
    'AI and Algorithmic Decisions',
  ],
  'ai-powered-threats-and-defenses-2026': ['AI-Powered Threats and Defenses'],
  'artificial-intelligence-foundations-2026': [
    'AI-Powered Threats and Defenses',
  ],
  'computing-foundations-for-a-digital-age-2026': [
    'AI-Powered Threats and Defenses',
  ],
  'computing-foundations-for-a-digital-age-2027': [
    'AI-Powered Threats and Defenses',
  ],
  'idaho-digital-literacy-2026': ['AI-Powered Threats and Defenses'],
  'teaching-ai-discoveries-2026': ['Teaching Thinking Critically about AI'],
  'teaching-exploring-ai-and-computing-2026': [
    'Teaching AI-Powered Threats and Defenses',
  ],
  'teaching-thinking-critically-about-ai-2026': [
    'AID - Teaching Thinking Critically about AI',
  ],
};

/** Unit slug -> its title, for a section assigned that unit directly. */
export const US_ONLY_AI_UNITS: Record<string, string> = {
  'ai-and-algorithmic-decisions-2026': 'AI and Algorithmic Decisions',
  'ai-powered-threats-and-defenses-2026': 'AI-Powered Threats and Defenses',
  'aif5-v3': 'AI-Powered Threats and Defenses',
  'self-paced-pl-teaching-ai-powered-threats-and-defenses-2026':
    'Teaching AI-Powered Threats and Defenses',
  'self-paced-pl-teaching-thinking-critically-about-ai-2026':
    'AID - Teaching Thinking Critically about AI',
  'self-paced-pl-thinking-critically-about-ai-2026':
    'Teaching Thinking Critically about AI',
  'thinking-critically-about-ai-2026': 'Thinking Critically About AI',
};

// Kept here rather than in constants.ts so the whole feature deletes together.
const UNIT_WARNING =
  'This unit includes levels that use AI models not available in your region. Those levels will be disabled for you and your students.';

const courseWarning = (unitTitles: string[]) =>
  `The following units in this course use AI models not available in your region: ${unitTitles.join(
    ', '
  )}. Other units are unaffected.`;

/**
 * The warning for a section's assignment, or undefined when it needs none.
 * Callers must already know the teacher is blocked from US only models
 * (currentUser.usOnlyAichatModelsDisabled); this answers only whether the
 * assigned curriculum is affected.
 *
 * The assigned unit is checked first. A teacher who has narrowed the section to
 * one unit is told about that unit rather than about units they are not
 * teaching yet.
 */
export const getUsOnlyAiCurriculumWarning = ({
  courseVersionName,
  unitName,
}: {
  courseVersionName?: string;
  unitName?: string | null;
}): string | undefined => {
  // A single-unit course carries the same slug in both fields, so a hit in
  // either list means the section is pointed at one affected unit.
  if (
    unitName &&
    (US_ONLY_AI_UNITS[unitName] || US_ONLY_AI_COURSES[unitName])
  ) {
    return UNIT_WARNING;
  }

  const affectedUnits = courseVersionName
    ? US_ONLY_AI_COURSES[courseVersionName]
    : undefined;
  return affectedUnits?.length ? courseWarning(affectedUnits) : undefined;
};
