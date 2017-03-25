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
    targetPoint: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
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
    const {targetPoint} = this.props;
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
