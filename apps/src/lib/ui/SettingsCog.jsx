/** @file Settings menu cog icon */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Radium from 'radium';
import msg from '@cdo/locale';
import FontAwesome from '../../templates/FontAwesome';
import color from '../../util/color';
import * as assets from '../../code-studio/assets';
import project from '../../code-studio/initApp/project';
import * as makerToolkitRedux from '../kits/maker/redux';
import PopUpMenu from './PopUpMenu';
import ConfirmEnableMakerDialog from './ConfirmEnableMakerDialog';
import LibraryManagerDialog from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import {getStore} from '../../redux';
import experiments from '@cdo/apps/util/experiments';
import ModelManagerDialog from '@cdo/apps/code-studio/components/ModelManagerDialog';

class SettingsCog extends Component {
  static propTypes = {
    isRunning: PropTypes.bool,
    runModeIndicators: PropTypes.bool,
    showMakerToggle: PropTypes.bool,
    autogenerateML: PropTypes.func
  };

  state = {
    open: false,
    confirmingEnableMaker: false,
    managingLibraries: false,
    managingModels: false,
    isAIEnabled: false
  };

  targetPoint = {top: 0, left: 0};

  componentDidMount() {
    this.setState({isAIEnabled: experiments.isEnabled(experiments.APPLAB_ML)});
  }

  open = () => this.setState({open: true});
  close = () => this.setState({open: false});

  manageAssets = () => {
    this.close();
    assets.showAssetManager();
  };

  manageLibraries = () => {
    this.close();
    this.setState({managingLibraries: true});
  };

  manageModels = () => {
    this.close();
    this.setState({managingModels: true});
  };

  toggleMakerToolkit = () => {
    this.close();
    if (!makerToolkitRedux.isEnabled(getStore().getState())) {
      // Pop a confirmation dialog when trying to enable maker,
      // because we've had several users do this accidentally.
      this.showConfirmation();
    } else {
      // Disable without confirmation is okay.
      project.setMakerEnabled(null);
    }
  };

  confirmEnableMaker = apiEnabled => {
    project.setMakerEnabled(apiEnabled);
    this.hideConfirmation();
  };

  showConfirmation = () => this.setState({confirmingEnableMaker: true});
  hideConfirmation = () => this.setState({confirmingEnableMaker: false});
  closeLibraryManager = () => this.setState({managingLibraries: false});
  closeModelManager = () => this.setState({managingModels: false});

  setTargetPoint(icon) {
    if (!icon) {
      return;
    }

    const rect = icon.getBoundingClientRect();
    const offsetSoItLooksRight = {top: -6, left: -1};
    this.targetPoint = {
      top: rect.bottom + offsetSoItLooksRight.top,
      left: rect.left + rect.width / 2 + offsetSoItLooksRight.left
    };
  }

  areLibrariesEnabled() {
    let pageConstants = getStore().getState().pageConstants;
    return pageConstants && pageConstants.librariesEnabled;
  }

  areAIToolsEnabled() {
    let pageConstants = getStore().getState().pageConstants;
    return pageConstants && pageConstants.aiEnabled;
  }

  levelbuilderModel() {
    let model = {};
    let pageConstants = getStore().getState().pageConstants;
    if (pageConstants?.aiModelId && pageConstants?.aiModelName) {
      model.id = pageConstants.aiModelId;
      model.name = pageConstants.aiModelName;
    }
    return model;
  }

  render() {
    const {isRunning, runModeIndicators} = this.props;

    // Adjust icon color when running
    const rootStyle = {...styles.iconContainer};
    if (runModeIndicators && isRunning) {
      rootStyle.color = color.dark_charcoal;
    }

    const aiEnabled = this.state.isAIEnabled && this.areAIToolsEnabled();

    return (
      <span style={rootStyle} ref={icon => this.setTargetPoint(icon)}>
        <FontAwesome
          className="settings-cog"
          icon="cog"
          style={styles.assetsIcon}
          title={msg.settings()}
          onClick={this.open}
        />
        <PopUpMenu
          className="settings-cog-menu"
          targetPoint={this.targetPoint}
          isOpen={this.state.open}
          onClose={this.close}
          showTail={true}
        >
          <ManageAssets onClick={this.manageAssets} />
          {this.areLibrariesEnabled() && (
            <ManageLibraries onClick={this.manageLibraries} />
          )}
          {aiEnabled && <ManageModels onClick={this.manageModels} />}
          {this.props.showMakerToggle && (
            <ToggleMaker onClick={this.toggleMakerToolkit} />
          )}
        </PopUpMenu>
        {aiEnabled && (
          <ModelManagerDialog
            isOpen={this.state.managingModels}
            onClose={this.closeModelManager}
            autogenerateML={this.props.autogenerateML}
            levelbuilderModel={this.levelbuilderModel()}
          />
        )}
        <ConfirmEnableMakerDialog
          isOpen={this.state.confirmingEnableMaker}
          handleConfirm={this.confirmEnableMaker}
          handleCancel={this.hideConfirmation}
        />
        <LibraryManagerDialog
          isOpen={this.state.managingLibraries}
          onClose={this.closeLibraryManager}
        />
      </span>
    );
  }
}
export default Radium(SettingsCog);

export function ManageAssets(props) {
  return <PopUpMenu.Item {...props}>{msg.manageAssets()}</PopUpMenu.Item>;
}
ManageAssets.propTypes = {
  onClick: PropTypes.func,
  first: PropTypes.bool,
  last: PropTypes.bool
};

export function ManageModels(props) {
  return <PopUpMenu.Item {...props}>{msg.manageAIModels()}</PopUpMenu.Item>;
}

export function ManageLibraries(props) {
  return <PopUpMenu.Item {...props}>{msg.manageLibraries()}</PopUpMenu.Item>;
}

export function ToggleMaker(props) {
  const reduxState = getStore().getState();
  if (!makerToolkitRedux.isAvailable(reduxState)) {
    return null;
  }
  return (
    <PopUpMenu.Item {...props}>
      {makerToolkitRedux.isEnabled(reduxState)
        ? msg.disableMaker()
        : msg.enableMaker()}
    </PopUpMenu.Item>
  );
}
ToggleMaker.propTypes = ManageAssets.propTypes;

const styles = {
  iconContainer: {
    float: 'right',
    marginRight: 10,
    marginLeft: 10,
    height: '100%',
    cursor: 'pointer',
    color: color.lighter_purple,
    ':hover': {
      color: color.white
    }
  },
  assetsIcon: {
    fontSize: 18,
    verticalAlign: 'middle'
  }
};
