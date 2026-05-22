/**
 * LessonComplete — dismissible completion banner shown when all runnable cells
 * have been executed.
 *
 * Rendered as a fixed-position MUI Alert at the bottom of the notebook so it
 * does not disrupt the cell layout.  The student can dismiss it, open the next
 * lesson, or return to the notebook index.
 */

import {Alert, AlertTitle, Box, Button, IconButton, SvgIcon} from '@mui/material';
import type {LocalizedString} from '../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

/**
 * CloseIcon — inline SVG for the dismiss button.
 * Path data mirrors Material Design "close" icon.
 */
function CloseIcon(): React.ReactElement {
  return (
    <SvgIcon fontSize="small">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </SvgIcon>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for LessonComplete. */
export interface LessonCompleteProps {
  /**
   * Goal text to echo in the completion message.
   * When undefined the goal echo is omitted.
   */
  goal: LocalizedString | undefined;
  /**
   * ID of the next notebook in the unit, or null when the current is last.
   * When non-null a "Next lesson →" button is shown.
   */
  nextNotebookId: string | null;
  /**
   * Called when the student taps "Next lesson →".
   * @param id The next notebook ID to open
   */
  onOpenNext: (id: string) => void;
  /** Called when the student taps "Back to your path". */
  onBackToIndex: () => void;
  /** Called when the student taps the dismiss (✕) button. */
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves a LocalizedString to a plain string using `locale` if present or
 * falling back to `default` when it is an object.
 *
 * Not locale-parameterized here because LessonComplete receives pre-resolved
 * goal strings from LessonGoal; this helper exists to handle the raw prop.
 *
 * @param goal LocalizedString or undefined
 * @returns    Resolved string, or empty string when undefined
 */
function resolveGoalText(goal: LocalizedString | undefined): string {
  if (goal === undefined) return '';
  if (typeof goal === 'string') return goal;
  return goal.default;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Renders the "Next lesson →" button when a next notebook is available.
 *
 * @param nextNotebookId ID of the next notebook; when null nothing is rendered
 * @param onOpenNext     Callback invoked with the ID on click
 */
function NextLessonButton({
  nextNotebookId,
  onOpenNext,
}: {
  nextNotebookId: string | null;
  onOpenNext: (id: string) => void;
}): React.ReactElement | null {
  if (nextNotebookId === null) return null;

  function handleClick(): void {
    onOpenNext(nextNotebookId as string);
  }

  return (
    <Button variant="contained" color="success" size="small" onClick={handleClick}>
      Next lesson →
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Non-blocking dismissible banner shown when the student has run all
 * required cells in the notebook.  Provides navigation affordances for
 * proceeding to the next lesson or returning to the path index.
 */
export function LessonComplete({
  goal,
  nextNotebookId,
  onOpenNext,
  onBackToIndex,
  onDismiss,
}: LessonCompleteProps): React.ReactElement {
  const goalText = resolveGoalText(goal);

  return (
    <Alert
      severity="success"
      action={
        <IconButton
          aria-label="Dismiss"
          color="inherit"
          size="small"
          onClick={onDismiss}
        >
          <CloseIcon />
        </IconButton>
      }
    >
      <AlertTitle>You finished!</AlertTitle>
      {goalText !== '' && goalText}
      <Box sx={{display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap'}}>
        <NextLessonButton
          nextNotebookId={nextNotebookId}
          onOpenNext={onOpenNext}
        />
        <Button variant="outlined" color="success" size="small" onClick={onBackToIndex}>
          Back to your path
        </Button>
      </Box>
    </Alert>
  );
}
