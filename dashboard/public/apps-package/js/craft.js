require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/craft/main.js":[function(require,module,exports){
(function (global){
'use strict';

var appMain = require('../appMain');
window.Craft = require('./craft');
if (typeof global !== 'undefined') {
  global.Craft = window.Craft;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.craftMain = function (options) {
  options.skinsModule = skins;

  options.blocksModule = blocks;
  options.maxVisualizationWidth = 600;
  var appWidth = 434;
  var appHeight = 477;
  options.nativeVizWidth = appWidth;
  options.vizAspectRatio = appWidth / appHeight;

  appMain(window.Craft, levels, options);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkL2pzL2NyYWZ0L21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xDLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0FBQ2pDLFFBQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztDQUM3QjtBQUNELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvQixNQUFNLENBQUMsU0FBUyxHQUFHLFVBQVMsT0FBTyxFQUFFO0FBQ25DLFNBQU8sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDOztBQUU1QixTQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM5QixTQUFPLENBQUMscUJBQXFCLEdBQUcsR0FBRyxDQUFDO0FBQ3BDLE1BQUksUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUNuQixNQUFJLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDcEIsU0FBTyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFDbEMsU0FBTyxDQUFDLGNBQWMsR0FBRyxRQUFRLEdBQUcsU0FBUyxDQUFDOztBQUU5QyxTQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDeEMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuQ3JhZnQgPSByZXF1aXJlKCcuL2NyYWZ0Jyk7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZ2xvYmFsLkNyYWZ0ID0gd2luZG93LkNyYWZ0O1xufVxudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcblxud2luZG93LmNyYWZ0TWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuXG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBvcHRpb25zLm1heFZpc3VhbGl6YXRpb25XaWR0aCA9IDYwMDtcbiAgdmFyIGFwcFdpZHRoID0gNDM0O1xuICB2YXIgYXBwSGVpZ2h0ID0gNDc3O1xuICBvcHRpb25zLm5hdGl2ZVZpeldpZHRoID0gYXBwV2lkdGg7XG4gIG9wdGlvbnMudml6QXNwZWN0UmF0aW8gPSBhcHBXaWR0aCAvIGFwcEhlaWdodDtcblxuICBhcHBNYWluKHdpbmRvdy5DcmFmdCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iXX0=
},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./blocks":"/home/ubuntu/staging/apps/build/js/craft/blocks.js","./craft":"/home/ubuntu/staging/apps/build/js/craft/craft.js","./levels":"/home/ubuntu/staging/apps/build/js/craft/levels.js","./skins":"/home/ubuntu/staging/apps/build/js/craft/skins.js"}],"/home/ubuntu/staging/apps/build/js/craft/skins.js":[function(require,module,exports){
'use strict';

var skinsBase = require('../skins');

var CONFIGS = {
  craft: {}
};

exports.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  return skin;
};

},{"../skins":"/home/ubuntu/staging/apps/build/js/skins.js"}],"/home/ubuntu/staging/apps/build/js/craft/levels.js":[function(require,module,exports){
/*jshint multistr: true */
/* global $ */

'use strict';

var tb = require('../block_utils').createToolbox;
var utils = require('../utils');

var category = function category(name, blocks) {
  return '<category id="' + name + '" name="' + name + '">' + blocks + '</category>';
};

var moveForwardBlock = '<block type="craft_moveForward"></block>';

function craftBlock(type) {
  return block("craft_" + type);
}

function block(type) {
  return '<block type="' + type + '"></block>';
}

var repeatDropdown = '<block type="controls_repeat_dropdown">' + '  <title name="TIMES" config="3-10">???</title>' + '</block>';

var turnLeftBlock = '<block type="craft_turn">' + '  <title name="DIR">left</title>' + '</block>';

var turnRightBlock = '<block type="craft_turn">' + '<title name="DIR">right</title>' + '</block>';

module.exports = {
  'playground': {
    'requiredBlocks': [],
    'freePlay': true,
    'toolbox': tb(craftBlock('moveForward') + craftBlock('turnRight') + craftBlock('turnLeft') + craftBlock('destroyBlock') + craftBlock('placeBlock') + block('controls_repeat') + repeatDropdown + craftBlock('whileBlockAhead')),
    'startBlocks': '<block type="when_run" deletable="false" x="20" y="20"></block>',

    groundPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "coarseDirt", "coarseDirt", "coarseDirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],

    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", ""],

    actionPlane: ["grass", "grass", "", "", "", "", "", "", "grass", "grass", "", "grass", "", "", "", "", "", "", "", "grass", "", "", "", "logOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "logOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "logOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "logOak", "", "", ""],

    fluffPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "leavesOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "leavesOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "leavesOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "leavesOak", "", "", ""]
  },
  '1': {
    'requiredBlocks': [],
    'freePlay': true,
    'toolbox': tb(craftBlock('moveForward') + craftBlock('turnRight') + craftBlock('turnLeft')),
    'startBlocks': '<block type="when_run" deletable="false" x="20" y="20"></block>',

    playerStartPosition: [3, 4],

    groundPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "coarseDirt", "coarseDirt", "coarseDirt", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],

    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", ""],

    actionPlane: ["grass", "grass", "", "", "", "", "", "", "grass", "grass", "", "grass", "", "", "", "", "", "", "", "grass", "", "", "", "logOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "logOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "logOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "logOak", "", "", ""],

    fluffPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "leavesOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "leavesOak", "", "", "", "", "", "", "", "", "", "", "", "", "", "leavesOak", "", "", ""],

    verificationFunction: function verificationFunction(verificationAPI) {
      return verificationAPI.isPlayerNextTo("logOak");
    }

  },
  '2': {
    'requiredBlocks': [],
    'freePlay': true,
    'toolbox': tb(craftBlock('moveForward') + craftBlock('turnRight') + craftBlock('turnLeft') + craftBlock('destroyBlock') + craftBlock('placeBlock') + block('controls_repeat') + repeatDropdown + craftBlock('whileBlockAhead')),
    'startBlocks': '<block type="when_run" deletable="false" x="20" y="20"></block>',

    groundPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "planksOak", "planksOak", "planksOak", "planksOak", "grass", "grass", "grass", "coarseDirt", "coarseDirt", "coarseDirt", "planksOak", "planksOak", "planksOak", "planksOak", "grass", "grass", "grass", "grass", "grass", "grass", "planksOak", "planksOak", "planksOak", "planksOak", "grass", "grass", "grass", "grass", "grass", "grass", "planksOak", "planksOak", "planksOak", "planksOak", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],

    groundDecorationPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", ""],

    actionPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    fluffPlane: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
  },
  'custom': {
    'requiredBlocks': [],
    'freePlay': false,
    'toolbox': tb(moveForwardBlock + turnLeftBlock + turnRightBlock)
  }
};

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/craft/craft.js":[function(require,module,exports){
/*jshint -W061 */
// We use eval in our code, this allows it.
// @see https://jslinterrors.com/eval-is-evil

'use strict';
var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../locale');
var craftMsg = require('./locale');
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var GameController = require('./game/GameController');
var dom = require('../dom');
var houseLevels = require('./houseLevels');
var levelbuilderOverrides = require('./levelbuilderOverrides');

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

var MEDIA_URL = '/blockly/media/craft/';

/**
 * Create a namespace for the application.
 */
var Craft = module.exports;

var characters = {
  Steve: {
    name: "Steve",
    staticAvatar: MEDIA_URL + "Sliced_Parts/Pop_Up_Character_Steve_Neutral.png",
    smallStaticAvatar: MEDIA_URL + "Sliced_Parts/Pop_Up_Character_Steve_Neutral.png",
    failureAvatar: MEDIA_URL + "Sliced_Parts/Pop_Up_Character_Steve_Fail.png",
    winAvatar: MEDIA_URL + "Sliced_Parts/Pop_Up_Character_Steve_Win.png"
  },
  Alex: {
    name: "Alex",
    staticAvatar: MEDIA_URL + "Sliced_Parts/Pop_Up_Character_Alex_Neutral.png",
    smallStaticAvatar: MEDIA_URL + "Sliced_Parts/Pop_Up_Character_Alex_Neutral.png",
    failureAvatar: MEDIA_URL + "Sliced_Parts/Pop_Up_Character_Alex_Fail.png",
    winAvatar: MEDIA_URL + "Sliced_Parts/Pop_Up_Character_Alex_Win.png"
  }
};

var interfaceImages = {
  1: [MEDIA_URL + "Sliced_Parts/MC_Loading_Spinner.gif", MEDIA_URL + "Sliced_Parts/Game_Window_BG_Frame.png", MEDIA_URL + "Sliced_Parts/Pop_Up_Slice.png", MEDIA_URL + "Sliced_Parts/Steve_Character_Select.png", MEDIA_URL + "Sliced_Parts/Alex_Character_Select.png", MEDIA_URL + "Sliced_Parts/X_Button.png", MEDIA_URL + "Sliced_Parts/Button_Grey_Slice.png", MEDIA_URL + "Sliced_Parts/Run_Button_Up_Slice.png", MEDIA_URL + "Sliced_Parts/MC_Run_Arrow_Icon.png", MEDIA_URL + "Sliced_Parts/Run_Button_Down_Slice.png", MEDIA_URL + "Sliced_Parts/Reset_Button_Up_Slice.png", MEDIA_URL + "Sliced_Parts/MC_Reset_Arrow_Icon.png", MEDIA_URL + "Sliced_Parts/Reset_Button_Down_Slice.png", MEDIA_URL + "Sliced_Parts/Callout_Tail.png", characters.Steve.staticAvatar, characters.Steve.smallStaticAvatar, characters.Alex.staticAvatar, characters.Alex.smallStaticAvatar],
  2: [
  // TODO(bjordan): find different pre-load point for feedback images,
  // bucket by selected character
  characters.Alex.winAvatar, characters.Steve.winAvatar, characters.Alex.failureAvatar, characters.Steve.failureAvatar],
  6: [MEDIA_URL + "Sliced_Parts/House_Option_A_v3.png", MEDIA_URL + "Sliced_Parts/House_Option_B_v3.png", MEDIA_URL + "Sliced_Parts/House_Option_C_v3.png"]
};

var CHARACTER_STEVE = 'Steve';
var CHARACTER_ALEX = 'Alex';
var DEFAULT_CHARACTER = CHARACTER_STEVE;
var AUTO_LOAD_CHARACTER_ASSET_PACK = 'player' + DEFAULT_CHARACTER;

function trySetLocalStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    /**
     * localstorage .setItem in iOS Safari Private Mode always causes an
     * exception, see http://stackoverflow.com/a/14555361
     */
    if (console && console.log) {
      console.log("Couldn't set local storage item for key " + key);
    }
  }
}

/**
 * Initialize Blockly and the Craft app. Called on page load.
 */
Craft.init = function (config) {
  if (config.level.puzzle_number === 1 && config.level.stage_total === 1) {
    // Not viewing level within a script, bump puzzle # to unused one so
    // asset loading system and levelbuilder overrides don't think this is
    // level 1 or any other special level.
    config.level.puzzle_number = 999;
  }

  if (config.level.isTestLevel) {
    config.level.customSlowMotion = 0.1;
  }

  // Return the version of Internet Explorer (8+) or undefined if not IE.
  var getIEVersion = function getIEVersion() {
    return document.documentMode;
  };

  var ieVersionNumber = getIEVersion();
  if (ieVersionNumber) {
    $('body').addClass("ieVersion" + ieVersionNumber);
  }

  var bodyElement = document.body;
  bodyElement.className = bodyElement.className + " minecraft";

  if (config.level.showPopupOnLoad) {
    config.level.afterVideoBeforeInstructionsFn = function (showInstructions) {
      if (config.level.showPopupOnLoad === 'playerSelection') {
        Craft.showPlayerSelectionPopup(function (selectedPlayer) {
          Craft.clearPlayerState();
          trySetLocalStorageItem('craftSelectedPlayer', selectedPlayer);
          Craft.updateUIForCharacter(selectedPlayer);
          Craft.initializeAppLevel(config.level);
          showInstructions();
        });
      } else if (config.level.showPopupOnLoad === 'houseLayoutSelection') {
        Craft.showHouseSelectionPopup(function (selectedHouse) {
          if (!levelConfig.edit_blocks) {
            $.extend(config.level, houseLevels[selectedHouse]);

            Blockly.mainBlockSpace.clear();
            studioApp.setStartBlocks_(config, true);
          }
          Craft.initializeAppLevel(config.level);
          showInstructions();
        });
      }
    };
  }

  if (config.level.puzzle_number && levelbuilderOverrides[config.level.puzzle_number]) {
    $.extend(config.level, levelbuilderOverrides[config.level.puzzle_number]);
  }
  Craft.initialConfig = config;

  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  Craft.level = config.level;
  Craft.skin = config.skin;

  var character = characters[Craft.getCurrentCharacter()];
  config.skin.staticAvatar = character.staticAvatar;
  config.skin.smallStaticAvatar = character.smallStaticAvatar;
  config.skin.failureAvatar = character.failureAvatar;
  config.skin.winAvatar = character.winAvatar;

  var levelConfig = config.level;
  var specialLevelType = levelConfig.specialLevelType;
  switch (specialLevelType) {
    case 'houseWallBuild':
      levelConfig.blocksToStore = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "houseBottomA", "houseBottomB", "houseBottomC", "houseBottomD", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
      break;
  }

  studioApp.init($.extend({}, config, {
    forceInsertTopBlock: 'when_run',
    html: require('../templates/page.html.ejs')({
      assetUrl: studioApp.assetUrl,
      data: {
        localeDirection: studioApp.localeDirection(),
        visualization: require('./visualization.html.ejs')(),
        controls: require('./controls.html.ejs')({
          assetUrl: studioApp.assetUrl,
          shareable: config.level.shareable
        }),
        editCode: config.level.editCode,
        blockCounterClass: 'block-counter-default',
        readonlyWorkspace: config.readonlyWorkspace
      }
    }),
    loadAudio: function loadAudio() {},
    afterInject: function afterInject() {
      var slowMotionURLParam = parseFloat((location.search.split('customSlowMotion=')[1] || '').split('&')[0]);
      Craft.gameController = new GameController({
        Phaser: window.Phaser,
        containerId: 'phaser-game',
        assetRoot: Craft.skin.assetUrl(''),
        audioPlayer: {
          register: studioApp.registerAudio.bind(studioApp),
          play: studioApp.playAudio.bind(studioApp)
        },
        debug: false,
        customSlowMotion: slowMotionURLParam, // NaN if not set
        /**
         * First asset packs to load while video playing, etc.
         * Won't matter for levels without delayed level initialization
         * (due to e.g. character / house select popups).
         */
        earlyLoadAssetPacks: Craft.earlyLoadAssetsForLevel(levelConfig.puzzle_number),
        earlyLoadNiceToHaveAssetPacks: Craft.niceToHaveAssetsForLevel(levelConfig.puzzle_number)
      });

      if (!config.level.showPopupOnLoad) {
        Craft.initializeAppLevel(config.level);
      }
    },
    twitter: {
      text: "Share on Twitter",
      hashtag: "Craft"
    }
  }));

  if (config.level.puzzle_number && interfaceImages[config.level.puzzle_number]) {
    interfaceImages[config.level.puzzle_number].forEach(function (url) {
      preloadImage(url);
    });
  }
};

var preloadImage = function preloadImage(url) {
  var img = new Image();
  img.src = url;
};

Craft.characterAssetPackName = function (playerName) {
  return 'player' + playerName;
};

Craft.getCurrentCharacter = function () {
  return window.localStorage.getItem('craftSelectedPlayer') || DEFAULT_CHARACTER;
};

Craft.updateUIForCharacter = function (character) {
  Craft.initialConfig.skin.staticAvatar = characters[character].staticAvatar;
  Craft.initialConfig.skin.smallStaticAvatar = characters[character].smallStaticAvatar;
  Craft.initialConfig.skin.failureAvatar = characters[character].failureAvatar;
  Craft.initialConfig.skin.winAvatar = characters[character].winAvatar;
  studioApp.setIconsFromSkin(Craft.initialConfig.skin);
  $('#prompt-icon').attr('src', characters[character].smallStaticAvatar);
};

Craft.showPlayerSelectionPopup = function (onSelectedCallback) {
  var selectedPlayer = DEFAULT_CHARACTER;
  var popupDiv = document.createElement('div');
  popupDiv.innerHTML = require('./dialogs/playerSelection.html.ejs')({
    image: studioApp.assetUrl()
  });
  var popupDialog = studioApp.createModalDialog({
    contentDiv: popupDiv,
    defaultBtnSelector: '#choose-steve',
    onHidden: function onHidden() {
      onSelectedCallback(selectedPlayer);
    },
    id: 'craft-popup-player-selection'
  });
  dom.addClickTouchEvent($('#close-character-select')[0], (function () {
    popupDialog.hide();
  }).bind(this));
  dom.addClickTouchEvent($('#choose-steve')[0], (function () {
    selectedPlayer = CHARACTER_STEVE;
    popupDialog.hide();
  }).bind(this));
  dom.addClickTouchEvent($('#choose-alex')[0], (function () {
    selectedPlayer = CHARACTER_ALEX;
    popupDialog.hide();
  }).bind(this));
  popupDialog.show();
};

Craft.showHouseSelectionPopup = function (onSelectedCallback) {
  var popupDiv = document.createElement('div');
  popupDiv.innerHTML = require('./dialogs/houseSelection.html.ejs')({
    image: studioApp.assetUrl()
  });
  var selectedHouse = 'houseA';

  var popupDialog = studioApp.createModalDialog({
    contentDiv: popupDiv,
    defaultBtnSelector: '#choose-house-a',
    onHidden: function onHidden() {
      onSelectedCallback(selectedHouse);
    },
    id: 'craft-popup-house-selection',
    icon: characters[Craft.getCurrentCharacter()].staticAvatar
  });

  dom.addClickTouchEvent($('#close-house-select')[0], (function () {
    popupDialog.hide();
  }).bind(this));
  dom.addClickTouchEvent($('#choose-house-a')[0], (function () {
    selectedHouse = "houseA";
    popupDialog.hide();
  }).bind(this));
  dom.addClickTouchEvent($('#choose-house-b')[0], (function () {
    selectedHouse = "houseB";
    popupDialog.hide();
  }).bind(this));
  dom.addClickTouchEvent($('#choose-house-c')[0], (function () {
    selectedHouse = "houseC";
    popupDialog.hide();
  }).bind(this));

  popupDialog.show();
};

Craft.clearPlayerState = function () {
  window.localStorage.removeItem('craftHouseBlocks');
  window.localStorage.removeItem('craftPlayerInventory');
  window.localStorage.removeItem('craftSelectedPlayer');
  window.localStorage.removeItem('craftSelectedHouse');
};

Craft.onHouseSelected = function (houseType) {
  trySetLocalStorageItem('craftSelectedHouse', houseType);
};

Craft.initializeAppLevel = function (levelConfig) {
  var houseBlocks = JSON.parse(window.localStorage.getItem('craftHouseBlocks'));
  Craft.foldInCustomHouseBlocks(houseBlocks, levelConfig);

  var fluffPlane = [];
  // TODO(bjordan): remove configuration requirement in visualization
  for (var i = 0; i < (levelConfig.gridWidth || 10) * (levelConfig.gridHeight || 10); i++) {
    fluffPlane.push('');
  }

  var levelAssetPacks = {
    beforeLoad: Craft.minAssetsForLevelWithCharacter(levelConfig.puzzle_number),
    afterLoad: Craft.afterLoadAssetsForLevel(levelConfig.puzzle_number)
  };

  Craft.gameController.loadLevel({
    isDaytime: levelConfig.isDaytime,
    groundPlane: levelConfig.groundPlane,
    groundDecorationPlane: levelConfig.groundDecorationPlane,
    actionPlane: levelConfig.actionPlane,
    fluffPlane: fluffPlane,
    playerStartPosition: levelConfig.playerStartPosition,
    playerStartDirection: levelConfig.playerStartDirection,
    playerName: Craft.getCurrentCharacter(),
    assetPacks: levelAssetPacks,
    specialLevelType: levelConfig.specialLevelType,
    houseBottomRight: levelConfig.houseBottomRight,
    gridDimensions: levelConfig.gridWidth && levelConfig.gridHeight ? [levelConfig.gridWidth, levelConfig.gridHeight] : null,
    verificationFunction: eval('[' + levelConfig.verificationFunction + ']')[0] // TODO(bjordan): add to utils
  });
};

Craft.minAssetsForLevelWithCharacter = function (levelNumber) {
  return Craft.minAssetsForLevelNumber(levelNumber).concat([Craft.characterAssetPackName(Craft.getCurrentCharacter())]);
};

Craft.minAssetsForLevelNumber = function (levelNumber) {
  switch (levelNumber) {
    case 1:
      return ['levelOneAssets'];
    case 2:
      return ['levelTwoAssets'];
    case 3:
      return ['levelThreeAssets'];
    default:
      return ['allAssetsMinusPlayer'];
  }
};

Craft.afterLoadAssetsForLevel = function (levelNumber) {
  // After level loads & player starts playing, kick off further asset downloads
  switch (levelNumber) {
    case 1:
      // can disable if performance issue on early level 1
      return Craft.minAssetsForLevelNumber(2);
    case 2:
      return Craft.minAssetsForLevelNumber(3);
    default:
      // May want to push this to occur on level with video
      return ['allAssetsMinusPlayer'];
  }
};

Craft.earlyLoadAssetsForLevel = function (levelNumber) {
  switch (levelNumber) {
    case 1:
      return Craft.minAssetsForLevelNumber(levelNumber);
    default:
      return Craft.minAssetsForLevelWithCharacter(levelNumber);
  }
};

Craft.niceToHaveAssetsForLevel = function (levelNumber) {
  switch (levelNumber) {
    case 1:
      return ['playerSteve', 'playerAlex'];
    default:
      return ['allAssetsMinusPlayer'];
  }
};

/** Folds array B on top of array A */
Craft.foldInArray = function (arrayA, arrayB) {
  for (var i = 0; i < arrayA.length; i++) {
    if (arrayB[i] !== '') {
      arrayA[i] = arrayB[i];
    }
  }
};

Craft.foldInCustomHouseBlocks = function (houseBlockMap, levelConfig) {
  var planesToCustomize = [levelConfig.groundPlane, levelConfig.actionPlane];
  planesToCustomize.forEach(function (plane) {
    for (var i = 0; i < plane.length; i++) {
      var item = plane[i];
      if (item.match(/house/)) {
        plane[i] = houseBlockMap && houseBlockMap[item] ? houseBlockMap[item] : "planksBirch";
      }
    }
  });
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first true if first reset
 */
Craft.reset = function (first) {
  if (first) {
    return;
  }
  Craft.gameController.codeOrgAPI.resetAttempt();
};

Craft.phaserLoaded = function () {
  return Craft.gameController && Craft.gameController.game && !Craft.gameController.game.load.isLoading;
};

/**
 * Click the run button.  Start the program.
 */
Craft.runButtonClick = function () {
  if (!Craft.phaserLoaded()) {
    return;
  }

  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }

  studioApp.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  studioApp.attempts++;

  Craft.executeUserCode();
};

Craft.executeUserCode = function () {
  if (Craft.initialConfig.level.edit_blocks) {
    this.reportResult(true);
    return;
  }

  if (studioApp.hasExtraTopBlocks()) {
    // immediately check answer instead of executing, which will fail and
    // report top level blocks (rather than executing them)
    this.reportResult(false);
    return;
  }

  studioApp.playAudio('start');

  // Start tracing calls.
  Blockly.mainBlockSpace.traceOn(true);

  var appCodeOrgAPI = Craft.gameController.codeOrgAPI;
  appCodeOrgAPI.startCommandCollection();
  // Run user generated code, calling appCodeOrgAPI
  var code = Blockly.Generator.blockSpaceToCode('JavaScript');
  codegen.evalWith(code, {
    moveForward: function moveForward(blockID) {
      appCodeOrgAPI.moveForward(studioApp.highlight.bind(studioApp, blockID));
    },
    turnLeft: function turnLeft(blockID) {
      appCodeOrgAPI.turn(studioApp.highlight.bind(studioApp, blockID), "left");
    },
    turnRight: function turnRight(blockID) {
      appCodeOrgAPI.turn(studioApp.highlight.bind(studioApp, blockID), "right");
    },
    destroyBlock: function destroyBlock(blockID) {
      appCodeOrgAPI.destroyBlock(studioApp.highlight.bind(studioApp, blockID));
    },
    shear: function shear(blockID) {
      appCodeOrgAPI.destroyBlock(studioApp.highlight.bind(studioApp, blockID));
    },
    tillSoil: function tillSoil(blockID) {
      appCodeOrgAPI.tillSoil(studioApp.highlight.bind(studioApp, blockID));
    },
    whilePathAhead: function whilePathAhead(blockID, callback) {
      // if resurrected, move blockID be last parameter to fix "Show Code"
      appCodeOrgAPI.whilePathAhead(studioApp.highlight.bind(studioApp, blockID), '', callback);
    },
    whileBlockAhead: function whileBlockAhead(blockID, blockType, callback) {
      // if resurrected, move blockID be last parameter to fix "Show Code"
      appCodeOrgAPI.whilePathAhead(studioApp.highlight.bind(studioApp, blockID), blockType, callback);
    },
    ifLavaAhead: function ifLavaAhead(callback, blockID) {
      // if resurrected, move blockID be last parameter to fix "Show Code"
      appCodeOrgAPI.ifBlockAhead(studioApp.highlight.bind(studioApp, blockID), "lava", callback);
    },
    ifBlockAhead: function ifBlockAhead(blockType, callback, blockID) {
      appCodeOrgAPI.ifBlockAhead(studioApp.highlight.bind(studioApp, blockID), blockType, callback);
    },
    placeBlock: function placeBlock(blockType, blockID) {
      appCodeOrgAPI.placeBlock(studioApp.highlight.bind(studioApp, blockID), blockType);
    },
    plantCrop: function plantCrop(blockID) {
      appCodeOrgAPI.placeBlock(studioApp.highlight.bind(studioApp, blockID), "cropWheat");
    },
    placeTorch: function placeTorch(blockID) {
      appCodeOrgAPI.placeBlock(studioApp.highlight.bind(studioApp, blockID), "torch");
    },
    placeBlockAhead: function placeBlockAhead(blockType, blockID) {
      appCodeOrgAPI.placeInFront(studioApp.highlight.bind(studioApp, blockID), blockType);
    }
  });
  appCodeOrgAPI.startAttempt((function (success, levelModel) {
    this.reportResult(success);

    var tileIDsToStore = Craft.initialConfig.level.blocksToStore;
    if (success && tileIDsToStore) {
      var newHouseBlocks = JSON.parse(window.localStorage.getItem('craftHouseBlocks')) || {};
      for (var i = 0; i < levelModel.actionPlane.length; i++) {
        if (tileIDsToStore[i] !== '') {
          newHouseBlocks[tileIDsToStore[i]] = levelModel.actionPlane[i].blockType;
        }
      }
      trySetLocalStorageItem('craftHouseBlocks', JSON.stringify(newHouseBlocks));
    }

    var attemptInventoryTypes = levelModel.getInventoryTypes();
    var playerInventoryTypes = JSON.parse(window.localStorage.getItem('craftPlayerInventory')) || [];

    var newInventorySet = {};
    attemptInventoryTypes.concat(playerInventoryTypes).forEach(function (type) {
      newInventorySet[type] = true;
    });

    trySetLocalStorageItem('craftPlayerInventory', JSON.stringify(Object.keys(newInventorySet)));
  }).bind(this));
};

Craft.getTestResultFrom = function (success, studioTestResults) {
  if (Craft.initialConfig.level.freePlay) {
    return TestResults.FREE_PLAY;
  }

  if (studioTestResults === TestResults.LEVEL_INCOMPLETE_FAIL) {
    return TestResults.APP_SPECIFIC_FAIL;
  }

  return studioTestResults;
};

Craft.reportResult = function (success) {
  var studioTestResults = studioApp.getTestResults(success);
  var testResultType = Craft.getTestResultFrom(success, studioTestResults);

  var keepPlayingText = Craft.replayTextForResult(testResultType);

  studioApp.report({
    app: 'craft',
    level: Craft.initialConfig.level.id,
    result: Craft.initialConfig.level.freePlay ? true : success,
    testResult: testResultType,
    program: encodeURIComponent(Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace))),
    // typically delay feedback until response back
    // for things like e.g. crowdsourced hints & hint blocks
    onComplete: function onComplete(response) {
      studioApp.displayFeedback({
        keepPlayingText: keepPlayingText,
        app: 'craft',
        skin: Craft.initialConfig.skin.id,
        feedbackType: testResultType,
        response: response,
        level: Craft.initialConfig.level,
        appStrings: {
          reinfFeedbackMsg: craftMsg.reinfFeedbackMsg(),
          nextLevelMsg: craftMsg.nextLevelMsg({
            puzzleNumber: Craft.initialConfig.level.puzzle_number
          }),
          tooManyBlocksFailMsgFunction: craftMsg.tooManyBlocksFail
        },
        feedbackImage: Craft.initialConfig.level.freePlay ? Craft.gameController.getScreenshot() : null,
        showingSharing: Craft.initialConfig.level.freePlay
      });
    }
  });
};

Craft.replayTextForResult = function (testResultType) {
  if (testResultType === TestResults.FREE_PLAY) {
    return "Keep Playing";
  } else if (testResultType <= TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL) {
    return commonMsg.tryAgain();
  } else {
    return "Replay";
  }
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","./api":"/home/ubuntu/staging/apps/build/js/craft/api.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/craft/controls.html.ejs","./dialogs/houseSelection.html.ejs":"/home/ubuntu/staging/apps/build/js/craft/dialogs/houseSelection.html.ejs","./dialogs/playerSelection.html.ejs":"/home/ubuntu/staging/apps/build/js/craft/dialogs/playerSelection.html.ejs","./game/GameController":"/home/ubuntu/staging/apps/build/js/craft/game/GameController.js","./houseLevels":"/home/ubuntu/staging/apps/build/js/craft/houseLevels.js","./levelbuilderOverrides":"/home/ubuntu/staging/apps/build/js/craft/levelbuilderOverrides.js","./locale":"/home/ubuntu/staging/apps/build/js/craft/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/craft/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/craft/visualization.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div id="minecraft-frame">\n  <div id="phaser-game">\n  </div>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/locale.js":[function(require,module,exports){
"use strict";

module.exports = window.blockly.craft_locale;

},{}],"/home/ubuntu/staging/apps/build/js/craft/levelbuilderOverrides.js":[function(require,module,exports){
/*jshint multistr: true */
/* global $ */

"use strict";

var utils = require('../utils');

module.exports = {
  1: {
    appSpecificFailError: "You need to use commands to walk to the sheep.",
    tooFewBlocksMsg: "Try using more commands to walk to the sheep."
  },
  2: {
    appSpecificFailError: "To chop down a tree, walk to its trunk and use the \"destroy block\" command.",
    tooFewBlocksMsg: "Try using more commands to chop down the tree. Walk to its trunk and use the \"destroy block\" command."
  },
  3: {
    appSpecificFailError: "To gather wool from both sheep, walk to each one and use the \"shear\" command. Remember to use turn commands to reach the sheep.",
    tooFewBlocksMsg: "Try using more commands to gather wool from both sheep. Walk to each one and use the \"shear\" command."
  },
  4: {
    appSpecificFailError: "You must use the \"destroy block\" command on each of the three tree trunks.",
    tooFewBlocksMsg: "You must use the \"destroy block\" command on each of the three tree trunks."
  },
  5: {
    appSpecificFailError: "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\".",
    tooFewBlocksMsg: "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\"."
  },
  6: {
    appSpecificFailError: "Place blocks on the dirt outline of the house to complete the puzzle.",
    tooFewBlocksMsg: "Place blocks on the dirt outline of the house to complete the puzzle."
  },
  7: {
    appSpecificFailError: "Use the \"plant\" command to place crops on each patch of dark tilled soil.",
    tooFewBlocksMsg: "Use the \"plant\" command to place crops on each patch of dark tilled soil."
  },
  8: {
    appSpecificFailError: "If you touch a creeper it will explode. Sneak around them and enter your house.",
    tooFewBlocksMsg: "If you touch a creeper it will explode. Sneak around them and enter your house."
  },
  9: {
    appSpecificFailError: "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal.",
    tooFewBlocksMsg: "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal."
  },
  10: {
    appSpecificFailError: "Cover up the lava to walk across, then mine two of the iron blocks on the other side.",
    tooFewBlocksMsg: "Cover up the lava to walk across, then mine two of the iron blocks on the other side."
  },
  11: {
    appSpecificFailError: "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources.",
    tooFewBlocksMsg: "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources."
  },
  12: {
    appSpecificFailError: "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava.",
    tooFewBlocksMsg: "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava."
  },
  13: {
    appSpecificFailError: "Place \"rail\" along the dirt path leading from your door to the edge of the map.",
    tooFewBlocksMsg: "Place \"rail\" along the dirt path leading from your door to the edge of the map."
  }
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/craft/houseLevels.js":[function(require,module,exports){
/*jshint multistr: true */
/* global $ */

"use strict";

var utils = require('../utils');

module.exports = {
  houseA: {
    groundPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    verificationFunction: (function (verificationAPI) {
      return verificationAPI.solutionMapMatchesResultMap(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'any', 'any', 'any', 'any', '', '', '', '', '', '', 'any', '', '', 'any', '', '', '', '', '', '', 'any', '', '', 'any', '', '', '', '', '', '', 'any', 'any', 'any', 'any', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    }).toString(),
    blocksToStore: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'houseRightC', '', '', '', '', '', '', '', '', '', 'houseRightB', '', '', '', '', '', '', 'houseLeftA', '', '', 'houseRightA', '', '', '', '', '', '', 'houseBottomA', 'houseBottomB', 'houseBottomC', 'houseBottomD', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],

    houseBottomRight: [5, 5]
  },
  houseB: {
    "groundPlane": ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    "groundDecorationPlane": ["", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", ""],
    "actionPlane": ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "houseBottomA", "houseBottomB", "houseBottomC", "houseBottomD", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    "verificationFunction": "function (verificationAPI) {\r\n      return verificationAPI.solutionMapMatchesResultMap(\r\n            [\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"any\", \"any\", \"any\", \"any\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"any\", \"\", \"\", \"\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"any\", \"any\", \"\", \"\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"\", \"\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"any\", \"any\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"\r\n            ]);\r\n}",
    "startBlocks": "<xml><block type=\"when_run\" deletable=\"false\" movable=\"false\"><next><block type=\"controls_repeat_dropdown\"><title name=\"TIMES\" config=\"2-10\">2</title><statement name=\"DO\"><block type=\"craft_moveForward\"><next><block type=\"craft_placeBlock\"><title name=\"TYPE\">planksBirch</title></block></next></block></statement><next><block type=\"craft_turn\"><title name=\"DIR\">left</title><next><block type=\"craft_moveForward\"><next><block type=\"craft_placeBlock\"><title name=\"TYPE\">planksBirch</title><next><block type=\"craft_turn\"><title name=\"DIR\">right</title></block></next></block></next></block></next></block></next></block></next></block></xml>",

    blocksToStore: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'houseRightC', '', '', '', '', '', '', '', '', '', 'houseRightB', '', '', '', '', '', '', 'houseLeftA', '', '', 'houseRightA', '', '', '', '', '', '', 'houseBottomA', 'houseBottomB', 'houseBottomC', 'houseBottomD', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],

    houseBottomRight: [5, 5]
  },
  houseC: {
    groundPlane: ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    verificationFunction: "function (verificationAPI) {\r\n      return verificationAPI.solutionMapMatchesResultMap(\r\n            [\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"any\", \"any\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"\", \"any\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"\", \"any\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"\", \"any\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"\", \"\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"\", \"\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"any\", \"any\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"\r\n            ]);\r\n}",
    startBlocks: "<xml><block type=\"when_run\" deletable=\"false\" movable=\"false\"><next><block type=\"controls_repeat_dropdown\"><title name=\"TIMES\" config=\"2-10\">6</title><statement name=\"DO\"><block type=\"craft_moveForward\"><next><block type=\"craft_placeBlock\"><title name=\"TYPE\">planksBirch</title></block></next></block></statement></block></next></block></xml>",
    blocksToStore: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'houseRightC', '', '', '', '', '', '', '', '', '', 'houseRightB', '', '', '', '', '', '', 'houseLeftA', '', '', 'houseRightA', '', '', '', '', '', '', 'houseBottomA', 'houseBottomB', 'houseBottomC', 'houseBottomD', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    actionPlane: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'houseBottomA', 'houseBottomB', 'houseBottomC', 'houseBottomD', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    playerStartPosition: [3, 7],

    houseBottomRight: [5, 6]
  }
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/GameController.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _CommandQueueCommandQueueJs = require("./CommandQueue/CommandQueue.js");

var _CommandQueueCommandQueueJs2 = _interopRequireDefault(_CommandQueueCommandQueueJs);

var _CommandQueueBaseCommandJs = require("./CommandQueue/BaseCommand.js");

var _CommandQueueBaseCommandJs2 = _interopRequireDefault(_CommandQueueBaseCommandJs);

var _CommandQueueDestroyBlockCommandJs = require("./CommandQueue/DestroyBlockCommand.js");

var _CommandQueueDestroyBlockCommandJs2 = _interopRequireDefault(_CommandQueueDestroyBlockCommandJs);

var _CommandQueueMoveForwardCommandJs = require("./CommandQueue/MoveForwardCommand.js");

var _CommandQueueMoveForwardCommandJs2 = _interopRequireDefault(_CommandQueueMoveForwardCommandJs);

var _CommandQueueTurnCommandJs = require("./CommandQueue/TurnCommand.js");

var _CommandQueueTurnCommandJs2 = _interopRequireDefault(_CommandQueueTurnCommandJs);

var _CommandQueueWhileCommandJs = require("./CommandQueue/WhileCommand.js");

var _CommandQueueWhileCommandJs2 = _interopRequireDefault(_CommandQueueWhileCommandJs);

var _CommandQueueIfBlockAheadCommandJs = require("./CommandQueue/IfBlockAheadCommand.js");

var _CommandQueueIfBlockAheadCommandJs2 = _interopRequireDefault(_CommandQueueIfBlockAheadCommandJs);

var _LevelMVCLevelModelJs = require("./LevelMVC/LevelModel.js");

var _LevelMVCLevelModelJs2 = _interopRequireDefault(_LevelMVCLevelModelJs);

var _LevelMVCLevelViewJs = require("./LevelMVC/LevelView.js");

var _LevelMVCLevelViewJs2 = _interopRequireDefault(_LevelMVCLevelViewJs);

var _LevelMVCAssetLoaderJs = require("./LevelMVC/AssetLoader.js");

var _LevelMVCAssetLoaderJs2 = _interopRequireDefault(_LevelMVCAssetLoaderJs);

var _APICodeOrgAPIJs = require("./API/CodeOrgAPI.js");

var CodeOrgAPI = _interopRequireWildcard(_APICodeOrgAPIJs);

var GAME_WIDTH = 400;
var GAME_HEIGHT = 400;

/**
 * Initializes a new instance of a mini-game visualization
 */

var GameController = (function () {
  /**
   * @param {Object} gameControllerConfig
   * @param {String} gameControllerConfig.containerId DOM ID to mount this app
   * @param {Phaser} gameControllerConfig.Phaser Phaser package
   * @constructor
   */

  function GameController(gameControllerConfig) {
    var _this = this;

    _classCallCheck(this, GameController);

    this.DEBUG = gameControllerConfig.debug;

    // Phaser pre-initialization config
    window.PhaserGlobal = {
      disableAudio: true,
      hideBanner: !this.DEBUG
    };

    /**
     * @public {Object} codeOrgAPI - API with externally-callable methods for
     * starting an attempt, issuing commands, etc.
     */
    this.codeOrgAPI = CodeOrgAPI.get(this);

    var Phaser = gameControllerConfig.Phaser;

    /**
     * Main Phaser game instance.
     * @property {Phaser.Game}
     */
    this.game = new Phaser.Game({
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      renderer: Phaser.CANVAS,
      parent: gameControllerConfig.containerId,
      state: 'earlyLoad',
      // TODO(bjordan): remove now that using canvas?
      preserveDrawingBuffer: true // enables saving .png screengrabs
    });

    this.specialLevelType = null;
    this.queue = new _CommandQueueCommandQueueJs2["default"](this);
    this.OnCompleteCallback = null;

    this.assetRoot = gameControllerConfig.assetRoot;

    this.audioPlayer = gameControllerConfig.audioPlayer;
    this.assetLoader = new _LevelMVCAssetLoaderJs2["default"](this);
    this.earlyLoadAssetPacks = gameControllerConfig.earlyLoadAssetPacks || [];
    this.earlyLoadNiceToHaveAssetPacks = gameControllerConfig.earlyLoadNiceToHaveAssetPacks || [];

    this.resettableTimers = [];

    // Phaser "slow motion" modifier we originally tuned animations using
    this.assumedSlowMotion = 1.5;
    this.initialSlowMotion = gameControllerConfig.customSlowMotion || this.assumedSlowMotion;

    this.game.state.add('earlyLoad', {
      preload: function preload() {
        // don't let state change stomp essential asset downloads in progress
        _this.game.load.resetLocked = true;
        _this.assetLoader.loadPacks(_this.earlyLoadAssetPacks);
      },
      create: function create() {
        // optionally load some more assets if we complete early load before level load
        _this.assetLoader.loadPacks(_this.earlyLoadNiceToHaveAssetPacks);
        _this.game.load.start();
      }
    });

    this.game.state.add('levelRunner', {
      preload: this.preload.bind(this),
      create: this.create.bind(this),
      update: this.update.bind(this),
      render: this.render.bind(this)
    });
  }

  /**
   * @param {Object} levelConfig
   */

  _createClass(GameController, [{
    key: "loadLevel",
    value: function loadLevel(levelConfig) {
      this.levelData = Object.freeze(levelConfig);

      this.levelModel = new _LevelMVCLevelModelJs2["default"](this.levelData);
      this.levelView = new _LevelMVCLevelViewJs2["default"](this);
      this.specialLevelType = levelConfig.specialLevelType;

      this.game.state.start('levelRunner');
    }
  }, {
    key: "reset",
    value: function reset() {
      this.levelModel.reset();
      this.levelView.reset(this.levelModel);
      this.resettableTimers.forEach(function (timer) {
        timer.stop(true);
      });
      this.resettableTimers.length = 0;
    }
  }, {
    key: "preload",
    value: function preload() {
      this.game.load.resetLocked = true;
      this.game.time.advancedTiming = this.DEBUG;
      this.game.stage.disableVisibilityChange = true;
      this.assetLoader.loadPacks(this.levelData.assetPacks.beforeLoad);
    }
  }, {
    key: "create",
    value: function create() {
      this.levelView.create(this.levelModel);
      this.game.time.slowMotion = this.initialSlowMotion;
      this.addCheatKeys();
      this.assetLoader.loadPacks(this.levelData.assetPacks.afterLoad);
      this.game.load.start();
    }
  }, {
    key: "followingPlayer",
    value: function followingPlayer() {
      return !!this.levelData.gridDimensions;
    }
  }, {
    key: "update",
    value: function update() {
      this.queue.tick();
      this.levelView.update();

      if (this.queue.isFinished()) {
        this.handleEndState();
      }
    }
  }, {
    key: "addCheatKeys",
    value: function addCheatKeys() {
      var _this2 = this;

      this.game.input.keyboard.addKey(Phaser.Keyboard.TILDE).onUp.add(function () {
        _this2.game.input.keyboard.addKey(Phaser.Keyboard.UP).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight move forward command.");
          };
          _this2.codeOrgAPI.moveForward(dummyFunc);
        });

        _this2.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight turn right command.");
          };
          _this2.codeOrgAPI.turnRight(dummyFunc);
        });

        _this2.game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight turn left command.");
          };
          _this2.codeOrgAPI.turnLeft(dummyFunc);
        });

        _this2.game.input.keyboard.addKey(Phaser.Keyboard.P).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight placeBlock command.");
          };
          _this2.codeOrgAPI.placeBlock(dummyFunc, "logOak");
        });

        _this2.game.input.keyboard.addKey(Phaser.Keyboard.D).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight destroy block command.");
          };
          _this2.codeOrgAPI.destroyBlock(dummyFunc);
        });

        _this2.game.input.keyboard.addKey(Phaser.Keyboard.E).onUp.add(function () {
          var dummyFunc = function dummyFunc(result) {
            console.log("Execute command list done: " + result + " ");
          };
          _this2.codeOrgAPI.startAttempt(dummyFunc);
        });

        _this2.game.input.keyboard.addKey(Phaser.Keyboard.W).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("Execute While command list");
          };
          var blockType = "empty";
          var codeBlock = function codeBlock() {
            this.GameController.codeOrgAPI.moveForward(function () {
              console.log("Execute While command move block");
            });
            this.GameController.codeOrgAPI.moveForward(function () {
              console.log("Execute While command move block2");
            });
            this.GameController.codeOrgAPI.turnLeft(function () {
              console.log("Execute While command turn");
            });
          };
          _this2.codeOrgAPI.whilePathAhead(dummyFunc, blockType, codeBlock);
        });
      });
    }
  }, {
    key: "handleEndState",
    value: function handleEndState() {
      // TODO: go into success/failure animation? (or are we called by CodeOrg for that?)

      // report back to the code.org side the pass/fail result
      //     then clear the callback so we dont keep calling it
      if (this.OnCompleteCallback) {
        if (this.queue.isSucceeded()) {
          this.OnCompleteCallback(true, this.levelModel);
        } else {
          this.OnCompleteCallback(false, this.levelModel);
        }
        this.OnCompleteCallback = null;
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (this.DEBUG) {
        this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
      }
      this.levelView.render();
    }
  }, {
    key: "scaleFromOriginal",
    value: function scaleFromOriginal() {
      var _ref = this.levelData.gridDimensions || [10, 10];

      var _ref2 = _slicedToArray(_ref, 2);

      var newWidth = _ref2[0];
      var newHeight = _ref2[1];
      var originalWidth = 10;
      var originalHeight = 10;

      return [newWidth / originalWidth, newHeight / originalHeight];
    }
  }, {
    key: "getScreenshot",
    value: function getScreenshot() {
      return this.game.canvas.toDataURL("image/png");
    }

    // command processors
  }, {
    key: "moveForward",
    value: function moveForward(commandQueueItem) {
      var _this3 = this;

      var player = this.levelModel.player,
          allFoundCreepers,
          groundType,
          jumpOff;

      if (this.levelModel.canMoveForward()) {
        var wasOnBlock = player.isOnBlock;
        this.levelModel.moveForward();
        // TODO: check for Lava, Creeper, water => play approp animation & call commandQueueItem.failed()

        jumpOff = wasOnBlock && wasOnBlock != player.isOnBlock;
        if (player.isOnBlock || jumpOff) {
          groundType = this.levelModel.actionPlane[this.levelModel.yToIndex(player.position[1]) + player.position[0]].blockType;
        } else {
          groundType = this.levelModel.groundPlane[this.levelModel.yToIndex(player.position[1]) + player.position[0]].blockType;
        }

        this.levelView.playMoveForwardAnimation(player.position, player.facing, jumpOff, player.isOnBlock, groundType, function () {
          _this3.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);

          //First arg is if we found a creeper
          allFoundCreepers = _this3.levelModel.isPlayerStandingNearCreeper();

          if (_this3.levelModel.isPlayerStandingInWater()) {
            _this3.levelView.playDrownFailureAnimation(player.position, player.facing, player.isOnBlock, function () {
              commandQueueItem.failed();
            });
          } else if (_this3.levelModel.isPlayerStandingInLava()) {
            _this3.levelView.playBurnInLavaAnimation(player.position, player.facing, player.isOnBlock, function () {
              commandQueueItem.failed();
            });
          } else {
            _this3.delayBy(200, function () {
              commandQueueItem.succeeded();
            });
          }
        });
      } else {
        if (this.levelModel.isForwardBlockOfType("creeper")) {
          this.levelView.playCreeperExplodeAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(), player.isOnBlock, function () {
            commandQueueItem.failed();
          });
        } else {
          this.levelView.playBumpAnimation(player.position, player.facing, false);
          this.delayBy(800, function () {
            commandQueueItem.succeeded();
          });
        }
      }
    }
  }, {
    key: "turn",
    value: function turn(commandQueueItem, direction) {
      if (direction == -1) {
        this.levelModel.turnLeft();
      }

      if (direction == 1) {
        this.levelModel.turnRight();
      }
      this.levelView.updatePlayerDirection(this.levelModel.player.position, this.levelModel.player.facing);

      this.delayBy(800, function () {
        commandQueueItem.succeeded();
      });
    }
  }, {
    key: "destroyBlockWithoutPlayerInteraction",
    value: function destroyBlockWithoutPlayerInteraction(position) {
      var block = this.levelModel.actionPlane[this.levelModel.yToIndex(position[1]) + position[0]];
      this.levelModel.destroyBlock(position);

      if (block !== null) {
        var destroyPosition = block.position;
        var blockType = block.blockType;

        if (block.isDestroyable) {
          this.levelModel.computeShadingPlane();
          this.levelModel.computeFowPlane();
          switch (blockType) {
            case "logAcacia":
            case "treeAcacia":
              blockType = "planksAcacia";
              break;
            case "logBirch":
            case "treeBirch":
              blockType = "planksBirch";
              break;
            case "logJungle":
            case "treeJungle":
              blockType = "planksJungle";
              break;
            case "logOak":
            case "treeOak":
              blockType = "planksOak";
              break;
            case "logSpruce":
            case "treeSpruce":
              blockType = "planksSpruce";
              break;
          }
          this.levelView.actionPlaneBlocks[this.levelModel.yToIndex(destroyPosition[1]) + destroyPosition[0]].kill();
          this.levelView.playExplosionAnimation(this.levelModel.player.position, this.levelModel.player.facing, destroyPosition, blockType, function () {}, true);
        } else if (block.isUsable) {
          switch (blockType) {
            case "sheep":
              // TODO: What to do with already sheered sheep?
              this.levelView.playShearAnimation(this.levelModel.player.position, this.levelModel.player.facing, destroyPosition, blockType, function () {});
              break;
          }
        }
      }
    }
  }, {
    key: "destroyBlock",
    value: function destroyBlock(commandQueueItem) {
      var _this4 = this;

      var player = this.levelModel.player;
      if (this.levelModel.canDestroyBlockForward()) {
        var block = this.levelModel.destroyBlockForward();

        if (block !== null) {
          var destroyPosition = block.position;
          var blockType = block.blockType;

          if (block.isDestroyable) {
            this.levelModel.computeShadingPlane();
            this.levelModel.computeFowPlane();
            switch (blockType) {
              case "logAcacia":
              case "treeAcacia":
                blockType = "planksAcacia";
                break;
              case "logBirch":
              case "treeBirch":
                blockType = "planksBirch";
                break;
              case "logJungle":
              case "treeJungle":
                blockType = "planksJungle";
                break;
              case "logOak":
              case "treeOak":
                blockType = "planksOak";
                break;
              case "logSpruce":
              case "treeSpruce":
                blockType = "planksSpruce";
                break;
            }

            this.levelView.playDestroyBlockAnimation(player.position, player.facing, destroyPosition, blockType, this.levelModel.shadingPlane, this.levelModel.fowPlane, function () {
              commandQueueItem.succeeded();
            });
          } else if (block.isUsable) {
            switch (blockType) {
              case "sheep":
                // TODO: What to do with already sheered sheep?
                this.levelView.playShearSheepAnimation(player.position, player.facing, destroyPosition, blockType, function () {
                  commandQueueItem.succeeded();
                });
                break;
              default:
                commandQueueItem.succeeded();
            }
          } else {
            commandQueueItem.succeeded();
          }
        }
      } else {
        this.levelView.playPunchDestroyAirAnimation(player.position, player.facing, this.levelModel.getMoveForwardPosition(), function () {
          _this4.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
          _this4.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);
          _this4.delayBy(600, function () {
            commandQueueItem.succeeded();
          });
        });
      }
    }
  }, {
    key: "canUseTints",
    value: function canUseTints() {
      // TODO(bjordan): Remove
      // all browsers appear to work with new version of Phaser
      return true;
    }
  }, {
    key: "checkTntAnimation",
    value: function checkTntAnimation() {
      return this.specialLevelType === 'freeplay';
    }
  }, {
    key: "checkMinecartLevelEndAnimation",
    value: function checkMinecartLevelEndAnimation() {
      return this.specialLevelType === 'minecart';
    }
  }, {
    key: "checkHouseBuiltEndAnimation",
    value: function checkHouseBuiltEndAnimation() {
      return this.specialLevelType === 'houseBuild';
    }
  }, {
    key: "checkRailBlock",
    value: function checkRailBlock(blockType) {
      var checkRailBlock = this.levelModel.railMap[this.levelModel.yToIndex(this.levelModel.player.position[1]) + this.levelModel.player.position[0]];
      if (checkRailBlock !== "") {
        blockType = checkRailBlock;
      } else {
        blockType = "railsVertical";
      }
      return blockType;
    }
  }, {
    key: "placeBlock",
    value: function placeBlock(commandQueueItem, blockType) {
      var _this5 = this;

      var blockIndex = this.levelModel.yToIndex(this.levelModel.player.position[1]) + this.levelModel.player.position[0];
      var blockTypeAtPosition = this.levelModel.actionPlane[blockIndex].blockType;
      if (this.levelModel.canPlaceBlock()) {
        if (this.checkMinecartLevelEndAnimation() && blockType == "rail") {
          blockType = this.checkRailBlock(blockType);
        }

        if (blockTypeAtPosition !== "") {
          this.levelModel.destroyBlock(blockIndex);
        }
        if (this.levelModel.placeBlock(blockType)) {
          this.levelView.playPlaceBlockAnimation(this.levelModel.player.position, this.levelModel.player.facing, blockType, blockTypeAtPosition, function () {
            _this5.levelModel.computeShadingPlane();
            _this5.levelModel.computeFowPlane();
            _this5.levelView.updateShadingPlane(_this5.levelModel.shadingPlane);
            _this5.levelView.updateFowPlane(_this5.levelModel.fowPlane);
            _this5.delayBy(200, function () {
              _this5.levelView.playIdleAnimation(_this5.levelModel.player.position, _this5.levelModel.player.facing, false);
            });
            _this5.delayBy(400, function () {
              commandQueueItem.succeeded();
            });
          });
        } else {
          var signalBinding = this.levelView.playPlayerAnimation("jumpUp", this.levelModel.player.position, this.levelModel.player.facing, false).onLoop.add(function () {
            _this5.levelView.playIdleAnimation(_this5.levelModel.player.position, _this5.levelModel.player.facing, false);
            signalBinding.detach();
            _this5.delayBy(800, function () {
              commandQueueItem.succeeded();
            });
          }, this);
        }
      } else {
        commandQueueItem.failed();
      }
    }
  }, {
    key: "delayBy",
    value: function delayBy(ms, completionHandler) {
      var timer = this.game.time.create(true);
      timer.add(this.originalMsToScaled(ms), completionHandler, this);
      timer.start();
      this.resettableTimers.push(timer);
    }
  }, {
    key: "originalMsToScaled",
    value: function originalMsToScaled(ms) {
      var realMs = ms / this.assumedSlowMotion;
      return realMs * this.game.time.slowMotion;
    }
  }, {
    key: "originalFpsToScaled",
    value: function originalFpsToScaled(fps) {
      var realFps = fps * this.assumedSlowMotion;
      return realFps / this.game.time.slowMotion;
    }
  }, {
    key: "placeBlockForward",
    value: function placeBlockForward(commandQueueItem, blockType) {
      var _this6 = this;

      var forwardPosition,
          placementPlane,
          soundEffect = function soundEffect() {};

      if (!this.levelModel.canPlaceBlockForward()) {
        this.levelView.playPunchAirAnimation(this.levelModel.player.position, this.levelModel.player.facing, this.levelModel.player.position, function () {
          _this6.levelView.playIdleAnimation(_this6.levelModel.player.position, _this6.levelModel.player.facing, false);
          commandQueueItem.succeeded();
        });
        return;
      }

      forwardPosition = this.levelModel.getMoveForwardPosition();
      placementPlane = this.levelModel.getPlaneToPlaceOn(forwardPosition);
      if (this.levelModel.isBlockOfTypeOnPlane(forwardPosition, "lava", placementPlane)) {
        soundEffect = function () {
          _this6.levelView.audioPlayer.play("fizz");
        };
      }
      this.levelModel.placeBlockForward(blockType, placementPlane);
      this.levelView.playPlaceBlockInFrontAnimation(this.levelModel.player.position, this.levelModel.player.facing, this.levelModel.getMoveForwardPosition(), placementPlane, blockType, function () {
        _this6.levelModel.computeShadingPlane();
        _this6.levelModel.computeFowPlane();
        _this6.levelView.updateShadingPlane(_this6.levelModel.shadingPlane);
        _this6.levelView.updateFowPlane(_this6.levelModel.fowPlane);
        soundEffect();
        _this6.delayBy(200, function () {
          _this6.levelView.playIdleAnimation(_this6.levelModel.player.position, _this6.levelModel.player.facing, false);
        });
        _this6.delayBy(400, function () {
          commandQueueItem.succeeded();
        });
      });
    }
  }, {
    key: "checkSolution",
    value: function checkSolution(commandQueueItem) {
      var _this7 = this;

      var player = this.levelModel.player;
      this.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);

      // check the final state to see if its solved
      if (this.levelModel.isSolved()) {
        if (this.checkHouseBuiltEndAnimation()) {
          var houseBottomRight = this.levelModel.getHouseBottomRight();
          var inFrontOfDoor = [houseBottomRight[0] - 1, houseBottomRight[1] + 2];
          var bedPosition = [houseBottomRight[0], houseBottomRight[1]];
          var doorPosition = [houseBottomRight[0] - 1, houseBottomRight[1] + 1];
          this.levelModel.moveTo(inFrontOfDoor);
          this.levelView.playSuccessHouseBuiltAnimation(player.position, player.facing, player.isOnBlock, this.levelModel.houseGroundToFloorBlocks(houseBottomRight), [bedPosition, doorPosition], function () {
            commandQueueItem.succeeded();
          }, function () {
            _this7.levelModel.destroyBlock(bedPosition);
            _this7.levelModel.destroyBlock(doorPosition);
            _this7.levelModel.computeShadingPlane();
            _this7.levelModel.computeFowPlane();
            _this7.levelView.updateShadingPlane(_this7.levelModel.shadingPlane);
            _this7.levelView.updateFowPlane(_this7.levelModel.fowPlane);
          });
        } else if (this.checkMinecartLevelEndAnimation()) {
          this.levelView.playMinecartAnimation(player.position, player.facing, player.isOnBlock, function () {
            commandQueueItem.succeeded();
          }, this.levelModel.getMinecartTrack(), this.levelModel.getUnpoweredRails());
        } else if (this.checkTntAnimation()) {
          this.levelView.scaleShowWholeWorld(function () {});
          var tnt = this.levelModel.getTnt();
          var wasOnBlock = player.isOnBlock;
          this.levelView.playDestroyTntAnimation(player.position, player.facing, player.isOnBlock, this.levelModel.getTnt(), this.levelModel.shadingPlane, function () {
            if (tnt.length) {
              // Shakes camera (need to avoid contention with pan?)
              //this.game.camera.setPosition(0, 5);
              //this.game.add.tween(this.game.camera)
              //    .to({y: -10}, 40, Phaser.Easing.Sinusoidal.InOut, false, 0, 3, true)
              //    .to({y: 0}, 0)
              //    .start();
            }
            for (var i in tnt) {
              if (tnt[i].x === _this7.levelModel.player.position.x && tnt[i].y === _this7.levelModel.player.position.y) {
                _this7.levelModel.player.isOnBlock = false;
              }
              var surroundingBlocks = _this7.levelModel.getAllBorderingPositionNotOfType(tnt[i], "tnt");
              _this7.levelModel.destroyBlock(tnt[i]);
              for (var b = 1; b < surroundingBlocks.length; ++b) {
                if (surroundingBlocks[b][0]) {
                  _this7.destroyBlockWithoutPlayerInteraction(surroundingBlocks[b][1]);
                }
              }
            }
            if (!player.isOnBlock && wasOnBlock) {
              _this7.levelView.playPlayerJumpDownVerticalAnimation(player.position, player.facing);
            }
            _this7.levelModel.computeShadingPlane();
            _this7.levelModel.computeFowPlane();
            _this7.levelView.updateShadingPlane(_this7.levelModel.shadingPlane);
            _this7.levelView.updateFowPlane(_this7.levelModel.fowPlane);
            _this7.delayBy(200, function () {
              _this7.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, function () {
                commandQueueItem.succeeded();
              });
            });
          });
        } else {
          this.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, function () {
            commandQueueItem.succeeded();
          });
        }
      } else {
        this.levelView.playFailureAnimation(player.position, player.facing, player.isOnBlock, function () {
          commandQueueItem.failed();
        });
      }
    }
  }, {
    key: "isPathAhead",
    value: function isPathAhead(blockType) {
      return this.levelModel.isForwardBlockOfType(blockType);
    }
  }]);

  return GameController;
})();

window.GameController = GameController;

exports["default"] = GameController;
module.exports = exports["default"];

},{"./API/CodeOrgAPI.js":"/home/ubuntu/staging/apps/build/js/craft/game/API/CodeOrgAPI.js","./CommandQueue/BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandQueue/CommandQueue.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandQueue.js","./CommandQueue/DestroyBlockCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/DestroyBlockCommand.js","./CommandQueue/IfBlockAheadCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/IfBlockAheadCommand.js","./CommandQueue/MoveForwardCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/MoveForwardCommand.js","./CommandQueue/TurnCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/TurnCommand.js","./CommandQueue/WhileCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/WhileCommand.js","./LevelMVC/AssetLoader.js":"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/AssetLoader.js","./LevelMVC/LevelModel.js":"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/LevelModel.js","./LevelMVC/LevelView.js":"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/LevelView.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/LevelView.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _FacingDirectionJs = require("./FacingDirection.js");

var _FacingDirectionJs2 = _interopRequireDefault(_FacingDirectionJs);

var LevelView = (function () {
  function LevelView(controller) {
    _classCallCheck(this, LevelView);

    this.controller = controller;
    this.audioPlayer = controller.audioPlayer;
    this.game = controller.game;

    this.baseShading = null;

    this.playerSprite = null;
    this.playerGhost = null; // The ghost is a copy of the player sprite that sits on top of everything at 20% opacity, so the player can go under trees and still be seen.
    this.selectionIndicator = null;

    this.groundPlane = null;
    this.shadingPlane = null;
    this.actionPlane = null;
    this.fluffPlane = null;
    this.fowPlane = null;

    this.miniBlocks = {
      "dirt": ["Miniblocks", 0, 5],
      "dirtCoarse": ["Miniblocks", 6, 11],
      "sand": ["Miniblocks", 12, 17],
      "gravel": ["Miniblocks", 18, 23],
      "bricks": ["Miniblocks", 24, 29],
      "logAcacia": ["Miniblocks", 30, 35],
      "logBirch": ["Miniblocks", 36, 41],
      "logJungle": ["Miniblocks", 42, 47],
      "logOak": ["Miniblocks", 48, 53],
      "logSpruce": ["Miniblocks", 54, 59],
      "planksAcacia": ["Miniblocks", 60, 65],
      "planksBirch": ["Miniblocks", 66, 71],
      "planksJungle": ["Miniblocks", 72, 77],
      "planksOak": ["Miniblocks", 78, 83],
      "planksSpruce": ["Miniblocks", 84, 89],
      "cobblestone": ["Miniblocks", 90, 95],
      "sandstone": ["Miniblocks", 96, 101],
      "wool": ["Miniblocks", 102, 107],
      "redstoneDust": ["Miniblocks", 108, 113],
      "lapisLazuli": ["Miniblocks", 114, 119],
      "ingotIron": ["Miniblocks", 120, 125],
      "ingotGold": ["Miniblocks", 126, 131],
      "emerald": ["Miniblocks", 132, 137],
      "diamond": ["Miniblocks", 138, 143],
      "coal": ["Miniblocks", 144, 149],
      "bucketWater": ["Miniblocks", 150, 155],
      "bucketLava": ["Miniblocks", 156, 161],
      "gunPowder": ["Miniblocks", 162, 167],
      "wheat": ["Miniblocks", 168, 173],
      "potato": ["Miniblocks", 174, 179],
      "carrots": ["Miniblocks", 180, 185],

      "sheep": ["Miniblocks", 102, 107]
    };

    this.blocks = {
      "bedrock": ["blocks", "Bedrock", -13, 0],
      "bricks": ["blocks", "Bricks", -13, 0],
      "oreCoal": ["blocks", "Coal_Ore", -13, 0],
      "dirtCoarse": ["blocks", "Coarse_Dirt", -13, 0],
      "cobblestone": ["blocks", "Cobblestone", -13, 0],
      "oreDiamond": ["blocks", "Diamond_Ore", -13, 0],
      "dirt": ["blocks", "Dirt", -13, 0],
      "oreEmerald": ["blocks", "Emerald_Ore", -13, 0],
      "farmlandWet": ["blocks", "Farmland_Wet", -13, 0],
      "flowerDandelion": ["blocks", "Flower_Dandelion", -13, 0],
      "flowerOxeeye": ["blocks", "Flower_Oxeeye", -13, 0],
      "flowerRose": ["blocks", "Flower_Rose", -13, 0],
      "glass": ["blocks", "Glass", -13, 0],
      "oreGold": ["blocks", "Gold_Ore", -13, 0],
      "grass": ["blocks", "Grass", -13, 0],
      "gravel": ["blocks", "Gravel", -13, 0],
      "oreIron": ["blocks", "Iron_Ore", -13, 0],
      "oreLapis": ["blocks", "Lapis_Ore", -13, 0],
      "lava": ["blocks", "Lava_0", -13, 0],
      "logAcacia": ["blocks", "Log_Acacia", -13, 0],
      "logBirch": ["blocks", "Log_Birch", -13, 0],
      "logJungle": ["blocks", "Log_Jungle", -13, 0],
      "logOak": ["blocks", "Log_Oak", -13, 0],
      "logSpruce": ["blocks", "Log_Spruce", -13, 0],
      //"obsidian": ["blocks", "Obsidian", -13, 0],
      "planksAcacia": ["blocks", "Planks_Acacia", -13, 0],
      "planksBirch": ["blocks", "Planks_Birch", -13, 0],
      "planksJungle": ["blocks", "Planks_Jungle", -13, 0],
      "planksOak": ["blocks", "Planks_Oak", -13, 0],
      "planksSpruce": ["blocks", "Planks_Spruce", -13, 0],
      "oreRedstone": ["blocks", "Redstone_Ore", -13, 0],
      "sand": ["blocks", "Sand", -13, 0],
      "sandstone": ["blocks", "Sandstone", -13, 0],
      "stone": ["blocks", "Stone", -13, 0],
      "tnt": ["tnt", "TNTexplosion0", -80, -58],
      "water": ["blocks", "Water_0", -13, 0],
      "wool": ["blocks", "Wool_White", -13, 0],
      "wool_orange": ["blocks", "Wool_Orange", -13, 0],

      "leavesAcacia": ["leavesAcacia", "Leaves0", -42, 80],
      "leavesBirch": ["leavesBirch", "Leaves0", -100, -10],
      "leavesJungle": ["leavesJungle", "Leaves0", -69, 43],
      "leavesOak": ["leavesOak", "Leaves0", -100, 0],
      "leavesSpruce": ["leavesSpruce", "Leaves0", -76, 60],

      "watering": ["blocks", "Water_0", -13, 0],
      "cropWheat": ["blocks", "Wheat0", -13, 0],
      "torch": ["torch", "Torch0", -13, 0],

      "tallGrass": ["tallGrass", "", -13, 0],

      "lavaPop": ["lavaPop", "LavaPop01", -13, 0],
      "fire": ["fire", "", -11, 135],
      "bubbles": ["bubbles", "", -11, 135],
      "explosion": ["explosion", "", -70, 60],

      "door": ["door", "", -12, -15],

      "railsBottomLeft": ["blocks", "Rails_BottomLeft", -13, 0],
      "railsBottomRight": ["blocks", "Rails_BottomRight", -13, 0],
      "railsHorizontal": ["blocks", "Rails_Horizontal", -13, 0],
      "railsTopLeft": ["blocks", "Rails_TopLeft", -13, 0],
      "railsTopRight": ["blocks", "Rails_TopRight", -13, 0],
      "railsUnpoweredHorizontal": ["blocks", "Rails_UnpoweredHorizontal", -13, 0],
      "railsUnpoweredVertical": ["blocks", "Rails_UnpoweredVertical", -13, 0],
      "railsVertical": ["blocks", "Rails_Vertical", -13, -0],
      "railsPoweredHorizontal": ["blocks", "Rails_PoweredHorizontal", -13, 0],
      "railsPoweredVertical": ["blocks", "Rails_PoweredVertical", -13, 0],
      "railsRedstoneTorch": ["blocks", "Rails_RedstoneTorch", -12, 9]
    };

    this.actionPlaneBlocks = [];
    this.toDestroy = [];
    this.resettableTweens = [];
  }

  _createClass(LevelView, [{
    key: "yToIndex",
    value: function yToIndex(y) {
      return this.controller.levelModel.yToIndex(y);
    }
  }, {
    key: "create",
    value: function create(levelModel) {
      this.createPlanes();
      this.reset(levelModel);
    }
  }, {
    key: "reset",
    value: function reset(levelModel) {
      var player = levelModel.player;

      this.resettableTweens.forEach(function (tween) {
        tween.stop(false);
      });
      this.resettableTweens.length = 0;

      this.resetPlanes(levelModel);
      this.preparePlayerSprite(player.name);
      this.playerSprite.animations.stop();
      this.updateShadingPlane(levelModel.shadingPlane);
      this.updateFowPlane(levelModel.fowPlane);
      this.setPlayerPosition(player.position[0], player.position[1], player.isOnBlock);
      this.setSelectionIndicatorPosition(player.position[0], player.position[1]);
      this.selectionIndicator.visible = true;
      this.playIdleAnimation(player.position, player.facing, player.isOnBlock);

      if (this.controller.followingPlayer()) {
        this.game.world.setBounds(0, 0, levelModel.planeWidth * 40, levelModel.planeHeight * 40);
        this.game.camera.follow(this.playerSprite);
        this.game.world.scale.x = 1;
        this.game.world.scale.y = 1;
      }
    }
  }, {
    key: "update",
    value: function update() {
      var i;

      for (i = 0; i < this.toDestroy.length; ++i) {
        this.toDestroy[i].destroy();
      }
      this.toDestroy = [];

      if (this.playerGhost) {
        this.playerGhost.frame = this.playerSprite.frame;
        this.playerGhost.z = 1000;
      }
    }
  }, {
    key: "render",
    value: function render() {
      this.actionPlane.sort('sortOrder');
      this.fluffPlane.sort('z');
    }
  }, {
    key: "getDirectionName",
    value: function getDirectionName(facing) {
      var direction;

      switch (facing) {
        case _FacingDirectionJs2["default"].Up:
          direction = "_up";
          break;

        case _FacingDirectionJs2["default"].Right:
          direction = "_right";
          break;

        case _FacingDirectionJs2["default"].Down:
          direction = "_down";
          break;

        case _FacingDirectionJs2["default"].Left:
          direction = "_left";
          break;
      }

      return direction;
    }
  }, {
    key: "updatePlayerDirection",
    value: function updatePlayerDirection(position, facing) {
      var direction = this.getDirectionName(facing);

      this.setSelectionIndicatorPosition(position[0], position[1]);
      this.playScaledSpeed(this.playerSprite.animations, "idle" + direction);
    }
  }, {
    key: "playPlayerAnimation",
    value: function playPlayerAnimation(animationName, position, facing, isOnBlock) {
      var direction = this.getDirectionName(facing);
      this.playerSprite.sortOrder = this.yToIndex(position[1]) + 5;

      var animName = animationName + direction;
      return this.playScaledSpeed(this.playerSprite.animations, animName);
    }
  }, {
    key: "playIdleAnimation",
    value: function playIdleAnimation(position, facing, isOnBlock) {
      this.playPlayerAnimation("idle", position, facing, isOnBlock);
    }
  }, {
    key: "scaleShowWholeWorld",
    value: function scaleShowWholeWorld(completionHandler) {
      var _controller$scaleFromOriginal = this.controller.scaleFromOriginal();

      var _controller$scaleFromOriginal2 = _slicedToArray(_controller$scaleFromOriginal, 2);

      var scaleX = _controller$scaleFromOriginal2[0];
      var scaleY = _controller$scaleFromOriginal2[1];

      var scaleTween = this.addResettableTween(this.game.world.scale).to({
        x: 1 / scaleX,
        y: 1 / scaleY
      }, 1000, Phaser.Easing.Exponential.Out);

      this.game.camera.unfollow();

      var positionTween = this.addResettableTween(this.game.camera).to({
        x: 0,
        y: 0
      }, 1000, Phaser.Easing.Exponential.Out);

      scaleTween.onComplete.addOnce(function () {
        completionHandler();
      });

      positionTween.start();
      scaleTween.start();
    }
  }, {
    key: "playSuccessAnimation",
    value: function playSuccessAnimation(position, facing, isOnBlock, completionHandler) {
      var _this = this;

      this.controller.delayBy(250, function () {
        _this.audioPlayer.play("success");
        _this.onAnimationEnd(_this.playPlayerAnimation("celebrate", position, facing, isOnBlock), function () {
          completionHandler();
        });
      });
    }
  }, {
    key: "playFailureAnimation",
    value: function playFailureAnimation(position, facing, isOnBlock, completionHandler) {
      var _this2 = this;

      this.controller.delayBy(500, function () {
        _this2.audioPlayer.play("failure");
        _this2.onAnimationEnd(_this2.playPlayerAnimation("fail", position, facing, isOnBlock), function () {
          _this2.controller.delayBy(1400, completionHandler);
        });
      });
    }
  }, {
    key: "playBumpAnimation",
    value: function playBumpAnimation(position, facing, isOnBlock) {
      var _this3 = this;

      var animation = this.playPlayerAnimation("bump", position, facing, isOnBlock);
      animation.onComplete.add(function () {
        _this3.playIdleAnimation(position, facing, isOnBlock);
      });
      return animation;
    }
  }, {
    key: "playDrownFailureAnimation",
    value: function playDrownFailureAnimation(position, facing, isOnBlock, completionHandler) {
      var sprite, tween;

      this.playPlayerAnimation("fail", position, facing, isOnBlock);
      this.createBlock(this.fluffPlane, position[0], position[1], "bubbles");

      sprite = this.fluffPlane.create(0, 0, "finishOverlay");

      var _controller$scaleFromOriginal3 = this.controller.scaleFromOriginal();

      var _controller$scaleFromOriginal32 = _slicedToArray(_controller$scaleFromOriginal3, 2);

      var scaleX = _controller$scaleFromOriginal32[0];
      var scaleY = _controller$scaleFromOriginal32[1];

      sprite.scale.x = scaleX;
      sprite.scale.y = scaleY;
      sprite.alpha = 0;
      if (this.controller.canUseTints()) {
        sprite.tint = 0x324bff;
      }

      tween = this.addResettableTween(sprite).to({
        alpha: 0.5
      }, 200, Phaser.Easing.Linear.None);

      tween.onComplete.add(function () {
        completionHandler();
      });

      tween.start();
    }
  }, {
    key: "playBurnInLavaAnimation",
    value: function playBurnInLavaAnimation(position, facing, isOnBlock, completionHandler) {
      var sprite, tween;

      this.playPlayerAnimation("jumpUp", position, facing, isOnBlock);
      this.createBlock(this.fluffPlane, position[0], position[1], "fire");

      sprite = this.fluffPlane.create(0, 0, "finishOverlay");

      var _controller$scaleFromOriginal4 = this.controller.scaleFromOriginal();

      var _controller$scaleFromOriginal42 = _slicedToArray(_controller$scaleFromOriginal4, 2);

      var scaleX = _controller$scaleFromOriginal42[0];
      var scaleY = _controller$scaleFromOriginal42[1];

      sprite.scale.x = scaleX;
      sprite.scale.y = scaleY;
      sprite.alpha = 0;
      if (this.controller.canUseTints()) {
        sprite.tint = 0xd1580d;
      }

      tween = this.addResettableTween(sprite).to({
        alpha: 0.5
      }, 200, Phaser.Easing.Linear.None);

      tween.onComplete.add(function () {
        completionHandler();
      });

      tween.start();
    }
  }, {
    key: "playDestroyTntAnimation",
    value: function playDestroyTntAnimation(position, facing, isOnBlock, tntArray, newShadingPlaneData, completionHandler) {
      var _this4 = this;

      var block, lastAnimation;
      if (tntArray.length === 0) {
        completionHandler();
        return;
      }

      this.audioPlayer.play("fuse");
      for (var tnt in tntArray) {
        block = this.actionPlaneBlocks[this.coordinatesToIndex(tntArray[tnt])];
        lastAnimation = this.playScaledSpeed(block.animations, "explode");
      }

      this.onAnimationEnd(lastAnimation, function () {
        _this4.audioPlayer.play("explode");
        completionHandler();
      });
    }
  }, {
    key: "playCreeperExplodeAnimation",
    value: function playCreeperExplodeAnimation(position, facing, destroyPosition, isOnBlock, completionHandler) {
      var _this5 = this;

      this.controller.delayBy(180, function () {
        //this.onAnimationLoopOnce(
        _this5.playPlayerAnimation("bump", position, facing, false).onComplete.add(function () {
          //add creeper windup sound
          _this5.audioPlayer.play("fuse");
          _this5.playExplodingCreeperAnimation(position, facing, destroyPosition, isOnBlock, completionHandler, _this5);

          _this5.controller.delayBy(200, function () {
            _this5.onAnimationLoopOnce(_this5.playPlayerAnimation("jumpUp", position, facing, false), function () {
              _this5.playIdleAnimation(position, facing, isOnBlock);
            });
          });
        });
      });
    }
  }, {
    key: "playExplodingCreeperAnimation",
    value: function playExplodingCreeperAnimation(position, facing, destroyPosition, isOnBlock, completionHandler) {
      var _this6 = this;

      var direction = this.getDirectionName(facing);

      var blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
      var blockToExplode = this.actionPlaneBlocks[blockIndex];

      var creeperExplodeAnimation = blockToExplode.animations.getAnimation("explode");
      creeperExplodeAnimation.onComplete.add(function () {
        var borderingPositions;
        blockToExplode.kill();
        _this6.playExplosionAnimation(position, facing, destroyPosition, isOnBlock, function () {
          _this6.controller.delayBy(100, function () {
            _this6.playFailureAnimation(position, facing, false, completionHandler);
          });
        }, false);
        _this6.audioPlayer.play("explode");
        _this6.playExplosionCloudAnimation(destroyPosition);
      });

      creeperExplodeAnimation.play();
    }
  }, {
    key: "playExplosionCloudAnimation",
    value: function playExplosionCloudAnimation(position) {
      this.createBlock(this.fluffPlane, position[0], position[1], "explosion");
    }
  }, {
    key: "coordinatesToIndex",
    value: function coordinatesToIndex(coordinates) {
      return this.yToIndex(coordinates[1]) + coordinates[0];
    }
  }, {
    key: "playMinecartTurnAnimation",
    value: function playMinecartTurnAnimation(position, facing, isOnBlock, completionHandler, turnDirection) {
      var animation = this.playPlayerAnimation("mineCart_turn" + turnDirection, position, _FacingDirectionJs2["default"].Down, false);
      return animation;
    }
  }, {
    key: "playMinecartMoveForwardAnimation",
    value: function playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed) {
      var animation, tween;

      //if we loop the sfx that might be better?
      this.audioPlayer.play("minecart");
      this.playPlayerAnimation("mineCart", position, facing, false);
      tween = this.addResettableTween(this.playerSprite).to({
        x: -18 + 40 * nextPosition[0],
        y: -32 + 40 * nextPosition[1]
      }, speed, Phaser.Easing.Linear.None);
      tween.start();
      this.playerSprite.sortOrder = this.yToIndex(nextPosition[1]) + 5;

      return tween;
    }
  }, {
    key: "activateUnpoweredRails",
    value: function activateUnpoweredRails(unpoweredRails) {
      for (var railIndex = 0; railIndex < unpoweredRails.length; railIndex += 2) {
        var rail = unpoweredRails[railIndex + 1];
        var position = unpoweredRails[railIndex];
        this.createActionPlaneBlock(position, rail);
      }
    }
  }, {
    key: "playMinecartAnimation",
    value: function playMinecartAnimation(position, facing, isOnBlock, completionHandler, minecartTrack, unpoweredRails) {
      var _this7 = this;

      var animation;
      this.track = minecartTrack;
      this.i = 0;

      //start at 3,2
      this.setPlayerPosition(3, 2, isOnBlock);
      position = [3, 2];

      animation = this.playLevelEndAnimation(position, facing, isOnBlock, completionHandler, false);

      animation.onComplete.add(function () {
        _this7.activateUnpoweredRails(unpoweredRails);
        _this7.playTrack(position, facing, isOnBlock, completionHandler, minecartTrack);
      });
    }
  }, {
    key: "playTrack",
    value: function playTrack(position, facing, isOnBlock, completionHandler, minecartTrack) {
      var _this8 = this;

      if (this.i < this.track.length) {
        var direction,
            arraydirection = this.track[this.i][0],
            nextPosition = this.track[this.i][1],
            speed = this.track[this.i][3];
        facing = this.track[this.i][2];

        //turn
        if (arraydirection.substring(0, 4) === "turn") {
          direction = arraydirection.substring(5);
          this.playMinecartTurnAnimation(position, facing, isOnBlock, completionHandler, direction).onComplete.add(function () {
            _this8.playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed).onComplete.add(function () {
              position = nextPosition;
              _this8.playTrack(position, facing, isOnBlock, completionHandler, minecartTrack);
            });
          });
        } else {
          this.playMinecartMoveForwardAnimation(position, facing, isOnBlock, completionHandler, nextPosition, speed).onComplete.add(function () {
            _this8.playTrack(position, facing, isOnBlock, completionHandler, minecartTrack);
          });
        }
        this.i++;
      } else {
        this.playSuccessAnimation(position, facing, isOnBlock, function () {});
        completionHandler();
      }
    }
  }, {
    key: "addHouseBed",
    value: function addHouseBed(bottomCoordinates) {
      //Temporary, will be replaced by bed blocks
      var bedTopCoordinate = bottomCoordinates[1] - 1;
      var sprite = this.actionPlane.create(38 * bottomCoordinates[0], 35 * bedTopCoordinate, "bed");
      sprite.sortOrder = this.yToIndex(bottomCoordinates[1]);
    }
  }, {
    key: "addDoor",
    value: function addDoor(coordinates) {
      var sprite;
      var toDestroy = this.actionPlaneBlocks[this.coordinatesToIndex(coordinates)];
      this.createActionPlaneBlock(coordinates, "door");
      //Need to grab the correct blocktype from the action layer
      //And use that type block to create the ground block under the door
      sprite = this.createBlock(this.groundPlane, coordinates[0], coordinates[1], "wool_orange");
      toDestroy.kill();
      sprite.sortOrder = this.yToIndex(6);
    }
  }, {
    key: "playSuccessHouseBuiltAnimation",
    value: function playSuccessHouseBuiltAnimation(position, facing, isOnBlock, createFloor, houseObjectPositions, completionHandler, updateScreen) {
      var _this9 = this;

      //fade screen to white
      //Add house blocks
      //fade out of white
      //Play success animation on player.
      var tweenToW, tweenWToC;

      tweenToW = this.playLevelEndAnimation(position, facing, isOnBlock, function () {
        _this9.controller.delayBy(4000, completionHandler);
      }, true);
      tweenToW.onComplete.add(function () {
        _this9.audioPlayer.play("houseSuccess");
        //Change house ground to floor
        var xCoord;
        var yCoord;
        var sprite;

        for (var i = 0; i < createFloor.length; ++i) {
          xCoord = createFloor[i][1];
          yCoord = createFloor[i][2];
          /*this.groundPlane[this.coordinatesToIndex([xCoord,yCoord])].kill();*/
          sprite = _this9.createBlock(_this9.groundPlane, xCoord, yCoord, "wool_orange");
          sprite.sortOrder = _this9.yToIndex(yCoord);
        }

        _this9.addHouseBed(houseObjectPositions[0]);
        _this9.addDoor(houseObjectPositions[1]);
        _this9.groundPlane.sort('sortOrder');
        updateScreen();
      });
    }

    //Tweens in and then out of white. returns the tween to white for adding callbacks
  }, {
    key: "playLevelEndAnimation",
    value: function playLevelEndAnimation(position, facing, isOnBlock, completionHandler, playSuccessAnimation) {
      var _this10 = this;

      var sprite, tweenToW, tweenWToC;

      sprite = this.fluffPlane.create(0, 0, "finishOverlay");

      var _controller$scaleFromOriginal5 = this.controller.scaleFromOriginal();

      var _controller$scaleFromOriginal52 = _slicedToArray(_controller$scaleFromOriginal5, 2);

      var scaleX = _controller$scaleFromOriginal52[0];
      var scaleY = _controller$scaleFromOriginal52[1];

      sprite.scale.x = scaleX;
      sprite.scale.y = scaleY;
      sprite.alpha = 0;

      tweenToW = this.tweenToWhite(sprite);
      tweenWToC = this.tweenFromWhiteToClear(sprite);

      tweenToW.onComplete.add(function () {
        _this10.selectionIndicator.visible = false;
        _this10.setPlayerPosition(position[0], position[1], isOnBlock);
        tweenWToC.start();
      });
      if (playSuccessAnimation) {
        tweenWToC.onComplete.add(function () {
          _this10.playSuccessAnimation(position, facing, isOnBlock, completionHandler);
        });
      }
      tweenToW.start();

      return tweenToW;
    }
  }, {
    key: "tweenFromWhiteToClear",
    value: function tweenFromWhiteToClear(sprite) {
      var tweenWhiteToClear;

      tweenWhiteToClear = this.addResettableTween(sprite).to({
        alpha: 0.0
      }, 700, Phaser.Easing.Linear.None);
      return tweenWhiteToClear;
    }
  }, {
    key: "tweenToWhite",
    value: function tweenToWhite(sprite) {
      var tweenToWhite;

      tweenToWhite = this.addResettableTween(sprite).to({
        alpha: 1.0
      }, 300, Phaser.Easing.Linear.None);
      return tweenToWhite;
    }
  }, {
    key: "playBlockSound",
    value: function playBlockSound(groundType) {
      var oreString = groundType.substring(0, 3);
      if (groundType === "stone" || groundType === "cobblestone" || groundType === "bedrock" || oreString === "ore" || groundType === "bricks") {
        this.audioPlayer.play("stepStone");
      } else if (groundType === "grass" || groundType === "dirt" || groundType === "dirtCoarse" || groundType == "wool_orange" || groundType == "wool") {
        this.audioPlayer.play("stepGrass");
      } else if (groundType === "gravel") {
        this.audioPlayer.play("stepGravel");
      } else if (groundType === "farmlandWet") {
        this.audioPlayer.play("stepFarmland");
      } else {
        this.audioPlayer.play("stepWood");
      }
    }
  }, {
    key: "playMoveForwardAnimation",
    value: function playMoveForwardAnimation(position, facing, shouldJumpDown, isOnBlock, groundType, completionHandler) {
      var _this11 = this;

      var tween,
          oldPosition,
          newPosVec,
          animName,
          yOffset = -32;

      //stepping on stone sfx
      this.playBlockSound(groundType);

      var direction = this.getDirectionName(facing);

      this.setSelectionIndicatorPosition(position[0], position[1]);
      //make sure to render high for when moving up after placing a block
      var zOrderYIndex = position[1] + (facing === _FacingDirectionJs2["default"].Up ? 1 : 0);
      this.playerSprite.sortOrder = this.yToIndex(zOrderYIndex) + 5;
      oldPosition = [Math.trunc((this.playerSprite.position.x + 18) / 40), Math.ceil((this.playerSprite.position.y + 32) / 40)];
      newPosVec = [position[0] - oldPosition[0], position[1] - oldPosition[1]];

      //change offset for moving on top of blocks
      if (isOnBlock) {
        yOffset -= 22;
      }

      if (!shouldJumpDown) {
        animName = "walk" + direction;
        this.playScaledSpeed(this.playerSprite.animations, animName);
        tween = this.addResettableTween(this.playerSprite).to({
          x: -18 + 40 * position[0],
          y: yOffset + 40 * position[1]
        }, 200, Phaser.Easing.Linear.None);
      } else {
        animName = "jumpDown" + direction;
        this.playScaledSpeed(this.playerSprite.animations, animName);
        tween = this.addResettableTween(this.playerSprite).to({
          x: [-18 + 40 * oldPosition[0], -18 + 40 * (oldPosition[0] + newPosVec[0]), -18 + 40 * position[0]],
          y: [-32 + 40 * oldPosition[1], -32 + 40 * (oldPosition[1] + newPosVec[1]) - 50, -32 + 40 * position[1]]
        }, 300, Phaser.Easing.Linear.None).interpolation(function (v, k) {
          return Phaser.Math.bezierInterpolation(v, k);
        });

        tween.onComplete.add(function () {
          _this11.audioPlayer.play("fall");
        });
      }

      tween.onComplete.add(function () {
        completionHandler();
      });

      tween.start();

      return tween;
    }
  }, {
    key: "playPlayerJumpDownVerticalAnimation",
    value: function playPlayerJumpDownVerticalAnimation(position, direction) {
      var _this12 = this;

      var animName = "jumpDown" + this.getDirectionName(direction);
      this.playScaledSpeed(this.playerSprite.animations, animName);
      var tween = this.addResettableTween(this.playerSprite).to({
        x: [-18 + 40 * position[0], -18 + 40 * position[0], -18 + 40 * position[0]],
        y: [-32 + 40 * position[1], -32 + 40 * position[1] - 50, -32 + 40 * position[1]]
      }, 300, Phaser.Easing.Linear.None).interpolation(function (v, k) {
        return Phaser.Math.bezierInterpolation(v, k);
      });
      tween.onComplete.addOnce(function () {
        _this12.audioPlayer.play("fall");
      });
      tween.start();
    }
  }, {
    key: "playPlaceBlockAnimation",
    value: function playPlaceBlockAnimation(position, facing, blockType, blockTypeAtPosition, completionHandler) {
      var _this13 = this;

      var jumpAnimName;
      var blockIndex = this.yToIndex(position[1]) + position[0];

      if (blockType === "cropWheat" || blockType === "torch" || blockType.substring(0, 5) === "rails") {
        this.setSelectionIndicatorPosition(position[0], position[1]);

        var signalDetacher = this.playPlayerAnimation("punch", position, facing, false).onComplete.add(function () {
          var sprite;
          signalDetacher.detach();
          var blockIndex = _this13.yToIndex(position[1]) + position[0];
          sprite = _this13.createBlock(_this13.actionPlane, position[0], position[1], blockType);

          if (sprite) {
            sprite.sortOrder = _this13.yToIndex(position[1]);
          }

          _this13.actionPlaneBlocks[blockIndex] = sprite;
          completionHandler();
        });
      } else {
        this.audioPlayer.play("placeBlock");

        var direction = this.getDirectionName(facing);
        this.setSelectionIndicatorPosition(position[0], position[1]);

        jumpAnimName = "jumpUp" + direction;

        if (blockTypeAtPosition !== "") {
          this.playExplosionAnimation(position, facing, position, blockTypeAtPosition, function () {}, false);
        }

        this.playScaledSpeed(this.playerSprite.animations, jumpAnimName);
        var placementTween = this.addResettableTween(this.playerSprite).to({
          y: -55 + 40 * position[1]
        }, 125, Phaser.Easing.Cubic.EaseOut);

        placementTween.onComplete.addOnce(function () {
          placementTween = null;

          if (blockTypeAtPosition !== "") {
            _this13.actionPlaneBlocks[blockIndex].kill();
          }
          var sprite = _this13.createBlock(_this13.actionPlane, position[0], position[1], blockType);

          if (sprite) {
            sprite.sortOrder = _this13.yToIndex(position[1]);
          }

          _this13.actionPlaneBlocks[blockIndex] = sprite;
          completionHandler();
        });
        placementTween.start();
      }
    }
  }, {
    key: "playPlaceBlockInFrontAnimation",
    value: function playPlaceBlockInFrontAnimation(playerPosition, facing, blockPosition, plane, blockType, completionHandler) {
      var _this14 = this;

      this.setSelectionIndicatorPosition(blockPosition[0], blockPosition[1]);

      this.playPlayerAnimation("punch", playerPosition, facing, false).onComplete.add(function () {
        if (plane === _this14.controller.levelModel.actionPlane) {
          _this14.createActionPlaneBlock(blockPosition, blockType);
        } else {
          // re-lay ground tiles based on model
          _this14.refreshGroundPlane();
        }
        completionHandler();
      });
    }
  }, {
    key: "createActionPlaneBlock",
    value: function createActionPlaneBlock(position, blockType) {
      var blockIndex = this.yToIndex(position[1]) + position[0];
      var sprite = this.createBlock(this.actionPlane, position[0], position[1], blockType);

      if (sprite) {
        sprite.sortOrder = this.yToIndex(position[1]);
      }

      this.actionPlaneBlocks[blockIndex] = sprite;
    }
  }, {
    key: "playShearAnimation",
    value: function playShearAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
      var _this15 = this;

      var blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
      var blockToShear = this.actionPlaneBlocks[blockIndex];

      blockToShear.animations.stop(null, true);
      this.onAnimationLoopOnce(this.playScaledSpeed(blockToShear.animations, "used"), function () {
        _this15.playScaledSpeed(blockToShear.animations, "face");
      });

      this.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
    }
  }, {
    key: "playShearSheepAnimation",
    value: function playShearSheepAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
      var _this16 = this;

      var direction = this.getDirectionName(facing);
      this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);

      this.onAnimationEnd(this.playPlayerAnimation("punch", playerPosition, facing, false), function () {
        var blockIndex = _this16.yToIndex(destroyPosition[1]) + destroyPosition[0];
        var blockToShear = _this16.actionPlaneBlocks[blockIndex];

        blockToShear.animations.stop(null, true);
        _this16.onAnimationLoopOnce(_this16.playScaledSpeed(blockToShear.animations, "used"), function () {
          _this16.playScaledSpeed(blockToShear.animations, "face");
        });

        _this16.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
      });
    }
  }, {
    key: "playDestroyBlockAnimation",
    value: function playDestroyBlockAnimation(playerPosition, facing, destroyPosition, blockType, newShadingPlaneData, newFowPlaneData, completionHandler) {
      this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);

      var playerAnimation = blockType.match(/(ore|stone|clay|bricks|bedrock)/) ? "mine" : "punchDestroy";
      this.playPlayerAnimation(playerAnimation, playerPosition, facing, false);
      this.playMiningParticlesAnimation(facing, destroyPosition);
      this.playBlockDestroyOverlayAnimation(playerPosition, facing, destroyPosition, blockType, newShadingPlaneData, newFowPlaneData, completionHandler);
    }
  }, {
    key: "playPunchDestroyAirAnimation",
    value: function playPunchDestroyAirAnimation(playerPosition, facing, destroyPosition, completionHandler) {
      this.playPunchAnimation(playerPosition, facing, destroyPosition, "punchDestroy", completionHandler);
    }
  }, {
    key: "playPunchAirAnimation",
    value: function playPunchAirAnimation(playerPosition, facing, destroyPosition, completionHandler) {
      this.playPunchAnimation(playerPosition, facing, destroyPosition, "punch", completionHandler);
    }
  }, {
    key: "playPunchAnimation",
    value: function playPunchAnimation(playerPosition, facing, destroyPosition, animationType, completionHandler) {
      this.setSelectionIndicatorPosition(destroyPosition[0], destroyPosition[1]);
      this.onAnimationEnd(this.playPlayerAnimation(animationType, playerPosition, facing, false), function () {
        completionHandler();
      });
    }
  }, {
    key: "playBlockDestroyOverlayAnimation",
    value: function playBlockDestroyOverlayAnimation(playerPosition, facing, destroyPosition, blockType, newShadingPlaneData, newFowPlaneData, completionHandler) {
      var _this17 = this;

      var blockIndex = this.yToIndex(destroyPosition[1]) + destroyPosition[0];
      var blockToDestroy = this.actionPlaneBlocks[blockIndex];
      var direction = this.getDirectionName(facing);

      var destroyOverlay = this.actionPlane.create(-12 + 40 * destroyPosition[0], -22 + 40 * destroyPosition[1], "destroyOverlay", "destroy1");
      destroyOverlay.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      this.onAnimationEnd(destroyOverlay.animations.add("destroy", Phaser.Animation.generateFrameNames("destroy", 1, 12, "", 0), 30, false), function () {
        _this17.actionPlaneBlocks[blockIndex] = null;

        if (blockToDestroy.hasOwnProperty("onBlockDestroy")) {
          blockToDestroy.onBlockDestroy(blockToDestroy);
        }

        blockToDestroy.kill();
        destroyOverlay.kill();
        _this17.toDestroy.push(blockToDestroy);
        _this17.toDestroy.push(destroyOverlay);
        _this17.updateShadingPlane(newShadingPlaneData);
        _this17.updateFowPlane(newFowPlaneData);

        _this17.setSelectionIndicatorPosition(playerPosition[0], playerPosition[1]);

        _this17.audioPlayer.play('dig_wood1');
        _this17.playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, true);
      });

      this.playScaledSpeed(destroyOverlay.animations, "destroy");
    }
  }, {
    key: "playMiningParticlesAnimation",
    value: function playMiningParticlesAnimation(facing, destroyPosition) {
      var _this18 = this;

      var miningParticlesData = [[24, -100, -80], // left
      [12, -120, -80], // bottom
      [0, -60, -80], // right
      [36, -80, -60]];

      // top
      var direction = this.getDirectionName(facing);
      var miningParticlesIndex = direction === "_left" ? 0 : direction === "_bottom" ? 1 : direction === "_right" ? 2 : 3;
      var miningParticlesFirstFrame = miningParticlesData[miningParticlesIndex][0];
      var miningParticlesOffsetX = miningParticlesData[miningParticlesIndex][1];
      var miningParticlesOffsetY = miningParticlesData[miningParticlesIndex][2];
      var miningParticles = this.actionPlane.create(miningParticlesOffsetX + 40 * destroyPosition[0], miningParticlesOffsetY + 40 * destroyPosition[1], "miningParticles", "MiningParticles" + miningParticlesFirstFrame);
      miningParticles.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      this.onAnimationEnd(miningParticles.animations.add("miningParticles", Phaser.Animation.generateFrameNames("MiningParticles", miningParticlesFirstFrame, miningParticlesFirstFrame + 11, "", 0), 30, false), function () {
        miningParticles.kill();
        _this18.toDestroy.push(miningParticles);
      });
      this.playScaledSpeed(miningParticles.animations, "miningParticles");
    }
  }, {
    key: "playExplosionAnimation",
    value: function playExplosionAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler, placeBlock) {
      var _this19 = this;

      var signalBinding,
          explodeAnim = this.actionPlane.create(-36 + 40 * destroyPosition[0], -30 + 40 * destroyPosition[1], "blockExplode", "BlockBreakParticle0");

      //explodeAnim.tint = 0x324bff;
      if (this.controller.canUseTints()) {
        switch (blockType) {
          case "treeAcacia":
          case "logAcacia":
            explodeAnim.tint = 0x6c655a;
            break;
          case "treeBirch":
          case "logBirch":
            explodeAnim.tint = 0xdad6cc;
            break;
          case "treeJungle":
          case "logJungle":
            explodeAnim.tint = 0x6a4f31;
            break;
          case "treeOak":
          case "logOak":
            explodeAnim.tint = 0x675231;
            break;
          case "treeSpruce":
          case "logSpruce":
            explodeAnim.tint = 0x4b3923;
            break;

          case "planksAcacia":
            explodeAnim.tint = 0xba6337;
            break;
          case "planksBirch":
            explodeAnim.tint = 0xd7cb8d;
            break;
          case "planksJungle":
            explodeAnim.tint = 0xb88764;
            break;
          case "planksOak":
            explodeAnim.tint = 0xb4905a;
            break;
          case "planksSpruce":
            explodeAnim.tint = 0x805e36;
            break;
          case "stone":
          case "oreCoal":
          case "oreDiamond":
          case "oreIron":
          case "oreGold":
          case "oreEmerald":
          case "oreRedstone":
            explodeAnim.tint = 0xC6C6C6;
            break;
          case "grass":
          case "cropWheat":
            explodeAnim.tint = 0x5d8f23;
            break;
          case "dirt":
            explodeAnim.tint = 0x8a5e33;
            break;

          default:
            break;
        }
      }

      explodeAnim.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      this.onAnimationEnd(explodeAnim.animations.add("explode", Phaser.Animation.generateFrameNames("BlockBreakParticle", 0, 7, "", 0), 30, false), function () {
        explodeAnim.kill();
        _this19.toDestroy.push(explodeAnim);

        if (placeBlock) {
          _this19.playPlayerAnimation("idle", playerPosition, facing, false);
          _this19.playItemDropAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler);
        }
      });
      this.playScaledSpeed(explodeAnim.animations, "explode");
      if (!placeBlock) {
        completionHandler();
      }
    }
  }, {
    key: "playItemDropAnimation",
    value: function playItemDropAnimation(playerPosition, facing, destroyPosition, blockType, completionHandler) {
      var _this20 = this;

      var sprite = this.createMiniBlock(destroyPosition[0], destroyPosition[1], blockType);
      sprite.sortOrder = this.yToIndex(destroyPosition[1]) + 2;
      this.onAnimationEnd(this.playScaledSpeed(sprite.animations, "animate"), function () {
        _this20.playItemAcquireAnimation(playerPosition, facing, destroyPosition, blockType, sprite, completionHandler);
      });
    }
  }, {
    key: "playScaledSpeed",
    value: function playScaledSpeed(animationManager, name) {
      var animation = animationManager.getAnimation(name);
      if (!animation.originalFps) {
        animation.originalFps = 1000 / animation.delay;
      }
      return animationManager.play(name, this.controller.originalFpsToScaled(animation.originalFps));
    }
  }, {
    key: "playItemAcquireAnimation",
    value: function playItemAcquireAnimation(playerPosition, facing, destroyPosition, blockType, sprite, completionHandler) {
      var _this21 = this;

      var tween;

      tween = this.addResettableTween(sprite).to({
        x: -18 + 40 * playerPosition[0],
        y: -32 + 40 * playerPosition[1]
      }, 200, Phaser.Easing.Linear.None);

      tween.onComplete.add(function () {
        _this21.audioPlayer.play("collectedBlock");
        sprite.kill();
        _this21.toDestroy.push(sprite);
        completionHandler();
      });

      tween.start();
    }
  }, {
    key: "setPlayerPosition",
    value: function setPlayerPosition(x, y, isOnBlock) {
      this.playerSprite.x = -18 + 40 * x;
      this.playerSprite.y = -32 + (isOnBlock ? -23 : 0) + 40 * y;
      this.playerSprite.sortOrder = this.yToIndex(y) + 5;
    }
  }, {
    key: "setSelectionIndicatorPosition",
    value: function setSelectionIndicatorPosition(x, y) {
      this.selectionIndicator.x = -35 + 23 + 40 * x;
      this.selectionIndicator.y = -55 + 43 + 40 * y;
    }
  }, {
    key: "createPlanes",
    value: function createPlanes() {
      this.groundPlane = this.game.add.group();
      this.groundPlane.yOffset = -2;
      this.shadingPlane = this.game.add.group();
      this.shadingPlane.yOffset = -2;
      this.actionPlane = this.game.add.group();
      this.actionPlane.yOffset = -22;
      this.fluffPlane = this.game.add.group();
      this.fluffPlane.yOffset = -160;
      this.fowPlane = this.game.add.group();
      this.fowPlane.yOffset = 0;
    }
  }, {
    key: "resetPlanes",
    value: function resetPlanes(levelData) {
      var sprite, x, y, i, blockType, frameList;

      this.groundPlane.removeAll(true);
      this.actionPlane.removeAll(true);
      this.fluffPlane.removeAll(true);
      this.shadingPlane.removeAll(true);
      this.fowPlane.removeAll(true);

      this.baseShading = this.game.add.group();

      for (var shadeX = 0; shadeX < this.controller.levelModel.planeWidth * 40; shadeX += 400) {
        for (var shadeY = 0; shadeY < this.controller.levelModel.planeHeight * 40; shadeY += 400) {
          this.baseShading.create(shadeX, shadeY, 'shadeLayer');
        }
      }

      this.refreshGroundPlane();

      this.actionPlaneBlocks = [];
      for (y = 0; y < this.controller.levelModel.planeHeight; ++y) {
        for (x = 0; x < this.controller.levelModel.planeWidth; ++x) {
          var blockIndex = this.yToIndex(y) + x;
          sprite = null;

          if (!levelData.groundDecorationPlane[blockIndex].isEmpty) {
            sprite = this.createBlock(this.actionPlane, x, y, levelData.groundDecorationPlane[blockIndex].blockType);
            if (sprite) {
              sprite.sortOrder = this.yToIndex(y);
            }
          }

          sprite = null;
          if (!levelData.actionPlane[blockIndex].isEmpty) {
            blockType = levelData.actionPlane[blockIndex].blockType;
            sprite = this.createBlock(this.actionPlane, x, y, blockType);
            if (sprite !== null) {
              sprite.sortOrder = this.yToIndex(y);
            }
          }

          this.actionPlaneBlocks.push(sprite);
        }
      }

      for (y = 0; y < this.controller.levelModel.planeHeight; ++y) {
        for (x = 0; x < this.controller.levelModel.planeWidth; ++x) {
          var blockIndex = this.yToIndex(y) + x;
          if (!levelData.fluffPlane[blockIndex].isEmpty) {
            sprite = this.createBlock(this.fluffPlane, x, y, levelData.fluffPlane[blockIndex].blockType);
          }
        }
      }
    }
  }, {
    key: "refreshGroundPlane",
    value: function refreshGroundPlane() {
      this.groundPlane.removeAll(true);
      for (var y = 0; y < this.controller.levelModel.planeHeight; ++y) {
        for (var x = 0; x < this.controller.levelModel.planeWidth; ++x) {
          var blockIndex = this.yToIndex(y) + x;
          var sprite = this.createBlock(this.groundPlane, x, y, this.controller.levelModel.groundPlane[blockIndex].blockType);
          if (sprite) {
            sprite.sortOrder = this.yToIndex(y);
          }
        }
      }
    }
  }, {
    key: "updateShadingPlane",
    value: function updateShadingPlane(shadingData) {
      var index, shadowItem, sx, sy, atlas;

      this.shadingPlane.removeAll();

      this.shadingPlane.add(this.baseShading);
      this.shadingPlane.add(this.selectionIndicator);

      for (index = 0; index < shadingData.length; ++index) {
        shadowItem = shadingData[index];

        atlas = "AO";
        sx = 40 * shadowItem.x;
        sy = -22 + 40 * shadowItem.y;

        switch (shadowItem.type) {
          case "AOeffect_Left":
            sx += 26;
            sy += 22;
            break;

          case "AOeffect_Right":
            sx += 0;
            sy += 22;
            break;

          case "AOeffect_Bottom":
            sx += 0;
            sy += 22;
            break;

          case "AOeffect_BottomLeft":
            sx += 25;
            sy += 22;
            break;

          case "AOeffect_BottomRight":
            sx += 0;
            sy += 22;
            break;

          case "AOeffect_Top":
            sx += 0;
            sy += 47;
            break;

          case "AOeffect_TopLeft":
            sx += 25;
            sy += 47;
            break;

          case "AOeffect_TopRight":
            sx += 0;
            sy += 47;
            break;

          case "Shadow_Parts_Fade_base.png":
            atlas = "blockShadows";
            sx -= 52;
            sy += 0;
            break;

          case "Shadow_Parts_Fade_top.png":
            atlas = "blockShadows";
            sx -= 52;
            sy += 0;
            break;
        }

        this.shadingPlane.create(sx, sy, atlas, shadowItem.type);
      }
    }
  }, {
    key: "updateFowPlane",
    value: function updateFowPlane(fowData) {
      var index, fx, fy, atlas;

      this.fowPlane.removeAll();

      for (index = 0; index < fowData.length; ++index) {
        var fowItem = fowData[index];

        if (fowItem !== "") {
          atlas = "undergroundFow";
          fx = -40 + 40 * fowItem.x;
          fy = -40 + 40 * fowItem.y;

          switch (fowItem.type) {
            case "FogOfWar_Center":
              break;

            default:
              break;
          }

          this.fowPlane.create(fx, fy, atlas, fowItem.type);
        }
      }
    }
  }, {
    key: "playRandomPlayerIdle",
    value: function playRandomPlayerIdle(facing) {
      var facingName, rand, animationName;

      facingName = this.getDirectionName(facing);
      rand = Math.trunc(Math.random() * 4) + 1;

      switch (rand) {
        case 1:
          animationName = "idle";
          break;
        case 2:
          animationName = "lookLeft";
          break;
        case 3:
          animationName = "lookRight";
          break;
        case 4:
          animationName = "lookAtCam";
          break;
        default:
      }

      animationName += facingName;
      this.playScaledSpeed(this.playerSprite.animations, animationName);
    }
  }, {
    key: "generatePlayerCelebrateFrames",
    value: function generatePlayerCelebrateFrames() {
      var frameList = [],
          i;

      //Crouch Down
      /* frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 29, 32, "", 3));
       //Crouch Down
       frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 29, 32, "", 3));
       //turn and pause
       for (i = 0; i < 4; ++i) {
       frameList = frameList.concat("Player_061");
       }
       for (i = 0; i < 2; ++i) {
       frameList = frameList.concat("Player_149");
       }
           //Crouch Up
       frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 149, 152, "", 3));
       //Crouch Up
       frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 149, 152, "", 3));*/

      ///////////////////////////Alternative Animation/////////////////////
      //Face Down
      for (i = 0; i < 6; ++i) {
        frameList.push("Player_001");
      }
      //Crouch Left
      //frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 209, 212, "", 3));
      frameList = frameList.concat("Player_209");
      frameList = frameList.concat("Player_209");
      frameList = frameList.concat("Player_211");
      frameList = frameList.concat("Player_211");
      frameList = frameList.concat("Player_211");
      frameList = frameList.concat("Player_211");
      frameList = frameList.concat("Player_209");
      frameList = frameList.concat("Player_209");
      frameList = frameList.concat("Player_209");
      //Crouch Left
      frameList = frameList.concat("Player_211");
      frameList = frameList.concat("Player_211");
      frameList = frameList.concat("Player_211");
      frameList = frameList.concat("Player_211");
      frameList = frameList.concat("Player_209");
      frameList = frameList.concat("Player_209");
      frameList = frameList.concat("Player_209");
      //Crouch Right
      //frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 89, 92, "", 3));
      frameList = frameList.concat("Player_089");
      frameList = frameList.concat("Player_089");
      frameList = frameList.concat("Player_091");
      frameList = frameList.concat("Player_091");
      frameList = frameList.concat("Player_091");
      frameList = frameList.concat("Player_091");
      frameList = frameList.concat("Player_089");
      frameList = frameList.concat("Player_089");
      frameList = frameList.concat("Player_089");
      //Crouch Right
      frameList = frameList.concat("Player_091");
      frameList = frameList.concat("Player_091");
      frameList = frameList.concat("Player_091");
      frameList = frameList.concat("Player_091");
      frameList = frameList.concat("Player_089");
      frameList = frameList.concat("Player_089");
      frameList = frameList.concat("Player_089");
      //Face Down (for pause)
      for (i = 0; i < 3; ++i) {
        frameList.push("Player_001");
      }
      //////////////////////////////////////////////////////////////////

      //Jump success
      /*frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 285, 296, "", 3));
      //frolick celebrate
      frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 37, 44, "", 3));*/
      //look at cam
      frameList = frameList.concat(Phaser.Animation.generateFrameNames("Player_", 263, 262, "", 3));
      for (i = 0; i < 5; ++i) {
        frameList.push("Player_262");
      }
      return frameList;
    }
  }, {
    key: "generateFramesWithEndDelay",
    value: function generateFramesWithEndDelay(frameName, startFrame, endFrame, endFrameFullName, buffer, frameDelay) {
      var frameList = Phaser.Animation.generateFrameNames(frameName, startFrame, endFrame, "", buffer);
      for (var i = 0; i < frameDelay; ++i) {
        frameList.push(endFrameFullName);
      }
      return frameList;
    }
  }, {
    key: "preparePlayerSprite",
    value: function preparePlayerSprite(playerName) {
      var _this22 = this;

      var frameList,
          genFrames,
          i,
          singlePunch,
          jumpCelebrateFrames,
          idleFrameRate = 10;

      var frameRate = 20;

      this.playerSprite = this.actionPlane.create(0, 0, "player" + playerName, 'Player_121');
      if (this.controller.followingPlayer()) {
        this.game.camera.follow(this.playerSprite);
      }
      this.playerGhost = this.fluffPlane.create(0, 0, "player" + playerName, 'Player_121');
      this.playerGhost.parent = this.playerSprite;
      this.playerGhost.alpha = 0.2;

      this.selectionIndicator = this.shadingPlane.create(24, 44, 'selectionIndicator');

      jumpCelebrateFrames = Phaser.Animation.generateFrameNames("Player_", 285, 296, "", 3);

      frameList = [];

      frameList.push("Player_001");
      frameList.push("Player_003");
      frameList.push("Player_001");
      frameList.push("Player_007");
      frameList.push("Player_009");
      frameList.push("Player_007");
      for (i = 0; i < 5; ++i) {
        frameList.push("Player_001");
      }

      this.playerSprite.animations.add('idle_down', frameList, frameRate / 3, false).onComplete.add(function () {
        _this22.playRandomPlayerIdle(_FacingDirectionJs2["default"].Down);
      });
      frameList = this.generateFramesWithEndDelay("Player_", 6, 5, "Player_005", 3, 5);
      frameList.push("Player_006");
      this.playerSprite.animations.add('lookLeft_down', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_down");
      });
      frameList = this.generateFramesWithEndDelay("Player_", 12, 11, "Player_011", 3, 5);
      frameList.push("Player_012");
      this.playerSprite.animations.add('lookRight_down', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_down");
      });
      frameList = this.generateFramesWithEndDelay("Player_", 263, 262, "Player_262", 3, 5);
      frameList.push("Player_263");
      this.playerSprite.animations.add('lookAtCam_down', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_down");
      });
      frameList = [];
      for (i = 0; i < 13; ++i) {
        frameList.push("Player_001");
      }
      this.playerSprite.animations.add('idlePause_down', frameList, frameRate / 3, false).onComplete.add(function () {
        _this22.playRandomPlayerIdle(_FacingDirectionJs2["default"].Down);
      });

      this.playerSprite.animations.add('walk_down', Phaser.Animation.generateFrameNames("Player_", 13, frameRate, "", 3), frameRate, true);
      singlePunch = Phaser.Animation.generateFrameNames("Player_", 21, 24, "", 3);
      this.playerSprite.animations.add('punch_down', singlePunch, frameRate, false).onComplete.add(function () {
        _this22.audioPlayer.play("punch");
      });
      this.playerSprite.animations.add('punchDestroy_down', singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
      this.playerSprite.animations.add('hurt_down', Phaser.Animation.generateFrameNames("Player_", 25, 28, "", 3), frameRate, true);
      this.playerSprite.animations.add('crouch_down', Phaser.Animation.generateFrameNames("Player_", 29, 32, "", 3), frameRate, true);
      this.playerSprite.animations.add('jumpUp_down', Phaser.Animation.generateFrameNames("Player_", 33, 36, "", 3), frameRate / 2, true);
      this.playerSprite.animations.add('fail_down', Phaser.Animation.generateFrameNames("Player_", 45, 48, "", 3), frameRate, false);
      this.playerSprite.animations.add('celebrate_down', this.generatePlayerCelebrateFrames(), frameRate / 2, false);
      this.playerSprite.animations.add('bump_down', Phaser.Animation.generateFrameNames("Player_", 49, 54, "", 3), frameRate, false).onStart.add(function () {
        _this22.audioPlayer.play("bump");
      });
      this.playerSprite.animations.add('jumpDown_down', Phaser.Animation.generateFrameNames("Player_", 55, 60, "", 3), frameRate, true);
      this.playerSprite.animations.add('mine_down', Phaser.Animation.generateFrameNames("Player_", 241, 244, "", 3), frameRate, true);
      this.playerSprite.animations.add('mineCart_down', Phaser.Animation.generateFrameNames("Minecart_", 5, 5, "", 2), frameRate, false);
      this.playerSprite.animations.add('mineCart_turnleft_down', Phaser.Animation.generateFrameNames("Minecart_", 6, 6, "", 2), frameRate, false);
      this.playerSprite.animations.add('mineCart_turnright_down', Phaser.Animation.generateFrameNames("Minecart_", 12, 12, "", 2), frameRate, false);

      frameList = [];

      frameList.push("Player_061");
      frameList.push("Player_063");
      frameList.push("Player_061");
      frameList.push("Player_067");
      frameList.push("Player_069");
      frameList.push("Player_067");
      for (i = 0; i < 5; ++i) {
        frameList.push("Player_061");
      }

      this.playerSprite.animations.add('idle_right', frameList, frameRate / 3, false).onComplete.add(function () {
        _this22.playRandomPlayerIdle(_FacingDirectionJs2["default"].Right);
      });
      frameList = this.generateFramesWithEndDelay("Player_", 66, 65, "Player_065", 3, 5);
      frameList.push("Player_066");
      this.playerSprite.animations.add('lookLeft_right', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_right");
      });
      frameList = this.generateFramesWithEndDelay("Player_", 72, 71, "Player_071", 3, 5);
      frameList.push("Player_072");
      this.playerSprite.animations.add('lookRight_right', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_right");
      });
      frameList = this.generateFramesWithEndDelay("Player_", 270, 269, "Player_269", 3, 5);
      frameList.push("Player_270");
      this.playerSprite.animations.add('lookAtCam_right', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_right");
      });
      frameList = [];
      for (i = 0; i < 13; ++i) {
        frameList.push("Player_061");
      }
      this.playerSprite.animations.add('idlePause_right', frameList, frameRate / 3, false).onComplete.add(function () {
        _this22.playRandomPlayerIdle(_FacingDirectionJs2["default"].Right);
      });

      this.playerSprite.animations.add('walk_right', Phaser.Animation.generateFrameNames("Player_", 73, 80, "", 3), frameRate, true);
      singlePunch = Phaser.Animation.generateFrameNames("Player_", 81, 84, "", 3);
      this.playerSprite.animations.add('punch_right', singlePunch, frameRate, false).onComplete.add(function () {
        _this22.audioPlayer.play("punch");
      });
      this.playerSprite.animations.add('punchDestroy_right', singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
      this.playerSprite.animations.add('hurt_right', Phaser.Animation.generateFrameNames("Player_", 85, 88, "", 3), frameRate, true);
      this.playerSprite.animations.add('crouch_right', Phaser.Animation.generateFrameNames("Player_", 89, 92, "", 3), frameRate, true);
      this.playerSprite.animations.add('jumpUp_right', Phaser.Animation.generateFrameNames("Player_", 93, 96, "", 3), frameRate / 2, true);
      this.playerSprite.animations.add('fail_right', Phaser.Animation.generateFrameNames("Player_", 105, 108, "", 3), frameRate / 2, false);
      this.playerSprite.animations.add('celebrate_right', this.generatePlayerCelebrateFrames(), frameRate / 2, false);
      this.playerSprite.animations.add('bump_right', Phaser.Animation.generateFrameNames("Player_", 109, 114, "", 3), frameRate, false).onStart.add(function () {
        _this22.audioPlayer.play("bump");
      });
      this.playerSprite.animations.add('jumpDown_right', Phaser.Animation.generateFrameNames("Player_", 115, 120, "", 3), frameRate, true);
      this.playerSprite.animations.add('mine_right', Phaser.Animation.generateFrameNames("Player_", 245, 248, "", 3), frameRate, true);
      this.playerSprite.animations.add('mineCart_right', Phaser.Animation.generateFrameNames("Minecart_", 7, 7, "", 2), frameRate, false);

      frameList = [];

      frameList.push("Player_181");
      frameList.push("Player_183");
      frameList.push("Player_181");
      frameList.push("Player_187");
      frameList.push("Player_189");
      frameList.push("Player_187");
      for (i = 0; i < 5; ++i) {
        frameList.push("Player_181");
      }

      this.playerSprite.animations.add('idle_left', frameList, frameRate / 3, false).onComplete.add(function () {
        _this22.playRandomPlayerIdle(_FacingDirectionJs2["default"].Left);
      });
      frameList = this.generateFramesWithEndDelay("Player_", 186, 185, "Player_185", 3, 5);
      frameList.push("Player_186");
      this.playerSprite.animations.add('lookLeft_left', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_left");
      });
      frameList = this.generateFramesWithEndDelay("Player_", 192, 191, "Player_191", 3, 5);
      frameList.push("Player_192");
      this.playerSprite.animations.add('lookRight_left', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_left");
      });
      frameList = this.generateFramesWithEndDelay("Player_", 284, 283, "Player_283", 3, 5);
      frameList.push("Player_284");
      this.playerSprite.animations.add('lookAtCam_left', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_left");
      });
      frameList = [];
      for (i = 0; i < 13; ++i) {
        frameList.push("Player_181");
      }
      this.playerSprite.animations.add('idlePause_left', frameList, frameRate / 3, false).onComplete.add(function () {
        _this22.playRandomPlayerIdle(_FacingDirectionJs2["default"].Left);
      });

      this.playerSprite.animations.add('walk_left', Phaser.Animation.generateFrameNames("Player_", 193, 200, "", 3), frameRate, true);
      singlePunch = Phaser.Animation.generateFrameNames("Player_", 201, 204, "", 3);
      this.playerSprite.animations.add('punch_left', singlePunch, frameRate, false).onComplete.add(function () {
        _this22.audioPlayer.play("punch");
      });
      this.playerSprite.animations.add('punchDestroy_left', singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
      this.playerSprite.animations.add('hurt_left', Phaser.Animation.generateFrameNames("Player_", 205, 208, "", 3), frameRate, true);
      this.playerSprite.animations.add('crouch_left', Phaser.Animation.generateFrameNames("Player_", 209, 212, "", 3), frameRate, true);
      this.playerSprite.animations.add('jumpUp_left', Phaser.Animation.generateFrameNames("Player_", 213, 216, "", 3), frameRate / 2, true);
      this.playerSprite.animations.add('fail_left', Phaser.Animation.generateFrameNames("Player_", 225, 228, "", 3), frameRate / 2, false);
      this.playerSprite.animations.add('celebrate_left', this.generatePlayerCelebrateFrames(), frameRate / 2, false);
      this.playerSprite.animations.add('bump_left', Phaser.Animation.generateFrameNames("Player_", 229, 234, "", 3), frameRate, false).onStart.add(function () {
        _this22.audioPlayer.play("bump");
      });
      this.playerSprite.animations.add('jumpDown_left', Phaser.Animation.generateFrameNames("Player_", 235, 240, "", 3), frameRate, true);
      this.playerSprite.animations.add('mine_left', Phaser.Animation.generateFrameNames("Player_", 253, 256, "", 3), frameRate, true);
      this.playerSprite.animations.add('mineCart_left', Phaser.Animation.generateFrameNames("Minecart_", 11, 11, "", 2), frameRate, false);

      frameList = [];
      frameList.push("Player_121");
      frameList.push("Player_123");
      frameList.push("Player_121");
      frameList.push("Player_127");
      frameList.push("Player_129");
      frameList.push("Player_127");
      for (i = 0; i < 5; ++i) {
        frameList.push("Player_121");
      }

      this.playerSprite.animations.add('idle_up', frameList, frameRate / 3, false).onComplete.add(function () {
        _this22.playRandomPlayerIdle(_FacingDirectionJs2["default"].Up);
      });
      frameList = this.generateFramesWithEndDelay("Player_", 126, 125, "Player_125", 3, 5);
      frameList.push("Player_126");
      this.playerSprite.animations.add('lookLeft_up', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_up");
      });
      frameList = this.generateFramesWithEndDelay("Player_", 132, 131, "Player_131", 3, 5);
      frameList.push("Player_132");
      this.playerSprite.animations.add('lookRight_up', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_up");
      });
      frameList = this.generateFramesWithEndDelay("Player_", 277, 276, "Player_276", 3, 5);
      frameList.push("Player_277");
      this.playerSprite.animations.add('lookAtCam_up', frameList, idleFrameRate, false).onComplete.add(function () {
        _this22.playScaledSpeed(_this22.playerSprite.animations, "idlePause_up");
      });

      frameList = [];
      for (i = 0; i < 13; ++i) {
        frameList.push("Player_121");
      }
      this.playerSprite.animations.add('idlePause_up', frameList, frameRate / 3, false).onComplete.add(function () {
        _this22.playRandomPlayerIdle(_FacingDirectionJs2["default"].Up);
      });
      this.playerSprite.animations.add('walk_up', Phaser.Animation.generateFrameNames("Player_", 133, 140, "", 3), frameRate, true);
      singlePunch = Phaser.Animation.generateFrameNames("Player_", 141, 144, "", 3);
      this.playerSprite.animations.add('punch_up', singlePunch, frameRate, false).onComplete.add(function () {
        _this22.audioPlayer.play("punch");
      });
      this.playerSprite.animations.add('punchDestroy_up', singlePunch.concat(singlePunch).concat(singlePunch), frameRate, false);
      this.playerSprite.animations.add('hurt_up', Phaser.Animation.generateFrameNames("Player_", 145, 148, "", 3), frameRate, true);
      this.playerSprite.animations.add('crouch_up', Phaser.Animation.generateFrameNames("Player_", 149, 152, "", 3), frameRate, true);
      this.playerSprite.animations.add('jumpUp_up', Phaser.Animation.generateFrameNames("Player_", 153, 156, "", 3), frameRate / 2, true);
      this.playerSprite.animations.add('fail_up', Phaser.Animation.generateFrameNames("Player_", 165, 168, "", 3), frameRate / 2, false);
      this.playerSprite.animations.add('celebrate_up', this.generatePlayerCelebrateFrames(), frameRate / 2, false);
      this.playerSprite.animations.add('bump_up', Phaser.Animation.generateFrameNames("Player_", 169, 174, "", 3), frameRate, false).onStart.add(function () {
        _this22.audioPlayer.play("bump");
      });
      this.playerSprite.animations.add('jumpDown_up', Phaser.Animation.generateFrameNames("Player_", 175, 180, "", 3), frameRate, true);
      this.playerSprite.animations.add('mine_up', Phaser.Animation.generateFrameNames("Player_", 249, 252, "", 3), frameRate, true);
      this.playerSprite.animations.add('mineCart_up', Phaser.Animation.generateFrameNames("Minecart_", 9, 9, "", 2), frameRate, false);
      this.playerSprite.animations.add('mineCart_turnleft_up', Phaser.Animation.generateFrameNames("Minecart_", 10, 10, "", 2), frameRate, false);
      this.playerSprite.animations.add('mineCart_turnright_up', Phaser.Animation.generateFrameNames("Minecart_", 8, 8, "", 2), frameRate, false);
    }
  }, {
    key: "createMiniBlock",
    value: function createMiniBlock(x, y, blockType) {
      var frame = "",
          sprite = null,
          frameList,
          i,
          len;

      switch (blockType) {
        case "treeAcacia":
        case "treeBirch":
        case "treeJungle":
        case "treeOak":
        case "treeSpruce":
          frame = "log" + blockType.substring(4);
          break;
        case "stone":
          frame = "cobblestone";
          break;
        case "oreCoal":
          frame = "coal";
          break;
        case "oreDiamond":
          frame = "diamond";
          break;
        case "oreIron":
          frame = "ingotIron";
          break;
        case "oreLapis":
          frame = "lapisLazuli";
          break;
        case "oreGold":
          frame = "ingotGold";
          break;
        case "oreEmerald":
          frame = "emerald";
          break;
        case "oreRedstone":
          frame = "redstoneDust";
          break;
        case "grass":
          frame = "dirt";
          break;
        case "wool_orange":
          frame = "wool";
          break;
        case "tnt":
          frame = "gunPowder";
          break;
        default:
          frame = blockType;
          break;
      }

      var atlas = "miniBlocks";
      var framePrefix = this.miniBlocks[frame][0];
      var frameStart = this.miniBlocks[frame][1];
      var frameEnd = this.miniBlocks[frame][2];
      var xOffset = -10;
      var yOffset = 0;

      frameList = Phaser.Animation.generateFrameNames(framePrefix, frameStart, frameEnd, "", 3);

      sprite = this.actionPlane.create(xOffset + 40 * x, yOffset + this.actionPlane.yOffset + 40 * y, atlas, "");
      sprite.animations.add("animate", frameList, 10, false);
      return sprite;
    }
  }, {
    key: "playAnimationWithOffset",
    value: function playAnimationWithOffset(sprite, animationName, animationFrameTotal, startFrame) {
      var rand = Math.trunc(Math.random() * animationFrameTotal) + startFrame;
      this.playScaledSpeed(sprite.animations, animationName).setFrame(rand, true);
    }
  }, {
    key: "playRandomSheepAnimation",
    value: function playRandomSheepAnimation(sprite) {
      var rand = Math.trunc(Math.random() * 20 + 1);

      switch (rand) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
          //eat grass
          sprite.play("idle");
          break;
        case 7:
        case 8:
        case 9:
        case 10:
          //look left
          sprite.play("lookLeft");
          break;
        case 11:
        case 12:
        case 13:
        case 14:
          //look right
          sprite.play("lookRight");
          break;
        case 15:
        case 16:
        case 17:
          //cam
          sprite.play("lookAtCam");
          break;
        case 18:
        case 19:
          //kick
          sprite.play("kick");
          break;
        case 20:
          //idlePause
          sprite.play("idlePause");
          break;
        default:
      }
    }
  }, {
    key: "playRandomCreeperAnimation",
    value: function playRandomCreeperAnimation(sprite) {
      var rand = Math.trunc(this.yToIndex(Math.random()) + 1);

      switch (rand) {
        case 1:
        case 2:
        case 3:
          //look left
          sprite.play("lookLeft");
          break;
        case 4:
        case 5:
        case 6:
          //look right
          sprite.play("lookRight");
          break;
        case 7:
        case 8:
          //look at cam
          sprite.play("lookAtCam");
          break;
        case 9:
        case 10:
          //shuffle feet
          sprite.play("idle");
          break;
        default:
      }
    }
  }, {
    key: "createBlock",
    value: function createBlock(plane, x, y, blockType) {
      var _this23 = this;

      var i,
          sprite = null,
          frameList,
          atlas,
          frame,
          xOffset,
          yOffset,
          stillFrames;

      switch (blockType) {
        case "treeAcacia":
        case "treeBirch":
        case "treeJungle":
        case "treeOak":
        case "treeSpruce":
          sprite = this.createBlock(plane, x, y, "log" + blockType.substring(4));
          sprite.fluff = this.createBlock(this.fluffPlane, x, y, "leaves" + blockType.substring(4));

          sprite.onBlockDestroy = function (logSprite) {
            logSprite.fluff.animations.add("despawn", Phaser.Animation.generateFrameNames("Leaves", 0, 6, "", 0), 10, false).onComplete.add(function () {
              _this23.toDestroy.push(logSprite.fluff);
              logSprite.fluff.kill();
            });

            _this23.playScaledSpeed(logSprite.fluff.animations, "despawn");
          };
          break;

        case "sheep":
          var sFrames = 10;
          // Facing Left: Eat Grass: 199-216
          sprite = plane.create(-22 + 40 * x, -12 + 40 * y, "sheep", "Sheep_199");
          frameList = Phaser.Animation.generateFrameNames("Sheep_", 199, 215, "", 0);
          for (i = 0; i < sFrames; ++i) {
            frameList.push("Sheep_215");
          }
          sprite.animations.add("idle", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });

          //Look Right
          frameList = Phaser.Animation.generateFrameNames("Sheep_", 184, 186, "", 0);
          for (i = 0; i < sFrames; ++i) {
            frameList.push("Sheep_186");
          }
          frameList.push("Sheep_188");
          sprite.animations.add("lookRight", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });

          //Look Left
          frameList = Phaser.Animation.generateFrameNames("Sheep_", 193, 195, "", 0);
          for (i = 0; i < sFrames; ++i) {
            frameList.push("Sheep_195");
          }
          frameList.push("Sheep_197");
          sprite.animations.add("lookLeft", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });

          //Kick
          frameList = Phaser.Animation.generateFrameNames("Sheep_", 217, 233, "", 0);
          sprite.animations.add("kick", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });

          //Look At Camera
          frameList = Phaser.Animation.generateFrameNames("Sheep_", 484, 485, "", 0);
          for (i = 0; i < sFrames; ++i) {
            frameList.push("Sheep_485");
          }
          frameList.push("Sheep_486");
          sprite.animations.add("lookAtCam", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });

          frameList = [];
          for (i = 0; i < 15; ++i) {
            frameList.push("Sheep_215");
          }
          sprite.animations.add("idlePause", frameList, 15, false).onComplete.add(function () {
            _this23.playRandomSheepAnimation(sprite);
          });

          // TODO(bjordan/gaallen) - update once updated Sheep.json
          frameList = Phaser.Animation.generateFrameNames("Sheep_", 490, 491, "", 0);
          stillFrames = Math.trunc(Math.random() * 3) + 3;
          for (i = 0; i < stillFrames; ++i) {
            frameList.push("Sheep_491");
          }
          this.onAnimationStart(sprite.animations.add("face", frameList, 2, true), function () {
            _this23.audioPlayer.play("sheepBaa");
          });

          frameList = Phaser.Animation.generateFrameNames("Sheep_", 439, 455, "", 0);
          for (i = 0; i < 3; ++i) {
            frameList.push("Sheep_455");
          }

          sprite.animations.add("used", frameList, 15, true);
          this.playAnimationWithOffset(sprite, "idle", 17, 199);
          break;

        case "creeper":
          sprite = plane.create(-6 + 40 * x, 0 + plane.yOffset + 40 * y, "creeper", "Creeper_053");

          frameList = Phaser.Animation.generateFrameNames("Creeper_", 37, 51, "", 3);
          sprite.animations.add("explode", frameList, 10, false);

          //Look Left
          frameList = Phaser.Animation.generateFrameNames("Creeper_", 4, 7, "", 3);
          for (i = 0; i < 15; ++i) {
            frameList.push("Creeper_007");
          }
          frameList.push("Creeper_008");
          frameList.push("Creeper_009");
          frameList.push("Creeper_010");
          frameList.push("Creeper_011");
          sprite.animations.add("lookLeft", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });

          //Look Right
          frameList = Phaser.Animation.generateFrameNames("Creeper_", 16, 19, "", 3);
          for (i = 0; i < 15; ++i) {
            frameList.push("Creeper_019");
          }
          frameList.push("Creeper_020");
          frameList.push("Creeper_021");
          frameList.push("Creeper_022");
          frameList.push("Creeper_023");
          sprite.animations.add("lookRight", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });

          //Look At Cam
          frameList = Phaser.Animation.generateFrameNames("Creeper_", 244, 245, "", 3);
          for (i = 0; i < 15; ++i) {
            frameList.push("Creeper_245");
          }
          frameList.push("Creeper_246");
          sprite.animations.add("lookAtCam", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });

          frameList = [];
          for (i = 0; i < 15; ++i) {
            frameList.push("Creeper_004");
          }
          sprite.animations.add("idlePause", frameList, 15, false).onComplete.add(function () {
            _this23.playRandomCreeperAnimation(sprite);
          });

          frameList = Phaser.Animation.generateFrameNames("Creeper_", 53, 59, "", 3);
          stillFrames = Math.trunc(this.yToIndex(Math.random())) + 20;
          for (i = 0; i < stillFrames; ++i) {
            frameList.push("Creeper_004");
          }
          sprite.animations.add("idle", frameList, 15, false).onComplete.add(function () {
            sprite.play("idlePause");
          });
          this.playAnimationWithOffset(sprite, "idle", 8, 52);
          break;

        case "cropWheat":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Wheat", 0, 2, "", 0);
          sprite.animations.add("idle", frameList, 0.4, false);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "torch":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Torch", 0, 23, "", 0);
          sprite.animations.add("idle", frameList, 15, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "water":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Water_", 0, 5, "", 0);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        //for placing wetland for crops in free play
        case "watering":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          sprite.kill();
          this.toDestroy.push(sprite);
          this.createBlock(this.groundPlane, x, y, "farmlandWet");
          this.refreshGroundPlane();
          break;

        case "lava":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Lava_", 0, 5, "", 0);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "lavaPop":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("LavaPop", 1, 7, "", 2);
          for (i = 0; i < 4; ++i) {
            frameList.push("LavaPop07");
          }
          frameList = frameList.concat(Phaser.Animation.generateFrameNames("LavaPop", 8, 13, "", 2));
          for (i = 0; i < 3; ++i) {
            frameList.push("LavaPop13");
          }
          frameList = frameList.concat(Phaser.Animation.generateFrameNames("LavaPop", 14, 30, "", 2));
          for (i = 0; i < 8; ++i) {
            frameList.push("LavaPop01");
          }
          sprite.animations.add("idle", frameList, 5, true);
          this.playAnimationWithOffset(sprite, "idle", 29, 1);
          break;

        case "fire":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Fire", 0, 14, "", 2);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "bubbles":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Bubbles", 0, 14, "", 2);
          sprite.animations.add("idle", frameList, 5, true);
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "explosion":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("Explosion", 0, 16, "", 1);
          sprite.animations.add("idle", frameList, 15, false).onComplete.add(function () {
            _this23.toDestroy.push(sprite);
            sprite.kill();
          });
          this.playScaledSpeed(sprite.animations, "idle");
          break;

        case "door":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);

          frameList = [];
          var animationFrames = Phaser.Animation.generateFrameNames("Door", 0, 3, "", 1);
          for (var j = 0; j < 5; ++j) {
            frameList.push("Door0");
          }
          frameList = frameList.concat(animationFrames);

          var animation = sprite.animations.add("open", frameList, 5, false);
          animation.enableUpdate = true;
          //play when the door starts opening
          animation.onUpdate.add(function () {
            if (animation.frame === 1) {
              _this23.audioPlayer.play("doorOpen");
            }
          });
          this.playScaledSpeed(sprite.animations, "open");
          break;

        case "tnt":
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          frameList = Phaser.Animation.generateFrameNames("TNTexplosion", 0, 8, "", 0);
          sprite.animations.add("explode", frameList, 7, false).onComplete.add(function () {
            _this23.playExplosionCloudAnimation([x, y]);
            sprite.kill();
            _this23.toDestroy.push(sprite);
            _this23.actionPlaneBlocks[_this23.coordinatesToIndex([x, y])] = null;
          });
          break;

        default:
          atlas = this.blocks[blockType][0];
          frame = this.blocks[blockType][1];
          xOffset = this.blocks[blockType][2];
          yOffset = this.blocks[blockType][3];
          sprite = plane.create(xOffset + 40 * x, yOffset + plane.yOffset + 40 * y, atlas, frame);
          break;
      }

      return sprite;
    }
  }, {
    key: "onAnimationEnd",
    value: function onAnimationEnd(animation, completionHandler) {
      var signalBinding = animation.onComplete.add(function () {
        signalBinding.detach();
        completionHandler();
      });
    }
  }, {
    key: "onAnimationStart",
    value: function onAnimationStart(animation, completionHandler) {
      var signalBinding = animation.onStart.add(function () {
        signalBinding.detach();
        completionHandler();
      });
    }
  }, {
    key: "onAnimationLoopOnce",
    value: function onAnimationLoopOnce(animation, completionHandler) {
      var signalBinding = animation.onLoop.add(function () {
        signalBinding.detach();
        completionHandler();
      });
    }
  }, {
    key: "addResettableTween",
    value: function addResettableTween(sprite) {
      var tween = this.game.add.tween(sprite);
      this.resettableTweens.push(tween);
      return tween;
    }
  }]);

  return LevelView;
})();

exports["default"] = LevelView;
module.exports = exports["default"];

},{"./FacingDirection.js":"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/FacingDirection.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/LevelModel.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _LevelBlockJs = require("./LevelBlock.js");

var _LevelBlockJs2 = _interopRequireDefault(_LevelBlockJs);

var _FacingDirectionJs = require("./FacingDirection.js");

var _FacingDirectionJs2 = _interopRequireDefault(_FacingDirectionJs);

// for blocks on the action plane, we need an actual "block" object, so we can model

var LevelModel = (function () {
  function LevelModel(levelData) {
    _classCallCheck(this, LevelModel);

    this.planeWidth = levelData.gridDimensions ? levelData.gridDimensions[0] : 10;
    this.planeHeight = levelData.gridDimensions ? levelData.gridDimensions[1] : 10;

    this.player = {};

    this.railMap = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "railsUnpoweredVertical", "", "", "", "", "", "", "", "", "", "railsUnpoweredVertical", "", "", "", "", "", "", "", "", "", "railsUnpoweredVertical", "", "", "", "", "", "", "", "", "", "railsUnpoweredVertical", "", "", "", "", "", "", "", "", "", "railsUnpoweredVertical", "", "", "", "", "", "", "", "", "", "railsBottomLeft", "railsHorizontal", "railsHorizontal", "railsHorizontal", "railsHorizontal", "railsHorizontal", "railsHorizontal", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];

    this.initialLevelData = Object.create(levelData);

    this.reset();

    this.initialPlayerState = Object.create(this.player);
  }

  _createClass(LevelModel, [{
    key: "planeArea",
    value: function planeArea() {
      return this.planeWidth * this.planeHeight;
    }
  }, {
    key: "inBounds",
    value: function inBounds(x, y) {
      return x >= 0 && x < this.planeWidth && y >= 0 && y < this.planeHeight;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.groundPlane = this.constructPlane(this.initialLevelData.groundPlane, false);
      this.groundDecorationPlane = this.constructPlane(this.initialLevelData.groundDecorationPlane, false);
      this.shadingPlane = [];
      this.actionPlane = this.constructPlane(this.initialLevelData.actionPlane, true);
      this.fluffPlane = this.constructPlane(this.initialLevelData.fluffPlane, false);
      this.fowPlane = [];
      this.isDaytime = this.initialLevelData.isDaytime === undefined || this.initialLevelData.isDaytime;

      var levelData = Object.create(this.initialLevelData);
      var x = levelData.playerStartPosition[0];
      var y = levelData.playerStartPosition[1];

      this.player.name = this.initialLevelData.playerName || "Steve";
      this.player.position = levelData.playerStartPosition;
      this.player.isOnBlock = !this.actionPlane[this.yToIndex(y) + x].getIsEmptyOrEntity();
      this.player.facing = levelData.playerStartDirection;

      this.player.inventory = {};

      this.computeShadingPlane();
      this.computeFowPlane();
    }
  }, {
    key: "yToIndex",
    value: function yToIndex(y) {
      return y * this.planeWidth;
    }
  }, {
    key: "constructPlane",
    value: function constructPlane(planeData, isActionPlane) {
      var index,
          result = [],
          block;

      for (index = 0; index < planeData.length; ++index) {
        block = new _LevelBlockJs2["default"](planeData[index]);
        // TODO(bjordan): put this truth in constructor like other attrs
        block.isWalkable = block.isWalkable || !isActionPlane;
        result.push(block);
      }

      return result;
    }
  }, {
    key: "isSolved",
    value: function isSolved() {
      return this.initialLevelData.verificationFunction(this);
    }
  }, {
    key: "getHouseBottomRight",
    value: function getHouseBottomRight() {
      return this.initialLevelData.houseBottomRight;
    }

    // Verifications
  }, {
    key: "isPlayerNextTo",
    value: function isPlayerNextTo(blockType) {
      var position;
      var result = false;

      // above
      position = [this.player.position[0], this.player.position[1] - 1];
      if (this.isBlockOfType(position, blockType)) {
        return true;
      }

      // below
      position = [this.player.position[0], this.player.position[1] + 1];
      if (this.isBlockOfType(position, blockType)) {
        return true;
      }

      // left
      position = [this.player.position[0] + 1, this.player.position[1]];
      if (this.isBlockOfType(position, blockType)) {
        return true;
      }

      // Right
      position = [this.player.position[0] - 1, this.player.position[1]];
      if (this.isBlockOfType(position, blockType)) {
        return true;
      }

      return false;
    }
  }, {
    key: "getInventoryAmount",
    value: function getInventoryAmount(inventoryType) {
      return this.player.inventory[inventoryType] || 0;
    }
  }, {
    key: "getInventoryTypes",
    value: function getInventoryTypes() {
      return Object.keys(this.player.inventory);
    }
  }, {
    key: "countOfTypeOnMap",
    value: function countOfTypeOnMap(blockType) {
      var count = 0,
          i;

      for (i = 0; i < this.planeArea(); ++i) {
        if (blockType == this.actionPlane[i].blockType) {
          ++count;
        }
      }
      return count;
    }
  }, {
    key: "isPlayerAt",
    value: function isPlayerAt(position) {
      return this.player.position[0] === position[0] && this.player.position[1] === position[1];
    }
  }, {
    key: "solutionMapMatchesResultMap",
    value: function solutionMapMatchesResultMap(solutionMap) {
      for (var i = 0; i < this.planeArea(); i++) {
        var solutionItemType = solutionMap[i];

        // "" on the solution map means we dont care what's at that spot
        if (solutionItemType !== "") {
          if (solutionItemType === "empty") {
            if (!this.actionPlane[i].isEmpty) {
              return false;
            }
          } else if (solutionItemType === "any") {
            if (this.actionPlane[i].isEmpty) {
              return false;
            }
          } else if (this.actionPlane[i].blockType !== solutionItemType) {
            return false;
          }
        }
      }
      return true;
    }
  }, {
    key: "getTnt",
    value: function getTnt() {
      var tnt = [];
      for (var x = 0; x < this.planeWidth; ++x) {
        for (var y = 0; y < this.planeHeight; ++y) {
          var index = this.coordinatesToIndex([x, y]);
          var block = this.actionPlane[index];
          if (block.blockType === "tnt") {
            tnt.push([x, y]);
          }
        }
      }
      return tnt;
    }
  }, {
    key: "getUnpoweredRails",
    value: function getUnpoweredRails() {
      var unpoweredRails = [];
      for (var x = 0; x < this.planeWidth; ++x) {
        for (var y = 0; y < this.planeHeight; ++y) {
          var index = this.coordinatesToIndex([x, y]);
          var block = this.actionPlane[index];
          if (block.blockType.substring(0, 7) == "railsUn") {
            unpoweredRails.push([x, y], "railsPowered" + this.actionPlane[index].blockType.substring(14));
          }
        }
      }

      return unpoweredRails;
    }
  }, {
    key: "getMoveForwardPosition",
    value: function getMoveForwardPosition() {
      var cx = this.player.position[0],
          cy = this.player.position[1];

      switch (this.player.facing) {
        case _FacingDirectionJs2["default"].Up:
          --cy;
          break;

        case _FacingDirectionJs2["default"].Down:
          ++cy;
          break;

        case _FacingDirectionJs2["default"].Left:
          --cx;
          break;

        case _FacingDirectionJs2["default"].Right:
          ++cx;
          break;
      }

      return [cx, cy];
    }
  }, {
    key: "isForwardBlockOfType",
    value: function isForwardBlockOfType(blockType) {
      var blockForwardPosition = this.getMoveForwardPosition();

      var actionIsEmpty = this.isBlockOfTypeOnPlane(blockForwardPosition, "empty", this.actionPlane);

      if (blockType === '' && actionIsEmpty) {
        return true;
      }

      return actionIsEmpty ? this.isBlockOfTypeOnPlane(blockForwardPosition, blockType, this.groundPlane) : this.isBlockOfTypeOnPlane(blockForwardPosition, blockType, this.actionPlane);
    }
  }, {
    key: "isBlockOfType",
    value: function isBlockOfType(position, blockType) {
      return this.isBlockOfTypeOnPlane(position, blockType, this.actionPlane);
    }
  }, {
    key: "isBlockOfTypeOnPlane",
    value: function isBlockOfTypeOnPlane(position, blockType, plane) {
      var result = false;

      var blockIndex = this.yToIndex(position[1]) + position[0];
      if (blockIndex >= 0 && blockIndex < this.planeArea()) {

        if (blockType == "empty") {
          result = plane[blockIndex].isEmpty;
        } else if (blockType == "tree") {
          result = plane[blockIndex].getIsTree();
        } else {
          result = blockType == plane[blockIndex].blockType;
        }
      }

      return result;
    }
  }, {
    key: "isPlayerStandingInWater",
    value: function isPlayerStandingInWater() {
      var blockIndex = this.yToIndex(this.player.position[1]) + this.player.position[0];
      return this.groundPlane[blockIndex].blockType === "water";
    }
  }, {
    key: "isPlayerStandingInLava",
    value: function isPlayerStandingInLava() {
      var blockIndex = this.yToIndex(this.player.position[1]) + this.player.position[0];
      return this.groundPlane[blockIndex].blockType === "lava";
    }
  }, {
    key: "coordinatesToIndex",
    value: function coordinatesToIndex(coordinates) {
      return this.yToIndex(coordinates[1]) + coordinates[0];
    }
  }, {
    key: "checkPositionForTypeAndPush",
    value: function checkPositionForTypeAndPush(blockType, position, objectArray) {
      if (!blockType && this.actionPlane[this.coordinatesToIndex(position)].blockType !== "" || this.isBlockOfType(position, blockType)) {
        objectArray.push([true, position]);
        return true;
      } else {
        objectArray.push([false, null]);
        return false;
      }
    }
  }, {
    key: "houseGroundToFloorHelper",
    value: function houseGroundToFloorHelper(position, woolType, arrayCheck) {
      var checkActionBlock,
          checkGroundBlock,
          posAbove,
          posBelow,
          posRight,
          posLeft,
          checkIndex = 0,
          array = arrayCheck;
      var index = this.yToIndex(position[2]) + position[1];

      if (index === 44) {
        index = 44;
      }

      posAbove = [0, position[1], position[2] + 1];
      posAbove[0] = this.yToIndex(posAbove[2]) + posAbove[1];

      posBelow = [0, position[1], position[2] - 1];
      posBelow[0] = this.yToIndex(posBelow[2]) + posBelow[1];

      posRight = [0, position[1] + 1, position[2]];
      posRight[0] = this.yToIndex(posRight[2]) + posRight[1];

      posLeft = [0, position[1] - 1, position[2]];
      posRight[0] = this.yToIndex(posRight[2]) + posRight[1];

      checkActionBlock = this.actionPlane[index];
      checkGroundBlock = this.groundPlane[index];
      for (var i = 0; i < array.length; ++i) {
        if (array[i][0] === index) {
          checkIndex = -1;
          break;
        }
      }

      if (checkActionBlock.blockType !== "") {
        return {};
      } else if (array.length > 0 && checkIndex === -1) {
        return {};
      }
      array.push(position);
      array.concat(this.houseGroundToFloorHelper(posAbove, woolType, array));
      array.concat(this.houseGroundToFloorHelper(posBelow, woolType, array));
      array.concat(this.houseGroundToFloorHelper(posRight, woolType, array));
      array.concat(this.houseGroundToFloorHelper(posLeft, woolType, array));

      return array;
    }
  }, {
    key: "houseGroundToFloorBlocks",
    value: function houseGroundToFloorBlocks(startingPosition) {
      //checkCardinalDirections for actionblocks.
      //If no action block and square isn't the type we want.
      //Change it.
      var woolType = "wool_orange";

      //Place this block here
      //this.createBlock(this.groundPlane, startingPosition[0], startingPosition[1], woolType);
      var helperStartData = [0, startingPosition[0], startingPosition[1]];
      return this.houseGroundToFloorHelper(helperStartData, woolType, []);
    }
  }, {
    key: "getAllBorderingPositionNotOfType",
    value: function getAllBorderingPositionNotOfType(position, blockType) {
      var surroundingBlocks = this.getAllBorderingPosition(position, null);
      for (var b = 1; b < surroundingBlocks.length; ++b) {
        if (surroundingBlocks[b][0] && this.actionPlane[this.coordinatesToIndex(surroundingBlocks[b][1])].blockType == blockType) {
          surroundingBlocks[b][0] = false;
        }
      }
      return surroundingBlocks;
    }
  }, {
    key: "getAllBorderingPosition",
    value: function getAllBorderingPosition(position, blockType) {
      var p;
      var allFoundObjects = [false];
      //Check all 8 directions

      //Top Right
      p = [position[0] + 1, position[1] + 1];
      if (this.checkPositionForTypeAndPush(blockType, p, allFoundObjects)) {
        allFoundObjects[0] = true;
      }
      //Top Left
      p = [position[0] - 1, position[1] + 1];
      if (this.checkPositionForTypeAndPush(blockType, p, allFoundObjects)) {
        allFoundObjects[0] = true;
      }
      //Bot Right
      p = [position[0] + 1, position[1] - 1];
      if (this.checkPositionForTypeAndPush(blockType, p, allFoundObjects)) {
        allFoundObjects[0] = true;
      }
      //Bot Left
      p = [position[0] - 1, position[1] - 1];
      if (this.checkPositionForTypeAndPush(blockType, p, allFoundObjects)) {
        allFoundObjects[0] = true;
      }

      //Check cardinal Directions
      //Top
      p = [position[0], position[1] + 1];
      if (this.checkPositionForTypeAndPush(blockType, p, allFoundObjects)) {
        allFoundObjects[0] = true;
      }
      //Bot
      p = [position[0], position[1] - 1];
      if (this.checkPositionForTypeAndPush(blockType, p, allFoundObjects)) {
        allFoundObjects[0] = true;
      }
      //Right
      p = [position[0] + 1, position[1]];
      if (this.checkPositionForTypeAndPush(blockType, p, allFoundObjects)) {
        allFoundObjects[0] = true;
      }
      //Left
      p = [position[0] - 1, position[1]];
      if (this.checkPositionForTypeAndPush(blockType, p, allFoundObjects)) {
        allFoundObjects[0] = true;
      }

      return allFoundObjects;
    }
  }, {
    key: "getAllBorderingPlayer",
    value: function getAllBorderingPlayer(blockType) {
      return this.getAllBorderingPosition(this.player.position, blockType);
    }
  }, {
    key: "isPlayerStandingNearCreeper",
    value: function isPlayerStandingNearCreeper() {
      return this.getAllBorderingPlayer("creeper");
    }
  }, {
    key: "getMinecartTrack",
    value: function getMinecartTrack() {
      var track = [];
      track.push(["down", [3, 2], _FacingDirectionJs2["default"].Down, 300]);
      track.push(["down", [3, 3], _FacingDirectionJs2["default"].Down, 300]);
      track.push(["down", [3, 4], _FacingDirectionJs2["default"].Down, 300]);
      track.push(["down", [3, 5], _FacingDirectionJs2["default"].Down, 300]);
      track.push(["down", [3, 6], _FacingDirectionJs2["default"].Down, 300]);
      track.push(["down", [3, 7], _FacingDirectionJs2["default"].Down, 300]);
      track.push(["turn_left", [3, 7], _FacingDirectionJs2["default"].Right, 400]);
      track.push(["right", [4, 7], _FacingDirectionJs2["default"].Right, 400]);
      track.push(["right", [5, 7], _FacingDirectionJs2["default"].Right, 400]);
      track.push(["right", [6, 7], _FacingDirectionJs2["default"].Right, 400]);
      track.push(["right", [7, 7], _FacingDirectionJs2["default"].Right, 400]);
      track.push(["right", [8, 7], _FacingDirectionJs2["default"].Right, 400]);
      track.push(["right", [9, 7], _FacingDirectionJs2["default"].Right, 400]);
      track.push(["right", [10, 7], _FacingDirectionJs2["default"].Right, 400]);
      track.push(["right", [11, 7], _FacingDirectionJs2["default"].Right, 400]);
      return track;
    }
  }, {
    key: "canMoveForward",
    value: function canMoveForward() {
      var result = false;

      var blockForwardPosition = this.getMoveForwardPosition();
      var blockIndex = this.yToIndex(blockForwardPosition[1]) + blockForwardPosition[0];
      var x = blockForwardPosition[0];
      var y = blockForwardPosition[1];

      if (this.inBounds(x, y)) {
        result = this.actionPlane[blockIndex].isWalkable || this.player.isOnBlock && !this.actionPlane[blockIndex].isEmpty;
      }

      return result;
    }
  }, {
    key: "canPlaceBlock",
    value: function canPlaceBlock() {
      return true;
    }
  }, {
    key: "canPlaceBlockForward",
    value: function canPlaceBlockForward() {
      if (this.player.isOnBlock) {
        return false;
      }

      return this.getPlaneToPlaceOn(this.getMoveForwardPosition()) !== null;
    }
  }, {
    key: "getPlaneToPlaceOn",
    value: function getPlaneToPlaceOn(coordinates) {
      var blockIndex = this.yToIndex(coordinates[1]) + coordinates[0];
      var x = coordinates[0];
      var y = coordinates[1];

      if (this.inBounds(x, y)) {
        var actionBlock = this.actionPlane[blockIndex];
        if (actionBlock.isPlacable) {
          var groundBlock = this.groundPlane[blockIndex];
          if (groundBlock.isPlacable) {
            return this.groundPlane;
          }
          return this.actionPlane;
        }
      }

      return null;
    }
  }, {
    key: "canDestroyBlockForward",
    value: function canDestroyBlockForward() {
      var result = false;

      if (!this.player.isOnBlock) {
        var blockForwardPosition = this.getMoveForwardPosition();
        var blockIndex = this.yToIndex(blockForwardPosition[1]) + blockForwardPosition[0];
        var x = blockForwardPosition[0];
        var y = blockForwardPosition[1];

        if (this.inBounds(x, y)) {
          var block = this.actionPlane[blockIndex];
          result = !block.isEmpty && (block.isDestroyable || block.isUsable);
        }
      }

      return result;
    }
  }, {
    key: "moveForward",
    value: function moveForward() {
      var blockForwardPosition = this.getMoveForwardPosition();
      this.moveTo(blockForwardPosition);
    }
  }, {
    key: "moveTo",
    value: function moveTo(position) {
      var blockIndex = this.yToIndex(position[1]) + position[0];

      this.player.position = position;
      if (this.actionPlane[blockIndex].isEmpty) {
        this.player.isOnBlock = false;
      }
    }
  }, {
    key: "turnLeft",
    value: function turnLeft() {
      switch (this.player.facing) {
        case _FacingDirectionJs2["default"].Up:
          this.player.facing = _FacingDirectionJs2["default"].Left;
          break;

        case _FacingDirectionJs2["default"].Left:
          this.player.facing = _FacingDirectionJs2["default"].Down;
          break;

        case _FacingDirectionJs2["default"].Down:
          this.player.facing = _FacingDirectionJs2["default"].Right;
          break;

        case _FacingDirectionJs2["default"].Right:
          this.player.facing = _FacingDirectionJs2["default"].Up;
          break;
      }
    }
  }, {
    key: "turnRight",
    value: function turnRight() {
      switch (this.player.facing) {
        case _FacingDirectionJs2["default"].Up:
          this.player.facing = _FacingDirectionJs2["default"].Right;
          break;

        case _FacingDirectionJs2["default"].Right:
          this.player.facing = _FacingDirectionJs2["default"].Down;
          break;

        case _FacingDirectionJs2["default"].Down:
          this.player.facing = _FacingDirectionJs2["default"].Left;
          break;

        case _FacingDirectionJs2["default"].Left:
          this.player.facing = _FacingDirectionJs2["default"].Up;
          break;
      }
    }
  }, {
    key: "placeBlock",
    value: function placeBlock(blockType) {
      var blockPosition = this.player.position;
      var blockIndex = this.yToIndex(blockPosition[1]) + blockPosition[0];
      var shouldPlace = false;

      switch (blockType) {
        case "cropWheat":
          shouldPlace = this.groundPlane[blockIndex].blockType === "farmlandWet";
          break;

        default:
          shouldPlace = true;
          break;
      }

      if (shouldPlace === true) {
        var block = new _LevelBlockJs2["default"](blockType);

        this.actionPlane[blockIndex] = block;
        this.player.isOnBlock = !block.isWalkable;
      }

      return shouldPlace;
    }
  }, {
    key: "placeBlockForward",
    value: function placeBlockForward(blockType, targetPlane) {
      var blockPosition = this.getMoveForwardPosition();
      var blockIndex = this.yToIndex(blockPosition[1]) + blockPosition[0];

      //for placing wetland for crops in free play
      if (blockType === "watering") {
        blockType = "farmlandWet";
        targetPlane = this.groundPlane;
      }

      targetPlane[blockIndex] = new _LevelBlockJs2["default"](blockType);
    }
  }, {
    key: "destroyBlock",
    value: function destroyBlock(position) {
      var i,
          block = null;

      var blockPosition = position;
      var blockIndex = this.yToIndex(blockPosition[1]) + blockPosition[0];
      var x = blockPosition[0];
      var y = blockPosition[1];

      if (this.inBounds(x, y)) {
        block = this.actionPlane[blockIndex];
        if (block !== null) {
          block.position = [x, y];

          if (block.isDestroyable) {
            this.actionPlane[blockIndex] = new _LevelBlockJs2["default"]("");
          }
        }
      }

      return block;
    }
  }, {
    key: "destroyBlockForward",
    value: function destroyBlockForward() {
      var i,
          shouldAddToInventory = true,
          block = null;

      var blockForwardPosition = this.getMoveForwardPosition();
      var blockIndex = this.yToIndex(blockForwardPosition[1]) + blockForwardPosition[0];
      var x = blockForwardPosition[0];
      var y = blockForwardPosition[1];

      if (this.inBounds(x, y)) {
        block = this.actionPlane[blockIndex];
        if (block !== null) {
          block.position = [x, y];
          var inventoryType = this.getInventoryType(block.blockType);
          this.player.inventory[inventoryType] = (this.player.inventory[inventoryType] || 0) + 1;

          if (block.isDestroyable) {
            this.actionPlane[blockIndex] = new _LevelBlockJs2["default"]("");
          }
        }
      }

      return block;
    }
  }, {
    key: "getInventoryType",
    value: function getInventoryType(blockType) {
      switch (blockType) {
        case "sheep":
          return "wool";
        case "stone":
          return "cobblestone";
        case "treeAcacia":
        case "treeBirch":
        case "treeJungle":
        case "treeOak":
        case "treeSpruce":
          return "planks" + blockType.substring(4);
        default:
          return blockType;
      }
    }
  }, {
    key: "solveFOWTypeForMap",
    value: function solveFOWTypeForMap() {
      var emissives, blocksToSolve;

      emissives = this.getAllEmissives();
      blocksToSolve = this.findBlocksAffectedByEmissives(emissives);

      for (var block in blocksToSolve) {
        if (blocksToSolve.hasOwnProperty(block)) {
          this.solveFOWTypeFor(blocksToSolve[block], emissives);
        }
      }
    }
  }, {
    key: "solveFOWTypeFor",
    value: function solveFOWTypeFor(position, emissives) {
      var emissivesTouching,
          topLeftQuad = false,
          botLeftQuad = false,
          leftQuad = false,
          topRightQuad = false,
          botRightQuad = false,
          rightQuad = false,
          topQuad = false,
          botQuad = false,
          angle = 0,
          index = this.coordinatesToIndex(position),
          x,
          y;

      emissivesTouching = this.findEmissivesThatTouch(position, emissives);

      for (var torch in emissivesTouching) {
        var currentTorch = emissivesTouching[torch];
        y = position[1];
        x = position[0];

        angle = Math.atan2(currentTorch[1] - position[1], currentTorch[0] - position[0]);
        //invert
        angle = -angle;
        //Normalize to be between 0 and 2*pi
        if (angle < 0) {
          angle += 2 * Math.PI;
        }
        //convert to degrees for simplicity
        angle *= 360 / (2 * Math.PI);

        //top right
        if (!rightQuad && angle > 32.5 && angle <= 57.5) {
          topRightQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_TopRight", precedence: 0 });
        } //top left
        if (!leftQuad && angle > 122.5 && angle <= 147.5) {
          topLeftQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_TopLeft", precedence: 0 });
        } //bot left
        if (!leftQuad && angle > 212.5 && angle <= 237.5) {
          botLeftQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_BottomLeft", precedence: 0 });
        } //botright
        if (!rightQuad && angle > 302.5 && angle <= 317.5) {
          botRightQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_InCorner_BottomRight", precedence: 0 });
        }
        //right
        if (angle >= 327.5 || angle <= 32.5) {
          rightQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Right", precedence: 1 });
        } //bot
        if (angle > 237.5 && angle <= 302.5) {
          botQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom", precedence: 1 });
        }
        //left
        if (angle > 147.5 && angle <= 212.5) {
          leftQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Left", precedence: 1 });
        }
        //top
        if (angle > 57.5 && angle <= 122.5) {
          topQuad = true;
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top", precedence: 1 });
        }
      }

      if (topLeftQuad && botLeftQuad) {
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Left", precedence: 1 });
      }
      if (topRightQuad && botRightQuad) {
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Right", precedence: 1 });
      }
      if (topLeftQuad && topRightQuad) {
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top", precedence: 1 });
      }
      if (botRightQuad && botLeftQuad) {
        this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom", precedence: 1 });
      }

      //fully lit
      if (botRightQuad && topLeftQuad || botLeftQuad && topRightQuad || leftQuad && rightQuad || topQuad && botQuad || rightQuad && botQuad && topLeftQuad || botQuad && topRightQuad && topLeftQuad || topQuad && botRightQuad && botLeftQuad || leftQuad && topRightQuad && botRightQuad || leftQuad && botQuad && topRightQuad) {
        this.fowPlane[index] = "";
      }

      //darkend botleft corner
      else if (botQuad && leftQuad || botQuad && topLeftQuad || leftQuad && botRightQuad) {
          this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom_Left", precedence: 2 });
        }
        //darkend botRight corner
        else if (botQuad && rightQuad || botQuad && topRightQuad || rightQuad && botLeftQuad) {
            this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Bottom_Right", precedence: 2 });
          }
          //darkend topRight corner
          else if (topQuad && rightQuad || topQuad && botRightQuad || rightQuad && topLeftQuad) {
              this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top_Right", precedence: 2 });
            }
            //darkend topLeft corner
            else if (topQuad && leftQuad || topQuad && botLeftQuad || leftQuad && topRightQuad) {
                this.pushIfHigherPrecedence(index, { x: x, y: y, type: "FogOfWar_Top_Left", precedence: 2 });
              }
    }
  }, {
    key: "pushIfHigherPrecedence",
    value: function pushIfHigherPrecedence(index, fowObject) {
      if (fowObject === "") {
        this.fowPlane[index] = "";
        return;
      }
      var existingItem = this.fowPlane[index];
      if (existingItem && existingItem.precedence > fowObject.precedence) {
        return;
      }
      this.fowPlane[index] = fowObject;
    }
  }, {
    key: "getAllEmissives",
    value: function getAllEmissives() {
      var emissives = [];
      for (var y = 0; y < this.planeHeight; ++y) {
        for (var x = 0; x < this.planeWidth; ++x) {
          var index = this.coordinatesToIndex([x, y]);
          if (!this.actionPlane[index].isEmpty && this.actionPlane[index].isEmissive || this.groundPlane[index].isEmissive && this.actionPlane[index].isEmpty) {
            emissives.push([x, y]);
          }
        }
      }
      return emissives;
    }
  }, {
    key: "findBlocksAffectedByEmissives",
    value: function findBlocksAffectedByEmissives(emissives) {
      var blocksTouchedByEmissives = {};
      //find emissives that are close enough to light us.
      for (var torch in emissives) {
        var currentTorch = emissives[torch];
        var y = currentTorch[1];
        var x = currentTorch[0];
        for (var yIndex = currentTorch[1] - 2; yIndex <= currentTorch[1] + 2; ++yIndex) {
          for (var xIndex = currentTorch[0] - 2; xIndex <= currentTorch[0] + 2; ++xIndex) {

            //Ensure we're looking inside the map
            if (!this.inBounds(xIndex, yIndex)) {
              continue;
            }

            //Ignore the indexes directly around us.
            //Theyre taken care of on the FOW first pass
            if (yIndex >= y - 1 && yIndex <= y + 1 && xIndex >= x - 1 && xIndex <= x + 1) {
              continue;
            }

            //we want unique copies so we use a map.
            blocksTouchedByEmissives[yIndex.toString() + xIndex.toString()] = [xIndex, yIndex];
          }
        }
      }

      return blocksTouchedByEmissives;
    }
  }, {
    key: "findEmissivesThatTouch",
    value: function findEmissivesThatTouch(position, emissives) {
      var emissivesThatTouch = [];
      var y = position[1];
      var x = position[0];
      //find emissives that are close enough to light us.
      for (var yIndex = y - 2; yIndex <= y + 2; ++yIndex) {
        for (var xIndex = x - 2; xIndex <= x + 2; ++xIndex) {

          //Ensure we're looking inside the map
          if (!this.inBounds(xIndex, yIndex)) {
            continue;
          }

          //Ignore the indexes directly around us.
          if (yIndex >= y - 1 && yIndex <= y + 1 && xIndex >= x - 1 && xIndex <= x + 1) {
            continue;
          }

          for (var torch in emissives) {
            if (emissives[torch][0] === xIndex && emissives[torch][1] === yIndex) {
              emissivesThatTouch.push(emissives[torch]);
            }
          }
        }
      }

      return emissivesThatTouch;
    }
  }, {
    key: "computeFowPlane",
    value: function computeFowPlane() {
      var x, y;

      this.fowPlane = [];
      if (this.isDaytime) {
        for (y = 0; y < this.planeHeight; ++y) {
          for (x = 0; x < this.planeWidth; ++x) {
            // this.fowPlane.push[""]; // noop as originally written
            // TODO(bjordan) completely remove?
          }
        }
      } else {
          // compute the fog of war for light emitting blocks
          for (y = 0; y < this.planeHeight; ++y) {
            for (x = 0; x < this.planeWidth; ++x) {
              this.fowPlane.push({ x: x, y: y, type: "FogOfWar_Center" });
            }
          }

          //second pass for partial lit squares
          this.solveFOWTypeForMap();

          for (y = 0; y < this.planeHeight; ++y) {
            for (x = 0; x < this.planeWidth; ++x) {
              var blockIndex = this.yToIndex(y) + x;

              if (this.groundPlane[blockIndex].isEmissive && this.actionPlane[blockIndex].isEmpty || !this.actionPlane[blockIndex].isEmpty && this.actionPlane[blockIndex].isEmissive) {
                this.clearFowAround(x, y);
              }
            }
          }
        }
    }
  }, {
    key: "clearFowAround",
    value: function clearFowAround(x, y) {
      var ox, oy;

      for (oy = -1; oy <= 1; ++oy) {
        for (ox = -1; ox <= 1; ++ox) {
          this.clearFowAt(x + ox, y + oy);
        }
      }
    }
  }, {
    key: "clearFowAt",
    value: function clearFowAt(x, y) {
      if (x >= 0 && x < this.planeWidth && y >= 0 && y < this.planeHeight) {
        var blockIndex = this.yToIndex(y) + x;
        this.fowPlane[blockIndex] = "";
      }
    }
  }, {
    key: "computeShadingPlane",
    value: function computeShadingPlane() {
      var x, y, index, hasLeft, hasRight;

      this.shadingPlane = [];

      for (index = 0; index < this.planeArea(); ++index) {
        x = index % this.planeWidth;
        y = Math.floor(index / this.planeWidth);

        hasLeft = false;
        hasRight = false;

        if (this.actionPlane[index].isEmpty || this.actionPlane[index].isTransparent) {
          if (y === 0) {
            this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_Bottom' });
          }

          if (y === this.planeHeight - 1) {
            this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_Top' });
          }

          if (x === 0) {
            this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_Right' });
          }

          if (x === this.planeWidth - 1) {
            this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_Left' });
          }

          if (x < this.planeWidth - 1 && !this.actionPlane[this.yToIndex(y) + x + 1].getIsEmptyOrEntity()) {
            // needs a left side AO shadow
            this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_Left' });
            hasLeft = true;
          }

          if (x > 0 && !this.actionPlane[this.yToIndex(y) + x - 1].getIsEmptyOrEntity()) {
            // needs a right side AO shadow
            this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_Right' });
            this.shadingPlane.push({ x: x, y: y, type: 'Shadow_Parts_Fade_base.png' });

            if (y > 0 && x > 0 && this.actionPlane[this.yToIndex(y - 1) + x - 1].getIsEmptyOrEntity()) {
              this.shadingPlane.push({ x: x, y: y, type: 'Shadow_Parts_Fade_top.png' });
            }

            hasRight = true;
          }

          if (y > 0 && !this.actionPlane[this.yToIndex(y - 1) + x].getIsEmptyOrEntity()) {
            // needs a bottom side AO shadow
            this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_Bottom' });
          } else if (y > 0) {
            if (x < this.planeWidth - 1 && !this.actionPlane[this.yToIndex(y - 1) + x + 1].getIsEmptyOrEntity() && this.actionPlane[this.yToIndex(y) + x + 1].getIsEmptyOrEntity()) {
              // needs a bottom left side AO shadow
              this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_BottomLeft' });
            }

            if (!hasRight && x > 0 && !this.actionPlane[this.yToIndex(y - 1) + x - 1].getIsEmptyOrEntity()) {
              // needs a bottom right side AO shadow
              this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_BottomRight' });
            }
          }

          if (y < this.planeHeight - 1) {
            if (x < this.planeWidth - 1 && !this.actionPlane[this.yToIndex(y + 1) + x + 1].getIsEmptyOrEntity() && this.actionPlane[this.yToIndex(y) + x + 1].getIsEmptyOrEntity()) {
              // needs a bottom left side AO shadow
              this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_TopLeft' });
            }

            if (!hasRight && x > 0 && !this.actionPlane[this.yToIndex(y + 1) + x - 1].getIsEmptyOrEntity()) {
              // needs a bottom right side AO shadow
              this.shadingPlane.push({ x: x, y: y, type: 'AOeffect_TopRight' });
            }
          }
        }
      }
    }
  }]);

  return LevelModel;
})();

exports["default"] = LevelModel;
module.exports = exports["default"];

},{"./FacingDirection.js":"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/FacingDirection.js","./LevelBlock.js":"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/LevelBlock.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/LevelBlock.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LevelBlock = (function () {
  function LevelBlock(blockType) {
    _classCallCheck(this, LevelBlock);

    this.blockType = blockType;

    // Default values apply to simple, action-plane destroyable blocks
    this.isEntity = false;
    this.isWalkable = false;
    this.isDeadly = false;
    this.isPlacable = false; // whether another block can be placed in this block's spot
    this.isDestroyable = true;
    this.isUsable = true;
    this.isEmpty = false;
    this.isEmissive = false;
    this.isTransparent = false;

    if (blockType === "") {
      this.isWalkable = true;
      this.isDestroyable = false;
      this.isEmpty = true;
      this.isPlacable = true;
      this.isUsable = false;
    }

    if (blockType.match('torch')) {
      this.isWalkable = true;
      this.isPlacable = true;
    }

    if (blockType.substring(0, 5) == "rails") {
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
    }

    if (blockType == "sheep") {
      this.isEntity = true;
      this.isDestroyable = false;
      this.isUsable = true;
    }

    if (blockType == "creeper") {
      this.isEntity = true;
    }

    if (blockType == "glass") {
      this.isDestroyable = false;
    }

    if (blockType == "bedrock") {
      this.isDestroyable = false;
    }

    if (blockType == "lava") {
      this.isEmissive = true;
      this.isWalkable = true;
      this.isDeadly = true;
      this.isPlacable = true;
    }

    if (blockType == "water") {
      this.isPlacable = true;
    }

    if (blockType == "torch") {
      this.isEmissive = true;
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
    }

    if (blockType == "cropWheat") {
      this.isEmissive = false;
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
    }

    if (blockType == "tnt") {
      this.isUsable = true;
      this.isDestroyable = true;
    }

    if (blockType == "door") {
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
    }
  }

  _createClass(LevelBlock, [{
    key: "getIsTree",
    value: function getIsTree() {
      return !!this.blockType.match(/^tree/);
    }
  }, {
    key: "getIsEmptyOrEntity",
    value: function getIsEmptyOrEntity() {
      return this.isEmpty || this.isEntity;
    }
  }]);

  return LevelBlock;
})();

exports["default"] = LevelBlock;
module.exports = exports["default"];

},{}],"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/FacingDirection.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = Object.freeze({
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3
});
module.exports = exports["default"];

},{}],"/home/ubuntu/staging/apps/build/js/craft/game/LevelMVC/AssetLoader.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AssetLoader = (function () {
  function AssetLoader(controller) {
    _classCallCheck(this, AssetLoader);

    this.controller = controller;
    this.audioPlayer = controller.audioPlayer;
    this.game = controller.game;
    this.assetRoot = controller.assetRoot;

    this.assets = {
      entityShadow: {
        type: 'image',
        path: this.assetRoot + 'images/Character_Shadow.png'
      },
      selectionIndicator: {
        type: 'image',
        path: this.assetRoot + 'images/Selection_Indicator.png'
      },
      shadeLayer: {
        type: 'image',
        path: this.assetRoot + 'images/Shade_Layer.png'
      },
      tallGrass: {
        type: 'image',
        path: this.assetRoot + 'images/TallGrass.png'
      },
      finishOverlay: {
        type: 'image',
        path: this.assetRoot + 'images/WhiteRect.png'
      },
      bed: {
        type: 'image',
        path: this.assetRoot + 'images/Bed.png'
      },
      playerSteve: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Steve.png',
        jsonPath: this.assetRoot + 'images/Steve.json'
      },
      playerAlex: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Alex.png',
        jsonPath: this.assetRoot + 'images/Alex.json'
      },
      AO: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/AO.png',
        jsonPath: this.assetRoot + 'images/AO.json'
      },
      blockShadows: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Block_Shadows.png',
        jsonPath: this.assetRoot + 'images/Block_Shadows.json'
      },
      undergroundFow: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/UndergroundFoW.png',
        jsonPath: this.assetRoot + 'images/UndergroundFoW.json'
      },
      blocks: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Blocks.png',
        jsonPath: this.assetRoot + 'images/Blocks.json'
      },
      leavesAcacia: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Acacia_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Acacia_Decay.json'
      },
      leavesBirch: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Birch_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Birch_Decay.json'
      },
      leavesJungle: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Jungle_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Jungle_Decay.json'
      },
      leavesOak: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Oak_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Oak_Decay.json'
      },
      leavesSpruce: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Leaves_Spruce_Decay.png',
        jsonPath: this.assetRoot + 'images/Leaves_Spruce_Decay.json'
      },
      sheep: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Sheep.png',
        jsonPath: this.assetRoot + 'images/Sheep.json'
      },
      creeper: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Creeper.png',
        jsonPath: this.assetRoot + 'images/Creeper.json'
      },
      crops: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Crops.png',
        jsonPath: this.assetRoot + 'images/Crops.json'
      },
      torch: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Torch.png',
        jsonPath: this.assetRoot + 'images/Torch.json'
      },
      destroyOverlay: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Destroy_Overlay.png',
        jsonPath: this.assetRoot + 'images/Destroy_Overlay.json'
      },
      blockExplode: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/BlockExplode.png',
        jsonPath: this.assetRoot + 'images/BlockExplode.json'
      },
      miningParticles: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/MiningParticles.png',
        jsonPath: this.assetRoot + 'images/MiningParticles.json'
      },
      miniBlocks: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Miniblocks.png',
        jsonPath: this.assetRoot + 'images/Miniblocks.json'
      },
      lavaPop: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/LavaPop.png',
        jsonPath: this.assetRoot + 'images/LavaPop.json'
      },
      fire: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Fire.png',
        jsonPath: this.assetRoot + 'images/Fire.json'
      },
      bubbles: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Bubbles.png',
        jsonPath: this.assetRoot + 'images/Bubbles.json'
      },
      explosion: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Explosion.png',
        jsonPath: this.assetRoot + 'images/Explosion.json'
      },
      door: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Door.png',
        jsonPath: this.assetRoot + 'images/Door.json'
      },
      rails: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Rails.png',
        jsonPath: this.assetRoot + 'images/Rails.json'
      },
      tnt: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/TNT.png',
        jsonPath: this.assetRoot + 'images/TNT.json'
      },
      dig_wood1: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/dig_wood1.mp3',
        wav: this.assetRoot + 'audio/dig_wood1.wav',
        ogg: this.assetRoot + 'audio/dig_wood1.ogg'
      },
      stepGrass: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/step_grass1.mp3',
        wav: this.assetRoot + 'audio/step_grass1.wav',
        ogg: this.assetRoot + 'audio/step_grass1.ogg'
      },
      stepWood: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/wood2.mp3',
        ogg: this.assetRoot + 'audio/wood2.ogg'
      },
      stepStone: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/stone2.mp3',
        ogg: this.assetRoot + 'audio/stone2.ogg'
      },
      stepGravel: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/gravel1.mp3',
        ogg: this.assetRoot + 'audio/gravel1.ogg'
      },
      stepFarmland: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cloth4.mp3',
        ogg: this.assetRoot + 'audio/cloth4.ogg'
      },
      failure: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/break.mp3',
        ogg: this.assetRoot + 'audio/break.ogg'
      },
      success: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/levelup.mp3',
        ogg: this.assetRoot + 'audio/levelup.ogg'
      },
      fall: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/fallsmall.mp3',
        ogg: this.assetRoot + 'audio/fallsmall.ogg'
      },
      fuse: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/fuse.mp3',
        ogg: this.assetRoot + 'audio/fuse.ogg'
      },
      explode: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/explode3.mp3',
        ogg: this.assetRoot + 'audio/explode3.ogg'
      },
      placeBlock: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cloth1.mp3',
        ogg: this.assetRoot + 'audio/cloth1.ogg'
      },
      collectedBlock: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/pop.mp3',
        ogg: this.assetRoot + 'audio/pop.ogg'
      },
      bump: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/hit3.mp3',
        ogg: this.assetRoot + 'audio/hit3.ogg'
      },
      punch: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/cloth1.mp3',
        ogg: this.assetRoot + 'audio/cloth1.ogg'
      },
      fizz: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/fizz.mp3',
        ogg: this.assetRoot + 'audio/fizz.ogg'
      },
      doorOpen: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/door_open.mp3',
        ogg: this.assetRoot + 'audio/door_open.ogg'
      },
      houseSuccess: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/launch1.mp3',
        ogg: this.assetRoot + 'audio/launch1.ogg'
      },
      minecart: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/minecartBase.mp3',
        ogg: this.assetRoot + 'audio/minecartBase.ogg'
      },
      sheepBaa: {
        type: 'sound',
        mp3: this.assetRoot + 'audio/say3.mp3',
        ogg: this.assetRoot + 'audio/say3.ogg'
      }
    };

    this.assetPacks = {
      levelOneAssets: ['entityShadow', 'selectionIndicator', 'shadeLayer', 'AO', 'blockShadows', 'leavesOak', 'leavesBirch', 'tallGrass', 'blocks', 'sheep', 'bump', 'stepGrass', 'failure', 'success'],
      levelTwoAssets: ['entityShadow', 'selectionIndicator', 'shadeLayer', 'AO', 'blockShadows', 'leavesSpruce', 'tallGrass', 'blocks', 'sheep', 'bump', 'stepGrass', 'failure', 'playerSteve', 'success', 'miniBlocks', 'blockExplode', 'miningParticles', 'destroyOverlay', 'dig_wood1', 'collectedBlock', 'punch'],
      levelThreeAssets: ['entityShadow', 'selectionIndicator', 'shadeLayer', 'AO', 'blockShadows', 'leavesOak', 'tallGrass', 'blocks', 'sheep', 'bump', 'stepGrass', 'failure', 'playerSteve', 'success', 'miniBlocks', 'blockExplode', 'miningParticles', 'destroyOverlay', 'dig_wood1', 'collectedBlock', 'sheepBaa', 'punch'],
      allAssetsMinusPlayer: ['entityShadow', 'selectionIndicator', 'shadeLayer', 'tallGrass', 'finishOverlay', 'bed', 'AO', 'blockShadows', 'undergroundFow', 'blocks', 'leavesAcacia', 'leavesBirch', 'leavesJungle', 'leavesOak', 'leavesSpruce', 'sheep', 'creeper', 'crops', 'torch', 'destroyOverlay', 'blockExplode', 'miningParticles', 'miniBlocks', 'lavaPop', 'fire', 'bubbles', 'explosion', 'door', 'rails', 'tnt', 'dig_wood1', 'stepGrass', 'stepWood', 'stepStone', 'stepGravel', 'stepFarmland', 'failure', 'success', 'fall', 'fuse', 'explode', 'placeBlock', 'collectedBlock', 'bump', 'punch', 'fizz', 'doorOpen', 'houseSuccess', 'minecart', 'sheepBaa'],
      playerSteve: ['playerSteve'],
      playerAlex: ['playerAlex'],
      grass: ['tallGrass']
    };
  }

  _createClass(AssetLoader, [{
    key: 'loadPacks',
    value: function loadPacks(packList) {
      var _this = this;

      packList.forEach(function (packName) {
        _this.loadPack(packName);
      });
    }
  }, {
    key: 'loadPack',
    value: function loadPack(packName) {
      var packAssets = this.assetPacks[packName];
      this.loadAssets(packAssets);
    }
  }, {
    key: 'loadAssets',
    value: function loadAssets(assetNames) {
      var _this2 = this;

      assetNames.forEach(function (assetKey) {
        var assetConfig = _this2.assets[assetKey];
        _this2.loadAsset(assetKey, assetConfig);
      });
    }
  }, {
    key: 'loadAsset',
    value: function loadAsset(key, config) {
      switch (config.type) {
        case 'image':
          this.game.load.image(key, config.path);
          break;
        case 'sound':
          this.audioPlayer.register({
            id: key,
            mp3: config.mp3,
            ogg: config.ogg
          });
          break;
        case 'atlasJSON':
          this.game.load.atlasJSONHash(key, config.pngPath, config.jsonPath);
          break;
        default:
          throw 'Asset ' + key + ' needs config.type set in configuration.';
      }
    }
  }]);

  return AssetLoader;
})();

exports['default'] = AssetLoader;
module.exports = exports['default'];

},{}],"/home/ubuntu/staging/apps/build/js/craft/game/API/CodeOrgAPI.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = get;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _CommandQueueCommandQueueJs = require("../CommandQueue/CommandQueue.js");

var _CommandQueueCommandQueueJs2 = _interopRequireDefault(_CommandQueueCommandQueueJs);

var _CommandQueueBaseCommandJs = require("../CommandQueue/BaseCommand.js");

var _CommandQueueBaseCommandJs2 = _interopRequireDefault(_CommandQueueBaseCommandJs);

var _CommandQueueDestroyBlockCommandJs = require("../CommandQueue/DestroyBlockCommand.js");

var _CommandQueueDestroyBlockCommandJs2 = _interopRequireDefault(_CommandQueueDestroyBlockCommandJs);

var _CommandQueuePlaceBlockCommandJs = require("../CommandQueue/PlaceBlockCommand.js");

var _CommandQueuePlaceBlockCommandJs2 = _interopRequireDefault(_CommandQueuePlaceBlockCommandJs);

var _CommandQueuePlaceInFrontCommandJs = require("../CommandQueue/PlaceInFrontCommand.js");

var _CommandQueuePlaceInFrontCommandJs2 = _interopRequireDefault(_CommandQueuePlaceInFrontCommandJs);

var _CommandQueueMoveForwardCommandJs = require("../CommandQueue/MoveForwardCommand.js");

var _CommandQueueMoveForwardCommandJs2 = _interopRequireDefault(_CommandQueueMoveForwardCommandJs);

var _CommandQueueTurnCommandJs = require("../CommandQueue/TurnCommand.js");

var _CommandQueueTurnCommandJs2 = _interopRequireDefault(_CommandQueueTurnCommandJs);

var _CommandQueueWhileCommandJs = require("../CommandQueue/WhileCommand.js");

var _CommandQueueWhileCommandJs2 = _interopRequireDefault(_CommandQueueWhileCommandJs);

var _CommandQueueIfBlockAheadCommandJs = require("../CommandQueue/IfBlockAheadCommand.js");

var _CommandQueueIfBlockAheadCommandJs2 = _interopRequireDefault(_CommandQueueIfBlockAheadCommandJs);

var _CommandQueueCheckSolutionCommandJs = require("../CommandQueue/CheckSolutionCommand.js");

var _CommandQueueCheckSolutionCommandJs2 = _interopRequireDefault(_CommandQueueCheckSolutionCommandJs);

function get(controller) {
    return {
        /**
         * Called before a list of user commands will be issued.
         */
        startCommandCollection: function startCommandCollection() {
            if (controller.DEBUG) {
                console.log("Collecting commands.");
            }
        },

        /**
         * Called when an attempt should be started, and the entire set of
         * command-queue API calls have been issued.
         *
         * @param {Function} onAttemptComplete - callback with two parameters,
         * "success", i.e., true if attempt was successful (level completed),
         * false if unsuccessful (level not completed), and the current level model.
         */
        startAttempt: function startAttempt(onAttemptComplete) {
            controller.OnCompleteCallback = onAttemptComplete;
            controller.queue.addCommand(new _CommandQueueCheckSolutionCommandJs2["default"](controller));
            controller.queue.begin();
        },

        resetAttempt: function resetAttempt() {
            controller.reset();
            controller.queue.reset();
            controller.OnCompleteCallback = null;
        },

        moveForward: function moveForward(highlightCallback) {
            controller.queue.addCommand(new _CommandQueueMoveForwardCommandJs2["default"](controller, highlightCallback));
        },

        turn: function turn(highlightCallback, direction) {
            controller.queue.addCommand(new _CommandQueueTurnCommandJs2["default"](controller, highlightCallback, direction === 'right' ? 1 : -1));
        },

        turnRight: function turnRight(highlightCallback) {
            controller.queue.addCommand(new _CommandQueueTurnCommandJs2["default"](controller, highlightCallback, 1));
        },

        turnLeft: function turnLeft(highlightCallback) {
            controller.queue.addCommand(new _CommandQueueTurnCommandJs2["default"](controller, highlightCallback, -1));
        },

        destroyBlock: function destroyBlock(highlightCallback) {
            controller.queue.addCommand(new _CommandQueueDestroyBlockCommandJs2["default"](controller, highlightCallback));
        },

        placeBlock: function placeBlock(highlightCallback, blockType) {
            controller.queue.addCommand(new _CommandQueuePlaceBlockCommandJs2["default"](controller, highlightCallback, blockType));
        },

        placeInFront: function placeInFront(highlightCallback, blockType) {
            controller.queue.addCommand(new _CommandQueuePlaceInFrontCommandJs2["default"](controller, highlightCallback, blockType));
        },

        tillSoil: function tillSoil(highlightCallback) {
            controller.queue.addCommand(new _CommandQueuePlaceInFrontCommandJs2["default"](controller, highlightCallback, 'watering'));
        },

        whilePathAhead: function whilePathAhead(highlightCallback, blockType, codeBlock) {
            controller.queue.addCommand(new _CommandQueueWhileCommandJs2["default"](controller, highlightCallback, blockType, codeBlock));
        },

        ifBlockAhead: function ifBlockAhead(highlightCallback, blockType, codeBlock) {
            controller.queue.addCommand(new _CommandQueueIfBlockAheadCommandJs2["default"](controller, highlightCallback, blockType, codeBlock));
        },

        getScreenshot: function getScreenshot() {
            return controller.getScreenshot();
        }
    };
}

},{"../CommandQueue/BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","../CommandQueue/CheckSolutionCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CheckSolutionCommand.js","../CommandQueue/CommandQueue.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandQueue.js","../CommandQueue/DestroyBlockCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/DestroyBlockCommand.js","../CommandQueue/IfBlockAheadCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/IfBlockAheadCommand.js","../CommandQueue/MoveForwardCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/MoveForwardCommand.js","../CommandQueue/PlaceBlockCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/PlaceBlockCommand.js","../CommandQueue/PlaceInFrontCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/PlaceInFrontCommand.js","../CommandQueue/TurnCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/TurnCommand.js","../CommandQueue/WhileCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/WhileCommand.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/WhileCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var _CommandQueueJs = require("./CommandQueue.js");

var _CommandQueueJs2 = _interopRequireDefault(_CommandQueueJs);

var _BaseCommandJs = require("./BaseCommand.js");

var _BaseCommandJs2 = _interopRequireDefault(_BaseCommandJs);

var WhileCommand = (function (_BaseCommand) {
    _inherits(WhileCommand, _BaseCommand);

    function WhileCommand(gameController, highlightCallback, blockType, callback) {
        _classCallCheck(this, WhileCommand);

        _get(Object.getPrototypeOf(WhileCommand.prototype), "constructor", this).call(this, gameController, highlightCallback);

        this.iterationsLeft = 15;
        this.BlockType = blockType;
        this.WhileCode = callback;
        this.queue = new _CommandQueueJs2["default"](this);
    }

    _createClass(WhileCommand, [{
        key: "tick",
        value: function tick() {
            // do stuff

            if (this.state === _CommandStateJs2["default"].WORKING) {
                // tick our command queue
                this.queue.tick();
            }

            if (this.queue.isFailed()) {
                this.state = _CommandStateJs2["default"].FAILURE;
            }

            if (this.queue.isSucceeded()) {
                this.handleWhileCheck();
            }
        }
    }, {
        key: "begin",
        value: function begin() {
            _get(Object.getPrototypeOf(WhileCommand.prototype), "begin", this).call(this);
            if (this.GameController.DEBUG) {
                console.log("WHILE command: BEGIN");
            }

            // setup the while check the first time
            this.handleWhileCheck();
        }
    }, {
        key: "handleWhileCheck",
        value: function handleWhileCheck() {
            if (this.iterationsLeft <= 0) {
                this.state = _CommandStateJs2["default"].FAILURE;
            }

            if (this.GameController.isPathAhead(this.BlockType)) {
                this.queue.reset();
                this.GameController.queue.setWhileCommandInsertState(this.queue);
                this.WhileCode();
                this.GameController.queue.setWhileCommandInsertState(null);
                this.queue.begin();
            } else {
                this.state = _CommandStateJs2["default"].SUCCESS;
            }

            this.iterationsLeft--;
            if (this.GameController.DEBUG) {
                console.log("While command: Iterationsleft   " + this.iterationsLeft + " ");
            }
        }
    }]);

    return WhileCommand;
})(_BaseCommandJs2["default"]);

exports["default"] = WhileCommand;
module.exports = exports["default"];

},{"./BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandQueue.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandQueue.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/TurnCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var _BaseCommandJs = require("./BaseCommand.js");

var _BaseCommandJs2 = _interopRequireDefault(_BaseCommandJs);

var TurnCommand = (function (_BaseCommand) {
    _inherits(TurnCommand, _BaseCommand);

    function TurnCommand(gameController, highlightCallback, direction) {
        _classCallCheck(this, TurnCommand);

        _get(Object.getPrototypeOf(TurnCommand.prototype), "constructor", this).call(this, gameController, highlightCallback);

        this.Direction = direction;
    }

    _createClass(TurnCommand, [{
        key: "tick",
        value: function tick() {
            // do stuff??
        }
    }, {
        key: "begin",
        value: function begin() {
            _get(Object.getPrototypeOf(TurnCommand.prototype), "begin", this).call(this);
            if (this.GameController.DEBUG) {
                console.log("TURN command: BEGIN turning " + this.Direction + "  ");
            }
            this.GameController.turn(this, this.Direction);
        }
    }]);

    return TurnCommand;
})(_BaseCommandJs2["default"]);

exports["default"] = TurnCommand;
module.exports = exports["default"];

},{"./BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/PlaceInFrontCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var _BaseCommandJs = require("./BaseCommand.js");

var _BaseCommandJs2 = _interopRequireDefault(_BaseCommandJs);

var PlaceInFrontCommand = (function (_BaseCommand) {
    _inherits(PlaceInFrontCommand, _BaseCommand);

    function PlaceInFrontCommand(gameController, highlightCallback, blockType) {
        _classCallCheck(this, PlaceInFrontCommand);

        _get(Object.getPrototypeOf(PlaceInFrontCommand.prototype), "constructor", this).call(this, gameController, highlightCallback);

        this.BlockType = blockType;
    }

    _createClass(PlaceInFrontCommand, [{
        key: "tick",
        value: function tick() {
            // do stuff??
        }
    }, {
        key: "begin",
        value: function begin() {
            _get(Object.getPrototypeOf(PlaceInFrontCommand.prototype), "begin", this).call(this);
            this.GameController.placeBlockForward(this, this.BlockType);
        }
    }]);

    return PlaceInFrontCommand;
})(_BaseCommandJs2["default"]);

exports["default"] = PlaceInFrontCommand;
module.exports = exports["default"];

},{"./BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/PlaceBlockCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var _BaseCommandJs = require("./BaseCommand.js");

var _BaseCommandJs2 = _interopRequireDefault(_BaseCommandJs);

var PlaceBlockCommand = (function (_BaseCommand) {
    _inherits(PlaceBlockCommand, _BaseCommand);

    function PlaceBlockCommand(gameController, highlightCallback, blockType) {
        _classCallCheck(this, PlaceBlockCommand);

        _get(Object.getPrototypeOf(PlaceBlockCommand.prototype), "constructor", this).call(this, gameController, highlightCallback);

        this.BlockType = blockType;
    }

    _createClass(PlaceBlockCommand, [{
        key: "tick",
        value: function tick() {
            // do stuff??
        }
    }, {
        key: "begin",
        value: function begin() {
            _get(Object.getPrototypeOf(PlaceBlockCommand.prototype), "begin", this).call(this);
            this.GameController.placeBlock(this, this.BlockType);
        }
    }]);

    return PlaceBlockCommand;
})(_BaseCommandJs2["default"]);

exports["default"] = PlaceBlockCommand;
module.exports = exports["default"];

},{"./BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/MoveForwardCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var _BaseCommandJs = require("./BaseCommand.js");

var _BaseCommandJs2 = _interopRequireDefault(_BaseCommandJs);

var MoveForwardCommand = (function (_BaseCommand) {
    _inherits(MoveForwardCommand, _BaseCommand);

    function MoveForwardCommand(gameController, highlightCallback) {
        _classCallCheck(this, MoveForwardCommand);

        _get(Object.getPrototypeOf(MoveForwardCommand.prototype), "constructor", this).call(this, gameController, highlightCallback);
    }

    _createClass(MoveForwardCommand, [{
        key: "tick",
        value: function tick() {
            // do stuff
        }
    }, {
        key: "begin",
        value: function begin() {
            _get(Object.getPrototypeOf(MoveForwardCommand.prototype), "begin", this).call(this);
            this.GameController.moveForward(this);
        }
    }]);

    return MoveForwardCommand;
})(_BaseCommandJs2["default"]);

exports["default"] = MoveForwardCommand;
module.exports = exports["default"];

},{"./BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/IfBlockAheadCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var _CommandQueueJs = require("./CommandQueue.js");

var _CommandQueueJs2 = _interopRequireDefault(_CommandQueueJs);

var _BaseCommandJs = require("./BaseCommand.js");

var _BaseCommandJs2 = _interopRequireDefault(_BaseCommandJs);

var IfBlockAheadCommand = (function (_BaseCommand) {
    _inherits(IfBlockAheadCommand, _BaseCommand);

    function IfBlockAheadCommand(gameController, highlightCallback, blockType, callback) {
        _classCallCheck(this, IfBlockAheadCommand);

        _get(Object.getPrototypeOf(IfBlockAheadCommand.prototype), "constructor", this).call(this, gameController, highlightCallback);

        this.blockType = blockType;
        this.ifCodeCallback = callback;

        this.queue = new _CommandQueueJs2["default"](this);
    }

    _createClass(IfBlockAheadCommand, [{
        key: "tick",
        value: function tick() {
            if (this.state === _CommandStateJs2["default"].WORKING) {
                // tick our command queue
                this.queue.tick();
            }

            if (this.queue.isFailed()) {
                this.state = _CommandStateJs2["default"].FAILURE;
            }

            if (this.queue.isSucceeded()) {
                this.state = _CommandStateJs2["default"].SUCCESS;
            }
        }
    }, {
        key: "begin",
        value: function begin() {
            _get(Object.getPrototypeOf(IfBlockAheadCommand.prototype), "begin", this).call(this);
            if (this.GameController.DEBUG) {
                console.log("WHILE command: BEGIN");
            }

            // setup the "if" check
            this.handleIfCheck();
        }
    }, {
        key: "handleIfCheck",
        value: function handleIfCheck() {
            if (this.GameController.isPathAhead(this.blockType)) {
                this.queue.reset();
                this.GameController.queue.setWhileCommandInsertState(this.queue);
                this.ifCodeCallback(); // inserts commands via CodeOrgAPI
                this.GameController.queue.setWhileCommandInsertState(null);
                this.queue.begin();
            } else {
                this.state = _CommandStateJs2["default"].SUCCESS;
            }
        }
    }]);

    return IfBlockAheadCommand;
})(_BaseCommandJs2["default"]);

exports["default"] = IfBlockAheadCommand;
module.exports = exports["default"];

},{"./BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandQueue.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandQueue.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/DestroyBlockCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var _BaseCommandJs = require("./BaseCommand.js");

var _BaseCommandJs2 = _interopRequireDefault(_BaseCommandJs);

var DestroyBlockCommand = (function (_BaseCommand) {
    _inherits(DestroyBlockCommand, _BaseCommand);

    function DestroyBlockCommand(gameController, highlightCallback) {
        _classCallCheck(this, DestroyBlockCommand);

        _get(Object.getPrototypeOf(DestroyBlockCommand.prototype), "constructor", this).call(this, gameController, highlightCallback);
    }

    _createClass(DestroyBlockCommand, [{
        key: "tick",
        value: function tick() {
            // do stuff
        }
    }, {
        key: "begin",
        value: function begin() {
            _get(Object.getPrototypeOf(DestroyBlockCommand.prototype), "begin", this).call(this);
            this.GameController.destroyBlock(this);
        }
    }]);

    return DestroyBlockCommand;
})(_BaseCommandJs2["default"]);

exports["default"] = DestroyBlockCommand;
module.exports = exports["default"];

},{"./BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CheckSolutionCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var _CommandQueueJs = require("./CommandQueue.js");

var _CommandQueueJs2 = _interopRequireDefault(_CommandQueueJs);

var _BaseCommandJs = require("./BaseCommand.js");

var _BaseCommandJs2 = _interopRequireDefault(_BaseCommandJs);

var CheckSolutionCommand = (function (_BaseCommand) {
    _inherits(CheckSolutionCommand, _BaseCommand);

    function CheckSolutionCommand(gameController) {
        _classCallCheck(this, CheckSolutionCommand);

        var dummyFunc = function dummyFunc() {
            if (gameController.DEBUG) {
                console.log("Execute solve command");
            }
        };

        _get(Object.getPrototypeOf(CheckSolutionCommand.prototype), "constructor", this).call(this, gameController, dummyFunc);
    }

    _createClass(CheckSolutionCommand, [{
        key: "tick",
        value: function tick() {
            // do stuff
        }
    }, {
        key: "begin",
        value: function begin() {
            _get(Object.getPrototypeOf(CheckSolutionCommand.prototype), "begin", this).call(this);
            if (this.GameController.DEBUG) {
                console.log("Solve command: BEGIN");
            }
            var result = this.GameController.checkSolution(this);
        }
    }]);

    return CheckSolutionCommand;
})(_BaseCommandJs2["default"]);

exports["default"] = CheckSolutionCommand;
module.exports = exports["default"];

},{"./BaseCommand.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandQueue.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandQueue.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandQueue.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _BaseCommand = require("./BaseCommand");

var _BaseCommand2 = _interopRequireDefault(_BaseCommand);

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var CommandQueue = (function () {
  function CommandQueue(gameController) {
    _classCallCheck(this, CommandQueue);

    this.gameController = gameController;
    this.game = gameController.game;
    this.reset();
  }

  _createClass(CommandQueue, [{
    key: "addCommand",
    value: function addCommand(command) {
      // if we're handling a while command, add to the while command's queue instead of this queue
      if (this.whileCommandQueue) {
        this.whileCommandQueue.addCommand(command);
      } else {
        this.commandList_.push(command);
      }
    }
  }, {
    key: "setWhileCommandInsertState",
    value: function setWhileCommandInsertState(queue) {
      this.whileCommandQueue = queue;
    }
  }, {
    key: "begin",
    value: function begin() {
      this.state = _CommandStateJs2["default"].WORKING;
      if (this.gameController.DEBUG) {
        console.log("Debug Queue: BEGIN");
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      this.state = _CommandStateJs2["default"].NOT_STARTED;
      this.currentCommand = null;
      this.commandList_ = [];
      if (this.whileCommandQueue) {
        this.whileCommandQueue.reset();
      }
      this.whileCommandQueue = null;
    }
  }, {
    key: "tick",
    value: function tick() {
      if (this.state === _CommandStateJs2["default"].WORKING) {
        if (!this.currentCommand) {
          if (this.commandList_.length === 0) {
            this.state = _CommandStateJs2["default"].SUCCESS;
            return;
          }
          this.currentCommand = this.commandList_.shift();
        }

        if (!this.currentCommand.isStarted()) {
          this.currentCommand.begin();
        } else {
          this.currentCommand.tick();
        }

        // check if command is done
        if (this.currentCommand.isSucceeded()) {
          this.currentCommand = null;
        } else if (this.currentCommand.isFailed()) {
          this.state = _CommandStateJs2["default"].FAILURE;
        }
      }
    }

    /**
     * Whether the command has started working.
     * @returns {boolean}
     */
  }, {
    key: "isStarted",
    value: function isStarted() {
      return this.state !== _CommandStateJs2["default"].NOT_STARTED;
    }

    /**
     * Whether the command has succeeded or failed, and is
     * finished with its work.
     * @returns {boolean}
     */
  }, {
    key: "isFinished",
    value: function isFinished() {
      return this.isSucceeded() || this.isFailed();
    }

    /**
     * Whether the command has finished with its work and reported success.
     * @returns {boolean}
     */
  }, {
    key: "isSucceeded",
    value: function isSucceeded() {
      return this.state === _CommandStateJs2["default"].SUCCESS;
    }

    /**
     * Whether the command has finished with its work and reported failure.
     * @returns {boolean}
     */
  }, {
    key: "isFailed",
    value: function isFailed() {
      return this.state === _CommandStateJs2["default"].FAILURE;
    }
  }]);

  return CommandQueue;
})();

exports["default"] = CommandQueue;
module.exports = exports["default"];

},{"./BaseCommand":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js","./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/BaseCommand.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _CommandStateJs = require("./CommandState.js");

var _CommandStateJs2 = _interopRequireDefault(_CommandStateJs);

var BaseCommand = (function () {
    function BaseCommand(gameController, highlightCallback) {
        _classCallCheck(this, BaseCommand);

        this.GameController = gameController;
        this.Game = gameController.game;
        this.HighlightCallback = highlightCallback;
        this.state = _CommandStateJs2["default"].NOT_STARTED;
    }

    _createClass(BaseCommand, [{
        key: "tick",
        value: function tick() {}
    }, {
        key: "begin",
        value: function begin() {
            if (this.HighlightCallback) {
                this.HighlightCallback();
            }
            this.state = _CommandStateJs2["default"].WORKING;
        }

        /**
         * Whether the command has started working.
         * @returns {boolean}
         */
    }, {
        key: "isStarted",
        value: function isStarted() {
            return this.state != _CommandStateJs2["default"].NOT_STARTED;
        }

        /**
         * Whether the command has succeeded or failed, and is
         * finished with its work.
         * @returns {boolean}
         */
    }, {
        key: "isFinished",
        value: function isFinished() {
            return this.isSucceeded() || this.isFailed();
        }

        /**
         * Whether the command has finished with its work and reported success.
         * @returns {boolean}
         */
    }, {
        key: "isSucceeded",
        value: function isSucceeded() {
            return this.state === _CommandStateJs2["default"].SUCCESS;
        }

        /**
         * Whether the command has finished with its work and reported failure.
         * @returns {boolean}
         */
    }, {
        key: "isFailed",
        value: function isFailed() {
            return this.state === _CommandStateJs2["default"].FAILURE;
        }
    }, {
        key: "succeeded",
        value: function succeeded() {
            this.state = _CommandStateJs2["default"].SUCCESS;
        }
    }, {
        key: "failed",
        value: function failed() {
            this.state = _CommandStateJs2["default"].FAILURE;
        }
    }]);

    return BaseCommand;
})();

exports["default"] = BaseCommand;
module.exports = exports["default"];

},{"./CommandState.js":"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js"}],"/home/ubuntu/staging/apps/build/js/craft/game/CommandQueue/CommandState.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = Object.freeze({
    NOT_STARTED: 0,
    WORKING: 1,
    SUCCESS: 2,
    FAILURE: 3
});
module.exports = exports["default"];

},{}],"/home/ubuntu/staging/apps/build/js/craft/dialogs/playerSelection.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<h1 class="minecraft-big-yellow-header" id="getting-started-header">Let\'s get started.</h1>\n\n<h2 id="select-character-text">Choose your character.</h2>\n\n<div id="choose-character-container">\n  <div class="minecraft-character" id="choose-steve">\n    <h1 class="minecraft-big-yellow-header">Steve</h1>\n    <div class="character-portrait" id="steve-portrait"></div>\n    <div class="choose-character-button" id="choose-steve-select">Select</div>\n  </div>\n  <div class="minecraft-character" id="choose-alex">\n    <h1 class="minecraft-big-yellow-header">Alex</h1>\n    <div class="character-portrait" id="alex-portrait"></div>\n    <div class="choose-character-button" id="choose-alex-select">Select</div>\n  </div>\n</div>\n\n<div id="close-character-select"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/dialogs/houseSelection.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<h1 class="minecraft-big-yellow-header" id="getting-started-header">Let\'s build a house.</h1>\n\n<h2 id="select-house-text">Choose the floor plan for your house.</h2>\n\n<div id="choose-house-container">\n  <div class="minecraft-house" id="choose-house-a">\n    <h1 class="minecraft-big-yellow-header">Easy</h1>\n    <div class="house-outline-container">\n      <div class="house-photo" id="house-a-picture"></div>\n    </div>\n    <div class="choose-house-button">Select</div>\n  </div>\n  <div class="minecraft-house" id="choose-house-b">\n    <h1 class="minecraft-big-yellow-header">Medium</h1>\n    <div class="house-outline-container">\n      <div class="house-photo" id="house-b-picture"></div>\n    </div>\n    <div class="choose-house-button">Select</div>\n  </div>\n  <div class="minecraft-house" id="choose-house-c">\n    <h1 class="minecraft-big-yellow-header">Hard</h1>\n    <div class="house-outline-container">\n      <div class="house-photo" id="house-c-picture"></div>\n    </div>\n    <div class="choose-house-button">Select</div>\n  </div>\n</div>\n\n<div id="close-house-select"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/controls.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../locale') ; buf.push('\n\n<div id="right-button-cell">\n  <button id="rightButton" class="share">\n    <img src="', escape((5,  assetUrl('media/1x1.gif') )), '">', escape((5,  msg.finish() )), '\n  </button>\n</div>\n\n<!-- This is a comment unique to Craft -->\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/blocks.js":[function(require,module,exports){
'use strict';

var blocksToDisplayText = {
  bedrock: 'bedrock',
  bricks: 'bricks',
  clay: 'clay',
  oreCoal: 'coal ore',
  dirtCoarse: 'coarse dirt',
  cobblestone: 'cobblestone',
  oreDiamond: 'diamond ore',
  dirt: 'dirt',
  oreEmerald: 'emerald ore',
  farmlandWet: 'farmland',
  glass: 'glass',
  oreGold: 'gold ore',
  grass: 'grass',
  gravel: 'gravel',
  clayHardened: 'hardened clay',
  oreIron: 'iron ore',
  oreLapis: 'lapis ore',
  lava: 'lava',
  logAcacia: 'acacia log',
  logBirch: 'birch log',
  logJungle: 'jungle log',
  logOak: 'oak log',
  logSpruce: 'spruce log',
  planksAcacia: 'acacia planks',
  planksBirch: 'birch planks',
  planksJungle: 'jungle planks',
  planksOak: 'oak planks',
  planksSpruce: 'spruce planks',
  oreRedstone: 'redstone ore',
  rail: 'rail',
  sand: 'sand',
  sandstone: 'sandstone',
  stone: 'stone',
  tnt: 'tnt',
  tree: 'tree',
  water: 'water',
  wool: 'wool',
  '': 'empty'
};

var allBlocks = ['bedrock', 'bricks', 'clay', 'oreCoal', 'dirtCoarse', 'cobblestone', 'oreDiamond', 'dirt', 'oreEmerald', 'farmlandWet', 'glass', 'oreGold', 'grass', 'gravel', 'clayHardened', 'oreIron', 'oreLapis', 'lava', 'logAcacia', 'logBirch', 'logJungle', 'logOak', 'logSpruce', 'planksAcacia', 'planksBirch', 'planksJungle', 'planksOak', 'planksSpruce', 'oreRedstone', 'sand', 'sandstone', 'stone', 'tnt', 'tree', 'wool'];

function keysToDropdownOptions(keysList) {
  return keysList.map(function (key) {
    var displayText = blocksToDisplayText[key] || key;
    return [displayText, key];
  });
}

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var dropdownBlocks = (blockInstallOptions.level.availableBlocks || []).concat(JSON.parse(window.localStorage.getItem('craftPlayerInventory')) || []);

  var dropdownBlockSet = {};

  dropdownBlocks.forEach(function (type) {
    dropdownBlockSet[type] = true;
  });

  var craftBlockOptions = {
    inventoryBlocks: Object.keys(dropdownBlockSet),
    ifBlockOptions: blockInstallOptions.level.ifBlockOptions,
    placeBlockOptions: blockInstallOptions.level.placeBlockOptions
  };

  var inventoryBlocksEmpty = !craftBlockOptions.inventoryBlocks || craftBlockOptions.inventoryBlocks.length === 0;
  var allDropdownBlocks = inventoryBlocksEmpty ? allBlocks : craftBlockOptions.inventoryBlocks;

  blockly.Blocks.craft_moveForward = {
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldLabel("move forward"));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_moveForward = function () {
    return 'moveForward(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_turn = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.craft_turn.DIRECTIONS = [["turn left" + ' ↺', 'left'], ["turn right" + ' ↻', 'right']];

  blockly.Generator.get('JavaScript').craft_turn = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    var methodCall = dir === "left" ? "turnLeft" : "turnRight";
    return methodCall + '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_destroyBlock = {
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldLabel("destroy block"));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_destroyBlock = function () {
    return 'destroyBlock(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_shear = {
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldLabel("shear"));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_shear = function () {
    return 'shear(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_whileBlockAhead = {
    helpUrl: '',
    init: function init() {
      var dropdownOptions = keysToDropdownOptions(craftBlockOptions.ifBlockOptions || allDropdownBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput().appendTitle("while").appendTitle(dropdown, 'TYPE').appendTitle("ahead");
      this.appendStatementInput('DO').appendTitle("do");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_whileBlockAhead = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    var blockType = this.getTitleValue('TYPE');
    return 'whileBlockAhead(\'block_id_' + this.id + '\',\n"' + blockType + '", ' + '  function() { ' + innerCode + '  }' + ');\n';
  };

  blockly.Blocks.craft_ifBlockAhead = {
    helpUrl: '',
    init: function init() {
      var dropdownOptions = keysToDropdownOptions(craftBlockOptions.ifBlockOptions || allDropdownBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle("if").appendTitle(dropdown, 'TYPE').appendTitle("ahead");
      this.appendStatementInput('DO').appendTitle("do");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_ifBlockAhead = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    var blockType = this.getTitleValue('TYPE');
    return 'ifBlockAhead("' + blockType + '", function() {\n' + innerCode + '}, \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_ifLavaAhead = {
    helpUrl: '',
    init: function init() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle("if lava ahead");
      this.appendStatementInput('DO').appendTitle("do");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_ifLavaAhead = function () {
    var innerCode = blockly.Generator.get('JavaScript').statementToCode(this, 'DO');
    return 'ifLavaAhead(function() {\n' + innerCode + '}, \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_placeBlock = {
    helpUrl: '',
    init: function init() {
      var dropdownOptions = keysToDropdownOptions(craftBlockOptions.placeBlockOptions || allDropdownBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle("place").appendTitle(dropdown, 'TYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_placeBlock = function () {
    var blockType = this.getTitleValue('TYPE');
    return 'placeBlock("' + blockType + '", \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_placeTorch = {
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle("place torch");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_placeTorch = function () {
    return 'placeTorch(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_plantCrop = {
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle('plant crop');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_plantCrop = function () {
    return 'plantCrop(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_tillSoil = {
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle('till soil');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_tillSoil = function () {
    return 'tillSoil(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.craft_placeBlockAhead = {
    helpUrl: '',
    init: function init() {
      var dropdownOptions = keysToDropdownOptions(craftBlockOptions.placeBlockOptions || allDropdownBlocks);
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle("place").appendTitle(dropdown, 'TYPE').appendTitle("ahead");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_placeBlockAhead = function () {
    var blockType = this.getTitleValue('TYPE');
    return 'placeBlockAhead("' + blockType + '", \'block_id_' + this.id + '\');\n';
  };
};

},{}],"/home/ubuntu/staging/apps/build/js/craft/api.js":[function(require,module,exports){
"use strict";

},{}]},{},["/home/ubuntu/staging/apps/build/js/craft/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9jcmFmdC9tYWluLmpzIiwiYnVpbGQvanMvY3JhZnQvc2tpbnMuanMiLCJidWlsZC9qcy9jcmFmdC9sZXZlbHMuanMiLCJidWlsZC9qcy9jcmFmdC9jcmFmdC5qcyIsImJ1aWxkL2pzL2NyYWZ0L3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9jcmFmdC9sb2NhbGUuanMiLCJidWlsZC9qcy9jcmFmdC9sZXZlbGJ1aWxkZXJPdmVycmlkZXMuanMiLCJidWlsZC9qcy9jcmFmdC9ob3VzZUxldmVscy5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvR2FtZUNvbnRyb2xsZXIuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0xldmVsTVZDL0xldmVsVmlldy5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvTGV2ZWxNb2RlbC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvTGV2ZWxCbG9jay5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvRmFjaW5nRGlyZWN0aW9uLmpzIiwiYnVpbGQvanMvY3JhZnQvZ2FtZS9MZXZlbE1WQy9Bc3NldExvYWRlci5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQVBJL0NvZGVPcmdBUEkuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9XaGlsZUNvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9UdXJuQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL1BsYWNlSW5Gcm9udENvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9QbGFjZUJsb2NrQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL01vdmVGb3J3YXJkQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL0lmQmxvY2tBaGVhZENvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9EZXN0cm95QmxvY2tDb21tYW5kLmpzIiwiYnVpbGQvanMvY3JhZnQvZ2FtZS9Db21tYW5kUXVldWUvQ2hlY2tTb2x1dGlvbkNvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9Db21tYW5kUXVldWUuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9CYXNlQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL0NvbW1hbmRTdGF0ZS5qcyIsImJ1aWxkL2pzL2NyYWZ0L2RpYWxvZ3MvcGxheWVyU2VsZWN0aW9uLmh0bWwuZWpzIiwiYnVpbGQvanMvY3JhZnQvZGlhbG9ncy9ob3VzZVNlbGVjdGlvbi5odG1sLmVqcyIsImJ1aWxkL2pzL2NyYWZ0L2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvY3JhZnQvYmxvY2tzLmpzIiwiYnVpbGQvanMvY3JhZnQvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUJBLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEMsSUFBSSxPQUFPLEdBQUc7QUFDWixPQUFLLEVBQUUsRUFDTjtDQUNGLENBQUM7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEMsU0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7OztBQ1BGLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsQ0FBQztBQUNqRCxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWhDLElBQUksUUFBUSxHQUFHLFNBQVgsUUFBUSxDQUFhLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDckMsU0FBTyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsVUFBVSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsTUFBTSxHQUFHLGFBQWEsQ0FBQztDQUNwRixDQUFDOztBQUVGLElBQUksZ0JBQWdCLEdBQUcsMENBQTBDLENBQUM7O0FBRWxFLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUN4QixTQUFPLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsU0FBUyxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ25CLFNBQU8sZUFBZSxHQUFHLElBQUksR0FBRyxZQUFZLENBQUM7Q0FDOUM7O0FBRUQsSUFBSSxjQUFjLEdBQUcseUNBQXlDLEdBQzVELGlEQUFpRCxHQUNqRCxVQUFVLENBQUM7O0FBRWIsSUFBSSxhQUFhLEdBQUcsMkJBQTJCLEdBQzdDLGtDQUFrQyxHQUNsQyxVQUFVLENBQUM7O0FBRWIsSUFBSSxjQUFjLEdBQUcsMkJBQTJCLEdBQzVDLGlDQUFpQyxHQUNuQyxVQUFVLENBQUM7O0FBRWIsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGNBQVksRUFBRTtBQUNaLG9CQUFnQixFQUFFLEVBQUU7QUFDcEIsY0FBVSxFQUFFLElBQUk7QUFDaEIsYUFBUyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQ25DLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FDdkIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUN0QixVQUFVLENBQUMsY0FBYyxDQUFDLEdBQzFCLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FDeEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQ3hCLGNBQWMsR0FDZCxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FDaEM7QUFDRCxpQkFBYSxFQUFFLGlFQUFpRTs7QUFFaEYsZUFBVyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUNwRyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3ZHLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUN6Rjs7QUFFRCx5QkFBcUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7QUFFbEQsZUFBVyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN0RSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQ2hELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUM3Qzs7QUFFRCxjQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDL0MsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQ2hEO0dBQ0Y7QUFDRCxLQUFHLEVBQUU7QUFDSCxvQkFBZ0IsRUFBRSxFQUFFO0FBQ3BCLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLGFBQVMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxHQUNuQyxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQ3ZCLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FDekI7QUFDRCxpQkFBYSxFQUFFLGlFQUFpRTs7QUFFaEYsdUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUUzQixlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3BHLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDdkcsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQ3pGOztBQUVELHlCQUFxQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1RCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOztBQUVsRCxlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3RFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFDaEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQzdDOztBQUVELGNBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDaEQ7O0FBRUQsd0JBQW9CLEVBQUUsOEJBQVUsZUFBZSxFQUFFO0FBQy9DLGFBQU8sZUFBZSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNqRDs7R0FFRjtBQUNELEtBQUcsRUFBRTtBQUNILG9CQUFnQixFQUFFLEVBQUU7QUFDcEIsY0FBVSxFQUFFLElBQUk7QUFDaEIsYUFBUyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQ25DLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FDdkIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUN0QixVQUFVLENBQUMsY0FBYyxDQUFDLEdBQzFCLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FDeEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQ3hCLGNBQWMsR0FDZCxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FDaEM7QUFDRCxpQkFBYSxFQUFFLGlFQUFpRTs7QUFFaEYsZUFBVyxFQUFFLENBQ1gsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RyxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3ZILE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEcsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUN6Rjs7QUFFRCx5QkFBcUIsRUFBRSxDQUNyQixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRWxELGVBQVcsRUFBRSxDQUNYLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDdkM7O0FBRUQsY0FBVSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFF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RSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEYsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDdkMsQ0FBQztBQUNGLFlBQU07QUFBQSxHQUNUOztBQUVELFdBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFO0FBQ2xDLHVCQUFtQixFQUFFLFVBQVU7QUFDL0IsUUFBSSxFQUFFLE9BQU8s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LE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO0FBQ3o3Qix3QkFBb0IsRUFBRSxDQUFDLFVBQVUsZUFBZSxFQUFFO0FBQ2hELGFBQU8sZUFBZSxDQUFDLDJCQUEyQixDQUFDLENBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDbEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDbEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUMsQ0FBQSxDQUFFLFFBQVEsRUFBRTtBQUNiLGlCQUFhLEVBQUUsQ0FDYixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMzRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RGLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRXpDLG9CQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUN6QjtBQUNELFFBQU0sRUFBRTtBQUNOLGlCQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7QUFDOTlCLDJCQUF1QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzNiLGlCQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDL2MsMEJBQXNCLEVBQUUsazdCQUFrN0I7QUFDMThCLGlCQUFhLEVBQUUsa3FCQUFrcUI7O0FBRWpyQixpQkFBYSxFQUFFLENBQ2IsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDM0QsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0RixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOztBQUV6QyxvQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDekI7QUFDRCxRQUFNLEVBQUU7QUFDTixlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7QUFDMytCLHdCQUFvQixFQUFFLDI3QkFBMjdCO0FBQ2o5QixlQUFXLEVBQUUsNFdBQTRXO0FBQ3pYLGlCQUFhLEVBQUUsQ0FDYixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzNELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEYsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDekMsZUFBVyxFQUFFLENBQ1gsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFF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SUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNwRCxXQUFDLEVBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQUFBQztBQUMzQixXQUFDLEVBQUcsT0FBTyxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEFBQUM7U0FDaEMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDcEMsTUFBTTtBQUNMLGdCQUFRLEdBQUcsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUNsQyxZQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdELGFBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNwRCxXQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xHLFdBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FB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RyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDdkIsaUJBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7T0FDOUI7OztBQUdELGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7O0FBRzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxlQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFMUMsV0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDdkIsaUJBQVMsQ0FBQyxJQUFJ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QUFTLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvSCxVQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvRyxVQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQU07QUFDL0ksZ0JBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMvQixDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsSSxVQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoSSxVQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMs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QUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkQsV0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkQsV0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkQsV0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0QsV0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekQsV0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekQsV0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekQsV0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekQsV0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRSwrQkFBZ0IsS0FBSyxF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SSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FDcEIsV0FBVyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FDN0IsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7R0FDRixDQUFDOztBQUVGLFNBQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLHFCQUFxQixHQUFHLFlBQVc7QUFDckUsUUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQyxXQUFPLG1CQUFtQixHQUFHLFNBQVMsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUNoRixDQUFDO0NBRUgsQ0FBQzs7O0FDdlZGO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwTWFpbiA9IHJlcXVpcmUoJy4uL2FwcE1haW4nKTtcbndpbmRvdy5DcmFmdCA9IHJlcXVpcmUoJy4vY3JhZnQnKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuQ3JhZnQgPSB3aW5kb3cuQ3JhZnQ7XG59XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xuXG53aW5kb3cuY3JhZnRNYWluID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuXG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBvcHRpb25zLm1heFZpc3VhbGl6YXRpb25XaWR0aCA9IDYwMDtcbiAgdmFyIGFwcFdpZHRoID0gNDM0O1xuICB2YXIgYXBwSGVpZ2h0ID0gNDc3O1xuICBvcHRpb25zLm5hdGl2ZVZpeldpZHRoID0gYXBwV2lkdGg7XG4gIG9wdGlvbnMudml6QXNwZWN0UmF0aW8gPSBhcHBXaWR0aCAvIGFwcEhlaWdodDtcblxuICBhcHBNYWluKHdpbmRvdy5DcmFmdCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW1KMWFXeGtMMnB6TDJOeVlXWjBMMjFoYVc0dWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPMEZCUVVFc1NVRkJTU3hQUVVGUExFZEJRVWNzVDBGQlR5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRPMEZCUTNCRExFMUJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8wRkJRMnhETEVsQlFVa3NUMEZCVHl4TlFVRk5MRXRCUVVzc1YwRkJWeXhGUVVGRk8wRkJRMnBETEZGQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF6dERRVU0zUWp0QlFVTkVMRWxCUVVrc1RVRkJUU3hIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0QlFVTnFReXhKUVVGSkxFMUJRVTBzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1FVRkRha01zU1VGQlNTeExRVUZMTEVkQlFVY3NUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE96dEJRVVV2UWl4TlFVRk5MRU5CUVVNc1UwRkJVeXhIUVVGSExGVkJRVk1zVDBGQlR5eEZRVUZGTzBGQlEyNURMRk5CUVU4c1EwRkJReXhYUVVGWExFZEJRVWNzUzBGQlN5eERRVUZET3p0QlFVVTFRaXhUUVVGUExFTkJRVU1zV1VGQldTeEhRVUZITEUxQlFVMHNRMEZCUXp0QlFVTTVRaXhUUVVGUExFTkJRVU1zY1VKQlFYRkNMRWRCUVVjc1IwRkJSeXhEUVVGRE8wRkJRM0JETEUxQlFVa3NVVUZCVVN4SFFVRkhMRWRCUVVjc1EwRkJRenRCUVVOdVFpeE5RVUZKTEZOQlFWTXNSMEZCUnl4SFFVRkhMRU5CUVVNN1FVRkRjRUlzVTBGQlR5eERRVUZETEdOQlFXTXNSMEZCUnl4UlFVRlJMRU5CUVVNN1FVRkRiRU1zVTBGQlR5eERRVUZETEdOQlFXTXNSMEZCUnl4UlFVRlJMRWRCUVVjc1UwRkJVeXhEUVVGRE96dEJRVVU1UXl4VFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUlVGQlJTeE5RVUZOTEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNN1EwRkRlRU1zUTBGQlF5SXNJbVpwYkdVaU9pSm5aVzVsY21GMFpXUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpZG1GeUlHRndjRTFoYVc0Z1BTQnlaWEYxYVhKbEtDY3VMaTloY0hCTllXbHVKeWs3WEc1M2FXNWtiM2N1UTNKaFpuUWdQU0J5WlhGMWFYSmxLQ2N1TDJOeVlXWjBKeWs3WEc1cFppQW9kSGx3Wlc5bUlHZHNiMkpoYkNBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NwSUh0Y2JpQWdaMnh2WW1Gc0xrTnlZV1owSUQwZ2QybHVaRzkzTGtOeVlXWjBPMXh1ZlZ4dWRtRnlJR0pzYjJOcmN5QTlJSEpsY1hWcGNtVW9KeTR2WW14dlkydHpKeWs3WEc1MllYSWdiR1YyWld4eklEMGdjbVZ4ZFdseVpTZ25MaTlzWlhabGJITW5LVHRjYm5aaGNpQnphMmx1Y3lBOUlISmxjWFZwY21Vb0p5NHZjMnRwYm5NbktUdGNibHh1ZDJsdVpHOTNMbU55WVdaMFRXRnBiaUE5SUdaMWJtTjBhVzl1S0c5d2RHbHZibk1wSUh0Y2JpQWdiM0IwYVc5dWN5NXphMmx1YzAxdlpIVnNaU0E5SUhOcmFXNXpPMXh1WEc0Z0lHOXdkR2x2Ym5NdVlteHZZMnR6VFc5a2RXeGxJRDBnWW14dlkydHpPMXh1SUNCdmNIUnBiMjV6TG0xaGVGWnBjM1ZoYkdsNllYUnBiMjVYYVdSMGFDQTlJRFl3TUR0Y2JpQWdkbUZ5SUdGd2NGZHBaSFJvSUQwZ05ETTBPMXh1SUNCMllYSWdZWEJ3U0dWcFoyaDBJRDBnTkRjM08xeHVJQ0J2Y0hScGIyNXpMbTVoZEdsMlpWWnBlbGRwWkhSb0lEMGdZWEJ3VjJsa2RHZzdYRzRnSUc5d2RHbHZibk11ZG1sNlFYTndaV04wVW1GMGFXOGdQU0JoY0hCWGFXUjBhQ0F2SUdGd2NFaGxhV2RvZER0Y2JseHVJQ0JoY0hCTllXbHVLSGRwYm1SdmR5NURjbUZtZEN3Z2JHVjJaV3h6TENCdmNIUnBiMjV6S1R0Y2JuMDdYRzRpWFgwPSIsInZhciBza2luc0Jhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG52YXIgQ09ORklHUyA9IHtcbiAgY3JhZnQ6IHtcbiAgfVxufTtcblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24oYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbnNCYXNlLmxvYWQoYXNzZXRVcmwsIGlkKTtcbiAgcmV0dXJuIHNraW47XG59O1xuIiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cbi8qIGdsb2JhbCAkICovXG5cbnZhciB0YiA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJykuY3JlYXRlVG9vbGJveDtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBjYXRlZ29yeSA9IGZ1bmN0aW9uIChuYW1lLCBibG9ja3MpIHtcbiAgcmV0dXJuICc8Y2F0ZWdvcnkgaWQ9XCInICsgbmFtZSArICdcIiBuYW1lPVwiJyArIG5hbWUgKyAnXCI+JyArIGJsb2NrcyArICc8L2NhdGVnb3J5Pic7XG59O1xuXG52YXIgbW92ZUZvcndhcmRCbG9jayA9ICc8YmxvY2sgdHlwZT1cImNyYWZ0X21vdmVGb3J3YXJkXCI+PC9ibG9jaz4nO1xuXG5mdW5jdGlvbiBjcmFmdEJsb2NrKHR5cGUpIHtcbiAgcmV0dXJuIGJsb2NrKFwiY3JhZnRfXCIgKyB0eXBlKTtcbn1cblxuZnVuY3Rpb24gYmxvY2sodHlwZSkge1xuICByZXR1cm4gJzxibG9jayB0eXBlPVwiJyArIHR5cGUgKyAnXCI+PC9ibG9jaz4nO1xufVxuXG52YXIgcmVwZWF0RHJvcGRvd24gPSAnPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfZHJvcGRvd25cIj4nICtcbiAgJyAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiIGNvbmZpZz1cIjMtMTBcIj4/Pz88L3RpdGxlPicgK1xuICAnPC9ibG9jaz4nO1xuXG52YXIgdHVybkxlZnRCbG9jayA9ICc8YmxvY2sgdHlwZT1cImNyYWZ0X3R1cm5cIj4nICtcbiAgJyAgPHRpdGxlIG5hbWU9XCJESVJcIj5sZWZ0PC90aXRsZT4nICtcbiAgJzwvYmxvY2s+JztcblxudmFyIHR1cm5SaWdodEJsb2NrID0gJzxibG9jayB0eXBlPVwiY3JhZnRfdHVyblwiPicgK1xuICAgICc8dGl0bGUgbmFtZT1cIkRJUlwiPnJpZ2h0PC90aXRsZT4nICtcbiAgJzwvYmxvY2s+JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICdwbGF5Z3JvdW5kJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtdLFxuICAgICdmcmVlUGxheSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB0YihjcmFmdEJsb2NrKCdtb3ZlRm9yd2FyZCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygndHVyblJpZ2h0JykgK1xuICAgICAgICBjcmFmdEJsb2NrKCd0dXJuTGVmdCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygnZGVzdHJveUJsb2NrJykgK1xuICAgICAgICBjcmFmdEJsb2NrKCdwbGFjZUJsb2NrJykgK1xuICAgICAgICBibG9jaygnY29udHJvbHNfcmVwZWF0JykgK1xuICAgICAgICByZXBlYXREcm9wZG93biArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3doaWxlQmxvY2tBaGVhZCcpXG4gICAgKSxcbiAgICAnc3RhcnRCbG9ja3MnOiAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nLFxuXG4gICAgZ3JvdW5kUGxhbmU6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImNvYXJzZURpcnRcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwiY29hcnNlRGlydFwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCJcbiAgICBdLFxuXG4gICAgZ3JvdW5kRGVjb3JhdGlvblBsYW5lOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sXG5cbiAgICBhY3Rpb25QbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiXCIsIFwiZ3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJncmFzc1wiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCJcbiAgICBdLFxuXG4gICAgZmx1ZmZQbGFuZTogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCJcbiAgICBdLFxuICB9LFxuICAnMSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgICAnZnJlZVBsYXknOiB0cnVlLFxuICAgICd0b29sYm94JzogdGIoY3JhZnRCbG9jaygnbW92ZUZvcndhcmQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3R1cm5SaWdodCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygndHVybkxlZnQnKVxuICAgICksXG4gICAgJ3N0YXJ0QmxvY2tzJzogJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+JyxcblxuICAgIHBsYXllclN0YXJ0UG9zaXRpb246IFszLCA0XSxcblxuICAgIGdyb3VuZFBsYW5lOiBbXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwiY29hcnNlRGlydFwiLCBcImNvYXJzZURpcnRcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiXG4gICAgXSxcblxuICAgIGdyb3VuZERlY29yYXRpb25QbGFuZTogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwidGFsbEdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCJdLFxuXG4gICAgYWN0aW9uUGxhbmU6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcIlwiLCBcImdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiXG4gICAgXSxcblxuICAgIGZsdWZmUGxhbmU6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiXG4gICAgXSxcblxuICAgIHZlcmlmaWNhdGlvbkZ1bmN0aW9uOiBmdW5jdGlvbiAodmVyaWZpY2F0aW9uQVBJKSB7XG4gICAgICByZXR1cm4gdmVyaWZpY2F0aW9uQVBJLmlzUGxheWVyTmV4dFRvKFwibG9nT2FrXCIpO1xuICAgIH0sXG5cbiAgfSxcbiAgJzInOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW10sXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHRiKGNyYWZ0QmxvY2soJ21vdmVGb3J3YXJkJykgK1xuICAgICAgICBjcmFmdEJsb2NrKCd0dXJuUmlnaHQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3R1cm5MZWZ0JykgK1xuICAgICAgICBjcmFmdEJsb2NrKCdkZXN0cm95QmxvY2snKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3BsYWNlQmxvY2snKSArXG4gICAgICAgIGJsb2NrKCdjb250cm9sc19yZXBlYXQnKSArXG4gICAgICAgIHJlcGVhdERyb3Bkb3duICtcbiAgICAgICAgY3JhZnRCbG9jaygnd2hpbGVCbG9ja0FoZWFkJylcbiAgICApLFxuICAgICdzdGFydEJsb2Nrcyc6ICc8YmxvY2sgdHlwZT1cIndoZW5fcnVuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPicsXG5cbiAgICBncm91bmRQbGFuZTogW1xuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiY29hcnNlRGlydFwiLCBcImNvYXJzZURpcnRcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIlxuICAgIF0sXG5cbiAgICBncm91bmREZWNvcmF0aW9uUGxhbmU6IFtcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJ0YWxsR3Jhc3NcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwidGFsbEdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCJdLFxuXG4gICAgYWN0aW9uUGxhbmU6IFtcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgXSxcblxuICAgIGZsdWZmUGxhbmU6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgIF0sXG4gIH0sXG4gICdjdXN0b20nOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW10sXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ3Rvb2xib3gnOiB0Yihtb3ZlRm9yd2FyZEJsb2NrICsgdHVybkxlZnRCbG9jayArIHR1cm5SaWdodEJsb2NrKVxuICB9XG59O1xuIiwiLypqc2hpbnQgLVcwNjEgKi9cbi8vIFdlIHVzZSBldmFsIGluIG91ciBjb2RlLCB0aGlzIGFsbG93cyBpdC5cbi8vIEBzZWUgaHR0cHM6Ly9qc2xpbnRlcnJvcnMuY29tL2V2YWwtaXMtZXZpbFxuXG4ndXNlIHN0cmljdCc7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIGNyYWZ0TXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIEdhbWVDb250cm9sbGVyID0gcmVxdWlyZSgnLi9nYW1lL0dhbWVDb250cm9sbGVyJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi4vZG9tJyk7XG52YXIgaG91c2VMZXZlbHMgPSByZXF1aXJlKCcuL2hvdXNlTGV2ZWxzJyk7XG52YXIgbGV2ZWxidWlsZGVyT3ZlcnJpZGVzID0gcmVxdWlyZSgnLi9sZXZlbGJ1aWxkZXJPdmVycmlkZXMnKTtcblxudmFyIFJlc3VsdFR5cGUgPSBzdHVkaW9BcHAuUmVzdWx0VHlwZTtcbnZhciBUZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5UZXN0UmVzdWx0cztcblxudmFyIE1FRElBX1VSTCA9ICcvYmxvY2tseS9tZWRpYS9jcmFmdC8nO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgQ3JhZnQgPSBtb2R1bGUuZXhwb3J0cztcblxudmFyIGNoYXJhY3RlcnMgPSB7XG4gIFN0ZXZlOiB7XG4gICAgbmFtZTogXCJTdGV2ZVwiLFxuICAgIHN0YXRpY0F2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9TdGV2ZV9OZXV0cmFsLnBuZ1wiLFxuICAgIHNtYWxsU3RhdGljQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX1N0ZXZlX05ldXRyYWwucG5nXCIsXG4gICAgZmFpbHVyZUF2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9TdGV2ZV9GYWlsLnBuZ1wiLFxuICAgIHdpbkF2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9TdGV2ZV9XaW4ucG5nXCIsXG4gIH0sXG4gIEFsZXg6IHtcbiAgICBuYW1lOiBcIkFsZXhcIixcbiAgICBzdGF0aWNBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfQWxleF9OZXV0cmFsLnBuZ1wiLFxuICAgIHNtYWxsU3RhdGljQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX0FsZXhfTmV1dHJhbC5wbmdcIixcbiAgICBmYWlsdXJlQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX0FsZXhfRmFpbC5wbmdcIixcbiAgICB3aW5BdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfQWxleF9XaW4ucG5nXCIsXG4gIH1cbn07XG5cbnZhciBpbnRlcmZhY2VJbWFnZXMgPSB7XG4gIDE6IFtcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9NQ19Mb2FkaW5nX1NwaW5uZXIuZ2lmXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvR2FtZV9XaW5kb3dfQkdfRnJhbWUucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1N0ZXZlX0NoYXJhY3Rlcl9TZWxlY3QucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvQWxleF9DaGFyYWN0ZXJfU2VsZWN0LnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1hfQnV0dG9uLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0J1dHRvbl9HcmV5X1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1J1bl9CdXR0b25fVXBfU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvTUNfUnVuX0Fycm93X0ljb24ucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUnVuX0J1dHRvbl9Eb3duX1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1Jlc2V0X0J1dHRvbl9VcF9TbGljZS5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9NQ19SZXNldF9BcnJvd19JY29uLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1Jlc2V0X0J1dHRvbl9Eb3duX1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0NhbGxvdXRfVGFpbC5wbmdcIixcbiAgICBjaGFyYWN0ZXJzLlN0ZXZlLnN0YXRpY0F2YXRhcixcbiAgICBjaGFyYWN0ZXJzLlN0ZXZlLnNtYWxsU3RhdGljQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuQWxleC5zdGF0aWNBdmF0YXIsXG4gICAgY2hhcmFjdGVycy5BbGV4LnNtYWxsU3RhdGljQXZhdGFyLFxuICBdLFxuICAyOiBbXG4gICAgLy8gVE9ETyhiam9yZGFuKTogZmluZCBkaWZmZXJlbnQgcHJlLWxvYWQgcG9pbnQgZm9yIGZlZWRiYWNrIGltYWdlcyxcbiAgICAvLyBidWNrZXQgYnkgc2VsZWN0ZWQgY2hhcmFjdGVyXG4gICAgY2hhcmFjdGVycy5BbGV4LndpbkF2YXRhcixcbiAgICBjaGFyYWN0ZXJzLlN0ZXZlLndpbkF2YXRhcixcbiAgICBjaGFyYWN0ZXJzLkFsZXguZmFpbHVyZUF2YXRhcixcbiAgICBjaGFyYWN0ZXJzLlN0ZXZlLmZhaWx1cmVBdmF0YXIsXG4gIF0sXG4gIDY6IFtcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Ib3VzZV9PcHRpb25fQV92My5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Ib3VzZV9PcHRpb25fQl92My5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Ib3VzZV9PcHRpb25fQ192My5wbmdcIixcbiAgXVxufTtcblxudmFyIENIQVJBQ1RFUl9TVEVWRSA9ICdTdGV2ZSc7XG52YXIgQ0hBUkFDVEVSX0FMRVggPSAnQWxleCc7XG52YXIgREVGQVVMVF9DSEFSQUNURVIgPSBDSEFSQUNURVJfU1RFVkU7XG52YXIgQVVUT19MT0FEX0NIQVJBQ1RFUl9BU1NFVF9QQUNLID0gJ3BsYXllcicgKyBERUZBVUxUX0NIQVJBQ1RFUjtcblxuZnVuY3Rpb24gdHJ5U2V0TG9jYWxTdG9yYWdlSXRlbShrZXksIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLyoqXG4gICAgICogbG9jYWxzdG9yYWdlIC5zZXRJdGVtIGluIGlPUyBTYWZhcmkgUHJpdmF0ZSBNb2RlIGFsd2F5cyBjYXVzZXMgYW5cbiAgICAgKiBleGNlcHRpb24sIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDU1NTM2MVxuICAgICAqL1xuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkNvdWxkbid0IHNldCBsb2NhbCBzdG9yYWdlIGl0ZW0gZm9yIGtleSBcIiArIGtleSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGUgQ3JhZnQgYXBwLiBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5DcmFmdC5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXIgPT09IDEgJiYgY29uZmlnLmxldmVsLnN0YWdlX3RvdGFsID09PSAxKSB7XG4gICAgLy8gTm90IHZpZXdpbmcgbGV2ZWwgd2l0aGluIGEgc2NyaXB0LCBidW1wIHB1enpsZSAjIHRvIHVudXNlZCBvbmUgc29cbiAgICAvLyBhc3NldCBsb2FkaW5nIHN5c3RlbSBhbmQgbGV2ZWxidWlsZGVyIG92ZXJyaWRlcyBkb24ndCB0aGluayB0aGlzIGlzXG4gICAgLy8gbGV2ZWwgMSBvciBhbnkgb3RoZXIgc3BlY2lhbCBsZXZlbC5cbiAgICBjb25maWcubGV2ZWwucHV6emxlX251bWJlciA9IDk5OTtcbiAgfVxuXG4gIGlmIChjb25maWcubGV2ZWwuaXNUZXN0TGV2ZWwpIHtcbiAgICBjb25maWcubGV2ZWwuY3VzdG9tU2xvd01vdGlvbiA9IDAuMTtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgdmVyc2lvbiBvZiBJbnRlcm5ldCBFeHBsb3JlciAoOCspIG9yIHVuZGVmaW5lZCBpZiBub3QgSUUuXG4gIHZhciBnZXRJRVZlcnNpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRNb2RlO1xuICB9O1xuXG4gIHZhciBpZVZlcnNpb25OdW1iZXIgPSBnZXRJRVZlcnNpb24oKTtcbiAgaWYgKGllVmVyc2lvbk51bWJlcikge1xuICAgICQoJ2JvZHknKS5hZGRDbGFzcyhcImllVmVyc2lvblwiICsgaWVWZXJzaW9uTnVtYmVyKTtcbiAgfVxuXG4gIHZhciBib2R5RWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XG4gIGJvZHlFbGVtZW50LmNsYXNzTmFtZSA9IGJvZHlFbGVtZW50LmNsYXNzTmFtZSArIFwiIG1pbmVjcmFmdFwiO1xuXG4gIGlmIChjb25maWcubGV2ZWwuc2hvd1BvcHVwT25Mb2FkKSB7XG4gICAgY29uZmlnLmxldmVsLmFmdGVyVmlkZW9CZWZvcmVJbnN0cnVjdGlvbnNGbiA9IChzaG93SW5zdHJ1Y3Rpb25zKSA9PiB7XG4gICAgICBpZiAoY29uZmlnLmxldmVsLnNob3dQb3B1cE9uTG9hZCA9PT0gJ3BsYXllclNlbGVjdGlvbicpIHtcbiAgICAgICAgQ3JhZnQuc2hvd1BsYXllclNlbGVjdGlvblBvcHVwKGZ1bmN0aW9uIChzZWxlY3RlZFBsYXllcikge1xuICAgICAgICAgIENyYWZ0LmNsZWFyUGxheWVyU3RhdGUoKTtcbiAgICAgICAgICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdFNlbGVjdGVkUGxheWVyJywgc2VsZWN0ZWRQbGF5ZXIpO1xuICAgICAgICAgIENyYWZ0LnVwZGF0ZVVJRm9yQ2hhcmFjdGVyKHNlbGVjdGVkUGxheWVyKTtcbiAgICAgICAgICBDcmFmdC5pbml0aWFsaXplQXBwTGV2ZWwoY29uZmlnLmxldmVsKTtcbiAgICAgICAgICBzaG93SW5zdHJ1Y3Rpb25zKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcubGV2ZWwuc2hvd1BvcHVwT25Mb2FkID09PSAnaG91c2VMYXlvdXRTZWxlY3Rpb24nKSB7XG4gICAgICAgIENyYWZ0LnNob3dIb3VzZVNlbGVjdGlvblBvcHVwKGZ1bmN0aW9uKHNlbGVjdGVkSG91c2UpIHtcbiAgICAgICAgICBpZiAoIWxldmVsQ29uZmlnLmVkaXRfYmxvY2tzKSB7XG4gICAgICAgICAgICAkLmV4dGVuZChjb25maWcubGV2ZWwsIGhvdXNlTGV2ZWxzW3NlbGVjdGVkSG91c2VdKTtcblxuICAgICAgICAgICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5jbGVhcigpO1xuICAgICAgICAgICAgc3R1ZGlvQXBwLnNldFN0YXJ0QmxvY2tzXyhjb25maWcsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBDcmFmdC5pbml0aWFsaXplQXBwTGV2ZWwoY29uZmlnLmxldmVsKTtcbiAgICAgICAgICBzaG93SW5zdHJ1Y3Rpb25zKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBpZiAoY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXIgJiYgbGV2ZWxidWlsZGVyT3ZlcnJpZGVzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXSkge1xuICAgICQuZXh0ZW5kKGNvbmZpZy5sZXZlbCwgbGV2ZWxidWlsZGVyT3ZlcnJpZGVzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXSk7XG4gIH1cbiAgQ3JhZnQuaW5pdGlhbENvbmZpZyA9IGNvbmZpZztcblxuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucmVzZXQgPSB0aGlzLnJlc2V0LmJpbmQodGhpcyk7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBDcmFmdC5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcbiAgQ3JhZnQuc2tpbiA9IGNvbmZpZy5za2luO1xuXG4gIHZhciBjaGFyYWN0ZXIgPSBjaGFyYWN0ZXJzW0NyYWZ0LmdldEN1cnJlbnRDaGFyYWN0ZXIoKV07XG4gIGNvbmZpZy5za2luLnN0YXRpY0F2YXRhciA9IGNoYXJhY3Rlci5zdGF0aWNBdmF0YXI7XG4gIGNvbmZpZy5za2luLnNtYWxsU3RhdGljQXZhdGFyID0gY2hhcmFjdGVyLnNtYWxsU3RhdGljQXZhdGFyO1xuICBjb25maWcuc2tpbi5mYWlsdXJlQXZhdGFyID0gY2hhcmFjdGVyLmZhaWx1cmVBdmF0YXI7XG4gIGNvbmZpZy5za2luLndpbkF2YXRhciA9IGNoYXJhY3Rlci53aW5BdmF0YXI7XG5cbiAgdmFyIGxldmVsQ29uZmlnID0gY29uZmlnLmxldmVsO1xuICB2YXIgc3BlY2lhbExldmVsVHlwZSA9IGxldmVsQ29uZmlnLnNwZWNpYWxMZXZlbFR5cGU7XG4gIHN3aXRjaCAoc3BlY2lhbExldmVsVHlwZSkge1xuICAgIGNhc2UgJ2hvdXNlV2FsbEJ1aWxkJzpcbiAgICAgIGxldmVsQ29uZmlnLmJsb2Nrc1RvU3RvcmUgPSBbXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiaG91c2VCb3R0b21BXCIsIFwiaG91c2VCb3R0b21CXCIsIFwiaG91c2VCb3R0b21DXCIsIFwiaG91c2VCb3R0b21EXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCJcbiAgICAgIF07XG4gICAgICBicmVhaztcbiAgfVxuXG4gIHN0dWRpb0FwcC5pbml0KCQuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICBmb3JjZUluc2VydFRvcEJsb2NrOiAnd2hlbl9ydW4nLFxuICAgIGh0bWw6IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJykoe1xuICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbG9jYWxlRGlyZWN0aW9uOiBzdHVkaW9BcHAubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICAgIHZpc3VhbGl6YXRpb246IHJlcXVpcmUoJy4vdmlzdWFsaXphdGlvbi5odG1sLmVqcycpKCksXG4gICAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgICAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICAgICAgc2hhcmVhYmxlOiBjb25maWcubGV2ZWwuc2hhcmVhYmxlXG4gICAgICAgIH0pLFxuICAgICAgICBlZGl0Q29kZTogY29uZmlnLmxldmVsLmVkaXRDb2RlLFxuICAgICAgICBibG9ja0NvdW50ZXJDbGFzczogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCcsXG4gICAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICAgIH1cbiAgICB9KSxcbiAgICBsb2FkQXVkaW86IGZ1bmN0aW9uICgpIHtcbiAgICB9LFxuICAgIGFmdGVySW5qZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2xvd01vdGlvblVSTFBhcmFtID0gcGFyc2VGbG9hdCgobG9jYXRpb24uc2VhcmNoLnNwbGl0KCdjdXN0b21TbG93TW90aW9uPScpWzFdIHx8ICcnKS5zcGxpdCgnJicpWzBdKTtcbiAgICAgIENyYWZ0LmdhbWVDb250cm9sbGVyID0gbmV3IEdhbWVDb250cm9sbGVyKHtcbiAgICAgICAgUGhhc2VyOiB3aW5kb3cuUGhhc2VyLFxuICAgICAgICBjb250YWluZXJJZDogJ3BoYXNlci1nYW1lJyxcbiAgICAgICAgYXNzZXRSb290OiBDcmFmdC5za2luLmFzc2V0VXJsKCcnKSxcbiAgICAgICAgYXVkaW9QbGF5ZXI6IHtcbiAgICAgICAgICByZWdpc3Rlcjogc3R1ZGlvQXBwLnJlZ2lzdGVyQXVkaW8uYmluZChzdHVkaW9BcHApLFxuICAgICAgICAgIHBsYXk6IHN0dWRpb0FwcC5wbGF5QXVkaW8uYmluZChzdHVkaW9BcHApXG4gICAgICAgIH0sXG4gICAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgICAgY3VzdG9tU2xvd01vdGlvbjogc2xvd01vdGlvblVSTFBhcmFtLCAvLyBOYU4gaWYgbm90IHNldFxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyc3QgYXNzZXQgcGFja3MgdG8gbG9hZCB3aGlsZSB2aWRlbyBwbGF5aW5nLCBldGMuXG4gICAgICAgICAqIFdvbid0IG1hdHRlciBmb3IgbGV2ZWxzIHdpdGhvdXQgZGVsYXllZCBsZXZlbCBpbml0aWFsaXphdGlvblxuICAgICAgICAgKiAoZHVlIHRvIGUuZy4gY2hhcmFjdGVyIC8gaG91c2Ugc2VsZWN0IHBvcHVwcykuXG4gICAgICAgICAqL1xuICAgICAgICBlYXJseUxvYWRBc3NldFBhY2tzOiBDcmFmdC5lYXJseUxvYWRBc3NldHNGb3JMZXZlbChsZXZlbENvbmZpZy5wdXp6bGVfbnVtYmVyKSxcbiAgICAgICAgZWFybHlMb2FkTmljZVRvSGF2ZUFzc2V0UGFja3M6IENyYWZ0Lm5pY2VUb0hhdmVBc3NldHNGb3JMZXZlbChsZXZlbENvbmZpZy5wdXp6bGVfbnVtYmVyKSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWNvbmZpZy5sZXZlbC5zaG93UG9wdXBPbkxvYWQpIHtcbiAgICAgICAgQ3JhZnQuaW5pdGlhbGl6ZUFwcExldmVsKGNvbmZpZy5sZXZlbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0d2l0dGVyOiB7XG4gICAgICB0ZXh0OiBcIlNoYXJlIG9uIFR3aXR0ZXJcIixcbiAgICAgIGhhc2h0YWc6IFwiQ3JhZnRcIlxuICAgIH1cbiAgfSkpO1xuXG4gIGlmIChjb25maWcubGV2ZWwucHV6emxlX251bWJlciAmJiBpbnRlcmZhY2VJbWFnZXNbY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXJdKSB7XG4gICAgaW50ZXJmYWNlSW1hZ2VzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXS5mb3JFYWNoKGZ1bmN0aW9uKHVybCkge1xuICAgICAgcHJlbG9hZEltYWdlKHVybCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbnZhciBwcmVsb2FkSW1hZ2UgPSBmdW5jdGlvbih1cmwpIHtcbiAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICBpbWcuc3JjID0gdXJsO1xufTtcblxuQ3JhZnQuY2hhcmFjdGVyQXNzZXRQYWNrTmFtZSA9IGZ1bmN0aW9uIChwbGF5ZXJOYW1lKSB7XG4gIHJldHVybiAncGxheWVyJyArIHBsYXllck5hbWU7XG59O1xuXG5DcmFmdC5nZXRDdXJyZW50Q2hhcmFjdGVyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFmdFNlbGVjdGVkUGxheWVyJykgfHwgREVGQVVMVF9DSEFSQUNURVI7XG59O1xuXG5DcmFmdC51cGRhdGVVSUZvckNoYXJhY3RlciA9IGZ1bmN0aW9uIChjaGFyYWN0ZXIpIHtcbiAgQ3JhZnQuaW5pdGlhbENvbmZpZy5za2luLnN0YXRpY0F2YXRhciA9IGNoYXJhY3RlcnNbY2hhcmFjdGVyXS5zdGF0aWNBdmF0YXI7XG4gIENyYWZ0LmluaXRpYWxDb25maWcuc2tpbi5zbWFsbFN0YXRpY0F2YXRhciA9IGNoYXJhY3RlcnNbY2hhcmFjdGVyXS5zbWFsbFN0YXRpY0F2YXRhcjtcbiAgQ3JhZnQuaW5pdGlhbENvbmZpZy5za2luLmZhaWx1cmVBdmF0YXIgPSBjaGFyYWN0ZXJzW2NoYXJhY3Rlcl0uZmFpbHVyZUF2YXRhcjtcbiAgQ3JhZnQuaW5pdGlhbENvbmZpZy5za2luLndpbkF2YXRhciA9IGNoYXJhY3RlcnNbY2hhcmFjdGVyXS53aW5BdmF0YXI7XG4gIHN0dWRpb0FwcC5zZXRJY29uc0Zyb21Ta2luKENyYWZ0LmluaXRpYWxDb25maWcuc2tpbik7XG4gICQoJyNwcm9tcHQtaWNvbicpLmF0dHIoJ3NyYycsIGNoYXJhY3RlcnNbY2hhcmFjdGVyXS5zbWFsbFN0YXRpY0F2YXRhcik7XG59O1xuXG5DcmFmdC5zaG93UGxheWVyU2VsZWN0aW9uUG9wdXAgPSBmdW5jdGlvbiAob25TZWxlY3RlZENhbGxiYWNrKSB7XG4gIHZhciBzZWxlY3RlZFBsYXllciA9IERFRkFVTFRfQ0hBUkFDVEVSO1xuICB2YXIgcG9wdXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgcG9wdXBEaXYuaW5uZXJIVE1MID0gcmVxdWlyZSgnLi9kaWFsb2dzL3BsYXllclNlbGVjdGlvbi5odG1sLmVqcycpKHtcbiAgICBpbWFnZTogc3R1ZGlvQXBwLmFzc2V0VXJsKClcbiAgfSk7XG4gIHZhciBwb3B1cERpYWxvZyA9IHN0dWRpb0FwcC5jcmVhdGVNb2RhbERpYWxvZyh7XG4gICAgY29udGVudERpdjogcG9wdXBEaXYsXG4gICAgZGVmYXVsdEJ0blNlbGVjdG9yOiAnI2Nob29zZS1zdGV2ZScsXG4gICAgb25IaWRkZW46IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uU2VsZWN0ZWRDYWxsYmFjayhzZWxlY3RlZFBsYXllcik7XG4gICAgfSxcbiAgICBpZDogJ2NyYWZ0LXBvcHVwLXBsYXllci1zZWxlY3Rpb24nLFxuICB9KTtcbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudCgkKCcjY2xvc2UtY2hhcmFjdGVyLXNlbGVjdCcpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2Utc3RldmUnKVswXSwgZnVuY3Rpb24gKCkge1xuICAgIHNlbGVjdGVkUGxheWVyID0gQ0hBUkFDVEVSX1NURVZFO1xuICAgIHBvcHVwRGlhbG9nLmhpZGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudCgkKCcjY2hvb3NlLWFsZXgnKVswXSwgZnVuY3Rpb24gKCkge1xuICAgIHNlbGVjdGVkUGxheWVyID0gQ0hBUkFDVEVSX0FMRVg7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBwb3B1cERpYWxvZy5zaG93KCk7XG59O1xuXG5DcmFmdC5zaG93SG91c2VTZWxlY3Rpb25Qb3B1cCA9IGZ1bmN0aW9uIChvblNlbGVjdGVkQ2FsbGJhY2spIHtcbiAgdmFyIHBvcHVwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHBvcHVwRGl2LmlubmVySFRNTCA9IHJlcXVpcmUoJy4vZGlhbG9ncy9ob3VzZVNlbGVjdGlvbi5odG1sLmVqcycpKHtcbiAgICBpbWFnZTogc3R1ZGlvQXBwLmFzc2V0VXJsKClcbiAgfSk7XG4gIHZhciBzZWxlY3RlZEhvdXNlID0gJ2hvdXNlQSc7XG5cbiAgdmFyIHBvcHVwRGlhbG9nID0gc3R1ZGlvQXBwLmNyZWF0ZU1vZGFsRGlhbG9nKHtcbiAgICBjb250ZW50RGl2OiBwb3B1cERpdixcbiAgICBkZWZhdWx0QnRuU2VsZWN0b3I6ICcjY2hvb3NlLWhvdXNlLWEnLFxuICAgIG9uSGlkZGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICBvblNlbGVjdGVkQ2FsbGJhY2soc2VsZWN0ZWRIb3VzZSk7XG4gICAgfSxcbiAgICBpZDogJ2NyYWZ0LXBvcHVwLWhvdXNlLXNlbGVjdGlvbicsXG4gICAgaWNvbjogY2hhcmFjdGVyc1tDcmFmdC5nZXRDdXJyZW50Q2hhcmFjdGVyKCldLnN0YXRpY0F2YXRhclxuICB9KTtcblxuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjbG9zZS1ob3VzZS1zZWxlY3QnKVswXSwgZnVuY3Rpb24gKCkge1xuICAgIHBvcHVwRGlhbG9nLmhpZGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudCgkKCcjY2hvb3NlLWhvdXNlLWEnKVswXSwgZnVuY3Rpb24gKCkge1xuICAgIHNlbGVjdGVkSG91c2UgPSBcImhvdXNlQVwiO1xuICAgIHBvcHVwRGlhbG9nLmhpZGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudCgkKCcjY2hvb3NlLWhvdXNlLWInKVswXSwgZnVuY3Rpb24gKCkge1xuICAgIHNlbGVjdGVkSG91c2UgPSBcImhvdXNlQlwiO1xuICAgIHBvcHVwRGlhbG9nLmhpZGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudCgkKCcjY2hvb3NlLWhvdXNlLWMnKVswXSwgZnVuY3Rpb24gKCkge1xuICAgIHNlbGVjdGVkSG91c2UgPSBcImhvdXNlQ1wiO1xuICAgIHBvcHVwRGlhbG9nLmhpZGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICBwb3B1cERpYWxvZy5zaG93KCk7XG59O1xuXG5DcmFmdC5jbGVhclBsYXllclN0YXRlID0gZnVuY3Rpb24gKCkge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWZ0SG91c2VCbG9ja3MnKTtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjcmFmdFBsYXllckludmVudG9yeScpO1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWZ0U2VsZWN0ZWRQbGF5ZXInKTtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjcmFmdFNlbGVjdGVkSG91c2UnKTtcbn07XG5cbkNyYWZ0Lm9uSG91c2VTZWxlY3RlZCA9IGZ1bmN0aW9uIChob3VzZVR5cGUpIHtcbiAgdHJ5U2V0TG9jYWxTdG9yYWdlSXRlbSgnY3JhZnRTZWxlY3RlZEhvdXNlJywgaG91c2VUeXBlKTtcbn07XG5cbkNyYWZ0LmluaXRpYWxpemVBcHBMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbENvbmZpZykge1xuICB2YXIgaG91c2VCbG9ja3MgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhZnRIb3VzZUJsb2NrcycpKTtcbiAgQ3JhZnQuZm9sZEluQ3VzdG9tSG91c2VCbG9ja3MoaG91c2VCbG9ja3MsIGxldmVsQ29uZmlnKTtcblxuICB2YXIgZmx1ZmZQbGFuZSA9IFtdO1xuICAvLyBUT0RPKGJqb3JkYW4pOiByZW1vdmUgY29uZmlndXJhdGlvbiByZXF1aXJlbWVudCBpbiB2aXN1YWxpemF0aW9uXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgKGxldmVsQ29uZmlnLmdyaWRXaWR0aCB8fCAxMCkgKiAobGV2ZWxDb25maWcuZ3JpZEhlaWdodCB8fCAxMCk7IGkrKykge1xuICAgIGZsdWZmUGxhbmUucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgbGV2ZWxBc3NldFBhY2tzID0ge1xuICAgIGJlZm9yZUxvYWQ6IENyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsV2l0aENoYXJhY3RlcihsZXZlbENvbmZpZy5wdXp6bGVfbnVtYmVyKSxcbiAgICBhZnRlckxvYWQ6IENyYWZ0LmFmdGVyTG9hZEFzc2V0c0ZvckxldmVsKGxldmVsQ29uZmlnLnB1enpsZV9udW1iZXIpXG4gIH07XG5cbiAgQ3JhZnQuZ2FtZUNvbnRyb2xsZXIubG9hZExldmVsKHtcbiAgICBpc0RheXRpbWU6IGxldmVsQ29uZmlnLmlzRGF5dGltZSxcbiAgICBncm91bmRQbGFuZTogbGV2ZWxDb25maWcuZ3JvdW5kUGxhbmUsXG4gICAgZ3JvdW5kRGVjb3JhdGlvblBsYW5lOiBsZXZlbENvbmZpZy5ncm91bmREZWNvcmF0aW9uUGxhbmUsXG4gICAgYWN0aW9uUGxhbmU6IGxldmVsQ29uZmlnLmFjdGlvblBsYW5lLFxuICAgIGZsdWZmUGxhbmU6IGZsdWZmUGxhbmUsXG4gICAgcGxheWVyU3RhcnRQb3NpdGlvbjogbGV2ZWxDb25maWcucGxheWVyU3RhcnRQb3NpdGlvbixcbiAgICBwbGF5ZXJTdGFydERpcmVjdGlvbjogbGV2ZWxDb25maWcucGxheWVyU3RhcnREaXJlY3Rpb24sXG4gICAgcGxheWVyTmFtZTogQ3JhZnQuZ2V0Q3VycmVudENoYXJhY3RlcigpLFxuICAgIGFzc2V0UGFja3M6IGxldmVsQXNzZXRQYWNrcyxcbiAgICBzcGVjaWFsTGV2ZWxUeXBlOiBsZXZlbENvbmZpZy5zcGVjaWFsTGV2ZWxUeXBlLFxuICAgIGhvdXNlQm90dG9tUmlnaHQ6IGxldmVsQ29uZmlnLmhvdXNlQm90dG9tUmlnaHQsXG4gICAgZ3JpZERpbWVuc2lvbnM6IGxldmVsQ29uZmlnLmdyaWRXaWR0aCAmJiBsZXZlbENvbmZpZy5ncmlkSGVpZ2h0ID9cbiAgICAgICAgW2xldmVsQ29uZmlnLmdyaWRXaWR0aCwgbGV2ZWxDb25maWcuZ3JpZEhlaWdodF0gOlxuICAgICAgICBudWxsLFxuICAgIHZlcmlmaWNhdGlvbkZ1bmN0aW9uOiBldmFsKCdbJyArIGxldmVsQ29uZmlnLnZlcmlmaWNhdGlvbkZ1bmN0aW9uICsgJ10nKVswXSAvLyBUT0RPKGJqb3JkYW4pOiBhZGQgdG8gdXRpbHNcbiAgfSk7XG59O1xuXG5DcmFmdC5taW5Bc3NldHNGb3JMZXZlbFdpdGhDaGFyYWN0ZXIgPSBmdW5jdGlvbiAobGV2ZWxOdW1iZXIpIHtcbiAgcmV0dXJuIENyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsTnVtYmVyKGxldmVsTnVtYmVyKVxuICAgICAgLmNvbmNhdChbQ3JhZnQuY2hhcmFjdGVyQXNzZXRQYWNrTmFtZShDcmFmdC5nZXRDdXJyZW50Q2hhcmFjdGVyKCkpXSk7XG59O1xuXG5DcmFmdC5taW5Bc3NldHNGb3JMZXZlbE51bWJlciA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICBzd2l0Y2ggKGxldmVsTnVtYmVyKSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIFsnbGV2ZWxPbmVBc3NldHMnXTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gWydsZXZlbFR3b0Fzc2V0cyddO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBbJ2xldmVsVGhyZWVBc3NldHMnXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFsnYWxsQXNzZXRzTWludXNQbGF5ZXInXTtcbiAgfVxufTtcblxuQ3JhZnQuYWZ0ZXJMb2FkQXNzZXRzRm9yTGV2ZWwgPSBmdW5jdGlvbiAobGV2ZWxOdW1iZXIpIHtcbiAgLy8gQWZ0ZXIgbGV2ZWwgbG9hZHMgJiBwbGF5ZXIgc3RhcnRzIHBsYXlpbmcsIGtpY2sgb2ZmIGZ1cnRoZXIgYXNzZXQgZG93bmxvYWRzXG4gIHN3aXRjaCAobGV2ZWxOdW1iZXIpIHtcbiAgICBjYXNlIDE6XG4gICAgICAvLyBjYW4gZGlzYWJsZSBpZiBwZXJmb3JtYW5jZSBpc3N1ZSBvbiBlYXJseSBsZXZlbCAxXG4gICAgICByZXR1cm4gQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxOdW1iZXIoMik7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIENyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsTnVtYmVyKDMpO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBNYXkgd2FudCB0byBwdXNoIHRoaXMgdG8gb2NjdXIgb24gbGV2ZWwgd2l0aCB2aWRlb1xuICAgICAgcmV0dXJuIFsnYWxsQXNzZXRzTWludXNQbGF5ZXInXTtcbiAgfVxufTtcblxuQ3JhZnQuZWFybHlMb2FkQXNzZXRzRm9yTGV2ZWwgPSBmdW5jdGlvbiAobGV2ZWxOdW1iZXIpIHtcbiAgc3dpdGNoIChsZXZlbE51bWJlcikge1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBDcmFmdC5taW5Bc3NldHNGb3JMZXZlbE51bWJlcihsZXZlbE51bWJlcik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBDcmFmdC5taW5Bc3NldHNGb3JMZXZlbFdpdGhDaGFyYWN0ZXIobGV2ZWxOdW1iZXIpO1xuICB9XG59O1xuXG5DcmFmdC5uaWNlVG9IYXZlQXNzZXRzRm9yTGV2ZWwgPSBmdW5jdGlvbiAobGV2ZWxOdW1iZXIpIHtcbiAgc3dpdGNoIChsZXZlbE51bWJlcikge1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBbJ3BsYXllclN0ZXZlJywgJ3BsYXllckFsZXgnXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFsnYWxsQXNzZXRzTWludXNQbGF5ZXInXTtcbiAgfVxufTtcblxuLyoqIEZvbGRzIGFycmF5IEIgb24gdG9wIG9mIGFycmF5IEEgKi9cbkNyYWZ0LmZvbGRJbkFycmF5ID0gZnVuY3Rpb24gKGFycmF5QSwgYXJyYXlCKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlBLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycmF5QltpXSAhPT0gJycpIHtcbiAgICAgIGFycmF5QVtpXSA9IGFycmF5QltpXTtcbiAgICB9XG4gIH1cbn07XG5cbkNyYWZ0LmZvbGRJbkN1c3RvbUhvdXNlQmxvY2tzID0gZnVuY3Rpb24gKGhvdXNlQmxvY2tNYXAsIGxldmVsQ29uZmlnKSB7XG4gIHZhciBwbGFuZXNUb0N1c3RvbWl6ZSA9IFtsZXZlbENvbmZpZy5ncm91bmRQbGFuZSwgbGV2ZWxDb25maWcuYWN0aW9uUGxhbmVdO1xuICBwbGFuZXNUb0N1c3RvbWl6ZS5mb3JFYWNoKGZ1bmN0aW9uKHBsYW5lKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbGFuZS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBwbGFuZVtpXTtcbiAgICAgIGlmIChpdGVtLm1hdGNoKC9ob3VzZS8pKSB7XG4gICAgICAgIHBsYW5lW2ldID0gKGhvdXNlQmxvY2tNYXAgJiYgaG91c2VCbG9ja01hcFtpdGVtXSkgP1xuICAgICAgICAgICAgaG91c2VCbG9ja01hcFtpdGVtXSA6IFwicGxhbmtzQmlyY2hcIjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgYXBwIHRvIHRoZSBzdGFydCBwb3NpdGlvbiBhbmQga2lsbCBhbnkgcGVuZGluZyBhbmltYXRpb24gdGFza3MuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZpcnN0IHRydWUgaWYgZmlyc3QgcmVzZXRcbiAqL1xuQ3JhZnQucmVzZXQgPSBmdW5jdGlvbiAoZmlyc3QpIHtcbiAgaWYgKGZpcnN0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIENyYWZ0LmdhbWVDb250cm9sbGVyLmNvZGVPcmdBUEkucmVzZXRBdHRlbXB0KCk7XG59O1xuXG5DcmFmdC5waGFzZXJMb2FkZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBDcmFmdC5nYW1lQ29udHJvbGxlciAmJlxuICAgICAgQ3JhZnQuZ2FtZUNvbnRyb2xsZXIuZ2FtZSAmJlxuICAgICAgIUNyYWZ0LmdhbWVDb250cm9sbGVyLmdhbWUubG9hZC5pc0xvYWRpbmc7XG59O1xuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkNyYWZ0LnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIUNyYWZ0LnBoYXNlckxvYWRlZCgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG5cbiAgLy8gRW5zdXJlIHRoYXQgUmVzZXQgYnV0dG9uIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgUnVuIGJ1dHRvbi5cbiAgaWYgKCFyZXNldEJ1dHRvbi5zdHlsZS5taW5XaWR0aCkge1xuICAgIHJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoID0gcnVuQnV0dG9uLm9mZnNldFdpZHRoICsgJ3B4JztcbiAgfVxuXG4gIHN0dWRpb0FwcC50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICBzdHVkaW9BcHAuYXR0ZW1wdHMrKztcblxuICBDcmFmdC5leGVjdXRlVXNlckNvZGUoKTtcbn07XG5cbkNyYWZ0LmV4ZWN1dGVVc2VyQ29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuZWRpdF9ibG9ja3MpIHtcbiAgICB0aGlzLnJlcG9ydFJlc3VsdCh0cnVlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc3R1ZGlvQXBwLmhhc0V4dHJhVG9wQmxvY2tzKCkpIHtcbiAgICAvLyBpbW1lZGlhdGVseSBjaGVjayBhbnN3ZXIgaW5zdGVhZCBvZiBleGVjdXRpbmcsIHdoaWNoIHdpbGwgZmFpbCBhbmRcbiAgICAvLyByZXBvcnQgdG9wIGxldmVsIGJsb2NrcyAocmF0aGVyIHRoYW4gZXhlY3V0aW5nIHRoZW0pXG4gICAgdGhpcy5yZXBvcnRSZXN1bHQoZmFsc2UpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgLy8gU3RhcnQgdHJhY2luZyBjYWxscy5cbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuXG4gIHZhciBhcHBDb2RlT3JnQVBJID0gQ3JhZnQuZ2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSTtcbiAgYXBwQ29kZU9yZ0FQSS5zdGFydENvbW1hbmRDb2xsZWN0aW9uKCk7XG4gIC8vIFJ1biB1c2VyIGdlbmVyYXRlZCBjb2RlLCBjYWxsaW5nIGFwcENvZGVPcmdBUElcbiAgdmFyIGNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgIG1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5tb3ZlRm9yd2FyZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSk7XG4gICAgfSxcbiAgICB0dXJuTGVmdDogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkudHVybihzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSwgXCJsZWZ0XCIpO1xuICAgIH0sXG4gICAgdHVyblJpZ2h0OiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS50dXJuKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLCBcInJpZ2h0XCIpO1xuICAgIH0sXG4gICAgZGVzdHJveUJsb2NrOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5kZXN0cm95QmxvY2soc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCkpO1xuICAgIH0sXG4gICAgc2hlYXI6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLmRlc3Ryb3lCbG9jayhzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSk7XG4gICAgfSxcbiAgICB0aWxsU29pbDogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkudGlsbFNvaWwoc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCkpO1xuICAgIH0sXG4gICAgd2hpbGVQYXRoQWhlYWQ6IGZ1bmN0aW9uIChibG9ja0lELCBjYWxsYmFjaykge1xuICAgICAgLy8gaWYgcmVzdXJyZWN0ZWQsIG1vdmUgYmxvY2tJRCBiZSBsYXN0IHBhcmFtZXRlciB0byBmaXggXCJTaG93IENvZGVcIlxuICAgICAgYXBwQ29kZU9yZ0FQSS53aGlsZVBhdGhBaGVhZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgICAnJyxcbiAgICAgICAgICBjYWxsYmFjayk7XG4gICAgfSxcbiAgICB3aGlsZUJsb2NrQWhlYWQ6IGZ1bmN0aW9uIChibG9ja0lELCBibG9ja1R5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAvLyBpZiByZXN1cnJlY3RlZCwgbW92ZSBibG9ja0lEIGJlIGxhc3QgcGFyYW1ldGVyIHRvIGZpeCBcIlNob3cgQ29kZVwiXG4gICAgICBhcHBDb2RlT3JnQVBJLndoaWxlUGF0aEFoZWFkKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICAgIGJsb2NrVHlwZSxcbiAgICAgICAgICBjYWxsYmFjayk7XG4gICAgfSxcbiAgICBpZkxhdmFBaGVhZDogZnVuY3Rpb24gKGNhbGxiYWNrLCBibG9ja0lEKSB7XG4gICAgICAvLyBpZiByZXN1cnJlY3RlZCwgbW92ZSBibG9ja0lEIGJlIGxhc3QgcGFyYW1ldGVyIHRvIGZpeCBcIlNob3cgQ29kZVwiXG4gICAgICBhcHBDb2RlT3JnQVBJLmlmQmxvY2tBaGVhZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgICBcImxhdmFcIixcbiAgICAgICAgICBjYWxsYmFjayk7XG4gICAgfSxcbiAgICBpZkJsb2NrQWhlYWQ6IGZ1bmN0aW9uIChibG9ja1R5cGUsIGNhbGxiYWNrLCBibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLmlmQmxvY2tBaGVhZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgICBibG9ja1R5cGUsXG4gICAgICAgICAgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgcGxhY2VCbG9jazogZnVuY3Rpb24gKGJsb2NrVHlwZSwgYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5wbGFjZUJsb2NrKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICBibG9ja1R5cGUpO1xuICAgIH0sXG4gICAgcGxhbnRDcm9wOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5wbGFjZUJsb2NrKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICBcImNyb3BXaGVhdFwiKTtcbiAgICB9LFxuICAgIHBsYWNlVG9yY2g6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLnBsYWNlQmxvY2soc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgIFwidG9yY2hcIik7XG4gICAgfSxcbiAgICBwbGFjZUJsb2NrQWhlYWQ6IGZ1bmN0aW9uIChibG9ja1R5cGUsIGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkucGxhY2VJbkZyb250KHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICBibG9ja1R5cGUpO1xuICAgIH1cbiAgfSk7XG4gIGFwcENvZGVPcmdBUEkuc3RhcnRBdHRlbXB0KGZ1bmN0aW9uIChzdWNjZXNzLCBsZXZlbE1vZGVsKSB7XG4gICAgdGhpcy5yZXBvcnRSZXN1bHQoc3VjY2Vzcyk7XG5cbiAgICB2YXIgdGlsZUlEc1RvU3RvcmUgPSBDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLmJsb2Nrc1RvU3RvcmU7XG4gICAgaWYgKHN1Y2Nlc3MgJiYgdGlsZUlEc1RvU3RvcmUpIHtcbiAgICAgIHZhciBuZXdIb3VzZUJsb2NrcyA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFmdEhvdXNlQmxvY2tzJykpIHx8IHt9O1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZXZlbE1vZGVsLmFjdGlvblBsYW5lLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aWxlSURzVG9TdG9yZVtpXSAhPT0gJycpIHtcbiAgICAgICAgICBuZXdIb3VzZUJsb2Nrc1t0aWxlSURzVG9TdG9yZVtpXV0gPSBsZXZlbE1vZGVsLmFjdGlvblBsYW5lW2ldLmJsb2NrVHlwZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdHJ5U2V0TG9jYWxTdG9yYWdlSXRlbSgnY3JhZnRIb3VzZUJsb2NrcycsIEpTT04uc3RyaW5naWZ5KG5ld0hvdXNlQmxvY2tzKSk7XG4gICAgfVxuXG4gICAgdmFyIGF0dGVtcHRJbnZlbnRvcnlUeXBlcyA9IGxldmVsTW9kZWwuZ2V0SW52ZW50b3J5VHlwZXMoKTtcbiAgICB2YXIgcGxheWVySW52ZW50b3J5VHlwZXMgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhZnRQbGF5ZXJJbnZlbnRvcnknKSkgfHwgW107XG5cbiAgICB2YXIgbmV3SW52ZW50b3J5U2V0ID0ge307XG4gICAgYXR0ZW1wdEludmVudG9yeVR5cGVzLmNvbmNhdChwbGF5ZXJJbnZlbnRvcnlUeXBlcykuZm9yRWFjaChmdW5jdGlvbih0eXBlKSB7XG4gICAgICBuZXdJbnZlbnRvcnlTZXRbdHlwZV0gPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdHJ5U2V0TG9jYWxTdG9yYWdlSXRlbSgnY3JhZnRQbGF5ZXJJbnZlbnRvcnknLCBKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhuZXdJbnZlbnRvcnlTZXQpKSk7XG4gIH0uYmluZCh0aGlzKSk7XG59O1xuXG5DcmFmdC5nZXRUZXN0UmVzdWx0RnJvbSA9IGZ1bmN0aW9uIChzdWNjZXNzLCBzdHVkaW9UZXN0UmVzdWx0cykge1xuICBpZiAoQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5mcmVlUGxheSkge1xuICAgIHJldHVybiBUZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH1cblxuICBpZiAoc3R1ZGlvVGVzdFJlc3VsdHMgPT09IFRlc3RSZXN1bHRzLkxFVkVMX0lOQ09NUExFVEVfRkFJTCkge1xuICAgIHJldHVybiBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgfVxuXG4gIHJldHVybiBzdHVkaW9UZXN0UmVzdWx0cztcbn07XG5cbkNyYWZ0LnJlcG9ydFJlc3VsdCA9IGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gIHZhciBzdHVkaW9UZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cyhzdWNjZXNzKTtcbiAgdmFyIHRlc3RSZXN1bHRUeXBlID0gQ3JhZnQuZ2V0VGVzdFJlc3VsdEZyb20oc3VjY2Vzcywgc3R1ZGlvVGVzdFJlc3VsdHMpO1xuXG4gIHZhciBrZWVwUGxheWluZ1RleHQgPSBDcmFmdC5yZXBsYXlUZXh0Rm9yUmVzdWx0KHRlc3RSZXN1bHRUeXBlKTtcblxuICBzdHVkaW9BcHAucmVwb3J0KHtcbiAgICBhcHA6ICdjcmFmdCcsXG4gICAgbGV2ZWw6IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuaWQsXG4gICAgcmVzdWx0OiBDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLmZyZWVQbGF5ID8gdHJ1ZSA6IHN1Y2Nlc3MsXG4gICAgdGVzdFJlc3VsdDogdGVzdFJlc3VsdFR5cGUsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICBCbG9ja2x5LlhtbC5kb21Ub1RleHQoXG4gICAgICAgICAgICBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oXG4gICAgICAgICAgICAgICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZSkpKSxcbiAgICAvLyB0eXBpY2FsbHkgZGVsYXkgZmVlZGJhY2sgdW50aWwgcmVzcG9uc2UgYmFja1xuICAgIC8vIGZvciB0aGluZ3MgbGlrZSBlLmcuIGNyb3dkc291cmNlZCBoaW50cyAmIGhpbnQgYmxvY2tzXG4gICAgb25Db21wbGV0ZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrKHtcbiAgICAgICAga2VlcFBsYXlpbmdUZXh0OiBrZWVwUGxheWluZ1RleHQsXG4gICAgICAgIGFwcDogJ2NyYWZ0JyxcbiAgICAgICAgc2tpbjogQ3JhZnQuaW5pdGlhbENvbmZpZy5za2luLmlkLFxuICAgICAgICBmZWVkYmFja1R5cGU6IHRlc3RSZXN1bHRUeXBlLFxuICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXG4gICAgICAgIGxldmVsOiBDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLFxuICAgICAgICBhcHBTdHJpbmdzOiB7XG4gICAgICAgICAgcmVpbmZGZWVkYmFja01zZzogY3JhZnRNc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgICAgIG5leHRMZXZlbE1zZzogY3JhZnRNc2cubmV4dExldmVsTXNnKHtcbiAgICAgICAgICAgIHB1enpsZU51bWJlcjogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdG9vTWFueUJsb2Nrc0ZhaWxNc2dGdW5jdGlvbjogY3JhZnRNc2cudG9vTWFueUJsb2Nrc0ZhaWxcbiAgICAgICAgfSxcbiAgICAgICAgZmVlZGJhY2tJbWFnZTogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5mcmVlUGxheSA/IENyYWZ0LmdhbWVDb250cm9sbGVyLmdldFNjcmVlbnNob3QoKSA6IG51bGwsXG4gICAgICAgIHNob3dpbmdTaGFyaW5nOiBDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLmZyZWVQbGF5XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcblxuQ3JhZnQucmVwbGF5VGV4dEZvclJlc3VsdCA9IGZ1bmN0aW9uICh0ZXN0UmVzdWx0VHlwZSkge1xuICBpZiAodGVzdFJlc3VsdFR5cGUgPT09IFRlc3RSZXN1bHRzLkZSRUVfUExBWSkge1xuICAgIHJldHVybiBcIktlZXAgUGxheWluZ1wiO1xuICB9IGVsc2UgaWYgKHRlc3RSZXN1bHRUeXBlIDw9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19BQ0NFUFRBQkxFX0ZBSUwpIHtcbiAgICByZXR1cm4gY29tbW9uTXNnLnRyeUFnYWluKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFwiUmVwbGF5XCI7XG4gIH1cbn07XG5cbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPGRpdiBpZD1cIm1pbmVjcmFmdC1mcmFtZVwiPlxcbiAgPGRpdiBpZD1cInBoYXNlci1nYW1lXCI+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmNyYWZ0X2xvY2FsZTtcbiIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG4vKiBnbG9iYWwgJCAqL1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgMToge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBcIllvdSBuZWVkIHRvIHVzZSBjb21tYW5kcyB0byB3YWxrIHRvIHRoZSBzaGVlcC5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiVHJ5IHVzaW5nIG1vcmUgY29tbWFuZHMgdG8gd2FsayB0byB0aGUgc2hlZXAuXCIsXG4gIH0sXG4gIDI6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJUbyBjaG9wIGRvd24gYSB0cmVlLCB3YWxrIHRvIGl0cyB0cnVuayBhbmQgdXNlIHRoZSBcXFwiZGVzdHJveSBibG9ja1xcXCIgY29tbWFuZC5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiVHJ5IHVzaW5nIG1vcmUgY29tbWFuZHMgdG8gY2hvcCBkb3duIHRoZSB0cmVlLiBXYWxrIHRvIGl0cyB0cnVuayBhbmQgdXNlIHRoZSBcXFwiZGVzdHJveSBibG9ja1xcXCIgY29tbWFuZC5cIixcbiAgfSxcbiAgMzoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBcIlRvIGdhdGhlciB3b29sIGZyb20gYm90aCBzaGVlcCwgd2FsayB0byBlYWNoIG9uZSBhbmQgdXNlIHRoZSBcXFwic2hlYXJcXFwiIGNvbW1hbmQuIFJlbWVtYmVyIHRvIHVzZSB0dXJuIGNvbW1hbmRzIHRvIHJlYWNoIHRoZSBzaGVlcC5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiVHJ5IHVzaW5nIG1vcmUgY29tbWFuZHMgdG8gZ2F0aGVyIHdvb2wgZnJvbSBib3RoIHNoZWVwLiBXYWxrIHRvIGVhY2ggb25lIGFuZCB1c2UgdGhlIFxcXCJzaGVhclxcXCIgY29tbWFuZC5cIixcbiAgfSxcbiAgNDoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBcIllvdSBtdXN0IHVzZSB0aGUgXFxcImRlc3Ryb3kgYmxvY2tcXFwiIGNvbW1hbmQgb24gZWFjaCBvZiB0aGUgdGhyZWUgdHJlZSB0cnVua3MuXCIsXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBcIllvdSBtdXN0IHVzZSB0aGUgXFxcImRlc3Ryb3kgYmxvY2tcXFwiIGNvbW1hbmQgb24gZWFjaCBvZiB0aGUgdGhyZWUgdHJlZSB0cnVua3MuXCIsXG4gIH0sXG4gIDU6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJQbGFjZSB5b3VyIGJsb2NrcyBvbiB0aGUgZGlydCBvdXRsaW5lIHRvIGJ1aWxkIGEgd2FsbC4gVGhlIHBpbmsgXFxcInJlcGVhdFxcXCIgY29tbWFuZCB3aWxsIHJ1biBjb21tYW5kcyBwbGFjZWQgaW5zaWRlIGl0LCBsaWtlIFxcXCJwbGFjZSBibG9ja1xcXCIgYW5kIFxcXCJtb3ZlIGZvcndhcmRcXFwiLlwiLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogXCJQbGFjZSB5b3VyIGJsb2NrcyBvbiB0aGUgZGlydCBvdXRsaW5lIHRvIGJ1aWxkIGEgd2FsbC4gVGhlIHBpbmsgXFxcInJlcGVhdFxcXCIgY29tbWFuZCB3aWxsIHJ1biBjb21tYW5kcyBwbGFjZWQgaW5zaWRlIGl0LCBsaWtlIFxcXCJwbGFjZSBibG9ja1xcXCIgYW5kIFxcXCJtb3ZlIGZvcndhcmRcXFwiLlwiLFxuICB9LFxuICA2OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IFwiUGxhY2UgYmxvY2tzIG9uIHRoZSBkaXJ0IG91dGxpbmUgb2YgdGhlIGhvdXNlIHRvIGNvbXBsZXRlIHRoZSBwdXp6bGUuXCIsXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBcIlBsYWNlIGJsb2NrcyBvbiB0aGUgZGlydCBvdXRsaW5lIG9mIHRoZSBob3VzZSB0byBjb21wbGV0ZSB0aGUgcHV6emxlLlwiLFxuICB9LFxuICA3OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IFwiVXNlIHRoZSBcXFwicGxhbnRcXFwiIGNvbW1hbmQgdG8gcGxhY2UgY3JvcHMgb24gZWFjaCBwYXRjaCBvZiBkYXJrIHRpbGxlZCBzb2lsLlwiLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogXCJVc2UgdGhlIFxcXCJwbGFudFxcXCIgY29tbWFuZCB0byBwbGFjZSBjcm9wcyBvbiBlYWNoIHBhdGNoIG9mIGRhcmsgdGlsbGVkIHNvaWwuXCIsXG4gIH0sXG4gIDg6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJJZiB5b3UgdG91Y2ggYSBjcmVlcGVyIGl0IHdpbGwgZXhwbG9kZS4gU25lYWsgYXJvdW5kIHRoZW0gYW5kIGVudGVyIHlvdXIgaG91c2UuXCIsXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBcIklmIHlvdSB0b3VjaCBhIGNyZWVwZXIgaXQgd2lsbCBleHBsb2RlLiBTbmVhayBhcm91bmQgdGhlbSBhbmQgZW50ZXIgeW91ciBob3VzZS5cIixcbiAgfSxcbiAgOToge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBcIkRvbid0IGZvcmdldCB0byBwbGFjZSBhdCBsZWFzdCAyIHRvcmNoZXMgdG8gbGlnaHQgeW91ciB3YXkgQU5EIG1pbmUgYXQgbGVhc3QgMiBjb2FsLlwiLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogXCJEb24ndCBmb3JnZXQgdG8gcGxhY2UgYXQgbGVhc3QgMiB0b3JjaGVzIHRvIGxpZ2h0IHlvdXIgd2F5IEFORCBtaW5lIGF0IGxlYXN0IDIgY29hbC5cIixcbiAgfSxcbiAgMTA6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJDb3ZlciB1cCB0aGUgbGF2YSB0byB3YWxrIGFjcm9zcywgdGhlbiBtaW5lIHR3byBvZiB0aGUgaXJvbiBibG9ja3Mgb24gdGhlIG90aGVyIHNpZGUuXCIsXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBcIkNvdmVyIHVwIHRoZSBsYXZhIHRvIHdhbGsgYWNyb3NzLCB0aGVuIG1pbmUgdHdvIG9mIHRoZSBpcm9uIGJsb2NrcyBvbiB0aGUgb3RoZXIgc2lkZS5cIixcbiAgfSxcbiAgMTE6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJNYWtlIHN1cmUgdG8gcGxhY2UgY29iYmxlc3RvbmUgYWhlYWQgaWYgdGhlcmUgaXMgbGF2YSBhaGVhZC4gVGhpcyB3aWxsIGxldCB5b3Ugc2FmZWx5IG1pbmUgdGhpcyByb3cgb2YgcmVzb3VyY2VzLlwiLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogXCJNYWtlIHN1cmUgdG8gcGxhY2UgY29iYmxlc3RvbmUgYWhlYWQgaWYgdGhlcmUgaXMgbGF2YSBhaGVhZC4gVGhpcyB3aWxsIGxldCB5b3Ugc2FmZWx5IG1pbmUgdGhpcyByb3cgb2YgcmVzb3VyY2VzLlwiLFxuICB9LFxuICAxMjoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBcIkJlIHN1cmUgdG8gbWluZSAzIHJlZHN0b25lIGJsb2Nrcy4gVGhpcyBjb21iaW5lcyB3aGF0IHlvdSBsZWFybmVkIGZyb20gYnVpbGRpbmcgeW91ciBob3VzZSBhbmQgdXNpbmcgXFxcImlmXFxcIiBzdGF0ZW1lbnRzIHRvIGF2b2lkIGZhbGxpbmcgaW4gbGF2YS5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiQmUgc3VyZSB0byBtaW5lIDMgcmVkc3RvbmUgYmxvY2tzLiBUaGlzIGNvbWJpbmVzIHdoYXQgeW91IGxlYXJuZWQgZnJvbSBidWlsZGluZyB5b3VyIGhvdXNlIGFuZCB1c2luZyBcXFwiaWZcXFwiIHN0YXRlbWVudHMgdG8gYXZvaWQgZmFsbGluZyBpbiBsYXZhLlwiLFxuICB9LFxuICAxMzoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBcIlBsYWNlIFxcXCJyYWlsXFxcIiBhbG9uZyB0aGUgZGlydCBwYXRoIGxlYWRpbmcgZnJvbSB5b3VyIGRvb3IgdG8gdGhlIGVkZ2Ugb2YgdGhlIG1hcC5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiUGxhY2UgXFxcInJhaWxcXFwiIGFsb25nIHRoZSBkaXJ0IHBhdGggbGVhZGluZyBmcm9tIHlvdXIgZG9vciB0byB0aGUgZWRnZSBvZiB0aGUgbWFwLlwiLFxuICB9LFxufTtcbiIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG4vKiBnbG9iYWwgJCAqL1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaG91c2VBOiB7XG4gICAgZ3JvdW5kUGxhbmU6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiXSxcbiAgICB2ZXJpZmljYXRpb25GdW5jdGlvbjogKGZ1bmN0aW9uICh2ZXJpZmljYXRpb25BUEkpIHtcbiAgICAgIHJldHVybiB2ZXJpZmljYXRpb25BUEkuc29sdXRpb25NYXBNYXRjaGVzUmVzdWx0TWFwKFtcbiAgICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJ2FueScsICdhbnknLCAnYW55JywgJ2FueScsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICdhbnknLCAnJywgJycsICdhbnknLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnYW55JywgJycsICcnLCAnYW55JywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJ2FueScsICdhbnknLCAnYW55JywgJ2FueScsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJyddKTtcbiAgICB9KS50b1N0cmluZygpLFxuICAgIGJsb2Nrc1RvU3RvcmU6IFtcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICdob3VzZVJpZ2h0QycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnaG91c2VSaWdodEInLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlTGVmdEEnLCAnJywgJycsICdob3VzZVJpZ2h0QScsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VCb3R0b21BJywgJ2hvdXNlQm90dG9tQicsICdob3VzZUJvdHRvbUMnLCAnaG91c2VCb3R0b21EJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJ10sXG5cbiAgICBob3VzZUJvdHRvbVJpZ2h0OiBbNSwgNV0sXG4gIH0sXG4gIGhvdXNlQjoge1xuICAgIFwiZ3JvdW5kUGxhbmVcIjogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIl0sXG4gICAgXCJncm91bmREZWNvcmF0aW9uUGxhbmVcIjogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwidGFsbEdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwidGFsbEdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCJdLFxuICAgIFwiYWN0aW9uUGxhbmVcIjogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiaG91c2VCb3R0b21BXCIsIFwiaG91c2VCb3R0b21CXCIsIFwiaG91c2VCb3R0b21DXCIsIFwiaG91c2VCb3R0b21EXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCJdLFxuICAgIFwidmVyaWZpY2F0aW9uRnVuY3Rpb25cIjogXCJmdW5jdGlvbiAodmVyaWZpY2F0aW9uQVBJKSB7XFxyXFxuICAgICAgcmV0dXJuIHZlcmlmaWNhdGlvbkFQSS5zb2x1dGlvbk1hcE1hdGNoZXNSZXN1bHRNYXAoXFxyXFxuICAgICAgICAgICAgW1xcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCJcXHJcXG4gICAgICAgICAgICBdKTtcXHJcXG59XCIsXG4gICAgXCJzdGFydEJsb2Nrc1wiOiBcIjx4bWw+PGJsb2NrIHR5cGU9XFxcIndoZW5fcnVuXFxcIiBkZWxldGFibGU9XFxcImZhbHNlXFxcIiBtb3ZhYmxlPVxcXCJmYWxzZVxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNvbnRyb2xzX3JlcGVhdF9kcm9wZG93blxcXCI+PHRpdGxlIG5hbWU9XFxcIlRJTUVTXFxcIiBjb25maWc9XFxcIjItMTBcXFwiPjI8L3RpdGxlPjxzdGF0ZW1lbnQgbmFtZT1cXFwiRE9cXFwiPjxibG9jayB0eXBlPVxcXCJjcmFmdF9tb3ZlRm9yd2FyZFxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X3BsYWNlQmxvY2tcXFwiPjx0aXRsZSBuYW1lPVxcXCJUWVBFXFxcIj5wbGFua3NCaXJjaDwvdGl0bGU+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L3N0YXRlbWVudD48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfdHVyblxcXCI+PHRpdGxlIG5hbWU9XFxcIkRJUlxcXCI+bGVmdDwvdGl0bGU+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X21vdmVGb3J3YXJkXFxcIj48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfcGxhY2VCbG9ja1xcXCI+PHRpdGxlIG5hbWU9XFxcIlRZUEVcXFwiPnBsYW5rc0JpcmNoPC90aXRsZT48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfdHVyblxcXCI+PHRpdGxlIG5hbWU9XFxcIkRJUlxcXCI+cmlnaHQ8L3RpdGxlPjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC94bWw+XCIsXG5cbiAgICBibG9ja3NUb1N0b3JlOiBbXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnaG91c2VSaWdodEMnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJ2hvdXNlUmlnaHRCJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUxlZnRBJywgJycsICcnLCAnaG91c2VSaWdodEEnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlQm90dG9tQScsICdob3VzZUJvdHRvbUInLCAnaG91c2VCb3R0b21DJywgJ2hvdXNlQm90dG9tRCcsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJyddLFxuXG4gICAgaG91c2VCb3R0b21SaWdodDogWzUsIDVdLFxuICB9LFxuICBob3VzZUM6IHtcbiAgICBncm91bmRQbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIl0sXG4gICAgdmVyaWZpY2F0aW9uRnVuY3Rpb246IFwiZnVuY3Rpb24gKHZlcmlmaWNhdGlvbkFQSSkge1xcclxcbiAgICAgIHJldHVybiB2ZXJpZmljYXRpb25BUEkuc29sdXRpb25NYXBNYXRjaGVzUmVzdWx0TWFwKFxcclxcbiAgICAgICAgICAgIFtcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiXFxyXFxuICAgICAgICAgICAgXSk7XFxyXFxufVwiLFxuICAgIHN0YXJ0QmxvY2tzOiBcIjx4bWw+PGJsb2NrIHR5cGU9XFxcIndoZW5fcnVuXFxcIiBkZWxldGFibGU9XFxcImZhbHNlXFxcIiBtb3ZhYmxlPVxcXCJmYWxzZVxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNvbnRyb2xzX3JlcGVhdF9kcm9wZG93blxcXCI+PHRpdGxlIG5hbWU9XFxcIlRJTUVTXFxcIiBjb25maWc9XFxcIjItMTBcXFwiPjY8L3RpdGxlPjxzdGF0ZW1lbnQgbmFtZT1cXFwiRE9cXFwiPjxibG9jayB0eXBlPVxcXCJjcmFmdF9tb3ZlRm9yd2FyZFxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X3BsYWNlQmxvY2tcXFwiPjx0aXRsZSBuYW1lPVxcXCJUWVBFXFxcIj5wbGFua3NCaXJjaDwvdGl0bGU+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L3N0YXRlbWVudD48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwveG1sPlwiLFxuICAgIGJsb2Nrc1RvU3RvcmU6IFtcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJ2hvdXNlUmlnaHRDJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICdob3VzZVJpZ2h0QicsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VMZWZ0QScsICcnLCAnJywgJ2hvdXNlUmlnaHRBJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUJvdHRvbUEnLCAnaG91c2VCb3R0b21CJywgJ2hvdXNlQm90dG9tQycsICdob3VzZUJvdHRvbUQnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJ10sXG4gICAgYWN0aW9uUGxhbmU6IFtcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlQm90dG9tQScsICdob3VzZUJvdHRvbUInLCAnaG91c2VCb3R0b21DJywgJ2hvdXNlQm90dG9tRCcsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnXSxcbiAgICBwbGF5ZXJTdGFydFBvc2l0aW9uOiBbMywgN10sXG5cbiAgICBob3VzZUJvdHRvbVJpZ2h0OiBbNSwgNl0sXG4gIH1cbn07XG4iLCJpbXBvcnQgQ29tbWFuZFF1ZXVlIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9Db21tYW5kUXVldWUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9Db21tYW5kUXVldWUvQmFzZUNvbW1hbmQuanNcIjtcbmltcG9ydCBEZXN0cm95QmxvY2tDb21tYW5kIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9EZXN0cm95QmxvY2tDb21tYW5kLmpzXCI7XG5pbXBvcnQgTW92ZUZvcndhcmRDb21tYW5kIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9Nb3ZlRm9yd2FyZENvbW1hbmQuanNcIjtcbmltcG9ydCBUdXJuQ29tbWFuZCBmcm9tIFwiLi9Db21tYW5kUXVldWUvVHVybkNvbW1hbmQuanNcIjtcbmltcG9ydCBXaGlsZUNvbW1hbmQgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL1doaWxlQ29tbWFuZC5qc1wiO1xuaW1wb3J0IElmQmxvY2tBaGVhZENvbW1hbmQgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL0lmQmxvY2tBaGVhZENvbW1hbmQuanNcIjtcblxuaW1wb3J0IExldmVsTW9kZWwgZnJvbSBcIi4vTGV2ZWxNVkMvTGV2ZWxNb2RlbC5qc1wiO1xuaW1wb3J0IExldmVsVmlldyBmcm9tIFwiLi9MZXZlbE1WQy9MZXZlbFZpZXcuanNcIjtcbmltcG9ydCBBc3NldExvYWRlciBmcm9tIFwiLi9MZXZlbE1WQy9Bc3NldExvYWRlci5qc1wiO1xuXG5pbXBvcnQgKiBhcyBDb2RlT3JnQVBJIGZyb20gXCIuL0FQSS9Db2RlT3JnQVBJLmpzXCI7XG5cbnZhciBHQU1FX1dJRFRIID0gNDAwO1xudmFyIEdBTUVfSEVJR0hUID0gNDAwO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGEgbmV3IGluc3RhbmNlIG9mIGEgbWluaS1nYW1lIHZpc3VhbGl6YXRpb25cbiAqL1xuY2xhc3MgR2FtZUNvbnRyb2xsZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGdhbWVDb250cm9sbGVyQ29uZmlnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBnYW1lQ29udHJvbGxlckNvbmZpZy5jb250YWluZXJJZCBET00gSUQgdG8gbW91bnQgdGhpcyBhcHBcbiAgICogQHBhcmFtIHtQaGFzZXJ9IGdhbWVDb250cm9sbGVyQ29uZmlnLlBoYXNlciBQaGFzZXIgcGFja2FnZVxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyQ29uZmlnKSB7XG4gICAgdGhpcy5ERUJVRyA9IGdhbWVDb250cm9sbGVyQ29uZmlnLmRlYnVnO1xuXG4gICAgLy8gUGhhc2VyIHByZS1pbml0aWFsaXphdGlvbiBjb25maWdcbiAgICB3aW5kb3cuUGhhc2VyR2xvYmFsID0ge1xuICAgICAgZGlzYWJsZUF1ZGlvOiB0cnVlLFxuICAgICAgaGlkZUJhbm5lcjogIXRoaXMuREVCVUdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHB1YmxpYyB7T2JqZWN0fSBjb2RlT3JnQVBJIC0gQVBJIHdpdGggZXh0ZXJuYWxseS1jYWxsYWJsZSBtZXRob2RzIGZvclxuICAgICAqIHN0YXJ0aW5nIGFuIGF0dGVtcHQsIGlzc3VpbmcgY29tbWFuZHMsIGV0Yy5cbiAgICAgKi9cbiAgICB0aGlzLmNvZGVPcmdBUEkgPSBDb2RlT3JnQVBJLmdldCh0aGlzKTtcblxuICAgIHZhciBQaGFzZXIgPSBnYW1lQ29udHJvbGxlckNvbmZpZy5QaGFzZXI7XG5cbiAgICAvKipcbiAgICAgKiBNYWluIFBoYXNlciBnYW1lIGluc3RhbmNlLlxuICAgICAqIEBwcm9wZXJ0eSB7UGhhc2VyLkdhbWV9XG4gICAgICovXG4gICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKHtcbiAgICAgIHdpZHRoOiBHQU1FX1dJRFRILFxuICAgICAgaGVpZ2h0OiBHQU1FX0hFSUdIVCxcbiAgICAgIHJlbmRlcmVyOiBQaGFzZXIuQ0FOVkFTLFxuICAgICAgcGFyZW50OiBnYW1lQ29udHJvbGxlckNvbmZpZy5jb250YWluZXJJZCxcbiAgICAgIHN0YXRlOiAnZWFybHlMb2FkJyxcbiAgICAgIC8vIFRPRE8oYmpvcmRhbik6IHJlbW92ZSBub3cgdGhhdCB1c2luZyBjYW52YXM/XG4gICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUgLy8gZW5hYmxlcyBzYXZpbmcgLnBuZyBzY3JlZW5ncmFic1xuICAgIH0pO1xuXG4gICAgdGhpcy5zcGVjaWFsTGV2ZWxUeXBlID0gbnVsbDtcbiAgICB0aGlzLnF1ZXVlID0gbmV3IENvbW1hbmRRdWV1ZSh0aGlzKTtcbiAgICB0aGlzLk9uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG5cbiAgICB0aGlzLmFzc2V0Um9vdCA9IGdhbWVDb250cm9sbGVyQ29uZmlnLmFzc2V0Um9vdDtcblxuICAgIHRoaXMuYXVkaW9QbGF5ZXIgPSBnYW1lQ29udHJvbGxlckNvbmZpZy5hdWRpb1BsYXllcjtcbiAgICB0aGlzLmFzc2V0TG9hZGVyID0gbmV3IEFzc2V0TG9hZGVyKHRoaXMpO1xuICAgIHRoaXMuZWFybHlMb2FkQXNzZXRQYWNrcyA9XG4gICAgICAgIGdhbWVDb250cm9sbGVyQ29uZmlnLmVhcmx5TG9hZEFzc2V0UGFja3MgfHwgW107XG4gICAgdGhpcy5lYXJseUxvYWROaWNlVG9IYXZlQXNzZXRQYWNrcyA9XG4gICAgICAgIGdhbWVDb250cm9sbGVyQ29uZmlnLmVhcmx5TG9hZE5pY2VUb0hhdmVBc3NldFBhY2tzIHx8IFtdO1xuXG4gICAgdGhpcy5yZXNldHRhYmxlVGltZXJzID0gW107XG5cbiAgICAvLyBQaGFzZXIgXCJzbG93IG1vdGlvblwiIG1vZGlmaWVyIHdlIG9yaWdpbmFsbHkgdHVuZWQgYW5pbWF0aW9ucyB1c2luZ1xuICAgIHRoaXMuYXNzdW1lZFNsb3dNb3Rpb24gPSAxLjU7XG4gICAgdGhpcy5pbml0aWFsU2xvd01vdGlvbiA9IGdhbWVDb250cm9sbGVyQ29uZmlnLmN1c3RvbVNsb3dNb3Rpb24gfHwgdGhpcy5hc3N1bWVkU2xvd01vdGlvbjtcblxuICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoJ2Vhcmx5TG9hZCcsIHtcbiAgICAgIHByZWxvYWQ6ICgpID0+IHtcbiAgICAgICAgLy8gZG9uJ3QgbGV0IHN0YXRlIGNoYW5nZSBzdG9tcCBlc3NlbnRpYWwgYXNzZXQgZG93bmxvYWRzIGluIHByb2dyZXNzXG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLnJlc2V0TG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hc3NldExvYWRlci5sb2FkUGFja3ModGhpcy5lYXJseUxvYWRBc3NldFBhY2tzKTtcbiAgICAgIH0sXG4gICAgICBjcmVhdGU6ICgpID0+IHtcbiAgICAgICAgLy8gb3B0aW9uYWxseSBsb2FkIHNvbWUgbW9yZSBhc3NldHMgaWYgd2UgY29tcGxldGUgZWFybHkgbG9hZCBiZWZvcmUgbGV2ZWwgbG9hZFxuICAgICAgICB0aGlzLmFzc2V0TG9hZGVyLmxvYWRQYWNrcyh0aGlzLmVhcmx5TG9hZE5pY2VUb0hhdmVBc3NldFBhY2tzKTtcbiAgICAgICAgdGhpcy5nYW1lLmxvYWQuc3RhcnQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZ2FtZS5zdGF0ZS5hZGQoJ2xldmVsUnVubmVyJywge1xuICAgICAgcHJlbG9hZDogdGhpcy5wcmVsb2FkLmJpbmQodGhpcyksXG4gICAgICBjcmVhdGU6IHRoaXMuY3JlYXRlLmJpbmQodGhpcyksXG4gICAgICB1cGRhdGU6IHRoaXMudXBkYXRlLmJpbmQodGhpcyksXG4gICAgICByZW5kZXI6IHRoaXMucmVuZGVyLmJpbmQodGhpcylcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbGV2ZWxDb25maWdcbiAgICovXG4gIGxvYWRMZXZlbChsZXZlbENvbmZpZykge1xuICAgIHRoaXMubGV2ZWxEYXRhID0gT2JqZWN0LmZyZWV6ZShsZXZlbENvbmZpZyk7XG5cbiAgICB0aGlzLmxldmVsTW9kZWwgPSBuZXcgTGV2ZWxNb2RlbCh0aGlzLmxldmVsRGF0YSk7XG4gICAgdGhpcy5sZXZlbFZpZXcgPSBuZXcgTGV2ZWxWaWV3KHRoaXMpO1xuICAgIHRoaXMuc3BlY2lhbExldmVsVHlwZSA9IGxldmVsQ29uZmlnLnNwZWNpYWxMZXZlbFR5cGU7XG5cbiAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ2xldmVsUnVubmVyJyk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLmxldmVsTW9kZWwucmVzZXQoKTtcbiAgICB0aGlzLmxldmVsVmlldy5yZXNldCh0aGlzLmxldmVsTW9kZWwpO1xuICAgIHRoaXMucmVzZXR0YWJsZVRpbWVycy5mb3JFYWNoKCh0aW1lcikgPT4ge1xuICAgICAgdGltZXIuc3RvcCh0cnVlKTtcbiAgICB9KTtcbiAgICB0aGlzLnJlc2V0dGFibGVUaW1lcnMubGVuZ3RoID0gMDtcbiAgfVxuXG4gIHByZWxvYWQoKSB7XG4gICAgdGhpcy5nYW1lLmxvYWQucmVzZXRMb2NrZWQgPSB0cnVlO1xuICAgIHRoaXMuZ2FtZS50aW1lLmFkdmFuY2VkVGltaW5nID0gdGhpcy5ERUJVRztcbiAgICB0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xuICAgIHRoaXMuYXNzZXRMb2FkZXIubG9hZFBhY2tzKHRoaXMubGV2ZWxEYXRhLmFzc2V0UGFja3MuYmVmb3JlTG9hZCk7XG4gIH1cblxuICBjcmVhdGUoKSB7XG4gICAgdGhpcy5sZXZlbFZpZXcuY3JlYXRlKHRoaXMubGV2ZWxNb2RlbCk7XG4gICAgdGhpcy5nYW1lLnRpbWUuc2xvd01vdGlvbiA9IHRoaXMuaW5pdGlhbFNsb3dNb3Rpb247XG4gICAgdGhpcy5hZGRDaGVhdEtleXMoKTtcbiAgICB0aGlzLmFzc2V0TG9hZGVyLmxvYWRQYWNrcyh0aGlzLmxldmVsRGF0YS5hc3NldFBhY2tzLmFmdGVyTG9hZCk7XG4gICAgdGhpcy5nYW1lLmxvYWQuc3RhcnQoKTtcbiAgfVxuXG4gIGZvbGxvd2luZ1BsYXllcigpIHtcbiAgICByZXR1cm4gISF0aGlzLmxldmVsRGF0YS5ncmlkRGltZW5zaW9ucztcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICAgIHRoaXMucXVldWUudGljaygpO1xuICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlKCk7XG5cbiAgICAgIGlmICh0aGlzLnF1ZXVlLmlzRmluaXNoZWQoKSkge1xuICAgICAgICAgIHRoaXMuaGFuZGxlRW5kU3RhdGUoKTtcbiAgICAgIH0gXG4gIH1cblxuICBhZGRDaGVhdEtleXMoKSB7XG4gICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVElMREUpLm9uVXAuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlVQKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJoaWdobGlnaHQgbW92ZSBmb3J3YXJkIGNvbW1hbmQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkubW92ZUZvcndhcmQoZHVtbXlGdW5jKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IHR1cm4gcmlnaHQgY29tbWFuZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY29kZU9yZ0FQSS50dXJuUmlnaHQoZHVtbXlGdW5jKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5MRUZUKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJoaWdobGlnaHQgdHVybiBsZWZ0IGNvbW1hbmQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkudHVybkxlZnQoZHVtbXlGdW5jKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5QKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJoaWdobGlnaHQgcGxhY2VCbG9jayBjb21tYW5kLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLnBsYWNlQmxvY2soZHVtbXlGdW5jLCBcImxvZ09ha1wiKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5EKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJoaWdobGlnaHQgZGVzdHJveSBibG9jayBjb21tYW5kLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLmRlc3Ryb3lCbG9jayhkdW1teUZ1bmMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkUpLm9uVXAuYWRkKCgpID0+IHtcbiAgICAgICAgdmFyIGR1bW15RnVuYyA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgRXhlY3V0ZSBjb21tYW5kIGxpc3QgZG9uZTogJHtyZXN1bHR9IGApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkuc3RhcnRBdHRlbXB0KGR1bW15RnVuYyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVykub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXhlY3V0ZSBXaGlsZSBjb21tYW5kIGxpc3RcIik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBibG9ja1R5cGUgPSBcImVtcHR5XCI7XG4gICAgICAgIHZhciBjb2RlQmxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5jb2RlT3JnQVBJLm1vdmVGb3J3YXJkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXhlY3V0ZSBXaGlsZSBjb21tYW5kIG1vdmUgYmxvY2tcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5jb2RlT3JnQVBJLm1vdmVGb3J3YXJkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXhlY3V0ZSBXaGlsZSBjb21tYW5kIG1vdmUgYmxvY2syXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSS50dXJuTGVmdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgV2hpbGUgY29tbWFuZCB0dXJuXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkud2hpbGVQYXRoQWhlYWQoZHVtbXlGdW5jLCBibG9ja1R5cGUsIGNvZGVCbG9jayk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZUVuZFN0YXRlKCkge1xuICAgICAgLy8gVE9ETzogZ28gaW50byBzdWNjZXNzL2ZhaWx1cmUgYW5pbWF0aW9uPyAob3IgYXJlIHdlIGNhbGxlZCBieSBDb2RlT3JnIGZvciB0aGF0PylcblxuICAgICAgLy8gcmVwb3J0IGJhY2sgdG8gdGhlIGNvZGUub3JnIHNpZGUgdGhlIHBhc3MvZmFpbCByZXN1bHQgXG4gICAgICAvLyAgICAgdGhlbiBjbGVhciB0aGUgY2FsbGJhY2sgc28gd2UgZG9udCBrZWVwIGNhbGxpbmcgaXRcbiAgICAgIGlmICh0aGlzLk9uQ29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgIGlmICh0aGlzLnF1ZXVlLmlzU3VjY2VlZGVkKCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5PbkNvbXBsZXRlQ2FsbGJhY2sodHJ1ZSwgdGhpcy5sZXZlbE1vZGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuT25Db21wbGV0ZUNhbGxiYWNrKGZhbHNlLCB0aGlzLmxldmVsTW9kZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLk9uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG4gICAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuREVCVUcpIHtcbiAgICAgIHRoaXMuZ2FtZS5kZWJ1Zy50ZXh0KHRoaXMuZ2FtZS50aW1lLmZwcyB8fCAnLS0nLCAyLCAxNCwgXCIjMDBmZjAwXCIpO1xuICAgIH1cbiAgICB0aGlzLmxldmVsVmlldy5yZW5kZXIoKTtcbiAgfVxuXG4gIHNjYWxlRnJvbU9yaWdpbmFsKCkge1xuICAgIHZhciBbbmV3V2lkdGgsIG5ld0hlaWdodF0gPSB0aGlzLmxldmVsRGF0YS5ncmlkRGltZW5zaW9ucyB8fCBbMTAsIDEwXTtcbiAgICB2YXIgW29yaWdpbmFsV2lkdGgsIG9yaWdpbmFsSGVpZ2h0XSA9IFsxMCwgMTBdO1xuICAgIHJldHVybiBbbmV3V2lkdGggLyBvcmlnaW5hbFdpZHRoLCBuZXdIZWlnaHQgLyBvcmlnaW5hbEhlaWdodF07XG4gIH1cblxuICBnZXRTY3JlZW5zaG90KCkge1xuICAgIHJldHVybiB0aGlzLmdhbWUuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgfVxuXG4gIC8vIGNvbW1hbmQgcHJvY2Vzc29yc1xuICBtb3ZlRm9yd2FyZChjb21tYW5kUXVldWVJdGVtKSB7XG4gICAgdmFyIHBsYXllciA9IHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIsXG4gICAgICBhbGxGb3VuZENyZWVwZXJzLFxuICAgICAgZ3JvdW5kVHlwZSxcbiAgICAgIGp1bXBPZmY7XG5cbiAgICBpZiAodGhpcy5sZXZlbE1vZGVsLmNhbk1vdmVGb3J3YXJkKCkpIHtcbiAgICAgIGxldCB3YXNPbkJsb2NrID0gcGxheWVyLmlzT25CbG9jaztcbiAgICAgIHRoaXMubGV2ZWxNb2RlbC5tb3ZlRm9yd2FyZCgpO1xuICAgICAgLy8gVE9ETzogY2hlY2sgZm9yIExhdmEsIENyZWVwZXIsIHdhdGVyID0+IHBsYXkgYXBwcm9wIGFuaW1hdGlvbiAmIGNhbGwgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKVxuXG4gICAgICBqdW1wT2ZmID0gd2FzT25CbG9jayAmJiB3YXNPbkJsb2NrICE9IHBsYXllci5pc09uQmxvY2s7XG4gICAgICBpZihwbGF5ZXIuaXNPbkJsb2NrIHx8IGp1bXBPZmYpIHtcbiAgICAgICAgZ3JvdW5kVHlwZSA9IHRoaXMubGV2ZWxNb2RlbC5hY3Rpb25QbGFuZVt0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgocGxheWVyLnBvc2l0aW9uWzFdKSArIHBsYXllci5wb3NpdGlvblswXV0uYmxvY2tUeXBlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGdyb3VuZFR5cGUgPSB0aGlzLmxldmVsTW9kZWwuZ3JvdW5kUGxhbmVbdGhpcy5sZXZlbE1vZGVsLnlUb0luZGV4KHBsYXllci5wb3NpdGlvblsxXSkgKyBwbGF5ZXIucG9zaXRpb25bMF1dLmJsb2NrVHlwZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sZXZlbFZpZXcucGxheU1vdmVGb3J3YXJkQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywganVtcE9mZiwgcGxheWVyLmlzT25CbG9jaywgZ3JvdW5kVHlwZSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5SWRsZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2spO1xuXG4gICAgICAvL0ZpcnN0IGFyZyBpcyBpZiB3ZSBmb3VuZCBhIGNyZWVwZXJcbiAgICAgICAgYWxsRm91bmRDcmVlcGVycyA9IHRoaXMubGV2ZWxNb2RlbC5pc1BsYXllclN0YW5kaW5nTmVhckNyZWVwZXIoKTtcblxuICAgICAgICBpZiAodGhpcy5sZXZlbE1vZGVsLmlzUGxheWVyU3RhbmRpbmdJbldhdGVyKCkpIHtcbiAgICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlEcm93bkZhaWx1cmVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKCk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gXG4gICAgICAgIGVsc2UgaWYodGhpcy5sZXZlbE1vZGVsLmlzUGxheWVyU3RhbmRpbmdJbkxhdmEoKSkge1xuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlCdXJuSW5MYXZhQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgcGxheWVyLmlzT25CbG9jaywgKCkgPT4ge1xuICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5kZWxheUJ5KDIwMCwgKCkgPT4ge1xuICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBcbiAgICBlbHNlIHtcbiAgICAgIGlmKHRoaXMubGV2ZWxNb2RlbC5pc0ZvcndhcmRCbG9ja09mVHlwZShcImNyZWVwZXJcIikpXG4gICAgICB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlDcmVlcGVyRXhwbG9kZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHRoaXMubGV2ZWxNb2RlbC5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCksIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLmZhaWxlZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5QnVtcEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5kZWxheUJ5KDgwMCwgKCkgPT4ge1xuICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHR1cm4oY29tbWFuZFF1ZXVlSXRlbSwgZGlyZWN0aW9uKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PSAtMSkge1xuICAgICAgdGhpcy5sZXZlbE1vZGVsLnR1cm5MZWZ0KCk7XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAxKSB7XG4gICAgICB0aGlzLmxldmVsTW9kZWwudHVyblJpZ2h0KCk7XG4gICAgfVxuICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZVBsYXllckRpcmVjdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZyk7XG5cbiAgICB0aGlzLmRlbGF5QnkoODAwLCAoKSA9PiB7XG4gICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgIH0pO1xuXG4gIH1cblxuICBkZXN0cm95QmxvY2tXaXRob3V0UGxheWVySW50ZXJhY3Rpb24ocG9zaXRpb24pIHtcbiAgICBsZXQgYmxvY2sgPSB0aGlzLmxldmVsTW9kZWwuYWN0aW9uUGxhbmVbdGhpcy5sZXZlbE1vZGVsLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIHBvc2l0aW9uWzBdXTtcbiAgICB0aGlzLmxldmVsTW9kZWwuZGVzdHJveUJsb2NrKHBvc2l0aW9uKTtcblxuICAgIGlmIChibG9jayAhPT0gbnVsbCkge1xuICAgICAgbGV0IGRlc3Ryb3lQb3NpdGlvbiA9IGJsb2NrLnBvc2l0aW9uO1xuICAgICAgbGV0IGJsb2NrVHlwZSA9IGJsb2NrLmJsb2NrVHlwZTtcblxuICAgICAgaWYgKGJsb2NrLmlzRGVzdHJveWFibGUpIHtcbiAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVGb3dQbGFuZSgpO1xuICAgICAgICBzd2l0Y2goYmxvY2tUeXBlKXtcbiAgICAgICAgICBjYXNlIFwibG9nQWNhY2lhXCI6XG4gICAgICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzQWNhY2lhXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImxvZ0JpcmNoXCI6XG4gICAgICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0JpcmNoXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImxvZ0p1bmdsZVwiOlxuICAgICAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0p1bmdsZVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJsb2dPYWtcIjpcbiAgICAgICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc09ha1wiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJsb2dTcHJ1Y2VcIjpcbiAgICAgICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NTcHJ1Y2VcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxldmVsVmlldy5hY3Rpb25QbGFuZUJsb2Nrc1t0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSArIGRlc3Ryb3lQb3NpdGlvblswXV0ua2lsbCgpO1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgKCk9Pnt9LCB0cnVlKTtcbiAgICAgIH0gZWxzZSBpZiAoYmxvY2suaXNVc2FibGUpIHtcbiAgICAgICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgICAgICBjYXNlIFwic2hlZXBcIjpcbiAgICAgICAgICAgIC8vIFRPRE86IFdoYXQgdG8gZG8gd2l0aCBhbHJlYWR5IHNoZWVyZWQgc2hlZXA/XG4gICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5U2hlYXJBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCAoKT0+e30pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZXN0cm95QmxvY2soY29tbWFuZFF1ZXVlSXRlbSkge1xuICAgIGxldCBwbGF5ZXIgPSB0aGlzLmxldmVsTW9kZWwucGxheWVyO1xuICAgIGlmICh0aGlzLmxldmVsTW9kZWwuY2FuRGVzdHJveUJsb2NrRm9yd2FyZCgpKSB7XG4gICAgICBsZXQgYmxvY2sgPSB0aGlzLmxldmVsTW9kZWwuZGVzdHJveUJsb2NrRm9yd2FyZCgpO1xuXG4gICAgICBpZiAoYmxvY2sgIT09IG51bGwpIHtcbiAgICAgICAgbGV0IGRlc3Ryb3lQb3NpdGlvbiA9IGJsb2NrLnBvc2l0aW9uO1xuICAgICAgICBsZXQgYmxvY2tUeXBlID0gYmxvY2suYmxvY2tUeXBlO1xuXG4gICAgICAgIGlmIChibG9jay5pc0Rlc3Ryb3lhYmxlKSB7XG4gICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICAgICAgc3dpdGNoKGJsb2NrVHlwZSl7XG4gICAgICAgICAgICBjYXNlIFwibG9nQWNhY2lhXCI6XG4gICAgICAgICAgICBjYXNlIFwidHJlZUFjYWNpYVwiOlxuICAgICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0FjYWNpYVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibG9nQmlyY2hcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0JpcmNoXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsb2dKdW5nbGVcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzSnVuZ2xlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsb2dPYWtcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NPYWtcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImxvZ1NwcnVjZVwiOlxuICAgICAgICAgICAgY2FzZSBcInRyZWVTcHJ1Y2VcIjpcbiAgICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NTcHJ1Y2VcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlEZXN0cm95QmxvY2tBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgdGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSwgdGhpcy5sZXZlbE1vZGVsLmZvd1BsYW5lLCAoKSA9PiB7XG4gICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGJsb2NrLmlzVXNhYmxlKSB7XG4gICAgICAgICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJzaGVlcFwiOlxuICAgICAgICAgICAgICAvLyBUT0RPOiBXaGF0IHRvIGRvIHdpdGggYWxyZWFkeSBzaGVlcmVkIHNoZWVwP1xuICAgICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5U2hlYXJTaGVlcEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxldmVsVmlldy5wbGF5UHVuY2hEZXN0cm95QWlyQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgdGhpcy5sZXZlbE1vZGVsLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwbGF5ZXIucG9zaXRpb25bMF0sIHBsYXllci5wb3NpdGlvblsxXSk7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgcGxheWVyLmlzT25CbG9jayk7XG4gICAgICAgIHRoaXMuZGVsYXlCeSg2MDAsICgpID0+IHtcbiAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNhblVzZVRpbnRzKCkge1xuICAgIC8vIFRPRE8oYmpvcmRhbik6IFJlbW92ZVxuICAgIC8vIGFsbCBicm93c2VycyBhcHBlYXIgdG8gd29yayB3aXRoIG5ldyB2ZXJzaW9uIG9mIFBoYXNlclxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY2hlY2tUbnRBbmltYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BlY2lhbExldmVsVHlwZSA9PT0gJ2ZyZWVwbGF5JztcbiAgfVxuXG4gIGNoZWNrTWluZWNhcnRMZXZlbEVuZEFuaW1hdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zcGVjaWFsTGV2ZWxUeXBlID09PSAnbWluZWNhcnQnO1xuICB9XG5cbiAgY2hlY2tIb3VzZUJ1aWx0RW5kQW5pbWF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnNwZWNpYWxMZXZlbFR5cGUgPT09ICdob3VzZUJ1aWxkJztcbiAgfVxuXG4gIGNoZWNrUmFpbEJsb2NrKGJsb2NrVHlwZSkge1xuICAgIHZhciBjaGVja1JhaWxCbG9jayA9IHRoaXMubGV2ZWxNb2RlbC5yYWlsTWFwW3RoaXMubGV2ZWxNb2RlbC55VG9JbmRleCh0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uWzFdKSArIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb25bMF1dO1xuICAgIGlmIChjaGVja1JhaWxCbG9jayAhPT0gXCJcIikge1xuICAgICAgYmxvY2tUeXBlID0gY2hlY2tSYWlsQmxvY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJsb2NrVHlwZSA9IFwicmFpbHNWZXJ0aWNhbFwiO1xuICAgIH1cbiAgICByZXR1cm4gYmxvY2tUeXBlO1xuICB9XG5cbiAgcGxhY2VCbG9jayhjb21tYW5kUXVldWVJdGVtLCBibG9ja1R5cGUpIHtcbiAgICB2YXIgYmxvY2tJbmRleCA9ICh0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgodGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvblsxXSkgKyB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uWzBdKTtcbiAgICB2YXIgYmxvY2tUeXBlQXRQb3NpdGlvbiA9IHRoaXMubGV2ZWxNb2RlbC5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGU7XG4gICAgaWYgKHRoaXMubGV2ZWxNb2RlbC5jYW5QbGFjZUJsb2NrKCkpIHtcbiAgICAgIGlmKHRoaXMuY2hlY2tNaW5lY2FydExldmVsRW5kQW5pbWF0aW9uKCkgJiYgYmxvY2tUeXBlID09IFwicmFpbFwiKSB7XG4gICAgICAgIGJsb2NrVHlwZSA9IHRoaXMuY2hlY2tSYWlsQmxvY2soYmxvY2tUeXBlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGJsb2NrVHlwZUF0UG9zaXRpb24gIT09IFwiXCIpIHtcbiAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmRlc3Ryb3lCbG9jayhibG9ja0luZGV4KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxldmVsTW9kZWwucGxhY2VCbG9jayhibG9ja1R5cGUpKSB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlQbGFjZUJsb2NrQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBibG9ja1R5cGUsIGJsb2NrVHlwZUF0UG9zaXRpb24sICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlU2hhZGluZ1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZUZvd1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5mb3dQbGFuZSk7XG4gICAgICAgICAgdGhpcy5kZWxheUJ5KDIwMCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUlkbGVBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGZhbHNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmRlbGF5QnkoNDAwLCAoKSA9PiB7XG4gICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzaWduYWxCaW5kaW5nID0gdGhpcy5sZXZlbFZpZXcucGxheVBsYXllckFuaW1hdGlvbihcImp1bXBVcFwiLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgZmFsc2UpLm9uTG9vcC5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBmYWxzZSk7XG4gICAgICAgICAgc2lnbmFsQmluZGluZy5kZXRhY2goKTtcbiAgICAgICAgICB0aGlzLmRlbGF5QnkoODAwLCAoKSA9PiB7IGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7IH0pO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKTtcbiAgICB9XG4gIH1cblxuICBkZWxheUJ5KG1zLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciB0aW1lciA9IHRoaXMuZ2FtZS50aW1lLmNyZWF0ZSh0cnVlKTtcbiAgICB0aW1lci5hZGQodGhpcy5vcmlnaW5hbE1zVG9TY2FsZWQobXMpLCBjb21wbGV0aW9uSGFuZGxlciwgdGhpcyk7XG4gICAgdGltZXIuc3RhcnQoKTtcbiAgICB0aGlzLnJlc2V0dGFibGVUaW1lcnMucHVzaCh0aW1lcik7XG4gIH1cblxuICBvcmlnaW5hbE1zVG9TY2FsZWQobXMpIHtcbiAgICB2YXIgcmVhbE1zID0gbXMgLyB0aGlzLmFzc3VtZWRTbG93TW90aW9uO1xuICAgIHJldHVybiByZWFsTXMgKiB0aGlzLmdhbWUudGltZS5zbG93TW90aW9uO1xuICB9XG5cbiAgb3JpZ2luYWxGcHNUb1NjYWxlZChmcHMpIHtcbiAgICB2YXIgcmVhbEZwcyA9IGZwcyAqIHRoaXMuYXNzdW1lZFNsb3dNb3Rpb247XG4gICAgcmV0dXJuIHJlYWxGcHMgLyB0aGlzLmdhbWUudGltZS5zbG93TW90aW9uO1xuICB9XG5cbiAgcGxhY2VCbG9ja0ZvcndhcmQoY29tbWFuZFF1ZXVlSXRlbSwgYmxvY2tUeXBlKSB7XG4gICAgdmFyIGZvcndhcmRQb3NpdGlvbixcbiAgICAgICAgcGxhY2VtZW50UGxhbmUsXG4gICAgICAgIHNvdW5kRWZmZWN0ID0gKCk9Pnt9O1xuXG4gICAgaWYgKCF0aGlzLmxldmVsTW9kZWwuY2FuUGxhY2VCbG9ja0ZvcndhcmQoKSkge1xuICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVB1bmNoQWlyQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBmYWxzZSk7XG4gICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3J3YXJkUG9zaXRpb24gPSB0aGlzLmxldmVsTW9kZWwuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpO1xuICAgIHBsYWNlbWVudFBsYW5lID0gdGhpcy5sZXZlbE1vZGVsLmdldFBsYW5lVG9QbGFjZU9uKGZvcndhcmRQb3NpdGlvbik7XG4gICAgaWYodGhpcy5sZXZlbE1vZGVsLmlzQmxvY2tPZlR5cGVPblBsYW5lKGZvcndhcmRQb3NpdGlvbiwgXCJsYXZhXCIsIHBsYWNlbWVudFBsYW5lKSkge1xuICAgICAgc291bmRFZmZlY3QgPSAoKT0+e3RoaXMubGV2ZWxWaWV3LmF1ZGlvUGxheWVyLnBsYXkoXCJmaXp6XCIpO307XG4gICAgfVxuICAgIHRoaXMubGV2ZWxNb2RlbC5wbGFjZUJsb2NrRm9yd2FyZChibG9ja1R5cGUsIHBsYWNlbWVudFBsYW5lKTtcbiAgICB0aGlzLmxldmVsVmlldy5wbGF5UGxhY2VCbG9ja0luRnJvbnRBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIHRoaXMubGV2ZWxNb2RlbC5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCksIHBsYWNlbWVudFBsYW5lLCBibG9ja1R5cGUsICgpID0+IHtcbiAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVTaGFkaW5nUGxhbmUodGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSk7XG4gICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVGb3dQbGFuZSh0aGlzLmxldmVsTW9kZWwuZm93UGxhbmUpO1xuICAgICAgc291bmRFZmZlY3QoKTtcbiAgICAgIHRoaXMuZGVsYXlCeSgyMDAsICgpID0+IHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUlkbGVBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGZhbHNlKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kZWxheUJ5KDQwMCwgKCkgPT4ge1xuICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBjaGVja1NvbHV0aW9uKGNvbW1hbmRRdWV1ZUl0ZW0pIHtcbiAgICBsZXQgcGxheWVyID0gdGhpcy5sZXZlbE1vZGVsLnBsYXllcjtcbiAgICB0aGlzLmxldmVsVmlldy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwbGF5ZXIucG9zaXRpb25bMF0sIHBsYXllci5wb3NpdGlvblsxXSk7XG5cbiAgICAvLyBjaGVjayB0aGUgZmluYWwgc3RhdGUgdG8gc2VlIGlmIGl0cyBzb2x2ZWRcbiAgICBpZiAodGhpcy5sZXZlbE1vZGVsLmlzU29sdmVkKCkpIHtcbiAgICAgIGlmKHRoaXMuY2hlY2tIb3VzZUJ1aWx0RW5kQW5pbWF0aW9uKCkpIHtcbiAgICAgICAgdmFyIGhvdXNlQm90dG9tUmlnaHQgPSB0aGlzLmxldmVsTW9kZWwuZ2V0SG91c2VCb3R0b21SaWdodCgpO1xuICAgICAgICB2YXIgaW5Gcm9udE9mRG9vciA9IFtob3VzZUJvdHRvbVJpZ2h0WzBdIC0gMSwgaG91c2VCb3R0b21SaWdodFsxXSArIDJdO1xuICAgICAgICB2YXIgYmVkUG9zaXRpb24gPSBbaG91c2VCb3R0b21SaWdodFswXSwgaG91c2VCb3R0b21SaWdodFsxXV07XG4gICAgICAgIHZhciBkb29yUG9zaXRpb24gPSBbaG91c2VCb3R0b21SaWdodFswXSAtIDEsIGhvdXNlQm90dG9tUmlnaHRbMV0gKyAxXTtcbiAgICAgICAgdGhpcy5sZXZlbE1vZGVsLm1vdmVUbyhpbkZyb250T2ZEb29yKTtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVN1Y2Nlc3NIb3VzZUJ1aWx0QW5pbWF0aW9uKFxuICAgICAgICAgICAgcGxheWVyLnBvc2l0aW9uLFxuICAgICAgICAgICAgcGxheWVyLmZhY2luZyxcbiAgICAgICAgICAgIHBsYXllci5pc09uQmxvY2ssXG4gICAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuaG91c2VHcm91bmRUb0Zsb29yQmxvY2tzKGhvdXNlQm90dG9tUmlnaHQpLFxuICAgICAgICAgICAgW2JlZFBvc2l0aW9uLCBkb29yUG9zaXRpb25dLFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmRlc3Ryb3lCbG9jayhiZWRQb3NpdGlvbik7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2soZG9vclBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVGb3dQbGFuZSgpO1xuICAgICAgICAgICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVTaGFkaW5nUGxhbmUodGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSk7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZUZvd1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5mb3dQbGFuZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRoaXMuY2hlY2tNaW5lY2FydExldmVsRW5kQW5pbWF0aW9uKCkpXG4gICAgICB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlNaW5lY2FydEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssXG4gICAgICAgICAgICAoKSA9PiB7IGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7IH0sIHRoaXMubGV2ZWxNb2RlbC5nZXRNaW5lY2FydFRyYWNrKCksIHRoaXMubGV2ZWxNb2RlbC5nZXRVbnBvd2VyZWRSYWlscygpKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodGhpcy5jaGVja1RudEFuaW1hdGlvbigpKSB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnNjYWxlU2hvd1dob2xlV29ybGQoKCkgPT4ge30pO1xuICAgICAgICB2YXIgdG50ID0gdGhpcy5sZXZlbE1vZGVsLmdldFRudCgpO1xuICAgICAgICB2YXIgd2FzT25CbG9jayA9IHBsYXllci5pc09uQmxvY2s7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlEZXN0cm95VG50QW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgcGxheWVyLmlzT25CbG9jaywgdGhpcy5sZXZlbE1vZGVsLmdldFRudCgpLCB0aGlzLmxldmVsTW9kZWwuc2hhZGluZ1BsYW5lLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRudC5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFNoYWtlcyBjYW1lcmEgKG5lZWQgdG8gYXZvaWQgY29udGVudGlvbiB3aXRoIHBhbj8pXG4gICAgICAgICAgICAvL3RoaXMuZ2FtZS5jYW1lcmEuc2V0UG9zaXRpb24oMCwgNSk7XG4gICAgICAgICAgICAvL3RoaXMuZ2FtZS5hZGQudHdlZW4odGhpcy5nYW1lLmNhbWVyYSlcbiAgICAgICAgICAgIC8vICAgIC50byh7eTogLTEwfSwgNDAsIFBoYXNlci5FYXNpbmcuU2ludXNvaWRhbC5Jbk91dCwgZmFsc2UsIDAsIDMsIHRydWUpXG4gICAgICAgICAgICAvLyAgICAudG8oe3k6IDB9LCAwKVxuICAgICAgICAgICAgLy8gICAgLnN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvcih2YXIgaSBpbiB0bnQpIHtcbiAgICAgICAgICAgIGlmICh0bnRbaV0ueCA9PT0gdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbi54ICYmIHRudFtpXS55ID09PSB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLnkpIHtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5pc09uQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdXJyb3VuZGluZ0Jsb2NrcyA9IHRoaXMubGV2ZWxNb2RlbC5nZXRBbGxCb3JkZXJpbmdQb3NpdGlvbk5vdE9mVHlwZSh0bnRbaV0sIFwidG50XCIpO1xuICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmRlc3Ryb3lCbG9jayh0bnRbaV0pO1xuICAgICAgICAgICAgZm9yKHZhciBiID0gMTsgYiA8IHN1cnJvdW5kaW5nQmxvY2tzLmxlbmd0aDsgKytiKSB7XG4gICAgICAgICAgICAgIGlmKHN1cnJvdW5kaW5nQmxvY2tzW2JdWzBdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95QmxvY2tXaXRob3V0UGxheWVySW50ZXJhY3Rpb24oc3Vycm91bmRpbmdCbG9ja3NbYl1bMV0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghcGxheWVyLmlzT25CbG9jayAmJiB3YXNPbkJsb2NrKSB7XG4gICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5UGxheWVySnVtcERvd25WZXJ0aWNhbEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZVNoYWRpbmdQbGFuZSgpO1xuICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlRm93UGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVTaGFkaW5nUGxhbmUodGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSk7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlRm93UGxhbmUodGhpcy5sZXZlbE1vZGVsLmZvd1BsYW5lKTtcbiAgICAgICAgICB0aGlzLmRlbGF5QnkoMjAwLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5U3VjY2Vzc0FuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5U3VjY2Vzc0FuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssXG4gICAgICAgICAgICAoKSA9PiB7IGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7IH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxldmVsVmlldy5wbGF5RmFpbHVyZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlzUGF0aEFoZWFkKGJsb2NrVHlwZSkgIHtcbiAgICAgIHJldHVybiB0aGlzLmxldmVsTW9kZWwuaXNGb3J3YXJkQmxvY2tPZlR5cGUoYmxvY2tUeXBlKTtcbiAgfVxuXG59XG5cbndpbmRvdy5HYW1lQ29udHJvbGxlciA9IEdhbWVDb250cm9sbGVyO1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lQ29udHJvbGxlcjtcbiIsImltcG9ydCBGYWNpbmdEaXJlY3Rpb24gZnJvbSBcIi4vRmFjaW5nRGlyZWN0aW9uLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExldmVsVmlldyB7XG4gIGNvbnN0cnVjdG9yKGNvbnRyb2xsZXIpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgIHRoaXMuYXVkaW9QbGF5ZXIgPSBjb250cm9sbGVyLmF1ZGlvUGxheWVyO1xuICAgIHRoaXMuZ2FtZSA9IGNvbnRyb2xsZXIuZ2FtZTtcblxuICAgIHRoaXMuYmFzZVNoYWRpbmcgPSBudWxsO1xuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBudWxsO1xuICAgIHRoaXMucGxheWVyR2hvc3QgPSBudWxsOyAgICAgICAgLy8gVGhlIGdob3N0IGlzIGEgY29weSBvZiB0aGUgcGxheWVyIHNwcml0ZSB0aGF0IHNpdHMgb24gdG9wIG9mIGV2ZXJ5dGhpbmcgYXQgMjAlIG9wYWNpdHksIHNvIHRoZSBwbGF5ZXIgY2FuIGdvIHVuZGVyIHRyZWVzIGFuZCBzdGlsbCBiZSBzZWVuLlxuICAgIHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yID0gbnVsbDtcblxuICAgIHRoaXMuZ3JvdW5kUGxhbmUgPSBudWxsO1xuICAgIHRoaXMuc2hhZGluZ1BsYW5lID0gbnVsbDtcbiAgICB0aGlzLmFjdGlvblBsYW5lID0gbnVsbDtcbiAgICB0aGlzLmZsdWZmUGxhbmUgPSBudWxsO1xuICAgIHRoaXMuZm93UGxhbmUgPSBudWxsO1xuXG4gICAgdGhpcy5taW5pQmxvY2tzID0ge1xuICAgICAgXCJkaXJ0XCI6IFtcIk1pbmlibG9ja3NcIiwgMCwgNV0sXG4gICAgICBcImRpcnRDb2Fyc2VcIjogW1wiTWluaWJsb2Nrc1wiLCA2LCAxMV0sXG4gICAgICBcInNhbmRcIjogW1wiTWluaWJsb2Nrc1wiLCAxMiwgMTddLFxuICAgICAgXCJncmF2ZWxcIjogW1wiTWluaWJsb2Nrc1wiLCAxOCwgMjNdLFxuICAgICAgXCJicmlja3NcIjogW1wiTWluaWJsb2Nrc1wiLCAyNCwgMjldLFxuICAgICAgXCJsb2dBY2FjaWFcIjogW1wiTWluaWJsb2Nrc1wiLCAzMCwgMzVdLFxuICAgICAgXCJsb2dCaXJjaFwiOiBbXCJNaW5pYmxvY2tzXCIsIDM2LCA0MV0sXG4gICAgICBcImxvZ0p1bmdsZVwiOiBbXCJNaW5pYmxvY2tzXCIsIDQyLCA0N10sXG4gICAgICBcImxvZ09ha1wiOiBbXCJNaW5pYmxvY2tzXCIsIDQ4LCA1M10sXG4gICAgICBcImxvZ1NwcnVjZVwiOiBbXCJNaW5pYmxvY2tzXCIsIDU0LCA1OV0sXG4gICAgICBcInBsYW5rc0FjYWNpYVwiOiBbXCJNaW5pYmxvY2tzXCIsIDYwLCA2NV0sXG4gICAgICBcInBsYW5rc0JpcmNoXCI6IFtcIk1pbmlibG9ja3NcIiwgNjYsIDcxXSxcbiAgICAgIFwicGxhbmtzSnVuZ2xlXCI6IFtcIk1pbmlibG9ja3NcIiwgNzIsIDc3XSxcbiAgICAgIFwicGxhbmtzT2FrXCI6IFtcIk1pbmlibG9ja3NcIiwgNzgsIDgzXSxcbiAgICAgIFwicGxhbmtzU3BydWNlXCI6IFtcIk1pbmlibG9ja3NcIiwgODQsIDg5XSxcbiAgICAgIFwiY29iYmxlc3RvbmVcIjogW1wiTWluaWJsb2Nrc1wiLCA5MCwgOTVdLFxuICAgICAgXCJzYW5kc3RvbmVcIjogW1wiTWluaWJsb2Nrc1wiLCA5NiwgMTAxXSxcbiAgICAgIFwid29vbFwiOiBbXCJNaW5pYmxvY2tzXCIsIDEwMiwgMTA3XSxcbiAgICAgIFwicmVkc3RvbmVEdXN0XCI6IFtcIk1pbmlibG9ja3NcIiwgMTA4LCAxMTNdLFxuICAgICAgXCJsYXBpc0xhenVsaVwiOiBbXCJNaW5pYmxvY2tzXCIsIDExNCwgMTE5XSxcbiAgICAgIFwiaW5nb3RJcm9uXCI6IFtcIk1pbmlibG9ja3NcIiwgMTIwLCAxMjVdLFxuICAgICAgXCJpbmdvdEdvbGRcIjogW1wiTWluaWJsb2Nrc1wiLCAxMjYsIDEzMV0sXG4gICAgICBcImVtZXJhbGRcIjogW1wiTWluaWJsb2Nrc1wiLCAxMzIsIDEzN10sXG4gICAgICBcImRpYW1vbmRcIjogW1wiTWluaWJsb2Nrc1wiLCAxMzgsIDE0M10sXG4gICAgICBcImNvYWxcIjogW1wiTWluaWJsb2Nrc1wiLCAxNDQsIDE0OV0sXG4gICAgICBcImJ1Y2tldFdhdGVyXCI6IFtcIk1pbmlibG9ja3NcIiwgMTUwLCAxNTVdLFxuICAgICAgXCJidWNrZXRMYXZhXCI6IFtcIk1pbmlibG9ja3NcIiwgMTU2LCAxNjFdLFxuICAgICAgXCJndW5Qb3dkZXJcIjogW1wiTWluaWJsb2Nrc1wiLCAxNjIsIDE2N10sXG4gICAgICBcIndoZWF0XCI6IFtcIk1pbmlibG9ja3NcIiwgMTY4LCAxNzNdLFxuICAgICAgXCJwb3RhdG9cIjogW1wiTWluaWJsb2Nrc1wiLCAxNzQsIDE3OV0sXG4gICAgICBcImNhcnJvdHNcIjogW1wiTWluaWJsb2Nrc1wiLCAxODAsIDE4NV0sXG5cbiAgICAgIFwic2hlZXBcIjogW1wiTWluaWJsb2Nrc1wiLCAxMDIsIDEwN11cbiAgICB9O1xuXG4gICAgdGhpcy5ibG9ja3MgPSB7XG4gICAgICBcImJlZHJvY2tcIjogW1wiYmxvY2tzXCIsIFwiQmVkcm9ja1wiLCAtMTMsIDBdLFxuICAgICAgXCJicmlja3NcIjogW1wiYmxvY2tzXCIsIFwiQnJpY2tzXCIsIC0xMywgMF0sXG4gICAgICBcIm9yZUNvYWxcIjogW1wiYmxvY2tzXCIsIFwiQ29hbF9PcmVcIiwgLTEzLCAwXSxcbiAgICAgIFwiZGlydENvYXJzZVwiOiBbXCJibG9ja3NcIiwgXCJDb2Fyc2VfRGlydFwiLCAtMTMsIDBdLFxuICAgICAgXCJjb2JibGVzdG9uZVwiOiBbXCJibG9ja3NcIiwgXCJDb2JibGVzdG9uZVwiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVEaWFtb25kXCI6IFtcImJsb2Nrc1wiLCBcIkRpYW1vbmRfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcImRpcnRcIjogW1wiYmxvY2tzXCIsIFwiRGlydFwiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVFbWVyYWxkXCI6IFtcImJsb2Nrc1wiLCBcIkVtZXJhbGRfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcImZhcm1sYW5kV2V0XCI6IFtcImJsb2Nrc1wiLCBcIkZhcm1sYW5kX1dldFwiLCAtMTMsIDBdLFxuICAgICAgXCJmbG93ZXJEYW5kZWxpb25cIjogW1wiYmxvY2tzXCIsIFwiRmxvd2VyX0RhbmRlbGlvblwiLCAtMTMsIDBdLFxuICAgICAgXCJmbG93ZXJPeGVleWVcIjogW1wiYmxvY2tzXCIsIFwiRmxvd2VyX094ZWV5ZVwiLCAtMTMsIDBdLFxuICAgICAgXCJmbG93ZXJSb3NlXCI6IFtcImJsb2Nrc1wiLCBcIkZsb3dlcl9Sb3NlXCIsIC0xMywgMF0sXG4gICAgICBcImdsYXNzXCI6IFtcImJsb2Nrc1wiLCBcIkdsYXNzXCIsIC0xMywgMF0sXG4gICAgICBcIm9yZUdvbGRcIjogW1wiYmxvY2tzXCIsIFwiR29sZF9PcmVcIiwgLTEzLCAwXSxcbiAgICAgIFwiZ3Jhc3NcIjogW1wiYmxvY2tzXCIsIFwiR3Jhc3NcIiwgLTEzLCAwXSxcbiAgICAgIFwiZ3JhdmVsXCI6IFtcImJsb2Nrc1wiLCBcIkdyYXZlbFwiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVJcm9uXCI6IFtcImJsb2Nrc1wiLCBcIklyb25fT3JlXCIsIC0xMywgMF0sXG4gICAgICBcIm9yZUxhcGlzXCI6IFtcImJsb2Nrc1wiLCBcIkxhcGlzX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJsYXZhXCI6IFtcImJsb2Nrc1wiLCBcIkxhdmFfMFwiLCAtMTMsIDBdLFxuICAgICAgXCJsb2dBY2FjaWFcIjogW1wiYmxvY2tzXCIsIFwiTG9nX0FjYWNpYVwiLCAtMTMsIDBdLFxuICAgICAgXCJsb2dCaXJjaFwiOiBbXCJibG9ja3NcIiwgXCJMb2dfQmlyY2hcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nSnVuZ2xlXCI6IFtcImJsb2Nrc1wiLCBcIkxvZ19KdW5nbGVcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nT2FrXCI6IFtcImJsb2Nrc1wiLCBcIkxvZ19PYWtcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nU3BydWNlXCI6IFtcImJsb2Nrc1wiLCBcIkxvZ19TcHJ1Y2VcIiwgLTEzLCAwXSxcbiAgICAgIC8vXCJvYnNpZGlhblwiOiBbXCJibG9ja3NcIiwgXCJPYnNpZGlhblwiLCAtMTMsIDBdLFxuICAgICAgXCJwbGFua3NBY2FjaWFcIjogW1wiYmxvY2tzXCIsIFwiUGxhbmtzX0FjYWNpYVwiLCAtMTMsIDBdLFxuICAgICAgXCJwbGFua3NCaXJjaFwiOiBbXCJibG9ja3NcIiwgXCJQbGFua3NfQmlyY2hcIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzSnVuZ2xlXCI6IFtcImJsb2Nrc1wiLCBcIlBsYW5rc19KdW5nbGVcIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzT2FrXCI6IFtcImJsb2Nrc1wiLCBcIlBsYW5rc19PYWtcIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzU3BydWNlXCI6IFtcImJsb2Nrc1wiLCBcIlBsYW5rc19TcHJ1Y2VcIiwgLTEzLCAwXSxcbiAgICAgIFwib3JlUmVkc3RvbmVcIjogW1wiYmxvY2tzXCIsIFwiUmVkc3RvbmVfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcInNhbmRcIjogW1wiYmxvY2tzXCIsIFwiU2FuZFwiLCAtMTMsIDBdLFxuICAgICAgXCJzYW5kc3RvbmVcIjogW1wiYmxvY2tzXCIsIFwiU2FuZHN0b25lXCIsIC0xMywgMF0sXG4gICAgICBcInN0b25lXCI6IFtcImJsb2Nrc1wiLCBcIlN0b25lXCIsIC0xMywgMF0sXG4gICAgICBcInRudFwiOiBbXCJ0bnRcIiwgXCJUTlRleHBsb3Npb24wXCIsIC04MCwgLTU4XSxcbiAgICAgIFwid2F0ZXJcIjogW1wiYmxvY2tzXCIsIFwiV2F0ZXJfMFwiLCAtMTMsIDBdLFxuICAgICAgXCJ3b29sXCI6IFtcImJsb2Nrc1wiLCBcIldvb2xfV2hpdGVcIiwgLTEzLCAwXSxcbiAgICAgIFwid29vbF9vcmFuZ2VcIjogW1wiYmxvY2tzXCIsIFwiV29vbF9PcmFuZ2VcIiwgLTEzLCAwXSxcblxuICAgICAgXCJsZWF2ZXNBY2FjaWFcIjogW1wibGVhdmVzQWNhY2lhXCIsIFwiTGVhdmVzMFwiLCAtNDIsIDgwXSxcbiAgICAgIFwibGVhdmVzQmlyY2hcIjogW1wibGVhdmVzQmlyY2hcIiwgXCJMZWF2ZXMwXCIsIC0xMDAsIC0xMF0sXG4gICAgICBcImxlYXZlc0p1bmdsZVwiOiBbXCJsZWF2ZXNKdW5nbGVcIiwgXCJMZWF2ZXMwXCIsIC02OSwgNDNdLFxuICAgICAgXCJsZWF2ZXNPYWtcIjogW1wibGVhdmVzT2FrXCIsIFwiTGVhdmVzMFwiLCAtMTAwLCAwXSxcbiAgICAgIFwibGVhdmVzU3BydWNlXCI6IFtcImxlYXZlc1NwcnVjZVwiLCBcIkxlYXZlczBcIiwgLTc2LCA2MF0sXG5cbiAgICAgIFwid2F0ZXJpbmdcIiA6IFtcImJsb2Nrc1wiLCBcIldhdGVyXzBcIiwgLTEzLCAwXSxcbiAgICAgIFwiY3JvcFdoZWF0XCI6IFtcImJsb2Nrc1wiLCBcIldoZWF0MFwiLCAtMTMsIDBdLFxuICAgICAgXCJ0b3JjaFwiOiBbXCJ0b3JjaFwiLCBcIlRvcmNoMFwiLCAtMTMsIDBdLFxuXG4gICAgICBcInRhbGxHcmFzc1wiOiBbXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgLTEzLCAwXSxcblxuICAgICAgXCJsYXZhUG9wXCI6IFtcImxhdmFQb3BcIiwgXCJMYXZhUG9wMDFcIiwgLTEzLCAwXSxcbiAgICAgIFwiZmlyZVwiOiBbXCJmaXJlXCIsIFwiXCIsIC0xMSwgMTM1XSxcbiAgICAgIFwiYnViYmxlc1wiOiBbXCJidWJibGVzXCIsIFwiXCIsIC0xMSwgMTM1XSxcbiAgICAgIFwiZXhwbG9zaW9uXCI6IFtcImV4cGxvc2lvblwiLCBcIlwiLCAtNzAsIDYwXSxcblxuICAgICAgXCJkb29yXCI6IFtcImRvb3JcIiwgXCJcIiwgLTEyLCAtMTVdLFxuXG4gICAgICBcInJhaWxzQm90dG9tTGVmdFwiOiAgICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX0JvdHRvbUxlZnRcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNCb3R0b21SaWdodFwiOiAgICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfQm90dG9tUmlnaHRcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNIb3Jpem9udGFsXCI6ICAgICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfSG9yaXpvbnRhbFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1RvcExlZnRcIjogICAgICAgICAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19Ub3BMZWZ0XCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzVG9wUmlnaHRcIjogICAgICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1RvcFJpZ2h0XCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzVW5wb3dlcmVkSG9yaXpvbnRhbFwiOltcImJsb2Nrc1wiLCBcIlJhaWxzX1VucG93ZXJlZEhvcml6b250YWxcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiOiAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfVW5wb3dlcmVkVmVydGljYWxcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNWZXJ0aWNhbFwiOiAgICAgICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfVmVydGljYWxcIiwgLTEzLCAtMF0sXG4gICAgICBcInJhaWxzUG93ZXJlZEhvcml6b250YWxcIjogIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1Bvd2VyZWRIb3Jpem9udGFsXCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzUG93ZXJlZFZlcnRpY2FsXCI6ICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1Bvd2VyZWRWZXJ0aWNhbFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1JlZHN0b25lVG9yY2hcIjogICAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19SZWRzdG9uZVRvcmNoXCIsIC0xMiwgOV0sXG4gICAgfTtcblxuICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3MgPSBbXTtcbiAgICB0aGlzLnRvRGVzdHJveSA9IFtdO1xuICAgIHRoaXMucmVzZXR0YWJsZVR3ZWVucyA9IFtdO1xuICB9XG5cbiAgeVRvSW5kZXgoeSkge1xuICAgIHJldHVybiB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC55VG9JbmRleCh5KTtcbiAgfVxuXG4gIGNyZWF0ZShsZXZlbE1vZGVsKSB7XG4gICAgdGhpcy5jcmVhdGVQbGFuZXMoKTtcbiAgICB0aGlzLnJlc2V0KGxldmVsTW9kZWwpO1xuICB9XG5cbiAgcmVzZXQobGV2ZWxNb2RlbCkge1xuICAgIGxldCBwbGF5ZXIgPSBsZXZlbE1vZGVsLnBsYXllcjtcblxuICAgIHRoaXMucmVzZXR0YWJsZVR3ZWVucy5mb3JFYWNoKCh0d2VlbikgPT4ge1xuICAgICAgdHdlZW4uc3RvcChmYWxzZSk7XG4gICAgfSk7XG4gICAgdGhpcy5yZXNldHRhYmxlVHdlZW5zLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLnJlc2V0UGxhbmVzKGxldmVsTW9kZWwpO1xuICAgIHRoaXMucHJlcGFyZVBsYXllclNwcml0ZShwbGF5ZXIubmFtZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5zdG9wKCk7XG4gICAgdGhpcy51cGRhdGVTaGFkaW5nUGxhbmUobGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgIHRoaXMudXBkYXRlRm93UGxhbmUobGV2ZWxNb2RlbC5mb3dQbGFuZSk7XG4gICAgdGhpcy5zZXRQbGF5ZXJQb3NpdGlvbihwbGF5ZXIucG9zaXRpb25bMF0sIHBsYXllci5wb3NpdGlvblsxXSwgcGxheWVyLmlzT25CbG9jayk7XG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwbGF5ZXIucG9zaXRpb25bMF0sIHBsYXllci5wb3NpdGlvblsxXSk7XG4gICAgdGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IudmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5wbGF5SWRsZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2spO1xuXG4gICAgaWYgKHRoaXMuY29udHJvbGxlci5mb2xsb3dpbmdQbGF5ZXIoKSkge1xuICAgICAgdGhpcy5nYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCBsZXZlbE1vZGVsLnBsYW5lV2lkdGggKiA0MCwgbGV2ZWxNb2RlbC5wbGFuZUhlaWdodCAqIDQwKTtcbiAgICAgIHRoaXMuZ2FtZS5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyU3ByaXRlKTtcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5zY2FsZS54ID0gMTtcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5zY2FsZS55ID0gMTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b0Rlc3Ryb3kubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMudG9EZXN0cm95W2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy50b0Rlc3Ryb3kgPSBbXTtcblxuICAgIGlmICh0aGlzLnBsYXllckdob3N0KSB7XG4gICAgICB0aGlzLnBsYXllckdob3N0LmZyYW1lID0gdGhpcy5wbGF5ZXJTcHJpdGUuZnJhbWU7XG4gICAgICB0aGlzLnBsYXllckdob3N0LnogPSAxMDAwO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLmFjdGlvblBsYW5lLnNvcnQoJ3NvcnRPcmRlcicpO1xuICAgIHRoaXMuZmx1ZmZQbGFuZS5zb3J0KCd6Jyk7XG4gIH1cblxuICBnZXREaXJlY3Rpb25OYW1lKGZhY2luZykge1xuICAgIHZhciBkaXJlY3Rpb247XG5cbiAgICBzd2l0Y2ggKGZhY2luZykge1xuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uVXA6XG4gICAgICAgIGRpcmVjdGlvbiA9IFwiX3VwXCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5SaWdodDpcbiAgICAgICAgZGlyZWN0aW9uID0gXCJfcmlnaHRcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkRvd246XG4gICAgICAgIGRpcmVjdGlvbiA9IFwiX2Rvd25cIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkxlZnQ6XG4gICAgICAgIGRpcmVjdGlvbiA9IFwiX2xlZnRcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpcmVjdGlvbjtcbiAgfVxuXG4gIHVwZGF0ZVBsYXllckRpcmVjdGlvbihwb3NpdGlvbiwgZmFjaW5nKSB7XG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuXG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiICsgZGlyZWN0aW9uKTtcbiAgfVxuXG4gIHBsYXlQbGF5ZXJBbmltYXRpb24oYW5pbWF0aW9uTmFtZSwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKSB7XG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pICsgNTtcblxuICAgIGxldCBhbmltTmFtZSA9IGFuaW1hdGlvbk5hbWUgKyBkaXJlY3Rpb247XG4gICAgcmV0dXJuIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1OYW1lKTtcbiAgfVxuXG4gIHBsYXlJZGxlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaykge1xuICAgIHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImlkbGVcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKTtcbiAgfVxuXG4gIHNjYWxlU2hvd1dob2xlV29ybGQoY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgW3NjYWxlWCwgc2NhbGVZXSA9IHRoaXMuY29udHJvbGxlci5zY2FsZUZyb21PcmlnaW5hbCgpO1xuICAgIHZhciBzY2FsZVR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5nYW1lLndvcmxkLnNjYWxlKS50byh7XG4gICAgICB4OiAxIC8gc2NhbGVYLFxuICAgICAgeTogMSAvIHNjYWxlWVxuICAgIH0sIDEwMDAsIFBoYXNlci5FYXNpbmcuRXhwb25lbnRpYWwuT3V0KTtcblxuICAgIHRoaXMuZ2FtZS5jYW1lcmEudW5mb2xsb3coKTtcblxuICAgIHZhciBwb3NpdGlvblR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5nYW1lLmNhbWVyYSkudG8oe1xuICAgICAgeDogMCxcbiAgICAgIHk6IDBcbiAgICB9LCAxMDAwLCBQaGFzZXIuRWFzaW5nLkV4cG9uZW50aWFsLk91dCk7XG5cbiAgICBzY2FsZVR3ZWVuLm9uQ29tcGxldGUuYWRkT25jZSgoKSA9PiB7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuXG4gICAgcG9zaXRpb25Ud2Vlbi5zdGFydCgpO1xuICAgIHNjYWxlVHdlZW4uc3RhcnQoKTtcbiAgfVxuXG4gIHBsYXlTdWNjZXNzQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSgyNTAsICgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN1Y2Nlc3NcIik7XG4gICAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImNlbGVicmF0ZVwiLCBwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spLCAoKSA9PiB7XG4gICAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlGYWlsdXJlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSg1MDAsICgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImZhaWx1cmVcIik7XG4gICAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImZhaWxcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSgxNDAwLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlCdW1wQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaykge1xuICAgIHZhciBhbmltYXRpb24gPSB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJidW1wXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gICAgYW5pbWF0aW9uLm9uQ29tcGxldGUuYWRkKCgpPT57XG4gICAgICB0aGlzLnBsYXlJZGxlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgfVxuXG4gIHBsYXlEcm93bkZhaWx1cmVBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgICAgdmFyIHNwcml0ZSxcbiAgICAgICAgICB0d2VlbjtcblxuICAgICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwiZmFpbFwiLCBwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spO1xuICAgICAgdGhpcy5jcmVhdGVCbG9jayh0aGlzLmZsdWZmUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgXCJidWJibGVzXCIpO1xuXG4gICAgICBzcHJpdGUgPSB0aGlzLmZsdWZmUGxhbmUuY3JlYXRlKDAsIDAsIFwiZmluaXNoT3ZlcmxheVwiKTtcbiAgICAgIHZhciBbc2NhbGVYLCBzY2FsZVldID0gdGhpcy5jb250cm9sbGVyLnNjYWxlRnJvbU9yaWdpbmFsKCk7XG4gICAgICBzcHJpdGUuc2NhbGUueCA9IHNjYWxlWDtcbiAgICAgIHNwcml0ZS5zY2FsZS55ID0gc2NhbGVZO1xuICAgICAgc3ByaXRlLmFscGhhID0gMDtcbiAgICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuY2FuVXNlVGludHMoKSkge1xuICAgICAgICBzcHJpdGUudGludCA9IDB4MzI0YmZmO1xuICAgICAgfVxuXG4gICAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgICAgIGFscGhhOiAwLjUsXG4gICAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuXG4gICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0d2Vlbi5zdGFydCgpO1xuICB9XG5cbiAgcGxheUJ1cm5JbkxhdmFBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBzcHJpdGUsXG4gICAgICAgIHR3ZWVuO1xuXG4gICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwianVtcFVwXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gICAgdGhpcy5jcmVhdGVCbG9jayh0aGlzLmZsdWZmUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgXCJmaXJlXCIpO1xuXG4gICAgc3ByaXRlID0gdGhpcy5mbHVmZlBsYW5lLmNyZWF0ZSgwLCAwLCBcImZpbmlzaE92ZXJsYXlcIik7XG4gICAgdmFyIFtzY2FsZVgsIHNjYWxlWV0gPSB0aGlzLmNvbnRyb2xsZXIuc2NhbGVGcm9tT3JpZ2luYWwoKTtcbiAgICBzcHJpdGUuc2NhbGUueCA9IHNjYWxlWDtcbiAgICBzcHJpdGUuc2NhbGUueSA9IHNjYWxlWTtcbiAgICBzcHJpdGUuYWxwaGEgPSAwO1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuY2FuVXNlVGludHMoKSkge1xuICAgICAgc3ByaXRlLnRpbnQgPSAweGQxNTgwZDtcbiAgICB9XG5cbiAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgYWxwaGE6IDAuNSxcbiAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuXG4gICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcblxuICAgIHR3ZWVuLnN0YXJ0KCk7XG4gIH1cblxuICBwbGF5RGVzdHJveVRudEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIHRudEFycmF5ICwgbmV3U2hhZGluZ1BsYW5lRGF0YSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgYmxvY2ssXG4gICAgICAgIGxhc3RBbmltYXRpb247XG4gICAgaWYgKHRudEFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJmdXNlXCIpO1xuICAgIGZvcih2YXIgdG50IGluIHRudEFycmF5KSB7XG4gICAgICAgIGJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1t0aGlzLmNvb3JkaW5hdGVzVG9JbmRleCh0bnRBcnJheVt0bnRdKV07XG4gICAgICAgIGxhc3RBbmltYXRpb24gPSB0aGlzLnBsYXlTY2FsZWRTcGVlZChibG9jay5hbmltYXRpb25zLCBcImV4cGxvZGVcIik7XG4gICAgfVxuXG4gICAgdGhpcy5vbkFuaW1hdGlvbkVuZChsYXN0QW5pbWF0aW9uLCAoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJleHBsb2RlXCIpO1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgcGxheUNyZWVwZXJFeHBsb2RlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMuY29udHJvbGxlci5kZWxheUJ5KDE4MCwgKCkgPT4ge1xuICAgICAgLy90aGlzLm9uQW5pbWF0aW9uTG9vcE9uY2UoXG4gICAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJidW1wXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgIC8vYWRkIGNyZWVwZXIgd2luZHVwIHNvdW5kXG4gICAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImZ1c2VcIik7XG4gICAgICAgIHRoaXMucGxheUV4cGxvZGluZ0NyZWVwZXJBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCB0aGlzKTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSgyMDAsICgpPT57XG4gICAgICAgICAgdGhpcy5vbkFuaW1hdGlvbkxvb3BPbmNlKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImp1bXBVcFwiLCBwb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSksICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheUlkbGVBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlFeHBsb2RpbmdDcmVlcGVyQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcblxuICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSkgKyBkZXN0cm95UG9zaXRpb25bMF07XG4gICAgbGV0IGJsb2NrVG9FeHBsb2RlID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XTtcblxuICAgIHZhciBjcmVlcGVyRXhwbG9kZUFuaW1hdGlvbiA9IGJsb2NrVG9FeHBsb2RlLmFuaW1hdGlvbnMuZ2V0QW5pbWF0aW9uKFwiZXhwbG9kZVwiKTtcbiAgICBjcmVlcGVyRXhwbG9kZUFuaW1hdGlvbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB2YXIgYm9yZGVyaW5nUG9zaXRpb25zO1xuICAgICAgYmxvY2tUb0V4cGxvZGUua2lsbCgpO1xuICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuY29udHJvbGxlci5kZWxheUJ5KDEwMCwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGxheUZhaWx1cmVBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgZmFsc2UsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJleHBsb2RlXCIpO1xuICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQ2xvdWRBbmltYXRpb24oZGVzdHJveVBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIGNyZWVwZXJFeHBsb2RlQW5pbWF0aW9uLnBsYXkoKTtcbiAgfVxuXG4gIHBsYXlFeHBsb3Npb25DbG91ZEFuaW1hdGlvbihwb3NpdGlvbil7XG4gICAgdGhpcy5jcmVhdGVCbG9jayh0aGlzLmZsdWZmUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgXCJleHBsb3Npb25cIik7XG4gIH1cblxuXG4gIGNvb3JkaW5hdGVzVG9JbmRleChjb29yZGluYXRlcykge1xuICAgIHJldHVybiAodGhpcy55VG9JbmRleChjb29yZGluYXRlc1sxXSkpICsgY29vcmRpbmF0ZXNbMF07XG4gIH1cblxuICBwbGF5TWluZWNhcnRUdXJuQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIHR1cm5EaXJlY3Rpb24pIHtcbiAgICB2YXIgYW5pbWF0aW9uID0gdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwibWluZUNhcnRfdHVyblwiICsgdHVybkRpcmVjdGlvbiwgcG9zaXRpb24sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCBmYWxzZSk7XG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgfVxuXG4gIHBsYXlNaW5lY2FydE1vdmVGb3J3YXJkQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG5leHRQb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgYW5pbWF0aW9uLFxuICAgICAgICB0d2VlbjtcblxuICAgIC8vaWYgd2UgbG9vcCB0aGUgc2Z4IHRoYXQgbWlnaHQgYmUgYmV0dGVyP1xuICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcIm1pbmVjYXJ0XCIpO1xuICAgIHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcIm1pbmVDYXJ0XCIscG9zaXRpb24sIGZhY2luZywgZmFsc2UpO1xuICAgIHR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5wbGF5ZXJTcHJpdGUpLnRvKHtcbiAgICAgIHg6ICgtMTggKyA0MCAqIG5leHRQb3NpdGlvblswXSksXG4gICAgICB5OiAoLTMyICsgNDAgKiBuZXh0UG9zaXRpb25bMV0pLFxuICAgIH0sIHNwZWVkLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcbiAgICB0d2Vlbi5zdGFydCgpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgobmV4dFBvc2l0aW9uWzFdKSArIDU7XG5cbiAgICByZXR1cm4gdHdlZW47XG4gIH1cblxuXG4gIGFjdGl2YXRlVW5wb3dlcmVkUmFpbHModW5wb3dlcmVkUmFpbHMpIHtcbiAgICBmb3IodmFyIHJhaWxJbmRleCA9IDA7IHJhaWxJbmRleCA8IHVucG93ZXJlZFJhaWxzLmxlbmd0aDsgcmFpbEluZGV4ICs9IDIpIHtcbiAgICAgIHZhciByYWlsID0gdW5wb3dlcmVkUmFpbHNbcmFpbEluZGV4ICsgMV07XG4gICAgICB2YXIgcG9zaXRpb24gPSB1bnBvd2VyZWRSYWlsc1tyYWlsSW5kZXhdO1xuICAgICAgdGhpcy5jcmVhdGVBY3Rpb25QbGFuZUJsb2NrKHBvc2l0aW9uLCByYWlsKTtcbiAgICB9XG4gIH1cblxuXG5cbiAgcGxheU1pbmVjYXJ0QW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG1pbmVjYXJ0VHJhY2ssIHVucG93ZXJlZFJhaWxzKVxuICB7XG4gICAgdmFyIGFuaW1hdGlvbjtcbiAgICB0aGlzLnRyYWNrID0gbWluZWNhcnRUcmFjaztcbiAgICB0aGlzLmkgPSAwO1xuXG4gICAgLy9zdGFydCBhdCAzLDJcbiAgICB0aGlzLnNldFBsYXllclBvc2l0aW9uKDMsMiwgaXNPbkJsb2NrKTtcbiAgICBwb3NpdGlvbiA9IFszLDJdO1xuXG4gICAgYW5pbWF0aW9uID0gdGhpcy5wbGF5TGV2ZWxFbmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgZmFsc2UpO1xuXG4gICAgYW5pbWF0aW9uLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGVVbnBvd2VyZWRSYWlscyh1bnBvd2VyZWRSYWlscyk7XG4gICAgICB0aGlzLnBsYXlUcmFjayhwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBtaW5lY2FydFRyYWNrKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlUcmFjayhwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBtaW5lY2FydFRyYWNrKVxuICB7XG4gICAgaWYodGhpcy5pIDwgdGhpcy50cmFjay5sZW5ndGgpIHtcbiAgICAgIHZhciBkaXJlY3Rpb24sXG4gICAgICAgICAgYXJyYXlkaXJlY3Rpb24gPSB0aGlzLnRyYWNrW3RoaXMuaV1bMF0sXG4gICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy50cmFja1t0aGlzLmldWzFdLFxuICAgICAgICAgIHNwZWVkID0gdGhpcy50cmFja1t0aGlzLmldWzNdO1xuICAgICAgZmFjaW5nID0gdGhpcy50cmFja1t0aGlzLmldWzJdO1xuXG4gICAgICAvL3R1cm5cbiAgICAgIGlmKGFycmF5ZGlyZWN0aW9uLnN1YnN0cmluZygwLDQpID09PSBcInR1cm5cIikge1xuICAgICAgICBkaXJlY3Rpb24gPSBhcnJheWRpcmVjdGlvbi5zdWJzdHJpbmcoNSk7XG4gICAgICAgIHRoaXMucGxheU1pbmVjYXJ0VHVybkFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBkaXJlY3Rpb24pLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlNaW5lY2FydE1vdmVGb3J3YXJkQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG5leHRQb3NpdGlvbiwgc3BlZWQpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgICAgICAgICAgdGhpcy5wbGF5VHJhY2socG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbWluZWNhcnRUcmFjayk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucGxheU1pbmVjYXJ0TW92ZUZvcndhcmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbmV4dFBvc2l0aW9uLCBzcGVlZCkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGxheVRyYWNrKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG1pbmVjYXJ0VHJhY2spO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaSsrO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgdGhpcy5wbGF5U3VjY2Vzc0FuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGZ1bmN0aW9uKCl7fSk7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIGFkZEhvdXNlQmVkKGJvdHRvbUNvb3JkaW5hdGVzKSB7XG4gICAgLy9UZW1wb3JhcnksIHdpbGwgYmUgcmVwbGFjZWQgYnkgYmVkIGJsb2Nrc1xuICAgIHZhciBiZWRUb3BDb29yZGluYXRlID0gKGJvdHRvbUNvb3JkaW5hdGVzWzFdIC0gMSk7XG4gICAgdmFyIHNwcml0ZSA9IHRoaXMuYWN0aW9uUGxhbmUuY3JlYXRlKDM4ICogYm90dG9tQ29vcmRpbmF0ZXNbMF0sIDM1ICogYmVkVG9wQ29vcmRpbmF0ZSwgXCJiZWRcIik7XG4gICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoYm90dG9tQ29vcmRpbmF0ZXNbMV0pO1xuICB9XG5cbiAgYWRkRG9vcihjb29yZGluYXRlcykge1xuICAgIHZhciBzcHJpdGU7XG4gICAgbGV0IHRvRGVzdHJveSA9IHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoY29vcmRpbmF0ZXMpXTtcbiAgICB0aGlzLmNyZWF0ZUFjdGlvblBsYW5lQmxvY2soY29vcmRpbmF0ZXMsIFwiZG9vclwiKTtcbiAgICAvL05lZWQgdG8gZ3JhYiB0aGUgY29ycmVjdCBibG9ja3R5cGUgZnJvbSB0aGUgYWN0aW9uIGxheWVyXG4gICAgLy9BbmQgdXNlIHRoYXQgdHlwZSBibG9jayB0byBjcmVhdGUgdGhlIGdyb3VuZCBibG9jayB1bmRlciB0aGUgZG9vclxuICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgY29vcmRpbmF0ZXNbMF0sIGNvb3JkaW5hdGVzWzFdLCBcIndvb2xfb3JhbmdlXCIpO1xuICAgIHRvRGVzdHJveS5raWxsKCk7XG4gICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoNik7XG4gIH1cblxuICBwbGF5U3VjY2Vzc0hvdXNlQnVpbHRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjcmVhdGVGbG9vciwgaG91c2VPYmplY3RQb3NpdGlvbnMsIGNvbXBsZXRpb25IYW5kbGVyLCB1cGRhdGVTY3JlZW4pIHtcbiAgICAvL2ZhZGUgc2NyZWVuIHRvIHdoaXRlXG4gICAgLy9BZGQgaG91c2UgYmxvY2tzXG4gICAgLy9mYWRlIG91dCBvZiB3aGl0ZVxuICAgIC8vUGxheSBzdWNjZXNzIGFuaW1hdGlvbiBvbiBwbGF5ZXIuXG4gICAgdmFyIHR3ZWVuVG9XLFxuICAgICAgICB0d2VlbldUb0M7XG5cbiAgICB0d2VlblRvVyA9IHRoaXMucGxheUxldmVsRW5kQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgKCkgPT4ge1xuICAgICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoNDAwMCwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH0sIHRydWUpO1xuICAgIHR3ZWVuVG9XLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImhvdXNlU3VjY2Vzc1wiKTtcbiAgICAgIC8vQ2hhbmdlIGhvdXNlIGdyb3VuZCB0byBmbG9vclxuICAgICAgdmFyIHhDb29yZDtcbiAgICAgIHZhciB5Q29vcmQ7XG4gICAgICB2YXIgc3ByaXRlO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY3JlYXRlRmxvb3IubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgeENvb3JkID0gY3JlYXRlRmxvb3JbaV1bMV07XG4gICAgICAgIHlDb29yZCA9IGNyZWF0ZUZsb29yW2ldWzJdO1xuICAgICAgICAvKnRoaXMuZ3JvdW5kUGxhbmVbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoW3hDb29yZCx5Q29vcmRdKV0ua2lsbCgpOyovXG4gICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgeENvb3JkLCB5Q29vcmQsIFwid29vbF9vcmFuZ2VcIik7XG4gICAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHlDb29yZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWRkSG91c2VCZWQoaG91c2VPYmplY3RQb3NpdGlvbnNbMF0pO1xuICAgICAgdGhpcy5hZGREb29yKGhvdXNlT2JqZWN0UG9zaXRpb25zWzFdKTtcbiAgICAgIHRoaXMuZ3JvdW5kUGxhbmUuc29ydCgnc29ydE9yZGVyJyk7XG4gICAgICB1cGRhdGVTY3JlZW4oKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vVHdlZW5zIGluIGFuZCB0aGVuIG91dCBvZiB3aGl0ZS4gcmV0dXJucyB0aGUgdHdlZW4gdG8gd2hpdGUgZm9yIGFkZGluZyBjYWxsYmFja3NcbiAgcGxheUxldmVsRW5kQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIHBsYXlTdWNjZXNzQW5pbWF0aW9uKSB7XG4gICAgdmFyIHNwcml0ZSxcbiAgICAgICAgdHdlZW5Ub1csXG4gICAgICAgIHR3ZWVuV1RvQztcblxuICAgIHNwcml0ZSA9IHRoaXMuZmx1ZmZQbGFuZS5jcmVhdGUoMCwgMCwgXCJmaW5pc2hPdmVybGF5XCIpO1xuICAgIHZhciBbc2NhbGVYLCBzY2FsZVldID0gdGhpcy5jb250cm9sbGVyLnNjYWxlRnJvbU9yaWdpbmFsKCk7XG4gICAgc3ByaXRlLnNjYWxlLnggPSBzY2FsZVg7XG4gICAgc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVk7XG4gICAgc3ByaXRlLmFscGhhID0gMDtcblxuICAgIHR3ZWVuVG9XID0gdGhpcy50d2VlblRvV2hpdGUoc3ByaXRlKTtcbiAgICB0d2VlbldUb0MgPSB0aGlzLnR3ZWVuRnJvbVdoaXRlVG9DbGVhcihzcHJpdGUpO1xuXG4gICAgdHdlZW5Ub1cub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5zZXRQbGF5ZXJQb3NpdGlvbihwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIGlzT25CbG9jayk7XG4gICAgICB0d2VlbldUb0Muc3RhcnQoKTtcbiAgICB9KTtcbiAgICBpZihwbGF5U3VjY2Vzc0FuaW1hdGlvbilcbiAgICB7XG4gICAgICB0d2VlbldUb0Mub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICB0aGlzLnBsYXlTdWNjZXNzQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHR3ZWVuVG9XLnN0YXJ0KCk7XG5cbiAgICByZXR1cm4gdHdlZW5Ub1c7XG4gIH1cbiAgdHdlZW5Gcm9tV2hpdGVUb0NsZWFyKHNwcml0ZSkge1xuICAgIHZhciB0d2VlbldoaXRlVG9DbGVhcjtcblxuICAgIHR3ZWVuV2hpdGVUb0NsZWFyID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4oc3ByaXRlKS50byh7XG4gICAgICBhbHBoYTogMC4wLFxuICAgIH0sIDcwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG4gICAgcmV0dXJuIHR3ZWVuV2hpdGVUb0NsZWFyO1xuICB9XG5cbiAgdHdlZW5Ub1doaXRlKHNwcml0ZSl7XG4gICAgdmFyIHR3ZWVuVG9XaGl0ZTtcblxuICAgIHR3ZWVuVG9XaGl0ZSA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgYWxwaGE6IDEuMCxcbiAgICB9LCAzMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuICAgIHJldHVybiB0d2VlblRvV2hpdGU7XG4gIH1cblxuICBwbGF5QmxvY2tTb3VuZChncm91bmRUeXBlKSB7XG4gICAgdmFyIG9yZVN0cmluZyA9IGdyb3VuZFR5cGUuc3Vic3RyaW5nKDAsIDMpO1xuICAgIGlmKGdyb3VuZFR5cGUgPT09IFwic3RvbmVcIiB8fCBncm91bmRUeXBlID09PSBcImNvYmJsZXN0b25lXCIgfHwgZ3JvdW5kVHlwZSA9PT0gXCJiZWRyb2NrXCIgfHxcbiAgICAgICAgb3JlU3RyaW5nID09PSBcIm9yZVwiIHx8IGdyb3VuZFR5cGUgPT09IFwiYnJpY2tzXCIpIHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN0ZXBTdG9uZVwiKTtcbiAgICB9XG4gICAgZWxzZSBpZihncm91bmRUeXBlID09PSBcImdyYXNzXCIgfHwgZ3JvdW5kVHlwZSA9PT0gXCJkaXJ0XCIgfHwgZ3JvdW5kVHlwZSA9PT0gXCJkaXJ0Q29hcnNlXCIgfHxcbiAgICAgICAgZ3JvdW5kVHlwZSA9PSBcIndvb2xfb3JhbmdlXCIgfHwgZ3JvdW5kVHlwZSA9PSBcIndvb2xcIikge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwic3RlcEdyYXNzXCIpO1xuICAgIH1cbiAgICBlbHNlIGlmKGdyb3VuZFR5cGUgPT09IFwiZ3JhdmVsXCIpIHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN0ZXBHcmF2ZWxcIik7XG4gICAgfVxuICAgIGVsc2UgaWYoZ3JvdW5kVHlwZSA9PT0gXCJmYXJtbGFuZFdldFwiKSB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdGVwRmFybWxhbmRcIik7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdGVwV29vZFwiKTtcbiAgICB9XG4gIH1cblxuICBwbGF5TW92ZUZvcndhcmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgc2hvdWxkSnVtcERvd24sIGlzT25CbG9jaywgZ3JvdW5kVHlwZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgdHdlZW4sXG4gICAgICAgIG9sZFBvc2l0aW9uLFxuICAgICAgICBuZXdQb3NWZWMsXG4gICAgICAgIGFuaW1OYW1lLFxuICAgICAgICB5T2Zmc2V0ID0gLTMyO1xuXG4gICAgLy9zdGVwcGluZyBvbiBzdG9uZSBzZnhcbiAgICB0aGlzLnBsYXlCbG9ja1NvdW5kKGdyb3VuZFR5cGUpO1xuXG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuXG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuICAgIC8vbWFrZSBzdXJlIHRvIHJlbmRlciBoaWdoIGZvciB3aGVuIG1vdmluZyB1cCBhZnRlciBwbGFjaW5nIGEgYmxvY2tcbiAgICB2YXIgek9yZGVyWUluZGV4ID0gcG9zaXRpb25bMV0gKyAoZmFjaW5nID09PSBGYWNpbmdEaXJlY3Rpb24uVXAgPyAxIDogMCk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleCh6T3JkZXJZSW5kZXgpICsgNTtcbiAgICBvbGRQb3NpdGlvbiA9IFtNYXRoLnRydW5jKCh0aGlzLnBsYXllclNwcml0ZS5wb3NpdGlvbi54ICsgMTgpLyA0MCksIE1hdGguY2VpbCgodGhpcy5wbGF5ZXJTcHJpdGUucG9zaXRpb24ueSsgMzIpIC8gNDApXTtcbiAgICBuZXdQb3NWZWMgPSBbcG9zaXRpb25bMF0gLSBvbGRQb3NpdGlvblswXSwgcG9zaXRpb25bMV0gLSBvbGRQb3NpdGlvblsxXV07XG5cbiAgICAvL2NoYW5nZSBvZmZzZXQgZm9yIG1vdmluZyBvbiB0b3Agb2YgYmxvY2tzXG4gICAgaWYoaXNPbkJsb2NrKSB7XG4gICAgICB5T2Zmc2V0IC09IDIyO1xuICAgIH1cblxuICAgIGlmICghc2hvdWxkSnVtcERvd24pIHtcbiAgICAgIGFuaW1OYW1lID0gXCJ3YWxrXCIgKyBkaXJlY3Rpb247XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltTmFtZSk7XG4gICAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMucGxheWVyU3ByaXRlKS50byh7XG4gICAgICAgIHg6ICgtMTggKyA0MCAqIHBvc2l0aW9uWzBdKSxcbiAgICAgICAgeTogKHlPZmZzZXQgKyA0MCAqIHBvc2l0aW9uWzFdKVxuICAgICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5pbU5hbWUgPSBcImp1bXBEb3duXCIgKyBkaXJlY3Rpb247XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltTmFtZSk7XG4gICAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMucGxheWVyU3ByaXRlKS50byh7XG4gICAgICAgIHg6IFstMTggKyA0MCAqIG9sZFBvc2l0aW9uWzBdLCAtMTggKyA0MCAqIChvbGRQb3NpdGlvblswXSArIG5ld1Bvc1ZlY1swXSksIC0xOCArIDQwICogcG9zaXRpb25bMF1dLFxuICAgICAgICB5OiBbLTMyICsgNDAgKiBvbGRQb3NpdGlvblsxXSwgLTMyICsgNDAgKiAob2xkUG9zaXRpb25bMV0gKyBuZXdQb3NWZWNbMV0pIC0gNTAsIC0zMiArIDQwICogcG9zaXRpb25bMV1dXG4gICAgICB9LCAzMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpLmludGVycG9sYXRpb24oKHYsaykgPT4ge1xuICAgICAgICByZXR1cm4gUGhhc2VyLk1hdGguYmV6aWVySW50ZXJwb2xhdGlvbih2LGspO1xuICAgICAgfSk7XG5cbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZmFsbFwiKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG5cbiAgICB0d2Vlbi5zdGFydCgpO1xuXG4gICAgcmV0dXJuIHR3ZWVuO1xuICB9XG5cbiAgcGxheVBsYXllckp1bXBEb3duVmVydGljYWxBbmltYXRpb24ocG9zaXRpb24sIGRpcmVjdGlvbikge1xuICAgIHZhciBhbmltTmFtZSA9IFwianVtcERvd25cIiArIHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShkaXJlY3Rpb24pO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1OYW1lKTtcbiAgICB2YXIgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2Vlbih0aGlzLnBsYXllclNwcml0ZSkudG8oe1xuICAgICAgeDogWy0xOCArIDQwICogcG9zaXRpb25bMF0sIC0xOCArIDQwICogcG9zaXRpb25bMF0sIC0xOCArIDQwICogcG9zaXRpb25bMF1dLFxuICAgICAgeTogWy0zMiArIDQwICogcG9zaXRpb25bMV0sIC0zMiArIDQwICogcG9zaXRpb25bMV0gLSA1MCwgLTMyICsgNDAgKiBwb3NpdGlvblsxXV1cbiAgICB9LCAzMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpLmludGVycG9sYXRpb24oKHYsaykgPT4ge1xuICAgICAgcmV0dXJuIFBoYXNlci5NYXRoLmJlemllckludGVycG9sYXRpb24odixrKTtcbiAgICB9KTtcbiAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZE9uY2UoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZmFsbFwiKTtcbiAgICB9KTtcbiAgICB0d2Vlbi5zdGFydCgpO1xuICB9XG5cbiAgcGxheVBsYWNlQmxvY2tBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgYmxvY2tUeXBlLCBibG9ja1R5cGVBdFBvc2l0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBqdW1wQW5pbU5hbWU7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIHBvc2l0aW9uWzBdO1xuXG4gICAgaWYgKGJsb2NrVHlwZSA9PT0gXCJjcm9wV2hlYXRcIiB8fCBibG9ja1R5cGUgPT09IFwidG9yY2hcIiB8fCBibG9ja1R5cGUuc3Vic3RyaW5nKDAsIDUpID09PSBcInJhaWxzXCIpIHtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcblxuICAgICAgdmFyIHNpZ25hbERldGFjaGVyID0gdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwicHVuY2hcIiwgcG9zaXRpb24sIGZhY2luZywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgdmFyIHNwcml0ZTtcbiAgICAgICAgc2lnbmFsRGV0YWNoZXIuZGV0YWNoKCk7XG4gICAgICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pKSArIHBvc2l0aW9uWzBdO1xuICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgYmxvY2tUeXBlKTtcblxuICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XSA9IHNwcml0ZTtcbiAgICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJwbGFjZUJsb2NrXCIpO1xuXG4gICAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG5cbiAgICAgIGp1bXBBbmltTmFtZSA9IFwianVtcFVwXCIgKyBkaXJlY3Rpb247XG5cbiAgICAgIGlmKGJsb2NrVHlwZUF0UG9zaXRpb24gIT09IFwiXCIpIHtcbiAgICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIHBvc2l0aW9uLCBibG9ja1R5cGVBdFBvc2l0aW9uLCAoKCk9Pnt9KSwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBqdW1wQW5pbU5hbWUpO1xuICAgICAgdmFyIHBsYWNlbWVudFR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5wbGF5ZXJTcHJpdGUpLnRvKHtcbiAgICAgICAgeTogKC01NSArIDQwICogcG9zaXRpb25bMV0pXG4gICAgICB9LCAxMjUsIFBoYXNlci5FYXNpbmcuQ3ViaWMuRWFzZU91dCk7XG5cbiAgICAgIHBsYWNlbWVudFR3ZWVuLm9uQ29tcGxldGUuYWRkT25jZSgoKSA9PiB7XG4gICAgICAgIHBsYWNlbWVudFR3ZWVuID0gbnVsbDtcblxuICAgICAgICBpZiAoYmxvY2tUeXBlQXRQb3NpdGlvbiAhPT0gXCJcIikge1xuICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF0ua2lsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgYmxvY2tUeXBlKTtcblxuICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XSA9IHNwcml0ZTtcbiAgICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgICAgcGxhY2VtZW50VHdlZW4uc3RhcnQoKTtcbiAgICB9XG4gIH1cblxuICBwbGF5UGxhY2VCbG9ja0luRnJvbnRBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgYmxvY2tQb3NpdGlvbiwgcGxhbmUsIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKGJsb2NrUG9zaXRpb25bMF0sIGJsb2NrUG9zaXRpb25bMV0pO1xuXG4gICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwicHVuY2hcIiwgcGxheWVyUG9zaXRpb24sIGZhY2luZywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIGlmIChwbGFuZSA9PT0gdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwuYWN0aW9uUGxhbmUpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVBY3Rpb25QbGFuZUJsb2NrKGJsb2NrUG9zaXRpb24sIGJsb2NrVHlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZS1sYXkgZ3JvdW5kIHRpbGVzIGJhc2VkIG9uIG1vZGVsXG4gICAgICAgIHRoaXMucmVmcmVzaEdyb3VuZFBsYW5lKCk7XG4gICAgICB9XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgY3JlYXRlQWN0aW9uUGxhbmVCbG9jayhwb3NpdGlvbiwgYmxvY2tUeXBlKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleChwb3NpdGlvblsxXSkpICsgcG9zaXRpb25bMF07XG4gICAgdmFyIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5hY3Rpb25QbGFuZSwgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBibG9ja1R5cGUpO1xuXG4gICAgaWYgKHNwcml0ZSkge1xuICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF0gPSBzcHJpdGU7XG4gIH1cblxuICBwbGF5U2hlYXJBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyBkZXN0cm95UG9zaXRpb25bMF07XG4gICAgbGV0IGJsb2NrVG9TaGVhciA9IHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF07XG5cbiAgICBibG9ja1RvU2hlYXIuYW5pbWF0aW9ucy5zdG9wKG51bGwsIHRydWUpO1xuICAgIHRoaXMub25BbmltYXRpb25Mb29wT25jZSh0aGlzLnBsYXlTY2FsZWRTcGVlZChibG9ja1RvU2hlYXIuYW5pbWF0aW9ucywgXCJ1c2VkXCIpLCAoKSA9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChibG9ja1RvU2hlYXIuYW5pbWF0aW9ucywgXCJmYWNlXCIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlciwgdHJ1ZSk7XG4gIH1cblxuICBwbGF5U2hlYXJTaGVlcEFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihkZXN0cm95UG9zaXRpb25bMF0sIGRlc3Ryb3lQb3NpdGlvblsxXSk7XG5cbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcInB1bmNoXCIsIHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKSwgKCkgPT4ge1xuICAgICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pKSArIGRlc3Ryb3lQb3NpdGlvblswXTtcbiAgICAgIGxldCBibG9ja1RvU2hlYXIgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdO1xuXG4gICAgICBibG9ja1RvU2hlYXIuYW5pbWF0aW9ucy5zdG9wKG51bGwsIHRydWUpO1xuICAgICAgdGhpcy5vbkFuaW1hdGlvbkxvb3BPbmNlKHRoaXMucGxheVNjYWxlZFNwZWVkKGJsb2NrVG9TaGVhci5hbmltYXRpb25zLCBcInVzZWRcIiksICgpID0+IHtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMsIFwiZmFjZVwiKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnBsYXlFeHBsb3Npb25BbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyLCB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlEZXN0cm95QmxvY2tBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIG5ld1NoYWRpbmdQbGFuZURhdGEsIG5ld0Zvd1BsYW5lRGF0YSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKGRlc3Ryb3lQb3NpdGlvblswXSwgZGVzdHJveVBvc2l0aW9uWzFdKTtcblxuICAgIHZhciBwbGF5ZXJBbmltYXRpb24gPVxuICAgICAgICBibG9ja1R5cGUubWF0Y2goLyhvcmV8c3RvbmV8Y2xheXxicmlja3N8YmVkcm9jaykvKSA/IFwibWluZVwiIDogXCJwdW5jaERlc3Ryb3lcIjtcbiAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24ocGxheWVyQW5pbWF0aW9uLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5TWluaW5nUGFydGljbGVzQW5pbWF0aW9uKGZhY2luZywgZGVzdHJveVBvc2l0aW9uKTtcbiAgICB0aGlzLnBsYXlCbG9ja0Rlc3Ryb3lPdmVybGF5QW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBuZXdTaGFkaW5nUGxhbmVEYXRhLCBuZXdGb3dQbGFuZURhdGEsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgfVxuXG5cbiAgcGxheVB1bmNoRGVzdHJveUFpckFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5wbGF5UHVuY2hBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBcInB1bmNoRGVzdHJveVwiLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gIH1cblxuICBwbGF5UHVuY2hBaXJBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMucGxheVB1bmNoQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgXCJwdW5jaFwiLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gIH1cblxuICBwbGF5UHVuY2hBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBhbmltYXRpb25UeXBlLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24oZGVzdHJveVBvc2l0aW9uWzBdLCBkZXN0cm95UG9zaXRpb25bMV0pO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQodGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKGFuaW1hdGlvblR5cGUsIHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKSwgKCkgPT4ge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlCbG9ja0Rlc3Ryb3lPdmVybGF5QW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBuZXdTaGFkaW5nUGxhbmVEYXRhLCBuZXdGb3dQbGFuZURhdGEsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pKSArIGRlc3Ryb3lQb3NpdGlvblswXTtcbiAgICBsZXQgYmxvY2tUb0Rlc3Ryb3kgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdO1xuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcblxuICAgIGxldCBkZXN0cm95T3ZlcmxheSA9IHRoaXMuYWN0aW9uUGxhbmUuY3JlYXRlKC0xMiArIDQwICogZGVzdHJveVBvc2l0aW9uWzBdLCAtMjIgKyA0MCAqIGRlc3Ryb3lQb3NpdGlvblsxXSwgXCJkZXN0cm95T3ZlcmxheVwiLCBcImRlc3Ryb3kxXCIpO1xuICAgIGRlc3Ryb3lPdmVybGF5LnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSArIDI7XG4gICAgdGhpcy5vbkFuaW1hdGlvbkVuZChkZXN0cm95T3ZlcmxheS5hbmltYXRpb25zLmFkZChcImRlc3Ryb3lcIiwgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJkZXN0cm95XCIsIDEsIDEyLCBcIlwiLCAwKSwgMzAsIGZhbHNlKSwgKCkgPT5cbiAgICB7XG4gICAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdID0gbnVsbDtcblxuICAgICAgaWYgKGJsb2NrVG9EZXN0cm95Lmhhc093blByb3BlcnR5KFwib25CbG9ja0Rlc3Ryb3lcIikpIHtcbiAgICAgICAgYmxvY2tUb0Rlc3Ryb3kub25CbG9ja0Rlc3Ryb3koYmxvY2tUb0Rlc3Ryb3kpO1xuICAgICAgfVxuXG4gICAgICBibG9ja1RvRGVzdHJveS5raWxsKCk7XG4gICAgICBkZXN0cm95T3ZlcmxheS5raWxsKCk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGJsb2NrVG9EZXN0cm95KTtcbiAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goZGVzdHJveU92ZXJsYXkpO1xuICAgICAgdGhpcy51cGRhdGVTaGFkaW5nUGxhbmUobmV3U2hhZGluZ1BsYW5lRGF0YSk7XG4gICAgICB0aGlzLnVwZGF0ZUZvd1BsYW5lKG5ld0Zvd1BsYW5lRGF0YSk7XG5cbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocGxheWVyUG9zaXRpb25bMF0sIHBsYXllclBvc2l0aW9uWzFdKTtcblxuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KCdkaWdfd29vZDEnKTtcbiAgICAgIHRoaXMucGxheUV4cGxvc2lvbkFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoZGVzdHJveU92ZXJsYXkuYW5pbWF0aW9ucywgXCJkZXN0cm95XCIpO1xuICB9XG5cbiAgcGxheU1pbmluZ1BhcnRpY2xlc0FuaW1hdGlvbihmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbikge1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXNEYXRhID0gW1xuICAgICAgWzI0LCAtMTAwLCAtODBdLCAgIC8vIGxlZnRcbiAgICAgIFsxMiwgLTEyMCwgLTgwXSwgICAvLyBib3R0b21cbiAgICAgIFswLCAtNjAsIC04MF0sICAgLy8gcmlnaHRcbiAgICAgIFszNiwgLTgwLCAtNjBdLCAgIC8vIHRvcFxuICAgIF07XG5cbiAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG4gICAgbGV0IG1pbmluZ1BhcnRpY2xlc0luZGV4ID0gKGRpcmVjdGlvbiA9PT0gXCJfbGVmdFwiID8gMCA6IGRpcmVjdGlvbiA9PT0gXCJfYm90dG9tXCIgPyAxIDogZGlyZWN0aW9uID09PSBcIl9yaWdodFwiID8gMiA6IDMpO1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXNGaXJzdEZyYW1lID0gbWluaW5nUGFydGljbGVzRGF0YVttaW5pbmdQYXJ0aWNsZXNJbmRleF1bMF07XG4gICAgbGV0IG1pbmluZ1BhcnRpY2xlc09mZnNldFggPSBtaW5pbmdQYXJ0aWNsZXNEYXRhW21pbmluZ1BhcnRpY2xlc0luZGV4XVsxXTtcbiAgICBsZXQgbWluaW5nUGFydGljbGVzT2Zmc2V0WSA9IG1pbmluZ1BhcnRpY2xlc0RhdGFbbWluaW5nUGFydGljbGVzSW5kZXhdWzJdO1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXMgPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZShtaW5pbmdQYXJ0aWNsZXNPZmZzZXRYICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMF0sIG1pbmluZ1BhcnRpY2xlc09mZnNldFkgKyA0MCAqIGRlc3Ryb3lQb3NpdGlvblsxXSwgXCJtaW5pbmdQYXJ0aWNsZXNcIiwgXCJNaW5pbmdQYXJ0aWNsZXNcIiArIG1pbmluZ1BhcnRpY2xlc0ZpcnN0RnJhbWUpO1xuICAgIG1pbmluZ1BhcnRpY2xlcy5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyAyO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQobWluaW5nUGFydGljbGVzLmFuaW1hdGlvbnMuYWRkKFwibWluaW5nUGFydGljbGVzXCIsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluaW5nUGFydGljbGVzXCIsIG1pbmluZ1BhcnRpY2xlc0ZpcnN0RnJhbWUsIG1pbmluZ1BhcnRpY2xlc0ZpcnN0RnJhbWUgKyAxMSwgXCJcIiwgMCksIDMwLCBmYWxzZSksICgpID0+IHtcbiAgICAgIG1pbmluZ1BhcnRpY2xlcy5raWxsKCk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKG1pbmluZ1BhcnRpY2xlcyk7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQobWluaW5nUGFydGljbGVzLmFuaW1hdGlvbnMsIFwibWluaW5nUGFydGljbGVzXCIpO1xuICB9XG5cbiAgcGxheUV4cGxvc2lvbkFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIsIHBsYWNlQmxvY2spIHtcbiAgICB2YXIgc2lnbmFsQmluZGluZyxcbiAgICAgICAgZXhwbG9kZUFuaW0gPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZSgtMzYgKyA0MCAqIGRlc3Ryb3lQb3NpdGlvblswXSwgLTMwICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMV0sIFwiYmxvY2tFeHBsb2RlXCIsIFwiQmxvY2tCcmVha1BhcnRpY2xlMFwiKTtcblxuICAgIC8vZXhwbG9kZUFuaW0udGludCA9IDB4MzI0YmZmO1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuY2FuVXNlVGludHMoKSkge1xuICAgICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgICAgY2FzZSBcImxvZ0FjYWNpYVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweDZjNjU1YTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgICBjYXNlIFwibG9nQmlyY2hcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHhkYWQ2Y2M7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICAgIGNhc2UgXCJsb2dKdW5nbGVcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg2YTRmMzE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICAgIGNhc2UgXCJsb2dPYWtcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg2NzUyMzE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ0cmVlU3BydWNlXCI6XG4gICAgICAgIGNhc2UgXCJsb2dTcHJ1Y2VcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg0YjM5MjM7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcInBsYW5rc0FjYWNpYVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweGJhNjMzNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBsYW5rc0JpcmNoXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4ZDdjYjhkO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGxhbmtzSnVuZ2xlXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4Yjg4NzY0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGxhbmtzT2FrXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4YjQ5MDVhO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGxhbmtzU3BydWNlXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4ODA1ZTM2O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwic3RvbmVcIjpcbiAgICAgICAgY2FzZSBcIm9yZUNvYWxcIjpcbiAgICAgICAgY2FzZSBcIm9yZURpYW1vbmRcIjpcbiAgICAgICAgY2FzZSBcIm9yZUlyb25cIjpcbiAgICAgICAgY2FzZSBcIm9yZUdvbGRcIjpcbiAgICAgICAgY2FzZSBcIm9yZUVtZXJhbGRcIjpcbiAgICAgICAgY2FzZSBcIm9yZVJlZHN0b25lXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4QzZDNkM2O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZ3Jhc3NcIjpcbiAgICAgICAgY2FzZSBcImNyb3BXaGVhdFwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweDVkOGYyMztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImRpcnRcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg4YTVlMzM7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHBsb2RlQW5pbS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyAyO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQoZXhwbG9kZUFuaW0uYW5pbWF0aW9ucy5hZGQoXCJleHBsb2RlXCIsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQmxvY2tCcmVha1BhcnRpY2xlXCIsIDAsIDcsIFwiXCIsIDApLCAzMCwgZmFsc2UpLCAoKSA9PlxuICAgIHtcbiAgICAgIGV4cGxvZGVBbmltLmtpbGwoKTtcbiAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goZXhwbG9kZUFuaW0pO1xuXG4gICAgICBpZihwbGFjZUJsb2NrKVxuICAgICAge1xuICAgICAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJpZGxlXCIsIHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5wbGF5SXRlbURyb3BBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChleHBsb2RlQW5pbS5hbmltYXRpb25zLCBcImV4cGxvZGVcIik7XG4gICAgaWYoIXBsYWNlQmxvY2spXG4gICAge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9XG4gIH1cblxuICBwbGF5SXRlbURyb3BBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHNwcml0ZSA9IHRoaXMuY3JlYXRlTWluaUJsb2NrKGRlc3Ryb3lQb3NpdGlvblswXSwgZGVzdHJveVBvc2l0aW9uWzFdLCBibG9ja1R5cGUpO1xuICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyAyO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQodGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiYW5pbWF0ZVwiKSwgKCkgPT4ge1xuICAgICAgdGhpcy5wbGF5SXRlbUFjcXVpcmVBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIHNwcml0ZSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgcGxheVNjYWxlZFNwZWVkKGFuaW1hdGlvbk1hbmFnZXIsIG5hbWUpIHtcbiAgICB2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uTWFuYWdlci5nZXRBbmltYXRpb24obmFtZSk7XG4gICAgaWYgKCFhbmltYXRpb24ub3JpZ2luYWxGcHMpIHtcbiAgICAgIGFuaW1hdGlvbi5vcmlnaW5hbEZwcyA9IDEwMDAgLyBhbmltYXRpb24uZGVsYXk7XG4gICAgfVxuICAgIHJldHVybiBhbmltYXRpb25NYW5hZ2VyLnBsYXkobmFtZSwgdGhpcy5jb250cm9sbGVyLm9yaWdpbmFsRnBzVG9TY2FsZWQoYW5pbWF0aW9uLm9yaWdpbmFsRnBzKSk7XG4gIH1cblxuICBwbGF5SXRlbUFjcXVpcmVBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIHNwcml0ZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgdHdlZW47XG5cbiAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgeDogKC0xOCArIDQwICogcGxheWVyUG9zaXRpb25bMF0pLFxuICAgICAgeTogKC0zMiArIDQwICogcGxheWVyUG9zaXRpb25bMV0pXG4gICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcblxuICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImNvbGxlY3RlZEJsb2NrXCIpO1xuICAgICAgc3ByaXRlLmtpbGwoKTtcbiAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goc3ByaXRlKTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG5cbiAgICB0d2Vlbi5zdGFydCgpO1xuICB9XG5cbiAgc2V0UGxheWVyUG9zaXRpb24oeCwgeSwgaXNPbkJsb2NrKSB7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUueCA9IC0xOCArIDQwICogeDtcbiAgICB0aGlzLnBsYXllclNwcml0ZS55ID0gLTMyICsgKGlzT25CbG9jayA/IC0yMyA6IDApICsgNDAgKiB5O1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoeSkgKyA1O1xuICB9XG5cbiAgc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24oeCwgeSkge1xuICAgIHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yLnggPSAtMzUgKyAyMyArIDQwICogeDtcbiAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvci55ID0gLTU1ICsgNDMgKyA0MCAqIHk7XG4gIH1cblxuICBjcmVhdGVQbGFuZXMoKSB7XG4gICAgdGhpcy5ncm91bmRQbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmdyb3VuZFBsYW5lLnlPZmZzZXQgPSAtMjtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZS55T2Zmc2V0ID0gLTI7XG4gICAgdGhpcy5hY3Rpb25QbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmFjdGlvblBsYW5lLnlPZmZzZXQgPSAtMjI7XG4gICAgdGhpcy5mbHVmZlBsYW5lID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuZmx1ZmZQbGFuZS55T2Zmc2V0ID0gLTE2MDtcbiAgICB0aGlzLmZvd1BsYW5lID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuZm93UGxhbmUueU9mZnNldCA9IDA7XG4gIH1cblxuICByZXNldFBsYW5lcyhsZXZlbERhdGEpIHtcbiAgICB2YXIgc3ByaXRlLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICBpLFxuICAgICAgICBibG9ja1R5cGUsXG4gICAgICAgIGZyYW1lTGlzdDtcblxuICAgIHRoaXMuZ3JvdW5kUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIHRoaXMuYWN0aW9uUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIHRoaXMuZmx1ZmZQbGFuZS5yZW1vdmVBbGwodHJ1ZSk7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIHRoaXMuZm93UGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuXG4gICAgdGhpcy5iYXNlU2hhZGluZyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgIGZvciAodmFyIHNoYWRlWCA9IDA7IHNoYWRlWCA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lV2lkdGggKiA0MDsgc2hhZGVYICs9IDQwMCkge1xuICAgICAgZm9yICh2YXIgc2hhZGVZID0gMDsgc2hhZGVZIDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVIZWlnaHQgKiA0MDsgc2hhZGVZICs9IDQwMCkge1xuICAgICAgICB0aGlzLmJhc2VTaGFkaW5nLmNyZWF0ZShzaGFkZVgsIHNoYWRlWSwgJ3NoYWRlTGF5ZXInKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlZnJlc2hHcm91bmRQbGFuZSgpO1xuXG4gICAgdGhpcy5hY3Rpb25QbGFuZUJsb2NrcyA9IFtdO1xuICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICBmb3IgKHggPSAwOyB4IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoeSkpICsgeDtcbiAgICAgICAgc3ByaXRlID0gbnVsbDtcblxuICAgICAgICBpZiAoIWxldmVsRGF0YS5ncm91bmREZWNvcmF0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSkge1xuICAgICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5hY3Rpb25QbGFuZSwgeCwgeSwgbGV2ZWxEYXRhLmdyb3VuZERlY29yYXRpb25QbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUpO1xuICAgICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNwcml0ZSA9IG51bGw7XG4gICAgICAgIGlmICghbGV2ZWxEYXRhLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkpIHtcbiAgICAgICAgICBibG9ja1R5cGUgPSBsZXZlbERhdGEuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlO1xuICAgICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5hY3Rpb25QbGFuZSwgeCwgeSwgYmxvY2tUeXBlKTtcbiAgICAgICAgICBpZiAoc3ByaXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleCh5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzLnB1c2goc3ByaXRlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICBsZXQgYmxvY2tJbmRleCA9ICh0aGlzLnlUb0luZGV4KHkpKSArIHg7XG4gICAgICAgIGlmICghbGV2ZWxEYXRhLmZsdWZmUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSkge1xuICAgICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5mbHVmZlBsYW5lLCB4LCB5LCBsZXZlbERhdGEuZmx1ZmZQbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVmcmVzaEdyb3VuZFBsYW5lKCkge1xuICAgIHRoaXMuZ3JvdW5kUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleCh5KSkgKyB4O1xuICAgICAgICB2YXIgc3ByaXRlID0gdGhpcy5jcmVhdGVCbG9jayh0aGlzLmdyb3VuZFBsYW5lLCB4LCB5LCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5ncm91bmRQbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUpO1xuICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVTaGFkaW5nUGxhbmUoc2hhZGluZ0RhdGEpIHtcbiAgICB2YXIgaW5kZXgsIHNoYWRvd0l0ZW0sIHN4LCBzeSwgYXRsYXM7XG5cbiAgICB0aGlzLnNoYWRpbmdQbGFuZS5yZW1vdmVBbGwoKTtcblxuICAgIHRoaXMuc2hhZGluZ1BsYW5lLmFkZCh0aGlzLmJhc2VTaGFkaW5nKTtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZS5hZGQodGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IpO1xuXG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgc2hhZGluZ0RhdGEubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICBzaGFkb3dJdGVtID0gc2hhZGluZ0RhdGFbaW5kZXhdO1xuXG4gICAgICBhdGxhcyA9IFwiQU9cIjtcbiAgICAgIHN4ID0gNDAgKiBzaGFkb3dJdGVtLng7XG4gICAgICBzeSA9IC0yMiArIDQwICogc2hhZG93SXRlbS55O1xuXG4gICAgICBzd2l0Y2ggKHNoYWRvd0l0ZW0udHlwZSkge1xuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfTGVmdFwiOlxuICAgICAgICAgIHN4ICs9IDI2O1xuICAgICAgICAgIHN5ICs9IDIyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9SaWdodFwiOlxuICAgICAgICAgIHN4ICs9IDA7XG4gICAgICAgICAgc3kgKz0gMjI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X0JvdHRvbVwiOlxuICAgICAgICAgIHN4ICs9IDA7XG4gICAgICAgICAgc3kgKz0gMjI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X0JvdHRvbUxlZnRcIjpcbiAgICAgICAgICBzeCArPSAyNTtcbiAgICAgICAgICBzeSArPSAyMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfQm90dG9tUmlnaHRcIjpcbiAgICAgICAgICBzeCArPSAwO1xuICAgICAgICAgIHN5ICs9IDIyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Ub3BcIjpcbiAgICAgICAgICBzeCArPSAwO1xuICAgICAgICAgIHN5ICs9IDQ3O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Ub3BMZWZ0XCI6XG4gICAgICAgICAgc3ggKz0gMjU7XG4gICAgICAgICAgc3kgKz0gNDc7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X1RvcFJpZ2h0XCI6XG4gICAgICAgICAgc3ggKz0gMDtcbiAgICAgICAgICBzeSArPSA0NztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiU2hhZG93X1BhcnRzX0ZhZGVfYmFzZS5wbmdcIjpcbiAgICAgICAgICBhdGxhcyA9IFwiYmxvY2tTaGFkb3dzXCI7XG4gICAgICAgICAgc3ggLT0gNTI7XG4gICAgICAgICAgc3kgKz0gMDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiU2hhZG93X1BhcnRzX0ZhZGVfdG9wLnBuZ1wiOlxuICAgICAgICAgIGF0bGFzID0gXCJibG9ja1NoYWRvd3NcIjtcbiAgICAgICAgICBzeCAtPSA1MjtcbiAgICAgICAgICBzeSArPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNoYWRpbmdQbGFuZS5jcmVhdGUoc3gsIHN5LCBhdGxhcywgc2hhZG93SXRlbS50eXBlKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVGb3dQbGFuZShmb3dEYXRhKSB7XG4gICAgdmFyIGluZGV4LCBmeCwgZnksIGF0bGFzO1xuXG4gICAgdGhpcy5mb3dQbGFuZS5yZW1vdmVBbGwoKTtcblxuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGZvd0RhdGEubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICBsZXQgZm93SXRlbSA9IGZvd0RhdGFbaW5kZXhdO1xuXG4gICAgICBpZiAoZm93SXRlbSAhPT0gXCJcIikge1xuICAgICAgICBhdGxhcyA9IFwidW5kZXJncm91bmRGb3dcIjtcbiAgICAgICAgZnggPSAtNDAgKyA0MCAqIGZvd0l0ZW0ueDtcbiAgICAgICAgZnkgPSAtNDAgKyA0MCAqIGZvd0l0ZW0ueTtcblxuICAgICAgICBzd2l0Y2ggKGZvd0l0ZW0udHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJGb2dPZldhcl9DZW50ZXJcIjpcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mb3dQbGFuZS5jcmVhdGUoZngsIGZ5LCBhdGxhcywgZm93SXRlbS50eXBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwbGF5UmFuZG9tUGxheWVySWRsZShmYWNpbmcpIHtcbiAgICB2YXIgZmFjaW5nTmFtZSxcbiAgICAgICAgcmFuZCxcbiAgICAgICAgYW5pbWF0aW9uTmFtZTtcblxuICAgIGZhY2luZ05hbWUgPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcbiAgICByYW5kID0gTWF0aC50cnVuYyhNYXRoLnJhbmRvbSgpICogNCkgKyAxO1xuXG4gICAgc3dpdGNoKHJhbmQpXG4gICAge1xuICAgICAgY2FzZSAxOlxuICAgICAgYW5pbWF0aW9uTmFtZSA9IFwiaWRsZVwiO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICBhbmltYXRpb25OYW1lID0gXCJsb29rTGVmdFwiO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICBhbmltYXRpb25OYW1lID0gXCJsb29rUmlnaHRcIjtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgYW5pbWF0aW9uTmFtZSA9IFwibG9va0F0Q2FtXCI7XG4gICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuXG4gICAgYW5pbWF0aW9uTmFtZSArPSBmYWNpbmdOYW1lO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1hdGlvbk5hbWUpO1xuICB9XG5cbiAgZ2VuZXJhdGVQbGF5ZXJDZWxlYnJhdGVGcmFtZXMoKSB7XG4gICAgdmFyIGZyYW1lTGlzdCA9IFtdLFxuICAgICAgICBpO1xuXG4gICAgLy9Dcm91Y2ggRG93blxuICAgLyogZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjksIDMyLCBcIlwiLCAzKSk7XG4gICAgLy9Dcm91Y2ggRG93blxuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI5LCAzMiwgXCJcIiwgMykpO1xuICAgIC8vdHVybiBhbmQgcGF1c2VcbiAgICBmb3IgKGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wNjFcIik7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCAyOyArK2kpIHtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzE0OVwiKTtcbiAgICB9XG4gICAgICAgIC8vQ3JvdWNoIFVwXG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTQ5LCAxNTIsIFwiXCIsIDMpKTtcbiAgICAvL0Nyb3VjaCBVcFxuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE0OSwgMTUyLCBcIlwiLCAzKSk7Ki9cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9BbHRlcm5hdGl2ZSBBbmltYXRpb24vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvL0ZhY2UgRG93blxuICAgICBmb3IgKGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgfVxuICAgIC8vQ3JvdWNoIExlZnRcbiAgICAvL2ZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIwOSwgMjEyLCBcIlwiLCAzKSk7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMDlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMDlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMTFcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMTFcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMTFcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMTFcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMDlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMDlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yMDlcIik7XG4gICAgLy9Dcm91Y2ggTGVmdFxuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjExXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjExXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjExXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjExXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjA5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjA5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjA5XCIpO1xuICAgIC8vQ3JvdWNoIFJpZ2h0XG4gICAgLy9mcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA4OSwgOTIsIFwiXCIsIDMpKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA4OVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA4OVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA5MVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA5MVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA5MVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA5MVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA4OVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA4OVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA4OVwiKTtcbiAgICAvL0Nyb3VjaCBSaWdodFxuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDkxXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDkxXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDkxXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDkxXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDg5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDg5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDg5XCIpO1xuICAgIC8vRmFjZSBEb3duIChmb3IgcGF1c2UpXG4gICAgIGZvciAoaSA9IDA7IGkgPCAzOyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICB9XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vSnVtcCBzdWNjZXNzXG4gICAgLypmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyODUsIDI5NiwgXCJcIiwgMykpO1xuICAgIC8vZnJvbGljayBjZWxlYnJhdGVcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAzNywgNDQsIFwiXCIsIDMpKTsqL1xuICAgIC8vbG9vayBhdCBjYW1cbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyNjMsIDI2MiwgXCJcIiwgMykpO1xuICAgIGZvciAoaSA9IDA7IGkgPCA1OyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI2MlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1lTGlzdDtcbiAgfVxuXG4gIGdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KGZyYW1lTmFtZSwgc3RhcnRGcmFtZSwgZW5kRnJhbWUsIGVuZEZyYW1lRnVsbE5hbWUsIGJ1ZmZlciwgZnJhbWVEZWxheSkge1xuICAgIHZhciBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhmcmFtZU5hbWUsIHN0YXJ0RnJhbWUsIGVuZEZyYW1lLCBcIlwiLCBidWZmZXIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZnJhbWVEZWxheTsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChlbmRGcmFtZUZ1bGxOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1lTGlzdDtcbiAgfVxuXG4gIHByZXBhcmVQbGF5ZXJTcHJpdGUocGxheWVyTmFtZSkge1xuICAgIHZhciBmcmFtZUxpc3QsXG4gICAgICAgIGdlbkZyYW1lcyxcbiAgICAgICAgaSxcbiAgICAgICAgc2luZ2xlUHVuY2gsXG4gICAgICAgIGp1bXBDZWxlYnJhdGVGcmFtZXMsXG4gICAgICAgIGlkbGVGcmFtZVJhdGUgPSAxMDtcblxuICAgIGxldCBmcmFtZVJhdGUgPSAyMDtcblxuICAgIHRoaXMucGxheWVyU3ByaXRlID0gdGhpcy5hY3Rpb25QbGFuZS5jcmVhdGUoMCwgMCwgYHBsYXllciR7cGxheWVyTmFtZX1gLCAnUGxheWVyXzEyMScpO1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuZm9sbG93aW5nUGxheWVyKCkpIHtcbiAgICAgIHRoaXMuZ2FtZS5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyU3ByaXRlKTtcbiAgICB9XG4gICAgdGhpcy5wbGF5ZXJHaG9zdCA9IHRoaXMuZmx1ZmZQbGFuZS5jcmVhdGUoMCwgMCwgYHBsYXllciR7cGxheWVyTmFtZX1gLCAnUGxheWVyXzEyMScpO1xuICAgIHRoaXMucGxheWVyR2hvc3QucGFyZW50ID0gdGhpcy5wbGF5ZXJTcHJpdGU7XG4gICAgdGhpcy5wbGF5ZXJHaG9zdC5hbHBoYSA9IDAuMjtcblxuICAgIHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yID0gdGhpcy5zaGFkaW5nUGxhbmUuY3JlYXRlKDI0LCA0NCwgJ3NlbGVjdGlvbkluZGljYXRvcicpO1xuXG4gICAganVtcENlbGVicmF0ZUZyYW1lcyA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyODUsIDI5NiwgXCJcIiwgMyk7XG5cbiAgICBmcmFtZUxpc3QgPSBbXTtcblxuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDNcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwN1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDlcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDA3XCIpO1xuICAgIGZvciAoaSA9IDA7IGkgPCA1OyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZV9kb3duJywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5Eb3duKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCA2LCA1LCBcIlBsYXllcl8wMDVcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDA2XCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rTGVmdF9kb3duJywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9kb3duXCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDEyLCAxMSwgXCJQbGF5ZXJfMDExXCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAxMlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va1JpZ2h0X2Rvd24nLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX2Rvd25cIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMjYzLCAyNjIsIFwiUGxheWVyXzI2MlwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNjNcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tBdENhbV9kb3duJywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9kb3duXCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCAxMzsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgfVxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdpZGxlUGF1c2VfZG93bicsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uRG93bik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnd2Fsa19kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDEzLCBmcmFtZVJhdGUsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHNpbmdsZVB1bmNoID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIxLCAyNCwgXCJcIiwgMyk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoX2Rvd24nLCBzaW5nbGVQdW5jaCwgZnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwicHVuY2hcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoRGVzdHJveV9kb3duJywgc2luZ2xlUHVuY2guY29uY2F0KHNpbmdsZVB1bmNoKS5jb25jYXQoc2luZ2xlUHVuY2gpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaHVydF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI1LCAyOCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2Nyb3VjaF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI5LCAzMiwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBVcF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDMzLCAzNiwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdmYWlsX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgNDUsIDQ4LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2NlbGVicmF0ZV9kb3duJywgdGhpcy5nZW5lcmF0ZVBsYXllckNlbGVicmF0ZUZyYW1lcygpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2J1bXBfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA0OSwgNTQsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIGZhbHNlKS5vblN0YXJ0LmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJidW1wXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wRG93bl9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDU1LCA2MCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyNDEsIDI0NCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCA1LCA1LCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X3R1cm5sZWZ0X2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCA2LCA2LCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X3R1cm5yaWdodF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgMTIsIDEyLCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG5cbiAgICBmcmFtZUxpc3QgPSBbXTtcblxuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2MVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjNcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDYxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2N1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjlcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDY3XCIpO1xuICAgIGZvciAoaSA9IDA7IGkgPCA1OyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2MVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZV9yaWdodCcsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uUmlnaHQpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDY2LCA2NSwgXCJQbGF5ZXJfMDY1XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2NlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0xlZnRfcmlnaHQnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX3JpZ2h0XCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDcyLCA3MSwgXCJQbGF5ZXJfMDcxXCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA3MlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va1JpZ2h0X3JpZ2h0JyxmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX3JpZ2h0XCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDI3MCwgMjY5LCBcIlBsYXllcl8yNjlcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjcwXCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rQXRDYW1fcmlnaHQnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX3JpZ2h0XCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCAxMzsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjFcIik7XG4gICAgfVxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdpZGxlUGF1c2VfcmlnaHQnLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLlJpZ2h0KTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCd3YWxrX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDczLCA4MCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgc2luZ2xlUHVuY2ggPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgODEsIDg0LCBcIlwiLCAzKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hfcmlnaHQnLCBzaW5nbGVQdW5jaCwgZnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwicHVuY2hcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoRGVzdHJveV9yaWdodCcsIHNpbmdsZVB1bmNoLmNvbmNhdChzaW5nbGVQdW5jaCkuY29uY2F0KHNpbmdsZVB1bmNoKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2h1cnRfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgODUsIDg4LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY3JvdWNoX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDg5LCA5MiwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBVcF9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA5MywgOTYsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnZmFpbF9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxMDUsIDEwOCwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY2VsZWJyYXRlX3JpZ2h0JywgdGhpcy5nZW5lcmF0ZVBsYXllckNlbGVicmF0ZUZyYW1lcygpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2J1bXBfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTA5LCAxMTQsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIGZhbHNlKS5vblN0YXJ0LmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJidW1wXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wRG93bl9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxMTUsIDEyMCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjQ1LCAyNDgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDcsIDcsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcblxuICAgIGZyYW1lTGlzdCA9IFtdO1xuXG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTgxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4M1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTg3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4OVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODdcIik7XG4gICAgZm9yIChpID0gMDsgaSA8IDU7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTgxXCIpO1xuICAgIH1cblxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdpZGxlX2xlZnQnLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLkxlZnQpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDE4NiwgMTg1LCBcIlBsYXllcl8xODVcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTg2XCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rTGVmdF9sZWZ0JywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX2xlZnRcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMTkyLCAxOTEsIFwiUGxheWVyXzE5MVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xOTJcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tSaWdodF9sZWZ0JywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9sZWZ0XCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDI4NCwgMjgzLCBcIlBsYXllcl8yODNcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjg0XCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rQXRDYW1fbGVmdCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfbGVmdFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMTM7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTgxXCIpO1xuICAgIH1cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZVBhdXNlX2xlZnQnLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLkxlZnQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3dhbGtfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxOTMsIDIwMCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgc2luZ2xlUHVuY2ggPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjAxLCAyMDQsIFwiXCIsIDMpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaF9sZWZ0Jywgc2luZ2xlUHVuY2gsIGZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInB1bmNoXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaERlc3Ryb3lfbGVmdCcsIHNpbmdsZVB1bmNoLmNvbmNhdChzaW5nbGVQdW5jaCkuY29uY2F0KHNpbmdsZVB1bmNoKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2h1cnRfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMDUsIDIwOCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2Nyb3VjaF9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIwOSwgMjEyLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcFVwX2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjEzLCAyMTYsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnZmFpbF9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIyNSwgMjI4LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjZWxlYnJhdGVfbGVmdCcsIHRoaXMuZ2VuZXJhdGVQbGF5ZXJDZWxlYnJhdGVGcmFtZXMoKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdidW1wX2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjI5LCAyMzQsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIGZhbHNlKS5vblN0YXJ0LmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJidW1wXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wRG93bl9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIzNSwgMjQwLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZV9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI1MywgMjU2LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDExLCAxMSwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuXG4gICAgZnJhbWVMaXN0ID0gW107XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTIxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyM1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTI3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyOVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjdcIik7XG4gICAgZm9yIChpID0gMDsgaSA8IDU7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTIxXCIpO1xuICAgIH1cblxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdpZGxlX3VwJywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5VcCk7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMTI2LCAxMjUsIFwiUGxheWVyXzEyNVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjZcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tMZWZ0X3VwJywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV91cFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAxMzIsIDEzMSwgXCJQbGF5ZXJfMTMxXCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEzMlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va1JpZ2h0X3VwJywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV91cFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAyNzcsIDI3NiwgXCJQbGF5ZXJfMjc2XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI3N1wiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0F0Q2FtX3VwJywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV91cFwiKTtcbiAgICB9KTtcblxuICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCAxMzsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjFcIik7XG4gICAgfVxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdpZGxlUGF1c2VfdXAnLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLlVwKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnd2Fsa191cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxMzMsIDE0MCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgc2luZ2xlUHVuY2ggPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTQxLCAxNDQsIFwiXCIsIDMpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaF91cCcsIHNpbmdsZVB1bmNoLCBmcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJwdW5jaFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hEZXN0cm95X3VwJywgc2luZ2xlUHVuY2guY29uY2F0KHNpbmdsZVB1bmNoKS5jb25jYXQoc2luZ2xlUHVuY2gpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaHVydF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNDUsIDE0OCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2Nyb3VjaF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNDksIDE1MiwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBVcF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNTMsIDE1NiwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdmYWlsX3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE2NSwgMTY4LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjZWxlYnJhdGVfdXAnLCB0aGlzLmdlbmVyYXRlUGxheWVyQ2VsZWJyYXRlRnJhbWVzKCksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnYnVtcF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNjksIDE3NCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgZmFsc2UpLm9uU3RhcnQuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImJ1bXBcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBEb3duX3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE3NSwgMTgwLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZV91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyNDksIDI1MiwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgOSwgOSwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF90dXJubGVmdF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDEwLCAxMCwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF90dXJucmlnaHRfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCA4LCA4LCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gIH1cblxuICBjcmVhdGVNaW5pQmxvY2soeCwgeSwgYmxvY2tUeXBlKSB7XG4gICAgdmFyIGZyYW1lID0gXCJcIixcbiAgICAgICAgc3ByaXRlID0gbnVsbCxcbiAgICAgICAgZnJhbWVMaXN0LFxuICAgICAgICBpLCBsZW47XG5cbiAgICBzd2l0Y2ggKGJsb2NrVHlwZSkge1xuICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgY2FzZSBcInRyZWVTcHJ1Y2VcIjpcbiAgICAgICAgZnJhbWUgPSBcImxvZ1wiICsgYmxvY2tUeXBlLnN1YnN0cmluZyg0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwic3RvbmVcIjpcbiAgICAgICAgZnJhbWUgPSBcImNvYmJsZXN0b25lXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZUNvYWxcIjpcbiAgICAgICAgZnJhbWUgPSBcImNvYWxcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlRGlhbW9uZFwiOlxuICAgICAgICBmcmFtZSA9IFwiZGlhbW9uZFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVJcm9uXCI6XG4gICAgICAgIGZyYW1lID0gXCJpbmdvdElyb25cIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlTGFwaXNcIjpcbiAgICAgICAgZnJhbWUgPSBcImxhcGlzTGF6dWxpXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZUdvbGRcIjpcbiAgICAgICAgZnJhbWUgPSBcImluZ290R29sZFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVFbWVyYWxkXCI6XG4gICAgICAgIGZyYW1lID0gXCJlbWVyYWxkXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZVJlZHN0b25lXCI6XG4gICAgICAgIGZyYW1lID0gXCJyZWRzdG9uZUR1c3RcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZ3Jhc3NcIjpcbiAgICAgICAgZnJhbWUgPSBcImRpcnRcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwid29vbF9vcmFuZ2VcIjpcbiAgICAgICAgZnJhbWUgPSBcIndvb2xcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwidG50XCI6XG4gICAgICAgIGZyYW1lID0gXCJndW5Qb3dkZXJcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBmcmFtZSA9IGJsb2NrVHlwZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IGF0bGFzID0gXCJtaW5pQmxvY2tzXCI7XG4gICAgbGV0IGZyYW1lUHJlZml4ID0gdGhpcy5taW5pQmxvY2tzW2ZyYW1lXVswXTtcbiAgICBsZXQgZnJhbWVTdGFydCA9IHRoaXMubWluaUJsb2Nrc1tmcmFtZV1bMV07XG4gICAgbGV0IGZyYW1lRW5kID0gdGhpcy5taW5pQmxvY2tzW2ZyYW1lXVsyXTtcbiAgICBsZXQgeE9mZnNldCA9IC0xMDtcbiAgICBsZXQgeU9mZnNldCA9IDA7XG5cbiAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhmcmFtZVByZWZpeCwgZnJhbWVTdGFydCwgZnJhbWVFbmQsIFwiXCIsIDMpO1xuXG4gICAgc3ByaXRlID0gdGhpcy5hY3Rpb25QbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHRoaXMuYWN0aW9uUGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIFwiXCIpO1xuICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImFuaW1hdGVcIiwgZnJhbWVMaXN0LCAxMCwgZmFsc2UpO1xuICAgIHJldHVybiBzcHJpdGU7XG4gIH1cblxuICBwbGF5QW5pbWF0aW9uV2l0aE9mZnNldChzcHJpdGUsIGFuaW1hdGlvbk5hbWUsIGFuaW1hdGlvbkZyYW1lVG90YWwsIHN0YXJ0RnJhbWUpe1xuICAgIHZhciByYW5kID0gTWF0aC50cnVuYyhNYXRoLnJhbmRvbSgpICogYW5pbWF0aW9uRnJhbWVUb3RhbCkgKyBzdGFydEZyYW1lO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBhbmltYXRpb25OYW1lKS5zZXRGcmFtZShyYW5kLCB0cnVlKTtcbiAgfVxuXG4gIHBsYXlSYW5kb21TaGVlcEFuaW1hdGlvbihzcHJpdGUpIHtcbiAgICB2YXIgcmFuZCA9IE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSAqIDIwICsgMSk7XG5cbiAgICBzd2l0Y2gocmFuZCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgY2FzZSAyOlxuICAgICAgY2FzZSAzOlxuICAgICAgY2FzZSA0OlxuICAgICAgY2FzZSA1OlxuICAgICAgY2FzZSA2OlxuICAgICAgLy9lYXQgZ3Jhc3NcbiAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgY2FzZSA4OlxuICAgICAgY2FzZSA5OlxuICAgICAgY2FzZSAxMDpcbiAgICAgIC8vbG9vayBsZWZ0XG4gICAgICBzcHJpdGUucGxheShcImxvb2tMZWZ0XCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDExOlxuICAgICAgY2FzZSAxMjpcbiAgICAgIGNhc2UgMTM6XG4gICAgICBjYXNlIDE0OlxuICAgICAgLy9sb29rIHJpZ2h0XG4gICAgICBzcHJpdGUucGxheShcImxvb2tSaWdodFwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxNTpcbiAgICAgIGNhc2UgMTY6XG4gICAgICBjYXNlIDE3OlxuICAgICAgLy9jYW1cbiAgICAgIHNwcml0ZS5wbGF5KFwibG9va0F0Q2FtXCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE4OlxuICAgICAgY2FzZSAxOTpcbiAgICAgIC8va2lja1xuICAgICAgc3ByaXRlLnBsYXkoXCJraWNrXCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDIwOlxuICAgICAgLy9pZGxlUGF1c2VcbiAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxuXG4gIHBsYXlSYW5kb21DcmVlcGVyQW5pbWF0aW9uKHNwcml0ZSkge1xuICAgIHZhciByYW5kID0gTWF0aC50cnVuYyh0aGlzLnlUb0luZGV4KE1hdGgucmFuZG9tKCkpICsgMSk7XG5cbiAgICBzd2l0Y2gocmFuZCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgY2FzZSAyOlxuICAgICAgY2FzZSAzOlxuICAgICAgLy9sb29rIGxlZnRcbiAgICAgIHNwcml0ZS5wbGF5KFwibG9va0xlZnRcIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgIGNhc2UgNTpcbiAgICAgIGNhc2UgNjpcbiAgICAgIC8vbG9vayByaWdodFxuICAgICAgc3ByaXRlLnBsYXkoXCJsb29rUmlnaHRcIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgIGNhc2UgODpcbiAgICAgIC8vbG9vayBhdCBjYW1cbiAgICAgIHNwcml0ZS5wbGF5KFwibG9va0F0Q2FtXCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDk6XG4gICAgICBjYXNlIDEwOlxuICAgICAgLy9zaHVmZmxlIGZlZXRcbiAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH1cblxuICBjcmVhdGVCbG9jayhwbGFuZSwgeCwgeSwgYmxvY2tUeXBlKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNwcml0ZSA9IG51bGwsXG4gICAgICAgIGZyYW1lTGlzdCxcbiAgICAgICAgYXRsYXMsXG4gICAgICAgIGZyYW1lLFxuICAgICAgICB4T2Zmc2V0LFxuICAgICAgICB5T2Zmc2V0LFxuICAgICAgICBzdGlsbEZyYW1lcztcblxuICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICBjYXNlIFwidHJlZUFjYWNpYVwiOlxuICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgY2FzZSBcInRyZWVKdW5nbGVcIjpcbiAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHBsYW5lLCB4LCB5LCBcImxvZ1wiICsgYmxvY2tUeXBlLnN1YnN0cmluZyg0KSk7XG4gICAgICAgIHNwcml0ZS5mbHVmZiA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5mbHVmZlBsYW5lLCB4LCB5LCBcImxlYXZlc1wiICsgYmxvY2tUeXBlLnN1YnN0cmluZyg0KSk7XG5cbiAgICAgICAgc3ByaXRlLm9uQmxvY2tEZXN0cm95ID0gKGxvZ1Nwcml0ZSkgPT4ge1xuICAgICAgICAgIGxvZ1Nwcml0ZS5mbHVmZi5hbmltYXRpb25zLmFkZChcImRlc3Bhd25cIiwgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJMZWF2ZXNcIiwgMCwgNiwgXCJcIiwgMCksIDEwLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50b0Rlc3Ryb3kucHVzaChsb2dTcHJpdGUuZmx1ZmYpO1xuICAgICAgICAgICAgbG9nU3ByaXRlLmZsdWZmLmtpbGwoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKGxvZ1Nwcml0ZS5mbHVmZi5hbmltYXRpb25zLCBcImRlc3Bhd25cIik7XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwic2hlZXBcIjpcbiAgICAgICAgbGV0IHNGcmFtZXMgPSAxMDtcbiAgICAgICAgLy8gRmFjaW5nIExlZnQ6IEVhdCBHcmFzczogMTk5LTIxNlxuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoLTIyICsgNDAgKiB4LCAtMTIgKyA0MCAqIHksIFwic2hlZXBcIiwgXCJTaGVlcF8xOTlcIik7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiU2hlZXBfXCIsIDE5OSwgMjE1LCBcIlwiLCAwKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNGcmFtZXM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfMjE1XCIpO1xuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9Mb29rIFJpZ2h0XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiU2hlZXBfXCIsIDE4NCwgMTg2LCBcIlwiLCAwKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNGcmFtZXM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfMTg2XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfMTg4XCIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJsb29rUmlnaHRcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9Mb29rIExlZnRcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgMTkzLCAxOTUsIFwiXCIsIDApO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc0ZyYW1lczsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF8xOTVcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF8xOTdcIik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImxvb2tMZWZ0XCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vS2lja1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCAyMTcsIDIzMywgXCJcIiwgMCk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImtpY2tcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9Mb29rIEF0IENhbWVyYVxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCA0ODQsIDQ4NSwgXCJcIiwgMCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzQ4NVwiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzQ4NlwiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va0F0Q2FtXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfMjE1XCIpO1xuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVQYXVzZVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGxheVJhbmRvbVNoZWVwQW5pbWF0aW9uKHNwcml0ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRPRE8oYmpvcmRhbi9nYWFsbGVuKSAtIHVwZGF0ZSBvbmNlIHVwZGF0ZWQgU2hlZXAuanNvblxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCA0OTAsIDQ5MSwgXCJcIiwgMCk7XG4gICAgICAgIHN0aWxsRnJhbWVzID0gTWF0aC50cnVuYyhNYXRoLnJhbmRvbSgpICogMykgKyAzO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3RpbGxGcmFtZXM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfNDkxXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25BbmltYXRpb25TdGFydChzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJmYWNlXCIsIGZyYW1lTGlzdCwgMiwgdHJ1ZSksICgpPT57XG4gICAgICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwic2hlZXBCYWFcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiU2hlZXBfXCIsIDQzOSwgNDU1LCBcIlwiLCAwKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfNDU1XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwidXNlZFwiLCBmcmFtZUxpc3QsIDE1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5QW5pbWF0aW9uV2l0aE9mZnNldChzcHJpdGUsXCJpZGxlXCIsMTcsIDE5OSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiY3JlZXBlclwiOlxuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoLTYgKyA0MCAqIHgsIDAgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBcImNyZWVwZXJcIiwgXCJDcmVlcGVyXzA1M1wiKTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkNyZWVwZXJfXCIsIDM3LCA1MSwgXCJcIiwgMyk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImV4cGxvZGVcIiwgZnJhbWVMaXN0LCAxMCwgZmFsc2UpO1xuXG4gICAgICAgIC8vTG9vayBMZWZ0XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQ3JlZXBlcl9cIiwgNCwgNywgXCJcIiwgMyk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNTsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAwN1wiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDA4XCIpO1xuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDA5XCIpO1xuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDEwXCIpO1xuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDExXCIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJsb29rTGVmdFwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0xvb2sgUmlnaHRcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJDcmVlcGVyX1wiLCAxNiwgMTksIFwiXCIsIDMpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMTlcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAyMFwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAyMVwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAyMlwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAyM1wiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va1JpZ2h0XCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTG9vayBBdCBDYW1cbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJDcmVlcGVyX1wiLCAyNDQsIDI0NSwgXCJcIiwgMyk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNTsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzI0NVwiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMjQ2XCIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJsb29rQXRDYW1cIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnJhbWVMaXN0ID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNTsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAwNFwiKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlUGF1c2VcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlSYW5kb21DcmVlcGVyQW5pbWF0aW9uKHNwcml0ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQ3JlZXBlcl9cIiwgNTMsIDU5LCBcIlwiLCAzKTtcbiAgICAgICAgc3RpbGxGcmFtZXMgPSBNYXRoLnRydW5jKHRoaXMueVRvSW5kZXgoTWF0aC5yYW5kb20oKSkpICsgMjA7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzdGlsbEZyYW1lczsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAwNFwiKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBsYXlBbmltYXRpb25XaXRoT2Zmc2V0KHNwcml0ZSwgXCJpZGxlXCIsIDgsIDUyKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJjcm9wV2hlYXRcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIldoZWF0XCIsIDAsIDIsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgMC40LCBmYWxzZSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwidG9yY2hcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlRvcmNoXCIsIDAsIDIzLCBcIlwiLCAwKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDE1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJ3YXRlclwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiV2F0ZXJfXCIsIDAsIDUsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvL2ZvciBwbGFjaW5nIHdldGxhbmQgZm9yIGNyb3BzIGluIGZyZWUgcGxheVxuICAgICAgY2FzZSBcIndhdGVyaW5nXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgc3ByaXRlLmtpbGwoKTtcbiAgICAgICAgdGhpcy50b0Rlc3Ryb3kucHVzaChzcHJpdGUpO1xuICAgICAgICB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZ3JvdW5kUGxhbmUsIHgsIHksIFwiZmFybWxhbmRXZXRcIik7XG4gICAgICAgIHRoaXMucmVmcmVzaEdyb3VuZFBsYW5lKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwibGF2YVwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTGF2YV9cIiwgMCwgNSwgXCJcIiwgMCk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCA1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJsYXZhUG9wXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJMYXZhUG9wXCIsIDEsIDcsIFwiXCIsIDIpO1xuICAgICAgICBmb3IoaSA9IDA7IGkgPCA0OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkxhdmFQb3AwN1wiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTGF2YVBvcFwiLCA4LCAxMywgXCJcIiwgMikpO1xuICAgICAgICBmb3IoaSA9IDA7IGkgPCAzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkxhdmFQb3AxM1wiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTGF2YVBvcFwiLCAxNCwgMzAsIFwiXCIsIDIpKTtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgODsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJMYXZhUG9wMDFcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlBbmltYXRpb25XaXRoT2Zmc2V0KHNwcml0ZSwgXCJpZGxlXCIsIDI5LCAxKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJmaXJlXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJGaXJlXCIsIDAsIDE0LCBcIlwiLCAyKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImJ1YmJsZXNcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkJ1YmJsZXNcIiwgMCwgMTQsIFwiXCIsIDIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiZXhwbG9zaW9uXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJFeHBsb3Npb25cIiwgMCwgMTYsIFwiXCIsIDEpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy50b0Rlc3Ryb3kucHVzaChzcHJpdGUpO1xuICAgICAgICAgIHNwcml0ZS5raWxsKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImRvb3JcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuXG4gICAgICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgICAgICBsZXQgYW5pbWF0aW9uRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJEb29yXCIsIDAsIDMsIFwiXCIsIDEpO1xuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgNTsgKytqKVxuICAgICAgICB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJEb29yMFwiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KGFuaW1hdGlvbkZyYW1lcyk7XG5cbiAgICAgICAgdmFyIGFuaW1hdGlvbiA9IHNwcml0ZS5hbmltYXRpb25zLmFkZChcIm9wZW5cIiwgZnJhbWVMaXN0LCA1LCBmYWxzZSk7XG4gICAgICAgIGFuaW1hdGlvbi5lbmFibGVVcGRhdGUgPSB0cnVlO1xuICAgICAgICAvL3BsYXkgd2hlbiB0aGUgZG9vciBzdGFydHMgb3BlbmluZ1xuICAgICAgICBhbmltYXRpb24ub25VcGRhdGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBpZihhbmltYXRpb24uZnJhbWUgPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImRvb3JPcGVuXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcIm9wZW5cIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwidG50XCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJUTlRleHBsb3Npb25cIiwgMCwgOCwgXCJcIiwgMCk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImV4cGxvZGVcIiwgZnJhbWVMaXN0LCA3LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGxheUV4cGxvc2lvbkNsb3VkQW5pbWF0aW9uKFt4LHldKTtcbiAgICAgICAgICBzcHJpdGUua2lsbCgpO1xuICAgICAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goc3ByaXRlKTtcbiAgICAgICAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW3RoaXMuY29vcmRpbmF0ZXNUb0luZGV4KFt4LHldKV0gPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNwcml0ZTtcbiAgfVxuXG4gIG9uQW5pbWF0aW9uRW5kKGFuaW1hdGlvbiwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgc2lnbmFsQmluZGluZyA9IGFuaW1hdGlvbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICBzaWduYWxCaW5kaW5nLmRldGFjaCgpO1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uQW5pbWF0aW9uU3RhcnQoYW5pbWF0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBzaWduYWxCaW5kaW5nID0gYW5pbWF0aW9uLm9uU3RhcnQuYWRkKCgpID0+IHtcbiAgICAgIHNpZ25hbEJpbmRpbmcuZGV0YWNoKCk7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgb25BbmltYXRpb25Mb29wT25jZShhbmltYXRpb24sIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHNpZ25hbEJpbmRpbmcgPSBhbmltYXRpb24ub25Mb29wLmFkZCgoKSA9PiB7XG4gICAgICBzaWduYWxCaW5kaW5nLmRldGFjaCgpO1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFJlc2V0dGFibGVUd2VlbihzcHJpdGUpIHtcbiAgICB2YXIgdHdlZW4gPSB0aGlzLmdhbWUuYWRkLnR3ZWVuKHNwcml0ZSk7XG4gICAgdGhpcy5yZXNldHRhYmxlVHdlZW5zLnB1c2godHdlZW4pO1xuICAgIHJldHVybiB0d2VlbjtcbiAgfVxuXG59XG4iLCJpbXBvcnQgTGV2ZWxCbG9jayBmcm9tIFwiLi9MZXZlbEJsb2NrLmpzXCI7XG5pbXBvcnQgRmFjaW5nRGlyZWN0aW9uIGZyb20gXCIuL0ZhY2luZ0RpcmVjdGlvbi5qc1wiO1xuXG4vLyBmb3IgYmxvY2tzIG9uIHRoZSBhY3Rpb24gcGxhbmUsIHdlIG5lZWQgYW4gYWN0dWFsIFwiYmxvY2tcIiBvYmplY3QsIHNvIHdlIGNhbiBtb2RlbFxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXZlbE1vZGVsIHtcbiAgY29uc3RydWN0b3IobGV2ZWxEYXRhKSB7XG4gICAgdGhpcy5wbGFuZVdpZHRoID0gbGV2ZWxEYXRhLmdyaWREaW1lbnNpb25zID9cbiAgICAgICAgbGV2ZWxEYXRhLmdyaWREaW1lbnNpb25zWzBdIDogMTA7XG4gICAgdGhpcy5wbGFuZUhlaWdodCA9IGxldmVsRGF0YS5ncmlkRGltZW5zaW9ucyA/XG4gICAgICAgIGxldmVsRGF0YS5ncmlkRGltZW5zaW9uc1sxXSA6IDEwO1xuXG4gICAgdGhpcy5wbGF5ZXIgPSB7fTtcblxuICAgIHRoaXMucmFpbE1hcCA9IFxuICAgICAgW1wiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJyYWlsc1VucG93ZXJlZFZlcnRpY2FsXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcInJhaWxzVW5wb3dlcmVkVmVydGljYWxcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJyYWlsc1VucG93ZXJlZFZlcnRpY2FsXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcInJhaWxzVW5wb3dlcmVkVmVydGljYWxcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwicmFpbHNCb3R0b21MZWZ0XCIsXCJyYWlsc0hvcml6b250YWxcIixcInJhaWxzSG9yaXpvbnRhbFwiLFwicmFpbHNIb3Jpem9udGFsXCIsXCJyYWlsc0hvcml6b250YWxcIixcInJhaWxzSG9yaXpvbnRhbFwiLFwicmFpbHNIb3Jpem9udGFsXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIl07XG5cbiAgICB0aGlzLmluaXRpYWxMZXZlbERhdGEgPSBPYmplY3QuY3JlYXRlKGxldmVsRGF0YSk7XG5cbiAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICB0aGlzLmluaXRpYWxQbGF5ZXJTdGF0ZSA9IE9iamVjdC5jcmVhdGUodGhpcy5wbGF5ZXIpO1xuICB9XG5cbiAgcGxhbmVBcmVhKCkge1xuICAgIHJldHVybiB0aGlzLnBsYW5lV2lkdGggKiB0aGlzLnBsYW5lSGVpZ2h0O1xuICB9XG5cbiAgaW5Cb3VuZHMoeCwgeSkge1xuICAgIHJldHVybiB4ID49IDAgJiYgeCA8IHRoaXMucGxhbmVXaWR0aCAmJiB5ID49IDAgJiYgeSA8IHRoaXMucGxhbmVIZWlnaHQ7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLmdyb3VuZFBsYW5lID0gdGhpcy5jb25zdHJ1Y3RQbGFuZSh0aGlzLmluaXRpYWxMZXZlbERhdGEuZ3JvdW5kUGxhbmUsIGZhbHNlKTtcbiAgICB0aGlzLmdyb3VuZERlY29yYXRpb25QbGFuZSA9IHRoaXMuY29uc3RydWN0UGxhbmUodGhpcy5pbml0aWFsTGV2ZWxEYXRhLmdyb3VuZERlY29yYXRpb25QbGFuZSwgZmFsc2UpO1xuICAgIHRoaXMuc2hhZGluZ1BsYW5lID0gW107XG4gICAgdGhpcy5hY3Rpb25QbGFuZSA9IHRoaXMuY29uc3RydWN0UGxhbmUodGhpcy5pbml0aWFsTGV2ZWxEYXRhLmFjdGlvblBsYW5lLCB0cnVlKTtcbiAgICB0aGlzLmZsdWZmUGxhbmUgPSB0aGlzLmNvbnN0cnVjdFBsYW5lKHRoaXMuaW5pdGlhbExldmVsRGF0YS5mbHVmZlBsYW5lLCBmYWxzZSk7XG4gICAgdGhpcy5mb3dQbGFuZSA9IFtdO1xuICAgIHRoaXMuaXNEYXl0aW1lID0gdGhpcy5pbml0aWFsTGV2ZWxEYXRhLmlzRGF5dGltZSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuaW5pdGlhbExldmVsRGF0YS5pc0RheXRpbWU7XG5cbiAgICBsZXQgbGV2ZWxEYXRhID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmluaXRpYWxMZXZlbERhdGEpO1xuICAgIGxldCBbeCwgeV0gPSBbbGV2ZWxEYXRhLnBsYXllclN0YXJ0UG9zaXRpb25bMF0sIGxldmVsRGF0YS5wbGF5ZXJTdGFydFBvc2l0aW9uWzFdXTtcblxuICAgIHRoaXMucGxheWVyLm5hbWUgPSB0aGlzLmluaXRpYWxMZXZlbERhdGEucGxheWVyTmFtZSB8fCBcIlN0ZXZlXCI7XG4gICAgdGhpcy5wbGF5ZXIucG9zaXRpb24gPSBsZXZlbERhdGEucGxheWVyU3RhcnRQb3NpdGlvbjtcbiAgICB0aGlzLnBsYXllci5pc09uQmxvY2sgPSAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkpICsgeF0uZ2V0SXNFbXB0eU9yRW50aXR5KCk7XG4gICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gbGV2ZWxEYXRhLnBsYXllclN0YXJ0RGlyZWN0aW9uO1xuXG4gICAgdGhpcy5wbGF5ZXIuaW52ZW50b3J5ID0ge307XG5cbiAgICB0aGlzLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICB0aGlzLmNvbXB1dGVGb3dQbGFuZSgpO1xuICB9XG5cbiAgeVRvSW5kZXgoeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5wbGFuZVdpZHRoO1xuICB9XG5cbiAgY29uc3RydWN0UGxhbmUocGxhbmVEYXRhLCBpc0FjdGlvblBsYW5lKSB7XG4gICAgdmFyIGluZGV4LFxuICAgICAgICByZXN1bHQgPSBbXSxcbiAgICAgICAgYmxvY2s7XG5cbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBwbGFuZURhdGEubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICBibG9jayA9IG5ldyBMZXZlbEJsb2NrKHBsYW5lRGF0YVtpbmRleF0pO1xuICAgICAgLy8gVE9ETyhiam9yZGFuKTogcHV0IHRoaXMgdHJ1dGggaW4gY29uc3RydWN0b3IgbGlrZSBvdGhlciBhdHRyc1xuICAgICAgYmxvY2suaXNXYWxrYWJsZSA9IGJsb2NrLmlzV2Fsa2FibGUgfHwgIWlzQWN0aW9uUGxhbmU7XG4gICAgICByZXN1bHQucHVzaChibG9jayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlzU29sdmVkKCkgIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxMZXZlbERhdGEudmVyaWZpY2F0aW9uRnVuY3Rpb24odGhpcyk7XG4gIH1cblxuICBnZXRIb3VzZUJvdHRvbVJpZ2h0KCkgIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxMZXZlbERhdGEuaG91c2VCb3R0b21SaWdodDtcbiAgfVxuXG4gICAgLy8gVmVyaWZpY2F0aW9uc1xuICBpc1BsYXllck5leHRUbyhibG9ja1R5cGUpIHtcbiAgICB2YXIgcG9zaXRpb247XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgLy8gYWJvdmVcbiAgICBwb3NpdGlvbiA9IFt0aGlzLnBsYXllci5wb3NpdGlvblswXSwgdGhpcy5wbGF5ZXIucG9zaXRpb25bMV0gLSAxXTtcbiAgICBpZiAodGhpcy5pc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBiZWxvd1xuICAgIHBvc2l0aW9uID0gW3RoaXMucGxheWVyLnBvc2l0aW9uWzBdLCB0aGlzLnBsYXllci5wb3NpdGlvblsxXSArIDFdO1xuICAgIGlmICh0aGlzLmlzQmxvY2tPZlR5cGUocG9zaXRpb24sIGJsb2NrVHlwZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGxlZnRcbiAgICBwb3NpdGlvbiA9IFt0aGlzLnBsYXllci5wb3NpdGlvblswXSArIDEsIHRoaXMucGxheWVyLnBvc2l0aW9uWzFdXTtcbiAgICBpZiAodGhpcy5pc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBSaWdodFxuICAgIHBvc2l0aW9uID0gW3RoaXMucGxheWVyLnBvc2l0aW9uWzBdIC0gMSwgdGhpcy5wbGF5ZXIucG9zaXRpb25bMV1dO1xuICAgIGlmICh0aGlzLmlzQmxvY2tPZlR5cGUocG9zaXRpb24sIGJsb2NrVHlwZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldEludmVudG9yeUFtb3VudChpbnZlbnRvcnlUeXBlKSB7XG4gICAgcmV0dXJuIHRoaXMucGxheWVyLmludmVudG9yeVtpbnZlbnRvcnlUeXBlXSB8fCAwO1xuICB9XG5cblxuICBnZXRJbnZlbnRvcnlUeXBlcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wbGF5ZXIuaW52ZW50b3J5KTtcbiAgfVxuXG4gIGNvdW50T2ZUeXBlT25NYXAoYmxvY2tUeXBlKSB7XG4gICAgdmFyIGNvdW50ID0gMCxcbiAgICAgICAgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnBsYW5lQXJlYSgpOyArK2kpIHtcbiAgICAgIGlmIChibG9ja1R5cGUgPT0gdGhpcy5hY3Rpb25QbGFuZVtpXS5ibG9ja1R5cGUpIHtcbiAgICAgICAgKytjb3VudDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvdW50O1xuICB9XG5cbiAgaXNQbGF5ZXJBdChwb3NpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMucGxheWVyLnBvc2l0aW9uWzBdID09PSBwb3NpdGlvblswXSAmJlxuICAgICAgICAgIHRoaXMucGxheWVyLnBvc2l0aW9uWzFdID09PSBwb3NpdGlvblsxXTtcbiAgfVxuXG4gIHNvbHV0aW9uTWFwTWF0Y2hlc1Jlc3VsdE1hcChzb2x1dGlvbk1hcCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGFuZUFyZWEoKTsgaSsrKSB7XG4gICAgICB2YXIgc29sdXRpb25JdGVtVHlwZSA9IHNvbHV0aW9uTWFwW2ldO1xuXG4gICAgICAvLyBcIlwiIG9uIHRoZSBzb2x1dGlvbiBtYXAgbWVhbnMgd2UgZG9udCBjYXJlIHdoYXQncyBhdCB0aGF0IHNwb3RcbiAgICAgIGlmIChzb2x1dGlvbkl0ZW1UeXBlICE9PSBcIlwiKSB7XG4gICAgICAgIGlmIChzb2x1dGlvbkl0ZW1UeXBlID09PSBcImVtcHR5XCIpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuYWN0aW9uUGxhbmVbaV0uaXNFbXB0eSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChzb2x1dGlvbkl0ZW1UeXBlID09PSBcImFueVwiKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYWN0aW9uUGxhbmVbaV0uaXNFbXB0eSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3Rpb25QbGFuZVtpXS5ibG9ja1R5cGUgIT09IHNvbHV0aW9uSXRlbVR5cGUpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXRUbnQoKSB7XG4gICAgdmFyIHRudCA9IFtdO1xuICAgIGZvcih2YXIgeCA9IDA7IHggPCB0aGlzLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgZm9yKHZhciB5ID0gMDsgeSA8IHRoaXMucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChbeCx5XSk7XG4gICAgICAgIHZhciBibG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdO1xuICAgICAgICBpZihibG9jay5ibG9ja1R5cGUgPT09IFwidG50XCIpIHtcbiAgICAgICAgICB0bnQucHVzaChbeCx5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRudDtcbiAgfVxuXG4gIGdldFVucG93ZXJlZFJhaWxzKCkge1xuICAgIHZhciB1bnBvd2VyZWRSYWlscyA9IFtdO1xuICAgIGZvcih2YXIgeCA9IDA7IHggPCB0aGlzLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgZm9yKHZhciB5ID0gMDsgeSA8IHRoaXMucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChbeCx5XSk7XG4gICAgICAgIHZhciBibG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdO1xuICAgICAgICBpZihibG9jay5ibG9ja1R5cGUuc3Vic3RyaW5nKDAsNykgPT0gXCJyYWlsc1VuXCIpIHtcbiAgICAgICAgICB1bnBvd2VyZWRSYWlscy5wdXNoKFt4LHldLCBcInJhaWxzUG93ZXJlZFwiICsgdGhpcy5hY3Rpb25QbGFuZVtpbmRleF0uYmxvY2tUeXBlLnN1YnN0cmluZygxNCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVucG93ZXJlZFJhaWxzO1xuICB9XG5cbiAgZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpIHtcbiAgICB2YXIgY3ggPSB0aGlzLnBsYXllci5wb3NpdGlvblswXSxcbiAgICAgICAgY3kgPSB0aGlzLnBsYXllci5wb3NpdGlvblsxXTtcblxuICAgIHN3aXRjaCAodGhpcy5wbGF5ZXIuZmFjaW5nKSB7XG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5VcDpcbiAgICAgICAgLS1jeTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkRvd246XG4gICAgICAgICsrY3k7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5MZWZ0OlxuICAgICAgICAtLWN4O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ6XG4gICAgICAgICsrY3g7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBbY3gsIGN5XTsgICAgXG4gIH1cblxuICBpc0ZvcndhcmRCbG9ja09mVHlwZShibG9ja1R5cGUpIHtcbiAgICBsZXQgYmxvY2tGb3J3YXJkUG9zaXRpb24gPSB0aGlzLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKTtcblxuICAgIGxldCBhY3Rpb25Jc0VtcHR5ID0gdGhpcy5pc0Jsb2NrT2ZUeXBlT25QbGFuZShibG9ja0ZvcndhcmRQb3NpdGlvbiwgXCJlbXB0eVwiLCB0aGlzLmFjdGlvblBsYW5lKTtcblxuICAgIGlmIChibG9ja1R5cGUgPT09ICcnICYmIGFjdGlvbklzRW1wdHkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb25Jc0VtcHR5ID9cbiAgICAgICAgdGhpcy5pc0Jsb2NrT2ZUeXBlT25QbGFuZShibG9ja0ZvcndhcmRQb3NpdGlvbiwgYmxvY2tUeXBlLCB0aGlzLmdyb3VuZFBsYW5lKSA6XG4gICAgICAgIHRoaXMuaXNCbG9ja09mVHlwZU9uUGxhbmUoYmxvY2tGb3J3YXJkUG9zaXRpb24sIGJsb2NrVHlwZSwgdGhpcy5hY3Rpb25QbGFuZSk7XG4gIH1cblxuICBpc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpICB7XG4gICAgICByZXR1cm4gdGhpcy5pc0Jsb2NrT2ZUeXBlT25QbGFuZShwb3NpdGlvbiwgYmxvY2tUeXBlLCB0aGlzLmFjdGlvblBsYW5lKTtcbiAgfVxuXG4gIGlzQmxvY2tPZlR5cGVPblBsYW5lKHBvc2l0aW9uLCBibG9ja1R5cGUsIHBsYW5lKSAge1xuICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pICsgcG9zaXRpb25bMF07XG4gICAgICBpZiAoYmxvY2tJbmRleCA+PSAwICYmIGJsb2NrSW5kZXggPCB0aGlzLnBsYW5lQXJlYSgpKSB7XG5cbiAgICAgICAgICBpZiAoYmxvY2tUeXBlID09IFwiZW1wdHlcIikge1xuICAgICAgICAgICAgICByZXN1bHQgPSAgcGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGJsb2NrVHlwZSA9PSBcInRyZWVcIikge1xuICAgICAgICAgICAgICByZXN1bHQgPSBwbGFuZVtibG9ja0luZGV4XS5nZXRJc1RyZWUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHQgPSAoYmxvY2tUeXBlID09IHBsYW5lW2Jsb2NrSW5kZXhdLmJsb2NrVHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaXNQbGF5ZXJTdGFuZGluZ0luV2F0ZXIoKXtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgodGhpcy5wbGF5ZXIucG9zaXRpb25bMV0pICsgdGhpcy5wbGF5ZXIucG9zaXRpb25bMF07XG4gICAgcmV0dXJuIHRoaXMuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlID09PSBcIndhdGVyXCI7XG4gIH1cblxuICBpc1BsYXllclN0YW5kaW5nSW5MYXZhKCkge1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleCh0aGlzLnBsYXllci5wb3NpdGlvblsxXSkgKyB0aGlzLnBsYXllci5wb3NpdGlvblswXTtcbiAgICByZXR1cm4gdGhpcy5ncm91bmRQbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUgPT09IFwibGF2YVwiO1xuICB9XG5cbiAgY29vcmRpbmF0ZXNUb0luZGV4KGNvb3JkaW5hdGVzKXtcbiAgICByZXR1cm4gdGhpcy55VG9JbmRleChjb29yZGluYXRlc1sxXSkgKyBjb29yZGluYXRlc1swXTtcbiAgfVxuXG4gIGNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHBvc2l0aW9uLCBvYmplY3RBcnJheSl7XG4gICAgaWYgKCghYmxvY2tUeXBlICYmICh0aGlzLmFjdGlvblBsYW5lW3RoaXMuY29vcmRpbmF0ZXNUb0luZGV4KHBvc2l0aW9uKV0uYmxvY2tUeXBlICE9PSBcIlwiKSl8fCB0aGlzLmlzQmxvY2tPZlR5cGUocG9zaXRpb24sIGJsb2NrVHlwZSkpIHtcbiAgICAgIG9iamVjdEFycmF5LnB1c2goW3RydWUsIHBvc2l0aW9uXSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgIG9iamVjdEFycmF5LnB1c2goW2ZhbHNlLCBudWxsXSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaG91c2VHcm91bmRUb0Zsb29ySGVscGVyKHBvc2l0aW9uLCB3b29sVHlwZSwgYXJyYXlDaGVjaylcbiAge1xuICAgIHZhciBjaGVja0FjdGlvbkJsb2NrLFxuICAgICAgICBjaGVja0dyb3VuZEJsb2NrLFxuICAgICAgICBwb3NBYm92ZSwgXG4gICAgICAgIHBvc0JlbG93LFxuICAgICAgICBwb3NSaWdodCxcbiAgICAgICAgcG9zTGVmdCxcbiAgICAgICAgY2hlY2tJbmRleCA9IDAsXG4gICAgICAgIGFycmF5ID0gYXJyYXlDaGVjaztcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy55VG9JbmRleChwb3NpdGlvblsyXSkgKyBwb3NpdGlvblsxXTtcblxuICAgICAgICBpZihpbmRleCA9PT0gNDQpXG4gICAgICAgIHtcbiAgICAgICAgICBpbmRleCA9IDQ0O1xuICAgICAgICB9XG5cbiAgICBwb3NBYm92ZSA9ICBbMCwgcG9zaXRpb25bMV0sIHBvc2l0aW9uWzJdICsgMV07XG4gICAgcG9zQWJvdmVbMF0gPSB0aGlzLnlUb0luZGV4KHBvc0Fib3ZlWzJdKSArIHBvc0Fib3ZlWzFdO1xuXG4gICAgcG9zQmVsb3cgPSAgWzAsIHBvc2l0aW9uWzFdLCBwb3NpdGlvblsyXSAtIDFdO1xuICAgIHBvc0JlbG93WzBdID0gdGhpcy55VG9JbmRleChwb3NCZWxvd1syXSkgKyBwb3NCZWxvd1sxXTtcblxuICAgIHBvc1JpZ2h0ID0gIFswLCBwb3NpdGlvblsxXSArIDEsIHBvc2l0aW9uWzJdXTtcbiAgICBwb3NSaWdodFswXSA9IHRoaXMueVRvSW5kZXgocG9zUmlnaHRbMl0pICsgcG9zUmlnaHRbMV07XG4gICAgXG4gICAgcG9zTGVmdCA9ICBbMCwgcG9zaXRpb25bMV0gLSAxLCBwb3NpdGlvblsyXV07XG4gICAgcG9zUmlnaHRbMF0gPSB0aGlzLnlUb0luZGV4KHBvc1JpZ2h0WzJdKSArIHBvc1JpZ2h0WzFdO1xuXG4gICAgY2hlY2tBY3Rpb25CbG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdO1xuICAgIGNoZWNrR3JvdW5kQmxvY2sgPSB0aGlzLmdyb3VuZFBsYW5lW2luZGV4XTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmKGFycmF5W2ldWzBdID09PSBpbmRleCkge1xuICAgICAgICBjaGVja0luZGV4ID0gLTE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKGNoZWNrQWN0aW9uQmxvY2suYmxvY2tUeXBlICE9PSBcIlwiKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGVsc2UgaWYoYXJyYXkubGVuZ3RoID4gMCAmJiBjaGVja0luZGV4ID09PSAtMSkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGFycmF5LnB1c2gocG9zaXRpb24pO1xuICAgIGFycmF5LmNvbmNhdCh0aGlzLmhvdXNlR3JvdW5kVG9GbG9vckhlbHBlcihwb3NBYm92ZSwgd29vbFR5cGUsIGFycmF5KSk7XG4gICAgYXJyYXkuY29uY2F0KHRoaXMuaG91c2VHcm91bmRUb0Zsb29ySGVscGVyKHBvc0JlbG93LCB3b29sVHlwZSwgYXJyYXkpKTtcbiAgICBhcnJheS5jb25jYXQodGhpcy5ob3VzZUdyb3VuZFRvRmxvb3JIZWxwZXIocG9zUmlnaHQsIHdvb2xUeXBlLCBhcnJheSkpO1xuICAgIGFycmF5LmNvbmNhdCh0aGlzLmhvdXNlR3JvdW5kVG9GbG9vckhlbHBlcihwb3NMZWZ0LCB3b29sVHlwZSwgYXJyYXkpKTtcblxuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIGhvdXNlR3JvdW5kVG9GbG9vckJsb2NrcyhzdGFydGluZ1Bvc2l0aW9uKSB7XG4gICAgLy9jaGVja0NhcmRpbmFsRGlyZWN0aW9ucyBmb3IgYWN0aW9uYmxvY2tzLlxuICAgIC8vSWYgbm8gYWN0aW9uIGJsb2NrIGFuZCBzcXVhcmUgaXNuJ3QgdGhlIHR5cGUgd2Ugd2FudC5cbiAgICAvL0NoYW5nZSBpdC5cbiAgICB2YXIgd29vbFR5cGUgPSBcIndvb2xfb3JhbmdlXCI7XG5cbiAgICAvL1BsYWNlIHRoaXMgYmxvY2sgaGVyZVxuICAgIC8vdGhpcy5jcmVhdGVCbG9jayh0aGlzLmdyb3VuZFBsYW5lLCBzdGFydGluZ1Bvc2l0aW9uWzBdLCBzdGFydGluZ1Bvc2l0aW9uWzFdLCB3b29sVHlwZSk7XG4gICAgdmFyIGhlbHBlclN0YXJ0RGF0YSA9IFswLCBzdGFydGluZ1Bvc2l0aW9uWzBdLCBzdGFydGluZ1Bvc2l0aW9uWzFdXTtcbiAgICByZXR1cm4gdGhpcy5ob3VzZUdyb3VuZFRvRmxvb3JIZWxwZXIoaGVscGVyU3RhcnREYXRhLCB3b29sVHlwZSwgW10pO1xuICB9XG5cbiAgZ2V0QWxsQm9yZGVyaW5nUG9zaXRpb25Ob3RPZlR5cGUocG9zaXRpb24sIGJsb2NrVHlwZSkge1xuICAgIHZhciBzdXJyb3VuZGluZ0Jsb2NrcyA9IHRoaXMuZ2V0QWxsQm9yZGVyaW5nUG9zaXRpb24ocG9zaXRpb24sIG51bGwpO1xuICAgIGZvcih2YXIgYiA9IDE7IGIgPCBzdXJyb3VuZGluZ0Jsb2Nrcy5sZW5ndGg7ICsrYikge1xuICAgICAgaWYoc3Vycm91bmRpbmdCbG9ja3NbYl1bMF0gJiYgdGhpcy5hY3Rpb25QbGFuZVt0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChzdXJyb3VuZGluZ0Jsb2Nrc1tiXVsxXSldLmJsb2NrVHlwZSA9PSBibG9ja1R5cGUpIHtcbiAgICAgICAgc3Vycm91bmRpbmdCbG9ja3NbYl1bMF0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1cnJvdW5kaW5nQmxvY2tzO1xuICB9XG5cbiAgZ2V0QWxsQm9yZGVyaW5nUG9zaXRpb24ocG9zaXRpb24sIGJsb2NrVHlwZSkge1xuICAgIHZhciBwO1xuICAgIHZhciBhbGxGb3VuZE9iamVjdHMgPSBbZmFsc2VdO1xuICAgIC8vQ2hlY2sgYWxsIDggZGlyZWN0aW9uc1xuXG4gICAgLy9Ub3AgUmlnaHRcbiAgICBwID0gW3Bvc2l0aW9uWzBdICsgMSwgcG9zaXRpb25bMV0gKyAxXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuICAgIC8vVG9wIExlZnRcbiAgICBwID0gW3Bvc2l0aW9uWzBdIC0gMSwgcG9zaXRpb25bMV0gKyAxXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuICAgIC8vQm90IFJpZ2h0XG4gICAgcCA9IFtwb3NpdGlvblswXSArIDEsIHBvc2l0aW9uWzFdIC0gMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL0JvdCBMZWZ0XG4gICAgcCA9IFtwb3NpdGlvblswXSAtIDEsIHBvc2l0aW9uWzFdIC0gMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vQ2hlY2sgY2FyZGluYWwgRGlyZWN0aW9uc1xuICAgIC8vVG9wXG4gICAgcCA9IFtwb3NpdGlvblswXSwgcG9zaXRpb25bMV0gKyAxXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuICAgIC8vQm90XG4gICAgcCA9IFtwb3NpdGlvblswXSwgcG9zaXRpb25bMV0gLSAxXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuICAgIC8vUmlnaHRcbiAgICBwID0gW3Bvc2l0aW9uWzBdICsgMSwgcG9zaXRpb25bMV1dO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG4gICAgLy9MZWZ0XG4gICAgcCA9IFtwb3NpdGlvblswXSAtIDEsIHBvc2l0aW9uWzFdXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsbEZvdW5kT2JqZWN0cztcbiAgfVxuXG4gIGdldEFsbEJvcmRlcmluZ1BsYXllcihibG9ja1R5cGUpe1xuICAgIHJldHVybiB0aGlzLmdldEFsbEJvcmRlcmluZ1Bvc2l0aW9uKHRoaXMucGxheWVyLnBvc2l0aW9uLCBibG9ja1R5cGUpO1xuICB9XG5cbiAgaXNQbGF5ZXJTdGFuZGluZ05lYXJDcmVlcGVyKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFsbEJvcmRlcmluZ1BsYXllcihcImNyZWVwZXJcIik7XG4gIH1cblxuICBnZXRNaW5lY2FydFRyYWNrKCkge1xuICAgIHZhciB0cmFjayA9IFtdO1xuICAgIHRyYWNrLnB1c2goW1wiZG93blwiLCBbMywyXSwgRmFjaW5nRGlyZWN0aW9uLkRvd24sIDMwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wiZG93blwiLCBbMywzXSwgRmFjaW5nRGlyZWN0aW9uLkRvd24sIDMwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wiZG93blwiLCBbMyw0XSwgRmFjaW5nRGlyZWN0aW9uLkRvd24sIDMwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wiZG93blwiLCBbMyw1XSwgRmFjaW5nRGlyZWN0aW9uLkRvd24sIDMwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wiZG93blwiLCBbMyw2XSwgRmFjaW5nRGlyZWN0aW9uLkRvd24sIDMwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wiZG93blwiLCBbMyw3XSwgRmFjaW5nRGlyZWN0aW9uLkRvd24sIDMwMF0pO1xuICAgIHRyYWNrLnB1c2goW1widHVybl9sZWZ0XCIsIFszLDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzQsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbNSw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFs2LDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzcsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbOCw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFs5LDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzEwLDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzExLDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHJldHVybiB0cmFjaztcbn1cblxuICBjYW5Nb3ZlRm9yd2FyZCgpIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICBsZXQgYmxvY2tGb3J3YXJkUG9zaXRpb24gPSB0aGlzLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKTtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoYmxvY2tGb3J3YXJkUG9zaXRpb25bMV0pICsgYmxvY2tGb3J3YXJkUG9zaXRpb25bMF07XG4gICAgbGV0IFt4LCB5XSA9IFtibG9ja0ZvcndhcmRQb3NpdGlvblswXSwgYmxvY2tGb3J3YXJkUG9zaXRpb25bMV1dO1xuXG4gICAgaWYgKHRoaXMuaW5Cb3VuZHMoeCwgeSkpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNXYWxrYWJsZSB8fFxuICAgICAgICAgICAgICAgKHRoaXMucGxheWVyLmlzT25CbG9jayAmJiAhdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgY2FuUGxhY2VCbG9jaygpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNhblBsYWNlQmxvY2tGb3J3YXJkKCkge1xuICAgIGlmICh0aGlzLnBsYXllci5pc09uQmxvY2spIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRQbGFuZVRvUGxhY2VPbih0aGlzLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKSkgIT09IG51bGw7XG4gIH1cblxuICBnZXRQbGFuZVRvUGxhY2VPbihjb29yZGluYXRlcykge1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChjb29yZGluYXRlc1sxXSkgKyBjb29yZGluYXRlc1swXTtcbiAgICBsZXQgW3gsIHldID0gW2Nvb3JkaW5hdGVzWzBdLCBjb29yZGluYXRlc1sxXV07XG5cbiAgICBpZiAodGhpcy5pbkJvdW5kcyh4LCB5KSkge1xuICAgICAgbGV0IGFjdGlvbkJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XTtcbiAgICAgIGlmIChhY3Rpb25CbG9jay5pc1BsYWNhYmxlKSB7XG4gICAgICAgIGxldCBncm91bmRCbG9jayA9IHRoaXMuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF07XG4gICAgICAgIGlmIChncm91bmRCbG9jay5pc1BsYWNhYmxlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdW5kUGxhbmU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aW9uUGxhbmU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjYW5EZXN0cm95QmxvY2tGb3J3YXJkKCkge1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcblxuICAgIGlmICghdGhpcy5wbGF5ZXIuaXNPbkJsb2NrKSB7XG4gICAgICBsZXQgYmxvY2tGb3J3YXJkUG9zaXRpb24gPSB0aGlzLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKTtcbiAgICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChibG9ja0ZvcndhcmRQb3NpdGlvblsxXSkgKyBibG9ja0ZvcndhcmRQb3NpdGlvblswXTtcbiAgICAgIGxldCBbeCwgeV0gPSBbYmxvY2tGb3J3YXJkUG9zaXRpb25bMF0sIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdXTtcblxuICAgICAgaWYgKHRoaXMuaW5Cb3VuZHMoeCwgeSkpIHtcbiAgICAgICAgbGV0IGJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XTtcbiAgICAgICAgcmVzdWx0ID0gIWJsb2NrLmlzRW1wdHkgJiYgKGJsb2NrLmlzRGVzdHJveWFibGUgfHwgYmxvY2suaXNVc2FibGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBtb3ZlRm9yd2FyZCgpIHtcbiAgICBsZXQgYmxvY2tGb3J3YXJkUG9zaXRpb24gPSB0aGlzLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKTtcbiAgICB0aGlzLm1vdmVUbyhibG9ja0ZvcndhcmRQb3NpdGlvbik7XG4gIH1cblxuICBtb3ZlVG8ocG9zaXRpb24pIHtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pICsgcG9zaXRpb25bMF07XG5cbiAgICB0aGlzLnBsYXllci5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIGlmICh0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkpIHtcbiAgICAgIHRoaXMucGxheWVyLmlzT25CbG9jayA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHR1cm5MZWZ0KCkge1xuICAgIHN3aXRjaCAodGhpcy5wbGF5ZXIuZmFjaW5nKSB7XG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5VcDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLkxlZnQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5MZWZ0OlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uRG93bjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkRvd246XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5SaWdodDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0OlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uVXA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHR1cm5SaWdodCgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGxheWVyLmZhY2luZykge1xuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uVXA6XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5SaWdodDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0OlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uRG93bjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkRvd246XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5MZWZ0O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uTGVmdDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLlVwO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwbGFjZUJsb2NrKGJsb2NrVHlwZSkge1xuICAgIGxldCBibG9ja1Bvc2l0aW9uID0gdGhpcy5wbGF5ZXIucG9zaXRpb247XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrUG9zaXRpb25bMV0pICsgYmxvY2tQb3NpdGlvblswXTtcbiAgICB2YXIgc2hvdWxkUGxhY2UgPSBmYWxzZTtcblxuICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICBjYXNlIFwiY3JvcFdoZWF0XCI6XG4gICAgICAgIHNob3VsZFBsYWNlID0gdGhpcy5ncm91bmRQbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUgPT09IFwiZmFybWxhbmRXZXRcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHNob3VsZFBsYWNlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHNob3VsZFBsYWNlID09PSB0cnVlKSB7XG4gICAgICB2YXIgYmxvY2sgPSBuZXcgTGV2ZWxCbG9jayhibG9ja1R5cGUpO1xuXG4gICAgICB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdID0gYmxvY2s7XG4gICAgICB0aGlzLnBsYXllci5pc09uQmxvY2sgPSAhYmxvY2suaXNXYWxrYWJsZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2hvdWxkUGxhY2U7XG4gIH1cblxuICBwbGFjZUJsb2NrRm9yd2FyZChibG9ja1R5cGUsIHRhcmdldFBsYW5lKSB7XG4gICAgbGV0IGJsb2NrUG9zaXRpb24gPSB0aGlzLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKTtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoYmxvY2tQb3NpdGlvblsxXSkgKyBibG9ja1Bvc2l0aW9uWzBdO1xuXG4gICAgLy9mb3IgcGxhY2luZyB3ZXRsYW5kIGZvciBjcm9wcyBpbiBmcmVlIHBsYXlcbiAgICBpZihibG9ja1R5cGUgPT09IFwid2F0ZXJpbmdcIikge1xuICAgICAgYmxvY2tUeXBlID0gXCJmYXJtbGFuZFdldFwiO1xuICAgICAgdGFyZ2V0UGxhbmUgPSB0aGlzLmdyb3VuZFBsYW5lO1xuICAgIH1cblxuICAgIHRhcmdldFBsYW5lW2Jsb2NrSW5kZXhdID0gbmV3IExldmVsQmxvY2soYmxvY2tUeXBlKTtcbiAgfVxuXG4gIGRlc3Ryb3lCbG9jayhwb3NpdGlvbikge1xuICAgIHZhciBpLFxuICAgICAgICBibG9jayA9IG51bGw7XG5cbiAgICBsZXQgYmxvY2tQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChibG9ja1Bvc2l0aW9uWzFdKSArIGJsb2NrUG9zaXRpb25bMF07XG4gICAgbGV0IFt4LCB5XSA9IFtibG9ja1Bvc2l0aW9uWzBdLCBibG9ja1Bvc2l0aW9uWzFdXTtcbiAgICBcbiAgICBpZiAodGhpcy5pbkJvdW5kcyh4LCB5KSkge1xuICAgICAgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdO1xuICAgICAgaWYgKGJsb2NrICE9PSBudWxsKSB7XG4gICAgICAgIGJsb2NrLnBvc2l0aW9uID0gW3gsIHldO1xuXG4gICAgICAgIGlmIChibG9jay5pc0Rlc3Ryb3lhYmxlKSB7XG4gICAgICAgICAgdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XSA9IG5ldyBMZXZlbEJsb2NrKFwiXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2NrO1xuICB9XG5cbiAgZGVzdHJveUJsb2NrRm9yd2FyZCgpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc2hvdWxkQWRkVG9JbnZlbnRvcnkgPSB0cnVlLFxuICAgICAgICBibG9jayA9IG51bGw7XG5cbiAgICBsZXQgYmxvY2tGb3J3YXJkUG9zaXRpb24gPSB0aGlzLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKTtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoYmxvY2tGb3J3YXJkUG9zaXRpb25bMV0pICsgYmxvY2tGb3J3YXJkUG9zaXRpb25bMF07XG4gICAgbGV0IFt4LCB5XSA9IFtibG9ja0ZvcndhcmRQb3NpdGlvblswXSwgYmxvY2tGb3J3YXJkUG9zaXRpb25bMV1dO1xuICAgIFxuICAgIGlmICh0aGlzLmluQm91bmRzKHgsIHkpKSB7XG4gICAgICBibG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF07XG4gICAgICBpZiAoYmxvY2sgIT09IG51bGwpIHtcbiAgICAgICAgYmxvY2sucG9zaXRpb24gPSBbeCwgeV07XG4gICAgICAgIGxldCBpbnZlbnRvcnlUeXBlID0gdGhpcy5nZXRJbnZlbnRvcnlUeXBlKGJsb2NrLmJsb2NrVHlwZSk7XG4gICAgICAgIHRoaXMucGxheWVyLmludmVudG9yeVtpbnZlbnRvcnlUeXBlXSA9XG4gICAgICAgICAgICAodGhpcy5wbGF5ZXIuaW52ZW50b3J5W2ludmVudG9yeVR5cGVdIHx8IDApICsgMTtcblxuICAgICAgICBpZiAoYmxvY2suaXNEZXN0cm95YWJsZSkge1xuICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0gPSBuZXcgTGV2ZWxCbG9jayhcIlwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIGdldEludmVudG9yeVR5cGUoYmxvY2tUeXBlKSB7XG4gICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgIGNhc2UgXCJzaGVlcFwiOlxuICAgICAgICByZXR1cm4gXCJ3b29sXCI7XG4gICAgICBjYXNlIFwic3RvbmVcIjpcbiAgICAgICAgcmV0dXJuIFwiY29iYmxlc3RvbmVcIjtcbiAgICAgIGNhc2UgXCJ0cmVlQWNhY2lhXCI6XG4gICAgICBjYXNlIFwidHJlZUJpcmNoXCI6XG4gICAgICBjYXNlIFwidHJlZUp1bmdsZVwiOlxuICAgICAgY2FzZSBcInRyZWVPYWtcIjpcbiAgICAgIGNhc2UgXCJ0cmVlU3BydWNlXCI6XG4gICAgICAgIHJldHVybiBcInBsYW5rc1wiICsgYmxvY2tUeXBlLnN1YnN0cmluZyg0KTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBibG9ja1R5cGU7XG4gICAgfVxuICB9XG5cbiAgc29sdmVGT1dUeXBlRm9yTWFwKCkge1xuICAgIHZhciBlbWlzc2l2ZXMsXG4gICAgICAgIGJsb2Nrc1RvU29sdmU7XG5cbiAgICBlbWlzc2l2ZXMgPSB0aGlzLmdldEFsbEVtaXNzaXZlcygpO1xuICAgIGJsb2Nrc1RvU29sdmUgPSB0aGlzLmZpbmRCbG9ja3NBZmZlY3RlZEJ5RW1pc3NpdmVzKGVtaXNzaXZlcyk7XG5cbiAgICBmb3IodmFyIGJsb2NrIGluIGJsb2Nrc1RvU29sdmUpIHtcbiAgICAgIGlmKGJsb2Nrc1RvU29sdmUuaGFzT3duUHJvcGVydHkoYmxvY2spKSB7XG4gICAgICAgIHRoaXMuc29sdmVGT1dUeXBlRm9yKGJsb2Nrc1RvU29sdmVbYmxvY2tdLCBlbWlzc2l2ZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNvbHZlRk9XVHlwZUZvcihwb3NpdGlvbiwgZW1pc3NpdmVzKSB7XG4gICAgdmFyIGVtaXNzaXZlc1RvdWNoaW5nLFxuICAgICAgICB0b3BMZWZ0UXVhZCA9IGZhbHNlLFxuICAgICAgICBib3RMZWZ0UXVhZCA9IGZhbHNlLFxuICAgICAgICBsZWZ0UXVhZCA9IGZhbHNlLFxuICAgICAgICB0b3BSaWdodFF1YWQgPSBmYWxzZSxcbiAgICAgICAgYm90UmlnaHRRdWFkID0gZmFsc2UsXG4gICAgICAgIHJpZ2h0UXVhZCA9IGZhbHNlLFxuICAgICAgICB0b3BRdWFkID0gZmFsc2UsXG4gICAgICAgIGJvdFF1YWQgPSBmYWxzZSxcbiAgICAgICAgYW5nbGUgPSAwLFxuICAgICAgICBpbmRleCA9IHRoaXMuY29vcmRpbmF0ZXNUb0luZGV4KHBvc2l0aW9uKSxcbiAgICAgICAgeCxcbiAgICAgICAgeTtcblxuICAgIGVtaXNzaXZlc1RvdWNoaW5nID0gdGhpcy5maW5kRW1pc3NpdmVzVGhhdFRvdWNoKHBvc2l0aW9uLCBlbWlzc2l2ZXMpO1xuXG4gICAgZm9yKHZhciB0b3JjaCBpbiBlbWlzc2l2ZXNUb3VjaGluZykge1xuICAgICAgdmFyIGN1cnJlbnRUb3JjaCA9IGVtaXNzaXZlc1RvdWNoaW5nW3RvcmNoXTtcbiAgICAgIHkgPSBwb3NpdGlvblsxXTtcbiAgICAgIHggPSBwb3NpdGlvblswXTtcblxuICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKGN1cnJlbnRUb3JjaFsxXSAtIHBvc2l0aW9uWzFdLCBjdXJyZW50VG9yY2hbMF0gLSBwb3NpdGlvblswXSk7XG4gICAgICAvL2ludmVydFxuICAgICAgYW5nbGUgPSAtYW5nbGU7XG4gICAgICAvL05vcm1hbGl6ZSB0byBiZSBiZXR3ZWVuIDAgYW5kIDIqcGlcbiAgICAgIGlmKGFuZ2xlIDwgMCkge1xuICAgICAgICBhbmdsZSArPSAyICogTWF0aC5QSTtcbiAgICAgIH1cbiAgICAgIC8vY29udmVydCB0byBkZWdyZWVzIGZvciBzaW1wbGljaXR5XG4gICAgICBhbmdsZSAqPSAzNjAgLyAoMipNYXRoLlBJKTtcblxuICAgICAgLy90b3AgcmlnaHRcbiAgICAgIGlmKCFyaWdodFF1YWQgJiZhbmdsZSA+IDMyLjUgJiYgYW5nbGUgPD0gNTcuNSkge1xuICAgICAgICB0b3BSaWdodFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9JbkNvcm5lcl9Ub3BSaWdodFwiLCBwcmVjZWRlbmNlOiAwIH0pO1xuICAgICAgfS8vdG9wIGxlZnRcbiAgICAgIGlmKCFsZWZ0UXVhZCAmJmFuZ2xlID4gMTIyLjUgJiYgYW5nbGUgPD0gMTQ3LjUpIHtcbiAgICAgICAgdG9wTGVmdFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9JbkNvcm5lcl9Ub3BMZWZ0XCIsIHByZWNlZGVuY2U6IDB9KTtcbiAgICAgIH0vL2JvdCBsZWZ0XG4gICAgICBpZighbGVmdFF1YWQgJiZhbmdsZSA+IDIxMi41ICYmIGFuZ2xlIDw9IDIzNy41KSB7XG4gICAgICAgIGJvdExlZnRRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfSW5Db3JuZXJfQm90dG9tTGVmdFwiLCBwcmVjZWRlbmNlOiAwfSk7XG4gICAgICB9Ly9ib3RyaWdodFxuICAgICAgaWYoIXJpZ2h0UXVhZCAmJiBhbmdsZSA+IDMwMi41ICYmIGFuZ2xlIDw9IDMxNy41KSB7XG4gICAgICAgIGJvdFJpZ2h0UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0luQ29ybmVyX0JvdHRvbVJpZ2h0XCIsIHByZWNlZGVuY2U6IDB9KTtcbiAgICAgIH1cbiAgICAgIC8vcmlnaHRcbiAgICAgIGlmKGFuZ2xlID49IDMyNy41IHx8IGFuZ2xlIDw9IDMyLjUpIHtcbiAgICAgICAgcmlnaHRRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfUmlnaHRcIiAsIHByZWNlZGVuY2U6IDF9KTtcbiAgICAgIH0vL2JvdFxuICAgICAgaWYoYW5nbGUgPiAyMzcuNSAmJiBhbmdsZSA8PSAzMDIuNSkge1xuICAgICAgICBib3RRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfQm90dG9tXCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICAgIH1cbiAgICAgIC8vbGVmdFxuICAgICAgaWYoYW5nbGUgPiAxNDcuNSAmJiBhbmdsZSA8PSAyMTIuNSkge1xuICAgICAgICBsZWZ0UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0xlZnRcIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgICAgfVxuICAgICAgLy90b3BcbiAgICAgIGlmKGFuZ2xlID4gNTcuNSAmJiBhbmdsZSA8PSAxMjIuNSkge1xuICAgICAgICB0b3BRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfVG9wXCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0b3BMZWZ0UXVhZCAmJiBib3RMZWZ0UXVhZCkge1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfTGVmdFwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgfVxuICAgIGlmKHRvcFJpZ2h0UXVhZCAmJiBib3RSaWdodFF1YWQpIHtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX1JpZ2h0XCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICB9XG4gICAgaWYodG9wTGVmdFF1YWQgJiYgdG9wUmlnaHRRdWFkKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Ub3BcIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgIH1cbiAgICBpZihib3RSaWdodFF1YWQgJiYgYm90TGVmdFF1YWQpIHtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0JvdHRvbVwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgfVxuXG4gICAgLy9mdWxseSBsaXRcbiAgICBpZiggKGJvdFJpZ2h0UXVhZCAmJiB0b3BMZWZ0UXVhZCkgfHwgKGJvdExlZnRRdWFkICYmIHRvcFJpZ2h0UXVhZCkgfHwgbGVmdFF1YWQgJiYgcmlnaHRRdWFkIHx8IHRvcFF1YWQgJiYgYm90UXVhZCB8fCAocmlnaHRRdWFkICYmIGJvdFF1YWQgJiYgdG9wTGVmdFF1YWQpIHx8XG4gICAgICAgIChib3RRdWFkICYmIHRvcFJpZ2h0UXVhZCAmJiB0b3BMZWZ0UXVhZCkgfHwgKHRvcFF1YWQgJiYgYm90UmlnaHRRdWFkICYmIGJvdExlZnRRdWFkKSB8fCAobGVmdFF1YWQgJiYgdG9wUmlnaHRRdWFkICYmIGJvdFJpZ2h0UXVhZCkgfHwgKGxlZnRRdWFkICYmIGJvdFF1YWQgJiYgdG9wUmlnaHRRdWFkKSkge1xuICAgICAgdGhpcy5mb3dQbGFuZVtpbmRleF0gPSBcIlwiO1xuICAgIH1cblxuICAgIC8vZGFya2VuZCBib3RsZWZ0IGNvcm5lclxuICAgIGVsc2UgaWYoIChib3RRdWFkICYmIGxlZnRRdWFkKSB8fCAoYm90UXVhZCAmJiB0b3BMZWZ0UXVhZCkgfHwgKGxlZnRRdWFkICYmIGJvdFJpZ2h0UXVhZCkgKXtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0JvdHRvbV9MZWZ0XCIsIHByZWNlZGVuY2U6IDJ9KTtcbiAgICB9XG4gICAgLy9kYXJrZW5kIGJvdFJpZ2h0IGNvcm5lclxuICAgIGVsc2UgaWYoKGJvdFF1YWQgJiYgcmlnaHRRdWFkKSB8fCAoYm90UXVhZCAmJiB0b3BSaWdodFF1YWQpIHx8IChyaWdodFF1YWQgJiYgYm90TGVmdFF1YWQpKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Cb3R0b21fUmlnaHRcIiwgcHJlY2VkZW5jZTogMn0pO1xuICAgIH1cbiAgICAvL2RhcmtlbmQgdG9wUmlnaHQgY29ybmVyXG4gICAgZWxzZSBpZigodG9wUXVhZCAmJiByaWdodFF1YWQpIHx8ICh0b3BRdWFkICYmIGJvdFJpZ2h0UXVhZCkgfHwgKHJpZ2h0UXVhZCAmJiB0b3BMZWZ0UXVhZCkpIHtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX1RvcF9SaWdodFwiLCBwcmVjZWRlbmNlOiAyfSk7XG4gICAgfVxuICAgIC8vZGFya2VuZCB0b3BMZWZ0IGNvcm5lclxuICAgIGVsc2UgaWYoKHRvcFF1YWQgJiYgbGVmdFF1YWQpIHx8ICh0b3BRdWFkICYmIGJvdExlZnRRdWFkKSB8fCAobGVmdFF1YWQgJiYgdG9wUmlnaHRRdWFkKSl7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Ub3BfTGVmdFwiLCBwcmVjZWRlbmNlOiAyfSk7XG4gICAgfVxuICB9XG5cbiAgcHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgZm93T2JqZWN0KSB7XG4gICAgaWYgKGZvd09iamVjdCA9PT0gXCJcIikge1xuICAgICAgdGhpcy5mb3dQbGFuZVtpbmRleF0gPSBcIlwiO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZXhpc3RpbmdJdGVtID0gdGhpcy5mb3dQbGFuZVtpbmRleF07XG4gICAgaWYgKGV4aXN0aW5nSXRlbSAmJiBleGlzdGluZ0l0ZW0ucHJlY2VkZW5jZSA+IGZvd09iamVjdC5wcmVjZWRlbmNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZm93UGxhbmVbaW5kZXhdID0gZm93T2JqZWN0O1xuICB9XG5cbiAgZ2V0QWxsRW1pc3NpdmVzKCl7XG4gICAgdmFyIGVtaXNzaXZlcyA9IFtdO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuY29vcmRpbmF0ZXNUb0luZGV4KFt4LHldKTtcbiAgICAgICAgaWYoIXRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmlzRW1wdHkgJiYgdGhpcy5hY3Rpb25QbGFuZVtpbmRleF0uaXNFbWlzc2l2ZSB8fCB0aGlzLmdyb3VuZFBsYW5lW2luZGV4XS5pc0VtaXNzaXZlICYmIHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmlzRW1wdHkgKSB7XG4gICAgICAgICAgZW1pc3NpdmVzLnB1c2goW3gseV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbWlzc2l2ZXM7XG4gIH1cblxuICBmaW5kQmxvY2tzQWZmZWN0ZWRCeUVtaXNzaXZlcyhlbWlzc2l2ZXMpIHtcbiAgICB2YXIgYmxvY2tzVG91Y2hlZEJ5RW1pc3NpdmVzID0ge307XG4gICAgLy9maW5kIGVtaXNzaXZlcyB0aGF0IGFyZSBjbG9zZSBlbm91Z2ggdG8gbGlnaHQgdXMuXG4gICAgZm9yKHZhciB0b3JjaCBpbiBlbWlzc2l2ZXMpXG4gICAge1xuICAgICAgdmFyIGN1cnJlbnRUb3JjaCA9IGVtaXNzaXZlc1t0b3JjaF07XG4gICAgICBsZXQgeSA9IGN1cnJlbnRUb3JjaFsxXTtcbiAgICAgIGxldCB4ID0gY3VycmVudFRvcmNoWzBdO1xuICAgICAgZm9yICh2YXIgeUluZGV4ID0gY3VycmVudFRvcmNoWzFdIC0gMjsgeUluZGV4IDw9IChjdXJyZW50VG9yY2hbMV0gKyAyKTsgKyt5SW5kZXgpIHtcbiAgICAgICAgZm9yICh2YXIgeEluZGV4ID0gY3VycmVudFRvcmNoWzBdIC0gMjsgeEluZGV4IDw9IChjdXJyZW50VG9yY2hbMF0gKyAyKTsgKyt4SW5kZXgpIHtcblxuICAgICAgICAgIC8vRW5zdXJlIHdlJ3JlIGxvb2tpbmcgaW5zaWRlIHRoZSBtYXBcbiAgICAgICAgICBpZighdGhpcy5pbkJvdW5kcyh4SW5kZXgsIHlJbmRleCkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vSWdub3JlIHRoZSBpbmRleGVzIGRpcmVjdGx5IGFyb3VuZCB1cy5cbiAgICAgICAgICAvL1RoZXlyZSB0YWtlbiBjYXJlIG9mIG9uIHRoZSBGT1cgZmlyc3QgcGFzcyBcbiAgICAgICAgICBpZiggKHlJbmRleCA+PSB5IC0gMSAmJiB5SW5kZXggPD0geSArIDEpICYmICh4SW5kZXggPj0geCAtIDEgJiYgeEluZGV4IDw9IHggKyAxKSApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vd2Ugd2FudCB1bmlxdWUgY29waWVzIHNvIHdlIHVzZSBhIG1hcC5cbiAgICAgICAgICBibG9ja3NUb3VjaGVkQnlFbWlzc2l2ZXNbeUluZGV4LnRvU3RyaW5nKCkgKyB4SW5kZXgudG9TdHJpbmcoKV0gPSBbeEluZGV4LHlJbmRleF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmxvY2tzVG91Y2hlZEJ5RW1pc3NpdmVzO1xuICB9XG5cbiAgZmluZEVtaXNzaXZlc1RoYXRUb3VjaChwb3NpdGlvbiwgZW1pc3NpdmVzKSB7XG4gICAgdmFyIGVtaXNzaXZlc1RoYXRUb3VjaCA9IFtdO1xuICAgIGxldCB5ID0gcG9zaXRpb25bMV07XG4gICAgbGV0IHggPSBwb3NpdGlvblswXTtcbiAgICAvL2ZpbmQgZW1pc3NpdmVzIHRoYXQgYXJlIGNsb3NlIGVub3VnaCB0byBsaWdodCB1cy5cbiAgICBmb3IgKHZhciB5SW5kZXggPSB5IC0gMjsgeUluZGV4IDw9ICh5ICsgMik7ICsreUluZGV4KSB7XG4gICAgICBmb3IgKHZhciB4SW5kZXggPSB4IC0gMjsgeEluZGV4IDw9ICh4ICsgMik7ICsreEluZGV4KSB7XG5cbiAgICAgICAgLy9FbnN1cmUgd2UncmUgbG9va2luZyBpbnNpZGUgdGhlIG1hcFxuICAgICAgICBpZighdGhpcy5pbkJvdW5kcyh4SW5kZXgsIHlJbmRleCkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vSWdub3JlIHRoZSBpbmRleGVzIGRpcmVjdGx5IGFyb3VuZCB1cy4gXG4gICAgICAgIGlmKCAoeUluZGV4ID49IHkgLSAxICYmIHlJbmRleCA8PSB5ICsgMSkgJiYgKHhJbmRleCA+PSB4IC0gMSAmJiB4SW5kZXggPD0geCArIDEpICkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yKHZhciB0b3JjaCBpbiBlbWlzc2l2ZXMpIHtcbiAgICAgICAgICBpZihlbWlzc2l2ZXNbdG9yY2hdWzBdID09PSB4SW5kZXggJiYgZW1pc3NpdmVzW3RvcmNoXVsxXSA9PT0geUluZGV4KSB7XG4gICAgICAgICAgICBlbWlzc2l2ZXNUaGF0VG91Y2gucHVzaChlbWlzc2l2ZXNbdG9yY2hdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW1pc3NpdmVzVGhhdFRvdWNoO1xuICB9XG5cbiAgY29tcHV0ZUZvd1BsYW5lKCkge1xuICAgIHZhciB4LCB5O1xuXG4gICAgdGhpcy5mb3dQbGFuZSA9IFtdO1xuICAgIGlmICh0aGlzLmlzRGF5dGltZSkge1xuICAgICAgZm9yICh5ID0gMDsgeSA8IHRoaXMucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgICBmb3IgKHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgICAvLyB0aGlzLmZvd1BsYW5lLnB1c2hbXCJcIl07IC8vIG5vb3AgYXMgb3JpZ2luYWxseSB3cml0dGVuXG4gICAgICAgICAgLy8gVE9ETyhiam9yZGFuKSBjb21wbGV0ZWx5IHJlbW92ZT9cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb21wdXRlIHRoZSBmb2cgb2Ygd2FyIGZvciBsaWdodCBlbWl0dGluZyBibG9ja3NcbiAgICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgICAgdGhpcy5mb3dQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9DZW50ZXJcIiB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL3NlY29uZCBwYXNzIGZvciBwYXJ0aWFsIGxpdCBzcXVhcmVzXG4gICAgICB0aGlzLnNvbHZlRk9XVHlwZUZvck1hcCgpO1xuXG4gICAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleCh5KSArIHg7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHRoaXMuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF0uaXNFbWlzc2l2ZSAmJiB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkgfHxcbiAgICAgICAgICAgICghdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5ICYmIHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbWlzc2l2ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJGb3dBcm91bmQoeCwgeSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgIH1cbiAgfVxuXG4gIGNsZWFyRm93QXJvdW5kKHgsIHkpIHtcbiAgICB2YXIgb3gsIG95O1xuXG4gICAgZm9yIChveSA9IC0xOyBveSA8PSAxOyArK295KSB7XG4gICAgICBmb3IgKG94ID0gLTE7IG94IDw9IDE7ICsrb3gpIHtcbiAgICAgICAgdGhpcy5jbGVhckZvd0F0KHggKyBveCwgeSArIG95KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjbGVhckZvd0F0KHgsIHkpIHtcbiAgICBpZiAoeCA+PSAwICYmIHggPCB0aGlzLnBsYW5lV2lkdGggJiYgeSA+PSAwICYmIHkgPCB0aGlzLnBsYW5lSGVpZ2h0KSB7XG4gICAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoeSkgKyB4O1xuICAgICAgdGhpcy5mb3dQbGFuZVtibG9ja0luZGV4XSA9IFwiXCI7XG4gICAgfVxuICB9XG5cbiAgY29tcHV0ZVNoYWRpbmdQbGFuZSgpIHtcbiAgICB2YXIgeCxcbiAgICAgICAgeSxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIGhhc0xlZnQsXG4gICAgICAgIGhhc1JpZ2h0O1xuXG4gICAgdGhpcy5zaGFkaW5nUGxhbmUgPSBbXTtcblxuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucGxhbmVBcmVhKCk7ICsraW5kZXgpIHtcbiAgICAgIHggPSBpbmRleCAlIHRoaXMucGxhbmVXaWR0aDtcbiAgICAgIHkgPSBNYXRoLmZsb29yKGluZGV4IC8gdGhpcy5wbGFuZVdpZHRoKTtcblxuICAgICAgaGFzTGVmdCA9IGZhbHNlO1xuICAgICAgaGFzUmlnaHQgPSBmYWxzZTtcbiAgICAgIFxuICAgICAgaWYgKHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmlzRW1wdHkgfHwgdGhpcy5hY3Rpb25QbGFuZVtpbmRleF0uaXNUcmFuc3BhcmVudCkge1xuICAgICAgICBpZiAoeSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfQm90dG9tJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh5ID09PSB0aGlzLnBsYW5lSGVpZ2h0IC0gMSkge1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfVG9wJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh4ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9SaWdodCcgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeCA9PT0gdGhpcy5wbGFuZVdpZHRoIC0gMSkge1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfTGVmdCcgfSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmICh4IDwgdGhpcy5wbGFuZVdpZHRoIC0gMSAmJiAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkpICsgeCArIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgLy8gbmVlZHMgYSBsZWZ0IHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9MZWZ0JyB9KTtcbiAgICAgICAgICBoYXNMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh4ID4gMCAmJiAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkpICsgeCAtIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgLy8gbmVlZHMgYSByaWdodCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfUmlnaHQnIH0pO1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnU2hhZG93X1BhcnRzX0ZhZGVfYmFzZS5wbmcnIH0pO1xuXG4gICAgICAgICAgaWYgKHkgPiAwICYmIHggPiAwICYmIHRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5IC0gMSkgKyB4IC0gMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnU2hhZG93X1BhcnRzX0ZhZGVfdG9wLnBuZycgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaGFzUmlnaHQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHkgPiAwICYmICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSAtIDEpICsgeF0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAvLyBuZWVkcyBhIGJvdHRvbSBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfQm90dG9tJyB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh5ID4gMCkge1xuICAgICAgICAgIGlmICh4IDwgdGhpcy5wbGFuZVdpZHRoIC0gMSAmJiBcbiAgICAgICAgICAgICAgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5IC0gMSkgKyB4ICsgMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkgJiZcbiAgICAgICAgICAgICAgdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkpICsgeCArIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgICAvLyBuZWVkcyBhIGJvdHRvbSBsZWZ0IHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0JvdHRvbUxlZnQnIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghaGFzUmlnaHQgJiYgeCA+IDAgJiYgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5IC0gMSkgKyB4IC0gMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAgIC8vIG5lZWRzIGEgYm90dG9tIHJpZ2h0IHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0JvdHRvbVJpZ2h0JyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeSA8IHRoaXMucGxhbmVIZWlnaHQgLSAxKSB7XG4gICAgICAgICAgaWYgKHggPCB0aGlzLnBsYW5lV2lkdGggLSAxICYmIFxuICAgICAgICAgICAgICAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkgKyAxKSArIHggKyAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSAmJlxuICAgICAgICAgICAgICB0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSkgKyB4ICsgMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAgIC8vIG5lZWRzIGEgYm90dG9tIGxlZnQgc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfVG9wTGVmdCcgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFoYXNSaWdodCAmJiB4ID4gMCAmJiAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkgKyAxKSArIHggLSAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgICAgLy8gbmVlZHMgYSBib3R0b20gcmlnaHQgc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfVG9wUmlnaHQnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGV2ZWxCbG9jayB7XG4gIGNvbnN0cnVjdG9yKGJsb2NrVHlwZSkge1xuICAgIHRoaXMuYmxvY2tUeXBlID0gYmxvY2tUeXBlO1xuXG4gICAgLy8gRGVmYXVsdCB2YWx1ZXMgYXBwbHkgdG8gc2ltcGxlLCBhY3Rpb24tcGxhbmUgZGVzdHJveWFibGUgYmxvY2tzXG4gICAgdGhpcy5pc0VudGl0eSA9IGZhbHNlO1xuICAgIHRoaXMuaXNXYWxrYWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuaXNEZWFkbHkgPSBmYWxzZTtcbiAgICB0aGlzLmlzUGxhY2FibGUgPSBmYWxzZTsgLy8gd2hldGhlciBhbm90aGVyIGJsb2NrIGNhbiBiZSBwbGFjZWQgaW4gdGhpcyBibG9jaydzIHNwb3RcbiAgICB0aGlzLmlzRGVzdHJveWFibGUgPSB0cnVlO1xuICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgIHRoaXMuaXNFbXB0eSA9IGZhbHNlO1xuICAgIHRoaXMuaXNFbWlzc2l2ZSA9IGZhbHNlO1xuICAgIHRoaXMuaXNUcmFuc3BhcmVudCA9IGZhbHNlO1xuXG4gICAgaWYgKGJsb2NrVHlwZSA9PT0gXCJcIikge1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0VtcHR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNQbGFjYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzVXNhYmxlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZS5tYXRjaCgndG9yY2gnKSkge1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNQbGFjYWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYoYmxvY2tUeXBlLnN1YnN0cmluZygwLCA1KSA9PSBcInJhaWxzXCIpXG4gICAge1xuICAgICAgdGhpcy5pc0VudGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNUcmFuc3BhcmVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcInNoZWVwXCIpIHtcbiAgICAgIHRoaXMuaXNFbnRpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVXNhYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwiY3JlZXBlclwiKXtcbiAgICAgIHRoaXMuaXNFbnRpdHkgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJnbGFzc1wiKXtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJiZWRyb2NrXCIpe1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcImxhdmFcIikge1xuICAgICAgdGhpcy5pc0VtaXNzaXZlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVhZGx5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNQbGFjYWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcIndhdGVyXCIpIHtcbiAgICAgIHRoaXMuaXNQbGFjYWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcInRvcmNoXCIpIHtcbiAgICAgIHRoaXMuaXNFbWlzc2l2ZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRW50aXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzVXNhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1RyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwiY3JvcFdoZWF0XCIpIHtcbiAgICAgIHRoaXMuaXNFbWlzc2l2ZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0VudGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNUcmFuc3BhcmVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcInRudFwiKSB7XG4gICAgICB0aGlzLmlzVXNhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYoYmxvY2tUeXBlID09IFwiZG9vclwiKSB7XG4gICAgICB0aGlzLmlzRW50aXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzVXNhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1RyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBnZXRJc1RyZWUoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5ibG9ja1R5cGUubWF0Y2goL150cmVlLyk7XG4gIH1cblxuICBnZXRJc0VtcHR5T3JFbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNFbXB0eSB8fCB0aGlzLmlzRW50aXR5O1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBPYmplY3QuZnJlZXplKHtcbiAgICBVcDogMCxcbiAgICBSaWdodDogMSxcbiAgICBEb3duOiAyLFxuICAgIExlZnQ6IDNcbn0pO1xuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXNzZXRMb2FkZXIge1xuICBjb25zdHJ1Y3Rvcihjb250cm9sbGVyKSB7XG4gICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICB0aGlzLmF1ZGlvUGxheWVyID0gY29udHJvbGxlci5hdWRpb1BsYXllcjtcbiAgICB0aGlzLmdhbWUgPSBjb250cm9sbGVyLmdhbWU7XG4gICAgdGhpcy5hc3NldFJvb3QgPSBjb250cm9sbGVyLmFzc2V0Um9vdDtcblxuICAgIHRoaXMuYXNzZXRzID0ge1xuICAgICAgZW50aXR5U2hhZG93OiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9DaGFyYWN0ZXJfU2hhZG93LnBuZ2BcbiAgICAgIH0sXG4gICAgICBzZWxlY3Rpb25JbmRpY2F0b3I6IHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1NlbGVjdGlvbl9JbmRpY2F0b3IucG5nYFxuICAgICAgfSxcbiAgICAgIHNoYWRlTGF5ZXI6IHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1NoYWRlX0xheWVyLnBuZ2BcbiAgICAgIH0sXG4gICAgICB0YWxsR3Jhc3M6IHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1RhbGxHcmFzcy5wbmdgXG4gICAgICB9LFxuICAgICAgZmluaXNoT3ZlcmxheToge1xuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICBwYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvV2hpdGVSZWN0LnBuZ2BcbiAgICAgIH0sXG4gICAgICBiZWQ6IHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0JlZC5wbmdgXG4gICAgICB9LFxuICAgICAgcGxheWVyU3RldmU6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TdGV2ZS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1N0ZXZlLmpzb25gXG4gICAgICB9LFxuICAgICAgcGxheWVyQWxleDoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0FsZXgucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9BbGV4Lmpzb25gXG4gICAgICB9LFxuICAgICAgQU86IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9BTy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0FPLmpzb25gXG4gICAgICB9LFxuICAgICAgYmxvY2tTaGFkb3dzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQmxvY2tfU2hhZG93cy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Jsb2NrX1NoYWRvd3MuanNvbmBcbiAgICAgIH0sXG4gICAgICB1bmRlcmdyb3VuZEZvdzoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1VuZGVyZ3JvdW5kRm9XLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvVW5kZXJncm91bmRGb1cuanNvbmBcbiAgICAgIH0sXG4gICAgICBibG9ja3M6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja3MucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja3MuanNvbmBcbiAgICAgIH0sXG4gICAgICBsZWF2ZXNBY2FjaWE6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfQWNhY2lhX0RlY2F5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0FjYWNpYV9EZWNheS5qc29uYFxuICAgICAgfSxcbiAgICAgIGxlYXZlc0JpcmNoOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0JpcmNoX0RlY2F5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0JpcmNoX0RlY2F5Lmpzb25gXG4gICAgICB9LFxuICAgICAgbGVhdmVzSnVuZ2xlOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0p1bmdsZV9EZWNheS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19KdW5nbGVfRGVjYXkuanNvbmBcbiAgICAgIH0sXG4gICAgICBsZWF2ZXNPYWs6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfT2FrX0RlY2F5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX09ha19EZWNheS5qc29uYFxuICAgICAgfSxcbiAgICAgIGxlYXZlc1NwcnVjZToge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19TcHJ1Y2VfRGVjYXkucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfU3BydWNlX0RlY2F5Lmpzb25gXG4gICAgICB9LFxuICAgICAgc2hlZXA6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TaGVlcC5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1NoZWVwLmpzb25gXG4gICAgICB9LFxuICAgICAgY3JlZXBlcjoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0NyZWVwZXIucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9DcmVlcGVyLmpzb25gXG4gICAgICB9LFxuICAgICAgY3JvcHM6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9Dcm9wcy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Nyb3BzLmpzb25gXG4gICAgICB9LFxuICAgICAgdG9yY2g6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9Ub3JjaC5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1RvcmNoLmpzb25gXG4gICAgICB9LFxuICAgICAgZGVzdHJveU92ZXJsYXk6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9EZXN0cm95X092ZXJsYXkucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9EZXN0cm95X092ZXJsYXkuanNvbmBcbiAgICAgIH0sXG4gICAgICBibG9ja0V4cGxvZGU6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja0V4cGxvZGUucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja0V4cGxvZGUuanNvbmBcbiAgICAgIH0sXG4gICAgICBtaW5pbmdQYXJ0aWNsZXM6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9NaW5pbmdQYXJ0aWNsZXMucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9NaW5pbmdQYXJ0aWNsZXMuanNvbmBcbiAgICAgIH0sXG4gICAgICBtaW5pQmxvY2tzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTWluaWJsb2Nrcy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL01pbmlibG9ja3MuanNvbmBcbiAgICAgIH0sXG4gICAgICBsYXZhUG9wOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGF2YVBvcC5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xhdmFQb3AuanNvbmBcbiAgICAgIH0sXG4gICAgICBmaXJlOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRmlyZS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0ZpcmUuanNvbmBcbiAgICAgIH0sXG4gICAgICBidWJibGVzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQnViYmxlcy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0J1YmJsZXMuanNvbmBcbiAgICAgIH0sXG4gICAgICBleHBsb3Npb246IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9FeHBsb3Npb24ucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9FeHBsb3Npb24uanNvbmBcbiAgICAgIH0sXG4gICAgICBkb29yOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRG9vci5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Rvb3IuanNvbmBcbiAgICAgIH0sXG4gICAgICByYWlsczoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1JhaWxzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvUmFpbHMuanNvbmBcbiAgICAgIH0sXG4gICAgICB0bnQ6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9UTlQucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9UTlQuanNvbmBcbiAgICAgIH0sXG4gICAgICBkaWdfd29vZDE6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9kaWdfd29vZDEubXAzYCxcbiAgICAgICAgd2F2OiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9kaWdfd29vZDEud2F2YCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9kaWdfd29vZDEub2dnYFxuICAgICAgfSxcbiAgICAgIHN0ZXBHcmFzczoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3N0ZXBfZ3Jhc3MxLm1wM2AsXG4gICAgICAgIHdhdjogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vc3RlcF9ncmFzczEud2F2YCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zdGVwX2dyYXNzMS5vZ2dgXG4gICAgICB9LFxuICAgICAgc3RlcFdvb2Q6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby93b29kMi5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3dvb2QyLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzdGVwU3RvbmU6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zdG9uZTIubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zdG9uZTIub2dnYFxuICAgICAgfSxcbiAgICAgIHN0ZXBHcmF2ZWw6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9ncmF2ZWwxLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZ3JhdmVsMS5vZ2dgXG4gICAgICB9LFxuICAgICAgc3RlcEZhcm1sYW5kOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGg0Lm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGg0Lm9nZ2BcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vYnJlYWsubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9icmVhay5vZ2dgXG4gICAgICB9LFxuICAgICAgc3VjY2Vzczoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2xldmVsdXAubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9sZXZlbHVwLm9nZ2BcbiAgICAgIH0sXG4gICAgICBmYWxsOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZmFsbHNtYWxsLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZmFsbHNtYWxsLm9nZ2BcbiAgICAgIH0sXG4gICAgICBmdXNlOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZnVzZS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Z1c2Uub2dnYFxuICAgICAgfSxcbiAgICAgIGV4cGxvZGU6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9leHBsb2RlMy5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2V4cGxvZGUzLm9nZ2BcbiAgICAgIH0sXG4gICAgICBwbGFjZUJsb2NrOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGgxLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGgxLm9nZ2BcbiAgICAgIH0sXG4gICAgICBjb2xsZWN0ZWRCbG9jazoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3BvcC5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3BvcC5vZ2dgXG4gICAgICB9LFxuICAgICAgYnVtcDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2hpdDMubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9oaXQzLm9nZ2BcbiAgICAgIH0sXG4gICAgICBwdW5jaDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Nsb3RoMS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Nsb3RoMS5vZ2dgXG4gICAgICB9LFxuICAgICAgZml6ejoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2ZpenoubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9maXp6Lm9nZ2BcbiAgICAgIH0sXG4gICAgICBkb29yT3Blbjoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Rvb3Jfb3Blbi5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Rvb3Jfb3Blbi5vZ2dgXG4gICAgICB9LFxuICAgICAgaG91c2VTdWNjZXNzOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbGF1bmNoMS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2xhdW5jaDEub2dnYFxuICAgICAgfSxcbiAgICAgIG1pbmVjYXJ0OiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbWluZWNhcnRCYXNlLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbWluZWNhcnRCYXNlLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzaGVlcEJhYToge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3NheTMubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zYXkzLm9nZ2BcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5hc3NldFBhY2tzID0ge1xuICAgICAgbGV2ZWxPbmVBc3NldHM6IFtcbiAgICAgICAgJ2VudGl0eVNoYWRvdycsXG4gICAgICAgICdzZWxlY3Rpb25JbmRpY2F0b3InLFxuICAgICAgICAnc2hhZGVMYXllcicsXG4gICAgICAgICdBTycsXG4gICAgICAgICdibG9ja1NoYWRvd3MnLFxuICAgICAgICAnbGVhdmVzT2FrJyxcbiAgICAgICAgJ2xlYXZlc0JpcmNoJyxcbiAgICAgICAgJ3RhbGxHcmFzcycsXG4gICAgICAgICdibG9ja3MnLFxuICAgICAgICAnc2hlZXAnLFxuICAgICAgICAnYnVtcCcsXG4gICAgICAgICdzdGVwR3Jhc3MnLFxuICAgICAgICAnZmFpbHVyZScsXG4gICAgICAgICdzdWNjZXNzJ1xuICAgICAgXSxcbiAgICAgIGxldmVsVHdvQXNzZXRzOiBbXG4gICAgICAgICdlbnRpdHlTaGFkb3cnLFxuICAgICAgICAnc2VsZWN0aW9uSW5kaWNhdG9yJyxcbiAgICAgICAgJ3NoYWRlTGF5ZXInLFxuICAgICAgICAnQU8nLFxuICAgICAgICAnYmxvY2tTaGFkb3dzJyxcbiAgICAgICAgJ2xlYXZlc1NwcnVjZScsXG4gICAgICAgICd0YWxsR3Jhc3MnLFxuICAgICAgICAnYmxvY2tzJyxcbiAgICAgICAgJ3NoZWVwJyxcbiAgICAgICAgJ2J1bXAnLFxuICAgICAgICAnc3RlcEdyYXNzJyxcbiAgICAgICAgJ2ZhaWx1cmUnLFxuICAgICAgICAncGxheWVyU3RldmUnLFxuICAgICAgICAnc3VjY2VzcycsXG4gICAgICAgICdtaW5pQmxvY2tzJyxcbiAgICAgICAgJ2Jsb2NrRXhwbG9kZScsXG4gICAgICAgICdtaW5pbmdQYXJ0aWNsZXMnLFxuICAgICAgICAnZGVzdHJveU92ZXJsYXknLFxuICAgICAgICAnZGlnX3dvb2QxJyxcbiAgICAgICAgJ2NvbGxlY3RlZEJsb2NrJyxcbiAgICAgICAgJ3B1bmNoJyxcbiAgICAgIF0sXG4gICAgICBsZXZlbFRocmVlQXNzZXRzOiBbXG4gICAgICAgICdlbnRpdHlTaGFkb3cnLFxuICAgICAgICAnc2VsZWN0aW9uSW5kaWNhdG9yJyxcbiAgICAgICAgJ3NoYWRlTGF5ZXInLFxuICAgICAgICAnQU8nLFxuICAgICAgICAnYmxvY2tTaGFkb3dzJyxcbiAgICAgICAgJ2xlYXZlc09haycsXG4gICAgICAgICd0YWxsR3Jhc3MnLFxuICAgICAgICAnYmxvY2tzJyxcbiAgICAgICAgJ3NoZWVwJyxcbiAgICAgICAgJ2J1bXAnLFxuICAgICAgICAnc3RlcEdyYXNzJyxcbiAgICAgICAgJ2ZhaWx1cmUnLFxuICAgICAgICAncGxheWVyU3RldmUnLFxuICAgICAgICAnc3VjY2VzcycsXG4gICAgICAgICdtaW5pQmxvY2tzJyxcbiAgICAgICAgJ2Jsb2NrRXhwbG9kZScsXG4gICAgICAgICdtaW5pbmdQYXJ0aWNsZXMnLFxuICAgICAgICAnZGVzdHJveU92ZXJsYXknLFxuICAgICAgICAnZGlnX3dvb2QxJyxcbiAgICAgICAgJ2NvbGxlY3RlZEJsb2NrJyxcbiAgICAgICAgJ3NoZWVwQmFhJyxcbiAgICAgICAgJ3B1bmNoJyxcbiAgICAgIF0sXG4gICAgICBhbGxBc3NldHNNaW51c1BsYXllcjogW1xuICAgICAgICAnZW50aXR5U2hhZG93JyxcbiAgICAgICAgJ3NlbGVjdGlvbkluZGljYXRvcicsXG4gICAgICAgICdzaGFkZUxheWVyJyxcbiAgICAgICAgJ3RhbGxHcmFzcycsXG4gICAgICAgICdmaW5pc2hPdmVybGF5JyxcbiAgICAgICAgJ2JlZCcsXG4gICAgICAgICdBTycsXG4gICAgICAgICdibG9ja1NoYWRvd3MnLFxuICAgICAgICAndW5kZXJncm91bmRGb3cnLFxuICAgICAgICAnYmxvY2tzJyxcbiAgICAgICAgJ2xlYXZlc0FjYWNpYScsXG4gICAgICAgICdsZWF2ZXNCaXJjaCcsXG4gICAgICAgICdsZWF2ZXNKdW5nbGUnLFxuICAgICAgICAnbGVhdmVzT2FrJyxcbiAgICAgICAgJ2xlYXZlc1NwcnVjZScsXG4gICAgICAgICdzaGVlcCcsXG4gICAgICAgICdjcmVlcGVyJyxcbiAgICAgICAgJ2Nyb3BzJyxcbiAgICAgICAgJ3RvcmNoJyxcbiAgICAgICAgJ2Rlc3Ryb3lPdmVybGF5JyxcbiAgICAgICAgJ2Jsb2NrRXhwbG9kZScsXG4gICAgICAgICdtaW5pbmdQYXJ0aWNsZXMnLFxuICAgICAgICAnbWluaUJsb2NrcycsXG4gICAgICAgICdsYXZhUG9wJyxcbiAgICAgICAgJ2ZpcmUnLFxuICAgICAgICAnYnViYmxlcycsXG4gICAgICAgICdleHBsb3Npb24nLFxuICAgICAgICAnZG9vcicsXG4gICAgICAgICdyYWlscycsXG4gICAgICAgICd0bnQnLFxuICAgICAgICAnZGlnX3dvb2QxJyxcbiAgICAgICAgJ3N0ZXBHcmFzcycsXG4gICAgICAgICdzdGVwV29vZCcsXG4gICAgICAgICdzdGVwU3RvbmUnLFxuICAgICAgICAnc3RlcEdyYXZlbCcsXG4gICAgICAgICdzdGVwRmFybWxhbmQnLFxuICAgICAgICAnZmFpbHVyZScsXG4gICAgICAgICdzdWNjZXNzJyxcbiAgICAgICAgJ2ZhbGwnLFxuICAgICAgICAnZnVzZScsXG4gICAgICAgICdleHBsb2RlJyxcbiAgICAgICAgJ3BsYWNlQmxvY2snLFxuICAgICAgICAnY29sbGVjdGVkQmxvY2snLFxuICAgICAgICAnYnVtcCcsXG4gICAgICAgICdwdW5jaCcsXG4gICAgICAgICdmaXp6JyxcbiAgICAgICAgJ2Rvb3JPcGVuJyxcbiAgICAgICAgJ2hvdXNlU3VjY2VzcycsXG4gICAgICAgICdtaW5lY2FydCcsXG4gICAgICAgICdzaGVlcEJhYSdcbiAgICAgIF0sXG4gICAgICBwbGF5ZXJTdGV2ZTogW1xuICAgICAgICAncGxheWVyU3RldmUnXG4gICAgICBdLFxuICAgICAgcGxheWVyQWxleDogW1xuICAgICAgICAncGxheWVyQWxleCdcbiAgICAgIF0sXG4gICAgICBncmFzczogW1xuICAgICAgICAndGFsbEdyYXNzJ1xuICAgICAgXVxuICAgIH07XG4gIH1cblxuICBsb2FkUGFja3MocGFja0xpc3QpIHtcbiAgICBwYWNrTGlzdC5mb3JFYWNoKChwYWNrTmFtZSkgPT4ge1xuICAgICAgdGhpcy5sb2FkUGFjayhwYWNrTmFtZSk7XG4gICAgfSk7XG4gIH1cblxuICBsb2FkUGFjayhwYWNrTmFtZSkge1xuICAgIGxldCBwYWNrQXNzZXRzID0gdGhpcy5hc3NldFBhY2tzW3BhY2tOYW1lXTtcbiAgICB0aGlzLmxvYWRBc3NldHMocGFja0Fzc2V0cyk7XG4gIH1cblxuICBsb2FkQXNzZXRzKGFzc2V0TmFtZXMpIHtcbiAgICBhc3NldE5hbWVzLmZvckVhY2goKGFzc2V0S2V5KSA9PiB7XG4gICAgICBsZXQgYXNzZXRDb25maWcgPSB0aGlzLmFzc2V0c1thc3NldEtleV07XG4gICAgICB0aGlzLmxvYWRBc3NldChhc3NldEtleSwgYXNzZXRDb25maWcpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9hZEFzc2V0KGtleSwgY29uZmlnKSB7XG4gICAgc3dpdGNoKGNvbmZpZy50eXBlKSB7XG4gICAgICBjYXNlICdpbWFnZSc6XG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKGtleSwgY29uZmlnLnBhdGgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NvdW5kJzpcbiAgICAgICAgdGhpcy5hdWRpb1BsYXllci5yZWdpc3Rlcih7XG4gICAgICAgICAgaWQ6IGtleSxcbiAgICAgICAgICBtcDM6IGNvbmZpZy5tcDMsXG4gICAgICAgICAgb2dnOiBjb25maWcub2dnXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2F0bGFzSlNPTic6XG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzSlNPTkhhc2goa2V5LCBjb25maWcucG5nUGF0aCwgY29uZmlnLmpzb25QYXRoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBgQXNzZXQgJHtrZXl9IG5lZWRzIGNvbmZpZy50eXBlIHNldCBpbiBjb25maWd1cmF0aW9uLmA7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgQ29tbWFuZFF1ZXVlIGZyb20gXCIuLi9Db21tYW5kUXVldWUvQ29tbWFuZFF1ZXVlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9CYXNlQ29tbWFuZC5qc1wiO1xuaW1wb3J0IERlc3Ryb3lCbG9ja0NvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9EZXN0cm95QmxvY2tDb21tYW5kLmpzXCI7XG5pbXBvcnQgUGxhY2VCbG9ja0NvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9QbGFjZUJsb2NrQ29tbWFuZC5qc1wiO1xuaW1wb3J0IFBsYWNlSW5Gcm9udENvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9QbGFjZUluRnJvbnRDb21tYW5kLmpzXCI7XG5pbXBvcnQgTW92ZUZvcndhcmRDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvTW92ZUZvcndhcmRDb21tYW5kLmpzXCI7XG5pbXBvcnQgVHVybkNvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9UdXJuQ29tbWFuZC5qc1wiO1xuaW1wb3J0IFdoaWxlQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL1doaWxlQ29tbWFuZC5qc1wiO1xuaW1wb3J0IElmQmxvY2tBaGVhZENvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9JZkJsb2NrQWhlYWRDb21tYW5kLmpzXCI7XG5pbXBvcnQgQ2hlY2tTb2x1dGlvbkNvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9DaGVja1NvbHV0aW9uQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KGNvbnRyb2xsZXIpIHtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBDYWxsZWQgYmVmb3JlIGEgbGlzdCBvZiB1c2VyIGNvbW1hbmRzIHdpbGwgYmUgaXNzdWVkLlxuICAgICAqL1xuICAgIHN0YXJ0Q29tbWFuZENvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb2xsZWN0aW5nIGNvbW1hbmRzLlwiKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gYW4gYXR0ZW1wdCBzaG91bGQgYmUgc3RhcnRlZCwgYW5kIHRoZSBlbnRpcmUgc2V0IG9mXG4gICAgICogY29tbWFuZC1xdWV1ZSBBUEkgY2FsbHMgaGF2ZSBiZWVuIGlzc3VlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IG9uQXR0ZW1wdENvbXBsZXRlIC0gY2FsbGJhY2sgd2l0aCB0d28gcGFyYW1ldGVycyxcbiAgICAgKiBcInN1Y2Nlc3NcIiwgaS5lLiwgdHJ1ZSBpZiBhdHRlbXB0IHdhcyBzdWNjZXNzZnVsIChsZXZlbCBjb21wbGV0ZWQpLFxuICAgICAqIGZhbHNlIGlmIHVuc3VjY2Vzc2Z1bCAobGV2ZWwgbm90IGNvbXBsZXRlZCksIGFuZCB0aGUgY3VycmVudCBsZXZlbCBtb2RlbC5cbiAgICAgKi9cbiAgICBzdGFydEF0dGVtcHQ6IGZ1bmN0aW9uKG9uQXR0ZW1wdENvbXBsZXRlKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuT25Db21wbGV0ZUNhbGxiYWNrID0gb25BdHRlbXB0Q29tcGxldGU7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgQ2hlY2tTb2x1dGlvbkNvbW1hbmQoY29udHJvbGxlcikpO1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmJlZ2luKCk7XG4gICAgfSxcblxuICAgIHJlc2V0QXR0ZW1wdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucmVzZXQoKTtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5yZXNldCgpO1xuICAgICAgICBjb250cm9sbGVyLk9uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG4gICAgfSxcblxuICAgIG1vdmVGb3J3YXJkOiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IE1vdmVGb3J3YXJkQ29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaykpO1xuICAgIH0sXG5cbiAgICB0dXJuOiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaywgZGlyZWN0aW9uKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgVHVybkNvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JyA/IDEgOiAtMSkpO1xuICAgIH0sXG5cbiAgICB0dXJuUmlnaHQ6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgVHVybkNvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIDEpKTtcbiAgICB9LFxuXG4gICAgdHVybkxlZnQ6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgVHVybkNvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIC0xKSk7XG4gICAgfSxcblxuICAgIGRlc3Ryb3lCbG9jazogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2spIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBEZXN0cm95QmxvY2tDb21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKSk7XG4gICAgfSxcblxuICAgIHBsYWNlQmxvY2s6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUpIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBQbGFjZUJsb2NrQ29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlKSk7XG4gICAgfSxcblxuICAgIHBsYWNlSW5Gcm9udDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSkge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IFBsYWNlSW5Gcm9udENvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSkpO1xuICAgIH0sXG5cbiAgICB0aWxsU29pbDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2spIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBQbGFjZUluRnJvbnRDb21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCAnd2F0ZXJpbmcnKSk7XG4gICAgfSxcblxuICAgIHdoaWxlUGF0aEFoZWFkOiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlLCBjb2RlQmxvY2spIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBXaGlsZUNvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY29kZUJsb2NrKSk7XG4gICAgfSxcblxuICAgIGlmQmxvY2tBaGVhZDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY29kZUJsb2NrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgSWZCbG9ja0FoZWFkQ29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlLCBjb2RlQmxvY2spKTtcbiAgICB9LFxuXG4gICAgZ2V0U2NyZWVuc2hvdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjb250cm9sbGVyLmdldFNjcmVlbnNob3QoKTtcbiAgICB9XG4gIH07XG59XG4iLCJcbmltcG9ydCBDb21tYW5kU3RhdGUgZnJvbSBcIi4vQ29tbWFuZFN0YXRlLmpzXCI7XG5pbXBvcnQgQ29tbWFuZFF1ZXVlIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdoaWxlQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaXRlcmF0aW9uc0xlZnQgPSAxNTsgXG4gICAgICAgIHRoaXMuQmxvY2tUeXBlID0gYmxvY2tUeXBlO1xuICAgICAgICB0aGlzLldoaWxlQ29kZSA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLnF1ZXVlID0gbmV3IENvbW1hbmRRdWV1ZSh0aGlzKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZlxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuV09SS0lORyApIHtcbiAgICAgICAgICAgIC8vIHRpY2sgb3VyIGNvbW1hbmQgcXVldWVcbiAgICAgICAgICAgIHRoaXMucXVldWUudGljaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucXVldWUuaXNGYWlsZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5xdWV1ZS5pc1N1Y2NlZWRlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVdoaWxlQ2hlY2soKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICBpZiAodGhpcy5HYW1lQ29udHJvbGxlci5ERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJXSElMRSBjb21tYW5kOiBCRUdJTlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldHVwIHRoZSB3aGlsZSBjaGVjayB0aGUgZmlyc3QgdGltZVxuICAgICAgICB0aGlzLmhhbmRsZVdoaWxlQ2hlY2soKTtcbiAgICB9XG5cbiAgICBoYW5kbGVXaGlsZUNoZWNrKCkge1xuICAgICAgICBpZiAodGhpcy5pdGVyYXRpb25zTGVmdCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5HYW1lQ29udHJvbGxlci5pc1BhdGhBaGVhZCh0aGlzLkJsb2NrVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMucXVldWUucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucXVldWUuc2V0V2hpbGVDb21tYW5kSW5zZXJ0U3RhdGUodGhpcy5xdWV1ZSk7XG4gICAgICAgICAgICB0aGlzLldoaWxlQ29kZSgpO1xuICAgICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5xdWV1ZS5zZXRXaGlsZUNvbW1hbmRJbnNlcnRTdGF0ZShudWxsKTtcbiAgICAgICAgICAgIHRoaXMucXVldWUuYmVnaW4oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXRlcmF0aW9uc0xlZnQtLTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBXaGlsZSBjb21tYW5kOiBJdGVyYXRpb25zbGVmdCAgICR7dGhpcy5pdGVyYXRpb25zTGVmdH0gYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR1cm5Db21tYW5kIGV4dGVuZHMgQmFzZUNvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgZGlyZWN0aW9uKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLkRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZj8/XG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICBpZiAodGhpcy5HYW1lQ29udHJvbGxlci5ERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFRVUk4gY29tbWFuZDogQkVHSU4gdHVybmluZyAke3RoaXMuRGlyZWN0aW9ufSAgYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci50dXJuKHRoaXMsIHRoaXMuRGlyZWN0aW9uKTtcbiAgICB9XG5cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYWNlSW5Gcm9udENvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUpIHtcbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuQmxvY2tUeXBlID0gYmxvY2tUeXBlO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgICAgIC8vIGRvIHN0dWZmPz9cbiAgICB9XG4gICAgXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIHN1cGVyLmJlZ2luKCk7XG4gICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucGxhY2VCbG9ja0ZvcndhcmQodGhpcywgdGhpcy5CbG9ja1R5cGUpO1xuICAgIH1cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYWNlQmxvY2tDb21tYW5kIGV4dGVuZHMgQmFzZUNvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLkJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZj8/XG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLnBsYWNlQmxvY2sodGhpcywgdGhpcy5CbG9ja1R5cGUpO1xuICAgIH1cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmVGb3J3YXJkQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spIHtcblxuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgICAgIC8vIGRvIHN0dWZmXG4gICAgfVxuXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIHN1cGVyLmJlZ2luKCk7XG4gICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIubW92ZUZvcndhcmQodGhpcyk7XG4gICAgfVxuXG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBDb21tYW5kUXVldWUgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4vQmFzZUNvbW1hbmQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSWZCbG9ja0FoZWFkQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcblxuICAgICAgICB0aGlzLmJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcbiAgICAgICAgdGhpcy5pZkNvZGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHRoaXMucXVldWUgPSBuZXcgQ29tbWFuZFF1ZXVlKHRoaXMpO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuV09SS0lORyApIHtcbiAgICAgICAgICAgIC8vIHRpY2sgb3VyIGNvbW1hbmQgcXVldWVcbiAgICAgICAgICAgIHRoaXMucXVldWUudGljaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucXVldWUuaXNGYWlsZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucXVldWUuaXNTdWNjZWVkZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5TVUNDRVNTO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV0hJTEUgY29tbWFuZDogQkVHSU5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXR1cCB0aGUgXCJpZlwiIGNoZWNrXG4gICAgICAgIHRoaXMuaGFuZGxlSWZDaGVjaygpO1xuICAgIH1cblxuICAgIGhhbmRsZUlmQ2hlY2soKSB7XG4gICAgICAgIGlmICh0aGlzLkdhbWVDb250cm9sbGVyLmlzUGF0aEFoZWFkKHRoaXMuYmxvY2tUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5xdWV1ZS5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5xdWV1ZS5zZXRXaGlsZUNvbW1hbmRJbnNlcnRTdGF0ZSh0aGlzLnF1ZXVlKTtcbiAgICAgICAgICAgIHRoaXMuaWZDb2RlQ2FsbGJhY2soKTsgLy8gaW5zZXJ0cyBjb21tYW5kcyB2aWEgQ29kZU9yZ0FQSVxuICAgICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5xdWV1ZS5zZXRXaGlsZUNvbW1hbmRJbnNlcnRTdGF0ZShudWxsKTtcbiAgICAgICAgICAgIHRoaXMucXVldWUuYmVnaW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG4iLCJcbmltcG9ydCBDb21tYW5kU3RhdGUgZnJvbSBcIi4vQ29tbWFuZFN0YXRlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4vQmFzZUNvbW1hbmQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVzdHJveUJsb2NrQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spIHtcblxuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgICAgIC8vIGRvIHN0dWZmXG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLmRlc3Ryb3lCbG9jayh0aGlzKTtcbiAgICB9XG5cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IENvbW1hbmRRdWV1ZSBmcm9tIFwiLi9Db21tYW5kUXVldWUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGVja1NvbHV0aW9uQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlcikge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZ2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgc29sdmUgY29tbWFuZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgZHVtbXlGdW5jKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZlxuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU29sdmUgY29tbWFuZDogQkVHSU5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuR2FtZUNvbnRyb2xsZXIuY2hlY2tTb2x1dGlvbih0aGlzKTtcbiAgICB9XG5cbn1cblxuIiwiaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kXCI7XG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyKSB7XG4gICAgdGhpcy5nYW1lQ29udHJvbGxlciA9IGdhbWVDb250cm9sbGVyO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWVDb250cm9sbGVyLmdhbWU7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgYWRkQ29tbWFuZChjb21tYW5kKSB7XG4gICAgLy8gaWYgd2UncmUgaGFuZGxpbmcgYSB3aGlsZSBjb21tYW5kLCBhZGQgdG8gdGhlIHdoaWxlIGNvbW1hbmQncyBxdWV1ZSBpbnN0ZWFkIG9mIHRoaXMgcXVldWVcbiAgICBpZiAodGhpcy53aGlsZUNvbW1hbmRRdWV1ZSkge1xuICAgICAgdGhpcy53aGlsZUNvbW1hbmRRdWV1ZS5hZGRDb21tYW5kKGNvbW1hbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbW1hbmRMaXN0Xy5wdXNoKGNvbW1hbmQpO1xuICAgIH1cbiAgfVxuXG4gIHNldFdoaWxlQ29tbWFuZEluc2VydFN0YXRlKHF1ZXVlKSB7XG4gICAgdGhpcy53aGlsZUNvbW1hbmRRdWV1ZSA9IHF1ZXVlO1xuICB9XG5cbiAgYmVnaW4oKSB7XG4gICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5XT1JLSU5HO1xuICAgIGlmICh0aGlzLmdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkRlYnVnIFF1ZXVlOiBCRUdJTlwiKTtcbiAgICB9XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLk5PVF9TVEFSVEVEO1xuICAgIHRoaXMuY3VycmVudENvbW1hbmQgPSBudWxsO1xuICAgIHRoaXMuY29tbWFuZExpc3RfID0gW107XG4gICAgaWYgKHRoaXMud2hpbGVDb21tYW5kUXVldWUpIHtcbiAgICAgIHRoaXMud2hpbGVDb21tYW5kUXVldWUucmVzZXQoKTtcbiAgICB9XG4gICAgdGhpcy53aGlsZUNvbW1hbmRRdWV1ZSA9IG51bGw7XG4gIH1cblxuICB0aWNrKCkge1xuICAgIGlmICh0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuV09SS0lORykge1xuICAgICAgaWYgKCF0aGlzLmN1cnJlbnRDb21tYW5kKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbW1hbmRMaXN0Xy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudENvbW1hbmQgPSB0aGlzLmNvbW1hbmRMaXN0Xy5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuY3VycmVudENvbW1hbmQuaXNTdGFydGVkKCkpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q29tbWFuZC5iZWdpbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q29tbWFuZC50aWNrKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIGlmIGNvbW1hbmQgaXMgZG9uZVxuICAgICAgaWYgKHRoaXMuY3VycmVudENvbW1hbmQuaXNTdWNjZWVkZWQoKSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRDb21tYW5kID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50Q29tbWFuZC5pc0ZhaWxlZCgpKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgc3RhcnRlZCB3b3JraW5nLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU3RhcnRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSAhPT0gQ29tbWFuZFN0YXRlLk5PVF9TVEFSVEVEO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIHN1Y2NlZWRlZCBvciBmYWlsZWQsIGFuZCBpc1xuICAgKiBmaW5pc2hlZCB3aXRoIGl0cyB3b3JrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRmluaXNoZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNTdWNjZWVkZWQoKSB8fCB0aGlzLmlzRmFpbGVkKCk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgZmluaXNoZWQgd2l0aCBpdHMgd29yayBhbmQgcmVwb3J0ZWQgc3VjY2Vzcy5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1N1Y2NlZWRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgZmluaXNoZWQgd2l0aCBpdHMgd29yayBhbmQgcmVwb3J0ZWQgZmFpbHVyZS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0ZhaWxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gIH1cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIgPSBnYW1lQ29udHJvbGxlcjtcbiAgICAgICAgdGhpcy5HYW1lID0gZ2FtZUNvbnRyb2xsZXIuZ2FtZTtcbiAgICAgICAgdGhpcy5IaWdobGlnaHRDYWxsYmFjayA9IGhpZ2hsaWdodENhbGxiYWNrO1xuICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLk5PVF9TVEFSVEVEO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBpZiAodGhpcy5IaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICAgICAgdGhpcy5IaWdobGlnaHRDYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuV09SS0lORztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBzdGFydGVkIHdvcmtpbmcuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTdGFydGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSAhPSBDb21tYW5kU3RhdGUuTk9UX1NUQVJURUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgc3VjY2VlZGVkIG9yIGZhaWxlZCwgYW5kIGlzXG4gICAgICogZmluaXNoZWQgd2l0aCBpdHMgd29yay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0ZpbmlzaGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1N1Y2NlZWRlZCgpIHx8IHRoaXMuaXNGYWlsZWQoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgZmluaXNoZWQgd2l0aCBpdHMgd29yayBhbmQgcmVwb3J0ZWQgc3VjY2Vzcy5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgIGlzU3VjY2VlZGVkKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuc3RhdGUgPT09IENvbW1hbmRTdGF0ZS5TVUNDRVNTKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBmaW5pc2hlZCB3aXRoIGl0cyB3b3JrIGFuZCByZXBvcnRlZCBmYWlsdXJlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgaXNGYWlsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgIH1cblxuICAgc3VjY2VlZGVkKCkge1xuICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgIH1cbiAgICBcbiAgIGZhaWxlZCgpIHtcbiAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gICB9XG59XG5cbiIsIlxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmZyZWV6ZSh7XG4gICAgTk9UX1NUQVJURUQ6IDAsXG4gICAgV09SS0lORzogMSxcbiAgICBTVUNDRVNTOiAyLFxuICAgIEZBSUxVUkU6IDNcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIiBpZD1cImdldHRpbmctc3RhcnRlZC1oZWFkZXJcIj5MZXRcXCdzIGdldCBzdGFydGVkLjwvaDE+XFxuXFxuPGgyIGlkPVwic2VsZWN0LWNoYXJhY3Rlci10ZXh0XCI+Q2hvb3NlIHlvdXIgY2hhcmFjdGVyLjwvaDI+XFxuXFxuPGRpdiBpZD1cImNob29zZS1jaGFyYWN0ZXItY29udGFpbmVyXCI+XFxuICA8ZGl2IGNsYXNzPVwibWluZWNyYWZ0LWNoYXJhY3RlclwiIGlkPVwiY2hvb3NlLXN0ZXZlXCI+XFxuICAgIDxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiPlN0ZXZlPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cImNoYXJhY3Rlci1wb3J0cmFpdFwiIGlkPVwic3RldmUtcG9ydHJhaXRcIj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNob29zZS1jaGFyYWN0ZXItYnV0dG9uXCIgaWQ9XCJjaG9vc2Utc3RldmUtc2VsZWN0XCI+U2VsZWN0PC9kaXY+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtaW5lY3JhZnQtY2hhcmFjdGVyXCIgaWQ9XCJjaG9vc2UtYWxleFwiPlxcbiAgICA8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIj5BbGV4PC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cImNoYXJhY3Rlci1wb3J0cmFpdFwiIGlkPVwiYWxleC1wb3J0cmFpdFwiPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiY2hvb3NlLWNoYXJhY3Rlci1idXR0b25cIiBpZD1cImNob29zZS1hbGV4LXNlbGVjdFwiPlNlbGVjdDwvZGl2PlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBpZD1cImNsb3NlLWNoYXJhY3Rlci1zZWxlY3RcIj48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiIGlkPVwiZ2V0dGluZy1zdGFydGVkLWhlYWRlclwiPkxldFxcJ3MgYnVpbGQgYSBob3VzZS48L2gxPlxcblxcbjxoMiBpZD1cInNlbGVjdC1ob3VzZS10ZXh0XCI+Q2hvb3NlIHRoZSBmbG9vciBwbGFuIGZvciB5b3VyIGhvdXNlLjwvaDI+XFxuXFxuPGRpdiBpZD1cImNob29zZS1ob3VzZS1jb250YWluZXJcIj5cXG4gIDxkaXYgY2xhc3M9XCJtaW5lY3JhZnQtaG91c2VcIiBpZD1cImNob29zZS1ob3VzZS1hXCI+XFxuICAgIDxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiPkVhc3k8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVwiaG91c2Utb3V0bGluZS1jb250YWluZXJcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVwiaG91c2UtcGhvdG9cIiBpZD1cImhvdXNlLWEtcGljdHVyZVwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNob29zZS1ob3VzZS1idXR0b25cIj5TZWxlY3Q8L2Rpdj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cIm1pbmVjcmFmdC1ob3VzZVwiIGlkPVwiY2hvb3NlLWhvdXNlLWJcIj5cXG4gICAgPGgxIGNsYXNzPVwibWluZWNyYWZ0LWJpZy15ZWxsb3ctaGVhZGVyXCI+TWVkaXVtPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cImhvdXNlLW91dGxpbmUtY29udGFpbmVyXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cImhvdXNlLXBob3RvXCIgaWQ9XCJob3VzZS1iLXBpY3R1cmVcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJjaG9vc2UtaG91c2UtYnV0dG9uXCI+U2VsZWN0PC9kaXY+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtaW5lY3JhZnQtaG91c2VcIiBpZD1cImNob29zZS1ob3VzZS1jXCI+XFxuICAgIDxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiPkhhcmQ8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVwiaG91c2Utb3V0bGluZS1jb250YWluZXJcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVwiaG91c2UtcGhvdG9cIiBpZD1cImhvdXNlLWMtcGljdHVyZVwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNob29zZS1ob3VzZS1idXR0b25cIj5TZWxlY3Q8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgaWQ9XCJjbG9zZS1ob3VzZS1zZWxlY3RcIj48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG5cXG48ZGl2IGlkPVwicmlnaHQtYnV0dG9uLWNlbGxcIj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDUsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg1LCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cXG48IS0tIFRoaXMgaXMgYSBjb21tZW50IHVuaXF1ZSB0byBDcmFmdCAtLT5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBibG9ja3NUb0Rpc3BsYXlUZXh0ID0ge1xuICBiZWRyb2NrOiAnYmVkcm9jaycsXG4gIGJyaWNrczogJ2JyaWNrcycsXG4gIGNsYXk6ICdjbGF5JyxcbiAgb3JlQ29hbDogJ2NvYWwgb3JlJyxcbiAgZGlydENvYXJzZTogJ2NvYXJzZSBkaXJ0JyxcbiAgY29iYmxlc3RvbmU6ICdjb2JibGVzdG9uZScsXG4gIG9yZURpYW1vbmQ6ICdkaWFtb25kIG9yZScsXG4gIGRpcnQ6ICdkaXJ0JyxcbiAgb3JlRW1lcmFsZDogJ2VtZXJhbGQgb3JlJyxcbiAgZmFybWxhbmRXZXQ6ICdmYXJtbGFuZCcsXG4gIGdsYXNzOiAnZ2xhc3MnLFxuICBvcmVHb2xkOiAnZ29sZCBvcmUnLFxuICBncmFzczogJ2dyYXNzJyxcbiAgZ3JhdmVsOiAnZ3JhdmVsJyxcbiAgY2xheUhhcmRlbmVkOiAnaGFyZGVuZWQgY2xheScsXG4gIG9yZUlyb246ICdpcm9uIG9yZScsXG4gIG9yZUxhcGlzOiAnbGFwaXMgb3JlJyxcbiAgbGF2YTogJ2xhdmEnLFxuICBsb2dBY2FjaWE6ICdhY2FjaWEgbG9nJyxcbiAgbG9nQmlyY2g6ICdiaXJjaCBsb2cnLFxuICBsb2dKdW5nbGU6ICdqdW5nbGUgbG9nJyxcbiAgbG9nT2FrOiAnb2FrIGxvZycsXG4gIGxvZ1NwcnVjZTogJ3NwcnVjZSBsb2cnLFxuICBwbGFua3NBY2FjaWE6ICdhY2FjaWEgcGxhbmtzJyxcbiAgcGxhbmtzQmlyY2g6ICdiaXJjaCBwbGFua3MnLFxuICBwbGFua3NKdW5nbGU6ICdqdW5nbGUgcGxhbmtzJyxcbiAgcGxhbmtzT2FrOiAnb2FrIHBsYW5rcycsXG4gIHBsYW5rc1NwcnVjZTogJ3NwcnVjZSBwbGFua3MnLFxuICBvcmVSZWRzdG9uZTogJ3JlZHN0b25lIG9yZScsXG4gIHJhaWw6ICdyYWlsJyxcbiAgc2FuZDogJ3NhbmQnLFxuICBzYW5kc3RvbmU6ICdzYW5kc3RvbmUnLFxuICBzdG9uZTogJ3N0b25lJyxcbiAgdG50OiAndG50JyxcbiAgdHJlZTogJ3RyZWUnLFxuICB3YXRlcjogJ3dhdGVyJyxcbiAgd29vbDogJ3dvb2wnLFxuICAnJzogJ2VtcHR5J1xufTtcblxudmFyIGFsbEJsb2NrcyA9IFtcbiAgJ2JlZHJvY2snLFxuICAnYnJpY2tzJyxcbiAgJ2NsYXknLFxuICAnb3JlQ29hbCcsXG4gICdkaXJ0Q29hcnNlJyxcbiAgJ2NvYmJsZXN0b25lJyxcbiAgJ29yZURpYW1vbmQnLFxuICAnZGlydCcsXG4gICdvcmVFbWVyYWxkJyxcbiAgJ2Zhcm1sYW5kV2V0JyxcbiAgJ2dsYXNzJyxcbiAgJ29yZUdvbGQnLFxuICAnZ3Jhc3MnLFxuICAnZ3JhdmVsJyxcbiAgJ2NsYXlIYXJkZW5lZCcsXG4gICdvcmVJcm9uJyxcbiAgJ29yZUxhcGlzJyxcbiAgJ2xhdmEnLFxuICAnbG9nQWNhY2lhJyxcbiAgJ2xvZ0JpcmNoJyxcbiAgJ2xvZ0p1bmdsZScsXG4gICdsb2dPYWsnLFxuICAnbG9nU3BydWNlJyxcbiAgJ3BsYW5rc0FjYWNpYScsXG4gICdwbGFua3NCaXJjaCcsXG4gICdwbGFua3NKdW5nbGUnLFxuICAncGxhbmtzT2FrJyxcbiAgJ3BsYW5rc1NwcnVjZScsXG4gICdvcmVSZWRzdG9uZScsXG4gICdzYW5kJyxcbiAgJ3NhbmRzdG9uZScsXG4gICdzdG9uZScsXG4gICd0bnQnLFxuICAndHJlZScsXG4gICd3b29sJ107XG5cbmZ1bmN0aW9uIGtleXNUb0Ryb3Bkb3duT3B0aW9ucyhrZXlzTGlzdCkge1xuICByZXR1cm4ga2V5c0xpc3QubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZGlzcGxheVRleHQgPSAoYmxvY2tzVG9EaXNwbGF5VGV4dFtrZXldIHx8IGtleSk7XG4gICAgcmV0dXJuIFtkaXNwbGF5VGV4dCwga2V5XTtcbiAgfSk7XG59XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24gKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIGRyb3Bkb3duQmxvY2tzID0gKGJsb2NrSW5zdGFsbE9wdGlvbnMubGV2ZWwuYXZhaWxhYmxlQmxvY2tzIHx8IFtdKS5jb25jYXQoXG4gICAgSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWZ0UGxheWVySW52ZW50b3J5JykpIHx8IFtdKTtcblxuICB2YXIgZHJvcGRvd25CbG9ja1NldCA9IHt9O1xuXG4gIGRyb3Bkb3duQmxvY2tzLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgIGRyb3Bkb3duQmxvY2tTZXRbdHlwZV0gPSB0cnVlO1xuICB9KTtcblxuICB2YXIgY3JhZnRCbG9ja09wdGlvbnMgPSB7XG4gICAgaW52ZW50b3J5QmxvY2tzOiBPYmplY3Qua2V5cyhkcm9wZG93bkJsb2NrU2V0KSxcbiAgICBpZkJsb2NrT3B0aW9uczogYmxvY2tJbnN0YWxsT3B0aW9ucy5sZXZlbC5pZkJsb2NrT3B0aW9ucyxcbiAgICBwbGFjZUJsb2NrT3B0aW9uczogYmxvY2tJbnN0YWxsT3B0aW9ucy5sZXZlbC5wbGFjZUJsb2NrT3B0aW9uc1xuICB9O1xuXG4gIHZhciBpbnZlbnRvcnlCbG9ja3NFbXB0eSA9ICFjcmFmdEJsb2NrT3B0aW9ucy5pbnZlbnRvcnlCbG9ja3MgfHxcbiAgICAgIGNyYWZ0QmxvY2tPcHRpb25zLmludmVudG9yeUJsb2Nrcy5sZW5ndGggPT09IDA7XG4gIHZhciBhbGxEcm9wZG93bkJsb2NrcyA9IGludmVudG9yeUJsb2Nrc0VtcHR5ID9cbiAgICAgIGFsbEJsb2NrcyA6IGNyYWZ0QmxvY2tPcHRpb25zLmludmVudG9yeUJsb2NrcztcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9tb3ZlRm9yd2FyZCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChcIm1vdmUgZm9yd2FyZFwiKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9tb3ZlRm9yd2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnbW92ZUZvcndhcmQoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfdHVybiA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL1R1cm4nLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfdHVybi5ESVJFQ1RJT05TID1cbiAgICAgIFtbXCJ0dXJuIGxlZnRcIiArICcgXFx1MjFCQScsICdsZWZ0J10sXG4gICAgICAgW1widHVybiByaWdodFwiICsgJyBcXHUyMUJCJywgJ3JpZ2h0J11dO1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3R1cm4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIGRpciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJyk7XG4gICAgdmFyIG1ldGhvZENhbGwgPSBkaXIgPT09IFwibGVmdFwiID8gXCJ0dXJuTGVmdFwiIDogXCJ0dXJuUmlnaHRcIjtcbiAgICByZXR1cm4gbWV0aG9kQ2FsbCArICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X2Rlc3Ryb3lCbG9jayA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChcImRlc3Ryb3kgYmxvY2tcIikpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfZGVzdHJveUJsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdkZXN0cm95QmxvY2soXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3NoZWFyID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKFwic2hlYXJcIikpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfc2hlYXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ3NoZWFyKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF93aGlsZUJsb2NrQWhlYWQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRyb3Bkb3duT3B0aW9ucyA9IGtleXNUb0Ryb3Bkb3duT3B0aW9ucyhjcmFmdEJsb2NrT3B0aW9ucy5pZkJsb2NrT3B0aW9ucyB8fCBhbGxEcm9wZG93bkJsb2Nrcyk7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKGRyb3Bkb3duT3B0aW9ucyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZShkcm9wZG93bk9wdGlvbnNbMF1bMV0pO1xuXG4gICAgICB0aGlzLnNldEhTVigzMjIsIDAuOTAsIDAuOTUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJ3aGlsZVwiKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1RZUEUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShcImFoZWFkXCIpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShcImRvXCIpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfd2hpbGVCbG9ja0FoZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlubmVyQ29kZSA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgYmxvY2tUeXBlID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdUWVBFJyk7XG4gICAgcmV0dXJuICd3aGlsZUJsb2NrQWhlYWQoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnLFxcblwiJyArXG4gICAgICAgICAgICBibG9ja1R5cGUgKyAnXCIsICcgK1xuICAgICAgICAnICBmdW5jdGlvbigpIHsgJytcbiAgICAgICAgICAgIGlubmVyQ29kZSArXG4gICAgICAgICcgIH0nICtcbiAgICAgICAgJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9pZkJsb2NrQWhlYWQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRyb3Bkb3duT3B0aW9ucyA9IGtleXNUb0Ryb3Bkb3duT3B0aW9ucyhjcmFmdEJsb2NrT3B0aW9ucy5pZkJsb2NrT3B0aW9ucyB8fCBhbGxEcm9wZG93bkJsb2Nrcyk7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKGRyb3Bkb3duT3B0aW9ucyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZShkcm9wZG93bk9wdGlvbnNbMF1bMV0pO1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJpZlwiKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1RZUEUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShcImFoZWFkXCIpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShcImRvXCIpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfaWZCbG9ja0FoZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlubmVyQ29kZSA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgYmxvY2tUeXBlID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdUWVBFJyk7XG4gICAgcmV0dXJuICdpZkJsb2NrQWhlYWQoXCInICsgYmxvY2tUeXBlICsgJ1wiLCBmdW5jdGlvbigpIHtcXG4nICtcbiAgICAgIGlubmVyQ29kZSArXG4gICAgJ30sIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X2lmTGF2YUFoZWFkID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKFwiaWYgbGF2YSBhaGVhZFwiKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJkb1wiKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X2lmTGF2YUFoZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlubmVyQ29kZSA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICByZXR1cm4gJ2lmTGF2YUFoZWFkKGZ1bmN0aW9uKCkge1xcbicgK1xuICAgICAgaW5uZXJDb2RlICtcbiAgICAnfSwgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3BsYWNlQmxvY2sgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRyb3Bkb3duT3B0aW9ucyA9IGtleXNUb0Ryb3Bkb3duT3B0aW9ucyhjcmFmdEJsb2NrT3B0aW9ucy5wbGFjZUJsb2NrT3B0aW9ucyB8fCBhbGxEcm9wZG93bkJsb2Nrcyk7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKGRyb3Bkb3duT3B0aW9ucyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZShkcm9wZG93bk9wdGlvbnNbMF1bMV0pO1xuXG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJwbGFjZVwiKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1RZUEUnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3BsYWNlQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYmxvY2tUeXBlID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdUWVBFJyk7XG4gICAgcmV0dXJuICdwbGFjZUJsb2NrKFwiJyArIGJsb2NrVHlwZSArICdcIiwgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3BsYWNlVG9yY2ggPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKFwicGxhY2UgdG9yY2hcIik7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9wbGFjZVRvcmNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdwbGFjZVRvcmNoKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9wbGFudENyb3AgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKCdwbGFudCBjcm9wJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9wbGFudENyb3AgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ3BsYW50Q3JvcChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfdGlsbFNvaWwgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKCd0aWxsIHNvaWwnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3RpbGxTb2lsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICd0aWxsU29pbChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfcGxhY2VCbG9ja0FoZWFkID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkcm9wZG93bk9wdGlvbnMgPSBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoY3JhZnRCbG9ja09wdGlvbnMucGxhY2VCbG9ja09wdGlvbnMgfHwgYWxsRHJvcGRvd25CbG9ja3MpO1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihkcm9wZG93bk9wdGlvbnMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUoZHJvcGRvd25PcHRpb25zWzBdWzFdKTtcblxuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKFwicGxhY2VcIilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdUWVBFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJhaGVhZFwiKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3BsYWNlQmxvY2tBaGVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBibG9ja1R5cGUgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1RZUEUnKTtcbiAgICByZXR1cm4gJ3BsYWNlQmxvY2tBaGVhZChcIicgKyBibG9ja1R5cGUgKyAnXCIsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJaUlzSW1acGJHVWlPaUppZFdsc1pDOXFjeTlqY21GbWRDOWhjR2t1YW5NaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNlcxMTkiXX0=
