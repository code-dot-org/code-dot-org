import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {sectionForDropdownShape} from './shapes';
import TeacherSectionSelector from './TeacherSectionSelector';
import AssignButton from '@cdo/apps/templates/AssignButton';
import UnassignButton from '@cdo/apps/templates/UnassignButton';
import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

class SectionAssigner extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    showAssignButton: PropTypes.bool,
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    forceReload: PropTypes.bool,
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
      assignmentName
    } = this.props;
    const selectedSection = sections.find(
      section => section.id === selectedSectionId
    );

    return (
      <div>
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
            <UnassignButton sectionId={selectedSection.id} />
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
  content: {
    display: 'flex'
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
    selectedSectionId: parseInt(state.teacherSections.selectedSectionId)
  }),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    }
  })
)(SectionAssigner);
