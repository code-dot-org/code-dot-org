/**
 * A bunch of teacher info that shows up in a blue box to the right of the detail
 * view for a given lesson.
 */

import React from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import i18n from "@cdo/locale";
import { lessonType } from './progressTypes';
import HiddenStageToggle from './HiddenStageToggle';
import StageLock from './StageLock';
import { toggleHidden, isHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';
import Button from '../Button';

const styles = {
  main: {
    backgroundColor: color.lightest_cyan,
    height: '100%',
    borderWidth: 1,
    borderColor: color.cyan,
    borderStyle: 'solid',
    textAlign: 'center'
  },
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

    const showHiddenStageToggle = sectionId && scriptAllowsHiddenStages && !hasNoSections;
    const isHidden = scriptAllowsHiddenStages &&
      isHiddenForSection(hiddenStageState, sectionId, lesson.id);

    const element =  (
      <div style={styles.main}>
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
        {showHiddenStageToggle &&
          <HiddenStageToggle
            hidden={!!isHidden}
            onChange={this.onClickHiddenToggle}
          />
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

export const UnconnectedProgressLessonTeacherInfo = ProgressLessonTeacherInfo;

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
