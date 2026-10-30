import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React from 'react';

import {makeEnum} from '@cdo/apps/utils';

import {BubbleSize, BubbleShape} from './BubbleFactory';

export const BadgeType = makeEnum('assessment', 'keepWorking');

export default function BubbleBadge({badgeType, bubbleSize, bubbleShape}) {
  const canHaveBadge = [BubbleSize.full, BubbleSize.letter];
  if (!canHaveBadge.includes(bubbleSize)) {
    return null;
  }

  if (badgeType === BadgeType.assessment) {
    return AssessmentBubbleBadge(bubbleShape);
  } else if (badgeType === BadgeType.keepWorking) {
    return KeepWorkingBubbleBadge(bubbleSize);
  }

  return null;
}
BubbleBadge.propTypes = {
  badgeType: PropTypes.oneOf(Object.values(BadgeType)).isRequired,
  bubbleSize: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
  bubbleShape: PropTypes.oneOf(Object.values(BubbleShape)).isRequired,
};

function AssessmentBubbleBadge(bubbleShape) {
  const bubblePositioning =
    bubbleShape === BubbleShape.diamond
      ? styles.diamondBubblePosition
      : styles.bubblePosition;

  return (
    <div style={bubblePositioning}>
      <AssessmentBadge />
    </div>
  );
}
AssessmentBubbleBadge.propTypes = {
  bubbleShape: PropTypes.oneOf(Object.values(BubbleShape)).isRequired,
};

function KeepWorkingBubbleBadge(bubbleSize) {
  const isSmall = bubbleSize === BubbleSize.letter;

  const bubblePositioning = isSmall
    ? styles.keepWorkingSmallBadgePosition
    : styles.keepWorkingBadgePosition;

  return (
    <div style={bubblePositioning}>
      <KeepWorkingBadge isSmall={isSmall} />
    </div>
  );
}
KeepWorkingBubbleBadge.propTypes = {
  bubbleSize: PropTypes.oneOf(Object.values(BubbleSize)).isRequired,
};

// KeepWorkingBadge is exported because it is also used independently of
// the progress bubble
export function KeepWorkingBadge({isSmall, style}) {
  const badgeSize = isSmall
    ? styles.keepWorkingBadgeSmallSize
    : styles.keepWorkingBadgeFullSize;

  return <div style={{...styles.keepWorkingBadge, ...badgeSize, ...style}} />;
}
KeepWorkingBadge.propTypes = {
  isSmall: PropTypes.bool,
  style: PropTypes.object,
};

// AssessmentBadge is exported for tests
export function AssessmentBadge() {
  return (
    <span className="fa-stack" style={styles.container}>
      <FontAwesomeV6Icon
        iconName="circle"
        className="fa-stack-2x"
        style={styles.badgeBackground}
      />
      <FontAwesomeV6Icon
        iconName="circle"
        iconStyle="regular"
        className="fa-stack-2x"
        style={styles.badgeOutline}
      />
      <FontAwesomeV6Icon
        iconName="star"
        className="fa-stack-1x"
        style={styles.badgeStar}
      />
    </span>
  );
}
AssessmentBadge.propTypes = {
  hasWhiteBorder: PropTypes.bool,
  style: PropTypes.object,
};

const styles = {
  // fa-stack defaults to a 2.5em-wide box (25px at this font size); pin it
  // to 20x20 so the container matches the 2em circle drawn inside it.
  container: {
    fontSize: 10,
    width: 20,
    height: 20,
  },
  // The badge overhangs its bubble into the neighboring cell, where the gray
  // connector bar (ProgressBubbleSet) would otherwise paint over it in DOM
  // order; z-index lifts the badge above the z-auto bars.
  bubblePosition: {
    position: 'absolute',
    top: -4,
    right: -10,
    zIndex: 1,
  },
  diamondBubblePosition: {
    position: 'absolute',
    top: -10,
    right: -20,
    zIndex: 1,
  },
  badgeBackground: {
    color: 'var(--background-neutral-primary)',
  },
  badgeOutline: {
    color: 'var(--text-neutral-primary)',
  },
  badgeStar: {
    color: 'var(--text-neutral-primary)',
    // The star glyph rides low in the fa-stack line box; nudge it up so it
    // sits centered in the badge circle.
    transform: 'translateY(-1px)',
  },
  keepWorkingSmallBadgePosition: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  keepWorkingBadgePosition: {
    position: 'absolute',
    top: 0,
    right: -2,
  },
  keepWorkingBadge: {
    borderRadius: '50%',
    backgroundColor: 'var(--background-error-primary)',
  },
  keepWorkingBadgeFullSize: {
    width: 10,
    height: 10,
  },
  keepWorkingBadgeSmallSize: {
    width: 7,
    height: 7,
  },
};
