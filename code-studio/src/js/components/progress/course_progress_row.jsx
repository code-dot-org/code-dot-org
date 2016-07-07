/* global dashboard */

import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

import { stageShape } from './types';
import StageProgress from './stage_progress.jsx';
import color from '../../color';
import { styles } from './progress_row_styles';

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgressRow = React.createClass({
  propTypes: {
    showLessonPlanLinks: React.PropTypes.bool,
    professionalLearningCourse: React.PropTypes.bool,
    isFocusArea: React.PropTypes.bool,
    stage: stageShape
  },

  render() {
    const stage = this.props.stage;

    return (
      <div style={[
        styles.row,
        this.props.professionalLearningCourse && {background: color.white},
        this.props.isFocusArea && styles.focusAreaRow
      ]}>
        {this.props.isFocusArea && [
          <div style={styles.ribbonWrapper} key='ribbon'>
            <div style={styles.ribbon}>Focus Area</div>
          </div>,
          <a
            href={this.props.changeFocusAreaPath}
            style={styles.changeFocusArea}
            key='changeFocusArea'
          >
            <i className='fa fa-pencil' style={styles.changeFocusAreaIcon} />
            <span>Change your focus area</span>
          </a>
        ]}
        <div style={styles.stageName}>
          {this.props.professionalLearningCourse ? stage.name : stage.title}
          {this.props.showLessonPlanLinks && stage.lesson_plan_html_url &&
            <a
              target='_blank'
              href={stage.lesson_plan_html_url}
              style={styles.lessonPlanLink}
            >
              {dashboard.i18n.t('view_lesson_plan')}
            </a>
          }
        </div>
        <StageProgress
          levels={stage.levels}
          courseOverviewPage={true}
        />
      </div>
    );
  }
});

export default connect(state => ({
  showLessonPlanLinks: state.showLessonPlanLinks,
  changeFocusAreaPath: state.changeFocusAreaPath
}))(Radium(CourseProgressRow));
