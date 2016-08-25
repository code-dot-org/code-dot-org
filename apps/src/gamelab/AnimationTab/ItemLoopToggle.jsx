/** @file controls below an animation looping toggle */
'use strict';

var React = require('react');
var color = require('../../color');
var Radium = require('radium');
import * as PropTypes from '../PropTypes';

var styles = {
  loopToggleStyle: {
    width: 30,
    height: 30,
    backgroundColor: color.purple,
    borderRadius: '50%',
    padding: 2
  },
  loopIconStyle: {
    paddingTop: 3,
    paddingLeft: 3,
    position: 'relative'
  }
};

/**
 * The toggle that controls whether the animation loops frames.
 */

const ItemLoopToggle = React.createClass({
  getDefaultProps: function () {
    return {
      looping: true
    };
  },

  propTypes: {
    style: React.PropTypes.object,
    onToggleChange: React.PropTypes.func,
    looping: React.PropTypes.bool
  },

  toggleClicked() {
    this.props.onToggleChange(!this.props.looping);
  },

  render() {
    let iconImageSrc = "/blockly/media/gamelab/looping-one-time.png";
    if (this.props.looping === true) {
      iconImageSrc = "/blockly/media/gamelab/looping-continuous.png";
    }
    return (
      <div style={[this.props.style, styles.loopToggleStyle]} onClick={this.toggleClicked}>
        <img src={iconImageSrc} style={styles.loopIconStyle}></img>
      </div>
    );
  }
});

module.exports = Radium(ItemLoopToggle);
