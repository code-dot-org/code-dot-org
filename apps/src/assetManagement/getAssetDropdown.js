/* global dashboard */

var commonMsg = require('../locale');
var utils = require('../utils');

/**
 * Returns a list of options (optionally filtered by type) for code-mode
 * asset dropdowns.
 */
module.exports = function (typeFilter) {
  var options = dashboard.assets.listStore.list(typeFilter).map(function (asset) {
    return {
      text: utils.quote(asset.filename),
      display: utils.quote(asset.filename)
    };
  });
  var handleChooseClick = function (callback) {
    dashboard.assets.showAssetManager(function (filename) {
      callback(utils.quote(filename));
    }, typeFilter);
  };
  options.push({
    text: commonMsg.choosePrefix(),
    display: '<span class="chooseAssetDropdownOption">' + commonMsg.choosePrefix() + '</a>',
    click: handleChooseClick
  });
  return options;
};
