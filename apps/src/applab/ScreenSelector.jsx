/** @file Dropdown for selecting design mode screens */
/* global Applab */

var color = require('../color');
var constants = require('./constants');
var connect = require('react-redux').connect;
var elementUtils = require('./designElements/elementUtils');
var screens = require('./redux/screens');

var styles = {
  dropdown: {
    display: 'inline-block',
    verticalAlign: 'top',
    width: '100%',
    height: 28,
    marginBottom: 6,
    borderColor: color.light_gray
  }
};

/**
 * The dropdown that appears above the visualization in design mode, used
 * for selecting a screen to edit.
 * @type {function}
 */
var ScreenSelector = React.createClass({
  propTypes: {
    // from connect
    currentScreenId: React.PropTypes.string,
    onScreenChange: React.PropTypes.func.isRequired,

    // passed explicitly
    screenIds: React.PropTypes.array.isRequired,
    onCreate: React.PropTypes.func.isRequired
  },

  handleChange: function (evt) {
    var screenId = evt.target.value;
    if (screenId === constants.NEW_SCREEN) {
      screenId = this.props.onCreate();
    }
    this.props.onScreenChange(screenId);
  },

  render: function () {
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
          style={styles.dropdown}
          value={this.props.currentScreenId || ''}
          onChange={this.handleChange}
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
}, function propsFromDispatch(dispatch) {
  return {
    onScreenChange: function (screenId) {
      dispatch(screens.changeScreen(screenId));
    }
  };
})(ScreenSelector);

module.exports.styles = styles;
