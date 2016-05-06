/** @file Dropdown for selecting design mode screens */
/* global Applab */

var color = require('../color');
var constants = require('./constants');
var connect = require('react-redux').connect;
var elementUtils = require('./designElements/elementUtils');

/**
 * The dropdown that appears above the visualization in design mode, used
 * for selecting a screen to edit.
 * @type {function}
 */
var ScreenSelector = React.createClass({
  propTypes: {
    screenIds: React.PropTypes.array.isRequired,
    currentScreenId: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var dropdownStyle = {
      display: 'inline-block',
      verticalAlign: 'top',
      width: '100%',
      height: 28,
      marginBottom: 6,
      borderColor: color.light_gray
    };

    var options = this.props.screenIds.map(function (item) {
      return <option key={item} value={item}>{item}</option>;
    });

    var defaultScreenId = elementUtils.getScreens().first().attr('id') || '';

    options.sort(function (a, b) {
      if (a.key === defaultScreenId) {
        return -1;
      } else if (b.key === defaultScreenId) {
        return 1;
      } else {
        return a.key.localeCompare(b.key);
      }
    });

    return (
      <select
          id="screenSelector"
          style={dropdownStyle}
          value={this.props.currentScreenId}
          onChange={this.props.onChange}
          disabled={Applab.isRunning()}>
        {options}
        <option>{constants.NEW_SCREEN}</option>
      </select>
    );
  }
});
module.exports = ScreenSelector;
module.exports = connect(function propsFromStore(state) {
  return {
    currentScreenId: state.screens.currentScreenId
  };
})(ScreenSelector);
