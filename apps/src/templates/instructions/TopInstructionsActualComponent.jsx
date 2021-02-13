import $ from 'jquery';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import _ from 'lodash';
import TeacherOnlyMarkdown from './TeacherOnlyMarkdown';
import InlineAudio from './InlineAudio';
import ContainedLevel from '../ContainedLevel';
import ContainedLevelAnswer from '../ContainedLevelAnswer';
import PaneHeader, {PaneButton} from '../../templates/PaneHeader';
import InstructionsTab from './InstructionsTab';
import HelpTabContents from './HelpTabContents';
import color from '../../util/color';
import styleConstants from '../../styleConstants';
import commonStyles from '../../commonStyles';
import Instructions from './Instructions';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import queryString from 'query-string';
import {UnconnectedInstructionsCSF as InstructionsCSF} from './InstructionsCSF';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {WIDGET_WIDTH} from '@cdo/apps/applab/constants';
import {hasInstructions} from './utils';

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
    marginLeft: 15,
    top: 0,
    right: 0
    // left handled by media queries for .editor-column
  },
  mainRtl: {
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
    top: HEADER_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    overflowY: 'scroll'
  },
  csfBody: {
    backgroundColor: '#ddd',
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

class TopInstructionsActualComponent extends Component {
  static propTypes = {
    hasContainedLevels: PropTypes.bool,
    longInstructions: PropTypes.string,
    noVisualization: PropTypes.bool.isRequired,
    documentationUrl: PropTypes.string,
    ttsLongInstructionsUrl: PropTypes.string,
    levelVideos: PropTypes.array,
    mapReference: PropTypes.string,
    referenceLinks: PropTypes.array,
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
    readOnlyWorkspace: PropTypes.bool,
    serverLevelId: PropTypes.number,
    user: PropTypes.number,
    teacherMarkdown: PropTypes.string,
    shortInstructions: PropTypes.string,
    isMinecraft: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    widgetMode: PropTypes.bool,
    isCSF: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      // We don't want to start in the comments tab for CSF since its hidden
      tabSelected: TabType.INSTRUCTIONS
    };
  }

  /**
   * Returns the top Y coordinate of the instructions that are being resized
   * via a call to handleHeightResize from HeightResizer.
   */
  getItemTop = () => {
    return this.refs.topInstructions.getBoundingClientRect().top;
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
    this.setState({tabSelected: TabType.RESOURCES}, () => {
      this.scrollToTopOfTab();
    });
    firehoseClient.putRecord({
      study: 'top-instructions',
      event: 'click-help-and-tips-tab'
    });
  };

  handleInstructionTabClick = () => {
    this.scrollToTopOfTab();
    this.setState({tabSelected: TabType.INSTRUCTIONS}, () => {
      this.scrollToTopOfTab();
    });
  };

  handleTeacherOnlyTabClick = () => {
    this.setState({tabSelected: TabType.TEACHER_ONLY}, () => {
      this.scrollToTopOfTab();
    });
    firehoseClient.putRecord({
      study: 'top-instructions',
      event: 'click-teacher-only-tab'
    });
  };

  scrollToTopOfTab = () => {
    var myDiv = document.getElementById('scroll-container');
    myDiv.scrollTop = 0;
  };

  render() {
    const {
      shortInstructions,
      longInstructions,
      hasContainedLevels,
      isCSF
    } = this.props;

    const isCSDorCSP = !isCSF;
    const widgetWidth = WIDGET_WIDTH + 'px';

    const mainStyle = [
      this.props.isRtl ? styles.mainRtl : styles.main,
      this.props.noVisualization && styles.noViz,
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

    // Teacher is viewing students work and in the Feedback Tab
    const teacherOnly = this.state.tabSelected === TabType.TEACHER_ONLY;
    if (
      !hasInstructions(shortInstructions, longInstructions, hasContainedLevels)
    ) {
      return <div />;
    }

    const showContainedLevelAnswer =
      this.props.hasContainedLevels && $('#containedLevelAnswer0').length > 0;

    return (
      <div style={mainStyle} className="editor-column" ref="topInstructions">
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
              {this.props.viewAs === ViewType.Teacher &&
                (this.props.teacherMarkdown || showContainedLevelAnswer) && (
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
          </div>
        </PaneHeader>
        <div>
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
                </div>
              )}
              {!this.props.hasContainedLevels &&
                isCSF &&
                this.state.tabSelected === TabType.INSTRUCTIONS && (
                  <InstructionsCSF
                    ref="instructions"
                    handleClickCollapser={this.handleClickCollapser}
                    adjustMaxNeededHeight={this.adjustMaxNeededHeight}
                    isEmbedView={false}
                    teacherViewingStudentWork={false}
                    isMinecraft={this.props.isMinecraft}
                    hideOverlay={() => {}}
                    isRtl={this.props.isRtl}
                    hints={[]}
                    hasUnseenHint={false}
                    showNextHint={() => {}}
                    hasAuthoredHints={false}
                    collapsed={false}
                    height={this.props.height}
                    maxHeight={this.props.maxHeight}
                    setInstructionsRenderedHeight={
                      this.props.setInstructionsRenderedHeight
                    }
                    smallStaticAvatar={'/blockly/media/spritelab/avatar.png'}
                    longInstructions={this.props.longInstructions}
                    shortInstructions={this.props.shortInstructions}
                  />
                )}
              {!this.props.hasContainedLevels &&
                isCSDorCSP &&
                this.state.tabSelected === TabType.INSTRUCTIONS && (
                  <div>
                    <Instructions
                      ref="instructions"
                      longInstructions={this.props.longInstructions}
                      inTopPane
                    />
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
            {this.props.viewAs === ViewType.Teacher &&
              (this.props.hasContainedLevels || this.props.teacherMarkdown) && (
                <div>
                  {this.props.hasContainedLevels && (
                    <ContainedLevelAnswer
                      ref="teacherOnlyTab"
                      hidden={this.state.tabSelected !== TabType.TEACHER_ONLY}
                    />
                  )}
                  {this.state.tabSelected === TabType.TEACHER_ONLY && (
                    <TeacherOnlyMarkdown
                      ref={ref => (this.teacherOnlyTab = ref)}
                      content={this.props.teacherMarkdown}
                    />
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
}
export default Radium(TopInstructionsActualComponent);
