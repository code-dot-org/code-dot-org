'use strict';

var _ = require('lodash');
var color = require('../../color');

var Instructions = require('./Instructions.jsx');
var CollapserIcon = require('./CollapserIcon.jsx');

var styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    right: 0,
    // left handled by media queries for .workspace-right
  },
  header: {
    height: 30,
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
    onToggleCollapsed: React.PropTypes.func.isRequired
  },

  render: function () {
    var id = this.props.id;

    var mainStyle = _.assign({}, styles.main, {
      height: this.props.height
    });

    var bodyStyle = _.assign({}, styles.body, {
      height: this.props.height - styles.header.height,
      display: this.props.collapsed ? 'none' : undefined
    });

    return (
      <div style={mainStyle} className="workspace-right">
        <CollapserIcon
            collapsed={this.props.collapsed}
            onClick={this.props.onToggleCollapsed}/>
        <div style={styles.header}>
          Instructions: Puzzle 1 of 1 {/* TODO */}
        </div>
        <div style={bodyStyle}>
          <Instructions renderedMarkdown={this.props.markdown}/>
        </div>
      </div>
    );

  }
});
module.exports = TopInstructions;
