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
      projectInfoWidth: 0,
      addedPopupComponents: false,
      lessonProgressFullWidth: 0
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
      this.props.lessonData.num_script_lessons > 1
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

  // The first item is the script name, the second item is the progress container.
  // But the third item can be the "I'm finished" link, or the popup link.
  thirdItem() {
    if (!this.props.lessonData) {
      return 'none';
    } else if (this.props.lessonData.finishLink) {
      return 'finish';
    } else if (this.props.lessonData.num_script_lessons > 1) {
      return 'popup';
    } else {
      return 'none';
    }
  }

  // Return the desired widths for the items that are showing.
  getWidths() {
    const width = this.state.width - this.state.projectInfoWidth;
    const thirdItem = this.thirdItem();
    const progressDesiredWidth = this.props.projectInfoOnly
      ? 0
      : this.state.lessonProgressFullWidth + 10;

    if (this.props.projectInfoOnly) {
      return {
        projectInfo: this.state.projectInfoWidth,
        scriptName: 0,
        progress: 0,
        finishLink: 0
      };
    }

    if (thirdItem === 'finish') {
      if (width < 160) {
        return {
          projectInfo: this.state.projectInfoWidth,
          scriptName: 0,
          progress: 0,
          finishLink: width
        };
      } else if (width < 300) {
        return {
          projectInfo: this.state.projectInfoWidth,
          scriptName: 0,
          progress: Math.min(progressDesiredWidth, (3 * width) / 4),
          finishLink: width / 4
        };
      } else {
        const progressActualWidth = Math.min(
          progressDesiredWidth,
          (2 * width) / 4
        );

        return {
          projectInfo: this.state.projectInfoWidth,
          scriptName: (width - progressActualWidth) / 2,
          progress: progressActualWidth,
          finishLink: (width - progressActualWidth) / 2
        };
      }
    } else if (thirdItem === 'popup') {
      if (width < 160) {
        return {
          projectInfo: this.state.projectInfoWidth,
          scriptName: 0,
          progress: 0,
          popup: 40
        };
      } else if (width < 300) {
        return {
          projectInfo: this.state.projectInfoWidth,
          scriptName: 0,
          progress: Math.min(progressDesiredWidth, width - 40 - 1),
          popup: 40
        };
      } else {
        return {
          projectInfo: this.state.projectInfoWidth,
          scriptName: (width - 40) / 2 - 1,
          progress: Math.min(progressDesiredWidth, (width - 40) / 2 - 1),
          popup: 40
        };
      }
    }
  }

  onLessonProgressFullWidth = lessonProgressFullWidth => {
    if (lessonProgressFullWidth !== this.state.lessonProgressFullWidth) {
      this.setState({lessonProgressFullWidth});
    }
  };

  render() {
    const {projectInfoOnly, scriptNameData, lessonData} = this.props;

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
              visibility: widths.projectInfo === 0 ? 'hidden' : undefined
            }}
          >
            <ProjectInfo
              onComponentResize={projectInfoWidth => {
                this.setState({projectInfoWidth});
              }}
              width={widths.projectInfo}
            />
          </div>

          {extraScriptNameData && (
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

          {!projectInfoOnly && (
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

          {lessonData && (
            <div
              id="finish_link_container"
              style={{float: 'left', width: widths.finishLink}}
            >
              <div className="header_finished_link" style={styles.finishedLink}>
                <a href={lessonData.finishLink}>{lessonData.finishText}</a>
              </div>
            </div>
          )}

          {lessonData && lessonData.num_script_lessons > 1 && (
            <div
              id="header_popup_container"
              style={{float: 'left', width: widths.popup}}
            >
              <ProtectedStatefulDiv ref="header_popup_components" />
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
