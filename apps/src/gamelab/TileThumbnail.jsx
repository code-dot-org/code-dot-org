'use strict';

var color = require('../color');

var TileThumbnail = React.createClass({
  propTypes: {
    index: React.PropTypes.number,
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

    return <div className="image-frame" style={frameStyle}>
      <div style={{position: 'relative', margin: 4}}>
        <img src={this.props.src} style={{width: '100%'}}/>
        {this.props.index && <div style={{position: 'absolute', top: 0, left: 0, minWidth: 20, height: 20, overflow: 'hidden', borderRadius: 12, textAlign: 'center', border: 'solid ' + color.light_purple + ' 2px', backgroundColor: color.white}}>
          <div style={{margin: 2, fontWeight: 'bold', fontSize: 16, color: color.light_purple}}>{this.props.index}</div>
        </div>}
      </div>
    </div>;
  }
});
module.exports = TileThumbnail;
