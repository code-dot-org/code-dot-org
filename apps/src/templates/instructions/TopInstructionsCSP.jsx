
import $ from 'jquery';
import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import {connect} from 'react-redux';
import TeacherOnlyMarkdown from './TeacherOnlyMarkdown';
import FeedbacksList from "./FeedbacksList";
import TeacherFeedback from "./TeacherFeedback";
import InlineAudio from './InlineAudio';
import ContainedLevel from '../ContainedLevel';
import PaneHeader, { PaneButton } from '../../templates/PaneHeader';
import InstructionsTab from './InstructionsTab';
import HelpTabContents from './HelpTabContents';
import {
  toggleInstructionsCollapsed,
  setInstructionsMaxHeightNeeded,
  setInstructionsRenderedHeight,
  setInstructionsHeight
} from '../../redux/instructions';
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import commonStyles from '../../commonStyles';
import Instructions from './Instructions';
import CollapserIcon from './CollapserIcon';
import HeightResizer from './HeightResizer';
import msg from '@cdo/locale';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

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
    right: 0,
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
    color: color.default_text,
  },
  title: {
    textAlign: 'center',
    height: HEADER_HEIGHT,
    lineHeight: HEADER_HEIGHT + 'px'
  },
  helpTabs: {
    float: 'left',
    paddingTop: 6,
    paddingLeft: 30,
  }
};

const audioStyle = {
  wrapper: {
    float: 'right',
  },
  button: {
    height: 24,
    marginTop: '3px',
    marginBottom: '3px',
  },
  buttonImg: {
    lineHeight: '24px',
    fontSize: 15,
    paddingLeft: 12,
  }
};

