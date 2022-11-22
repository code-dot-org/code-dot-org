/** @file Settings menu cog icon */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import msg from '@cdo/locale';
import FontAwesome from '../../templates/FontAwesome';
import * as assets from '../../code-studio/assets';
import project from '../../code-studio/initApp/project';
import * as makerToolkitRedux from '../kits/maker/redux';
import ConfirmEnableMakerDialog from './ConfirmEnableMakerDialog';
import LibraryManagerDialog from '@cdo/apps/code-studio/components/libraries/LibraryManagerDialog';
import {getStore} from '../../redux';
import ModelManagerDialog from '@cdo/apps/code-studio/components/ModelManagerDialog';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import classNames from 'classnames';
import moduleStyles from './settings-cog.module.scss';
import JavalabDropdown from '@cdo/apps/javalab/components/JavalabDropdown';
import onClickOutside from 'react-onclickoutside';

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
    managingModels: false
  };

  open = () => this.setState({open: true});
  close = () => this.setState({open: false});
  toggleOpen = () => this.setState({open: !this.state.open});

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
  handleClickOutside = () => this.close();

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
      <>
        <button
          type="button"
          onClick={this.toggleOpen}
          className={classNames(
            moduleStyles.button,
            runModeIndicators && isRunning && moduleStyles.iconContainerRunning
          )}
        >
          <FontAwesome
            className="settings-cog"
            icon="cog"
            title={msg.settings()}
          />
        </button>
        {this.state.open && (
          <JavalabDropdown>
            <button type="button" onClick={this.manageAssets}>
              {msg.manageAssets()}
            </button>
            {this.areLibrariesEnabled() && (
              <button type="button" onClick={this.manageLibraries}>
                {msg.manageLibraries()}
              </button>
            )}
            {this.areAIToolsEnabled() && (
              <button type="button" onClick={this.manageModels}>
                {msg.manageAIModels()}
              </button>
            )}
            {this.props.showMakerToggle &&
              renderMakerButton(this.toggleMakerToolkit)}
          </JavalabDropdown>
        )}
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
      </>
    );
  }
}

export default onClickOutside(SettingsCog);

export function renderMakerButton(onClick) {
  const reduxState = getStore().getState();
  if (!makerToolkitRedux.isAvailable(reduxState)) {
    return null;
  }

  return (
    <button type="button" onClick={onClick}>
      {makerToolkitRedux.isEnabled(reduxState)
        ? msg.disableMaker()
        : msg.enableMaker()}
    </button>
  );
}
