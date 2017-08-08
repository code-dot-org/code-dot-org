/** @file Vertical scrolling list */
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Radium from 'radium';

var staticStyles = {
  root: {
    overflowX: 'hidden',
    overflowY: 'scroll'
  },
  margins: {
    margin: 4
  }
};

/**
 * Component displaying a vertical list of tiles that scrolls if it grows
 * beyond its natural height.
 */
var ScrollableList = createReactClass({
  propTypes: {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
  },

  render: function () {
    return (
      <div className={this.props.className} style={[staticStyles.root, this.props.style]}>
        <div style={staticStyles.margins}>
          {this.props.children}
        </div>
      </div>
    );
  }
});
module.exports = Radium(ScrollableList);
