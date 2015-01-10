var utils = require('./utils');
var _ = utils.getLodash();
var requiredBlockUtils = require('./required_block_utils');
var StudioAppClass = require('./StudioApp');

var studioAppSingleton = require('./base');
window.StudioApp = studioAppSingleton;

// TODO (br-pair) : This is to expose methods we need in the global namespace
// for testing purpose. Would be nice to eliminate this eventually.
window.__TestInterface = {
  loadBlocks: _.bind(studioAppSingleton.loadBlocks, studioAppSingleton)
};

var addReadyListener = require('./dom').addReadyListener;
var blocksCommon = require('./blocksCommon');

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

  studioAppSingleton.configure(options);

  options.skin = options.skinsModule.load(studioAppSingleton.assetUrl, options.skinId);

  if (studioAppSingleton.usingBlockly) {
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
        studioAppSingleton.initReadonly(options);
      }
    } else {
      app.init(options);
      if (options.onInitialize) {
        options.onInitialize();
      }
    }
  });
};
