var utils = require('./utils');
var requiredBlockUtils = require('./required_block_utils');
var StudioAppClass = require('./StudioApp');

window.StudioApp = require('./base');

if (typeof global !== 'undefined') {
  global.StudioApp = window.StudioApp;
}

var addReadyListener = require('./dom').addReadyListener;
var blocksCommon = require('./blocksCommon');

function StubDialog() {
  for (var argument in arguments) {
    console.log(argument);
  }
}
StubDialog.prototype.show = function() {
  console.log("Showing Dialog");
  console.log(this);
};
StubDialog.prototype.hide = function() {
  console.log("Hiding Dialog");
  console.log(this);
};

module.exports = function(app, levels, options) {

  // If a levelId is not provided, then options.level is specified in full.
  // Otherwise, options.level overrides resolved level on a per-property basis.
  if (options.levelId) {
    var level = levels[options.levelId];
    options.level = options.level || {};
    options.level.id = options.levelId;
    for (var prop in options.level) {
      level[prop] = options.level[prop];
    }

    if (options.level.levelBuilderRequiredBlocks) {
      level.requiredBlocks = requiredBlockUtils.makeTestsFromBuilderRequiredBlocks(
          options.level.levelBuilderRequiredBlocks);
    }

    options.level = level;
  }

  options.Dialog = options.Dialog || StubDialog;

  StudioApp.BASE_URL = options.baseUrl;
  StudioApp.CACHE_BUST = options.cacheBust;
  StudioApp.LOCALE = options.locale || StudioApp.LOCALE;
  // NOTE: editCode (which currently implies droplet) and usingBlockly are
  // currently mutually exclusive.
  StudioApp.editCode = options.level && options.level.editCode;
  StudioApp.usingBlockly = !StudioApp.editCode;
  StudioApp.cdoSounds = options.cdoSounds;

  StudioApp.assetUrl = function(path) {
    var url = options.baseUrl + path;
    /*if (StudioApp.CACHE_BUST) {
      return url + '?v=' + options.cacheBust;
    } else {*/
      return url;
    /*}*/
  };

  options.skin = options.skinsModule.load(StudioApp.assetUrl, options.skinId);

  if (StudioApp.usingBlockly) {
    var blockInstallOptions = {
      skin: options.skin,
      isK1: options.level && options.level.isK1
    };

    if (options.level && options.level.edit_blocks) {
      utils.wrapNumberValidatorsForLevelBuilder();
    }

    blocksCommon.install(Blockly, blockInstallOptions);
    options.blocksModule.install(Blockly, blockInstallOptions);
  }

  addReadyListener(function() {
    if (options.readonly) {
      if (app.initReadonly) {
        app.initReadonly(options);
      } else {
        StudioApp.initReadonly(options);
      }
    } else {
      app.init(options);
      if (options.onInitialize) {
        options.onInitialize();
      }
    }
  });
};
