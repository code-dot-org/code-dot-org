import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import progressTableStyles from '@cdo/apps/templates/sectionProgress/progressTables/progressTableStyles.scss';

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

export const tightlyConstrainedSizeStyle = size => {
  return {
    minWidth: size,
    maxWidth: size,
    minHeight: size,
    maxHeight: size
  };
};

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

export const cellContent = {
  padding: '0px 4px'
};

export const studentListContent = {
  height: parseInt(progressTableStyles.ROW_HEIGHT),
  boxSizing: 'border-box',
  padding: 10,
  fontSize: 14,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
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
 * Bubble styles
 * ======================================
 */

export const BubbleSize = makeEnum('dot', 'letter', 'full');
export const BubbleShape = makeEnum('circle', 'diamond', 'pill');

/**
 * Note: these constants will be removed in favor of `bubbleSizes` below once
 * we finish cleaning up all of our bubble components.
 */
export const DOT_SIZE = 30;
export const DIAMOND_DOT_SIZE = 22;
export const SMALL_DOT_SIZE = 9;
export const SMALL_DIAMOND_SIZE = 6;

const LARGE_FONT = 16;
const SMALL_FONT = 12;

const bubbleSizes = {
  [BubbleShape.circle]: {
    [BubbleSize.dot]: 13,
    [BubbleSize.letter]: 20,
    [BubbleSize.full]: 30
  },
  [BubbleShape.diamond]: {
    [BubbleSize.dot]: 10,
    [BubbleSize.full]: 23
  },
  [BubbleShape.pill]: {}
};

const bubbleMargins = {
  [BubbleSize.dot]: 3,
  [BubbleSize.letter]: 3,
  [BubbleSize.full]: 2
};

/**
 * We use fixed-size containers to make diamond bubbles the same width as
 * circle bubbles, so we use BubbleShape.circle to compute.
 *
 * Container width is the width of the bubble plus the left and right margins.
 */
export const bubbleContainerWidths = {
  [BubbleSize.dot]:
    bubbleSizes[BubbleShape.circle][BubbleSize.dot] +
    2 * bubbleMargins[BubbleSize.dot],
  [BubbleSize.letter]:
    bubbleSizes[BubbleShape.circle][BubbleSize.letter] +
    2 * bubbleMargins[BubbleSize.letter],
  [BubbleSize.full]:
    bubbleSizes[BubbleShape.circle][BubbleSize.full] +
    2 * bubbleMargins[BubbleSize.full]
};

const fontSizes = {
  [BubbleShape.circle]: {
    [BubbleSize.letter]: SMALL_FONT,
    [BubbleSize.full]: LARGE_FONT
  },
  [BubbleShape.diamond]: {
    [BubbleSize.full]: LARGE_FONT
  }
};

export const bubbleStyles = {
  main: {
    ...flex,
    ...font,
    ...marginTopBottom(3),
    boxSizing: 'border-box',
    letterSpacing: -0.11,
    position: 'relative',
    whiteSpace: 'nowrap'
  },
  pill: {
    borderRadius: 20,
    fontSize: SMALL_FONT,
    padding: '6px 10px'
  },
  diamond: {
    ...marginTopBottom(6),
    transform: 'rotate(45deg)',
    padding: 2
  },
  diamondContentTransform: {
    transform: 'rotate(-45deg)'
  },
  bonusDisabled: {
    backgroundColor: color.lighter_gray,
    color: color.white
  },
  link: {
    ...inlineBlock,
    textDecoration: 'none'
  }
};

/**
 * Computes style for shape/size, and merges with `progressStyle` previously
 * computed by `getProgressStyle` below.
 */
export function mainBubbleStyle(shape, size, progressStyle) {
  return {
    ...bubbleStyles.main,
    ...shapeSizeStyle(shape, size),
    ...progressStyle
  };
}

export function diamondContainerStyle(size) {
  const containerWidth = bubbleContainerWidths[size];
  return {
    ...flex,
    width: containerWidth,
    height: containerWidth
  };
}

function circleStyle(size) {
  const bubbleSize = bubbleSizes[BubbleShape.circle][size];
  const fontSize = fontSizes[BubbleShape.circle][size];
  const horizontalMargin = marginLeftRight(bubbleMargins[size]);
  return {
    ...tightlyConstrainedSizeStyle(bubbleSize),
    borderRadius: bubbleSize,
    fontSize: fontSize,
    lineHeight: fontSize,
    ...horizontalMargin
  };
}

function diamondStyle(size) {
  const bubbleSize = bubbleSizes[BubbleShape.diamond][size];
  const fontSize = fontSizes[BubbleShape.diamond][size];
  return {
    ...bubbleStyles.diamond,
    ...tightlyConstrainedSizeStyle(bubbleSize),
    borderRadius: size === BubbleSize.full ? 4 : 2,
    fontSize: fontSize,
    lineHeight: fontSize
  };
}

function shapeSizeStyle(shape, size) {
  return shape === BubbleShape.pill
    ? bubbleStyles.pill
    : shape === BubbleShape.diamond
    ? diamondStyle(size)
    : circleStyle(size);
}

/**
 * Get border and background styling based on level and student progress.
 *
 * Note: `levelProgressStyle` below is used by our legacy bubble components,
 * but once those get wrapped into our new components these two functions can
 * be merged into one.
 */
export function getProgressStyle({
  levelStatus,
  levelKind,
  isDisabled,
  isBonus
}) {
  return {
    ...(!isDisabled && hoverStyle),
    ...levelProgressStyle(levelStatus, levelKind, isDisabled),
    ...(isDisabled && isBonus && bubbleStyles.bonusDisabled)
  };
}

/**
 * Given a level object, figure out styling related to its color, border color,
 * and background color
 */
export const levelProgressStyle = (levelStatus, levelKind, disabled) => {
  let style = {
    borderWidth: 2,
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
