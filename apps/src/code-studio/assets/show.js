/* global dashboard */

import Sounds from '../../Sounds';
var React = require('react');
var ReactDOM = require('react-dom');
var ImagePicker = require('../components/ImagePicker');
var SoundPicker = require('../components/SoundPicker');
var LibraryPicker = require('../components/LibraryPicker');
var DatasetPicker = require('../components/DatasetPicker');
var Dialog = require('../LegacyDialog');

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
 * @param [options.elementId] {string} Logging Purposes: which element is the image chosen for
 */
module.exports = function showAssetManager(
  assetChosen,
  typeFilter,
  onClose,
  options
) {
  options = options || {};
  let sounds = new Sounds();
  var codeDiv = document.createElement('div');
  var showChoseImageButton = assetChosen && typeof assetChosen === 'function';
  var dialog = new Dialog({
    body: codeDiv,
    id: 'manageAssetsModal',
    onHidden: () => {
      sounds.stopAllAudio();
      if (onClose) {
        onClose();
      }
    }
  });

  var getPickerForType = function(typeFilter) {
    const pickersByType = {
      audio: SoundPicker,
      image: ImagePicker,
      library: LibraryPicker,
      dataset: DatasetPicker,
      default: ImagePicker
    };
    return pickersByType[typeFilter] || pickersByType.default;
  };

  const pickerType = getPickerForType(typeFilter);

  ReactDOM.render(
    React.createElement(pickerType, {
      typeFilter: typeFilter,
      uploadsEnabled: !dashboard.project.exceedsAbuseThreshold(),
      useFilesApi: !!options.useFilesApi,
      assetChosen: showChoseImageButton
        ? function(fileWithPath, timestamp) {
            dialog.hide();
            assetChosen(fileWithPath, timestamp);
          }
        : null,
      showUnderageWarning: !!options.showUnderageWarning,
      projectId: dashboard.project.getCurrentId(),
      soundPlayer: sounds,
      disableAudioRecording: options.disableAudioRecording,
      elementId: options.elementId,
      libraryOnly: options.libraryOnly
    }),
    codeDiv
  );

  dialog.show();
};
