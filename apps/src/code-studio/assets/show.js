/* global dashboard */

import Sounds from "../../Sounds";
var React = require('react');
var ReactDOM = require('react-dom');
var ImagePicker = require('../components/ImagePicker');
var SoundPicker = require('../components/SoundPicker');
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
 */
module.exports = function showAssetManager(assetChosen, typeFilter, onClose, options) {
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

  let pickerType = typeFilter === 'audio' ? SoundPicker : ImagePicker;

  ReactDOM.render(React.createElement(pickerType, {
    typeFilter: typeFilter,
    uploadsEnabled: !dashboard.project.exceedsAbuseThreshold(),
    useFilesApi: !!options.useFilesApi,
    assetChosen: showChoseImageButton ? function (fileWithPath) {
      dialog.hide();
      assetChosen(fileWithPath);
    } : null,
    showUnderageWarning: !!options.showUnderageWarning,
    projectId: dashboard.project.getCurrentId(),
    soundPlayer: sounds,
    disableAudioRecording: options.disableAudioRecording
  }), codeDiv);

  dialog.show();
};
