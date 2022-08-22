import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moduleStyle from './javalab-button.module.scss';

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
  let textStyle;
  if (icon) {
    textStyle = isHorizontal
      ? moduleStyle.horizontalPadding
      : moduleStyle.verticalPadding;
  }

  return (
    <button
      id={id}
      type="button"
      className={classNames(
        moduleStyle.button,
        isHorizontal && moduleStyle.buttonHorizontal,
        isDisabled && moduleStyle.disabled,
        className
      )}
      style={{
        ...style
      }}
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
