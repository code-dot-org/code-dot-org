/**
 * Curriculum that a teacher outside the US cannot run as written, because the
 * AI models it depends on are only available there.
 *
 * Two impacts, kept apart because they read differently to a teacher:
 *
 *   chat  - the unit's AI Chat levels are configured with a US only model, so
 *           those levels are disabled outright.
 *   tutor - the unit is built in Web Lab 2, where AI Tutor is essential to the
 *           level rather than an optional aside, and the tutor has no
 *           per-level model to fall back on.
 *
 * Units where the tutor is merely *available* are left out on purpose: the
 * levels still work without it, and warning about them would mark most of the
 * catalog. csd2-2026 is left out for the same reason it sits in
 * Unit::NAMES_EXEMPT_FROM_ESSENTIAL_AI_CHAT_TOOLS -- it was rebuilt in Web Lab 2
 * but never asks students to use the tutor.
 *
 * Keyed by the slugs a section already carries: Section.courseVersionName is
 * the course, Section.unitName the unit, both filled server-side from
 * UnitGroup#name / Unit#name. Nothing is fetched to show the warning.
 *
 * TEMPORARY. Levels are blocked today only because a US only model has no
 * fallback. Once models fall back to an available provider there is nothing to
 * warn about, and this file, its helper and its copy delete together.
 *
 * Snapshot taken 2026-08-31. Regenerate with:
 *   chat  - Unit.joins(:levels).merge(Level.with_us_only_aichat_model).distinct.pluck(:name)
 *   tutor - Unit.joins(:levels).where(levels: {type: 'Weblab2'}).distinct.pluck(:name)
 *           minus Unit::NAMES_EXEMPT_FROM_ESSENTIAL_AI_CHAT_TOOLS
 */

