'use strict';

var color = require('../color');
var connect = require('react-redux').connect;
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

    var sequenceNameStyle = {
      textAlign: 'center',
      userSelect: 'none'
    };

    return <div style={tileStyle}>
      <TileThumbnail
          isSelected={this.props.isSelected}
          src={this.props.assetUrl('media/common_images/draw-east.png')}
      />
      <div className="sequence-name" style={sequenceNameStyle}>{this.props.sequenceName}</div>
    </div>;
  }
});
module.exports = connect(function propsFromStore(state) {
  return {
    assetUrl: state.level.assetUrl
  };
})(AnimationSequenceTile);
