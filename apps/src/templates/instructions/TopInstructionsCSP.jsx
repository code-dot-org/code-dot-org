
import $ from 'jquery';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import {connect} from 'react-redux';
import processMarkdown from 'marked';
import renderer from "../../util/StylelessRenderer";
import TeacherOnlyMarkdown from './TeacherOnlyMarkdown';
import InlineAudio from './InlineAudio';
import ContainedLevel from '../ContainedLevel';
import PaneHeader, { PaneButton } from '../../templates/PaneHeader';
import experiments from '@cdo/apps/util/experiments';
import InstructionsTab from './InstructionsTab';
import HelpTabContents from './HelpTabContents';
import firehoseClient from '@cdo/apps/lib/util/firehose';

var instructions = require('../../redux/instructions');
var color = require("../../util/color");
var styleConstants = require('../../styleConstants');
var commonStyles = require('../../commonStyles');

var Instructions = require('./Instructions');
var CollapserIcon = require('./CollapserIcon');
var HeightResizer = require('./HeightResizer');
var msg = require('@cdo/locale');

var HEADER_HEIGHT = styleConstants['workspace-headers-height'];
var RESIZER_HEIGHT = styleConstants['resize-bar-width'];

var MIN_HEIGHT = RESIZER_HEIGHT + 60;

var styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0,
    // left handled by media queries for .editor-column
  },
  noViz: {
    left: 0,
    right: 0,
    marginRight: 0,
    marginLeft: 0
  },
  body: {
    backgroundColor: 'white',
    overflowY: 'scroll',
    paddingLeft: 10,
    paddingRight: 10,
    position: 'absolute',
    top: HEADER_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0
  },
  embedView: {
    height: undefined,
    bottom: 0
  },
  paneHeaderOverride: {
    color: color.default_text,
  },
  title: {
    textAlign: 'center',
    height: HEADER_HEIGHT,
    lineHeight: HEADER_HEIGHT + 'px'
  },
  helpTabs: {
    float: 'left',
    paddingTop: 6,
    paddingLeft: 30,
  },
  highlighted: {
    borderBottom: "2px solid " + color.default_text,
    color: color.default_text,
  },
};

var audioStyle = {
  wrapper: {
    float: 'right',
  },
  button: {
    height: 24,
    marginTop: '3px',
    marginBottom: '3px',
  },
  buttonImg: {
    lineHeight: '24px',
    fontSize: 15,
    paddingLeft: 12,
  }
};

