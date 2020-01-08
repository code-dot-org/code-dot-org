import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import TeacherSectionSelectorMenuItem from './TeacherSectionSelectorMenuItem';
import {sectionForDropdownShape} from './shapes';
import {getVisibleSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import SmallChevronLink from '@cdo/apps/templates/SmallChevronLink';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {reload} from '../../utils';
import queryString from 'query-string';
import Button from '../Button';

class SelectSectionButton extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    onChangeSection: PropTypes.func.isRequired,
    // We need to reload on section change on the script overview page to get
    // accurate information about students in the selected section.
    forceReload: PropTypes.bool,
  };

  state = {
    isMenuOpen: false,
    canMenuOpen: true,
    targetPoint: {top: 0, left: 0}
  };

  handleClick = () => {
    if (!this.state.isMenuOpen && this.state.canMenuOpen) {
      this.openMenu();
    }
  };

  openMenu() {
    const rect = this.button.getBoundingClientRect();
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
    if (this.props.forceReload) {
      reload();
    }
    this.closeMenu();
  };

  render() {
    const sections = this.props.sections;
    const menuOffset = {x: 0, y: 0};

    return (
      <div>
        <Button
          pseudoRef={button => (this.button = button)}
          onClick={this.handleClick}
          icon="chevron-down"
          size="default"
          color="gray"
          text="Select section"
        />
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
        </PopUpMenu>
      </div>
    );
  }
}

export default connect(state => ({
    sections: getVisibleSections(state),
}))(SelectSectionButton)
