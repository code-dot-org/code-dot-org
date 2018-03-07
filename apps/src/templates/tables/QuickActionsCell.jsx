import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import color from "../../util/color";
import PopUpMenu from "@cdo/apps/lib/ui/PopUpMenu";
import styleConstants from '../../styleConstants';
import throttle from 'lodash/debounce';
import FontAwesome from '../FontAwesome';

export const QuickActionsCellType = {
  header: 'header',
  body: 'body'
};

const styles = {
  actionButton: {
    [QuickActionsCellType.body]: {
      border: '1px solid ' + color.white,
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 4,
      paddingBottom: 4,
      borderRadius: 5,
      color: color.lighter_gray,
      margin: 3,
      cursor: 'pointer',
    },
    [QuickActionsCellType.header]: {
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 4,
      paddingBottom: 4,
      fontSize: 20,
      marginTop: -3,
      color: color.darker_gray,
      cursor: 'pointer',
    }
  },
  hoverFocus: {
    [QuickActionsCellType.body]: {
      backgroundColor: color.lighter_gray,
      border: '1px solid ' + color.light_gray,
      borderRadius: 5,
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 5,
      paddingRight: 5,
      color: color.white,
    },
    [QuickActionsCellType.header]: {
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 4,
      paddingBottom: 4,
      fontSize: 20,
      // float: 'right',
      color: color.darker_gray,
      margin: 3,
      cursor: 'pointer',
    }
  },
};

class QuickActionsCell extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.array
    ]).isRequired,
    type: PropTypes.oneOf(Object.keys(QuickActionsCellType))
  };

  static defaultProps = {
    type: 'body'
  };

  state = {
    open: false,
    canOpen: true,
    menuTop: 0, // location of dropdown menu
    menuLeft: 0,
    currWindowWidth: window.innerWidth, // used to calculate location of menu on resize
  };

  // Menu open
  open = () => {
    this.updateMenuLocation();
    window.addEventListener("resize", throttle(this.updateMenuLocation, 50));
    this.setState({open: true, canOpen: false});
  };

  // Menu closed
  close = () => {
    window.removeEventListener("resize", throttle(this.updateMenuLocation, 50));
    this.setState({open: false});
  };

  // Menu closed
  beforeClose = (_, resetPortalState) => {
    resetPortalState();
    this.setState({
      open: false,
      canOpen: true});
  };

  updateMenuLocation = () => {
    const rect = this.icon.getBoundingClientRect();
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

  render() {
    const {type} = this.props;
    const targetPoint = {top: this.state.menuTop, left: this.state.menuLeft};

    const icons = {
      header: 'cog',
      body: 'chevron-down'
    };

    return (
      <span ref={span => this.icon = span}>
        <FontAwesome
          icon={icons[type]}
          style={this.state.open ? styles.hoverFocus[type] : styles.actionButton[type]}
          onClick={this.state.canOpen ? this.open : undefined}
          className="ui-test-section-dropdown"
        />
        <PopUpMenu
          targetPoint={targetPoint}
          isOpen={this.state.open}
          beforeClose={this.beforeClose}
          showTail={false}
        >
          {this.props.children}
        </PopUpMenu>
      </span>
    );
  }
}

export default Radium(QuickActionsCell);
