/* global $ */
var React = require('react');
var rowStyle = require('./rowStyle');
var applabMsg = require('../locale');

var EventHeaderRow = module.exports = React.createClass({
  render: function() {
    var style = $.extend({}, rowStyle.container, rowStyle.maxWidth, {
      color: '#5b6770'
    });

    return (
      <div style={style}>
        {applabMsg.addEventHeader()}
      </div>
    );
  }
});