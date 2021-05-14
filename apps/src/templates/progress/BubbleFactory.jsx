import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import classNames from 'classnames';
import _ from 'lodash';
import queryString from 'query-string';
import i18n from '@cdo/locale';
import {currentLocation} from '@cdo/apps/utils';
import TooltipWithIcon from './TooltipWithIcon';
import {getIconForLevel, isLevelAssessment} from './progressHelpers';
import {
  bubbleStyles,
  BubbleSize,
  BubbleShape,
  mainBubbleStyle,
  diamondContainerStyle
} from './progressStyles';
import {levelWithProgressType} from './progressTypes';

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
    <a href={url} onClick={onClick} style={bubbleStyles.link}>
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

export const unitTestExports = {
  DiamondContainer
};
