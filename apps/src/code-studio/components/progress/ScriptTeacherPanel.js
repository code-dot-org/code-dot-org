import React from 'react';
import { connect } from 'react-redux';
import TeacherPanel from '../TeacherPanel';
import SectionSelector from './SectionSelector';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import { ViewType, setViewType, fullyLockedStageMapping } from '../../stageLockRedux';
import commonMsg from '@cdo/locale';

const styles = {
  viewAs: {
    fontSize: 16,
    margin: 10
  },
  toggleGroup: {
    margin: 10
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
    sectionsLoaded: React.PropTypes.bool.isRequired,
    scriptHasLockableStages: React.PropTypes.bool.isRequired,
    unlockedStageNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    setViewType: React.PropTypes.func.isRequired,
  },

  render() {
    const {
      viewAs,
      sections,
      sectionsLoaded,
      setViewType,
      scriptHasLockableStages,
      unlockedStageNames
    } = this.props;
    const hasSections = Object.keys(sections).length > 0;
    return (
      <TeacherPanel>
        <h3>{commonMsg.teacherPanel()}</h3>
        <div className="content">
          <ViewAsToggle viewAs={viewAs} setViewType={setViewType}/>
          {!sectionsLoaded && <div style={styles.text}>{commonMsg.loading()}</div>}
          {scriptHasLockableStages && hasSections && <SectionSelector/>}
          {scriptHasLockableStages && hasSections && this.props.viewAs === ViewType.Teacher &&
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
  const { viewAs, sections, selectedSection, sectionsLoaded, lockableAuthorized } = state.stageLock;
  const currentSection = sections[selectedSection];
  const stages = currentSection ? currentSection.stages : {};

  const fullyLocked = fullyLockedStageMapping(state.stageLock);
  const unlockedStageIds = Object.keys(stages).filter(stageId => !fullyLocked[stageId]);

  let stageNames = {};
  state.progress.stages.forEach(stage => {
    stageNames[stage.id] = stage.name;
  });

  // Pretend we don't have lockable stages if we're not authorized to see them
  const scriptHasLockableStages = lockableAuthorized &&
    state.progress.stages.some(stage => stage.lockable);

  return {
    viewAs,
    sections,
    sectionsLoaded,
    scriptHasLockableStages,
    unlockedStageNames: unlockedStageIds.map(id => stageNames[id])
  };
}, dispatch => ({
  setViewType(viewAs) {
    dispatch(setViewType(viewAs));
  }
}))(ScriptTeacherPanel);
