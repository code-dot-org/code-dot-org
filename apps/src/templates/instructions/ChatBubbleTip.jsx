import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import styles from './ChatBubbleTip.module.scss';

const ChatBubbleTip = ({isRtl, color, background, isDashed}) => {
  background = background || 'white';
  color = color || 'none';
  isDashed = isDashed || false;

  return (
    <svg
      height="30"
      width="30"
      className={isRtl ? styles.svgRtl : styles.svgLtr}
    >
      <polyline
        points={isRtl ? '6,25 25,25 5,5' : '24,24 5,24 25,5'}
        style={{
          stroke: color,
          strokeWidth: 2,
          fill: background,
          strokeDasharray: isDashed ? '5,5' : '0,0',
        }}
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
})(ChatBubbleTip);
