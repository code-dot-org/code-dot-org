import color from "@cdo/apps/util/color";
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';

export const DOT_SIZE = 30;
export const DIAMOND_DOT_SIZE = 22;
export const SMALL_DOT_SIZE = 9;
export const SMALL_DIAMOND_SIZE = 6;

// Style used when hovering
export const hoverStyle = {
  ':hover': {
    textDecoration: 'none',
    color: color.white,
    borderColor: color.level_current,
    backgroundColor: color.level_current
  }
};

const statusStyle = {
  [LevelStatus.perfect]: {
    backgroundColor: color.level_perfect,
    color: color.white,
  },
  [LevelStatus.passed]: {
    backgroundColor: color.level_passed,
  },
  // Note: There are submittable levels that are not assessments.
  [LevelStatus.submitted]: {
    borderColor: color.level_submitted,
    backgroundColor: color.level_submitted,
    color: color.white,
  },
  // Below three are used by peer reviews
  [LevelStatus.review_rejected]: {
    color: color.white,
    borderColor: color.level_review_rejected,
    backgroundColor: color.level_review_rejected,
  },
  [LevelStatus.review_accepted]: {
    color: color.white,
    backgroundColor: color.level_perfect
  },
  [LevelStatus.locked]: {
    // Don't want our green border even though status isn't not_tried
    borderColor: color.lighter_gray,
  }
};

/**
 * Given a level object, figure out styling related to its color, border color,
 * and background color
 */
export const levelProgressStyle = (level, disabled) => {
  let style = {
    borderWidth: 2,
    color: color.charcoal,
    backgroundColor: color.level_not_tried,
  };

  if (disabled) {
    style = {
      ...style,
      ...!disabled && hoverStyle
    };
  } else if (level.kind === LevelKind.assessment && level.status !== LevelStatus.not_tried) {
    style.borderColor = color.level_submitted;
    if (level.status === LevelStatus.perfect) {
      style.backgroundColor = color.level_submitted;
      style.color = color.white;
    }
  } else {
    if (level.status !== LevelStatus.not_tried) {
      style.borderColor = color.level_perfect;
    }

    style = {
      ...style,
      ...statusStyle[level.status]
    };
  }

  return style;
};
