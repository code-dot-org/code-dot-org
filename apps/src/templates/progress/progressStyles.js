import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

/**
 * Note: these constants will be removed in favor of `BubbleFactory.bubbleSizes`
 * once we finish cleaning up all of our bubble components (LP-1662).
 */
export const DOT_SIZE = 30;
export const DIAMOND_DOT_SIZE = 22;
export const SMALL_DOT_SIZE = 9;
export const SMALL_DIAMOND_SIZE = 6;

/**
 * ======================================
 * Layout helpers
 * ======================================
 */

export const flex = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
export const flexAround = {...flex, justifyContent: 'space-around'};
export const flexBetween = {...flex, justifyContent: 'space-between'};

export const inlineBlock = {display: 'inline-block'};

export const marginLeftRight = margin => {
  return {
    marginLeft: margin,
    marginRight: margin,
  };
};

export const marginTopBottom = margin => {
  return {
    marginTop: margin,
    marginBottom: margin,
  };
};

/**
 * ======================================
 * Shared styles
 * ======================================
 */

// Hover treatment for ProgressPill, kept in step with the bubble hover in
// styles.scss (.progress-bubble.enabled:hover), which carries the note on why
// the fill is the accent orange rather than the brand purple.
//
// Nothing paints these rules today: ProgressPill never spreads them for a
// multi-level pill (it has neither a url nor an onClick, so the hover branch is
// dead) and overrides them for a single-level one (levelProgressStyle is spread
// after them). The tokens move with the bubbles anyway, so the two hovers do
// not drift apart before that is sorted out.
export const hoverStyle = {
  ':hover': {
    textDecoration: 'none',
    color: 'var(--text-neutral-inverse)',
    borderColor: 'var(--border-accent-orange-primary)',
    backgroundColor: 'var(--background-accent-orange-primary)',
  },
  transition:
    'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
};

/**
 * ======================================
 * Progress styles
 * ======================================
 */

/**
 * Get border and background styling based on student progress. Assessment
 * levels take the same status colors as any other level; they are denoted
 * by a star badge (see BubbleBadge), not by color.
 */
export function levelProgressStyle(levelStatus) {
  let style = {
    borderWidth: 2,
    borderColor: 'var(--borders-neutral-primary)',
    borderStyle: 'solid',
    color: 'var(--text-neutral-primary)',
    backgroundColor: 'var(--background-neutral-primary)',
  };

  return {
    ...style,
    ...levelStatusStyle[levelStatus],
  };
}

// --borders-success-primary on a --background-success-primary fill reads as a
// ring of a slightly different green rather than as an outline, because under
// codeai-next the two tokens resolve close together (#34bd43 on #258830). The
// success statuses below all draw their border in the fill color instead: on a
// filled bubble the border disappears into the fill, and on an unfilled one
// (attempted, passed) it stays a visible green outline.
const levelSuccessStatusBorderColor = 'var(--background-success-primary)';

const levelStatusStyle = {
  [LevelStatus.attempted]: {
    borderColor: levelSuccessStatusBorderColor,
  },
  [LevelStatus.perfect]: {
    borderColor: levelSuccessStatusBorderColor,
    backgroundColor: 'var(--background-success-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  [LevelStatus.free_play_complete]: {
    borderColor: levelSuccessStatusBorderColor,
    backgroundColor: 'var(--background-success-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  [LevelStatus.passed]: {
    borderColor: levelSuccessStatusBorderColor,
    backgroundColor: 'var(--background-success-extra-light)',
  },
  // Submitted and completed-assessment levels count as completed work, so
  // they take the same green fill as perfect. Note: there are submittable
  // levels that are not assessments.
  [LevelStatus.submitted]: {
    borderColor: levelSuccessStatusBorderColor,
    backgroundColor: 'var(--background-success-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  [LevelStatus.completed_assessment]: {
    borderColor: levelSuccessStatusBorderColor,
    backgroundColor: 'var(--background-success-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  // Below are used by peer reviews
  [LevelStatus.review_rejected]: {
    color: 'var(--text-neutral-inverse)',
    borderColor: 'var(--borders-error-primary)',
    backgroundColor: 'var(--background-error-primary)',
  },
  [LevelStatus.review_accepted]: {
    color: 'var(--text-neutral-inverse)',
    borderColor: levelSuccessStatusBorderColor,
    backgroundColor: 'var(--background-success-primary)',
  },
};
