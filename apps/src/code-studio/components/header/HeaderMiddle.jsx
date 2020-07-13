import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ProjectInfo from './ProjectInfo';
import ScriptName from './ScriptName';
import LessonProgress from '../progress/LessonProgress';
import HeaderPopup from './HeaderPopup';
import HeaderFinish from './HeaderFinish';
import {lessonExtrasUrl} from '@cdo/apps/code-studio/progressRedux';
import _ from 'lodash';
import $ from 'jquery';

const styles = {
  headerMiddleContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    animation: 'header_fadein 0.4s'
  },
  finishedLink: {
    width: '100%'
  }
};

// These components will be given additional width beyond what they desire.
const scriptNameExtraWidth = 10;
const lessonProgressExtraWidth = 10;

class HeaderMiddle extends React.Component {
  static propTypes = {
    projectInfoOnly: PropTypes.bool,
    appLoadStarted: PropTypes.bool,
    appLoaded: PropTypes.bool,
    scriptNameData: PropTypes.object,
    lessonData: PropTypes.object,
    lessonExtrasUrl: PropTypes.string,
    scriptData: PropTypes.object,
    currentLevelId: PropTypes.string,
    linesOfCodeText: PropTypes.string,
    isRtl: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      width: this.getWidth(),
      projectInfoDesiredWidth: 0,
      scriptNameDesiredWidth: 0,
      lessonProgressDesiredWidth: 0,
      finishDesiredWidth: 0,
      initialDelay: true
    };

