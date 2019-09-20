import $ from 'jquery';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import _ from 'lodash';
import TeacherOnlyMarkdown from './TeacherOnlyMarkdown';
import TeacherFeedback from './TeacherFeedback';
import InlineAudio from './InlineAudio';
import ContainedLevel from '../ContainedLevel';
import ContainedLevelAnswer from '../ContainedLevelAnswer';
import PaneHeader, {PaneButton} from '../../templates/PaneHeader';
import InstructionsTab from './InstructionsTab';
import HelpTabContents from './HelpTabContents';
import {
  toggleInstructionsCollapsed,
  setInstructionsMaxHeightNeeded,
  setInstructionsRenderedHeight
} from '../../redux/instructions';
import color from '../../util/color';
import styleConstants from '../../styleConstants';
import commonStyles from '../../commonStyles';
import Instructions from './Instructions';
import CollapserIcon from './CollapserIcon';
import HeightResizer from './HeightResizer';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import queryString from 'query-string';
import InstructionsCSF from './InstructionsCSF';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {WIDGET_WIDTH} from '@cdo/apps/applab/constants';

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const MIN_HEIGHT = RESIZER_HEIGHT + 60;

const TabType = {
  INSTRUCTIONS: 'instructions',
  RESOURCES: 'resources',
  COMMENTS: 'comments',
  TEACHER_ONLY: 'teacher-only'
};

// Minecraft-specific styles
const craftStyles = {
  instructionsBody: {
    // $below-header-background from craft/style.scss
    backgroundColor: '#646464'
  },
  headerBar: {
    color: color.white,
    backgroundColor: '#3b3b3b'
  }
};

const styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0
    // left handled by media queries for .editor-column
  },
  mainRtl: {
    position: 'absolute',
    marginRight: 15,
    top: 0,
    left: 0
    // right handled by media queries for .editor-column
  },
  noViz: {
    left: 0,
    right: 0,
    marginRight: 0,
    marginLeft: 0
  },
  body: {
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingRight: 10,
    position: 'absolute',
    top: HEADER_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    overflowY: 'scroll'
  },
  csfBody: {
    backgroundColor: '#ddd',
    position: 'absolute',
    top: HEADER_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden'
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
  },
  helpTabsRtl: {
    float: 'right',
    paddingTop: 6,
    paddingRight: 30
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

const audioStyleRTL = {
  wrapper: {
    float: 'left'
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

class TopInstructions extends Component {
  static propTypes = {
    isEmbedView: PropTypes.bool.isRequired,
    hasContainedLevels: PropTypes.bool,
    height: PropTypes.number.isRequired,
    expandedHeight: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
    longInstructions: PropTypes.string,
    collapsed: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
    toggleInstructionsCollapsed: PropTypes.func.isRequired,
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
    user: PropTypes.number,
    noInstructionsWhenCollapsed: PropTypes.bool.isRequired,
    teacherMarkdown: PropTypes.string,
    hidden: PropTypes.bool.isRequired,
    shortInstructions: PropTypes.string,
    isMinecraft: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    widgetMode: PropTypes.bool
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
      // We don't want to start in the comments tab for CSF since its hidden
      tabSelected:
        teacherViewingStudentWork && this.props.noInstructionsWhenCollapsed
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

    if (this.props.viewAs === ViewType.Student && user && serverLevelId) {
      promises.push(
        $.ajax({
          url: `/api/v1/teacher_feedbacks/get_feedbacks?student_id=${user}&level_id=${serverLevelId}`,
          method: 'GET',
          contentType: 'application/json;charset=UTF-8'
        }).done((data, _, request) => {
          // If student has feedback make their default tab the feedback tab instead of instructions
          if (data[0] && (data[0].comment || data[0].performance)) {
            this.setState({
              feedbacks: data,
              tabSelected: TabType.COMMENTS,
              token: request.getResponseHeader('csrf-token')
            });
            this.incrementFeedbackVisitCount();
          }
        })
      );
    }
    if (serverLevelId) {
      promises.push(
        $.ajax({
          url: `/levels/${serverLevelId}/get_rubric`,
          method: 'GET',
          contentType: 'application/json;charset=UTF-8'
        }).done(data => {
          this.setState({rubric: data});
        })
      );
    }

    if (
      this.state.teacherViewingStudentWork &&
      user &&
      serverLevelId &&
      studentId
    ) {
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

    Promise.all(promises)
      .then(() => {
        this.setState({fetchingData: false}, this.forceTabResizeToMaxHeight);
      })
      .catch(error => {
        console.log(
          'Promise Rejection while getting instructions: ' + error.responseText
        );
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
      nextProps.height < nextProps.maxHeight &&
      !(
        nextProps.hidden ||
        (!nextProps.shortInstructions &&
          !nextProps.longInstructions &&
          !nextProps.hasContainedLevels)
      )
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
    // if not showing the instructions area the max needed height should be 0
    if (
      this.props.hidden ||
      (!this.props.shortInstructions &&
        !this.props.longInstructions &&
        !this.props.hasContainedLevels)
    ) {
      return 0;
    }

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
      case TabType.TEACHER_ONLY:
        element = this.refs.teacherOnlyTab;
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
    if (this.props.collapsed) {
      firehoseClient.putRecord({
        study: 'top-instructions',
        event: 'expand-instructions',
        data_json: JSON.stringify({
          csfStyleInstructions: !this.props.noInstructionsWhenCollapsed
        })
      });
    } else {
      firehoseClient.putRecord({
        study: 'top-instructions',
        event: 'collapse-instructions',
        data_json: JSON.stringify({
          csfStyleInstructions: !this.props.noInstructionsWhenCollapsed
        })
      });
    }

    const collapsed = !this.props.collapsed;
    this.props.toggleInstructionsCollapsed();

    // adjust rendered height based on next collapsed state
    if (collapsed && this.props.noInstructionsWhenCollapsed) {
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
    this.scrollToTopOfTab();
    this.setState({tabSelected: TabType.RESOURCES}, this.scrollToTopOfTab);
    firehoseClient.putRecord({
      study: 'top-instructions',
      event: 'click-help-and-tips-tab'
    });
  };

  handleInstructionTabClick = () => {
    this.scrollToTopOfTab();
    this.setState({tabSelected: TabType.INSTRUCTIONS}, this.scrollToTopOfTab);
  };

  handleCommentTabClick = () => {
    this.scrollToTopOfTab();
    // Only increment visit count if user is switching from another tab to the
    // comments tab.
    if (this.state.tabSelected !== TabType.COMMENTS) {
      this.incrementFeedbackVisitCount();
    }

    this.setState({tabSelected: TabType.COMMENTS}, () => {
      this.forceTabResizeToMaxHeight();
      this.scrollToTopOfTab();
    });
  };

  handleTeacherOnlyTabClick = () => {
    this.setState({tabSelected: TabType.TEACHER_ONLY}, this.scrollToTopOfTab);
    firehoseClient.putRecord({
      study: 'top-instructions',
      event: 'click-teacher-only-tab'
    });
  };

  scrollToTopOfTab = () => {
    var myDiv = document.getElementById('scroll-container');
    myDiv.scrollTop = 0;
  };

  /**
   * If a student is viewing their own work (i.e., the user is not a teacher
   * viewing one of their students' work), increment visit count for student
   * viewing their latest feedback. Only allow this metric to be written to every
   * 5000ms to avoid recording metrics from a user clicking back-and-forth between
   * tabs too often.
   */
  incrementFeedbackVisitCount = _.debounce(
    () => {
      const latestFeedback = this.state.feedbacks[0];
      if (!this.state.teacherViewingStudentWork && latestFeedback) {
        $.ajax({
          url: `/api/v1/teacher_feedbacks/${
            latestFeedback.id
          }/increment_visit_count`,
          method: 'POST',
          contentType: 'application/json;charset=UTF-8',
          headers: {'X-CSRF-Token': this.state.token}
        });
      }
    },
    5000,
    {leading: true}
  );

  render() {
    const {
      hidden,
      shortInstructions,
      longInstructions,
      hasContainedLevels
    } = this.props;

    const isCSF = !this.props.noInstructionsWhenCollapsed;
    const isCSDorCSP = this.props.noInstructionsWhenCollapsed;
    const widgetWidth = WIDGET_WIDTH + 'px';

    const mainStyle = [
      this.props.isRtl ? styles.mainRtl : styles.main,
      {
        height: this.props.height - RESIZER_HEIGHT
      },
      this.props.noVisualization && styles.noViz,
      this.props.isEmbedView && styles.embedView,
      this.props.widgetMode &&
        (this.props.isRtl ? {right: widgetWidth} : {left: widgetWidth})
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
    const feedbackTabText = displayKeyConcept
      ? i18n.keyConcept()
      : i18n.feedback();

    const displayFeedback =
      displayKeyConcept ||
      this.state.teacherViewingStudentWork ||
      studentHasFeedback;

    // Teacher is viewing students work and in the Feedback Tab
    const teacherOnly =
      this.state.tabSelected === TabType.COMMENTS &&
      this.state.teacherViewingStudentWork;

    if (
      hidden ||
      (!shortInstructions && !longInstructions && !hasContainedLevels)
    ) {
      return <div />;
    }

    return (
      <div style={mainStyle} className="editor-column">
        <PaneHeader
          hasFocus={false}
          teacherOnly={teacherOnly}
          isMinecraft={this.props.isMinecraft}
        >
          <div style={styles.paneHeaderOverride}>
            {/* For CSF contained levels we use the same audio button location as CSD/CSP*/}
            {this.state.tabSelected === TabType.INSTRUCTIONS &&
              ttsUrl &&
              (this.props.hasContainedLevels || isCSDorCSP) && (
                <InlineAudio
                  src={ttsUrl}
                  style={this.props.isRtl ? audioStyleRTL : audioStyle}
                />
              )}
            {this.props.documentationUrl &&
              this.state.tabSelected !== TabType.COMMENTS && (
                <PaneButton
                  iconClass="fa fa-book"
                  label={i18n.documentation()}
                  isRtl={this.props.isRtl}
                  headerHasFocus={false}
                  onClick={this.handleDocumentationClick}
                  isMinecraft={this.props.isMinecraft}
                />
              )}
            <div
              style={this.props.isRtl ? styles.helpTabsRtl : styles.helpTabs}
            >
              <InstructionsTab
                className="uitest-instructionsTab"
                onClick={this.handleInstructionTabClick}
                selected={this.state.tabSelected === TabType.INSTRUCTIONS}
                text={i18n.instructions()}
                teacherOnly={teacherOnly}
                isMinecraft={this.props.isMinecraft}
                isRtl={this.props.isRtl}
              />
              {isCSDorCSP && displayHelpTab && (
                <InstructionsTab
                  className="uitest-helpTab"
                  onClick={this.handleHelpTabClick}
                  selected={this.state.tabSelected === TabType.RESOURCES}
                  text={i18n.helpTips()}
                  teacherOnly={teacherOnly}
                  isMinecraft={this.props.isMinecraft}
                  isRtl={this.props.isRtl}
                />
              )}
              {isCSDorCSP &&
                displayFeedback &&
                (!this.state.fetchingData || teacherOnly) && (
                  <InstructionsTab
                    className="uitest-feedback"
                    onClick={this.handleCommentTabClick}
                    selected={this.state.tabSelected === TabType.COMMENTS}
                    text={feedbackTabText}
                    teacherOnly={teacherOnly}
                    isMinecraft={this.props.isMinecraft}
                    isRtl={this.props.isRtl}
                  />
                )}
              {isCSF &&
                this.props.viewAs === ViewType.Teacher &&
                (this.props.teacherMarkdown ||
                  this.props.hasContainedLevels) && (
                  <InstructionsTab
                    className="uitest-teacherOnlyTab"
                    onClick={this.handleTeacherOnlyTabClick}
                    selected={this.state.tabSelected === TabType.TEACHER_ONLY}
                    text={i18n.teacherOnly()}
                    teacherOnly={teacherOnly}
                    isMinecraft={this.props.isMinecraft}
                    isRtl={this.props.isRtl}
                  />
                )}
            </div>
            {/* For CSF contained levels we use the same collapse function as CSD/CSP*/}
            {!this.props.isEmbedView &&
              (isCSDorCSP || this.props.hasContainedLevels) && (
                <CollapserIcon
                  collapsed={this.props.collapsed}
                  onClick={this.handleClickCollapser}
                  teacherOnly={teacherOnly}
                  isRtl={this.props.isRtl}
                />
              )}
          </div>
        </PaneHeader>
        <div
          style={[this.props.collapsed && isCSDorCSP && commonStyles.hidden]}
        >
          <div
            style={[
              isCSF &&
              !this.props.hasContainedLevels &&
              this.state.tabSelected === TabType.INSTRUCTIONS
                ? styles.csfBody
                : styles.body,
              this.props.isMinecraft && craftStyles.instructionsBody
            ]}
            id="scroll-container"
          >
            <div ref="instructions">
              {this.props.hasContainedLevels && (
                <div>
                  <ContainedLevel
                    ref="instructions"
                    hidden={this.state.tabSelected !== TabType.INSTRUCTIONS}
                  />
                  {!isCSF && (
                    <ContainedLevelAnswer
                      ref="teacherOnlyTab"
                      hidden={this.state.tabSelected !== TabType.INSTRUCTIONS}
                    />
                  )}
                </div>
              )}
              {!this.props.hasContainedLevels &&
                isCSF &&
                this.state.tabSelected === TabType.INSTRUCTIONS && (
                  <InstructionsCSF
                    ref="instructions"
                    handleClickCollapser={this.handleClickCollapser}
                    adjustMaxNeededHeight={this.adjustMaxNeededHeight}
                    isEmbedView={this.props.isEmbedView}
                    teacherViewingStudentWork={
                      this.state.teacherViewingStudentWork
                    }
                  />
                )}
              {!this.props.hasContainedLevels &&
                isCSDorCSP &&
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
            {isCSF &&
              this.props.viewAs === ViewType.Teacher &&
              (this.props.hasContainedLevels ||
                (this.props.teacherMarkdown &&
                  this.state.tabSelected === TabType.TEACHER_ONLY)) && (
                <div>
                  <TeacherOnlyMarkdown ref="teacherOnlyTab" />
                  {this.props.hasContainedLevels && (
                    <ContainedLevelAnswer
                      ref="teacherOnlyTab"
                      hidden={this.state.tabSelected !== TabType.TEACHER_ONLY}
                    />
                  )}
                </div>
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
export const UnconnectedTopInstructions = TopInstructions;
export default connect(
  state => ({
    isEmbedView: state.pageConstants.isEmbedView,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    isMinecraft: !!state.pageConstants.isMinecraft,
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
    user: state.pageConstants.userId,
    noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed,
    teacherMarkdown: state.instructions.teacherMarkdown,
    hidden: state.pageConstants.isShareView,
    shortInstructions: state.instructions.shortInstructions,
    isRtl: state.isRtl,
    widgetMode: state.pageConstants.widgetMode
  }),
  dispatch => ({
    toggleInstructionsCollapsed() {
      dispatch(toggleInstructionsCollapsed());
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
)(Radium(TopInstructions));
