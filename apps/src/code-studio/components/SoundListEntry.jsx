var React = require('react');

/**
 * Sound entry.
 */
var SoundListEntry = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired,
    soundMetadata: React.PropTypes.object.isRequired,
    isSelected: React.PropTypes.bool.isRequired
  },

  render: function () {
    var columnWidth = '200px';
    var backgroundColor = this.props.isSelected ? '#7665a0' : '#a69bc1';

    var rootStyles = {
      float: 'left',
      width: columnWidth,
      height: '35px',
      cursor: 'pointer',
      backgroundColor: backgroundColor,
      margin: '10px',
      padding: '6px',
      overflow: 'hidden'
    };

    return (
      <div
        style={rootStyles}
        title={this.props.soundMetadata.name}
        onClick={this.props.assetChosen.bind(null, this.props.soundMetadata)}
      >
        {this.props.soundMetadata.name}
        <br />
        {this.props.soundMetadata.time}
      </div>
    );
  }
});
module.exports = SoundListEntry;
