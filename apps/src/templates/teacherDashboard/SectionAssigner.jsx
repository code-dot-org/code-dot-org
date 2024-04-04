import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import MultipleAssignButton from '@cdo/apps/templates/MultipleAssignButton';
import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {sectionForDropdownShape} from './shapes';
import TeacherSectionSelector from './TeacherSectionSelector';

class SectionAssigner extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    showAssignButton: PropTypes.bool,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    forceReload: PropTypes.bool,
    isAssigningCourse: PropTypes.bool,
    isStandAloneUnit: PropTypes.bool,
    participantAudience: PropTypes.string,
    // Redux provided
    selectSection: PropTypes.func.isRequired,
    selectedSectionId: PropTypes.number,
    assignmentName: PropTypes.string,
  };

  onChangeSection = sectionId => {
    this.props.selectSection(sectionId);
  };

  state = {
    confirmationMessageOpen: false,
  };

  onReassignConfirm = () => {
    this.setState({
      confirmationMessageOpen: true,
    });
    setTimeout(() => {
      this.setState({
        confirmationMessageOpen: false,
      });
    }, 15000);
  };

  render() {
    const {
      sections,
      showAssignButton,
      courseOfferingId,
      courseVersionId,
      courseId,
      scriptId,
      selectedSectionId,
      forceReload,
      assignmentName,
      isAssigningCourse,
      isStandAloneUnit,
      participantAudience,
    } = this.props;
    const selectedSection = sections.find(
      section => section.id === selectedSectionId
    );

    return (
      <div style={styles.section}>
        <div style={styles.label}>
          <div>{i18n.currentSection()}</div>
          {this.state.confirmationMessageOpen && (
            <span style={styles.confirmText}>{i18n.assignSuccess()}</span>
          )}
        </div>
        <div style={styles.content}>
          <TeacherSectionSelector
            sections={sections}
            onChangeSection={this.onChangeSection}
            selectedSection={selectedSection}
            forceReload={forceReload}
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
            unitId={scriptId}
          />
          {selectedSection && showAssignButton && (
            <MultipleAssignButton
              sectionId={selectedSection.id}
              courseOfferingId={courseOfferingId}
              courseVersionId={courseVersionId}
              courseId={courseId}
              scriptId={scriptId}
              assignmentName={assignmentName}
              sectionName={selectedSection.name}
              reassignConfirm={this.onReassignConfirm}
              isAssigningCourse={isAssigningCourse}
              isStandAloneUnit={isStandAloneUnit}
              participantAudience={participantAudience}
            />
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  section: {
    marginBottom: 10,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    width: '100%',
    fontSize: 16,
    ...fontConstants['main-font-semi-bold'],
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
  },
  confirmText: {
    fontSize: 12,
    ...fontConstants['main-font-regular'],
  },
};

export const UnconnectedSectionAssigner = SectionAssigner;

export default connect(
  state => ({
    selectedSectionId: state.teacherSections.selectedSectionId,
  }),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    },
  })
)(SectionAssigner);
