import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {getStore} from '../../redux';
import ScriptName from '@cdo/apps/code-studio/components/header/ScriptName';
import ProjectInfo from '@cdo/apps/code-studio/components/header/ProjectInfo';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import _ from 'lodash';

import LessonProgress, {
  getFullWidthForLevels
} from '../progress/LessonProgress.jsx';

export default class HeaderMiddle extends React.Component {
  static propTypes = {
    scriptNameData: PropTypes.object.isRequired,
    stageData: PropTypes.object.isRequired,
    children: PropTypes.node
  };

  state = {
    width: -1
  };

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

  updateLayout = () => {
    //console.log(this.refs.header_middle_parent.clientWidth);
    //this.setState({width: this.refs.header_middle_parent.clientWidth});
    console.log($('.header_middle').width());
    this.setState({width: $('.header_middle').width()});
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
    const width = this.state.width;
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

    return (
      <div ref="header_middle_parent" style={{width: '100%'}}>
        <Provider store={getStore()}>
          <ProjectInfo />
        </Provider>

        <div style={{float: 'left', width: widths.scriptName}}>
          <Provider store={getStore()}>
            <ScriptName {...scriptNameData} />
          </Provider>
        </div>

        <div style={{float: 'left', width: widths.progress}}>
          {/*<div className="progress_container">{children}</div>*/}
          <Provider store={getStore()}>
            <LessonProgress width={widths.progress} />
          </Provider>
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
  }
}
