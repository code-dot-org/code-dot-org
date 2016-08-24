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
        {React.Children.map(props.children, (child, index) => (
          <tr>
            <td style={style.td}>{(index + 1) + ')'}</td>
            <td style={style.td}>{child}</td>
          </tr>
        ))}
      </tbody>
    </table>);
}
NumberedSteps.propTypes = {
  children: AnyChildren
};
