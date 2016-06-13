'use strict';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import {connect} from 'react-redux';
var actions = require('../../applab/actions');
var instructions = require('../../redux/instructions');
var color = require('../../color');
var styleConstants = require('../../styleConstants');
var commonStyles = require('../../commonStyles');

var processMarkdown = require('marked');

var Instructions = require('./Instructions');
import MarkdownInstructions from './MarkdownInstructions';
var CollapserIcon = require('./CollapserIcon');
var HeightResizer = require('./HeightResizer');
var constants = require('../../constants');
var msg = require('../../locale');
import CollapserButton from './CollapserButton';
import ThreeColumns from './ThreeColumns';
import PromptIcon from './PromptIcon';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';

const VERTICAL_PADDING = 10;
const HORIZONTAL_PADDING = 20;
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const PROMPT_ICON_WIDTH = 60; // 50 + 10 for padding
const AUTHORED_HINTS_EXTRA_WIDTH = 30; // 40 px, but 10 overlap with prompt icon

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
  body: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
  },
  embedView: {
    height: undefined,
    bottom: 0,
    // Visualization is hard-coded on embed levels. Do the same for instructions position
    left: 340
  },
  collapserButton: {
    position: 'absolute',
    right: 0,
    marginTop: 5,
    marginRight: 5
  },
  // bubble has pointer cursor by default. override that if no hints
  noAuthoredHints: {
    cursor: 'default'
  },
  authoredHints: {
    // raise by 20 so that the lightbulb "floats" without causing the original
    // icon to move. This strangeness happens in part because prompt-icon-cell
    // is managed outside of React
    marginTop: -20
  },
  secondaryInstructions: {
    fontSize: 12,
    color: '#5b6770'
  }
};

