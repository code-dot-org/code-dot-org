'use strict';

var color = require('../color');
var TileButtons = require('./TileButtons.jsx');
var TileThumbnail = require('./TileThumbnail.jsx');

var NewItemTile = React.createClass({
  propTypes: {
    label: React.PropTypes.string.isRequired
  },

  render: function () {
    var styles = {
      tile: {
        width: '100%',

        // Use vertical padding because we flow vertically, but require
        // children to use margins horizontally.
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

    return <div style={styles.tile}>
      <div style={styles.wrapper}>
        <div style={styles.dottedBorder}>
          <i className="fa fa-plus" style={styles.addButton}></i>
        </div>
      </div>
      <div className="sequence-name" style={styles.sequenceName}>
        {this.props.label}
      </div>
    </div>;
  }
});
module.exports = NewItemTile;
