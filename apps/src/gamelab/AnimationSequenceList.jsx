'use strict';

var AnimationSequenceTile = require('./AnimationSequenceTile.jsx');
var ScrollableList = require('./ScrollableList.jsx');

var AnimationSequenceList = React.createClass({
  render: function () {
    return <ScrollableList className="animation-sequence-list">
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
module.exports = AnimationSequenceList;
