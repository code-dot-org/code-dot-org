import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ScriptName from '@cdo/apps/code-studio/components/header/ScriptName';
import ProjectInfo from '@cdo/apps/code-studio/components/header/ProjectInfo';
import HeaderPopup from '@cdo/apps/code-studio/components/header/HeaderPopup';
import {lessonExtrasUrl} from '@cdo/apps/code-studio/progressRedux';
import _ from 'lodash';

import LessonProgress from '../progress/LessonProgress.jsx';

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
    linesOfCodeText: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      width: this.getWidth(),
      lessonProgressFullWidth: 0,
      projectInfoFullWidth: 0
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
    console.log('header_middle width', width);
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
        projectInfo: this.state.projectInfoFullWidth,
        scriptName: 0,
        progress: 0,
        popup: 0,
        finishLink: 0
      };
    }

    const progressDesiredWidth = this.state.lessonProgressFullWidth + 10;

    const showFinish = !!(
      this.props.lessonData && this.props.lessonData.finishLink
    );

    // projectInfo gets no more than 30% of the entire width
    const projectInfoWidth = Math.min(
      this.state.projectInfoFullWidth,
      width * 0.3
    );

    let remainingWidth = width - projectInfoWidth;

    // progress gets no more than 60% of the remaining width
    const progressWidth = Math.min(progressDesiredWidth, remainingWidth * 0.6);

    remainingWidth = remainingWidth - progressWidth;

    let showPopup = false;
    let showPopupBecauseProgressCropped = false;
    if (this.props.lessonData && this.props.lessonData.num_script_lessons > 1) {
      showPopup = true;
    } else if (progressWidth < progressDesiredWidth) {
      showPopup = true;
      showPopupBecauseProgressCropped = true;
    }

    const popupWidth = showPopup ? 40 : 0;

    remainingWidth = remainingWidth - popupWidth;

    // script name gets between 50% on wide screens and 80% on narrow screens
    const scriptNameWidth = this.getScaledValue(
      300,
      1000,
      width,
      remainingWidth * 0.8,
      remainingWidth * 0.5
    );

    remainingWidth = remainingWidth - scriptNameWidth;

    const finishLinkWidth = showFinish ? remainingWidth * 0.5 : 0;

    return {
      projectInfo: projectInfoWidth,
      scriptName: scriptNameWidth,
      progress: progressWidth,
      popup: popupWidth,
      finishLink: finishLinkWidth,
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

  onLessonProgressFullWidth = lessonProgressFullWidth => {
    if (lessonProgressFullWidth !== this.state.lessonProgressFullWidth) {
      this.setState({lessonProgressFullWidth});
    }
  };

  onProjectInfoFullWidth = projectInfoFullWidth => {
    if (projectInfoFullWidth !== this.state.projectInfoFullWidth) {
      this.setState({projectInfoFullWidth});
    }
  };

  render() {
    const {
      scriptNameData,
      lessonData,
      scriptData,
      currentLevelId,
      linesOfCodeText
    } = this.props;

    const widths = this.getWidths();

    const extraScriptNameData = scriptNameData
      ? {...scriptNameData, width: widths.scriptName - 10}
      : null;

    if (this.props.appLoaded) {
      return (
        <div id="header_middle_content;" style={styles.headerMiddleContent}>
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
              onSize={this.onProjectInfoFullWidth}
            />
          </div>

          {widths.scriptName !== 0 && (
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
                onSize={this.onLessonProgressFullWidth}
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

          {widths.finishLink !== 0 && (
            <div
              id="finish_link_container"
              style={{float: 'left', width: widths.finishLink}}
            >
              <div className="header_finished_link" style={styles.finishedLink}>
                <a href={lessonData.finishLink} title={lessonData.finishText}>
                  {lessonData.finishText}
                </a>
              </div>
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
  appLoaded: state.header.appLoaded,
  lessonExtrasUrl: lessonExtrasUrl(
    state.progress,
    state.progress.currentStageId
  )
}))(HeaderMiddle);
