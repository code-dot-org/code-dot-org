/* global $ */
var color = require('../../color');
var rowStyle = require('./rowStyle');
var applabMsg = require('../locale');

var EventHeaderRow = module.exports = React.createClass({
  render: function() {
    var style = $.extend({}, rowStyle.container, rowStyle.maxWidth, {
      color: color.charcoal
    });

    return (
      <div style={style}>
        {applabMsg.addEventHeader()}
      </div>
    );
  }
});
