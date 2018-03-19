import React, {PropTypes} from 'react';
import commonStyles from '../../commonStyles';
import Radium from 'radium';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import {connect} from "react-redux";
import throttle from "lodash/debounce";
import styleConstants from "../../styleConstants";

const styles = {
  copyElementToScreenButton: {
    backgroundColor: '#0aa',
    color: 'white',
    float: 'right'
  },
  screen: {
  },
};

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

  getResizeListener() {
    if (!this.resizeListener) {
      this.resizeListener = throttle(this.updateMenuLocation, 50);
    }
    return this.resizeListener;
  }

  updateMenuLocation = () => {
    const rect = this.element.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    if (windowWidth > styleConstants['content-width']) { // Accounts for resizing when page is not scrollable
      this.setState({
        menuTop: rect.bottom + window.pageYOffset,
        menuLeft: rect.left - rect.width - (windowWidth - this.state.currWindowWidth)/2,
        currWindowWidth : window.innerWidth});
    } else { // Accounts for scrolling or resizing when scrollable
      this.setState({
        menuTop: rect.bottom + window.pageYOffset,
        menuLeft: rect.left - rect.width + window.pageXOffset});
    }
  };

  handleDropdownClick = (event) => {
    if (this.state.opened) {
      window.removeEventListener("resize", this.getResizeListener());
    } else {
      window.addEventListener("resize", this.getResizeListener());
      this.updateMenuLocation();
    }
    this.setState({opened: !this.state.opened});
  };

  render() {
    const targetPoint = {top: this.state.menuTop, left: this.state.menuLeft};
    const otherScreens = this.props.screenIds
        .filter((screenId) => screenId !== this.props.currentScreenId)
        .map((screenId) => function(screenId) {
          return (
              <PopUpMenu.Item onClick={this.props.handleCopyElementToScreen(screenId)}>Screen: {screenId}</PopUpMenu.Item>
          );
        });

    return (
        <div style={styles.main} ref={element => this.element = element}>
          <button style={[commonStyles.button, styles.copyElementToScreenButton]}
                  onClick={this.handleDropdownClick}>
            Copy to screen <i className="fa fa-chevron-down" />
          </button>
          <PopUpMenu
              isOpen={this.state.opened}
              targetPoint={targetPoint}
              beforeClose={this.close}>
            {otherScreens}
            <PopUpMenu.Item onClick={() => {}}>One more that does nothing: {otherScreens.length}</PopUpMenu.Item>
          </PopUpMenu>
        </div>
    );
  }
}

export default connect(function propsFromStore(state) {
  return {
    currentScreenId: state.screens.currentScreenId,
  };
})(Radium(CopyElementToScreenButton));
