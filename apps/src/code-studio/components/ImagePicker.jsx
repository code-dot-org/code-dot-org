import PropTypes from 'prop-types';
import React from 'react';

import {ICON_PREFIX} from '@cdo/apps/applab/constants';
import fontConstants from '@cdo/apps/fontConstants';
import {getStore} from '@cdo/apps/redux';
import i18n from '@cdo/locale';

import color from '../../util/color';

import AssetManager, {ImageMode} from './AssetManager';
import IconLibrary from './IconLibrary';
import ImageURLInput from './ImageURLInput';
import {RecordingFileType} from './recorders';

const extensionFilter = {
  // Note: .jfif files will be converted to .jpg by the server.
  image: '.jpg, .jpeg, .jfif, .gif, .png',
  audio: '.mp3, .wav',
  document: '.jpg, .jpeg, .gif, .png, .pdf, .doc, .docx',
  // Default set of valid extensions (used if type filter is not specified)
  default: '.jpg, .jpeg, .jfif, .gif, .png, .mp3, .wav, .pdf, .doc, .docx',
};

/**
 * A component for managing hosted assets.
 */
export default class ImagePicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    assetsChanged: PropTypes.func,
    typeFilter: PropTypes.string,
    customAllowedExtensions: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    showUnderageWarning: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool,
    soundPlayer: PropTypes.object,
    disableAudioRecording: PropTypes.bool,
    recordingFileType: PropTypes.oneOf(Object.values(RecordingFileType)),
    currentValue: PropTypes.string,
    currentImageType: PropTypes.string,
    //For logging purposes
    projectId: PropTypes.string,
    elementId: PropTypes.string,
  };

  state = {mode: ImageMode.FILE};

  getAssetNameWithPrefix = icon => {
    this.props.assetChosen(ICON_PREFIX + icon);
  };

  setMode = mode => {
    this.setState({mode});
  };

  getBody = (disableAudio, levelName, isStartMode) => {
    if (!this.props.assetChosen || this.state.mode === ImageMode.FILE) {
      const allowedExtensions =
        this.props.customAllowedExtensions ||
        extensionFilter[this.props.typeFilter] ||
        extensionFilter.default;
      return (
        <AssetManager
          assetChosen={this.props.assetChosen}
          assetsChanged={this.props.assetsChanged}
          allowedExtensions={allowedExtensions}
          uploadsEnabled={this.props.uploadsEnabled}
          useFilesApi={this.props.useFilesApi}
          projectId={this.props.projectId}
          soundPlayer={this.props.soundPlayer}
          disableAudioRecording={disableAudio}
          recordingFileType={this.props.recordingFileType}
          imagePicker={true}
          elementId={this.props.elementId}
          levelName={levelName}
          isStartMode={isStartMode}
        />
      );
    } else if (this.state.mode === ImageMode.ICON) {
      return <IconLibrary assetChosen={this.getAssetNameWithPrefix} />;
    } else {
      return (
        <ImageURLInput
          assetChosen={this.props.assetChosen}
          allowedExtensions={extensionFilter[this.props.typeFilter]}
          currentValue={
            this.props.currentImageType === ImageMode.URL
              ? this.props.currentValue
              : ''
          }
        />
      );
    }
  };

  render() {
    const styles = {
      root: {
        margin: '0 0 0 5px',
      },
      fileModeToggle: {
        float: 'left',
        margin: '0 20px 0 0',
        color: this.state.mode === ImageMode.FILE ? null : '#999',
        fontSize: '16px',
        cursor: 'pointer',
      },
      iconModeToggle: {
        margin: 0,
        fontSize: '16px',
        color: this.state.mode === ImageMode.ICON ? null : '#999',
        cursor: 'pointer',
      },
      urlModeToggle: {
        margin: '0 20px 0 0',
        fontSize: '16px',
        color: this.state.mode === ImageMode.URL ? null : '#999',
        cursor: 'pointer',
      },
      divider: {
        borderColor: color.purple,
        margin: '5px 0',
      },
      warning: {
        color: color.red,
        fontSize: 13,
        fontWeight: 'bold',
      },
    };

    if (this.state.mode === ImageMode.FILE) {
      styles.fileModeToggle = {
        ...styles.fileModeToggle,
        ...fontConstants['main-font-semi-bold'],
      };
    }

    if (this.state.mode === ImageMode.ICON) {
      styles.iconModeToggle = {
        ...styles.iconModeToggle,
        ...fontConstants['main-font-semi-bold'],
      };
    }

    if (this.state.mode === ImageMode.URL) {
      styles.urlModeToggle = {
        ...styles.urlModeToggle,
        ...fontConstants['main-font-semi-bold'],
      };
    }

    let modeSwitch,
      title = this.props.assetChosen ? (
        <p className="dialog-title">{i18n.chooseAssets()}</p>
      ) : (
        <p className="dialog-title">{i18n.manageAssets()}</p>
      );

    const imageTypeFilter =
      !this.props.typeFilter || this.props.typeFilter === 'image';
    if (this.props.assetChosen && imageTypeFilter) {
      modeSwitch = (
        <div id="modeSwitch">
          <span
            onClick={() => this.setMode(ImageMode.FILE)}
            style={styles.fileModeToggle}
          >
            {i18n.myFiles()}
          </span>
          <span
            onClick={() => this.setMode(ImageMode.URL)}
            style={styles.urlModeToggle}
          >
            {i18n.linkToImage()}
          </span>
          <span
            onClick={() => this.setMode(ImageMode.ICON)}
            style={styles.iconModeToggle}
          >
            {i18n.icons()}
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
    if (reduxState.javalab && reduxState.javalab.levelName) {
      levelName = reduxState.javalab.levelName;
      isStartMode = reduxState.javalab.isStartMode;
    }

    return (
      <div className="modal-content" style={styles.root}>
        {title}
        {this.props.showUnderageWarning && (
          <p style={styles.warning}>
            {i18n.warningUploadingPersonalInformation()}
          </p>
        )}
        {modeSwitch}
        {this.getBody(disableAudio, levelName, isStartMode)}
      </div>
    );
  }
}