    setTimeout(() => {
      this.setState({initialDelay: false});
    }, 750);
  }

  componentDidMount() {
    this.updateLayout();

    this.updateLayoutListener = _.throttle(this.updateLayout, 200);
    window.addEventListener('resize', this.updateLayoutListener);
    window.addEventListener('scroll', this.updateLayoutListener);
  }

  getWidth() {
    const width = $('.header_middle').width();
    return width;
  }

  updateLayout = () => {
    this.setState({
      width: this.getWidth(),
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });
  };

  setDesiredWidth(componentName, width) {
    const stateComponentName = componentName + 'DesiredWidth';

    if (Math.ceil(width) !== this.state[stateComponentName]) {
      this.setState({[stateComponentName]: Math.ceil(width)});
    }
  }

  // Return the desired widths for the items that are showing.
  // Also return whether we are only showing the HeaderPopup because we are
  // cropping the progress, and otherwise wouldn't show it.
  static getWidths(
    width,
    projectInfoOnly,
    projectInfoDesiredWidth,
    scriptNameDesiredWidth,
    lessonProgressDesiredWidth,
    numScriptLessons,
    finishDesiredWidth,
    showFinish
  ) {
    // For levels that show only project info, do an early return.
    if (projectInfoOnly) {
      return {
        projectInfo: Math.floor(Math.min(projectInfoDesiredWidth, width)),
        scriptName: 0,
        progress: 0,
        popup: 0,
        finish: 0
      };
    }

    // We will take care of padding the lesson progress with an extra 5 pixels
    // on each side.
    const lessonProgressDesiredWidthAdjusted =
      lessonProgressDesiredWidth + lessonProgressExtraWidth;

    // Project info gets no more than 30% of the entire width.
    const projectInfoWidth = Math.floor(
      Math.min(projectInfoDesiredWidth, width * 0.3)
    );

    let remainingWidth = width - projectInfoWidth;

    // Progress gets no more than 60% of the remaining width.
    const progressWidth = Math.floor(
      Math.min(lessonProgressDesiredWidthAdjusted, remainingWidth * 0.6)
    );

    remainingWidth = remainingWidth - progressWidth;

    // We might show the popup (which reveals the MiniView when clicked) for
    // one of two reasons: because there are multiple lessons in this script,
    // or because we have cropped the lesson progress bubbles.
    let showPopup = false;
    let showPopupBecauseProgressCropped = false;
    if (numScriptLessons > 1) {
      showPopup = true;
    } else if (progressWidth < lessonProgressDesiredWidthAdjusted) {
      showPopup = true;
      showPopupBecauseProgressCropped = true;
    }

    // The popup is always 40 pixels wide.
    const popupWidth = showPopup ? 40 : 0;

    remainingWidth = remainingWidth - popupWidth;

    // If we show the finish link, it gets no more than 50% of the remaining width.
    const finishWidth = showFinish
      ? Math.min(remainingWidth / 2, finishDesiredWidth)
      : 0;

    remainingWidth = remainingWidth - finishWidth;

    // We will also take care of padding the script name with an extra 5 pixels
    // on each side.
    const scriptNameWidth = Math.min(
      remainingWidth,
      scriptNameDesiredWidth + scriptNameExtraWidth
    );

    remainingWidth = remainingWidth - scriptNameWidth;

    // Center the contents in HeaderMiddle.
    const leftWidth = remainingWidth / 2;

    return {
      left: leftWidth,
      projectInfo: projectInfoWidth,
      scriptName: scriptNameWidth,
      progress: progressWidth,
      popup: popupWidth,
      finish: finishWidth,
      showPopupBecauseProgressCropped: showPopupBecauseProgressCropped
    };
  }

  render() {
    const {
      scriptNameData,
      lessonData,
      scriptData,
      currentLevelId,
      linesOfCodeText,
      isRtl
    } = this.props;

    const showFinish = !!(
      this.props.lessonData && this.props.lessonData.finishLink
    );

    const widths = HeaderMiddle.getWidths(
      this.state.width,
      this.props.projectInfoOnly,
      this.state.projectInfoDesiredWidth,
      this.state.scriptNameDesiredWidth,
      this.state.lessonProgressDesiredWidth,
      this.props.lessonData ? this.props.lessonData.num_script_lessons : 0,
      this.state.finishDesiredWidth,
      showFinish
    );

    const extraScriptNameData = scriptNameData
      ? {
          ...scriptNameData,
          width: widths.scriptName - scriptNameExtraWidth,
          setDesiredWidth: width => {
            this.setDesiredWidth('scriptName', width);
          }
        }
      : null;

    // Hold off rendering for 3/4 second unless we both start and finish loading
    // an app within that time.  Once the delay has passed, if we started loading
    // then wait for it to finish, otherwise, show immediately.
    // In other words, we'd like to avoid rendering until we finish an app load,
    // but we only wait 3/4 second for the app load to begin.

    if (
      (!this.state.initialDelay && !this.props.appLoadStarted) ||
      (this.props.appLoadStarted && this.props.appLoaded)
    ) {
      return (
        <div id="header_middle_content" style={styles.headerMiddleContent}>
          <div
            id="project_info_container"
            style={{
              float: 'left',
              width: widths.projectInfo,
              visibility: widths.projectInfo === 0 ? 'hidden' : undefined
            }}
          >
            <ProjectInfo
              width={widths.projectInfo}
              setDesiredWidth={width => {
                this.setDesiredWidth('projectInfo', width);
              }}
              isRtl={isRtl}
            />
          </div>

          {widths.left !== 0 && (
            <div
              id="left_padding"
              style={{float: 'left', width: widths.left}}
            />
          )}

          {extraScriptNameData && (
            <div
              id="script_name_container"
              style={{
                float: 'left',
                textAlign: 'right',
                marginLeft: scriptNameExtraWidth / 2,
                marginRight: scriptNameExtraWidth / 2,
                boxSizing: 'border-box',
                width: widths.scriptName - scriptNameExtraWidth,
                visibility:
                  widths.scriptName === scriptNameExtraWidth
                    ? 'hidden'
                    : undefined
              }}
            >
              <ScriptName {...extraScriptNameData} isRtl={isRtl} />
            </div>
          )}

          {widths.progress !== 0 && (
            <div
              id="lesson_progress_container"
              style={{
                float: 'left',
                width: widths.progress,
                visibility:
                  widths.progress === lessonProgressExtraWidth
                    ? 'hidden'
                    : undefined
              }}
            >
              <LessonProgress
                width={widths.progress - lessonProgressExtraWidth}
                setDesiredWidth={width => {
                  this.setDesiredWidth('lessonProgress', width);
                }}
              />
            </div>
          )}

          {widths.popup !== 0 && (
            <div
              id="header_popup_container"
              style={{
                float: 'left',
                width: widths.popup,
                windowWidth: this.state.windowWidth,
                windowHeight: this.state.windowHeight,
                visibility: widths.popup === 0 ? 'hidden' : undefined
              }}
            >
              <HeaderPopup
                scriptName={scriptData.name}
                scriptData={scriptData}
                currentLevelId={currentLevelId}
                linesOfCodeText={linesOfCodeText}
                windowHeight={this.state.windowHeight}
                minimal={widths.showPopupBecauseProgressCropped}
              />
            </div>
          )}

          {this.props.lessonData && this.props.lessonData.finishLink && (
            <div
              id="finish_link_container"
              style={{float: 'left', width: widths.finish, height: 18}}
            >
              <HeaderFinish
                lessonData={lessonData}
                width={widths.finish}
                setDesiredWidth={width => {
                  this.setDesiredWidth('finish', width);
                }}
                style={{
                  visibility: widths.projectInfo === 0 ? 'hidden' : undefined
                }}
                isRtl={isRtl}
              />
            </div>
          )}
        </div>
      );
    } else {
      return null;
    }
  }
}

export default connect(state => ({
  isRtl: state.isRtl,
  appLoadStarted: state.header.appLoadStarted,
  appLoaded: state.header.appLoaded,
  lessonExtrasUrl: lessonExtrasUrl(
    state.progress,
    state.progress.currentStageId
  )
}))(HeaderMiddle);
