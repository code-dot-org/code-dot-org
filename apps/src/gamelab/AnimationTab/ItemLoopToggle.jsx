/** @file controls below an animation looping toggle */
import React from 'react';
import color from '../../color';
import Radium from 'radium';
import * as PropTypes from '../PropTypes';

var styles = {
  loopToggleStyle: {
    cursor: 'pointer',
    float: 'left'
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
    onToggleChange: React.PropTypes.func.isRequired,
    looping: React.PropTypes.bool.isRequired
  },

  toggleClicked() {
    this.props.onToggleChange(!this.props.looping);
  },

  render() {
    const iconImageName = this.props.looping ? 'looping-continuous' : 'looping-one-time';
    const iconImageSrc = `/blockly/media/gamelab/${iconImageName}.png`;
    return (
      <div style={[styles.loopToggleStyle, this.props.style]} onClick={this.toggleClicked}>
        <img src={iconImageSrc} style={styles.loopIconStyle}/>
      </div>
    );
  }
});

module.exports = Radium(ItemLoopToggle);
