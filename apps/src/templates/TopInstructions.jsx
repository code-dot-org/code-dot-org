'use strict';

var _ = require('lodash');
var color = require('../color');

var Instructions = require('./Instructions.jsx');

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
    backgroundColor: 'white'
  }
};

var TopInstructions = React.createClass({
  propTypes: {
    height: React.PropTypes.number.isRequired
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
        <div id="instructionsHeader" style={styles.header}>
          Instructions: Puzzle 1 of 1 {/* TODO */}
        </div>
        <div style={bodyStyle}>
          These are the markup instructions here
        </div>
        <Instructions/>
      </div>
    );
  }
});
module.exports = TopInstructions;
