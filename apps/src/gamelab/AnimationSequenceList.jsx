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
    </ScrollableList>;
  }
});
module.exports = AnimationSequenceList;
