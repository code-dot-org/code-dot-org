/** @file Single list item representing an animation frame. */
'use strict';

var color = require('../color');
var connect = require('react-redux').connect;
var TileButtons = require('./TileButtons.jsx');
var TileThumbnail = require('./TileThumbnail.jsx');

/**
 * Single list item in the AnimationFrameList, representing a single frame
 * of the selected animation sequence.  Displays a thumbnail of the frame
 * with the frame index overlaid, and if selected also shows controls for
 * deleting or duplicating the frame.
 */
var AnimationFrameTile = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    index: React.PropTypes.number.isRequired,
    isSelected: React.PropTypes.bool
  },

  render: function () {
    var styles = {
      tile: {
        width: '100%',
        backgroundColor: this.props.isSelected ? color.purple : 'none',
        borderRadius: 10,
        paddingTop: 4,
        paddingBottom: 4,
        marginBottom: 4
      }
    };

    return (
      <div style={styles.tile}>
        <TileThumbnail
            index={this.props.index}
            isSelected={this.props.isSelected}
            src={this.props.assetUrl('media/common_images/draw-east.png')} />
        {this.props.isSelected && <TileButtons />}
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl
  };
})(AnimationFrameTile);
