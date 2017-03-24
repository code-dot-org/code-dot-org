/** @file Settings menu cog icon */
import React, {Component} from 'react';
import Radium from 'radium';
import Portal from 'react-portal';
import msg from '@cdo/locale';
import FontAwesome from '../../templates/FontAwesome';
import color from '../../util/color';
import SettingsMenu from './SettingsMenu';

const style = {
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
};

const ZERO_CLIENT_RECT = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: 0,
  height: 0,
};

class SettingsCog extends Component {
  constructor(props) {
    super(props);

    // Autobind
    this.open = this.open.bind(this);
    this.beforeClose = this.beforeClose.bind(this);
    this.close = this.close.bind(this);

    // Default icon bounding rect for first render
    this.iconRect = ZERO_CLIENT_RECT;
  }

  // This ugly two-flag state is a workaround for an event-handling bug in
  // react-portal that prevents closing the portal by clicking on the icon
  // that opened it.  For now we're just disabling the cog when the menu is
  // open, and re-enabling one tick after it closes.
  // @see https://github.com/tajo/react-portal/issues/140
  state = {
    open: false,
    canOpen: true,
  };

  open() {
    this.setState({open: true, canOpen: false});
  }

  beforeClose(_, resetPortalState) {
    resetPortalState();
    this.setState({open: false});
    window.setTimeout(() => this.setState({canOpen: true}), 0);
  }

  close() {
    this.setState({open: false});
  }

  render() {
    return (
      <span
        style={style.iconContainer}
        ref={icon => this.iconRect = icon ? icon.getBoundingClientRect() : ZERO_CLIENT_RECT}
      >
        <FontAwesome
          id="settings-cog"
          icon="cog"
          style={style.assetsIcon}
          title={msg.settings()}
          onClick={this.state.canOpen ? this.open : undefined}
        />
        <Portal
          closeOnEsc
          closeOnOutsideClick
          isOpened={this.state.open}
          beforeClose={this.beforeClose}
        >
          <SettingsMenu
            targetRect={this.iconRect}
            handleClose={this.close}
          />
        </Portal>
      </span>
    );
  }
}
export default Radium(SettingsCog);