class TopInstructions extends Component {
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
    ttsLongInstructionsUrl:  PropTypes.string,
    levelVideos: PropTypes.array,
    mapReference: PropTypes.string,
    referenceLinks: PropTypes.array,
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
    readOnlyWorkspace: PropTypes.bool,
    serverLevelId:PropTypes.number,
    user: PropTypes.number
  };

  constructor(props) {
    super(props);

    const teacherViewingStudentWork = this.props.viewAs === ViewType.Teacher && this.props.readOnlyWorkspace &&
      (window.location.search).includes('user_id');

    this.state = {
      tabSelected: teacherViewingStudentWork ? TabType.COMMENTS : TabType.INSTRUCTIONS,
      feedbacks: [],
      displayFeedbackTeacherFacing: teacherViewingStudentWork,
    };
  }

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    window.addEventListener('resize', this.adjustMaxNeededHeight);

    const maxNeededHeight = this.adjustMaxNeededHeight();

    // Initially set to 300. This might be adjusted when InstructionsWithWorkspace
    // adjusts max height.
    this.props.setInstructionsRenderedHeight(Math.min(maxNeededHeight, 300));

    if (this.props.viewAs === ViewType.Student) {
      $.ajax({
        url: '/api/v1/teacher_feedbacks/get_feedbacks?student_id='+this.props.user+'&level_id='+this.props.serverLevelId,
        method: 'GET',
        contentType: 'application/json;charset=UTF-8',
      }).done(data => {
        this.setState({feedbacks: data});
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustMaxNeededHeight);
  }

  /**
   * Height can get below min height iff we resize the window to be super small.
   * If we then resize it to be larger again, we want to increase height.
   */
  componentWillReceiveProps(nextProps) {
    if (!nextProps.collapsed && nextProps.height < MIN_HEIGHT &&
        nextProps.height < nextProps.maxHeight) {
      this.props.setInstructionsRenderedHeight(Math.min(nextProps.maxHeight, MIN_HEIGHT));
    }
  }

  /**
   * Given a prospective delta, determines how much we can actually change the
   * height (accounting for min/max) and changes height by that much.
   * @param {number} delta
   * @returns {number} How much we actually changed
   */
  handleHeightResize = (delta) => {
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
    const maxNeededHeight = $(ReactDOM.findDOMNode(element)).outerHeight(true) +
      HEADER_HEIGHT + RESIZER_HEIGHT;

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
    this.setState({tabSelected: TabType.COMMENTS});
  };

  render() {
    const mainStyle = [
      styles.main,
      {
        height: this.props.height - RESIZER_HEIGHT
      },
      this.props.noVisualization && styles.noViz,
      this.props.isEmbedView && styles.embedView,
    ];
    const ttsUrl = this.props.ttsLongInstructionsUrl;
    const videoData = this.props.levelVideos ? this.props.levelVideos[0] : [];

    // Only display the help tab when there are one or more videos or
    // additional resource links.
    const videosAvailable = this.props.levelVideos && this.props.levelVideos.length > 0;
    const levelResourcesAvailable = this.props.mapReference !== null ||
      (this.props.referenceLinks && this.props.referenceLinks.length > 0);

    const displayHelpTab = videosAvailable || levelResourcesAvailable;
    const displayFeedbackStudent = this.props.viewAs === ViewType.Student && this.state.feedbacks.length > 0;
    const displayFeedback = displayFeedbackStudent || this.state.displayFeedbackTeacherFacing;
    const teacherOnly = this.state.tabSelected === TabType.COMMENTS && this.state.displayFeedbackTeacherFacing;

    return (
      <div style={mainStyle} className="editor-column">
        <PaneHeader hasFocus={false} teacherOnly={teacherOnly}>
          <div style={styles.paneHeaderOverride}>
            {this.state.tabSelected === TabType.INSTRUCTIONS && ttsUrl &&
              <InlineAudio src={ttsUrl} style={audioStyle}/>
            }
            {(this.props.documentationUrl && (this.state.tabSelected !== TabType.COMMENTS)) &&
              <PaneButton
                iconClass="fa fa-book"
                label={msg.documentation()}
                isRtl={false}
                headerHasFocus={false}
                onClick={this.handleDocumentationClick}
              />}
            <div style={styles.helpTabs}>
              <InstructionsTab
                className="uitest-instructionsTab"
                onClick={this.handleInstructionTabClick}
                selected={this.state.tabSelected === TabType.INSTRUCTIONS}
                text={msg.instructions()}
                teacherOnly={teacherOnly}
              />
              {displayHelpTab &&
                <InstructionsTab
                  className="uitest-helpTab"
                  onClick={this.handleHelpTabClick}
                  selected={this.state.tabSelected === TabType.RESOURCES}
                  text={msg.helpTips()}
                  teacherOnly={teacherOnly}
                />
              }
              {displayFeedback &&
                <InstructionsTab
                  className="uitest-feedback"
                  onClick={this.handleCommentTabClick}
                  selected={this.state.tabSelected === TabType.COMMENTS}
                  text={msg.feedback()}
                  teacherOnly={teacherOnly}
                />
              }
            </div>
            {!this.props.isEmbedView &&
              <CollapserIcon
                collapsed={this.props.collapsed}
                onClick={this.handleClickCollapser}
                teacherOnly={teacherOnly}
              />}
          </div>
        </PaneHeader>
        <div style={[this.props.collapsed && commonStyles.hidden]}>
          <div style={styles.body}>
            <div ref="instructions">
              {this.props.hasContainedLevels &&
                <ContainedLevel
                  ref="instructions"
                  hidden={this.state.tabSelected !== TabType.INSTRUCTIONS}
                />
              }
              {!this.props.hasContainedLevels && this.state.tabSelected === TabType.INSTRUCTIONS &&
                <div>
                  <Instructions
                    ref="instructions"
                    longInstructions={this.props.longInstructions}
                    onResize={this.adjustMaxNeededHeight}
                    inTopPane
                  />
                  <TeacherOnlyMarkdown/>
                </div>
              }
            </div>
            {this.state.tabSelected === TabType.RESOURCES &&
              <HelpTabContents
                ref="helpTab"
                videoData={videoData}
                mapReference={this.props.mapReference}
                referenceLinks={this.props.referenceLinks}
              />
            }
            {this.state.tabSelected === TabType.COMMENTS &&
              <div>
                {this.props.viewAs === ViewType.Teacher &&
                  <TeacherFeedback
                    ref="commentTab"
                  />
                }
                {this.props.viewAs === ViewType.Student &&
                  <FeedbacksList
                    feedbacks={this.state.feedbacks}
                    ref="commentTab"
                  />
                }
              </div>
            }
          </div>
          {!this.props.isEmbedView &&
            <HeightResizer
              position={this.props.height}
              onResize={this.handleHeightResize}
            />
          }
        </div>
      </div>
    );
  }
}
export default connect(state => ({
  isEmbedView: state.pageConstants.isEmbedView,
  hasContainedLevels: state.pageConstants.hasContainedLevels,
  puzzleNumber: state.pageConstants.puzzleNumber,
  stageTotal: state.pageConstants.stageTotal,
  height: state.instructions.renderedHeight,
  expandedHeight: state.instructions.expandedHeight,
  maxHeight: Math.min(state.instructions.maxAvailableHeight,
    state.instructions.maxNeededHeight),
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
}), dispatch => ({
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
}), null, { withRef: true }
)(Radium(TopInstructions));
