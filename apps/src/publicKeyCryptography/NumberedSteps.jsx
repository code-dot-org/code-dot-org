/** Auto-numbered table of arbitrary components, used for character steps */
import React from 'react';
import {AnyChildren} from './types';

const style = {
  td: {
    verticalAlign: 'top'
  }
};

export default function NumberedSteps(props) {
  return (
    <table>
      {React.Children.map(props.children, (child, index) => (
        <tr>
          <td style={style.td}>{(index + 1) + '.'}</td>
          <td style={style.td}>{child}</td>
        </tr>
      ))}
    </table>);
}
NumberedSteps.propTypes = {
  children: AnyChildren
};
