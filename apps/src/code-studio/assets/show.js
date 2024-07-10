import React from 'react';
import ReactDOM from 'react-dom';

import Sounds from '../../Sounds';
import loadable from '../../util/loadable';
const ImagePicker = loadable(() => import('../components/ImagePicker'));
const SoundPicker = loadable(() => import('../components/SoundPicker'));
import {RecordingFileType} from '../components/recorders';
import Dialog from '../LegacyDialog';

module.exports = {
  showAssetManager,
  hideAssetManager,
};

let dialog;

/**
 * Hides the dialog for the asset manager. Useful if you want to display another
 * dialog on the screen and need to programmatically close the asset manager.
 */
function hideAssetManager() {
  if (dialog) {
    dialog.hide();
  }
}

/**
 * Display the "Manage Assets" modal.
 * @param assetChosen {Function} Called when the user chooses an asset. The
 *   "Choose" button in the UI only appears if this optional param is provided.
 * @param typeFilter {String} The type of assets to show and allow to be
 *   uploaded.
 * @param onClose {Function} Called when the user closes the asset manager.
 * @param options {Object} Additional options.
 * @param [options.showUnderageWarning] {boolean} Warn if underage.
 * @param [options.useFilesApi] {boolean} Use files API instead of assets API.
 * @param [options.disableAudioRecording] {boolean} Do not display option to record and upload audio files
 * @param [options.recordingFileType] {string} Type of audio file to record and upload. Defaults to MP3
 * @param [options.customAllowedExtensions] {string} Custom list of allowed file extensions. Used in place of typeFilter if provided
 * @param [options.elementId] {string} Logging Purposes: which element is the image chosen for
 */
function showAssetManager(assetChosen, typeFilter, onClose, options) {
  options = options || {};
  let sounds = new Sounds();
  var codeDiv = document.createElement('div');
  var showChoseImageButton = assetChosen && typeof assetChosen === 'function';
  dialog = new Dialog({
    body: codeDiv,
    id: 'manageAssetsModal',
    onHidden: () => {
      sounds.stopAllAudio();
      if (onClose) {
        onClose();
      }
    },
  });

  let pickerType = typeFilter === 'audio' ? SoundPicker : ImagePicker;

  ReactDOM.render(
    React.createElement(pickerType, {
      typeFilter: typeFilter,
      customAllowedExtensions: options.customAllowedExtensions,
      uploadsEnabled: !dashboard.project.exceedsAbuseThreshold(),
      useFilesApi: !!options.useFilesApi,
      assetChosen: showChoseImageButton
        ? function (fileWithPath, timestamp) {
            dialog.hide();
            assetChosen(fileWithPath, timestamp);
          }
        : null,
      showUnderageWarning: !!options.showUnderageWarning,
      projectId: dashboard.project.getCurrentId(),
      soundPlayer: sounds,
      disableAudioRecording: options.disableAudioRecording,
      recordingFileType: options.recordingFileType || RecordingFileType.MP3,
      elementId: options.elementId,
      libraryOnly: options.libraryOnly,
      currentValue: options.currentValue,
      currentImageType: options.currentImageType,
    }),
    codeDiv
  );

  dialog.show();
}