var TopInstructions = React.createClass({
  propTypes: {
    isEmbedView: React.PropTypes.bool.isRequired,
    height: React.PropTypes.number.isRequired,
    expandedHeight: React.PropTypes.number.isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    collapsed: React.PropTypes.bool.isRequired,
    shortInstructions: React.PropTypes.string.isRequired,
    shortInstructions2: React.PropTypes.string,
    longInstructions: React.PropTypes.string,
    hasAuthoredHints: React.PropTypes.bool.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    smallStaticAvatar: React.PropTypes.string,
    inputOutputTable: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),

    toggleInstructionsCollapsed: React.PropTypes.func.isRequired,
    setInstructionsHeight: React.PropTypes.func.isRequired,
    setInstructionsRenderedHeight: React.PropTypes.func.isRequired,
    setInstructionsMaxHeightNeeded: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return { rightColWidth: 90 };
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

    // Update right col width now that we know how much space it needs. One thing
    // to note is that if we end up resizing our column significantly, it can
    // result in our maxNeededHeight being inaccurate. This isn't that big a deal
    // except that it means when we set instructionsRenderedHeight below, it might
    // not be as large as we want.
    this.setState({
      rightColWidth: $(ReactDOM.findDOMNode(this.refs.collapser)).outerWidth(true)
    });

    // Initially set to 300. This might be adjusted when InstructionsWithWorkspace
    // adjusts max height.
    this.props.setInstructionsRenderedHeight(Math.min(maxNeededHeight, 300));
  },

  /**
   * Height can get below min height iff we resize the window to be super small.
   * If we then resize it to be larger again, we want to increase height.
   */
  componentWillReceiveProps(nextProps) {
    const minHeight = this.getMinHeight();
    if (nextProps.height < minHeight && nextProps.height < nextProps.maxHeight) {
      this.props.setInstructionsRenderedHeight(Math.min(nextProps.maxHeight, minHeight));
    }
  },

  /**
   * @returns {number} The minimum height of the top instructions (which is just
   * the height of the little icon and the height of the resizer if we're not
   * collapsed
   */
  getMinHeight() {
    const buttonHeight = $(ReactDOM.findDOMNode(this.refs.collapser)).outerHeight(true);
    const minIconHeight = this.refs.icon ?
      $(ReactDOM.findDOMNode(this.refs.icon)).outerHeight(true) : 0;
    const minInstructionsHeight = this.props.collapsed ?
      $(ReactDOM.findDOMNode(this.refs.instructions)).outerHeight(true) : 0;

    return Math.max(buttonHeight, minIconHeight, minInstructionsHeight) +
      (this.props.collapsed ? 0 : RESIZER_HEIGHT);
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

    const instructionsContent = this.refs.instructions;
    const maxNeededHeight = $(ReactDOM.findDOMNode(instructionsContent)).outerHeight(true) +
      RESIZER_HEIGHT;

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
      this.props.setInstructionsRenderedHeight(this.getMinHeight());
    } else {
      this.props.setInstructionsRenderedHeight(this.props.expandedHeight);
    }
  },

  render: function () {
    const resizerHeight = (this.props.collapsed ? 0 : RESIZER_HEIGHT);

    const mainStyle = [
      this.props.isRtl ? styles.mainRtl : styles.main,
      {
        height: this.props.height - resizerHeight
      },
      this.props.isEmbedView && styles.embedView
    ];

    const renderedMarkdown = processMarkdown(this.props.collapsed ?
      this.props.shortInstructions : this.props.longInstructions);

    // TODO - think about what long/short means here
    // TODO - sizing issues
    // Only used by star wars levels
    const instructions2 = this.props.shortInstructions2 ? processMarkdown(
      this.props.shortInstructions2) : undefined;

    const leftColWidth = (this.props.smallStaticAvatar ? PROMPT_ICON_WIDTH : 10) +
      (this.props.hasAuthoredHints ? AUTHORED_HINTS_EXTRA_WIDTH : 0);

    return (
      <div style={mainStyle} className="editor-column">
        <ThreeColumns
            style={styles.body}
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
            <ProtectedStatefulDiv id="bubble" className="prompt-icon-cell">
              {this.props.smallStaticAvatar &&
                <PromptIcon src={this.props.smallStaticAvatar} ref='icon'/>
              }
            </ProtectedStatefulDiv>
          </div>
          <div ref="instructions">
            <Instructions
                renderedMarkdown={renderedMarkdown}
                onResize={this.adjustMaxNeededHeight}
                inputOutputTable={this.props.collapsed ? undefined : this.props.inputOutputTable}
                inTopPane
            />
            {this.props.collapsed && instructions2 &&
              <div
                style={[
                  styles.secondaryInstructions
                ]}
                dangerouslySetInnerHTML={{ __html: instructions2 }}
              />
            }
          </div>
          <CollapserButton
              ref='collapser'
              style={[styles.collapserButton, !this.props.longInstructions && commonStyles.hidden]}
              collapsed={this.props.collapsed}
              onClick={this.handleClickCollapser}
          />
        </ThreeColumns>
        {!this.props.collapsed && !this.props.isEmbedView && <HeightResizer
          position={this.props.height}
          onResize={this.handleHeightResize}/>
        }
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isEmbedView: state.pageConstants.isEmbedView,
    height: state.instructions.renderedHeight,
    expandedHeight: state.instructions.expandedHeight,
    maxHeight: Math.min(state.instructions.maxAvailableHeight,
      state.instructions.maxNeededHeight),
    collapsed: state.instructions.collapsed,
    shortInstructions: state.instructions.shortInstructions,
    shortInstructions2: state.instructions.shortInstructions2,
    longInstructions: state.instructions.longInstructions,
    hasAuthoredHints: state.instructions.hasAuthoredHints,
    isRtl: state.pageConstants.localeDirection === 'rtl',
    smallStaticAvatar: state.pageConstants.smallStaticAvatar,
    inputOutputTable: state.pageConstants.inputOutputTable
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
    }
  };
}, null, { withRef: true }
)(Radium(TopInstructions));
