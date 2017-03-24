import React, {Component, PropTypes} from 'react';
import msg from '@cdo/locale';
import {showAssetManager} from '../../code-studio/assets';
import * as maker from '../kits/maker/toolkit';
import PopUpMenu from './PopUpMenu';

export default class SettingsMenu extends Component {
  constructor(props) {
    super(props);

    // Autobind
    this.manageAssets = this.manageAssets.bind(this);
    this.toggleMakerToolkit = this.toggleMakerToolkit.bind(this);
  }

  static propTypes = {
    // TODO: Specific shape for DOMRect here?
    targetRect: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
  };

  manageAssets() {
    this.props.handleClose();
    showAssetManager();
  }

  toggleMakerToolkit() {
    this.props.handleClose();
    window.dashboard.project.toggleMakerEnabled();
  }

  render() {
    const {targetRect} = this.props;
    const targetPoint = {
      top: targetRect.bottom - 6,
      left: targetRect.left + (targetRect.width / 2) - 1,
    };

    return (
      <PopUpMenu targetPoint={targetPoint}>
        <PopUpMenu.Item onClick={this.manageAssets}>
          {msg.manageAssets()}
        </PopUpMenu.Item>
        {maker.isAvailable() &&
          <PopUpMenu.Item onClick={this.toggleMakerToolkit}>
            {maker.isEnabled() ? msg.disableMaker() : msg.enableMaker()}
          </PopUpMenu.Item>
        }
      </PopUpMenu>
    );
  }
}
