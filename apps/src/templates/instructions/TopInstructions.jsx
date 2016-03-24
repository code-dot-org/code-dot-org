'use strict';

var _ = require('lodash');
var color = require('../../color');

var Instructions = require('./Instructions.jsx');

var styles = {
  main: {
    position: 'absolute',
    marginLeft: 15,
    right: 0,
    // left handled by media queries for .workspace-right
  },
  showHideButton: {
    position: 'absolute',
    top: 0,
    left: 8,
    margin: 0,
    lineHeight: '30px',
    fontSize: 18
    // TODO - hover
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
    overflowY: 'scroll'
  }
};

var TopInstructions = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired,
    markdown: React.PropTypes.string.isRequired
  },

  render: function () {
    var id = this.props.id;

    var mainStyle = _.assign({}, styles.main, {
      height: this.props.height
    });

    var bodyStyle = _.assign({}, styles.body, {
      height: this.props.height - styles.header.height
    });

    return (
      <div style={mainStyle} className="workspace-right">
        <i style={styles.showHideButton}
            className="fa fa-chevron-circle-down TopInstructions_showHideButton"/>
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
