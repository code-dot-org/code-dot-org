/** Auto-numbered table of arbitrary components, used for character steps */
import React from 'react';
import {AnyChildren} from './types';
import {LINE_HEIGHT} from './style';

const style = {
  td: {
    verticalAlign: 'top',
    // lineHeight does not get the automatic 'px' suffix
    // see https://facebook.github.io/react/tips/style-props-value-px.html
    lineHeight: `${LINE_HEIGHT}px`,
    paddingBottom: 8
  },
  subStep: {
    fontWeight: 'normal'
  }
};

export default function NumberedSteps(props) {
  return (
    <table>
      <tbody>
        {React.Children.map(props.children, (child, index) => React.cloneElement(child, {index}))}
      </tbody>
    </table>);
}
NumberedSteps.propTypes = {
  children: AnyChildren
};

/**
 * Replacement for a 'div' in a NumberedSteps list.
 * Accepts a 'requires' prop that takes a value - if falsy, the step will
 * be faded out.
 */
export function Step(props) {
  const isStepEnabled = props.hasOwnProperty('requires') ? props.requires : true;
  const trStyle = {
    transition: 'opacity 0.5s',
    opacity: isStepEnabled ? 1 : 0.2
  };
  return (
    <tr style={trStyle}>
      <td style={style.td}>{(props.index + 1) + ')'}</td>
      <td style={style.td}>{props.children}</td>
    </tr>);
}
Step.propTypes = {
  index: React.PropTypes.number,
  children: AnyChildren,
  requires: React.PropTypes.bool
};
Step.defaultProps = {
  index: 0
};

/**
 * A styled list item for use within a step.
 */
export function SubStep({text}) {
  return (
    <li style={style.subStep}>
      {text}
    </li>
  );
}
SubStep.propTypes = {
  text: React.PropTypes.string.isRequired
};
