'use strict';

var color = require('../color');

var TileThumbnail = React.createClass({
  propTypes: {
    isSelected: React.PropTypes.bool,
    src: React.PropTypes.string.isRequired
  },

  render: function () {
    var frameStyle = {
      position: 'relative',
      imageRendering: 'pixelated',
      backgroundColor: 'white',
      border: 'solid 2px ' + (this.props.isSelected ? color.purple : color.light_purple),
      borderRadius: 9,
      marginLeft: 4,
      marginRight: 4
    };

    var imageStyle = {
      width: '100%'
    };

    return <div className="image-frame" style={frameStyle}>
      <div style={{position: 'relative', margin: 4}}>
        <img src={this.props.src} style={{width: '100%'}}/>
      </div>
    </div>;
  }
});
module.exports = TileThumbnail;
