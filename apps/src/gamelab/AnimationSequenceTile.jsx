'use strict';

var color = require('../color');
var connect = require('react-redux').connect;
var TileButtons = require('./TileButtons.jsx');
var TileThumbnail = require('./TileThumbnail.jsx');

var AnimationSequenceTile = React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func.isRequired,
    isSelected: React.PropTypes.bool,
    sequenceName: React.PropTypes.string.isRequired
  },

  render: function () {
    var tileStyle = {
      width: '100%',

      backgroundColor: this.props.isSelected ? color.purple : 'none',
      borderRadius: 10,
      // Use vertical padding because we flow vertically, but require
      // children to use margins horizontally.
      paddingTop: 4,
      paddingBottom: 4,
      marginBottom: 4
    };

    var sequenceName;
    if (this.props.isSelected) {
      sequenceName = <div style={{marginLeft: 5, marginRight: 5, marginTop: 4}}>
          <input type="text" style={{width: '100%', margin: 0, padding: 0, textAlign: 'center', border: 'none', borderRadius: 9}} value={this.props.sequenceName} />
        </div>;
    } else {
      sequenceName = <div className="sequence-name" style={{marginLeft: 4, marginRight: 4, marginTop: 4, textAlign: 'center', userSelect: 'none'}}>{this.props.sequenceName}</div>;
    }


    return <div style={tileStyle}>
      <TileThumbnail
          isSelected={this.props.isSelected}
          src={this.props.assetUrl('media/common_images/draw-east.png')}
      />
      {sequenceName}
      {this.props.isSelected && <TileButtons/>}
    </div>;
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl
  };
})(AnimationSequenceTile);
