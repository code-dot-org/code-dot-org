import $ from 'jquery';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import TeacherOnlyMarkdown from './TeacherOnlyMarkdown';
import TeacherFeedback from './TeacherFeedback';
import InlineAudio from './InlineAudio';
import ContainedLevel from '../ContainedLevel';
import PaneHeader, {PaneButton} from '../../templates/PaneHeader';
import InstructionsTab from './InstructionsTab';
import HelpTabContents from './HelpTabContents';
import {
  toggleInstructionsCollapsed,
  setInstructionsMaxHeightNeeded,
  setInstructionsRenderedHeight,
  setInstructionsHeight
} from '../../redux/instructions';
import color from '../../util/color';
import styleConstants from '../../styleConstants';
import commonStyles from '../../commonStyles';
import Instructions from './Instructions';
import CollapserIcon from './CollapserIcon';
import HeightResizer from './HeightResizer';
import msg from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import experiments from '@cdo/apps/util/experiments';
import queryString from 'query-string';

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const MIN_HEIGHT = RESIZER_HEIGHT + 60;

const TabType = {
  INSTRUCTIONS: 'instructions',
  RESOURCES: 'resources',
  COMMENTS: 'comments'
};

const styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0
    // left handled by media queries for .editor-column
  },
  noViz: {
    left: 0,
    right: 0,
    marginRight: 0,
    marginLeft: 0
  },
  body: {
    backgroundColor: 'white',
    overflowY: 'scroll',
    paddingLeft: 10,
    paddingRight: 10,
    position: 'absolute',
    top: HEADER_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0
  },
  embedView: {
    height: undefined,
    bottom: 0
  },
  paneHeaderOverride: {
    color: color.default_text
  },
  title: {
    textAlign: 'center',
    height: HEADER_HEIGHT,
    lineHeight: HEADER_HEIGHT + 'px'
  },
  helpTabs: {
    float: 'left',
    paddingTop: 6,
    paddingLeft: 30
  }
};

const audioStyle = {
  wrapper: {
    float: 'right'
  },
  button: {
    height: 24,
    marginTop: '3px',
    marginBottom: '3px'
  },
  buttonImg: {
    lineHeight: '24px',
    fontSize: 15,
    paddingLeft: 12
  }
};

class TopInstructionsCSP extends Component {
  static propTypes = {
    isEmbedView: PropTypes.bool.isRequired,
    hasContainedLevels: PropTypes.bool,
    puzzleNumber: PropTypes.number.isRequired,
    stageTotal: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    expandedHeight: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
    longInstructions: PropTypes.string,
    collapsed: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
    toggleInstructionsCollapsed: PropTypes.func.isRequired,
    setInstructionsHeight: PropTypes.func.isRequired,
    setInstructionsRenderedHeight: PropTypes.func.isRequired,
    setInstructionsMaxHeightNeeded: PropTypes.func.isRequired,
    documentationUrl: PropTypes.string,
    ttsLongInstructionsUrl: PropTypes.string,
    levelVideos: PropTypes.array,
    mapReference: PropTypes.string,
    referenceLinks: PropTypes.array,
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
    readOnlyWorkspace: PropTypes.bool,
    serverLevelId: PropTypes.number,
    user: PropTypes.number
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    const studentId = queryString.parse(window.location.search).user_id;

    const teacherViewingStudentWork =
      this.props.viewAs === ViewType.Teacher &&
      this.props.readOnlyWorkspace &&
      window.location.search.includes('user_id');

    this.state = {
      tabSelected: teacherViewingStudentWork
        ? TabType.COMMENTS
        : TabType.INSTRUCTIONS,
      feedbacks: [],
      rubric: null,
      studentId: studentId,
      teacherViewingStudentWork: teacherViewingStudentWork,
      fetchingData: true,
      token: null
    };
  }

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    const {user, serverLevelId} = this.props;
    const {studentId} = this.state;

    window.addEventListener('resize', this.adjustMaxNeededHeight);

    const maxNeededHeight = this.adjustMaxNeededHeight();

