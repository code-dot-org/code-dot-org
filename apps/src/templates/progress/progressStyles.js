import color from '@cdo/apps/util/color';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';

export const DOT_SIZE = 30;
export const DIAMOND_DOT_SIZE = 22;
export const SMALL_DOT_SIZE = 9;
export const SMALL_DIAMOND_SIZE = 6;
export const BUBBLE_BORDER_WIDTH = 2;

// Style used when hovering
export const hoverStyle = {
  ':hover': {
    textDecoration: 'none',
    color: color.white,
    borderColor: color.level_current,
    backgroundColor: color.level_current
  }
};

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
  },
  [LevelStatus.readonly]: {
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
  // Note: There are submittable levels that are not assessments.
  [LevelStatus.readonly]: {
    borderColor: color.level_submitted,
    backgroundColor: color.level_submitted,
    color: color.white
  },
  // Below three are used by peer reviews
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

/**
 * Given a level object, figure out styling related to its color, border color,
 * and background color
 */
export const levelProgressStyle = (levelStatus, levelKind, disabled) => {
  let style = {
    borderWidth: BUBBLE_BORDER_WIDTH,
    borderColor: color.lighter_gray,
    borderStyle: 'solid',
    color: color.charcoal,
    backgroundColor: color.level_not_tried
  };

  // We don't return early for disabled assessments that have been submitted
  // so that they still show their submitted status.
  if (
    (disabled && levelStatus !== LevelStatus.submitted) ||
    !levelStatus ||
    levelStatus === levelStatus.not_tried ||
    levelStatus === LevelStatus.locked
  ) {
    return style;
  }

  const statusStyle =
    levelKind === LevelKind.assessment
      ? assessmentStatusStyle[levelStatus]
      : levelStatusStyle[levelStatus];

  return {
    ...style,
    ...statusStyle
  };
};
