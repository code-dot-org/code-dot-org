/** @file controls below an animation thumbnail */
'use strict';

var color = require('../../color');
var Radium = require('radium');

var styles = {
  root: {
    marginLeft: 4,
    marginRight: 4,
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

/**
 * The delete and duplicate controls beneath an animation or frame thumbnail.
 */
var ListItemButtons = function (props) {
  return (
    <div style={styles.root}>
      <i key="trash" className="fa fa-trash-o" style={[styles.icon, styles.trash]} onClick={props.onDeleteClick} />
      <i key="clone" className="fa fa-clone" style={styles.icon} onClick={props.onCloneClick} />
    </div>
  );
};
ListItemButtons.propTypes = {
  onCloneClick: React.PropTypes.func/*.isRequired as soon as everything is hooked up. */,
  onDeleteClick: React.PropTypes.func/*.isRequired as soon as everything is hooked up. */
};
module.exports = Radium(ListItemButtons);
