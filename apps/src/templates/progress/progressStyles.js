import color from "@cdo/apps/util/color";
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';

// Style used when hovering. This might be able to be combined with levelProgressStyle
// once the progressBubbles experiment is not behind a flag
export const hoverStyle = {
  ':hover': {
    textDecoration: 'none',
    color: color.white,
    borderColor: color.level_current,
    backgroundColor: color.level_current
  }
};


// TODO: write tests?
// TODO: dont forget about peer review
/**
 * Given a level object, figure out styling related to it's color, border color,
 * and background color
 */
export const levelProgressStyle = level => {
  let style = {
    color: color.charcoal,
    backgroundColor: color.level_not_tried,
  };

  if (level.kind === LevelKind.assessment && level.status !== LevelStatus.not_tried) {
    style.borderColor = color.level_submitted;
    if (level.status === LevelStatus.perfect) {
      style.backgroundColor = color.level_submitted;
      style.color = color.white;
    }
  } else if (level.status === LevelStatus.locked) {
    // Used for peer reviews
    // TODO - check on lockable stages too
  } else {
    if (level.status !== LevelStatus.not_tried) {
      style.borderColor = color.level_perfect;
    }
    if (level.status === LevelStatus.perfect) {
      style.backgroundColor = color.level_perfect;
      style.color = color.white;
    }
    if (level.status === LevelStatus.passed) {
      style.backgroundColor = color.level_passed;
    }

    // Note: There are submittable levels that are not assessments.
    if (level.status === LevelStatus.submitted) {
      style.borderColor = color.level_submitted;
      style.backgroundColor = color.level_submitted;
      style.color = color.white;
    }
  }

  return style;
};
