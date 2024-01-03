import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';

const ChatBubbleTip = ({isRtl, color, background, isDashed}) => {
  background = background || 'white';
  color = color || 'none';
  isDashed = isDashed || false;

  const styles = {
    svg: {
      position: 'absolute',
      left: isRtl ? undefined : -24,
      right: isRtl ? -24 : undefined,
      bottom: 5,
    },
    polyline: {
      stroke: color,
      strokeWidth: 2,
      fill: background,
    },
  };

  return (
    <svg height="30" width="30" style={styles.svg}>
      <polyline
        points={isRtl ? '6,25 25,25 5,5' : '24,24 5,24 25,5'}
        style={styles.polyline}
        strokeDasharray={isDashed ? '5,5' : '0,0'}
      />
    </svg>
  );
};

ChatBubbleTip.propTypes = {
  color: PropTypes.string,
  isDashed: PropTypes.bool,
  background: PropTypes.string,
  isRtl: PropTypes.bool.isRequired,
};

export default connect(state => {
  return {
    isRtl: state.isRtl,
  };
})(Radium(ChatBubbleTip));
