import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import classNames from 'classnames';
import _ from 'lodash';
import queryString from 'query-string';
import i18n from '@cdo/locale';
import {currentLocation, makeEnum} from '@cdo/apps/utils';
import TooltipWithIcon from './TooltipWithIcon';
import {getIconForLevel, isLevelAssessment} from './progressHelpers';
import {
  flex,
  font,
  marginLeftRight,
  marginTopBottom,
  tightlyConstrainedSizeStyle
} from './progressStyles';
import {levelWithProgressType} from './progressTypes';

export const BubbleSize = makeEnum('dot', 'letter', 'full');
export const BubbleShape = makeEnum('circle', 'diamond', 'pill');

/**
 * Base bubble component defined in terms of shape, size, and style, as opposed
 * to level-related properties. This component is itself only an empty styled
 * container, and expects the bubble content (e.g. level number, icon, text) to
 * be passed in as its children.
 * @param {BubbleShape} shape
 * @param {BubbleSize} size
 * @param {object} progressStyle contains border and background colors
 * @param {string} classNames applies hover effect if enabled
 * @param {node} children the content to render inside the bubble
 */
export function BasicBubble({
  shape,
  size,
  progressStyle,
  classNames,
  children
}) {
  const bubbleStyle = mainBubbleStyle(shape, size, progressStyle);
  if (shape === BubbleShape.diamond) {
    return (
      <DiamondContainer
        size={size}
        bubbleStyle={bubbleStyle}
        classNames={classNames}
      >
        {children}
      </DiamondContainer>
    );
  }
  return (
    <div className={classNames} style={bubbleStyle}>
      {children}
    </div>
  );
}
BasicBubble.propTypes = {
  shape: PropTypes.oneOf(Object.values(BubbleShape)).isRequired,
  size: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
  progressStyle: PropTypes.object,
  classNames: PropTypes.string,
  children: PropTypes.node
};

/**
 * Container applying rotation transforms and forcing diamond bubbles to have
 * the same size as circles.
 * @param {BubbleSize} size
 * @param {object} bubbleStyle contains rotation transform and progress style
 * @param {string} classNames applies hover effect if enabled
 * @param {node} children
 */
function DiamondContainer({size, bubbleStyle, classNames, children}) {
  return (
    /* Constrain size */
    <div style={diamondContainerStyle(size)}>
      {/* Apply rotation transform, progress style, and hover effect */}
      <div className={classNames} style={bubbleStyle}>
        {/* Undo the rotation from the parent */}
        <div style={bubbleStyles.diamondContentTransform}>{children}</div>
      </div>
    </div>
  );
}
DiamondContainer.propTypes = {
  size: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
  bubbleStyle: PropTypes.object,
  classNames: PropTypes.string,
  children: PropTypes.node
};

export function BubbleLink({url, onClick, children}) {
  return (
    <a href={url} onClick={onClick} className="progress-bubble-link">
      {children}
    </a>
  );
}
BubbleLink.propTypes = {
  url: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.element.isRequired
};

export function BubbleTooltip({level, children}) {
  let tooltipText = level.isSublevel
    ? level.display_name
    : level.isUnplugged
    ? i18n.unpluggedActivity()
    : level.name || level.progressionDisplayName || '';
  if (level.levelNumber) {
    tooltipText = `${level.levelNumber}. ${tooltipText}`;
  }
  const tooltipId = _.uniqueId();
  return (
    <div data-tip data-for={tooltipId} aria-describedby={tooltipId}>
      {children}
      <TooltipWithIcon
        tooltipId={tooltipId}
        icon={getIconForLevel(level)}
        text={tooltipText}
        includeAssessmentIcon={isLevelAssessment(level)}
      />
    </div>
  );
}
BubbleTooltip.propTypes = {
  level: levelWithProgressType.isRequired,
  children: PropTypes.element.isRequired
};

/**
 * =======================
 * Helpers
 * =======================
 */

export function getBubbleContent(
  isLocked,
  isUnplugged,
  isBonus,
  isPaired,
  title,
  bubbleSize
) {
  if (bubbleSize === BubbleSize.dot) {
    // dot-sized bubbles are too small for content
    return null;
  }
  return isUnplugged ? (
    <span>{i18n.unpluggedActivity()}</span>
  ) : isLocked ? (
    <FontAwesome icon="lock" />
  ) : isPaired ? (
    <FontAwesome icon="users" />
  ) : isBonus ? (
    <FontAwesome icon="flag-checkered" />
  ) : title ? (
    <span>{title}</span>
  ) : null;
}

export function getBubbleShape(isUnplugged, isConcept) {
  return isUnplugged
    ? BubbleShape.pill
    : isConcept
    ? BubbleShape.diamond
    : BubbleShape.circle;
}

export function getBubbleClassNames(isEnabled) {
  return classNames('progress-bubble', {enabled: isEnabled});
}

export function getBubbleUrl(
  levelUrl,
  studentId,
  sectionId,
  preserveQueryParams = false
) {
  if (!levelUrl) {
    return null;
  }
  const params = preserveQueryParams
    ? queryString.parse(currentLocation().search)
    : {};
  if (sectionId) {
    params.section_id = sectionId;
  }
  if (studentId) {
    params.user_id = studentId;
  }
  if (Object.keys(params).length) {
    return `${levelUrl}?${queryString.stringify(params)}`;
  }
  return levelUrl;
}

/**
 * ======================================
 * Bubble styles
 * ======================================
 */

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

const bubbleStyles = {
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
  }
};

/**
 * Computes style for shape/size, and merges with `progressStyle` previously
 * computed by `progressStyles.levelProgressStyle`.
 */
function mainBubbleStyle(shape, size, progressStyle) {
  return {
    ...bubbleStyles.main,
    ...shapeSizeStyle(shape, size),
    ...progressStyle
  };
}

function diamondContainerStyle(size) {
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

export const unitTestExports = {
  DiamondContainer,
  bubbleStyles,
  mainBubbleStyle
};
