import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import styles from './styles.scss';

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
  height: parseInt(styles.ROW_HEIGHT),
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
    [BubbleSize.full]: 34
  },
  [BubbleShape.diamond]: {
    [BubbleSize.dot]: 10,
    [BubbleSize.full]: 26
  },
  [BubbleShape.pill]: {}
};

const circleMargins = {
  [BubbleSize.dot]: 3,
  [BubbleSize.letter]: 3,
  [BubbleSize.full]: 2
};

const bubbleBorderRadii = {
  [BubbleShape.circle]: {
    [BubbleSize.dot]: bubbleSizes[BubbleShape.circle][BubbleSize.dot],
    [BubbleSize.letter]: bubbleSizes[BubbleShape.circle][BubbleSize.letter],
    [BubbleSize.full]: bubbleSizes[BubbleShape.circle][BubbleSize.full]
  },
  [BubbleShape.diamond]: {
    [BubbleSize.dot]: 2,
    [BubbleSize.full]: 4
  },
  [BubbleShape.pill]: {}
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
    2 * circleMargins[BubbleSize.dot],
  [BubbleSize.letter]:
    bubbleSizes[BubbleShape.circle][BubbleSize.letter] +
    2 * circleMargins[BubbleSize.letter],
  [BubbleSize.full]:
    bubbleSizes[BubbleShape.circle][BubbleSize.full] +
    2 * circleMargins[BubbleSize.full]
};

const fontSizes = {
  [BubbleSize.letter]: SMALL_FONT,
  [BubbleSize.full]: LARGE_FONT
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
  link: {
    ...inlineBlock,
    textDecoration: 'none'
  }
};

/**
 * Computes style for shape/size, and merges with `progressStyle` previously
 * computed by `levelProgressStyle` below.
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

function shapeSizeStyle(shape, size) {
  if (shape === BubbleShape.pill) {
    return bubbleStyles.pill;
  }

  const bubbleSize = bubbleSizes[shape][size];
  const fontSize = fontSizes[size];
  return {
    ...tightlyConstrainedSizeStyle(bubbleSize),
    borderRadius: bubbleBorderRadii[shape][size],
    fontSize: fontSize,
    lineHeight: `${fontSize}px`,
    ...(shape === BubbleShape.circle && marginLeftRight(circleMargins[size])),
    ...(shape === BubbleShape.diamond && bubbleStyles.diamond)
  };
}

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
