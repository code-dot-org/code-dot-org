/**
 * A bunch of teacher info that shows up in a blue box to the right of the detail
 * view for a given lesson.
 */

import React from 'react';
import { connect } from 'react-redux';
import i18n from "@cdo/locale";
import { lessonType } from './progressTypes';
import HiddenForSectionToggle from './HiddenForSectionToggle';
import StageLock from './StageLock';
import { toggleHidden, isStageHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';
import Button from '../Button';
import TeacherInfoBox from './TeacherInfoBox';

const styles = {
  buttonContainer: {
    marginTop: 5,
    marginLeft: 15,
    marginRight: 15
  },
  button: {
    width: '100%',
    paddingLeft: 0,
    paddingRight: 0,
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

  render() {
    const { sectionId, scriptAllowsHiddenStages, hiddenStageState, hasNoSections, lesson } = this.props;

    const showHiddenForSectionToggle = sectionId && scriptAllowsHiddenStages && !hasNoSections;
    const isHidden = scriptAllowsHiddenStages &&
      isStageHiddenForSection(hiddenStageState, sectionId, lesson.id);

    return (
      <TeacherInfoBox>
        {lesson.lesson_plan_html_url &&
          <div style={styles.buttonContainer}>
            <Button
              href={lesson.lesson_plan_html_url}
              text={i18n.viewLessonPlan()}
              icon="file-text"
              color="blue"
              target="_blank"
              style={styles.button}
            />
          </div>
        }
        {lesson.lockable && !hasNoSections &&
          <StageLock lesson={lesson}/>
        }
        {showHiddenForSectionToggle &&
          <HiddenForSectionToggle
            hidden={!!isHidden}
            onChange={this.onClickHiddenToggle}
          />
        }
      </TeacherInfoBox>
    );
  }
});

export const UnconnectedProgressLessonTeacherInfo = ProgressLessonTeacherInfo;

export default connect(state => ({
  sectionId: state.teacherSections.selectedSectionId,
  scriptAllowsHiddenStages: state.hiddenStage.hideableStagesAllowed,
  hiddenStageState: state.hiddenStage,
  scriptName: state.progress.scriptName,
  hasNoSections: state.teacherSections.sectionsAreLoaded &&
    state.teacherSections.sectionIds.length === 0
}), dispatch => ({
  toggleHidden(scriptName, sectionId, lessonId, hidden) {
    dispatch(toggleHidden(scriptName, sectionId, lessonId, hidden));
  }
}))(ProgressLessonTeacherInfo);
