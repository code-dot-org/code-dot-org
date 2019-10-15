import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import SectionSelectionMenuItem from './SectionSelectionMenuItem';
import {sectionForDropdownShape} from './shapes';
import SmallChevronLink from '@cdo/apps/templates/SmallChevronLink';

const styles = {
  addNewSection: {
    borderTop: `1px solid ${color.charcoal}`,
    paddingTop: 16,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12
  }
};

export default class SectionSelectionDropdown extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    selectedSection: PropTypes.object,
    selectSection: PropTypes.func
  };

  state = {
    selectedSection: this.props.selectedSection,
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

  beforeClose = (node, resetPortalState) => {
    resetPortalState();
    this.closeMenu();
    // Work around a bug in react-portal. see SettingsCog.jsx for details.
    window.setTimeout(() => {
      this.setState({canMenuOpen: true});
    });
  };

  closeMenu() {
    this.setState({isMenuOpen: false});
  }

  setSelectedSection = section => {
    this.setState({selectedSection: section});
  };

  onChangeSection = event => {
    const {sections} = this.props;
    const sectionId = parseInt(event.target.value);
    const section = sections.find(section => section.id === sectionId);
    this.setSelectedSection(section);
    if (!this.state.isMenuOpen && this.state.canMenuOpen) {
      this.openMenu();
    }
  };

  chooseMenuItem = section => {
    const {sections} = this.props;
    const selectedSection = sections.find(s => s.id === section.id);
    this.setSelectedSection(selectedSection);
    this.closeMenu();
  };

  render() {
    const {sections} = this.props;
    const {selectedSection} = this.state;
    const menuOffset = {x: 0, y: 0};

    return (
      <div>
        <select
          value={selectedSection.id}
          onChange={this.onChangeSection}
          disabled={false}
          ref={select => (this.select = select)}
          onClick={this.handleClick}
          onMouseDown={this.handleMouseDown}
        >
          {sections.map(section => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
        <PopUpMenu
          isOpen={this.state.isMenuOpen}
          targetPoint={this.state.targetPoint}
          beforeClose={this.beforeClose}
          offset={menuOffset}
        >
          {sections.map(section => (
            <SectionSelectionMenuItem
              section={section}
              onClick={() => this.chooseMenuItem(section)}
              key={section.id}
            />
          ))}
          <div style={styles.addNewSection}>
            <SmallChevronLink
              link={'/home'}
              linkText={i18n.addNewSection()}
              isRtl={false}
            />
          </div>
        </PopUpMenu>
      </div>
    );
  }
}
