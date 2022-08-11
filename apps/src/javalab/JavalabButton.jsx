import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import stylez from './javalab-button.module.scss';
import color from '@cdo/apps/util/color';

// TODO: This component should be refactored to use <Button/> (apps/src/templates/Button.jsx).
// In order for that to work, we will need to refactor <Button/> to allow a button's icon and
// text to be vertically stacked.
export default function JavalabButton({
  id,
  icon,
  text,
  className,
  style,
  onClick,
  isHorizontal,
  tooltipText,
  isDisabled = false
}) {
  let textStyle = {};
  if (icon) {
    textStyle = isHorizontal
      ? styles.horizontalPadding
      : styles.verticalPadding;
  }

  return (
    <button
      id={id}
      type="button"
      className={classNames(
        stylez.button,
        isHorizontal && stylez.buttonHorizontal,
        className
      )}
      style={{
        ...style,
        ...(isDisabled && styles.disabled)
      }}
      onClick={onClick}
      disabled={isDisabled}
      title={tooltipText}
    >
      {icon}
      {text && <div style={textStyle}>{text}</div>}
    </button>
  );
}

JavalabButton.propTypes = {
  icon: PropTypes.node,
  text: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  isHorizontal: PropTypes.bool,
  isDisabled: PropTypes.bool,
  id: PropTypes.string,
  tooltipText: PropTypes.string
};

JavalabButton.defaultProps = {
  isHorizontal: false
};

const styles = {
  disabled: {
    backgroundColor: color.light_gray,
    borderColor: color.light_gray,
    cursor: 'default'
  },
  verticalPadding: {
    paddingTop: 5
  },
  horizontalPadding: {
    paddingLeft: 8
  }
};
