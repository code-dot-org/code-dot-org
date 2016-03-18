/** @file Vertical scrolling list */
'use strict';

var _ = require('../lodash');

/**
 * Component displaying a vertical list of tiles that scrolls if it grows
 * beyond its natural height.
 */
var ScrollableList = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    style: React.PropTypes.object
  },

  render: function () {
    var styles = {
      root: _.assign({
        flex: '1 0 0',
        overflowX: 'hidden',
        overflowY: 'scroll'
      }, this.props.style),
      margins: {
        margin: 4
      }
    };
    return (
      <div className={this.props.className} style={styles.root}>
        <div style={styles.margins}>
          {this.props.children}
        </div>
      </div>
    );
  }
});
module.exports = ScrollableList;
