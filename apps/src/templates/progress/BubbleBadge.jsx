import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import FontAwesome from '../FontAwesome';

/**
 * Icon that indicates an assessment on ProgressBubbles and ProgressPills
 */

const badgeTypes = ['assessment', 'keepWorking'];

function BubbleBadge({type, isDiamond}) {
  let backgroundColor, icon;

  if (type === 'assessment') {
    backgroundColor = color.purple;
    icon = 'check';
  } else {
    backgroundColor = color.red;
    icon = 'exclamation';
  }

  const position = isDiamond
    ? styles.diamondBubblePosition
    : styles.bubblePosition;

  return (
    <span className="fa-stack" style={{...styles.container, ...position}}>
      <FontAwesome
        icon="circle"
        className="fa-stack-2x"
        style={{color: backgroundColor}}
      />
      <FontAwesome
        icon="circle-thin"
        className="fa-stack-2x"
        style={styles.border}
      />
      <FontAwesome
        icon={icon}
        className="fa-stack-1x"
        style={styles.centerIcon}
      />
    </span>
  );
}

BubbleBadge.propTypes = {
  type: PropTypes.oneOf(badgeTypes).isRequired,
  isDiamond: PropTypes.bool
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
