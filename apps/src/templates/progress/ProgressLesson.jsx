import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import fontConstants from '@cdo/apps/fontConstants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';
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
    isOnLevelView: PropTypes.bool,

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
    unitHasUnnumberedLessons: PropTypes.bool.isRequired,
    userId: PropTypes.number,
    userType: PropTypes.string,
    unitName: PropTypes.string,
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

  handleLessonTutorClick = () => {
    const {lesson, scriptId, unitName, userId, userType} = this.props;
    analyticsReporter.sendEvent(EVENTS.LESSON_TUTOR_UNIT_OVERVIEW_CLICK, {
      lessonId: lesson.id,
      lessonName: lesson.name,
      unitId: scriptId,
      unitName,
      userId,
      userType,
      view: 'progress-lesson',
    });
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
      unitHasUnnumberedLessons,
      isOnLevelView,
      userId,
      userType,
      unitName,
    } = this.props;

    if (!isVisible) {
      return null;
    }

    const showAsLocked = isLockedForUser || isLockedForAllStudents;

    const title =
      lesson.lessonNumber && !unitHasUnnumberedLessons
        ? i18n.lessonNumbered({
            lessonNumber: lesson.lessonNumber,
            lessonName: lesson.name,
          })
        : lesson.name;

    // We want to exclude the Lesson Tutor button for assessment and survey lessons.
    // These lessons don't have lesson plans, so we can use that as a proxy for
    // whether or not to show the Lesson Tutor button.
    const showLessonTutorButton =
      lesson.lessonTutorPath && lesson.hasLessonPlan && userId;

    // Adjust caret style if locale is RTL
    const caretStyle = isRtl ? styles.caretRTL : styles.caret;
    const caret = this.state.collapsed ? 'caret-right' : 'caret-down';

    const lockedTooltipId = _.uniqueId();

    const description =
      viewAs === ViewType.Instructor
        ? lesson.description_teacher
        : lesson.description_student;

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
            {!isOnLevelView && (
              <div style={styles.buttonColumn}>
                {viewAs === ViewType.Participant &&
                  lesson.student_lesson_plan_html_url && (
                    <MuiButton
                      className="ui-test-lesson-resources"
                      href={lesson.student_lesson_plan_html_url}
                      variant="contained"
                      color="white"
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<FontAwesomeV6Icon iconName="file-lines" />}
                    >
                      {i18n.lessonResources()}
                    </MuiButton>
                  )}
                {showLessonTutorButton &&
                  experiments.isEnabledAllowingQueryString(
                    experiments.LESSON_TUTOR
                  ) && (
                    <MuiButton
                      href={lesson.lessonTutorPath}
                      variant="contained"
                      color="white"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={this.handleLessonTutorClick}
                      startIcon={
                        <FontAwesomeV6Icon
                          iconName="ai-bot-solid"
                          iconFamily="kit"
                        />
                      }
                    >
                      {'Lesson Tutor'}
                    </MuiButton>
                  )}
              </div>
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
          <ProgressLessonTeacherInfo lesson={lesson} />
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
  buttonColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
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
  unitHasUnnumberedLessons: state.progress.unitHasUnnumberedLessons,
  userId: state.currentUser.userId,
  userType: state.currentUser.userType,
  unitName: state.progress.unitTitle,
}))(ProgressLesson);
