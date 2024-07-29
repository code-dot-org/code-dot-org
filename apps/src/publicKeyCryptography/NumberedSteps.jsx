/** Auto-numbered table of arbitrary components, used for character steps */
import PropTypes from 'prop-types';
import React from 'react';

import {LINE_HEIGHT} from './style';
import {AnyChildren} from './types';

const style = {
  td: {
    verticalAlign: 'top',
    // lineHeight does not get the automatic 'px' suffix
    // see https://facebook.github.io/react/tips/style-props-value-px.html
    lineHeight: `${LINE_HEIGHT}px`,
    paddingBottom: 8,
  },
  subStep: {
    fontWeight: 'normal',
  },
  heading: {
    fontSize: 'larger',
    fontWeight: 'bold',
    marginTop: 10,
  },
  subheading: {
    fontStyle: 'italic',
    marignBottom: 10,
  },
};

/**
 * Custom 'ordered list' implementation with layout for the crypto widget.
 * @param {number} [start] - if provided, starts numbering at this value.
 *        Defaults to "1."
 * @param children - List item contents.
 */
export default function NumberedSteps({start = 1, children}) {
  return (
    <table>
      <tbody>
        {React.Children.map(children, (child, index) =>
          React.cloneElement(child, {index: index + (start - 1)})
        )}
      </tbody>
    </table>
  );
}
NumberedSteps.propTypes = {
  start: PropTypes.number,
  children: AnyChildren,
};

/**
 * Replacement for a 'div' in a NumberedSteps list.
 * Accepts a 'requires' prop that takes a value - if falsy, the step will
 * be faded out.
 */
export function Step(props) {
  const isStepEnabled = Object.prototype.hasOwnProperty.call(props, 'requires')
    ? props.requires
    : true;
  const trStyle = {
    transition: 'opacity 0.5s',
    opacity: isStepEnabled ? 1 : 0.2,
  };
  return (
    <tr style={trStyle}>
      <td style={style.td}>{props.index + 1 + ')'}</td>
      <td style={style.td}>{props.children}</td>
    </tr>
  );
}
Step.propTypes = {
  index: PropTypes.number,
  children: AnyChildren,
  requires: PropTypes.bool,
};
Step.defaultProps = {
  index: 0,
};

/**
 * A styled list item for use within a step.
 */
export function SubStep({text}) {
  return <li style={style.subStep}>{text}</li>;
}
SubStep.propTypes = {
  text: PropTypes.string.isRequired,
};

export function Heading({text}) {
  return <div style={style.heading}>{text}</div>;
}
Heading.propTypes = {
  text: PropTypes.string.isRequired,
};

export function Subheading({text}) {
  return <div style={style.subheading}>{text}</div>;
}
Subheading.propTypes = {...Heading.propTypes};
