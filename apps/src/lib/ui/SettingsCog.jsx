/** @file Settings menu cog icon */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import msg from '@cdo/locale';
import FontAwesome from '../../templates/FontAwesome';
import * as assets from '../../code-studio/assets';
import project from '../../code-studio/initApp/project';
import * as makerToolkitRedux from '../kits/maker/redux';
import PopUpMenu from './PopUpMenu';
import ConfirmEnableMakerDialog from './ConfirmEnableMakerDialog';
import LibraryManagerDialog from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import {getStore} from '../../redux';
import ModelManagerDialog from '@cdo/apps/code-studio/components/ModelManagerDialog';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import classNames from 'classnames';
import stylez from './settings-cog.module.scss';

export default class SettingsCog extends Component {
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
    managingModels: false
  };

  targetPoint = {top: 0, left: 0};

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
      // Log that a user would like to enable the maker toolkit
      firehoseClient.putRecord({
        study: 'maker-toolkit',
        study_group: 'maker-toolkit',
        event: 'enable-maker-toolkit'
      });

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

    return (
      <span
        className={classNames(
          stylez.iconContainer,
          runModeIndicators && isRunning && stylez.iconContainerRunning
        )}
        ref={icon => this.setTargetPoint(icon)}
      >
        <button type="button" onClick={this.open} className={stylez.button}>
          <FontAwesome
            className="settings-cog"
            icon="cog"
            title={msg.settings()}
          />
        </button>
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
          {this.areAIToolsEnabled() && (
            <ManageModels onClick={this.manageModels} />
          )}
          {this.props.showMakerToggle && (
            <ToggleMaker onClick={this.toggleMakerToolkit} />
          )}
        </PopUpMenu>
        {this.areAIToolsEnabled() && (
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
