'use strict';

var AnimationSequenceTile = require('./AnimationSequenceTile.jsx');
var ScrollableList = require('./ScrollableList.jsx');

var AnimationSequenceList = React.createClass({
  render: function () {
    return <ScrollableList className="animation-sequence-list">
      <AnimationSequenceTile sequenceName="sequence01"/>
      <AnimationSequenceTile sequenceName="sequence02" isSelected={true}/>
      <AnimationSequenceTile sequenceName="sequence03"/>
      <AnimationSequenceTile sequenceName="sequence04"/>
      <AnimationSequenceTile sequenceName="sequence05"/>
      <AnimationSequenceTile sequenceName="sequence06"/>
      <AnimationSequenceTile sequenceName="sequence07"/>
      <AnimationSequenceTile sequenceName="sequence08"/>
      <AnimationSequenceTile sequenceName="sequence09"/>
      <AnimationSequenceTile sequenceName="sequence10"/>
      <AnimationSequenceTile sequenceName="sequence11"/>
      <AnimationSequenceTile sequenceName="sequence12"/>
      <AnimationSequenceTile sequenceName="sequence13"/>
      <AnimationSequenceTile sequenceName="sequence14"/>
      <AnimationSequenceTile sequenceName="sequence15"/>
    </ScrollableList>;
  }
});
module.exports = AnimationSequenceList;
