'use strict';

var color = require('../color');
var connect = require('react-redux').connect;

var AnimationFrameTile = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isSelected: React.PropTypes.bool
  },

  render: function () {
    var tileStyle = {
      width: '100%',

      backgroundColor: this.props.isSelected ? color.purple : 'none',
      borderRadius: 10,
      marginBottom: 10
    };

    var imageFrameStyle = {
      position: 'relative',

      backgroundColor: 'white',
      border: 'solid 2px ' + color.purple,
      borderRadius: 10,
      margin: 2
    };

    var imageStyle = {
      width: '100%'
    };

    var sequenceNameStyle = {
      textAlign: 'center'
    };

    return <div style={tileStyle}>
      <div className="image-frame" style={imageFrameStyle}>
        <img src={this.props.assetUrl('media/common_images/draw-east.png')} style={imageStyle}/>
      </div>
    </div>;
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl
  };
})(AnimationFrameTile);
