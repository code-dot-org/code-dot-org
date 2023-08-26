import React from 'react';
import applabMsg from '@cdo/applab/locale';
import commonStyles from '../../commonStyles';
import PropTypes from 'prop-types';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import {connect} from 'react-redux';
import throttle from 'lodash/debounce';
import style from './copy-element-to-screen-button.module.scss';

/**
 * A duplicate button that helps replicate elements
 */
class CopyElementToScreenButton extends React.Component {
  static propTypes = {
    // From connect
    currentScreenId: PropTypes.string.isRequired,

    // Passed explicitly
    handleCopyElementToScreen: PropTypes.func.isRequired,
    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  state = {
    opened: false,
    menuTop: 0, // location of dropdown menu
    menuLeft: 0,
    currWindowWidth: window.innerWidth, // used to calculate location of menu on resize
  };

  // Overrides base class implementation
  setState(newState) {
    if (newState.opened && !this.resizeListener) {
      this.resizeListener = throttle(this.updateMenuLocation, 50);
      window.addEventListener('resize', this.resizeListener);
      let loc = this.getMenuLocation();
      newState.menuTop = loc.menuTop;
      newState.menuLeft = loc.menuLeft;
    } else if (!newState.opened && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }
    super.setState(newState);
  }

  getMenuLocation() {
    const rect = this.element.firstChild.getBoundingClientRect();
    return {
      menuTop: rect.bottom + window.pageYOffset,
      menuLeft: rect.left + window.pageXOffset,
    };
  }

  updateMenuLocation = () => {
    this.setState(this.getMenuLocation());
  };

  handleDropdownClick = event => {
    this.setState({opened: !this.state.opened});
  };

  handleMenuClick = screenId => {
    this.closeMenu();
    this.props.handleCopyElementToScreen(screenId);
  };

  closeMenu() {
    this.state.opened && this.setState({opened: false});
  }

  onClose = () => {
    this.closeMenu();
  };

  render() {
    const targetPoint = {top: this.state.menuTop, left: this.state.menuLeft};
    const otherScreens = this.props.screenIds
      .filter(screenId => screenId !== this.props.currentScreenId)
      .map(screenId => (
        <PopUpMenu.Item
          key={screenId}
          onClick={() => this.handleMenuClick(screenId)}
        >
          {screenId}
        </PopUpMenu.Item>
      ));

    return (
      <div className={style.main} ref={element => (this.element = element)}>
        <button
          type="button"
          style={{...commonStyles.button}}
          className={style.copyElementToScreenButton}
          onClick={this.handleDropdownClick}
        >
          {applabMsg.designWorkspace_copyToScreenButton()}
          <i className="fa fa-chevron-down" />
        </button>
        {this.state.opened && (
          <PopUpMenu
            isOpen={this.state.opened}
            targetPoint={targetPoint}
            offset={{x: 0, y: 0}}
            onClose={this.onClose}
            className={style.menu}
          >
            {otherScreens}
          </PopUpMenu>
        )}
      </div>
    );
  }
}

export default connect(function propsFromStore(state) {
  return {
    currentScreenId: state.screens.currentScreenId,
  };
})(CopyElementToScreenButton);
