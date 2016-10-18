
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import {connect} from 'react-redux';
import processMarkdown from 'marked';
import renderer from '../../StylelessRenderer';
var instructions = require('../../redux/instructions');
var color = require('../../color');
var styleConstants = require('../../styleConstants');
var commonStyles = require('../../commonStyles');

var Instructions = require('./Instructions');
var CollapserIcon = require('./CollapserIcon');
var HeightResizer = require('./HeightResizer');
var msg = require('@cdo/locale');
var PaneButton = require('../PaneHeader').PaneButton;
import ContainedLevel from '../ContainedLevel';

var HEADER_HEIGHT = styleConstants['workspace-headers-height'];
var RESIZER_HEIGHT = styleConstants['resize-bar-width'];
const VIZ_TO_INSTRUCTIONS_MARGIN = 20;

var MIN_HEIGHT = RESIZER_HEIGHT + 60;

var styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0,
    // left handled by media queries for .editor-column
  },
  header: {
    height: HEADER_HEIGHT,
    lineHeight: HEADER_HEIGHT + 'px',
    fontFamily: '"Gotham 4r"',
    backgroundColor: color.lighter_purple,
    textAlign: 'center'
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
  }
};

var TopInstructions = React.createClass({
  propTypes: {
    isEmbedView: React.PropTypes.bool.isRequired,
    embedViewLeftOffset: React.PropTypes.number.isRequired,
    hasContainedLevels: React.PropTypes.bool,
    puzzleNumber: React.PropTypes.number.isRequired,
    stageTotal: React.PropTypes.number.isRequired,
    versionHistoryInInstructionsHeader: React.PropTypes.bool,
    height: React.PropTypes.number.isRequired,
    expandedHeight: React.PropTypes.number.isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    markdown: React.PropTypes.string,
    collapsed: React.PropTypes.bool.isRequired,
    toggleInstructionsCollapsed: React.PropTypes.func.isRequired,
    setInstructionsHeight: React.PropTypes.func.isRequired,
    setInstructionsRenderedHeight: React.PropTypes.func.isRequired,
    setInstructionsMaxHeightNeeded: React.PropTypes.func.isRequired
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

  render() {
    const mainStyle = [
      styles.main,
      {
        height: this.props.height - RESIZER_HEIGHT
      },
      this.props.isEmbedView && Object.assign({}, styles.embedView, {
        left: this.props.embedViewLeftOffset
      })
    ];

    return (
      <div style={mainStyle} className="editor-column">
        {!this.props.isEmbedView &&
          <CollapserIcon
            collapsed={this.props.collapsed}
            onClick={this.handleClickCollapser}
          />}
        <div style={styles.header}>
          {msg.puzzleTitle({
            stage_total: this.props.stageTotal,
            puzzle_number: this.props.puzzleNumber
          })}
          {this.props.versionHistoryInInstructionsHeader &&
            <PaneButton
              id="versions-header"
              headerHasFocus={false}
              iconClass="fa fa-clock-o"
              label={msg.showVersionsHeader()}
              isRtl={false}
            />}
        </div>
        <div style={[this.props.collapsed && commonStyles.hidden]}>
          <div style={styles.body}>
            {this.props.hasContainedLevels && <ContainedLevel ref="instructions"/>}
            {!this.props.hasContainedLevels &&
              <Instructions
                ref="instructions"
                renderedMarkdown={processMarkdown(this.props.markdown,
                    { renderer })}
                onResize={this.adjustMaxNeededHeight}
                inTopPane
              />}
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
    embedViewLeftOffset: state.pageConstants.nonResponsiveVisualizationColumnWidth + VIZ_TO_INSTRUCTIONS_MARGIN,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    versionHistoryInInstructionsHeader: state.pageConstants.versionHistoryInInstructionsHeader,
    puzzleNumber: state.pageConstants.puzzleNumber,
    stageTotal: state.pageConstants.stageTotal,
    height: state.instructions.renderedHeight,
    expandedHeight: state.instructions.expandedHeight,
    maxHeight: Math.min(state.instructions.maxAvailableHeight,
      state.instructions.maxNeededHeight),
    markdown: state.instructions.longInstructions,
    collapsed: state.instructions.collapsed
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
