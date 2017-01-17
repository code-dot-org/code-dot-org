/** @file Dropdown for selecting design mode screens */
import React from 'react';
import Radium from 'radium';
import color from "../util/color";
import commonStyles from '../commonStyles';
import * as constants from './constants';
import {connect} from 'react-redux';
import * as elementUtils from './designElements/elementUtils';
import * as screens from './redux/screens';

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
    interfaceMode: React.PropTypes.string.isRequired,
    hasDesignMode: React.PropTypes.bool.isRequired,
    isReadOnlyWorkspace: React.PropTypes.bool.isRequired,
    onScreenChange: React.PropTypes.func.isRequired,
    onImport: React.PropTypes.func.isRequired,
    isRunning: React.PropTypes.bool.isRequired,

    // passed explicitly
    screenIds: React.PropTypes.array.isRequired,
    onCreate: React.PropTypes.func.isRequired,
  },

  handleChange: function (evt) {
    var screenId = evt.target.value;
    if (screenId === constants.NEW_SCREEN) {
      screenId = this.props.onCreate();
    } else if (screenId === constants.IMPORT_SCREEN) {
      this.props.onImport();
      return;
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

    const canAddScreen = this.props.interfaceMode === constants.ApplabInterfaceMode.DESIGN;

    return (
      <select
        id="screenSelector"
        style={[
          styles.dropdown,
          (!this.props.hasDesignMode || this.props.isReadOnlyWorkspace) &&
            commonStyles.hidden
        ]}
        value={this.props.currentScreenId || ''}
        onChange={this.handleChange}
        disabled={this.props.isRunning}
      >
        {options}
        {canAddScreen &&
         <option>{constants.IMPORT_SCREEN}</option>}
        {canAddScreen && <option>{constants.NEW_SCREEN}</option>}
      </select>
    );
  }
});

export default connect(function propsFromStore(state) {
  return {
    currentScreenId: state.screens.currentScreenId,
    interfaceMode: state.interfaceMode,
    hasDesignMode: state.pageConstants.hasDesignMode,
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    isRunning: state.runState.isRunning,
  };
}, function propsFromDispatch(dispatch) {
  return {
    onScreenChange: function (screenId) {
      dispatch(screens.changeScreen(screenId));
    },
    onImport() {
      dispatch(screens.toggleImportScreen(true));
    },
  };
})(Radium(ScreenSelector));

export {styles};
