import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ScriptName from '@cdo/apps/code-studio/components/header/ScriptName';
import ProjectInfo from '@cdo/apps/code-studio/components/header/ProjectInfo';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import {lessonExtrasUrl} from '@cdo/apps/code-studio/progressRedux';
import _ from 'lodash';

import LessonProgress from '../progress/LessonProgress.jsx';

const styles = {
  headerMiddleContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center'
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
    children: PropTypes.node
  };

  constructor(props) {
    super(props);

    this.state = {
      width: this.getWidth(),
      addedPopupComponents: false,
      lessonProgressFullWidth: 0,
      projectInfoFullWidth: 0
    };
  }

  componentDidMount() {
    this.showPopupComponents();

    this.updateLayoutListener = _.throttle(this.updateLayout, 200);
    window.addEventListener('resize', this.updateLayoutListener);
    window.addEventListener('scroll', this.updateLayoutListener);
  }

  componentDidUpdate() {
    this.showPopupComponents();
  }

  showPopupComponents() {
    // The components used here are implemented in legacy HAML/CSS rather than React.

    if (
      !this.state.addedPopupComponents &&
      this.refs.header_popup_components &&
      true // this.props.lessonData.num_script_lessons > 1
    ) {
      $('.header_popup_components')
        .appendTo(ReactDOM.findDOMNode(this.refs.header_popup_components))
        .show();

      $('.header_popup_link').show();

      this.setState({addedPopupComponents: true});
    }
  }

  getWidth() {
    const width = $('.header_middle').width();
    console.log('header_middle width', width);
    return width;
  }

  updateLayout = () => {
    this.setState({width: this.getWidth()});
  };

  // Return the desired widths for the items that are showing.
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

    // do we show popup?
    const showPopup =
      (this.props.lessonData && this.props.lessonData.num_script_lessons > 1) ||
      progressWidth < progressDesiredWidth;

    const popupWidth = showPopup ? 40 : 0;

    remainingWidth = remainingWidth - popupWidth;

    // finish link gets 1/3 of remaining space
    const finishLinkWidth = showFinish ? remainingWidth * 0.3 : 0;

    remainingWidth = remainingWidth - finishLinkWidth;

    // script name gets the rest
    const scriptNameWidth = showFinish ? remainingWidth : remainingWidth;

    return {
      projectInfo: projectInfoWidth,
      scriptName: scriptNameWidth,
      progress: progressWidth,
      popup: popupWidth,
      finishLink: finishLinkWidth
    };
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
    const {scriptNameData, lessonData} = this.props;

    const widths = this.getWidths();

    const extraScriptNameData = scriptNameData
      ? {...scriptNameData, width: widths.scriptName}
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
                //paddingRight: 10,
                boxSizing: 'border-box',
                width: widths.scriptName,
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

          <div
            id="header_popup_container"
            style={{
              float: 'left',
              width: widths.popup,
              visibility: widths.popup === 0 ? 'hidden' : undefined
            }}
          >
            <ProtectedStatefulDiv ref="header_popup_components" />
          </div>

          {widths.finishLink !== 0 && (
            <div
              id="finish_link_container"
              style={{float: 'left', width: widths.finishLink}}
            >
              <div className="header_finished_link" style={styles.finishedLink}>
                <a href={lessonData.finishLink}>{lessonData.finishText}</a>
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
