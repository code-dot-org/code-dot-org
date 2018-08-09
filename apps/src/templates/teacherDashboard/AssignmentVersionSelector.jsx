import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import {assignmentVersionShape} from './shapes';
import PopUpMenu from "../../lib/ui/PopUpMenu";

const styles = {
  version: {
    display: 'inline-block',
    marginTop: 4,
  },
  dropdownLabel: {
    fontFamily: '"Gotham 5r", sans-serif',
  },
};

export default class AssignmentVersionSelector extends Component {
  static propTypes = {
    dropdownStyle: PropTypes.object,
    onChangeVersion: PropTypes.func.isRequired,
    selectedVersion: assignmentVersionShape,
    versions: PropTypes.arrayOf(assignmentVersionShape),
    disabled: PropTypes.bool,
    showVersionMenu: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      canMenuOpen: true,
      targetPoint: {top: 0, left: 0},
    };
  }

  handleMouseDown = e => {
    if (this.props.showVersionMenu) {
      // Prevent the native dropdown menu from opening.
      e.preventDefault();
    }
  };

  handleClick = () => {
    if (!this.props.showVersionMenu) {
      return;
    }

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

  beforeClose = (node, resetPortalState) => {
    resetPortalState();
    this.setState({isMenuOpen: false});
    // Work around a bug in react-portal. see SettingsCog.jsx for details.
    window.setTimeout(() => {
      this.setState({canMenuOpen: true});
    });
  };

  render() {
    const {dropdownStyle, onChangeVersion, selectedVersion, versions, disabled} = this.props;

    return (
      <span style={styles.version}>
        <div style={styles.dropdownLabel}>{i18n.assignmentSelectorVersion()}</div>
        <select
          id="assignment-version-year"
          value={selectedVersion.year}
          onChange={onChangeVersion}
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
          beforeClose={this.beforeClose}
        >
          <PopUpMenu.Item onClick={() => {}}>
            Option One
          </PopUpMenu.Item>
          <PopUpMenu.Item onClick={() => {}}>
            Option Two
          </PopUpMenu.Item>
        </PopUpMenu>
      </span>
    );
  }

}


