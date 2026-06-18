import {LevelStatus, LevelKind} from '@cdo/generated-scripts/sharedConstants';

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

export const hoverStyle = {
  ':hover': {
    textDecoration: 'none',
    color: 'var(--text-neutral-inverse)',
    borderColor: 'var(--borders-brand-purple-primary)',
    backgroundColor: 'var(--background-brand-purple-primary)',
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
 * Get border and background styling based on level kind and student progress.
 */
export function levelProgressStyle(levelStatus, levelKind) {
  let style = {
    borderWidth: 2,
    borderColor: 'var(--borders-neutral-primary)',
    borderStyle: 'solid',
    color: 'var(--text-neutral-primary)',
    backgroundColor: 'var(--background-neutral-primary)',
  };

  const statusStyle =
    levelKind === LevelKind.assessment
      ? assessmentStatusStyle[levelStatus]
      : levelStatusStyle[levelStatus];

  return {
    ...style,
    ...statusStyle,
  };
}

const assessmentStatusStyle = {
  [LevelStatus.attempted]: {
    borderColor: 'var(--borders-brand-purple-primary)',
  },
  [LevelStatus.submitted]: {
    borderColor: 'var(--borders-brand-purple-primary)',
    backgroundColor: 'var(--background-brand-purple-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  [LevelStatus.completed_assessment]: {
    borderColor: 'var(--borders-brand-purple-primary)',
    backgroundColor: 'var(--background-brand-purple-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  [LevelStatus.perfect]: {
    borderColor: 'var(--borders-brand-purple-primary)',
    backgroundColor: 'var(--background-brand-purple-primary)',
    color: 'var(--text-neutral-inverse)',
  },
};

const levelStatusStyle = {
  [LevelStatus.attempted]: {
    borderColor: 'var(--borders-success-primary)',
  },
  [LevelStatus.perfect]: {
    borderColor: 'var(--borders-success-primary)',
    backgroundColor: 'var(--background-success-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  [LevelStatus.free_play_complete]: {
    borderColor: 'var(--borders-success-primary)',
    backgroundColor: 'var(--background-success-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  [LevelStatus.passed]: {
    borderColor: 'var(--borders-success-primary)',
    backgroundColor: 'var(--background-success-extra-light)',
  },
  // Note: There are submittable levels that are not assessments.
  [LevelStatus.submitted]: {
    borderColor: 'var(--borders-brand-purple-primary)',
    backgroundColor: 'var(--background-brand-purple-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  [LevelStatus.completed_assessment]: {
    borderColor: 'var(--borders-brand-purple-primary)',
    backgroundColor: 'var(--background-brand-purple-primary)',
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
    borderColor: 'var(--borders-success-primary)',
    backgroundColor: 'var(--background-success-primary)',
  },
};
