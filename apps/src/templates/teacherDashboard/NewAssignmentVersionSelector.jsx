import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import {assignmentCourseVersionShape} from './shapes';
import PopUpMenu, {STANDARD_PADDING} from '../../lib/ui/PopUpMenu';
import NewAssignmentVersionMenuItem, {
  columnWidths
} from './NewAssignmentVersionMenuItem';
import AssignmentVersionMenuHeader from './AssignmentVersionMenuHeader';
import _ from 'lodash';

const menuItemWidth = _(columnWidths)
  .values()
  .reduce(_.add);
const menuWidth = menuItemWidth + 2 * STANDARD_PADDING;

export default class NewAssignmentVersionSelector extends Component {
  static propTypes = {
    dropdownStyle: PropTypes.object,
    onChangeVersion: PropTypes.func.isRequired,
    selectedCourseVersion: PropTypes.object,
    courseVersions: PropTypes.arrayOf(assignmentCourseVersionShape),
    disabled: PropTypes.bool,
    rightJustifiedPopupMenu: PropTypes.bool
  };

  state = {
    isMenuOpen: false,
    targetPoint: {top: 0, left: 0}
  };

  handleMouseDown = e => {
    // Prevent the native dropdown menu from opening.
    e.preventDefault();
  };

  handleClick = () => {
    if (!this.state.isMenuOpen) {
      this.openMenu();
    }
  };

  openMenu() {
    const rect = this.select.getBoundingClientRect();
    const targetPoint = {
      top: rect.bottom + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
    this.setState({
      isMenuOpen: true,
      targetPoint
    });
  }

  closeMenu = () => this.setState({isMenuOpen: false});

  handleNativeDropdownChange = event => {
    const version = event.target.value;
    this.props.onChangeVersion(version.id);
  };

  chooseMenuItem = version => {
    this.props.onChangeVersion(version.id);
    this.closeMenu();
  };

  render() {
    const {
      dropdownStyle,
      courseVersions,
      disabled,
      selectedCourseVersion
    } = this.props;

    const popupMenuXOffset = this.props.rightJustifiedPopupMenu
      ? -menuWidth / 2
      : 0;
    const menuOffset = {
      x: popupMenuXOffset,
      y: 0
    };

    return (
      <span style={styles.version} id="uitest-version-selector">
        <div style={styles.dropdownLabel}>
          {i18n.assignmentSelectorVersion()}
        </div>
        <select
          id="assignment-version-year"
          value={selectedCourseVersion.id}
          onChange={this.handleNativeDropdownChange}
          onMouseDown={this.handleMouseDown}
          onClick={this.handleClick}
          style={dropdownStyle}
          disabled={disabled}
          ref={select => (this.select = select)}
        >
          <option key={0} value={0} />
          {courseVersions.map(version => (
            <option key={version.id} value={version.id}>
              {version.is_recommended
                ? `${version.display_name} (${i18n.recommended()})`
                : version.display_name}
            </option>
          ))}
        </select>
        <PopUpMenu
          isOpen={this.state.isMenuOpen}
          targetPoint={this.state.targetPoint}
          offset={menuOffset}
          style={styles.popUpMenuStyle}
          onClose={this.closeMenu}
        >
          <AssignmentVersionMenuHeader />
          {courseVersions.map(version => (
            <NewAssignmentVersionMenuItem
              selectedCourseVersion={selectedCourseVersion}
              courseVersion={version}
              onClick={() => this.chooseMenuItem(version)}
              key={version.id}
            />
          ))}
        </PopUpMenu>
      </span>
    );
  }
}

const styles = {
  version: {
    display: 'inline-block',
    marginTop: 4
  },
  dropdownLabel: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  popUpMenuStyle: {
    // must appear in front of .modal from application.scss
    zIndex: 1051,
    maxWidth: null,
    width: menuWidth
  }
};
