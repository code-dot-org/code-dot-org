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
import { toggleHidden, isHiddenFromState } from '../../hiddenStageRedux';
import experiments from '@cdo/apps/experiments';

/**
 * A component that renders information in our StageProgress view that is only
 * viewable by teachers
 */

const styles = {
  main: {
    display: 'inline-block',
    backgroundColor: color.lightest_cyan,
    borderWidth: 1,
    borderColor: color.cyan,
    borderStyle: 'solid',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    width: 240,
    textAlign: 'center',
    height: '100%',
  },
  inner: {
    marginTop: 20,
    marginBottom: 20
  },
  lessonPlanButton: progressStyles.blueButton,
  lessonPlanText: {
    marginLeft: 10
  }
};

const TeacherStageInfo = Radium(React.createClass({
  propTypes: {
    stage: stageShape,

    // redux provided
    sectionId: React.PropTypes.string.isRequired,
    hiddenStagesInitialized: React.PropTypes.bool.isRequired,
    hiddenStageMap: React.PropTypes.object.isRequired,
    scriptName: React.PropTypes.string.isRequired,
    hasNoSections: React.PropTypes.bool.isRequired,
    toggleHidden: React.PropTypes.func.isRequired
  },

  onClickHiddenToggle(value) {
    const { scriptName, sectionId, stage } = this.props;
    this.props.toggleHidden(scriptName, sectionId, stage.id, value === 'hidden');
  },

  clickLessonPlan() {
    window.open(this.props.stage.lesson_plan_html_url, '_blank');
  },

  render() {
    const { stage, sectionId, hiddenStageMap, hasNoSections, hiddenStagesInitialized } = this.props;
    const isHidden = hiddenStagesInitialized &&
      isHiddenFromState(hiddenStageMap, sectionId, stage.id);
    const lessonPlanUrl = stage.lesson_plan_html_url;

    const lockable = stage.lockable && !hasNoSections;
    if (!lockable && !lessonPlanUrl) {
      return null;
    }

    return (
      <div style={styles.main}>
        <div style={styles.inner}>
          {lessonPlanUrl &&
            <button style={styles.lessonPlanButton} onClick={this.clickLessonPlan}>
              <FontAwesome icon="file-text"/>
              <span style={styles.lessonPlanText}>
                {dashboard.i18n.t('view_lesson_plan')}
              </span>
            </button>
          }
          {lockable && <StageLock stage={stage}/>}
          {experiments.isEnabled('hiddenStages') && hiddenStagesInitialized && !hasNoSections &&
            <div>
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
}));

export default connect(state => {
  return {
    sectionId: state.stageLock.selectedSection,
    hiddenStagesInitialized: state.hiddenStage.get('initialized'),
    hiddenStageMap: state.hiddenStage.get('bySection'),
    scriptName: state.progress.scriptName,
    hasNoSections: state.sections.sectionsLoaded &&
      Object.keys(state.stageLock.sections).length === 0
    };
}, dispatch => ({
  toggleHidden(scriptName, sectionId, stageId, hidden) {
    dispatch(toggleHidden(scriptName, sectionId, stageId, hidden));
  }
}))(TeacherStageInfo);
