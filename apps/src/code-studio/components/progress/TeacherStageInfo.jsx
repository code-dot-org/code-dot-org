/* global dashboard */

import React from 'react';
import { connect } from 'react-redux';
import Radium from 'radium';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import StageLock from './StageLock';
import HiddenStageToggle from './HiddenStageToggle';
import color from '../../../color';
import progressStyles from './progressStyles';
import { stageShape } from './types';

/**
 * A component that renders information in our StageProgress view that is only
 * viewable by teachers
 */

const styles = {
  container: {
    marginBottom: 5,
    marginLeft: 5
  },
  main: {
    display: 'inline-block',
    backgroundColor: color.lightest_cyan,
    borderWidth: 2,
    borderColor: color.cyan,
    borderRadius: 10,
    borderStyle: 'solid',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    maxWidth: '90%',
    whiteSpace: 'nowrap'
  },
  lessonPlan: {
    ':hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
    marginTop: 5,
    display: 'inline-block'
  },
  lessonPlanText: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    marginLeft: 10
  },
  toggle: {
    marginLeft: 15,
    marginTop: 5,
    display: 'inline-block',
    verticalAlign: 'top',
  },
  dotIcon: progressStyles.dotIcon
};

const TeacherStageInfo = React.createClass({
  propTypes: {
    stage: stageShape,

    // redux provided
    hasNoSections: React.PropTypes.bool.isRequired,
  },

  clickLessonPlan() {
    window.open(this.props.stage.lesson_plan_html_url, '_blank');
  },

  render() {
    const { stage } = this.props;
    const lessonPlanUrl = stage.lesson_plan_html_url;

    const lockable = stage.lockable && !this.props.hasNoSections;
    if (!lockable && !lessonPlanUrl) {
      return null;
    }

    return (
      <div style={styles.container}>
        <div style={styles.main}>
          {lessonPlanUrl &&
            <span style={styles.lessonPlan} onClick={this.clickLessonPlan}>
              <FontAwesome icon="file-text" style={styles.dotIcon}/>
              <span style={styles.lessonPlanText}>
                {dashboard.i18n.t('view_lesson_plan')}
              </span>
            </span>
          }
          {lockable && <StageLock stage={stage}/>}
          <div style={styles.toggle}>
            <HiddenStageToggle/>
          </div>
        </div>
      </div>
    );
  }
});

export default connect(state => ({
  hasNoSections: state.stageLock.sectionsLoaded &&
    Object.keys(state.stageLock.sections).length === 0
}))(Radium(TeacherStageInfo));
