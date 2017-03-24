/** @file Settings menu cog icon */
import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import Portal from 'react-portal';
import msg from '@cdo/locale';
import color from '../../util/color';
import FontAwesome from '../../templates/FontAwesome';
import {showAssetManager} from '../../code-studio/assets';
import * as maker from '../kits/maker/toolkit';

const SETTINGS_MENU_WIDTH = 250;

class SettingsCog extends Component {
  constructor(props) {
    super(props);
    this.open = this.open.bind(this);
    this.beforeClose = this.beforeClose.bind(this);
    this.close = this.close.bind(this);
    this.manageAssets = this.manageAssets.bind(this);
    this.toggleMakerToolkit = this.toggleMakerToolkit.bind(this);
  }

  state = {
    open: false,
    canOpen: true,
  };

  open() {
    this.setState({open: true, canOpen: false});
  }

  beforeClose(_, resetPortalState) {
    resetPortalState();
    // Possibly circular?
    this.setState({open: false});
    window.setTimeout(() => this.setState({canOpen: true}), 0);
  }

  close() {
    this.setState({open: false});
  }

  manageAssets() {
    this.close();
    showAssetManager();
  }

  toggleMakerToolkit() {
    this.close();
    window.dashboard.project.toggleMakerEnabled();
  }

  render() {
    const iconRect = this.icon ? this.icon.getBoundingClientRect() : {
      bottom: 0,
      left: 0,
      width: 0,
    };
    const styles = {
      iconContainer: {
        float: 'right',
        marginRight: 10,
        marginLeft: 10,
        height: '100%',
        cursor: 'pointer',
        color: color.lighter_purple,
        ':hover': {
          color: color.white,
        }
      },
      assetsIcon: {
        fontSize: 18,
        verticalAlign: 'middle',
      },
      menu: {
        position: 'absolute',
        top: iconRect.bottom + 5,
        left: iconRect.left + (iconRect.width / 2) - (SETTINGS_MENU_WIDTH / 2),
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

    return (
      <span
        style={styles.iconContainer}
        ref={icon => this.icon = icon}
      >
        <FontAwesome
          id="settings-cog"
          icon="cog"
          style={styles.assetsIcon}
          title={msg.settings()}
          onClick={this.state.canOpen ? this.open : undefined}
        />
        <Portal
          closeOnEsc
          closeOnOutsideClick
          isOpened={this.state.open}
          beforeClose={this.beforeClose}
        >
          <div style={styles.menu}>
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
            <span style={styles.arrow}/>
          </div>
        </Portal>
      </span>
    );
  }
}
export default Radium(SettingsCog);

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
