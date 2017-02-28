import React from 'react';
import color from "@cdo/apps/util/color";
import FontAwesome from '../FontAwesome';
import { lessonType } from './progressTypes';
import progressStyles from '@cdo/apps/code-studio/components/progress/progressStyles';

const styles = {
  main: {
    backgroundColor: color.lightest_cyan,
    height: '100%',
    borderWidth: 1,
    borderColor: color.cyan,
    borderStyle: 'solid',
    textAlign: 'center'
  },
  // TODO - unified button?
  lessonPlanButton: progressStyles.blueButton,
  lessonPlanText: {
    marginLeft: 10
  }
};

// TODO i18n

const ProgressLessonTeacherInfo = React.createClass({
  propTypes: {
    lesson: lessonType.isRequired,
  },

  render() {
    const { lesson } = this.props;
    return (
      <div style={styles.main}>
        {lesson.lesson_plan_html_url &&
          <button
            key="lessonPlan"
            style={styles.lessonPlanButton}
            onClick={this.clickLessonPlan}
          >
            <FontAwesome icon="file-text"/>
            <span style={styles.lessonPlanText}>
              View Lesson Plan
            </span>
          </button>
        }
      </div>
    );
  }
});

export default ProgressLessonTeacherInfo;
