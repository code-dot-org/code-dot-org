import React, {PropTypes} from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

const ChatBubbleTip = ({ isRtl, color, background }) => {
  background = background || 'white';
  color = color || 'none';

  const styles = {
    svg: {
      position: 'absolute',
      left: isRtl ? undefined : -24,
      right: isRtl ? -24 : undefined,
      bottom: 5
    },
    polyline: {
      stroke: color,
      strokeWidth: 1,
      fill: background
    }
  };

  return (
    <svg height="30" width="30" style={styles.svg}>
      <polyline
        points={isRtl ? "5,25 25,25 5,5" : "25,25 5,25 25,5"}
        style={styles.polyline}
        strokeDasharray="3,3"
      />
    </svg>
  );
};

ChatBubbleTip.propTypes = {
  color: PropTypes.string,
  background: PropTypes.string,
  isRtl: PropTypes.bool.isRequired
};

export default connect(state => {
  return {
    isRtl: state.isRtl,
  };
})(Radium(ChatBubbleTip));
