import React from 'react';
import AssetManager from './AssetManager';
import color from "../../util/color";
import SoundLibrary from './SoundLibrary';

const audioExtension = '.mp3';

/**
 * A component for managing hosted sounds and the Sound Library.
 */
var SoundPicker = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func,
    assetsChanged: React.PropTypes.func,
    typeFilter: React.PropTypes.string,
    uploadsEnabled: React.PropTypes.bool.isRequired,
    showUnderageWarning: React.PropTypes.bool.isRequired,
    useFilesApi: React.PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {mode: 'files'};
  },

  getAssetNameWithPrefix: function (sound) {
    this.props.assetChosen(sound);
  },

  setSoundMode: function () {
    this.setState({mode: 'sounds'});
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
      soundModeToggle: {
        margin: 0,
        fontSize: '16px',
        fontFamily: isFileMode ? null : '"Gotham 5r"',
        color: isFileMode ? '#999' : null,
        cursor: 'pointer'
      },
      divider: {
        borderColor: color.purple,
        margin: '5px 0'
      },
      warning: {
        color: color.red,
        fontSize: 13,
        fontWeight: 'bold',
      },
    };

    var modeSwitch, title = this.props.assetChosen ?
      <p className="dialog-title">Choose Sounds</p> :
      <p className="dialog-title">Manage Sounds</p>;

    if (this.props.assetChosen) {
      modeSwitch = (<div>
        <p onClick={this.setFileMode} style={styles.fileModeToggle}>My Files</p>
        <p onClick={this.setSoundMode} style={styles.soundModeToggle}>Sound library</p>
        <hr style={styles.divider}/>
      </div>);
    }

    var body = !this.props.assetChosen || this.state.mode === 'files' ?
      <AssetManager
        assetChosen={this.props.assetChosen}
        assetsChanged={this.props.assetsChanged}
        allowedExtensions={audioExtension}
        uploadsEnabled={this.props.uploadsEnabled}
        useFilesApi={this.props.useFilesApi}
      /> :
      <SoundLibrary assetChosen={this.getAssetNameWithPrefix}/>;

    return (
      <div className="modal-content" style={styles.root}>
        {title}
        {this.props.showUnderageWarning && (
          <p style={styles.warning}>
            Warning: Do not upload anything that contains personal information.
          </p>
        )}
        {modeSwitch}
        {body}
      </div>
    );
  }
});
module.exports = SoundPicker;
