'use strict';

var color = require('../color');
var connect = require('react-redux').connect;
var TileButtons = require('./TileButtons.jsx');
var TileThumbnail = require('./TileThumbnail.jsx');

var AnimationFrameTile = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    index: React.PropTypes.number,
    isSelected: React.PropTypes.bool
  },

  render: function () {
    var tileStyle = {
      width: '100%',

      backgroundColor: this.props.isSelected ? color.purple : 'none',
      borderRadius: 10,
      paddingTop: 4,
      paddingBottom: 4,
      marginBottom: 4
    };

    return <div style={tileStyle}>
      <TileThumbnail
          index={this.props.index}
          isSelected={this.props.isSelected}
          src={this.props.assetUrl('media/common_images/draw-east.png')}
      />
      {this.props.isSelected && <TileButtons/>}
    </div>;
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl
  };
})(AnimationFrameTile);
