import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import msg from '@cdo/locale';
import {showAssetManager} from '../../code-studio/assets';
import color from '../../util/color';
import * as maker from '../kits/maker/toolkit';

const SETTINGS_MENU_WIDTH = 250;

const style = {
  menu: {
    position: 'absolute',
    zIndex: 20,
    width: SETTINGS_MENU_WIDTH,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: color.purple,
    backgroundColor: 'white',
  },
  arrow: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    marginLeft: -7,
    borderWidth: 7,
    borderStyle: 'solid',
    borderColor: `transparent transparent ${color.purple} transparent`,
  }
};

class SettingsMenu extends Component {
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
    const menuStyle = {
      ...style.menu,
      top: targetRect.bottom + 5,
      left: targetRect.left + (targetRect.width / 2) - (SETTINGS_MENU_WIDTH / 2),
    };

    return (
      <div style={menuStyle}>
        <div>
          <MenuItem
            text={msg.manageAssets()}
            onClick={this.manageAssets}
          />
          {maker.isAvailable() &&
            <MenuItem
              text={maker.isEnabled() ? msg.disableMaker() : msg.enableMaker()}
              onClick={this.toggleMakerToolkit}
            />
          }
        </div>
        <span style={style.arrow}/>
      </div>
    );
  }
}
export default Radium(SettingsMenu);

class MenuItem_ extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  };

  static style = {
    color: color.black,
    ':hover': {
      backgroundColor: color.lightest_gray,
    }
  };

  render() {
    return (
      <div
        style={MenuItem_.style}
        onClick={this.props.onClick}
      >
        {this.props.text}
      </div>
    );
  }
}
const MenuItem = Radium(MenuItem_);
