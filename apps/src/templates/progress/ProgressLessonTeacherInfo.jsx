/**
 * A bunch of teacher info that shows up in a blue box to the right of the detail
 * view for a given lesson.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {
  toggleHiddenLesson,
  isLessonHiddenForSection,
} from '@cdo/apps/code-studio/hiddenLessonRedux';
import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/metrics/firehose';
import {sectionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import i18n from '@cdo/locale';

import HiddenForSectionToggle from './HiddenForSectionToggle';
import LessonLock from './LessonLock';
import {lessonType} from './progressTypes';
import SendLesson from './SendLesson';
import TeacherInfoBox from './TeacherInfoBox';

class ProgressLessonTeacherInfo extends React.Component {
  static propTypes = {
    lesson: lessonType.isRequired,
    onClickStudentLessonPlan: PropTypes.func,

    // redux provided
    section: sectionShape,
    unitAllowsHiddenLessons: PropTypes.bool.isRequired,
    hiddenLessonState: PropTypes.object.isRequired,
    unitId: PropTypes.number.isRequired,
    unitName: PropTypes.string.isRequired,
    hasNoSections: PropTypes.bool.isRequired,
    toggleHiddenLesson: PropTypes.func.isRequired,
    lockableAuthorized: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.onClickHiddenToggle = this.onClickHiddenToggle.bind(this);
    this.firehoseData = this.firehoseData.bind(this);
  }

  onClickHiddenToggle(value) {
    const {unitName, section, lesson, toggleHiddenLesson} = this.props;
    const sectionId = (section && section.id.toString()) || '';
    toggleHiddenLesson(unitName, sectionId, lesson.id, value === 'hidden');
    firehoseClient.putRecord(
      {
        study: 'hidden-lessons',
        study_group: 'v0',
        event: value,
        data_json: JSON.stringify(this.firehoseData()),
      },
      {includeUserId: true}
    );
  }

  firehoseData() {
    const {unitName, section, lesson} = this.props;
    return {
      script_name: unitName,
      section_id: section && section.id,
      lesson_id: lesson.id,
      lesson_name: lesson.name,
    };
  }

  render() {
    const {
      section,
      unitAllowsHiddenLessons,
      hiddenLessonState,
      hasNoSections,
      lockableAuthorized,
      unitId,
      lesson,
    } = this.props;

    const sectionId = (section && section.id.toString()) || '';
    const showHiddenForSectionToggle =
      section && unitAllowsHiddenLessons && !hasNoSections;
    const isHidden =
      unitAllowsHiddenLessons &&
      isLessonHiddenForSection(hiddenLessonState, sectionId, lesson.id);
    const courseId =
      (section && section.code && parseInt(section.code.substring(2))) || null;
    const loginRequiredLessonStartUrl =
      lesson.lessonStartUrl + '?login_required=true';
    const shouldRender =
      lesson.lesson_plan_html_url ||
      (lesson.lockable && !hasNoSections) ||
      loginRequiredLessonStartUrl ||
      showHiddenForSectionToggle;
    if (!shouldRender) {
      return null;
    }

    return (
      <TeacherInfoBox>
        {lesson.lesson_plan_html_url && (
          <div style={styles.buttonContainer}>
            <Button
              __useDeprecatedTag
              id="uitest-lesson-plan"
              href={lesson.lesson_plan_html_url}
              text={i18n.viewLessonPlan()}
              icon="file-text"
              color="blue"
              target="_blank"
              style={styles.button}
            />
          </div>
        )}
        {lesson.student_lesson_plan_html_url && (
          <div style={styles.buttonContainer}>
            <Button
              __useDeprecatedTag
              id="uitest-student-resources"
              href={lesson.student_lesson_plan_html_url}
              text={i18n.studentResources()}
              icon="file-text"
              color="purple"
              target="_blank"
              style={styles.button}
              onClick={this.props.onClickStudentLessonPlan}
            />
          </div>
        )}
        {lesson.lockable && lockableAuthorized && !hasNoSections && (
          <LessonLock
            unitId={unitId}
            lessonId={lesson.id}
            isHidden={!!isHidden}
          />
        )}
        {lesson.lessonStartUrl && !(lesson.lockable && !lockableAuthorized) && (
          <div style={styles.buttonContainer}>
            <SendLesson
              lessonUrl={loginRequiredLessonStartUrl}
              lessonTitle={lesson.name}
              courseid={courseId}
              analyticsData={JSON.stringify(this.firehoseData())}
              buttonStyle={styles.button}
            />
          </div>
        )}
        {lesson.lesson_feedback_url && (
          <div
            style={{
              marginBottom: !!showHiddenForSectionToggle ? '0px' : '10px',
              ...styles.buttonContainer,
            }}
          >
            <Button
              __useDeprecatedTag
              href={lesson.lesson_feedback_url}
              text={i18n.rateThisLesson()}
              icon="bar-chart"
              color={Button.ButtonColor.gray}
              target="_blank"
              style={styles.button}
              className="rate-lesson-button"
            />
          </div>
        )}
        {showHiddenForSectionToggle && (
          <HiddenForSectionToggle
            hidden={!!isHidden}
            onChange={this.onClickHiddenToggle}
          />
        )}
      </TeacherInfoBox>
    );
  }
}

const styles = {
  buttonContainer: {
    marginTop: '10px',
    marginRight: '15px',
    marginLeft: '15px',
    // Have to set line height to 0 to remove additional 5px bottom margin
    lineHeight: '0px',
  },
  // Setting 0px margin here intentionally to override styling
  button: {
    width: '100%',
    margin: '0px',
    paddingLeft: 0,
    paddingRight: 0,
    boxShadow: 'none',
  },
};

export const UnconnectedProgressLessonTeacherInfo = ProgressLessonTeacherInfo;

export default connect(
  state => ({
    section:
      state.teacherSections.sections[state.teacherSections.selectedSectionId],
    unitAllowsHiddenLessons: state.hiddenLesson.hideableLessonsAllowed || false,
    hiddenLessonState: state.hiddenLesson,
    unitId: state.progress.scriptId,
    unitName: state.progress.scriptName,
    lockableAuthorized: state.lessonLock.lockableAuthorized,
    hasNoSections:
      state.teacherSections.sectionsAreLoaded &&
      state.teacherSections.sectionIds.length === 0,
  }),
  dispatch => ({
    toggleHiddenLesson(unitName, sectionId, lessonId, hidden) {
      dispatch(toggleHiddenLesson(unitName, sectionId, lessonId, hidden));
    },
  })
)(ProgressLessonTeacherInfo);
