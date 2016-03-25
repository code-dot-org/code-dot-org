/** @file Vertical scrolling list */
'use strict';

var _ = require('../../lodash');

var staticStyles = {
  root: {
    flex: '1 0 0',
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
var ScrollableList = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    style: React.PropTypes.object
  },

  render: function () {
    var styles = _.merge({}, staticStyles, {
      root: this.props.style
    });
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
