import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import {assignmentVersionShape} from './shapes';
import PopUpMenu, {STANDARD_PADDING} from "../../lib/ui/PopUpMenu";
import AssignmentVersionMenuItem, {columnWidths} from './AssignmentVersionMenuItem';
import AssignmentVersionMenuHeader from './AssignmentVersionMenuHeader';
import _ from 'lodash';

const menuItemWidth = _(columnWidths).values().reduce(_.add);
const menuWidth = menuItemWidth + 2 * STANDARD_PADDING;

const styles = {
  version: {
    display: 'inline-block',
    marginTop: 4,
  },
  dropdownLabel: {
    fontFamily: '"Gotham 5r", sans-serif',
  },
  popUpMenuStyle: {
    // must appear in front of .modal from application.scss
    zIndex: 1051,
    maxWidth: null,
    width: menuWidth,
  }
};

export default class AssignmentVersionSelector extends Component {
  static propTypes = {
    dropdownStyle: PropTypes.object,
    onChangeVersion: PropTypes.func.isRequired,
    versions: PropTypes.arrayOf(assignmentVersionShape),
    disabled: PropTypes.bool,
  };

  state = {
    isMenuOpen: false,
    canMenuOpen: true,
    targetPoint: {top: 0, left: 0},
  };

  handleMouseDown = e => {
    // Prevent the native dropdown menu from opening.
    e.preventDefault();
  };

  handleClick = () => {
    if (!this.state.isMenuOpen && this.state.canMenuOpen) {
      this.openMenu();
    }
  };

  openMenu() {
    const rect = this.select.getBoundingClientRect();
    const targetPoint = {
      top: rect.bottom + window.pageYOffset,
      left: rect.left + window.pageXOffset,
    };
    this.setState({isMenuOpen: true, canMenuOpen: false, targetPoint});
  }

  closeMenu() {
    this.setState({isMenuOpen: false});
  }

  beforeClose = (node, resetPortalState) => {
    resetPortalState();
    this.closeMenu();
    // Work around a bug in react-portal. see SettingsCog.jsx for details.
    window.setTimeout(() => {
      this.setState({canMenuOpen: true});
    });
  };

  handleNativeDropdownChange = event => {
    const versionYear = event.target.value;
    this.props.onChangeVersion(versionYear);
  };

  chooseMenuItem = versionYear => {
    this.props.onChangeVersion(versionYear);
    this.closeMenu();
  };

  render() {
    const {dropdownStyle, versions, disabled} = this.props;
    const selectedVersionYear = versions.find(v => v.isSelected).year;

    return (
      <span style={styles.version}>
        <div style={styles.dropdownLabel}>{i18n.assignmentSelectorVersion()}</div>
        <select
          id="assignment-version-year"
          value={selectedVersionYear}
          onChange={this.handleNativeDropdownChange}
          onMouseDown={this.handleMouseDown}
          onClick={this.handleClick}
          style={dropdownStyle}
          disabled={disabled}
          ref={select => this.select = select}
        >
          {
            versions.map(version => (
              <option
                key={version.year}
                value={version.year}
              >
                {version.isRecommended ? `${version.title} (Recommended)` : version.title}
              </option>
            ))
          }
        </select>
        <PopUpMenu
          isOpen={this.state.isMenuOpen}
          targetPoint={this.state.targetPoint}
          offset={{x: 0, y: 0}}
          style={styles.popUpMenuStyle}
          beforeClose={this.beforeClose}
        >
          <AssignmentVersionMenuHeader/>
          {
            versions.map(version => (
              <AssignmentVersionMenuItem
                version={version}
                onClick={() => this.chooseMenuItem(version.year)}
                key={version.year}
              />
            ))
          }
        </PopUpMenu>
      </span>
    );
  }

}


