/* eslint-disable react/no-danger */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import {connect} from 'react-redux';
var actions = require('../../applab/actions');
var instructions = require('../../redux/instructions');
import { openDialog } from '../../redux/instructionsDialog';
var color = require('../../color');
var styleConstants = require('../../styleConstants');
var commonStyles = require('../../commonStyles');

var processMarkdown = require('marked');

var Instructions = require('./Instructions');
var CollapserIcon = require('./CollapserIcon');
var HeightResizer = require('./HeightResizer');
var constants = require('../../constants');
var msg = require('../../locale');
import CollapserButton from './CollapserButton';
import ScrollButtons from './ScrollButtons';
import ThreeColumns from './ThreeColumns';
import PromptIcon from './PromptIcon';
import HintPrompt from './HintPrompt';
import InlineFeedback from './InlineFeedback';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';

import { getOuterHeight, scrollBy } from './utils';

const VERTICAL_PADDING = 10;
const HORIZONTAL_PADDING = 20;
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const PROMPT_ICON_WIDTH = 60; // 50 + 10 for padding
const AUTHORED_HINTS_EXTRA_WIDTH = 30; // 40 px, but 10 overlap with prompt icon
const VIZ_TO_INSTRUCTIONS_MARGIN = 20;

const SCROLL_BY_PERCENT = 0.4;

// Minecraft-specific styles
const craftStyles = {
  main: {
    marginTop: 20,
    marginBottom: 10
  },
  body: {
    // $below-header-background from craft/style.scss
    backgroundColor: '#646464'
  },
  instructionsChatBubble: {
    backgroundColor: '#3B3B3B',
    borderRadius: 4
  },
  instructionsChatText: {
    color: 'white'
  },
};

const styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0,
    // left handled by media queries for .editor-column
  },
  mainRtl: {
    position: 'absolute',
    marginRight: 15,
    top: 0,
    left: 0,
    // right handled by media queries for .editor-column
  },
  noViz: {
    left: 0,
    right: 0,
    marginRight: 0,
    marginLeft: 0
  },
  body: {
    backgroundColor: '#ddd',
    borderRadius: 5,
    width: '100%',
  },
  leftCol: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    marginLeft: 0
  },
  embedView: {
    height: undefined,
    bottom: 0
  },
  secondaryInstructions: {
    fontSize: 12,
    color: '#5b6770'
  },
  collapserButton: {
    position: 'absolute',
    right: 0,
    marginTop: 5,
    marginRight: 5
  },
  scrollButtons: {
    position: 'relative',
    top: 50,
    left: 25
  },
  // bubble has pointer cursor by default. override that if no hints
  noAuthoredHints: {
    cursor: 'default',
    marginBottom: 0
  },
  authoredHints: {
    // raise by 20 so that the lightbulb "floats" without causing the original
    // icon to move. This strangeness happens in part because prompt-icon-cell
    // is managed outside of React
    marginBottom: 0
  },
  containedLevelContainer: {
    minHeight: 200,
  },
  instructions: {
    padding: '5px 0'
  },
  instructionsChatBubble: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  instructionsChatText: {
    // note that we actually do need to specify lineHeight
    // in pixels; it defaults to a multiple of fontSize
    lineHeight: '25px',
    fontSize: 16,
    color: 'black',
    margin: 0
  },
};

