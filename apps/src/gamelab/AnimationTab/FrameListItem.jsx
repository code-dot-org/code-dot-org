/** @file Single list item representing an animation frame. */
'use strict';

var _ = require('../../lodash');
var color = require('../../color');
var connect = require('react-redux').connect;
var ListItemButtons = require('./ListItemButtons');
var ListItemThumbnail = require('./ListItemThumbnail');

var staticStyles = {
  tile: {
    width: '100%',
    borderRadius: 10,
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 4
  }
};

/**
 * Single list item in the FrameList, representing a single frame of the
 * selected animation.  Displays a thumbnail of the frame with the frame index
 * overlaid, and if selected also shows controls for deleting or duplicating
 * the frame.
 */
var FrameListItem = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    index: React.PropTypes.number.isRequired,
    isSelected: React.PropTypes.bool
  },


  render: function () {
    var styles = _.merge({}, staticStyles, {
      tile: {
        backgroundColor: this.props.isSelected ? color.purple : 'none'
      }
    });
    return (
      <div style={styles.tile}>
        <ListItemThumbnail
            index={this.props.index}
            isSelected={this.props.isSelected}
            src={this.props.assetUrl('media/common_images/draw-east.png')} />
        {this.props.isSelected && <ListItemButtons />}
      </div>
    );
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl
  };
})(FrameListItem);
