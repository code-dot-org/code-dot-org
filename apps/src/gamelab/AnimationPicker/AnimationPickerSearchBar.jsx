/** Animation picker dialog search bar */
import React, {PropTypes} from 'react';
var color = require("../../util/color");

var BORDER_WIDTH = 1;
var BORDER_COLOR = color.light_gray;
var BORDER_RADIUS = 6;
var INPUT_HORIZONTAL_PADDING = BORDER_RADIUS;

// We have side-by-side elements that should format sort of like one element
var styles = {
  input: {
    height: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: INPUT_HORIZONTAL_PADDING,
    paddingRight: INPUT_HORIZONTAL_PADDING,
    width: '100%',
    marginLeft: 0,
    marginRight: 0,
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderRadius: BORDER_RADIUS,
    marginBottom: 10,
    textIndent: 22
  },
  icon: {
    position: 'absolute',
    top: 9,
    left: 10
  },
  search: {
    position: 'relative'
  }
};

var AnimationPickerSearchBar = React.createClass({
  propTypes: {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  },

  onChange(evt) {
    this.props.onChange(evt.target.value);
  },

  render: function () {
    return (
      <div style={styles.search}>
        <span className="fa fa-search" style={styles.icon}></span>
        <input
          style={styles.input}
          placeholder="Search for images"
          value={this.props.value}
          onChange={this.onChange}
        />
      </div>
    );
  }
});
module.exports = AnimationPickerSearchBar;
