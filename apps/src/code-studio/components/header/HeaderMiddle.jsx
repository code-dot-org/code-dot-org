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
    linesOfCodeText: PropTypes.string
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
    if (projectInfoOnly) {
      return {
        projectInfo: Math.floor(Math.min(projectInfoDesiredWidth, width)),
        scriptName: 0,
        progress: 0,
        popup: 0,
        finish: 0
      };
    }

    const lessonProgresssDesiredWidthAdjusted = lessonProgressDesiredWidth + 10;

    // projectInfo gets no more than 30% of the entire width
    const projectInfoWidth = Math.floor(
      Math.min(projectInfoDesiredWidth, width * 0.3)
    );

    let remainingWidth = width - projectInfoWidth;

    // progress gets no more than 60% of the remaining width
    const progressWidth = Math.floor(
      Math.min(lessonProgresssDesiredWidthAdjusted, remainingWidth * 0.6)
    );

    remainingWidth = remainingWidth - progressWidth;

    let showPopup = false;
    let showPopupBecauseProgressCropped = false;
    if (numScriptLessons) {
      showPopup = true;
    } else if (progressWidth < lessonProgresssDesiredWidthAdjusted) {
      showPopup = true;
      showPopupBecauseProgressCropped = true;
    }

    const popupWidth = showPopup ? 40 : 0;

    remainingWidth = remainingWidth - popupWidth;

    const finishWidth = showFinish
      ? Math.min(remainingWidth / 2, finishDesiredWidth)
      : 0;

    remainingWidth = remainingWidth - finishWidth;

    const scriptNameWidth = Math.min(
      remainingWidth,
      scriptNameDesiredWidth + 10
    );

    remainingWidth = remainingWidth - scriptNameWidth;

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
      linesOfCodeText
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
          width: widths.scriptName - 10,
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
      console.log('HeaderMiddle render', this.getWidth());

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
                marginLeft: 5,
                marginRight: 5,
                boxSizing: 'border-box',
                width: widths.scriptName - 10,
                visibility: widths.scriptName === 10 ? 'hidden' : undefined
              }}
            >
              <ScriptName {...extraScriptNameData} />
            </div>
          )}

          {widths.progress !== 0 && (
            <div
              id="lesson_progress_container"
              style={{
                float: 'left',
                width: widths.progress,
                visibility: widths.progress === 10 ? 'hidden' : undefined
              }}
            >
              <LessonProgress
                width={widths.progress}
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
  appLoadStarted: state.header.appLoadStarted,
  appLoaded: state.header.appLoaded,
  lessonExtrasUrl: lessonExtrasUrl(
    state.progress,
    state.progress.currentStageId
  )
}))(HeaderMiddle);
