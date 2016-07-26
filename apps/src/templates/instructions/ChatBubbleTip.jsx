import React from 'react';
import Radium from 'radium';
import color from '../../color';

const ChatBubbleTip = ({ color, background }) => {
  background = background || 'white';
  color = color || background;

  const styles = {
    svg: {
      position: 'absolute',
      left: -24,
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
      <polyline points="25,25 5,25 25,5" style={styles.polyline} strokeDasharray="3,3"></polyline>
    </svg>
  );
};

ChatBubbleTip.propTypes = {
  color: React.PropTypes.string,
  background: React.PropTypes.string
};

export default Radium(ChatBubbleTip);
