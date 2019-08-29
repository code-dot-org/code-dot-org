import PropTypes from 'prop-types';
import React from 'react';
import {getStore} from '@cdo/apps/redux';
import AssetManager from './AssetManager';
import color from '../../util/color';
import IconLibrary from './IconLibrary';
import {ICON_PREFIX} from '@cdo/apps/applab/constants';

const extensionFilter = {
  image: '.jpg, .jpeg, .gif, .png',
  audio: '.mp3',
  document: '.jpg, .jpeg, .gif, .png, .pdf, .doc, .docx'
};

/**
 * A component for managing hosted assets.
 */
export default class ImagePicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    assetsChanged: PropTypes.func,
    typeFilter: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    showUnderageWarning: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool,
    soundPlayer: PropTypes.object,
    disableAudioRecording: PropTypes.bool,
    //For logging purposes
    projectId: PropTypes.string,
    elementId: PropTypes.string
  };

  state = {mode: 'files'};

  getAssetNameWithPrefix = icon => {
    this.props.assetChosen(ICON_PREFIX + icon);
  };

  setIconMode = () => this.setState({mode: 'icons'});

  setFileMode = () => this.setState({mode: 'files'});

  render() {
    const isFileMode = this.state.mode === 'files';
    const styles = {
      root: {
        margin: '0 0 0 5px'
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
        fontWeight: 'bold'
      }
    };

    let modeSwitch,
      title = this.props.assetChosen ? (
        <p className="dialog-title">Choose Assets</p>
      ) : (
        <p className="dialog-title">Manage Assets</p>
      );

    const imageTypeFilter =
      !this.props.typeFilter || this.props.typeFilter === 'image';
    if (this.props.assetChosen && imageTypeFilter) {
      modeSwitch = (
        <div>
          <p onClick={this.setFileMode} style={styles.fileModeToggle}>
            My Files
          </p>
          <p onClick={this.setIconMode} style={styles.iconModeToggle}>
            Icons
          </p>
          <hr style={styles.divider} />
        </div>
      );
    }

    const disableAudio =
      this.props.disableAudioRecording || this.props.assetChosen;
    const reduxStore = getStore();
    let levelName, isStartMode;
    if (reduxStore) {
      const state = reduxStore.getState();
      levelName = state && state.level.name;
      isStartMode = state && state.level.isStartMode;
    }
    const body =
      !this.props.assetChosen || this.state.mode === 'files' ? (
        <AssetManager
          assetChosen={this.props.assetChosen}
          assetsChanged={this.props.assetsChanged}
          allowedExtensions={extensionFilter[this.props.typeFilter]}
          uploadsEnabled={this.props.uploadsEnabled}
          useFilesApi={this.props.useFilesApi}
          projectId={this.props.projectId}
          soundPlayer={this.props.soundPlayer}
          disableAudioRecording={disableAudio}
          imagePicker={true}
          elementId={this.props.elementId}
          levelName={levelName}
          isStartMode={isStartMode}
        />
      ) : (
        <IconLibrary assetChosen={this.getAssetNameWithPrefix} />
      );

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
