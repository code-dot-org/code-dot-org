import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProgressLessonContent from './ProgressLessonContent';
import FontAwesome from '../FontAwesome';
import color from "@cdo/apps/util/color";
import { levelType, lessonType } from './progressTypes';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import i18n from '@cdo/locale';
import { lessonIsHidden } from './progressHelpers';

const styles = {
  main: {
    background: color.lightest_gray,
    borderWidth: 1,
    borderColor: color.border_gray,
    borderStyle: 'solid',
    borderRadius: 2,
    padding: 20,
    marginBottom: 12
  },
  heading: {
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
  },
  headingText: {
    marginLeft: 10
  },
  hidden: {
    background: color.white,
    borderStyle: 'dashed',
    borderWidth: 2,
    opacity: 0.6
  },
  hiddenIcon: {
    marginRight: 5,
    fontSize: 18,
    color: color.cyan
  }
};

const ProgressLesson = React.createClass({
  propTypes: {
    description: PropTypes.string,
    lesson: lessonType.isRequired,
    lessonNumber: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,

    // redux provided
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    sectionId: PropTypes.string,
    hiddenStageState: PropTypes.object.isRequired,
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
    const { description, lesson, lessonNumber, levels } = this.props;

    if (lessonIsHidden(this.props)) {
      return null;
    }

    // Is this a hidden stage that we still render because we're a teacher
    const hiddenForStudents = lessonIsHidden({...this.props, viewAs: ViewType.Student });
    const title = i18n.lessonNumbered({lessonNumber, lessonName: lesson.name});
    const icon = this.state.collapsed ? "caret-right" : "caret-down";

    return (
      <div
        style={{
          ...styles.main,
          ...(hiddenForStudents && styles.hidden)
        }}
      >
        <div
          style={styles.heading}
          onClick={this.toggleCollapsed}
        >
          {hiddenForStudents &&
            <FontAwesome
              icon="eye-slash"
              style={styles.hiddenIcon}
            />
          }
          <FontAwesome icon={icon}/>
          <span style={styles.headingText}>{title}</span>
        </div>
        {!this.state.collapsed &&
          <ProgressLessonContent
            description={description}
            levels={levels}
          />
        }
      </div>
    );
  }
});

export const UnconnectedProgressLesson = ProgressLesson;

export default connect(state => ({
  viewAs: state.stageLock.viewAs,
  sectionId: state.sections.selectedSectionId,
  hiddenStageState: state.hiddenStage,
}))(ProgressLesson);
