import {getStore, registerReducers} from './redux';
import {wrapNumberValidatorsForLevelBuilder, valueOr} from './utils';
import {makeTestsFromBuilderRequiredBlocks} from './required_block_utils';
import {singleton as studioApp} from './StudioApp';
import {generateAuthoredHints} from './authoredHintUtils';
import {addReadyListener} from './dom';
import * as blocksCommon from './blocksCommon';
import * as commonReducers from './redux/commonReducers';
import {
  installCustomBlocks,
  appendBlocksByCategory
} from '@cdo/apps/block_utils';
import logToCloud from './logToCloud';
import defaultSkinModule from './skins.js';

window.__TestInterface = {
  loadBlocks: (...args) => studioApp().loadBlocks(...args),
  getBlockXML: () =>
    Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)),
  arrangeBlockPosition: (...args) => studioApp().arrangeBlockPosition(...args),
  getDropletContents: () => studioApp().editor.getValue(),
  getDroplet: () => studioApp().editor,
  // Set to true to ignore onBeforeUnload events
  ignoreOnBeforeUnload: false,
  getStore
};

export default function(app, levels, options) {
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
      level.requiredBlocks = makeTestsFromBuilderRequiredBlocks(
        options.level.levelBuilderRequiredBlocks
      );
    }
    if (options.level.levelBuilderRecommendedBlocks) {
      level.recommendedBlocks = makeTestsFromBuilderRequiredBlocks(
        options.level.levelBuilderRecommendedBlocks
      );
    }

    if (options.level.authoredHints) {
      level.authoredHints = generateAuthoredHints(options.level.authoredHints);
    }

    options.level = level;
  }

  registerReducers(commonReducers);
  if (app.getAppReducers) {
    registerReducers(app.getAppReducers());
  }

  studioApp().configure(options);

  const skinsModule = options.skinsModule || defaultSkinModule;
  options.skin = skinsModule.load(studioApp().assetUrl, options.skinId);

  if (studioApp().isUsingBlockly()) {
    var blockInstallOptions = {
      skin: options.skin,
      isK1: options.level && options.level.isK1,
      level: options.level
    };

    if (options.level && options.level.edit_blocks) {
      wrapNumberValidatorsForLevelBuilder();
    }

    blocksCommon.install(Blockly, blockInstallOptions);
    options.blocksModule.install(Blockly, blockInstallOptions);

    if (level) {
      const levelCustomBlocksConfig = !level.customBlocks
        ? []
        : JSON.parse(level.customBlocks).map(blockConfig => ({
            config: blockConfig,
            category: 'Custom'
          }));
      const sharedBlocksConfig = level.sharedBlocks || [];
      const customBlocksConfig = [
        ...sharedBlocksConfig,
        ...levelCustomBlocksConfig
      ];
      if (customBlocksConfig.length > 0) {
        const blocksByCategory = installCustomBlocks({
          blockly: Blockly,
          blockDefinitions: customBlocksConfig,
          customInputTypes: options.blocksModule.customInputTypes
        });

        if (
          !valueOr(level.hideCustomBlocks, true) ||
          options.level.edit_blocks
        ) {
          level.toolbox = appendBlocksByCategory(
            level.toolbox,
            blocksByCategory
          );
        }
      }
    }
    Blockly.setInfiniteLoopTrap();
  }

  function onReady() {
    if (options.readonly) {
      if (app.initReadonly) {
        app.initReadonly(options);
      } else {
        studioApp().initReadonly(options);
      }
    } else {
      const appReady = app.init(options);
      const next = () => {
        if (options.onInitialize) {
          options.onInitialize();
        }
      };

      if (appReady && appReady.then) {
        appReady.then(next);
      } else {
        next();
      }
    }
    logToCloud.reportPageSize();
    logToCloud.loadFinished();
  }
  // exported apps can and need to be setup synchronously
  // since the student code executes immediately at page load
  // time.
  if (options.isExported) {
    onReady();
  } else {
    addReadyListener(onReady);
  }

  // Report app type to newRelic
  logToCloud.setCustomAttribute('appType', options && options.app);
  logToCloud.setCustomAttribute('locale', options && options.locale);
}
