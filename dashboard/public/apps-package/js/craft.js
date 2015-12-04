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
/* global trackEvent */

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
var MusicController = require('../MusicController');

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
  DEFAULT: [MEDIA_URL + "Sliced_Parts/MC_Loading_Spinner.gif", MEDIA_URL + "Sliced_Parts/Frame_Large_Plus_Logo.png", MEDIA_URL + "Sliced_Parts/Pop_Up_Slice.png", MEDIA_URL + "Sliced_Parts/X_Button.png", MEDIA_URL + "Sliced_Parts/Button_Grey_Slice.png", MEDIA_URL + "Sliced_Parts/Run_Button_Up_Slice.png", MEDIA_URL + "Sliced_Parts/MC_Run_Arrow_Icon.png", MEDIA_URL + "Sliced_Parts/Run_Button_Down_Slice.png", MEDIA_URL + "Sliced_Parts/Reset_Button_Up_Slice.png", MEDIA_URL + "Sliced_Parts/MC_Reset_Arrow_Icon.png", MEDIA_URL + "Sliced_Parts/Reset_Button_Down_Slice.png", MEDIA_URL + "Sliced_Parts/Callout_Tail.png"],
  1: [MEDIA_URL + "Sliced_Parts/Steve_Character_Select.png", MEDIA_URL + "Sliced_Parts/Alex_Character_Select.png", characters.Steve.staticAvatar, characters.Steve.smallStaticAvatar, characters.Alex.staticAvatar, characters.Alex.smallStaticAvatar],
  2: [
  // TODO(bjordan): find different pre-load point for feedback images,
  // bucket by selected character
  characters.Alex.winAvatar, characters.Steve.winAvatar, characters.Alex.failureAvatar, characters.Steve.failureAvatar],
  6: [MEDIA_URL + "Sliced_Parts/House_Option_A_v3.png", MEDIA_URL + "Sliced_Parts/House_Option_B_v3.png", MEDIA_URL + "Sliced_Parts/House_Option_C_v3.png"]
};

var MUSIC_METADATA = [{ volume: 1, hasOgg: true, name: "vignette1" }, { volume: 1, hasOgg: true, name: "vignette2-quiet" }, { volume: 1, hasOgg: true, name: "vignette3" }, { volume: 1, hasOgg: true, name: "vignette4-intro" }, { volume: 1, hasOgg: true, name: "vignette5-shortpiano" }, { volume: 1, hasOgg: true, name: "vignette7-funky-chirps-short" }, { volume: 1, hasOgg: true, name: "vignette8-free-play" }];

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
      var event = document.createEvent('Event');
      event.initEvent('instructionsShown', true, true);
      document.dispatchEvent(event);

      if (config.level.showPopupOnLoad === 'playerSelection') {
        Craft.showPlayerSelectionPopup(function (selectedPlayer) {
          trackEvent('Minecraft', 'ChoseCharacter', selectedPlayer);
          Craft.clearPlayerState();
          trySetLocalStorageItem('craftSelectedPlayer', selectedPlayer);
          Craft.updateUIForCharacter(selectedPlayer);
          Craft.initializeAppLevel(config.level);
          showInstructions();
        });
      } else if (config.level.showPopupOnLoad === 'houseLayoutSelection') {
        Craft.showHouseSelectionPopup(function (selectedHouse) {
          trackEvent('Minecraft', 'ChoseHouse', selectedHouse);
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

  var levelTracks = [];
  if (Craft.level.songs && MUSIC_METADATA) {
    levelTracks = MUSIC_METADATA.filter(function (trackMetadata) {
      return Craft.level.songs.indexOf(trackMetadata.name) !== -1;
    });
  }

  Craft.musicController = new MusicController(studioApp.cdoSounds, function (filename) {
    return config.skin.assetUrl('music/' + filename);
  }, levelTracks, levelTracks.length > 1 ? 7500 : null);

  // Play music when the instructions are shown
  var playOnce = function playOnce() {
    document.removeEventListener('instructionsHidden', playOnce);
    if (studioApp.cdoSounds) {
      studioApp.cdoSounds.whenAudioUnlocked(function () {
        var hasSongInLevel = Craft.level.songs && Craft.level.songs.length > 1;
        var songToPlayFirst = hasSongInLevel ? Craft.level.songs[0] : null;
        Craft.musicController.play(songToPlayFirst);
      });
    }
  };
  document.addEventListener('instructionsHidden', playOnce);

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
    appStrings: {
      generatedCodeDescription: craftMsg.generatedCodeDescription()
    },
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
        afterAssetsLoaded: function afterAssetsLoaded() {
          // preload music after essential game asset downloads completely finished
          Craft.musicController.preload();
        },
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

  var interfaceImagesToLoad = [];
  interfaceImagesToLoad = interfaceImagesToLoad.concat(interfaceImages.DEFAULT);

  if (config.level.puzzle_number && interfaceImages[config.level.puzzle_number]) {
    interfaceImagesToLoad = interfaceImagesToLoad.concat(interfaceImages[config.level.puzzle_number]);
  }

  interfaceImagesToLoad.forEach(function (url) {
    preloadImage(url);
  });

  var shareButton = $('.mc-share-button');
  if (shareButton.length) {
    dom.addClickTouchEvent(shareButton[0], function () {
      Craft.reportResult(true);
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

  if (Craft.level.freePlay && !studioApp.hideSource) {
    var finishBtnContainer = $('#right-button-cell');

    if (finishBtnContainer.length && !finishBtnContainer.hasClass('right-button-cell-enabled')) {
      finishBtnContainer.addClass('right-button-cell-enabled');
      studioApp.onResize();

      var event = document.createEvent('Event');
      event.initEvent('finishButtonShown', true, true);
      document.dispatchEvent(event);
    }
  }
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
    if (Craft.level.freePlay) {
      return;
    }
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
  if (studioTestResults === TestResults.LEVEL_INCOMPLETE_FAIL) {
    return TestResults.APP_SPECIFIC_FAIL;
  }

  if (Craft.initialConfig.level.freePlay) {
    return TestResults.FREE_PLAY;
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
          tooManyBlocksFailMsgFunction: craftMsg.tooManyBlocksFail,
          generatedCodeDescription: craftMsg.generatedCodeDescription()
        },
        feedbackImage: Craft.initialConfig.level.freePlay ? Craft.gameController.getScreenshot() : null,
        showingSharing: Craft.initialConfig.level.freePlay
      });
    }
  });
};

Craft.replayTextForResult = function (testResultType) {
  if (testResultType === TestResults.FREE_PLAY) {
    return craftMsg.keepPlayingButton();
  } else if (testResultType <= TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL) {
    return commonMsg.tryAgain();
  } else {
    return craftMsg.replayButton();
  }
};

},{"../MusicController":"/home/ubuntu/staging/apps/build/js/MusicController.js","../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","./api":"/home/ubuntu/staging/apps/build/js/craft/api.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/craft/controls.html.ejs","./dialogs/houseSelection.html.ejs":"/home/ubuntu/staging/apps/build/js/craft/dialogs/houseSelection.html.ejs","./dialogs/playerSelection.html.ejs":"/home/ubuntu/staging/apps/build/js/craft/dialogs/playerSelection.html.ejs","./game/GameController":"/home/ubuntu/staging/apps/build/js/craft/game/GameController.js","./houseLevels":"/home/ubuntu/staging/apps/build/js/craft/houseLevels.js","./levelbuilderOverrides":"/home/ubuntu/staging/apps/build/js/craft/levelbuilderOverrides.js","./locale":"/home/ubuntu/staging/apps/build/js/craft/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/craft/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/craft/visualization.html.ejs":[function(require,module,exports){
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
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/levelbuilderOverrides.js":[function(require,module,exports){
/*jshint multistr: true */
/* global $ */

/**
 * @file Mapping to inject more properties into levelbuilder levels.
 * Keyed by "puzzle_number", which is the order of a given level in its script.
 */

'use strict';

var utils = require('../utils');
var i18n = require('./locale');

module.exports = {
  1: {
    appSpecificFailError: i18n.level1FailureMessage(),
    tooFewBlocksMsg: i18n.level1TooFewBlocksMessage(),
    songs: ['vignette4-intro']
  },
  2: {
    appSpecificFailError: i18n.level2FailureMessage(),
    tooFewBlocksMsg: i18n.level2TooFewBlocksMessage(),
    songs: ['vignette5-shortpiano']
  },
  3: {
    appSpecificFailError: i18n.level3FailureMessage(),
    tooFewBlocksMsg: i18n.level3TooFewBlocksMessage(),
    songs: ['vignette2-quiet', 'vignette5-shortpiano', 'vignette4-intro']
  },
  4: {
    appSpecificFailError: i18n.level4FailureMessage(),
    tooFewBlocksMsg: i18n.level4FailureMessage(),
    songs: ['vignette3', 'vignette2-quiet', 'vignette5-shortpiano', 'vignette4-intro'],
    songDelay: 4000
  },
  5: {
    appSpecificFailError: i18n.level5FailureMessage(),
    tooFewBlocksMsg: i18n.level5FailureMessage(),
    songs: ['vignette7-funky-chirps-short', 'vignette2-quiet', 'vignette4-intro', 'vignette3']
  },
  6: {
    appSpecificFailError: i18n.level6FailureMessage(),
    tooFewBlocksMsg: i18n.level6FailureMessage(),
    songs: ['vignette1', 'vignette2-quiet', 'vignette4-intro', 'vignette3'],
    songDelay: 4000
  },
  7: {
    appSpecificFailError: i18n.level7FailureMessage(),
    tooFewBlocksMsg: i18n.level7FailureMessage(),
    songs: ['vignette2-quiet', 'vignette7-funky-chirps-short', 'vignette4-intro', 'vignette1', 'vignette3']
  },
  8: {
    appSpecificFailError: i18n.level8FailureMessage(),
    tooFewBlocksMsg: i18n.level8FailureMessage(),
    songs: ['vignette5-shortpiano', 'vignette2-quiet', 'vignette1', 'vignette4-intro', 'vignette3']
  },
  9: {
    appSpecificFailError: i18n.level9FailureMessage(),
    tooFewBlocksMsg: i18n.level9FailureMessage(),
    songs: ['vignette3', 'vignette5-shortpiano', 'vignette7-funky-chirps-short', 'vignette2-quiet', 'vignette4-intro', 'vignette1']

  },
  10: {
    appSpecificFailError: i18n.level10FailureMessage(),
    tooFewBlocksMsg: i18n.level10FailureMessage(),
    songs: ['vignette4-intro', 'vignette3', 'vignette5-shortpiano', 'vignette2-quiet', 'vignette7-funky-chirps-short']
  },
  11: {
    appSpecificFailError: i18n.level11FailureMessage(),
    tooFewBlocksMsg: i18n.level11FailureMessage(),
    songs: ['vignette7-funky-chirps-short', 'vignette3', 'vignette2-quiet']
  },
  12: {
    appSpecificFailError: i18n.level12FailureMessage(),
    tooFewBlocksMsg: i18n.level12FailureMessage(),
    songs: ['vignette5-shortpiano', 'vignette2-quiet', 'vignette4-intro', 'vignette1']
  },
  13: {
    appSpecificFailError: i18n.level13FailureMessage(),
    tooFewBlocksMsg: i18n.level13FailureMessage(),
    songs: ['vignette1', 'vignette3', 'vignette2-quiet', 'vignette4-intro']
  },
  14: {
    songs: ['vignette8-free-play', 'vignette3', 'vignette2-quiet', 'vignette4-intro', 'vignette1']
  }
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./locale":"/home/ubuntu/staging/apps/build/js/craft/locale.js"}],"/home/ubuntu/staging/apps/build/js/craft/houseLevels.js":[function(require,module,exports){
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
  houseC: {
    "groundPlane": ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "grass", "grass", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "dirtCoarse", "dirtCoarse", "dirtCoarse", "dirtCoarse", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    "groundDecorationPlane": ["", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "tallGrass", "", "", "", "", "", "", "", "", ""],
    "actionPlane": ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "houseBottomA", "houseBottomB", "houseBottomC", "houseBottomD", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    "verificationFunction": "function (verificationAPI) {\r\n      return verificationAPI.solutionMapMatchesResultMap(\r\n            [\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"any\", \"any\", \"any\", \"any\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"any\", \"\", \"\", \"\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"any\", \"any\", \"\", \"\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"\", \"\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"any\", \"any\", \"any\", \"any\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\",\r\n              \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\", \"\"\r\n            ]);\r\n}",
    "startBlocks": "<xml><block type=\"when_run\" deletable=\"false\" movable=\"false\"><next><block type=\"controls_repeat_dropdown\"><title name=\"TIMES\" config=\"2-10\">2</title><statement name=\"DO\"><block type=\"craft_moveForward\"><next><block type=\"craft_placeBlock\"><title name=\"TYPE\">planksBirch</title></block></next></block></statement><next><block type=\"craft_turn\"><title name=\"DIR\">left</title><next><block type=\"craft_moveForward\"><next><block type=\"craft_placeBlock\"><title name=\"TYPE\">planksBirch</title><next><block type=\"craft_turn\"><title name=\"DIR\">right</title></block></next></block></next></block></next></block></next></block></next></block></xml>",

    blocksToStore: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'houseRightC', '', '', '', '', '', '', '', '', '', 'houseRightB', '', '', '', '', '', '', 'houseLeftA', '', '', 'houseRightA', '', '', '', '', '', '', 'houseBottomA', 'houseBottomB', 'houseBottomC', 'houseBottomD', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],

    houseBottomRight: [5, 5]
  },
  houseB: {
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
      disableWebAudio: true,
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
    this.afterAssetsLoaded = gameControllerConfig.afterAssetsLoaded;
    this.assetLoader = new _LevelMVCAssetLoaderJs2["default"](this);
    this.earlyLoadAssetPacks = gameControllerConfig.earlyLoadAssetPacks || [];
    this.earlyLoadNiceToHaveAssetPacks = gameControllerConfig.earlyLoadNiceToHaveAssetPacks || [];

    this.resettableTimers = [];

    // Phaser "slow motion" modifier we originally tuned animations using
    this.assumedSlowMotion = 1.5;
    this.initialSlowMotion = gameControllerConfig.customSlowMotion || this.assumedSlowMotion;

    this.playerDelayFactor = 1.0;

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
      var _this2 = this;

      this.levelView.create(this.levelModel);
      this.game.time.slowMotion = this.initialSlowMotion;
      this.addCheatKeys();
      this.assetLoader.loadPacks(this.levelData.assetPacks.afterLoad);
      this.game.load.onLoadComplete.addOnce(function () {
        if (_this2.afterAssetsLoaded) {
          _this2.afterAssetsLoaded();
        }
      });
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
      var _this3 = this;

      this.game.input.keyboard.addKey(Phaser.Keyboard.TILDE).onUp.add(function () {
        _this3.game.input.keyboard.addKey(Phaser.Keyboard.UP).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight move forward command.");
          };
          _this3.codeOrgAPI.moveForward(dummyFunc);
        });

        _this3.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight turn right command.");
          };
          _this3.codeOrgAPI.turnRight(dummyFunc);
        });

        _this3.game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight turn left command.");
          };
          _this3.codeOrgAPI.turnLeft(dummyFunc);
        });

        _this3.game.input.keyboard.addKey(Phaser.Keyboard.P).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight placeBlock command.");
          };
          _this3.codeOrgAPI.placeBlock(dummyFunc, "logOak");
        });

        _this3.game.input.keyboard.addKey(Phaser.Keyboard.D).onUp.add(function () {
          var dummyFunc = function dummyFunc() {
            console.log("highlight destroy block command.");
          };
          _this3.codeOrgAPI.destroyBlock(dummyFunc);
        });

        _this3.game.input.keyboard.addKey(Phaser.Keyboard.E).onUp.add(function () {
          var dummyFunc = function dummyFunc(result) {
            console.log("Execute command list done: " + result + " ");
          };
          _this3.codeOrgAPI.startAttempt(dummyFunc);
        });

        _this3.game.input.keyboard.addKey(Phaser.Keyboard.W).onUp.add(function () {
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
          _this3.codeOrgAPI.whilePathAhead(dummyFunc, blockType, codeBlock);
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
      var _this4 = this;

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
          _this4.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);

          //First arg is if we found a creeper
          allFoundCreepers = _this4.levelModel.isPlayerStandingNearCreeper();

          if (_this4.levelModel.isPlayerStandingInWater()) {
            _this4.levelView.playDrownFailureAnimation(player.position, player.facing, player.isOnBlock, function () {
              commandQueueItem.failed();
            });
          } else if (_this4.levelModel.isPlayerStandingInLava()) {
            _this4.levelView.playBurnInLavaAnimation(player.position, player.facing, player.isOnBlock, function () {
              commandQueueItem.failed();
            });
          } else {
            _this4.delayPlayerMoveBy(30, 200, function () {
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
          this.delayPlayerMoveBy(400, 800, function () {
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

      this.delayPlayerMoveBy(200, 800, function () {
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
      var _this5 = this;

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
          _this5.levelView.setSelectionIndicatorPosition(player.position[0], player.position[1]);
          _this5.levelView.playIdleAnimation(player.position, player.facing, player.isOnBlock);
          _this5.delayPlayerMoveBy(200, 600, function () {
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
      var _this6 = this;

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
            _this6.levelModel.computeShadingPlane();
            _this6.levelModel.computeFowPlane();
            _this6.levelView.updateShadingPlane(_this6.levelModel.shadingPlane);
            _this6.levelView.updateFowPlane(_this6.levelModel.fowPlane);
            _this6.delayBy(200, function () {
              _this6.levelView.playIdleAnimation(_this6.levelModel.player.position, _this6.levelModel.player.facing, false);
            });
            _this6.delayPlayerMoveBy(200, 400, function () {
              commandQueueItem.succeeded();
            });
          });
        } else {
          var signalBinding = this.levelView.playPlayerAnimation("jumpUp", this.levelModel.player.position, this.levelModel.player.facing, false).onLoop.add(function () {
            _this6.levelView.playIdleAnimation(_this6.levelModel.player.position, _this6.levelModel.player.facing, false);
            signalBinding.detach();
            _this6.delayBy(800, function () {
              commandQueueItem.succeeded();
            });
          }, this);
        }
      } else {
        commandQueueItem.failed();
      }
    }
  }, {
    key: "setPlayerActionDelayByQueueLength",
    value: function setPlayerActionDelayByQueueLength() {
      var START_SPEED_UP = 10;
      var END_SPEED_UP = 20;

      var queueLength = this.queue.getLength();
      var speedUpRangeMax = END_SPEED_UP - START_SPEED_UP;
      var speedUpAmount = Math.min(Math.max(queueLength - START_SPEED_UP, 0), speedUpRangeMax);

      this.playerDelayFactor = 1 - speedUpAmount / speedUpRangeMax;
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
    key: "delayPlayerMoveBy",
    value: function delayPlayerMoveBy(minMs, maxMs, completionHandler) {
      this.delayBy(Math.max(minMs, maxMs * this.playerDelayFactor), completionHandler);
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
      var _this7 = this;

      var forwardPosition,
          placementPlane,
          soundEffect = function soundEffect() {};

      if (!this.levelModel.canPlaceBlockForward()) {
        this.levelView.playPunchAirAnimation(this.levelModel.player.position, this.levelModel.player.facing, this.levelModel.player.position, function () {
          _this7.levelView.playIdleAnimation(_this7.levelModel.player.position, _this7.levelModel.player.facing, false);
          commandQueueItem.succeeded();
        });
        return;
      }

      forwardPosition = this.levelModel.getMoveForwardPosition();
      placementPlane = this.levelModel.getPlaneToPlaceOn(forwardPosition);
      if (this.levelModel.isBlockOfTypeOnPlane(forwardPosition, "lava", placementPlane)) {
        soundEffect = function () {
          _this7.levelView.audioPlayer.play("fizz");
        };
      }
      this.levelModel.placeBlockForward(blockType, placementPlane);
      this.levelView.playPlaceBlockInFrontAnimation(this.levelModel.player.position, this.levelModel.player.facing, this.levelModel.getMoveForwardPosition(), placementPlane, blockType, function () {
        _this7.levelModel.computeShadingPlane();
        _this7.levelModel.computeFowPlane();
        _this7.levelView.updateShadingPlane(_this7.levelModel.shadingPlane);
        _this7.levelView.updateFowPlane(_this7.levelModel.fowPlane);
        soundEffect();
        _this7.delayBy(200, function () {
          _this7.levelView.playIdleAnimation(_this7.levelModel.player.position, _this7.levelModel.player.facing, false);
        });
        _this7.delayPlayerMoveBy(200, 400, function () {
          commandQueueItem.succeeded();
        });
      });
    }
  }, {
    key: "checkSolution",
    value: function checkSolution(commandQueueItem) {
      var _this8 = this;

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
            _this8.levelModel.destroyBlock(bedPosition);
            _this8.levelModel.destroyBlock(doorPosition);
            _this8.levelModel.computeShadingPlane();
            _this8.levelModel.computeFowPlane();
            _this8.levelView.updateShadingPlane(_this8.levelModel.shadingPlane);
            _this8.levelView.updateFowPlane(_this8.levelModel.fowPlane);
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
              if (tnt[i].x === _this8.levelModel.player.position.x && tnt[i].y === _this8.levelModel.player.position.y) {
                _this8.levelModel.player.isOnBlock = false;
              }
              var surroundingBlocks = _this8.levelModel.getAllBorderingPositionNotOfType(tnt[i], "tnt");
              _this8.levelModel.destroyBlock(tnt[i]);
              for (var b = 1; b < surroundingBlocks.length; ++b) {
                if (surroundingBlocks[b][0]) {
                  _this8.destroyBlockWithoutPlayerInteraction(surroundingBlocks[b][1]);
                }
              }
            }
            if (!player.isOnBlock && wasOnBlock) {
              _this8.levelView.playPlayerJumpDownVerticalAnimation(player.position, player.facing);
            }
            _this8.levelModel.computeShadingPlane();
            _this8.levelModel.computeFowPlane();
            _this8.levelView.updateShadingPlane(_this8.levelModel.shadingPlane);
            _this8.levelView.updateFowPlane(_this8.levelModel.fowPlane);
            _this8.delayBy(200, function () {
              _this8.levelView.playSuccessAnimation(player.position, player.facing, player.isOnBlock, function () {
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
          _this2.controller.delayBy(800, completionHandler);
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

      this.playPlayerAnimation("punch", playerPosition, facing, false).onComplete.addOnce(function () {
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
      frameList = frameList.concat("Player_259");
      frameList = frameList.concat("Player_260");

      //Jump
      frameList.push("Player_261");
      frameList.push("Player_297");
      frameList.push("Player_298");
      frameList.push("Player_297");
      frameList.push("Player_261");
      //Jump
      frameList.push("Player_261");
      frameList.push("Player_297");
      frameList.push("Player_298");
      frameList.push("Player_297");
      frameList.push("Player_261");
      //Pause
      frameList.push("Player_001");
      frameList.push("Player_001");
      frameList.push("Player_001");
      frameList.push("Player_001");
      frameList.push("Player_001");
      //Jump
      frameList.push("Player_261");
      frameList.push("Player_297");
      frameList.push("Player_298");
      frameList.push("Player_297");
      frameList.push("Player_261");
      //Jump
      frameList.push("Player_261");
      frameList.push("Player_297");
      frameList.push("Player_298");
      frameList.push("Player_297");
      frameList.push("Player_261");

      //for (i = 0; i < 5; ++i) {
      //  frameList.push("Player_262");
      //
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
        pngPath: this.assetRoot + 'images/Steve1013.png',
        jsonPath: this.assetRoot + 'images/Steve1013.json'
      },
      playerAlex: {
        type: 'atlasJSON',
        pngPath: this.assetRoot + 'images/Alex1013.png',
        jsonPath: this.assetRoot + 'images/Alex1013.json'
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

            controller.setPlayerActionDelayByQueueLength();

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
  }, {
    key: "getLength",
    value: function getLength() {
      return this.commandList_ ? this.commandList_.length : 0;
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
 buf.push('');1; var i18n = require('../locale'); ; buf.push('\n<h1 class="minecraft-big-yellow-header" id="getting-started-header">', escape((2,  i18n.playerSelectLetsGetStarted() )), '</h1>\n\n<h2 id="select-character-text">', escape((4,  i18n.playerSelectChooseCharacter() )), '</h2>\n\n<div id="choose-character-container">\n  <div class="minecraft-character" id="choose-steve">\n    <h1 class="minecraft-big-yellow-header">Steve</h1>\n    <div class="character-portrait" id="steve-portrait"></div>\n    <div class="choose-character-button" id="choose-steve-select">', escape((10,  i18n.selectChooseButton() )), '</div>\n  </div>\n  <div class="minecraft-character" id="choose-alex">\n    <h1 class="minecraft-big-yellow-header">Alex</h1>\n    <div class="character-portrait" id="alex-portrait"></div>\n    <div class="choose-character-button" id="choose-alex-select">', escape((15,  i18n.selectChooseButton() )), '</div>\n  </div>\n</div>\n\n<div id="close-character-select"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/craft/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/dialogs/houseSelection.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var i18n = require('../locale'); ; buf.push('\n<h1 class="minecraft-big-yellow-header" id="getting-started-header">', escape((2,  i18n.houseSelectLetsBuild() )), '</h1>\n\n<h2 id="select-house-text">', escape((4,  i18n.houseSelectChooseFloorPlan() )), '</h2>\n\n<div id="choose-house-container">\n  <div class="minecraft-house" id="choose-house-a">\n    <h1 class="minecraft-big-yellow-header">', escape((8,  i18n.houseSelectEasy() )), '</h1>\n    <div class="house-outline-container">\n      <div class="house-photo" id="house-a-picture"></div>\n    </div>\n    <div class="choose-house-button">', escape((12,  i18n.selectChooseButton() )), '</div>\n  </div>\n  <div class="minecraft-house" id="choose-house-b">\n    <h1 class="minecraft-big-yellow-header">', escape((15,  i18n.houseSelectMedium() )), '</h1>\n    <div class="house-outline-container">\n      <div class="house-photo" id="house-b-picture"></div>\n    </div>\n    <div class="choose-house-button">', escape((19,  i18n.selectChooseButton() )), '</div>\n  </div>\n  <div class="minecraft-house" id="choose-house-c">\n    <h1 class="minecraft-big-yellow-header">', escape((22,  i18n.houseSelectHard() )), '</h1>\n    <div class="house-outline-container">\n      <div class="house-photo" id="house-c-picture"></div>\n    </div>\n    <div class="choose-house-button">', escape((26,  i18n.selectChooseButton() )), '</div>\n  </div>\n</div>\n\n<div id="close-house-select"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/craft/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/controls.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var msg = require('../locale') ; buf.push('\n\n<div id="right-button-cell">\n  <button id="rightButton" class="share mc-share-button">\n    <div>', escape((5,  msg.finish() )), '</div>\n  </button>\n</div>\n\n<!-- This is a comment unique to Craft -->\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/blocks.js":[function(require,module,exports){
'use strict';

var i18n = require('./locale');

var blocksToDisplayText = {
  bedrock: i18n.blockTypeBedrock(),
  bricks: i18n.blockTypeBricks(),
  clay: i18n.blockTypeClay(),
  oreCoal: i18n.blockTypeOreCoal(),
  dirtCoarse: i18n.blockTypeDirtCoarse(),
  cobblestone: i18n.blockTypeCobblestone(),
  oreDiamond: i18n.blockTypeOreDiamond(),
  dirt: i18n.blockTypeDirt(),
  oreEmerald: i18n.blockTypeOreEmerald(),
  farmlandWet: i18n.blockTypeFarmlandWet(),
  glass: i18n.blockTypeGlass(),
  oreGold: i18n.blockTypeOreGold(),
  grass: i18n.blockTypeGrass(),
  gravel: i18n.blockTypeGravel(),
  clayHardened: i18n.blockTypeClayHardened(),
  oreIron: i18n.blockTypeOreIron(),
  oreLapis: i18n.blockTypeOreLapis(),
  lava: i18n.blockTypeLava(),
  logAcacia: i18n.blockTypeLogAcacia(),
  logBirch: i18n.blockTypeLogBirch(),
  logJungle: i18n.blockTypeLogJungle(),
  logOak: i18n.blockTypeLogOak(),
  logSpruce: i18n.blockTypeLogSpruce(),
  planksAcacia: i18n.blockTypePlanksAcacia(),
  planksBirch: i18n.blockTypePlanksBirch(),
  planksJungle: i18n.blockTypePlanksJungle(),
  planksOak: i18n.blockTypePlanksOak(),
  planksSpruce: i18n.blockTypePlanksSpruce(),
  oreRedstone: i18n.blockTypeOreRedstone(),
  rail: i18n.blockTypeRail(),
  sand: i18n.blockTypeSand(),
  sandstone: i18n.blockTypeSandstone(),
  stone: i18n.blockTypeStone(),
  tnt: i18n.blockTypeTnt(),
  tree: i18n.blockTypeTree(),
  water: i18n.blockTypeWater(),
  wool: i18n.blockTypeWool(),
  '': i18n.blockTypeEmpty()
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
      this.appendDummyInput().appendTitle(new blockly.FieldLabel(i18n.blockMoveForward()));
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

  blockly.Blocks.craft_turn.DIRECTIONS = [[i18n.blockTurnLeft() + ' ↺', 'left'], [i18n.blockTurnRight() + ' ↻', 'right']];

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
      this.appendDummyInput().appendTitle(new blockly.FieldLabel(i18n.blockDestroyBlock()));
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
      this.appendDummyInput().appendTitle(new blockly.FieldLabel(i18n.blockShear()));
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
      this.appendDummyInput().appendTitle(i18n.blockWhileXAheadWhile()).appendTitle(dropdown, 'TYPE').appendTitle(i18n.blockWhileXAheadAhead());
      this.appendStatementInput('DO').appendTitle(i18n.blockWhileXAheadDo());
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
      this.appendDummyInput().appendTitle(i18n.blockIf()).appendTitle(dropdown, 'TYPE').appendTitle(i18n.blockWhileXAheadAhead());
      this.appendStatementInput('DO').appendTitle(i18n.blockWhileXAheadDo());
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
      this.appendDummyInput().appendTitle(i18n.blockIfLavaAhead());
      this.appendStatementInput('DO').appendTitle(i18n.blockWhileXAheadDo());
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
      this.appendDummyInput().appendTitle(i18n.blockPlaceXPlace()).appendTitle(dropdown, 'TYPE');
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
      this.appendDummyInput().appendTitle(i18n.blockPlaceTorch());
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
      this.appendDummyInput().appendTitle(i18n.blockPlantCrop());
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
      this.appendDummyInput().appendTitle(i18n.blockTillSoil);
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
      this.appendDummyInput().appendTitle(i18n.blockPlaceXAheadPlace()).appendTitle(dropdown, 'TYPE').appendTitle(i18n.blockPlaceXAheadAhead());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Generator.get('JavaScript').craft_placeBlockAhead = function () {
    var blockType = this.getTitleValue('TYPE');
    return 'placeBlockAhead("' + blockType + '", \'block_id_' + this.id + '\');\n';
  };
};

},{"./locale":"/home/ubuntu/staging/apps/build/js/craft/locale.js"}],"/home/ubuntu/staging/apps/build/js/craft/locale.js":[function(require,module,exports){
"use strict";

module.exports = window.blockly.craft_locale;

},{}],"/home/ubuntu/staging/apps/build/js/craft/api.js":[function(require,module,exports){
"use strict";

},{}]},{},["/home/ubuntu/staging/apps/build/js/craft/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9jcmFmdC9tYWluLmpzIiwiYnVpbGQvanMvY3JhZnQvc2tpbnMuanMiLCJidWlsZC9qcy9jcmFmdC9sZXZlbHMuanMiLCJidWlsZC9qcy9jcmFmdC9jcmFmdC5qcyIsImJ1aWxkL2pzL2NyYWZ0L3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9jcmFmdC9sZXZlbGJ1aWxkZXJPdmVycmlkZXMuanMiLCJidWlsZC9qcy9jcmFmdC9ob3VzZUxldmVscy5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvR2FtZUNvbnRyb2xsZXIuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0xldmVsTVZDL0xldmVsVmlldy5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvTGV2ZWxNb2RlbC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvTGV2ZWxCbG9jay5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvRmFjaW5nRGlyZWN0aW9uLmpzIiwiYnVpbGQvanMvY3JhZnQvZ2FtZS9MZXZlbE1WQy9Bc3NldExvYWRlci5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQVBJL0NvZGVPcmdBUEkuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9XaGlsZUNvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9UdXJuQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL1BsYWNlSW5Gcm9udENvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9QbGFjZUJsb2NrQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL01vdmVGb3J3YXJkQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL0lmQmxvY2tBaGVhZENvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9EZXN0cm95QmxvY2tDb21tYW5kLmpzIiwiYnVpbGQvanMvY3JhZnQvZ2FtZS9Db21tYW5kUXVldWUvQ2hlY2tTb2x1dGlvbkNvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9Db21tYW5kUXVldWUuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9CYXNlQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL0NvbW1hbmRTdGF0ZS5qcyIsImJ1aWxkL2pzL2NyYWZ0L2RpYWxvZ3MvcGxheWVyU2VsZWN0aW9uLmh0bWwuZWpzIiwiYnVpbGQvanMvY3JhZnQvZGlhbG9ncy9ob3VzZVNlbGVjdGlvbi5odG1sLmVqcyIsImJ1aWxkL2pzL2NyYWZ0L2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvY3JhZnQvYmxvY2tzLmpzIiwiYnVpbGQvanMvY3JhZnQvbG9jYWxlLmpzIiwiYnVpbGQvanMvY3JhZnQvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUJBLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEMsSUFBSSxPQUFPLEdBQUc7QUFDWixPQUFLLEVBQUUsRUFDTjtDQUNGLENBQUM7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFB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T0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUN6Rjs7QUFFRCx5QkFBcUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7QUFFbEQsZUFBVyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN0RSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQ2hELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUM3Qzs7QUFFRCxjQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDL0MsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQ2hEO0dBQ0Y7QUFDRCxLQUFHLEVBQUU7QUFDSCxvQkFBZ0IsRUFBRSxFQUFFO0FBQ3BCLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLGFBQVMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxHQUNuQyxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQ3ZCLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FDekI7QUFDRCxpQkFBYSxFQUFFLGlFQUFpRTs7QUFFaEYsdUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUUzQixlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3BHLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDdkcsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQ3pGOztBQUVELHlCQUFxQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1RCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOztBQUVsRCxlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3RFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFDaEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQzdDOztBQUVELGNBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDaEQ7O0FBRUQsd0JBQW9CLEVBQUUsOEJBQVUsZUFBZSxFQUFFO0FBQy9DLGFBQU8sZUFBZSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNqRDs7R0FFRjtBQUNELEtBQUcsRUFBRTtBQUNILG9CQUFnQixFQUFFLEVBQUU7QUFDcEIsY0FBVSxFQUFFLElBQUk7QUFDaEIsYUFBUyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQ25DLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FDdkIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUN0QixVQUFVLENBQUMsY0FBYyxDQUFDLEdBQzFCLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FDeEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQ3hCLGNBQWMsR0FDZCxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FDaEM7QUFDRCxpQkFBYSxFQUFFLGlFQUFpRTs7QUFFaEYsZUFBVyxFQUFFLENBQ1gsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RyxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3ZILE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEcsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUN6Rjs7QUFFRCx5QkFBcUIsRUFBRSxDQUNyQixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRWxELGVBQVcsRUFBRSxDQUNYLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDdkM7O0FBRUQsY0FBVSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUN2QztHQUNGO0FBQ0QsVUFBUSxFQUFFO0FBQ1Isb0JBQWdCLEVBQUUsRUFBRTtBQUNwQixjQUFVLEVBQUUsS0FBSztBQUNqQixhQUFTLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixHQUFHLGFBQWEsR0FBRyxjQUFjLENBQUM7R0FDakU7Q0FDRixDQUFDOzs7Ozs7Ozs7QUM1TkYsWUFBWSxDQUFDO0FBQ2IsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNCLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3RELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDM0MsSUFBSSxxQkFBcUIsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUMvRCxJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFcEQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztBQUN0QyxJQUFJLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDOztBQUV4QyxJQUFJLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQzs7Ozs7QUFLeEMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7QUFFM0IsSUFBSSxVQUFVLEdBQUc7QUFDZixPQUFLLEVBQUU7QUFDTCxRQUFJLEVBQUUsT0FBTztBQUNiLGdCQUFZLEVBQUUsU0FBUyxHQUFHLGlEQUFpRDtBQUMzRSxxQkFBaUIsRUFBRSxTQUFTLEdBQUcsaURBQWlEO0FBQ2hGLGlCQUFhLEVBQUUsU0FBUyxHQUFHLDhDQUE4QztBQUN6RSxhQUFTLEVBQUUsU0FBUyxHQUFHLDZDQUE2QztHQUNyRTtBQUNELE1BQUksRUFBRTtBQUNKLFFBQUksRUFBRSxNQUFNO0FBQ1osZ0JBQVksRUFBRSxTQUFTLEdBQUcsZ0RBQWdEO0FBQzFFLHFCQUFpQixFQUFFLFNBQVMsR0FBRyxnREFBZ0Q7QUFDL0UsaUJBQWEsRUFBRSxTQUFTLEdBQUcsNkNBQTZDO0FBQ3hFLGFBQVMsRUFBRSxTQUFTLEdBQUcsNENBQTRDO0dBQ3BFO0NBQ0YsQ0FBQzs7QUFFRixJQUFJLGVBQWUsR0FBRztBQUNwQixTQUFPLEVBQUUsQ0FDUCxTQUFTLEdBQUcscUNBQXFDLEVBQ2pELFNBQVMsR0FBRyx3Q0FBd0MsRUFDcEQsU0FBUyxHQUFHLCtCQUErQixFQUMzQyxTQUFTLEdBQUcsMkJBQTJCLEVBQ3ZDLFNBQVMsR0FBRyxvQ0FBb0MsRUFDaEQsU0FBUyxHQUFHLHNDQUFzQyxFQUNsRCxTQUFTLEdBQUcsb0NBQW9DLEVBQ2hELFNBQVMsR0FBRyx3Q0FBd0MsRUFDcEQsU0FBUyxHQUFHLHdDQUF3QyxFQUNwRCxTQUFTLEdBQUcsc0NBQXNDLEVBQ2xELFNBQVMsR0FBRywwQ0FBMEMsRUFDdEQsU0FBUyxHQUFHLCtCQUErQixDQUM1QztBQUNELEdBQUMsRUFBRSxDQUNELFNBQVMsR0FBRyx5Q0FBeUMsRUFDckQsU0FBUyxHQUFHLHdDQUF3QyxFQUNwRCxVQUFVLENBQUMsS0FBSyxDQUFDLFlBQVksRUFDN0IsVUFBVSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFDbEMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQ2xDO0FBQ0QsR0FBQyxFQUFFOzs7QUFHRCxZQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDekIsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQzFCLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUM3QixVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FDL0I7QUFDRCxHQUFDLEVBQUUsQ0FDRCxTQUFTLEdBQUcsb0NBQW9DLEVBQ2hELFNBQVMsR0FBRyxvQ0FBb0MsRUFDaEQsU0FBUyxHQUFHLG9DQUFvQyxDQUNqRDtDQUNGLENBQUM7O0FBRUYsSUFBSSxjQUFjLEdBQUcsQ0FDbkIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQyxFQUM1QyxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUMsRUFDbEQsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQyxFQUM1QyxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUMsRUFDbEQsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFDLEVBQ3ZELEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSw4QkFBOEIsRUFBQyxFQUMvRCxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUMsQ0FDdkQsQ0FBQzs7QUFFRixJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUM7QUFDOUIsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDO0FBQzVCLElBQUksaUJBQWlCLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLElBQUksOEJBQThCLEdBQUcsUUFBUSxHQUFHLGlCQUFpQixDQUFDOztBQUVsRSxTQUFTLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDMUMsTUFBSTtBQUNGLFVBQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztHQUN6QyxDQUFDLE9BQU8sQ0FBQyxFQUFFOzs7OztBQUtWLFFBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7QUFDMUIsYUFBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsR0FBRyxHQUFHLENBQUMsQ0FBQztLQUMvRDtHQUNGO0NBQ0Y7Ozs7O0FBS0QsS0FBSyxDQUFDLElBQUksR0FBRyxVQUFVLE1BQU0sRUFBRTtBQUM3QixNQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsS0FBSyxDQUFDLEVBQUU7Ozs7QUFJdEUsVUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO0dBQ2xDOztBQUVELE1BQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7QUFDNUIsVUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7R0FDckM7OztBQUdELE1BQUksWUFBWSxHQUFHLFNBQWYsWUFBWSxHQUFjO0FBQzVCLFdBQU8sUUFBUSxDQUFDLFlBQVksQ0FBQztHQUM5QixDQUFDOztBQUVGLE1BQUksZUFBZSxHQUFHLFlBQVksRUFBRSxDQUFDO0FBQ3JDLE1BQUksZUFBZSxFQUFFO0FBQ25CLEtBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLGVBQWUsQ0FBQyxDQUFDO0dBQ25EOztBQUVELE1BQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDaEMsYUFBVyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQzs7QUFFN0QsTUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRTtBQUNoQyxVQUFNLENBQUMsS0FBSyxDQUFDLDhCQUE4QixHQUFHLFVBQUMsZ0JBQWdCLEVBQUs7QUFDbEUsVUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxXQUFLLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRCxjQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUU5QixVQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxLQUFLLGlCQUFpQixFQUFFO0FBQ3RELGFBQUssQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLGNBQWMsRUFBRTtBQUN2RCxvQkFBVSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMxRCxlQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN6QixnQ0FBc0IsQ0FBQyxxQkFBcUIsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUM5RCxlQUFLLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDM0MsZUFBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QywwQkFBZ0IsRUFBRSxDQUFDO1NBQ3BCLENBQUMsQ0FBQztPQUNKLE1BQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsS0FBSyxzQkFBc0IsRUFBRTtBQUNsRSxhQUFLLENBQUMsdUJBQXVCLENBQUMsVUFBUyxhQUFhLEVBQUU7QUFDcEQsb0JBQVUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3JELGNBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFO0FBQzVCLGFBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzs7QUFFbkQsbUJBQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDL0IscUJBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1dBQ3pDO0FBQ0QsZUFBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QywwQkFBZ0IsRUFBRSxDQUFDO1NBQ3BCLENBQUMsQ0FBQztPQUNKO0tBQ0YsQ0FBQztHQUNIOztBQUVELE1BQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLElBQUkscUJBQXFCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUNuRixLQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0dBQzNFO0FBQ0QsT0FBSyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7OztBQUc3QixXQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLFdBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTFELE9BQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUMzQixPQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0FBRXpCLE1BQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixNQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLGNBQWMsRUFBRTtBQUN2QyxlQUFXLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFTLGFBQWEsRUFBRTtBQUMxRCxhQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDN0QsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsT0FBSyxDQUFDLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FDdkMsU0FBUyxDQUFDLFNBQVMsRUFDbkIsVUFBVSxRQUFRLEVBQUU7QUFDbEIsV0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsWUFBVSxRQUFRLENBQUcsQ0FBQztHQUNsRCxFQUNELFdBQVcsRUFDWCxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUN2QyxDQUFDOzs7QUFHRixNQUFJLFFBQVEsR0FBRyxTQUFYLFFBQVEsR0FBZTtBQUN6QixZQUFRLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDN0QsUUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFO0FBQ3ZCLGVBQVMsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsWUFBWTtBQUNoRCxZQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZFLFlBQUksZUFBZSxHQUFHLGNBQWMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbkUsYUFBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7T0FDN0MsQ0FBQyxDQUFDO0tBQ0o7R0FDRixDQUFDO0FBQ0YsVUFBUSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUUxRCxNQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztBQUN4RCxRQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQ2xELFFBQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFDO0FBQzVELFFBQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDcEQsUUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQzs7QUFFNUMsTUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUMvQixNQUFJLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNwRCxVQUFRLGdCQUFnQjtBQUN0QixTQUFLLGdCQUFnQjtBQUNuQixpQkFBVyxDQUFDLGFBQWEsR0FBRyxDQUMxQixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RGLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQ3ZDLENBQUM7QUFDRixZQUFNO0FBQUEsR0FDVDs7QUFFRCxXQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRTtBQUNsQyx1QkFBbUIsRUFBRSxVQUFV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RUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO0FBQ3o3Qix3QkFBb0IsRUFBRSxDQUFDLFVBQVUsZUFBZSxFQUFFO0FBQ2hELGFBQU8sZUFBZSxDQUFDLDJCQUEyQixDQUFDLENBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDbEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDbEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUMsQ0FBQSxDQUFFLFFBQVEsRUFBRTtBQUNiLGlCQUFhLEVBQUUsQ0FDYixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMzRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RGLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRXpDLG9CQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUN6QjtBQUNELFFBQU0sRUFBRTtBQUNOLGlCQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7QUFDOTlCLDJCQUF1QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzNiLGlCQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDL2MsMEJBQXNCLEVBQUUsazdCQUFrN0I7QUFDMThCLGlCQUFhLEVBQUUsa3FCQUFrcUI7O0FBRWpyQixpQkFBYSxFQUFFLENBQ2IsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDM0QsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0RixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOztBQUV6QyxvQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDekI7QUFDRCxRQUFNLEVBQUU7QUFDTixlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7QUFDMytCLHdCQUFvQixFQUFFLDI3QkFBMjdCO0FBQ2o5QixlQUFXLEVBQUUsNFdBQTRXO0FBQ3pYLGlCQUFhLEVBQUUsQ0FDYixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzNELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEYsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDekMsZUFBVyxFQUFFLENBQ1gsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFB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QUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUU3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMs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LENBQUMsQ0FBQztBQUN2RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxRCxXQUFLLENBQUMsSUFBSSxDQUFD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QyxDQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztBQUMvQyxVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzdCO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxZQUFXO0FBQ3JFLFFBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0MsV0FBTyxtQkFBbUIsR0FBRyxTQUFTLEdBQUcsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDaEYsQ0FBQztDQUVILENBQUM7Ozs7O0FDelZGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7OztBQ0E3QztBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuQ3JhZnQgPSByZXF1aXJlKCcuL2NyYWZ0Jyk7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZ2xvYmFsLkNyYWZ0ID0gd2luZG93LkNyYWZ0O1xufVxudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcblxud2luZG93LmNyYWZ0TWFpbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcblxuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgb3B0aW9ucy5tYXhWaXN1YWxpemF0aW9uV2lkdGggPSA2MDA7XG4gIHZhciBhcHBXaWR0aCA9IDQzNDtcbiAgdmFyIGFwcEhlaWdodCA9IDQ3NztcbiAgb3B0aW9ucy5uYXRpdmVWaXpXaWR0aCA9IGFwcFdpZHRoO1xuICBvcHRpb25zLnZpekFzcGVjdFJhdGlvID0gYXBwV2lkdGggLyBhcHBIZWlnaHQ7XG5cbiAgYXBwTWFpbih3aW5kb3cuQ3JhZnQsIGxldmVscywgb3B0aW9ucyk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltSjFhV3hrTDJwekwyTnlZV1owTDIxaGFXNHVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3TzBGQlFVRXNTVUZCU1N4UFFVRlBMRWRCUVVjc1QwRkJUeXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzBGQlEzQkRMRTFCUVUwc1EwRkJReXhMUVVGTExFZEJRVWNzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMEZCUTJ4RExFbEJRVWtzVDBGQlR5eE5RVUZOTEV0QlFVc3NWMEZCVnl4RlFVRkZPMEZCUTJwRExGRkJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJRenREUVVNM1FqdEJRVU5FTEVsQlFVa3NUVUZCVFN4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVU5xUXl4SlFVRkpMRTFCUVUwc1IwRkJSeXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdRVUZEYWtNc1NVRkJTU3hMUVVGTExFZEJRVWNzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPenRCUVVVdlFpeE5RVUZOTEVOQlFVTXNVMEZCVXl4SFFVRkhMRlZCUVZNc1QwRkJUeXhGUVVGRk8wRkJRMjVETEZOQlFVOHNRMEZCUXl4WFFVRlhMRWRCUVVjc1MwRkJTeXhEUVVGRE96dEJRVVUxUWl4VFFVRlBMRU5CUVVNc1dVRkJXU3hIUVVGSExFMUJRVTBzUTBGQlF6dEJRVU01UWl4VFFVRlBMRU5CUVVNc2NVSkJRWEZDTEVkQlFVY3NSMEZCUnl4RFFVRkRPMEZCUTNCRExFMUJRVWtzVVVGQlVTeEhRVUZITEVkQlFVY3NRMEZCUXp0QlFVTnVRaXhOUVVGSkxGTkJRVk1zUjBGQlJ5eEhRVUZITEVOQlFVTTdRVUZEY0VJc1UwRkJUeXhEUVVGRExHTkJRV01zUjBGQlJ5eFJRVUZSTEVOQlFVTTdRVUZEYkVNc1UwRkJUeXhEUVVGRExHTkJRV01zUjBGQlJ5eFJRVUZSTEVkQlFVY3NVMEZCVXl4RFFVRkRPenRCUVVVNVF5eFRRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1JVRkJSU3hOUVVGTkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdRMEZEZUVNc1EwRkJReUlzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWRtRnlJR0Z3Y0UxaGFXNGdQU0J5WlhGMWFYSmxLQ2N1TGk5aGNIQk5ZV2x1SnlrN1hHNTNhVzVrYjNjdVEzSmhablFnUFNCeVpYRjFhWEpsS0NjdUwyTnlZV1owSnlrN1hHNXBaaUFvZEhsd1pXOW1JR2RzYjJKaGJDQWhQVDBnSjNWdVpHVm1hVzVsWkNjcElIdGNiaUFnWjJ4dlltRnNMa055WVdaMElEMGdkMmx1Wkc5M0xrTnlZV1owTzF4dWZWeHVkbUZ5SUdKc2IyTnJjeUE5SUhKbGNYVnBjbVVvSnk0dllteHZZMnR6SnlrN1hHNTJZWElnYkdWMlpXeHpJRDBnY21WeGRXbHlaU2duTGk5c1pYWmxiSE1uS1R0Y2JuWmhjaUJ6YTJsdWN5QTlJSEpsY1hWcGNtVW9KeTR2YzJ0cGJuTW5LVHRjYmx4dWQybHVaRzkzTG1OeVlXWjBUV0ZwYmlBOUlHWjFibU4wYVc5dUtHOXdkR2x2Ym5NcElIdGNiaUFnYjNCMGFXOXVjeTV6YTJsdWMwMXZaSFZzWlNBOUlITnJhVzV6TzF4dVhHNGdJRzl3ZEdsdmJuTXVZbXh2WTJ0elRXOWtkV3hsSUQwZ1lteHZZMnR6TzF4dUlDQnZjSFJwYjI1ekxtMWhlRlpwYzNWaGJHbDZZWFJwYjI1WGFXUjBhQ0E5SURZd01EdGNiaUFnZG1GeUlHRndjRmRwWkhSb0lEMGdORE0wTzF4dUlDQjJZWElnWVhCd1NHVnBaMmgwSUQwZ05EYzNPMXh1SUNCdmNIUnBiMjV6TG01aGRHbDJaVlpwZWxkcFpIUm9JRDBnWVhCd1YybGtkR2c3WEc0Z0lHOXdkR2x2Ym5NdWRtbDZRWE53WldOMFVtRjBhVzhnUFNCaGNIQlhhV1IwYUNBdklHRndjRWhsYVdkb2REdGNibHh1SUNCaGNIQk5ZV2x1S0hkcGJtUnZkeTVEY21GbWRDd2diR1YyWld4ekxDQnZjSFJwYjI1ektUdGNibjA3WEc0aVhYMD0iLCJ2YXIgc2tpbnNCYXNlID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcblxudmFyIENPTkZJR1MgPSB7XG4gIGNyYWZ0OiB7XG4gIH1cbn07XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5zQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG4vKiBnbG9iYWwgJCAqL1xuXG52YXIgdGIgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpLmNyZWF0ZVRvb2xib3g7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgY2F0ZWdvcnkgPSBmdW5jdGlvbiAobmFtZSwgYmxvY2tzKSB7XG4gIHJldHVybiAnPGNhdGVnb3J5IGlkPVwiJyArIG5hbWUgKyAnXCIgbmFtZT1cIicgKyBuYW1lICsgJ1wiPicgKyBibG9ja3MgKyAnPC9jYXRlZ29yeT4nO1xufTtcblxudmFyIG1vdmVGb3J3YXJkQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJjcmFmdF9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+JztcblxuZnVuY3Rpb24gY3JhZnRCbG9jayh0eXBlKSB7XG4gIHJldHVybiBibG9jayhcImNyYWZ0X1wiICsgdHlwZSk7XG59XG5cbmZ1bmN0aW9uIGJsb2NrKHR5cGUpIHtcbiAgcmV0dXJuICc8YmxvY2sgdHlwZT1cIicgKyB0eXBlICsgJ1wiPjwvYmxvY2s+Jztcbn1cblxudmFyIHJlcGVhdERyb3Bkb3duID0gJzxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X2Ryb3Bkb3duXCI+JyArXG4gICcgIDx0aXRsZSBuYW1lPVwiVElNRVNcIiBjb25maWc9XCIzLTEwXCI+Pz8/PC90aXRsZT4nICtcbiAgJzwvYmxvY2s+JztcblxudmFyIHR1cm5MZWZ0QmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJjcmFmdF90dXJuXCI+JyArXG4gICcgIDx0aXRsZSBuYW1lPVwiRElSXCI+bGVmdDwvdGl0bGU+JyArXG4gICc8L2Jsb2NrPic7XG5cbnZhciB0dXJuUmlnaHRCbG9jayA9ICc8YmxvY2sgdHlwZT1cImNyYWZ0X3R1cm5cIj4nICtcbiAgICAnPHRpdGxlIG5hbWU9XCJESVJcIj5yaWdodDwvdGl0bGU+JyArXG4gICc8L2Jsb2NrPic7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAncGxheWdyb3VuZCc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgICAnZnJlZVBsYXknOiB0cnVlLFxuICAgICd0b29sYm94JzogdGIoY3JhZnRCbG9jaygnbW92ZUZvcndhcmQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3R1cm5SaWdodCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygndHVybkxlZnQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ2Rlc3Ryb3lCbG9jaycpICtcbiAgICAgICAgY3JhZnRCbG9jaygncGxhY2VCbG9jaycpICtcbiAgICAgICAgYmxvY2soJ2NvbnRyb2xzX3JlcGVhdCcpICtcbiAgICAgICAgcmVwZWF0RHJvcGRvd24gK1xuICAgICAgICBjcmFmdEJsb2NrKCd3aGlsZUJsb2NrQWhlYWQnKVxuICAgICksXG4gICAgJ3N0YXJ0QmxvY2tzJzogJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+JyxcblxuICAgIGdyb3VuZFBsYW5lOiBbXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJjb2Fyc2VEaXJ0XCIsIFwiY29hcnNlRGlydFwiLCBcImNvYXJzZURpcnRcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiXG4gICAgXSxcblxuICAgIGdyb3VuZERlY29yYXRpb25QbGFuZTogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwidGFsbEdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCJdLFxuXG4gICAgYWN0aW9uUGxhbmU6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcIlwiLCBcImdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiXG4gICAgXSxcblxuICAgIGZsdWZmUGxhbmU6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiXG4gICAgXSxcbiAgfSxcbiAgJzEnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW10sXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHRiKGNyYWZ0QmxvY2soJ21vdmVGb3J3YXJkJykgK1xuICAgICAgICBjcmFmdEJsb2NrKCd0dXJuUmlnaHQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3R1cm5MZWZ0JylcbiAgICApLFxuICAgICdzdGFydEJsb2Nrcyc6ICc8YmxvY2sgdHlwZT1cIndoZW5fcnVuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPicsXG5cbiAgICBwbGF5ZXJTdGFydFBvc2l0aW9uOiBbMywgNF0sXG5cbiAgICBncm91bmRQbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiY29hcnNlRGlydFwiLCBcImNvYXJzZURpcnRcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIlxuICAgIF0sXG5cbiAgICBncm91bmREZWNvcmF0aW9uUGxhbmU6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcInRhbGxHcmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSxcblxuICAgIGFjdGlvblBsYW5lOiBbXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJcIiwgXCJncmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImdyYXNzXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIlxuICAgIF0sXG5cbiAgICBmbHVmZlBsYW5lOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIlxuICAgIF0sXG5cbiAgICB2ZXJpZmljYXRpb25GdW5jdGlvbjogZnVuY3Rpb24gKHZlcmlmaWNhdGlvbkFQSSkge1xuICAgICAgcmV0dXJuIHZlcmlmaWNhdGlvbkFQSS5pc1BsYXllck5leHRUbyhcImxvZ09ha1wiKTtcbiAgICB9LFxuXG4gIH0sXG4gICcyJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtdLFxuICAgICdmcmVlUGxheSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB0YihjcmFmdEJsb2NrKCdtb3ZlRm9yd2FyZCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygndHVyblJpZ2h0JykgK1xuICAgICAgICBjcmFmdEJsb2NrKCd0dXJuTGVmdCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygnZGVzdHJveUJsb2NrJykgK1xuICAgICAgICBjcmFmdEJsb2NrKCdwbGFjZUJsb2NrJykgK1xuICAgICAgICBibG9jaygnY29udHJvbHNfcmVwZWF0JykgK1xuICAgICAgICByZXBlYXREcm9wZG93biArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3doaWxlQmxvY2tBaGVhZCcpXG4gICAgKSxcbiAgICAnc3RhcnRCbG9ja3MnOiAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nLFxuXG4gICAgZ3JvdW5kUGxhbmU6IFtcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImNvYXJzZURpcnRcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwiY29hcnNlRGlydFwiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCJcbiAgICBdLFxuXG4gICAgZ3JvdW5kRGVjb3JhdGlvblBsYW5lOiBbXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwidGFsbEdyYXNzXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcInRhbGxHcmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSxcblxuICAgIGFjdGlvblBsYW5lOiBbXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgIF0sXG5cbiAgICBmbHVmZlBsYW5lOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICBdLFxuICB9LFxuICAnY3VzdG9tJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtdLFxuICAgICdmcmVlUGxheSc6IGZhbHNlLFxuICAgICd0b29sYm94JzogdGIobW92ZUZvcndhcmRCbG9jayArIHR1cm5MZWZ0QmxvY2sgKyB0dXJuUmlnaHRCbG9jaylcbiAgfVxufTtcbiIsIi8qIGdsb2JhbCB0cmFja0V2ZW50ICovXG5cbi8qanNoaW50IC1XMDYxICovXG4vLyBXZSB1c2UgZXZhbCBpbiBvdXIgY29kZSwgdGhpcyBhbGxvd3MgaXQuXG4vLyBAc2VlIGh0dHBzOi8vanNsaW50ZXJyb3JzLmNvbS9ldmFsLWlzLWV2aWxcblxuJ3VzZSBzdHJpY3QnO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBjcmFmdE1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBHYW1lQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vZ2FtZS9HYW1lQ29udHJvbGxlcicpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIGhvdXNlTGV2ZWxzID0gcmVxdWlyZSgnLi9ob3VzZUxldmVscycpO1xudmFyIGxldmVsYnVpbGRlck92ZXJyaWRlcyA9IHJlcXVpcmUoJy4vbGV2ZWxidWlsZGVyT3ZlcnJpZGVzJyk7XG52YXIgTXVzaWNDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vTXVzaWNDb250cm9sbGVyJyk7XG5cbnZhciBSZXN1bHRUeXBlID0gc3R1ZGlvQXBwLlJlc3VsdFR5cGU7XG52YXIgVGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuVGVzdFJlc3VsdHM7XG5cbnZhciBNRURJQV9VUkwgPSAnL2Jsb2NrbHkvbWVkaWEvY3JhZnQvJztcblxuLyoqXG4gKiBDcmVhdGUgYSBuYW1lc3BhY2UgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xudmFyIENyYWZ0ID0gbW9kdWxlLmV4cG9ydHM7XG5cbnZhciBjaGFyYWN0ZXJzID0ge1xuICBTdGV2ZToge1xuICAgIG5hbWU6IFwiU3RldmVcIixcbiAgICBzdGF0aWNBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfU3RldmVfTmV1dHJhbC5wbmdcIixcbiAgICBzbWFsbFN0YXRpY0F2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9TdGV2ZV9OZXV0cmFsLnBuZ1wiLFxuICAgIGZhaWx1cmVBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfU3RldmVfRmFpbC5wbmdcIixcbiAgICB3aW5BdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfU3RldmVfV2luLnBuZ1wiLFxuICB9LFxuICBBbGV4OiB7XG4gICAgbmFtZTogXCJBbGV4XCIsXG4gICAgc3RhdGljQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX0FsZXhfTmV1dHJhbC5wbmdcIixcbiAgICBzbWFsbFN0YXRpY0F2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9BbGV4X05ldXRyYWwucG5nXCIsXG4gICAgZmFpbHVyZUF2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9BbGV4X0ZhaWwucG5nXCIsXG4gICAgd2luQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX0FsZXhfV2luLnBuZ1wiLFxuICB9XG59O1xuXG52YXIgaW50ZXJmYWNlSW1hZ2VzID0ge1xuICBERUZBVUxUOiBbXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvTUNfTG9hZGluZ19TcGlubmVyLmdpZlwiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0ZyYW1lX0xhcmdlX1BsdXNfTG9nby5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvWF9CdXR0b24ucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvQnV0dG9uX0dyZXlfU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUnVuX0J1dHRvbl9VcF9TbGljZS5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9NQ19SdW5fQXJyb3dfSWNvbi5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9SdW5fQnV0dG9uX0Rvd25fU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUmVzZXRfQnV0dG9uX1VwX1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL01DX1Jlc2V0X0Fycm93X0ljb24ucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUmVzZXRfQnV0dG9uX0Rvd25fU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvQ2FsbG91dF9UYWlsLnBuZ1wiLFxuICBdLFxuICAxOiBbXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvU3RldmVfQ2hhcmFjdGVyX1NlbGVjdC5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9BbGV4X0NoYXJhY3Rlcl9TZWxlY3QucG5nXCIsXG4gICAgY2hhcmFjdGVycy5TdGV2ZS5zdGF0aWNBdmF0YXIsXG4gICAgY2hhcmFjdGVycy5TdGV2ZS5zbWFsbFN0YXRpY0F2YXRhcixcbiAgICBjaGFyYWN0ZXJzLkFsZXguc3RhdGljQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuQWxleC5zbWFsbFN0YXRpY0F2YXRhcixcbiAgXSxcbiAgMjogW1xuICAgIC8vIFRPRE8oYmpvcmRhbik6IGZpbmQgZGlmZmVyZW50IHByZS1sb2FkIHBvaW50IGZvciBmZWVkYmFjayBpbWFnZXMsXG4gICAgLy8gYnVja2V0IGJ5IHNlbGVjdGVkIGNoYXJhY3RlclxuICAgIGNoYXJhY3RlcnMuQWxleC53aW5BdmF0YXIsXG4gICAgY2hhcmFjdGVycy5TdGV2ZS53aW5BdmF0YXIsXG4gICAgY2hhcmFjdGVycy5BbGV4LmZhaWx1cmVBdmF0YXIsXG4gICAgY2hhcmFjdGVycy5TdGV2ZS5mYWlsdXJlQXZhdGFyLFxuICBdLFxuICA2OiBbXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvSG91c2VfT3B0aW9uX0FfdjMucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvSG91c2VfT3B0aW9uX0JfdjMucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvSG91c2VfT3B0aW9uX0NfdjMucG5nXCIsXG4gIF1cbn07XG5cbnZhciBNVVNJQ19NRVRBREFUQSA9IFtcbiAge3ZvbHVtZTogMSwgaGFzT2dnOiB0cnVlLCBuYW1lOiBcInZpZ25ldHRlMVwifSxcbiAge3ZvbHVtZTogMSwgaGFzT2dnOiB0cnVlLCBuYW1lOiBcInZpZ25ldHRlMi1xdWlldFwifSxcbiAge3ZvbHVtZTogMSwgaGFzT2dnOiB0cnVlLCBuYW1lOiBcInZpZ25ldHRlM1wifSxcbiAge3ZvbHVtZTogMSwgaGFzT2dnOiB0cnVlLCBuYW1lOiBcInZpZ25ldHRlNC1pbnRyb1wifSxcbiAge3ZvbHVtZTogMSwgaGFzT2dnOiB0cnVlLCBuYW1lOiBcInZpZ25ldHRlNS1zaG9ydHBpYW5vXCJ9LFxuICB7dm9sdW1lOiAxLCBoYXNPZ2c6IHRydWUsIG5hbWU6IFwidmlnbmV0dGU3LWZ1bmt5LWNoaXJwcy1zaG9ydFwifSxcbiAge3ZvbHVtZTogMSwgaGFzT2dnOiB0cnVlLCBuYW1lOiBcInZpZ25ldHRlOC1mcmVlLXBsYXlcIn0sXG5dO1xuXG52YXIgQ0hBUkFDVEVSX1NURVZFID0gJ1N0ZXZlJztcbnZhciBDSEFSQUNURVJfQUxFWCA9ICdBbGV4JztcbnZhciBERUZBVUxUX0NIQVJBQ1RFUiA9IENIQVJBQ1RFUl9TVEVWRTtcbnZhciBBVVRPX0xPQURfQ0hBUkFDVEVSX0FTU0VUX1BBQ0sgPSAncGxheWVyJyArIERFRkFVTFRfQ0hBUkFDVEVSO1xuXG5mdW5jdGlvbiB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKGtleSwgdmFsdWUpIHtcbiAgdHJ5IHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvKipcbiAgICAgKiBsb2NhbHN0b3JhZ2UgLnNldEl0ZW0gaW4gaU9TIFNhZmFyaSBQcml2YXRlIE1vZGUgYWx3YXlzIGNhdXNlcyBhblxuICAgICAqIGV4Y2VwdGlvbiwgc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE0NTU1MzYxXG4gICAgICovXG4gICAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ291bGRuJ3Qgc2V0IGxvY2FsIHN0b3JhZ2UgaXRlbSBmb3Iga2V5IFwiICsga2V5KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSBDcmFmdCBhcHAuIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbkNyYWZ0LmluaXQgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gIGlmIChjb25maWcubGV2ZWwucHV6emxlX251bWJlciA9PT0gMSAmJiBjb25maWcubGV2ZWwuc3RhZ2VfdG90YWwgPT09IDEpIHtcbiAgICAvLyBOb3Qgdmlld2luZyBsZXZlbCB3aXRoaW4gYSBzY3JpcHQsIGJ1bXAgcHV6emxlICMgdG8gdW51c2VkIG9uZSBzb1xuICAgIC8vIGFzc2V0IGxvYWRpbmcgc3lzdGVtIGFuZCBsZXZlbGJ1aWxkZXIgb3ZlcnJpZGVzIGRvbid0IHRoaW5rIHRoaXMgaXNcbiAgICAvLyBsZXZlbCAxIG9yIGFueSBvdGhlciBzcGVjaWFsIGxldmVsLlxuICAgIGNvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyID0gOTk5O1xuICB9XG5cbiAgaWYgKGNvbmZpZy5sZXZlbC5pc1Rlc3RMZXZlbCkge1xuICAgIGNvbmZpZy5sZXZlbC5jdXN0b21TbG93TW90aW9uID0gMC4xO1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSB2ZXJzaW9uIG9mIEludGVybmV0IEV4cGxvcmVyICg4Kykgb3IgdW5kZWZpbmVkIGlmIG5vdCBJRS5cbiAgdmFyIGdldElFVmVyc2lvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5kb2N1bWVudE1vZGU7XG4gIH07XG5cbiAgdmFyIGllVmVyc2lvbk51bWJlciA9IGdldElFVmVyc2lvbigpO1xuICBpZiAoaWVWZXJzaW9uTnVtYmVyKSB7XG4gICAgJCgnYm9keScpLmFkZENsYXNzKFwiaWVWZXJzaW9uXCIgKyBpZVZlcnNpb25OdW1iZXIpO1xuICB9XG5cbiAgdmFyIGJvZHlFbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcbiAgYm9keUVsZW1lbnQuY2xhc3NOYW1lID0gYm9keUVsZW1lbnQuY2xhc3NOYW1lICsgXCIgbWluZWNyYWZ0XCI7XG5cbiAgaWYgKGNvbmZpZy5sZXZlbC5zaG93UG9wdXBPbkxvYWQpIHtcbiAgICBjb25maWcubGV2ZWwuYWZ0ZXJWaWRlb0JlZm9yZUluc3RydWN0aW9uc0ZuID0gKHNob3dJbnN0cnVjdGlvbnMpID0+IHtcbiAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgZXZlbnQuaW5pdEV2ZW50KCdpbnN0cnVjdGlvbnNTaG93bicsIHRydWUsIHRydWUpO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cbiAgICAgIGlmIChjb25maWcubGV2ZWwuc2hvd1BvcHVwT25Mb2FkID09PSAncGxheWVyU2VsZWN0aW9uJykge1xuICAgICAgICBDcmFmdC5zaG93UGxheWVyU2VsZWN0aW9uUG9wdXAoZnVuY3Rpb24gKHNlbGVjdGVkUGxheWVyKSB7XG4gICAgICAgICAgdHJhY2tFdmVudCgnTWluZWNyYWZ0JywgJ0Nob3NlQ2hhcmFjdGVyJywgc2VsZWN0ZWRQbGF5ZXIpO1xuICAgICAgICAgIENyYWZ0LmNsZWFyUGxheWVyU3RhdGUoKTtcbiAgICAgICAgICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdFNlbGVjdGVkUGxheWVyJywgc2VsZWN0ZWRQbGF5ZXIpO1xuICAgICAgICAgIENyYWZ0LnVwZGF0ZVVJRm9yQ2hhcmFjdGVyKHNlbGVjdGVkUGxheWVyKTtcbiAgICAgICAgICBDcmFmdC5pbml0aWFsaXplQXBwTGV2ZWwoY29uZmlnLmxldmVsKTtcbiAgICAgICAgICBzaG93SW5zdHJ1Y3Rpb25zKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcubGV2ZWwuc2hvd1BvcHVwT25Mb2FkID09PSAnaG91c2VMYXlvdXRTZWxlY3Rpb24nKSB7XG4gICAgICAgIENyYWZ0LnNob3dIb3VzZVNlbGVjdGlvblBvcHVwKGZ1bmN0aW9uKHNlbGVjdGVkSG91c2UpIHtcbiAgICAgICAgICB0cmFja0V2ZW50KCdNaW5lY3JhZnQnLCAnQ2hvc2VIb3VzZScsIHNlbGVjdGVkSG91c2UpO1xuICAgICAgICAgIGlmICghbGV2ZWxDb25maWcuZWRpdF9ibG9ja3MpIHtcbiAgICAgICAgICAgICQuZXh0ZW5kKGNvbmZpZy5sZXZlbCwgaG91c2VMZXZlbHNbc2VsZWN0ZWRIb3VzZV0pO1xuXG4gICAgICAgICAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmNsZWFyKCk7XG4gICAgICAgICAgICBzdHVkaW9BcHAuc2V0U3RhcnRCbG9ja3NfKGNvbmZpZywgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIENyYWZ0LmluaXRpYWxpemVBcHBMZXZlbChjb25maWcubGV2ZWwpO1xuICAgICAgICAgIHNob3dJbnN0cnVjdGlvbnMoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGlmIChjb25maWcubGV2ZWwucHV6emxlX251bWJlciAmJiBsZXZlbGJ1aWxkZXJPdmVycmlkZXNbY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXJdKSB7XG4gICAgJC5leHRlbmQoY29uZmlnLmxldmVsLCBsZXZlbGJ1aWxkZXJPdmVycmlkZXNbY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXJdKTtcbiAgfVxuICBDcmFmdC5pbml0aWFsQ29uZmlnID0gY29uZmlnO1xuXG4gIC8vIHJlcGxhY2Ugc3R1ZGlvQXBwIG1ldGhvZHMgd2l0aCBvdXIgb3duXG4gIHN0dWRpb0FwcC5yZXNldCA9IHRoaXMucmVzZXQuYmluZCh0aGlzKTtcbiAgc3R1ZGlvQXBwLnJ1bkJ1dHRvbkNsaWNrID0gdGhpcy5ydW5CdXR0b25DbGljay5iaW5kKHRoaXMpO1xuXG4gIENyYWZ0LmxldmVsID0gY29uZmlnLmxldmVsO1xuICBDcmFmdC5za2luID0gY29uZmlnLnNraW47XG5cbiAgdmFyIGxldmVsVHJhY2tzID0gW107XG4gIGlmIChDcmFmdC5sZXZlbC5zb25ncyAmJiBNVVNJQ19NRVRBREFUQSkge1xuICAgIGxldmVsVHJhY2tzID0gTVVTSUNfTUVUQURBVEEuZmlsdGVyKGZ1bmN0aW9uKHRyYWNrTWV0YWRhdGEpIHtcbiAgICAgIHJldHVybiBDcmFmdC5sZXZlbC5zb25ncy5pbmRleE9mKHRyYWNrTWV0YWRhdGEubmFtZSkgIT09IC0xO1xuICAgIH0pO1xuICB9XG5cbiAgQ3JhZnQubXVzaWNDb250cm9sbGVyID0gbmV3IE11c2ljQ29udHJvbGxlcihcbiAgICAgIHN0dWRpb0FwcC5jZG9Tb3VuZHMsXG4gICAgICBmdW5jdGlvbiAoZmlsZW5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5za2luLmFzc2V0VXJsKGBtdXNpYy8ke2ZpbGVuYW1lfWApO1xuICAgICAgfSxcbiAgICAgIGxldmVsVHJhY2tzLFxuICAgICAgbGV2ZWxUcmFja3MubGVuZ3RoID4gMSA/IDc1MDAgOiBudWxsXG4gICk7XG5cbiAgLy8gUGxheSBtdXNpYyB3aGVuIHRoZSBpbnN0cnVjdGlvbnMgYXJlIHNob3duXG4gIHZhciBwbGF5T25jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnN0cnVjdGlvbnNIaWRkZW4nLCBwbGF5T25jZSk7XG4gICAgaWYgKHN0dWRpb0FwcC5jZG9Tb3VuZHMpIHtcbiAgICAgIHN0dWRpb0FwcC5jZG9Tb3VuZHMud2hlbkF1ZGlvVW5sb2NrZWQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaGFzU29uZ0luTGV2ZWwgPSBDcmFmdC5sZXZlbC5zb25ncyAmJiBDcmFmdC5sZXZlbC5zb25ncy5sZW5ndGggPiAxO1xuICAgICAgICB2YXIgc29uZ1RvUGxheUZpcnN0ID0gaGFzU29uZ0luTGV2ZWwgPyBDcmFmdC5sZXZlbC5zb25nc1swXSA6IG51bGw7XG4gICAgICAgIENyYWZ0Lm11c2ljQ29udHJvbGxlci5wbGF5KHNvbmdUb1BsYXlGaXJzdCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2luc3RydWN0aW9uc0hpZGRlbicsIHBsYXlPbmNlKTtcblxuICB2YXIgY2hhcmFjdGVyID0gY2hhcmFjdGVyc1tDcmFmdC5nZXRDdXJyZW50Q2hhcmFjdGVyKCldO1xuICBjb25maWcuc2tpbi5zdGF0aWNBdmF0YXIgPSBjaGFyYWN0ZXIuc3RhdGljQXZhdGFyO1xuICBjb25maWcuc2tpbi5zbWFsbFN0YXRpY0F2YXRhciA9IGNoYXJhY3Rlci5zbWFsbFN0YXRpY0F2YXRhcjtcbiAgY29uZmlnLnNraW4uZmFpbHVyZUF2YXRhciA9IGNoYXJhY3Rlci5mYWlsdXJlQXZhdGFyO1xuICBjb25maWcuc2tpbi53aW5BdmF0YXIgPSBjaGFyYWN0ZXIud2luQXZhdGFyO1xuXG4gIHZhciBsZXZlbENvbmZpZyA9IGNvbmZpZy5sZXZlbDtcbiAgdmFyIHNwZWNpYWxMZXZlbFR5cGUgPSBsZXZlbENvbmZpZy5zcGVjaWFsTGV2ZWxUeXBlO1xuICBzd2l0Y2ggKHNwZWNpYWxMZXZlbFR5cGUpIHtcbiAgICBjYXNlICdob3VzZVdhbGxCdWlsZCc6XG4gICAgICBsZXZlbENvbmZpZy5ibG9ja3NUb1N0b3JlID0gW1xuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcImhvdXNlQm90dG9tQVwiLCBcImhvdXNlQm90dG9tQlwiLCBcImhvdXNlQm90dG9tQ1wiLCBcImhvdXNlQm90dG9tRFwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXG4gICAgICBdO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBzdHVkaW9BcHAuaW5pdCgkLmV4dGVuZCh7fSwgY29uZmlnLCB7XG4gICAgZm9yY2VJbnNlcnRUb3BCbG9jazogJ3doZW5fcnVuJyxcbiAgICBodG1sOiByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpKHtcbiAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgICB2aXN1YWxpemF0aW9uOiByZXF1aXJlKCcuL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMnKSgpLFxuICAgICAgICBjb250cm9sczogcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHtcbiAgICAgICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgICAgIHNoYXJlYWJsZTogY29uZmlnLmxldmVsLnNoYXJlYWJsZVxuICAgICAgICB9KSxcbiAgICAgICAgZWRpdENvZGU6IGNvbmZpZy5sZXZlbC5lZGl0Q29kZSxcbiAgICAgICAgYmxvY2tDb3VudGVyQ2xhc3M6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgICB9XG4gICAgfSksXG4gICAgYXBwU3RyaW5nczoge1xuICAgICAgZ2VuZXJhdGVkQ29kZURlc2NyaXB0aW9uOiBjcmFmdE1zZy5nZW5lcmF0ZWRDb2RlRGVzY3JpcHRpb24oKSxcbiAgICB9LFxuICAgIGxvYWRBdWRpbzogZnVuY3Rpb24gKCkge1xuICAgIH0sXG4gICAgYWZ0ZXJJbmplY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzbG93TW90aW9uVVJMUGFyYW0gPSBwYXJzZUZsb2F0KChsb2NhdGlvbi5zZWFyY2guc3BsaXQoJ2N1c3RvbVNsb3dNb3Rpb249JylbMV0gfHwgJycpLnNwbGl0KCcmJylbMF0pO1xuICAgICAgQ3JhZnQuZ2FtZUNvbnRyb2xsZXIgPSBuZXcgR2FtZUNvbnRyb2xsZXIoe1xuICAgICAgICBQaGFzZXI6IHdpbmRvdy5QaGFzZXIsXG4gICAgICAgIGNvbnRhaW5lcklkOiAncGhhc2VyLWdhbWUnLFxuICAgICAgICBhc3NldFJvb3Q6IENyYWZ0LnNraW4uYXNzZXRVcmwoJycpLFxuICAgICAgICBhdWRpb1BsYXllcjoge1xuICAgICAgICAgIHJlZ2lzdGVyOiBzdHVkaW9BcHAucmVnaXN0ZXJBdWRpby5iaW5kKHN0dWRpb0FwcCksXG4gICAgICAgICAgcGxheTogc3R1ZGlvQXBwLnBsYXlBdWRpby5iaW5kKHN0dWRpb0FwcClcbiAgICAgICAgfSxcbiAgICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgICBjdXN0b21TbG93TW90aW9uOiBzbG93TW90aW9uVVJMUGFyYW0sIC8vIE5hTiBpZiBub3Qgc2V0XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJzdCBhc3NldCBwYWNrcyB0byBsb2FkIHdoaWxlIHZpZGVvIHBsYXlpbmcsIGV0Yy5cbiAgICAgICAgICogV29uJ3QgbWF0dGVyIGZvciBsZXZlbHMgd2l0aG91dCBkZWxheWVkIGxldmVsIGluaXRpYWxpemF0aW9uXG4gICAgICAgICAqIChkdWUgdG8gZS5nLiBjaGFyYWN0ZXIgLyBob3VzZSBzZWxlY3QgcG9wdXBzKS5cbiAgICAgICAgICovXG4gICAgICAgIGVhcmx5TG9hZEFzc2V0UGFja3M6IENyYWZ0LmVhcmx5TG9hZEFzc2V0c0ZvckxldmVsKGxldmVsQ29uZmlnLnB1enpsZV9udW1iZXIpLFxuICAgICAgICBhZnRlckFzc2V0c0xvYWRlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIHByZWxvYWQgbXVzaWMgYWZ0ZXIgZXNzZW50aWFsIGdhbWUgYXNzZXQgZG93bmxvYWRzIGNvbXBsZXRlbHkgZmluaXNoZWRcbiAgICAgICAgICBDcmFmdC5tdXNpY0NvbnRyb2xsZXIucHJlbG9hZCgpO1xuICAgICAgICB9LFxuICAgICAgICBlYXJseUxvYWROaWNlVG9IYXZlQXNzZXRQYWNrczogQ3JhZnQubmljZVRvSGF2ZUFzc2V0c0ZvckxldmVsKGxldmVsQ29uZmlnLnB1enpsZV9udW1iZXIpLFxuICAgICAgfSk7XG5cbiAgICAgIGlmICghY29uZmlnLmxldmVsLnNob3dQb3B1cE9uTG9hZCkge1xuICAgICAgICBDcmFmdC5pbml0aWFsaXplQXBwTGV2ZWwoY29uZmlnLmxldmVsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHR3aXR0ZXI6IHtcbiAgICAgIHRleHQ6IFwiU2hhcmUgb24gVHdpdHRlclwiLFxuICAgICAgaGFzaHRhZzogXCJDcmFmdFwiXG4gICAgfVxuICB9KSk7XG5cbiAgdmFyIGludGVyZmFjZUltYWdlc1RvTG9hZCA9IFtdO1xuICBpbnRlcmZhY2VJbWFnZXNUb0xvYWQgPSBpbnRlcmZhY2VJbWFnZXNUb0xvYWQuY29uY2F0KGludGVyZmFjZUltYWdlcy5ERUZBVUxUKTtcblxuICBpZiAoY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXIgJiYgaW50ZXJmYWNlSW1hZ2VzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXSkge1xuICAgIGludGVyZmFjZUltYWdlc1RvTG9hZCA9XG4gICAgICAgIGludGVyZmFjZUltYWdlc1RvTG9hZC5jb25jYXQoaW50ZXJmYWNlSW1hZ2VzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXSk7XG4gIH1cblxuICBpbnRlcmZhY2VJbWFnZXNUb0xvYWQuZm9yRWFjaChmdW5jdGlvbih1cmwpIHtcbiAgICBwcmVsb2FkSW1hZ2UodXJsKTtcbiAgfSk7XG5cbiAgdmFyIHNoYXJlQnV0dG9uID0gJCgnLm1jLXNoYXJlLWJ1dHRvbicpO1xuICBpZiAoc2hhcmVCdXR0b24ubGVuZ3RoKSB7XG4gICAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChzaGFyZUJ1dHRvblswXSwgZnVuY3Rpb24gKCkge1xuICAgICAgQ3JhZnQucmVwb3J0UmVzdWx0KHRydWUpO1xuICAgIH0pO1xuICB9XG59O1xuXG52YXIgcHJlbG9hZEltYWdlID0gZnVuY3Rpb24odXJsKSB7XG4gIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgaW1nLnNyYyA9IHVybDtcbn07XG5cbkNyYWZ0LmNoYXJhY3RlckFzc2V0UGFja05hbWUgPSBmdW5jdGlvbiAocGxheWVyTmFtZSkge1xuICByZXR1cm4gJ3BsYXllcicgKyBwbGF5ZXJOYW1lO1xufTtcblxuQ3JhZnQuZ2V0Q3VycmVudENoYXJhY3RlciA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhZnRTZWxlY3RlZFBsYXllcicpIHx8IERFRkFVTFRfQ0hBUkFDVEVSO1xufTtcblxuQ3JhZnQudXBkYXRlVUlGb3JDaGFyYWN0ZXIgPSBmdW5jdGlvbiAoY2hhcmFjdGVyKSB7XG4gIENyYWZ0LmluaXRpYWxDb25maWcuc2tpbi5zdGF0aWNBdmF0YXIgPSBjaGFyYWN0ZXJzW2NoYXJhY3Rlcl0uc3RhdGljQXZhdGFyO1xuICBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4uc21hbGxTdGF0aWNBdmF0YXIgPSBjaGFyYWN0ZXJzW2NoYXJhY3Rlcl0uc21hbGxTdGF0aWNBdmF0YXI7XG4gIENyYWZ0LmluaXRpYWxDb25maWcuc2tpbi5mYWlsdXJlQXZhdGFyID0gY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLmZhaWx1cmVBdmF0YXI7XG4gIENyYWZ0LmluaXRpYWxDb25maWcuc2tpbi53aW5BdmF0YXIgPSBjaGFyYWN0ZXJzW2NoYXJhY3Rlcl0ud2luQXZhdGFyO1xuICBzdHVkaW9BcHAuc2V0SWNvbnNGcm9tU2tpbihDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4pO1xuICAkKCcjcHJvbXB0LWljb24nKS5hdHRyKCdzcmMnLCBjaGFyYWN0ZXJzW2NoYXJhY3Rlcl0uc21hbGxTdGF0aWNBdmF0YXIpO1xufTtcblxuQ3JhZnQuc2hvd1BsYXllclNlbGVjdGlvblBvcHVwID0gZnVuY3Rpb24gKG9uU2VsZWN0ZWRDYWxsYmFjaykge1xuICB2YXIgc2VsZWN0ZWRQbGF5ZXIgPSBERUZBVUxUX0NIQVJBQ1RFUjtcbiAgdmFyIHBvcHVwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHBvcHVwRGl2LmlubmVySFRNTCA9IHJlcXVpcmUoJy4vZGlhbG9ncy9wbGF5ZXJTZWxlY3Rpb24uaHRtbC5lanMnKSh7XG4gICAgaW1hZ2U6IHN0dWRpb0FwcC5hc3NldFVybCgpXG4gIH0pO1xuICB2YXIgcG9wdXBEaWFsb2cgPSBzdHVkaW9BcHAuY3JlYXRlTW9kYWxEaWFsb2coe1xuICAgIGNvbnRlbnREaXY6IHBvcHVwRGl2LFxuICAgIGRlZmF1bHRCdG5TZWxlY3RvcjogJyNjaG9vc2Utc3RldmUnLFxuICAgIG9uSGlkZGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICBvblNlbGVjdGVkQ2FsbGJhY2soc2VsZWN0ZWRQbGF5ZXIpO1xuICAgIH0sXG4gICAgaWQ6ICdjcmFmdC1wb3B1cC1wbGF5ZXItc2VsZWN0aW9uJyxcbiAgfSk7XG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nsb3NlLWNoYXJhY3Rlci1zZWxlY3QnKVswXSwgZnVuY3Rpb24gKCkge1xuICAgIHBvcHVwRGlhbG9nLmhpZGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudCgkKCcjY2hvb3NlLXN0ZXZlJylbMF0sIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxlY3RlZFBsYXllciA9IENIQVJBQ1RFUl9TVEVWRTtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nob29zZS1hbGV4JylbMF0sIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxlY3RlZFBsYXllciA9IENIQVJBQ1RFUl9BTEVYO1xuICAgIHBvcHVwRGlhbG9nLmhpZGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcbiAgcG9wdXBEaWFsb2cuc2hvdygpO1xufTtcblxuQ3JhZnQuc2hvd0hvdXNlU2VsZWN0aW9uUG9wdXAgPSBmdW5jdGlvbiAob25TZWxlY3RlZENhbGxiYWNrKSB7XG4gIHZhciBwb3B1cERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBwb3B1cERpdi5pbm5lckhUTUwgPSByZXF1aXJlKCcuL2RpYWxvZ3MvaG91c2VTZWxlY3Rpb24uaHRtbC5lanMnKSh7XG4gICAgaW1hZ2U6IHN0dWRpb0FwcC5hc3NldFVybCgpXG4gIH0pO1xuICB2YXIgc2VsZWN0ZWRIb3VzZSA9ICdob3VzZUEnO1xuXG4gIHZhciBwb3B1cERpYWxvZyA9IHN0dWRpb0FwcC5jcmVhdGVNb2RhbERpYWxvZyh7XG4gICAgY29udGVudERpdjogcG9wdXBEaXYsXG4gICAgZGVmYXVsdEJ0blNlbGVjdG9yOiAnI2Nob29zZS1ob3VzZS1hJyxcbiAgICBvbkhpZGRlbjogZnVuY3Rpb24gKCkge1xuICAgICAgb25TZWxlY3RlZENhbGxiYWNrKHNlbGVjdGVkSG91c2UpO1xuICAgIH0sXG4gICAgaWQ6ICdjcmFmdC1wb3B1cC1ob3VzZS1zZWxlY3Rpb24nLFxuICAgIGljb246IGNoYXJhY3RlcnNbQ3JhZnQuZ2V0Q3VycmVudENoYXJhY3RlcigpXS5zdGF0aWNBdmF0YXJcbiAgfSk7XG5cbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudCgkKCcjY2xvc2UtaG91c2Utc2VsZWN0JylbMF0sIGZ1bmN0aW9uICgpIHtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nob29zZS1ob3VzZS1hJylbMF0sIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxlY3RlZEhvdXNlID0gXCJob3VzZUFcIjtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nob29zZS1ob3VzZS1iJylbMF0sIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxlY3RlZEhvdXNlID0gXCJob3VzZUJcIjtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nob29zZS1ob3VzZS1jJylbMF0sIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxlY3RlZEhvdXNlID0gXCJob3VzZUNcIjtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgcG9wdXBEaWFsb2cuc2hvdygpO1xufTtcblxuQ3JhZnQuY2xlYXJQbGF5ZXJTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjcmFmdEhvdXNlQmxvY2tzJyk7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhZnRQbGF5ZXJJbnZlbnRvcnknKTtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdjcmFmdFNlbGVjdGVkUGxheWVyJyk7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhZnRTZWxlY3RlZEhvdXNlJyk7XG59O1xuXG5DcmFmdC5vbkhvdXNlU2VsZWN0ZWQgPSBmdW5jdGlvbiAoaG91c2VUeXBlKSB7XG4gIHRyeVNldExvY2FsU3RvcmFnZUl0ZW0oJ2NyYWZ0U2VsZWN0ZWRIb3VzZScsIGhvdXNlVHlwZSk7XG59O1xuXG5DcmFmdC5pbml0aWFsaXplQXBwTGV2ZWwgPSBmdW5jdGlvbiAobGV2ZWxDb25maWcpIHtcbiAgdmFyIGhvdXNlQmxvY2tzID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWZ0SG91c2VCbG9ja3MnKSk7XG4gIENyYWZ0LmZvbGRJbkN1c3RvbUhvdXNlQmxvY2tzKGhvdXNlQmxvY2tzLCBsZXZlbENvbmZpZyk7XG5cbiAgdmFyIGZsdWZmUGxhbmUgPSBbXTtcbiAgLy8gVE9ETyhiam9yZGFuKTogcmVtb3ZlIGNvbmZpZ3VyYXRpb24gcmVxdWlyZW1lbnQgaW4gdmlzdWFsaXphdGlvblxuICBmb3IgKHZhciBpID0gMDsgaSA8IChsZXZlbENvbmZpZy5ncmlkV2lkdGggfHwgMTApICogKGxldmVsQ29uZmlnLmdyaWRIZWlnaHQgfHwgMTApOyBpKyspIHtcbiAgICBmbHVmZlBsYW5lLnB1c2goJycpO1xuICB9XG5cbiAgdmFyIGxldmVsQXNzZXRQYWNrcyA9IHtcbiAgICBiZWZvcmVMb2FkOiBDcmFmdC5taW5Bc3NldHNGb3JMZXZlbFdpdGhDaGFyYWN0ZXIobGV2ZWxDb25maWcucHV6emxlX251bWJlciksXG4gICAgYWZ0ZXJMb2FkOiBDcmFmdC5hZnRlckxvYWRBc3NldHNGb3JMZXZlbChsZXZlbENvbmZpZy5wdXp6bGVfbnVtYmVyKVxuICB9O1xuXG4gIENyYWZ0LmdhbWVDb250cm9sbGVyLmxvYWRMZXZlbCh7XG4gICAgaXNEYXl0aW1lOiBsZXZlbENvbmZpZy5pc0RheXRpbWUsXG4gICAgZ3JvdW5kUGxhbmU6IGxldmVsQ29uZmlnLmdyb3VuZFBsYW5lLFxuICAgIGdyb3VuZERlY29yYXRpb25QbGFuZTogbGV2ZWxDb25maWcuZ3JvdW5kRGVjb3JhdGlvblBsYW5lLFxuICAgIGFjdGlvblBsYW5lOiBsZXZlbENvbmZpZy5hY3Rpb25QbGFuZSxcbiAgICBmbHVmZlBsYW5lOiBmbHVmZlBsYW5lLFxuICAgIHBsYXllclN0YXJ0UG9zaXRpb246IGxldmVsQ29uZmlnLnBsYXllclN0YXJ0UG9zaXRpb24sXG4gICAgcGxheWVyU3RhcnREaXJlY3Rpb246IGxldmVsQ29uZmlnLnBsYXllclN0YXJ0RGlyZWN0aW9uLFxuICAgIHBsYXllck5hbWU6IENyYWZ0LmdldEN1cnJlbnRDaGFyYWN0ZXIoKSxcbiAgICBhc3NldFBhY2tzOiBsZXZlbEFzc2V0UGFja3MsXG4gICAgc3BlY2lhbExldmVsVHlwZTogbGV2ZWxDb25maWcuc3BlY2lhbExldmVsVHlwZSxcbiAgICBob3VzZUJvdHRvbVJpZ2h0OiBsZXZlbENvbmZpZy5ob3VzZUJvdHRvbVJpZ2h0LFxuICAgIGdyaWREaW1lbnNpb25zOiBsZXZlbENvbmZpZy5ncmlkV2lkdGggJiYgbGV2ZWxDb25maWcuZ3JpZEhlaWdodCA/XG4gICAgICAgIFtsZXZlbENvbmZpZy5ncmlkV2lkdGgsIGxldmVsQ29uZmlnLmdyaWRIZWlnaHRdIDpcbiAgICAgICAgbnVsbCxcbiAgICB2ZXJpZmljYXRpb25GdW5jdGlvbjogZXZhbCgnWycgKyBsZXZlbENvbmZpZy52ZXJpZmljYXRpb25GdW5jdGlvbiArICddJylbMF0gLy8gVE9ETyhiam9yZGFuKTogYWRkIHRvIHV0aWxzXG4gIH0pO1xufTtcblxuQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxXaXRoQ2hhcmFjdGVyID0gZnVuY3Rpb24gKGxldmVsTnVtYmVyKSB7XG4gIHJldHVybiBDcmFmdC5taW5Bc3NldHNGb3JMZXZlbE51bWJlcihsZXZlbE51bWJlcilcbiAgICAgIC5jb25jYXQoW0NyYWZ0LmNoYXJhY3RlckFzc2V0UGFja05hbWUoQ3JhZnQuZ2V0Q3VycmVudENoYXJhY3RlcigpKV0pO1xufTtcblxuQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxOdW1iZXIgPSBmdW5jdGlvbiAobGV2ZWxOdW1iZXIpIHtcbiAgc3dpdGNoIChsZXZlbE51bWJlcikge1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBbJ2xldmVsT25lQXNzZXRzJ107XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIFsnbGV2ZWxUd29Bc3NldHMnXTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gWydsZXZlbFRocmVlQXNzZXRzJ107XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbJ2FsbEFzc2V0c01pbnVzUGxheWVyJ107XG4gIH1cbn07XG5cbkNyYWZ0LmFmdGVyTG9hZEFzc2V0c0ZvckxldmVsID0gZnVuY3Rpb24gKGxldmVsTnVtYmVyKSB7XG4gIC8vIEFmdGVyIGxldmVsIGxvYWRzICYgcGxheWVyIHN0YXJ0cyBwbGF5aW5nLCBraWNrIG9mZiBmdXJ0aGVyIGFzc2V0IGRvd25sb2Fkc1xuICBzd2l0Y2ggKGxldmVsTnVtYmVyKSB7XG4gICAgY2FzZSAxOlxuICAgICAgLy8gY2FuIGRpc2FibGUgaWYgcGVyZm9ybWFuY2UgaXNzdWUgb24gZWFybHkgbGV2ZWwgMVxuICAgICAgcmV0dXJuIENyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsTnVtYmVyKDIpO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBDcmFmdC5taW5Bc3NldHNGb3JMZXZlbE51bWJlcigzKTtcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gTWF5IHdhbnQgdG8gcHVzaCB0aGlzIHRvIG9jY3VyIG9uIGxldmVsIHdpdGggdmlkZW9cbiAgICAgIHJldHVybiBbJ2FsbEFzc2V0c01pbnVzUGxheWVyJ107XG4gIH1cbn07XG5cbkNyYWZ0LmVhcmx5TG9hZEFzc2V0c0ZvckxldmVsID0gZnVuY3Rpb24gKGxldmVsTnVtYmVyKSB7XG4gIHN3aXRjaCAobGV2ZWxOdW1iZXIpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxOdW1iZXIobGV2ZWxOdW1iZXIpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxXaXRoQ2hhcmFjdGVyKGxldmVsTnVtYmVyKTtcbiAgfVxufTtcblxuQ3JhZnQubmljZVRvSGF2ZUFzc2V0c0ZvckxldmVsID0gZnVuY3Rpb24gKGxldmVsTnVtYmVyKSB7XG4gIHN3aXRjaCAobGV2ZWxOdW1iZXIpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gWydwbGF5ZXJTdGV2ZScsICdwbGF5ZXJBbGV4J107XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbJ2FsbEFzc2V0c01pbnVzUGxheWVyJ107XG4gIH1cbn07XG5cbi8qKiBGb2xkcyBhcnJheSBCIG9uIHRvcCBvZiBhcnJheSBBICovXG5DcmFmdC5mb2xkSW5BcnJheSA9IGZ1bmN0aW9uIChhcnJheUEsIGFycmF5Qikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5QS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhcnJheUJbaV0gIT09ICcnKSB7XG4gICAgICBhcnJheUFbaV0gPSBhcnJheUJbaV07XG4gICAgfVxuICB9XG59O1xuXG5DcmFmdC5mb2xkSW5DdXN0b21Ib3VzZUJsb2NrcyA9IGZ1bmN0aW9uIChob3VzZUJsb2NrTWFwLCBsZXZlbENvbmZpZykge1xuICB2YXIgcGxhbmVzVG9DdXN0b21pemUgPSBbbGV2ZWxDb25maWcuZ3JvdW5kUGxhbmUsIGxldmVsQ29uZmlnLmFjdGlvblBsYW5lXTtcbiAgcGxhbmVzVG9DdXN0b21pemUuZm9yRWFjaChmdW5jdGlvbihwbGFuZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxhbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gcGxhbmVbaV07XG4gICAgICBpZiAoaXRlbS5tYXRjaCgvaG91c2UvKSkge1xuICAgICAgICBwbGFuZVtpXSA9IChob3VzZUJsb2NrTWFwICYmIGhvdXNlQmxvY2tNYXBbaXRlbV0pID9cbiAgICAgICAgICAgIGhvdXNlQmxvY2tNYXBbaXRlbV0gOiBcInBsYW5rc0JpcmNoXCI7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIGFwcCB0byB0aGUgc3RhcnQgcG9zaXRpb24gYW5kIGtpbGwgYW55IHBlbmRpbmcgYW5pbWF0aW9uIHRhc2tzLlxuICogQHBhcmFtIHtib29sZWFufSBmaXJzdCB0cnVlIGlmIGZpcnN0IHJlc2V0XG4gKi9cbkNyYWZ0LnJlc2V0ID0gZnVuY3Rpb24gKGZpcnN0KSB7XG4gIGlmIChmaXJzdCkge1xuICAgIHJldHVybjtcbiAgfVxuICBDcmFmdC5nYW1lQ29udHJvbGxlci5jb2RlT3JnQVBJLnJlc2V0QXR0ZW1wdCgpO1xufTtcblxuQ3JhZnQucGhhc2VyTG9hZGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gQ3JhZnQuZ2FtZUNvbnRyb2xsZXIgJiZcbiAgICAgIENyYWZ0LmdhbWVDb250cm9sbGVyLmdhbWUgJiZcbiAgICAgICFDcmFmdC5nYW1lQ29udHJvbGxlci5nYW1lLmxvYWQuaXNMb2FkaW5nO1xufTtcblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG5DcmFmdC5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFDcmFmdC5waGFzZXJMb2FkZWQoKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuXG4gIC8vIEVuc3VyZSB0aGF0IFJlc2V0IGJ1dHRvbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIFJ1biBidXR0b24uXG4gIGlmICghcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGgpIHtcbiAgICByZXNldEJ1dHRvbi5zdHlsZS5taW5XaWR0aCA9IHJ1bkJ1dHRvbi5vZmZzZXRXaWR0aCArICdweCc7XG4gIH1cblxuICBzdHVkaW9BcHAudG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgc3R1ZGlvQXBwLmF0dGVtcHRzKys7XG5cbiAgQ3JhZnQuZXhlY3V0ZVVzZXJDb2RlKCk7XG5cbiAgaWYgKENyYWZ0LmxldmVsLmZyZWVQbGF5ICYmICFzdHVkaW9BcHAuaGlkZVNvdXJjZSkge1xuICAgIHZhciBmaW5pc2hCdG5Db250YWluZXIgPSAkKCcjcmlnaHQtYnV0dG9uLWNlbGwnKTtcblxuICAgIGlmIChmaW5pc2hCdG5Db250YWluZXIubGVuZ3RoICYmXG4gICAgICAgICFmaW5pc2hCdG5Db250YWluZXIuaGFzQ2xhc3MoJ3JpZ2h0LWJ1dHRvbi1jZWxsLWVuYWJsZWQnKSkge1xuICAgICAgZmluaXNoQnRuQ29udGFpbmVyLmFkZENsYXNzKCdyaWdodC1idXR0b24tY2VsbC1lbmFibGVkJyk7XG4gICAgICBzdHVkaW9BcHAub25SZXNpemUoKTtcblxuICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICBldmVudC5pbml0RXZlbnQoJ2ZpbmlzaEJ1dHRvblNob3duJywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICB9XG4gIH1cbn07XG5cbkNyYWZ0LmV4ZWN1dGVVc2VyQ29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuZWRpdF9ibG9ja3MpIHtcbiAgICB0aGlzLnJlcG9ydFJlc3VsdCh0cnVlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc3R1ZGlvQXBwLmhhc0V4dHJhVG9wQmxvY2tzKCkpIHtcbiAgICAvLyBpbW1lZGlhdGVseSBjaGVjayBhbnN3ZXIgaW5zdGVhZCBvZiBleGVjdXRpbmcsIHdoaWNoIHdpbGwgZmFpbCBhbmRcbiAgICAvLyByZXBvcnQgdG9wIGxldmVsIGJsb2NrcyAocmF0aGVyIHRoYW4gZXhlY3V0aW5nIHRoZW0pXG4gICAgdGhpcy5yZXBvcnRSZXN1bHQoZmFsc2UpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgLy8gU3RhcnQgdHJhY2luZyBjYWxscy5cbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuXG4gIHZhciBhcHBDb2RlT3JnQVBJID0gQ3JhZnQuZ2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSTtcbiAgYXBwQ29kZU9yZ0FQSS5zdGFydENvbW1hbmRDb2xsZWN0aW9uKCk7XG4gIC8vIFJ1biB1c2VyIGdlbmVyYXRlZCBjb2RlLCBjYWxsaW5nIGFwcENvZGVPcmdBUElcbiAgdmFyIGNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgIG1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5tb3ZlRm9yd2FyZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSk7XG4gICAgfSxcbiAgICB0dXJuTGVmdDogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkudHVybihzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSwgXCJsZWZ0XCIpO1xuICAgIH0sXG4gICAgdHVyblJpZ2h0OiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS50dXJuKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLCBcInJpZ2h0XCIpO1xuICAgIH0sXG4gICAgZGVzdHJveUJsb2NrOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5kZXN0cm95QmxvY2soc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCkpO1xuICAgIH0sXG4gICAgc2hlYXI6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLmRlc3Ryb3lCbG9jayhzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSk7XG4gICAgfSxcbiAgICB0aWxsU29pbDogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkudGlsbFNvaWwoc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCkpO1xuICAgIH0sXG4gICAgd2hpbGVQYXRoQWhlYWQ6IGZ1bmN0aW9uIChibG9ja0lELCBjYWxsYmFjaykge1xuICAgICAgLy8gaWYgcmVzdXJyZWN0ZWQsIG1vdmUgYmxvY2tJRCBiZSBsYXN0IHBhcmFtZXRlciB0byBmaXggXCJTaG93IENvZGVcIlxuICAgICAgYXBwQ29kZU9yZ0FQSS53aGlsZVBhdGhBaGVhZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgICAnJyxcbiAgICAgICAgICBjYWxsYmFjayk7XG4gICAgfSxcbiAgICB3aGlsZUJsb2NrQWhlYWQ6IGZ1bmN0aW9uIChibG9ja0lELCBibG9ja1R5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAvLyBpZiByZXN1cnJlY3RlZCwgbW92ZSBibG9ja0lEIGJlIGxhc3QgcGFyYW1ldGVyIHRvIGZpeCBcIlNob3cgQ29kZVwiXG4gICAgICBhcHBDb2RlT3JnQVBJLndoaWxlUGF0aEFoZWFkKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICAgIGJsb2NrVHlwZSxcbiAgICAgICAgICBjYWxsYmFjayk7XG4gICAgfSxcbiAgICBpZkxhdmFBaGVhZDogZnVuY3Rpb24gKGNhbGxiYWNrLCBibG9ja0lEKSB7XG4gICAgICAvLyBpZiByZXN1cnJlY3RlZCwgbW92ZSBibG9ja0lEIGJlIGxhc3QgcGFyYW1ldGVyIHRvIGZpeCBcIlNob3cgQ29kZVwiXG4gICAgICBhcHBDb2RlT3JnQVBJLmlmQmxvY2tBaGVhZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgICBcImxhdmFcIixcbiAgICAgICAgICBjYWxsYmFjayk7XG4gICAgfSxcbiAgICBpZkJsb2NrQWhlYWQ6IGZ1bmN0aW9uIChibG9ja1R5cGUsIGNhbGxiYWNrLCBibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLmlmQmxvY2tBaGVhZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgICBibG9ja1R5cGUsXG4gICAgICAgICAgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgcGxhY2VCbG9jazogZnVuY3Rpb24gKGJsb2NrVHlwZSwgYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5wbGFjZUJsb2NrKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICBibG9ja1R5cGUpO1xuICAgIH0sXG4gICAgcGxhbnRDcm9wOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5wbGFjZUJsb2NrKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICBcImNyb3BXaGVhdFwiKTtcbiAgICB9LFxuICAgIHBsYWNlVG9yY2g6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLnBsYWNlQmxvY2soc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgIFwidG9yY2hcIik7XG4gICAgfSxcbiAgICBwbGFjZUJsb2NrQWhlYWQ6IGZ1bmN0aW9uIChibG9ja1R5cGUsIGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkucGxhY2VJbkZyb250KHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICBibG9ja1R5cGUpO1xuICAgIH1cbiAgfSk7XG4gIGFwcENvZGVPcmdBUEkuc3RhcnRBdHRlbXB0KGZ1bmN0aW9uIChzdWNjZXNzLCBsZXZlbE1vZGVsKSB7XG4gICAgaWYgKENyYWZ0LmxldmVsLmZyZWVQbGF5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmVwb3J0UmVzdWx0KHN1Y2Nlc3MpO1xuXG4gICAgdmFyIHRpbGVJRHNUb1N0b3JlID0gQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5ibG9ja3NUb1N0b3JlO1xuICAgIGlmIChzdWNjZXNzICYmIHRpbGVJRHNUb1N0b3JlKSB7XG4gICAgICB2YXIgbmV3SG91c2VCbG9ja3MgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3JhZnRIb3VzZUJsb2NrcycpKSB8fCB7fTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWxNb2RlbC5hY3Rpb25QbGFuZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodGlsZUlEc1RvU3RvcmVbaV0gIT09ICcnKSB7XG4gICAgICAgICAgbmV3SG91c2VCbG9ja3NbdGlsZUlEc1RvU3RvcmVbaV1dID0gbGV2ZWxNb2RlbC5hY3Rpb25QbGFuZVtpXS5ibG9ja1R5cGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRyeVNldExvY2FsU3RvcmFnZUl0ZW0oJ2NyYWZ0SG91c2VCbG9ja3MnLCBKU09OLnN0cmluZ2lmeShuZXdIb3VzZUJsb2NrcykpO1xuICAgIH1cblxuICAgIHZhciBhdHRlbXB0SW52ZW50b3J5VHlwZXMgPSBsZXZlbE1vZGVsLmdldEludmVudG9yeVR5cGVzKCk7XG4gICAgdmFyIHBsYXllckludmVudG9yeVR5cGVzID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWZ0UGxheWVySW52ZW50b3J5JykpIHx8IFtdO1xuXG4gICAgdmFyIG5ld0ludmVudG9yeVNldCA9IHt9O1xuICAgIGF0dGVtcHRJbnZlbnRvcnlUeXBlcy5jb25jYXQocGxheWVySW52ZW50b3J5VHlwZXMpLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgICAgbmV3SW52ZW50b3J5U2V0W3R5cGVdID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRyeVNldExvY2FsU3RvcmFnZUl0ZW0oJ2NyYWZ0UGxheWVySW52ZW50b3J5JywgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmtleXMobmV3SW52ZW50b3J5U2V0KSkpO1xuICB9LmJpbmQodGhpcykpO1xufTtcblxuQ3JhZnQuZ2V0VGVzdFJlc3VsdEZyb20gPSBmdW5jdGlvbiAoc3VjY2Vzcywgc3R1ZGlvVGVzdFJlc3VsdHMpIHtcbiAgaWYgKHN0dWRpb1Rlc3RSZXN1bHRzID09PSBUZXN0UmVzdWx0cy5MRVZFTF9JTkNPTVBMRVRFX0ZBSUwpIHtcbiAgICByZXR1cm4gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gIH1cblxuICBpZiAoQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5mcmVlUGxheSkge1xuICAgIHJldHVybiBUZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH1cblxuICByZXR1cm4gc3R1ZGlvVGVzdFJlc3VsdHM7XG59O1xuXG5DcmFmdC5yZXBvcnRSZXN1bHQgPSBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICB2YXIgc3R1ZGlvVGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuZ2V0VGVzdFJlc3VsdHMoc3VjY2Vzcyk7XG4gIHZhciB0ZXN0UmVzdWx0VHlwZSA9IENyYWZ0LmdldFRlc3RSZXN1bHRGcm9tKHN1Y2Nlc3MsIHN0dWRpb1Rlc3RSZXN1bHRzKTtcblxuICB2YXIga2VlcFBsYXlpbmdUZXh0ID0gQ3JhZnQucmVwbGF5VGV4dEZvclJlc3VsdCh0ZXN0UmVzdWx0VHlwZSk7XG5cbiAgc3R1ZGlvQXBwLnJlcG9ydCh7XG4gICAgYXBwOiAnY3JhZnQnLFxuICAgIGxldmVsOiBDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLmlkLFxuICAgIHJlc3VsdDogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5mcmVlUGxheSA/IHRydWUgOiBzdWNjZXNzLFxuICAgIHRlc3RSZXN1bHQ6IHRlc3RSZXN1bHRUeXBlLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgQmxvY2tseS5YbWwuZG9tVG9UZXh0KFxuICAgICAgICAgICAgQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKFxuICAgICAgICAgICAgICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpKSksXG4gICAgLy8gdHlwaWNhbGx5IGRlbGF5IGZlZWRiYWNrIHVudGlsIHJlc3BvbnNlIGJhY2tcbiAgICAvLyBmb3IgdGhpbmdzIGxpa2UgZS5nLiBjcm93ZHNvdXJjZWQgaGludHMgJiBoaW50IGJsb2Nrc1xuICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgICAgIGtlZXBQbGF5aW5nVGV4dDoga2VlcFBsYXlpbmdUZXh0LFxuICAgICAgICBhcHA6ICdjcmFmdCcsXG4gICAgICAgIHNraW46IENyYWZ0LmluaXRpYWxDb25maWcuc2tpbi5pZCxcbiAgICAgICAgZmVlZGJhY2tUeXBlOiB0ZXN0UmVzdWx0VHlwZSxcbiAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxuICAgICAgICBsZXZlbDogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbCxcbiAgICAgICAgYXBwU3RyaW5nczoge1xuICAgICAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IGNyYWZ0TXNnLnJlaW5mRmVlZGJhY2tNc2coKSxcbiAgICAgICAgICBuZXh0TGV2ZWxNc2c6IGNyYWZ0TXNnLm5leHRMZXZlbE1zZyh7XG4gICAgICAgICAgICBwdXp6bGVOdW1iZXI6IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwucHV6emxlX251bWJlclxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHRvb01hbnlCbG9ja3NGYWlsTXNnRnVuY3Rpb246IGNyYWZ0TXNnLnRvb01hbnlCbG9ja3NGYWlsLFxuICAgICAgICAgIGdlbmVyYXRlZENvZGVEZXNjcmlwdGlvbjogY3JhZnRNc2cuZ2VuZXJhdGVkQ29kZURlc2NyaXB0aW9uKClcbiAgICAgICAgfSxcbiAgICAgICAgZmVlZGJhY2tJbWFnZTogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5mcmVlUGxheSA/IENyYWZ0LmdhbWVDb250cm9sbGVyLmdldFNjcmVlbnNob3QoKSA6IG51bGwsXG4gICAgICAgIHNob3dpbmdTaGFyaW5nOiBDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLmZyZWVQbGF5XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcblxuQ3JhZnQucmVwbGF5VGV4dEZvclJlc3VsdCA9IGZ1bmN0aW9uICh0ZXN0UmVzdWx0VHlwZSkge1xuICBpZiAodGVzdFJlc3VsdFR5cGUgPT09IFRlc3RSZXN1bHRzLkZSRUVfUExBWSkge1xuICAgIHJldHVybiBjcmFmdE1zZy5rZWVwUGxheWluZ0J1dHRvbigpO1xuICB9IGVsc2UgaWYgKHRlc3RSZXN1bHRUeXBlIDw9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19BQ0NFUFRBQkxFX0ZBSUwpIHtcbiAgICByZXR1cm4gY29tbW9uTXNnLnRyeUFnYWluKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNyYWZ0TXNnLnJlcGxheUJ1dHRvbigpO1xuICB9XG59O1xuXG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxkaXYgaWQ9XCJtaW5lY3JhZnQtZnJhbWVcIj5cXG4gIDxkaXYgaWQ9XCJwaGFzZXItZ2FtZVwiPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cbi8qIGdsb2JhbCAkICovXG5cbi8qKlxuICogQGZpbGUgTWFwcGluZyB0byBpbmplY3QgbW9yZSBwcm9wZXJ0aWVzIGludG8gbGV2ZWxidWlsZGVyIGxldmVscy5cbiAqIEtleWVkIGJ5IFwicHV6emxlX251bWJlclwiLCB3aGljaCBpcyB0aGUgb3JkZXIgb2YgYSBnaXZlbiBsZXZlbCBpbiBpdHMgc2NyaXB0LlxuICovXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgaTE4biA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAxOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWwxRmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWwxVG9vRmV3QmxvY2tzTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbJ3ZpZ25ldHRlNC1pbnRybyddLFxuICB9LFxuICAyOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWwyRmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWwyVG9vRmV3QmxvY2tzTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbJ3ZpZ25ldHRlNS1zaG9ydHBpYW5vJ10sXG4gIH0sXG4gIDM6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDNGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogaTE4bi5sZXZlbDNUb29GZXdCbG9ja3NNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlNS1zaG9ydHBpYW5vJyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nXG4gICAgXSxcbiAgfSxcbiAgNDoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBpMThuLmxldmVsNEZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsNEZhaWx1cmVNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU1LXNob3J0cGlhbm8nLFxuICAgICAgJ3ZpZ25ldHRlNC1pbnRybydcbiAgICBdLFxuICAgIHNvbmdEZWxheTogNDAwMCxcbiAgfSxcbiAgNToge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBpMThuLmxldmVsNUZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsNUZhaWx1cmVNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTctZnVua3ktY2hpcnBzLXNob3J0JyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlNC1pbnRybycsXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICBdLFxuICB9LFxuICA2OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWw2RmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWw2RmFpbHVyZU1lc3NhZ2UoKSxcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgXSxcbiAgICBzb25nRGVsYXk6IDQwMDAsXG4gIH0sXG4gIDc6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDdGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogaTE4bi5sZXZlbDdGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTctZnVua3ktY2hpcnBzLXNob3J0JyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICBdLFxuICB9LFxuICA4OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWw4RmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWw4RmFpbHVyZU1lc3NhZ2UoKSxcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlNS1zaG9ydHBpYW5vJyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgIF0sXG4gIH0sXG4gIDk6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDlGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogaTE4bi5sZXZlbDlGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICAgICd2aWduZXR0ZTUtc2hvcnRwaWFubycsXG4gICAgICAndmlnbmV0dGU3LWZ1bmt5LWNoaXJwcy1zaG9ydCcsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgXSxcblxuICB9LFxuICAxMDoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBpMThuLmxldmVsMTBGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogIGkxOG4ubGV2ZWwxMEZhaWx1cmVNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgICAndmlnbmV0dGU1LXNob3J0cGlhbm8nLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU3LWZ1bmt5LWNoaXJwcy1zaG9ydCcsXG4gICAgXSxcbiAgfSxcbiAgMTE6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDExRmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWwxMUZhaWx1cmVNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTctZnVua3ktY2hpcnBzLXNob3J0JyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgXSxcbiAgfSxcbiAgMTI6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDEyRmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWwxMkZhaWx1cmVNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTUtc2hvcnRwaWFubycsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgXSxcbiAgfSxcbiAgMTM6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDEzRmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWwxM0ZhaWx1cmVNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTEnLFxuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgIF0sXG4gIH0sXG4gIDE0OiB7XG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTgtZnJlZS1wbGF5JyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTEnLFxuICAgIF0sXG4gIH0sXG59O1xuIiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cbi8qIGdsb2JhbCAkICovXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBob3VzZUE6IHtcbiAgICBncm91bmRQbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCJdLFxuICAgIHZlcmlmaWNhdGlvbkZ1bmN0aW9uOiAoZnVuY3Rpb24gKHZlcmlmaWNhdGlvbkFQSSkge1xuICAgICAgcmV0dXJuIHZlcmlmaWNhdGlvbkFQSS5zb2x1dGlvbk1hcE1hdGNoZXNSZXN1bHRNYXAoW1xuICAgICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnYW55JywgJ2FueScsICdhbnknLCAnYW55JywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJ2FueScsICcnLCAnJywgJ2FueScsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICdhbnknLCAnJywgJycsICdhbnknLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnYW55JywgJ2FueScsICdhbnknLCAnYW55JywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJ10pO1xuICAgIH0pLnRvU3RyaW5nKCksXG4gICAgYmxvY2tzVG9TdG9yZTogW1xuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJ2hvdXNlUmlnaHRDJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICdob3VzZVJpZ2h0QicsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VMZWZ0QScsICcnLCAnJywgJ2hvdXNlUmlnaHRBJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUJvdHRvbUEnLCAnaG91c2VCb3R0b21CJywgJ2hvdXNlQm90dG9tQycsICdob3VzZUJvdHRvbUQnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnXSxcblxuICAgIGhvdXNlQm90dG9tUmlnaHQ6IFs1LCA1XSxcbiAgfSxcbiAgaG91c2VDOiB7XG4gICAgXCJncm91bmRQbGFuZVwiOiBbXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiXSxcbiAgICBcImdyb3VuZERlY29yYXRpb25QbGFuZVwiOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sXG4gICAgXCJhY3Rpb25QbGFuZVwiOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJob3VzZUJvdHRvbUFcIiwgXCJob3VzZUJvdHRvbUJcIiwgXCJob3VzZUJvdHRvbUNcIiwgXCJob3VzZUJvdHRvbURcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sXG4gICAgXCJ2ZXJpZmljYXRpb25GdW5jdGlvblwiOiBcImZ1bmN0aW9uICh2ZXJpZmljYXRpb25BUEkpIHtcXHJcXG4gICAgICByZXR1cm4gdmVyaWZpY2F0aW9uQVBJLnNvbHV0aW9uTWFwTWF0Y2hlc1Jlc3VsdE1hcChcXHJcXG4gICAgICAgICAgICBbXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIlxcclxcbiAgICAgICAgICAgIF0pO1xcclxcbn1cIixcbiAgICBcInN0YXJ0QmxvY2tzXCI6IFwiPHhtbD48YmxvY2sgdHlwZT1cXFwid2hlbl9ydW5cXFwiIGRlbGV0YWJsZT1cXFwiZmFsc2VcXFwiIG1vdmFibGU9XFxcImZhbHNlXFxcIj48bmV4dD48YmxvY2sgdHlwZT1cXFwiY29udHJvbHNfcmVwZWF0X2Ryb3Bkb3duXFxcIj48dGl0bGUgbmFtZT1cXFwiVElNRVNcXFwiIGNvbmZpZz1cXFwiMi0xMFxcXCI+MjwvdGl0bGU+PHN0YXRlbWVudCBuYW1lPVxcXCJET1xcXCI+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X21vdmVGb3J3YXJkXFxcIj48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfcGxhY2VCbG9ja1xcXCI+PHRpdGxlIG5hbWU9XFxcIlRZUEVcXFwiPnBsYW5rc0JpcmNoPC90aXRsZT48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwvc3RhdGVtZW50PjxuZXh0PjxibG9jayB0eXBlPVxcXCJjcmFmdF90dXJuXFxcIj48dGl0bGUgbmFtZT1cXFwiRElSXFxcIj5sZWZ0PC90aXRsZT48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfbW92ZUZvcndhcmRcXFwiPjxuZXh0PjxibG9jayB0eXBlPVxcXCJjcmFmdF9wbGFjZUJsb2NrXFxcIj48dGl0bGUgbmFtZT1cXFwiVFlQRVxcXCI+cGxhbmtzQmlyY2g8L3RpdGxlPjxuZXh0PjxibG9jayB0eXBlPVxcXCJjcmFmdF90dXJuXFxcIj48dGl0bGUgbmFtZT1cXFwiRElSXFxcIj5yaWdodDwvdGl0bGU+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L3htbD5cIixcblxuICAgIGJsb2Nrc1RvU3RvcmU6IFtcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICdob3VzZVJpZ2h0QycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnaG91c2VSaWdodEInLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlTGVmdEEnLCAnJywgJycsICdob3VzZVJpZ2h0QScsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VCb3R0b21BJywgJ2hvdXNlQm90dG9tQicsICdob3VzZUJvdHRvbUMnLCAnaG91c2VCb3R0b21EJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJ10sXG5cbiAgICBob3VzZUJvdHRvbVJpZ2h0OiBbNSwgNV0sXG4gIH0sXG4gIGhvdXNlQjoge1xuICAgIGdyb3VuZFBsYW5lOiBbXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiXSxcbiAgICB2ZXJpZmljYXRpb25GdW5jdGlvbjogXCJmdW5jdGlvbiAodmVyaWZpY2F0aW9uQVBJKSB7XFxyXFxuICAgICAgcmV0dXJuIHZlcmlmaWNhdGlvbkFQSS5zb2x1dGlvbk1hcE1hdGNoZXNSZXN1bHRNYXAoXFxyXFxuICAgICAgICAgICAgW1xcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCJcXHJcXG4gICAgICAgICAgICBdKTtcXHJcXG59XCIsXG4gICAgc3RhcnRCbG9ja3M6IFwiPHhtbD48YmxvY2sgdHlwZT1cXFwid2hlbl9ydW5cXFwiIGRlbGV0YWJsZT1cXFwiZmFsc2VcXFwiIG1vdmFibGU9XFxcImZhbHNlXFxcIj48bmV4dD48YmxvY2sgdHlwZT1cXFwiY29udHJvbHNfcmVwZWF0X2Ryb3Bkb3duXFxcIj48dGl0bGUgbmFtZT1cXFwiVElNRVNcXFwiIGNvbmZpZz1cXFwiMi0xMFxcXCI+NjwvdGl0bGU+PHN0YXRlbWVudCBuYW1lPVxcXCJET1xcXCI+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X21vdmVGb3J3YXJkXFxcIj48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfcGxhY2VCbG9ja1xcXCI+PHRpdGxlIG5hbWU9XFxcIlRZUEVcXFwiPnBsYW5rc0JpcmNoPC90aXRsZT48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwvc3RhdGVtZW50PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC94bWw+XCIsXG4gICAgYmxvY2tzVG9TdG9yZTogW1xuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnaG91c2VSaWdodEMnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJ2hvdXNlUmlnaHRCJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUxlZnRBJywgJycsICcnLCAnaG91c2VSaWdodEEnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlQm90dG9tQScsICdob3VzZUJvdHRvbUInLCAnaG91c2VCb3R0b21DJywgJ2hvdXNlQm90dG9tRCcsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnXSxcbiAgICBhY3Rpb25QbGFuZTogW1xuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VCb3R0b21BJywgJ2hvdXNlQm90dG9tQicsICdob3VzZUJvdHRvbUMnLCAnaG91c2VCb3R0b21EJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJyddLFxuICAgIHBsYXllclN0YXJ0UG9zaXRpb246IFszLCA3XSxcblxuICAgIGhvdXNlQm90dG9tUmlnaHQ6IFs1LCA2XSxcbiAgfVxufTtcbiIsImltcG9ydCBDb21tYW5kUXVldWUgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL0NvbW1hbmRRdWV1ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9CYXNlQ29tbWFuZC5qc1wiO1xuaW1wb3J0IERlc3Ryb3lCbG9ja0NvbW1hbmQgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL0Rlc3Ryb3lCbG9ja0NvbW1hbmQuanNcIjtcbmltcG9ydCBNb3ZlRm9yd2FyZENvbW1hbmQgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL01vdmVGb3J3YXJkQ29tbWFuZC5qc1wiO1xuaW1wb3J0IFR1cm5Db21tYW5kIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9UdXJuQ29tbWFuZC5qc1wiO1xuaW1wb3J0IFdoaWxlQ29tbWFuZCBmcm9tIFwiLi9Db21tYW5kUXVldWUvV2hpbGVDb21tYW5kLmpzXCI7XG5pbXBvcnQgSWZCbG9ja0FoZWFkQ29tbWFuZCBmcm9tIFwiLi9Db21tYW5kUXVldWUvSWZCbG9ja0FoZWFkQ29tbWFuZC5qc1wiO1xuXG5pbXBvcnQgTGV2ZWxNb2RlbCBmcm9tIFwiLi9MZXZlbE1WQy9MZXZlbE1vZGVsLmpzXCI7XG5pbXBvcnQgTGV2ZWxWaWV3IGZyb20gXCIuL0xldmVsTVZDL0xldmVsVmlldy5qc1wiO1xuaW1wb3J0IEFzc2V0TG9hZGVyIGZyb20gXCIuL0xldmVsTVZDL0Fzc2V0TG9hZGVyLmpzXCI7XG5cbmltcG9ydCAqIGFzIENvZGVPcmdBUEkgZnJvbSBcIi4vQVBJL0NvZGVPcmdBUEkuanNcIjtcblxudmFyIEdBTUVfV0lEVEggPSA0MDA7XG52YXIgR0FNRV9IRUlHSFQgPSA0MDA7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSBtaW5pLWdhbWUgdmlzdWFsaXphdGlvblxuICovXG5jbGFzcyBHYW1lQ29udHJvbGxlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZ2FtZUNvbnRyb2xsZXJDb25maWdcbiAgICogQHBhcmFtIHtTdHJpbmd9IGdhbWVDb250cm9sbGVyQ29uZmlnLmNvbnRhaW5lcklkIERPTSBJRCB0byBtb3VudCB0aGlzIGFwcFxuICAgKiBAcGFyYW0ge1BoYXNlcn0gZ2FtZUNvbnRyb2xsZXJDb25maWcuUGhhc2VyIFBoYXNlciBwYWNrYWdlXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXJDb25maWcpIHtcbiAgICB0aGlzLkRFQlVHID0gZ2FtZUNvbnRyb2xsZXJDb25maWcuZGVidWc7XG5cbiAgICAvLyBQaGFzZXIgcHJlLWluaXRpYWxpemF0aW9uIGNvbmZpZ1xuICAgIHdpbmRvdy5QaGFzZXJHbG9iYWwgPSB7XG4gICAgICBkaXNhYmxlQXVkaW86IHRydWUsXG4gICAgICBkaXNhYmxlV2ViQXVkaW86IHRydWUsXG4gICAgICBoaWRlQmFubmVyOiAhdGhpcy5ERUJVR1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljIHtPYmplY3R9IGNvZGVPcmdBUEkgLSBBUEkgd2l0aCBleHRlcm5hbGx5LWNhbGxhYmxlIG1ldGhvZHMgZm9yXG4gICAgICogc3RhcnRpbmcgYW4gYXR0ZW1wdCwgaXNzdWluZyBjb21tYW5kcywgZXRjLlxuICAgICAqL1xuICAgIHRoaXMuY29kZU9yZ0FQSSA9IENvZGVPcmdBUEkuZ2V0KHRoaXMpO1xuXG4gICAgdmFyIFBoYXNlciA9IGdhbWVDb250cm9sbGVyQ29uZmlnLlBoYXNlcjtcblxuICAgIC8qKlxuICAgICAqIE1haW4gUGhhc2VyIGdhbWUgaW5zdGFuY2UuXG4gICAgICogQHByb3BlcnR5IHtQaGFzZXIuR2FtZX1cbiAgICAgKi9cbiAgICB0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoe1xuICAgICAgd2lkdGg6IEdBTUVfV0lEVEgsXG4gICAgICBoZWlnaHQ6IEdBTUVfSEVJR0hULFxuICAgICAgcmVuZGVyZXI6IFBoYXNlci5DQU5WQVMsXG4gICAgICBwYXJlbnQ6IGdhbWVDb250cm9sbGVyQ29uZmlnLmNvbnRhaW5lcklkLFxuICAgICAgc3RhdGU6ICdlYXJseUxvYWQnLFxuICAgICAgLy8gVE9ETyhiam9yZGFuKTogcmVtb3ZlIG5vdyB0aGF0IHVzaW5nIGNhbnZhcz9cbiAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZSAvLyBlbmFibGVzIHNhdmluZyAucG5nIHNjcmVlbmdyYWJzXG4gICAgfSk7XG5cbiAgICB0aGlzLnNwZWNpYWxMZXZlbFR5cGUgPSBudWxsO1xuICAgIHRoaXMucXVldWUgPSBuZXcgQ29tbWFuZFF1ZXVlKHRoaXMpO1xuICAgIHRoaXMuT25Db21wbGV0ZUNhbGxiYWNrID0gbnVsbDtcblxuICAgIHRoaXMuYXNzZXRSb290ID0gZ2FtZUNvbnRyb2xsZXJDb25maWcuYXNzZXRSb290O1xuXG4gICAgdGhpcy5hdWRpb1BsYXllciA9IGdhbWVDb250cm9sbGVyQ29uZmlnLmF1ZGlvUGxheWVyO1xuICAgIHRoaXMuYWZ0ZXJBc3NldHNMb2FkZWQgPSBnYW1lQ29udHJvbGxlckNvbmZpZy5hZnRlckFzc2V0c0xvYWRlZDtcbiAgICB0aGlzLmFzc2V0TG9hZGVyID0gbmV3IEFzc2V0TG9hZGVyKHRoaXMpO1xuICAgIHRoaXMuZWFybHlMb2FkQXNzZXRQYWNrcyA9XG4gICAgICAgIGdhbWVDb250cm9sbGVyQ29uZmlnLmVhcmx5TG9hZEFzc2V0UGFja3MgfHwgW107XG4gICAgdGhpcy5lYXJseUxvYWROaWNlVG9IYXZlQXNzZXRQYWNrcyA9XG4gICAgICAgIGdhbWVDb250cm9sbGVyQ29uZmlnLmVhcmx5TG9hZE5pY2VUb0hhdmVBc3NldFBhY2tzIHx8IFtdO1xuXG4gICAgdGhpcy5yZXNldHRhYmxlVGltZXJzID0gW107XG5cbiAgICAvLyBQaGFzZXIgXCJzbG93IG1vdGlvblwiIG1vZGlmaWVyIHdlIG9yaWdpbmFsbHkgdHVuZWQgYW5pbWF0aW9ucyB1c2luZ1xuICAgIHRoaXMuYXNzdW1lZFNsb3dNb3Rpb24gPSAxLjU7XG4gICAgdGhpcy5pbml0aWFsU2xvd01vdGlvbiA9IGdhbWVDb250cm9sbGVyQ29uZmlnLmN1c3RvbVNsb3dNb3Rpb24gfHwgdGhpcy5hc3N1bWVkU2xvd01vdGlvbjtcblxuICAgIHRoaXMucGxheWVyRGVsYXlGYWN0b3IgPSAxLjA7XG5cbiAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKCdlYXJseUxvYWQnLCB7XG4gICAgICBwcmVsb2FkOiAoKSA9PiB7XG4gICAgICAgIC8vIGRvbid0IGxldCBzdGF0ZSBjaGFuZ2Ugc3RvbXAgZXNzZW50aWFsIGFzc2V0IGRvd25sb2FkcyBpbiBwcm9ncmVzc1xuICAgICAgICB0aGlzLmdhbWUubG9hZC5yZXNldExvY2tlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuYXNzZXRMb2FkZXIubG9hZFBhY2tzKHRoaXMuZWFybHlMb2FkQXNzZXRQYWNrcyk7XG4gICAgICB9LFxuICAgICAgY3JlYXRlOiAoKSA9PiB7XG4gICAgICAgIC8vIG9wdGlvbmFsbHkgbG9hZCBzb21lIG1vcmUgYXNzZXRzIGlmIHdlIGNvbXBsZXRlIGVhcmx5IGxvYWQgYmVmb3JlIGxldmVsIGxvYWRcbiAgICAgICAgdGhpcy5hc3NldExvYWRlci5sb2FkUGFja3ModGhpcy5lYXJseUxvYWROaWNlVG9IYXZlQXNzZXRQYWNrcyk7XG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKCdsZXZlbFJ1bm5lcicsIHtcbiAgICAgIHByZWxvYWQ6IHRoaXMucHJlbG9hZC5iaW5kKHRoaXMpLFxuICAgICAgY3JlYXRlOiB0aGlzLmNyZWF0ZS5iaW5kKHRoaXMpLFxuICAgICAgdXBkYXRlOiB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLFxuICAgICAgcmVuZGVyOiB0aGlzLnJlbmRlci5iaW5kKHRoaXMpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGxldmVsQ29uZmlnXG4gICAqL1xuICBsb2FkTGV2ZWwobGV2ZWxDb25maWcpIHtcbiAgICB0aGlzLmxldmVsRGF0YSA9IE9iamVjdC5mcmVlemUobGV2ZWxDb25maWcpO1xuXG4gICAgdGhpcy5sZXZlbE1vZGVsID0gbmV3IExldmVsTW9kZWwodGhpcy5sZXZlbERhdGEpO1xuICAgIHRoaXMubGV2ZWxWaWV3ID0gbmV3IExldmVsVmlldyh0aGlzKTtcbiAgICB0aGlzLnNwZWNpYWxMZXZlbFR5cGUgPSBsZXZlbENvbmZpZy5zcGVjaWFsTGV2ZWxUeXBlO1xuXG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsZXZlbFJ1bm5lcicpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5sZXZlbE1vZGVsLnJlc2V0KCk7XG4gICAgdGhpcy5sZXZlbFZpZXcucmVzZXQodGhpcy5sZXZlbE1vZGVsKTtcbiAgICB0aGlzLnJlc2V0dGFibGVUaW1lcnMuZm9yRWFjaCgodGltZXIpID0+IHtcbiAgICAgIHRpbWVyLnN0b3AodHJ1ZSk7XG4gICAgfSk7XG4gICAgdGhpcy5yZXNldHRhYmxlVGltZXJzLmxlbmd0aCA9IDA7XG4gIH1cblxuICBwcmVsb2FkKCkge1xuICAgIHRoaXMuZ2FtZS5sb2FkLnJlc2V0TG9ja2VkID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRoaXMuREVCVUc7XG4gICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcbiAgICB0aGlzLmFzc2V0TG9hZGVyLmxvYWRQYWNrcyh0aGlzLmxldmVsRGF0YS5hc3NldFBhY2tzLmJlZm9yZUxvYWQpO1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHRoaXMubGV2ZWxWaWV3LmNyZWF0ZSh0aGlzLmxldmVsTW9kZWwpO1xuICAgIHRoaXMuZ2FtZS50aW1lLnNsb3dNb3Rpb24gPSB0aGlzLmluaXRpYWxTbG93TW90aW9uO1xuICAgIHRoaXMuYWRkQ2hlYXRLZXlzKCk7XG4gICAgdGhpcy5hc3NldExvYWRlci5sb2FkUGFja3ModGhpcy5sZXZlbERhdGEuYXNzZXRQYWNrcy5hZnRlckxvYWQpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLm9uTG9hZENvbXBsZXRlLmFkZE9uY2UoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYWZ0ZXJBc3NldHNMb2FkZWQpIHtcbiAgICAgICAgdGhpcy5hZnRlckFzc2V0c0xvYWRlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuZ2FtZS5sb2FkLnN0YXJ0KCk7XG4gIH1cblxuICBmb2xsb3dpbmdQbGF5ZXIoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5sZXZlbERhdGEuZ3JpZERpbWVuc2lvbnM7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgICB0aGlzLnF1ZXVlLnRpY2soKTtcbiAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZSgpO1xuXG4gICAgICBpZiAodGhpcy5xdWV1ZS5pc0ZpbmlzaGVkKCkpIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUVuZFN0YXRlKCk7XG4gICAgICB9XG4gIH1cblxuICBhZGRDaGVhdEtleXMoKSB7XG4gICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVElMREUpLm9uVXAuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlVQKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJoaWdobGlnaHQgbW92ZSBmb3J3YXJkIGNvbW1hbmQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkubW92ZUZvcndhcmQoZHVtbXlGdW5jKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IHR1cm4gcmlnaHQgY29tbWFuZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY29kZU9yZ0FQSS50dXJuUmlnaHQoZHVtbXlGdW5jKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5MRUZUKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJoaWdobGlnaHQgdHVybiBsZWZ0IGNvbW1hbmQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkudHVybkxlZnQoZHVtbXlGdW5jKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5QKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJoaWdobGlnaHQgcGxhY2VCbG9jayBjb21tYW5kLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLnBsYWNlQmxvY2soZHVtbXlGdW5jLCBcImxvZ09ha1wiKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5EKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJoaWdobGlnaHQgZGVzdHJveSBibG9jayBjb21tYW5kLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLmRlc3Ryb3lCbG9jayhkdW1teUZ1bmMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkUpLm9uVXAuYWRkKCgpID0+IHtcbiAgICAgICAgdmFyIGR1bW15RnVuYyA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgRXhlY3V0ZSBjb21tYW5kIGxpc3QgZG9uZTogJHtyZXN1bHR9IGApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkuc3RhcnRBdHRlbXB0KGR1bW15RnVuYyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVykub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXhlY3V0ZSBXaGlsZSBjb21tYW5kIGxpc3RcIik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBibG9ja1R5cGUgPSBcImVtcHR5XCI7XG4gICAgICAgIHZhciBjb2RlQmxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5jb2RlT3JnQVBJLm1vdmVGb3J3YXJkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXhlY3V0ZSBXaGlsZSBjb21tYW5kIG1vdmUgYmxvY2tcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5jb2RlT3JnQVBJLm1vdmVGb3J3YXJkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXhlY3V0ZSBXaGlsZSBjb21tYW5kIG1vdmUgYmxvY2syXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSS50dXJuTGVmdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgV2hpbGUgY29tbWFuZCB0dXJuXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkud2hpbGVQYXRoQWhlYWQoZHVtbXlGdW5jLCBibG9ja1R5cGUsIGNvZGVCbG9jayk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZUVuZFN0YXRlKCkge1xuICAgICAgLy8gVE9ETzogZ28gaW50byBzdWNjZXNzL2ZhaWx1cmUgYW5pbWF0aW9uPyAob3IgYXJlIHdlIGNhbGxlZCBieSBDb2RlT3JnIGZvciB0aGF0PylcblxuICAgICAgLy8gcmVwb3J0IGJhY2sgdG8gdGhlIGNvZGUub3JnIHNpZGUgdGhlIHBhc3MvZmFpbCByZXN1bHRcbiAgICAgIC8vICAgICB0aGVuIGNsZWFyIHRoZSBjYWxsYmFjayBzbyB3ZSBkb250IGtlZXAgY2FsbGluZyBpdFxuICAgICAgaWYgKHRoaXMuT25Db21wbGV0ZUNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKHRoaXMucXVldWUuaXNTdWNjZWVkZWQoKSkge1xuICAgICAgICAgICAgICB0aGlzLk9uQ29tcGxldGVDYWxsYmFjayh0cnVlLCB0aGlzLmxldmVsTW9kZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5PbkNvbXBsZXRlQ2FsbGJhY2soZmFsc2UsIHRoaXMubGV2ZWxNb2RlbCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuT25Db21wbGV0ZUNhbGxiYWNrID0gbnVsbDtcbiAgICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5ERUJVRykge1xuICAgICAgdGhpcy5nYW1lLmRlYnVnLnRleHQodGhpcy5nYW1lLnRpbWUuZnBzIHx8ICctLScsIDIsIDE0LCBcIiMwMGZmMDBcIik7XG4gICAgfVxuICAgIHRoaXMubGV2ZWxWaWV3LnJlbmRlcigpO1xuICB9XG5cbiAgc2NhbGVGcm9tT3JpZ2luYWwoKSB7XG4gICAgdmFyIFtuZXdXaWR0aCwgbmV3SGVpZ2h0XSA9IHRoaXMubGV2ZWxEYXRhLmdyaWREaW1lbnNpb25zIHx8IFsxMCwgMTBdO1xuICAgIHZhciBbb3JpZ2luYWxXaWR0aCwgb3JpZ2luYWxIZWlnaHRdID0gWzEwLCAxMF07XG4gICAgcmV0dXJuIFtuZXdXaWR0aCAvIG9yaWdpbmFsV2lkdGgsIG5ld0hlaWdodCAvIG9yaWdpbmFsSGVpZ2h0XTtcbiAgfVxuXG4gIGdldFNjcmVlbnNob3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZS5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICB9XG5cbiAgLy8gY29tbWFuZCBwcm9jZXNzb3JzXG4gIG1vdmVGb3J3YXJkKGNvbW1hbmRRdWV1ZUl0ZW0pIHtcbiAgICB2YXIgcGxheWVyID0gdGhpcy5sZXZlbE1vZGVsLnBsYXllcixcbiAgICAgIGFsbEZvdW5kQ3JlZXBlcnMsXG4gICAgICBncm91bmRUeXBlLFxuICAgICAganVtcE9mZjtcblxuICAgIGlmICh0aGlzLmxldmVsTW9kZWwuY2FuTW92ZUZvcndhcmQoKSkge1xuICAgICAgbGV0IHdhc09uQmxvY2sgPSBwbGF5ZXIuaXNPbkJsb2NrO1xuICAgICAgdGhpcy5sZXZlbE1vZGVsLm1vdmVGb3J3YXJkKCk7XG4gICAgICAvLyBUT0RPOiBjaGVjayBmb3IgTGF2YSwgQ3JlZXBlciwgd2F0ZXIgPT4gcGxheSBhcHByb3AgYW5pbWF0aW9uICYgY2FsbCBjb21tYW5kUXVldWVJdGVtLmZhaWxlZCgpXG5cbiAgICAgIGp1bXBPZmYgPSB3YXNPbkJsb2NrICYmIHdhc09uQmxvY2sgIT0gcGxheWVyLmlzT25CbG9jaztcbiAgICAgIGlmKHBsYXllci5pc09uQmxvY2sgfHwganVtcE9mZikge1xuICAgICAgICBncm91bmRUeXBlID0gdGhpcy5sZXZlbE1vZGVsLmFjdGlvblBsYW5lW3RoaXMubGV2ZWxNb2RlbC55VG9JbmRleChwbGF5ZXIucG9zaXRpb25bMV0pICsgcGxheWVyLnBvc2l0aW9uWzBdXS5ibG9ja1R5cGU7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZ3JvdW5kVHlwZSA9IHRoaXMubGV2ZWxNb2RlbC5ncm91bmRQbGFuZVt0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgocGxheWVyLnBvc2l0aW9uWzFdKSArIHBsYXllci5wb3NpdGlvblswXV0uYmxvY2tUeXBlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxldmVsVmlldy5wbGF5TW92ZUZvcndhcmRBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBqdW1wT2ZmLCBwbGF5ZXIuaXNPbkJsb2NrLCBncm91bmRUeXBlLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgcGxheWVyLmlzT25CbG9jayk7XG5cbiAgICAgIC8vRmlyc3QgYXJnIGlzIGlmIHdlIGZvdW5kIGEgY3JlZXBlclxuICAgICAgICBhbGxGb3VuZENyZWVwZXJzID0gdGhpcy5sZXZlbE1vZGVsLmlzUGxheWVyU3RhbmRpbmdOZWFyQ3JlZXBlcigpO1xuXG4gICAgICAgIGlmICh0aGlzLmxldmVsTW9kZWwuaXNQbGF5ZXJTdGFuZGluZ0luV2F0ZXIoKSkge1xuICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheURyb3duRmFpbHVyZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMubGV2ZWxNb2RlbC5pc1BsYXllclN0YW5kaW5nSW5MYXZhKCkpIHtcbiAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5QnVybkluTGF2YUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKCk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuZGVsYXlQbGF5ZXJNb3ZlQnkoMzAsIDIwMCwgKCkgPT4ge1xuICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYodGhpcy5sZXZlbE1vZGVsLmlzRm9yd2FyZEJsb2NrT2ZUeXBlKFwiY3JlZXBlclwiKSlcbiAgICAgIHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUNyZWVwZXJFeHBsb2RlQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgdGhpcy5sZXZlbE1vZGVsLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKSwgcGxheWVyLmlzT25CbG9jaywgKCkgPT4ge1xuICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlCdW1wQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgZmFsc2UpO1xuICAgICAgICB0aGlzLmRlbGF5UGxheWVyTW92ZUJ5KDQwMCwgODAwLCAoKSA9PiB7XG4gICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdHVybihjb21tYW5kUXVldWVJdGVtLCBkaXJlY3Rpb24pIHtcbiAgICBpZiAoZGlyZWN0aW9uID09IC0xKSB7XG4gICAgICB0aGlzLmxldmVsTW9kZWwudHVybkxlZnQoKTtcbiAgICB9XG5cbiAgICBpZiAoZGlyZWN0aW9uID09IDEpIHtcbiAgICAgIHRoaXMubGV2ZWxNb2RlbC50dXJuUmlnaHQoKTtcbiAgICB9XG4gICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlUGxheWVyRGlyZWN0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nKTtcblxuICAgIHRoaXMuZGVsYXlQbGF5ZXJNb3ZlQnkoMjAwLCA4MDAsICgpID0+IHtcbiAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgfSk7XG5cbiAgfVxuXG4gIGRlc3Ryb3lCbG9ja1dpdGhvdXRQbGF5ZXJJbnRlcmFjdGlvbihwb3NpdGlvbikge1xuICAgIGxldCBibG9jayA9IHRoaXMubGV2ZWxNb2RlbC5hY3Rpb25QbGFuZVt0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgocG9zaXRpb25bMV0pICsgcG9zaXRpb25bMF1dO1xuICAgIHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2socG9zaXRpb24pO1xuXG4gICAgaWYgKGJsb2NrICE9PSBudWxsKSB7XG4gICAgICBsZXQgZGVzdHJveVBvc2l0aW9uID0gYmxvY2sucG9zaXRpb247XG4gICAgICBsZXQgYmxvY2tUeXBlID0gYmxvY2suYmxvY2tUeXBlO1xuXG4gICAgICBpZiAoYmxvY2suaXNEZXN0cm95YWJsZSkge1xuICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZVNoYWRpbmdQbGFuZSgpO1xuICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICAgIHN3aXRjaChibG9ja1R5cGUpe1xuICAgICAgICAgIGNhc2UgXCJsb2dBY2FjaWFcIjpcbiAgICAgICAgICBjYXNlIFwidHJlZUFjYWNpYVwiOlxuICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NBY2FjaWFcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwibG9nQmlyY2hcIjpcbiAgICAgICAgICBjYXNlIFwidHJlZUJpcmNoXCI6XG4gICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzQmlyY2hcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwibG9nSnVuZ2xlXCI6XG4gICAgICAgICAgY2FzZSBcInRyZWVKdW5nbGVcIjpcbiAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzSnVuZ2xlXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImxvZ09ha1wiOlxuICAgICAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzT2FrXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImxvZ1NwcnVjZVwiOlxuICAgICAgICAgIGNhc2UgXCJ0cmVlU3BydWNlXCI6XG4gICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc1NwcnVjZVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LmFjdGlvblBsYW5lQmxvY2tzW3RoaXMubGV2ZWxNb2RlbC55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgZGVzdHJveVBvc2l0aW9uWzBdXS5raWxsKCk7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlFeHBsb3Npb25BbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCAoKT0+e30sIHRydWUpO1xuICAgICAgfSBlbHNlIGlmIChibG9jay5pc1VzYWJsZSkge1xuICAgICAgICBzd2l0Y2ggKGJsb2NrVHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJzaGVlcFwiOlxuICAgICAgICAgICAgLy8gVE9ETzogV2hhdCB0byBkbyB3aXRoIGFscmVhZHkgc2hlZXJlZCBzaGVlcD9cbiAgICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlTaGVhckFuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsICgpPT57fSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3lCbG9jayhjb21tYW5kUXVldWVJdGVtKSB7XG4gICAgbGV0IHBsYXllciA9IHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXI7XG4gICAgaWYgKHRoaXMubGV2ZWxNb2RlbC5jYW5EZXN0cm95QmxvY2tGb3J3YXJkKCkpIHtcbiAgICAgIGxldCBibG9jayA9IHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2tGb3J3YXJkKCk7XG5cbiAgICAgIGlmIChibG9jayAhPT0gbnVsbCkge1xuICAgICAgICBsZXQgZGVzdHJveVBvc2l0aW9uID0gYmxvY2sucG9zaXRpb247XG4gICAgICAgIGxldCBibG9ja1R5cGUgPSBibG9jay5ibG9ja1R5cGU7XG5cbiAgICAgICAgaWYgKGJsb2NrLmlzRGVzdHJveWFibGUpIHtcbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZVNoYWRpbmdQbGFuZSgpO1xuICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlRm93UGxhbmUoKTtcbiAgICAgICAgICBzd2l0Y2goYmxvY2tUeXBlKXtcbiAgICAgICAgICAgIGNhc2UgXCJsb2dBY2FjaWFcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0cmVlQWNhY2lhXCI6XG4gICAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzQWNhY2lhXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsb2dCaXJjaFwiOlxuICAgICAgICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzQmlyY2hcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImxvZ0p1bmdsZVwiOlxuICAgICAgICAgICAgY2FzZSBcInRyZWVKdW5nbGVcIjpcbiAgICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NKdW5nbGVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImxvZ09ha1wiOlxuICAgICAgICAgICAgY2FzZSBcInRyZWVPYWtcIjpcbiAgICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc09ha1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibG9nU3BydWNlXCI6XG4gICAgICAgICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc1NwcnVjZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheURlc3Ryb3lCbG9ja0FuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCB0aGlzLmxldmVsTW9kZWwuc2hhZGluZ1BsYW5lLCB0aGlzLmxldmVsTW9kZWwuZm93UGxhbmUsICgpID0+IHtcbiAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmxvY2suaXNVc2FibGUpIHtcbiAgICAgICAgICBzd2l0Y2ggKGJsb2NrVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcInNoZWVwXCI6XG4gICAgICAgICAgICAgIC8vIFRPRE86IFdoYXQgdG8gZG8gd2l0aCBhbHJlYWR5IHNoZWVyZWQgc2hlZXA/XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlTaGVhclNoZWVwQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlQdW5jaERlc3Ryb3lBaXJBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCB0aGlzLmxldmVsTW9kZWwuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHBsYXllci5wb3NpdGlvblswXSwgcGxheWVyLnBvc2l0aW9uWzFdKTtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUlkbGVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrKTtcbiAgICAgICAgdGhpcy5kZWxheVBsYXllck1vdmVCeSgyMDAsIDYwMCwgKCkgPT4ge1xuICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY2FuVXNlVGludHMoKSB7XG4gICAgLy8gVE9ETyhiam9yZGFuKTogUmVtb3ZlXG4gICAgLy8gYWxsIGJyb3dzZXJzIGFwcGVhciB0byB3b3JrIHdpdGggbmV3IHZlcnNpb24gb2YgUGhhc2VyXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjaGVja1RudEFuaW1hdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zcGVjaWFsTGV2ZWxUeXBlID09PSAnZnJlZXBsYXknO1xuICB9XG5cbiAgY2hlY2tNaW5lY2FydExldmVsRW5kQW5pbWF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnNwZWNpYWxMZXZlbFR5cGUgPT09ICdtaW5lY2FydCc7XG4gIH1cblxuICBjaGVja0hvdXNlQnVpbHRFbmRBbmltYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BlY2lhbExldmVsVHlwZSA9PT0gJ2hvdXNlQnVpbGQnO1xuICB9XG5cbiAgY2hlY2tSYWlsQmxvY2soYmxvY2tUeXBlKSB7XG4gICAgdmFyIGNoZWNrUmFpbEJsb2NrID0gdGhpcy5sZXZlbE1vZGVsLnJhaWxNYXBbdGhpcy5sZXZlbE1vZGVsLnlUb0luZGV4KHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb25bMV0pICsgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvblswXV07XG4gICAgaWYgKGNoZWNrUmFpbEJsb2NrICE9PSBcIlwiKSB7XG4gICAgICBibG9ja1R5cGUgPSBjaGVja1JhaWxCbG9jaztcbiAgICB9IGVsc2Uge1xuICAgICAgYmxvY2tUeXBlID0gXCJyYWlsc1ZlcnRpY2FsXCI7XG4gICAgfVxuICAgIHJldHVybiBibG9ja1R5cGU7XG4gIH1cblxuICBwbGFjZUJsb2NrKGNvbW1hbmRRdWV1ZUl0ZW0sIGJsb2NrVHlwZSkge1xuICAgIHZhciBibG9ja0luZGV4ID0gKHRoaXMubGV2ZWxNb2RlbC55VG9JbmRleCh0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uWzFdKSArIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb25bMF0pO1xuICAgIHZhciBibG9ja1R5cGVBdFBvc2l0aW9uID0gdGhpcy5sZXZlbE1vZGVsLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmJsb2NrVHlwZTtcbiAgICBpZiAodGhpcy5sZXZlbE1vZGVsLmNhblBsYWNlQmxvY2soKSkge1xuICAgICAgaWYodGhpcy5jaGVja01pbmVjYXJ0TGV2ZWxFbmRBbmltYXRpb24oKSAmJiBibG9ja1R5cGUgPT0gXCJyYWlsXCIpIHtcbiAgICAgICAgYmxvY2tUeXBlID0gdGhpcy5jaGVja1JhaWxCbG9jayhibG9ja1R5cGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYmxvY2tUeXBlQXRQb3NpdGlvbiAhPT0gXCJcIikge1xuICAgICAgICB0aGlzLmxldmVsTW9kZWwuZGVzdHJveUJsb2NrKGJsb2NrSW5kZXgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubGV2ZWxNb2RlbC5wbGFjZUJsb2NrKGJsb2NrVHlwZSkpIHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVBsYWNlQmxvY2tBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGJsb2NrVHlwZSwgYmxvY2tUeXBlQXRQb3NpdGlvbiwgICgpID0+IHtcbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZVNoYWRpbmdQbGFuZSgpO1xuICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlRm93UGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVTaGFkaW5nUGxhbmUodGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSk7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlRm93UGxhbmUodGhpcy5sZXZlbE1vZGVsLmZvd1BsYW5lKTtcbiAgICAgICAgICB0aGlzLmRlbGF5QnkoMjAwLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5SWRsZUFuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgZmFsc2UpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuZGVsYXlQbGF5ZXJNb3ZlQnkoMjAwLCA0MDAsICgpID0+IHtcbiAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNpZ25hbEJpbmRpbmcgPSB0aGlzLmxldmVsVmlldy5wbGF5UGxheWVyQW5pbWF0aW9uKFwianVtcFVwXCIsIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBmYWxzZSkub25Mb29wLmFkZCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUlkbGVBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGZhbHNlKTtcbiAgICAgICAgICBzaWduYWxCaW5kaW5nLmRldGFjaCgpO1xuICAgICAgICAgIHRoaXMuZGVsYXlCeSg4MDAsICgpID0+IHsgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTsgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb21tYW5kUXVldWVJdGVtLmZhaWxlZCgpO1xuICAgIH1cbiAgfVxuXG4gIHNldFBsYXllckFjdGlvbkRlbGF5QnlRdWV1ZUxlbmd0aCgpIHtcbiAgICB2YXIgU1RBUlRfU1BFRURfVVAgPSAxMDtcbiAgICB2YXIgRU5EX1NQRUVEX1VQID0gMjA7XG5cbiAgICB2YXIgcXVldWVMZW5ndGggPSB0aGlzLnF1ZXVlLmdldExlbmd0aCgpO1xuICAgIHZhciBzcGVlZFVwUmFuZ2VNYXggPSBFTkRfU1BFRURfVVAgLSBTVEFSVF9TUEVFRF9VUDtcbiAgICB2YXIgc3BlZWRVcEFtb3VudCA9IE1hdGgubWluKE1hdGgubWF4KHF1ZXVlTGVuZ3RoIC0gU1RBUlRfU1BFRURfVVAsIDApLCBzcGVlZFVwUmFuZ2VNYXgpO1xuXG4gICAgdGhpcy5wbGF5ZXJEZWxheUZhY3RvciA9IDEgLSAoc3BlZWRVcEFtb3VudCAvIHNwZWVkVXBSYW5nZU1heCk7XG4gIH1cblxuICBkZWxheUJ5KG1zLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciB0aW1lciA9IHRoaXMuZ2FtZS50aW1lLmNyZWF0ZSh0cnVlKTtcbiAgICB0aW1lci5hZGQodGhpcy5vcmlnaW5hbE1zVG9TY2FsZWQobXMpLCBjb21wbGV0aW9uSGFuZGxlciwgdGhpcyk7XG4gICAgdGltZXIuc3RhcnQoKTtcbiAgICB0aGlzLnJlc2V0dGFibGVUaW1lcnMucHVzaCh0aW1lcik7XG4gIH1cblxuICBkZWxheVBsYXllck1vdmVCeShtaW5NcywgbWF4TXMsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5kZWxheUJ5KE1hdGgubWF4KG1pbk1zLCBtYXhNcyAqIHRoaXMucGxheWVyRGVsYXlGYWN0b3IpLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gIH1cblxuICBvcmlnaW5hbE1zVG9TY2FsZWQobXMpIHtcbiAgICB2YXIgcmVhbE1zID0gbXMgLyB0aGlzLmFzc3VtZWRTbG93TW90aW9uO1xuICAgIHJldHVybiByZWFsTXMgKiB0aGlzLmdhbWUudGltZS5zbG93TW90aW9uO1xuICB9XG5cbiAgb3JpZ2luYWxGcHNUb1NjYWxlZChmcHMpIHtcbiAgICB2YXIgcmVhbEZwcyA9IGZwcyAqIHRoaXMuYXNzdW1lZFNsb3dNb3Rpb247XG4gICAgcmV0dXJuIHJlYWxGcHMgLyB0aGlzLmdhbWUudGltZS5zbG93TW90aW9uO1xuICB9XG5cbiAgcGxhY2VCbG9ja0ZvcndhcmQoY29tbWFuZFF1ZXVlSXRlbSwgYmxvY2tUeXBlKSB7XG4gICAgdmFyIGZvcndhcmRQb3NpdGlvbixcbiAgICAgICAgcGxhY2VtZW50UGxhbmUsXG4gICAgICAgIHNvdW5kRWZmZWN0ID0gKCk9Pnt9O1xuXG4gICAgaWYgKCF0aGlzLmxldmVsTW9kZWwuY2FuUGxhY2VCbG9ja0ZvcndhcmQoKSkge1xuICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVB1bmNoQWlyQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBmYWxzZSk7XG4gICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3J3YXJkUG9zaXRpb24gPSB0aGlzLmxldmVsTW9kZWwuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpO1xuICAgIHBsYWNlbWVudFBsYW5lID0gdGhpcy5sZXZlbE1vZGVsLmdldFBsYW5lVG9QbGFjZU9uKGZvcndhcmRQb3NpdGlvbik7XG4gICAgaWYodGhpcy5sZXZlbE1vZGVsLmlzQmxvY2tPZlR5cGVPblBsYW5lKGZvcndhcmRQb3NpdGlvbiwgXCJsYXZhXCIsIHBsYWNlbWVudFBsYW5lKSkge1xuICAgICAgc291bmRFZmZlY3QgPSAoKT0+e3RoaXMubGV2ZWxWaWV3LmF1ZGlvUGxheWVyLnBsYXkoXCJmaXp6XCIpO307XG4gICAgfVxuICAgIHRoaXMubGV2ZWxNb2RlbC5wbGFjZUJsb2NrRm9yd2FyZChibG9ja1R5cGUsIHBsYWNlbWVudFBsYW5lKTtcbiAgICB0aGlzLmxldmVsVmlldy5wbGF5UGxhY2VCbG9ja0luRnJvbnRBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIHRoaXMubGV2ZWxNb2RlbC5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCksIHBsYWNlbWVudFBsYW5lLCBibG9ja1R5cGUsICgpID0+IHtcbiAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVTaGFkaW5nUGxhbmUodGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSk7XG4gICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVGb3dQbGFuZSh0aGlzLmxldmVsTW9kZWwuZm93UGxhbmUpO1xuICAgICAgc291bmRFZmZlY3QoKTtcbiAgICAgIHRoaXMuZGVsYXlCeSgyMDAsICgpID0+IHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUlkbGVBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGZhbHNlKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kZWxheVBsYXllck1vdmVCeSgyMDAsIDQwMCwgKCkgPT4ge1xuICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBjaGVja1NvbHV0aW9uKGNvbW1hbmRRdWV1ZUl0ZW0pIHtcbiAgICBsZXQgcGxheWVyID0gdGhpcy5sZXZlbE1vZGVsLnBsYXllcjtcbiAgICB0aGlzLmxldmVsVmlldy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwbGF5ZXIucG9zaXRpb25bMF0sIHBsYXllci5wb3NpdGlvblsxXSk7XG5cbiAgICAvLyBjaGVjayB0aGUgZmluYWwgc3RhdGUgdG8gc2VlIGlmIGl0cyBzb2x2ZWRcbiAgICBpZiAodGhpcy5sZXZlbE1vZGVsLmlzU29sdmVkKCkpIHtcbiAgICAgIGlmKHRoaXMuY2hlY2tIb3VzZUJ1aWx0RW5kQW5pbWF0aW9uKCkpIHtcbiAgICAgICAgdmFyIGhvdXNlQm90dG9tUmlnaHQgPSB0aGlzLmxldmVsTW9kZWwuZ2V0SG91c2VCb3R0b21SaWdodCgpO1xuICAgICAgICB2YXIgaW5Gcm9udE9mRG9vciA9IFtob3VzZUJvdHRvbVJpZ2h0WzBdIC0gMSwgaG91c2VCb3R0b21SaWdodFsxXSArIDJdO1xuICAgICAgICB2YXIgYmVkUG9zaXRpb24gPSBbaG91c2VCb3R0b21SaWdodFswXSwgaG91c2VCb3R0b21SaWdodFsxXV07XG4gICAgICAgIHZhciBkb29yUG9zaXRpb24gPSBbaG91c2VCb3R0b21SaWdodFswXSAtIDEsIGhvdXNlQm90dG9tUmlnaHRbMV0gKyAxXTtcbiAgICAgICAgdGhpcy5sZXZlbE1vZGVsLm1vdmVUbyhpbkZyb250T2ZEb29yKTtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVN1Y2Nlc3NIb3VzZUJ1aWx0QW5pbWF0aW9uKFxuICAgICAgICAgICAgcGxheWVyLnBvc2l0aW9uLFxuICAgICAgICAgICAgcGxheWVyLmZhY2luZyxcbiAgICAgICAgICAgIHBsYXllci5pc09uQmxvY2ssXG4gICAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuaG91c2VHcm91bmRUb0Zsb29yQmxvY2tzKGhvdXNlQm90dG9tUmlnaHQpLFxuICAgICAgICAgICAgW2JlZFBvc2l0aW9uLCBkb29yUG9zaXRpb25dLFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmRlc3Ryb3lCbG9jayhiZWRQb3NpdGlvbik7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2soZG9vclBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVGb3dQbGFuZSgpO1xuICAgICAgICAgICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVTaGFkaW5nUGxhbmUodGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSk7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZUZvd1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5mb3dQbGFuZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRoaXMuY2hlY2tNaW5lY2FydExldmVsRW5kQW5pbWF0aW9uKCkpXG4gICAgICB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlNaW5lY2FydEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssXG4gICAgICAgICAgICAoKSA9PiB7IGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7IH0sIHRoaXMubGV2ZWxNb2RlbC5nZXRNaW5lY2FydFRyYWNrKCksIHRoaXMubGV2ZWxNb2RlbC5nZXRVbnBvd2VyZWRSYWlscygpKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodGhpcy5jaGVja1RudEFuaW1hdGlvbigpKSB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnNjYWxlU2hvd1dob2xlV29ybGQoKCkgPT4ge30pO1xuICAgICAgICB2YXIgdG50ID0gdGhpcy5sZXZlbE1vZGVsLmdldFRudCgpO1xuICAgICAgICB2YXIgd2FzT25CbG9jayA9IHBsYXllci5pc09uQmxvY2s7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlEZXN0cm95VG50QW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgcGxheWVyLmlzT25CbG9jaywgdGhpcy5sZXZlbE1vZGVsLmdldFRudCgpLCB0aGlzLmxldmVsTW9kZWwuc2hhZGluZ1BsYW5lLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRudC5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFNoYWtlcyBjYW1lcmEgKG5lZWQgdG8gYXZvaWQgY29udGVudGlvbiB3aXRoIHBhbj8pXG4gICAgICAgICAgICAvL3RoaXMuZ2FtZS5jYW1lcmEuc2V0UG9zaXRpb24oMCwgNSk7XG4gICAgICAgICAgICAvL3RoaXMuZ2FtZS5hZGQudHdlZW4odGhpcy5nYW1lLmNhbWVyYSlcbiAgICAgICAgICAgIC8vICAgIC50byh7eTogLTEwfSwgNDAsIFBoYXNlci5FYXNpbmcuU2ludXNvaWRhbC5Jbk91dCwgZmFsc2UsIDAsIDMsIHRydWUpXG4gICAgICAgICAgICAvLyAgICAudG8oe3k6IDB9LCAwKVxuICAgICAgICAgICAgLy8gICAgLnN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvcih2YXIgaSBpbiB0bnQpIHtcbiAgICAgICAgICAgIGlmICh0bnRbaV0ueCA9PT0gdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbi54ICYmIHRudFtpXS55ID09PSB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLnkpIHtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5pc09uQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdXJyb3VuZGluZ0Jsb2NrcyA9IHRoaXMubGV2ZWxNb2RlbC5nZXRBbGxCb3JkZXJpbmdQb3NpdGlvbk5vdE9mVHlwZSh0bnRbaV0sIFwidG50XCIpO1xuICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmRlc3Ryb3lCbG9jayh0bnRbaV0pO1xuICAgICAgICAgICAgZm9yKHZhciBiID0gMTsgYiA8IHN1cnJvdW5kaW5nQmxvY2tzLmxlbmd0aDsgKytiKSB7XG4gICAgICAgICAgICAgIGlmKHN1cnJvdW5kaW5nQmxvY2tzW2JdWzBdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95QmxvY2tXaXRob3V0UGxheWVySW50ZXJhY3Rpb24oc3Vycm91bmRpbmdCbG9ja3NbYl1bMV0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghcGxheWVyLmlzT25CbG9jayAmJiB3YXNPbkJsb2NrKSB7XG4gICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5UGxheWVySnVtcERvd25WZXJ0aWNhbEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZVNoYWRpbmdQbGFuZSgpO1xuICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlRm93UGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVTaGFkaW5nUGxhbmUodGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSk7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlRm93UGxhbmUodGhpcy5sZXZlbE1vZGVsLmZvd1BsYW5lKTtcbiAgICAgICAgICB0aGlzLmRlbGF5QnkoMjAwLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5U3VjY2Vzc0FuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5U3VjY2Vzc0FuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssXG4gICAgICAgICAgICAoKSA9PiB7IGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7IH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxldmVsVmlldy5wbGF5RmFpbHVyZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlzUGF0aEFoZWFkKGJsb2NrVHlwZSkgIHtcbiAgICAgIHJldHVybiB0aGlzLmxldmVsTW9kZWwuaXNGb3J3YXJkQmxvY2tPZlR5cGUoYmxvY2tUeXBlKTtcbiAgfVxuXG59XG5cbndpbmRvdy5HYW1lQ29udHJvbGxlciA9IEdhbWVDb250cm9sbGVyO1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lQ29udHJvbGxlcjtcbiIsImltcG9ydCBGYWNpbmdEaXJlY3Rpb24gZnJvbSBcIi4vRmFjaW5nRGlyZWN0aW9uLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExldmVsVmlldyB7XG4gIGNvbnN0cnVjdG9yKGNvbnRyb2xsZXIpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgIHRoaXMuYXVkaW9QbGF5ZXIgPSBjb250cm9sbGVyLmF1ZGlvUGxheWVyO1xuICAgIHRoaXMuZ2FtZSA9IGNvbnRyb2xsZXIuZ2FtZTtcblxuICAgIHRoaXMuYmFzZVNoYWRpbmcgPSBudWxsO1xuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBudWxsO1xuICAgIHRoaXMucGxheWVyR2hvc3QgPSBudWxsOyAgICAgICAgLy8gVGhlIGdob3N0IGlzIGEgY29weSBvZiB0aGUgcGxheWVyIHNwcml0ZSB0aGF0IHNpdHMgb24gdG9wIG9mIGV2ZXJ5dGhpbmcgYXQgMjAlIG9wYWNpdHksIHNvIHRoZSBwbGF5ZXIgY2FuIGdvIHVuZGVyIHRyZWVzIGFuZCBzdGlsbCBiZSBzZWVuLlxuICAgIHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yID0gbnVsbDtcblxuICAgIHRoaXMuZ3JvdW5kUGxhbmUgPSBudWxsO1xuICAgIHRoaXMuc2hhZGluZ1BsYW5lID0gbnVsbDtcbiAgICB0aGlzLmFjdGlvblBsYW5lID0gbnVsbDtcbiAgICB0aGlzLmZsdWZmUGxhbmUgPSBudWxsO1xuICAgIHRoaXMuZm93UGxhbmUgPSBudWxsO1xuXG4gICAgdGhpcy5taW5pQmxvY2tzID0ge1xuICAgICAgXCJkaXJ0XCI6IFtcIk1pbmlibG9ja3NcIiwgMCwgNV0sXG4gICAgICBcImRpcnRDb2Fyc2VcIjogW1wiTWluaWJsb2Nrc1wiLCA2LCAxMV0sXG4gICAgICBcInNhbmRcIjogW1wiTWluaWJsb2Nrc1wiLCAxMiwgMTddLFxuICAgICAgXCJncmF2ZWxcIjogW1wiTWluaWJsb2Nrc1wiLCAxOCwgMjNdLFxuICAgICAgXCJicmlja3NcIjogW1wiTWluaWJsb2Nrc1wiLCAyNCwgMjldLFxuICAgICAgXCJsb2dBY2FjaWFcIjogW1wiTWluaWJsb2Nrc1wiLCAzMCwgMzVdLFxuICAgICAgXCJsb2dCaXJjaFwiOiBbXCJNaW5pYmxvY2tzXCIsIDM2LCA0MV0sXG4gICAgICBcImxvZ0p1bmdsZVwiOiBbXCJNaW5pYmxvY2tzXCIsIDQyLCA0N10sXG4gICAgICBcImxvZ09ha1wiOiBbXCJNaW5pYmxvY2tzXCIsIDQ4LCA1M10sXG4gICAgICBcImxvZ1NwcnVjZVwiOiBbXCJNaW5pYmxvY2tzXCIsIDU0LCA1OV0sXG4gICAgICBcInBsYW5rc0FjYWNpYVwiOiBbXCJNaW5pYmxvY2tzXCIsIDYwLCA2NV0sXG4gICAgICBcInBsYW5rc0JpcmNoXCI6IFtcIk1pbmlibG9ja3NcIiwgNjYsIDcxXSxcbiAgICAgIFwicGxhbmtzSnVuZ2xlXCI6IFtcIk1pbmlibG9ja3NcIiwgNzIsIDc3XSxcbiAgICAgIFwicGxhbmtzT2FrXCI6IFtcIk1pbmlibG9ja3NcIiwgNzgsIDgzXSxcbiAgICAgIFwicGxhbmtzU3BydWNlXCI6IFtcIk1pbmlibG9ja3NcIiwgODQsIDg5XSxcbiAgICAgIFwiY29iYmxlc3RvbmVcIjogW1wiTWluaWJsb2Nrc1wiLCA5MCwgOTVdLFxuICAgICAgXCJzYW5kc3RvbmVcIjogW1wiTWluaWJsb2Nrc1wiLCA5NiwgMTAxXSxcbiAgICAgIFwid29vbFwiOiBbXCJNaW5pYmxvY2tzXCIsIDEwMiwgMTA3XSxcbiAgICAgIFwicmVkc3RvbmVEdXN0XCI6IFtcIk1pbmlibG9ja3NcIiwgMTA4LCAxMTNdLFxuICAgICAgXCJsYXBpc0xhenVsaVwiOiBbXCJNaW5pYmxvY2tzXCIsIDExNCwgMTE5XSxcbiAgICAgIFwiaW5nb3RJcm9uXCI6IFtcIk1pbmlibG9ja3NcIiwgMTIwLCAxMjVdLFxuICAgICAgXCJpbmdvdEdvbGRcIjogW1wiTWluaWJsb2Nrc1wiLCAxMjYsIDEzMV0sXG4gICAgICBcImVtZXJhbGRcIjogW1wiTWluaWJsb2Nrc1wiLCAxMzIsIDEzN10sXG4gICAgICBcImRpYW1vbmRcIjogW1wiTWluaWJsb2Nrc1wiLCAxMzgsIDE0M10sXG4gICAgICBcImNvYWxcIjogW1wiTWluaWJsb2Nrc1wiLCAxNDQsIDE0OV0sXG4gICAgICBcImJ1Y2tldFdhdGVyXCI6IFtcIk1pbmlibG9ja3NcIiwgMTUwLCAxNTVdLFxuICAgICAgXCJidWNrZXRMYXZhXCI6IFtcIk1pbmlibG9ja3NcIiwgMTU2LCAxNjFdLFxuICAgICAgXCJndW5Qb3dkZXJcIjogW1wiTWluaWJsb2Nrc1wiLCAxNjIsIDE2N10sXG4gICAgICBcIndoZWF0XCI6IFtcIk1pbmlibG9ja3NcIiwgMTY4LCAxNzNdLFxuICAgICAgXCJwb3RhdG9cIjogW1wiTWluaWJsb2Nrc1wiLCAxNzQsIDE3OV0sXG4gICAgICBcImNhcnJvdHNcIjogW1wiTWluaWJsb2Nrc1wiLCAxODAsIDE4NV0sXG5cbiAgICAgIFwic2hlZXBcIjogW1wiTWluaWJsb2Nrc1wiLCAxMDIsIDEwN11cbiAgICB9O1xuXG4gICAgdGhpcy5ibG9ja3MgPSB7XG4gICAgICBcImJlZHJvY2tcIjogW1wiYmxvY2tzXCIsIFwiQmVkcm9ja1wiLCAtMTMsIDBdLFxuICAgICAgXCJicmlja3NcIjogW1wiYmxvY2tzXCIsIFwiQnJpY2tzXCIsIC0xMywgMF0sXG4gICAgICBcIm9yZUNvYWxcIjogW1wiYmxvY2tzXCIsIFwiQ29hbF9PcmVcIiwgLTEzLCAwXSxcbiAgICAgIFwiZGlydENvYXJzZVwiOiBbXCJibG9ja3NcIiwgXCJDb2Fyc2VfRGlydFwiLCAtMTMsIDBdLFxuICAgICAgXCJjb2JibGVzdG9uZVwiOiBbXCJibG9ja3NcIiwgXCJDb2JibGVzdG9uZVwiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVEaWFtb25kXCI6IFtcImJsb2Nrc1wiLCBcIkRpYW1vbmRfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcImRpcnRcIjogW1wiYmxvY2tzXCIsIFwiRGlydFwiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVFbWVyYWxkXCI6IFtcImJsb2Nrc1wiLCBcIkVtZXJhbGRfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcImZhcm1sYW5kV2V0XCI6IFtcImJsb2Nrc1wiLCBcIkZhcm1sYW5kX1dldFwiLCAtMTMsIDBdLFxuICAgICAgXCJmbG93ZXJEYW5kZWxpb25cIjogW1wiYmxvY2tzXCIsIFwiRmxvd2VyX0RhbmRlbGlvblwiLCAtMTMsIDBdLFxuICAgICAgXCJmbG93ZXJPeGVleWVcIjogW1wiYmxvY2tzXCIsIFwiRmxvd2VyX094ZWV5ZVwiLCAtMTMsIDBdLFxuICAgICAgXCJmbG93ZXJSb3NlXCI6IFtcImJsb2Nrc1wiLCBcIkZsb3dlcl9Sb3NlXCIsIC0xMywgMF0sXG4gICAgICBcImdsYXNzXCI6IFtcImJsb2Nrc1wiLCBcIkdsYXNzXCIsIC0xMywgMF0sXG4gICAgICBcIm9yZUdvbGRcIjogW1wiYmxvY2tzXCIsIFwiR29sZF9PcmVcIiwgLTEzLCAwXSxcbiAgICAgIFwiZ3Jhc3NcIjogW1wiYmxvY2tzXCIsIFwiR3Jhc3NcIiwgLTEzLCAwXSxcbiAgICAgIFwiZ3JhdmVsXCI6IFtcImJsb2Nrc1wiLCBcIkdyYXZlbFwiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVJcm9uXCI6IFtcImJsb2Nrc1wiLCBcIklyb25fT3JlXCIsIC0xMywgMF0sXG4gICAgICBcIm9yZUxhcGlzXCI6IFtcImJsb2Nrc1wiLCBcIkxhcGlzX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJsYXZhXCI6IFtcImJsb2Nrc1wiLCBcIkxhdmFfMFwiLCAtMTMsIDBdLFxuICAgICAgXCJsb2dBY2FjaWFcIjogW1wiYmxvY2tzXCIsIFwiTG9nX0FjYWNpYVwiLCAtMTMsIDBdLFxuICAgICAgXCJsb2dCaXJjaFwiOiBbXCJibG9ja3NcIiwgXCJMb2dfQmlyY2hcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nSnVuZ2xlXCI6IFtcImJsb2Nrc1wiLCBcIkxvZ19KdW5nbGVcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nT2FrXCI6IFtcImJsb2Nrc1wiLCBcIkxvZ19PYWtcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nU3BydWNlXCI6IFtcImJsb2Nrc1wiLCBcIkxvZ19TcHJ1Y2VcIiwgLTEzLCAwXSxcbiAgICAgIC8vXCJvYnNpZGlhblwiOiBbXCJibG9ja3NcIiwgXCJPYnNpZGlhblwiLCAtMTMsIDBdLFxuICAgICAgXCJwbGFua3NBY2FjaWFcIjogW1wiYmxvY2tzXCIsIFwiUGxhbmtzX0FjYWNpYVwiLCAtMTMsIDBdLFxuICAgICAgXCJwbGFua3NCaXJjaFwiOiBbXCJibG9ja3NcIiwgXCJQbGFua3NfQmlyY2hcIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzSnVuZ2xlXCI6IFtcImJsb2Nrc1wiLCBcIlBsYW5rc19KdW5nbGVcIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzT2FrXCI6IFtcImJsb2Nrc1wiLCBcIlBsYW5rc19PYWtcIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzU3BydWNlXCI6IFtcImJsb2Nrc1wiLCBcIlBsYW5rc19TcHJ1Y2VcIiwgLTEzLCAwXSxcbiAgICAgIFwib3JlUmVkc3RvbmVcIjogW1wiYmxvY2tzXCIsIFwiUmVkc3RvbmVfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcInNhbmRcIjogW1wiYmxvY2tzXCIsIFwiU2FuZFwiLCAtMTMsIDBdLFxuICAgICAgXCJzYW5kc3RvbmVcIjogW1wiYmxvY2tzXCIsIFwiU2FuZHN0b25lXCIsIC0xMywgMF0sXG4gICAgICBcInN0b25lXCI6IFtcImJsb2Nrc1wiLCBcIlN0b25lXCIsIC0xMywgMF0sXG4gICAgICBcInRudFwiOiBbXCJ0bnRcIiwgXCJUTlRleHBsb3Npb24wXCIsIC04MCwgLTU4XSxcbiAgICAgIFwid2F0ZXJcIjogW1wiYmxvY2tzXCIsIFwiV2F0ZXJfMFwiLCAtMTMsIDBdLFxuICAgICAgXCJ3b29sXCI6IFtcImJsb2Nrc1wiLCBcIldvb2xfV2hpdGVcIiwgLTEzLCAwXSxcbiAgICAgIFwid29vbF9vcmFuZ2VcIjogW1wiYmxvY2tzXCIsIFwiV29vbF9PcmFuZ2VcIiwgLTEzLCAwXSxcblxuICAgICAgXCJsZWF2ZXNBY2FjaWFcIjogW1wibGVhdmVzQWNhY2lhXCIsIFwiTGVhdmVzMFwiLCAtNDIsIDgwXSxcbiAgICAgIFwibGVhdmVzQmlyY2hcIjogW1wibGVhdmVzQmlyY2hcIiwgXCJMZWF2ZXMwXCIsIC0xMDAsIC0xMF0sXG4gICAgICBcImxlYXZlc0p1bmdsZVwiOiBbXCJsZWF2ZXNKdW5nbGVcIiwgXCJMZWF2ZXMwXCIsIC02OSwgNDNdLFxuICAgICAgXCJsZWF2ZXNPYWtcIjogW1wibGVhdmVzT2FrXCIsIFwiTGVhdmVzMFwiLCAtMTAwLCAwXSxcbiAgICAgIFwibGVhdmVzU3BydWNlXCI6IFtcImxlYXZlc1NwcnVjZVwiLCBcIkxlYXZlczBcIiwgLTc2LCA2MF0sXG5cbiAgICAgIFwid2F0ZXJpbmdcIiA6IFtcImJsb2Nrc1wiLCBcIldhdGVyXzBcIiwgLTEzLCAwXSxcbiAgICAgIFwiY3JvcFdoZWF0XCI6IFtcImJsb2Nrc1wiLCBcIldoZWF0MFwiLCAtMTMsIDBdLFxuICAgICAgXCJ0b3JjaFwiOiBbXCJ0b3JjaFwiLCBcIlRvcmNoMFwiLCAtMTMsIDBdLFxuXG4gICAgICBcInRhbGxHcmFzc1wiOiBbXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgLTEzLCAwXSxcblxuICAgICAgXCJsYXZhUG9wXCI6IFtcImxhdmFQb3BcIiwgXCJMYXZhUG9wMDFcIiwgLTEzLCAwXSxcbiAgICAgIFwiZmlyZVwiOiBbXCJmaXJlXCIsIFwiXCIsIC0xMSwgMTM1XSxcbiAgICAgIFwiYnViYmxlc1wiOiBbXCJidWJibGVzXCIsIFwiXCIsIC0xMSwgMTM1XSxcbiAgICAgIFwiZXhwbG9zaW9uXCI6IFtcImV4cGxvc2lvblwiLCBcIlwiLCAtNzAsIDYwXSxcblxuICAgICAgXCJkb29yXCI6IFtcImRvb3JcIiwgXCJcIiwgLTEyLCAtMTVdLFxuXG4gICAgICBcInJhaWxzQm90dG9tTGVmdFwiOiAgICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX0JvdHRvbUxlZnRcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNCb3R0b21SaWdodFwiOiAgICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfQm90dG9tUmlnaHRcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNIb3Jpem9udGFsXCI6ICAgICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfSG9yaXpvbnRhbFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1RvcExlZnRcIjogICAgICAgICAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19Ub3BMZWZ0XCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzVG9wUmlnaHRcIjogICAgICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1RvcFJpZ2h0XCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzVW5wb3dlcmVkSG9yaXpvbnRhbFwiOltcImJsb2Nrc1wiLCBcIlJhaWxzX1VucG93ZXJlZEhvcml6b250YWxcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiOiAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfVW5wb3dlcmVkVmVydGljYWxcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNWZXJ0aWNhbFwiOiAgICAgICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfVmVydGljYWxcIiwgLTEzLCAtMF0sXG4gICAgICBcInJhaWxzUG93ZXJlZEhvcml6b250YWxcIjogIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1Bvd2VyZWRIb3Jpem9udGFsXCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzUG93ZXJlZFZlcnRpY2FsXCI6ICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1Bvd2VyZWRWZXJ0aWNhbFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1JlZHN0b25lVG9yY2hcIjogICAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19SZWRzdG9uZVRvcmNoXCIsIC0xMiwgOV0sXG4gICAgfTtcblxuICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3MgPSBbXTtcbiAgICB0aGlzLnRvRGVzdHJveSA9IFtdO1xuICAgIHRoaXMucmVzZXR0YWJsZVR3ZWVucyA9IFtdO1xuICB9XG5cbiAgeVRvSW5kZXgoeSkge1xuICAgIHJldHVybiB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC55VG9JbmRleCh5KTtcbiAgfVxuXG4gIGNyZWF0ZShsZXZlbE1vZGVsKSB7XG4gICAgdGhpcy5jcmVhdGVQbGFuZXMoKTtcbiAgICB0aGlzLnJlc2V0KGxldmVsTW9kZWwpO1xuICB9XG5cbiAgcmVzZXQobGV2ZWxNb2RlbCkge1xuICAgIGxldCBwbGF5ZXIgPSBsZXZlbE1vZGVsLnBsYXllcjtcblxuICAgIHRoaXMucmVzZXR0YWJsZVR3ZWVucy5mb3JFYWNoKCh0d2VlbikgPT4ge1xuICAgICAgdHdlZW4uc3RvcChmYWxzZSk7XG4gICAgfSk7XG4gICAgdGhpcy5yZXNldHRhYmxlVHdlZW5zLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLnJlc2V0UGxhbmVzKGxldmVsTW9kZWwpO1xuICAgIHRoaXMucHJlcGFyZVBsYXllclNwcml0ZShwbGF5ZXIubmFtZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5zdG9wKCk7XG4gICAgdGhpcy51cGRhdGVTaGFkaW5nUGxhbmUobGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgIHRoaXMudXBkYXRlRm93UGxhbmUobGV2ZWxNb2RlbC5mb3dQbGFuZSk7XG4gICAgdGhpcy5zZXRQbGF5ZXJQb3NpdGlvbihwbGF5ZXIucG9zaXRpb25bMF0sIHBsYXllci5wb3NpdGlvblsxXSwgcGxheWVyLmlzT25CbG9jayk7XG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwbGF5ZXIucG9zaXRpb25bMF0sIHBsYXllci5wb3NpdGlvblsxXSk7XG4gICAgdGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IudmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5wbGF5SWRsZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2spO1xuXG4gICAgaWYgKHRoaXMuY29udHJvbGxlci5mb2xsb3dpbmdQbGF5ZXIoKSkge1xuICAgICAgdGhpcy5nYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCBsZXZlbE1vZGVsLnBsYW5lV2lkdGggKiA0MCwgbGV2ZWxNb2RlbC5wbGFuZUhlaWdodCAqIDQwKTtcbiAgICAgIHRoaXMuZ2FtZS5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyU3ByaXRlKTtcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5zY2FsZS54ID0gMTtcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5zY2FsZS55ID0gMTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b0Rlc3Ryb3kubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMudG9EZXN0cm95W2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy50b0Rlc3Ryb3kgPSBbXTtcblxuICAgIGlmICh0aGlzLnBsYXllckdob3N0KSB7XG4gICAgICB0aGlzLnBsYXllckdob3N0LmZyYW1lID0gdGhpcy5wbGF5ZXJTcHJpdGUuZnJhbWU7XG4gICAgICB0aGlzLnBsYXllckdob3N0LnogPSAxMDAwO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLmFjdGlvblBsYW5lLnNvcnQoJ3NvcnRPcmRlcicpO1xuICAgIHRoaXMuZmx1ZmZQbGFuZS5zb3J0KCd6Jyk7XG4gIH1cblxuICBnZXREaXJlY3Rpb25OYW1lKGZhY2luZykge1xuICAgIHZhciBkaXJlY3Rpb247XG5cbiAgICBzd2l0Y2ggKGZhY2luZykge1xuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uVXA6XG4gICAgICAgIGRpcmVjdGlvbiA9IFwiX3VwXCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5SaWdodDpcbiAgICAgICAgZGlyZWN0aW9uID0gXCJfcmlnaHRcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkRvd246XG4gICAgICAgIGRpcmVjdGlvbiA9IFwiX2Rvd25cIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkxlZnQ6XG4gICAgICAgIGRpcmVjdGlvbiA9IFwiX2xlZnRcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpcmVjdGlvbjtcbiAgfVxuXG4gIHVwZGF0ZVBsYXllckRpcmVjdGlvbihwb3NpdGlvbiwgZmFjaW5nKSB7XG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuXG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiICsgZGlyZWN0aW9uKTtcbiAgfVxuXG4gIHBsYXlQbGF5ZXJBbmltYXRpb24oYW5pbWF0aW9uTmFtZSwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKSB7XG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pICsgNTtcblxuICAgIGxldCBhbmltTmFtZSA9IGFuaW1hdGlvbk5hbWUgKyBkaXJlY3Rpb247XG4gICAgcmV0dXJuIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1OYW1lKTtcbiAgfVxuXG4gIHBsYXlJZGxlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaykge1xuICAgIHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImlkbGVcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKTtcbiAgfVxuXG4gIHNjYWxlU2hvd1dob2xlV29ybGQoY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgW3NjYWxlWCwgc2NhbGVZXSA9IHRoaXMuY29udHJvbGxlci5zY2FsZUZyb21PcmlnaW5hbCgpO1xuICAgIHZhciBzY2FsZVR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5nYW1lLndvcmxkLnNjYWxlKS50byh7XG4gICAgICB4OiAxIC8gc2NhbGVYLFxuICAgICAgeTogMSAvIHNjYWxlWVxuICAgIH0sIDEwMDAsIFBoYXNlci5FYXNpbmcuRXhwb25lbnRpYWwuT3V0KTtcblxuICAgIHRoaXMuZ2FtZS5jYW1lcmEudW5mb2xsb3coKTtcblxuICAgIHZhciBwb3NpdGlvblR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5nYW1lLmNhbWVyYSkudG8oe1xuICAgICAgeDogMCxcbiAgICAgIHk6IDBcbiAgICB9LCAxMDAwLCBQaGFzZXIuRWFzaW5nLkV4cG9uZW50aWFsLk91dCk7XG5cbiAgICBzY2FsZVR3ZWVuLm9uQ29tcGxldGUuYWRkT25jZSgoKSA9PiB7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuXG4gICAgcG9zaXRpb25Ud2Vlbi5zdGFydCgpO1xuICAgIHNjYWxlVHdlZW4uc3RhcnQoKTtcbiAgfVxuXG4gIHBsYXlTdWNjZXNzQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSgyNTAsICgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN1Y2Nlc3NcIik7XG4gICAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImNlbGVicmF0ZVwiLCBwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spLCAoKSA9PiB7XG4gICAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlGYWlsdXJlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSg1MDAsICgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImZhaWx1cmVcIik7XG4gICAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImZhaWxcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSg4MDAsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcGxheUJ1bXBBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKSB7XG4gICAgdmFyIGFuaW1hdGlvbiA9IHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImJ1bXBcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKTtcbiAgICBhbmltYXRpb24ub25Db21wbGV0ZS5hZGQoKCk9PntcbiAgICAgIHRoaXMucGxheUlkbGVBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xuICB9XG5cbiAgcGxheURyb3duRmFpbHVyZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgICB2YXIgc3ByaXRlLFxuICAgICAgICAgIHR3ZWVuO1xuXG4gICAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJmYWlsXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gICAgICB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZmx1ZmZQbGFuZSwgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBcImJ1YmJsZXNcIik7XG5cbiAgICAgIHNwcml0ZSA9IHRoaXMuZmx1ZmZQbGFuZS5jcmVhdGUoMCwgMCwgXCJmaW5pc2hPdmVybGF5XCIpO1xuICAgICAgdmFyIFtzY2FsZVgsIHNjYWxlWV0gPSB0aGlzLmNvbnRyb2xsZXIuc2NhbGVGcm9tT3JpZ2luYWwoKTtcbiAgICAgIHNwcml0ZS5zY2FsZS54ID0gc2NhbGVYO1xuICAgICAgc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVk7XG4gICAgICBzcHJpdGUuYWxwaGEgPSAwO1xuICAgICAgaWYgKHRoaXMuY29udHJvbGxlci5jYW5Vc2VUaW50cygpKSB7XG4gICAgICAgIHNwcml0ZS50aW50ID0gMHgzMjRiZmY7XG4gICAgICB9XG5cbiAgICAgIHR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4oc3ByaXRlKS50byh7XG4gICAgICAgICAgYWxwaGE6IDAuNSxcbiAgICAgIH0sIDIwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG5cbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgICAgfSk7XG5cbiAgICAgIHR3ZWVuLnN0YXJ0KCk7XG4gIH1cblxuICBwbGF5QnVybkluTGF2YUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHNwcml0ZSxcbiAgICAgICAgdHdlZW47XG5cbiAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJqdW1wVXBcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKTtcbiAgICB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZmx1ZmZQbGFuZSwgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBcImZpcmVcIik7XG5cbiAgICBzcHJpdGUgPSB0aGlzLmZsdWZmUGxhbmUuY3JlYXRlKDAsIDAsIFwiZmluaXNoT3ZlcmxheVwiKTtcbiAgICB2YXIgW3NjYWxlWCwgc2NhbGVZXSA9IHRoaXMuY29udHJvbGxlci5zY2FsZUZyb21PcmlnaW5hbCgpO1xuICAgIHNwcml0ZS5zY2FsZS54ID0gc2NhbGVYO1xuICAgIHNwcml0ZS5zY2FsZS55ID0gc2NhbGVZO1xuICAgIHNwcml0ZS5hbHBoYSA9IDA7XG4gICAgaWYgKHRoaXMuY29udHJvbGxlci5jYW5Vc2VUaW50cygpKSB7XG4gICAgICBzcHJpdGUudGludCA9IDB4ZDE1ODBkO1xuICAgIH1cblxuICAgIHR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4oc3ByaXRlKS50byh7XG4gICAgICBhbHBoYTogMC41LFxuICAgIH0sIDIwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG5cbiAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuXG4gICAgdHdlZW4uc3RhcnQoKTtcbiAgfVxuXG4gIHBsYXlEZXN0cm95VG50QW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgdG50QXJyYXkgLCBuZXdTaGFkaW5nUGxhbmVEYXRhLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBibG9jayxcbiAgICAgICAgbGFzdEFuaW1hdGlvbjtcbiAgICBpZiAodG50QXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImZ1c2VcIik7XG4gICAgZm9yKHZhciB0bnQgaW4gdG50QXJyYXkpIHtcbiAgICAgICAgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW3RoaXMuY29vcmRpbmF0ZXNUb0luZGV4KHRudEFycmF5W3RudF0pXTtcbiAgICAgICAgbGFzdEFuaW1hdGlvbiA9IHRoaXMucGxheVNjYWxlZFNwZWVkKGJsb2NrLmFuaW1hdGlvbnMsIFwiZXhwbG9kZVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKGxhc3RBbmltYXRpb24sICgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImV4cGxvZGVcIik7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuICB9XG5cblxuICBwbGF5Q3JlZXBlckV4cGxvZGVBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoMTgwLCAoKSA9PiB7XG4gICAgICAvL3RoaXMub25BbmltYXRpb25Mb29wT25jZShcbiAgICAgIHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImJ1bXBcIiwgcG9zaXRpb24sIGZhY2luZywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgLy9hZGQgY3JlZXBlciB3aW5kdXAgc291bmRcbiAgICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZnVzZVwiKTtcbiAgICAgICAgdGhpcy5wbGF5RXhwbG9kaW5nQ3JlZXBlckFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuY29udHJvbGxlci5kZWxheUJ5KDIwMCwgKCk9PntcbiAgICAgICAgICB0aGlzLm9uQW5pbWF0aW9uTG9vcE9uY2UodGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwianVtcFVwXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5SWRsZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcGxheUV4cGxvZGluZ0NyZWVwZXJBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuXG4gICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pKSArIGRlc3Ryb3lQb3NpdGlvblswXTtcbiAgICBsZXQgYmxvY2tUb0V4cGxvZGUgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdO1xuXG4gICAgdmFyIGNyZWVwZXJFeHBsb2RlQW5pbWF0aW9uID0gYmxvY2tUb0V4cGxvZGUuYW5pbWF0aW9ucy5nZXRBbmltYXRpb24oXCJleHBsb2RlXCIpO1xuICAgIGNyZWVwZXJFeHBsb2RlQW5pbWF0aW9uLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHZhciBib3JkZXJpbmdQb3NpdGlvbnM7XG4gICAgICBibG9ja1RvRXhwbG9kZS5raWxsKCk7XG4gICAgICB0aGlzLnBsYXlFeHBsb3Npb25BbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBpc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoMTAwLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbGF5RmFpbHVyZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImV4cGxvZGVcIik7XG4gICAgICB0aGlzLnBsYXlFeHBsb3Npb25DbG91ZEFuaW1hdGlvbihkZXN0cm95UG9zaXRpb24pO1xuICAgIH0pO1xuXG4gICAgY3JlZXBlckV4cGxvZGVBbmltYXRpb24ucGxheSgpO1xuICB9XG5cbiAgcGxheUV4cGxvc2lvbkNsb3VkQW5pbWF0aW9uKHBvc2l0aW9uKXtcbiAgICB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZmx1ZmZQbGFuZSwgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBcImV4cGxvc2lvblwiKTtcbiAgfVxuXG5cbiAgY29vcmRpbmF0ZXNUb0luZGV4KGNvb3JkaW5hdGVzKSB7XG4gICAgcmV0dXJuICh0aGlzLnlUb0luZGV4KGNvb3JkaW5hdGVzWzFdKSkgKyBjb29yZGluYXRlc1swXTtcbiAgfVxuXG4gIHBsYXlNaW5lY2FydFR1cm5BbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgdHVybkRpcmVjdGlvbikge1xuICAgIHZhciBhbmltYXRpb24gPSB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJtaW5lQ2FydF90dXJuXCIgKyB0dXJuRGlyZWN0aW9uLCBwb3NpdGlvbiwgRmFjaW5nRGlyZWN0aW9uLkRvd24sIGZhbHNlKTtcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xuICB9XG5cbiAgcGxheU1pbmVjYXJ0TW92ZUZvcndhcmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbmV4dFBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBhbmltYXRpb24sXG4gICAgICAgIHR3ZWVuO1xuXG4gICAgLy9pZiB3ZSBsb29wIHRoZSBzZnggdGhhdCBtaWdodCBiZSBiZXR0ZXI/XG4gICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwibWluZWNhcnRcIik7XG4gICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwibWluZUNhcnRcIixwb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSk7XG4gICAgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2Vlbih0aGlzLnBsYXllclNwcml0ZSkudG8oe1xuICAgICAgeDogKC0xOCArIDQwICogbmV4dFBvc2l0aW9uWzBdKSxcbiAgICAgIHk6ICgtMzIgKyA0MCAqIG5leHRQb3NpdGlvblsxXSksXG4gICAgfSwgc3BlZWQsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuICAgIHR3ZWVuLnN0YXJ0KCk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChuZXh0UG9zaXRpb25bMV0pICsgNTtcblxuICAgIHJldHVybiB0d2VlbjtcbiAgfVxuXG5cbiAgYWN0aXZhdGVVbnBvd2VyZWRSYWlscyh1bnBvd2VyZWRSYWlscykge1xuICAgIGZvcih2YXIgcmFpbEluZGV4ID0gMDsgcmFpbEluZGV4IDwgdW5wb3dlcmVkUmFpbHMubGVuZ3RoOyByYWlsSW5kZXggKz0gMikge1xuICAgICAgdmFyIHJhaWwgPSB1bnBvd2VyZWRSYWlsc1tyYWlsSW5kZXggKyAxXTtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHVucG93ZXJlZFJhaWxzW3JhaWxJbmRleF07XG4gICAgICB0aGlzLmNyZWF0ZUFjdGlvblBsYW5lQmxvY2socG9zaXRpb24sIHJhaWwpO1xuICAgIH1cbiAgfVxuXG5cblxuICBwbGF5TWluZWNhcnRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbWluZWNhcnRUcmFjaywgdW5wb3dlcmVkUmFpbHMpXG4gIHtcbiAgICB2YXIgYW5pbWF0aW9uO1xuICAgIHRoaXMudHJhY2sgPSBtaW5lY2FydFRyYWNrO1xuICAgIHRoaXMuaSA9IDA7XG5cbiAgICAvL3N0YXJ0IGF0IDMsMlxuICAgIHRoaXMuc2V0UGxheWVyUG9zaXRpb24oMywyLCBpc09uQmxvY2spO1xuICAgIHBvc2l0aW9uID0gWzMsMl07XG5cbiAgICBhbmltYXRpb24gPSB0aGlzLnBsYXlMZXZlbEVuZEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBmYWxzZSk7XG5cbiAgICBhbmltYXRpb24ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hY3RpdmF0ZVVucG93ZXJlZFJhaWxzKHVucG93ZXJlZFJhaWxzKTtcbiAgICAgIHRoaXMucGxheVRyYWNrKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG1pbmVjYXJ0VHJhY2spO1xuICAgIH0pO1xuICB9XG5cbiAgcGxheVRyYWNrKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG1pbmVjYXJ0VHJhY2spXG4gIHtcbiAgICBpZih0aGlzLmkgPCB0aGlzLnRyYWNrLmxlbmd0aCkge1xuICAgICAgdmFyIGRpcmVjdGlvbixcbiAgICAgICAgICBhcnJheWRpcmVjdGlvbiA9IHRoaXMudHJhY2tbdGhpcy5pXVswXSxcbiAgICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLnRyYWNrW3RoaXMuaV1bMV0sXG4gICAgICAgICAgc3BlZWQgPSB0aGlzLnRyYWNrW3RoaXMuaV1bM107XG4gICAgICBmYWNpbmcgPSB0aGlzLnRyYWNrW3RoaXMuaV1bMl07XG5cbiAgICAgIC8vdHVyblxuICAgICAgaWYoYXJyYXlkaXJlY3Rpb24uc3Vic3RyaW5nKDAsNCkgPT09IFwidHVyblwiKSB7XG4gICAgICAgIGRpcmVjdGlvbiA9IGFycmF5ZGlyZWN0aW9uLnN1YnN0cmluZyg1KTtcbiAgICAgICAgdGhpcy5wbGF5TWluZWNhcnRUdXJuQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIGRpcmVjdGlvbikub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGxheU1pbmVjYXJ0TW92ZUZvcndhcmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbmV4dFBvc2l0aW9uLCBzcGVlZCkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgICAgcG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgICAgICAgICB0aGlzLnBsYXlUcmFjayhwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBtaW5lY2FydFRyYWNrKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5wbGF5TWluZWNhcnRNb3ZlRm9yd2FyZEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBuZXh0UG9zaXRpb24sIHNwZWVkKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbGF5VHJhY2socG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbWluZWNhcnRUcmFjayk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5pKys7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICB0aGlzLnBsYXlTdWNjZXNzQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgZnVuY3Rpb24oKXt9KTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfVxuICB9XG5cbiAgYWRkSG91c2VCZWQoYm90dG9tQ29vcmRpbmF0ZXMpIHtcbiAgICAvL1RlbXBvcmFyeSwgd2lsbCBiZSByZXBsYWNlZCBieSBiZWQgYmxvY2tzXG4gICAgdmFyIGJlZFRvcENvb3JkaW5hdGUgPSAoYm90dG9tQ29vcmRpbmF0ZXNbMV0gLSAxKTtcbiAgICB2YXIgc3ByaXRlID0gdGhpcy5hY3Rpb25QbGFuZS5jcmVhdGUoMzggKiBib3R0b21Db29yZGluYXRlc1swXSwgMzUgKiBiZWRUb3BDb29yZGluYXRlLCBcImJlZFwiKTtcbiAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChib3R0b21Db29yZGluYXRlc1sxXSk7XG4gIH1cblxuICBhZGREb29yKGNvb3JkaW5hdGVzKSB7XG4gICAgdmFyIHNwcml0ZTtcbiAgICBsZXQgdG9EZXN0cm95ID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1t0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChjb29yZGluYXRlcyldO1xuICAgIHRoaXMuY3JlYXRlQWN0aW9uUGxhbmVCbG9jayhjb29yZGluYXRlcywgXCJkb29yXCIpO1xuICAgIC8vTmVlZCB0byBncmFiIHRoZSBjb3JyZWN0IGJsb2NrdHlwZSBmcm9tIHRoZSBhY3Rpb24gbGF5ZXJcbiAgICAvL0FuZCB1c2UgdGhhdCB0eXBlIGJsb2NrIHRvIGNyZWF0ZSB0aGUgZ3JvdW5kIGJsb2NrIHVuZGVyIHRoZSBkb29yXG4gICAgc3ByaXRlID0gdGhpcy5jcmVhdGVCbG9jayh0aGlzLmdyb3VuZFBsYW5lLCBjb29yZGluYXRlc1swXSwgY29vcmRpbmF0ZXNbMV0sIFwid29vbF9vcmFuZ2VcIik7XG4gICAgdG9EZXN0cm95LmtpbGwoKTtcbiAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleCg2KTtcbiAgfVxuXG4gIHBsYXlTdWNjZXNzSG91c2VCdWlsdEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNyZWF0ZUZsb29yLCBob3VzZU9iamVjdFBvc2l0aW9ucywgY29tcGxldGlvbkhhbmRsZXIsIHVwZGF0ZVNjcmVlbikge1xuICAgIC8vZmFkZSBzY3JlZW4gdG8gd2hpdGVcbiAgICAvL0FkZCBob3VzZSBibG9ja3NcbiAgICAvL2ZhZGUgb3V0IG9mIHdoaXRlXG4gICAgLy9QbGF5IHN1Y2Nlc3MgYW5pbWF0aW9uIG9uIHBsYXllci5cbiAgICB2YXIgdHdlZW5Ub1csXG4gICAgICAgIHR3ZWVuV1RvQztcblxuICAgIHR3ZWVuVG9XID0gdGhpcy5wbGF5TGV2ZWxFbmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSg0MDAwLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgfSwgdHJ1ZSk7XG4gICAgdHdlZW5Ub1cub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiaG91c2VTdWNjZXNzXCIpO1xuICAgICAgLy9DaGFuZ2UgaG91c2UgZ3JvdW5kIHRvIGZsb29yXG4gICAgICB2YXIgeENvb3JkO1xuICAgICAgdmFyIHlDb29yZDtcbiAgICAgIHZhciBzcHJpdGU7XG5cbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjcmVhdGVGbG9vci5sZW5ndGg7ICsraSkge1xuICAgICAgICB4Q29vcmQgPSBjcmVhdGVGbG9vcltpXVsxXTtcbiAgICAgICAgeUNvb3JkID0gY3JlYXRlRmxvb3JbaV1bMl07XG4gICAgICAgIC8qdGhpcy5ncm91bmRQbGFuZVt0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChbeENvb3JkLHlDb29yZF0pXS5raWxsKCk7Ki9cbiAgICAgICAgc3ByaXRlID0gdGhpcy5jcmVhdGVCbG9jayh0aGlzLmdyb3VuZFBsYW5lLCB4Q29vcmQsIHlDb29yZCwgXCJ3b29sX29yYW5nZVwiKTtcbiAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoeUNvb3JkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGRIb3VzZUJlZChob3VzZU9iamVjdFBvc2l0aW9uc1swXSk7XG4gICAgICB0aGlzLmFkZERvb3IoaG91c2VPYmplY3RQb3NpdGlvbnNbMV0pO1xuICAgICAgdGhpcy5ncm91bmRQbGFuZS5zb3J0KCdzb3J0T3JkZXInKTtcbiAgICAgIHVwZGF0ZVNjcmVlbigpO1xuICAgIH0pO1xuICB9XG5cbiAgLy9Ud2VlbnMgaW4gYW5kIHRoZW4gb3V0IG9mIHdoaXRlLiByZXR1cm5zIHRoZSB0d2VlbiB0byB3aGl0ZSBmb3IgYWRkaW5nIGNhbGxiYWNrc1xuICBwbGF5TGV2ZWxFbmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgcGxheVN1Y2Nlc3NBbmltYXRpb24pIHtcbiAgICB2YXIgc3ByaXRlLFxuICAgICAgICB0d2VlblRvVyxcbiAgICAgICAgdHdlZW5XVG9DO1xuXG4gICAgc3ByaXRlID0gdGhpcy5mbHVmZlBsYW5lLmNyZWF0ZSgwLCAwLCBcImZpbmlzaE92ZXJsYXlcIik7XG4gICAgdmFyIFtzY2FsZVgsIHNjYWxlWV0gPSB0aGlzLmNvbnRyb2xsZXIuc2NhbGVGcm9tT3JpZ2luYWwoKTtcbiAgICBzcHJpdGUuc2NhbGUueCA9IHNjYWxlWDtcbiAgICBzcHJpdGUuc2NhbGUueSA9IHNjYWxlWTtcbiAgICBzcHJpdGUuYWxwaGEgPSAwO1xuXG4gICAgdHdlZW5Ub1cgPSB0aGlzLnR3ZWVuVG9XaGl0ZShzcHJpdGUpO1xuICAgIHR3ZWVuV1RvQyA9IHRoaXMudHdlZW5Gcm9tV2hpdGVUb0NsZWFyKHNwcml0ZSk7XG5cbiAgICB0d2VlblRvVy5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvci52aXNpYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLnNldFBsYXllclBvc2l0aW9uKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgaXNPbkJsb2NrKTtcbiAgICAgIHR3ZWVuV1RvQy5zdGFydCgpO1xuICAgIH0pO1xuICAgIGlmKHBsYXlTdWNjZXNzQW5pbWF0aW9uKVxuICAgIHtcbiAgICAgIHR3ZWVuV1RvQy5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgIHRoaXMucGxheVN1Y2Nlc3NBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdHdlZW5Ub1cuc3RhcnQoKTtcblxuICAgIHJldHVybiB0d2VlblRvVztcbiAgfVxuICB0d2VlbkZyb21XaGl0ZVRvQ2xlYXIoc3ByaXRlKSB7XG4gICAgdmFyIHR3ZWVuV2hpdGVUb0NsZWFyO1xuXG4gICAgdHdlZW5XaGl0ZVRvQ2xlYXIgPSB0aGlzLmFkZFJlc2V0dGFibGVUd2VlbihzcHJpdGUpLnRvKHtcbiAgICAgIGFscGhhOiAwLjAsXG4gICAgfSwgNzAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcbiAgICByZXR1cm4gdHdlZW5XaGl0ZVRvQ2xlYXI7XG4gIH1cblxuICB0d2VlblRvV2hpdGUoc3ByaXRlKXtcbiAgICB2YXIgdHdlZW5Ub1doaXRlO1xuXG4gICAgdHdlZW5Ub1doaXRlID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4oc3ByaXRlKS50byh7XG4gICAgICBhbHBoYTogMS4wLFxuICAgIH0sIDMwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG4gICAgcmV0dXJuIHR3ZWVuVG9XaGl0ZTtcbiAgfVxuXG4gIHBsYXlCbG9ja1NvdW5kKGdyb3VuZFR5cGUpIHtcbiAgICB2YXIgb3JlU3RyaW5nID0gZ3JvdW5kVHlwZS5zdWJzdHJpbmcoMCwgMyk7XG4gICAgaWYoZ3JvdW5kVHlwZSA9PT0gXCJzdG9uZVwiIHx8IGdyb3VuZFR5cGUgPT09IFwiY29iYmxlc3RvbmVcIiB8fCBncm91bmRUeXBlID09PSBcImJlZHJvY2tcIiB8fFxuICAgICAgICBvcmVTdHJpbmcgPT09IFwib3JlXCIgfHwgZ3JvdW5kVHlwZSA9PT0gXCJicmlja3NcIikge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwic3RlcFN0b25lXCIpO1xuICAgIH1cbiAgICBlbHNlIGlmKGdyb3VuZFR5cGUgPT09IFwiZ3Jhc3NcIiB8fCBncm91bmRUeXBlID09PSBcImRpcnRcIiB8fCBncm91bmRUeXBlID09PSBcImRpcnRDb2Fyc2VcIiB8fFxuICAgICAgICBncm91bmRUeXBlID09IFwid29vbF9vcmFuZ2VcIiB8fCBncm91bmRUeXBlID09IFwid29vbFwiKSB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdGVwR3Jhc3NcIik7XG4gICAgfVxuICAgIGVsc2UgaWYoZ3JvdW5kVHlwZSA9PT0gXCJncmF2ZWxcIikge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwic3RlcEdyYXZlbFwiKTtcbiAgICB9XG4gICAgZWxzZSBpZihncm91bmRUeXBlID09PSBcImZhcm1sYW5kV2V0XCIpIHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN0ZXBGYXJtbGFuZFwiKTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN0ZXBXb29kXCIpO1xuICAgIH1cbiAgfVxuXG4gIHBsYXlNb3ZlRm9yd2FyZEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBzaG91bGRKdW1wRG93biwgaXNPbkJsb2NrLCBncm91bmRUeXBlLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciB0d2VlbixcbiAgICAgICAgb2xkUG9zaXRpb24sXG4gICAgICAgIG5ld1Bvc1ZlYyxcbiAgICAgICAgYW5pbU5hbWUsXG4gICAgICAgIHlPZmZzZXQgPSAtMzI7XG5cbiAgICAvL3N0ZXBwaW5nIG9uIHN0b25lIHNmeFxuICAgIHRoaXMucGxheUJsb2NrU291bmQoZ3JvdW5kVHlwZSk7XG5cbiAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG5cbiAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gICAgLy9tYWtlIHN1cmUgdG8gcmVuZGVyIGhpZ2ggZm9yIHdoZW4gbW92aW5nIHVwIGFmdGVyIHBsYWNpbmcgYSBibG9ja1xuICAgIHZhciB6T3JkZXJZSW5kZXggPSBwb3NpdGlvblsxXSArIChmYWNpbmcgPT09IEZhY2luZ0RpcmVjdGlvbi5VcCA/IDEgOiAwKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHpPcmRlcllJbmRleCkgKyA1O1xuICAgIG9sZFBvc2l0aW9uID0gW01hdGgudHJ1bmMoKHRoaXMucGxheWVyU3ByaXRlLnBvc2l0aW9uLnggKyAxOCkvIDQwKSwgTWF0aC5jZWlsKCh0aGlzLnBsYXllclNwcml0ZS5wb3NpdGlvbi55KyAzMikgLyA0MCldO1xuICAgIG5ld1Bvc1ZlYyA9IFtwb3NpdGlvblswXSAtIG9sZFBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSAtIG9sZFBvc2l0aW9uWzFdXTtcblxuICAgIC8vY2hhbmdlIG9mZnNldCBmb3IgbW92aW5nIG9uIHRvcCBvZiBibG9ja3NcbiAgICBpZihpc09uQmxvY2spIHtcbiAgICAgIHlPZmZzZXQgLT0gMjI7XG4gICAgfVxuXG4gICAgaWYgKCFzaG91bGRKdW1wRG93bikge1xuICAgICAgYW5pbU5hbWUgPSBcIndhbGtcIiArIGRpcmVjdGlvbjtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1OYW1lKTtcbiAgICAgIHR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5wbGF5ZXJTcHJpdGUpLnRvKHtcbiAgICAgICAgeDogKC0xOCArIDQwICogcG9zaXRpb25bMF0pLFxuICAgICAgICB5OiAoeU9mZnNldCArIDQwICogcG9zaXRpb25bMV0pXG4gICAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbmltTmFtZSA9IFwianVtcERvd25cIiArIGRpcmVjdGlvbjtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1OYW1lKTtcbiAgICAgIHR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5wbGF5ZXJTcHJpdGUpLnRvKHtcbiAgICAgICAgeDogWy0xOCArIDQwICogb2xkUG9zaXRpb25bMF0sIC0xOCArIDQwICogKG9sZFBvc2l0aW9uWzBdICsgbmV3UG9zVmVjWzBdKSwgLTE4ICsgNDAgKiBwb3NpdGlvblswXV0sXG4gICAgICAgIHk6IFstMzIgKyA0MCAqIG9sZFBvc2l0aW9uWzFdLCAtMzIgKyA0MCAqIChvbGRQb3NpdGlvblsxXSArIG5ld1Bvc1ZlY1sxXSkgLSA1MCwgLTMyICsgNDAgKiBwb3NpdGlvblsxXV1cbiAgICAgIH0sIDMwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSkuaW50ZXJwb2xhdGlvbigodixrKSA9PiB7XG4gICAgICAgIHJldHVybiBQaGFzZXIuTWF0aC5iZXppZXJJbnRlcnBvbGF0aW9uKHYsayk7XG4gICAgICB9KTtcblxuICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJmYWxsXCIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcblxuICAgIHR3ZWVuLnN0YXJ0KCk7XG5cbiAgICByZXR1cm4gdHdlZW47XG4gIH1cblxuICBwbGF5UGxheWVySnVtcERvd25WZXJ0aWNhbEFuaW1hdGlvbihwb3NpdGlvbiwgZGlyZWN0aW9uKSB7XG4gICAgdmFyIGFuaW1OYW1lID0gXCJqdW1wRG93blwiICsgdGhpcy5nZXREaXJlY3Rpb25OYW1lKGRpcmVjdGlvbik7XG4gICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgYW5pbU5hbWUpO1xuICAgIHZhciB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMucGxheWVyU3ByaXRlKS50byh7XG4gICAgICB4OiBbLTE4ICsgNDAgKiBwb3NpdGlvblswXSwgLTE4ICsgNDAgKiBwb3NpdGlvblswXSwgLTE4ICsgNDAgKiBwb3NpdGlvblswXV0sXG4gICAgICB5OiBbLTMyICsgNDAgKiBwb3NpdGlvblsxXSwgLTMyICsgNDAgKiBwb3NpdGlvblsxXSAtIDUwLCAtMzIgKyA0MCAqIHBvc2l0aW9uWzFdXVxuICAgIH0sIDMwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSkuaW50ZXJwb2xhdGlvbigodixrKSA9PiB7XG4gICAgICByZXR1cm4gUGhhc2VyLk1hdGguYmV6aWVySW50ZXJwb2xhdGlvbih2LGspO1xuICAgIH0pO1xuICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkT25jZSgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJmYWxsXCIpO1xuICAgIH0pO1xuICAgIHR3ZWVuLnN0YXJ0KCk7XG4gIH1cblxuICBwbGF5UGxhY2VCbG9ja0FuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBibG9ja1R5cGUsIGJsb2NrVHlwZUF0UG9zaXRpb24sIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIGp1bXBBbmltTmFtZTtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pICsgcG9zaXRpb25bMF07XG5cbiAgICBpZiAoYmxvY2tUeXBlID09PSBcImNyb3BXaGVhdFwiIHx8IGJsb2NrVHlwZSA9PT0gXCJ0b3JjaFwiIHx8IGJsb2NrVHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09IFwicmFpbHNcIikge1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuXG4gICAgICB2YXIgc2lnbmFsRGV0YWNoZXIgPSB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJwdW5jaFwiLCBwb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgc3ByaXRlO1xuICAgICAgICBzaWduYWxEZXRhY2hlci5kZXRhY2goKTtcbiAgICAgICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleChwb3NpdGlvblsxXSkpICsgcG9zaXRpb25bMF07XG4gICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5hY3Rpb25QbGFuZSwgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBibG9ja1R5cGUpO1xuXG4gICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChwb3NpdGlvblsxXSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdID0gc3ByaXRlO1xuICAgICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInBsYWNlQmxvY2tcIik7XG5cbiAgICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcblxuICAgICAganVtcEFuaW1OYW1lID0gXCJqdW1wVXBcIiArIGRpcmVjdGlvbjtcblxuICAgICAgaWYoYmxvY2tUeXBlQXRQb3NpdGlvbiAhPT0gXCJcIikge1xuICAgICAgICB0aGlzLnBsYXlFeHBsb3Npb25BbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgcG9zaXRpb24sIGJsb2NrVHlwZUF0UG9zaXRpb24sICgoKT0+e30pLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGp1bXBBbmltTmFtZSk7XG4gICAgICB2YXIgcGxhY2VtZW50VHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2Vlbih0aGlzLnBsYXllclNwcml0ZSkudG8oe1xuICAgICAgICB5OiAoLTU1ICsgNDAgKiBwb3NpdGlvblsxXSlcbiAgICAgIH0sIDEyNSwgUGhhc2VyLkVhc2luZy5DdWJpYy5FYXNlT3V0KTtcblxuICAgICAgcGxhY2VtZW50VHdlZW4ub25Db21wbGV0ZS5hZGRPbmNlKCgpID0+IHtcbiAgICAgICAgcGxhY2VtZW50VHdlZW4gPSBudWxsO1xuXG4gICAgICAgIGlmIChibG9ja1R5cGVBdFBvc2l0aW9uICE9PSBcIlwiKSB7XG4gICAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XS5raWxsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5hY3Rpb25QbGFuZSwgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBibG9ja1R5cGUpO1xuXG4gICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChwb3NpdGlvblsxXSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdID0gc3ByaXRlO1xuICAgICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgICAgfSk7XG4gICAgICBwbGFjZW1lbnRUd2Vlbi5zdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIHBsYXlQbGFjZUJsb2NrSW5Gcm9udEFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBibG9ja1Bvc2l0aW9uLCBwbGFuZSwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24oYmxvY2tQb3NpdGlvblswXSwgYmxvY2tQb3NpdGlvblsxXSk7XG5cbiAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJwdW5jaFwiLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSkub25Db21wbGV0ZS5hZGRPbmNlKCgpID0+IHtcbiAgICAgIGlmIChwbGFuZSA9PT0gdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwuYWN0aW9uUGxhbmUpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVBY3Rpb25QbGFuZUJsb2NrKGJsb2NrUG9zaXRpb24sIGJsb2NrVHlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZS1sYXkgZ3JvdW5kIHRpbGVzIGJhc2VkIG9uIG1vZGVsXG4gICAgICAgIHRoaXMucmVmcmVzaEdyb3VuZFBsYW5lKCk7XG4gICAgICB9XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgY3JlYXRlQWN0aW9uUGxhbmVCbG9jayhwb3NpdGlvbiwgYmxvY2tUeXBlKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleChwb3NpdGlvblsxXSkpICsgcG9zaXRpb25bMF07XG4gICAgdmFyIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5hY3Rpb25QbGFuZSwgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBibG9ja1R5cGUpO1xuXG4gICAgaWYgKHNwcml0ZSkge1xuICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF0gPSBzcHJpdGU7XG4gIH1cblxuICBwbGF5U2hlYXJBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyBkZXN0cm95UG9zaXRpb25bMF07XG4gICAgbGV0IGJsb2NrVG9TaGVhciA9IHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF07XG5cbiAgICBibG9ja1RvU2hlYXIuYW5pbWF0aW9ucy5zdG9wKG51bGwsIHRydWUpO1xuICAgIHRoaXMub25BbmltYXRpb25Mb29wT25jZSh0aGlzLnBsYXlTY2FsZWRTcGVlZChibG9ja1RvU2hlYXIuYW5pbWF0aW9ucywgXCJ1c2VkXCIpLCAoKSA9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChibG9ja1RvU2hlYXIuYW5pbWF0aW9ucywgXCJmYWNlXCIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlciwgdHJ1ZSk7XG4gIH1cblxuICBwbGF5U2hlYXJTaGVlcEFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihkZXN0cm95UG9zaXRpb25bMF0sIGRlc3Ryb3lQb3NpdGlvblsxXSk7XG5cbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcInB1bmNoXCIsIHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKSwgKCkgPT4ge1xuICAgICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pKSArIGRlc3Ryb3lQb3NpdGlvblswXTtcbiAgICAgIGxldCBibG9ja1RvU2hlYXIgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdO1xuXG4gICAgICBibG9ja1RvU2hlYXIuYW5pbWF0aW9ucy5zdG9wKG51bGwsIHRydWUpO1xuICAgICAgdGhpcy5vbkFuaW1hdGlvbkxvb3BPbmNlKHRoaXMucGxheVNjYWxlZFNwZWVkKGJsb2NrVG9TaGVhci5hbmltYXRpb25zLCBcInVzZWRcIiksICgpID0+IHtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMsIFwiZmFjZVwiKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnBsYXlFeHBsb3Npb25BbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyLCB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlEZXN0cm95QmxvY2tBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIG5ld1NoYWRpbmdQbGFuZURhdGEsIG5ld0Zvd1BsYW5lRGF0YSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKGRlc3Ryb3lQb3NpdGlvblswXSwgZGVzdHJveVBvc2l0aW9uWzFdKTtcblxuICAgIHZhciBwbGF5ZXJBbmltYXRpb24gPVxuICAgICAgICBibG9ja1R5cGUubWF0Y2goLyhvcmV8c3RvbmV8Y2xheXxicmlja3N8YmVkcm9jaykvKSA/IFwibWluZVwiIDogXCJwdW5jaERlc3Ryb3lcIjtcbiAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24ocGxheWVyQW5pbWF0aW9uLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5TWluaW5nUGFydGljbGVzQW5pbWF0aW9uKGZhY2luZywgZGVzdHJveVBvc2l0aW9uKTtcbiAgICB0aGlzLnBsYXlCbG9ja0Rlc3Ryb3lPdmVybGF5QW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBuZXdTaGFkaW5nUGxhbmVEYXRhLCBuZXdGb3dQbGFuZURhdGEsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgfVxuXG5cbiAgcGxheVB1bmNoRGVzdHJveUFpckFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5wbGF5UHVuY2hBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBcInB1bmNoRGVzdHJveVwiLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gIH1cblxuICBwbGF5UHVuY2hBaXJBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMucGxheVB1bmNoQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgXCJwdW5jaFwiLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gIH1cblxuICBwbGF5UHVuY2hBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBhbmltYXRpb25UeXBlLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24oZGVzdHJveVBvc2l0aW9uWzBdLCBkZXN0cm95UG9zaXRpb25bMV0pO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQodGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKGFuaW1hdGlvblR5cGUsIHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKSwgKCkgPT4ge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlCbG9ja0Rlc3Ryb3lPdmVybGF5QW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBuZXdTaGFkaW5nUGxhbmVEYXRhLCBuZXdGb3dQbGFuZURhdGEsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pKSArIGRlc3Ryb3lQb3NpdGlvblswXTtcbiAgICBsZXQgYmxvY2tUb0Rlc3Ryb3kgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdO1xuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcblxuICAgIGxldCBkZXN0cm95T3ZlcmxheSA9IHRoaXMuYWN0aW9uUGxhbmUuY3JlYXRlKC0xMiArIDQwICogZGVzdHJveVBvc2l0aW9uWzBdLCAtMjIgKyA0MCAqIGRlc3Ryb3lQb3NpdGlvblsxXSwgXCJkZXN0cm95T3ZlcmxheVwiLCBcImRlc3Ryb3kxXCIpO1xuICAgIGRlc3Ryb3lPdmVybGF5LnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSArIDI7XG4gICAgdGhpcy5vbkFuaW1hdGlvbkVuZChkZXN0cm95T3ZlcmxheS5hbmltYXRpb25zLmFkZChcImRlc3Ryb3lcIiwgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJkZXN0cm95XCIsIDEsIDEyLCBcIlwiLCAwKSwgMzAsIGZhbHNlKSwgKCkgPT5cbiAgICB7XG4gICAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdID0gbnVsbDtcblxuICAgICAgaWYgKGJsb2NrVG9EZXN0cm95Lmhhc093blByb3BlcnR5KFwib25CbG9ja0Rlc3Ryb3lcIikpIHtcbiAgICAgICAgYmxvY2tUb0Rlc3Ryb3kub25CbG9ja0Rlc3Ryb3koYmxvY2tUb0Rlc3Ryb3kpO1xuICAgICAgfVxuXG4gICAgICBibG9ja1RvRGVzdHJveS5raWxsKCk7XG4gICAgICBkZXN0cm95T3ZlcmxheS5raWxsKCk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGJsb2NrVG9EZXN0cm95KTtcbiAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goZGVzdHJveU92ZXJsYXkpO1xuICAgICAgdGhpcy51cGRhdGVTaGFkaW5nUGxhbmUobmV3U2hhZGluZ1BsYW5lRGF0YSk7XG4gICAgICB0aGlzLnVwZGF0ZUZvd1BsYW5lKG5ld0Zvd1BsYW5lRGF0YSk7XG5cbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocGxheWVyUG9zaXRpb25bMF0sIHBsYXllclBvc2l0aW9uWzFdKTtcblxuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KCdkaWdfd29vZDEnKTtcbiAgICAgIHRoaXMucGxheUV4cGxvc2lvbkFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoZGVzdHJveU92ZXJsYXkuYW5pbWF0aW9ucywgXCJkZXN0cm95XCIpO1xuICB9XG5cbiAgcGxheU1pbmluZ1BhcnRpY2xlc0FuaW1hdGlvbihmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbikge1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXNEYXRhID0gW1xuICAgICAgWzI0LCAtMTAwLCAtODBdLCAgIC8vIGxlZnRcbiAgICAgIFsxMiwgLTEyMCwgLTgwXSwgICAvLyBib3R0b21cbiAgICAgIFswLCAtNjAsIC04MF0sICAgLy8gcmlnaHRcbiAgICAgIFszNiwgLTgwLCAtNjBdLCAgIC8vIHRvcFxuICAgIF07XG5cbiAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG4gICAgbGV0IG1pbmluZ1BhcnRpY2xlc0luZGV4ID0gKGRpcmVjdGlvbiA9PT0gXCJfbGVmdFwiID8gMCA6IGRpcmVjdGlvbiA9PT0gXCJfYm90dG9tXCIgPyAxIDogZGlyZWN0aW9uID09PSBcIl9yaWdodFwiID8gMiA6IDMpO1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXNGaXJzdEZyYW1lID0gbWluaW5nUGFydGljbGVzRGF0YVttaW5pbmdQYXJ0aWNsZXNJbmRleF1bMF07XG4gICAgbGV0IG1pbmluZ1BhcnRpY2xlc09mZnNldFggPSBtaW5pbmdQYXJ0aWNsZXNEYXRhW21pbmluZ1BhcnRpY2xlc0luZGV4XVsxXTtcbiAgICBsZXQgbWluaW5nUGFydGljbGVzT2Zmc2V0WSA9IG1pbmluZ1BhcnRpY2xlc0RhdGFbbWluaW5nUGFydGljbGVzSW5kZXhdWzJdO1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXMgPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZShtaW5pbmdQYXJ0aWNsZXNPZmZzZXRYICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMF0sIG1pbmluZ1BhcnRpY2xlc09mZnNldFkgKyA0MCAqIGRlc3Ryb3lQb3NpdGlvblsxXSwgXCJtaW5pbmdQYXJ0aWNsZXNcIiwgXCJNaW5pbmdQYXJ0aWNsZXNcIiArIG1pbmluZ1BhcnRpY2xlc0ZpcnN0RnJhbWUpO1xuICAgIG1pbmluZ1BhcnRpY2xlcy5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyAyO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQobWluaW5nUGFydGljbGVzLmFuaW1hdGlvbnMuYWRkKFwibWluaW5nUGFydGljbGVzXCIsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluaW5nUGFydGljbGVzXCIsIG1pbmluZ1BhcnRpY2xlc0ZpcnN0RnJhbWUsIG1pbmluZ1BhcnRpY2xlc0ZpcnN0RnJhbWUgKyAxMSwgXCJcIiwgMCksIDMwLCBmYWxzZSksICgpID0+IHtcbiAgICAgIG1pbmluZ1BhcnRpY2xlcy5raWxsKCk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKG1pbmluZ1BhcnRpY2xlcyk7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQobWluaW5nUGFydGljbGVzLmFuaW1hdGlvbnMsIFwibWluaW5nUGFydGljbGVzXCIpO1xuICB9XG5cbiAgcGxheUV4cGxvc2lvbkFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIsIHBsYWNlQmxvY2spIHtcbiAgICB2YXIgc2lnbmFsQmluZGluZyxcbiAgICAgICAgZXhwbG9kZUFuaW0gPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZSgtMzYgKyA0MCAqIGRlc3Ryb3lQb3NpdGlvblswXSwgLTMwICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMV0sIFwiYmxvY2tFeHBsb2RlXCIsIFwiQmxvY2tCcmVha1BhcnRpY2xlMFwiKTtcblxuICAgIC8vZXhwbG9kZUFuaW0udGludCA9IDB4MzI0YmZmO1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuY2FuVXNlVGludHMoKSkge1xuICAgICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgICAgY2FzZSBcImxvZ0FjYWNpYVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweDZjNjU1YTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgICBjYXNlIFwibG9nQmlyY2hcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHhkYWQ2Y2M7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICAgIGNhc2UgXCJsb2dKdW5nbGVcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg2YTRmMzE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICAgIGNhc2UgXCJsb2dPYWtcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg2NzUyMzE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ0cmVlU3BydWNlXCI6XG4gICAgICAgIGNhc2UgXCJsb2dTcHJ1Y2VcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg0YjM5MjM7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcInBsYW5rc0FjYWNpYVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweGJhNjMzNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBsYW5rc0JpcmNoXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4ZDdjYjhkO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGxhbmtzSnVuZ2xlXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4Yjg4NzY0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGxhbmtzT2FrXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4YjQ5MDVhO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGxhbmtzU3BydWNlXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4ODA1ZTM2O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwic3RvbmVcIjpcbiAgICAgICAgY2FzZSBcIm9yZUNvYWxcIjpcbiAgICAgICAgY2FzZSBcIm9yZURpYW1vbmRcIjpcbiAgICAgICAgY2FzZSBcIm9yZUlyb25cIjpcbiAgICAgICAgY2FzZSBcIm9yZUdvbGRcIjpcbiAgICAgICAgY2FzZSBcIm9yZUVtZXJhbGRcIjpcbiAgICAgICAgY2FzZSBcIm9yZVJlZHN0b25lXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4QzZDNkM2O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZ3Jhc3NcIjpcbiAgICAgICAgY2FzZSBcImNyb3BXaGVhdFwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweDVkOGYyMztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImRpcnRcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg4YTVlMzM7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHBsb2RlQW5pbS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyAyO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQoZXhwbG9kZUFuaW0uYW5pbWF0aW9ucy5hZGQoXCJleHBsb2RlXCIsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQmxvY2tCcmVha1BhcnRpY2xlXCIsIDAsIDcsIFwiXCIsIDApLCAzMCwgZmFsc2UpLCAoKSA9PlxuICAgIHtcbiAgICAgIGV4cGxvZGVBbmltLmtpbGwoKTtcbiAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goZXhwbG9kZUFuaW0pO1xuXG4gICAgICBpZihwbGFjZUJsb2NrKVxuICAgICAge1xuICAgICAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJpZGxlXCIsIHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5wbGF5SXRlbURyb3BBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChleHBsb2RlQW5pbS5hbmltYXRpb25zLCBcImV4cGxvZGVcIik7XG4gICAgaWYoIXBsYWNlQmxvY2spXG4gICAge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9XG4gIH1cblxuICBwbGF5SXRlbURyb3BBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHNwcml0ZSA9IHRoaXMuY3JlYXRlTWluaUJsb2NrKGRlc3Ryb3lQb3NpdGlvblswXSwgZGVzdHJveVBvc2l0aW9uWzFdLCBibG9ja1R5cGUpO1xuICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyAyO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQodGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiYW5pbWF0ZVwiKSwgKCkgPT4ge1xuICAgICAgdGhpcy5wbGF5SXRlbUFjcXVpcmVBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIHNwcml0ZSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgcGxheVNjYWxlZFNwZWVkKGFuaW1hdGlvbk1hbmFnZXIsIG5hbWUpIHtcbiAgICB2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uTWFuYWdlci5nZXRBbmltYXRpb24obmFtZSk7XG4gICAgaWYgKCFhbmltYXRpb24ub3JpZ2luYWxGcHMpIHtcbiAgICAgIGFuaW1hdGlvbi5vcmlnaW5hbEZwcyA9IDEwMDAgLyBhbmltYXRpb24uZGVsYXk7XG4gICAgfVxuICAgIHJldHVybiBhbmltYXRpb25NYW5hZ2VyLnBsYXkobmFtZSwgdGhpcy5jb250cm9sbGVyLm9yaWdpbmFsRnBzVG9TY2FsZWQoYW5pbWF0aW9uLm9yaWdpbmFsRnBzKSk7XG4gIH1cblxuICBwbGF5SXRlbUFjcXVpcmVBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIHNwcml0ZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgdHdlZW47XG5cbiAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgeDogKC0xOCArIDQwICogcGxheWVyUG9zaXRpb25bMF0pLFxuICAgICAgeTogKC0zMiArIDQwICogcGxheWVyUG9zaXRpb25bMV0pXG4gICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcblxuICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImNvbGxlY3RlZEJsb2NrXCIpO1xuICAgICAgc3ByaXRlLmtpbGwoKTtcbiAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goc3ByaXRlKTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG5cbiAgICB0d2Vlbi5zdGFydCgpO1xuICB9XG5cbiAgc2V0UGxheWVyUG9zaXRpb24oeCwgeSwgaXNPbkJsb2NrKSB7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUueCA9IC0xOCArIDQwICogeDtcbiAgICB0aGlzLnBsYXllclNwcml0ZS55ID0gLTMyICsgKGlzT25CbG9jayA/IC0yMyA6IDApICsgNDAgKiB5O1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoeSkgKyA1O1xuICB9XG5cbiAgc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24oeCwgeSkge1xuICAgIHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yLnggPSAtMzUgKyAyMyArIDQwICogeDtcbiAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvci55ID0gLTU1ICsgNDMgKyA0MCAqIHk7XG4gIH1cblxuICBjcmVhdGVQbGFuZXMoKSB7XG4gICAgdGhpcy5ncm91bmRQbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmdyb3VuZFBsYW5lLnlPZmZzZXQgPSAtMjtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZS55T2Zmc2V0ID0gLTI7XG4gICAgdGhpcy5hY3Rpb25QbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmFjdGlvblBsYW5lLnlPZmZzZXQgPSAtMjI7XG4gICAgdGhpcy5mbHVmZlBsYW5lID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuZmx1ZmZQbGFuZS55T2Zmc2V0ID0gLTE2MDtcbiAgICB0aGlzLmZvd1BsYW5lID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xuICAgIHRoaXMuZm93UGxhbmUueU9mZnNldCA9IDA7XG4gIH1cblxuICByZXNldFBsYW5lcyhsZXZlbERhdGEpIHtcbiAgICB2YXIgc3ByaXRlLFxuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgICAgICBpLFxuICAgICAgICBibG9ja1R5cGUsXG4gICAgICAgIGZyYW1lTGlzdDtcblxuICAgIHRoaXMuZ3JvdW5kUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIHRoaXMuYWN0aW9uUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIHRoaXMuZmx1ZmZQbGFuZS5yZW1vdmVBbGwodHJ1ZSk7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIHRoaXMuZm93UGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuXG4gICAgdGhpcy5iYXNlU2hhZGluZyA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcblxuICAgIGZvciAodmFyIHNoYWRlWCA9IDA7IHNoYWRlWCA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lV2lkdGggKiA0MDsgc2hhZGVYICs9IDQwMCkge1xuICAgICAgZm9yICh2YXIgc2hhZGVZID0gMDsgc2hhZGVZIDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVIZWlnaHQgKiA0MDsgc2hhZGVZICs9IDQwMCkge1xuICAgICAgICB0aGlzLmJhc2VTaGFkaW5nLmNyZWF0ZShzaGFkZVgsIHNoYWRlWSwgJ3NoYWRlTGF5ZXInKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlZnJlc2hHcm91bmRQbGFuZSgpO1xuXG4gICAgdGhpcy5hY3Rpb25QbGFuZUJsb2NrcyA9IFtdO1xuICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICBmb3IgKHggPSAwOyB4IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoeSkpICsgeDtcbiAgICAgICAgc3ByaXRlID0gbnVsbDtcblxuICAgICAgICBpZiAoIWxldmVsRGF0YS5ncm91bmREZWNvcmF0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSkge1xuICAgICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5hY3Rpb25QbGFuZSwgeCwgeSwgbGV2ZWxEYXRhLmdyb3VuZERlY29yYXRpb25QbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUpO1xuICAgICAgICAgIGlmIChzcHJpdGUpIHtcbiAgICAgICAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNwcml0ZSA9IG51bGw7XG4gICAgICAgIGlmICghbGV2ZWxEYXRhLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkpIHtcbiAgICAgICAgICBibG9ja1R5cGUgPSBsZXZlbERhdGEuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlO1xuICAgICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5hY3Rpb25QbGFuZSwgeCwgeSwgYmxvY2tUeXBlKTtcbiAgICAgICAgICBpZiAoc3ByaXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleCh5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzLnB1c2goc3ByaXRlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICBsZXQgYmxvY2tJbmRleCA9ICh0aGlzLnlUb0luZGV4KHkpKSArIHg7XG4gICAgICAgIGlmICghbGV2ZWxEYXRhLmZsdWZmUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSkge1xuICAgICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5mbHVmZlBsYW5lLCB4LCB5LCBsZXZlbERhdGEuZmx1ZmZQbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVmcmVzaEdyb3VuZFBsYW5lKCkge1xuICAgIHRoaXMuZ3JvdW5kUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleCh5KSkgKyB4O1xuICAgICAgICB2YXIgc3ByaXRlID0gdGhpcy5jcmVhdGVCbG9jayh0aGlzLmdyb3VuZFBsYW5lLCB4LCB5LCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5ncm91bmRQbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUpO1xuICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVTaGFkaW5nUGxhbmUoc2hhZGluZ0RhdGEpIHtcbiAgICB2YXIgaW5kZXgsIHNoYWRvd0l0ZW0sIHN4LCBzeSwgYXRsYXM7XG5cbiAgICB0aGlzLnNoYWRpbmdQbGFuZS5yZW1vdmVBbGwoKTtcblxuICAgIHRoaXMuc2hhZGluZ1BsYW5lLmFkZCh0aGlzLmJhc2VTaGFkaW5nKTtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZS5hZGQodGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IpO1xuXG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgc2hhZGluZ0RhdGEubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICBzaGFkb3dJdGVtID0gc2hhZGluZ0RhdGFbaW5kZXhdO1xuXG4gICAgICBhdGxhcyA9IFwiQU9cIjtcbiAgICAgIHN4ID0gNDAgKiBzaGFkb3dJdGVtLng7XG4gICAgICBzeSA9IC0yMiArIDQwICogc2hhZG93SXRlbS55O1xuXG4gICAgICBzd2l0Y2ggKHNoYWRvd0l0ZW0udHlwZSkge1xuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfTGVmdFwiOlxuICAgICAgICAgIHN4ICs9IDI2O1xuICAgICAgICAgIHN5ICs9IDIyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9SaWdodFwiOlxuICAgICAgICAgIHN4ICs9IDA7XG4gICAgICAgICAgc3kgKz0gMjI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X0JvdHRvbVwiOlxuICAgICAgICAgIHN4ICs9IDA7XG4gICAgICAgICAgc3kgKz0gMjI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X0JvdHRvbUxlZnRcIjpcbiAgICAgICAgICBzeCArPSAyNTtcbiAgICAgICAgICBzeSArPSAyMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfQm90dG9tUmlnaHRcIjpcbiAgICAgICAgICBzeCArPSAwO1xuICAgICAgICAgIHN5ICs9IDIyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Ub3BcIjpcbiAgICAgICAgICBzeCArPSAwO1xuICAgICAgICAgIHN5ICs9IDQ3O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Ub3BMZWZ0XCI6XG4gICAgICAgICAgc3ggKz0gMjU7XG4gICAgICAgICAgc3kgKz0gNDc7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X1RvcFJpZ2h0XCI6XG4gICAgICAgICAgc3ggKz0gMDtcbiAgICAgICAgICBzeSArPSA0NztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiU2hhZG93X1BhcnRzX0ZhZGVfYmFzZS5wbmdcIjpcbiAgICAgICAgICBhdGxhcyA9IFwiYmxvY2tTaGFkb3dzXCI7XG4gICAgICAgICAgc3ggLT0gNTI7XG4gICAgICAgICAgc3kgKz0gMDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiU2hhZG93X1BhcnRzX0ZhZGVfdG9wLnBuZ1wiOlxuICAgICAgICAgIGF0bGFzID0gXCJibG9ja1NoYWRvd3NcIjtcbiAgICAgICAgICBzeCAtPSA1MjtcbiAgICAgICAgICBzeSArPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNoYWRpbmdQbGFuZS5jcmVhdGUoc3gsIHN5LCBhdGxhcywgc2hhZG93SXRlbS50eXBlKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVGb3dQbGFuZShmb3dEYXRhKSB7XG4gICAgdmFyIGluZGV4LCBmeCwgZnksIGF0bGFzO1xuXG4gICAgdGhpcy5mb3dQbGFuZS5yZW1vdmVBbGwoKTtcblxuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGZvd0RhdGEubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICBsZXQgZm93SXRlbSA9IGZvd0RhdGFbaW5kZXhdO1xuXG4gICAgICBpZiAoZm93SXRlbSAhPT0gXCJcIikge1xuICAgICAgICBhdGxhcyA9IFwidW5kZXJncm91bmRGb3dcIjtcbiAgICAgICAgZnggPSAtNDAgKyA0MCAqIGZvd0l0ZW0ueDtcbiAgICAgICAgZnkgPSAtNDAgKyA0MCAqIGZvd0l0ZW0ueTtcblxuICAgICAgICBzd2l0Y2ggKGZvd0l0ZW0udHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJGb2dPZldhcl9DZW50ZXJcIjpcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mb3dQbGFuZS5jcmVhdGUoZngsIGZ5LCBhdGxhcywgZm93SXRlbS50eXBlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwbGF5UmFuZG9tUGxheWVySWRsZShmYWNpbmcpIHtcbiAgICB2YXIgZmFjaW5nTmFtZSxcbiAgICAgICAgcmFuZCxcbiAgICAgICAgYW5pbWF0aW9uTmFtZTtcblxuICAgIGZhY2luZ05hbWUgPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcbiAgICByYW5kID0gTWF0aC50cnVuYyhNYXRoLnJhbmRvbSgpICogNCkgKyAxO1xuXG4gICAgc3dpdGNoKHJhbmQpXG4gICAge1xuICAgICAgY2FzZSAxOlxuICAgICAgYW5pbWF0aW9uTmFtZSA9IFwiaWRsZVwiO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICBhbmltYXRpb25OYW1lID0gXCJsb29rTGVmdFwiO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICBhbmltYXRpb25OYW1lID0gXCJsb29rUmlnaHRcIjtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgYW5pbWF0aW9uTmFtZSA9IFwibG9va0F0Q2FtXCI7XG4gICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuXG4gICAgYW5pbWF0aW9uTmFtZSArPSBmYWNpbmdOYW1lO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1hdGlvbk5hbWUpO1xuICB9XG5cbiAgZ2VuZXJhdGVQbGF5ZXJDZWxlYnJhdGVGcmFtZXMoKSB7XG4gICAgdmFyIGZyYW1lTGlzdCA9IFtdLFxuICAgICAgICBpO1xuXG4gICAgLy9Dcm91Y2ggRG93blxuICAgLyogZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjksIDMyLCBcIlwiLCAzKSk7XG4gICAgLy9Dcm91Y2ggRG93blxuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI5LCAzMiwgXCJcIiwgMykpO1xuICAgIC8vdHVybiBhbmQgcGF1c2VcbiAgICBmb3IgKGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wNjFcIik7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCAyOyArK2kpIHtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzE0OVwiKTtcbiAgICB9XG4gICAgICAgIC8vQ3JvdWNoIFVwXG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTQ5LCAxNTIsIFwiXCIsIDMpKTtcbiAgICAvL0Nyb3VjaCBVcFxuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE0OSwgMTUyLCBcIlwiLCAzKSk7Ki9cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9BbHRlcm5hdGl2ZSBBbmltYXRpb24vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvL0ZhY2UgRG93blxuICAgICBmb3IgKGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgfVxuICAgIC8vQ3JvdWNoIExlZnRcbiAgICAvL2ZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIwOSwgMjEyLCBcIlwiLCAzKSk7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yNTlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8yNjBcIik7XG5cbiAgICAvL0p1bXBcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNjFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjk3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI5OFwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yOTdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjYxXCIpO1xuICAgIC8vSnVtcFxuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI2MVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yOTdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjk4XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI5N1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNjFcIik7XG4gICAgLy9QYXVzZVxuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgLy9KdW1wXG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjYxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI5N1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yOThcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjk3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI2MVwiKTtcbiAgICAvL0p1bXBcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNjFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjk3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI5OFwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yOTdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjYxXCIpO1xuXG4gICAgLy9mb3IgKGkgPSAwOyBpIDwgNTsgKytpKSB7XG4gICAgLy8gIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI2MlwiKTtcbiAgICAvL1xuICAgIHJldHVybiBmcmFtZUxpc3Q7XG4gIH1cblxuICBnZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShmcmFtZU5hbWUsIHN0YXJ0RnJhbWUsIGVuZEZyYW1lLCBlbmRGcmFtZUZ1bGxOYW1lLCBidWZmZXIsIGZyYW1lRGVsYXkpIHtcbiAgICB2YXIgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoZnJhbWVOYW1lLCBzdGFydEZyYW1lLCBlbmRGcmFtZSwgXCJcIiwgYnVmZmVyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZyYW1lRGVsYXk7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goZW5kRnJhbWVGdWxsTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBmcmFtZUxpc3Q7XG4gIH1cblxuICBwcmVwYXJlUGxheWVyU3ByaXRlKHBsYXllck5hbWUpIHtcbiAgICB2YXIgZnJhbWVMaXN0LFxuICAgICAgICBnZW5GcmFtZXMsXG4gICAgICAgIGksXG4gICAgICAgIHNpbmdsZVB1bmNoLFxuICAgICAgICBqdW1wQ2VsZWJyYXRlRnJhbWVzLFxuICAgICAgICBpZGxlRnJhbWVSYXRlID0gMTA7XG5cbiAgICBsZXQgZnJhbWVSYXRlID0gMjA7XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZSA9IHRoaXMuYWN0aW9uUGxhbmUuY3JlYXRlKDAsIDAsIGBwbGF5ZXIke3BsYXllck5hbWV9YCwgJ1BsYXllcl8xMjEnKTtcbiAgICBpZiAodGhpcy5jb250cm9sbGVyLmZvbGxvd2luZ1BsYXllcigpKSB7XG4gICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllclNwcml0ZSk7XG4gICAgfVxuICAgIHRoaXMucGxheWVyR2hvc3QgPSB0aGlzLmZsdWZmUGxhbmUuY3JlYXRlKDAsIDAsIGBwbGF5ZXIke3BsYXllck5hbWV9YCwgJ1BsYXllcl8xMjEnKTtcbiAgICB0aGlzLnBsYXllckdob3N0LnBhcmVudCA9IHRoaXMucGxheWVyU3ByaXRlO1xuICAgIHRoaXMucGxheWVyR2hvc3QuYWxwaGEgPSAwLjI7XG5cbiAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvciA9IHRoaXMuc2hhZGluZ1BsYW5lLmNyZWF0ZSgyNCwgNDQsICdzZWxlY3Rpb25JbmRpY2F0b3InKTtcblxuICAgIGp1bXBDZWxlYnJhdGVGcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjg1LCAyOTYsIFwiXCIsIDMpO1xuXG4gICAgZnJhbWVMaXN0ID0gW107XG5cbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAzXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDA5XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwN1wiKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNTsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgfVxuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVfZG93bicsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uRG93bik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgNiwgNSwgXCJQbGF5ZXJfMDA1XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwNlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0xlZnRfZG93bicsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfZG93blwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAxMiwgMTEsIFwiUGxheWVyXzAxMVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMTJcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tSaWdodF9kb3duJywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9kb3duXCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDI2MywgMjYyLCBcIlBsYXllcl8yNjJcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjYzXCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rQXRDYW1fZG93bicsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfZG93blwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMTM7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIH1cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZVBhdXNlX2Rvd24nLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLkRvd24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3dhbGtfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxMywgZnJhbWVSYXRlLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICBzaW5nbGVQdW5jaCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMSwgMjQsIFwiXCIsIDMpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaF9kb3duJywgc2luZ2xlUHVuY2gsIGZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInB1bmNoXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaERlc3Ryb3lfZG93bicsIHNpbmdsZVB1bmNoLmNvbmNhdChzaW5nbGVQdW5jaCkuY29uY2F0KHNpbmdsZVB1bmNoKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2h1cnRfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyNSwgMjgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjcm91Y2hfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyOSwgMzIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wVXBfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAzMywgMzYsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnZmFpbF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDQ1LCA0OCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjZWxlYnJhdGVfZG93bicsIHRoaXMuZ2VuZXJhdGVQbGF5ZXJDZWxlYnJhdGVGcmFtZXMoKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdidW1wX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgNDksIDU0LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCBmYWxzZSkub25TdGFydC5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiYnVtcFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcERvd25fZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA1NSwgNjAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjQxLCAyNDQsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgNSwgNSwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF90dXJubGVmdF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgNiwgNiwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF90dXJucmlnaHRfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDEyLCAxMiwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuXG4gICAgZnJhbWVMaXN0ID0gW107XG5cbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDYzXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2MVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDY5XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2N1wiKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNTsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjFcIik7XG4gICAgfVxuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVfcmlnaHQnLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLlJpZ2h0KTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCA2NiwgNjUsIFwiUGxheWVyXzA2NVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjZcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tMZWZ0X3JpZ2h0JywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9yaWdodFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCA3MiwgNzEsIFwiUGxheWVyXzA3MVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNzJcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tSaWdodF9yaWdodCcsZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9yaWdodFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAyNzAsIDI2OSwgXCJQbGF5ZXJfMjY5XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI3MFwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0F0Q2FtX3JpZ2h0JywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9yaWdodFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMTM7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDYxXCIpO1xuICAgIH1cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZVBhdXNlX3JpZ2h0JywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5SaWdodCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnd2Fsa19yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA3MywgODAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHNpbmdsZVB1bmNoID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDgxLCA4NCwgXCJcIiwgMyk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoX3JpZ2h0Jywgc2luZ2xlUHVuY2gsIGZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInB1bmNoXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaERlc3Ryb3lfcmlnaHQnLCBzaW5nbGVQdW5jaC5jb25jYXQoc2luZ2xlUHVuY2gpLmNvbmNhdChzaW5nbGVQdW5jaCksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdodXJ0X3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDg1LCA4OCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2Nyb3VjaF9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA4OSwgOTIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wVXBfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgOTMsIDk2LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2ZhaWxfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTA1LCAxMDgsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2NlbGVicmF0ZV9yaWdodCcsIHRoaXMuZ2VuZXJhdGVQbGF5ZXJDZWxlYnJhdGVGcmFtZXMoKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdidW1wX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDEwOSwgMTE0LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCBmYWxzZSkub25TdGFydC5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiYnVtcFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcERvd25fcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTE1LCAxMjAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI0NSwgMjQ4LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCA3LCA3LCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG5cbiAgICBmcmFtZUxpc3QgPSBbXTtcblxuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4MVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODNcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTgxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4N1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODlcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTg3XCIpO1xuICAgIGZvciAoaSA9IDA7IGkgPCA1OyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4MVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZV9sZWZ0JywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5MZWZ0KTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAxODYsIDE4NSwgXCJQbGF5ZXJfMTg1XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4NlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0xlZnRfbGVmdCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9sZWZ0XCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDE5MiwgMTkxLCBcIlBsYXllcl8xOTFcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTkyXCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rUmlnaHRfbGVmdCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfbGVmdFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAyODQsIDI4MywgXCJQbGF5ZXJfMjgzXCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI4NFwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0F0Q2FtX2xlZnQnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX2xlZnRcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IDEzOyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4MVwiKTtcbiAgICB9XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVQYXVzZV9sZWZ0JywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5MZWZ0KTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCd3YWxrX2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTkzLCAyMDAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHNpbmdsZVB1bmNoID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIwMSwgMjA0LCBcIlwiLCAzKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hfbGVmdCcsIHNpbmdsZVB1bmNoLCBmcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJwdW5jaFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hEZXN0cm95X2xlZnQnLCBzaW5nbGVQdW5jaC5jb25jYXQoc2luZ2xlUHVuY2gpLmNvbmNhdChzaW5nbGVQdW5jaCksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdodXJ0X2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjA1LCAyMDgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjcm91Y2hfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMDksIDIxMiwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBVcF9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIxMywgMjE2LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2ZhaWxfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMjUsIDIyOCwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY2VsZWJyYXRlX2xlZnQnLCB0aGlzLmdlbmVyYXRlUGxheWVyQ2VsZWJyYXRlRnJhbWVzKCksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnYnVtcF9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIyOSwgMjM0LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCBmYWxzZSkub25TdGFydC5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiYnVtcFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcERvd25fbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMzUsIDI0MCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyNTMsIDI1NiwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCAxMSwgMTEsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcblxuICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjNcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTIxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyN1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjlcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTI3XCIpO1xuICAgIGZvciAoaSA9IDA7IGkgPCA1OyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyMVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZV91cCcsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uVXApO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDEyNiwgMTI1LCBcIlBsYXllcl8xMjVcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTI2XCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rTGVmdF91cCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfdXBcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMTMyLCAxMzEsIFwiUGxheWVyXzEzMVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMzJcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tSaWdodF91cCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfdXBcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMjc3LCAyNzYsIFwiUGxheWVyXzI3NlwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNzdcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tBdENhbV91cCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfdXBcIik7XG4gICAgfSk7XG5cbiAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMTM7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTIxXCIpO1xuICAgIH1cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZVBhdXNlX3VwJywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5VcCk7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3dhbGtfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTMzLCAxNDAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHNpbmdsZVB1bmNoID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE0MSwgMTQ0LCBcIlwiLCAzKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hfdXAnLCBzaW5nbGVQdW5jaCwgZnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwicHVuY2hcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoRGVzdHJveV91cCcsIHNpbmdsZVB1bmNoLmNvbmNhdChzaW5nbGVQdW5jaCkuY29uY2F0KHNpbmdsZVB1bmNoKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2h1cnRfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTQ1LCAxNDgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjcm91Y2hfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTQ5LCAxNTIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wVXBfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTUzLCAxNTYsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnZmFpbF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNjUsIDE2OCwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY2VsZWJyYXRlX3VwJywgdGhpcy5nZW5lcmF0ZVBsYXllckNlbGVicmF0ZUZyYW1lcygpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2J1bXBfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTY5LCAxNzQsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIGZhbHNlKS5vblN0YXJ0LmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJidW1wXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wRG93bl91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNzUsIDE4MCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjQ5LCAyNTIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDksIDksIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfdHVybmxlZnRfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCAxMCwgMTAsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfdHVybnJpZ2h0X3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgOCwgOCwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICB9XG5cbiAgY3JlYXRlTWluaUJsb2NrKHgsIHksIGJsb2NrVHlwZSkge1xuICAgIHZhciBmcmFtZSA9IFwiXCIsXG4gICAgICAgIHNwcml0ZSA9IG51bGwsXG4gICAgICAgIGZyYW1lTGlzdCxcbiAgICAgICAgaSwgbGVuO1xuXG4gICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgIGNhc2UgXCJ0cmVlQWNhY2lhXCI6XG4gICAgICBjYXNlIFwidHJlZUJpcmNoXCI6XG4gICAgICBjYXNlIFwidHJlZUp1bmdsZVwiOlxuICAgICAgY2FzZSBcInRyZWVPYWtcIjpcbiAgICAgIGNhc2UgXCJ0cmVlU3BydWNlXCI6XG4gICAgICAgIGZyYW1lID0gXCJsb2dcIiArIGJsb2NrVHlwZS5zdWJzdHJpbmcoNCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInN0b25lXCI6XG4gICAgICAgIGZyYW1lID0gXCJjb2JibGVzdG9uZVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVDb2FsXCI6XG4gICAgICAgIGZyYW1lID0gXCJjb2FsXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZURpYW1vbmRcIjpcbiAgICAgICAgZnJhbWUgPSBcImRpYW1vbmRcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlSXJvblwiOlxuICAgICAgICBmcmFtZSA9IFwiaW5nb3RJcm9uXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZUxhcGlzXCI6XG4gICAgICAgIGZyYW1lID0gXCJsYXBpc0xhenVsaVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVHb2xkXCI6XG4gICAgICAgIGZyYW1lID0gXCJpbmdvdEdvbGRcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlRW1lcmFsZFwiOlxuICAgICAgICBmcmFtZSA9IFwiZW1lcmFsZFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVSZWRzdG9uZVwiOlxuICAgICAgICBmcmFtZSA9IFwicmVkc3RvbmVEdXN0XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImdyYXNzXCI6XG4gICAgICAgIGZyYW1lID0gXCJkaXJ0XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIndvb2xfb3JhbmdlXCI6XG4gICAgICAgIGZyYW1lID0gXCJ3b29sXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInRudFwiOlxuICAgICAgICBmcmFtZSA9IFwiZ3VuUG93ZGVyXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZnJhbWUgPSBibG9ja1R5cGU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBhdGxhcyA9IFwibWluaUJsb2Nrc1wiO1xuICAgIGxldCBmcmFtZVByZWZpeCA9IHRoaXMubWluaUJsb2Nrc1tmcmFtZV1bMF07XG4gICAgbGV0IGZyYW1lU3RhcnQgPSB0aGlzLm1pbmlCbG9ja3NbZnJhbWVdWzFdO1xuICAgIGxldCBmcmFtZUVuZCA9IHRoaXMubWluaUJsb2Nrc1tmcmFtZV1bMl07XG4gICAgbGV0IHhPZmZzZXQgPSAtMTA7XG4gICAgbGV0IHlPZmZzZXQgPSAwO1xuXG4gICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoZnJhbWVQcmVmaXgsIGZyYW1lU3RhcnQsIGZyYW1lRW5kLCBcIlwiLCAzKTtcblxuICAgIHNwcml0ZSA9IHRoaXMuYWN0aW9uUGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyB0aGlzLmFjdGlvblBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBcIlwiKTtcbiAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJhbmltYXRlXCIsIGZyYW1lTGlzdCwgMTAsIGZhbHNlKTtcbiAgICByZXR1cm4gc3ByaXRlO1xuICB9XG5cbiAgcGxheUFuaW1hdGlvbldpdGhPZmZzZXQoc3ByaXRlLCBhbmltYXRpb25OYW1lLCBhbmltYXRpb25GcmFtZVRvdGFsLCBzdGFydEZyYW1lKXtcbiAgICB2YXIgcmFuZCA9IE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSAqIGFuaW1hdGlvbkZyYW1lVG90YWwpICsgc3RhcnRGcmFtZTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgYW5pbWF0aW9uTmFtZSkuc2V0RnJhbWUocmFuZCwgdHJ1ZSk7XG4gIH1cblxuICBwbGF5UmFuZG9tU2hlZXBBbmltYXRpb24oc3ByaXRlKSB7XG4gICAgdmFyIHJhbmQgPSBNYXRoLnRydW5jKE1hdGgucmFuZG9tKCkgKiAyMCArIDEpO1xuXG4gICAgc3dpdGNoKHJhbmQpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgIGNhc2UgMjpcbiAgICAgIGNhc2UgMzpcbiAgICAgIGNhc2UgNDpcbiAgICAgIGNhc2UgNTpcbiAgICAgIGNhc2UgNjpcbiAgICAgIC8vZWF0IGdyYXNzXG4gICAgICBzcHJpdGUucGxheShcImlkbGVcIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgIGNhc2UgODpcbiAgICAgIGNhc2UgOTpcbiAgICAgIGNhc2UgMTA6XG4gICAgICAvL2xvb2sgbGVmdFxuICAgICAgc3ByaXRlLnBsYXkoXCJsb29rTGVmdFwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxMTpcbiAgICAgIGNhc2UgMTI6XG4gICAgICBjYXNlIDEzOlxuICAgICAgY2FzZSAxNDpcbiAgICAgIC8vbG9vayByaWdodFxuICAgICAgc3ByaXRlLnBsYXkoXCJsb29rUmlnaHRcIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMTU6XG4gICAgICBjYXNlIDE2OlxuICAgICAgY2FzZSAxNzpcbiAgICAgIC8vY2FtXG4gICAgICBzcHJpdGUucGxheShcImxvb2tBdENhbVwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxODpcbiAgICAgIGNhc2UgMTk6XG4gICAgICAvL2tpY2tcbiAgICAgIHNwcml0ZS5wbGF5KFwia2lja1wiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyMDpcbiAgICAgIC8vaWRsZVBhdXNlXG4gICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH1cblxuICBwbGF5UmFuZG9tQ3JlZXBlckFuaW1hdGlvbihzcHJpdGUpIHtcbiAgICB2YXIgcmFuZCA9IE1hdGgudHJ1bmModGhpcy55VG9JbmRleChNYXRoLnJhbmRvbSgpKSArIDEpO1xuXG4gICAgc3dpdGNoKHJhbmQpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgIGNhc2UgMjpcbiAgICAgIGNhc2UgMzpcbiAgICAgIC8vbG9vayBsZWZ0XG4gICAgICBzcHJpdGUucGxheShcImxvb2tMZWZ0XCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICBjYXNlIDU6XG4gICAgICBjYXNlIDY6XG4gICAgICAvL2xvb2sgcmlnaHRcbiAgICAgIHNwcml0ZS5wbGF5KFwibG9va1JpZ2h0XCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICBjYXNlIDg6XG4gICAgICAvL2xvb2sgYXQgY2FtXG4gICAgICBzcHJpdGUucGxheShcImxvb2tBdENhbVwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgY2FzZSAxMDpcbiAgICAgIC8vc2h1ZmZsZSBmZWV0XG4gICAgICBzcHJpdGUucGxheShcImlkbGVcIik7XG4gICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQmxvY2socGxhbmUsIHgsIHksIGJsb2NrVHlwZSkge1xuICAgIHZhciBpLFxuICAgICAgICBzcHJpdGUgPSBudWxsLFxuICAgICAgICBmcmFtZUxpc3QsXG4gICAgICAgIGF0bGFzLFxuICAgICAgICBmcmFtZSxcbiAgICAgICAgeE9mZnNldCxcbiAgICAgICAgeU9mZnNldCxcbiAgICAgICAgc3RpbGxGcmFtZXM7XG5cbiAgICBzd2l0Y2ggKGJsb2NrVHlwZSkge1xuICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgY2FzZSBcInRyZWVTcHJ1Y2VcIjpcbiAgICAgICAgc3ByaXRlID0gdGhpcy5jcmVhdGVCbG9jayhwbGFuZSwgeCwgeSwgXCJsb2dcIiArIGJsb2NrVHlwZS5zdWJzdHJpbmcoNCkpO1xuICAgICAgICBzcHJpdGUuZmx1ZmYgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZmx1ZmZQbGFuZSwgeCwgeSwgXCJsZWF2ZXNcIiArIGJsb2NrVHlwZS5zdWJzdHJpbmcoNCkpO1xuXG4gICAgICAgIHNwcml0ZS5vbkJsb2NrRGVzdHJveSA9IChsb2dTcHJpdGUpID0+IHtcbiAgICAgICAgICBsb2dTcHJpdGUuZmx1ZmYuYW5pbWF0aW9ucy5hZGQoXCJkZXNwYXduXCIsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTGVhdmVzXCIsIDAsIDYsIFwiXCIsIDApLCAxMCwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudG9EZXN0cm95LnB1c2gobG9nU3ByaXRlLmZsdWZmKTtcbiAgICAgICAgICAgIGxvZ1Nwcml0ZS5mbHVmZi5raWxsKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChsb2dTcHJpdGUuZmx1ZmYuYW5pbWF0aW9ucywgXCJkZXNwYXduXCIpO1xuICAgICAgICB9O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInNoZWVwXCI6XG4gICAgICAgIGxldCBzRnJhbWVzID0gMTA7XG4gICAgICAgIC8vIEZhY2luZyBMZWZ0OiBFYXQgR3Jhc3M6IDE5OS0yMTZcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKC0yMiArIDQwICogeCwgLTEyICsgNDAgKiB5LCBcInNoZWVwXCIsIFwiU2hlZXBfMTk5XCIpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCAxOTksIDIxNSwgXCJcIiwgMCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzIxNVwiKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTG9vayBSaWdodFxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCAxODQsIDE4NiwgXCJcIiwgMCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzE4NlwiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzE4OFwiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va1JpZ2h0XCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTG9vayBMZWZ0XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiU2hlZXBfXCIsIDE5MywgMTk1LCBcIlwiLCAwKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNGcmFtZXM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfMTk1XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfMTk3XCIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJsb29rTGVmdFwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0tpY2tcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgMjE3LCAyMzMsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJraWNrXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTG9vayBBdCBDYW1lcmFcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgNDg0LCA0ODUsIFwiXCIsIDApO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc0ZyYW1lczsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF80ODVcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF80ODZcIik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImxvb2tBdENhbVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzIxNVwiKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlUGF1c2VcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlSYW5kb21TaGVlcEFuaW1hdGlvbihzcHJpdGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUT0RPKGJqb3JkYW4vZ2FhbGxlbikgLSB1cGRhdGUgb25jZSB1cGRhdGVkIFNoZWVwLmpzb25cbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgNDkwLCA0OTEsIFwiXCIsIDApO1xuICAgICAgICBzdGlsbEZyYW1lcyA9IE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSAqIDMpICsgMztcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHN0aWxsRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzQ5MVwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uQW5pbWF0aW9uU3RhcnQoc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiZmFjZVwiLCBmcmFtZUxpc3QsIDIsIHRydWUpLCAoKT0+e1xuICAgICAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInNoZWVwQmFhXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCA0MzksIDQ1NSwgXCJcIiwgMCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzQ1NVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcInVzZWRcIiwgZnJhbWVMaXN0LCAxNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheUFuaW1hdGlvbldpdGhPZmZzZXQoc3ByaXRlLFwiaWRsZVwiLDE3LCAxOTkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImNyZWVwZXJcIjpcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKC02ICsgNDAgKiB4LCAwICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgXCJjcmVlcGVyXCIsIFwiQ3JlZXBlcl8wNTNcIik7XG5cbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJDcmVlcGVyX1wiLCAzNywgNTEsIFwiXCIsIDMpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJleHBsb2RlXCIsIGZyYW1lTGlzdCwgMTAsIGZhbHNlKTtcblxuICAgICAgICAvL0xvb2sgTGVmdFxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkNyZWVwZXJfXCIsIDQsIDcsIFwiXCIsIDMpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMDdcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAwOFwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAwOVwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAxMFwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAxMVwiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va0xlZnRcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9Mb29rIFJpZ2h0XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQ3JlZXBlcl9cIiwgMTYsIDE5LCBcIlwiLCAzKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDE5XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMjBcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMjFcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMjJcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMjNcIik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImxvb2tSaWdodFwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0xvb2sgQXQgQ2FtXG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQ3JlZXBlcl9cIiwgMjQ0LCAyNDUsIFwiXCIsIDMpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8yNDVcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzI0NlwiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va0F0Q2FtXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMDRcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVBhdXNlXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbGF5UmFuZG9tQ3JlZXBlckFuaW1hdGlvbihzcHJpdGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkNyZWVwZXJfXCIsIDUzLCA1OSwgXCJcIiwgMyk7XG4gICAgICAgIHN0aWxsRnJhbWVzID0gTWF0aC50cnVuYyh0aGlzLnlUb0luZGV4KE1hdGgucmFuZG9tKCkpKSArIDIwO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3RpbGxGcmFtZXM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMDRcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wbGF5QW5pbWF0aW9uV2l0aE9mZnNldChzcHJpdGUsIFwiaWRsZVwiLCA4LCA1Mik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiY3JvcFdoZWF0XCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJXaGVhdFwiLCAwLCAyLCBcIlwiLCAwKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDAuNCwgZmFsc2UpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInRvcmNoXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJUb3JjaFwiLCAwLCAyMywgXCJcIiwgMCk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCAxNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwid2F0ZXJcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIldhdGVyX1wiLCAwLCA1LCBcIlwiLCAwKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy9mb3IgcGxhY2luZyB3ZXRsYW5kIGZvciBjcm9wcyBpbiBmcmVlIHBsYXlcbiAgICAgIGNhc2UgXCJ3YXRlcmluZ1wiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIHNwcml0ZS5raWxsKCk7XG4gICAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goc3ByaXRlKTtcbiAgICAgICAgdGhpcy5jcmVhdGVCbG9jayh0aGlzLmdyb3VuZFBsYW5lLCB4LCB5LCBcImZhcm1sYW5kV2V0XCIpO1xuICAgICAgICB0aGlzLnJlZnJlc2hHcm91bmRQbGFuZSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImxhdmFcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkxhdmFfXCIsIDAsIDUsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwibGF2YVBvcFwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTGF2YVBvcFwiLCAxLCA3LCBcIlwiLCAyKTtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJMYXZhUG9wMDdcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkxhdmFQb3BcIiwgOCwgMTMsIFwiXCIsIDIpKTtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgMzsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJMYXZhUG9wMTNcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkxhdmFQb3BcIiwgMTQsIDMwLCBcIlwiLCAyKSk7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IDg7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiTGF2YVBvcDAxXCIpO1xuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCA1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5QW5pbWF0aW9uV2l0aE9mZnNldChzcHJpdGUsIFwiaWRsZVwiLCAyOSwgMSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiZmlyZVwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiRmlyZVwiLCAwLCAxNCwgXCJcIiwgMik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCA1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJidWJibGVzXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJCdWJibGVzXCIsIDAsIDE0LCBcIlwiLCAyKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImV4cGxvc2lvblwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiRXhwbG9zaW9uXCIsIDAsIDE2LCBcIlwiLCAxKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goc3ByaXRlKTtcbiAgICAgICAgICBzcHJpdGUua2lsbCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJkb29yXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICAgICAgbGV0IGFuaW1hdGlvbkZyYW1lcyA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiRG9vclwiLCAwLCAzLCBcIlwiLCAxKTtcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IDU7ICsrailcbiAgICAgICAge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiRG9vcjBcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChhbmltYXRpb25GcmFtZXMpO1xuXG4gICAgICAgIHZhciBhbmltYXRpb24gPSBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJvcGVuXCIsIGZyYW1lTGlzdCwgNSwgZmFsc2UpO1xuICAgICAgICBhbmltYXRpb24uZW5hYmxlVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgLy9wbGF5IHdoZW4gdGhlIGRvb3Igc3RhcnRzIG9wZW5pbmdcbiAgICAgICAgYW5pbWF0aW9uLm9uVXBkYXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgaWYoYW5pbWF0aW9uLmZyYW1lID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJkb29yT3BlblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJvcGVuXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInRudFwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiVE5UZXhwbG9zaW9uXCIsIDAsIDgsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJleHBsb2RlXCIsIGZyYW1lTGlzdCwgNywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlFeHBsb3Npb25DbG91ZEFuaW1hdGlvbihbeCx5XSk7XG4gICAgICAgICAgc3ByaXRlLmtpbGwoKTtcbiAgICAgICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKHNwcml0ZSk7XG4gICAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1t0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChbeCx5XSldID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBzcHJpdGU7XG4gIH1cblxuICBvbkFuaW1hdGlvbkVuZChhbmltYXRpb24sIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHNpZ25hbEJpbmRpbmcgPSBhbmltYXRpb24ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgc2lnbmFsQmluZGluZy5kZXRhY2goKTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBvbkFuaW1hdGlvblN0YXJ0KGFuaW1hdGlvbiwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgc2lnbmFsQmluZGluZyA9IGFuaW1hdGlvbi5vblN0YXJ0LmFkZCgoKSA9PiB7XG4gICAgICBzaWduYWxCaW5kaW5nLmRldGFjaCgpO1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uQW5pbWF0aW9uTG9vcE9uY2UoYW5pbWF0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBzaWduYWxCaW5kaW5nID0gYW5pbWF0aW9uLm9uTG9vcC5hZGQoKCkgPT4ge1xuICAgICAgc2lnbmFsQmluZGluZy5kZXRhY2goKTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBhZGRSZXNldHRhYmxlVHdlZW4oc3ByaXRlKSB7XG4gICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2VlbihzcHJpdGUpO1xuICAgIHRoaXMucmVzZXR0YWJsZVR3ZWVucy5wdXNoKHR3ZWVuKTtcbiAgICByZXR1cm4gdHdlZW47XG4gIH1cblxufVxuIiwiaW1wb3J0IExldmVsQmxvY2sgZnJvbSBcIi4vTGV2ZWxCbG9jay5qc1wiO1xuaW1wb3J0IEZhY2luZ0RpcmVjdGlvbiBmcm9tIFwiLi9GYWNpbmdEaXJlY3Rpb24uanNcIjtcblxuLy8gZm9yIGJsb2NrcyBvbiB0aGUgYWN0aW9uIHBsYW5lLCB3ZSBuZWVkIGFuIGFjdHVhbCBcImJsb2NrXCIgb2JqZWN0LCBzbyB3ZSBjYW4gbW9kZWxcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGV2ZWxNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKGxldmVsRGF0YSkge1xuICAgIHRoaXMucGxhbmVXaWR0aCA9IGxldmVsRGF0YS5ncmlkRGltZW5zaW9ucyA/XG4gICAgICAgIGxldmVsRGF0YS5ncmlkRGltZW5zaW9uc1swXSA6IDEwO1xuICAgIHRoaXMucGxhbmVIZWlnaHQgPSBsZXZlbERhdGEuZ3JpZERpbWVuc2lvbnMgP1xuICAgICAgICBsZXZlbERhdGEuZ3JpZERpbWVuc2lvbnNbMV0gOiAxMDtcblxuICAgIHRoaXMucGxheWVyID0ge307XG5cbiAgICB0aGlzLnJhaWxNYXAgPSBcbiAgICAgIFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJyYWlsc1VucG93ZXJlZFZlcnRpY2FsXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcInJhaWxzVW5wb3dlcmVkVmVydGljYWxcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJyYWlsc1VucG93ZXJlZFZlcnRpY2FsXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcInJhaWxzQm90dG9tTGVmdFwiLFwicmFpbHNIb3Jpem9udGFsXCIsXCJyYWlsc0hvcml6b250YWxcIixcInJhaWxzSG9yaXpvbnRhbFwiLFwicmFpbHNIb3Jpem9udGFsXCIsXCJyYWlsc0hvcml6b250YWxcIixcInJhaWxzSG9yaXpvbnRhbFwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdO1xuXG4gICAgdGhpcy5pbml0aWFsTGV2ZWxEYXRhID0gT2JqZWN0LmNyZWF0ZShsZXZlbERhdGEpO1xuXG4gICAgdGhpcy5yZXNldCgpO1xuXG4gICAgdGhpcy5pbml0aWFsUGxheWVyU3RhdGUgPSBPYmplY3QuY3JlYXRlKHRoaXMucGxheWVyKTtcbiAgfVxuXG4gIHBsYW5lQXJlYSgpIHtcbiAgICByZXR1cm4gdGhpcy5wbGFuZVdpZHRoICogdGhpcy5wbGFuZUhlaWdodDtcbiAgfVxuXG4gIGluQm91bmRzKHgsIHkpIHtcbiAgICByZXR1cm4geCA+PSAwICYmIHggPCB0aGlzLnBsYW5lV2lkdGggJiYgeSA+PSAwICYmIHkgPCB0aGlzLnBsYW5lSGVpZ2h0O1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5ncm91bmRQbGFuZSA9IHRoaXMuY29uc3RydWN0UGxhbmUodGhpcy5pbml0aWFsTGV2ZWxEYXRhLmdyb3VuZFBsYW5lLCBmYWxzZSk7XG4gICAgdGhpcy5ncm91bmREZWNvcmF0aW9uUGxhbmUgPSB0aGlzLmNvbnN0cnVjdFBsYW5lKHRoaXMuaW5pdGlhbExldmVsRGF0YS5ncm91bmREZWNvcmF0aW9uUGxhbmUsIGZhbHNlKTtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZSA9IFtdO1xuICAgIHRoaXMuYWN0aW9uUGxhbmUgPSB0aGlzLmNvbnN0cnVjdFBsYW5lKHRoaXMuaW5pdGlhbExldmVsRGF0YS5hY3Rpb25QbGFuZSwgdHJ1ZSk7XG4gICAgdGhpcy5mbHVmZlBsYW5lID0gdGhpcy5jb25zdHJ1Y3RQbGFuZSh0aGlzLmluaXRpYWxMZXZlbERhdGEuZmx1ZmZQbGFuZSwgZmFsc2UpO1xuICAgIHRoaXMuZm93UGxhbmUgPSBbXTtcbiAgICB0aGlzLmlzRGF5dGltZSA9IHRoaXMuaW5pdGlhbExldmVsRGF0YS5pc0RheXRpbWUgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmluaXRpYWxMZXZlbERhdGEuaXNEYXl0aW1lO1xuXG4gICAgbGV0IGxldmVsRGF0YSA9IE9iamVjdC5jcmVhdGUodGhpcy5pbml0aWFsTGV2ZWxEYXRhKTtcbiAgICBsZXQgW3gsIHldID0gW2xldmVsRGF0YS5wbGF5ZXJTdGFydFBvc2l0aW9uWzBdLCBsZXZlbERhdGEucGxheWVyU3RhcnRQb3NpdGlvblsxXV07XG5cbiAgICB0aGlzLnBsYXllci5uYW1lID0gdGhpcy5pbml0aWFsTGV2ZWxEYXRhLnBsYXllck5hbWUgfHwgXCJTdGV2ZVwiO1xuICAgIHRoaXMucGxheWVyLnBvc2l0aW9uID0gbGV2ZWxEYXRhLnBsYXllclN0YXJ0UG9zaXRpb247XG4gICAgdGhpcy5wbGF5ZXIuaXNPbkJsb2NrID0gIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHhdLmdldElzRW1wdHlPckVudGl0eSgpO1xuICAgIHRoaXMucGxheWVyLmZhY2luZyA9IGxldmVsRGF0YS5wbGF5ZXJTdGFydERpcmVjdGlvbjtcblxuICAgIHRoaXMucGxheWVyLmludmVudG9yeSA9IHt9O1xuXG4gICAgdGhpcy5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgdGhpcy5jb21wdXRlRm93UGxhbmUoKTtcbiAgfVxuXG4gIHlUb0luZGV4KHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMucGxhbmVXaWR0aDtcbiAgfVxuXG4gIGNvbnN0cnVjdFBsYW5lKHBsYW5lRGF0YSwgaXNBY3Rpb25QbGFuZSkge1xuICAgIHZhciBpbmRleCxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIGJsb2NrO1xuXG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgcGxhbmVEYXRhLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgYmxvY2sgPSBuZXcgTGV2ZWxCbG9jayhwbGFuZURhdGFbaW5kZXhdKTtcbiAgICAgIC8vIFRPRE8oYmpvcmRhbik6IHB1dCB0aGlzIHRydXRoIGluIGNvbnN0cnVjdG9yIGxpa2Ugb3RoZXIgYXR0cnNcbiAgICAgIGJsb2NrLmlzV2Fsa2FibGUgPSBibG9jay5pc1dhbGthYmxlIHx8ICFpc0FjdGlvblBsYW5lO1xuICAgICAgcmVzdWx0LnB1c2goYmxvY2spO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpc1NvbHZlZCgpICB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsTGV2ZWxEYXRhLnZlcmlmaWNhdGlvbkZ1bmN0aW9uKHRoaXMpO1xuICB9XG5cbiAgZ2V0SG91c2VCb3R0b21SaWdodCgpICB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsTGV2ZWxEYXRhLmhvdXNlQm90dG9tUmlnaHQ7XG4gIH1cblxuICAgIC8vIFZlcmlmaWNhdGlvbnNcbiAgaXNQbGF5ZXJOZXh0VG8oYmxvY2tUeXBlKSB7XG4gICAgdmFyIHBvc2l0aW9uO1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcblxuICAgIC8vIGFib3ZlXG4gICAgcG9zaXRpb24gPSBbdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0sIHRoaXMucGxheWVyLnBvc2l0aW9uWzFdIC0gMV07XG4gICAgaWYgKHRoaXMuaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gYmVsb3dcbiAgICBwb3NpdGlvbiA9IFt0aGlzLnBsYXllci5wb3NpdGlvblswXSwgdGhpcy5wbGF5ZXIucG9zaXRpb25bMV0gKyAxXTtcbiAgICBpZiAodGhpcy5pc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBsZWZ0XG4gICAgcG9zaXRpb24gPSBbdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0gKyAxLCB0aGlzLnBsYXllci5wb3NpdGlvblsxXV07XG4gICAgaWYgKHRoaXMuaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmlnaHRcbiAgICBwb3NpdGlvbiA9IFt0aGlzLnBsYXllci5wb3NpdGlvblswXSAtIDEsIHRoaXMucGxheWVyLnBvc2l0aW9uWzFdXTtcbiAgICBpZiAodGhpcy5pc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXRJbnZlbnRvcnlBbW91bnQoaW52ZW50b3J5VHlwZSkge1xuICAgIHJldHVybiB0aGlzLnBsYXllci5pbnZlbnRvcnlbaW52ZW50b3J5VHlwZV0gfHwgMDtcbiAgfVxuXG5cbiAgZ2V0SW52ZW50b3J5VHlwZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGxheWVyLmludmVudG9yeSk7XG4gIH1cblxuICBjb3VudE9mVHlwZU9uTWFwKGJsb2NrVHlwZSkge1xuICAgIHZhciBjb3VudCA9IDAsXG4gICAgICAgIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5wbGFuZUFyZWEoKTsgKytpKSB7XG4gICAgICBpZiAoYmxvY2tUeXBlID09IHRoaXMuYWN0aW9uUGxhbmVbaV0uYmxvY2tUeXBlKSB7XG4gICAgICAgICsrY291bnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb3VudDtcbiAgfVxuXG4gIGlzUGxheWVyQXQocG9zaXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnBsYXllci5wb3NpdGlvblswXSA9PT0gcG9zaXRpb25bMF0gJiZcbiAgICAgICAgICB0aGlzLnBsYXllci5wb3NpdGlvblsxXSA9PT0gcG9zaXRpb25bMV07XG4gIH1cblxuICBzb2x1dGlvbk1hcE1hdGNoZXNSZXN1bHRNYXAoc29sdXRpb25NYXApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxhbmVBcmVhKCk7IGkrKykge1xuICAgICAgdmFyIHNvbHV0aW9uSXRlbVR5cGUgPSBzb2x1dGlvbk1hcFtpXTtcblxuICAgICAgLy8gXCJcIiBvbiB0aGUgc29sdXRpb24gbWFwIG1lYW5zIHdlIGRvbnQgY2FyZSB3aGF0J3MgYXQgdGhhdCBzcG90XG4gICAgICBpZiAoc29sdXRpb25JdGVtVHlwZSAhPT0gXCJcIikge1xuICAgICAgICBpZiAoc29sdXRpb25JdGVtVHlwZSA9PT0gXCJlbXB0eVwiKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmFjdGlvblBsYW5lW2ldLmlzRW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc29sdXRpb25JdGVtVHlwZSA9PT0gXCJhbnlcIikge1xuICAgICAgICAgIGlmICh0aGlzLmFjdGlvblBsYW5lW2ldLmlzRW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aW9uUGxhbmVbaV0uYmxvY2tUeXBlICE9PSBzb2x1dGlvbkl0ZW1UeXBlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZ2V0VG50KCkge1xuICAgIHZhciB0bnQgPSBbXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgIGZvcih2YXIgeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoW3gseV0pO1xuICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2luZGV4XTtcbiAgICAgICAgaWYoYmxvY2suYmxvY2tUeXBlID09PSBcInRudFwiKSB7XG4gICAgICAgICAgdG50LnB1c2goW3gseV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0bnQ7XG4gIH1cblxuICBnZXRVbnBvd2VyZWRSYWlscygpIHtcbiAgICB2YXIgdW5wb3dlcmVkUmFpbHMgPSBbXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgIGZvcih2YXIgeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoW3gseV0pO1xuICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2luZGV4XTtcbiAgICAgICAgaWYoYmxvY2suYmxvY2tUeXBlLnN1YnN0cmluZygwLDcpID09IFwicmFpbHNVblwiKSB7XG4gICAgICAgICAgdW5wb3dlcmVkUmFpbHMucHVzaChbeCx5XSwgXCJyYWlsc1Bvd2VyZWRcIiArIHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmJsb2NrVHlwZS5zdWJzdHJpbmcoMTQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bnBvd2VyZWRSYWlscztcbiAgfVxuXG4gIGdldE1vdmVGb3J3YXJkUG9zaXRpb24oKSB7XG4gICAgdmFyIGN4ID0gdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0sXG4gICAgICAgIGN5ID0gdGhpcy5wbGF5ZXIucG9zaXRpb25bMV07XG5cbiAgICBzd2l0Y2ggKHRoaXMucGxheWVyLmZhY2luZykge1xuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uVXA6XG4gICAgICAgIC0tY3k7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5Eb3duOlxuICAgICAgICArK2N5O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uTGVmdDpcbiAgICAgICAgLS1jeDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0OlxuICAgICAgICArK2N4O1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gW2N4LCBjeV07ICAgIFxuICB9XG5cbiAgaXNGb3J3YXJkQmxvY2tPZlR5cGUoYmxvY2tUeXBlKSB7XG4gICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG5cbiAgICBsZXQgYWN0aW9uSXNFbXB0eSA9IHRoaXMuaXNCbG9ja09mVHlwZU9uUGxhbmUoYmxvY2tGb3J3YXJkUG9zaXRpb24sIFwiZW1wdHlcIiwgdGhpcy5hY3Rpb25QbGFuZSk7XG5cbiAgICBpZiAoYmxvY2tUeXBlID09PSAnJyAmJiBhY3Rpb25Jc0VtcHR5KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uSXNFbXB0eSA/XG4gICAgICAgIHRoaXMuaXNCbG9ja09mVHlwZU9uUGxhbmUoYmxvY2tGb3J3YXJkUG9zaXRpb24sIGJsb2NrVHlwZSwgdGhpcy5ncm91bmRQbGFuZSkgOlxuICAgICAgICB0aGlzLmlzQmxvY2tPZlR5cGVPblBsYW5lKGJsb2NrRm9yd2FyZFBvc2l0aW9uLCBibG9ja1R5cGUsIHRoaXMuYWN0aW9uUGxhbmUpO1xuICB9XG5cbiAgaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSAge1xuICAgICAgcmV0dXJuIHRoaXMuaXNCbG9ja09mVHlwZU9uUGxhbmUocG9zaXRpb24sIGJsb2NrVHlwZSwgdGhpcy5hY3Rpb25QbGFuZSk7XG4gIH1cblxuICBpc0Jsb2NrT2ZUeXBlT25QbGFuZShwb3NpdGlvbiwgYmxvY2tUeXBlLCBwbGFuZSkgIHtcbiAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIHBvc2l0aW9uWzBdO1xuICAgICAgaWYgKGJsb2NrSW5kZXggPj0gMCAmJiBibG9ja0luZGV4IDwgdGhpcy5wbGFuZUFyZWEoKSkge1xuXG4gICAgICAgICAgaWYgKGJsb2NrVHlwZSA9PSBcImVtcHR5XCIpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gIHBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHk7XG4gICAgICAgICAgfSBlbHNlIGlmIChibG9ja1R5cGUgPT0gXCJ0cmVlXCIpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gcGxhbmVbYmxvY2tJbmRleF0uZ2V0SXNUcmVlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gKGJsb2NrVHlwZSA9PSBwbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUpO1xuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlzUGxheWVyU3RhbmRpbmdJbldhdGVyKCl7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHRoaXMucGxheWVyLnBvc2l0aW9uWzFdKSArIHRoaXMucGxheWVyLnBvc2l0aW9uWzBdO1xuICAgIHJldHVybiB0aGlzLmdyb3VuZFBsYW5lW2Jsb2NrSW5kZXhdLmJsb2NrVHlwZSA9PT0gXCJ3YXRlclwiO1xuICB9XG5cbiAgaXNQbGF5ZXJTdGFuZGluZ0luTGF2YSgpIHtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgodGhpcy5wbGF5ZXIucG9zaXRpb25bMV0pICsgdGhpcy5wbGF5ZXIucG9zaXRpb25bMF07XG4gICAgcmV0dXJuIHRoaXMuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlID09PSBcImxhdmFcIjtcbiAgfVxuXG4gIGNvb3JkaW5hdGVzVG9JbmRleChjb29yZGluYXRlcyl7XG4gICAgcmV0dXJuIHRoaXMueVRvSW5kZXgoY29vcmRpbmF0ZXNbMV0pICsgY29vcmRpbmF0ZXNbMF07XG4gIH1cblxuICBjaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwb3NpdGlvbiwgb2JqZWN0QXJyYXkpe1xuICAgIGlmICgoIWJsb2NrVHlwZSAmJiAodGhpcy5hY3Rpb25QbGFuZVt0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChwb3NpdGlvbildLmJsb2NrVHlwZSAhPT0gXCJcIikpfHwgdGhpcy5pc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpKSB7XG4gICAgICBvYmplY3RBcnJheS5wdXNoKFt0cnVlLCBwb3NpdGlvbl0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICBvYmplY3RBcnJheS5wdXNoKFtmYWxzZSwgbnVsbF0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhvdXNlR3JvdW5kVG9GbG9vckhlbHBlcihwb3NpdGlvbiwgd29vbFR5cGUsIGFycmF5Q2hlY2spXG4gIHtcbiAgICB2YXIgY2hlY2tBY3Rpb25CbG9jayxcbiAgICAgICAgY2hlY2tHcm91bmRCbG9jayxcbiAgICAgICAgcG9zQWJvdmUsIFxuICAgICAgICBwb3NCZWxvdyxcbiAgICAgICAgcG9zUmlnaHQsXG4gICAgICAgIHBvc0xlZnQsXG4gICAgICAgIGNoZWNrSW5kZXggPSAwLFxuICAgICAgICBhcnJheSA9IGFycmF5Q2hlY2s7XG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMl0pICsgcG9zaXRpb25bMV07XG5cbiAgICAgICAgaWYoaW5kZXggPT09IDQ0KVxuICAgICAgICB7XG4gICAgICAgICAgaW5kZXggPSA0NDtcbiAgICAgICAgfVxuXG4gICAgcG9zQWJvdmUgPSAgWzAsIHBvc2l0aW9uWzFdLCBwb3NpdGlvblsyXSArIDFdO1xuICAgIHBvc0Fib3ZlWzBdID0gdGhpcy55VG9JbmRleChwb3NBYm92ZVsyXSkgKyBwb3NBYm92ZVsxXTtcblxuICAgIHBvc0JlbG93ID0gIFswLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0gLSAxXTtcbiAgICBwb3NCZWxvd1swXSA9IHRoaXMueVRvSW5kZXgocG9zQmVsb3dbMl0pICsgcG9zQmVsb3dbMV07XG5cbiAgICBwb3NSaWdodCA9ICBbMCwgcG9zaXRpb25bMV0gKyAxLCBwb3NpdGlvblsyXV07XG4gICAgcG9zUmlnaHRbMF0gPSB0aGlzLnlUb0luZGV4KHBvc1JpZ2h0WzJdKSArIHBvc1JpZ2h0WzFdO1xuICAgIFxuICAgIHBvc0xlZnQgPSAgWzAsIHBvc2l0aW9uWzFdIC0gMSwgcG9zaXRpb25bMl1dO1xuICAgIHBvc1JpZ2h0WzBdID0gdGhpcy55VG9JbmRleChwb3NSaWdodFsyXSkgKyBwb3NSaWdodFsxXTtcblxuICAgIGNoZWNrQWN0aW9uQmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2luZGV4XTtcbiAgICBjaGVja0dyb3VuZEJsb2NrID0gdGhpcy5ncm91bmRQbGFuZVtpbmRleF07XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKSB7XG4gICAgICBpZihhcnJheVtpXVswXSA9PT0gaW5kZXgpIHtcbiAgICAgICAgY2hlY2tJbmRleCA9IC0xO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihjaGVja0FjdGlvbkJsb2NrLmJsb2NrVHlwZSAhPT0gXCJcIikge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBlbHNlIGlmKGFycmF5Lmxlbmd0aCA+IDAgJiYgY2hlY2tJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBhcnJheS5wdXNoKHBvc2l0aW9uKTtcbiAgICBhcnJheS5jb25jYXQodGhpcy5ob3VzZUdyb3VuZFRvRmxvb3JIZWxwZXIocG9zQWJvdmUsIHdvb2xUeXBlLCBhcnJheSkpO1xuICAgIGFycmF5LmNvbmNhdCh0aGlzLmhvdXNlR3JvdW5kVG9GbG9vckhlbHBlcihwb3NCZWxvdywgd29vbFR5cGUsIGFycmF5KSk7XG4gICAgYXJyYXkuY29uY2F0KHRoaXMuaG91c2VHcm91bmRUb0Zsb29ySGVscGVyKHBvc1JpZ2h0LCB3b29sVHlwZSwgYXJyYXkpKTtcbiAgICBhcnJheS5jb25jYXQodGhpcy5ob3VzZUdyb3VuZFRvRmxvb3JIZWxwZXIocG9zTGVmdCwgd29vbFR5cGUsIGFycmF5KSk7XG5cbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICBob3VzZUdyb3VuZFRvRmxvb3JCbG9ja3Moc3RhcnRpbmdQb3NpdGlvbikge1xuICAgIC8vY2hlY2tDYXJkaW5hbERpcmVjdGlvbnMgZm9yIGFjdGlvbmJsb2Nrcy5cbiAgICAvL0lmIG5vIGFjdGlvbiBibG9jayBhbmQgc3F1YXJlIGlzbid0IHRoZSB0eXBlIHdlIHdhbnQuXG4gICAgLy9DaGFuZ2UgaXQuXG4gICAgdmFyIHdvb2xUeXBlID0gXCJ3b29sX29yYW5nZVwiO1xuXG4gICAgLy9QbGFjZSB0aGlzIGJsb2NrIGhlcmVcbiAgICAvL3RoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgc3RhcnRpbmdQb3NpdGlvblswXSwgc3RhcnRpbmdQb3NpdGlvblsxXSwgd29vbFR5cGUpO1xuICAgIHZhciBoZWxwZXJTdGFydERhdGEgPSBbMCwgc3RhcnRpbmdQb3NpdGlvblswXSwgc3RhcnRpbmdQb3NpdGlvblsxXV07XG4gICAgcmV0dXJuIHRoaXMuaG91c2VHcm91bmRUb0Zsb29ySGVscGVyKGhlbHBlclN0YXJ0RGF0YSwgd29vbFR5cGUsIFtdKTtcbiAgfVxuXG4gIGdldEFsbEJvcmRlcmluZ1Bvc2l0aW9uTm90T2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpIHtcbiAgICB2YXIgc3Vycm91bmRpbmdCbG9ja3MgPSB0aGlzLmdldEFsbEJvcmRlcmluZ1Bvc2l0aW9uKHBvc2l0aW9uLCBudWxsKTtcbiAgICBmb3IodmFyIGIgPSAxOyBiIDwgc3Vycm91bmRpbmdCbG9ja3MubGVuZ3RoOyArK2IpIHtcbiAgICAgIGlmKHN1cnJvdW5kaW5nQmxvY2tzW2JdWzBdICYmIHRoaXMuYWN0aW9uUGxhbmVbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoc3Vycm91bmRpbmdCbG9ja3NbYl1bMV0pXS5ibG9ja1R5cGUgPT0gYmxvY2tUeXBlKSB7XG4gICAgICAgIHN1cnJvdW5kaW5nQmxvY2tzW2JdWzBdID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdXJyb3VuZGluZ0Jsb2NrcztcbiAgfVxuXG4gIGdldEFsbEJvcmRlcmluZ1Bvc2l0aW9uKHBvc2l0aW9uLCBibG9ja1R5cGUpIHtcbiAgICB2YXIgcDtcbiAgICB2YXIgYWxsRm91bmRPYmplY3RzID0gW2ZhbHNlXTtcbiAgICAvL0NoZWNrIGFsbCA4IGRpcmVjdGlvbnNcblxuICAgIC8vVG9wIFJpZ2h0XG4gICAgcCA9IFtwb3NpdGlvblswXSArIDEsIHBvc2l0aW9uWzFdICsgMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL1RvcCBMZWZ0XG4gICAgcCA9IFtwb3NpdGlvblswXSAtIDEsIHBvc2l0aW9uWzFdICsgMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL0JvdCBSaWdodFxuICAgIHAgPSBbcG9zaXRpb25bMF0gKyAxLCBwb3NpdGlvblsxXSAtIDFdO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG4gICAgLy9Cb3QgTGVmdFxuICAgIHAgPSBbcG9zaXRpb25bMF0gLSAxLCBwb3NpdGlvblsxXSAtIDFdO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvL0NoZWNrIGNhcmRpbmFsIERpcmVjdGlvbnNcbiAgICAvL1RvcFxuICAgIHAgPSBbcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdICsgMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL0JvdFxuICAgIHAgPSBbcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdIC0gMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL1JpZ2h0XG4gICAgcCA9IFtwb3NpdGlvblswXSArIDEsIHBvc2l0aW9uWzFdXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuICAgIC8vTGVmdFxuICAgIHAgPSBbcG9zaXRpb25bMF0gLSAxLCBwb3NpdGlvblsxXV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBhbGxGb3VuZE9iamVjdHM7XG4gIH1cblxuICBnZXRBbGxCb3JkZXJpbmdQbGF5ZXIoYmxvY2tUeXBlKXtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxCb3JkZXJpbmdQb3NpdGlvbih0aGlzLnBsYXllci5wb3NpdGlvbiwgYmxvY2tUeXBlKTtcbiAgfVxuXG4gIGlzUGxheWVyU3RhbmRpbmdOZWFyQ3JlZXBlcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxCb3JkZXJpbmdQbGF5ZXIoXCJjcmVlcGVyXCIpO1xuICB9XG5cbiAgZ2V0TWluZWNhcnRUcmFjaygpIHtcbiAgICB2YXIgdHJhY2sgPSBbXTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsMl0sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsM10sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsNF0sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsNV0sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsNl0sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsN10sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInR1cm5fbGVmdFwiLCBbMyw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFs0LDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzUsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbNiw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFs3LDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzgsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbOSw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFsxMCw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFsxMSw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICByZXR1cm4gdHJhY2s7XG59XG5cbiAgY2FuTW92ZUZvcndhcmQoKSB7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdKSArIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzBdO1xuICAgIGxldCBbeCwgeV0gPSBbYmxvY2tGb3J3YXJkUG9zaXRpb25bMF0sIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdXTtcblxuICAgIGlmICh0aGlzLmluQm91bmRzKHgsIHkpKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzV2Fsa2FibGUgfHxcbiAgICAgICAgICAgICAgICh0aGlzLnBsYXllci5pc09uQmxvY2sgJiYgIXRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGNhblBsYWNlQmxvY2soKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjYW5QbGFjZUJsb2NrRm9yd2FyZCgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXIuaXNPbkJsb2NrKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0UGxhbmVUb1BsYWNlT24odGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCkpICE9PSBudWxsO1xuICB9XG5cbiAgZ2V0UGxhbmVUb1BsYWNlT24oY29vcmRpbmF0ZXMpIHtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoY29vcmRpbmF0ZXNbMV0pICsgY29vcmRpbmF0ZXNbMF07XG4gICAgbGV0IFt4LCB5XSA9IFtjb29yZGluYXRlc1swXSwgY29vcmRpbmF0ZXNbMV1dO1xuXG4gICAgaWYgKHRoaXMuaW5Cb3VuZHMoeCwgeSkpIHtcbiAgICAgIGxldCBhY3Rpb25CbG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF07XG4gICAgICBpZiAoYWN0aW9uQmxvY2suaXNQbGFjYWJsZSkge1xuICAgICAgICBsZXQgZ3JvdW5kQmxvY2sgPSB0aGlzLmdyb3VuZFBsYW5lW2Jsb2NrSW5kZXhdO1xuICAgICAgICBpZiAoZ3JvdW5kQmxvY2suaXNQbGFjYWJsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdyb3VuZFBsYW5lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGlvblBsYW5lO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY2FuRGVzdHJveUJsb2NrRm9yd2FyZCgpIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMucGxheWVyLmlzT25CbG9jaykge1xuICAgICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoYmxvY2tGb3J3YXJkUG9zaXRpb25bMV0pICsgYmxvY2tGb3J3YXJkUG9zaXRpb25bMF07XG4gICAgICBsZXQgW3gsIHldID0gW2Jsb2NrRm9yd2FyZFBvc2l0aW9uWzBdLCBibG9ja0ZvcndhcmRQb3NpdGlvblsxXV07XG5cbiAgICAgIGlmICh0aGlzLmluQm91bmRzKHgsIHkpKSB7XG4gICAgICAgIGxldCBibG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF07XG4gICAgICAgIHJlc3VsdCA9ICFibG9jay5pc0VtcHR5ICYmIChibG9jay5pc0Rlc3Ryb3lhYmxlIHx8IGJsb2NrLmlzVXNhYmxlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgbW92ZUZvcndhcmQoKSB7XG4gICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgdGhpcy5tb3ZlVG8oYmxvY2tGb3J3YXJkUG9zaXRpb24pO1xuICB9XG5cbiAgbW92ZVRvKHBvc2l0aW9uKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIHBvc2l0aW9uWzBdO1xuXG4gICAgdGhpcy5wbGF5ZXIucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBpZiAodGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5KSB7XG4gICAgICB0aGlzLnBsYXllci5pc09uQmxvY2sgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB0dXJuTGVmdCgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGxheWVyLmZhY2luZykge1xuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uVXA6XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5MZWZ0O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uTGVmdDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLkRvd247XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5Eb3duOlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5SaWdodDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLlVwO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0dXJuUmlnaHQoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBsYXllci5mYWNpbmcpIHtcbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlVwOlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5SaWdodDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLkRvd247XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5Eb3duOlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uTGVmdDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkxlZnQ6XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5VcDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcGxhY2VCbG9jayhibG9ja1R5cGUpIHtcbiAgICBsZXQgYmxvY2tQb3NpdGlvbiA9IHRoaXMucGxheWVyLnBvc2l0aW9uO1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChibG9ja1Bvc2l0aW9uWzFdKSArIGJsb2NrUG9zaXRpb25bMF07XG4gICAgdmFyIHNob3VsZFBsYWNlID0gZmFsc2U7XG5cbiAgICBzd2l0Y2ggKGJsb2NrVHlwZSkge1xuICAgICAgY2FzZSBcImNyb3BXaGVhdFwiOlxuICAgICAgICBzaG91bGRQbGFjZSA9IHRoaXMuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlID09PSBcImZhcm1sYW5kV2V0XCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzaG91bGRQbGFjZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRQbGFjZSA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIGJsb2NrID0gbmV3IExldmVsQmxvY2soYmxvY2tUeXBlKTtcblxuICAgICAgdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XSA9IGJsb2NrO1xuICAgICAgdGhpcy5wbGF5ZXIuaXNPbkJsb2NrID0gIWJsb2NrLmlzV2Fsa2FibGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNob3VsZFBsYWNlO1xuICB9XG5cbiAgcGxhY2VCbG9ja0ZvcndhcmQoYmxvY2tUeXBlLCB0YXJnZXRQbGFuZSkge1xuICAgIGxldCBibG9ja1Bvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrUG9zaXRpb25bMV0pICsgYmxvY2tQb3NpdGlvblswXTtcblxuICAgIC8vZm9yIHBsYWNpbmcgd2V0bGFuZCBmb3IgY3JvcHMgaW4gZnJlZSBwbGF5XG4gICAgaWYoYmxvY2tUeXBlID09PSBcIndhdGVyaW5nXCIpIHtcbiAgICAgIGJsb2NrVHlwZSA9IFwiZmFybWxhbmRXZXRcIjtcbiAgICAgIHRhcmdldFBsYW5lID0gdGhpcy5ncm91bmRQbGFuZTtcbiAgICB9XG5cbiAgICB0YXJnZXRQbGFuZVtibG9ja0luZGV4XSA9IG5ldyBMZXZlbEJsb2NrKGJsb2NrVHlwZSk7XG4gIH1cblxuICBkZXN0cm95QmxvY2socG9zaXRpb24pIHtcbiAgICB2YXIgaSxcbiAgICAgICAgYmxvY2sgPSBudWxsO1xuXG4gICAgbGV0IGJsb2NrUG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoYmxvY2tQb3NpdGlvblsxXSkgKyBibG9ja1Bvc2l0aW9uWzBdO1xuICAgIGxldCBbeCwgeV0gPSBbYmxvY2tQb3NpdGlvblswXSwgYmxvY2tQb3NpdGlvblsxXV07XG4gICAgXG4gICAgaWYgKHRoaXMuaW5Cb3VuZHMoeCwgeSkpIHtcbiAgICAgIGJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XTtcbiAgICAgIGlmIChibG9jayAhPT0gbnVsbCkge1xuICAgICAgICBibG9jay5wb3NpdGlvbiA9IFt4LCB5XTtcblxuICAgICAgICBpZiAoYmxvY2suaXNEZXN0cm95YWJsZSkge1xuICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0gPSBuZXcgTGV2ZWxCbG9jayhcIlwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIGRlc3Ryb3lCbG9ja0ZvcndhcmQoKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNob3VsZEFkZFRvSW52ZW50b3J5ID0gdHJ1ZSxcbiAgICAgICAgYmxvY2sgPSBudWxsO1xuXG4gICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdKSArIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzBdO1xuICAgIGxldCBbeCwgeV0gPSBbYmxvY2tGb3J3YXJkUG9zaXRpb25bMF0sIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdXTtcbiAgICBcbiAgICBpZiAodGhpcy5pbkJvdW5kcyh4LCB5KSkge1xuICAgICAgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdO1xuICAgICAgaWYgKGJsb2NrICE9PSBudWxsKSB7XG4gICAgICAgIGJsb2NrLnBvc2l0aW9uID0gW3gsIHldO1xuICAgICAgICBsZXQgaW52ZW50b3J5VHlwZSA9IHRoaXMuZ2V0SW52ZW50b3J5VHlwZShibG9jay5ibG9ja1R5cGUpO1xuICAgICAgICB0aGlzLnBsYXllci5pbnZlbnRvcnlbaW52ZW50b3J5VHlwZV0gPVxuICAgICAgICAgICAgKHRoaXMucGxheWVyLmludmVudG9yeVtpbnZlbnRvcnlUeXBlXSB8fCAwKSArIDE7XG5cbiAgICAgICAgaWYgKGJsb2NrLmlzRGVzdHJveWFibGUpIHtcbiAgICAgICAgICB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdID0gbmV3IExldmVsQmxvY2soXCJcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBnZXRJbnZlbnRvcnlUeXBlKGJsb2NrVHlwZSkge1xuICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICBjYXNlIFwic2hlZXBcIjpcbiAgICAgICAgcmV0dXJuIFwid29vbFwiO1xuICAgICAgY2FzZSBcInN0b25lXCI6XG4gICAgICAgIHJldHVybiBcImNvYmJsZXN0b25lXCI7XG4gICAgICBjYXNlIFwidHJlZUFjYWNpYVwiOlxuICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgY2FzZSBcInRyZWVKdW5nbGVcIjpcbiAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICByZXR1cm4gXCJwbGFua3NcIiArIGJsb2NrVHlwZS5zdWJzdHJpbmcoNCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gYmxvY2tUeXBlO1xuICAgIH1cbiAgfVxuXG4gIHNvbHZlRk9XVHlwZUZvck1hcCgpIHtcbiAgICB2YXIgZW1pc3NpdmVzLFxuICAgICAgICBibG9ja3NUb1NvbHZlO1xuXG4gICAgZW1pc3NpdmVzID0gdGhpcy5nZXRBbGxFbWlzc2l2ZXMoKTtcbiAgICBibG9ja3NUb1NvbHZlID0gdGhpcy5maW5kQmxvY2tzQWZmZWN0ZWRCeUVtaXNzaXZlcyhlbWlzc2l2ZXMpO1xuXG4gICAgZm9yKHZhciBibG9jayBpbiBibG9ja3NUb1NvbHZlKSB7XG4gICAgICBpZihibG9ja3NUb1NvbHZlLmhhc093blByb3BlcnR5KGJsb2NrKSkge1xuICAgICAgICB0aGlzLnNvbHZlRk9XVHlwZUZvcihibG9ja3NUb1NvbHZlW2Jsb2NrXSwgZW1pc3NpdmVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzb2x2ZUZPV1R5cGVGb3IocG9zaXRpb24sIGVtaXNzaXZlcykge1xuICAgIHZhciBlbWlzc2l2ZXNUb3VjaGluZyxcbiAgICAgICAgdG9wTGVmdFF1YWQgPSBmYWxzZSxcbiAgICAgICAgYm90TGVmdFF1YWQgPSBmYWxzZSxcbiAgICAgICAgbGVmdFF1YWQgPSBmYWxzZSxcbiAgICAgICAgdG9wUmlnaHRRdWFkID0gZmFsc2UsXG4gICAgICAgIGJvdFJpZ2h0UXVhZCA9IGZhbHNlLFxuICAgICAgICByaWdodFF1YWQgPSBmYWxzZSxcbiAgICAgICAgdG9wUXVhZCA9IGZhbHNlLFxuICAgICAgICBib3RRdWFkID0gZmFsc2UsXG4gICAgICAgIGFuZ2xlID0gMCxcbiAgICAgICAgaW5kZXggPSB0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChwb3NpdGlvbiksXG4gICAgICAgIHgsXG4gICAgICAgIHk7XG5cbiAgICBlbWlzc2l2ZXNUb3VjaGluZyA9IHRoaXMuZmluZEVtaXNzaXZlc1RoYXRUb3VjaChwb3NpdGlvbiwgZW1pc3NpdmVzKTtcblxuICAgIGZvcih2YXIgdG9yY2ggaW4gZW1pc3NpdmVzVG91Y2hpbmcpIHtcbiAgICAgIHZhciBjdXJyZW50VG9yY2ggPSBlbWlzc2l2ZXNUb3VjaGluZ1t0b3JjaF07XG4gICAgICB5ID0gcG9zaXRpb25bMV07XG4gICAgICB4ID0gcG9zaXRpb25bMF07XG5cbiAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihjdXJyZW50VG9yY2hbMV0gLSBwb3NpdGlvblsxXSwgY3VycmVudFRvcmNoWzBdIC0gcG9zaXRpb25bMF0pO1xuICAgICAgLy9pbnZlcnRcbiAgICAgIGFuZ2xlID0gLWFuZ2xlO1xuICAgICAgLy9Ob3JtYWxpemUgdG8gYmUgYmV0d2VlbiAwIGFuZCAyKnBpXG4gICAgICBpZihhbmdsZSA8IDApIHtcbiAgICAgICAgYW5nbGUgKz0gMiAqIE1hdGguUEk7XG4gICAgICB9XG4gICAgICAvL2NvbnZlcnQgdG8gZGVncmVlcyBmb3Igc2ltcGxpY2l0eVxuICAgICAgYW5nbGUgKj0gMzYwIC8gKDIqTWF0aC5QSSk7XG5cbiAgICAgIC8vdG9wIHJpZ2h0XG4gICAgICBpZighcmlnaHRRdWFkICYmYW5nbGUgPiAzMi41ICYmIGFuZ2xlIDw9IDU3LjUpIHtcbiAgICAgICAgdG9wUmlnaHRRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfSW5Db3JuZXJfVG9wUmlnaHRcIiwgcHJlY2VkZW5jZTogMCB9KTtcbiAgICAgIH0vL3RvcCBsZWZ0XG4gICAgICBpZighbGVmdFF1YWQgJiZhbmdsZSA+IDEyMi41ICYmIGFuZ2xlIDw9IDE0Ny41KSB7XG4gICAgICAgIHRvcExlZnRRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfSW5Db3JuZXJfVG9wTGVmdFwiLCBwcmVjZWRlbmNlOiAwfSk7XG4gICAgICB9Ly9ib3QgbGVmdFxuICAgICAgaWYoIWxlZnRRdWFkICYmYW5nbGUgPiAyMTIuNSAmJiBhbmdsZSA8PSAyMzcuNSkge1xuICAgICAgICBib3RMZWZ0UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0luQ29ybmVyX0JvdHRvbUxlZnRcIiwgcHJlY2VkZW5jZTogMH0pO1xuICAgICAgfS8vYm90cmlnaHRcbiAgICAgIGlmKCFyaWdodFF1YWQgJiYgYW5nbGUgPiAzMDIuNSAmJiBhbmdsZSA8PSAzMTcuNSkge1xuICAgICAgICBib3RSaWdodFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9JbkNvcm5lcl9Cb3R0b21SaWdodFwiLCBwcmVjZWRlbmNlOiAwfSk7XG4gICAgICB9XG4gICAgICAvL3JpZ2h0XG4gICAgICBpZihhbmdsZSA+PSAzMjcuNSB8fCBhbmdsZSA8PSAzMi41KSB7XG4gICAgICAgIHJpZ2h0UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX1JpZ2h0XCIgLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgICB9Ly9ib3RcbiAgICAgIGlmKGFuZ2xlID4gMjM3LjUgJiYgYW5nbGUgPD0gMzAyLjUpIHtcbiAgICAgICAgYm90UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0JvdHRvbVwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgICB9XG4gICAgICAvL2xlZnRcbiAgICAgIGlmKGFuZ2xlID4gMTQ3LjUgJiYgYW5nbGUgPD0gMjEyLjUpIHtcbiAgICAgICAgbGVmdFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9MZWZ0XCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICAgIH1cbiAgICAgIC8vdG9wXG4gICAgICBpZihhbmdsZSA+IDU3LjUgJiYgYW5nbGUgPD0gMTIyLjUpIHtcbiAgICAgICAgdG9wUXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX1RvcFwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodG9wTGVmdFF1YWQgJiYgYm90TGVmdFF1YWQpIHtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0xlZnRcIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgIH1cbiAgICBpZih0b3BSaWdodFF1YWQgJiYgYm90UmlnaHRRdWFkKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9SaWdodFwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgfVxuICAgIGlmKHRvcExlZnRRdWFkICYmIHRvcFJpZ2h0UXVhZCkge1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfVG9wXCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICB9XG4gICAgaWYoYm90UmlnaHRRdWFkICYmIGJvdExlZnRRdWFkKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Cb3R0b21cIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgIH1cblxuICAgIC8vZnVsbHkgbGl0XG4gICAgaWYoIChib3RSaWdodFF1YWQgJiYgdG9wTGVmdFF1YWQpIHx8IChib3RMZWZ0UXVhZCAmJiB0b3BSaWdodFF1YWQpIHx8IGxlZnRRdWFkICYmIHJpZ2h0UXVhZCB8fCB0b3BRdWFkICYmIGJvdFF1YWQgfHwgKHJpZ2h0UXVhZCAmJiBib3RRdWFkICYmIHRvcExlZnRRdWFkKSB8fFxuICAgICAgICAoYm90UXVhZCAmJiB0b3BSaWdodFF1YWQgJiYgdG9wTGVmdFF1YWQpIHx8ICh0b3BRdWFkICYmIGJvdFJpZ2h0UXVhZCAmJiBib3RMZWZ0UXVhZCkgfHwgKGxlZnRRdWFkICYmIHRvcFJpZ2h0UXVhZCAmJiBib3RSaWdodFF1YWQpIHx8IChsZWZ0UXVhZCAmJiBib3RRdWFkICYmIHRvcFJpZ2h0UXVhZCkpIHtcbiAgICAgIHRoaXMuZm93UGxhbmVbaW5kZXhdID0gXCJcIjtcbiAgICB9XG5cbiAgICAvL2RhcmtlbmQgYm90bGVmdCBjb3JuZXJcbiAgICBlbHNlIGlmKCAoYm90UXVhZCAmJiBsZWZ0UXVhZCkgfHwgKGJvdFF1YWQgJiYgdG9wTGVmdFF1YWQpIHx8IChsZWZ0UXVhZCAmJiBib3RSaWdodFF1YWQpICl7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Cb3R0b21fTGVmdFwiLCBwcmVjZWRlbmNlOiAyfSk7XG4gICAgfVxuICAgIC8vZGFya2VuZCBib3RSaWdodCBjb3JuZXJcbiAgICBlbHNlIGlmKChib3RRdWFkICYmIHJpZ2h0UXVhZCkgfHwgKGJvdFF1YWQgJiYgdG9wUmlnaHRRdWFkKSB8fCAocmlnaHRRdWFkICYmIGJvdExlZnRRdWFkKSkge1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfQm90dG9tX1JpZ2h0XCIsIHByZWNlZGVuY2U6IDJ9KTtcbiAgICB9XG4gICAgLy9kYXJrZW5kIHRvcFJpZ2h0IGNvcm5lclxuICAgIGVsc2UgaWYoKHRvcFF1YWQgJiYgcmlnaHRRdWFkKSB8fCAodG9wUXVhZCAmJiBib3RSaWdodFF1YWQpIHx8IChyaWdodFF1YWQgJiYgdG9wTGVmdFF1YWQpKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Ub3BfUmlnaHRcIiwgcHJlY2VkZW5jZTogMn0pO1xuICAgIH1cbiAgICAvL2RhcmtlbmQgdG9wTGVmdCBjb3JuZXJcbiAgICBlbHNlIGlmKCh0b3BRdWFkICYmIGxlZnRRdWFkKSB8fCAodG9wUXVhZCAmJiBib3RMZWZ0UXVhZCkgfHwgKGxlZnRRdWFkICYmIHRvcFJpZ2h0UXVhZCkpe1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfVG9wX0xlZnRcIiwgcHJlY2VkZW5jZTogMn0pO1xuICAgIH1cbiAgfVxuXG4gIHB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIGZvd09iamVjdCkge1xuICAgIGlmIChmb3dPYmplY3QgPT09IFwiXCIpIHtcbiAgICAgIHRoaXMuZm93UGxhbmVbaW5kZXhdID0gXCJcIjtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGV4aXN0aW5nSXRlbSA9IHRoaXMuZm93UGxhbmVbaW5kZXhdO1xuICAgIGlmIChleGlzdGluZ0l0ZW0gJiYgZXhpc3RpbmdJdGVtLnByZWNlZGVuY2UgPiBmb3dPYmplY3QucHJlY2VkZW5jZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZvd1BsYW5lW2luZGV4XSA9IGZvd09iamVjdDtcbiAgfVxuXG4gIGdldEFsbEVtaXNzaXZlcygpe1xuICAgIHZhciBlbWlzc2l2ZXMgPSBbXTtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChbeCx5XSk7XG4gICAgICAgIGlmKCF0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5pc0VtcHR5ICYmIHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmlzRW1pc3NpdmUgfHwgdGhpcy5ncm91bmRQbGFuZVtpbmRleF0uaXNFbWlzc2l2ZSAmJiB0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5pc0VtcHR5ICkge1xuICAgICAgICAgIGVtaXNzaXZlcy5wdXNoKFt4LHldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZW1pc3NpdmVzO1xuICB9XG5cbiAgZmluZEJsb2Nrc0FmZmVjdGVkQnlFbWlzc2l2ZXMoZW1pc3NpdmVzKSB7XG4gICAgdmFyIGJsb2Nrc1RvdWNoZWRCeUVtaXNzaXZlcyA9IHt9O1xuICAgIC8vZmluZCBlbWlzc2l2ZXMgdGhhdCBhcmUgY2xvc2UgZW5vdWdoIHRvIGxpZ2h0IHVzLlxuICAgIGZvcih2YXIgdG9yY2ggaW4gZW1pc3NpdmVzKVxuICAgIHtcbiAgICAgIHZhciBjdXJyZW50VG9yY2ggPSBlbWlzc2l2ZXNbdG9yY2hdO1xuICAgICAgbGV0IHkgPSBjdXJyZW50VG9yY2hbMV07XG4gICAgICBsZXQgeCA9IGN1cnJlbnRUb3JjaFswXTtcbiAgICAgIGZvciAodmFyIHlJbmRleCA9IGN1cnJlbnRUb3JjaFsxXSAtIDI7IHlJbmRleCA8PSAoY3VycmVudFRvcmNoWzFdICsgMik7ICsreUluZGV4KSB7XG4gICAgICAgIGZvciAodmFyIHhJbmRleCA9IGN1cnJlbnRUb3JjaFswXSAtIDI7IHhJbmRleCA8PSAoY3VycmVudFRvcmNoWzBdICsgMik7ICsreEluZGV4KSB7XG5cbiAgICAgICAgICAvL0Vuc3VyZSB3ZSdyZSBsb29raW5nIGluc2lkZSB0aGUgbWFwXG4gICAgICAgICAgaWYoIXRoaXMuaW5Cb3VuZHMoeEluZGV4LCB5SW5kZXgpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL0lnbm9yZSB0aGUgaW5kZXhlcyBkaXJlY3RseSBhcm91bmQgdXMuXG4gICAgICAgICAgLy9UaGV5cmUgdGFrZW4gY2FyZSBvZiBvbiB0aGUgRk9XIGZpcnN0IHBhc3MgXG4gICAgICAgICAgaWYoICh5SW5kZXggPj0geSAtIDEgJiYgeUluZGV4IDw9IHkgKyAxKSAmJiAoeEluZGV4ID49IHggLSAxICYmIHhJbmRleCA8PSB4ICsgMSkgKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL3dlIHdhbnQgdW5pcXVlIGNvcGllcyBzbyB3ZSB1c2UgYSBtYXAuXG4gICAgICAgICAgYmxvY2tzVG91Y2hlZEJ5RW1pc3NpdmVzW3lJbmRleC50b1N0cmluZygpICsgeEluZGV4LnRvU3RyaW5nKCldID0gW3hJbmRleCx5SW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2Nrc1RvdWNoZWRCeUVtaXNzaXZlcztcbiAgfVxuXG4gIGZpbmRFbWlzc2l2ZXNUaGF0VG91Y2gocG9zaXRpb24sIGVtaXNzaXZlcykge1xuICAgIHZhciBlbWlzc2l2ZXNUaGF0VG91Y2ggPSBbXTtcbiAgICBsZXQgeSA9IHBvc2l0aW9uWzFdO1xuICAgIGxldCB4ID0gcG9zaXRpb25bMF07XG4gICAgLy9maW5kIGVtaXNzaXZlcyB0aGF0IGFyZSBjbG9zZSBlbm91Z2ggdG8gbGlnaHQgdXMuXG4gICAgZm9yICh2YXIgeUluZGV4ID0geSAtIDI7IHlJbmRleCA8PSAoeSArIDIpOyArK3lJbmRleCkge1xuICAgICAgZm9yICh2YXIgeEluZGV4ID0geCAtIDI7IHhJbmRleCA8PSAoeCArIDIpOyArK3hJbmRleCkge1xuXG4gICAgICAgIC8vRW5zdXJlIHdlJ3JlIGxvb2tpbmcgaW5zaWRlIHRoZSBtYXBcbiAgICAgICAgaWYoIXRoaXMuaW5Cb3VuZHMoeEluZGV4LCB5SW5kZXgpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL0lnbm9yZSB0aGUgaW5kZXhlcyBkaXJlY3RseSBhcm91bmQgdXMuIFxuICAgICAgICBpZiggKHlJbmRleCA+PSB5IC0gMSAmJiB5SW5kZXggPD0geSArIDEpICYmICh4SW5kZXggPj0geCAtIDEgJiYgeEluZGV4IDw9IHggKyAxKSApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcih2YXIgdG9yY2ggaW4gZW1pc3NpdmVzKSB7XG4gICAgICAgICAgaWYoZW1pc3NpdmVzW3RvcmNoXVswXSA9PT0geEluZGV4ICYmIGVtaXNzaXZlc1t0b3JjaF1bMV0gPT09IHlJbmRleCkge1xuICAgICAgICAgICAgZW1pc3NpdmVzVGhhdFRvdWNoLnB1c2goZW1pc3NpdmVzW3RvcmNoXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVtaXNzaXZlc1RoYXRUb3VjaDtcbiAgfVxuXG4gIGNvbXB1dGVGb3dQbGFuZSgpIHtcbiAgICB2YXIgeCwgeTtcblxuICAgIHRoaXMuZm93UGxhbmUgPSBbXTtcbiAgICBpZiAodGhpcy5pc0RheXRpbWUpIHtcbiAgICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgICAgLy8gdGhpcy5mb3dQbGFuZS5wdXNoW1wiXCJdOyAvLyBub29wIGFzIG9yaWdpbmFsbHkgd3JpdHRlblxuICAgICAgICAgIC8vIFRPRE8oYmpvcmRhbikgY29tcGxldGVseSByZW1vdmU/XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29tcHV0ZSB0aGUgZm9nIG9mIHdhciBmb3IgbGlnaHQgZW1pdHRpbmcgYmxvY2tzXG4gICAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICAgIHRoaXMuZm93UGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfQ2VudGVyXCIgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9zZWNvbmQgcGFzcyBmb3IgcGFydGlhbCBsaXQgc3F1YXJlc1xuICAgICAgdGhpcy5zb2x2ZUZPV1R5cGVGb3JNYXAoKTtcblxuICAgICAgZm9yICh5ID0gMDsgeSA8IHRoaXMucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgICBmb3IgKHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoeSkgKyB4O1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICh0aGlzLmdyb3VuZFBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1pc3NpdmUgJiYgdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5IHx8XG4gICAgICAgICAgICAoIXRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSAmJiB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1pc3NpdmUpKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyRm93QXJvdW5kKHgsIHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICB9XG4gIH1cblxuICBjbGVhckZvd0Fyb3VuZCh4LCB5KSB7XG4gICAgdmFyIG94LCBveTtcblxuICAgIGZvciAob3kgPSAtMTsgb3kgPD0gMTsgKytveSkge1xuICAgICAgZm9yIChveCA9IC0xOyBveCA8PSAxOyArK294KSB7XG4gICAgICAgIHRoaXMuY2xlYXJGb3dBdCh4ICsgb3gsIHkgKyBveSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2xlYXJGb3dBdCh4LCB5KSB7XG4gICAgaWYgKHggPj0gMCAmJiB4IDwgdGhpcy5wbGFuZVdpZHRoICYmIHkgPj0gMCAmJiB5IDwgdGhpcy5wbGFuZUhlaWdodCkge1xuICAgICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHkpICsgeDtcbiAgICAgIHRoaXMuZm93UGxhbmVbYmxvY2tJbmRleF0gPSBcIlwiO1xuICAgIH1cbiAgfVxuXG4gIGNvbXB1dGVTaGFkaW5nUGxhbmUoKSB7XG4gICAgdmFyIHgsXG4gICAgICAgIHksXG4gICAgICAgIGluZGV4LFxuICAgICAgICBoYXNMZWZ0LFxuICAgICAgICBoYXNSaWdodDtcblxuICAgIHRoaXMuc2hhZGluZ1BsYW5lID0gW107XG5cbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnBsYW5lQXJlYSgpOyArK2luZGV4KSB7XG4gICAgICB4ID0gaW5kZXggJSB0aGlzLnBsYW5lV2lkdGg7XG4gICAgICB5ID0gTWF0aC5mbG9vcihpbmRleCAvIHRoaXMucGxhbmVXaWR0aCk7XG5cbiAgICAgIGhhc0xlZnQgPSBmYWxzZTtcbiAgICAgIGhhc1JpZ2h0ID0gZmFsc2U7XG4gICAgICBcbiAgICAgIGlmICh0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5pc0VtcHR5IHx8IHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmlzVHJhbnNwYXJlbnQpIHtcbiAgICAgICAgaWYgKHkgPT09IDApIHtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0JvdHRvbScgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeSA9PT0gdGhpcy5wbGFuZUhlaWdodCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1RvcCcgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfUmlnaHQnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHggPT09IHRoaXMucGxhbmVXaWR0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0xlZnQnIH0pO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoeCA8IHRoaXMucGxhbmVXaWR0aCAtIDEgJiYgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHggKyAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgIC8vIG5lZWRzIGEgbGVmdCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfTGVmdCcgfSk7XG4gICAgICAgICAgaGFzTGVmdCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeCA+IDAgJiYgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHggLSAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgIC8vIG5lZWRzIGEgcmlnaHQgc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1JpZ2h0JyB9KTtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ1NoYWRvd19QYXJ0c19GYWRlX2Jhc2UucG5nJyB9KTtcblxuICAgICAgICAgIGlmICh5ID4gMCAmJiB4ID4gMCAmJiB0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSAtIDEpICsgeCAtIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ1NoYWRvd19QYXJ0c19GYWRlX3RvcC5wbmcnIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGhhc1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh5ID4gMCAmJiAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkgLSAxKSArIHhdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgLy8gbmVlZHMgYSBib3R0b20gc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0JvdHRvbScgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoeSA+IDApIHtcbiAgICAgICAgICBpZiAoeCA8IHRoaXMucGxhbmVXaWR0aCAtIDEgJiYgXG4gICAgICAgICAgICAgICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSAtIDEpICsgeCArIDFdLmdldElzRW1wdHlPckVudGl0eSgpICYmXG4gICAgICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHggKyAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgICAgLy8gbmVlZHMgYSBib3R0b20gbGVmdCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Cb3R0b21MZWZ0JyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWhhc1JpZ2h0ICYmIHggPiAwICYmICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSAtIDEpICsgeCAtIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgICAvLyBuZWVkcyBhIGJvdHRvbSByaWdodCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Cb3R0b21SaWdodCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHkgPCB0aGlzLnBsYW5lSGVpZ2h0IC0gMSkge1xuICAgICAgICAgIGlmICh4IDwgdGhpcy5wbGFuZVdpZHRoIC0gMSAmJiBcbiAgICAgICAgICAgICAgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5ICsgMSkgKyB4ICsgMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkgJiZcbiAgICAgICAgICAgICAgdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkpICsgeCArIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgICAvLyBuZWVkcyBhIGJvdHRvbSBsZWZ0IHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1RvcExlZnQnIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghaGFzUmlnaHQgJiYgeCA+IDAgJiYgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5ICsgMSkgKyB4IC0gMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAgIC8vIG5lZWRzIGEgYm90dG9tIHJpZ2h0IHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1RvcFJpZ2h0JyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIExldmVsQmxvY2sge1xuICBjb25zdHJ1Y3RvcihibG9ja1R5cGUpIHtcbiAgICB0aGlzLmJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcblxuICAgIC8vIERlZmF1bHQgdmFsdWVzIGFwcGx5IHRvIHNpbXBsZSwgYWN0aW9uLXBsYW5lIGRlc3Ryb3lhYmxlIGJsb2Nrc1xuICAgIHRoaXMuaXNFbnRpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmlzV2Fsa2FibGUgPSBmYWxzZTtcbiAgICB0aGlzLmlzRGVhZGx5ID0gZmFsc2U7XG4gICAgdGhpcy5pc1BsYWNhYmxlID0gZmFsc2U7IC8vIHdoZXRoZXIgYW5vdGhlciBibG9jayBjYW4gYmUgcGxhY2VkIGluIHRoaXMgYmxvY2sncyBzcG90XG4gICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVXNhYmxlID0gdHJ1ZTtcbiAgICB0aGlzLmlzRW1wdHkgPSBmYWxzZTtcbiAgICB0aGlzLmlzRW1pc3NpdmUgPSBmYWxzZTtcbiAgICB0aGlzLmlzVHJhbnNwYXJlbnQgPSBmYWxzZTtcblxuICAgIGlmIChibG9ja1R5cGUgPT09IFwiXCIpIHtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzUGxhY2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUubWF0Y2goJ3RvcmNoJykpIHtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzUGxhY2FibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmKGJsb2NrVHlwZS5zdWJzdHJpbmcoMCwgNSkgPT0gXCJyYWlsc1wiKVxuICAgIHtcbiAgICAgIHRoaXMuaXNFbnRpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJzaGVlcFwiKSB7XG4gICAgICB0aGlzLmlzRW50aXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcImNyZWVwZXJcIil7XG4gICAgICB0aGlzLmlzRW50aXR5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwiZ2xhc3NcIil7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwiYmVkcm9ja1wiKXtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJsYXZhXCIpIHtcbiAgICAgIHRoaXMuaXNFbWlzc2l2ZSA9IHRydWU7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0RlYWRseSA9IHRydWU7XG4gICAgICB0aGlzLmlzUGxhY2FibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJ3YXRlclwiKSB7XG4gICAgICB0aGlzLmlzUGxhY2FibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJ0b3JjaFwiKSB7XG4gICAgICB0aGlzLmlzRW1pc3NpdmUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0VudGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNUcmFuc3BhcmVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcImNyb3BXaGVhdFwiKSB7XG4gICAgICB0aGlzLmlzRW1pc3NpdmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNFbnRpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJ0bnRcIikge1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmKGJsb2NrVHlwZSA9PSBcImRvb3JcIikge1xuICAgICAgdGhpcy5pc0VudGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNUcmFuc3BhcmVudCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0SXNUcmVlKCkge1xuICAgIHJldHVybiAhIXRoaXMuYmxvY2tUeXBlLm1hdGNoKC9edHJlZS8pO1xuICB9XG5cbiAgZ2V0SXNFbXB0eU9yRW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLmlzRW1wdHkgfHwgdGhpcy5pc0VudGl0eTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmZyZWV6ZSh7XG4gICAgVXA6IDAsXG4gICAgUmlnaHQ6IDEsXG4gICAgRG93bjogMixcbiAgICBMZWZ0OiAzXG59KTtcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEFzc2V0TG9hZGVyIHtcbiAgY29uc3RydWN0b3IoY29udHJvbGxlcikge1xuICAgIHRoaXMuY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgdGhpcy5hdWRpb1BsYXllciA9IGNvbnRyb2xsZXIuYXVkaW9QbGF5ZXI7XG4gICAgdGhpcy5nYW1lID0gY29udHJvbGxlci5nYW1lO1xuICAgIHRoaXMuYXNzZXRSb290ID0gY29udHJvbGxlci5hc3NldFJvb3Q7XG5cbiAgICB0aGlzLmFzc2V0cyA9IHtcbiAgICAgIGVudGl0eVNoYWRvdzoge1xuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICBwYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQ2hhcmFjdGVyX1NoYWRvdy5wbmdgXG4gICAgICB9LFxuICAgICAgc2VsZWN0aW9uSW5kaWNhdG9yOiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TZWxlY3Rpb25fSW5kaWNhdG9yLnBuZ2BcbiAgICAgIH0sXG4gICAgICBzaGFkZUxheWVyOiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TaGFkZV9MYXllci5wbmdgXG4gICAgICB9LFxuICAgICAgdGFsbEdyYXNzOiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9UYWxsR3Jhc3MucG5nYFxuICAgICAgfSxcbiAgICAgIGZpbmlzaE92ZXJsYXk6IHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1doaXRlUmVjdC5wbmdgXG4gICAgICB9LFxuICAgICAgYmVkOiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CZWQucG5nYFxuICAgICAgfSxcbiAgICAgIHBsYXllclN0ZXZlOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvU3RldmUxMDEzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvU3RldmUxMDEzLmpzb25gXG4gICAgICB9LFxuICAgICAgcGxheWVyQWxleDoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0FsZXgxMDEzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQWxleDEwMTMuanNvbmBcbiAgICAgIH0sXG4gICAgICBBTzoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0FPLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQU8uanNvbmBcbiAgICAgIH0sXG4gICAgICBibG9ja1NoYWRvd3M6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja19TaGFkb3dzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQmxvY2tfU2hhZG93cy5qc29uYFxuICAgICAgfSxcbiAgICAgIHVuZGVyZ3JvdW5kRm93OiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvVW5kZXJncm91bmRGb1cucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9VbmRlcmdyb3VuZEZvVy5qc29uYFxuICAgICAgfSxcbiAgICAgIGJsb2Nrczoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Jsb2Nrcy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Jsb2Nrcy5qc29uYFxuICAgICAgfSxcbiAgICAgIGxlYXZlc0FjYWNpYToge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19BY2FjaWFfRGVjYXkucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfQWNhY2lhX0RlY2F5Lmpzb25gXG4gICAgICB9LFxuICAgICAgbGVhdmVzQmlyY2g6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfQmlyY2hfRGVjYXkucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfQmlyY2hfRGVjYXkuanNvbmBcbiAgICAgIH0sXG4gICAgICBsZWF2ZXNKdW5nbGU6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfSnVuZ2xlX0RlY2F5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0p1bmdsZV9EZWNheS5qc29uYFxuICAgICAgfSxcbiAgICAgIGxlYXZlc09hazoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19PYWtfRGVjYXkucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfT2FrX0RlY2F5Lmpzb25gXG4gICAgICB9LFxuICAgICAgbGVhdmVzU3BydWNlOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX1NwcnVjZV9EZWNheS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19TcHJ1Y2VfRGVjYXkuanNvbmBcbiAgICAgIH0sXG4gICAgICBzaGVlcDoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1NoZWVwLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvU2hlZXAuanNvbmBcbiAgICAgIH0sXG4gICAgICBjcmVlcGVyOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQ3JlZXBlci5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0NyZWVwZXIuanNvbmBcbiAgICAgIH0sXG4gICAgICBjcm9wczoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Nyb3BzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQ3JvcHMuanNvbmBcbiAgICAgIH0sXG4gICAgICB0b3JjaDoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1RvcmNoLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvVG9yY2guanNvbmBcbiAgICAgIH0sXG4gICAgICBkZXN0cm95T3ZlcmxheToge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Rlc3Ryb3lfT3ZlcmxheS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Rlc3Ryb3lfT3ZlcmxheS5qc29uYFxuICAgICAgfSxcbiAgICAgIGJsb2NrRXhwbG9kZToge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Jsb2NrRXhwbG9kZS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Jsb2NrRXhwbG9kZS5qc29uYFxuICAgICAgfSxcbiAgICAgIG1pbmluZ1BhcnRpY2xlczoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL01pbmluZ1BhcnRpY2xlcy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL01pbmluZ1BhcnRpY2xlcy5qc29uYFxuICAgICAgfSxcbiAgICAgIG1pbmlCbG9ja3M6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9NaW5pYmxvY2tzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTWluaWJsb2Nrcy5qc29uYFxuICAgICAgfSxcbiAgICAgIGxhdmFQb3A6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MYXZhUG9wLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGF2YVBvcC5qc29uYFxuICAgICAgfSxcbiAgICAgIGZpcmU6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9GaXJlLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRmlyZS5qc29uYFxuICAgICAgfSxcbiAgICAgIGJ1YmJsZXM6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CdWJibGVzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQnViYmxlcy5qc29uYFxuICAgICAgfSxcbiAgICAgIGV4cGxvc2lvbjoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0V4cGxvc2lvbi5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0V4cGxvc2lvbi5qc29uYFxuICAgICAgfSxcbiAgICAgIGRvb3I6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9Eb29yLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRG9vci5qc29uYFxuICAgICAgfSxcbiAgICAgIHJhaWxzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvUmFpbHMucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9SYWlscy5qc29uYFxuICAgICAgfSxcbiAgICAgIHRudDoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1ROVC5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1ROVC5qc29uYFxuICAgICAgfSxcbiAgICAgIGRpZ193b29kMToge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2RpZ193b29kMS5tcDNgLFxuICAgICAgICB3YXY6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2RpZ193b29kMS53YXZgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2RpZ193b29kMS5vZ2dgXG4gICAgICB9LFxuICAgICAgc3RlcEdyYXNzOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vc3RlcF9ncmFzczEubXAzYCxcbiAgICAgICAgd2F2OiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zdGVwX2dyYXNzMS53YXZgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3N0ZXBfZ3Jhc3MxLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzdGVwV29vZDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3dvb2QyLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vd29vZDIub2dnYFxuICAgICAgfSxcbiAgICAgIHN0ZXBTdG9uZToge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3N0b25lMi5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3N0b25lMi5vZ2dgXG4gICAgICB9LFxuICAgICAgc3RlcEdyYXZlbDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2dyYXZlbDEubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9ncmF2ZWwxLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzdGVwRmFybWxhbmQ6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9jbG90aDQubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9jbG90aDQub2dnYFxuICAgICAgfSxcbiAgICAgIGZhaWx1cmU6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9icmVhay5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2JyZWFrLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzdWNjZXNzOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbGV2ZWx1cC5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2xldmVsdXAub2dnYFxuICAgICAgfSxcbiAgICAgIGZhbGw6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9mYWxsc21hbGwubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9mYWxsc21hbGwub2dnYFxuICAgICAgfSxcbiAgICAgIGZ1c2U6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9mdXNlLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZnVzZS5vZ2dgXG4gICAgICB9LFxuICAgICAgZXhwbG9kZToge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2V4cGxvZGUzLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZXhwbG9kZTMub2dnYFxuICAgICAgfSxcbiAgICAgIHBsYWNlQmxvY2s6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9jbG90aDEubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9jbG90aDEub2dnYFxuICAgICAgfSxcbiAgICAgIGNvbGxlY3RlZEJsb2NrOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vcG9wLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vcG9wLm9nZ2BcbiAgICAgIH0sXG4gICAgICBidW1wOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vaGl0My5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2hpdDMub2dnYFxuICAgICAgfSxcbiAgICAgIHB1bmNoOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGgxLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGgxLm9nZ2BcbiAgICAgIH0sXG4gICAgICBmaXp6OiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZml6ei5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Zpenoub2dnYFxuICAgICAgfSxcbiAgICAgIGRvb3JPcGVuOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZG9vcl9vcGVuLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZG9vcl9vcGVuLm9nZ2BcbiAgICAgIH0sXG4gICAgICBob3VzZVN1Y2Nlc3M6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9sYXVuY2gxLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbGF1bmNoMS5vZ2dgXG4gICAgICB9LFxuICAgICAgbWluZWNhcnQ6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9taW5lY2FydEJhc2UubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9taW5lY2FydEJhc2Uub2dnYFxuICAgICAgfSxcbiAgICAgIHNoZWVwQmFhOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vc2F5My5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3NheTMub2dnYFxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmFzc2V0UGFja3MgPSB7XG4gICAgICBsZXZlbE9uZUFzc2V0czogW1xuICAgICAgICAnZW50aXR5U2hhZG93JyxcbiAgICAgICAgJ3NlbGVjdGlvbkluZGljYXRvcicsXG4gICAgICAgICdzaGFkZUxheWVyJyxcbiAgICAgICAgJ0FPJyxcbiAgICAgICAgJ2Jsb2NrU2hhZG93cycsXG4gICAgICAgICdsZWF2ZXNPYWsnLFxuICAgICAgICAnbGVhdmVzQmlyY2gnLFxuICAgICAgICAndGFsbEdyYXNzJyxcbiAgICAgICAgJ2Jsb2NrcycsXG4gICAgICAgICdzaGVlcCcsXG4gICAgICAgICdidW1wJyxcbiAgICAgICAgJ3N0ZXBHcmFzcycsXG4gICAgICAgICdmYWlsdXJlJyxcbiAgICAgICAgJ3N1Y2Nlc3MnXG4gICAgICBdLFxuICAgICAgbGV2ZWxUd29Bc3NldHM6IFtcbiAgICAgICAgJ2VudGl0eVNoYWRvdycsXG4gICAgICAgICdzZWxlY3Rpb25JbmRpY2F0b3InLFxuICAgICAgICAnc2hhZGVMYXllcicsXG4gICAgICAgICdBTycsXG4gICAgICAgICdibG9ja1NoYWRvd3MnLFxuICAgICAgICAnbGVhdmVzU3BydWNlJyxcbiAgICAgICAgJ3RhbGxHcmFzcycsXG4gICAgICAgICdibG9ja3MnLFxuICAgICAgICAnc2hlZXAnLFxuICAgICAgICAnYnVtcCcsXG4gICAgICAgICdzdGVwR3Jhc3MnLFxuICAgICAgICAnZmFpbHVyZScsXG4gICAgICAgICdwbGF5ZXJTdGV2ZScsXG4gICAgICAgICdzdWNjZXNzJyxcbiAgICAgICAgJ21pbmlCbG9ja3MnLFxuICAgICAgICAnYmxvY2tFeHBsb2RlJyxcbiAgICAgICAgJ21pbmluZ1BhcnRpY2xlcycsXG4gICAgICAgICdkZXN0cm95T3ZlcmxheScsXG4gICAgICAgICdkaWdfd29vZDEnLFxuICAgICAgICAnY29sbGVjdGVkQmxvY2snLFxuICAgICAgICAncHVuY2gnLFxuICAgICAgXSxcbiAgICAgIGxldmVsVGhyZWVBc3NldHM6IFtcbiAgICAgICAgJ2VudGl0eVNoYWRvdycsXG4gICAgICAgICdzZWxlY3Rpb25JbmRpY2F0b3InLFxuICAgICAgICAnc2hhZGVMYXllcicsXG4gICAgICAgICdBTycsXG4gICAgICAgICdibG9ja1NoYWRvd3MnLFxuICAgICAgICAnbGVhdmVzT2FrJyxcbiAgICAgICAgJ3RhbGxHcmFzcycsXG4gICAgICAgICdibG9ja3MnLFxuICAgICAgICAnc2hlZXAnLFxuICAgICAgICAnYnVtcCcsXG4gICAgICAgICdzdGVwR3Jhc3MnLFxuICAgICAgICAnZmFpbHVyZScsXG4gICAgICAgICdwbGF5ZXJTdGV2ZScsXG4gICAgICAgICdzdWNjZXNzJyxcbiAgICAgICAgJ21pbmlCbG9ja3MnLFxuICAgICAgICAnYmxvY2tFeHBsb2RlJyxcbiAgICAgICAgJ21pbmluZ1BhcnRpY2xlcycsXG4gICAgICAgICdkZXN0cm95T3ZlcmxheScsXG4gICAgICAgICdkaWdfd29vZDEnLFxuICAgICAgICAnY29sbGVjdGVkQmxvY2snLFxuICAgICAgICAnc2hlZXBCYWEnLFxuICAgICAgICAncHVuY2gnLFxuICAgICAgXSxcbiAgICAgIGFsbEFzc2V0c01pbnVzUGxheWVyOiBbXG4gICAgICAgICdlbnRpdHlTaGFkb3cnLFxuICAgICAgICAnc2VsZWN0aW9uSW5kaWNhdG9yJyxcbiAgICAgICAgJ3NoYWRlTGF5ZXInLFxuICAgICAgICAndGFsbEdyYXNzJyxcbiAgICAgICAgJ2ZpbmlzaE92ZXJsYXknLFxuICAgICAgICAnYmVkJyxcbiAgICAgICAgJ0FPJyxcbiAgICAgICAgJ2Jsb2NrU2hhZG93cycsXG4gICAgICAgICd1bmRlcmdyb3VuZEZvdycsXG4gICAgICAgICdibG9ja3MnLFxuICAgICAgICAnbGVhdmVzQWNhY2lhJyxcbiAgICAgICAgJ2xlYXZlc0JpcmNoJyxcbiAgICAgICAgJ2xlYXZlc0p1bmdsZScsXG4gICAgICAgICdsZWF2ZXNPYWsnLFxuICAgICAgICAnbGVhdmVzU3BydWNlJyxcbiAgICAgICAgJ3NoZWVwJyxcbiAgICAgICAgJ2NyZWVwZXInLFxuICAgICAgICAnY3JvcHMnLFxuICAgICAgICAndG9yY2gnLFxuICAgICAgICAnZGVzdHJveU92ZXJsYXknLFxuICAgICAgICAnYmxvY2tFeHBsb2RlJyxcbiAgICAgICAgJ21pbmluZ1BhcnRpY2xlcycsXG4gICAgICAgICdtaW5pQmxvY2tzJyxcbiAgICAgICAgJ2xhdmFQb3AnLFxuICAgICAgICAnZmlyZScsXG4gICAgICAgICdidWJibGVzJyxcbiAgICAgICAgJ2V4cGxvc2lvbicsXG4gICAgICAgICdkb29yJyxcbiAgICAgICAgJ3JhaWxzJyxcbiAgICAgICAgJ3RudCcsXG4gICAgICAgICdkaWdfd29vZDEnLFxuICAgICAgICAnc3RlcEdyYXNzJyxcbiAgICAgICAgJ3N0ZXBXb29kJyxcbiAgICAgICAgJ3N0ZXBTdG9uZScsXG4gICAgICAgICdzdGVwR3JhdmVsJyxcbiAgICAgICAgJ3N0ZXBGYXJtbGFuZCcsXG4gICAgICAgICdmYWlsdXJlJyxcbiAgICAgICAgJ3N1Y2Nlc3MnLFxuICAgICAgICAnZmFsbCcsXG4gICAgICAgICdmdXNlJyxcbiAgICAgICAgJ2V4cGxvZGUnLFxuICAgICAgICAncGxhY2VCbG9jaycsXG4gICAgICAgICdjb2xsZWN0ZWRCbG9jaycsXG4gICAgICAgICdidW1wJyxcbiAgICAgICAgJ3B1bmNoJyxcbiAgICAgICAgJ2ZpenonLFxuICAgICAgICAnZG9vck9wZW4nLFxuICAgICAgICAnaG91c2VTdWNjZXNzJyxcbiAgICAgICAgJ21pbmVjYXJ0JyxcbiAgICAgICAgJ3NoZWVwQmFhJ1xuICAgICAgXSxcbiAgICAgIHBsYXllclN0ZXZlOiBbXG4gICAgICAgICdwbGF5ZXJTdGV2ZSdcbiAgICAgIF0sXG4gICAgICBwbGF5ZXJBbGV4OiBbXG4gICAgICAgICdwbGF5ZXJBbGV4J1xuICAgICAgXSxcbiAgICAgIGdyYXNzOiBbXG4gICAgICAgICd0YWxsR3Jhc3MnXG4gICAgICBdXG4gICAgfTtcbiAgfVxuXG4gIGxvYWRQYWNrcyhwYWNrTGlzdCkge1xuICAgIHBhY2tMaXN0LmZvckVhY2goKHBhY2tOYW1lKSA9PiB7XG4gICAgICB0aGlzLmxvYWRQYWNrKHBhY2tOYW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRQYWNrKHBhY2tOYW1lKSB7XG4gICAgbGV0IHBhY2tBc3NldHMgPSB0aGlzLmFzc2V0UGFja3NbcGFja05hbWVdO1xuICAgIHRoaXMubG9hZEFzc2V0cyhwYWNrQXNzZXRzKTtcbiAgfVxuXG4gIGxvYWRBc3NldHMoYXNzZXROYW1lcykge1xuICAgIGFzc2V0TmFtZXMuZm9yRWFjaCgoYXNzZXRLZXkpID0+IHtcbiAgICAgIGxldCBhc3NldENvbmZpZyA9IHRoaXMuYXNzZXRzW2Fzc2V0S2V5XTtcbiAgICAgIHRoaXMubG9hZEFzc2V0KGFzc2V0S2V5LCBhc3NldENvbmZpZyk7XG4gICAgfSk7XG4gIH1cblxuICBsb2FkQXNzZXQoa2V5LCBjb25maWcpIHtcbiAgICBzd2l0Y2goY29uZmlnLnR5cGUpIHtcbiAgICAgIGNhc2UgJ2ltYWdlJzpcbiAgICAgICAgdGhpcy5nYW1lLmxvYWQuaW1hZ2Uoa2V5LCBjb25maWcucGF0aCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc291bmQnOlxuICAgICAgICB0aGlzLmF1ZGlvUGxheWVyLnJlZ2lzdGVyKHtcbiAgICAgICAgICBpZDoga2V5LFxuICAgICAgICAgIG1wMzogY29uZmlnLm1wMyxcbiAgICAgICAgICBvZ2c6IGNvbmZpZy5vZ2dcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYXRsYXNKU09OJzpcbiAgICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXNKU09OSGFzaChrZXksIGNvbmZpZy5wbmdQYXRoLCBjb25maWcuanNvblBhdGgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IGBBc3NldCAke2tleX0gbmVlZHMgY29uZmlnLnR5cGUgc2V0IGluIGNvbmZpZ3VyYXRpb24uYDtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBDb21tYW5kUXVldWUgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9Db21tYW5kUXVldWUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL0Jhc2VDb21tYW5kLmpzXCI7XG5pbXBvcnQgRGVzdHJveUJsb2NrQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL0Rlc3Ryb3lCbG9ja0NvbW1hbmQuanNcIjtcbmltcG9ydCBQbGFjZUJsb2NrQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL1BsYWNlQmxvY2tDb21tYW5kLmpzXCI7XG5pbXBvcnQgUGxhY2VJbkZyb250Q29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL1BsYWNlSW5Gcm9udENvbW1hbmQuanNcIjtcbmltcG9ydCBNb3ZlRm9yd2FyZENvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9Nb3ZlRm9yd2FyZENvbW1hbmQuanNcIjtcbmltcG9ydCBUdXJuQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL1R1cm5Db21tYW5kLmpzXCI7XG5pbXBvcnQgV2hpbGVDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvV2hpbGVDb21tYW5kLmpzXCI7XG5pbXBvcnQgSWZCbG9ja0FoZWFkQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL0lmQmxvY2tBaGVhZENvbW1hbmQuanNcIjtcbmltcG9ydCBDaGVja1NvbHV0aW9uQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL0NoZWNrU29sdXRpb25Db21tYW5kLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQoY29udHJvbGxlcikge1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIENhbGxlZCBiZWZvcmUgYSBsaXN0IG9mIHVzZXIgY29tbWFuZHMgd2lsbCBiZSBpc3N1ZWQuXG4gICAgICovXG4gICAgc3RhcnRDb21tYW5kQ29sbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY29udHJvbGxlci5ERUJVRykge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbGxlY3RpbmcgY29tbWFuZHMuXCIpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiBhbiBhdHRlbXB0IHNob3VsZCBiZSBzdGFydGVkLCBhbmQgdGhlIGVudGlyZSBzZXQgb2ZcbiAgICAgKiBjb21tYW5kLXF1ZXVlIEFQSSBjYWxscyBoYXZlIGJlZW4gaXNzdWVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gb25BdHRlbXB0Q29tcGxldGUgLSBjYWxsYmFjayB3aXRoIHR3byBwYXJhbWV0ZXJzLFxuICAgICAqIFwic3VjY2Vzc1wiLCBpLmUuLCB0cnVlIGlmIGF0dGVtcHQgd2FzIHN1Y2Nlc3NmdWwgKGxldmVsIGNvbXBsZXRlZCksXG4gICAgICogZmFsc2UgaWYgdW5zdWNjZXNzZnVsIChsZXZlbCBub3QgY29tcGxldGVkKSwgYW5kIHRoZSBjdXJyZW50IGxldmVsIG1vZGVsLlxuICAgICAqL1xuICAgIHN0YXJ0QXR0ZW1wdDogZnVuY3Rpb24ob25BdHRlbXB0Q29tcGxldGUpIHtcbiAgICAgICAgY29udHJvbGxlci5PbkNvbXBsZXRlQ2FsbGJhY2sgPSBvbkF0dGVtcHRDb21wbGV0ZTtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBDaGVja1NvbHV0aW9uQ29tbWFuZChjb250cm9sbGVyKSk7XG5cbiAgICAgICAgY29udHJvbGxlci5zZXRQbGF5ZXJBY3Rpb25EZWxheUJ5UXVldWVMZW5ndGgoKTtcblxuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmJlZ2luKCk7XG4gICAgfSxcblxuICAgIHJlc2V0QXR0ZW1wdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucmVzZXQoKTtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5yZXNldCgpO1xuICAgICAgICBjb250cm9sbGVyLk9uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG4gICAgfSxcblxuICAgIG1vdmVGb3J3YXJkOiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IE1vdmVGb3J3YXJkQ29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaykpO1xuICAgIH0sXG5cbiAgICB0dXJuOiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaywgZGlyZWN0aW9uKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgVHVybkNvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JyA/IDEgOiAtMSkpO1xuICAgIH0sXG5cbiAgICB0dXJuUmlnaHQ6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgVHVybkNvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIDEpKTtcbiAgICB9LFxuXG4gICAgdHVybkxlZnQ6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgVHVybkNvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIC0xKSk7XG4gICAgfSxcblxuICAgIGRlc3Ryb3lCbG9jazogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2spIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBEZXN0cm95QmxvY2tDb21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKSk7XG4gICAgfSxcblxuICAgIHBsYWNlQmxvY2s6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUpIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBQbGFjZUJsb2NrQ29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlKSk7XG4gICAgfSxcblxuICAgIHBsYWNlSW5Gcm9udDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSkge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IFBsYWNlSW5Gcm9udENvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSkpO1xuICAgIH0sXG5cbiAgICB0aWxsU29pbDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2spIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBQbGFjZUluRnJvbnRDb21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCAnd2F0ZXJpbmcnKSk7XG4gICAgfSxcblxuICAgIHdoaWxlUGF0aEFoZWFkOiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlLCBjb2RlQmxvY2spIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBXaGlsZUNvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY29kZUJsb2NrKSk7XG4gICAgfSxcblxuICAgIGlmQmxvY2tBaGVhZDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY29kZUJsb2NrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgSWZCbG9ja0FoZWFkQ29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlLCBjb2RlQmxvY2spKTtcbiAgICB9LFxuXG4gICAgZ2V0U2NyZWVuc2hvdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjb250cm9sbGVyLmdldFNjcmVlbnNob3QoKTtcbiAgICB9XG4gIH07XG59XG4iLCJcbmltcG9ydCBDb21tYW5kU3RhdGUgZnJvbSBcIi4vQ29tbWFuZFN0YXRlLmpzXCI7XG5pbXBvcnQgQ29tbWFuZFF1ZXVlIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdoaWxlQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaXRlcmF0aW9uc0xlZnQgPSAxNTsgXG4gICAgICAgIHRoaXMuQmxvY2tUeXBlID0gYmxvY2tUeXBlO1xuICAgICAgICB0aGlzLldoaWxlQ29kZSA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLnF1ZXVlID0gbmV3IENvbW1hbmRRdWV1ZSh0aGlzKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZlxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuV09SS0lORyApIHtcbiAgICAgICAgICAgIC8vIHRpY2sgb3VyIGNvbW1hbmQgcXVldWVcbiAgICAgICAgICAgIHRoaXMucXVldWUudGljaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucXVldWUuaXNGYWlsZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5xdWV1ZS5pc1N1Y2NlZWRlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVdoaWxlQ2hlY2soKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICBpZiAodGhpcy5HYW1lQ29udHJvbGxlci5ERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJXSElMRSBjb21tYW5kOiBCRUdJTlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldHVwIHRoZSB3aGlsZSBjaGVjayB0aGUgZmlyc3QgdGltZVxuICAgICAgICB0aGlzLmhhbmRsZVdoaWxlQ2hlY2soKTtcbiAgICB9XG5cbiAgICBoYW5kbGVXaGlsZUNoZWNrKCkge1xuICAgICAgICBpZiAodGhpcy5pdGVyYXRpb25zTGVmdCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5HYW1lQ29udHJvbGxlci5pc1BhdGhBaGVhZCh0aGlzLkJsb2NrVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMucXVldWUucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucXVldWUuc2V0V2hpbGVDb21tYW5kSW5zZXJ0U3RhdGUodGhpcy5xdWV1ZSk7XG4gICAgICAgICAgICB0aGlzLldoaWxlQ29kZSgpO1xuICAgICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5xdWV1ZS5zZXRXaGlsZUNvbW1hbmRJbnNlcnRTdGF0ZShudWxsKTtcbiAgICAgICAgICAgIHRoaXMucXVldWUuYmVnaW4oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXRlcmF0aW9uc0xlZnQtLTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBXaGlsZSBjb21tYW5kOiBJdGVyYXRpb25zbGVmdCAgICR7dGhpcy5pdGVyYXRpb25zTGVmdH0gYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR1cm5Db21tYW5kIGV4dGVuZHMgQmFzZUNvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgZGlyZWN0aW9uKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLkRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZj8/XG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICBpZiAodGhpcy5HYW1lQ29udHJvbGxlci5ERUJVRykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFRVUk4gY29tbWFuZDogQkVHSU4gdHVybmluZyAke3RoaXMuRGlyZWN0aW9ufSAgYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci50dXJuKHRoaXMsIHRoaXMuRGlyZWN0aW9uKTtcbiAgICB9XG5cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYWNlSW5Gcm9udENvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUpIHtcbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuQmxvY2tUeXBlID0gYmxvY2tUeXBlO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgICAgIC8vIGRvIHN0dWZmPz9cbiAgICB9XG4gICAgXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIHN1cGVyLmJlZ2luKCk7XG4gICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucGxhY2VCbG9ja0ZvcndhcmQodGhpcywgdGhpcy5CbG9ja1R5cGUpO1xuICAgIH1cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYWNlQmxvY2tDb21tYW5kIGV4dGVuZHMgQmFzZUNvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLkJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZj8/XG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLnBsYWNlQmxvY2sodGhpcywgdGhpcy5CbG9ja1R5cGUpO1xuICAgIH1cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmVGb3J3YXJkQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spIHtcblxuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgICAgIC8vIGRvIHN0dWZmXG4gICAgfVxuXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIHN1cGVyLmJlZ2luKCk7XG4gICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIubW92ZUZvcndhcmQodGhpcyk7XG4gICAgfVxuXG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBDb21tYW5kUXVldWUgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4vQmFzZUNvbW1hbmQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSWZCbG9ja0FoZWFkQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcblxuICAgICAgICB0aGlzLmJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcbiAgICAgICAgdGhpcy5pZkNvZGVDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgICAgIHRoaXMucXVldWUgPSBuZXcgQ29tbWFuZFF1ZXVlKHRoaXMpO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuV09SS0lORyApIHtcbiAgICAgICAgICAgIC8vIHRpY2sgb3VyIGNvbW1hbmQgcXVldWVcbiAgICAgICAgICAgIHRoaXMucXVldWUudGljaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucXVldWUuaXNGYWlsZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucXVldWUuaXNTdWNjZWVkZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5TVUNDRVNTO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV0hJTEUgY29tbWFuZDogQkVHSU5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXR1cCB0aGUgXCJpZlwiIGNoZWNrXG4gICAgICAgIHRoaXMuaGFuZGxlSWZDaGVjaygpO1xuICAgIH1cblxuICAgIGhhbmRsZUlmQ2hlY2soKSB7XG4gICAgICAgIGlmICh0aGlzLkdhbWVDb250cm9sbGVyLmlzUGF0aEFoZWFkKHRoaXMuYmxvY2tUeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5xdWV1ZS5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5xdWV1ZS5zZXRXaGlsZUNvbW1hbmRJbnNlcnRTdGF0ZSh0aGlzLnF1ZXVlKTtcbiAgICAgICAgICAgIHRoaXMuaWZDb2RlQ2FsbGJhY2soKTsgLy8gaW5zZXJ0cyBjb21tYW5kcyB2aWEgQ29kZU9yZ0FQSVxuICAgICAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5xdWV1ZS5zZXRXaGlsZUNvbW1hbmRJbnNlcnRTdGF0ZShudWxsKTtcbiAgICAgICAgICAgIHRoaXMucXVldWUuYmVnaW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG4iLCJcbmltcG9ydCBDb21tYW5kU3RhdGUgZnJvbSBcIi4vQ29tbWFuZFN0YXRlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4vQmFzZUNvbW1hbmQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVzdHJveUJsb2NrQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spIHtcblxuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgICAgIC8vIGRvIHN0dWZmXG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLmRlc3Ryb3lCbG9jayh0aGlzKTtcbiAgICB9XG5cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IENvbW1hbmRRdWV1ZSBmcm9tIFwiLi9Db21tYW5kUXVldWUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGVja1NvbHV0aW9uQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlcikge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZ2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgc29sdmUgY29tbWFuZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgZHVtbXlGdW5jKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZlxuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU29sdmUgY29tbWFuZDogQkVHSU5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuR2FtZUNvbnRyb2xsZXIuY2hlY2tTb2x1dGlvbih0aGlzKTtcbiAgICB9XG5cbn1cblxuIiwiaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kXCI7XG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyKSB7XG4gICAgdGhpcy5nYW1lQ29udHJvbGxlciA9IGdhbWVDb250cm9sbGVyO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWVDb250cm9sbGVyLmdhbWU7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgYWRkQ29tbWFuZChjb21tYW5kKSB7XG4gICAgLy8gaWYgd2UncmUgaGFuZGxpbmcgYSB3aGlsZSBjb21tYW5kLCBhZGQgdG8gdGhlIHdoaWxlIGNvbW1hbmQncyBxdWV1ZSBpbnN0ZWFkIG9mIHRoaXMgcXVldWVcbiAgICBpZiAodGhpcy53aGlsZUNvbW1hbmRRdWV1ZSkge1xuICAgICAgdGhpcy53aGlsZUNvbW1hbmRRdWV1ZS5hZGRDb21tYW5kKGNvbW1hbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbW1hbmRMaXN0Xy5wdXNoKGNvbW1hbmQpO1xuICAgIH1cbiAgfVxuXG4gIHNldFdoaWxlQ29tbWFuZEluc2VydFN0YXRlKHF1ZXVlKSB7XG4gICAgdGhpcy53aGlsZUNvbW1hbmRRdWV1ZSA9IHF1ZXVlO1xuICB9XG5cbiAgYmVnaW4oKSB7XG4gICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5XT1JLSU5HO1xuICAgIGlmICh0aGlzLmdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkRlYnVnIFF1ZXVlOiBCRUdJTlwiKTtcbiAgICB9XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLk5PVF9TVEFSVEVEO1xuICAgIHRoaXMuY3VycmVudENvbW1hbmQgPSBudWxsO1xuICAgIHRoaXMuY29tbWFuZExpc3RfID0gW107XG4gICAgaWYgKHRoaXMud2hpbGVDb21tYW5kUXVldWUpIHtcbiAgICAgIHRoaXMud2hpbGVDb21tYW5kUXVldWUucmVzZXQoKTtcbiAgICB9XG4gICAgdGhpcy53aGlsZUNvbW1hbmRRdWV1ZSA9IG51bGw7XG4gIH1cblxuICB0aWNrKCkge1xuICAgIGlmICh0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuV09SS0lORykge1xuICAgICAgaWYgKCF0aGlzLmN1cnJlbnRDb21tYW5kKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbW1hbmRMaXN0Xy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudENvbW1hbmQgPSB0aGlzLmNvbW1hbmRMaXN0Xy5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuY3VycmVudENvbW1hbmQuaXNTdGFydGVkKCkpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q29tbWFuZC5iZWdpbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q29tbWFuZC50aWNrKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIGlmIGNvbW1hbmQgaXMgZG9uZVxuICAgICAgaWYgKHRoaXMuY3VycmVudENvbW1hbmQuaXNTdWNjZWVkZWQoKSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRDb21tYW5kID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50Q29tbWFuZC5pc0ZhaWxlZCgpKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRMZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZExpc3RfID8gdGhpcy5jb21tYW5kTGlzdF8ubGVuZ3RoIDogMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBzdGFydGVkIHdvcmtpbmcuXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNTdGFydGVkKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlICE9PSBDb21tYW5kU3RhdGUuTk9UX1NUQVJURUQ7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgc3VjY2VlZGVkIG9yIGZhaWxlZCwgYW5kIGlzXG4gICAqIGZpbmlzaGVkIHdpdGggaXRzIHdvcmsuXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNGaW5pc2hlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc1N1Y2NlZWRlZCgpIHx8IHRoaXMuaXNGYWlsZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBmaW5pc2hlZCB3aXRoIGl0cyB3b3JrIGFuZCByZXBvcnRlZCBzdWNjZXNzLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU3VjY2VlZGVkKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBmaW5pc2hlZCB3aXRoIGl0cyB3b3JrIGFuZCByZXBvcnRlZCBmYWlsdXJlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRmFpbGVkKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgfVxufVxuXG4iLCJcbmltcG9ydCBDb21tYW5kU3RhdGUgZnJvbSBcIi4vQ29tbWFuZFN0YXRlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlciA9IGdhbWVDb250cm9sbGVyO1xuICAgICAgICB0aGlzLkdhbWUgPSBnYW1lQ29udHJvbGxlci5nYW1lO1xuICAgICAgICB0aGlzLkhpZ2hsaWdodENhbGxiYWNrID0gaGlnaGxpZ2h0Q2FsbGJhY2s7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuTk9UX1NUQVJURUQ7XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICB9XG4gICAgXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIGlmICh0aGlzLkhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLkhpZ2hsaWdodENhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5XT1JLSU5HO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIHN0YXJ0ZWQgd29ya2luZy5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1N0YXJ0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlICE9IENvbW1hbmRTdGF0ZS5OT1RfU1RBUlRFRDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBzdWNjZWVkZWQgb3IgZmFpbGVkLCBhbmQgaXNcbiAgICAgKiBmaW5pc2hlZCB3aXRoIGl0cyB3b3JrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzRmluaXNoZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzU3VjY2VlZGVkKCkgfHwgdGhpcy5pc0ZhaWxlZCgpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBmaW5pc2hlZCB3aXRoIGl0cyB3b3JrIGFuZCByZXBvcnRlZCBzdWNjZXNzLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgaXNTdWNjZWVkZWQoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLlNVQ0NFU1MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIGZpbmlzaGVkIHdpdGggaXRzIHdvcmsgYW5kIHJlcG9ydGVkIGZhaWx1cmUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICBpc0ZhaWxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICAgfVxuXG4gICBzdWNjZWVkZWQoKSB7XG4gICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5TVUNDRVNTO1xuICAgfVxuICAgIFxuICAgZmFpbGVkKCkge1xuICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgIH1cbn1cblxuIiwiXG5leHBvcnQgZGVmYXVsdCBPYmplY3QuZnJlZXplKHtcbiAgICBOT1RfU1RBUlRFRDogMCxcbiAgICBXT1JLSU5HOiAxLFxuICAgIFNVQ0NFU1M6IDIsXG4gICAgRkFJTFVSRTogM1xufSk7XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBpMThuID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7IDsgYnVmLnB1c2goJ1xcbjxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiIGlkPVwiZ2V0dGluZy1zdGFydGVkLWhlYWRlclwiPicsIGVzY2FwZSgoMiwgIGkxOG4ucGxheWVyU2VsZWN0TGV0c0dldFN0YXJ0ZWQoKSApKSwgJzwvaDE+XFxuXFxuPGgyIGlkPVwic2VsZWN0LWNoYXJhY3Rlci10ZXh0XCI+JywgZXNjYXBlKCg0LCAgaTE4bi5wbGF5ZXJTZWxlY3RDaG9vc2VDaGFyYWN0ZXIoKSApKSwgJzwvaDI+XFxuXFxuPGRpdiBpZD1cImNob29zZS1jaGFyYWN0ZXItY29udGFpbmVyXCI+XFxuICA8ZGl2IGNsYXNzPVwibWluZWNyYWZ0LWNoYXJhY3RlclwiIGlkPVwiY2hvb3NlLXN0ZXZlXCI+XFxuICAgIDxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiPlN0ZXZlPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cImNoYXJhY3Rlci1wb3J0cmFpdFwiIGlkPVwic3RldmUtcG9ydHJhaXRcIj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNob29zZS1jaGFyYWN0ZXItYnV0dG9uXCIgaWQ9XCJjaG9vc2Utc3RldmUtc2VsZWN0XCI+JywgZXNjYXBlKCgxMCwgIGkxOG4uc2VsZWN0Q2hvb3NlQnV0dG9uKCkgKSksICc8L2Rpdj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cIm1pbmVjcmFmdC1jaGFyYWN0ZXJcIiBpZD1cImNob29zZS1hbGV4XCI+XFxuICAgIDxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiPkFsZXg8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVwiY2hhcmFjdGVyLXBvcnRyYWl0XCIgaWQ9XCJhbGV4LXBvcnRyYWl0XCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJjaG9vc2UtY2hhcmFjdGVyLWJ1dHRvblwiIGlkPVwiY2hvb3NlLWFsZXgtc2VsZWN0XCI+JywgZXNjYXBlKCgxNSwgIGkxOG4uc2VsZWN0Q2hvb3NlQnV0dG9uKCkgKSksICc8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgaWQ9XCJjbG9zZS1jaGFyYWN0ZXItc2VsZWN0XCI+PC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgaTE4biA9IHJlcXVpcmUoJy4uL2xvY2FsZScpOyA7IGJ1Zi5wdXNoKCdcXG48aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIiBpZD1cImdldHRpbmctc3RhcnRlZC1oZWFkZXJcIj4nLCBlc2NhcGUoKDIsICBpMThuLmhvdXNlU2VsZWN0TGV0c0J1aWxkKCkgKSksICc8L2gxPlxcblxcbjxoMiBpZD1cInNlbGVjdC1ob3VzZS10ZXh0XCI+JywgZXNjYXBlKCg0LCAgaTE4bi5ob3VzZVNlbGVjdENob29zZUZsb29yUGxhbigpICkpLCAnPC9oMj5cXG5cXG48ZGl2IGlkPVwiY2hvb3NlLWhvdXNlLWNvbnRhaW5lclwiPlxcbiAgPGRpdiBjbGFzcz1cIm1pbmVjcmFmdC1ob3VzZVwiIGlkPVwiY2hvb3NlLWhvdXNlLWFcIj5cXG4gICAgPGgxIGNsYXNzPVwibWluZWNyYWZ0LWJpZy15ZWxsb3ctaGVhZGVyXCI+JywgZXNjYXBlKCg4LCAgaTE4bi5ob3VzZVNlbGVjdEVhc3koKSApKSwgJzwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XCJob3VzZS1vdXRsaW5lLWNvbnRhaW5lclwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XCJob3VzZS1waG90b1wiIGlkPVwiaG91c2UtYS1waWN0dXJlXCI+PC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiY2hvb3NlLWhvdXNlLWJ1dHRvblwiPicsIGVzY2FwZSgoMTIsICBpMThuLnNlbGVjdENob29zZUJ1dHRvbigpICkpLCAnPC9kaXY+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtaW5lY3JhZnQtaG91c2VcIiBpZD1cImNob29zZS1ob3VzZS1iXCI+XFxuICAgIDxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiPicsIGVzY2FwZSgoMTUsICBpMThuLmhvdXNlU2VsZWN0TWVkaXVtKCkgKSksICc8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVwiaG91c2Utb3V0bGluZS1jb250YWluZXJcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVwiaG91c2UtcGhvdG9cIiBpZD1cImhvdXNlLWItcGljdHVyZVwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNob29zZS1ob3VzZS1idXR0b25cIj4nLCBlc2NhcGUoKDE5LCAgaTE4bi5zZWxlY3RDaG9vc2VCdXR0b24oKSApKSwgJzwvZGl2PlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwibWluZWNyYWZ0LWhvdXNlXCIgaWQ9XCJjaG9vc2UtaG91c2UtY1wiPlxcbiAgICA8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIj4nLCBlc2NhcGUoKDIyLCAgaTE4bi5ob3VzZVNlbGVjdEhhcmQoKSApKSwgJzwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XCJob3VzZS1vdXRsaW5lLWNvbnRhaW5lclwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XCJob3VzZS1waG90b1wiIGlkPVwiaG91c2UtYy1waWN0dXJlXCI+PC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiY2hvb3NlLWhvdXNlLWJ1dHRvblwiPicsIGVzY2FwZSgoMjYsICBpMThuLnNlbGVjdENob29zZUJ1dHRvbigpICkpLCAnPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG5cXG48ZGl2IGlkPVwiY2xvc2UtaG91c2Utc2VsZWN0XCI+PC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInJpZ2h0LWJ1dHRvbi1jZWxsXCI+XFxuICA8YnV0dG9uIGlkPVwicmlnaHRCdXR0b25cIiBjbGFzcz1cInNoYXJlIG1jLXNoYXJlLWJ1dHRvblwiPlxcbiAgICA8ZGl2PicsIGVzY2FwZSgoNSwgIG1zZy5maW5pc2goKSApKSwgJzwvZGl2PlxcbiAgPC9idXR0b24+XFxuPC9kaXY+XFxuXFxuPCEtLSBUaGlzIGlzIGEgY29tbWVudCB1bmlxdWUgdG8gQ3JhZnQgLS0+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaTE4biA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbnZhciBibG9ja3NUb0Rpc3BsYXlUZXh0ID0ge1xuICBiZWRyb2NrOiBpMThuLmJsb2NrVHlwZUJlZHJvY2soKSxcbiAgYnJpY2tzOiBpMThuLmJsb2NrVHlwZUJyaWNrcygpLFxuICBjbGF5OiBpMThuLmJsb2NrVHlwZUNsYXkoKSxcbiAgb3JlQ29hbDogaTE4bi5ibG9ja1R5cGVPcmVDb2FsKCksXG4gIGRpcnRDb2Fyc2U6IGkxOG4uYmxvY2tUeXBlRGlydENvYXJzZSgpLFxuICBjb2JibGVzdG9uZTogaTE4bi5ibG9ja1R5cGVDb2JibGVzdG9uZSgpLFxuICBvcmVEaWFtb25kOiBpMThuLmJsb2NrVHlwZU9yZURpYW1vbmQoKSxcbiAgZGlydDogaTE4bi5ibG9ja1R5cGVEaXJ0KCksXG4gIG9yZUVtZXJhbGQ6IGkxOG4uYmxvY2tUeXBlT3JlRW1lcmFsZCgpLFxuICBmYXJtbGFuZFdldDogaTE4bi5ibG9ja1R5cGVGYXJtbGFuZFdldCgpLFxuICBnbGFzczogaTE4bi5ibG9ja1R5cGVHbGFzcygpLFxuICBvcmVHb2xkOiBpMThuLmJsb2NrVHlwZU9yZUdvbGQoKSxcbiAgZ3Jhc3M6IGkxOG4uYmxvY2tUeXBlR3Jhc3MoKSxcbiAgZ3JhdmVsOiBpMThuLmJsb2NrVHlwZUdyYXZlbCgpLFxuICBjbGF5SGFyZGVuZWQ6IGkxOG4uYmxvY2tUeXBlQ2xheUhhcmRlbmVkKCksXG4gIG9yZUlyb246IGkxOG4uYmxvY2tUeXBlT3JlSXJvbigpLFxuICBvcmVMYXBpczogaTE4bi5ibG9ja1R5cGVPcmVMYXBpcygpLFxuICBsYXZhOiBpMThuLmJsb2NrVHlwZUxhdmEoKSxcbiAgbG9nQWNhY2lhOiBpMThuLmJsb2NrVHlwZUxvZ0FjYWNpYSgpLFxuICBsb2dCaXJjaDogaTE4bi5ibG9ja1R5cGVMb2dCaXJjaCgpLFxuICBsb2dKdW5nbGU6IGkxOG4uYmxvY2tUeXBlTG9nSnVuZ2xlKCksXG4gIGxvZ09hazogaTE4bi5ibG9ja1R5cGVMb2dPYWsoKSxcbiAgbG9nU3BydWNlOiBpMThuLmJsb2NrVHlwZUxvZ1NwcnVjZSgpLFxuICBwbGFua3NBY2FjaWE6IGkxOG4uYmxvY2tUeXBlUGxhbmtzQWNhY2lhKCksXG4gIHBsYW5rc0JpcmNoOiBpMThuLmJsb2NrVHlwZVBsYW5rc0JpcmNoKCksXG4gIHBsYW5rc0p1bmdsZTogaTE4bi5ibG9ja1R5cGVQbGFua3NKdW5nbGUoKSxcbiAgcGxhbmtzT2FrOiBpMThuLmJsb2NrVHlwZVBsYW5rc09haygpLFxuICBwbGFua3NTcHJ1Y2U6IGkxOG4uYmxvY2tUeXBlUGxhbmtzU3BydWNlKCksXG4gIG9yZVJlZHN0b25lOiBpMThuLmJsb2NrVHlwZU9yZVJlZHN0b25lKCksXG4gIHJhaWw6IGkxOG4uYmxvY2tUeXBlUmFpbCgpLFxuICBzYW5kOiBpMThuLmJsb2NrVHlwZVNhbmQoKSxcbiAgc2FuZHN0b25lOiBpMThuLmJsb2NrVHlwZVNhbmRzdG9uZSgpLFxuICBzdG9uZTogaTE4bi5ibG9ja1R5cGVTdG9uZSgpLFxuICB0bnQ6IGkxOG4uYmxvY2tUeXBlVG50KCksXG4gIHRyZWU6IGkxOG4uYmxvY2tUeXBlVHJlZSgpLFxuICB3YXRlcjogaTE4bi5ibG9ja1R5cGVXYXRlcigpLFxuICB3b29sOiBpMThuLmJsb2NrVHlwZVdvb2woKSxcbiAgJyc6IGkxOG4uYmxvY2tUeXBlRW1wdHkoKVxufTtcblxudmFyIGFsbEJsb2NrcyA9IFtcbiAgJ2JlZHJvY2snLFxuICAnYnJpY2tzJyxcbiAgJ2NsYXknLFxuICAnb3JlQ29hbCcsXG4gICdkaXJ0Q29hcnNlJyxcbiAgJ2NvYmJsZXN0b25lJyxcbiAgJ29yZURpYW1vbmQnLFxuICAnZGlydCcsXG4gICdvcmVFbWVyYWxkJyxcbiAgJ2Zhcm1sYW5kV2V0JyxcbiAgJ2dsYXNzJyxcbiAgJ29yZUdvbGQnLFxuICAnZ3Jhc3MnLFxuICAnZ3JhdmVsJyxcbiAgJ2NsYXlIYXJkZW5lZCcsXG4gICdvcmVJcm9uJyxcbiAgJ29yZUxhcGlzJyxcbiAgJ2xhdmEnLFxuICAnbG9nQWNhY2lhJyxcbiAgJ2xvZ0JpcmNoJyxcbiAgJ2xvZ0p1bmdsZScsXG4gICdsb2dPYWsnLFxuICAnbG9nU3BydWNlJyxcbiAgJ3BsYW5rc0FjYWNpYScsXG4gICdwbGFua3NCaXJjaCcsXG4gICdwbGFua3NKdW5nbGUnLFxuICAncGxhbmtzT2FrJyxcbiAgJ3BsYW5rc1NwcnVjZScsXG4gICdvcmVSZWRzdG9uZScsXG4gICdzYW5kJyxcbiAgJ3NhbmRzdG9uZScsXG4gICdzdG9uZScsXG4gICd0bnQnLFxuICAndHJlZScsXG4gICd3b29sJ107XG5cbmZ1bmN0aW9uIGtleXNUb0Ryb3Bkb3duT3B0aW9ucyhrZXlzTGlzdCkge1xuICByZXR1cm4ga2V5c0xpc3QubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZGlzcGxheVRleHQgPSAoYmxvY2tzVG9EaXNwbGF5VGV4dFtrZXldIHx8IGtleSk7XG4gICAgcmV0dXJuIFtkaXNwbGF5VGV4dCwga2V5XTtcbiAgfSk7XG59XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24gKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIGRyb3Bkb3duQmxvY2tzID0gKGJsb2NrSW5zdGFsbE9wdGlvbnMubGV2ZWwuYXZhaWxhYmxlQmxvY2tzIHx8IFtdKS5jb25jYXQoXG4gICAgSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWZ0UGxheWVySW52ZW50b3J5JykpIHx8IFtdKTtcblxuICB2YXIgZHJvcGRvd25CbG9ja1NldCA9IHt9O1xuXG4gIGRyb3Bkb3duQmxvY2tzLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgIGRyb3Bkb3duQmxvY2tTZXRbdHlwZV0gPSB0cnVlO1xuICB9KTtcblxuICB2YXIgY3JhZnRCbG9ja09wdGlvbnMgPSB7XG4gICAgaW52ZW50b3J5QmxvY2tzOiBPYmplY3Qua2V5cyhkcm9wZG93bkJsb2NrU2V0KSxcbiAgICBpZkJsb2NrT3B0aW9uczogYmxvY2tJbnN0YWxsT3B0aW9ucy5sZXZlbC5pZkJsb2NrT3B0aW9ucyxcbiAgICBwbGFjZUJsb2NrT3B0aW9uczogYmxvY2tJbnN0YWxsT3B0aW9ucy5sZXZlbC5wbGFjZUJsb2NrT3B0aW9uc1xuICB9O1xuXG4gIHZhciBpbnZlbnRvcnlCbG9ja3NFbXB0eSA9ICFjcmFmdEJsb2NrT3B0aW9ucy5pbnZlbnRvcnlCbG9ja3MgfHxcbiAgICAgIGNyYWZ0QmxvY2tPcHRpb25zLmludmVudG9yeUJsb2Nrcy5sZW5ndGggPT09IDA7XG4gIHZhciBhbGxEcm9wZG93bkJsb2NrcyA9IGludmVudG9yeUJsb2Nrc0VtcHR5ID9cbiAgICAgIGFsbEJsb2NrcyA6IGNyYWZ0QmxvY2tPcHRpb25zLmludmVudG9yeUJsb2NrcztcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9tb3ZlRm9yd2FyZCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChpMThuLmJsb2NrTW92ZUZvcndhcmQoKSkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfbW92ZUZvcndhcmQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ21vdmVGb3J3YXJkKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3R1cm4gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9UdXJuJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3R1cm4uRElSRUNUSU9OUyA9XG4gICAgICBbW2kxOG4uYmxvY2tUdXJuTGVmdCgpICsgJyBcXHUyMUJBJywgJ2xlZnQnXSxcbiAgICAgICBbaTE4bi5ibG9ja1R1cm5SaWdodCgpICsgJyBcXHUyMUJCJywgJ3JpZ2h0J11dO1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3R1cm4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIGRpciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJyk7XG4gICAgdmFyIG1ldGhvZENhbGwgPSBkaXIgPT09IFwibGVmdFwiID8gXCJ0dXJuTGVmdFwiIDogXCJ0dXJuUmlnaHRcIjtcbiAgICByZXR1cm4gbWV0aG9kQ2FsbCArICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X2Rlc3Ryb3lCbG9jayA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChpMThuLmJsb2NrRGVzdHJveUJsb2NrKCkpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X2Rlc3Ryb3lCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnZGVzdHJveUJsb2NrKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9zaGVhciA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChpMThuLmJsb2NrU2hlYXIoKSkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfc2hlYXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ3NoZWFyKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF93aGlsZUJsb2NrQWhlYWQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRyb3Bkb3duT3B0aW9ucyA9IGtleXNUb0Ryb3Bkb3duT3B0aW9ucyhjcmFmdEJsb2NrT3B0aW9ucy5pZkJsb2NrT3B0aW9ucyB8fCBhbGxEcm9wZG93bkJsb2Nrcyk7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKGRyb3Bkb3duT3B0aW9ucyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZShkcm9wZG93bk9wdGlvbnNbMF1bMV0pO1xuXG4gICAgICB0aGlzLnNldEhTVigzMjIsIDAuOTAsIDAuOTUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja1doaWxlWEFoZWFkV2hpbGUoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdUWVBFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja1doaWxlWEFoZWFkQWhlYWQoKSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tXaGlsZVhBaGVhZERvKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfd2hpbGVCbG9ja0FoZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlubmVyQ29kZSA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgYmxvY2tUeXBlID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdUWVBFJyk7XG4gICAgcmV0dXJuICd3aGlsZUJsb2NrQWhlYWQoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnLFxcblwiJyArXG4gICAgICAgICAgICBibG9ja1R5cGUgKyAnXCIsICcgK1xuICAgICAgICAnICBmdW5jdGlvbigpIHsgJytcbiAgICAgICAgICAgIGlubmVyQ29kZSArXG4gICAgICAgICcgIH0nICtcbiAgICAgICAgJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9pZkJsb2NrQWhlYWQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRyb3Bkb3duT3B0aW9ucyA9IGtleXNUb0Ryb3Bkb3duT3B0aW9ucyhjcmFmdEJsb2NrT3B0aW9ucy5pZkJsb2NrT3B0aW9ucyB8fCBhbGxEcm9wZG93bkJsb2Nrcyk7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKGRyb3Bkb3duT3B0aW9ucyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZShkcm9wZG93bk9wdGlvbnNbMF1bMV0pO1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja0lmKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVFlQRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tXaGlsZVhBaGVhZEFoZWFkKCkpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrV2hpbGVYQWhlYWREbygpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X2lmQmxvY2tBaGVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lckNvZGUgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGJsb2NrVHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiAnaWZCbG9ja0FoZWFkKFwiJyArIGJsb2NrVHlwZSArICdcIiwgZnVuY3Rpb24oKSB7XFxuJyArXG4gICAgICBpbm5lckNvZGUgK1xuICAgICd9LCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9pZkxhdmFBaGVhZCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrSWZMYXZhQWhlYWQoKSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tXaGlsZVhBaGVhZERvKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfaWZMYXZhQWhlYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5uZXJDb2RlID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jykuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHJldHVybiAnaWZMYXZhQWhlYWQoZnVuY3Rpb24oKSB7XFxuJyArXG4gICAgICBpbm5lckNvZGUgK1xuICAgICd9LCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfcGxhY2VCbG9jayA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZHJvcGRvd25PcHRpb25zID0ga2V5c1RvRHJvcGRvd25PcHRpb25zKGNyYWZ0QmxvY2tPcHRpb25zLnBsYWNlQmxvY2tPcHRpb25zIHx8IGFsbERyb3Bkb3duQmxvY2tzKTtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oZHJvcGRvd25PcHRpb25zKTtcbiAgICAgIGRyb3Bkb3duLnNldFZhbHVlKGRyb3Bkb3duT3B0aW9uc1swXVsxXSk7XG5cbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrUGxhY2VYUGxhY2UoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdUWVBFJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9wbGFjZUJsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJsb2NrVHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiAncGxhY2VCbG9jayhcIicgKyBibG9ja1R5cGUgKyAnXCIsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9wbGFjZVRvcmNoID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrUGxhY2VUb3JjaCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3BsYWNlVG9yY2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ3BsYWNlVG9yY2goXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3BsYW50Q3JvcCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja1BsYW50Q3JvcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3BsYW50Q3JvcCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAncGxhbnRDcm9wKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF90aWxsU29pbCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja1RpbGxTb2lsKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3RpbGxTb2lsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICd0aWxsU29pbChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfcGxhY2VCbG9ja0FoZWFkID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkcm9wZG93bk9wdGlvbnMgPSBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoY3JhZnRCbG9ja09wdGlvbnMucGxhY2VCbG9ja09wdGlvbnMgfHwgYWxsRHJvcGRvd25CbG9ja3MpO1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihkcm9wZG93bk9wdGlvbnMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUoZHJvcGRvd25PcHRpb25zWzBdWzFdKTtcblxuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tQbGFjZVhBaGVhZFBsYWNlKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVFlQRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tQbGFjZVhBaGVhZEFoZWFkKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfcGxhY2VCbG9ja0FoZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJsb2NrVHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiAncGxhY2VCbG9ja0FoZWFkKFwiJyArIGJsb2NrVHlwZSArICdcIiwgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG59O1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmNyYWZ0X2xvY2FsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lKaWRXbHNaQzlxY3k5amNtRm1kQzloY0drdWFuTWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXMTE5Il19
