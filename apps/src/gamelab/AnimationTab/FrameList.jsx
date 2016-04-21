/** @file Vertical scrolling list of animation frames. */
'use strict';

var FrameListItem = require('./FrameListItem');
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
var FrameList = function () {
  return (
    <ScrollableList style={styles.root} className="animation-frame-list">
      <FrameListItem index={1} />
      <FrameListItem index={2} />
      <FrameListItem index={3} isSelected />
      <FrameListItem index={4} />
      <FrameListItem index={151} />
      <NewListItem label="new frame" onClick={function () {}} />
    </ScrollableList>
  );
};
module.exports = FrameList;
