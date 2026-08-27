import type {Experience} from '@code-dot-org/authoring';

// levelType mirrors Levelbuilder's level_type column (see
// ExistingLevelExperience in @code-dot-org/authoring's model/types.ts) — free
// text, not a closed enum. Labels below cover what the imported demo
// catalogs (oceans, coding-with-music-2025, coursed-2024) actually produce;
// an unlisted levelType falls back to itself, which is honest even if terse.
const LEVEL_TYPE_LABELS: Record<string, string> = {
  Multi: 'Multiple choice',
  Match: 'Matching',
  StandaloneVideo: 'Video',
  BubbleChoice: 'Choice grid',
  LevelGroup: 'Level group',
  External: 'External content',
};

/** Short, technical-is-fine label for what an experience IS — shown to
 * authors in the outline and stage header so a "Skill Building" row (see
 * OutlineRail's title fallback) at least says what kind of activity it is. */
export function experienceTypeLabel(experience: Experience): string {
  switch (experience.kind) {
    case 'content':
      return 'Content';
    case 'widget':
      return 'Widget';
    case 'existingLevel':
      switch (experience.labKey) {
        case 'maze':
          return 'Maze puzzle';
        case 'music':
          return 'Music activity';
        case 'oceans':
          return 'Oceans activity';
        default:
          return LEVEL_TYPE_LABELS[experience.levelType] ?? experience.levelType;
      }
  }
}
