/* global Dialog */
// TODO (josh) - don't pass `Dialog` into `createModalDialog`.

var React = require('react');
var AssetManager = require('./AssetManager.jsx');
var studioApp = require('../../StudioApp').singleton;

/**
 * Display the "Manage Assets" modal.
 * @param assetChosen {Function} Called when the user chooses an asset. The
 *   "Choose" button in the UI only appears if this optional param is provided.
 * @param typeFilter {String} The type of assets to show and allow to be
 *   uploaded.
 */
var showAssetManager = function(assetChosen, typeFilter) {
  var codeDiv = document.createElement('div');
  var showChoseImageButton = assetChosen && typeof assetChosen === 'function';
  var dialog = studioApp.createModalDialog({
    Dialog: Dialog,
    contentDiv: codeDiv,
    defaultBtnSelector: 'again-button',
    id: 'manageAssetsModal'
  });
  React.render(React.createElement(AssetManager, {
    typeFilter : typeFilter,
    assetChosen: showChoseImageButton ? function (fileWithPath) {
      dialog.hide();
      assetChosen(fileWithPath);
    } : null
  }), codeDiv);

  dialog.show();
};

/**
 * HACK: Ensure we have a channel ID. Remove after finishing Pivotal #90626454.
 */
module.exports = function(assetChosen, typeFilter) {
  studioApp.runButtonClickWrapper(showAssetManager.bind(null, assetChosen, typeFilter));
};
