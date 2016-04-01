'use strict';

var _ = require('../../lodash');
var color = require('../../color');
var styleConstants = require('../../styleConstants');

var processMarkdown = require('marked');

var Instructions = require('./Instructions.jsx');
var CollapserIcon = require('./CollapserIcon.jsx');
var HeightResizer = require('./HeightResizer.jsx');
var constants = require('../../constants');
var msg = require('../../locale');

var HEADER_HEIGHT = styleConstants['workspace-headers-height'];
var RESIZER_HEIGHT = styleConstants['resize-bar-width'];

// TODO - may want to be smarter about these values
var INITIAL_HEIGHT = 300;
var MAX_HEIGHT = 600;

var styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
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
    paddingRight: 10
  }
};

var TopInstructions = React.createClass({
  propTypes: {
    puzzleNumber: React.PropTypes.number.isRequired,
    stageTotal: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    markdown: React.PropTypes.string,
    collapsed: React.PropTypes.bool.isRequired,
    onToggleCollapsed: React.PropTypes.func.isRequired,
    onChangeHeight: React.PropTypes.func.isRequired,
  },

  onHeightResize: function (delta) {
    var minHeight = HEADER_HEIGHT + RESIZER_HEIGHT;
    var currentHeight = this.props.height;

    var newHeight = Math.max(minHeight, currentHeight + delta);
    newHeight = Math.min(newHeight, MAX_HEIGHT);

    this.props.onChangeHeight(newHeight);
    return newHeight - currentHeight;
  },

  componentWillMount: function () {
    if (this.props.markdown) {
      this.props.onChangeHeight(INITIAL_HEIGHT);
    }
  },

  render: function () {
    if (!this.props.markdown) {
      return <div/>;
    }
    var id = this.props.id;

    var mainStyle = _.assign({}, styles.main, {
      height: this.props.height - RESIZER_HEIGHT
    });

    var bodyStyle = _.assign({}, styles.body, {
      height: mainStyle.height - styles.header.height,
    });

    var collapseStyle = {
      display: this.props.collapsed ? 'none' : undefined
    };

    return (
      <div style={mainStyle} className="editor-column">
        <CollapserIcon
            collapsed={this.props.collapsed}
            onClick={this.props.onToggleCollapsed}/>
        <div style={styles.header}>
          {msg.puzzleTitle({
            stage_total: this.props.stageTotal,
            puzzle_number: this.props.puzzleNumber
          })}
        </div>
        <div style={collapseStyle}>
          <div style={bodyStyle}>
            <Instructions
              renderedMarkdown={processMarkdown(this.props.markdown)}
              inTopPane
              />
          </div>
          <HeightResizer
            position={mainStyle.height}
            onResize={this.onHeightResize}/>
        </div>
      </div>
    );

  }
});
module.exports = TopInstructions;
