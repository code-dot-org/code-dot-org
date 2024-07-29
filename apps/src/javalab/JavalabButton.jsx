import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import style from './javalab-button.module.scss';

// TODO: This component should be refactored to use <Button/> (apps/src/templates/Button.jsx).
// In order for that to work, we will need to refactor <Button/> to allow a button's icon and
// text to be vertically stacked.
export default function JavalabButton({
  id,
  icon,
  text,
  className,
  inlineStyle,
  onClick,
  isHorizontal,
  tooltipText,
  isDisabled = false,
}) {
  let textStyle;
  if (icon) {
    textStyle = isHorizontal ? style.horizontalPadding : style.verticalPadding;
  }

  return (
    <button
      id={id}
      type="button"
      className={classNames(
        style.button,
        isHorizontal && style.buttonHorizontal,
        isDisabled && style.disabled,
        className
      )}
      style={inlineStyle}
      onClick={onClick}
      disabled={isDisabled}
      title={tooltipText}
    >
      {icon}
      {text && <div className={textStyle}>{text}</div>}
    </button>
  );
}

JavalabButton.propTypes = {
  icon: PropTypes.node,
  text: PropTypes.string,
  className: PropTypes.string,
  inlineStyle: PropTypes.object,
  onClick: PropTypes.func,
  isHorizontal: PropTypes.bool,
  isDisabled: PropTypes.bool,
  id: PropTypes.string,
  tooltipText: PropTypes.string,
};

JavalabButton.defaultProps = {
  isHorizontal: false,
};
