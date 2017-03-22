/** @file Settings menu cog icon */
import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import msg from '@cdo/locale';
import color from '../../util/color';
import FontAwesome from '../../templates/FontAwesome';
import {showAssetManager} from '../../code-studio/assets';

const SETTINGS_MENU_WIDTH = 250;

class SettingsCog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  onClick() {
    this.setState({open: !this.state.open});
  }

  manageAssets() {
    this.setState({open: false});
    showAssetManager();
  }

  toggleMakerToolkit() {

  }

  render() {
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
        display: this.state.open ? 'block' : 'none',
        position: 'absolute',
        top: this.icon ? this.icon.offsetTop + this.icon.offsetHeight + 5 : 0,
        left: this.icon ? this.icon.offsetLeft + (this.icon.offsetWidth / 2) - (SETTINGS_MENU_WIDTH / 2) : 0,
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
        ref={icon => {
          this.icon = icon;
        }}
      >
        <FontAwesome
          id="settings-cog"
          icon="cog"
          style={styles.assetsIcon}
          onClick={this.onClick.bind(this)}
          title={msg.settings()}
        />
        <div style={styles.menu}>
          <div>
            <MenuItem
              text="Manage Assets"
              onClick={() => this.manageAssets()}
            />
            <MenuItem
              text="Enable Maker Toolkit"
              onClick={() => this.toggleMakerToolkit()}
            />
          </div>
          <span style={styles.arrow}/>
        </div>
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
