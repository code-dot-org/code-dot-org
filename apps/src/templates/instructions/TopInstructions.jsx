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
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';
import HeightResizer from './HeightResizer';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import queryString from 'query-string';
import InstructionsCSF from './InstructionsCSF';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {WIDGET_WIDTH} from '@cdo/apps/applab/constants';
import {hasInstructions} from './utils';
import {
  getTeacherFeedbackForStudent,
  getTeacherFeedbackForTeacher,
  getRubric,
  incrementVisitCount
} from './topInstructionsHelpers';

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
  },
  collapserIcon: {
    showHideButton: {
      position: 'absolute',
      top: 0,
      margin: 0,
      lineHeight: styleConstants['workspace-headers-height'] + 'px',
      fontSize: 18,
      ':hover': {
        cursor: 'pointer',
        color: color.white
      }
    },
    showHideButtonLtr: {
      left: 8
    },
    showHideButtonRtl: {
      right: 8
    },
    teacherOnlyColor: {
      color: color.lightest_cyan,
      ':hover': {
        cursor: 'pointer',
        color: color.default_text
      }
    }
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
    expandedHeight: PropTypes.number,
    maxHeight: PropTypes.number.isRequired,
    longInstructions: PropTypes.string,
    isCollapsed: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
    toggleInstructionsCollapsed: PropTypes.func,
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
    isBlockly: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    widgetMode: PropTypes.bool,
    mainStyle: PropTypes.object,
    containerStyle: PropTypes.object,
    resizable: PropTypes.bool
  };

  static defaultProps = {
    resizable: true
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    const studentId = queryString.parse(window.location.search).user_id;

    const teacherViewingStudentWork =
      this.isViewingAsTeacher() &&
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

    if (this.isViewingAsStudent() && user && serverLevelId) {
      promises.push(
        getTeacherFeedbackForStudent(user, serverLevelId).done(
          (data, _, request) => {
            // If student has feedback make their default tab the feedback tab instead of instructions
            if (data[0] && (data[0].comment || data[0].performance)) {
              this.setState({
                feedbacks: data,
                tabSelected: TabType.COMMENTS,
                token: request.getResponseHeader('csrf-token')
              });
              this.incrementFeedbackVisitCount();
            }
          }
        )
      );
    }
    if (serverLevelId) {
      promises.push(
        getRubric(serverLevelId).done(data => {
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
        getTeacherFeedbackForTeacher(studentId, serverLevelId, user).done(
          (data, textStatus, request) => {
            this.setState({
              feedbacks: request.status === 204 ? [] : [data],
              token: request.getResponseHeader('csrf-token')
            });
          }
        )
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
      !nextProps.isCollapsed &&
      nextProps.height < MIN_HEIGHT &&
      nextProps.height < nextProps.maxHeight &&
      !(
        nextProps.hidden ||
        !hasInstructions(
          nextProps.shortInstructions,
          nextProps.longInstructions,
          nextProps.hasContainedLevels
        )
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
   * Returns the top Y coordinate of the instructions that are being resized
   * via a call to handleHeightResize from HeightResizer.
   */
  getItemTop = () => {
    return this.topInstructions.getBoundingClientRect().top;
  };

  /**
   * Given a desired height, determines how much we can actually change the
   * height (account for min/max) and changes the height to that.
   * @param {number} desired height
   */
  handleHeightResize = desiredHeight => {
    let newHeight = Math.max(MIN_HEIGHT, desiredHeight);
    newHeight = Math.min(newHeight, this.props.maxHeight);

    this.props.setInstructionsRenderedHeight(newHeight);
  };

  /**
   * Calculate how much height it would take to show top instructions with our
   * entire instructions visible and update store with this value.
   * @returns {number}
   */

  adjustMaxNeededHeight = () => {
    const {
      hidden,
      shortInstructions,
      longInstructions,
      hasContainedLevels,
      maxHeight,
      setInstructionsMaxHeightNeeded
    } = this.props;

    // if not showing the instructions area the max needed height should be 0
    if (
      hidden ||
      !hasInstructions(shortInstructions, longInstructions, hasContainedLevels)
    ) {
      return 0;
    }

    let element;
    switch (this.state.tabSelected) {
      case TabType.RESOURCES:
        element = this.helpTab;
        break;
      case TabType.INSTRUCTIONS:
        element = this.instructions;
        break;
      case TabType.COMMENTS:
        element = this.commentTab;
        break;
      case TabType.TEACHER_ONLY:
        element = this.teacherOnlyTab;
        break;
    }
    const maxNeededHeight =
      $(ReactDOM.findDOMNode(element)).outerHeight(true) +
      HEADER_HEIGHT +
      RESIZER_HEIGHT;

    if (maxHeight !== maxNeededHeight) {
      setInstructionsMaxHeightNeeded(maxNeededHeight);
    }
    return maxNeededHeight;
  };

  /**
   * Handle a click of our collapser button by changing our collapse state, and
   * updating our rendered height.
   */
  handleClickCollapser = () => {
    const {
      toggleInstructionsCollapsed,
      isCollapsed,
      noInstructionsWhenCollapsed,
      expandedHeight
    } = this.props;

    toggleInstructionsCollapsed();

    // record event
    const eventName = isCollapsed
      ? 'expand-instructions'
      : 'collapse-instructions';

    this.recordTopInstructionsEvent(eventName, {
      data_json: JSON.stringify({
        csfStyleInstructions: !noInstructionsWhenCollapsed
      })
    });

    // adjust rendered height based on next collapsed state
    const height =
      !isCollapsed && noInstructionsWhenCollapsed
        ? HEADER_HEIGHT
        : expandedHeight;
    this.props.setInstructionsRenderedHeight(height);
  };

  /**
   * Handle a click on the Documentation PaneButton.
   */
  handleDocumentationClick = () => {
    const win = window.open(this.props.documentationUrl, '_blank');
    win.focus();
  };

  recordTopInstructionsEvent(eventName, additionalData = {}) {
    const record = {
      study: 'top-instructions',
      event: eventName,
      ...additionalData
    };
    firehoseClient.putRecord(record);
  }

  handleHelpTabClick = () => {
    this.scrollToTopOfTab();
    this.setState({tabSelected: TabType.RESOURCES}, () => {
      this.scrollToTopOfTab();
      this.adjustMaxNeededHeight();
    });
    this.recordTopInstructionsEvent('click-help-and-tips-tab');
  };

  handleInstructionTabClick = () => {
    this.scrollToTopOfTab();
    this.setState({tabSelected: TabType.INSTRUCTIONS}, () => {
      this.scrollToTopOfTab();
      this.adjustMaxNeededHeight();
    });
  };

  handleCommentTabClick = () => {
    this.scrollToTopOfTab();
    // Only increment visit count if user is switching from another tab to the
    // comments tab.
    if (this.state.tabSelected !== TabType.COMMENTS) {
      this.incrementFeedbackVisitCount();
    }
    this.recordTopInstructionsEvent('click-feedback-tab');

    this.setState({tabSelected: TabType.COMMENTS}, () => {
      this.forceTabResizeToMaxHeight();
      this.scrollToTopOfTab();
    });
  };

  handleTeacherOnlyTabClick = () => {
    this.setState({tabSelected: TabType.TEACHER_ONLY}, () => {
      this.scrollToTopOfTab();
      this.adjustMaxNeededHeight();
    });
    this.recordTopInstructionsEvent('click-teacher-only-tab');
  };

  scrollToTopOfTab = () => {
    document.getElementById('scroll-container').scrollTop = 0;
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
        incrementVisitCount(latestFeedback.id, this.state.token);
      }
    },
    5000,
    {leading: true}
  );

  isViewingAsStudent() {
    return this.props.viewAs === ViewType.Student;
  }

  isViewingAsTeacher() {
    return this.props.viewAs === ViewType.Teacher;
  }

  setInstructionsRef(ref) {
    if (ref) {
      this.instructions = ref;
    }
  }

  render() {
    const {
      hidden,
      shortInstructions,
      longInstructions,
      hasContainedLevels,
      noInstructionsWhenCollapsed,
      ttsLongInstructionsUrl,
      noVisualization,
      isRtl,
      height,
      isEmbedView,
      widgetMode,
      levelVideos,
      mapReference,
      referenceLinks,
      documentationUrl,
      isMinecraft,
      teacherMarkdown,
      isCollapsed,
      user,
      mainStyle,
      containerStyle,
      isBlockly,
      resizable
    } = this.props;

    const {
      feedbacks,
      teacherViewingStudentWork,
      rubric,
      tabSelected,
      fetchingData,
      token
    } = this.state;

    // TODO: find a more straight forward way to determine CSF/D/P
    // instead of inferring it from noInstructionsWhenCollapsed
    const isCSF = !noInstructionsWhenCollapsed;
    const isCSDorCSP = !isCSF;
    const widgetWidth = WIDGET_WIDTH + 'px';

    const mainStyle = [
      !mainStyle && (isRtl ? styles.mainRtl : styles.main),
      mainStyle,
      {
        height: height - RESIZER_HEIGHT
      },
      noVisualization && styles.noViz,
      isEmbedView && styles.embedView,
      widgetMode && (isRtl ? {right: widgetWidth} : {left: widgetWidth})
    ];

    // Only display the help tab when there are one or more videos or
    // additional resource links.
    const levelResourcesAvailable =
      mapReference || (referenceLinks && referenceLinks.length > 0);

    const displayHelpTab =
      (levelVideos && levelVideos.length > 0) || levelResourcesAvailable;

    const studentHasFeedback =
      this.isViewingAsStudent() &&
      feedbacks.length > 0 &&
      (feedbacks[0].comment || feedbacks[0].performance);

    /*
     * The feedback tab will be the Key Concept tab if there is a mini rubric and:
     * 1) Teacher is viewing the level but not giving feedback to the student
     * 2) Student does not have any feedback for that level
     * The Key Concept tab shows the Key Concept and Rubric for the level in a view
     * only form
     */
    const displayKeyConcept =
      rubric &&
      ((this.isViewingAsStudent() && !studentHasFeedback) ||
        (this.isViewingAsTeacher() && !teacherViewingStudentWork));

    const displayFeedback =
      displayKeyConcept || teacherViewingStudentWork || studentHasFeedback;

    // Teacher is viewing students work and in the Feedback Tab
    const teacherOnly =
      tabSelected === TabType.TEACHER_ONLY ||
      (tabSelected === TabType.COMMENTS && teacherViewingStudentWork);

    if (
      hidden ||
      !hasInstructions(shortInstructions, longInstructions, hasContainedLevels)
    ) {
      return <div />;
    }

    const showContainedLevelAnswer =
      hasContainedLevels && $('#containedLevelAnswer0').length > 0;

    const collapserIconStyles = {
      ...styles.collapserIcon.showHideButton,
      ...(this.props.isRtl
        ? styles.collapserIcon.showHideButtonRtl
        : styles.collapserIcon.showHideButtonLtr),
      ...(teacherOnly && styles.collapserIcon.teacherOnlyColor)
    };

    return (
      <div
        style={mainStyle}
        className="editor-column"
        ref={ref => (this.topInstructions = ref)}
      >
        <PaneHeader
          hasFocus={false}
          teacherOnly={teacherOnly}
          isMinecraft={isMinecraft}
        >
          <div style={styles.paneHeaderOverride}>
            {/* For CSF contained levels we use the same audio button location as CSD/CSP*/}
            {tabSelected === TabType.INSTRUCTIONS &&
              ttsLongInstructionsUrl &&
              (hasContainedLevels || isCSDorCSP) && (
                <InlineAudio
                  src={ttsLongInstructionsUrl}
                  style={isRtl ? audioStyleRTL : audioStyle}
                  autoplayTriggerElementId="codeApp"
                />
              )}
            {documentationUrl && tabSelected !== TabType.COMMENTS && (
              <PaneButton
                iconClass="fa fa-book"
                label={i18n.documentation()}
                isRtl={isRtl}
                headerHasFocus={false}
                onClick={this.handleDocumentationClick}
                isMinecraft={isMinecraft}
              />
            )}
            <div style={isRtl ? styles.helpTabsRtl : styles.helpTabs}>
              <InstructionsTab
                className="uitest-instructionsTab"
                onClick={this.handleInstructionTabClick}
                selected={tabSelected === TabType.INSTRUCTIONS}
                text={i18n.instructions()}
                teacherOnly={teacherOnly}
                isMinecraft={isMinecraft}
                isRtl={isRtl}
              />
              {isCSDorCSP && displayHelpTab && (
                <InstructionsTab
                  className="uitest-helpTab"
                  onClick={this.handleHelpTabClick}
                  selected={tabSelected === TabType.RESOURCES}
                  text={i18n.helpTips()}
                  teacherOnly={teacherOnly}
                  isMinecraft={isMinecraft}
                  isRtl={isRtl}
                />
              )}
              {isCSDorCSP &&
                displayFeedback &&
                (!fetchingData || teacherOnly) && (
                  <InstructionsTab
                    className="uitest-feedback"
                    onClick={this.handleCommentTabClick}
                    selected={tabSelected === TabType.COMMENTS}
                    text={
                      displayKeyConcept ? i18n.keyConcept() : i18n.feedback()
                    }
                    teacherOnly={teacherOnly}
                    isMinecraft={isMinecraft}
                    isRtl={isRtl}
                  />
                )}
              {this.isViewingAsTeacher() &&
                (teacherMarkdown || showContainedLevelAnswer) && (
                  <InstructionsTab
                    className="uitest-teacherOnlyTab"
                    onClick={this.handleTeacherOnlyTabClick}
                    selected={tabSelected === TabType.TEACHER_ONLY}
                    text={i18n.teacherOnly()}
                    teacherOnly={teacherOnly}
                    isMinecraft={isMinecraft}
                    isRtl={isRtl}
                  />
                )}
            </div>
            {/* For CSF contained levels we use the same collapse function as CSD/CSP*/}
            {!isEmbedView && (isCSDorCSP || hasContainedLevels) && (
              <CollapserIcon
                isCollapsed={isCollapsed}
                onClick={this.handleClickCollapser}
                teacherOnly={teacherOnly}
                isRtl={isRtl}
              />
            )}
          </div>
        </PaneHeader>
        <div style={[isCollapsed && isCSDorCSP && commonStyles.hidden]}>
          <div
            style={[
              isCSF &&
              !hasContainedLevels &&
              tabSelected === TabType.INSTRUCTIONS
                ? styles.csfBody
                : containerStyle || styles.body,
              isMinecraft && craftStyles.instructionsBody
            ]}
            id="scroll-container"
          >
            <div ref={ref => this.setInstructionsRef(ref)}>
              {hasContainedLevels && (
                <div>
                  <ContainedLevel
                    ref={ref => this.setInstructionsRef(ref)}
                    hidden={tabSelected !== TabType.INSTRUCTIONS}
                  />
                </div>
              )}
              {!hasContainedLevels &&
                isCSF &&
                tabSelected === TabType.INSTRUCTIONS && (
                  <InstructionsCSF
                    ref={ref => this.setInstructionsRef(ref)}
                    handleClickCollapser={this.handleClickCollapser}
                    adjustMaxNeededHeight={this.adjustMaxNeededHeight}
                    isEmbedView={isEmbedView}
                    teacherViewingStudentWork={teacherViewingStudentWork}
                  />
                )}
              {!hasContainedLevels &&
                isCSDorCSP &&
                tabSelected === TabType.INSTRUCTIONS && (
                  <div>
                    <Instructions
                      ref={ref => this.setInstructionsRef(ref)}
                      longInstructions={longInstructions}
                      onResize={this.adjustMaxNeededHeight}
                      inTopPane
                      isBlockly={isBlockly}
                      noInstructionsWhenCollapsed={noInstructionsWhenCollapsed}
                    />
                  </div>
                )}
            </div>
            {tabSelected === TabType.RESOURCES && (
              <HelpTabContents
                ref={ref => (this.helpTab = ref)}
                videoData={levelVideos ? levelVideos[0] : []}
                mapReference={mapReference}
                referenceLinks={referenceLinks}
              />
            )}
            {displayFeedback && !fetchingData && (
              <TeacherFeedback
                user={user}
                visible={tabSelected === TabType.COMMENTS}
                displayKeyConcept={displayKeyConcept}
                disabledMode={
                  this.isViewingAsStudent() || !teacherViewingStudentWork
                }
                rubric={rubric}
                ref={ref => (this.commentTab = ref)}
                latestFeedback={feedbacks}
                token={token}
              />
            )}
            {this.isViewingAsTeacher() &&
              (hasContainedLevels || teacherMarkdown) && (
                <div>
                  {hasContainedLevels && (
                    <ContainedLevelAnswer
                      ref={ref => (this.teacherOnlyTab = ref)}
                      hidden={tabSelected !== TabType.TEACHER_ONLY}
                    />
                  )}
                  {tabSelected === TabType.TEACHER_ONLY && (
                    <TeacherOnlyMarkdown
                      ref={ref => (this.teacherOnlyTab = ref)}
                      content={teacherMarkdown}
                    />
                  )}
                </div>
              )}
          </div>
          {!isEmbedView && resizable && (
            <HeightResizer
              resizeItemTop={this.getItemTop}
              position={height}
              onResize={this.handleHeightResize}
            />
          )}
        </div>
      </div>
    );
  }
}
export const UnconnectedTopInstructions = Radium(TopInstructions);
export default connect(
  state => ({
    isEmbedView: state.pageConstants.isEmbedView,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    isMinecraft: !!state.pageConstants.isMinecraft,
    isBlockly: !!state.pageConstants.isBlockly,
    height: state.instructions.renderedHeight,
    expandedHeight: state.instructions.expandedHeight,
    maxHeight: Math.min(
      state.instructions.maxAvailableHeight,
      state.instructions.maxNeededHeight
    ),
    longInstructions: state.instructions.longInstructions,
    noVisualization: state.pageConstants.noVisualization,
    isCollapsed: state.instructions.isCollapsed,
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
