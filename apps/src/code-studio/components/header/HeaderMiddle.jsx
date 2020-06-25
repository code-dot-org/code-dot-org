import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ScriptName from './ScriptName';
import ProjectInfo from './ProjectInfo';
import HeaderPopup from './HeaderPopup';
import HeaderFinish from './HeaderFinish';
import LessonProgress from '../progress/LessonProgress.jsx';
import {lessonExtrasUrl} from '@cdo/apps/code-studio/progressRedux';
import _ from 'lodash';

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
    appLoaded: PropTypes.bool,
    scriptNameData: PropTypes.object,
    lessonData: PropTypes.object,
    lessonExtrasUrl: PropTypes.string,
    scriptData: PropTypes.object,
    currentLevelId: PropTypes.string,
    linesOfCodeText: PropTypes.string,
    hasAppOptions: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      width: this.getWidth(),
      scriptNameDesiredWidth: 0,
      projectInfoDesiredWidth: 0,
      lessonProgressDesiredWidth: 0,
      finishDesiredWidth: 0
    };
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

  // Return the desired widths for the items that are showing.
  // Also return whether we are only showing the HeaderPopup because we are
  // cropping the progress, and otherwise wouldn't show it.
  getWidths() {
    const width = this.state.width;

    if (this.props.projectInfoOnly) {
      return {
        projectInfo: this.state.projectInfoDesiredWidth,
        scriptName: 0,
        progress: 0,
        popup: 0,
        finish: 0
      };
    }

    const lessonProgresssDesiredWidth =
      this.state.lessonProgressDesiredWidth + 10;

    const showFinish = !!(
      this.props.lessonData && this.props.lessonData.finishLink
    );

    // projectInfo gets no more than 30% of the entire width
    const projectInfoWidth = Math.floor(
      Math.min(this.state.projectInfoDesiredWidth, width * 0.3)
    );

    let remainingWidth = width - projectInfoWidth;

    // progress gets no more than 60% of the remaining width
    const progressWidth = Math.floor(
      Math.min(lessonProgresssDesiredWidth, remainingWidth * 0.6)
    );

    remainingWidth = remainingWidth - progressWidth;

    let showPopup = false;
    let showPopupBecauseProgressCropped = false;
    if (this.props.lessonData && this.props.lessonData.num_script_lessons > 1) {
      showPopup = true;
    } else if (progressWidth < lessonProgresssDesiredWidth) {
      showPopup = true;
      showPopupBecauseProgressCropped = true;
    }

    const popupWidth = showPopup ? 40 : 0;

    remainingWidth = remainingWidth - popupWidth;

    const finishWidth = showFinish
      ? Math.min(remainingWidth / 2, this.state.finishDesiredWidth)
      : 0;

    remainingWidth = remainingWidth - finishWidth;

    const scriptNameWidth = Math.min(
      remainingWidth,
      this.state.scriptNameDesiredWidth + 10
    );

    /*
    // script name gets between 50% on wide screens and 80% on narrow screens
    const scriptNameWidthMax = this.getScaledValue(
      400,
      1000,
      width,
      remainingWidth * 0.9,
      remainingWidth * 0.5
    );

    const scriptNameWidth = Math.floor(Math.min(
      scriptNameWidthMax,
      this.state.scriptNameDesiredWidth + 10
    ));*/

    remainingWidth = remainingWidth - scriptNameWidth;

    /*
    const headerMiddleLeftOffset = 74; // $('#header_middle_content').offset().left;
    const windowWidth = $(window).width();
    const widthUsed = width - remainingWidth;
    const idealLeftPadding = (windowWidth - widthUsed)/2 - headerMiddleLeftOffset;
    const leftWidth = Math.floor(Math.min(idealLeftPadding, remainingWidth));
    */

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

  // e.g.
  // getScaledValue(10, 20, 15, 100, 200) === 150
  // getScaledValue(10, 20, 5, 100, 200) === 100
  // getScaledValue(10, 20, 30, 100, 200) === 200

  getScaledValue(minInput, maxInput, input, minOutput, maxOutput) {
    const inputAmount = (input - minInput) / (maxInput - minInput);
    const clampedInputAmount = Math.max(Math.min(inputAmount, 1), 0);
    const scaledOutput =
      minOutput + (maxOutput - minOutput) * clampedInputAmount;
    return scaledOutput;
  }

  render() {
    const {
      scriptNameData,
      lessonData,
      scriptData,
      currentLevelId,
      linesOfCodeText,
      hasAppOptions
    } = this.props;

    const widths = this.getWidths();

    const extraScriptNameData = scriptNameData
      ? {
          ...scriptNameData,
          width: widths.scriptName - 10,
          setDesiredWidth: width => {
            if (Math.ceil(width) !== this.state.scriptNameDesiredWidth) {
              this.setState({scriptNameDesiredWidth: Math.ceil(width)});
            }
          }
        }
      : null;

    if (!hasAppOptions || this.props.appLoaded) {
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
                if (Math.ceil(width) !== this.state.projectInfoDesiredWidth) {
                  this.setState({projectInfoDesiredWidth: Math.ceil(width)});
                }
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
                visibility: widths.scriptName === 0 ? 'hidden' : undefined
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
                visibility: widths.progress === 0 ? 'hidden' : undefined
              }}
            >
              <LessonProgress
                width={widths.progress}
                setDesiredWidth={width => {
                  if (
                    Math.ceil(width) !== this.state.lessonProgressDesiredWidth
                  ) {
                    this.setState({
                      lessonProgressDesiredWidth: Math.ceil(width)
                    });
                  }
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

          <div
            id="finish_link_container"
            style={{float: 'left', width: widths.finish, height: 18}}
          >
            <HeaderFinish
              lessonData={lessonData}
              width={widths.finish}
              setDesiredWidth={width => {
                if (Math.ceil(width) !== this.state.finishDesiredWidth) {
                  this.setState({finishDesiredWidth: Math.ceil(width)});
                }
              }}
              style={{
                visibility: widths.projectInfo === 0 ? 'hidden' : undefined
              }}
            />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default connect(state => ({
  appLoaded: state.header.appLoaded,
  lessonExtrasUrl: lessonExtrasUrl(
    state.progress,
    state.progress.currentStageId
  )
}))(HeaderMiddle);
