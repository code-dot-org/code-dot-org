/** @file Vertical scrolling list */
'use strict';

var _ = require('../lodash');

/**
 * Component displaying a vertical list of tiles that scrolls if it grows
 * beyond its natural height.
 */
var ScrollableList = React.createClass({
  propTypes: {
    style: React.PropTypes.object
  },

  render: function () {
    var rootStyle = _.assign({
      flex: '1 0 0',
      overflowX: 'hidden',
      overflowY: 'scroll'
    }, this.props.style);
    return <div style={rootStyle}>
      {this.props.children}
    </div>;
  }
});
module.exports = ScrollableList;