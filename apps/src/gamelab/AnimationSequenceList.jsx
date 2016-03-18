'use strict';

var AnimationSequenceTile = require('./AnimationSequenceTile.jsx');
var NewItemTile = require('./NewItemTile.jsx');
var ScrollableList = require('./ScrollableList.jsx');

var AnimationSequenceList = React.createClass({
  render: function () {
    return <ScrollableList className="animation-sequence-list">
      <AnimationSequenceTile sequenceName="sequence01"/>
      <AnimationSequenceTile sequenceName="sequence02" isSelected={true}/>
      <NewItemTile label="new sequence"/>
    </ScrollableList>;
  }
});
module.exports = AnimationSequenceList;
