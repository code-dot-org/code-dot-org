/** @file controls below an animation looping toggle */
import React from 'react';
import color from '../../color';
import Radium from 'radium';
import * as PropTypes from '../PropTypes';

var styles = {
  loopToggleStyle: {
    backgroundColor: color.light_purple,
    paddingTop: 5,
    cursor: 'pointer',
    color: '#fff',
    fontSize: 12,
    height: 25,
    borderRadius: 3,
    marginBottom: 4
  },
  checkboxStyle: {
    marginTop: 0,
    marginRight: 4
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
      <div style={[styles.loopToggleStyle, this.props.style]}>
        <label><input style={styles.checkboxStyle} type={"checkbox"} checked={this.props.looping} onChange={this.toggleClicked}/>Loop forever</label>
      </div>
    );
  }
});

module.exports = Radium(ItemLoopToggle);
