/**
 * New style button.
 * This particular button is designed to operate in contexts where we have a solid
 * background. When we're a button on top of an image, we may want something different.
 */

import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from "@cdo/apps/util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const ButtonColor = {
  orange: 'orange',
  gray: 'gray',
  blue: 'blue',
  white: 'white',
  red: 'red',
};

const ButtonSize = {
  default: 'default',
  large: 'large',
};

const styles = {
  main: {
    display: 'inline-block',
    fontSize: 12,
    fontFamily: '"Gotham 4r", sans-serif',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadiusTopLeft: 3,
    borderRadiusTopRight: 3,
    borderRadiusBottomLeft: 3,
    borderRadiusBottomRight: 3,
    textDecoration: 'none',
    borderColor: color.border_gray,
    ':hover': {
      backgroundColor: color.white,
      cursor: 'pointer',
    },
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  icon: {
    marginRight: 5,
  },
  colors: {
    [ButtonColor.orange]: {
      color: 'white',
      backgroundColor: color.orange,
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.63)',
      ':hover': {
        color: color.orange,
        borderColor: color.orange,
      },
      ':disabled': {
        // This color is in Mike's styleguide, but we don't use it anywhere else,
        // and it might be changed by Mark soon - so just hard-coding the string.
        backgroundColor: '#FFD27F',
        boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.1)',
      }
    },
    [ButtonColor.gray]: {
      color: color.charcoal,
      backgroundColor: color.lightest_gray,
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.73)',
      ':disabled': {
        backgroundColor: color.lighter_gray,
        boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.1)',
      }
    },
    [ButtonColor.blue]: {
      color: color.white,
      backgroundColor: color.cyan,
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.40)',
      ':hover': {
        boxShadow: 'none',
        color: color.cyan,
        borderColor: color.cyan,
        backgroundColor: color.lightest_cyan
      }
    },
    [ButtonColor.white]: {
      color: color.charcoal,
      backgroundColor: color.white,
      boxShadow: 'inset 0 2px 0 0 rgba(0,0,0,0.06)',
      ':hover': {
        boxShadow: 'none',
        backgroundColor: color.lightest_gray
      }
    },
    [ButtonColor.red]: {
      color: color.white,
      backgroundColor: color.red,
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.40)',
      ':hover': {
        boxShadow: 'none',
        color: color.red,
        borderColor: color.red,
      }
    },
  },
  sizes: {
    [ButtonSize.default]: {
      height: 34,
      paddingLeft: 24,
      paddingRight: 24,
      lineHeight: '34px'
    },
    [ButtonSize.large]: {
      height: 40,
      paddingLeft: 30,
      paddingRight: 30,
      lineHeight: '40px'
    },
  },
};

const Button = React.createClass({
  propTypes: {
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
  },

  render() {
    const { className, href, text, icon, iconClassName, iconStyle, target,
      style, onClick, disabled, id } = this.props;

    const color = this.props.color || ButtonColor.orange;
    const size = this.props.size || ButtonSize.default;

    if (!href && !onClick) {
      throw new Error('Expect at least one of href/onClick');
    }

    const Tag = href ? 'a' : 'div';

    return (
      <Tag
        className={className}
        style={[styles.main, styles.colors[color], styles.sizes[size], style]}
        href={href}
        target={target}
        disabled={disabled}
        onClick={disabled ? null : onClick}
        id={id}
      >
        <div>
          {icon &&
            <FontAwesome
              icon={icon}
              className={iconClassName}
              style={{...styles.icon, ...iconStyle}}
            />
          }
          {text}
        </div>
      </Tag>
    );
  }
});

Button.ButtonColor = ButtonColor;
Button.ButtonSize = ButtonSize;

export default Radium(Button);
