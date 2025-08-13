/**
 * A collection of components for displaying the purple header used in a few
 * places in our apps. The parent component is a PaneHeader that can be toggled
 * as focused or not. We then have child components of PaneSection and PaneButton.
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';

import styles from '../p5lab/AnimationPicker/styles';

import moduleStyles from './pane-header.module.scss';
import commonStyles from '../common-styles.module.scss';

/**
 * A purple pane header that can have be focused (purple) or unfocused (light purple).
 */
class PaneHeader extends React.Component {
  static propTypes = {
    hasFocus: PropTypes.bool.isRequired,
    style: PropTypes.object,
    // TODO: [Phase 2] Need to maintain legacy styling for Javalab now.
    //  Once Javalab receives rebranded styles - remove this prop and all of it's usage in the project
    //  More info here: https://github.com/code-dot-org/code-dot-org/pull/50895
    isOldPurpleColor: PropTypes.bool,
    teacherOnly: PropTypes.bool,
    isMinecraft: PropTypes.bool,
    className: PropTypes.string,
  };

  render() {
    let {
      hasFocus,
      isOldPurpleColor,
      teacherOnly,
      style,
      isMinecraft,
      className,
      ...props
    } = this.props;

    const mainStyle = isOldPurpleColor
      ? commonStyles.purpleHeader
      : commonStyles.darkHeader;
    const unFocusedStyle = isOldPurpleColor
      ? commonStyles.purpleHeaderUnfocused
      : commonStyles.darkHeaderUnfocused;

    return (
      <div
        {...props}
        className={classNames(
          // TODO: AnimationTab should likely use components from PaneHeader, at
          // which point purpleHeader style should move in here.
          mainStyle,
          !hasFocus && unFocusedStyle,
          teacherOnly && commonStyles.teacherBlueHeader,
          teacherOnly && !hasFocus && commonStyles.teacherHeaderUnfocused,
          isMinecraft && commonStyles.minecraftHeader,
          className
        )}
        style={style}
      />
    );
  }
}

function sanitizedProps(props) {
  const sanitized = {...props};
  delete sanitized.styleKeeperContext;
  delete sanitized.radiumConfigContext;
  return sanitized;
}

/**
 * A section of our Pane Header. Essentially this is just a div with some
 * particular styles applied. Continuing to wrap with radium because some usage
 * of this component may depend on it.
 */
export const PaneSection = Radium(
  class extends React.Component {
    static propTypes = {
      style: PropTypes.object,
      className: PropTypes.string,
    };

    render() {
      return (
        <div
          {...sanitizedProps(this.props)}
          ref={root => (this.root = root)}
          style={this.props.style}
          className={classNames(moduleStyles.paneSection, this.props.className)}
        />
      );
    }
  }
);

/**
 * A button within or PaneHeader, whose styles change whether or not the pane
 * has focus. Continuing to wrap with radium because some usage
 * of this component may depend on it.
 */
export const PaneButton = Radium(function (props) {
  const {
    isRtl,
    isPressed,
    pressedLabel,
    iconClass,
    hiddenImage,
    label,
    leftJustified,
    isLegacyStyles,
    isMinecraft,
    headerHasFocus,
    isDisabled,
    ariaLabel,
    onClick,
    id,
    style,
    className,
  } = props;

  const buttonLabel = isPressed ? pressedLabel : label;
  const iconOrLabelHidden = !buttonLabel || (!iconClass && !hiddenImage);

  const iconClassNames = classNames(
    moduleStyles.headerButtonIcon,
    isRtl && moduleStyles.headerButtonIconRtl,
    iconOrLabelHidden && moduleStyles.headerButtonIconOrLabelHidden
  );

  // TODO: [Phase 2] Need to maintain legacy styling for Javalab now.
  //  Once Javalab receives rebranded styles - remove this switch
  //  and use simpler moduleStyles call as it was before this commit
  //  More info here: https://github.com/code-dot-org/code-dot-org/pull/50895
  const buttonStylesRoot = isLegacyStyles
    ? 'legacyHeaderButton'
    : 'headerButton';

  const buttonClassNames = classNames(
    moduleStyles[buttonStylesRoot],
    isRtl !== !!leftJustified && moduleStyles[`${buttonStylesRoot}Rtl`],
    isMinecraft && moduleStyles[`${buttonStylesRoot}Minecraft`],
    isPressed && moduleStyles[`${buttonStylesRoot}Pressed`],
    !headerHasFocus && moduleStyles[`${buttonStylesRoot}Unfocused`],
    isDisabled && moduleStyles[`${buttonStylesRoot}Disabled`],
    className
  );

  // There are specific styles for Minecraft lab (some rules with !important from external package)
  // so in order not to break Minecraft labs, it's better to leave PaneButton a div
  const Tag = isMinecraft ? 'div' : 'button';
  const tagSpecificProps = isMinecraft ? {role: 'button'} : {type: 'button'};

  function renderIcon() {
    const {iconClass, icon} = props;

    if (iconClass) {
      return <i className={classNames(iconClass, iconClassNames)} />;
    }

    if (icon) {
      const Icon = icon.type;
      return (
        <Icon
          {...icon.props}
          className={iconClassNames}
          style={icon.props.style}
        >
          {icon.props.children}
        </Icon>
      );
    }
  }

  function onKeyDownWrapper(event) {
    const {onClick} = props;
    if (
      event.key === ' ' ||
      event.key === 'Enter' ||
      event.key === 'Spacebar'
    ) {
      onClick();
    }
  }

  return (
    <Tag
      {...tagSpecificProps}
      className={buttonClassNames}
      disabled={isDisabled}
      tabIndex="0"
      id={id}
      style={style}
      onKeyDown={onKeyDownWrapper}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className={moduleStyles.headerButtonSpan}>
        {hiddenImage}
        {renderIcon()}
        <span style={styles.noPadding}>{buttonLabel}</span>
      </span>
    </Tag>
  );
});
PaneButton.propTypes = {
  headerHasFocus: PropTypes.bool.isRequired,
  iconClass: PropTypes.string,
  icon: PropTypes.element,
  label: PropTypes.string.isRequired,
  isRtl: PropTypes.bool.isRequired,
  leftJustified: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isPressed: PropTypes.bool,
  pressedLabel: PropTypes.string,
  onClick: PropTypes.func,
  hiddenImage: PropTypes.element,
  isLegacyStyles: PropTypes.bool,
  isMinecraft: PropTypes.bool,
  id: PropTypes.string,
  style: PropTypes.object,
  ariaLabel: PropTypes.string,
};

// Continuing to wrap with radium because some usage of this component may depend on it.
export default Radium(PaneHeader);
