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
import {sectionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {
  OAuthSectionTypes,
  OAuthProviders
} from '@cdo/apps/lib/ui/accounts/constants';
import Button from '../Button';
import TeacherInfoBox from './TeacherInfoBox';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import GoogleClassroomShareButton from './GoogleClassroomShareButton';

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
    shareUrl: PropTypes.string.isRequired,

    // redux provided
    section: sectionShape,
    userProviders: PropTypes.arrayOf(PropTypes.string),
    scriptAllowsHiddenStages: PropTypes.bool.isRequired,
    hiddenStageState: PropTypes.object.isRequired,
    scriptName: PropTypes.string.isRequired,
    hasNoSections: PropTypes.bool.isRequired,
    toggleHiddenStage: PropTypes.func.isRequired
  };

  onClickHiddenToggle = value => {
    const {scriptName, section, lesson, toggleHiddenStage} = this.props;
    const sectionId = section.id.toString();
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
      section,
      userProviders,
      scriptAllowsHiddenStages,
      hiddenStageState,
      hasNoSections,
      lesson,
      shareUrl
    } = this.props;

    const sectionId = (section && section.id.toString()) || '';
    const showHiddenForSectionToggle =
      section && scriptAllowsHiddenStages && !hasNoSections;
    const isHidden =
      scriptAllowsHiddenStages &&
      isStageHiddenForSection(hiddenStageState, sectionId, lesson.id);
    const showGoogleClassroomButton =
      section &&
      section.loginType === OAuthSectionTypes.google_classroom &&
      userProviders.includes(OAuthProviders.google);
    const courseId =
      (showGoogleClassroomButton &&
        section.code &&
        parseInt(section.code.substring(2))) ||
      null;
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
        {lesson.lockable && !hasNoSections && <StageLock lesson={lesson} />}
        {showHiddenForSectionToggle && (
          <HiddenForSectionToggle
            hidden={!!isHidden}
            onChange={this.onClickHiddenToggle}
          />
        )}
        {showGoogleClassroomButton && (
          <div style={{...styles.buttonContainer, marginBottom: 5}}>
            <GoogleClassroomShareButton
              buttonId={`gc-button-${lesson.id}`}
              url={shareUrl}
              title={lesson.name}
              courseid={courseId}
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
    userProviders: state.currentUser.providers,
    scriptAllowsHiddenStages: state.hiddenStage.hideableStagesAllowed,
    hiddenStageState: state.hiddenStage,
    scriptName: state.progress.scriptName,
    hasNoSections:
      state.teacherSections.sectionsAreLoaded &&
      state.teacherSections.sectionIds.length === 0
  }),
  {toggleHiddenStage}
)(ProgressLessonTeacherInfo);
