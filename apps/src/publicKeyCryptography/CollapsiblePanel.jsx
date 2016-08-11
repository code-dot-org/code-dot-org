/** @file Collapsible panel with title, used for each character in crypto widget */
import React from 'react';
import color from '../color';
import {AnyChildren} from './types';

const style = {
  header: {
    fontFamily: `"Gotham 5r", sans-serif`,
    fontSize: 16,
    color: color.charcoal,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: color.charcoal
  }
};

const CollapsiblePanel = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    children: AnyChildren
  },

  render() {
    return (
      <div>
        <div style={style.header}>
          {this.props.title}
        </div>
        <div>
          {this.props.children}
        </div>
      </div>);
  }
});
export default CollapsiblePanel;
