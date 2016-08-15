/** Auto-numbered table of arbitrary components, used for character steps */
import React from 'react';
import {AnyChildren} from './types';

const style = {
  td: {
    verticalAlign: 'top'
  }
};

export default function NumberedSteps(props) {
  const tdStyle = Object.assign({}, style.td, {
    // lineHeight does not get the automatic 'px' suffix
    // see https://facebook.github.io/react/tips/style-props-value-px.html
    lineHeight: typeof props.lineHeight === 'number' && `${props.lineHeight}px`
  });
  return (
    <table>
      <tbody>
        {React.Children.map(props.children, (child, index) => (
          <tr>
            <td style={tdStyle}>{(index + 1) + ')'}</td>
            <td style={tdStyle}>{child}</td>
          </tr>
        ))}
      </tbody>
    </table>);
}
NumberedSteps.propTypes = {
  lineHeight: React.PropTypes.number,
  children: AnyChildren
};
