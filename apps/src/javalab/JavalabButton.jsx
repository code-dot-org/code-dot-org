import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

export default function JavalabButton({icon, text, style, onClick}) {
  return (
    <button
      type="button"
      style={{...styles.button, ...style}}
      onClick={onClick}
    >
      {icon}
      {text && <div style={styles.text}>{text}</div>}
    </button>
  );
}
JavalabButton.propTypes = {
  icon: PropTypes.node,
  text: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func.isRequired
};

const styles = {
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: color.white
  },
  text: {
    paddingTop: 5
  }
};
