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
  }
};

export default function NumberedSteps(props) {
  return (
    <table>
      <tbody>
        {React.Children.map(props.children, (child, index) => {
          const stepRequirements = child.props && child.props.requires || [];
          const isStepEnabled = stepRequirements.every(x => x !== null && x !== undefined);
          const trStyle = {
            transition: 'opacity 0.5s',
            opacity: isStepEnabled ? 1 : 0.2
          };
          return (
            <tr style={trStyle}>
              <td style={style.td}>{(index + 1) + ')'}</td>
              <td style={style.td}>{child}</td>
            </tr>);
        })}
      </tbody>
    </table>);
}
NumberedSteps.propTypes = {
  children: AnyChildren
};

/**
 * Replacement for a 'div' in a NumberedSteps list.
 * Accepts a 'requires' prop that takes an array of values.
 * If any of those values are null or undefined, the step will be faded out.
 */
export function Step(props) {
  return <div>{props.children}</div>;
}
Step.propTypes = {
  children: AnyChildren,
  requires: React.PropTypes.arrayOf(React.PropTypes.any)
};
Step.defaultProps = {
  requires: []
};
