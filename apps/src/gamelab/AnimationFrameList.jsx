'use strict';

var AnimationSequenceTile = require('./AnimationSequenceTile.jsx');
var ScrollableList = require('./ScrollableList.jsx');

var AnimationFrameList = React.createClass({
  render: function () {
    return <ScrollableList className="animation-frame-list">
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
      <AnimationSequenceTile/>
    </ScrollableList>;
  }
});
module.exports = AnimationFrameList;
