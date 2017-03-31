import React, {Component, PropTypes} from 'react';
import msg from '@cdo/locale';
import * as assets from '../../code-studio/assets';
import project from '../../code-studio/initApp/project';
import * as maker from '../kits/maker/toolkit';
import PopUpMenu from './PopUpMenu';

export default class SettingsMenu extends Component {
  constructor(props) {
    super(props);

    // Bind methods to instance
    this.manageAssets = this.manageAssets.bind(this);
    this.toggleMakerToolkit = this.toggleMakerToolkit.bind(this);
  }

  static propTypes = {
    targetPoint: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
    handleClose: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  manageAssets() {
    this.props.handleClose();
    assets.showAssetManager();
  }

  toggleMakerToolkit() {
    this.props.handleClose();
    project.toggleMakerEnabled();
  }

  render() {
    const {className, targetPoint} = this.props;
    return (
      <PopUpMenu className={className} targetPoint={targetPoint}>
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
