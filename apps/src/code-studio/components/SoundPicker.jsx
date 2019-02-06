import PropTypes from 'prop-types';
import React from 'react';
import AssetManager from './AssetManager';
import color from "../../util/color";
import { SOUND_PREFIX, DEFAULT_SOUND_PATH_PREFIX } from '../../assetManagement/assetPrefix';
import SoundLibrary from './SoundLibrary';
import i18n from '@cdo/locale';

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
export default class SoundPicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    assetsChanged: PropTypes.func,
    typeFilter: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    showUnderageWarning: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool.isRequired,
    //For logging upload failures
    projectId: PropTypes.string,
    soundPlayer: PropTypes.object
  };

  state = {mode: MODE.sounds};

  getAssetNameWithPrefix = (sound) => {
    const soundName = sound.replace(DEFAULT_SOUND_PATH_PREFIX, SOUND_PREFIX);
    this.props.assetChosen(soundName);
  };

  setSoundMode = () => this.setState({mode: MODE.sounds});

  setFileMode = () => this.setState({mode: MODE.files});

  render() {
    const isFileMode = this.state.mode === MODE.files;
    const headerStyles = {
      soundModeToggle: {
        float: 'left',
        margin: '0 20px 0 0',
        fontFamily: isFileMode ? null : '"Gotham 5r"',
        color: isFileMode ? color.light_gray : null,
        fontSize: 16,
        cursor: 'pointer'
      },
      fileModeToggle: {
        margin: 0,
        fontSize: 16,
        fontFamily: isFileMode ? '"Gotham 5r"' : null,
        color: isFileMode ? null : color.light_gray,
        cursor: 'pointer'
      },
    };

    let modeSwitch;
    let title = (
      <p>
        {this.props.assetChosen ? "Choose Sounds" : "Manage Sounds"}
      </p>
    );

    if (this.props.assetChosen) {
      modeSwitch = (
        <div>
          <p onClick={this.setSoundMode} style={headerStyles.soundModeToggle}>{i18n.soundLibrary()}</p>
          <p onClick={this.setFileMode} style={headerStyles.fileModeToggle}>{i18n.makeNewSounds()}</p>
          <hr style={styles.divider}/>
        </div>
      );
    }

    const displayFilesTab = !this.props.assetChosen || this.state.mode === MODE.files;
    const body = displayFilesTab ?
      <AssetManager
        assetChosen={this.props.assetChosen}
        assetsChanged={this.props.assetsChanged}
        allowedExtensions={audioExtension}
        uploadsEnabled={this.props.uploadsEnabled}
        useFilesApi={this.props.useFilesApi}
        projectId={this.props.projectId}
        soundPlayer={this.props.soundPlayer}
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
}
