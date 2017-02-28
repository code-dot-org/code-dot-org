import {getStore} from './redux';
var utils = require('./utils');
var _ = require('lodash');
var requiredBlockUtils = require('./required_block_utils');
var studioApp = require('./StudioApp').singleton;
var authoredHintUtils = require('./authoredHintUtils');

// this comment will force all apps tests to be run
// which includes coverage flagged with "unit" and "integration"

// now we will add another comment to force another run of apps coverage
// there should be no change in overall coverage since we did not change
// any code.

// TODO (br-pair) : This is to expose methods we need in the global namespace
// for testing purpose. Would be nice to eliminate this eventually.
window.__TestInterface = {
  loadBlocks: _.bind(studioApp.loadBlocks, studioApp),
  arrangeBlockPosition: _.bind(studioApp.arrangeBlockPosition, studioApp),
  getDropletContents: function () {
    return _.bind(studioApp.editor.getValue, studioApp.editor)();
  },
  getDroplet: function () {
    return studioApp.editor;
  },
  // Set to true to ignore onBeforeUnload events
  ignoreOnBeforeUnload: false,
  getStore,
};

var addReadyListener = require('./dom').addReadyListener;
var blocksCommon = require('./blocksCommon');

module.exports = function (app, levels, options) {

  // If a levelId is not provided, then options.level is specified in full.
  // Otherwise, options.level overrides resolved level on a per-property basis.
  //
  // Levelbuilder-built levels specify a levelId of "custom" while providing a
  // full level definition, ignoring the base "custom" level provided in the
  // corresponding levels.js file. Legacy levels just override the skin and/or
  // the video_key of the levels defind in levels.js. Fortunately, there aren't
  // any levels (as of this comment) that are defined half in levels.js and
  // half on the server.
  if (options.level && options.level.levelId) {
    var level = levels[options.level.levelId];
    options.level = options.level || {};
    options.level.id = options.level.levelId;
    for (var prop in options.level) {
      level[prop] = options.level[prop];
    }

    if (options.level.levelBuilderRequiredBlocks) {
      level.requiredBlocks = requiredBlockUtils.makeTestsFromBuilderRequiredBlocks(
          options.level.levelBuilderRequiredBlocks);
    }
    if (options.level.levelBuilderRecommendedBlocks) {
      level.recommendedBlocks = requiredBlockUtils.makeTestsFromBuilderRequiredBlocks(
          options.level.levelBuilderRecommendedBlocks);
    }

    if (options.level.authoredHints) {
      level.authoredHints = authoredHintUtils.generateAuthoredHints(options.level.authoredHints);
    }

    options.level = level;
  }

  studioApp.configure(options);
  studioApp.configureRedux(app.getAppReducers ? app.getAppReducers() : null);

  options.skin = options.skinsModule.load(studioApp.assetUrl, options.skinId);

  if (studioApp.isUsingBlockly()) {
    var blockInstallOptions = {
      skin: options.skin,
      isK1: options.level && options.level.isK1,
      level: options.level
    };

    if (options.level && options.level.edit_blocks) {
      utils.wrapNumberValidatorsForLevelBuilder();
    }

    blocksCommon.install(Blockly, blockInstallOptions);
    options.blocksModule.install(Blockly, blockInstallOptions);
  }

  function onReady() {
    if (options.readonly) {
      if (app.initReadonly) {
        app.initReadonly(options);
      } else {
        studioApp.initReadonly(options);
      }
    } else {
      app.init(options);
      if (options.onInitialize) {
        options.onInitialize();
      }
    }
  }
  // exported apps can and need to be setup synchronously
  // since the student code executes immediately at page load
  // time.
  if (options.isExported) {
    onReady();
  } else {
    addReadyListener(onReady);
  }
};
