import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import FontAwesome from '../FontAwesome';

export function BubbleBadgeWrapper({isDiamond, children}) {
  const bubblePositioning = isDiamond
    ? styles.diamondBubblePosition
    : styles.bubblePosition;

  return <div style={bubblePositioning}>{children}</div>;
}
BubbleBadgeWrapper.propTypes = {
  isDiamond: PropTypes.bool,
  children: PropTypes.node
};

export function KeepWorkingBadge({hasWhiteBorder = true, style}) {
  return (
    <BaseBadge
      icon="exclamation"
      color={color.red}
      hasWhiteBorder={hasWhiteBorder}
      style={style}
    />
  );
}
KeepWorkingBadge.propTypes = {
  hasWhiteBorder: PropTypes.bool,
  style: PropTypes.object
};

export function AssessmentBadge({hasWhiteBorder = true, style}) {
  return (
    <BaseBadge
      icon="check"
      color={color.purple}
      hasWhiteBorder={hasWhiteBorder}
      style={style}
    />
  );
}
AssessmentBadge.propTypes = {
  hasWhiteBorder: PropTypes.bool,
  style: PropTypes.object
};

function BaseBadge({icon, color, hasWhiteBorder, style}) {
  return (
    <span className="fa-stack" style={{...styles.container, ...style}}>
      <FontAwesome icon="circle" className="fa-stack-2x" style={{color}} />
      {hasWhiteBorder && (
        <FontAwesome
          icon="circle-thin"
          className="fa-stack-2x"
          style={styles.border}
        />
      )}
      <FontAwesome
        icon={icon}
        className="fa-stack-1x"
        style={styles.centerIcon}
      />
    </span>
  );
}
BaseBadge.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  hasWhiteBorder: PropTypes.bool,
  style: PropTypes.object
};

const styles = {
  container: {
    fontSize: 10
  },
  bubblePosition: {
    position: 'absolute',
    top: -7,
    right: -7
  },
  diamondBubblePosition: {
    position: 'absolute',
    top: -13,
    right: -17
  },
  border: {
    color: color.white
  },
  centerIcon: {
    color: color.white
  }
};
