import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import TeacherSectionSelectorMenuItem from './TeacherSectionSelectorMenuItem';
import {sectionForDropdownShape} from './shapes';
import SmallChevronLink from '@cdo/apps/templates/SmallChevronLink';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {reload} from '../../utils';
import queryString from 'query-string';

export default class TeacherSectionSelector extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    selectedSection: PropTypes.object,
    onChangeSection: PropTypes.func.isRequired,
    // We need to reload on section change on the script overview page to get
    // accurate information about students in the selected section.
    forceReload: PropTypes.bool,
    courseId: PropTypes.number,
    scriptId: PropTypes.number
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

  handleNativeDropdownChange = event => {
    const selectedSectionId = parseInt(event.target.value);
    this.props.onChangeSection(selectedSectionId);
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

  chooseMenuItem = section => {
    this.props.onChangeSection(section.id);
    updateQueryParam('section_id', section.id);
    // If we have a user_id when we switch sections we should get rid of it
    updateQueryParam('user_id', undefined);
    if (this.props.forceReload) {
      reload();
    }
    this.closeMenu();
  };

  render() {
    const {sections, selectedSection, courseId, scriptId} = this.props;
    const menuOffset = {x: 0, y: 0};
    const value = selectedSection ? selectedSection.id : '';
    const queryParams = queryString.stringify({courseId, scriptId});

    return (
      <div>
        <select
          value={value}
          onChange={this.props.onChangeSection}
          ref={select => (this.select = select)}
          onClick={this.handleClick}
          onMouseDown={this.handleMouseDown}
          style={styles.select}
        >
          <option value="">{i18n.selectSectionOption()}</option>
          {sections &&
            sections.map(section => (
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
          {sections &&
            sections.map(section => (
              <TeacherSectionSelectorMenuItem
                section={section}
                onClick={() => this.chooseMenuItem(section)}
                key={section.id}
              />
            ))}
          <div style={styles.addNewSection}>
            <SmallChevronLink
              link={`/home?${queryParams}`}
              linkText={i18n.addNewSection()}
              isRtl={false}
            />
          </div>
        </PopUpMenu>
      </div>
    );
  }
}

const styles = {
  select: {
    height: 34,
    width: 300
  },
  addNewSection: {
    borderTop: `1px solid ${color.charcoal}`,
    paddingTop: 16,
    paddingBottom: 8,
    paddingLeft: 20,
    paddingRight: 12,
    width: 268
  }
};
