import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ProgressLessonContent from './ProgressLessonContent';
import FontAwesome from '../FontAwesome';
import color from '@cdo/apps/util/color';
import {levelType, lessonType} from './progressTypes';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';
import {
  lessonIsVisible,
  lessonIsLockedForAllStudents,
  stageLocked
} from './progressHelpers';
import ProgressLessonTeacherInfo from './ProgressLessonTeacherInfo';
import FocusAreaIndicator from './FocusAreaIndicator';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import Button from '../Button';

const styles = {
  outer: {
    position: 'relative',
    display: 'table',
    width: '100%',
    height: '100%',
    background: color.lightest_gray,
    borderColor: color.border_gray,
    borderStyle: 'solid',
    borderRadius: 2,
    // When toggling between hidden and not, we change our border size from 1 to 4.
    // We want to limit how much toggling this changes our sizing, so we add +3
    // to each of our non-hidden margins
    borderWidth: 1,
    marginTop: 3,
    marginBottom: 15,
    marginLeft: 3,
    marginRight: 3
  },
  main: {
    padding: 20
  },
  heading: {
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
    display: 'flex',
    alignItems: 'center'
  },
  headingText: {
    cursor: 'pointer',
    flexGrow: 1
  },
  buttonStyle: {
    marginLeft: 'auto'
  },
  hiddenOrLocked: {
    borderStyle: 'dashed',
    borderWidth: 4,
    marginTop: 0,
    marginBottom: 12,
    marginLeft: 0,
    marginRight: 0
  },
  translucent: {
    opacity: 0.6
  },
  caret: {
    marginRight: 10
  },
  icon: {
    marginRight: 5,
    fontSize: 18,
    color: color.cyan
  },
  unlockedIcon: {
    color: color.orange
  },
  notAuthorizedWarning: {
    color: color.red,
    fontFamily: '"Gotham 5r", sans-serif',
    fontStyle: 'italic',
    marginTop: 10
  }
};

