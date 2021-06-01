import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

// TODO: This component should be refactored to use <Button/> (apps/src/templates/Button.jsx).
// In order for that to work, we will need to refactor <Button/> to allow a button's icon and
// text to be vertically stacked.
export default function JavalabButton({
  icon,
  text,
  style,
  onClick,
  isHorizontal
}) {
  return (
    <button
      type="button"
      style={{...styles.button, ...style}}
      onClick={onClick}
    >
      {icon}
      {text && (
        <div style={icon && !isHorizontal ? styles.padding : {}}>{text}</div>
      )}
    </button>
  );
}
JavalabButton.propTypes = {
  icon: PropTypes.node,
  text: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  isHorizontal: PropTypes.bool
};

const styles = {
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: color.white
  },
  padding: {
    paddingTop: 5
  }
};
