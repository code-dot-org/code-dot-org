import PropTypes from 'prop-types';
import React from 'react';
import AssetManager from './AssetManager';
import {
  SOUND_PREFIX,
  DEFAULT_SOUND_PATH_PREFIX,
} from '../../assetManagement/assetPrefix';
import SoundLibrary from './SoundLibrary';
import i18n from '@cdo/locale';
import Sounds from '../../Sounds';
import {RecordingFileType} from './recorders';
import classnames from 'classnames';
import moduleStyle from './components.module.scss';

const audioExtension = '.mp3';

const MODE = {
  files: 'files',
  sounds: 'sounds',
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
    libraryOnly: PropTypes.bool,
    //For logging upload failures
    projectId: PropTypes.string,
    soundPlayer: PropTypes.object,
  };

  state = {mode: MODE.sounds};

  getAssetNameWithPrefix = sound => {
    const soundName = sound.replace(DEFAULT_SOUND_PATH_PREFIX, SOUND_PREFIX);
    this.props.assetChosen(soundName);
  };

  setSoundMode = () => this.setState({mode: MODE.sounds});

  setFileMode = () => {
    let sounds = Sounds.getSingleton();
    sounds.stopAllAudio();
    this.setState({mode: MODE.files});
  };

  render() {
    const isFileMode = this.state.mode === MODE.files;

    const soundModeToggleClassNames = classnames(
      moduleStyle.modeSwitchButton,
      moduleStyle.soundModeToggle,
      {
        [moduleStyle.selectedToggle]: !isFileMode,
        [moduleStyle.unselectedToggle]: isFileMode,
      }
    );

    const fileModeToggleClassNames = classnames(
      moduleStyle.modeSwitchButton,
      moduleStyle.fileModeToggle,
      {
        [moduleStyle.selectedToggle]: isFileMode,
        [moduleStyle.unselectedToggle]: !isFileMode,
      }
    );

    const title = <p>{i18n.chooseSounds()}</p>;
    const modeSwitch = (
      <div id="modeSwitch">
        <button
          onClick={this.setSoundMode}
          className={soundModeToggleClassNames}
          type="button"
        >
          {i18n.soundLibrary()}
        </button>
        <button
          onClick={this.setFileMode}
          className={fileModeToggleClassNames}
          type="button"
        >
          {i18n.makeNewSounds()}
        </button>
      </div>
    );

    const displaySoundLibraryTab = this.state.mode === MODE.sounds;
    const body =
      this.libraryOnly || displaySoundLibraryTab ? (
        <SoundLibrary assetChosen={this.getAssetNameWithPrefix} />
      ) : (
        <AssetManager
          assetChosen={this.props.assetChosen}
          assetsChanged={this.props.assetsChanged}
          allowedExtensions={audioExtension}
          uploadsEnabled={this.props.uploadsEnabled}
          useFilesApi={this.props.useFilesApi}
          projectId={this.props.projectId}
          soundPlayer={this.props.soundPlayer}
          recordingFileType={RecordingFileType.MP3}
        />
      );
    return (
      <div className={classnames('modal-content', moduleStyle.soundPickerRoot)}>
        {title}
        {!this.props.libraryOnly && (
          <div>
            {this.props.showUnderageWarning && (
              <p className={moduleStyle.soundPickerWarning}>
                Warning: Do not upload anything that contains personal
                information.
              </p>
            )}
            {modeSwitch}
          </div>
        )}
        <hr className={moduleStyle.soundPickerDivider} />
        {body}
      </div>
    );
  }
}
