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
import { toggleHidden } from '../../hiddenStageRedux';
import experiments from '@cdo/apps/experiments';

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
    marginBottom: 5,
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
    hiddenStagesInitialized: React.PropTypes.bool.isRequired,
    hiddenStageMap: React.PropTypes.object.isRequired,
    hasNoSections: React.PropTypes.bool.isRequired,
    toggleHidden: React.PropTypes.func.isRequired
  },

  onClickHiddenToggle(value) {
    this.props.toggleHidden(this.props.stage.id, value === 'hidden');
  },

  clickLessonPlan() {
    window.open(this.props.stage.lesson_plan_html_url, '_blank');
  },

  render() {
    const { stage, hiddenStageMap, hasNoSections, hiddenStagesInitialized } = this.props;
    const isHidden = hiddenStagesInitialized && hiddenStageMap[stage.id];
    const lessonPlanUrl = stage.lesson_plan_html_url;

    const lockable = stage.lockable && !hasNoSections;
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
          {experiments.isEnabled('hiddenStages') && hiddenStagesInitialized &&
            <div style={styles.toggle}>
              <HiddenStageToggle
                hidden={!!isHidden}
                onChange={this.onClickHiddenToggle}
              />
            </div>
          }
        </div>
      </div>
    );
  }
});

export default connect(state => {
  return {
    hiddenStagesInitialized: state.hiddenStage.initialized,
    hiddenStageMap: state.hiddenStage,
    hasNoSections: state.stageLock.sectionsLoaded &&
      Object.keys(state.stageLock.sections).length === 0
    };
}, dispatch => ({
  toggleHidden(stageId, hidden) {
    dispatch(toggleHidden(stageId, hidden));
  }
}))(Radium(TeacherStageInfo));
