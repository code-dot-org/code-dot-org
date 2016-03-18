/** List item placeholder for adding a new item */
'use strict';

var color = require('../../color');

var staticStyles = {
  tile: {
    width: '100%',
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 4
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
  addButton: {
    color: color.light_purple,
    fontSize: 48,
    marginTop: '-50%'
  },
  sequenceName: {
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
 * List item control (usable in sequences or frames lists) for adding
 * a new item - displays as a plus sign in a dashed box.
 */
var NewListItem = React.createClass({
  propTypes: {
    label: React.PropTypes.string.isRequired
  },

  render: function () {
    return (
      <div style={staticStyles.tile}>
        <div style={staticStyles.wrapper}>
          <div style={staticStyles.dottedBorder}>
            <i className="fa fa-plus" style={staticStyles.addButton}></i>
          </div>
        </div>
        <div className="sequence-name" style={staticStyles.sequenceName}>
          {this.props.label}
        </div>
      </div>
    );
  }
});
module.exports = NewListItem;
