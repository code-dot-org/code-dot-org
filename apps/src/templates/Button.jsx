/**
 * New style button.
 * This particular button is designed to operate in contexts where we have a solid
 * background. When we're a button on top of an image, we may want something different.
 */
import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const ButtonColor = {
  orange: 'orange',
  gray: 'gray',
  blue: 'blue',
  white: 'white',
  red: 'red',
  green: 'green'
};

const ButtonSize = {
  default: 'default',
  large: 'large',
  narrow: 'narrow'
};

const ButtonHeight = {
  default: 34,
  large: 40,
  narrow: 40
};

const styles = {
  main: {
    display: 'inline-block',
    fontSize: 12,
    fontFamily: '"Gotham 4r", sans-serif',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.border_gray,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    textDecoration: 'none',
    ':hover': {
      backgroundColor: color.white,
      cursor: 'pointer'
    },
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  updated: {lineHeight: '12px'},
  icon: {
    marginRight: 5
  },
  colors: {
    [ButtonColor.orange]: {
      color: 'white',
      backgroundColor: color.orange,
      fontWeight: 'bold',
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.63)',
      ':hover': {
        color: color.orange,
        borderColor: color.orange
      },
      ':disabled': {
        // This color is in Mike's styleguide, but we don't use it anywhere else,
        // and it might be changed by Mark soon - so just hard-coding the string.
        backgroundColor: '#FFD27F',
        boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.1)'
      }
    },
    [ButtonColor.gray]: {
      color: color.charcoal,
      backgroundColor: color.lightest_gray,
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.73)',
      ':disabled': {
        backgroundColor: color.lighter_gray,
        boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.1)'
      }
    },
    [ButtonColor.blue]: {
      color: color.white,
      backgroundColor: color.cyan,
      fontWeight: 'bold',
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.40)',
      ':hover': {
        boxShadow: 'none',
        color: color.cyan,
        borderColor: color.cyan,
        backgroundColor: color.lightest_cyan
      },
      ':disabled': {
        color: color.lighter_cyan,
        backgroundColor: color.lightest_cyan,
        boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.1)'
      }
    },
    [ButtonColor.white]: {
      color: color.charcoal,
      backgroundColor: color.white,
      boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.06)',
      ':hover': {
        boxShadow: 'none',
        backgroundColor: color.lightest_gray
      },
      ':disabled': {
        backgroundColor: color.lightest_gray,
        boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.1)'
      }
    },
    [ButtonColor.red]: {
      color: color.white,
      backgroundColor: color.red,
      fontWeight: 'bold',
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.40)',
      ':hover': {
        boxShadow: 'none',
        color: color.red,
        borderColor: color.red
      },
      ':disabled': {
        backgroundColor: color.lightest_red,
        boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.1)'
      }
    },
    [ButtonColor.green]: {
      color: color.white,
      backgroundColor: color.level_perfect,
      fontWeight: 'bold',
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.40)',
      ':hover': {
        boxShadow: 'none',
        color: color.charcoal,
        borderColor: color.lightest_gray,
        backgroundColor: color.lightest_gray
      },
      ':disabled': {
        backgroundColor: color.lightest_gray,
        boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.1)'
      }
    }
  },
  sizes: {
    [ButtonSize.default]: {
      height: ButtonHeight.default,
      paddingLeft: 24,
      paddingRight: 24,
      lineHeight: '34px'
    },
    [ButtonSize.large]: {
      height: ButtonHeight.large,
      paddingLeft: 30,
      paddingRight: 30,
      lineHeight: '40px'
    },
    [ButtonSize.narrow]: {
      height: ButtonHeight.narrow,
      paddingLeft: 10,
      paddingRight: 10,
      lineHeight: '40px'
    }
  }
};

class Button extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    href: PropTypes.string,
    text: PropTypes.string.isRequired,
    size: PropTypes.oneOf(Object.keys(ButtonSize)),
    color: PropTypes.oneOf(Object.keys(ButtonColor)),
    icon: PropTypes.string,
    iconClassName: PropTypes.string,
    iconStyle: PropTypes.object,
    target: PropTypes.string,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    id: PropTypes.string,
    tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isPending: PropTypes.bool,
    pendingText: PropTypes.string,
    __useDeprecatedTag: PropTypes.bool
  };

  onKeyDown = event => {
    const {href, disabled, onClick} = this.props;
    if (event.key === 'Enter' && !disabled && !href) {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    }
  };

  render() {
    const {
      className,
      href,
      text,
      icon,
      iconClassName,
      iconStyle,
      target,
      style,
      onClick,
      disabled,
      id,
      tabIndex,
      isPending,
      pendingText,
      __useDeprecatedTag
    } = this.props;

    const color = this.props.color || ButtonColor.orange;
    const size = this.props.size || ButtonSize.default;

    if (!href && !onClick) {
      throw new Error('Expect at least one of href/onClick');
    }

    let Tag = 'button';
    if (__useDeprecatedTag) {
      Tag = href ? 'a' : 'div';
    }

    const sizeStyle = __useDeprecatedTag
      ? styles.sizes[size]
      : {...styles.sizes[size], ...styles.updated};

    return (
      <Tag
        className={className}
        style={[styles.main, styles.colors[color], sizeStyle, style]}
        href={disabled ? 'javascript:void(0);' : href}
        target={target}
        disabled={disabled}
        onClick={disabled ? null : onClick}
        onKeyDown={this.onKeyDown}
        tabIndex={tabIndex}
        id={id}
      >
        <div style={_.pick(style, ['textAlign'])}>
          {icon && (
            <FontAwesome
              icon={icon}
              className={iconClassName}
              style={{...styles.icon, ...iconStyle}}
            />
          )}
          {isPending && pendingText && (
            <span>
              {pendingText}&nbsp;
              <FontAwesome icon="spinner" className="fa-spin" />
            </span>
          )}
          {!isPending && text}
        </div>
      </Tag>
    );
  }
}

Button.ButtonColor = ButtonColor;
Button.ButtonSize = ButtonSize;
Button.ButtonHeight = ButtonHeight;

export default Radium(Button);
