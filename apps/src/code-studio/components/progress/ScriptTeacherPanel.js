import React from 'react';
import { connect } from 'react-redux';
import TeacherPanel from '../TeacherPanel';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { ViewType, setViewType, selectSection } from '../../stageLockRedux';
import commonMsg from '@cdo/locale';

const styles = {
  viewAs: {
    fontSize: 16,
    margin: 10
  },
  toggleGroup: {
    margin: 10
  },
  select: {
    margin: 10,
    width: 180
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
  }
};

const ViewAsToggle = ({viewAs, setViewType}) => (
  <div className="non-scrollable-wrapper">
    <div style={styles.viewAs}>
      {commonMsg.viewPageAs()}
    </div>
    <div style={styles.toggleGroup}>
      <ToggleGroup
        selected={viewAs}
        onChange={setViewType}
      >
        <button value={ViewType.Student}>{commonMsg.student()}</button>
        <button value={ViewType.Teacher}>{commonMsg.teacher()}</button>
      </ToggleGroup>
    </div>
  </div>
);
ViewAsToggle.propTypes = {
  viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
  setViewType: React.PropTypes.func.isRequired,
};

const ScriptTeacherPanel = React.createClass({
  propTypes: {
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
    sections: React.PropTypes.objectOf(
      React.PropTypes.shape({
        section_name: React.PropTypes.string.isRequired
      })
    ).isRequired,
    selectedSection: React.PropTypes.string,
    sectionsLoaded: React.PropTypes.bool.isRequired,
    scriptHasLockedStages: React.PropTypes.bool.isRequired,
    unlockedStageNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    setViewType: React.PropTypes.func.isRequired,
    selectSection: React.PropTypes.func.isRequired,
  },

  handleSelectChange(event) {
    this.props.selectSection(event.target.value);
  },

  render() {
    const {
      viewAs,
      sections,
      selectedSection,
      sectionsLoaded,
      setViewType,
      scriptHasLockedStages,
      unlockedStageNames
    } = this.props;
    const hasSections = Object.keys(sections).length > 0;
    return (
      <TeacherPanel>
        <h3>{commonMsg.teacherPanel()}</h3>
        <div className="content">
          <ViewAsToggle viewAs={viewAs} setViewType={setViewType}/>
          {!sectionsLoaded && <div style={styles.text}>{commonMsg.loading()}</div>}
          {scriptHasLockedStages && hasSections &&
            <select
              name="sections"
              style={styles.select}
              value={selectedSection}
              onChange={this.handleSelectChange}
            >
              {Object.keys(sections).map(id => (
                <option key={id} value={id}>
                  {sections[id].section_name}
                </option>
              ))}
            </select>
          }
          {scriptHasLockedStages && hasSections && this.props.viewAs === ViewType.Teacher &&
            <div>
              <div style={styles.text}>
                {commonMsg.selectSection()}
              </div>
              {unlockedStageNames.length > 0 &&
                <div>
                  <div style={styles.text}>
                    <FontAwesome icon="exclamation-triangle" style={styles.exclamation}/>
                    <div style={styles.dontForget}>{commonMsg.dontForget()}</div>
                  </div>
                  <div style={styles.text}>
                    {commonMsg.lockFollowing()}
                    <ul>
                      {unlockedStageNames.map((name, index) => (
                        <li key={index}>{name}</li>)
                      )}
                    </ul>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </TeacherPanel>
    );
  }
});

export default connect((state, ownProps) => {
  const { viewAs, sections, selectedSection, sectionsLoaded } = state.stageLock;
  const currentSection = sections[selectedSection];
  const stages = currentSection ? currentSection.stages : {};

  const unlockedStageIds = Object.keys(stages).filter(stageId => {
    // filter to only stages that are unlocked
    const stageStudents = currentSection.stages[stageId];
    return stageStudents.some(student => !student.locked);
  });

  let stageNames = {};
  state.progress.stages.forEach(stage => {
    stageNames[stage.id] = stage.name;
  });

  const scriptHasLockedStages = state.progress.stages.some(stage => stage.lockable);

  return {
    viewAs,
    sections,
    selectedSection,
    sectionsLoaded,
    scriptHasLockedStages,
    unlockedStageNames: unlockedStageIds.map(id => stageNames[id])
  };
}, dispatch => ({
  setViewType(viewAs) {
    dispatch(setViewType(viewAs));
  },
  selectSection(sectionId) {
    dispatch(selectSection(sectionId));
  }
}))(ScriptTeacherPanel);
