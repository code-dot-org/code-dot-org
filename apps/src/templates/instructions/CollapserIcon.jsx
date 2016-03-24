'use strict';

var _ = require('lodash');
var color = require('../../color');

var styles = {
  showHideButton: {
    position: 'absolute',
    top: 0,
    left: 8,
    margin: 0,
    lineHeight: '30px',
    fontSize: 18,
    // get hover behavior from CollapserIcon_showHideButton
  },
};

var CollapserIcon = React.createClass({
  propTypes: {

  },

  handleClick: function () {
    console.log('click');
  },

  render: function () {

    return (
      <i style={styles.showHideButton}
          onClick={this.handleClick}
          className="fa fa-chevron-circle-down CollapserIcon_showHideButton"/>
    );

  }
});
module.exports = CollapserIcon;
