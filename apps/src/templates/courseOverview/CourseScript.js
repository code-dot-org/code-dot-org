import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
  isScriptHiddenForSection,
  toggleHiddenScript,
} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import harness from '@cdo/apps/lib/util/harness';
import AssignButton from '@cdo/apps/templates/AssignButton';
import Assigned from '@cdo/apps/templates/Assigned';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import UnassignSectionButton from '@cdo/apps/templates/UnassignSectionButton';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import CourseScriptTeacherInfo from './CourseScriptTeacherInfo';

class CourseScript extends Component {
  static propTypes = {
    title: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.number.isRequired,
    courseId: PropTypes.number,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    description: PropTypes.string,
    assignedSectionId: PropTypes.number,
    showAssignButton: PropTypes.bool,
    // redux provided
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    selectedSectionId: PropTypes.number,
    hiddenLessonState: PropTypes.object.isRequired,
    hasNoSections: PropTypes.bool.isRequired,
    toggleHiddenScript: PropTypes.func.isRequired,
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
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

  onClickHiddenToggle = value => {
    const {name, selectedSectionId, id, toggleHiddenScript} = this.props;
    toggleHiddenScript(name, selectedSectionId, id, value === 'hidden');
    harness.trackAnalytics(
      {
        study: 'hidden-units',
        study_group: 'v0',
        event: value,
        script_id: id,
        data_json: JSON.stringify({
          script_name: name,
          section_id: selectedSectionId,
        }),
      },
      {useProgressScriptId: false}
    );
  };

  render() {
    const {
      title,
      name,
      id,
      description,
      viewAs,
      selectedSectionId,
      hiddenLessonState,
      hasNoSections,
      assignedSectionId,
      courseId,
      courseOfferingId,
      courseVersionId,
      sectionsForDropdown,
      showAssignButton,
    } = this.props;

    const isHidden = isScriptHiddenForSection(
      hiddenLessonState,
      selectedSectionId,
      id
    );

    if (isHidden && viewAs === ViewType.Participant) {
      return null;
    }

    const assignedToStudent =
      viewAs === ViewType.Participant && assignedSectionId;
    const selectedSection = sectionsForDropdown.find(
      section => section.id === selectedSectionId
    );
    const assignedByTeacher =
      viewAs === ViewType.Instructor &&
      selectedSection &&
      selectedSection.unitId === id;
    const isAssigned = assignedToStudent || assignedByTeacher;

    return (
      <div
        style={{
          ...styles.main,
          ...(isHidden && styles.hidden),
        }}
        className="uitest-CourseScript"
        data-visibility={isHidden ? 'hidden' : 'visible'}
      >
        <div style={styles.content}>
          <div style={styles.title}>{title}</div>
          <div style={styles.description}>
            <SafeMarkdown markdown={description} />
          </div>
          <span style={styles.flex}>
            <Button
              __useDeprecatedTag
              text={i18n.goToUnit()}
              href={`/s/${name}${location.search}`}
              color={Button.ButtonColor.gray}
              className="uitest-go-to-unit-button"
            />
            {isAssigned && viewAs === ViewType.Participant && <Assigned />}
            {isAssigned &&
              viewAs === ViewType.Instructor &&
              selectedSectionId && (
                <UnassignSectionButton
                  courseName={title}
                  sectionId={selectedSectionId}
                  buttonLocationAnalytics={'course-overview-unit'}
                />
              )}
            {!isAssigned &&
              viewAs === ViewType.Instructor &&
              showAssignButton &&
              selectedSection && (
                <AssignButton
                  sectionId={selectedSection.id}
                  scriptId={id}
                  courseId={courseId}
                  courseOfferingId={courseOfferingId}
                  courseVersionId={courseVersionId}
                  assignmentName={title}
                  sectionName={selectedSection.name}
                  reassignConfirm={this.onReassignConfirm}
                />
              )}
          </span>
        </div>
        {viewAs === ViewType.Instructor && !hasNoSections && (
          <CourseScriptTeacherInfo
            disabled={!selectedSectionId}
            isHidden={isHidden}
            onToggleHiddenScript={this.onClickHiddenToggle}
          />
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    display: 'table',
    width: '100%',
    height: '100%',
    background: color.background_gray,
    borderWidth: 1,
    borderColor: color.border_gray,
    borderStyle: 'solid',
    borderRadius: 2,
    marginBottom: 12,
  },
  content: {
    padding: 20,
  },
  description: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    ...fontConstants['main-font-semi-bold'],
  },
  // TODO: share better with ProgressLesson
  hidden: {
    borderStyle: 'dashed',
    borderWidth: 4,
    marginTop: 0,
    marginBottom: 12,
    marginLeft: 0,
    marginRight: 0,
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
};
export const UnconnectedCourseScript = CourseScript;

export default connect(
  (state, ownProps) => ({
    viewAs: state.viewAs,
    selectedSectionId: state.teacherSections.selectedSectionId,
    sectionsForDropdown: sectionsForDropdown(
      state.teacherSections,
      ownProps.courseOfferingId,
      ownProps.courseVersionId,
      ownProps.id
    ),
    hiddenLessonState: state.hiddenLesson,
    hasNoSections:
      state.teacherSections.sectionsAreLoaded &&
      state.teacherSections.sectionIds.length === 0,
  }),
  {toggleHiddenScript}
)(CourseScript);