/** Course slug -> titles of its units whose AI Chat levels are disabled. */
export const US_ONLY_CHAT_COURSES: Record<string, string[]> = {
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

/** Unit slug -> title, for a section assigned such a unit directly. */
export const US_ONLY_CHAT_UNITS: Record<string, string> = {
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

/** Course slug -> titles of its units that require AI Tutor. */
export const US_ONLY_TUTOR_COURSES: Record<string, string[]> = {
  'ai-discoveries-2026': ['Web Development'],
  'ai-foundations-designing-and-building-with-ai-2026': [
    'AI-Generated Design',
    'AI and Algorithmic Decisions',
    'Building Data-Driven Systems with AI',
    'Iterating with AI',
    'Designing Reliable Apps with AI and APIs',
    'Web Apps with AI Capstone Project',
  ],
  'ai-foundations-year1-2026': [
    'AI-Generated Design',
    'AI and Algorithmic Decisions',
    'Building Data-Driven Systems with AI',
    'Iterating with AI',
    'Designing Reliable Apps with AI and APIs',
    'Web Apps with AI Capstone Project',
  ],
  'focus-on-coding-2026': ['Web Development'],
  'focus-on-creativity-2026': ['Web Development'],
  'focus-on-design-with-purpose-2026': ['Web Development'],
  'intro-to-web-lab': ['Intro to Web Lab'],
  'teaching-ai-discoveries-2026': ['AID - Teaching Web Development'],
  'teaching-aif-design-build-ai-facilitators-2026': [
    'Unit 1 - Teaching AI-Generated Design',
    'Unit 2 - Teaching AI and Algorithmic Decisions',
    'Unit 3 - Teaching Data-Driven Systems',
  ],
  'teaching-designing-and-building-with-ai-2026': [
    'Teaching AI Generated Design',
    'Teaching AI and Algorithmic Decisions',
    'Teaching Data-Driven Systems',
    'Teaching Iterating with AI',
    'Teaching Designing Reliable Apps with AI and APIs',
    'Teaching Web Apps with AI Capstone Project',
  ],
  'teaching-web-dev-2026': ['AID - Teaching Web Development'],
  'web-development-2026': ['Web Development'],
};

/** Unit slug -> title, for a section assigned such a unit directly. */
export const US_ONLY_TUTOR_UNITS: Record<string, string> = {
  'ai-and-algorithmic-decisions-2026': 'AI and Algorithmic Decisions',
  'ai-generated-design-2026': 'AI-Generated Design',
  'building-data-driven-systems-with-ai-2026':
    'Building Data-Driven Systems with AI',
  'designing-reliable-apps-with-ai-and-apis-2026':
    'Designing Reliable Apps with AI and APIs',
  'intro-to-web-lab': 'Intro to Web Lab',
  'iterating-with-ai-2026': 'Iterating with AI',
  'pl-facilitators-aif2-ai-algorithmic-decisions-2026':
    'Unit 2 - Teaching AI and Algorithmic Decisions',
  'pl-facilitators-aif2-ai-generated-design-2026':
    'Unit 1 - Teaching AI-Generated Design',
  'pl-facilitators-aif2-data-driven-systems-2026':
    'Unit 3 - Teaching Data-Driven Systems',
  'self-paced-pl-teaching-ai-algorithmic-decisions-2026':
    'Teaching AI and Algorithmic Decisions',
  'self-paced-pl-teaching-ai-generated-design-2026':
    'Teaching AI Generated Design',
  'self-paced-pl-teaching-data-driven-systems-2026':
    'Teaching Data-Driven Systems',
  'self-paced-pl-teaching-designing-reliable-apps-with-ai-and-apis-2026':
    'Teaching Designing Reliable Apps with AI and APIs',
  'self-paced-pl-teaching-iterating-with-ai-2026': 'Teaching Iterating with AI',
  'self-paced-pl-teaching-web-apps-with-ai-capstone-project-2026':
    'Teaching Web Apps with AI Capstone Project',
  'self-paced-pl-teaching-web-dev-2026': 'AID - Teaching Web Development',
  'web-apps-with-ai-capstone-project-2026': 'Web Apps with AI Capstone Project',
  'web-development-2026': 'Web Development',
};

// Kept here rather than in constants.ts so the whole feature deletes together.
const chatUnitWarning =
  'The assigned unit includes levels that use AI models that are not available in your region. On those levels, AI chat features will be disabled for you and your students.';

const chatCourseWarning = (unitTitles: string[], reassure: boolean) =>
  `The following units in the assigned course use AI models that are not available in your region: ${unitTitles.join(
    ', '
  )}.${reassure ? ' Other units are unaffected.' : ''}`;

const tutorUnitWarning =
  "The assigned unit requires AI Tutor, which is not available in your region. Students won't be able to complete some levels in the unit.";

const tutorCourseWarning = (unitTitles: string[]) =>
  `The following units in the assigned course require AI Tutor, which is not available in your region: ${unitTitles.join(
    ', '
  )}. Students won't be able to complete some levels in these units.`;

/**
 * Warnings for a section's assignment; empty when it needs none.
 *
 * Callers must already know the teacher is blocked from US only models
 * (currentUser.usOnlyAichatModelsDisabled); this answers only whether the
 * assigned curriculum is affected, and how.
 *
 * The assigned unit is checked before the course. A teacher who has narrowed
 * the section to one unit is told about that unit, not about units they are not
 * teaching yet.
 */
export const getUsOnlyAiCurriculumWarnings = ({
  courseVersionName,
  unitName,
}: {
  courseVersionName?: string;
  unitName?: string | null;
}): string[] => {
  const warnings: string[] = [];

  // A single-unit course carries the same slug as course and as unit, so a hit
  // in either list means the section is pointed at one affected unit.
  const assignedUnitIsIn = (
    units: Record<string, string>,
    courses: Record<string, string[]>
  ) => !!unitName && (!!units[unitName] || !!courses[unitName]);

  // Fall back to the course only when no particular unit is assigned. A teacher
  // who has narrowed the section to one unit should hear about that unit, not
  // about units elsewhere in the course they are not teaching.
  const courseUnits = (courses: Record<string, string[]>) =>
    !unitName && courseVersionName ? courses[courseVersionName] : undefined;

  const chatCourseUnits = courseUnits(US_ONLY_CHAT_COURSES);
  const tutorCourseUnits = courseUnits(US_ONLY_TUTOR_COURSES);

  if (assignedUnitIsIn(US_ONLY_CHAT_UNITS, US_ONLY_CHAT_COURSES)) {
    warnings.push(chatUnitWarning);
  } else if (chatCourseUnits?.length) {
    // Drop the reassurance when the tutor warning below names further affected
    // units in the same course; "other units are unaffected" would contradict it.
    warnings.push(
      chatCourseWarning(chatCourseUnits, !tutorCourseUnits?.length)
    );
  }

  if (assignedUnitIsIn(US_ONLY_TUTOR_UNITS, US_ONLY_TUTOR_COURSES)) {
    warnings.push(tutorUnitWarning);
  } else if (tutorCourseUnits?.length) {
    warnings.push(tutorCourseWarning(tutorCourseUnits));
  }

  return warnings;
};
