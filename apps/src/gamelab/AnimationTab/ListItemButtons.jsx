/** @file controls below an animation thumbnail */
'use strict';

var color = require('../../color');

var staticStyles = {
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

/**
 * The delete and duplicate controls beneath an animation or frame thumbnail.
 */
var ListItemButtons = function () {
  return (
    <div style={staticStyles.root}>
      <i className="fa fa-trash-o" style={staticStyles.trash} />
      <i className="fa fa-clone" />
    </div>
  );
};
module.exports = ListItemButtons;
