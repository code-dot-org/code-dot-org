import FontAwesome from './../FontAwesome';
import React from 'react';
import {connect} from 'react-redux';
import {
  switchToSection,
  recordSwitchToSection,
  recordOpenEditSectionDetails
} from './sectionHelpers';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SmallChevronLink from '../SmallChevronLink';
import {ReloadAfterEditSectionDialog} from './EditSectionDialog';
import {
  beginEditingSection,
  getAssignmentName,
  sectionsForDropdown
} from './teacherSectionsRedux';
import {
  sectionShape,
  sectionForDropdownShape
} from '@cdo/apps/templates/teacherDashboard/shapes';
import Button from '../Button';
import DropdownButton from '../DropdownButton';

const styles = {
  sectionPrompt: {
    fontWeight: 'bold'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column-reverse'
  },
  buttonSection: {
    display: 'flex'
  },
  buttonWithMargin: {
    marginRight: '5px'
  }
};

class TeacherDashboardHeader extends React.Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    selectedSection: sectionShape.isRequired,
    openEditSectionDialog: PropTypes.func.isRequired,
    assignmentName: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.getDropdownOptions = this.getDropdownOptions.bind(this);
  }
  getDropdownOptions(optionMetricName) {
    let self = this;

    let options = self.props.sections.map(function(section, i) {
      let optionOnClick = () => {
        switchToSection(section.id, self.props.selectedSection.id);
        recordSwitchToSection(
          section.id,
          self.props.selectedSection.id,
          optionMetricName
        );
      };
      let icon = undefined;
      if (section.id === self.props.selectedSection.id) {
        icon = <FontAwesome icon="check" />;
      }
      return (
        <a key={i} id={section.id} onClick={optionOnClick}>
          {icon} {section.name}
        </a>
      );
    });
    return options;
  }

  render() {
    return (
      <div>
        <SmallChevronLink
          link="/home#classroom-sections"
          linkText={i18n.viewAllSections()}
          isRtl={true}
          chevronSide="left"
        />
        <div style={styles.header}>
          <div>
            <h1>{this.props.selectedSection.name}</h1>
            {this.props.assignmentName && (
              <div id="assignment-name">
                <span style={styles.sectionPrompt}>
                  {i18n.assignedToWithColon()}{' '}
                </span>
                {this.props.assignmentName}
              </div>
            )}
          </div>
          <div style={styles.rightColumn}>
            <div style={styles.buttonSection}>
              <Button
                __useDeprecatedTag
                onClick={() => {
                  this.props.openEditSectionDialog(
                    this.props.selectedSection.id
                  );
                  recordOpenEditSectionDetails(
                    this.props.selectedSection.id,
                    'dashboard_header'
                  );
                }}
                icon="gear"
                size="narrow"
                color="gray"
                text={i18n.editSectionDetails()}
                style={styles.buttonWithMargin}
              />
              <DropdownButton
                size="narrow"
                color="gray"
                text={i18n.switchSection()}
              >
                {this.getDropdownOptions('from_button_switch_section')}
              </DropdownButton>
            </div>
          </div>
        </div>
        <ReloadAfterEditSectionDialog />
      </div>
    );
  }
}

export const UnconnectedTeacherDashboardHeader = TeacherDashboardHeader;

export default connect(
  state => {
    let sections = sectionsForDropdown(
      state.teacherSections,
      null,
      null,
      false,
      false
    );
    let selectedSectionId = state.teacherSections.selectedSectionId;
    let selectedSection = state.teacherSections.sections[selectedSectionId];
    let assignmentName = getAssignmentName(state, selectedSectionId);
    return {sections, selectedSection, assignmentName};
  },
  dispatch => {
    return {
      openEditSectionDialog: id => dispatch(beginEditingSection(id))
    };
  }
)(TeacherDashboardHeader);
