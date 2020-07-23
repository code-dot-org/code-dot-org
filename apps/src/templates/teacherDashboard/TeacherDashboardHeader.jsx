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
import {beginEditingSection, getAssignmentName} from './teacherSectionsRedux';
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
    sections: PropTypes.object.isRequired,
    selectedSectionId: PropTypes.number.isRequired,
    openEditSectionDialog: PropTypes.func.isRequired,
    assignmentName: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.getDropdownOptions = this.getDropdownOptions.bind(this);
    this.selectedSection = this.props.sections[this.props.selectedSectionId];
  }
  getDropdownOptions(optionMetricName) {
    let self = this;
    let visibleSections = Object.entries(this.props.sections)
      .filter(([sectionId, section]) => !section.hidden)
      .reduce((visibleSections, filteredEntry) => {
        visibleSections[filteredEntry[0]] = filteredEntry[1];
        return visibleSections;
      }, {});

    let options = Object.keys(visibleSections).map(function(key, i) {
      let section = visibleSections[key];
      let optionOnClick = () => {
        switchToSection(section.id, self.selectedSection.id);
        recordSwitchToSection(
          section.id,
          self.selectedSection.id,
          optionMetricName
        );
      };
      let icon = undefined;
      if (section.id === self.selectedSection.id) {
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
            <h1>{this.selectedSection.name}</h1>
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
                  this.props.openEditSectionDialog(this.selectedSection.id);
                  recordOpenEditSectionDetails(
                    this.selectedSection.id,
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
    let sections = state.teacherSections.sections;
    let selectedSectionId = state.teacherSections.selectedSectionId;
    let assignmentName = getAssignmentName(state, selectedSectionId);
    return {sections, selectedSectionId, assignmentName};
  },
  dispatch => {
    return {
      openEditSectionDialog: id => dispatch(beginEditingSection(id))
    };
  }
)(TeacherDashboardHeader);
