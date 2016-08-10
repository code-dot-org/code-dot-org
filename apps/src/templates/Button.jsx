import React from 'react';
import Radium from 'radium';

import msg from '@cdo/locale';
import color from '../color';

const ARROW_WIDTH = 58;
const ARROW_HEIGHT = ARROW_WIDTH * 2;
const ARROW_BUTTON_HEIGHT = 44; // originally from common.scss .arrow-text rule
const ARROW_BUTTON_PADDING = 10; // originally from common.scss .arrow-left .arrow-text rule
const style = {
  base: {
    borderWidth: 1,
    borderStyle: 'solid',
    minWidth: 100,
    margin: 0,
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
    margin: 0,
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

const BUTTON_TYPES = {
  "default": {
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

const ARROW_URLS = {
  left: '/blockly/media/tryagain-arrow-head.png',
  right: '/blockly/media/next-arrow-head.png',
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
  type: React.PropTypes.oneOf(Object.keys(BUTTON_TYPES)),
  children: React.PropTypes.node,
  size: React.PropTypes.oneOf(['normal', 'large']),
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
  arrow: React.PropTypes.oneOf(['left', 'right']).isRequired,
});

const Button = Radium(function Button(props) {
  if (props.arrow) {
    return <ArrowButton {...props} />;
  } else {
    return <BaseButton {...props} />;
  }
});
Button.propTypes = Object.assign({}, BaseButton.propTypes, {
  arrow: React.PropTypes.oneOf(['left', 'right']),
});

export default Button;

if (BUILD_STYLEGUIDE) {
  const docs = {
    "default": 'Use for actions that don\'t need to be the focus of the page',
    cancel: 'Use to cancel an action, e.g. in a modal dialog',
    primary: 'Use to identify primary action in a set of buttons',
    danger: 'Use for destructive actions or actions with serious repercussions, e.g. deleting data',
    action: 'Use to provide differentiated visual weight for secondary actions',
  };

  Button.styleGuideExamples = storybook => {
    storybook
      .storiesOf('Button', module)
      .addWithInfo(
        'overview',
        '',
        () => (
          <div>
            <h1>Intro</h1>
            <p>
              Buttons come in many different shapes and sizes! Some aspects of buttons
              that are worth mentioning:
            </p>
            <ul>
              <li>They have a min width of {`${style.base.minWidth}px`}</li>
              <li>
                They come in a number of different semantic styles:{' '}
                {Object.keys(BUTTON_TYPES).join(', ')}
              </li>
            </ul>
            <h1>Types</h1>
            <table style={{backgroundColor: 'white', textAlign: 'center'}}>
              <tr>
                <th>Type</th>
                <th style={{width: 300}}>Usage</th>
                <th>Appearance</th>
                <th>Large Size</th>
                <th>Left arrow</th>
                <th>Right arrow</th>
              </tr>
              {Object.keys(BUTTON_TYPES).map(type => (
                 <tr key={type}>
                   <td>{type}</td>
                   <td style={{textAlign: 'left'}}>{docs[type]}</td>
                   <td><Button type={type}>{type}</Button></td>
                   <td><Button type={type} size="large">{type}</Button></td>
                   <td>
                     <Button type={type} size="large" arrow="left">{type}</Button>
                   </td>
                   <td>
                     <Button type={type} size="large" arrow="right">{type}</Button>
                   </td>
                 </tr>
               ))}
            </table>
          </div>
        )
      );
  };
}
