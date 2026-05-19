// Generation context hierarchy
// ============================
//
// AI calls in the curriculum generator pipeline run at different scopes:
// unit, lesson, level, slide. Each call needs to see context from its own
// scope plus every enclosing scope above it ("outer flows inward"), but
// must NOT see fields that don't apply at its scope.
//
// The simplest way to express that is by extending interfaces — each
// scope-context is a strict superset of the one above. A function that
// accepts LevelContext is guaranteed to also have everything in
// LessonContext, which in turn has everything in UnitContext, etc.
// Conversely, a UnitContext literally can't hold a `levelDescription`
// because the type doesn't have that field, so the wrong shape can't
// reach the wrong scope.
//
// Build a context by spreading the outer one and adding scope-specific
// fields:
//
//   const unitCtx: UnitContext = {unitName, unitOutline};
//   const lessonCtx: LessonContext = {...unitCtx, lessonName, lessonOutline};
//   const levelCtx: LevelContext = {
//     ...lessonCtx, levelName, levelDescription, precedingLevels,
//   };
//
// Sibling-only signals (preceding levels in a lesson, preceding slides
// on a slides page) live on the inner-most scope they belong to, since
// they're scoped to a single generation pass and don't propagate above.
//
// On this branch the unit-scope fields are present in the types but
// never populated; the unit-generator branch fills them in. Same for
// `targetProject` (project branch) and the slides-specific scopes
// (slides branch). Adding a downstream field is a one-line edit on the
// type that owns it; consumers in derived types pick it up automatically.

export interface UnitContext {
  // Display name of the unit this lesson sits in. Used in prompts to
  // anchor the AI to the broader artifact identity. Optional only
  // because on the base branch we don't yet plumb it; on the unit
  // branch it's always present.
  unitName?: string;

  // The unit's `generate_outline` — the levelbuilder's free-text
  // description of what the unit teaches as a whole. Optional because
  // not every unit has one and the base branch can't yet read it.
  unitOutline?: string;
}

export interface LessonContext extends UnitContext {
  // Display name of the lesson the AI call is generating for.
  lessonName: string;

  // The lesson's `generate_outline` — the levelbuilder's free-text
  // description of what this specific lesson teaches. Drives the level
  // outline AI and is re-quoted to per-level AI calls so they keep
  // consistent framing.
  lessonOutline?: string;

  // Formatted dump of a target Web Lab 2 project's source files (the
  // result of `formatTargetProject(loadProjectSources(channelId))`).
  // When set, every per-level AI call uses it as the "final goal" the
  // lesson is building toward. Field lives at the lesson scope because
  // the channel id is stored on the Lesson, but downstream scopes
  // (LevelContext, SlideContext) inherit it.
  targetProject?: string;
}

export interface LevelContext extends LessonContext {
  // The level's user-facing name (typically `<prefix>-<id>`). Used in
  // filenames for generated assets and as a logging tag.
  levelName: string;

  // The levelbuilder's per-level description — the prompt that scopes
  // what *this specific level* should build.
  levelDescription: string;

  // Formatted text of the levels that have already been generated
  // earlier in the same run. The per-level AI uses it for continuity
  // (recurring characters, building on prior code, callbacks). Always
  // sibling-forward: a level never sees its successors.
  precedingLevels?: string;
}
