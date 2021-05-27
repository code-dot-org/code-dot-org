import color from '@cdo/apps/util/color';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';

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
  justifyContent: 'center'
};
export const flexAround = {...flex, justifyContent: 'space-around'};
export const flexBetween = {...flex, justifyContent: 'space-between'};

export const inlineBlock = {display: 'inline-block'};

export const marginLeftRight = margin => {
  return {
    marginLeft: margin,
    marginRight: margin
  };
};

export const marginTopBottom = margin => {
  return {
    marginTop: margin,
    marginBottom: margin
  };
};

/**
 * ======================================
 * Shared styles
 * ======================================
 */

export const font = {
  fontFamily: '"Gotham 5r", sans-serif'
};

export const hoverStyle = {
  ':hover': {
    textDecoration: 'none',
    color: color.white,
    borderColor: color.level_current,
    backgroundColor: color.level_current
  },
  transition:
    'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out'
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
    borderColor: color.lighter_gray,
    borderStyle: 'solid',
    color: color.charcoal,
    backgroundColor: color.level_not_tried
  };

  const statusStyle =
    levelKind === LevelKind.assessment
      ? assessmentStatusStyle[levelStatus]
      : levelStatusStyle[levelStatus];

  return {
    ...style,
    ...statusStyle
  };
}

const assessmentStatusStyle = {
  [LevelStatus.attempted]: {
    borderColor: color.level_submitted
  },
  [LevelStatus.submitted]: {
    borderColor: color.level_submitted,
    backgroundColor: color.level_submitted,
    color: color.white
  },
  [LevelStatus.completed_assessment]: {
    borderColor: color.level_submitted,
    backgroundColor: color.level_submitted,
    color: color.white
  },
  [LevelStatus.perfect]: {
    borderColor: color.level_submitted,
    backgroundColor: color.level_submitted,
    color: color.white
  }
};

const levelStatusStyle = {
  [LevelStatus.attempted]: {
    borderColor: color.level_perfect
  },
  [LevelStatus.perfect]: {
    borderColor: color.level_perfect,
    backgroundColor: color.level_perfect,
    color: color.white
  },
  [LevelStatus.free_play_complete]: {
    borderColor: color.level_perfect,
    backgroundColor: color.level_perfect,
    color: color.white
  },
  [LevelStatus.passed]: {
    borderColor: color.level_perfect,
    backgroundColor: color.level_passed
  },
  // Note: There are submittable levels that are not assessments.
  [LevelStatus.submitted]: {
    borderColor: color.level_submitted,
    backgroundColor: color.level_submitted,
    color: color.white
  },
  [LevelStatus.completed_assessment]: {
    borderColor: color.level_submitted,
    backgroundColor: color.level_submitted,
    color: color.white
  },
  // Below are used by peer reviews
  [LevelStatus.review_rejected]: {
    color: color.white,
    borderColor: color.level_review_rejected,
    backgroundColor: color.level_review_rejected
  },
  [LevelStatus.review_accepted]: {
    color: color.white,
    borderColor: color.level_perfect,
    backgroundColor: color.level_perfect
  }
};
