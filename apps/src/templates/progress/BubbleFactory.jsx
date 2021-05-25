import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import classNames from 'classnames';
import i18n from '@cdo/locale';
import {
  bubbleStyles,
  BubbleSize,
  BubbleShape,
  mainBubbleStyle,
  diamondContainerStyle
} from '@cdo/apps/templates/progress/progressStyles';

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

export function LinkWrapper({url, children}) {
  return (
    <a href={url} style={bubbleStyles.link}>
      {children}
    </a>
  );
}
LinkWrapper.propTypes = {
  url: PropTypes.string.isRequired,
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

export const unitTestExports = {
  DiamondContainer
};
