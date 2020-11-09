/**
 * A bunch of teacher info that shows up in a blue box to the right of the detail
 * view for a given lesson.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';
import {lessonType} from './progressTypes';
import HiddenForSectionToggle from './HiddenForSectionToggle';
import StageLock from './StageLock';
import {
  toggleHiddenStage,
  isStageHiddenForSection
} from '@cdo/apps/code-studio/hiddenStageRedux';
import {sectionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import Button from '../Button';
import TeacherInfoBox from './TeacherInfoBox';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import GoogleClassroomShareButton from './GoogleClassroomShareButton';
import {canShowGoogleShareButton} from './googlePlatformApiRedux';
import SendLesson from './SendLesson';

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
  },
  googleButtonMargin: {
    marginBottom: 5
  }
};

class ProgressLessonTeacherInfo extends React.Component {
  static propTypes = {
    lesson: lessonType.isRequired,
    lessonUrl: PropTypes.string,

    // redux provided
    section: sectionShape,
    scriptAllowsHiddenStages: PropTypes.bool.isRequired,
    hiddenStageState: PropTypes.object.isRequired,
    scriptName: PropTypes.string.isRequired,
    hasNoSections: PropTypes.bool.isRequired,
    toggleHiddenStage: PropTypes.func.isRequired,
    showGoogleClassroomButton: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.onClickHiddenToggle = this.onClickHiddenToggle.bind(this);
    this.firehoseData = this.firehoseData.bind(this);
  }

  onClickHiddenToggle(value) {
    const {scriptName, section, lesson, toggleHiddenStage} = this.props;
    const sectionId = (section && section.id.toString()) || '';
    toggleHiddenStage(scriptName, sectionId, lesson.id, value === 'hidden');
    firehoseClient.putRecord(
      {
        study: 'hidden-lessons',
        study_group: 'v0',
        event: value,
        data_json: JSON.stringify(this.firehoseData())
      },
      {includeUserId: true}
    );
  }

  firehoseData() {
    const {scriptName, section, lesson} = this.props;
    return {
      script_name: scriptName,
      section_id: section && section.id,
      lesson_id: lesson.id,
      lesson_name: lesson.name
    };
  }

  render() {
    const {
      section,
      scriptAllowsHiddenStages,
      hiddenStageState,
      hasNoSections,
      lesson,
      lessonUrl,
      showGoogleClassroomButton
    } = this.props;

    const sectionId = (section && section.id.toString()) || '';
    const showHiddenForSectionToggle =
      section && scriptAllowsHiddenStages && !hasNoSections;
    const isHidden =
      scriptAllowsHiddenStages &&
      isStageHiddenForSection(hiddenStageState, sectionId, lesson.id);
    const courseId =
      (showGoogleClassroomButton &&
        section &&
        section.code &&
        parseInt(section.code.substring(2))) ||
      null;
    const loginRequiredLessonUrl = lessonUrl + '?login_required=true';
    const shouldRender =
      lesson.lesson_plan_html_url ||
      (lesson.lockable && !hasNoSections) ||
      showHiddenForSectionToggle ||
      showGoogleClassroomButton;
    if (!shouldRender) {
      return null;
    }

    return (
      <TeacherInfoBox>
        {lesson.lesson_plan_html_url && (
          <div style={styles.buttonContainer}>
            <Button
              __useDeprecatedTag
              href={lesson.lesson_plan_html_url}
              text={i18n.viewLessonPlan()}
              icon="file-text"
              color="blue"
              target="_blank"
              style={styles.button}
            />
          </div>
        )}
        {experiments.isEnabled(experiments.SEND_LESSON_DIALOG) && lessonUrl && (
          <div style={styles.buttonContainer}>
            <SendLesson
              lessonUrl={loginRequiredLessonUrl}
              title={lesson.name}
              courseid={courseId}
              analyticsData={JSON.stringify(this.firehoseData())}
              buttonStyle={styles.button}
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
        {!experiments.isEnabled(experiments.SEND_LESSON_DIALOG) &&
          showGoogleClassroomButton &&
          lessonUrl && (
            <div
              style={{...styles.buttonContainer, ...styles.googleButtonMargin}}
            >
              <GoogleClassroomShareButton
                url={lessonUrl}
                title={lesson.name}
                courseid={courseId}
                analyticsData={JSON.stringify(this.firehoseData())}
              />
            </div>
          )}
      </TeacherInfoBox>
    );
  }
}

export const UnconnectedProgressLessonTeacherInfo = ProgressLessonTeacherInfo;

export default connect(
  state => ({
    section:
      state.teacherSections.sections[state.teacherSections.selectedSectionId],
    scriptAllowsHiddenStages: state.hiddenStage.hideableStagesAllowed,
    hiddenStageState: state.hiddenStage,
    scriptName: state.progress.scriptName,
    hasNoSections:
      state.teacherSections.sectionsAreLoaded &&
      state.teacherSections.sectionIds.length === 0,
    showGoogleClassroomButton: canShowGoogleShareButton(state)
  }),
  {toggleHiddenStage}
)(ProgressLessonTeacherInfo);
