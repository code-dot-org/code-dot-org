/**
 * LessonGoal — renders the notebook's goal text below the title.
 *
 * Goal text may be a plain string or a locale-keyed object; this component
 * resolves the appropriate variant before rendering. When no goal is set the
 * component renders nothing so callers need not guard at the call site.
 */

import {Typography} from '@mui/material';
import type {LocalizedString} from '../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for LessonGoal. */
export interface LessonGoalProps {
  /**
   * Goal text for the lesson, either a plain string or a locale-keyed object.
   * When undefined the component renders null.
   */
  goal: LocalizedString | undefined;
  /** Active locale used to pick the correct variant. */
  locale: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves a LocalizedString to the appropriate plain string for the given locale.
 * Falls back to the `default` key when the locale is not present in the object.
 *
 * @param goal   LocalizedString to resolve
 * @param locale Active locale code
 * @returns      Resolved string for the locale
 */
function resolveGoal(goal: LocalizedString, locale: string): string {
  if (typeof goal === 'string') return goal;
  return goal[locale] ?? goal.default;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the lesson goal as a secondary body-2 paragraph.
 * Returns null when `goal` is undefined.
 */
export function LessonGoal({goal, locale}: LessonGoalProps): React.ReactElement | null {
  if (goal === undefined) return null;

  const text = resolveGoal(goal, locale);

  return (
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  );
}
