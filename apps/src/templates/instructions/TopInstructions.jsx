'use strict';

var Radium = require('radium');
var connect = require('react-redux').connect;
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
    bottom: 0,
    // Visualization is hard-coded on embed levels. Do the same for instructions position
    left: 340
  }
};

var TopInstructions = React.createClass({
  propTypes: {
    isEmbedView: React.PropTypes.bool.isRequired,
    puzzleNumber: React.PropTypes.number.isRequired,
    stageTotal: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    markdown: React.PropTypes.string,
    collapsed: React.PropTypes.bool.isRequired,
    toggleInstructionsCollapsed: React.PropTypes.func.isRequired,
    setInstructionsHeight: React.PropTypes.func.isRequired,
    onLoadImage: React.PropTypes.func.isRequired
  },

  /**
   * Called externally
   * @returns {number} The height of the rendered contents in pixels
   */
  getContentHeight: function () {
    var instructionsContent = this.refs.instructions.refs.instructionsMarkdown;
    return $(ReactDOM.findDOMNode(instructionsContent)).outerHeight(true);
  },

  /**
   * Given a prospective delta, determines how much we can actually change the
   * height (accounting for min/max) and changes height by that much.
   * @param {number} delta
   * @returns {number} How much we actually changed
   */
  onHeightResize: function (delta) {
    var minHeight = MIN_HEIGHT;
    var currentHeight = this.props.height;

    var newHeight = Math.max(minHeight, currentHeight + delta);
    newHeight = Math.min(newHeight, this.props.maxHeight);

    this.props.setInstructionsHeight(newHeight);
    return newHeight - currentHeight;
  },

  componentDidMount: function () {
    // Parent needs to readjust some sizing after images have loaded
    $(ReactDOM.findDOMNode(this)).find('img').load(this.props.onLoadImage);
  },

  render: function () {
    if (!this.props.markdown) {
      return <div/>;
    }
    var id = this.props.id;

    var mainStyle = [styles.main, {
      height: this.props.height - RESIZER_HEIGHT
    }, this.props.isEmbedView && styles.embedView];

    return (
      <div style={mainStyle} className="editor-column">
        {!this.props.isEmbedView && <CollapserIcon
            collapsed={this.props.collapsed}
            onClick={this.props.toggleInstructionsCollapsed}/>
        }
        <div style={styles.header}>
          {msg.puzzleTitle({
            stage_total: this.props.stageTotal,
            puzzle_number: this.props.puzzleNumber
          })}
        </div>
        <div style={[this.props.collapsed && commonStyles.hidden]}>
          <div style={styles.body}>
            <Instructions
              ref="instructions"
              renderedMarkdown={processMarkdown(this.props.markdown)}
              inTopPane
              />
          </div>
          {!this.props.isEmbedView && <HeightResizer
            position={this.props.height}
            onResize={this.onHeightResize}/>
          }
        </div>
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    isEmbedView: state.level.isEmbedView,
    puzzleNumber: state.level.puzzleNumber,
    stageTotal: state.level.stageTotal,
    maxHeight: state.instructions.maxHeight,
    markdown: state.level.instructionsMarkdown,
    collapsed: state.instructions.collapsed,
  };
}, function propsFromDispatch(dispatch) {
  return {
    toggleInstructionsCollapsed: function () {
      dispatch(instructions.toggleInstructionsCollapsed());
    },
    setInstructionsHeight: function (height) {
      dispatch(instructions.setInstructionsHeight(height));
    }
  };
}, null, { withRef: true }
)(Radium(TopInstructions));
