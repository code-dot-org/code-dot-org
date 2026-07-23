/**
 * A collection of components for displaying the purple header used in a few
 * places in our apps. The parent component is a PaneHeader that can be toggled
 * as focused or not. We then have child components of PaneSection and PaneButton.
 */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {forwardRef} from 'react';

import moduleStyles from './pane-header.module.scss';

/**
 * The pane header shared across several of our apps. Renders a styled div and
 * forwards any remaining props (id, dir, ...) onto it.
 */
class PaneHeader extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
  };

  render() {
    let {style, className, ...props} = this.props;

    return (
      <div
        {...props}
        className={classNames(moduleStyles.paneHeader, className)}
        style={style}
      />
    );
  }
}

/**
 * A section of our Pane Header. Essentially this is just a div with some
 * particular styles applied. Continuing to wrap with radium because some usage
 * of this component may depend on it.
 */
export const PaneSection = forwardRef((props, ref) => (
  <div
    {...props}
    ref={ref}
    className={classNames(moduleStyles.paneSection, props.className)}
  />
));
PaneSection.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
};

/**
 * A button within or PaneHeader, whose styles change whether or not the pane
 * has focus. Continuing to wrap with radium because some usage
 * of this component may depend on it.
 */
export const PaneButton = function (props) {
  const {
    isPressed,
    pressedLabel,
    iconProps,
    icon,
    label,
    isDisabled,
    ariaLabel,
    onClick,
    id,
    style,
    className,
  } = props;

  const buttonLabel = isPressed ? pressedLabel : label;

  return (
    <MuiButton
      className={className}
      disabled={isDisabled}
      id={id}
      onClick={onClick}
      aria-label={ariaLabel}
      startIcon={icon ?? (iconProps && <FontAwesomeV6Icon {...iconProps} />)}
      variant="outlined"
      color="secondary"
      size="extraSmall"
      style={style}
    >
      {buttonLabel}
    </MuiButton>
  );
};
PaneButton.propTypes = {
  headerHasFocus: PropTypes.bool.isRequired,
  iconProps: PropTypes.object,
  icon: PropTypes.node,
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  isRtl: PropTypes.bool.isRequired,
  leftJustified: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isPressed: PropTypes.bool,
  pressedLabel: PropTypes.string,
  onClick: PropTypes.func,
  isLegacyStyles: PropTypes.bool,
  isMinecraft: PropTypes.bool,
  id: PropTypes.string,
  style: PropTypes.object,
  ariaLabel: PropTypes.string,
};

// Continuing to wrap with radium because some usage of this component may depend on it.
export default PaneHeader;
