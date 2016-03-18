/** @file controls below an animation thumbnail */
'use strict';

var color = require('../color');

/**
 * The delete and duplicate controls beneath an animation or frame thumbnail.
 */
var TileButtons = React.createClass({
  render: function () {
    var styles = {
      root: {
        marginLeft: 4,
        marginRight: 4,
        marginTop: 6,
        textAlign: 'center',
        color: color.white,
        fontSize: 24
      },
      trash: {
        marginRight: 12
      }
    };

    return (
      <div style={styles.root}>
        <i className="fa fa-trash-o" style={styles.trash} />
        <i className="fa fa-clone" />
      </div>
    );
  }
});
module.exports = TileButtons;
