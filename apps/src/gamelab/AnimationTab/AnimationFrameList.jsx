/** @file Vertical scrolling list of animation frames. */
'use strict';

var AnimationFrameListItem = require('./AnimationFrameListItem');
var NewListItem = require('./NewListItem');
var ScrollableList = require('./ScrollableList');

var styles = {
  root: {
    flex: '1 0 0'
  }
};

/**
 * Vertical scrolling list of animation frames for the selected animation.
 * This component should be unique within the animation tab.
 */
var AnimationFrameList = function () {
  return (
    <ScrollableList style={styles.root} className="animation-frame-list">
      <AnimationFrameListItem index={1} />
      <AnimationFrameListItem index={2} />
      <AnimationFrameListItem index={3} isSelected />
      <AnimationFrameListItem index={4} />
      <AnimationFrameListItem index={151} />
      <NewListItem label="new frame" onClick={function () {}} />
    </ScrollableList>
  );
};
module.exports = AnimationFrameList;