var TopInstructions = React.createClass({
  propTypes: {
    isEmbedView: React.PropTypes.bool.isRequired,
    embedViewLeftOffset: React.PropTypes.number.isRequired,
    isMinecraft: React.PropTypes.bool.isRequired,
    hasContainedLevels: React.PropTypes.bool,
    aniGifURL: React.PropTypes.string,
    height: React.PropTypes.number.isRequired,
    expandedHeight: React.PropTypes.number.isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    collapsed: React.PropTypes.bool.isRequired,
    shortInstructions: React.PropTypes.string.isRequired,
    shortInstructions2: React.PropTypes.string,
    longInstructions: React.PropTypes.string,
    feedback: React.PropTypes.shape({
      message: React.PropTypes.string.isRequired,
    }),
    hasAuthoredHints: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    smallStaticAvatar: React.PropTypes.string,
    inputOutputTable: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),
    noVisualization: React.PropTypes.bool.isRequired,

    toggleInstructionsCollapsed: React.PropTypes.func.isRequired,
    setInstructionsHeight: React.PropTypes.func.isRequired,
    setInstructionsRenderedHeight: React.PropTypes.func.isRequired,
    setInstructionsMaxHeightNeeded: React.PropTypes.func.isRequired,
    showInstructionsDialog: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      rightColWidth: 90,
      promptForHint: false
    };
  },

  componentDidUpdate(prevProps) {
    // Update right col width now that we know how much space it needs, and
    // rerender if it has changed. One thing to note is that if we end up
    // resizing our column significantly, it can result in our maxNeededHeight
    // being inaccurate. This isn't that big a deal except that it means when we
    // adjust maxNeededHeight below, it might not be as large as we want.
    const width = $(ReactDOM.findDOMNode(this.refs.collapser)).outerWidth(true);
    if (width !== this.state.rightColWidth) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        rightColWidth: width
      });
    }

    const gotNewFeedback = this.props.feedback && !prevProps.feedback;
    if (gotNewFeedback) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        promptForHint: false
      });
      if (this.props.collapsed) {
        this.handleClickCollapser();
      }
    }

    this.adjustMaxNeededHeight();
    if (this.props.feedback || this.state.promptForHint) {
      this.scrollInstructionsToBottom();
    }
  },

  /**
   * Calculate our initial height (based off of rendered height of instructions)
   */
  componentDidMount() {
    window.addEventListener('resize', this.adjustMaxNeededHeight);

    // Might want to increase the size of our instructions after our icon image
    // has loaded, to make sure the image fits
    $(ReactDOM.findDOMNode(this.refs.icon)).load(function () {
      const minHeight = this.getMinHeight();
      if (this.props.height < minHeight) {
        this.props.setInstructionsRenderedHeight(minHeight);
      }
    }.bind(this));

    const maxNeededHeight = this.adjustMaxNeededHeight();

    // Initially set to 300. This might be adjusted when InstructionsWithWorkspace
    // adjusts max height.
    this.props.setInstructionsRenderedHeight(Math.min(maxNeededHeight, 300));
  },

  /**
   * When collapsed, height can change when we get additional feedback
   * or the hint prompt. In that case, we want to always resize.
   * When in resize mode, height can get below min height iff we resize
   * the window to be super small.  If we then resize it to be larger
   * again, we want to increase height.
   */
  componentWillReceiveProps(nextProps) {
    const minHeight = this.getMinHeight(nextProps.collapsed);
    const newHeight = Math.min(nextProps.maxHeight, minHeight);

    const shouldUpdateHeight = (nextProps.collapsed) ?
        newHeight !== this.props.height :
        nextProps.height < minHeight && nextProps.height < nextProps.maxHeight;

    if (shouldUpdateHeight) {
      this.props.setInstructionsRenderedHeight(newHeight);
    }
  },

  /**
   * @param {boolean} collapsed whether or not the height should be
   * caluclated as if the instructions are collapsed. Defaults to
   * current collapsed state.
   * @returns {number} The minimum height of the top instructions (which is just
   * the height of the little icon and the height of the resizer if we're not
   * collapsed
   */
  getMinHeight(collapsed=this.props.collapsed) {
    const collapseButtonHeight = getOuterHeight(this.refs.collapser, true);
    const scrollButtonsHeight = (!collapsed && this.refs.scrollButtons) ?
        this.refs.scrollButtons.getMinHeight() : 0;

    const minIconHeight = this.refs.icon ?
      getOuterHeight(this.refs.icon, true) : 0;
    const minInstructionsHeight = this.props.collapsed ?
      getOuterHeight(this.refs.instructions, true) : 0;

    const domNode = $(ReactDOM.findDOMNode(this));
    const margins = domNode.outerHeight(true) - domNode.outerHeight(false);

    const leftColHeight = minIconHeight;
    const middleColHeight = minInstructionsHeight;
    const rightColHeight = collapseButtonHeight + scrollButtonsHeight;

    return Math.max(leftColHeight, middleColHeight, rightColHeight) +
        RESIZER_HEIGHT + margins;
  },

  /**
   * Given a prospective delta, determines how much we can actually change the
   * height (accounting for min/max) and changes height by that much.
   * @param {number} delta
   * @returns {number} How much we actually changed
   */
  handleHeightResize: function (delta) {
    const minHeight = this.getMinHeight();
    const currentHeight = this.props.height;

    let newHeight = Math.max(minHeight, currentHeight + delta);
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
    const minHeight = this.getMinHeight();
    const contentContainer = this.props.hasContainedLevels ?
        this.refs.containedLevelContainer : this.refs.instructions;
    const instructionsContent = this.refs.instructions;
    const maxNeededHeight = getOuterHeight(instructionsContent, true) +
      (this.props.collapsed ? 0 : RESIZER_HEIGHT);

    this.props.setInstructionsMaxHeightNeeded(Math.max(minHeight, maxNeededHeight));
    return maxNeededHeight;
  },

  /**
   * Handle a click to our collapser icon by changing our collapse state, and
   * updating our rendered height.
   */
  handleClickCollapser() {
    const nextCollapsed = !this.props.collapsed;
    this.props.toggleInstructionsCollapsed();

    // adjust rendered height based on next collapsed state
    if (nextCollapsed) {
      this.props.setInstructionsRenderedHeight(this.getMinHeight(nextCollapsed));
    } else {
      this.props.setInstructionsRenderedHeight(this.props.expandedHeight);
    }
  },

  /**
   * Handle an onWheel event inside instructions. Manually scroll it,
   * since we are overriding default scroll functionality.
   * @param {WheelEvent} wheelEvent
   */
  handleInstructionsWheel(wheelEvent) {
    const contentContainer = this.refs.instructions.parentElement;
    scrollBy(contentContainer, wheelEvent.deltaY);
  },

  /**
   * Handle a click to our "scroll up" button
   */
  handleScrollInstructionsUp() {
    const contentContainer = this.refs.instructions.parentElement;
    const contentHeight = contentContainer.scrollHeight;
    scrollBy(contentContainer, contentHeight * -1 * SCROLL_BY_PERCENT);
  },

  /**
   * Handle a click to our "scroll down" button
   */
  handleScrollInstructionsDown() {
    const contentContainer = this.refs.instructions.parentElement;
    const contentHeight = contentContainer.scrollHeight;
    scrollBy(contentContainer, contentHeight * SCROLL_BY_PERCENT);
  },

  /**
   * Manually scroll instructions to bottom
   */
  scrollInstructionsToBottom() {
    const contentContainer = this.refs.instructions.parentElement;
    const contentHeight = contentContainer.scrollHeight;
    scrollBy(contentContainer, contentHeight);
  },

  /**
   * Handle a click to the hint display bubble (lightbulb)
   */
  handleClickBubble() {
    // If we don't have authored hints, clicking bubble shouldnt do anything
    if (this.props.hasAuthoredHints) {
      this.setState({
        promptForHint: true
      });
      if (this.props.collapsed) {
        this.handleClickCollapser();
      }
    }
  },

  dismissHintPrompt() {
    this.setState({
      promptForHint: false
    });
  },

  showHint() {
    this.dismissHintPrompt();
    this.props.showInstructionsDialog();
  },

  shouldDisplayHintPrompt() {
    return this.state && this.state.promptForHint && !this.props.collapsed;
  },

  render: function () {
    const resizerHeight = (this.props.collapsed ? 0 : RESIZER_HEIGHT);

    const mainStyle = [
      this.props.isRtl ? styles.mainRtl : styles.main,
      {
        height: this.props.height - resizerHeight
      },
      this.props.isEmbedView && Object.assign({}, styles.embedView, {
        left: this.props.embedViewLeftOffset
      }),
      this.props.noVisualization && styles.noViz,
      this.props.isMinecraft && craftStyles.main
    ];

    const atMaxHeight = this.props.height === this.props.maxHeight;

    const renderedMarkdown = processMarkdown((this.props.collapsed || !this.props.longInstructions) ?
      this.props.shortInstructions : this.props.longInstructions);

    // Only used by star wars levels
    const instructions2 = this.props.shortInstructions2 ? processMarkdown(
      this.props.shortInstructions2) : undefined;

    const leftColWidth = (this.props.smallStaticAvatar ? PROMPT_ICON_WIDTH : 10) +
      (this.props.hasAuthoredHints ? AUTHORED_HINTS_EXTRA_WIDTH : 0);

    return (
      <div style={mainStyle} className="editor-column">
        <ThreeColumns
          styles={{
            container: [styles.body, this.props.isMinecraft && craftStyles.body],
            left: styles.leftCol
          }}
          leftColWidth={leftColWidth}
          rightColWidth={this.state.rightColWidth}
          height={this.props.height - resizerHeight}
        >
          <div
            style={[
              commonStyles.bubble,
              this.props.hasAuthoredHints ? styles.authoredHints : styles.noAuthoredHints
            ]}
          >
            <ProtectedStatefulDiv
              id="bubble"
              className="prompt-icon-cell"
              onClick={this.handleClickBubble}
            >
              {this.props.smallStaticAvatar &&
                <PromptIcon src={this.props.smallStaticAvatar} ref="icon"/>
              }
            </ProtectedStatefulDiv>
          </div>
          <div
            ref="instructions"
            onWheel={this.handleInstructionsWheel}
            style={styles.instructions}
          >
            <div style={[styles.instructionsChatBubble, this.props.isMinecraft && craftStyles.instructionsChatBubble]}>
              {this.props.hasContainedLevels &&
                <ProtectedStatefulDiv
                  id="containedLevelContainer"
                  ref="containedLevelContainer"
                  style={styles.containedLevelContainer}
                />}
              {!this.props.hasContainedLevels &&
                <Instructions
                  ref="instructions"
                  renderedMarkdown={renderedMarkdown}
                  onResize={this.adjustMaxNeededHeight}
                  inputOutputTable={this.props.collapsed ? undefined : this.props.inputOutputTable}
                  aniGifURL={this.props.aniGifURL}
                  inTopPane
                />}
              {!this.props.hasContainedLevels && this.props.collapsed && instructions2 &&
                <div
                  style={styles.secondaryInstructions}
                  dangerouslySetInnerHTML={{ __html: instructions2 }}
                />}
            </div>
            {this.props.feedback && !this.props.collapsed &&
              <InlineFeedback
                styles={{
                  container: [styles.instructionsChatBubble, this.props.isMinecraft && craftStyles.instructionsChatBubble],
                  message: [styles.instructionsChatText, this.props.isMinecraft && craftStyles.instructionsChatText]
                }}
                message={this.props.feedback.message}
              />}
            {this.shouldDisplayHintPrompt() &&
              <HintPrompt
                styles={{
                  container: [styles.instructionsChatBubble, this.props.isMinecraft && craftStyles.instructionsChatBubble],
                  message: [styles.instructionsChatText, this.props.isMinecraft && craftStyles.instructionsChatText]
                }}
                onConfirm={this.showHint}
                onDismiss={this.dismissHintPrompt}
              />}
          </div>
          <div>
            <CollapserButton
              ref="collapser"
              style={[styles.collapserButton, !this.props.longInstructions && !this.props.feedback && commonStyles.hidden]}
              collapsed={this.props.collapsed}
              onClick={this.handleClickCollapser}
            />
            {!this.props.collapsed &&
              <ScrollButtons
                style={styles.scrollButtons}
                ref="scrollButtons"
                onScrollUp={this.handleScrollInstructionsUp}
                onScrollDown={this.handleScrollInstructionsDown}
                visible={!atMaxHeight}
                height={this.props.height - styles.scrollButtons.top - resizerHeight}
              />}
          </div>
        </ThreeColumns>
        {!this.props.collapsed && !this.props.isEmbedView &&
          <HeightResizer
            position={this.props.height}
            onResize={this.handleHeightResize}
          />}
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isEmbedView: state.pageConstants.isEmbedView,
    embedViewLeftOffset: state.pageConstants.nonResponsiveVisualizationColumnWidth + VIZ_TO_INSTRUCTIONS_MARGIN,
    isMinecraft: !!state.pageConstants.isMinecraft,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    aniGifURL: state.pageConstants.aniGifURL,
    height: state.instructions.renderedHeight,
    expandedHeight: state.instructions.expandedHeight,
    maxHeight: Math.min(state.instructions.maxAvailableHeight,
      state.instructions.maxNeededHeight),
    collapsed: state.instructions.collapsed,
    shortInstructions: state.instructions.shortInstructions,
    shortInstructions2: state.instructions.shortInstructions2,
    longInstructions: state.instructions.longInstructions,
    hasAuthoredHints: state.instructions.hasAuthoredHints,
    feedback: state.instructions.feedback,
    isRtl: state.pageConstants.localeDirection === 'rtl',
    smallStaticAvatar: state.pageConstants.smallStaticAvatar,
    inputOutputTable: state.pageConstants.inputOutputTable,
    noVisualization: state.pageConstants.noVisualization
  };
}, function propsFromDispatch(dispatch) {
  return {
    toggleInstructionsCollapsed: function () {
      dispatch(instructions.toggleInstructionsCollapsed());
    },
    setInstructionsHeight: function (height) {
      dispatch(instructions.setInstructionsHeight(height));
    },
    setInstructionsRenderedHeight(height) {
      dispatch(instructions.setInstructionsRenderedHeight(height));
    },
    setInstructionsMaxHeightNeeded(height) {
      dispatch(instructions.setInstructionsMaxHeightNeeded(height));
    },
    showInstructionsDialog(height) {
      dispatch(openDialog({
        autoClose: false,
        showHints: true,
        aniGifOnly: false,
        hintsOnly: true
      }));
    }
  };
}, null, { withRef: true }
)(Radium(TopInstructions));
