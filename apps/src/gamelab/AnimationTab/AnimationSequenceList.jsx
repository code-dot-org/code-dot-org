/** @file Vertical scrolling list of animation sequences */
'use strict';

var AnimationSequenceListItem = require('./AnimationSequenceListItem');
var NewListItem = require('./NewListItem');
var ScrollableList = require('./ScrollableList');

/**
 * Vertical scrolling list of animation sequences associated with the
 * project.
 */
var AnimationSequenceList = React.createClass({
  render: function () {
    return (
      <ScrollableList className="animation-sequence-list">
        <AnimationSequenceListItem sequenceName="sequence01" />
        <AnimationSequenceListItem sequenceName="sequence02" isSelected />
        <NewListItem label="new sequence" />
      </ScrollableList>
    );
  }
});
module.exports = AnimationSequenceList;
