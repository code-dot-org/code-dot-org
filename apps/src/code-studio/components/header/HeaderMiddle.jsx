import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ScriptName from '@cdo/apps/code-studio/components/header/ScriptName';
import ProjectInfo from '@cdo/apps/code-studio/components/header/ProjectInfo';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import _ from 'lodash';

import LessonProgress, {
  getFullWidthForLevels
} from '../progress/LessonProgress.jsx';

class HeaderMiddle extends React.Component {
  static propTypes = {
    appLoaded: PropTypes.bool,
    scriptNameData: PropTypes.object.isRequired,
    stageData: PropTypes.object.isRequired,
    children: PropTypes.node
  };

  constructor(props) {
    super(props);

    this.state = {
      width: this.getWidth(),
      projectInfoWidth: 0
    };
  }

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.

    if (this.props.stageData.script_stages > 1) {
      $('.header_popup_components')
        .appendTo(ReactDOM.findDOMNode(this.refs.header_popup_components))
        .show();

      $('.header_popup_link').show();
    }

    this.updateLayoutListener = _.throttle(this.updateLayout, 200);
    window.addEventListener('resize', this.updateLayoutListener);
    window.addEventListener('scroll', this.updateLayoutListener);
  }

  getWidth() {
    return window.innerWidth - 280;
  }

  updateLayout = () => {
    this.setState({width: this.getWidth()});
  };

  // The first item is the script name, the second item is the progress container.
  // But the third item can be the "I'm finished" link, or the popup link.
  thirdItem() {
    if (this.props.stageData.finishLink) {
      return 'finish';
    } else if (this.props.stageData.script_stages > 1) {
      return 'popup';
    } else {
      return 'none';
    }
  }

  // Return the desired widths for the items that are showing.
  getWidths() {
    const width = this.state.width - this.state.projectInfoWidth;
    const thirdItem = this.thirdItem();

    if (thirdItem === 'finish') {
      return {
        scriptName: width / 3,
        progress: Math.min(getFullWidthForLevels(), width / 3),
        finishLink: width / 3
      };
    } else if (thirdItem === 'popup') {
      return {
        scriptName: (width - 40) / 2 - 1,
        progress: Math.min(getFullWidthForLevels(), (width - 40) / 2 - 1),
        popup: 40
      };
    }
  }

  render() {
    const {scriptNameData, stageData} = this.props;

    const widths = this.getWidths();

    const extraScriptNameData = {...scriptNameData, width: widths.scriptName};

    if (this.props.appLoaded) {
      return (
        <div style={{width: '100%'}}>
          <div
            style={{
              float: 'left'
              //width: widths.projectInfo,
              //overflow: 'scroll'
            }}
          >
            <ProjectInfo
              onComponentResize={projectInfoWidth => {
                this.setState({projectInfoWidth});
              }}
            />
          </div>

          <div style={{float: 'left', width: widths.scriptName}}>
            <ScriptName {...extraScriptNameData} />
          </div>

          <div style={{float: 'left', width: widths.progress}}>
            <LessonProgress width={widths.progress} />
          </div>

          {stageData.finishLink && (
            <div style={{float: 'left', width: widths.finishLink}}>
              <div className="header_finished_link">
                <a href={stageData.finishLink}>{stageData.finishText}</a>
              </div>
            </div>
          )}

          {stageData.script_stages > 1 && (
            <div style={{float: 'left', width: widths.popup}}>
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
  appLoaded: state.header.appLoaded
}))(HeaderMiddle);
