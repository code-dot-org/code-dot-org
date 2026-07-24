/** @file Dropdown for selecting design mode screens */
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import applabMsg from '@cdo/applab/locale';
import localization from '@cdo/apps/localization';

import * as constants from './constants';
import * as elementUtils from './designElements/elementUtils';
import * as screens from './redux/screens';

import moduleStyles from './screen-selector.module.scss';

/**
 * The dropdown that appears above the visualization in design mode, used
 * for selecting a screen to edit.
 * @type {function}
 */
class ScreenSelector extends React.Component {
  static propTypes = {
    // from connect
    currentScreenId: PropTypes.string,
    interfaceMode: PropTypes.string.isRequired,
    hasDesignMode: PropTypes.bool.isRequired,
    onScreenChange: PropTypes.func.isRequired,
    onImport: PropTypes.func.isRequired,
    isRunning: PropTypes.bool.isRequired,

    // passed explicitly
    screenIds: PropTypes.array.isRequired,
    onCreate: PropTypes.func.isRequired,
  };

  handleChange = evt => {
    let screenId = evt.target.value;
    if (screenId === localization.translate(constants.NEW_SCREEN)) {
      screenId = this.props.onCreate();
    } else if (screenId === localization.translate(constants.IMPORT_SCREEN)) {
      this.props.onImport();
      return;
    }
    this.props.onScreenChange(screenId);
  };

  render() {
    if (!this.props.hasDesignMode) {
      return null;
    }

    const defaultScreenId = elementUtils.getScreens().first().attr('id') || '';
    const options = this.props.screenIds
      .sort((a, b) =>
        a === defaultScreenId
          ? -1
          : b === defaultScreenId
          ? 1
          : a.localeCompare(b)
      )
      .map(item => ({
        value: item,
        text: item,
      }));

    const canAddScreen =
      this.props.interfaceMode === constants.ApplabInterfaceMode.DESIGN;

    const importScreen = localization.translate(constants.IMPORT_SCREEN);
    const newScreen = localization.translate(constants.NEW_SCREEN);

    return (
      <SimpleDropdown
        id="screenSelector"
        value={this.props.currentScreenId || ''}
        onChange={this.handleChange}
        disabled={this.props.isRunning}
        labelText={applabMsg.selectScreen()}
        isLabelVisible={false}
        size="s"
        className={moduleStyles.dropdown}
        data-notranslate="true"
        items={[
          ...options,
          ...(canAddScreen
            ? [
                {text: importScreen, value: importScreen},
                {text: newScreen, value: newScreen},
              ]
            : []),
        ]}
      />
    );
  }
}

export default connect(
  function propsFromStore(state) {
    return {
      currentScreenId: state.screens.currentScreenId,
      interfaceMode: state.interfaceMode,
      hasDesignMode: state.pageConstants.hasDesignMode,
      isRunning: state.runState.isRunning,
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      onScreenChange: function (screenId) {
        dispatch(screens.changeScreen(screenId));
      },
      onImport() {
        dispatch(screens.toggleImportScreen(true));
      },
    };
  }
)(ScreenSelector);
