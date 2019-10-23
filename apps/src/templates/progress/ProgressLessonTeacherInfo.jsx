/**
 * A bunch of teacher info that shows up in a blue box to the right of the detail
 * view for a given lesson.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {lessonType} from './progressTypes';
import HiddenForSectionToggle from './HiddenForSectionToggle';
import StageLock from './StageLock';
import {
  toggleHiddenStage,
  isStageHiddenForSection
} from '@cdo/apps/code-studio/hiddenStageRedux';
import Button from '../Button';
import TeacherInfoBox from './TeacherInfoBox';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const styles = {
  buttonContainer: {
    marginTop: 5,
    marginLeft: 15,
    marginRight: 15
  },
  button: {
    width: '100%',
    paddingLeft: 0,
    paddingRight: 0
  }
};

class ProgressLessonTeacherInfo extends React.Component {
  static propTypes = {
    lesson: lessonType.isRequired,

    // redux provided
    sectionId: PropTypes.string,
    scriptAllowsHiddenStages: PropTypes.bool.isRequired,
    hiddenStageState: PropTypes.object.isRequired,
    scriptName: PropTypes.string.isRequired,
    hasNoSections: PropTypes.bool.isRequired,
    toggleHiddenStage: PropTypes.func.isRequired
  };

  onClickHiddenToggle = value => {
    const {scriptName, sectionId, lesson, toggleHiddenStage} = this.props;
    toggleHiddenStage(scriptName, sectionId, lesson.id, value === 'hidden');
    firehoseClient.putRecord({
      study: 'hidden-lessons',
      study_group: 'v0',
      event: value,
      data_json: JSON.stringify({
        script_name: scriptName,
        section_id: sectionId,
        lesson_id: lesson.id,
        lesson_name: lesson.name
      })
    });
  };

  render() {
    const {
      sectionId,
      scriptAllowsHiddenStages,
      hiddenStageState,
      hasNoSections,
      lesson
    } = this.props;

    const showHiddenForSectionToggle =
      sectionId && scriptAllowsHiddenStages && !hasNoSections;
    const isHidden =
      scriptAllowsHiddenStages &&
      isStageHiddenForSection(hiddenStageState, sectionId, lesson.id);

    return (
      <TeacherInfoBox>
        {lesson.lesson_plan_html_url && (
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
        )}
        {lesson.lockable && !hasNoSections && <StageLock lesson={lesson} />}
        {showHiddenForSectionToggle && (
          <HiddenForSectionToggle
            hidden={!!isHidden}
            onChange={this.onClickHiddenToggle}
          />
        )}
      </TeacherInfoBox>
    );
  }
}

export const UnconnectedProgressLessonTeacherInfo = ProgressLessonTeacherInfo;

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    scriptAllowsHiddenStages: state.hiddenStage.hideableStagesAllowed,
    hiddenStageState: state.hiddenStage,
    scriptName: state.progress.scriptName,
    hasNoSections:
      state.teacherSections.sectionsAreLoaded &&
      state.teacherSections.sectionIds.length === 0
  }),
  {toggleHiddenStage}
)(ProgressLessonTeacherInfo);
