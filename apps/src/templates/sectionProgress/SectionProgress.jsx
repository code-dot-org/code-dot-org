import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ScriptSelector from './ScriptSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import StandardsView from '@cdo/apps/templates/sectionProgress/standards/StandardsView';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import LessonSelector from './LessonSelector';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {h3Style} from '../../lib/ui/Headings';
import {
  getCurrentScriptData,
  setLessonOfInterest,
  setCurrentView
} from './sectionProgressRedux';
import {loadScriptProgress} from './sectionProgressLoader';
import {ViewType, scriptDataPropType} from './sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {
  setScriptId,
  validScriptPropType
} from '@cdo/apps/redux/scriptSelectionRedux';
import firehoseClient from '../../lib/util/firehose';
import ProgressViewHeader from './ProgressViewHeader';

/**
 * Given a particular section, this component owns figuring out which script to
 * show progress for (selected via a dropdown), and querying the server for
 * student progress. Child components then have the responsibility for displaying
 * that progress.
 */
class SectionProgress extends Component {
  static propTypes = {
    //Provided by redux
    scriptId: PropTypes.number,
    section: sectionDataPropType.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    setCurrentView: PropTypes.func.isRequired,
    scriptData: scriptDataPropType,
    setScriptId: PropTypes.func.isRequired,
    setLessonOfInterest: PropTypes.func.isRequired,
    isLoadingProgress: PropTypes.bool.isRequired,
    showStandardsIntroDialog: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.onChangeScript = this.onChangeScript.bind(this);
    this.onChangeLevel = this.onChangeLevel.bind(this);
    this.navigateToScript = this.navigateToScript.bind(this);
  }

  componentDidMount() {
    loadScriptProgress(this.props.scriptId, this.props.section.id);
  }

  onChangeScript(scriptId) {
    this.props.setScriptId(scriptId);
    loadScriptProgress(scriptId, this.props.section.id);

    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'change_script',
        data_json: JSON.stringify({
          section_id: this.props.section.id,
          old_script_id: this.props.scriptId,
          new_script_id: scriptId
        })
      },
      {includeUserId: true}
    );
  }

  onChangeLevel(lessonOfInterest) {
    this.props.setLessonOfInterest(lessonOfInterest);

    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'jump_to_lesson',
        data_json: JSON.stringify({
          section_id: this.props.section.id,
          script_id: this.props.scriptId,
          stage_id: this.props.scriptData.lessons[lessonOfInterest].id
        })
      },
      {includeUserId: true}
    );
  }

  navigateToScript() {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_script',
        data_json: JSON.stringify({
          section_id: this.props.section.id,
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
  }

  render() {
    const {
      validScripts,
      currentView,
      scriptId,
      scriptData,
      isLoadingProgress,
      showStandardsIntroDialog
    } = this.props;
    const levelDataInitialized = scriptData && !isLoadingProgress;
    const lessons = scriptData ? scriptData.lessons : [];
    const scriptWithStandardsSelected =
      levelDataInitialized && scriptData.hasStandards;
    const standardsStyle =
      currentView === ViewType.STANDARDS ? styles.show : styles.hide;
    return (
      <div>
        <div style={styles.topRowContainer}>
          <div>
            <div style={{...h3Style, ...styles.heading}}>
              {i18n.selectACourse()}
            </div>
            <ScriptSelector
              validScripts={validScripts}
              scriptId={scriptId}
              onChange={this.onChangeScript}
            />
          </div>
          {levelDataInitialized && (
            <div style={styles.toggle}>
              <div style={{...h3Style, ...styles.heading}}>{i18n.viewBy()}</div>
              <SectionProgressToggle
                showStandardsToggle={scriptWithStandardsSelected}
              />
            </div>
          )}
          {currentView === ViewType.DETAIL && lessons.length !== 0 && (
            <LessonSelector lessons={lessons} onChange={this.onChangeLevel} />
          )}
        </div>

        {levelDataInitialized && <ProgressViewHeader />}

        <div style={{clear: 'both'}}>
          {!levelDataInitialized && (
            <FontAwesome
              id="uitest-spinner"
              icon="spinner"
              className="fa-pulse fa-3x"
            />
          )}
          {levelDataInitialized &&
            (currentView === ViewType.SUMMARY ||
              currentView === ViewType.DETAIL) && (
              <ProgressTableView currentView={currentView} />
            )}
          {levelDataInitialized && currentView === ViewType.STANDARDS && (
            <div id="uitest-standards-view" style={standardsStyle}>
              <StandardsView
                showStandardsIntroDialog={showStandardsIntroDialog}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  heading: {
    marginBottom: 0
  },
  topRowContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 10
  },
  chevronLink: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end'
  },
  icon: {
    paddingRight: 5
  },
  toggle: {
    margin: '0px 30px'
  },
  show: {
    display: 'block'
  },
  hide: {
    display: 'none'
  },
  studentTooltip: {
    display: 'flex',
    textAlign: 'center'
  }
};

export const UnconnectedSectionProgress = SectionProgress;

export default connect(
  state => ({
    scriptId: state.scriptSelection.scriptId,
    section: state.sectionData.section,
    validScripts: state.scriptSelection.validScripts,
    currentView: state.sectionProgress.currentView,
    scriptData: getCurrentScriptData(state),
    isLoadingProgress: state.sectionProgress.isLoadingProgress,
    showStandardsIntroDialog: !state.currentUser.hasSeenStandardsReportInfo
  }),
  dispatch => ({
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
    setLessonOfInterest(lessonOfInterest) {
      dispatch(setLessonOfInterest(lessonOfInterest));
    },
    setCurrentView(viewType) {
      dispatch(setCurrentView(viewType));
    }
  })
)(SectionProgress);
