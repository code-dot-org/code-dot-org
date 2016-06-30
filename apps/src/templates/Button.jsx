import React from 'react';
import Radium from 'radium';

import msg from '../locale';
import color from '../color';

const ARROW_WIDTH = 58;
const ARROW_HEIGHT = ARROW_WIDTH * 2;
const style = {
  base: {
    borderWidth: 2,
    borderStyle: 'solid',
    minWidth: 100,
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
    top: (ARROW_HEIGHT - style.base.borderWidth - 10 * 2 - 44)/2,
    margin: 0,
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
      borderColor: color.lightest_gray,
      color: color.black,
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

const BaseButton = Radium(function BaseButton(props) {
  const sizeStyle = style[props.size || 'normal'];
  const config = BUTTON_TYPES[props.type];
  let styleArray = [style.base, config.style, sizeStyle];
  return (
    <button {...props} style={[styleArray, props.style]}>
      {props.children}
    </button>
  );
});
BaseButton.propTypes = {
  type: React.PropTypes.oneOf(Object.keys(BUTTON_TYPES)),
  children: React.PropTypes.node,
  size: React.PropTypes.oneOf(['normal', 'large']),
};

const ArrowButton = Radium(function ArrowButton(props) {
  const config = BUTTON_TYPES[props.type];
  if (process.env.NODE_ENV === 'development') {
    if (!props.size === 'large') {
      throw new Error(
        `Arrows can only be used with large buttons. This button is "${props.size}" can't use arrows.`
      );
    }
  }
  return (
    <div style={[style.arrow.base,
                 style.arrow[props.arrow]]}>
      <div style={[style.arrowHead.base,
                   style.arrowHead[props.arrow](config.style.backgroundColor)]}/>
      <BaseButton {...props} style={[
        style.withArrow.base,
        style.withArrow[props.arrow],
      ]}/>
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
