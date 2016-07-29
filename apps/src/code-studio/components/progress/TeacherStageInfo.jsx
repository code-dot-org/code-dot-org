/* global dashboard */

import React from 'react';
import Radium from 'radium';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import StageLock from './StageLock';
import color from '../../../color';
import progressStyles from './progressStyles';

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
    maxWidth: '90%'
  },
  lessonPlan: {
    ':hover': {
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  },
  lessonPlanText: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    marginLeft: 10
  },
  dotIcon: progressStyles.dotIcon
};

const TeacherStageInfo = React.createClass({
  propTypes: {
    lessonPlanUrl: React.PropTypes.string,
    lockable: React.PropTypes.bool.isRequired,
    sectionsLoaded: React.PropTypes.bool.isRequired
  },

  clickLessonPlan() {
    window.open(this.props.lessonPlanUrl, '_blank');
  },

  render() {
    if (!this.props.lockable && !this.props.lessonPlanUrl) {
      return null;
    }

    return (
      <div style={styles.container}>
        <div style={styles.main}>
          {this.props.lessonPlanUrl &&
            <span style={styles.lessonPlan} onClick={this.clickLessonPlan}>
              <FontAwesome icon="file-text" style={styles.dotIcon}/>
              <span style={styles.lessonPlanText}>
                {dashboard.i18n.t('view_lesson_plan')}
              </span>
            </span>
          }
          {this.props.lockable &&
            <StageLock sectionsLoaded={this.props.sectionsLoaded}/>
          }
        </div>
      </div>
    );
  }
});

export default Radium(TeacherStageInfo);
