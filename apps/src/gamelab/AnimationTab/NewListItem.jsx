/** List item placeholder for adding a new item */
'use strict';

var color = require('../../color');
var Radium = require('radium');

var styles = {
  tile: {
    width: '100%',
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 4,
    ':hover': {
      cursor: 'pointer'
    }
  },
  wrapper: {
    position: 'relative',
    display: 'block',
    paddingTop: '100%'
  },
  dottedBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 9,
    border: 'dashed 4px ' + color.light_purple,
    textAlign: 'center',
    paddingTop: '50%'
  },
  dottedBorderHovered: {
    backgroundColor: color.lightest_purple
  },
  addButton: {
    color: color.light_purple,
    fontSize: 48,
    marginTop: '-50%'
  },
  animationName: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    textAlign: 'center',
    userSelect: 'none',
    fontWeight: 'bold',
    fontStyle: 'italic'
  }
};

/**
 * List item control (usable in animation or frame lists) for adding
 * a new item - displays as a plus sign in a dashed box.
 */
var NewListItem = React.createClass({
  propTypes: {
    label: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired
  },

  render: function () {
    var hovered = Radium.getState(this.state, 'main', ':hover');
    return (
      <div style={styles.tile} onClick={this.props.onClick} className="newListItem">
        <div style={styles.wrapper}>
          <div style={[styles.dottedBorder, hovered && styles.dottedBorderHovered]}>
            <i className="fa fa-plus" style={styles.addButton}></i>
          </div>
        </div>
        <div className="animation-name" style={styles.animationName}>
          {this.props.label}
        </div>
      </div>
    );
  }
});
module.exports = Radium(NewListItem);
