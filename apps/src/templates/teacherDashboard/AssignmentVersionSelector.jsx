import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import i18n from '@cdo/locale';

import PopUpMenu, {STANDARD_PADDING} from '../../sharedComponents/PopUpMenu';

import AssignmentVersionMenuHeader from './AssignmentVersionMenuHeader';
import AssignmentVersionMenuItem, {
  columnWidths,
} from './AssignmentVersionMenuItem';
import {assignmentCourseVersionShape} from './shapes';

const menuItemWidth = _(columnWidths).values().reduce(_.add);
const menuWidth = menuItemWidth + 2 * STANDARD_PADDING;

export default class AssignmentVersionSelector extends Component {
  static propTypes = {
    dropdownStyle: PropTypes.object,
    onChangeVersion: PropTypes.func.isRequired,
    selectedCourseVersionId: PropTypes.number,
    courseVersions: PropTypes.objectOf(assignmentCourseVersionShape),
    disabled: PropTypes.bool,
    rightJustifiedPopupMenu: PropTypes.bool,
  };

  state = {
    isMenuOpen: false,
    targetPoint: {top: 0, left: 0},
  };

  handleMouseDown = e => {
    // Prevent the native dropdown menu from opening.
    e.preventDefault();
  };

  handleClick = e => {
    e.stopPropagation();
    if (!this.state.isMenuOpen) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  };

  openMenu() {
    const rect = this.select.getBoundingClientRect();
    const targetPoint = {
      top: rect.bottom + window.pageYOffset,
      left: rect.left + window.pageXOffset,
    };
    this.setState({
      isMenuOpen: true,
      targetPoint,
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
    const {dropdownStyle, courseVersions, disabled, selectedCourseVersionId} =
      this.props;

    const popupMenuXOffset = this.props.rightJustifiedPopupMenu
      ? -menuWidth / 2
      : 0;
    const menuOffset = {
      x: popupMenuXOffset,
      y: 0,
    };

    let orderedCourseVersions = _.orderBy(courseVersions, 'key', 'desc');

    return (
      <span style={styles.version} id="uitest-version-selector">
        <div style={styles.dropdownLabel}>
          {i18n.assignmentSelectorVersion()}
        </div>
        <select
          id="assignment-version-year"
          value={selectedCourseVersionId}
          onChange={this.handleNativeDropdownChange}
          onMouseDown={this.handleMouseDown}
          onClick={this.handleClick}
          style={dropdownStyle}
          disabled={disabled}
          ref={select => (this.select = select)}
        >
          {Object.values(orderedCourseVersions).map(version => (
            <option key={version.id} value={version.id}>
              {version.is_recommended
                ? `${version.version_year} (${i18n.recommended()})`
                : version.version_year}
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
          {Object.values(orderedCourseVersions).map(version => (
            <AssignmentVersionMenuItem
              selectedCourseVersionId={selectedCourseVersionId}
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
    marginTop: 4,
  },
  dropdownLabel: {
    ...fontConstants['main-font-semi-bold'],
  },
  popUpMenuStyle: {
    // must appear in front of .modal from application.scss
    zIndex: 1051,
    maxWidth: null,
    width: menuWidth,
  },
};