    // Initially set to 300. This might be adjusted when InstructionsWithWorkspace
    // adjusts max height.
    this.props.setInstructionsRenderedHeight(Math.min(maxNeededHeight, 300));

    const promises = [];

    if (this.props.viewAs === ViewType.Student) {
      promises.push(
        $.ajax({
          url: `/api/v1/teacher_feedbacks/get_feedbacks?student_id=${user}&level_id=${serverLevelId}`,
          method: 'GET',
          contentType: 'application/json;charset=UTF-8'
        }).done(data => {
          // If student has feedback make their default tab the feedback tab instead of instructions
          if (data[0] && (data[0].comment || data[0].performance)) {
            this.setState({feedbacks: data, tabSelected: TabType.COMMENTS});
          }
        })
      );
    }
    //While this is behind an experiment flag we will only pull the rubric
    //if the experiment is enable. This should prevent us from showing the
    //rubric if not in the experiment.
    if (experiments.isEnabled(experiments.MINI_RUBRIC_2019)) {
      promises.push(
        $.ajax({
          url: `/levels/${serverLevelId}/get_rubric/`,
          method: 'GET',
          contentType: 'application/json;charset=UTF-8'
        }).done(data => {
          this.setState({rubric: data});
        })
      );
    }

    if (this.state.teacherViewingStudentWork) {
      promises.push(
        $.ajax({
          url: `/api/v1/teacher_feedbacks/get_feedback_from_teacher?student_id=${studentId}&level_id=${serverLevelId}&teacher_id=${user}`,
          method: 'GET',
          contentType: 'application/json;charset=UTF-8'
        }).done((data, textStatus, request) => {
          this.setState({
            feedbacks: request.status === 204 ? [] : [data],
            token: request.getResponseHeader('csrf-token')
          });
        })
      );
    }

    Promise.all(promises).then(() => {
      this.setState({fetchingData: false}, this.forceTabResizeToMaxHeight);
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustMaxNeededHeight);
  }

  /**
   * Height can get below min height iff we resize the window to be super small.
   * If we then resize it to be larger again, we want to increase height.
   */
  componentWillReceiveProps(nextProps) {
    if (
      !nextProps.collapsed &&
      nextProps.height < MIN_HEIGHT &&
      nextProps.height < nextProps.maxHeight
    ) {
      this.props.setInstructionsRenderedHeight(
        Math.min(nextProps.maxHeight, MIN_HEIGHT)
      );
    }
  }

  /**
   * Function to force the height of the instructions area to be the
   * full size of the content for that area. This is used when the comment
   * tab loads in order to make the instructions area show the whole
   * contents of the comment tab.
   */
  forceTabResizeToMaxHeight = () => {
    if (this.state.tabSelected === TabType.COMMENTS) {
      this.props.setInstructionsRenderedHeight(this.adjustMaxNeededHeight());
    }
  };

  /**
   * Given a prospective delta, determines how much we can actually change the
   * height (accounting for min/max) and changes height by that much.
   * @param {number} delta
   * @returns {number} How much we actually changed
   */
  handleHeightResize = delta => {
    const currentHeight = this.props.height;

    let newHeight = Math.max(MIN_HEIGHT, currentHeight + delta);
    newHeight = Math.min(newHeight, this.props.maxHeight);

    this.props.setInstructionsRenderedHeight(newHeight);
    return newHeight - currentHeight;
  };

  /**
   * Calculate how much height it would take to show top instructions with our
   * entire instructions visible and update store with this value.
   * @returns {number}
   */

  adjustMaxNeededHeight = () => {
    let element;
    switch (this.state.tabSelected) {
      case TabType.RESOURCES:
        element = this.refs.helpTab;
        break;
      case TabType.INSTRUCTIONS:
        element = this.refs.instructions;
        break;
      case TabType.COMMENTS:
        element = this.refs.commentTab;
        break;
    }
    const maxNeededHeight =
      $(ReactDOM.findDOMNode(element)).outerHeight(true) +
      HEADER_HEIGHT +
      RESIZER_HEIGHT;

    this.props.setInstructionsMaxHeightNeeded(maxNeededHeight);
    return maxNeededHeight;
  };

