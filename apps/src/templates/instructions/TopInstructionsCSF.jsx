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
import CollapserButton from './CollapserButton';

const VERTICAL_PADDING = 10;
const HORIZONTAL_PADDING = 20;
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const MIN_HEIGHT = RESIZER_HEIGHT + 60;

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
    marginLeft: 10,
    // don't want the right margin to apply to our button
    marginRight: -10
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
    onResize: React.PropTypes.func.isRequired
  },

  /**
   * Called externally
   * @returns {number} The height of the rendered contents in pixels
   */
  getRenderedHeight() {
    // TODO - this is getting called a LOT - prob bc blockly?
    var instructionsContent = this.refs.instructions.refs.instructionsMarkdown;
    return $(ReactDOM.findDOMNode(instructionsContent)).outerHeight(true) + 2 * VERTICAL_PADDING;
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

  // TODO - could have some of this as a HOC?
  componentDidMount: function () {
    // Parent needs to readjust some sizing after images have loaded
    $(ReactDOM.findDOMNode(this)).find('img').load(this.props.onResize);

    $('details').on({
      'toggle.details.TopInstructions': () => {
        this.props.onResize();
      }
    });
  },

  componentWillUnmount() {
    $('details').off('toggle.details.TopInstructions');
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
        <div>
          <div style={styles.body}>
            <CollapserButton
                style={styles.collapserButton}
                collapsed={this.props.collapsed}
                onClick={this.props.toggleInstructionsCollapsed}/>
              <span style={[this.props.collapsed && commonStyles.hidden]}>
              <Instructions
                  ref="instructions"
                  renderedMarkdown={processMarkdown(this.props.markdown)}
                  inTopPane
              />
            </span>
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
    isEmbedView: state.pageConstants.isEmbedView,
    puzzleNumber: state.pageConstants.puzzleNumber,
    stageTotal: state.pageConstants.stageTotal,
    maxHeight: state.instructions.maxHeight,
    markdown: state.pageConstants.instructionsMarkdown,
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
