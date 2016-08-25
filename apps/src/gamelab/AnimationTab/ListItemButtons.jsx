/** @file controls below an animation thumbnail */
var React = require('react');
var color = require('../../color');
var Radium = require('radium');
var SpeedSlider = require('../../templates/SpeedSlider');
import * as PropTypes from '../PropTypes';

var styles = {
  root: {
    marginRight: 6,
    marginLeft: 6,
    marginTop: 6,
    textAlign: 'center',
    color: color.white,
    fontSize: 24
  },
  icon: {
    padding: 2,
    borderWidth: 1,
    borderRadius: 4,
    borderStyle: 'solid',
    borderColor: 'transparent',
    ':hover': {
      borderStyle: 'outset',
      borderColor: color.white
    },
    ':active': {
      borderStyle: 'inset',
      borderColor: color.white
    }
  },
  trash: {
    marginRight: 12
  }
};

var sliderStyle = {
  float: 'none',
  display: 'block'
};

/**
 * The delete and duplicate controls beneath an animation or frame thumbnail.
 */
var ListItemButtons = function (props) {
  return (
    <div style={styles.root}>
      <SpeedSlider style={sliderStyle} hasFocus={true} value={props.frameDelay} lineWidth={120} onChange={props.onFrameDelayChanged}/>
      <i key="trash" className="fa fa-trash-o" style={[styles.icon, styles.trash]} onClick={props.onDeleteClick} />
      <i key="clone" className="fa fa-clone" style={styles.icon} onClick={props.onCloneClick} />
    </div>
  );
};
ListItemButtons.propTypes = {
  onCloneClick: React.PropTypes.func/*.isRequired as soon as everything is hooked up. */,
  onDeleteClick: React.PropTypes.func/*.isRequired as soon as everything is hooked up. */,
  onFrameDelayChanged: React.PropTypes.func/*.isRequired as soon as everything is hooked up. */,
  frameDelay: React.PropTypes.number/*.isRequired as soon as everything is hooked up. */
};
module.exports = Radium(ListItemButtons);
