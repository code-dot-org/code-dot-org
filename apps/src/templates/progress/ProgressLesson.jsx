import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/metrics/utils/firehose';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import FocusAreaIndicator from './FocusAreaIndicator';
import {
  lessonIsVisible,
  lessonIsLockedForUser,
  lessonIsLockedForAllStudents,
} from './progressHelpers';
import ProgressLessonContent from './ProgressLessonContent';
import ProgressLessonTeacherInfo from './ProgressLessonTeacherInfo';
import {levelWithProgressType, lessonType} from './progressTypes';

class ProgressLesson extends React.Component {
  static propTypes = {
    lesson: lessonType.isRequired,
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,

    // redux provided
    scriptId: PropTypes.number,
    currentLessonId: PropTypes.number,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isVisible: PropTypes.bool.isRequired,
    hiddenForStudents: PropTypes.bool.isRequired,
    isLockedForUser: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.number,
    lockableAuthorized: PropTypes.bool,
    lockableAuthorizedLoaded: PropTypes.bool.isRequired,
    isLockedForAllStudents: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool,
    isMiniView: PropTypes.bool,
    lockStatusLoaded: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      // We want instructors to start with everything uncollapsed. For participants we
      // collapse everything except current lesson
      collapsed:
        props.viewAs !== ViewType.Instructor &&
        props.currentLessonId !== props.lesson.id,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // If we're assigned a lesson id, and it is for this lesson, uncollapse
    if (nextProps.currentLessonId !== this.props.currentLessonId) {
      this.setState({
        collapsed:
          this.state.collapsed &&
          nextProps.currentLessonId !== this.props.lesson.id,
      });
    }
  }

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed,
    });

  onClickStudentLessonPlan = () => {
    firehoseClient.putRecord(
      {
        study: 'script_overview_actions',
        study_group: 'student_lesson_plan',
        event: 'open_student_lesson_plan',
        data_json: JSON.stringify({
          lesson_id: this.props.lesson.id,
          script_id: this.props.scriptId,
        }),
      },
      {includeUserId: true}
    );
  };

  render() {
    const {
      lesson,
      levels,
      viewAs,
      isVisible,
      hiddenForStudents, // Is this a hidden lesson that we still render because we're a instructor
      isLockedForUser,
      isLockedForAllStudents,
      selectedSectionId,
      isRtl,
    } = this.props;

    if (!isVisible) {
      return null;
    }

    const showAsLocked = isLockedForUser || isLockedForAllStudents;

    const title = lesson.lessonNumber
      ? i18n.lessonNumbered({
          lessonNumber: lesson.lessonNumber,
          lessonName: lesson.name,
        })
      : lesson.name;

    // Adjust caret style if locale is RTL
    const caretStyle = isRtl ? styles.caretRTL : styles.caret;
    const caret = this.state.collapsed ? 'caret-right' : 'caret-down';

    const lockedTooltipId = _.uniqueId();

    const description =
      viewAs === ViewType.Instructor
        ? lesson.description_teacher
        : lesson.description_student;

    // There's no url for a lesson so use the url of the first level of the lesson
    // as the url for the lesson.
    // TODO: Make the back-end return a lesson url as part of the lesson metadata so we
    // don't need to pass it separately from lesson here and in ProgressLessonTeacherInfo.
    const lessonUrl = levels[0] && levels[0].url;

    // If a instructor is not verified they will not be lockableAuthorized (meaning they can't
    // lock or unlock lessons). For a lockable lesson where instructor is not authorized, we will
    // display a warning explaining that they need to be verified to unlock lessons.
    const showNotAuthorizedWarning =
      lesson.lockable &&
      viewAs === ViewType.Instructor &&
      this.props.lockableAuthorizedLoaded &&
      !this.props.lockableAuthorized;

    return (
      <div
        id={`progress-lesson-${lesson.lessonNumber}`}
        className="uitest-progress-lesson"
        style={{
          ...styles.outer,
          ...((hiddenForStudents || showAsLocked) && styles.hiddenOrLocked),
        }}
      >
        <div
          style={{
            ...styles.main,
            ...(((hiddenForStudents && viewAs === ViewType.Participant) ||
              isLockedForUser) &&
              styles.translucent),
          }}
        >
          <div
            style={{
              ...styles.heading,
              ...{marginBottom: this.state.collapsed ? 0 : 15},
            }}
          >
            <div
              style={styles.headingText}
              onClick={this.toggleCollapsed}
              tabIndex="0"
              role="button"
              onKeyDown={e => {
                if ([' ', 'Enter', 'Spacebar'].includes(e.key)) {
                  e.preventDefault();
                  this.toggleCollapsed();
                }
              }}
              aria-expanded={!this.state.collapsed}
            >
              <FontAwesome icon={caret} style={caretStyle} />
              {hiddenForStudents && (
                <FontAwesome icon="eye-slash" style={styles.icon} />
              )}
              {lesson.lockable && this.props.lockStatusLoaded && (
                <span data-tip data-for={lockedTooltipId}>
                  <FontAwesome
                    icon={showAsLocked ? 'lock' : 'unlock'}
                    style={{
                      ...styles.icon,
                      ...(!showAsLocked && styles.unlockedIcon),
                    }}
                  />
                  {!showAsLocked && viewAs === ViewType.Instructor && (
                    <ReactTooltip
                      id={lockedTooltipId}
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
            {viewAs === ViewType.Participant &&
              lesson.student_lesson_plan_html_url && (
                <span style={styles.buttonStyle}>
                  <Button
                    __useDeprecatedTag
                    className="ui-test-lesson-resources"
                    href={lesson.student_lesson_plan_html_url}
                    text={i18n.lessonResources()}
                    icon="file-text"
                    color="purple"
                    target="_blank"
                    onClick={this.onClickStudentLessonPlan}
                  />
                </span>
              )}
          </div>
          {showNotAuthorizedWarning && (
            <div style={styles.notAuthorizedWarning}>
              {i18n.unverifiedTeacherLockWarning()}
              <a
                style={styles.learnMoreLink}
                href="https://support.code.org/hc/en-us/articles/115001550131-Becoming-a-verified-teacher-CS-Principles-and-CS-Discoveries-only-"
              >
                {i18n.learnMoreWithPeriod()}
              </a>
            </div>
          )}
          {!this.state.collapsed && (
            <ProgressLessonContent
              description={description}
              levels={levels}
              disabled={isLockedForUser}
              selectedSectionId={selectedSectionId}
              lessonName={lesson.name}
            />
          )}
        </div>
        {viewAs === ViewType.Instructor && !this.props.isMiniView && (
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
    marginRight: 3,
  },
  main: {
    padding: 20,
  },
  heading: {
    fontSize: 18,
    ...fontConstants['main-font-semi-bold'],
    display: 'flex',
    alignItems: 'center',
  },
  headingText: {
    cursor: 'pointer',
    flexGrow: 1,
  },
  buttonStyle: {
    marginLeft: 'auto',
  },
  hiddenOrLocked: {
    borderStyle: 'dashed',
    borderWidth: 4,
    marginTop: 0,
    marginBottom: 12,
    marginLeft: 0,
    marginRight: 0,
  },
  translucent: {
    opacity: 0.6,
  },
  caret: {
    marginRight: 10,
  },
  caretRTL: {
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
    fontSize: 18,
    color: color.cyan,
  },
  unlockedIcon: {
    color: color.orange,
  },
  notAuthorizedWarning: {
    color: color.red,
    ...fontConstants['main-font-semi-bold-italic'],
    marginTop: 10,
  },
  learnMoreLink: {
    marginLeft: 5,
  },
};

export const UnconnectedProgressLesson = ProgressLesson;

export default connect((state, ownProps) => ({
  currentLessonId: state.progress.currentLessonId,
  viewAs: state.viewAs,
  lockableAuthorized: state.lessonLock.lockableAuthorized,
  lockableAuthorizedLoaded: state.lessonLock.lockableAuthorizedLoaded,
  isVisible: lessonIsVisible(ownProps.lesson, state, state.viewAs),
  hiddenForStudents: !lessonIsVisible(
    ownProps.lesson,
    state,
    ViewType.Participant
  ),
  isLockedForUser: lessonIsLockedForUser(
    ownProps.lesson,
    ownProps.levels,
    state,
    state.viewAs
  ),
  isLockedForAllStudents: lessonIsLockedForAllStudents(
    ownProps.lesson.id,
    state
  ),
  selectedSectionId: state.teacherSections.selectedSectionId,
  scriptId: state.progress.scriptId,
  isRtl: state.isRtl,
  isMiniView: state.progress.isMiniView,
  lockStatusLoaded:
    state.progress.unitProgressHasLoaded &&
    state.lessonLock.lessonsBySectionIdLoaded,
}))(ProgressLesson);
