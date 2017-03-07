/**
 * New style button. Eventually we'd like to have this used more broadly (at which
 * point it should be renamed to something more generic)
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
  white: 'white'
};

const ButtonSize = {
  default: 'default',
  large: 'large'
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
    overflow: 'hidden'
  },
  icon: {
    marginRight: 5
  },
  colors: {
    [ButtonColor.orange]: {
      color: 'white',
      backgroundColor: color.orange,
      boxShadow: 'inset 0 2px 0 0 rgba(255,255,255,0.63)',
      ':hover': {
        color: color.orange,
        borderColor: color.orange,
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
    }
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
    }
  },
};

const ProgressButton = React.createClass({
  propTypes: {
    href: PropTypes.string,
    text: PropTypes.string.isRequired,
    size: PropTypes.oneOf(Object.keys(ButtonSize)),
    color: PropTypes.oneOf(Object.keys(ButtonColor)),
    icon: PropTypes.string,
    target: PropTypes.string,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    onClick: PropTypes.func
  },

  render() {
    const { href, text, icon, target, style, onClick, disabled } = this.props;

    const color = this.props.color || ButtonColor.orange;
    const size = this.props.size || ButtonSize.default;

    if (!!href === !!onClick) {
      throw new Error('Expect exactly one of href/onClick');
    }

    const Tag = href ? 'a' : 'div';

    return (
      <Tag
        style={[styles.main, styles.colors[color], styles.sizes[size], style]}
        href={href}
        target={target}
        disabled={disabled}
        onClick={onClick}
      >
        {icon && <FontAwesome icon={icon} style={styles.icon}/>}
        {text}
      </Tag>
    );
  }
});

ProgressButton.ButtonColor = ButtonColor;
ProgressButton.ButtonSize = ButtonSize;

export default Radium(ProgressButton);
