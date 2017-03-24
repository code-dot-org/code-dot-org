import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import msg from '@cdo/locale';
import {showAssetManager} from '../../code-studio/assets';
import color from '../../util/color';
import * as maker from '../kits/maker/toolkit';

const SETTINGS_MENU_WIDTH = 220;
const TAIL_WIDTH = 14;
const TAIL_HEIGHT = 12;
const BACKGROUND_COLOR  = color.white;
const BORDER_COLOR = color.light_gray;

const style = {
  menu: {
    position: 'absolute',
    zIndex: 20,
    width: SETTINGS_MENU_WIDTH,
    border: `1px solid ${BORDER_COLOR}`,
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 2,
    boxShadow: "3px 3px 3px gray",
    marginTop: 5,
    textAlign: 'center',
  },
};
const tailBorderStyle = {
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  marginLeft: -TAIL_WIDTH / 2,
  borderTopWidth: 0,
  borderBottomWidth: TAIL_HEIGHT,
  borderLeftWidth: TAIL_WIDTH / 2,
  borderRightWidth: TAIL_WIDTH / 2,
  borderStyle: 'solid',
  borderColor: `transparent transparent ${BORDER_COLOR} transparent`,
};
const tailFillStyle = {
  ...tailBorderStyle,
  bottom: 'calc(100% - 2px)',
  borderColor: `transparent transparent ${BACKGROUND_COLOR} transparent`,
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
      top: targetRect.bottom,
      left: targetRect.left + (targetRect.width / 2) - (SETTINGS_MENU_WIDTH / 2) - 1,
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
        {/* These elements are used to draw the 'tail' with CSS */}
        <span style={tailBorderStyle}/>
        <span style={tailFillStyle}/>
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
    color: color.dark_charcoal,
    paddingLeft: '1em',
    paddingRight: '1em',
    cursor: 'pointer',
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
