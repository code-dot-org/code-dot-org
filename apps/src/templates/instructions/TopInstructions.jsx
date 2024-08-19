import classNames from 'classnames';
import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import TeacherFeedbackTab from '@cdo/apps/templates/instructions/teacherFeedback/TeacherFeedbackTab';
import {rubricShape} from '@cdo/apps/templates/rubrics/rubricShapes';
import StudentRubricView from '@cdo/apps/templates/rubrics/StudentRubricView';
import i18n from '@cdo/locale';

import commonStyles from '../../commonStyles';
import {
  toggleInstructionsCollapsed,
  setInstructionsMaxHeightNeeded,
  setInstructionsRenderedHeight,
  setAllowInstructionsResize,
  getDynamicInstructions,
} from '../../redux/instructions';
import styleConstants from '../../styleConstants';
import color from '../../util/color';
import ContainedLevel from '../ContainedLevel';
import ContainedLevelAnswer from '../ContainedLevelAnswer';
import {Z_INDEX as OVERLAY_Z_INDEX} from '../Overlay';

import {AudioQueue} from './AudioQueue';
import CommitsAndReviewTab from './CommitsAndReviewTab';
import ContainedLevelResetButton from './ContainedLevelResetButton';
import DocumentationTab from './DocumentationTab';
import DynamicInstructions from './DynamicInstructions';
import HeightResizer from './HeightResizer';
import HelpTabContents from './HelpTabContents';
import Instructions from './Instructions';
import InstructionsCSF from './InstructionsCSF';
import TeacherOnlyMarkdown from './TeacherOnlyMarkdown';
import * as topInstructionsDataApi from './topInstructionsDataApi';
import TopInstructionsHeader from './TopInstructionsHeader';
import {hasInstructions} from './utils';

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const MIN_HEIGHT = RESIZER_HEIGHT + 60;

export const TabType = {
  INSTRUCTIONS: 'instructions',
  RESOURCES: 'resources',
  COMMENTS: 'comments',
  DOCUMENTATION: 'documentation',
  REVIEW: 'review',
  TEACHER_ONLY: 'teacher-only',
  TA_RUBRIC: 'rubric',
};

// Minecraft-specific styles
const craftStyles = {
  instructionsBody: {
    // $below-header-background from craft/style.scss
    backgroundColor: '#646464',
  },
  headerBar: {
    color: color.white,
    backgroundColor: '#3b3b3b',
  },
};

class TopInstructions extends Component {
  static propTypes = {
    isEmbedView: PropTypes.bool.isRequired,
    hasContainedLevels: PropTypes.bool,
    exampleSolutions: PropTypes.array,
    isViewingAsInstructorInTraining: PropTypes.bool,
    height: PropTypes.number.isRequired,
    expandedHeight: PropTypes.number,
    maxNeededHeight: PropTypes.number,
    maxHeight: PropTypes.number.isRequired,
    longInstructions: PropTypes.string,
    dynamicInstructions: PropTypes.object,
    dynamicInstructionsKey: PropTypes.string,
    overlayVisible: PropTypes.bool,
    ttsLongInstructionsUrl: PropTypes.string,
    isCollapsed: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
    toggleInstructionsCollapsed: PropTypes.func,
    setInstructionsRenderedHeight: PropTypes.func.isRequired,
    setInstructionsMaxHeightNeeded: PropTypes.func.isRequired,
    documentationUrl: PropTypes.string,
    levelVideos: PropTypes.array,
    mapReference: PropTypes.string,
    referenceLinks: PropTypes.array,
    openReferenceLinksInNewTab: PropTypes.bool,
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
    readOnlyWorkspace: PropTypes.bool,
    serverLevelId: PropTypes.number,
    serverScriptId: PropTypes.number,
    user: PropTypes.number,
    noInstructionsWhenCollapsed: PropTypes.bool.isRequired,
    teacherMarkdown: PropTypes.string,
    hidden: PropTypes.bool.isRequired,
    shortInstructions: PropTypes.string,
    isOldPurpleColorHeader: PropTypes.bool,
    isMinecraft: PropTypes.bool.isRequired,
    isBlockly: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    hasBackgroundMusic: PropTypes.bool.isRequired,
    mainStyle: PropTypes.object,
    containerStyle: PropTypes.object,
    resizable: PropTypes.bool,
    setAllowInstructionsResize: PropTypes.func,
    collapsible: PropTypes.bool,
    displayDocumentationTab: PropTypes.bool,
    displayReviewTab: PropTypes.bool,
    initialSelectedTab: PropTypes.oneOf(Object.values(TabType)),
    // Use this if the instructions will be somewhere other than over the code workspace.
    // This will allow instructions to be resized separately from the workspace.
    standalone: PropTypes.bool,
    // Use this if the caller wants to set an explicit height for the instructions rather
    // than allowing this component to manage its own height.
    explicitHeight: PropTypes.number,
    inLessonPlan: PropTypes.bool,
    taRubric: rubricShape,
  };

