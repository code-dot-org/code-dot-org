/* global dashboard */

var React = require('react');
var ReactDOM = require('react-dom');
var ImagePicker = require('../components/ImagePicker');
var Dialog = require('../dialog');

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
 */
module.exports = function (assetChosen, typeFilter, onClose, options) {
  options = options || {};
  var codeDiv = document.createElement('div');
  var showChoseImageButton = assetChosen && typeof assetChosen === 'function';
  var dialog = new Dialog({
    body: codeDiv,
    id: 'manageAssetsModal',
    onHidden: onClose
  });

  ReactDOM.render(React.createElement(ImagePicker, {
    typeFilter: typeFilter,
    uploadsEnabled: !dashboard.project.exceedsAbuseThreshold(),
    useFilesApi: options.useFilesApi,
    filesVersionId: dashboard.project.filesVersionId,
    assetsChanged: (newFilesApiVersionId) => {
      dashboard.project.filesVersionId = newFilesApiVersionId;
    },
    assetChosen: showChoseImageButton ? function (fileWithPath) {
      dialog.hide();
      assetChosen(fileWithPath);
    } : null,
    showUnderageWarning: options.showUnderageWarning,
  }), codeDiv);

  dialog.show();
};
