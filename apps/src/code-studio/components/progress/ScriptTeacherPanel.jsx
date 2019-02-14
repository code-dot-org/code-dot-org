import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import TeacherPanel from '../TeacherPanel';
import SectionSelector from './SectionSelector';
import ViewAsToggle from './ViewAsToggle';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {fullyLockedStageMapping} from '../../stageLockRedux';
import {ViewType} from '../../viewAsRedux';
import {hasLockableStages} from '../../progressRedux';
import commonMsg from '@cdo/locale';
import StudentTable, {studentShape} from './StudentTable';

const styles = {
  text: {
    margin: 10
  },
  exclamation: {
    color: 'red'
  },
  dontForget: {
    display: 'inline',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

class ScriptTeacherPanel extends React.Component {
  static propTypes = {
    onSelectUser: PropTypes.func,
    getSelectedUserId: PropTypes.func,

    // Provided by redux.
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    hasSections: PropTypes.bool.isRequired,
    sectionsAreLoaded: PropTypes.bool.isRequired,
    scriptHasLockableStages: PropTypes.bool.isRequired,
    scriptAllowsHiddenStages: PropTypes.bool.isRequired,
    unlockedStageNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    students: PropTypes.arrayOf(studentShape)
  };

  calculateStudentTableMaxHeight = () => {
    let teacherPanel = $('.teacher-panel');
    let contentToRemove = $('#nonscrollable-content');

    if (teacherPanel.length > 0 && contentToRemove.length > 0) {
      return (
        // Calculate max height and include 15px buffer room.
        teacherPanel[0].clientHeight - contentToRemove[0].clientHeight - 15
      );
    }
  };

  render() {
    const {
      viewAs,
      hasSections,
      sectionsAreLoaded,
      scriptHasLockableStages,
      scriptAllowsHiddenStages,
      unlockedStageNames,
      students
    } = this.props;
    const studentTableMaxHeight = this.calculateStudentTableMaxHeight();

    return (
      <TeacherPanel>
        <div id="nonscrollable-content">
          <h3>{commonMsg.teacherPanel()}</h3>
          <ViewAsToggle />
          {!sectionsAreLoaded && (
            <div style={styles.text}>{commonMsg.loading()}</div>
          )}
          {(scriptAllowsHiddenStages || scriptHasLockableStages) && (
            <SectionSelector style={{margin: 10}} reloadOnChange={true} />
          )}
          {hasSections &&
            scriptHasLockableStages &&
            viewAs === ViewType.Teacher && (
              <div>
                <div style={styles.text}>
                  {commonMsg.selectSectionInstructions()}
                </div>
                {unlockedStageNames.length > 0 && (
                  <div>
                    <div style={styles.text}>
                      <FontAwesome
                        icon="exclamation-triangle"
                        style={styles.exclamation}
                      />
                      <div style={styles.dontForget}>
                        {commonMsg.dontForget()}
                      </div>
                    </div>
                    <div style={styles.text}>
                      {commonMsg.lockFollowing()}
                      <ul>
                        {unlockedStageNames.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
        {viewAs === ViewType.Teacher && students.length > 0 && (
          <div style={{maxHeight: studentTableMaxHeight, overflowY: 'scroll'}}>
            <StudentTable
              students={students}
              onSelectUser={this.props.onSelectUser}
              getSelectedUserId={this.props.getSelectedUserId}
            />
          </div>
        )}
      </TeacherPanel>
    );
  }
}

export const UnconnectedScriptTeacherPanel = ScriptTeacherPanel;
export default connect((state, ownProps) => {
  const {stagesBySectionId, lockableAuthorized} = state.stageLock;
  const {
    selectedSectionId,
    sectionsAreLoaded,
    sectionIds
  } = state.teacherSections;
  const currentSection = stagesBySectionId[selectedSectionId];

  const fullyLocked = fullyLockedStageMapping(
    state.stageLock.stagesBySectionId[selectedSectionId]
  );
  const unlockedStageIds = Object.keys(currentSection || {}).filter(
    stageId => !fullyLocked[stageId]
  );

  let stageNames = {};
  state.progress.stages.forEach(stage => {
    stageNames[stage.id] = stage.name;
  });

  // Pretend we don't have lockable stages if we're not authorized to see them
  const scriptHasLockableStages =
    lockableAuthorized && hasLockableStages(state.progress);

  return {
    viewAs: state.viewAs,
    hasSections: sectionIds.length > 0,
    sectionsAreLoaded,
    scriptHasLockableStages,
    scriptAllowsHiddenStages: state.hiddenStage.hideableStagesAllowed,
    unlockedStageNames: unlockedStageIds.map(id => stageNames[id]),
    students: state.teacherSections.selectedStudents
  };
})(ScriptTeacherPanel);
