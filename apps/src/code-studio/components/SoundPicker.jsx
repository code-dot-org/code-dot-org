import React from 'react';
import AssetManager from './AssetManager';
import color from "../../util/color";
import SoundLibrary from './SoundLibrary';

const audioExtension = '.mp3';
const styles = {
  root: {
    margin: "0 0 0 5px"
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
const MODE = {
    files : 'files',
    sounds : 'sounds'
};

/**
 * A component for managing hosted sounds and the Sound Library.
 */
const SoundPicker = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func,
    assetsChanged: React.PropTypes.func,
    typeFilter: React.PropTypes.string,
    uploadsEnabled: React.PropTypes.bool.isRequired,
    showUnderageWarning: React.PropTypes.bool.isRequired,
    useFilesApi: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {mode: MODE.files};
  },

  getAssetNameWithPrefix(sound) {
    this.props.assetChosen(sound);
  },

  setSoundMode() {
    this.setState({mode: MODE.sounds});
  },

  setFileMode() {
    this.setState({mode: MODE.files});
  },

  render() {
    const isFileMode = this.state.mode === MODE.files;
    const headerStyles = {
      fileModeToggle: {
        float: 'left',
        margin: '0 20px 0 0',
        fontFamily: isFileMode ? '"Gotham 5r"' : null,
        color: isFileMode ? null : '#999',
        fontSize: 16,
        cursor: 'pointer'
      },
      soundModeToggle: {
        margin: 0,
        fontSize: 16,
        fontFamily: isFileMode ? null : '"Gotham 5r"',
        color: isFileMode ? '#999' : null,
        cursor: 'pointer'
      },
    };

    let modeSwitch, title = this.props.assetChosen ?
      <p>Choose Sounds</p> :
      <p>Manage Sounds</p>;

    if (this.props.assetChosen) {
      modeSwitch = (
        <div>
          <p onClick={this.setFileMode} style={headerStyles.fileModeToggle}>My Files</p>
          <p onClick={this.setSoundMode} style={headerStyles.soundModeToggle}>Sound library</p>
          <hr style={styles.divider}/>
        </div>
      );
    }

    const body = !this.props.assetChosen || this.state.mode === MODE.files ?
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
