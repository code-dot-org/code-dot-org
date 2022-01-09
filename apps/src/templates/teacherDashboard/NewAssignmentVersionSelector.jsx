import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import {assignmentCourseVersionShape, assignmentVersionShape} from './shapes';
import PopUpMenu, {STANDARD_PADDING} from '../../lib/ui/PopUpMenu';
import AssignmentVersionMenuItem, {
  columnWidths
} from './AssignmentVersionMenuItem';
import AssignmentVersionMenuHeader from './AssignmentVersionMenuHeader';
import _ from 'lodash';

const menuItemWidth = _(columnWidths)
  .values()
  .reduce(_.add);
const menuWidth = menuItemWidth + 2 * STANDARD_PADDING;

export default function NewAssignmentVersionSelector(props) {
  const {
    dropdownStyle,
    disabled,
    selectedCourseVersion,
    onChangeVersion,
    versions,
    rightJustifiedPopupMenu
  } = props;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [targetPoint, setTargetPoint] = useState({top: 0, left: 0});

  const handleMouseDown = e => {
    // Prevent the native dropdown menu from opening.
    e.preventDefault();
  };

  const handleClick = () => {
    if (!isMenuOpen) {
      openMenu();
    }
  };

  const openMenu = () => {
    const rect = this.select.getBoundingClientRect();
    const targetPoint = {
      top: rect.bottom + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
    setIsMenuOpen(true);
    setTargetPoint(targetPoint);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNativeDropdownChange = event => {
    const versionYear = event.target.value;
    onChangeVersion(versionYear);
  };

  const chooseMenuItem = versionYear => {
    onChangeVersion(versionYear);
    closeMenu();
  };

  const popupMenuXOffset = rightJustifiedPopupMenu ? -menuWidth / 2 : 0;
  const menuOffset = {
    x: popupMenuXOffset,
    y: 0
  };

  return (
    <span style={styles.version} id="uitest-version-selector">
      <div style={styles.dropdownLabel}>{i18n.assignmentSelectorVersion()}</div>
      <select
        id="assignment-version-year"
        value={selectedCourseVersion}
        onChange={handleNativeDropdownChange}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={dropdownStyle}
        disabled={disabled}
      >
        {versions.map(version => (
          <option key={version.year} value={version.year}>
            {version.isRecommended
              ? `${version.title} (${i18n.recommended()})`
              : version.title}
          </option>
        ))}
      </select>
      <PopUpMenu
        isOpen={isMenuOpen}
        targetPoint={targetPoint}
        offset={menuOffset}
        style={styles.popUpMenuStyle}
        onClose={closeMenu}
      >
        <AssignmentVersionMenuHeader />
        {versions.map(version => (
          <AssignmentVersionMenuItem
            version={version}
            onClick={() => chooseMenuItem(version.year)}
            key={version.year}
          />
        ))}
      </PopUpMenu>
    </span>
  );
}

NewAssignmentVersionSelector.propTypes = {
  dropdownStyle: PropTypes.object,
  selectedCourseVersion: PropTypes.objectOf(assignmentCourseVersionShape),
  onChangeVersion: PropTypes.func.isRequired,
  versions: PropTypes.arrayOf(assignmentVersionShape),
  disabled: PropTypes.bool,
  rightJustifiedPopupMenu: PropTypes.bool
};

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
