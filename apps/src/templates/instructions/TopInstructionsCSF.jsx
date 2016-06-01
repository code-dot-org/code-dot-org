'use strict';

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
var CollapserIcon = require('./CollapserIcon');
var HeightResizer = require('./HeightResizer');
var constants = require('../../constants');
var msg = require('../../locale');
import CollapserButton from './CollapserButton';

const VERTICAL_PADDING = 10;
const HORIZONTAL_PADDING = 20;
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    top: 0,
    right: 0,
    // left handled by media queries for .editor-column
  },
  body: {
    backgroundColor: 'white',
    overflowY: 'scroll',
    paddingTop: VERTICAL_PADDING,
    paddingBottom: VERTICAL_PADDING,
    paddingLeft: HORIZONTAL_PADDING,
    paddingRight: HORIZONTAL_PADDING,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 10
  },
  embedView: {
    height: undefined,
    bottom: 0,
    // Visualization is hard-coded on embed levels. Do the same for instructions position
    left: 340
  },
  collapserButton: {
    float: 'right',
    height: 42,
    marginLeft: 10,
    // don't want the right margin to apply to our button
    marginRight: -10,
    marginTop: 5,
    marginBottom: 5
  }
};

const COLLAPSED_HEIGHT = styles.collapserButton.height +
  styles.collapserButton.marginTop +
  styles.collapserButton.marginBottom +
  2 * VERTICAL_PADDING;

const MIN_HEIGHT = COLLAPSED_HEIGHT;

var TopInstructions = React.createClass({
  propTypes: {
    isEmbedView: React.PropTypes.bool.isRequired,
    height: React.PropTypes.number.isRequired,
    expandedHeight: React.PropTypes.number.isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    collapsed: React.PropTypes.bool.isRequired,
    shortInstructions: React.PropTypes.string.isRequired,
    longInstructions: React.PropTypes.string,

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

  /**
   * Height can get below min height iff we resize the window to be super small.
   * If we then resize it to be larger again, we want to increase height.
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.height < MIN_HEIGHT && nextProps.height < nextProps.maxHeight) {
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
    const instructionsContent = this.refs.instructions;
    const maxNeededHeight = $(ReactDOM.findDOMNode(instructionsContent)).outerHeight(true) +
      RESIZER_HEIGHT;

    this.props.setInstructionsMaxHeightNeeded(Math.max(MIN_HEIGHT, maxNeededHeight));
    return maxNeededHeight;
  },

  /**
   * Handle a click to our collapser icon by changing our collapse state, and
   * updating our rendered height.
   */
  handleClickCollapser() {
    const collapsed = !this.props.collapsed;
    this.props.toggleInstructionsCollapsed();

    // adjust rendered height based on next collapsed state
    if (collapsed) {
      this.props.setInstructionsRenderedHeight(COLLAPSED_HEIGHT);
    } else {
      this.props.setInstructionsRenderedHeight(this.props.expandedHeight);
    }
  },

  render: function () {
    const resizerHeight = (this.props.collapsed ? 0 : RESIZER_HEIGHT);

    const mainStyle = [styles.main, {
      height: this.props.height
    }, this.props.isEmbedView && styles.embedView];

    const renderedMarkdown = processMarkdown(this.props.collapsed ?
      this.props.shortInstructions : this.props.longInstructions);

    return (
      <div style={mainStyle} className="editor-column">
        <div>
          <div style={styles.body}>
            {this.props.longInstructions && <CollapserButton
                style={styles.collapserButton}
                collapsed={this.props.collapsed}
                onClick={this.handleClickCollapser}/>
            }
            {<Instructions
                ref="instructions"
                renderedMarkdown={renderedMarkdown}
                onResize={this.props.onResize}
                inTopPane
            />
            }
          </div>
          {!this.props.collapsed && !this.props.isEmbedView && <HeightResizer
            position={this.props.height}
            onResize={this.handleHeightResize}/>
          }
        </div>
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
    longInstructions: state.instructions.longInstructions
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
