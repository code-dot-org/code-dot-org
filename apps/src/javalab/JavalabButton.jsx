import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

// TODO: This component should be refactored to use <Button/> (apps/src/templates/Button.jsx).
// In order for that to work, we will need to refactor <Button/> to allow a button's icon and
// text to be vertically stacked.
function JavalabButton({icon, text, className, style, onClick, isHorizontal}) {
  let textStyle = {};
  if (icon) {
    textStyle = isHorizontal
      ? styles.horizontalPadding
      : styles.verticalPadding;
  }

  return (
    <button
      type="button"
      className={className}
      style={{
        ...styles.button,
        ...(isHorizontal && styles.horizontal),
        ...style
      }}
      onClick={onClick}
    >
      {icon}
      {text && <div style={textStyle}>{text}</div>}
    </button>
  );
}

export default Radium(JavalabButton);

JavalabButton.propTypes = {
  icon: PropTypes.node,
  text: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  isHorizontal: PropTypes.bool
};

JavalabButton.defaultProps = {
  isHorizontal: false
};

const styles = {
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: color.white
  },
  horizontal: {
    flexDirection: 'row'
  },
  verticalPadding: {
    paddingTop: 5
  },
  horizontalPadding: {
    paddingLeft: 8
  }
};