  static defaultProps = {
    resizable: true,
    collapsible: true,
    inLessonPlan: false,
  };

  constructor(props) {
    super(props);
    //Pull the student id from the url
    const studentId = queryString.parse(window.location.search).user_id;

    this.isViewingAsStudent = this.props.viewAs === ViewType.Participant;
    this.isViewingAsTeacher = this.props.viewAs === ViewType.Instructor;

    const studentUserIdIncluded = !!queryParams('user_id');

    const teacherViewingStudentWork =
      this.isViewingAsTeacher &&
      !!this.props.readOnlyWorkspace &&
      studentUserIdIncluded;

    this.state = {
      // We don't want to start in the comments tab for CSF since its hidden
      tabSelected:
        this.props.initialSelectedTab ||
        (teacherViewingStudentWork &&
        this.props.noInstructionsWhenCollapsed &&
        !this.props.taRubric
          ? TabType.COMMENTS
          : TabType.INSTRUCTIONS),
      latestFeedback: null,
      miniRubric: null,
      studentId: studentId,
      teacherViewingStudentWork: teacherViewingStudentWork,
      fetchingData: true,
      token: null,
    };

    this.instructions = null;
    this.helpTab = null;
    this.commentTab = null;
    this.documentationTab = null;
    this.reviewTab = null;
    this.teacherOnlyTab = null;
  }

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    const {user, serverLevelId, serverScriptId, dynamicInstructions, taRubric} =
      this.props;
    const {studentId} = this.state;

    window.addEventListener('resize', this.adjustMaxNeededHeight);

    if (!dynamicInstructions) {
      const maxNeededHeight = this.adjustMaxNeededHeight();

      // Initially set to 22% of the window height. This might be adjusted when
      // InstructionsWithWorkspace adjusts max height.
      const defaultHeight = Math.round(window.innerHeight * 0.22);
      this.props.setInstructionsRenderedHeight(
        Math.min(maxNeededHeight, defaultHeight)
      );
    }

    const promises = [];

    if (
      this.isViewingAsStudent &&
      user &&
      serverLevelId &&
      serverScriptId &&
      !taRubric
    ) {
      promises.push(
        topInstructionsDataApi
          .getTeacherFeedbackForStudent(user, serverLevelId, serverScriptId)
          .done((data, _, request) => {
            // If student has feedback make their default tab the feedback tab instead of instructions
            if (
              data[0] &&
              (data[0].comment || data[0].performance || data[0].review_state)
            ) {
              this.setState({
                latestFeedback: data[0],
                tabSelected: TabType.COMMENTS,
                token: request.getResponseHeader('csrf-token'),
              });
              this.incrementFeedbackVisitCount();
            }
          })
      );
    }

    if (serverLevelId && !taRubric) {
      promises.push(
        topInstructionsDataApi.getRubric(serverLevelId).done(data => {
          this.setState({miniRubric: data});
        })
      );
    }

    if (
      !this.state.teacherViewingStudentWork &&
      user &&
      this.isViewingAsStudent &&
      taRubric
    ) {
      promises.push(
        topInstructionsDataApi
          .getTaRubricFeedbackForStudent(taRubric.id)
          .then(data => {
            if (data.value?.length > 0) {
              this.setState({
                taRubricEvaluation: data.value,
                tabSelected: TabType.TA_RUBRIC,
              });
            }
          })
      );
    }

    if (
      this.state.teacherViewingStudentWork &&
      user &&
      serverLevelId &&
      studentId &&
      serverScriptId
    ) {
      promises.push(
        topInstructionsDataApi
          .getTeacherFeedbackForTeacher(
            studentId,
            serverLevelId,
            user,
            serverScriptId
          )
          .done((data, textStatus, request) => {
            this.setState({
              latestFeedback: request.status === 204 ? null : data,
              teacherCanLeaveFeedback: true,
              token: request.getResponseHeader('csrf-token'),
            });
          })
      );
    }