class ProgressLesson extends React.Component {
  static propTypes = {
    lesson: lessonType.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,

    // redux provided
    scriptId: PropTypes.number,
    currentStageId: PropTypes.number,
    showTeacherInfo: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    showLockIcon: PropTypes.bool.isRequired,
    lessonIsVisible: PropTypes.func.isRequired,
    lessonLockedForSection: PropTypes.func.isRequired,
    selectedSectionId: PropTypes.string,
    lockableAuthorized: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      // We want teachers to start with everything uncollapsed. For students we
      // collapse everything except current stage
      collapsed:
        props.viewAs !== ViewType.Teacher &&
        props.currentStageId !== props.lesson.id
    };
  }

  componentWillReceiveProps(nextProps) {
    // If we're assigned a stageId, and it is for this lesson, uncollapse
    if (nextProps.currentStageId !== this.props.currentStageId) {
      this.setState({
        collapsed:
          this.state.collapsed &&
          nextProps.currentStageId !== this.props.lesson.id
      });
    }
  }

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  onClickStudentLessonPlan = () => {
    firehoseClient.putRecord(
      {
        study: 'script_overview_actions',
        study_group: 'student_lesson_plan',
        event: 'open_student_lesson_plan',
        data_json: JSON.stringify({
          lesson_id: this.props.lesson.id,
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    const {
      lesson,
      levels,
      showTeacherInfo,
      viewAs,
      showLockIcon,
      lessonIsVisible,
      lessonLockedForSection,
      selectedSectionId
    } = this.props;

    if (!lessonIsVisible(lesson, viewAs)) {
      return null;
    }

    // Is this a hidden stage that we still render because we're a teacher
    const hiddenForStudents = !lessonIsVisible(lesson, ViewType.Student);
    const title = lesson.stageNumber
      ? i18n.lessonNumbered({
          lessonNumber: lesson.stageNumber,
          lessonName: lesson.name
        })
      : lesson.name;
    const caret = this.state.collapsed ? 'caret-right' : 'caret-down';

    const teacherNotLockableAuthorized =
      !this.props.lockableAuthorized && viewAs === ViewType.Teacher;

    // Treat the stage as locked if either
    // (a) it is locked for this user (in the case of a student)
    // (b) it is locked for all students in the section (in the case of a teacher)
    // (c) teacher is not verified and can't access lockable content
    const locked =
      lesson.lockable &&
      (stageLocked(levels) ||
        lessonLockedForSection(lesson.id) ||
        teacherNotLockableAuthorized);

    const hiddenOrLocked = hiddenForStudents || locked;
    const tooltipId = _.uniqueId();

    const description =
      viewAs === ViewType.Teacher
        ? lesson.description_teacher
        : lesson.description_student;

    // There's no url for a lesson so use the url of the first level of the lesson
    // as the url for the lesson.
    // TODO: Make the back-end return a lesson url as part of the lesson metadata so we
    // don't need to pass it separately from lesson here and in ProgressLessonTeacherInfo.
    const lessonUrl = levels[0] && levels[0].url;
    return (
      <div
        style={{
          ...styles.outer,
          ...(hiddenOrLocked && styles.hiddenOrLocked)
        }}
      >
        <div
          style={{
            ...styles.main,
            ...(hiddenOrLocked &&
              teacherNotLockableAuthorized &&
              styles.translucent)
          }}
        >
          <div style={styles.heading}>
            <div style={styles.headingText} onClick={this.toggleCollapsed}>
              <FontAwesome icon={caret} style={styles.caret} />
              {hiddenForStudents && (
                <FontAwesome icon="eye-slash" style={styles.icon} />
              )}
              {showLockIcon && lesson.lockable && locked && (
                <FontAwesome icon="lock" style={styles.icon} />
              )}
              {showLockIcon && lesson.lockable && !locked && (
                <span data-tip data-for={tooltipId}>
                  <FontAwesome
                    icon="unlock"
                    style={{
                      ...styles.icon,
                      ...styles.unlockedIcon
                    }}
                  />
                  {viewAs === ViewType.Teacher && (
                    <ReactTooltip
                      id={tooltipId}
                      role="tooltip"
                      wrapper="span"
                      effect="solid"
                    >
                      {i18n.lockAssessmentLong()}
                    </ReactTooltip>
                  )}
                </span>
              )}
              <span>{title}</span>
            </div>
            {viewAs === ViewType.Student &&
              lesson.student_lesson_plan_html_url && (
                <span style={styles.buttonStyle}>
                  <Button
                    __useDeprecatedTag
                    className="ui-test-lesson-resources"
                    href={lesson.student_lesson_plan_html_url}
                    text={i18n.lessonResources()}
                    disabled={locked}
                    icon="file-text"
                    color="purple"
                    target="_blank"
                    onClick={this.onClickStudentLessonPlan}
                  />
                </span>
              )}
          </div>
          {lesson.lockable && teacherNotLockableAuthorized && (
            <div style={styles.notAuthorizedWarning}>
              This lesson is locked. In order to be able to unlock it you must
              become a verified teacher.
            </div>
          )}
          {!this.state.collapsed && (
            <ProgressLessonContent
              description={description}
              levels={levels}
              disabled={locked}
              selectedSectionId={selectedSectionId}
            />
          )}
        </div>
        {showTeacherInfo && viewAs === ViewType.Teacher && (
          <ProgressLessonTeacherInfo
            lesson={lesson}
            lessonUrl={lessonUrl}
            onClickStudentLessonPlan={this.onClickStudentLessonPlan}
          />
        )}
        {lesson.isFocusArea && <FocusAreaIndicator />}
      </div>
    );
  }
}

export const UnconnectedProgressLesson = ProgressLesson;

export default connect(state => ({
  currentStageId: state.progress.currentStageId,
  showTeacherInfo: state.progress.showTeacherInfo,
  viewAs: state.viewAs,
  showLockIcon:
    !!state.teacherSections.selectedSectionId ||
    (state.viewAs === ViewType.Teacher &&
      !state.stageLock.lockableAuthorized) ||
    state.viewAs === ViewType.Student,
  lockableAuthorized: state.stageLock.lockableAuthorized,
  lessonLockedForSection: lessonId =>
    lessonIsLockedForAllStudents(lessonId, state),
  lessonIsVisible: (lesson, viewAs) => lessonIsVisible(lesson, state, viewAs),
  selectedSectionId: state.teacherSections.selectedSectionId.toString(),
  scriptId: state.progress.scriptId
}))(ProgressLesson);
