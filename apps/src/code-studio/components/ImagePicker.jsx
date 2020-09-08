import PropTypes from 'prop-types';
import React from 'react';
import {getStore} from '@cdo/apps/redux';
import AssetManager from './AssetManager';
import color from '../../util/color';
import IconLibrary from './IconLibrary';
import ImageURLInput from './ImageURLInput';
import {ICON_PREFIX} from '@cdo/apps/applab/constants';

const extensionFilter = {
  // Note: .jfif files will be converted to .jpg by the server.
  image: '.jpg, .jpeg, .jfif, .gif, .png',
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
    currentValue: PropTypes.string,
    currentImageType: PropTypes.string,
    //For logging purposes
    projectId: PropTypes.string,
    elementId: PropTypes.string
  };

  state = {mode: 'file'};

  getAssetNameWithPrefix = icon => {
    this.props.assetChosen(ICON_PREFIX + icon);
  };

  setMode = mode => {
    this.setState({mode: mode});
  };

  render() {
    const styles = {
      root: {
        margin: '0 0 0 5px'
      },
      fileModeToggle: {
        float: 'left',
        margin: '0 20px 0 0',
        fontFamily: this.state.mode === 'file' ? '"Gotham 5r"' : null,
        color: this.state.mode === 'file' ? null : '#999',
        fontSize: '16px',
        cursor: 'pointer'
      },
      iconModeToggle: {
        margin: 0,
        fontSize: '16px',
        fontFamily: this.state.mode === 'icon' ? '"Gotham 5r"' : null,
        color: this.state.mode === 'icon' ? null : '#999',
        cursor: 'pointer'
      },
      urlModeToggle: {
        margin: '0 20px 0 0',
        fontSize: '16px',
        fontFamily: this.state.mode === 'url' ? '"Gotham 5r"' : null,
        color: this.state.mode === 'url' ? null : '#999',
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
          <span
            onClick={() => this.setMode('file')}
            style={styles.fileModeToggle}
          >
            My Files
          </span>
          <span
            onClick={() => this.setMode('url')}
            style={styles.urlModeToggle}
          >
            Image from URL
          </span>
          <span
            onClick={() => this.setMode('icon')}
            style={styles.iconModeToggle}
          >
            Icons
          </span>
          <hr style={styles.divider} />
        </div>
      );
    }

    const disableAudio =
      this.props.disableAudioRecording || !!this.props.assetChosen;

    const reduxState = getStore().getState();
    let levelName, isStartMode;
    if (reduxState && reduxState.level) {
      levelName = reduxState.level.name;
      isStartMode = reduxState.level.isStartMode;
    }

    const getBody = () => {
      if (!this.props.assetChosen || this.state.mode === 'file') {
        return (
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
        );
      } else if (this.state.mode === 'icon') {
        return <IconLibrary assetChosen={this.getAssetNameWithPrefix} />;
      } else {
        return (
          <ImageURLInput
            assetChosen={this.props.assetChosen}
            allowedExtensions={extensionFilter[this.props.typeFilter]}
            currentValue={
              this.props.currentImageType === 'url'
                ? this.props.currentValue
                : ''
            }
          />
        );
      }
    };

    return (
      <div className="modal-content" style={styles.root}>
        {title}
        {this.props.showUnderageWarning && (
          <p style={styles.warning}>
            Warning: Do not upload anything that contains personal information.
          </p>
        )}
        {modeSwitch}
        {getBody()}
      </div>
    );
  }
}
