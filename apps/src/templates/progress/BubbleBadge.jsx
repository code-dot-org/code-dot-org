import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import FontAwesome from '../FontAwesome';

/**
 * Icon that indicates an assessment on ProgressBubbles and ProgressPills
 */

const badgeTypes = ['assessment', 'keepWorking'];

function BubbleBadge({type, isDiamond}) {
  const position = isDiamond
    ? styles.diamondBubblePosition
    : styles.bubblePosition;

  if (type === 'assessment') {
    return <AssessmentBadge style={position} />;
  } else {
    return <KeepWorkingBadge showBorder={true} style={position} />;
  }
}

BubbleBadge.propTypes = {
  type: PropTypes.oneOf(badgeTypes).isRequired,
  isDiamond: PropTypes.bool,
  positionedRelative: PropTypes.bool
};

export function KeepWorkingBadge({showBorder, style}) {
  return (
    <span className="fa-stack" style={{...styles.container, ...style}}>
      <FontAwesome
        icon="circle"
        className="fa-stack-2x"
        style={{color: color.red}}
      />
      {showBorder && (
        <FontAwesome
          icon="circle-thin"
          className="fa-stack-2x"
          style={styles.border}
        />
      )}
      <FontAwesome
        icon="exclamation"
        className="fa-stack-1x"
        style={styles.centerIcon}
      />
    </span>
  );
}

KeepWorkingBadge.propTypes = {
  showBorder: PropTypes.bool,
  style: PropTypes.object
};

function AssessmentBadge({style}) {
  return (
    <span className="fa-stack" style={{...styles.container, ...style}}>
      <FontAwesome
        icon="circle"
        className="fa-stack-2x"
        style={{color: color.purple}}
      />
      <FontAwesome
        icon="circle-thin"
        className="fa-stack-2x"
        style={styles.border}
      />
      <FontAwesome
        icon="check"
        className="fa-stack-1x"
        style={styles.centerIcon}
      />
    </span>
  );
}

AssessmentBadge.propTypes = {
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

export default BubbleBadge;
