import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import TeacherPanelContainer from '../TeacherPanelContainer';
import SectionSelector from './SectionSelector';
import ViewAsToggle from './ViewAsToggle';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {fullyLockedStageMapping} from '../../stageLockRedux';
import {ViewType} from '../../viewAsRedux';
import {hasLockableStages, getLesson} from '../../progressRedux';
import {pageTypes} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import StudentTable from './StudentTable';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {SelectedStudentInfo} from './SelectedStudentInfo';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {studentType} from '@cdo/apps/templates/progress/progressTypes';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {
  levelProgressFromServer,
  levelProgressWithStatus
} from '@cdo/apps/templates/progress/progressHelpers';

const styles = {
  scrollable: {
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: '90%'
  },
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
  },
  sectionHeader: {
    margin: 10,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  exampleSolutions: {
    textAlign: 'center',
    margin: 5
  },
  sectionInfo: {
    textAlign: 'center',
    padding: '5px 0px'
  },
  teacherDashboardLink: {
    fontSize: 11
  }
};

class TeacherPanel extends React.Component {
  static propTypes = {
    onSelectUser: PropTypes.func,
    getSelectedUserId: PropTypes.func,
    sectionData: PropTypes.object,
    scriptName: PropTypes.string,
    // pageType describes the current route the user is on. Used only for logging.
    pageType: PropTypes.oneOf([
      pageTypes.level,
      pageTypes.scriptOverview,
      pageTypes.stageExtras
    ]),

    // Provided by redux.
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    hasSections: PropTypes.bool.isRequired,
    sectionsAreLoaded: PropTypes.bool.isRequired,
    selectedSection: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }),
    scriptHasLockableStages: PropTypes.bool.isRequired,
    unlockedStageNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    students: PropTypes.arrayOf(studentType)
  };

  constructor(props) {
    super(props);
    this.logToFirehose = this.logToFirehose.bind(this);
    this.onSelectUser = this.onSelectUser.bind(this);
    this.scriptLevels =
      props.sectionData && props.sectionData.section_script_levels;
    this.levelProgressByStudent = this.getLevelProgress(this.scriptLevels);
    this.currentStudent =
      props.sectionData && this.getCurrentStudent(props.sectionData);
    this.currentStudentLevel = this.getCurrentStudentLevel(
      this.currentStudent,
      this.scriptLevels,
      props.sectionData
    );
  }

  /**
   * Whereas our redux stores get progress data and level data from separate
   * api endpoints, the teacher panel gets level data directly from the rails
   * methods ScriptLevel.summarize_for_teacher_panel and
   * ScriptLevel.summarize_as_bonus_for_teacher_panel, both of which return
   * level data with progress status imbedded. Rather than refactor that
   * backend code to separate out the progress data, it is simpler to just
   * separate it out here.
   */
  getLevelProgress(levels) {
    const levelProgress = {};
    if (levels) {
      levels.forEach(level => {
        const studentProgress = levelProgress[level.user_id] || {};
        studentProgress[level.id] = levelProgressFromServer(level);
        levelProgress[level.user_id] = studentProgress;
      });
    }
    return levelProgress;
  }

  getCurrentStudent(sectionData) {
    if (sectionData.section && sectionData.section.students) {
      return sectionData.section.students.find(
        student => this.props.getSelectedUserId() === student.id
      );
    } else {
      return {
        id: -1,
        name: i18n.studentTableTeacherDemo()
      };
    }
  }

  getCurrentStudentLevel(student, levels, sectionData) {
    if (!student) {
      return null;
    } else if (!levels) {
      return sectionData && sectionData.teacher_level;
    }
    return levels.find(
      level => this.props.getSelectedUserId() === level.user_id
    );
  }

  logToFirehose(eventName, overrideData = {}) {
    const sectionId =
      this.props.selectedSection && this.props.selectedSection.id;
    let data = {
      section_id: sectionId,
      page_type: this.props.pageType,
      ...overrideData
    };

    firehoseClient.putRecord({
      study: 'teacher_panel',
      event: eventName,
      data_json: JSON.stringify(data)
    });
  }

  onSelectUser(id, selectType) {
    this.logToFirehose('select_student', {select_type: selectType});
    this.props.onSelectUser(id);
  }

  render() {
    const {
      sectionData,
      viewAs,
      hasSections,
      sectionsAreLoaded,
      selectedSection,
      scriptHasLockableStages,
      unlockedStageNames,
      students,
      scriptName
    } = this.props;

    const sectionId = selectedSection && selectedSection.id;
    const studentProgress =
      (this.currentStudent &&
        this.levelProgressByStudent[this.currentStudent.id]) ||
      {};
    const levelProgress =
      (this.currentStudentLevel &&
        studentProgress[this.currentStudentLevel.id]) ||
      levelProgressWithStatus(LevelStatus.not_tried);

    return (
      <TeacherPanelContainer logToFirehose={this.logToFirehose}>
        <h3>{i18n.teacherPanel()}</h3>
        <div style={styles.scrollable}>
          <ViewAsToggle logToFirehose={this.logToFirehose} />
          {viewAs === ViewType.Teacher &&
            this.currentStudent &&
            (students || []).length > 0 && (
              <SelectedStudentInfo
                students={students}
                selectedStudent={this.currentStudent}
                level={this.currentStudentLevel}
                levelProgress={levelProgress}
                onSelectUser={id => this.onSelectUser(id, 'iterator')}
                getSelectedUserId={this.props.getSelectedUserId}
              />
            )}
          {viewAs === ViewType.Teacher &&
            sectionData &&
            sectionData.level_examples && (
              <div style={styles.exampleSolutions}>
                {sectionData.level_examples.map((example, index) => (
                  <Button
                    __useDeprecatedTag
                    key={index}
                    text={i18n.exampleSolution({number: index + 1})}
                    color="blue"
                    href={example}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ))}
              </div>
            )}
          {!sectionsAreLoaded && (
            <div style={styles.text}>{i18n.loading()}</div>
          )}
          {sectionsAreLoaded && hasSections && (
            <div style={styles.sectionInfo}>
              <div>{i18n.viewingSection()}</div>
              <SectionSelector
                style={{margin: '0px 10px'}}
                reloadOnChange={true}
                logToFirehose={() => this.logToFirehose('select_section')}
              />
              {selectedSection && (
                <a
                  href={teacherDashboardUrl(selectedSection.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.teacherDashboardLink}
                  onClick={() => this.logToFirehose('select_teacher_dashboard')}
                >
                  {i18n.teacherDashboard()}
                </a>
              )}
            </div>
          )}
          {hasSections &&
            scriptHasLockableStages &&
            viewAs === ViewType.Teacher && (
              <div>
                <div style={styles.text}>
                  {i18n.selectSectionInstructions()}
                </div>
                {unlockedStageNames.length > 0 && (
                  <div>
                    <div style={styles.text}>
                      <FontAwesome
                        icon="exclamation-triangle"
                        style={styles.exclamation}
                      />
                      <div style={styles.dontForget}>{i18n.dontForget()}</div>
                    </div>
                    <div style={styles.text}>
                      {i18n.lockFollowing()}
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
          {viewAs === ViewType.Teacher && (students || []).length > 0 && (
            <StudentTable
              levels={this.scriptLevels}
              levelProgressByStudent={this.levelProgressByStudent}
              students={students}
              onSelectUser={id => this.onSelectUser(id, 'select_specific')}
              getSelectedUserId={this.props.getSelectedUserId}
              sectionId={sectionId}
              scriptName={scriptName}
            />
          )}
        </div>
      </TeacherPanelContainer>
    );
  }
}

export const UnconnectedTeacherPanel = TeacherPanel;
export default connect(state => {
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

  // Pretend we don't have lockable stages if we're not authorized to see them
  const scriptHasLockableStages =
    lockableAuthorized && hasLockableStages(state.progress);

  const unlockedStageNames = unlockedStageIds.map(
    id => getLesson(state.progress, parseInt(id)).name
  );

  return {
    viewAs: state.viewAs,
    hasSections: sectionIds.length > 0,
    sectionsAreLoaded,
    scriptHasLockableStages,
    selectedSection: state.teacherSections.sections[selectedSectionId],
    unlockedStageNames: unlockedStageNames,
    students: state.teacherSections.selectedStudents
  };
})(TeacherPanel);
