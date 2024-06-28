/** @file Arranges child components as columns of equal width, filling available space */
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {AnyChildren} from './types';

class EqualColumns extends React.Component {
  static propTypes = {
    // Space between columns, in pixels
    intercolumnarDistance: PropTypes.number,
    children: AnyChildren,
  };

  static defaultProps = {intercolumnarDistance: 0};

  render() {
    const {children, intercolumnarDistance} = this.props;
    const childCount = React.Children.count(children);
    const outerColumnStyle = {
      float: 'left',
      width: 100 / childCount + '%',
    };
    return (
      <div>
        {React.Children.map(this.props.children, (child, index) => {
          const innerColumnStyle = {
            marginLeft: index > 0 && intercolumnarDistance / 2,
            marginRight: index < childCount - 1 && intercolumnarDistance / 2,
          };
          return (
            <div style={outerColumnStyle}>
              <div style={innerColumnStyle}>{child}</div>
            </div>
          );
        })}
        <div style={{clear: 'both'}} />
      </div>
    );
  }
}

export default Radium(EqualColumns);
