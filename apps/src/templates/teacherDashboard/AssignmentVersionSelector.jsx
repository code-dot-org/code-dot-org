import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import {assignmentVersionShape} from './shapes';
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

/**
 * Given an array of versions, return that array with the same versions, plus
 * isRecommended and isSelected properties set on the recommended and selected version(s).
 * Note: This method will change the content of the versions array that is passed to it.
 * @param {Array<AssignmentVersionShape>} versions
 * @param {String} localeEnglishName. English name of user's current locale.
 * @param {String} selectedVersionYear. Currently selected version year. Optional.
 */
export const setRecommendedAndSelectedVersions = (
  versions,
  localeEnglishName = null,
  selectedVersionYear = null
) => {
  // Sort versions by year descending.
  versions = versions
    .sort((a, b) => parseInt(a.year) - parseInt(b.year))
    .reverse();

  /**
   * We recommend the user use the latest stable version that is supported in their
   * locale. If no versions support their locale, we recommend the latest stable version.
   * Versions are sorted from most to least recent, so the first stable version will be the latest.
   */
  let recommendedVersion;
  if (localeEnglishName) {
    recommendedVersion = versions.find(v => {
      const localeSupported =
        (v.locales || []).includes(localeEnglishName) ||
        localeEnglishName.toLowerCase().startsWith('en');

      return v.isStable && localeSupported;
    });
  }
  recommendedVersion = recommendedVersion || versions.find(v => v.isStable);
  if (recommendedVersion) {
    recommendedVersion.isRecommended = true;
  }

  const selectedVersion =
    versions.find(v => v.year === selectedVersionYear) ||
    recommendedVersion ||
    versions[0];
  if (selectedVersion) {
    selectedVersion.isSelected = true;
  }

  return versions;
};

export default class AssignmentVersionSelector extends Component {
  static propTypes = {
    dropdownStyle: PropTypes.object,
    onChangeVersion: PropTypes.func.isRequired,
    versions: PropTypes.arrayOf(assignmentVersionShape),
    disabled: PropTypes.bool,
    rightJustifiedPopupMenu: PropTypes.bool
  };

  state = {
    isMenuOpen: false,
    canMenuOpen: true,
    targetPoint: {top: 0, left: 0}
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
      left: rect.left + window.pageXOffset
    };
    this.setState({isMenuOpen: true, canMenuOpen: false, targetPoint});
  }

  closeMenu() {
    this.setState({isMenuOpen: false});
  }

  onClose = () => {
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

    const popupMenuXOffset = this.props.rightJustifiedPopupMenu
      ? -menuWidth / 2
      : 0;
    const menuOffset = {x: popupMenuXOffset, y: 0};

    return (
      <span style={styles.version} id="uitest-version-selector">
        <div style={styles.dropdownLabel}>
          {i18n.assignmentSelectorVersion()}
        </div>
        <select
          id="assignment-version-year"
          value={selectedVersionYear}
          onChange={this.handleNativeDropdownChange}
          onMouseDown={this.handleMouseDown}
          onClick={this.handleClick}
          style={dropdownStyle}
          disabled={disabled}
          ref={select => (this.select = select)}
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
          isOpen={this.state.isMenuOpen}
          targetPoint={this.state.targetPoint}
          offset={menuOffset}
          style={styles.popUpMenuStyle}
          onClose={this.onClose}
        >
          <AssignmentVersionMenuHeader />
          {versions.map(version => (
            <AssignmentVersionMenuItem
              version={version}
              onClick={() => this.chooseMenuItem(version.year)}
              key={version.year}
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
