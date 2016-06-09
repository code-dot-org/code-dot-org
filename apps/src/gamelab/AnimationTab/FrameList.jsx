/** @file Vertical scrolling list of animation frames. */
'use strict';

var React = require('react');
var color = require('../../color');
var FrameListItem = require('./FrameListItem');
var NewListItem = require('./NewListItem');
var ScrollableList = require('./ScrollableList');

var styles = {
  root: {
    backgroundColor: color.white,
    flex: '1 0 0'
  }
};

/**
 * Vertical scrolling list of animation frames for the selected animation.
 * This component should be unique within the animation tab.
 */
var FrameList = function () {
  return (
    <ScrollableList style={styles.root}>
      <NewListItem label="new frame" onClick={function () {}} />
    </ScrollableList>
  );
};
module.exports = FrameList;