    Promise.all(promises)
      .then(() => {
        this.setState({fetchingData: false}, this.forceTabResizeToMaxHeight);
      })
      .catch(error => {
        if (error.responseText) {
          console.log(
            'Promise Rejection while getting instructions: ' +
              error.responseText
          );
        } else {
          console.log(error);
        }
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustMaxNeededHeight);
  }

  /**
   * Height can get below min height iff we resize the window to be super small.
   * If we then resize it to be larger again, we want to increase height.
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
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

  refForSelectedTab = () => {
    const tabRefs = {
      [TabType.INSTRUCTIONS]: this.instructions,
      [TabType.RESOURCES]: this.helpTab,
      [TabType.COMMENTS]: this.commentTab,
      [TabType.DOCUMENTATION]: this.documentationTab,
      [TabType.REVIEW]: this.reviewTab,
      [TabType.TEACHER_ONLY]: this.teacherOnlyTab,
    };

    return tabRefs[this.state.tabSelected];
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
      maxNeededHeight,
      setInstructionsMaxHeightNeeded,
    } = this.props;

    // if not showing the instructions area the max needed height should be 0
    if (
      hidden ||
      !hasInstructions(shortInstructions, longInstructions, hasContainedLevels)
    ) {
      return 0;
    }

    const refForSelectedTab = this.refForSelectedTab();

    if (refForSelectedTab) {
      const maxNeededHeightMeasured =
        $(ReactDOM.findDOMNode(refForSelectedTab)).outerHeight(true) +
        HEADER_HEIGHT +
        RESIZER_HEIGHT;

      if (maxNeededHeight !== maxNeededHeightMeasured) {
        setInstructionsMaxHeightNeeded(maxNeededHeightMeasured);
      }
      return maxNeededHeightMeasured;
    } else {
      return 0;
    }
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
      expandedHeight,
    } = this.props;

    toggleInstructionsCollapsed();

    // record event
    const eventName = isCollapsed
      ? 'expand-instructions'
      : 'collapse-instructions';

    this.recordEvent(eventName, {
      data_json: JSON.stringify({
        csfStyleInstructions: !noInstructionsWhenCollapsed,
      }),
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
    const win = window.open(
      this.props.documentationUrl,
      '_blank',
      'noopener,noreferrer'
    );
    win.focus();
  };

  recordEvent(eventName, additionalData = {}) {
    const record = {
      study: 'top-instructions',
      event: eventName,
      ...additionalData,
    };
    firehoseClient.putRecord(record);
  }

  handleTabClick = newTab => {
    this.scrollToTopOfTab();
    this.setState({tabSelected: newTab}, () => {
      this.scrollToTopOfTab();
      this.adjustMaxNeededHeight();
    });
  };

  handleHelpTabClick = () => {
    this.handleTabClick(TabType.RESOURCES);
    this.recordEvent('click-help-and-tips-tab');
  };

  handleCommentTabClick = () => {
    this.scrollToTopOfTab();
    // Only increment visit count if user is switching from another tab to the
    // comments tab.
    if (this.state.tabSelected !== TabType.COMMENTS) {
      this.incrementFeedbackVisitCount();
    }
    this.recordEvent('click-feedback-tab');

    this.setState({tabSelected: TabType.COMMENTS}, () => {
      this.forceTabResizeToMaxHeight();
      this.scrollToTopOfTab();
    });
  };

  handleTeacherOnlyTabClick = () => {
    this.handleTabClick(TabType.TEACHER_ONLY);
    this.recordEvent('click-teacher-only-tab');
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
      const latestFeedback = this.state.latestFeedback;
      if (!this.state.teacherViewingStudentWork && latestFeedback) {
        topInstructionsDataApi.incrementVisitCount(
          latestFeedback.id,
          this.state.token
        );
      }
    },
    5000,
    {leading: true}
  );

  setInstructionsRef = ref => {
    this.instructions = ref;
  };

  renderInstructions(isCSF) {
    const {
      longInstructions,
      dynamicInstructions,
      dynamicInstructionsKey,
      hasContainedLevels,
      isEmbedView,
      isBlockly,
      noInstructionsWhenCollapsed,
      isOldPurpleColorHeader,
    } = this.props;
    const {teacherViewingStudentWork, tabSelected} = this.state;

    if (hasContainedLevels) {
      return (
        <div>
          <ContainedLevel
            ref={this.setInstructionsRef}
            hidden={tabSelected !== TabType.INSTRUCTIONS}
          />
          {!this.props.inLessonPlan && tabSelected === TabType.INSTRUCTIONS && (
            <ContainedLevelResetButton
              teacherViewingStudentWork={this.state.teacherViewingStudentWork}
            />
          )}
        </div>
      );
    } else if (isCSF && tabSelected === TabType.INSTRUCTIONS) {
      return (
        <InstructionsCSF
          setInstructionsRef={this.setInstructionsRef}
          handleClickCollapser={this.handleClickCollapser}
          adjustMaxNeededHeight={this.adjustMaxNeededHeight}
          isEmbedView={isEmbedView}
          teacherViewingStudentWork={teacherViewingStudentWork}
        />
      );
    } else if (tabSelected === TabType.INSTRUCTIONS) {
      if (dynamicInstructions) {
        return (
          <DynamicInstructions
            ref={this.setInstructionsRef}
            dynamicInstructions={dynamicInstructions}
            dynamicInstructionsKey={dynamicInstructionsKey}
            setInstructionsRenderedHeight={height => {
              this.props.setInstructionsRenderedHeight(height);
            }}
          />
        );
      } else {
        return (
          <Instructions
            ref={this.setInstructionsRef}
            instructions={longInstructions}
            onResize={this.adjustMaxNeededHeight}
            inTopPane
            isImmersiveButtonHasRoundBorders
            isLegacyImmersiveStyles={isOldPurpleColorHeader}
            isBlockly={isBlockly}
            noInstructionsWhenCollapsed={noInstructionsWhenCollapsed}
          />
        );
      }
    }
  }

  render() {
    const {
      hidden,
      shortInstructions,
      longInstructions,
      dynamicInstructions,
      dynamicInstructionsKey,
      overlayVisible,
      hasContainedLevels,
      exampleSolutions,
      isViewingAsInstructorInTraining,
      noInstructionsWhenCollapsed,
      noVisualization,
      isRtl,
      height,
      isEmbedView,
      levelVideos,
      mapReference,
      referenceLinks,
      // TODO: [Phase 2] Legacy header color logic. Delete once get rid of legacy header colors.
      //  More info here: https://github.com/code-dot-org/code-dot-org/pull/50895
      isOldPurpleColorHeader,
      isMinecraft,
      teacherMarkdown,
      isCollapsed,
      hasBackgroundMusic,
      user,
      mainStyle,
      containerStyle,
      resizable,
      documentationUrl,
      ttsLongInstructionsUrl,
      standalone,
      displayDocumentationTab,
      displayReviewTab,
      explicitHeight,
      taRubric,
    } = this.props;

    const {
      latestFeedback,
      teacherViewingStudentWork,
      miniRubric,
      tabSelected,
      fetchingData,
      teacherCanLeaveFeedback,
      token,
    } = this.state;

    // TODO: find a more straight forward way to determine CSF/D/P
    // instead of inferring it from noInstructionsWhenCollapsed
    const isCSF = !noInstructionsWhenCollapsed;
    const isCSDorCSP = !isCSF;

    const topInstructionsStyle = [
      isRtl ? styles.mainRtl : styles.main,
      mainStyle,
      {
        height: explicitHeight ? explicitHeight : height - RESIZER_HEIGHT,
      },
      noVisualization && styles.noViz,
      isEmbedView && styles.embedView,
      dynamicInstructions &&
        overlayVisible &&
        styles.dynamicInstructionsWithOverlay,
    ];

    const instructionsContainerStyle = [
      isCSF && !hasContainedLevels && tabSelected === TabType.INSTRUCTIONS
        ? styles.csfBody
        : containerStyle || styles.body,
      isMinecraft && craftStyles.instructionsBody,
      tabSelected === TabType.REVIEW && styles.commitAndReview,
    ];

    // Only display the help tab when there are one or more videos or
    // additional resource links.
    const levelResourcesAvailable =
      mapReference || (referenceLinks && referenceLinks.length > 0);

    const displayHelpTab =
      (levelVideos && levelVideos.length > 0) || !!levelResourcesAvailable;

    const displayFeedbackTab =
      !taRubric &&
      (!!miniRubric ||
        (teacherViewingStudentWork && teacherCanLeaveFeedback) ||
        (this.isViewingAsStudent && !!latestFeedback));

    const displayTaRubricTab =
      !!taRubric && !teacherViewingStudentWork && this.isViewingAsStudent;

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

    // ideally these props would get accessed directly from the redux
    // store in the child, however TopInstructions is also used in an unconnected
    // context (in LevelDetailsDialog), so we need to manually send these props through
    const passThroughHeaderProps = {
      isMinecraft,
      ttsLongInstructionsUrl,
      hasContainedLevels,
      exampleSolutions,
      isViewingAsInstructorInTraining,
      isRtl,
      documentationUrl,
      teacherMarkdown,
      isEmbedView,
      isCollapsed,
      hasBackgroundMusic,
      dynamicInstructions,
      dynamicInstructionsKey,
    };

    return (
      <div
        style={topInstructionsStyle}
        className={classNames({'editor-column': !standalone})}
        ref={ref => (this.topInstructions = ref)}
      >
        <AudioQueue>
          <TopInstructionsHeader
            teacherOnly={teacherOnly}
            isOldPurpleColor={isOldPurpleColorHeader}
            tabSelected={tabSelected}
            isCSDorCSP={isCSDorCSP}
            displayHelpTab={displayHelpTab}
            displayFeedback={displayFeedbackTab}
            levelHasMiniRubric={!!miniRubric}
            displayDocumentationTab={displayDocumentationTab}
            displayTaRubricTab={displayTaRubricTab}
            displayReviewTab={displayReviewTab}
            isViewingAsTeacher={this.isViewingAsTeacher}
            hasBackgroundMusic={hasBackgroundMusic}
            fetchingData={fetchingData}
            handleDocumentationClick={this.handleDocumentationClick}
            handleInstructionTabClick={() =>
              this.handleTabClick(TabType.INSTRUCTIONS)
            }
            handleHelpTabClick={this.handleHelpTabClick}
            handleCommentTabClick={this.handleCommentTabClick}
            handleDocumentationTabClick={() =>
              this.handleTabClick(TabType.DOCUMENTATION)
            }
            handleTaRubricTabClick={() =>
              this.handleTabClick(TabType.TA_RUBRIC)
            }
            handleReviewTabClick={() => this.handleTabClick(TabType.REVIEW)}
            handleTeacherOnlyTabClick={this.handleTeacherOnlyTabClick}
            collapsible={this.props.collapsible}
            handleClickCollapser={this.handleClickCollapser}
            {...passThroughHeaderProps}
          />
          <div style={[isCollapsed && isCSDorCSP && commonStyles.hidden]}>
            <div style={instructionsContainerStyle} id="scroll-container">
              {this.renderInstructions(isCSF)}
              {tabSelected === TabType.RESOURCES && (
                <HelpTabContents
                  ref={ref => (this.helpTab = ref)}
                  videoData={levelVideos ? levelVideos[0] : []}
                  mapReference={mapReference}
                  referenceLinks={referenceLinks}
                  openReferenceLinksInNewTab={
                    this.props.openReferenceLinksInNewTab
                  }
                />
              )}
              {!fetchingData && displayFeedbackTab && (
                <TeacherFeedbackTab
                  teacherViewingStudentWork={teacherViewingStudentWork}
                  visible={tabSelected === TabType.COMMENTS}
                  rubric={miniRubric}
                  innerRef={ref => (this.commentTab = ref)}
                  latestFeedback={latestFeedback}
                  token={token}
                  serverScriptId={this.props.serverScriptId}
                  serverLevelId={this.props.serverLevelId}
                  teacher={user}
                  allowUnverified={isCSF}
                />
              )}
              {tabSelected === TabType.DOCUMENTATION && (
                <DocumentationTab ref={ref => (this.documentationTab = ref)} />
              )}
              {tabSelected === TabType.REVIEW && (
                <CommitsAndReviewTab
                  ref={ref => (this.reviewTab = ref)}
                  onLoadComplete={this.forceTabResizeToMaxOrAvailableHeight}
                />
              )}
              {tabSelected === TabType.TEACHER_ONLY &&
                exampleSolutions.length > 0 && (
                  <div style={styles.exampleSolutions}>
                    {exampleSolutions.map((example, index) => (
                      <Button
                        __useDeprecatedTag
                        key={index}
                        text={i18n.exampleSolution({number: index + 1})}
                        color={Button.ButtonColor.blue}
                        href={example}
                        target="_blank"
                        rel="noopener noreferrer"
                        ref={ref => (this.teacherOnlyTab = ref)}
                        style={styles.exampleSolutionButton}
                      />
                    ))}
                  </div>
                )}
              {tabSelected === TabType.TA_RUBRIC && (
                <StudentRubricView
                  rubric={this.props.taRubric}
                  submittedEvaluation={this.state.taRubricEvaluation}
                />
              )}
              {(this.isViewingAsTeacher || isViewingAsInstructorInTraining) &&
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
            {!isEmbedView && resizable && !dynamicInstructions && (
              <HeightResizer
                resizeItemTop={this.getItemTop}
                position={height}
                onResize={this.handleHeightResize}
              />
            )}
          </div>
        </AudioQueue>
      </div>
    );
  }
}

const styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0,
    // left handled by media queries for .editor-column
  },
  mainRtl: {
    position: 'absolute',
    marginRight: 15,
    top: 0,
    left: 0,
    // right handled by media queries for .editor-column
  },
  noViz: {
    left: 0,
    right: 0,
    marginRight: 0,
    marginLeft: 0,
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
    overflowY: 'scroll',
  },
  csfBody: {
    backgroundColor: '#ddd',
    position: 'absolute',
    top: HEADER_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  commitAndReview: {
    backgroundColor: color.background_gray,
    position: 'absolute',
    top: HEADER_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    overflowY: 'auto',
  },
  embedView: {
    height: undefined,
    bottom: 0,
  },
  title: {
    textAlign: 'center',
    height: HEADER_HEIGHT,
    lineHeight: HEADER_HEIGHT + 'px',
  },
  dynamicInstructionsWithOverlay: {
    zIndex: OVERLAY_Z_INDEX + 1,
  },
  exampleSolutions: {
    marginTop: 10,
  },
  exampleSolutionButton: {
    marginLeft: 20,
  },
};
// Note: usually the unconnected component is only used for tests, in this case it is used
// in LevelDetailsDialog, so all of it's children may not rely on the redux store for data
export const UnconnectedTopInstructions = Radium(TopInstructions);
export default connect(
  state => ({
    isEmbedView: state.pageConstants.isEmbedView,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    isMinecraft: !!state.pageConstants.isMinecraft,
    isBlockly: !!state.pageConstants.isBlockly,
    height: state.instructions.renderedHeight,
    expandedHeight: state.instructions.expandedHeight,
    maxNeededHeight: state.instructions.maxNeededHeight,
    maxHeight: Math.min(
      state.instructions.maxAvailableHeight,
      state.instructions.maxNeededHeight
    ),
    longInstructions: state.instructions.longInstructions,
    ttsLongInstructionsUrl: state.pageConstants.ttsLongInstructionsUrl,
    noVisualization: state.pageConstants.noVisualization,
    isCollapsed: state.instructions.isCollapsed,
    documentationUrl: state.pageConstants.documentationUrl,
    levelVideos: state.instructions.levelVideos,
    mapReference: state.instructions.mapReference,
    referenceLinks: state.instructions.referenceLinks,
    viewAs: state.viewAs,
    readOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    serverLevelId: state.pageConstants.serverLevelId,
    serverScriptId: state.pageConstants.serverScriptId,
    user: state.pageConstants.userId,
    noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed,
    teacherMarkdown: state.instructions.teacherMarkdown,
    hidden: state.pageConstants.isShareView,
    shortInstructions: state.instructions.shortInstructions,
    isRtl: state.isRtl,
    hasBackgroundMusic: !!state.pageConstants.hasBackgroundMusic,
    dynamicInstructions: getDynamicInstructions(state.instructions),
    dynamicInstructionsKey: state.instructions.dynamicInstructionsKey,
    overlayVisible: state.instructions.overlayVisible,
    exampleSolutions:
      (state.pageConstants && state.pageConstants.exampleSolutions) || [],
    isViewingAsInstructorInTraining:
      (state.pageConstants &&
        state.pageConstants.isViewingAsInstructorInTraining) ||
      false,
    taRubric: state.instructions.taRubric,
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
    },
    setAllowInstructionsResize(allowResize) {
      dispatch(setAllowInstructionsResize(allowResize));
    },
  }),
  null,
  {forwardRef: true}
)(Radium(TopInstructions));
