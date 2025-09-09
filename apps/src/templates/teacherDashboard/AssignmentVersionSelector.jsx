import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import GlobalEditionWrapper from '@cdo/apps/templates/GlobalEditionWrapper';
import i18n from '@cdo/locale';

import PopUpMenu, {STANDARD_PADDING} from '../../sharedComponents/PopUpMenu';

import AssignmentVersionMenuHeader from './AssignmentVersionMenuHeader';
import AssignmentVersionMenuItem, {
  columnWidths,
} from './AssignmentVersionMenuItem';
import {assignmentCourseVersionShape} from './shapes';

const menuItemWidth = _(columnWidths).values().reduce(_.add);
const menuWidth = menuItemWidth + 2 * STANDARD_PADDING;

export function AssignmentVersionSelector({
  dropdownStyle,
  onChangeVersion,
  selectedCourseVersionId,
  courseVersions,
  courseFilters,
  disabled,
  rightJustifiedPopupMenu,
}) {
  const selectRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [targetPoint, setTargetPoint] = useState({top: 0, left: 0});
  const [filteredVersions, setFilteredVersions] = useState([]);

  // Filter the offerings based on the filters provided
  useEffect(() => {
    const languageFilter = courseFilters?.language;

    const data = courseVersions;

    if (languageFilter) {
      for (const [key, versionInfo] of Object.entries(data)) {
        if (!versionInfo.locale_codes.includes(languageFilter)) {
          delete data[key];
        }
      }
    }

    setFilteredVersions(data);
  }, [courseVersions, courseFilters?.language]);

  const handleMouseDown = e => {
    // Prevent the native dropdown menu from opening.
    e.preventDefault();
  };

  const handleClick = e => {
    e.stopPropagation();
    if (!isMenuOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  };

  const openMenu = () => {
    const rect = selectRef.current.getBoundingClientRect();
    const newTargetPoint = {
      top: rect.bottom + window.pageYOffset,
      left: rect.left + window.pageXOffset,
    };
    setIsMenuOpen(true);
    setTargetPoint(newTargetPoint);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNativeDropdownChange = event => {
    const version = event.target.value;
    onChangeVersion(version.id);
  };

  const chooseMenuItem = version => {
    onChangeVersion(version.id);
    closeMenu();
  };

  const popupMenuXOffset = rightJustifiedPopupMenu ? -menuWidth / 2 : 0;
  const menuOffset = {
    x: popupMenuXOffset,
    y: 0,
  };

  const orderedCourseVersions = _.orderBy(filteredVersions, 'key', 'desc');

  return (
    <span style={styles.version} id="uitest-version-selector">
      <label style={styles.dropdownLabel} htmlFor="assignment-version-year">
        {i18n.assignmentSelectorVersion()}
      </label>
      <select
        id="assignment-version-year"
        value={selectedCourseVersionId}
        onChange={handleNativeDropdownChange}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={dropdownStyle}
        disabled={disabled}
        ref={selectRef}
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
        isOpen={isMenuOpen}
        targetPoint={targetPoint}
        offset={menuOffset}
        style={styles.popUpMenuStyle}
        onClose={closeMenu}
      >
        <AssignmentVersionMenuHeader />
        {Object.values(orderedCourseVersions).map(version => (
          <AssignmentVersionMenuItem
            selectedCourseVersionId={selectedCourseVersionId}
            courseVersion={version}
            onClick={() => chooseMenuItem(version)}
            key={version.id}
          />
        ))}
      </PopUpMenu>
    </span>
  );
}

AssignmentVersionSelector.propTypes = {
  dropdownStyle: PropTypes.object,
  onChangeVersion: PropTypes.func.isRequired,
  selectedCourseVersionId: PropTypes.number,
  courseVersions: PropTypes.objectOf(assignmentCourseVersionShape),
  courseFilters: PropTypes.object,
  disabled: PropTypes.bool,
  rightJustifiedPopupMenu: PropTypes.bool,
};

const styles = {
  version: {
    display: 'inline-block',
    marginTop: 4,
  },
  dropdownLabel: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: '16px',
  },
  popUpMenuStyle: {
    // must appear in front of .modal from application.scss
    zIndex: 1051,
    maxWidth: null,
    width: menuWidth,
  },
};

/**
 * This is a version of the course version dropdown that is overridable by a region
 * configuration.
 *
 * This is done via a configuration in, for instance, /config/global_editions/fa.yml
 * via a paths rule such as:
 *
 * ```
 * pages:
 *   # All pages
 *   - path: /
 *     components:
 *       LtiFeedbackBanner: false
 *       AssignmentVersionSelector:
 *         courseFilters:
 *           language: fa-IR
 * ```
 */
const RegionalAssignmentVersionSelector = props => (
  <GlobalEditionWrapper
    component={AssignmentVersionSelector}
    componentId="AssignmentVersionSelector"
    props={props}
  />
);

export default RegionalAssignmentVersionSelector;
