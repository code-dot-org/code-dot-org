/** @file Arranges child components as columns of equal width, filling available space */
import React from 'react';
import {AnyChildren} from './types';

const EqualColumns = React.createClass({
  propTypes: {
    children: AnyChildren
  },

  render() {
    const panelStyle = {
      float: 'left',
      width: (100 / React.Children.count(this.props.children)) + '%',
    };
    return (
      <div>
        {React.Children.map(this.props.children, child => (
          <div style={panelStyle}>
            {child}
          </div>
        ))}
        <div style={{clear:'both'}}/>
      </div>);
  }
});
export default EqualColumns;
