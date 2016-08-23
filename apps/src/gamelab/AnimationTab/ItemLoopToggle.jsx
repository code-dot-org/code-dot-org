/** @file controls below an animation loop toggle */
'use strict';

var React = require('react');
var color = require('../../color');
var Radium = require('radium');
import * as PropTypes from '../PropTypes';

var styles = {
  loopToggleStyle: {
    width: 31,
    height: 31,
    backgroundColor: color.purple,
    borderRadius: '50%',
    padding: 2
  },
  loopIconStyle: {
    paddingTop: 3,
    position: 'relative'
  }
};

/**
 * The toggle that controls whether the animation loops frames.
 */

const ItemLoopToggle = React.createClass({
  getDefaultProps: function () {
    return {
      loopAnimation: true
    };
  },

  propTypes: {
    style: React.PropTypes.object,
    onToggleChange: React.PropTypes.func/*.isRequired as soon as everything is hooked up. */,
    loopAnimation: React.PropTypes.bool
  },

  toggleClicked() {
    this.props.onToggleChange(!this.props.loopAnimation);
  },

  render() {
    let iconClassName = "fa fa-repeat";
    if (this.props.loopAnimation === true) {
      iconClassName = "fa fa-refresh";
    }
    return (
      <div style={[this.props.style, styles.loopToggleStyle]} onClick={this.toggleClicked}>
        <i className={iconClassName} style={styles.loopIconStyle}></i>
      </div>
    );
  }
});

module.exports = Radium(ItemLoopToggle);
