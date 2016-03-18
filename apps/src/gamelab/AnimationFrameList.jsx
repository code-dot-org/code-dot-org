/** @file Vertical scrolling list of animation frames. */
'use strict';

var AnimationFrameListItem = require('./AnimationFrameListItem.jsx');
var NewListItem = require('./NewListItem.jsx');
var ScrollableList = require('./ScrollableList.jsx');

/**
 * Vertical scrolling list of animation frames for the selected animation.
 * This component should be unique within the animation tab.
 */
var AnimationFrameList = React.createClass({
  render: function () {
    return (
      <ScrollableList className="animation-frame-list">
        <AnimationFrameListItem index={1} />
        <AnimationFrameListItem index={2} />
        <AnimationFrameListItem index={3} isSelected />
        <AnimationFrameListItem index={4} />
        <AnimationFrameListItem index={151} />
        <NewListItem label="new frame" />
      </ScrollableList>
    );
  }
});
module.exports = AnimationFrameList;