var TopInstructions = React.createClass({
  propTypes: {
    isEmbedView: PropTypes.bool.isRequired,
    hasContainedLevels: PropTypes.bool,
    puzzleNumber: PropTypes.number.isRequired,
    stageTotal: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    expandedHeight: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
    markdown: PropTypes.string,
    collapsed: PropTypes.bool.isRequired,
    noVisualization: PropTypes.bool.isRequired,
    toggleInstructionsCollapsed: PropTypes.func.isRequired,
    setInstructionsHeight: PropTypes.func.isRequired,
    setInstructionsRenderedHeight: PropTypes.func.isRequired,
    setInstructionsMaxHeightNeeded: PropTypes.func.isRequired,
    documentationUrl: PropTypes.string,
    ttsMarkdownInstructionsUrl:  PropTypes.string,
    levelVideos: PropTypes.array,
    // TODO (epeach) - remove after resources tab A/B testing
    // provides access to script id for level data
    app: PropTypes.string,
    scriptName: PropTypes.string,
    stagePosition: PropTypes.number,
    levelPosition: PropTypes.number,
    scriptId: PropTypes.number,
    serverLevelId: PropTypes.number,
  },

  state:{
    helpTabSelected: false,
  },

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    window.addEventListener('resize', this.adjustMaxNeededHeight);

    const maxNeededHeight = this.adjustMaxNeededHeight();

    // Initially set to 300. This might be adjusted when InstructionsWithWorkspace
    // adjusts max height.
    this.props.setInstructionsRenderedHeight(Math.min(maxNeededHeight, 300));
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustMaxNeededHeight);
  },

  /**
   * Height can get below min height iff we resize the window to be super small.
   * If we then resize it to be larger again, we want to increase height.
   */
  componentWillReceiveProps(nextProps) {
    if (!nextProps.collapsed && nextProps.height < MIN_HEIGHT &&
        nextProps.height < nextProps.maxHeight) {
      this.props.setInstructionsRenderedHeight(Math.min(nextProps.maxHeight, MIN_HEIGHT));
    }
  },

  /**
   * Given a prospective delta, determines how much we can actually change the
   * height (accounting for min/max) and changes height by that much.
   * @param {number} delta
   * @returns {number} How much we actually changed
   */
  handleHeightResize: function (delta) {
    var minHeight = MIN_HEIGHT;
    var currentHeight = this.props.height;

    var newHeight = Math.max(minHeight, currentHeight + delta);
    newHeight = Math.min(newHeight, this.props.maxHeight);

    this.props.setInstructionsRenderedHeight(newHeight);
    return newHeight - currentHeight;
  },

  /**
   * Calculate how much height it would take to show top instructions with our
   * entire instructions visible and update store with this value.
   * @returns {number}
   */
  adjustMaxNeededHeight() {
    const maxNeededHeight = $(ReactDOM.findDOMNode(this.refs.instructions)).outerHeight(true) +
      HEADER_HEIGHT + RESIZER_HEIGHT;

    this.props.setInstructionsMaxHeightNeeded(maxNeededHeight);
    return maxNeededHeight;
  },

  /**
   * Handle a click of our collapser button by changing our collapse state, and
   * updating our rendered height.
   */
  handleClickCollapser() {
    const collapsed = !this.props.collapsed;
    this.props.toggleInstructionsCollapsed();

    // adjust rendered height based on next collapsed state
    if (collapsed) {
      this.props.setInstructionsRenderedHeight(HEADER_HEIGHT);
    } else {
      this.props.setInstructionsRenderedHeight(this.props.expandedHeight);
    }
  },

  /**
   * Handle a click on the Documentation PaneButton.
   */
  handleDocumentationClick() {
    const win = window.open(this.props.documentationUrl, '_blank');
    win.focus();
  },

  handleHelpTabClick() {
    this.setState({helpTabSelected: true});
    this.recordResourcesTabButtonClick();
  },

  handleInstructionTabClick() {
    this.setState({helpTabSelected: false});
  },

  //TODO - remove 'wip' from study. There for just testing purposes
  recordResourcesTabButtonClick() {
    firehoseClient.putRecord(
      'analysis-events',
      {
        study: 'instructions-resources-tab-wip-v2',
        study_group: 'resources-tab',
        event: 'resources-tab-click',
        script_id: this.props.scriptId,
        level_id: this.props.serverLevelId,
        data_json: JSON.stringify({'AppType': this.props.app, 'ScriptName': this.props.scriptName, 'StagePosition': this.props.stagePosition, 'LevelPosition': this.props.levelPosition}),
      }
    );
  },

  render() {
    const mainStyle = [
      styles.main,
      {
        height: this.props.height - RESIZER_HEIGHT
      },
      this.props.noVisualization && styles.noViz,
      this.props.isEmbedView && styles.embedView,
    ];
    const ttsUrl = this.props.ttsMarkdownInstructionsUrl;
    const videoData = this.props.levelVideos ? this.props.levelVideos[0] : [];
    const logText = JSON.stringify({'AppType': this.props.app, 'ScriptName': this.props.scriptName, 'StagePosition': this.props.stagePosition, 'LevelPosition': this.props.levelPosition});
    return (
      <div style={mainStyle} className="editor-column">
        <PaneHeader hasFocus={false}>
          <div style={styles.paneHeaderOverride}>
            {!this.state.helpTabSelected && ttsUrl &&
              <InlineAudio src={ttsUrl} style={audioStyle}/>
            }
            {this.props.documentationUrl &&
              <PaneButton
                iconClass="fa fa-book"
                label={msg.documentation()}
                isRtl={false}
                headerHasFocus={false}
                onClick={this.handleDocumentationClick}
              />}
            {experiments.isEnabled('resourcesTab') &&
              <div style={styles.helpTabs}>
                <InstructionsTab
                  className="uitest-instructionsTab"
                  onClick={this.handleInstructionTabClick}
                  style={this.state.helpTabSelected ? null : styles.highlighted}
                  text={msg.instructions()}
                />
                {this.props.levelVideos.length > 0 &&
                  <InstructionsTab
                    className="uitest-helpTab"
                    onClick={this.handleHelpTabClick}
                    style={this.state.helpTabSelected ? styles.highlighted : null}
                    text={msg.helpTips()}
                  />
                }
              </div>
            }
            {!this.props.isEmbedView &&
              <CollapserIcon
                collapsed={this.props.collapsed}
                onClick={this.handleClickCollapser}
              />}
            {!experiments.isEnabled('resourcesTab') &&
              <div style={styles.title}>
                {msg.puzzleTitle({
                  stage_total: this.props.stageTotal,
                  puzzle_number: this.props.puzzleNumber
                })}
              </div>
            }
          </div>
        </PaneHeader>
        <div style={[this.props.collapsed && commonStyles.hidden]}>
          <div style={styles.body}>
            {this.props.hasContainedLevels && <ContainedLevel ref="instructions"/>}
            {!this.props.hasContainedLevels &&
              <div ref="instructions">
                {!this.state.helpTabSelected &&
                  <Instructions
                    ref="instructions"
                    renderedMarkdown={processMarkdown(this.props.markdown,
                      { renderer })}
                    onResize={this.adjustMaxNeededHeight}
                    inTopPane
                  />
                }
                {this.state.helpTabSelected &&
                  <HelpTabContents
                    scriptId={this.props.scriptId}
                    serverLevelId={this.props.serverLevelId}
                    logText={logText}
                    videoData={videoData}
                  />
                }
                <TeacherOnlyMarkdown/>
              </div>
            }
          </div>
          {!this.props.isEmbedView &&
            <HeightResizer
              position={this.props.height}
              onResize={this.handleHeightResize}
            />}
        </div>
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isEmbedView: state.pageConstants.isEmbedView,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    puzzleNumber: state.pageConstants.puzzleNumber,
    stageTotal: state.pageConstants.stageTotal,
    height: state.instructions.renderedHeight,
    expandedHeight: state.instructions.expandedHeight,
    maxHeight: Math.min(state.instructions.maxAvailableHeight,
      state.instructions.maxNeededHeight),
    markdown: state.instructions.longInstructions,
    noVisualization: state.pageConstants.noVisualization,
    collapsed: state.instructions.collapsed,
    documentationUrl: state.pageConstants.documentationUrl,
    ttsMarkdownInstructionsUrl: state.pageConstants.ttsMarkdownInstructionsUrl,
    levelVideos: state.instructions.levelVideos,
    app: state.instructions.app,
    scriptName: state.instructions.scriptName,
    stagePosition: state.instructions.stagePosition,
    levelPosition: state.instructions.levelPosition,
    scriptId: state.instructions.scriptId,
    serverLevelId: state.instructions.serverLevelId,
  };
}, function propsFromDispatch(dispatch) {
  return {
    toggleInstructionsCollapsed() {
      dispatch(instructions.toggleInstructionsCollapsed());
    },
    setInstructionsHeight(height) {
      dispatch(instructions.setInstructionsHeight(height));
    },
    setInstructionsRenderedHeight(height) {
      dispatch(instructions.setInstructionsRenderedHeight(height));
    },
    setInstructionsMaxHeightNeeded(height) {
      dispatch(instructions.setInstructionsMaxHeightNeeded(height));
    }
  };
}, null, { withRef: true }
)(Radium(TopInstructions));
