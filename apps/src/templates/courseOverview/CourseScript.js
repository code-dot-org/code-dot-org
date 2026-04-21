import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {
  isScriptHiddenForSection,
  toggleHiddenScript,
} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Assigned from '@cdo/apps/templates/Assigned';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import MultipleAssignButton from '../MultipleAssignButton';

import CourseScriptTeacherInfo from './CourseScriptTeacherInfo';

import styles from './courseScript.module.scss';

class CourseScript extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.number.isRequired,
    path: PropTypes.string.isRequired,
    courseId: PropTypes.number,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    description: PropTypes.string,
    assignedSectionId: PropTypes.number,
    showAssignButton: PropTypes.bool,
    participantAudience: PropTypes.string,
    aiChatToolsDependency: PropTypes.string,
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
    const {name, selectedSectionId, id, hiddenLessonState, toggleHiddenScript} =
      this.props;
    const nextHidden = value === 'hidden';
    const currentHidden = isScriptHiddenForSection(
      hiddenLessonState,
      selectedSectionId,
      id
    );
    if (nextHidden === currentHidden) {
      return;
    }
    toggleHiddenScript(name, selectedSectionId, id, nextHidden);
  };

  render() {
    const {
      title,
      name,
      id,
      path,
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
      participantAudience,
      aiChatToolsDependency,
    } = this.props;
    const {confirmationMessageOpen} = this.state;

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

    let unitPath = `${path}${location.search}`;
    if (location.pathname.includes('/teacher_dashboard')) {
      if (experiments.isEnabled(experiments.MODULARITY)) {
        unitPath = `/teacher_dashboard/sections/${selectedSectionId}${path}`;
      } else {
        unitPath = `/teacher_dashboard/sections/${selectedSectionId}/unit/${name}`;
      }
    }
    return (
      <div
        className={classNames(
          styles.main,
          isHidden && styles.hidden,
          'uitest-CourseScript'
        )}
        data-visibility={isHidden ? 'hidden' : 'visible'}
      >
        <div className={styles.content}>
          <Typography variant="h5" component="h5">
            {title}
          </Typography>
          <div className={styles.description}>
            <SafeMarkdown markdown={description} />
          </div>
          <div className={styles.flex}>
            <Button
              href={unitPath}
              className="uitest-go-to-unit-button"
              variant="outlined"
              color="secondary"
              size="small"
            >
              {i18n.goToUnit()}
            </Button>
            {isAssigned && viewAs === ViewType.Participant && <Assigned />}
            {confirmationMessageOpen && (
              <span className={styles.confirmText}>{i18n.assignSuccess()}</span>
            )}
            {viewAs === ViewType.Instructor && showAssignButton && (
              <MultipleAssignButton
                courseOfferingId={courseOfferingId}
                courseVersionId={courseVersionId}
                courseId={courseId}
                scriptId={id}
                assignmentName={title}
                reassignConfirm={this.onReassignConfirm}
                isAssigningCourseOnly={false}
                isSingleUnitCourse={false}
                participantAudience={participantAudience}
                aiChatToolsDependency={aiChatToolsDependency}
              />
            )}
          </div>
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
