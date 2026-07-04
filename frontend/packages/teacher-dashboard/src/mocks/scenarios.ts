// Scenario tags this package's dev shell offers, for the sections domain
// registered in `@code-dot-org/core/api/mocks/sections.handlers.ts`
// (TDF-MSW-03..06, scenario-registry.md).
//
// F0-T12: core's registry now exposes `getRegisteredFixtureTags(labKey)`, so
// the *tags* come from there (see `ScenarioSelector.tsx`) rather than being
// hand-kept here. This map only supplies human-readable labels for the tags
// this dev shell knows about; a tag with no entry falls back to the tag
// string itself, so a new tag registered in core shows up unlabeled instead
// of being invisible.
export const TEACHER_DASHBOARD_LAB_KEY = 'teacher-dashboard';

export const SECTIONS_SCENARIO_LABELS: Record<string, string> = {
  'sections-empty': 'Empty (no sections)',
  'sections-one': 'One section (no curriculum)',
  'sections-many-ordered': 'Many sections + custom order',
  'sections-archived-mixed': 'Active + archived mix',
};

export const DEFAULT_SECTIONS_SCENARIO = 'sections-many-ordered';
