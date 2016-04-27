/* global dashboard */

var ImagePicker = require('../components/ImagePicker');
var Dialog = require('../dialog');

/**
 * Display the "Manage Assets" modal.
 * @param assetChosen {Function} Called when the user chooses an asset. The
 *   "Choose" button in the UI only appears if this optional param is provided.
 * @param typeFilter {String} The type of assets to show and allow to be
 *   uploaded.
 * @param onClose {Function} Called when the user closes the asset manager.
 */
module.exports = function (assetChosen, typeFilter, onClose) {
  var codeDiv = document.createElement('div');
  var showChoseImageButton = assetChosen && typeof assetChosen === 'function';
  var dialog = new Dialog({
    body: codeDiv,
    id: 'manageAssetsModal',
    onHidden: onClose
  });
  ReactDOM.render(React.createElement(ImagePicker, {
    typeFilter: typeFilter,
    channelId: dashboard.project.getCurrentId(),
    uploadsEnabled: !dashboard.project.exceedsAbuseThreshold(),
    assetChosen: showChoseImageButton ? function (fileWithPath) {
      dialog.hide();
      assetChosen(fileWithPath);
    } : null
  }), codeDiv);

  dialog.show();
};
