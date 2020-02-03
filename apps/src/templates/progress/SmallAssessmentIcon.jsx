import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import FontAwesome from '../FontAwesome';

/**
 * Icon that indicates an assessment on ProgressBubbles and ProgressPills
 */

const styles = {
  iconContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 10
  },
  iconContainerDiamond: {
    position: 'absolute',
    top: -14,
    right: 2,
    fontSize: 10,
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
  },
  assessmentIconBackground: {
    color: color.purple
  },
  assessmentIconBorder: {
    color: color.white
  },
  assessmentIconCheck: {
    color: color.white
  }
};

export class SmallAssessmentIcon extends React.Component {
  static propTypes = {
    isDiamond: PropTypes.bool
  };

  render() {
    return (
      <span
        className="fa-stack"
        style={
          this.props.isDiamond
            ? styles.iconContainerDiamond
            : styles.iconContainer
        }
      >
        <FontAwesome
          icon="circle"
          className="fa-stack-2x"
          style={styles.assessmentIconBackground}
        />
        <FontAwesome
          icon="circle-thin"
          className="fa-stack-2x"
          style={styles.assessmentIconBorder}
        />
        <FontAwesome
          icon="check"
          className="fa-stack-1x"
          style={styles.assessmentIconCheck}
        />
      </span>
    );
  }
}
