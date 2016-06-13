/** Animation picker dialog search bar */
'use strict';

import React from 'react';
var color = require('../../color');

var BORDER_WIDTH = 1;
var BORDER_COLOR = color.light_gray;
var BORDER_RADIUS = 6;
var INPUT_HORIZONTAL_PADDING = BORDER_RADIUS;
var SEARCH_BUTTON_WIDTH = 40;
var SEARCH_BUTTON_GAP = 3;

var SPACE_FOR_BUTTON = SEARCH_BUTTON_WIDTH + SEARCH_BUTTON_GAP +
    2 * BORDER_WIDTH + 2 * INPUT_HORIZONTAL_PADDING;

// We have side-by-side elements that should format sort of like one element
var styles = {
  input: {
    height: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: INPUT_HORIZONTAL_PADDING,
    paddingRight: INPUT_HORIZONTAL_PADDING,
    width: 'calc(100% - ' + SPACE_FOR_BUTTON + 'px)',
    marginLeft: 0,
    marginRight: 0,
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderTopLeftRadius: BORDER_RADIUS,
    borderBottomLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  button: {
    height: 30,
    padding: 0,
    width: SEARCH_BUTTON_WIDTH,
    marginLeft: SEARCH_BUTTON_GAP,
    marginRight: 0,
    color: color.white,
    backgroundColor: color.orange,
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS
  }
};

var AnimationPickerSearchBar = React.createClass({
  render: function () {
    return (
      <div>
        <input style={styles.input} placeholder="Search for images" />
        <button style={styles.button}><i className="fa fa-search"></i></button>
      </div>
    );
  }
});
module.exports = AnimationPickerSearchBar;
