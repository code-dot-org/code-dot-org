'use strict';

var _ = require('lodash');
var color = require('../../color');

var Instructions = require('./Instructions.jsx');
var CollapserIcon = require('./CollapserIcon.jsx');
var HeightResizer = require('./HeightResizer.jsx');

// TODO These numbers are defined in style-constants.scss. Do the same sort
// of thing we did with colors
var HEADER_HEIGHT = 30;
var RESIZER_HEIGHT = 13;

var styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    right: 0,
    // left handled by media queries for .workspace-right
  },
  header: {
    height: HEADER_HEIGHT,
    lineHeight: '30px',
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
    height: React.PropTypes.number.isRequired,
    markdown: React.PropTypes.string.isRequired,
    collapsed: React.PropTypes.bool.isRequired,
    onToggleCollapsed: React.PropTypes.func.isRequired,
    onChangeHeight: React.PropTypes.func.isRequired,
  },

  onHeightResize: function (delta) {
    var minHeight = HEADER_HEIGHT + RESIZER_HEIGHT;
    var currentHeight = this.props.height;
    // TODO - make this number less arbitrary?
    var maxHeight = 600;

    var newHeight = Math.max(minHeight, currentHeight + delta);
    newHeight = Math.min(newHeight, maxHeight);

    this.props.onChangeHeight(newHeight);
    return newHeight - currentHeight;
  },

  render: function () {
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
      <div style={mainStyle} className="workspace-right">
        <CollapserIcon
            collapsed={this.props.collapsed}
            onClick={this.props.onToggleCollapsed}/>
        <div style={styles.header}>
          Instructions: Puzzle 1 of 1 {/* TODO */}
        </div>
        <div style={collapseStyle}>
          <div style={bodyStyle}>
            <Instructions renderedMarkdown={this.props.markdown}/>
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
