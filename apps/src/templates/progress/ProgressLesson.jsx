import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProgressLessonContent from './ProgressLessonContent';
import FontAwesome from '../FontAwesome';
import color from "@cdo/apps/util/color";
import { levelType, lessonType } from './progressTypes';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import i18n from '@cdo/locale';
import { lessonIsVisible, lessonIsLockedForAllStudents } from './progressHelpers';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import ProgressLessonTeacherInfo from './ProgressLessonTeacherInfo';

const styles = {
  outer: {
    display: 'table',
    width: '100%',
    marginBottom: 12,
    background: color.lightest_gray,
    borderWidth: 1,
    borderColor: color.border_gray,
    borderStyle: 'solid',
    borderRadius: 2,
  },
  rightCol: {
    display: 'table-cell',
    verticalAlign: 'top',
    width: 200,
    height: '100%',
    borderRadius: 2,
  },
  main: {
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
  },
  headingText: {
    marginLeft: 10
  },
  hiddenOrLocked: {
    background: color.white,
    borderStyle: 'dashed',
  },
  translucent: {
    opacity: 0.6
  },
  icon: {
    marginRight: 5,
    fontSize: 18,
    color: color.cyan
  },
  unlockedIcon: {
    color: color.orange
  }
};

const ProgressLesson = React.createClass({
  propTypes: {
    description: PropTypes.string,
    lesson: lessonType.isRequired,
    lessonNumber: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,

    // redux provided
    showTeacherInfo: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    lessonIsVisible: PropTypes.func.isRequired,
    lessonLockedForSection: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      collapsed: false
    };
  },

  toggleCollapsed() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  },

  render() {
    const {
      description,
      lesson,
      lessonNumber,
      levels,
      showTeacherInfo,
      viewAs,
      lessonIsVisible,
      lessonLockedForSection
    } = this.props;

    if (!lessonIsVisible(lesson)) {
      return null;
    }

    // Is this a hidden stage that we still render because we're a teacher
    const hiddenForStudents = !lessonIsVisible(lesson, ViewType.Student);
    const title = i18n.lessonNumbered({lessonNumber, lessonName: lesson.name});
    const icon = this.state.collapsed ? "caret-right" : "caret-down";

    const locked = lessonLockedForSection(lesson.id) ||
      levels.every(level => level.status === LevelStatus.locked);

    const hiddenOrLocked = hiddenForStudents || locked;
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
            ...(hiddenOrLocked && styles.translucent)
          }}
        >
          <div
            style={styles.heading}
            onClick={this.toggleCollapsed}
          >
            {hiddenForStudents &&
              <FontAwesome
                icon="eye-slash"
                style={styles.icon}
              />
            }
            {lesson.lockable &&
              <FontAwesome
                icon={locked ? 'lock' : 'unlock'}
                style={{
                  ...styles.icon,
                  ...(!locked && styles.unlockedIcon)
                }}
              />
            }
            <FontAwesome icon={icon}/>
            <span style={styles.headingText}>{title}</span>
          </div>
          {!this.state.collapsed &&
            <ProgressLessonContent
              description={description}
              levels={levels}
              disabled={locked}
            />
          }
        </div>
        {showTeacherInfo && viewAs === ViewType.Teacher &&
          <div style={styles.rightCol}>
            <ProgressLessonTeacherInfo lesson={lesson}/>
          </div>
        }
      </div>
    );
  }
});

export const UnconnectedProgressLesson = ProgressLesson;

export default connect(state => ({
  showTeacherInfo: state.progress.showTeacherInfo,
  viewAs: state.stageLock.viewAs,
  lessonLockedForSection: lessonId => lessonIsLockedForAllStudents(lessonId, state),
  lessonIsVisible: (lesson, viewAs) => lessonIsVisible(lesson, state, viewAs)
}))(ProgressLesson);
