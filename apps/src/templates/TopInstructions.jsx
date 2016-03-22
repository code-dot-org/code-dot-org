'use strict';

var _ = require('lodash');
var color = require('../color');

var styles={
  main: {
    position: 'absolute',
    marginLeft: 15,
    right: 0,
    // left handled by media queries
    height: 30,
    lineHeight: '30px',
    fontFamily: '"Gotham 4r"',
    backgroundColor: color.lighter_purple,
  },
  header: {
    textAlign: 'center'
  }
};

var TopInstructions = React.createClass({
  propTypes: {

  },

  render: function () {
    var id = this.props.id;

    // TODO - puzzle 1 of 1

    return (
      <div id="topInstructions" style={styles.main}>
        <div id="instructionsHeader" style={styles.header}>
          Instructions: Puzzle 1 of 1
        </div>
        <div style={styles.body}>
          These are the markup instructions here
        </div>
      </div>
    );
  }
});
module.exports = TopInstructions;