  /**
   * Handle a click of our collapser button by changing our collapse state, and
   * updating our rendered height.
   */
  handleClickCollapser = () => {
    const collapsed = !this.props.collapsed;
    this.props.toggleInstructionsCollapsed();

    // adjust rendered height based on next collapsed state
    if (collapsed) {
      this.props.setInstructionsRenderedHeight(HEADER_HEIGHT);
    } else {
      this.props.setInstructionsRenderedHeight(this.props.expandedHeight);
    }
  };

  /**
   * Handle a click on the Documentation PaneButton.
   */
  handleDocumentationClick = () => {
    const win = window.open(this.props.documentationUrl, '_blank');
    win.focus();
  };

  handleHelpTabClick = () => {
    this.setState({tabSelected: TabType.RESOURCES});
  };

  handleInstructionTabClick = () => {
    this.setState({tabSelected: TabType.INSTRUCTIONS});
  };

  handleCommentTabClick = () => {
    this.setState(
      {tabSelected: TabType.COMMENTS},
      this.forceTabResizeToMaxHeight
    );
  };

  render() {
    const mainStyle = [
      styles.main,
      {
        height: this.props.height - RESIZER_HEIGHT
      },
      this.props.noVisualization && styles.noViz,
      this.props.isEmbedView && styles.embedView
    ];
    const ttsUrl = this.props.ttsLongInstructionsUrl;
    const videoData = this.props.levelVideos ? this.props.levelVideos[0] : [];

    // Only display the help tab when there are one or more videos or
    // additional resource links.
    const videosAvailable =
      this.props.levelVideos && this.props.levelVideos.length > 0;
    const levelResourcesAvailable =
      this.props.mapReference !== null ||
      (this.props.referenceLinks && this.props.referenceLinks.length > 0);

    const displayHelpTab = videosAvailable || levelResourcesAvailable;

    const studentHasFeedback =
      this.props.viewAs === ViewType.Student &&
      this.state.feedbacks.length > 0 &&
      (this.state.feedbacks[0].comment || this.state.feedbacks[0].performance);

    /*
     * The feedback tab will be the Key Concept tab if there is a mini rubric and:
     * 1) Teacher is viewing the level but not giving feedback to the student
     * 2) Student does not have any feedback for that level
     * The Key Concept tab shows the Key Concept and Rubric for the level in a view
     * only form
     */
    const displayKeyConcept =
      this.state.rubric &&
      ((this.props.viewAs === ViewType.Student && !studentHasFeedback) ||
        (this.props.viewAs === ViewType.Teacher &&
          !this.state.teacherViewingStudentWork));
    const feedbackTabText = displayKeyConcept ? 'Key Concept' : msg.feedback();

    const displayFeedback =
      displayKeyConcept ||
      this.state.teacherViewingStudentWork ||
      studentHasFeedback;

    // Teacher is viewing students work and in the Feedback Tab
    const teacherOnly =
      this.state.tabSelected === TabType.COMMENTS &&
      this.state.teacherViewingStudentWork;

    return (
      <div style={mainStyle} className="editor-column">
        <PaneHeader hasFocus={false} teacherOnly={teacherOnly}>
          <div style={styles.paneHeaderOverride}>
            {this.state.tabSelected === TabType.INSTRUCTIONS && ttsUrl && (
              <InlineAudio src={ttsUrl} style={audioStyle} />
            )}
            {this.props.documentationUrl &&
              this.state.tabSelected !== TabType.COMMENTS && (
                <PaneButton
                  iconClass="fa fa-book"
                  label={msg.documentation()}
                  isRtl={false}
                  headerHasFocus={false}
                  onClick={this.handleDocumentationClick}
                />
              )}
            <div style={styles.helpTabs}>
              <InstructionsTab
                className="uitest-instructionsTab"
                onClick={this.handleInstructionTabClick}
                selected={this.state.tabSelected === TabType.INSTRUCTIONS}
                text={msg.instructions()}
                teacherOnly={teacherOnly}
              />
              {displayHelpTab && (
                <InstructionsTab
                  className="uitest-helpTab"
                  onClick={this.handleHelpTabClick}
                  selected={this.state.tabSelected === TabType.RESOURCES}
                  text={msg.helpTips()}
                  teacherOnly={teacherOnly}
                />
              )}
              {displayFeedback && (!this.state.fetchingData || teacherOnly) && (
                <InstructionsTab
                  className="uitest-feedback"
                  onClick={this.handleCommentTabClick}
                  selected={this.state.tabSelected === TabType.COMMENTS}
                  text={feedbackTabText}
                  teacherOnly={teacherOnly}
                />
              )}
            </div>
            {!this.props.isEmbedView && (
              <CollapserIcon
                collapsed={this.props.collapsed}
                onClick={this.handleClickCollapser}
                teacherOnly={teacherOnly}
              />
            )}
          </div>
        </PaneHeader>
        <div style={[this.props.collapsed && commonStyles.hidden]}>
          <div style={styles.body}>
            <div ref="instructions">
              {this.props.hasContainedLevels && (
                <ContainedLevel
                  ref="instructions"
                  hidden={this.state.tabSelected !== TabType.INSTRUCTIONS}
                />
              )}
              {!this.props.hasContainedLevels &&
                this.state.tabSelected === TabType.INSTRUCTIONS && (
                  <div>
                    <Instructions
                      ref="instructions"
                      longInstructions={this.props.longInstructions}
                      onResize={this.adjustMaxNeededHeight}
                      inTopPane
                    />
                    <TeacherOnlyMarkdown />
                  </div>
                )}
            </div>
            {this.state.tabSelected === TabType.RESOURCES && (
              <HelpTabContents
                ref="helpTab"
                videoData={videoData}
                mapReference={this.props.mapReference}
                referenceLinks={this.props.referenceLinks}
              />
            )}
            {displayFeedback && !this.state.fetchingData && (
              <TeacherFeedback
                user={this.props.user}
                visible={this.state.tabSelected === TabType.COMMENTS}
                displayKeyConcept={displayKeyConcept}
                disabledMode={
                  this.props.viewAs === ViewType.Student ||
                  !this.state.teacherViewingStudentWork
                }
                rubric={this.state.rubric}
                ref="commentTab"
                latestFeedback={this.state.feedbacks}
                token={this.state.token}
              />
            )}
          </div>
          {!this.props.isEmbedView && (
            <HeightResizer
              position={this.props.height}
              onResize={this.handleHeightResize}
            />
          )}
        </div>
      </div>
    );
  }
}
export const UnconnectedTopInstructionsCSP = TopInstructionsCSP;
export default connect(
  state => ({
    isEmbedView: state.pageConstants.isEmbedView,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    puzzleNumber: state.pageConstants.puzzleNumber,
    stageTotal: state.pageConstants.stageTotal,
    height: state.instructions.renderedHeight,
    expandedHeight: state.instructions.expandedHeight,
    maxHeight: Math.min(
      state.instructions.maxAvailableHeight,
      state.instructions.maxNeededHeight
    ),
    longInstructions: state.instructions.longInstructions,
    noVisualization: state.pageConstants.noVisualization,
    collapsed: state.instructions.collapsed,
    documentationUrl: state.pageConstants.documentationUrl,
    ttsLongInstructionsUrl: state.pageConstants.ttsLongInstructionsUrl,
    levelVideos: state.instructions.levelVideos,
    mapReference: state.instructions.mapReference,
    referenceLinks: state.instructions.referenceLinks,
    viewAs: state.viewAs,
    readOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    serverLevelId: state.pageConstants.serverLevelId,
    user: state.pageConstants.userId
  }),
  dispatch => ({
    toggleInstructionsCollapsed() {
      dispatch(toggleInstructionsCollapsed());
    },
    setInstructionsHeight(height) {
      dispatch(setInstructionsHeight(height));
    },
    setInstructionsRenderedHeight(height) {
      dispatch(setInstructionsRenderedHeight(height));
    },
    setInstructionsMaxHeightNeeded(height) {
      dispatch(setInstructionsMaxHeightNeeded(height));
    }
  }),
  null,
  {withRef: true}
)(Radium(TopInstructionsCSP));
