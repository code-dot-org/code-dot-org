import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import TeacherSectionSelectorMenuItem from './TeacherSectionSelectorMenuItem';
import {sectionForDropdownShape} from './shapes';
import SmallChevronLink from '@cdo/apps/templates/SmallChevronLink';
import FontAwesome from './../FontAwesome';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {reload} from '../../utils';
import queryString from 'query-string';

export default class TeacherSectionSelector extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    onChangeSection: PropTypes.func.isRequired,
    // We need to reload on section change on the script overview page to get
    // accurate information about students in the selected section.
    forceReload: PropTypes.bool,
    courseOfferingId: PropTypes.number,
    courseOfferingParticipantType: PropTypes.string,
    courseVersionId: PropTypes.number,
    courseName: PropTypes.string,
    courseId: PropTypes.number,
    unitId: PropTypes.number,
    buttonLocationAnalytics: PropTypes.string
  };

  state = {
    isMenuOpen: false,
    targetPoint: {top: 0, left: 0}
  };

  handleKeyDown = e => {
    if (e.key === 'Enter') {
      this.handleClick();
    }
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
    const {
      sections,
      courseOfferingId,
      courseVersionId,
      courseName,
      courseId,
      unitId
    } = this.props;
    const menuOffset = {x: 0, y: 0};
    const queryParams = queryString.stringify({
      courseOfferingId,
      courseVersionId,
      unitId
    });

    const numAssigned = sections.filter(section => section.isAssigned).length;
    const dropdownText =
      numAssigned === 0
        ? i18n.chooseSections()
        : i18n.assignedToXSections({numAssigned});

    return (
      <div>
        <div
          className="ui-test-teacher-section-selector-dropdown"
          onClick={this.handleClick}
          onKeyDown={this.handleKeyDown}
          ref={div => (this.select = div)}
          style={styles.dropdown}
          tabIndex="0"
        >
          <span>{dropdownText}</span>
          <FontAwesome style={{marginTop: 3}} icon="caret-down" />
        </div>
        <PopUpMenu
          isOpen={this.state.isMenuOpen}
          targetPoint={this.state.targetPoint}
          onClose={this.closeMenu}
          offset={menuOffset}
        >
          {sections &&
            sections.map(section => (
              <TeacherSectionSelectorMenuItem
                section={section}
                onClick={() => this.chooseMenuItem(section)}
                key={section.id}
                courseName={courseName}
                courseId={courseId}
                unitId={unitId}
                courseOfferingId={this.props.courseOfferingId}
                courseVersionId={this.props.courseVersionId}
                buttonLocationAnalytics={this.props.buttonLocationAnalytics}
              />
            ))}
          <div style={styles.addNewSection}>
            <SmallChevronLink
              href={`/home?${queryParams}`}
              text={i18n.addNewSection()}
            />
          </div>
        </PopUpMenu>
      </div>
    );
  }
}

const styles = {
  addNewSection: {
    borderTop: `1px solid ${color.charcoal}`,
    paddingTop: 16,
    paddingBottom: 8,
    paddingLeft: 20,
    paddingRight: 12,
    width: 268
  },
  dropdown: {
    width: 286,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5,
    padding: 7,
    display: 'flex',
    justifyContent: 'space-between'
  }
};
