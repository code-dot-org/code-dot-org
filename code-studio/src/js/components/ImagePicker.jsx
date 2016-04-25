var AssetManager = require('./AssetManager');
var color = require('@cdo/apps/color');
var IconLibrary = require('./IconLibrary');
var ICON_PREFIX = require('@cdo/apps/applab/constants').ICON_PREFIX;

var extensionFilter = {
  image: '.jpg, .jpeg, .gif, .png',
  audio: '.mp3',
  document: '.jpg, .jpeg, .gif, .png, .pdf'
};

/**
 * A component for managing hosted assets.
 */
var ImagePicker = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func,
    typeFilter: React.PropTypes.string,
    channelId: React.PropTypes.string.isRequired,
    uploadsEnabled: React.PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {mode: 'files'};
  },

  getAssetNameWithPrefix: function (icon) {
    this.props.assetChosen(ICON_PREFIX + icon);
  },

  setIconMode: function () {
    this.setState({mode: 'icons'});
  },

  setFileMode: function () {
    this.setState({mode: 'files'});
  },

  render: function () {
    var isFileMode = this.state.mode === 'files';
    var styles = {
      root: {
        margin: "0 0 0 5px"
      },
      fileModeToggle: {
        float: 'left',
        margin: '0 20px 0 0',
        fontFamily: isFileMode ? '"Gotham 5r"' : null,
        color: isFileMode ? null : '#999',
        fontSize: '16px',
        cursor: 'pointer'
      },
      iconModeToggle: {
        margin: '0',
        fontSize: '16px',
        fontFamily: isFileMode ? null : '"Gotham 5r"',
        color: isFileMode ? '#999' : null,
        cursor: 'pointer'
      },
      divider: {
        borderColor: color.purple,
        margin: '5px 0'
      }
    };

    var modeSwitch, title = this.props.assetChosen ?
      <p className="dialog-title">Choose Assets</p> :
      <p className="dialog-title">Manage Assets</p>;

    var imageTypeFilter = !this.props.typeFilter || this.props.typeFilter === 'image';
    if (this.props.assetChosen && imageTypeFilter) {
      modeSwitch = <div>
        <p onClick={this.setFileMode} style={styles.fileModeToggle}>My Files</p>
        <p onClick={this.setIconMode} style={styles.iconModeToggle}>Icons</p>
        <hr style={styles.divider}/>
      </div>;
    }

    var body = !this.props.assetChosen || this.state.mode === 'files' ?
      <AssetManager
        assetChosen={this.props.assetChosen}
        allowedExtensions={extensionFilter[this.props.typeFilter]}
        channelId={this.props.channelId}
        uploadsEnabled={this.props.uploadsEnabled}/> :
      <IconLibrary assetChosen={this.getAssetNameWithPrefix}/>;

    return (
      <div className="modal-content" style={styles.root}>
        {title}
        {modeSwitch}
        {body}
      </div>
    );
  }
});
module.exports = ImagePicker;
