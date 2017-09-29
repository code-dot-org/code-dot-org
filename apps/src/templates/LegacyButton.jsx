import React, {PropTypes} from 'react';
import Radium from 'radium';

import color from "../util/color";

/**
 * This file at one point represented our "default" button component. It has since
 * become outdated, and thus has been renamed to LegacyButton. New buttons should use
 * templates/Button.jsx
 */

const ARROW_WIDTH = 58;
const ARROW_HEIGHT = ARROW_WIDTH * 2;
const ARROW_BUTTON_HEIGHT = 44; // originally from common.scss .arrow-text rule
const ARROW_BUTTON_PADDING = 10; // originally from common.scss .arrow-left .arrow-text rule
export const style = {
  base: {
    borderWidth: 1,
    borderStyle: 'solid',
    minWidth: 100,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    ':hover': {
      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)'
    },
  },
  large: {
    fontSize: 35,
    lineHeight: 'normal',
    paddingLeft: 14,
    paddingRight: 14,
  },
  arrow: {
    base: {
      position: 'relative',
      height: ARROW_HEIGHT,
      textAlign: 'left',
      display: 'inline-block',
    },
    left: {
      paddingLeft: ARROW_WIDTH,
    },
    right: {
      paddingRight: ARROW_WIDTH,
    },
  },
  arrowHead: {
    base: {
      position: 'absolute',
      width: 0,
      height: 0,
      borderColor: 'transparent',
      borderWidth: ARROW_WIDTH,
      borderStyle: 'solid',
    },
    left: color => ({
      left: 10 - ARROW_WIDTH,
      borderRightColor: color,
    }),
    right: color => ({
      right: 10 - ARROW_WIDTH,
      borderLeftColor: color,
    }),
  },
};

style.withArrow = {
  base: {
    position: 'relative',
    top: (ARROW_HEIGHT - style.base.borderWidth - ARROW_BUTTON_PADDING * 2 - ARROW_BUTTON_HEIGHT)/2,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    ':hover': {
      boxShadow: 'none',
    },
  },
  left: {
    paddingLeft: 0,
  },
  right: {
    paddingRight: 0,
  },
};

function buttonStyle(buttonColor, textColor=color.white) {
  return {
    backgroundColor: buttonColor,
    borderColor: buttonColor,
    color: textColor,
  };
}

export const BUTTON_TYPES = {
  default: {
    style: {
      backgroundColor: color.white,
      borderColor: color.charcoal,
      color: color.charcoal,
    },
  },
  cancel: {
    style: buttonStyle(color.green),
  },
  primary: {
    style: buttonStyle(color.orange),
  },
  danger: {
    style: buttonStyle(color.red),
  },
  action: {
    style: buttonStyle(color.purple),
  },
};

const BaseButton = Radium(function BaseButton({type, children, size, ...props}) {
  const sizeStyle = style[size || 'normal'];
  const config = BUTTON_TYPES[type];
  let styleArray = [style.base, config.style, sizeStyle];
  return (
    <button {...props} style={[styleArray, props.style]}>
      {children}
    </button>
  );
});
BaseButton.propTypes = {
  type: PropTypes.oneOf(Object.keys(BUTTON_TYPES)),
  children: PropTypes.node,
  size: PropTypes.oneOf(['normal', 'large']),
};

const ArrowButton = Radium(function ArrowButton({arrow, ...props}) {
  const config = BUTTON_TYPES[props.type];
  if (process.env.NODE_ENV === 'development') {
    if (!props.size === 'large') {
      throw new Error(`This "${props.size}" button can't use arrows.`);
    }
  }
  return (
    <div
      style={[
        style.arrow.base,
        style.arrow[arrow],
        props.style
      ]}
    >
      <div
        style={[
          style.arrowHead.base,
          style.arrowHead[arrow](config.style.backgroundColor)
        ]}
      />
      <BaseButton
        {...props}
        style={[
          style.withArrow.base,
          style.withArrow[arrow]
        ]}
      />
    </div>
  );
});
ArrowButton.propTypes = Object.assign({}, BaseButton.propTypes, {
  arrow: PropTypes.oneOf(['left', 'right']).isRequired,
});

const LegacyButton = Radium(function Button(props) {
  if (props.arrow) {
    return <ArrowButton {...props} />;
  } else {
    return <BaseButton {...props} />;
  }
});
LegacyButton.propTypes = Object.assign({}, BaseButton.propTypes, {
  arrow: PropTypes.oneOf(['left', 'right']),
});

export default LegacyButton;
