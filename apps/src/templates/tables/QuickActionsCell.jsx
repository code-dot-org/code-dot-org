import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../../util/color';
import PopUpMenu from '@cdo/apps/lib/ui/PopUpMenu';
import styleConstants from '../../styleConstants';
import throttle from 'lodash/debounce';
import FontAwesome from '../FontAwesome';
import firehoseClient from '@cdo/apps/lib/util/firehose';

export const QuickActionsCellType = {
  header: 'header',
  body: 'body'
};

export default class QuickActionsCell extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
    type: PropTypes.oneOf(Object.keys(QuickActionsCellType)),
    experimentDetails: PropTypes.shape({
      study: PropTypes.string,
      study_group: PropTypes.string,
      event: PropTypes.string,
      user_id: PropTypes.number,
      data_json: PropTypes.string
    })
  };

  static defaultProps = {
    type: QuickActionsCellType.body
  };

  state = {
    open: false,
    canOpen: true,
    menuTop: 0, // location of dropdown menu
    menuLeft: 0,
    currWindowWidth: window.innerWidth // used to calculate location of menu on resize
  };

  // Menu open
  open = () => {
    this.updateMenuLocation();
    window.addEventListener('resize', throttle(this.updateMenuLocation, 50));
    this.setState({open: true, canOpen: false});
    if (this.props.experimentDetails) {
      firehoseClient.putRecord(this.props.experimentDetails);
    }
  };

  // Menu closed
  close = () => {
    window.removeEventListener('resize', throttle(this.updateMenuLocation, 50));
    this.setState({open: false});
  };

  // Menu closed
  beforeClose = (_, resetPortalState) => {
    resetPortalState();
    this.setState({
      open: false,
      canOpen: true
    });
  };

  updateMenuLocation = () => {
    const rect = this.icon.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    if (windowWidth > styleConstants['content-width']) {
      // Accounts for resizing when page is not scrollable
      this.setState({
        menuTop: rect.bottom + window.pageYOffset,
        menuLeft:
          rect.left -
          rect.width -
          (windowWidth - this.state.currWindowWidth) / 2,
        currWindowWidth: window.innerWidth
      });
    } else {
      // Accounts for scrolling or resizing when scrollable
      this.setState({
        menuTop: rect.bottom + window.pageYOffset,
        menuLeft: rect.left - rect.width + window.pageXOffset
      });
    }
  };

  render() {
    const {type} = this.props;
    const targetPoint = {top: this.state.menuTop, left: this.state.menuLeft};

    const icons = {
      header: 'cog',
      body: 'chevron-down'
    };

    const styleByType =
      type === QuickActionsCellType.header
        ? styles.actionButton['header']
        : styles.actionButton['body'];

    const hoverStyle = this.state.open ? styles.hoverFocus['body'] : null;

    const iconStyle = {
      ...styles.icon,
      ...styleByType,
      ...hoverStyle
    };

    return (
      <span ref={span => (this.icon = span)}>
        <FontAwesome
          icon={icons[type]}
          style={iconStyle}
          onClick={this.state.canOpen ? this.open : undefined}
          className="ui-test-section-dropdown ui-projects-table-dropdown"
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

const styles = {
  icon: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 4,
    paddingBottom: 4,
    cursor: 'pointer'
  },
  actionButton: {
    [QuickActionsCellType.body]: {
      border: '1px solid ' + color.white,
      borderRadius: 5,
      color: color.darker_gray,
      margin: 3
    },
    [QuickActionsCellType.header]: {
      fontSize: 20,
      lineHeight: '15px',
      color: color.charcoal
    }
  },
  hoverFocus: {
    [QuickActionsCellType.body]: {
      backgroundColor: color.lighter_gray,
      border: '1px solid ' + color.light_gray,
      borderRadius: 5,
      color: color.white
    }
  }
};
