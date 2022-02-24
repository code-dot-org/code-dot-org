import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {sectionForDropdownShape} from './shapes';
import TeacherSectionSelector from './TeacherSectionSelector';
import AssignButton from '@cdo/apps/templates/AssignButton';
import UnassignSectionButton from '@cdo/apps/templates/UnassignSectionButton';
import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

class SectionAssigner extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    showAssignButton: PropTypes.bool,
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    forceReload: PropTypes.bool,
    buttonLocationAnalytics: PropTypes.string,
    // Redux provided
    selectSection: PropTypes.func.isRequired,
    selectedSectionId: PropTypes.number,
    assignmentName: PropTypes.string
  };

  onChangeSection = sectionId => {
    this.props.selectSection(sectionId);
  };

  render() {
    const {
      sections,
      showAssignButton,
      courseId,
      scriptId,
      selectedSectionId,
      forceReload,
      assignmentName,
      buttonLocationAnalytics
    } = this.props;
    const selectedSection = sections.find(
      section => section.id === selectedSectionId
    );

    return (
      <div style={styles.section}>
        <div style={styles.label}>{i18n.currentSection()}</div>
        <div style={styles.content}>
          <TeacherSectionSelector
            sections={sections}
            onChangeSection={this.onChangeSection}
            selectedSection={selectedSection}
            forceReload={forceReload}
            courseId={courseId}
            scriptId={scriptId}
          />
          {selectedSection && selectedSection.isAssigned && (
            <UnassignSectionButton
              courseName={assignmentName}
              sectionId={selectedSection.id}
              buttonLocationAnalytics={buttonLocationAnalytics}
            />
          )}
          {selectedSection &&
            !selectedSection.isAssigned &&
            showAssignButton && (
              <AssignButton
                sectionId={selectedSection.id}
                courseId={courseId}
                scriptId={scriptId}
                assignmentName={assignmentName}
                sectionName={selectedSection.name}
              />
            )}
        </div>
      </div>
    );
  }
}

const styles = {
  section: {
    marginBottom: 10
  },
  content: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    width: '100%',
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    paddingTop: 10,
    paddingBottom: 10
  }
};

export const UnconnectedSectionAssigner = SectionAssigner;

export default connect(
  state => ({
    selectedSectionId: state.teacherSections.selectedSectionId
  }),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    }
  })
)(SectionAssigner);
