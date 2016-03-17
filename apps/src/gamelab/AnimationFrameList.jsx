'use strict';

var AnimationFrameTile = require('./AnimationFrameTile.jsx');
var ScrollableList = require('./ScrollableList.jsx');

var AnimationFrameList = React.createClass({
  render: function () {
    return <ScrollableList className="animation-frame-list">
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
      <AnimationFrameTile/>
    </ScrollableList>;
  }
});
module.exports = AnimationFrameList;
