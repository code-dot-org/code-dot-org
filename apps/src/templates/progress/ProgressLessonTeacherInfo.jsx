import React from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import i18n from "@cdo/locale";
import FontAwesome from '../FontAwesome';
import { lessonType } from './progressTypes';
import progressStyles from '@cdo/apps/code-studio/components/progress/progressStyles';
import HiddenStageToggle from '@cdo/apps/code-studio/components/progress/HiddenStageToggle';
import StageLock from '@cdo/apps/code-studio/components/progress/StageLock';
import { toggleHidden, isHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';

const styles = {
  main: {
    backgroundColor: color.lightest_cyan,
    height: '100%',
    borderWidth: 1,
    borderColor: color.cyan,
    borderStyle: 'solid',
    textAlign: 'center'
  },
  hiddenToggle: {
    marginTop: 10,
    marginBottom: -5
  },
  // TODO - unified button?
  lessonPlanButton: progressStyles.blueButton,
  lessonPlanText: {
    marginLeft: 10
  }
};

const ProgressLessonTeacherInfo = React.createClass({
  propTypes: {
    lesson: lessonType.isRequired,

    // redux provided
    sectionId: React.PropTypes.string,
    scriptAllowsHiddenStages: React.PropTypes.bool.isRequired,
    hiddenStageState: React.PropTypes.object.isRequired,
    scriptName: React.PropTypes.string.isRequired,
    hasNoSections: React.PropTypes.bool.isRequired,
    toggleHidden: React.PropTypes.func.isRequired
  },

  onClickHiddenToggle(value) {
    const { scriptName, sectionId, lesson, toggleHidden } = this.props;
    toggleHidden(scriptName, sectionId, lesson.id, value === 'hidden');
  },

  clickLessonPlan() {
    window.open(this.props.lesson.lesson_plan_html_url, '_blank');
  },

  render() {
    const { sectionId, scriptAllowsHiddenStages, hiddenStageState, hasNoSections, lesson } = this.props;

    const showHiddenStageToggle = sectionId && scriptAllowsHiddenStages && !hasNoSections;
    const isHidden = scriptAllowsHiddenStages &&
      isHiddenForSection(hiddenStageState, sectionId, lesson.id);

    const element =  (
      <div style={styles.main}>
        {showHiddenStageToggle &&
          <div style={styles.hiddenToggle}>
            <HiddenStageToggle
              hidden={!!isHidden}
              onChange={this.onClickHiddenToggle}
            />
          </div>
        }
        {lesson.lockable && !hasNoSections &&
          <StageLock stage={lesson}/>
        }
        {lesson.lesson_plan_html_url &&
          <button
            style={styles.lessonPlanButton}
            onClick={this.clickLessonPlan}
          >
            <FontAwesome icon="file-text"/>
            <span style={styles.lessonPlanText}>
              {i18n.viewLessonPlan()}
            </span>
          </button>
        }
      </div>
    );

    // If we don't have any children, don't render the blue box
    if (!element.props.children.some(child => !!child)) {
      return null;
    }
    return element;
  }
});

export default connect(state => ({
  sectionId: state.sections.selectedSectionId,
  scriptAllowsHiddenStages: state.hiddenStage.get('hideableAllowed'),
  hiddenStageState: state.hiddenStage,
  scriptName: state.progress.scriptName,
  hasNoSections: state.sections.sectionsAreLoaded &&
    state.sections.sectionIds.length === 0
}), dispatch => ({
  toggleHidden(scriptName, sectionId, lessonId, hidden) {
    dispatch(toggleHidden(scriptName, sectionId, lessonId, hidden));
  }
}))(ProgressLessonTeacherInfo);
