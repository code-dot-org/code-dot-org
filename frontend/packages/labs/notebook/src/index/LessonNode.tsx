/**
 * LessonNode — a single notebook entry in a lesson list.
 *
 * Renders a clickable row whose appearance reflects whether the lesson has
 * been completed, is the current active lesson, or is a future lesson.
 * Uses an inline SVG checkmark for the completed state so this component
 * has no dependency on @mui/icons-material.
 */

import {Box, Typography} from '@mui/material';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Visual state of a lesson node.
 * - 'completed': learner has finished this notebook
 * - 'current': the active notebook the learner is working on
 * - 'future': not yet reached
 */
export type LessonState = 'completed' | 'current' | 'future';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for LessonNode. */
export interface LessonNodeProps {
  /** Display title of the notebook. */
  title: string;
  /** Stable notebook identifier forwarded to onOpen. */
  notebookId: string;
  /** Visual state controlling icon and text styling. */
  state: LessonState;
  /** Called with notebookId when the row is activated. */
  onOpen: (notebookId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the MUI sx props that style the row border based on lesson state.
 *
 * @param state - Current lesson state.
 * @returns sx object for the row container.
 */
function rowSx(state: LessonState): Record<string, unknown> {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1.5,
    py: 1,
    cursor: 'pointer',
    borderLeft: state === 'current' ? 3 : 0,
    borderColor: state === 'current' ? 'primary.main' : 'transparent',
    '&:hover': {bgcolor: 'action.hover'},
  };
}

/**
 * Returns the MUI sx props that style the title Typography based on state.
 *
 * @param state - Current lesson state.
 * @returns sx object for the title text.
 */
function titleSx(state: LessonState): Record<string, unknown> {
  const muted = state === 'completed' || state === 'future';
  return {
    fontWeight: state === 'current' ? 'bold' : 'normal',
    color: muted ? 'text.secondary' : 'text.primary',
    flex: 1,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Checkmark SVG icon rendered for completed lessons.
 * Uses the Material Design CheckCircle path so there is no runtime dependency
 * on @mui/icons-material.
 */
function CheckIcon(): React.ReactElement {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      sx={{width: 20, height: 20, color: 'text.secondary', flexShrink: 0}}
    >
      {/* CheckCircle outline path (Material Design) */}
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z"
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a single notebook row with visual affordances for its lesson state.
 * Clicking the row or pressing Enter/Space activates onOpen.
 */
export function LessonNode({
  title,
  notebookId,
  state,
  onOpen,
}: LessonNodeProps): React.ReactElement {
  /** Handles row click by forwarding the notebookId to onOpen. */
  function handleClick(): void {
    onOpen(notebookId);
  }

  /**
   * Handles keyboard activation (Enter or Space) to keep the row accessible
   * without a native button element.
   *
   * @param event - Keyboard event from the row container.
   */
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(notebookId);
    }
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      sx={rowSx(state)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {state === 'completed' && <CheckIcon />}
      <Typography variant="body1" sx={titleSx(state)}>
        {title}
      </Typography>
    </Box>
  );
}
