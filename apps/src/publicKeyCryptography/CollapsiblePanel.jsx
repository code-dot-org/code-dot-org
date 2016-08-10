/** @file Collapsible panel with title, used for each character in crypto widget */
import React from 'react';
import {AnyChildren} from './types';

const CollapsiblePanel = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    children: AnyChildren
  },

  render() {
    return (
      <div>
        {this.props.title}
        {this.props.children}
      </div>);
  }
});
export default CollapsiblePanel;
