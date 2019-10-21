import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {sectionForDropdownShape} from './shapes';
import TeacherSectionSelector from './TeacherSectionSelector';
import AssignedButton from '@cdo/apps/templates/AssignedButton';
import AssignButton from '@cdo/apps/templates/AssignButton';
import {
  selectSection,
  assignCourseToSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

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
  },
  assigned: {
    color: color.level_perfect,
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    lineHeight: '36px',
    marginLeft: 10,
    verticalAlign: 'top'
  }
};

class SectionAssigner extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    initialSelectedSectionId: PropTypes.number,
    selectSection: PropTypes.func.isRequired,
    showAssignButton: PropTypes.bool,
    courseId: PropTypes.number
  };

  state = {
    selectedSection: this.props.sections.find(
      section => section.id === this.props.initialSelectedSectionId
    )
  };

  onChangeSection = sectionId => {
    const {sections} = this.props;
    const selectedSection = sections.find(section => section.id === sectionId);
    this.setSelectedSection(selectedSection);
  };

  setSelectedSection = section => {
    this.setState({selectedSection: section});
  };

  render() {
    const {sections, showAssignButton, courseId, assignmentName} = this.props;
    const {selectedSection} = this.state;

    return (
      <div>
        <div style={styles.label}>{i18n.currentSection()}</div>
        <div style={styles.content}>
          <TeacherSectionSelector
            sections={sections}
            onChangeSection={this.onChangeSection}
            selectedSection={selectedSection}
          />
          {selectedSection.isAssigned && (
            <span style={styles.assigned}>
              <FontAwesome icon="check" />
              {i18n.assigned()}
            </span>
          )}
          {!selectedSection.isAssigned && showAssignButton && (
            <AssignButton
              section={selectedSection}
              courseId={courseId}
              assignmentName={assignmentName}
            />
          )}
        </div>
      </div>
    );
  }
}

export const UnconnectedSectionAssigner = SectionAssigner;

export default connect(
  state => ({
    initialSelectedSectionId: parseInt(state.teacherSections.selectedSectionId)
  }),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    }
  })
)(SectionAssigner);
