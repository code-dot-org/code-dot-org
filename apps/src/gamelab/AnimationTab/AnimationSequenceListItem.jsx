/** A single list item representing an animation sequence. */
'use strict';

var _ = require('../../lodash');
var color = require('../../color');
var connect = require('react-redux').connect;
var ListItemButtons = require('./ListItemButtons.jsx');
var ListItemThumbnail = require('./ListItemThumbnail.jsx');

var staticStyles = {
  tile: {
    width: '100%',

    borderRadius: 10,

    // Provide vertical padding because we flow vertically, but require
    // children to use margins horizontally.
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 4
  },
  nameLabel: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    textAlign: 'center',
    userSelect: 'none'
  },
  nameInputWrapper: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 4
  },
  nameInput: {
    width: '100%',
    margin: 0,
    padding: 0,
    textAlign: 'center',
    border: 'none',
    borderRadius: 9
  }
};

/**
 * A single list item representing an animation sequence.  Displays an
 * animated thumbnail of the sequence, along with the sequence name and
 * (if currently selected) controls for deleting or duplicating the sequence.
 */
var AnimationSequenceListItem = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isSelected: React.PropTypes.bool,
    sequenceName: React.PropTypes.string.isRequired
  },

  render: function () {
    var styles = _.merge({}, staticStyles, {
      tile: {
        backgroundColor: this.props.isSelected ? color.purple : 'none'
      }
    });

    var sequenceName;
    if (this.props.isSelected) {
      sequenceName = (
        <div style={styles.nameInputWrapper}>
          <input type="text" style={styles.nameInput} value={this.props.sequenceName} />
        </div>
      );
    } else {
      sequenceName = <div style={styles.nameLabel}>{this.props.sequenceName}</div>;
    }


    return (
      <div style={styles.tile}>
        <ListItemThumbnail
            isSelected={this.props.isSelected}
            src={this.props.assetUrl('media/common_images/draw-east.png')} />
        {sequenceName}
        {this.props.isSelected && <ListItemButtons />}
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl
  };
})(AnimationSequenceListItem);
