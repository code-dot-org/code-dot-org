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
  options.mobileNoPaddingShareWidth = options.nativeVizWidth;

  appMain(window.Craft, levels, options);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkL2pzL2NyYWZ0L21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xDLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0FBQ2pDLFFBQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztDQUM3QjtBQUNELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvQixNQUFNLENBQUMsU0FBUyxHQUFHLFVBQVMsT0FBTyxFQUFFO0FBQ25DLFNBQU8sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDOztBQUU1QixTQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM5QixTQUFPLENBQUMscUJBQXFCLEdBQUcsR0FBRyxDQUFDO0FBQ3BDLE1BQUksUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUNuQixNQUFJLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDcEIsU0FBTyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFDbEMsU0FBTyxDQUFDLGNBQWMsR0FBRyxRQUFRLEdBQUcsU0FBUyxDQUFDO0FBQzlDLFNBQU8sQ0FBQyx5QkFBeUIsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDOztBQUUzRCxTQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDeEMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuQ3JhZnQgPSByZXF1aXJlKCcuL2NyYWZ0Jyk7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZ2xvYmFsLkNyYWZ0ID0gd2luZG93LkNyYWZ0O1xufVxudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcblxud2luZG93LmNyYWZ0TWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuXG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBvcHRpb25zLm1heFZpc3VhbGl6YXRpb25XaWR0aCA9IDYwMDtcbiAgdmFyIGFwcFdpZHRoID0gNDM0O1xuICB2YXIgYXBwSGVpZ2h0ID0gNDc3O1xuICBvcHRpb25zLm5hdGl2ZVZpeldpZHRoID0gYXBwV2lkdGg7XG4gIG9wdGlvbnMudml6QXNwZWN0UmF0aW8gPSBhcHBXaWR0aCAvIGFwcEhlaWdodDtcbiAgb3B0aW9ucy5tb2JpbGVOb1BhZGRpbmdTaGFyZVdpZHRoID0gb3B0aW9ucy5uYXRpdmVWaXpXaWR0aDtcblxuICBhcHBNYWluKHdpbmRvdy5DcmFmdCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iXX0=
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

  config.level.disableFinalStageMessage = true;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9jcmFmdC9tYWluLmpzIiwiYnVpbGQvanMvY3JhZnQvc2tpbnMuanMiLCJidWlsZC9qcy9jcmFmdC9sZXZlbHMuanMiLCJidWlsZC9qcy9jcmFmdC9jcmFmdC5qcyIsImJ1aWxkL2pzL2NyYWZ0L3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9jcmFmdC9sZXZlbGJ1aWxkZXJPdmVycmlkZXMuanMiLCJidWlsZC9qcy9jcmFmdC9ob3VzZUxldmVscy5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvR2FtZUNvbnRyb2xsZXIuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0xldmVsTVZDL0xldmVsVmlldy5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvTGV2ZWxNb2RlbC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvTGV2ZWxCbG9jay5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvRmFjaW5nRGlyZWN0aW9uLmpzIiwiYnVpbGQvanMvY3JhZnQvZ2FtZS9MZXZlbE1WQy9Bc3NldExvYWRlci5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQVBJL0NvZGVPcmdBUEkuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9XaGlsZUNvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9UdXJuQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL1BsYWNlSW5Gcm9udENvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9QbGFjZUJsb2NrQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL01vdmVGb3J3YXJkQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL0lmQmxvY2tBaGVhZENvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9EZXN0cm95QmxvY2tDb21tYW5kLmpzIiwiYnVpbGQvanMvY3JhZnQvZ2FtZS9Db21tYW5kUXVldWUvQ2hlY2tTb2x1dGlvbkNvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9Db21tYW5kUXVldWUuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9CYXNlQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL0NvbW1hbmRTdGF0ZS5qcyIsImJ1aWxkL2pzL2NyYWZ0L2RpYWxvZ3MvcGxheWVyU2VsZWN0aW9uLmh0bWwuZWpzIiwiYnVpbGQvanMvY3JhZnQvZGlhbG9ncy9ob3VzZVNlbGVjdGlvbi5odG1sLmVqcyIsImJ1aWxkL2pzL2NyYWZ0L2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvY3JhZnQvYmxvY2tzLmpzIiwiYnVpbGQvanMvY3JhZnQvbG9jYWxlLmpzIiwiYnVpbGQvanMvY3JhZnQvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQkEsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVwQyxJQUFJLE9BQU8sR0FBRztBQUNaLE9BQUssRUFBRSxFQUNOO0NBQ0YsQ0FBQzs7QUFFRixPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNwQyxNQUFJLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFB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RUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQ3pGOztBQUVELHlCQUFxQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1RCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOztBQUVsRCxlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3RFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFDaEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQzdDOztBQUVELGNBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDaEQ7R0FDRjtBQUNELEtBQUcsRUFBRTtBQUNILG9CQUFnQixFQUFFLEVBQUU7QUFDcEIsY0FBVSxFQUFFLElBQUk7QUFDaEIsYUFBUyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQ25DLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FDdkIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUN6QjtBQUNELGlCQUFhLEVBQUUsaUVBQWlFOztBQUVoRix1QkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRTNCLGVBQVcsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDcEcsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN2RyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FDekY7O0FBRUQseUJBQXFCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRWxELGVBQVcsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDdEUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUNoRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDN0M7O0FBRUQsY0FBVSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDL0MsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDL0MsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUNoRDs7QUFFRCx3QkFBb0IsRUFBRSw4QkFBVSxlQUFlLEVBQUU7QUFDL0MsYUFBTyxlQUFlLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2pEOztHQUVGO0FBQ0QsS0FBRyxFQUFFO0FBQ0gsb0JBQWdCLEVBQUUsRUFBRTtBQUNwQixjQUFVLEVBQUUsSUFBSTtBQUNoQixhQUFTLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsR0FDbkMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUN2QixVQUFVLENBQUMsVUFBVSxDQUFDLEdBQ3RCLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FDMUIsVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUN4QixLQUFLLENBQUMsaUJBQWlCLENBQUMsR0FDeEIsY0FBYyxHQUNkLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUNoQztBQUNELGlCQUFhLEVBQUUsaUVBQWlFOztBQUVoRixlQUFXLEVBQUUsQ0FDWCxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hHLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDdkgsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hHLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQ3pGOztBQUVELHlCQUFxQixFQUFFLENBQ3JCLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7QUFFbEQsZUFBVyxFQUFFLENBQ1gsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUN2Qzs7QUFFRCxjQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFF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RSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RGLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQ3ZDLENBQUM7QUFDRixZQUFNO0FBQUEsR0FDVDs7QUFFRCxXQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FB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QUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO0FBQ3o3Qix3QkFBb0IsRUFBRSxDQUFDLFVBQVUsZUFBZSxFQUFFO0FBQ2hELGFBQU8sZUFBZSxDQUFDLDJCQUEyQixDQUFDLENBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDbEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDbEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUMsQ0FBQSxDQUFFLFFBQVEsRUFBRTtBQUNiLGlCQUFhLEVBQUUsQ0FDYixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMzRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RGLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRXpDLG9CQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUN6QjtBQUNELFFBQU0sRUFBRTtBQUNOLGlCQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7QUFDOTlCLDJCQUF1QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzNiLGlCQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDL2MsMEJBQXNCLEVBQUUsazdCQUFrN0I7QUFDMThCLGlCQUFhLEVBQUUsa3FCQUFrcUI7O0FBRWpyQixpQkFBYSxFQUFFLENBQ2IsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDM0QsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0RixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOztBQUV6QyxvQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDekI7QUFDRCxRQUFNLEVBQUU7QUFDTixlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7QUFDMytCLHdCQUFvQixFQUFFLDI3QkFBMjdCO0FBQ2o5QixlQUFXLEVBQUUsNFdBQTRXO0FBQ3pYLGlCQUFhLEVBQUUsQ0FDYixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzNELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEYsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDekMsZUFBVyxFQUFFLENBQ1gsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUs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WSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUU3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTdCLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixlQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGVBQVMsQ0FBQyxJQUFJLENB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QixFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMzSCxVQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5SCxVQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoSSxVQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEksVUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ25JLFVBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FB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QUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixL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QUMscUJBQXFCLEVBQUUsQ0FBQyxDQUN6QyxXQUFXLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztBQUMvQyxVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzdCO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxZQUFXO0FBQ3JFLFFBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0MsV0FBTyxtQkFBbUIsR0FBRyxTQUFTLEdBQUcsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDaEYsQ0FBQztDQUVILENBQUM7Ozs7O0FDelZGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7OztBQ0E3QztBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuQ3JhZnQgPSByZXF1aXJlKCcuL2NyYWZ0Jyk7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZ2xvYmFsLkNyYWZ0ID0gd2luZG93LkNyYWZ0O1xufVxudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcblxud2luZG93LmNyYWZ0TWFpbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcblxuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgb3B0aW9ucy5tYXhWaXN1YWxpemF0aW9uV2lkdGggPSA2MDA7XG4gIHZhciBhcHBXaWR0aCA9IDQzNDtcbiAgdmFyIGFwcEhlaWdodCA9IDQ3NztcbiAgb3B0aW9ucy5uYXRpdmVWaXpXaWR0aCA9IGFwcFdpZHRoO1xuICBvcHRpb25zLnZpekFzcGVjdFJhdGlvID0gYXBwV2lkdGggLyBhcHBIZWlnaHQ7XG4gIG9wdGlvbnMubW9iaWxlTm9QYWRkaW5nU2hhcmVXaWR0aCA9IG9wdGlvbnMubmF0aXZlVml6V2lkdGg7XG5cbiAgYXBwTWFpbih3aW5kb3cuQ3JhZnQsIGxldmVscywgb3B0aW9ucyk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltSjFhV3hrTDJwekwyTnlZV1owTDIxaGFXNHVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3TzBGQlFVRXNTVUZCU1N4UFFVRlBMRWRCUVVjc1QwRkJUeXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZETzBGQlEzQkRMRTFCUVUwc1EwRkJReXhMUVVGTExFZEJRVWNzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPMEZCUTJ4RExFbEJRVWtzVDBGQlR5eE5RVUZOTEV0QlFVc3NWMEZCVnl4RlFVRkZPMEZCUTJwRExGRkJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJRenREUVVNM1FqdEJRVU5FTEVsQlFVa3NUVUZCVFN4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVU5xUXl4SlFVRkpMRTFCUVUwc1IwRkJSeXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdRVUZEYWtNc1NVRkJTU3hMUVVGTExFZEJRVWNzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRPenRCUVVVdlFpeE5RVUZOTEVOQlFVTXNVMEZCVXl4SFFVRkhMRlZCUVZNc1QwRkJUeXhGUVVGRk8wRkJRMjVETEZOQlFVOHNRMEZCUXl4WFFVRlhMRWRCUVVjc1MwRkJTeXhEUVVGRE96dEJRVVUxUWl4VFFVRlBMRU5CUVVNc1dVRkJXU3hIUVVGSExFMUJRVTBzUTBGQlF6dEJRVU01UWl4VFFVRlBMRU5CUVVNc2NVSkJRWEZDTEVkQlFVY3NSMEZCUnl4RFFVRkRPMEZCUTNCRExFMUJRVWtzVVVGQlVTeEhRVUZITEVkQlFVY3NRMEZCUXp0QlFVTnVRaXhOUVVGSkxGTkJRVk1zUjBGQlJ5eEhRVUZITEVOQlFVTTdRVUZEY0VJc1UwRkJUeXhEUVVGRExHTkJRV01zUjBGQlJ5eFJRVUZSTEVOQlFVTTdRVUZEYkVNc1UwRkJUeXhEUVVGRExHTkJRV01zUjBGQlJ5eFJRVUZSTEVkQlFVY3NVMEZCVXl4RFFVRkRPMEZCUXpsRExGTkJRVThzUTBGQlF5eDVRa0ZCZVVJc1IwRkJSeXhQUVVGUExFTkJRVU1zWTBGQll5eERRVUZET3p0QlFVVXpSQ3hUUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NSVUZCUlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03UTBGRGVFTXNRMEZCUXlJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lkbUZ5SUdGd2NFMWhhVzRnUFNCeVpYRjFhWEpsS0NjdUxpOWhjSEJOWVdsdUp5azdYRzUzYVc1a2IzY3VRM0poWm5RZ1BTQnlaWEYxYVhKbEtDY3VMMk55WVdaMEp5azdYRzVwWmlBb2RIbHdaVzltSUdkc2IySmhiQ0FoUFQwZ0ozVnVaR1ZtYVc1bFpDY3BJSHRjYmlBZ1oyeHZZbUZzTGtOeVlXWjBJRDBnZDJsdVpHOTNMa055WVdaME8xeHVmVnh1ZG1GeUlHSnNiMk5yY3lBOUlISmxjWFZwY21Vb0p5NHZZbXh2WTJ0ekp5azdYRzUyWVhJZ2JHVjJaV3h6SUQwZ2NtVnhkV2x5WlNnbkxpOXNaWFpsYkhNbktUdGNiblpoY2lCemEybHVjeUE5SUhKbGNYVnBjbVVvSnk0dmMydHBibk1uS1R0Y2JseHVkMmx1Wkc5M0xtTnlZV1owVFdGcGJpQTlJR1oxYm1OMGFXOXVLRzl3ZEdsdmJuTXBJSHRjYmlBZ2IzQjBhVzl1Y3k1emEybHVjMDF2WkhWc1pTQTlJSE5yYVc1ek8xeHVYRzRnSUc5d2RHbHZibk11WW14dlkydHpUVzlrZFd4bElEMGdZbXh2WTJ0ek8xeHVJQ0J2Y0hScGIyNXpMbTFoZUZacGMzVmhiR2w2WVhScGIyNVhhV1IwYUNBOUlEWXdNRHRjYmlBZ2RtRnlJR0Z3Y0ZkcFpIUm9JRDBnTkRNME8xeHVJQ0IyWVhJZ1lYQndTR1ZwWjJoMElEMGdORGMzTzF4dUlDQnZjSFJwYjI1ekxtNWhkR2wyWlZacGVsZHBaSFJvSUQwZ1lYQndWMmxrZEdnN1hHNGdJRzl3ZEdsdmJuTXVkbWw2UVhOd1pXTjBVbUYwYVc4Z1BTQmhjSEJYYVdSMGFDQXZJR0Z3Y0VobGFXZG9kRHRjYmlBZ2IzQjBhVzl1Y3k1dGIySnBiR1ZPYjFCaFpHUnBibWRUYUdGeVpWZHBaSFJvSUQwZ2IzQjBhVzl1Y3k1dVlYUnBkbVZXYVhwWGFXUjBhRHRjYmx4dUlDQmhjSEJOWVdsdUtIZHBibVJ2ZHk1RGNtRm1kQ3dnYkdWMlpXeHpMQ0J2Y0hScGIyNXpLVHRjYm4wN1hHNGlYWDA9IiwidmFyIHNraW5zQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbnZhciBDT05GSUdTID0ge1xuICBjcmFmdDoge1xuICB9XG59O1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luc0Jhc2UubG9hZChhc3NldFVybCwgaWQpO1xuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuLyogZ2xvYmFsICQgKi9cblxudmFyIHRiID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKS5jcmVhdGVUb29sYm94O1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGNhdGVnb3J5ID0gZnVuY3Rpb24gKG5hbWUsIGJsb2Nrcykge1xuICByZXR1cm4gJzxjYXRlZ29yeSBpZD1cIicgKyBuYW1lICsgJ1wiIG5hbWU9XCInICsgbmFtZSArICdcIj4nICsgYmxvY2tzICsgJzwvY2F0ZWdvcnk+Jztcbn07XG5cbnZhciBtb3ZlRm9yd2FyZEJsb2NrID0gJzxibG9jayB0eXBlPVwiY3JhZnRfbW92ZUZvcndhcmRcIj48L2Jsb2NrPic7XG5cbmZ1bmN0aW9uIGNyYWZ0QmxvY2sodHlwZSkge1xuICByZXR1cm4gYmxvY2soXCJjcmFmdF9cIiArIHR5cGUpO1xufVxuXG5mdW5jdGlvbiBibG9jayh0eXBlKSB7XG4gIHJldHVybiAnPGJsb2NrIHR5cGU9XCInICsgdHlwZSArICdcIj48L2Jsb2NrPic7XG59XG5cbnZhciByZXBlYXREcm9wZG93biA9ICc8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9kcm9wZG93blwiPicgK1xuICAnICA8dGl0bGUgbmFtZT1cIlRJTUVTXCIgY29uZmlnPVwiMy0xMFwiPj8/PzwvdGl0bGU+JyArXG4gICc8L2Jsb2NrPic7XG5cbnZhciB0dXJuTGVmdEJsb2NrID0gJzxibG9jayB0eXBlPVwiY3JhZnRfdHVyblwiPicgK1xuICAnICA8dGl0bGUgbmFtZT1cIkRJUlwiPmxlZnQ8L3RpdGxlPicgK1xuICAnPC9ibG9jaz4nO1xuXG52YXIgdHVyblJpZ2h0QmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJjcmFmdF90dXJuXCI+JyArXG4gICAgJzx0aXRsZSBuYW1lPVwiRElSXCI+cmlnaHQ8L3RpdGxlPicgK1xuICAnPC9ibG9jaz4nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ3BsYXlncm91bmQnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW10sXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHRiKGNyYWZ0QmxvY2soJ21vdmVGb3J3YXJkJykgK1xuICAgICAgICBjcmFmdEJsb2NrKCd0dXJuUmlnaHQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3R1cm5MZWZ0JykgK1xuICAgICAgICBjcmFmdEJsb2NrKCdkZXN0cm95QmxvY2snKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3BsYWNlQmxvY2snKSArXG4gICAgICAgIGJsb2NrKCdjb250cm9sc19yZXBlYXQnKSArXG4gICAgICAgIHJlcGVhdERyb3Bkb3duICtcbiAgICAgICAgY3JhZnRCbG9jaygnd2hpbGVCbG9ja0FoZWFkJylcbiAgICApLFxuICAgICdzdGFydEJsb2Nrcyc6ICc8YmxvY2sgdHlwZT1cIndoZW5fcnVuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPicsXG5cbiAgICBncm91bmRQbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiY29hcnNlRGlydFwiLCBcImNvYXJzZURpcnRcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIlxuICAgIF0sXG5cbiAgICBncm91bmREZWNvcmF0aW9uUGxhbmU6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcInRhbGxHcmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSxcblxuICAgIGFjdGlvblBsYW5lOiBbXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJcIiwgXCJncmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImdyYXNzXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIlxuICAgIF0sXG5cbiAgICBmbHVmZlBsYW5lOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIlxuICAgIF0sXG4gIH0sXG4gICcxJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtdLFxuICAgICdmcmVlUGxheSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB0YihjcmFmdEJsb2NrKCdtb3ZlRm9yd2FyZCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygndHVyblJpZ2h0JykgK1xuICAgICAgICBjcmFmdEJsb2NrKCd0dXJuTGVmdCcpXG4gICAgKSxcbiAgICAnc3RhcnRCbG9ja3MnOiAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nLFxuXG4gICAgcGxheWVyU3RhcnRQb3NpdGlvbjogWzMsIDRdLFxuXG4gICAgZ3JvdW5kUGxhbmU6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImNvYXJzZURpcnRcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwiY29hcnNlRGlydFwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCJcbiAgICBdLFxuXG4gICAgZ3JvdW5kRGVjb3JhdGlvblBsYW5lOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sXG5cbiAgICBhY3Rpb25QbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiXCIsIFwiZ3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJncmFzc1wiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCJcbiAgICBdLFxuXG4gICAgZmx1ZmZQbGFuZTogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCJcbiAgICBdLFxuXG4gICAgdmVyaWZpY2F0aW9uRnVuY3Rpb246IGZ1bmN0aW9uICh2ZXJpZmljYXRpb25BUEkpIHtcbiAgICAgIHJldHVybiB2ZXJpZmljYXRpb25BUEkuaXNQbGF5ZXJOZXh0VG8oXCJsb2dPYWtcIik7XG4gICAgfSxcblxuICB9LFxuICAnMic6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgICAnZnJlZVBsYXknOiB0cnVlLFxuICAgICd0b29sYm94JzogdGIoY3JhZnRCbG9jaygnbW92ZUZvcndhcmQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3R1cm5SaWdodCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygndHVybkxlZnQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ2Rlc3Ryb3lCbG9jaycpICtcbiAgICAgICAgY3JhZnRCbG9jaygncGxhY2VCbG9jaycpICtcbiAgICAgICAgYmxvY2soJ2NvbnRyb2xzX3JlcGVhdCcpICtcbiAgICAgICAgcmVwZWF0RHJvcGRvd24gK1xuICAgICAgICBjcmFmdEJsb2NrKCd3aGlsZUJsb2NrQWhlYWQnKVxuICAgICksXG4gICAgJ3N0YXJ0QmxvY2tzJzogJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+JyxcblxuICAgIGdyb3VuZFBsYW5lOiBbXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJjb2Fyc2VEaXJ0XCIsIFwiY29hcnNlRGlydFwiLCBcImNvYXJzZURpcnRcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiXG4gICAgXSxcblxuICAgIGdyb3VuZERlY29yYXRpb25QbGFuZTogW1xuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcInRhbGxHcmFzc1wiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sXG5cbiAgICBhY3Rpb25QbGFuZTogW1xuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICBdLFxuXG4gICAgZmx1ZmZQbGFuZTogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgXSxcbiAgfSxcbiAgJ2N1c3RvbSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAndG9vbGJveCc6IHRiKG1vdmVGb3J3YXJkQmxvY2sgKyB0dXJuTGVmdEJsb2NrICsgdHVyblJpZ2h0QmxvY2spXG4gIH1cbn07XG4iLCIvKiBnbG9iYWwgdHJhY2tFdmVudCAqL1xuXG4vKmpzaGludCAtVzA2MSAqL1xuLy8gV2UgdXNlIGV2YWwgaW4gb3VyIGNvZGUsIHRoaXMgYWxsb3dzIGl0LlxuLy8gQHNlZSBodHRwczovL2pzbGludGVycm9ycy5jb20vZXZhbC1pcy1ldmlsXG5cbid1c2Ugc3RyaWN0JztcbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgY3JhZnRNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgR2FtZUNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2dhbWUvR2FtZUNvbnRyb2xsZXInKTtcbnZhciBkb20gPSByZXF1aXJlKCcuLi9kb20nKTtcbnZhciBob3VzZUxldmVscyA9IHJlcXVpcmUoJy4vaG91c2VMZXZlbHMnKTtcbnZhciBsZXZlbGJ1aWxkZXJPdmVycmlkZXMgPSByZXF1aXJlKCcuL2xldmVsYnVpbGRlck92ZXJyaWRlcycpO1xudmFyIE11c2ljQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL011c2ljQ29udHJvbGxlcicpO1xuXG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG52YXIgTUVESUFfVVJMID0gJy9ibG9ja2x5L21lZGlhL2NyYWZ0Lyc7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmFtZXNwYWNlIGZvciB0aGUgYXBwbGljYXRpb24uXG4gKi9cbnZhciBDcmFmdCA9IG1vZHVsZS5leHBvcnRzO1xuXG52YXIgY2hhcmFjdGVycyA9IHtcbiAgU3RldmU6IHtcbiAgICBuYW1lOiBcIlN0ZXZlXCIsXG4gICAgc3RhdGljQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX1N0ZXZlX05ldXRyYWwucG5nXCIsXG4gICAgc21hbGxTdGF0aWNBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfU3RldmVfTmV1dHJhbC5wbmdcIixcbiAgICBmYWlsdXJlQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX1N0ZXZlX0ZhaWwucG5nXCIsXG4gICAgd2luQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX1N0ZXZlX1dpbi5wbmdcIixcbiAgfSxcbiAgQWxleDoge1xuICAgIG5hbWU6IFwiQWxleFwiLFxuICAgIHN0YXRpY0F2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9BbGV4X05ldXRyYWwucG5nXCIsXG4gICAgc21hbGxTdGF0aWNBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfQWxleF9OZXV0cmFsLnBuZ1wiLFxuICAgIGZhaWx1cmVBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfQWxleF9GYWlsLnBuZ1wiLFxuICAgIHdpbkF2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9BbGV4X1dpbi5wbmdcIixcbiAgfVxufTtcblxudmFyIGludGVyZmFjZUltYWdlcyA9IHtcbiAgREVGQVVMVDogW1xuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL01DX0xvYWRpbmdfU3Bpbm5lci5naWZcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9GcmFtZV9MYXJnZV9QbHVzX0xvZ28ucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1hfQnV0dG9uLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0J1dHRvbl9HcmV5X1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1J1bl9CdXR0b25fVXBfU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvTUNfUnVuX0Fycm93X0ljb24ucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUnVuX0J1dHRvbl9Eb3duX1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1Jlc2V0X0J1dHRvbl9VcF9TbGljZS5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9NQ19SZXNldF9BcnJvd19JY29uLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1Jlc2V0X0J1dHRvbl9Eb3duX1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0NhbGxvdXRfVGFpbC5wbmdcIixcbiAgXSxcbiAgMTogW1xuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1N0ZXZlX0NoYXJhY3Rlcl9TZWxlY3QucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvQWxleF9DaGFyYWN0ZXJfU2VsZWN0LnBuZ1wiLFxuICAgIGNoYXJhY3RlcnMuU3RldmUuc3RhdGljQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuU3RldmUuc21hbGxTdGF0aWNBdmF0YXIsXG4gICAgY2hhcmFjdGVycy5BbGV4LnN0YXRpY0F2YXRhcixcbiAgICBjaGFyYWN0ZXJzLkFsZXguc21hbGxTdGF0aWNBdmF0YXIsXG4gIF0sXG4gIDI6IFtcbiAgICAvLyBUT0RPKGJqb3JkYW4pOiBmaW5kIGRpZmZlcmVudCBwcmUtbG9hZCBwb2ludCBmb3IgZmVlZGJhY2sgaW1hZ2VzLFxuICAgIC8vIGJ1Y2tldCBieSBzZWxlY3RlZCBjaGFyYWN0ZXJcbiAgICBjaGFyYWN0ZXJzLkFsZXgud2luQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuU3RldmUud2luQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuQWxleC5mYWlsdXJlQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuU3RldmUuZmFpbHVyZUF2YXRhcixcbiAgXSxcbiAgNjogW1xuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0hvdXNlX09wdGlvbl9BX3YzLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0hvdXNlX09wdGlvbl9CX3YzLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0hvdXNlX09wdGlvbl9DX3YzLnBuZ1wiLFxuICBdXG59O1xuXG52YXIgTVVTSUNfTUVUQURBVEEgPSBbXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTFcIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTItcXVpZXRcIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTNcIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTQtaW50cm9cIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTUtc2hvcnRwaWFub1wifSxcbiAge3ZvbHVtZTogMSwgaGFzT2dnOiB0cnVlLCBuYW1lOiBcInZpZ25ldHRlNy1mdW5reS1jaGlycHMtc2hvcnRcIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTgtZnJlZS1wbGF5XCJ9LFxuXTtcblxudmFyIENIQVJBQ1RFUl9TVEVWRSA9ICdTdGV2ZSc7XG52YXIgQ0hBUkFDVEVSX0FMRVggPSAnQWxleCc7XG52YXIgREVGQVVMVF9DSEFSQUNURVIgPSBDSEFSQUNURVJfU1RFVkU7XG52YXIgQVVUT19MT0FEX0NIQVJBQ1RFUl9BU1NFVF9QQUNLID0gJ3BsYXllcicgKyBERUZBVUxUX0NIQVJBQ1RFUjtcblxuZnVuY3Rpb24gdHJ5U2V0TG9jYWxTdG9yYWdlSXRlbShrZXksIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLyoqXG4gICAgICogbG9jYWxzdG9yYWdlIC5zZXRJdGVtIGluIGlPUyBTYWZhcmkgUHJpdmF0ZSBNb2RlIGFsd2F5cyBjYXVzZXMgYW5cbiAgICAgKiBleGNlcHRpb24sIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDU1NTM2MVxuICAgICAqL1xuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkNvdWxkbid0IHNldCBsb2NhbCBzdG9yYWdlIGl0ZW0gZm9yIGtleSBcIiArIGtleSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGUgQ3JhZnQgYXBwLiBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5DcmFmdC5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXIgPT09IDEgJiYgY29uZmlnLmxldmVsLnN0YWdlX3RvdGFsID09PSAxKSB7XG4gICAgLy8gTm90IHZpZXdpbmcgbGV2ZWwgd2l0aGluIGEgc2NyaXB0LCBidW1wIHB1enpsZSAjIHRvIHVudXNlZCBvbmUgc29cbiAgICAvLyBhc3NldCBsb2FkaW5nIHN5c3RlbSBhbmQgbGV2ZWxidWlsZGVyIG92ZXJyaWRlcyBkb24ndCB0aGluayB0aGlzIGlzXG4gICAgLy8gbGV2ZWwgMSBvciBhbnkgb3RoZXIgc3BlY2lhbCBsZXZlbC5cbiAgICBjb25maWcubGV2ZWwucHV6emxlX251bWJlciA9IDk5OTtcbiAgfVxuXG4gIGlmIChjb25maWcubGV2ZWwuaXNUZXN0TGV2ZWwpIHtcbiAgICBjb25maWcubGV2ZWwuY3VzdG9tU2xvd01vdGlvbiA9IDAuMTtcbiAgfVxuXG4gIGNvbmZpZy5sZXZlbC5kaXNhYmxlRmluYWxTdGFnZU1lc3NhZ2UgPSB0cnVlO1xuXG4gIC8vIFJldHVybiB0aGUgdmVyc2lvbiBvZiBJbnRlcm5ldCBFeHBsb3JlciAoOCspIG9yIHVuZGVmaW5lZCBpZiBub3QgSUUuXG4gIHZhciBnZXRJRVZlcnNpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRNb2RlO1xuICB9O1xuXG4gIHZhciBpZVZlcnNpb25OdW1iZXIgPSBnZXRJRVZlcnNpb24oKTtcbiAgaWYgKGllVmVyc2lvbk51bWJlcikge1xuICAgICQoJ2JvZHknKS5hZGRDbGFzcyhcImllVmVyc2lvblwiICsgaWVWZXJzaW9uTnVtYmVyKTtcbiAgfVxuXG4gIHZhciBib2R5RWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XG4gIGJvZHlFbGVtZW50LmNsYXNzTmFtZSA9IGJvZHlFbGVtZW50LmNsYXNzTmFtZSArIFwiIG1pbmVjcmFmdFwiO1xuXG4gIGlmIChjb25maWcubGV2ZWwuc2hvd1BvcHVwT25Mb2FkKSB7XG4gICAgY29uZmlnLmxldmVsLmFmdGVyVmlkZW9CZWZvcmVJbnN0cnVjdGlvbnNGbiA9IChzaG93SW5zdHJ1Y3Rpb25zKSA9PiB7XG4gICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgIGV2ZW50LmluaXRFdmVudCgnaW5zdHJ1Y3Rpb25zU2hvd24nLCB0cnVlLCB0cnVlKTtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXG4gICAgICBpZiAoY29uZmlnLmxldmVsLnNob3dQb3B1cE9uTG9hZCA9PT0gJ3BsYXllclNlbGVjdGlvbicpIHtcbiAgICAgICAgQ3JhZnQuc2hvd1BsYXllclNlbGVjdGlvblBvcHVwKGZ1bmN0aW9uIChzZWxlY3RlZFBsYXllcikge1xuICAgICAgICAgIHRyYWNrRXZlbnQoJ01pbmVjcmFmdCcsICdDaG9zZUNoYXJhY3RlcicsIHNlbGVjdGVkUGxheWVyKTtcbiAgICAgICAgICBDcmFmdC5jbGVhclBsYXllclN0YXRlKCk7XG4gICAgICAgICAgdHJ5U2V0TG9jYWxTdG9yYWdlSXRlbSgnY3JhZnRTZWxlY3RlZFBsYXllcicsIHNlbGVjdGVkUGxheWVyKTtcbiAgICAgICAgICBDcmFmdC51cGRhdGVVSUZvckNoYXJhY3RlcihzZWxlY3RlZFBsYXllcik7XG4gICAgICAgICAgQ3JhZnQuaW5pdGlhbGl6ZUFwcExldmVsKGNvbmZpZy5sZXZlbCk7XG4gICAgICAgICAgc2hvd0luc3RydWN0aW9ucygpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmxldmVsLnNob3dQb3B1cE9uTG9hZCA9PT0gJ2hvdXNlTGF5b3V0U2VsZWN0aW9uJykge1xuICAgICAgICBDcmFmdC5zaG93SG91c2VTZWxlY3Rpb25Qb3B1cChmdW5jdGlvbihzZWxlY3RlZEhvdXNlKSB7XG4gICAgICAgICAgdHJhY2tFdmVudCgnTWluZWNyYWZ0JywgJ0Nob3NlSG91c2UnLCBzZWxlY3RlZEhvdXNlKTtcbiAgICAgICAgICBpZiAoIWxldmVsQ29uZmlnLmVkaXRfYmxvY2tzKSB7XG4gICAgICAgICAgICAkLmV4dGVuZChjb25maWcubGV2ZWwsIGhvdXNlTGV2ZWxzW3NlbGVjdGVkSG91c2VdKTtcblxuICAgICAgICAgICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5jbGVhcigpO1xuICAgICAgICAgICAgc3R1ZGlvQXBwLnNldFN0YXJ0QmxvY2tzXyhjb25maWcsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBDcmFmdC5pbml0aWFsaXplQXBwTGV2ZWwoY29uZmlnLmxldmVsKTtcbiAgICAgICAgICBzaG93SW5zdHJ1Y3Rpb25zKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBpZiAoY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXIgJiYgbGV2ZWxidWlsZGVyT3ZlcnJpZGVzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXSkge1xuICAgICQuZXh0ZW5kKGNvbmZpZy5sZXZlbCwgbGV2ZWxidWlsZGVyT3ZlcnJpZGVzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXSk7XG4gIH1cbiAgQ3JhZnQuaW5pdGlhbENvbmZpZyA9IGNvbmZpZztcblxuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucmVzZXQgPSB0aGlzLnJlc2V0LmJpbmQodGhpcyk7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBDcmFmdC5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcbiAgQ3JhZnQuc2tpbiA9IGNvbmZpZy5za2luO1xuXG4gIHZhciBsZXZlbFRyYWNrcyA9IFtdO1xuICBpZiAoQ3JhZnQubGV2ZWwuc29uZ3MgJiYgTVVTSUNfTUVUQURBVEEpIHtcbiAgICBsZXZlbFRyYWNrcyA9IE1VU0lDX01FVEFEQVRBLmZpbHRlcihmdW5jdGlvbih0cmFja01ldGFkYXRhKSB7XG4gICAgICByZXR1cm4gQ3JhZnQubGV2ZWwuc29uZ3MuaW5kZXhPZih0cmFja01ldGFkYXRhLm5hbWUpICE9PSAtMTtcbiAgICB9KTtcbiAgfVxuXG4gIENyYWZ0Lm11c2ljQ29udHJvbGxlciA9IG5ldyBNdXNpY0NvbnRyb2xsZXIoXG4gICAgICBzdHVkaW9BcHAuY2RvU291bmRzLFxuICAgICAgZnVuY3Rpb24gKGZpbGVuYW1lKSB7XG4gICAgICAgIHJldHVybiBjb25maWcuc2tpbi5hc3NldFVybChgbXVzaWMvJHtmaWxlbmFtZX1gKTtcbiAgICAgIH0sXG4gICAgICBsZXZlbFRyYWNrcyxcbiAgICAgIGxldmVsVHJhY2tzLmxlbmd0aCA+IDEgPyA3NTAwIDogbnVsbFxuICApO1xuXG4gIC8vIFBsYXkgbXVzaWMgd2hlbiB0aGUgaW5zdHJ1Y3Rpb25zIGFyZSBzaG93blxuICB2YXIgcGxheU9uY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5zdHJ1Y3Rpb25zSGlkZGVuJywgcGxheU9uY2UpO1xuICAgIGlmIChzdHVkaW9BcHAuY2RvU291bmRzKSB7XG4gICAgICBzdHVkaW9BcHAuY2RvU291bmRzLndoZW5BdWRpb1VubG9ja2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGhhc1NvbmdJbkxldmVsID0gQ3JhZnQubGV2ZWwuc29uZ3MgJiYgQ3JhZnQubGV2ZWwuc29uZ3MubGVuZ3RoID4gMTtcbiAgICAgICAgdmFyIHNvbmdUb1BsYXlGaXJzdCA9IGhhc1NvbmdJbkxldmVsID8gQ3JhZnQubGV2ZWwuc29uZ3NbMF0gOiBudWxsO1xuICAgICAgICBDcmFmdC5tdXNpY0NvbnRyb2xsZXIucGxheShzb25nVG9QbGF5Rmlyc3QpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdpbnN0cnVjdGlvbnNIaWRkZW4nLCBwbGF5T25jZSk7XG5cbiAgdmFyIGNoYXJhY3RlciA9IGNoYXJhY3RlcnNbQ3JhZnQuZ2V0Q3VycmVudENoYXJhY3RlcigpXTtcbiAgY29uZmlnLnNraW4uc3RhdGljQXZhdGFyID0gY2hhcmFjdGVyLnN0YXRpY0F2YXRhcjtcbiAgY29uZmlnLnNraW4uc21hbGxTdGF0aWNBdmF0YXIgPSBjaGFyYWN0ZXIuc21hbGxTdGF0aWNBdmF0YXI7XG4gIGNvbmZpZy5za2luLmZhaWx1cmVBdmF0YXIgPSBjaGFyYWN0ZXIuZmFpbHVyZUF2YXRhcjtcbiAgY29uZmlnLnNraW4ud2luQXZhdGFyID0gY2hhcmFjdGVyLndpbkF2YXRhcjtcblxuICB2YXIgbGV2ZWxDb25maWcgPSBjb25maWcubGV2ZWw7XG4gIHZhciBzcGVjaWFsTGV2ZWxUeXBlID0gbGV2ZWxDb25maWcuc3BlY2lhbExldmVsVHlwZTtcbiAgc3dpdGNoIChzcGVjaWFsTGV2ZWxUeXBlKSB7XG4gICAgY2FzZSAnaG91c2VXYWxsQnVpbGQnOlxuICAgICAgbGV2ZWxDb25maWcuYmxvY2tzVG9TdG9yZSA9IFtcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJob3VzZUJvdHRvbUFcIiwgXCJob3VzZUJvdHRvbUJcIiwgXCJob3VzZUJvdHRvbUNcIiwgXCJob3VzZUJvdHRvbURcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIlxuICAgICAgXTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgc3R1ZGlvQXBwLmluaXQoJC5leHRlbmQoe30sIGNvbmZpZywge1xuICAgIGZvcmNlSW5zZXJ0VG9wQmxvY2s6ICd3aGVuX3J1bicsXG4gICAgaHRtbDogcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKSh7XG4gICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgZGF0YToge1xuICAgICAgICBsb2NhbGVEaXJlY3Rpb246IHN0dWRpb0FwcC5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgICAgICBzaGFyZWFibGU6IGNvbmZpZy5sZXZlbC5zaGFyZWFibGVcbiAgICAgICAgfSksXG4gICAgICAgIGVkaXRDb2RlOiBjb25maWcubGV2ZWwuZWRpdENvZGUsXG4gICAgICAgIGJsb2NrQ291bnRlckNsYXNzOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgfVxuICAgIH0pLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIGdlbmVyYXRlZENvZGVEZXNjcmlwdGlvbjogY3JhZnRNc2cuZ2VuZXJhdGVkQ29kZURlc2NyaXB0aW9uKCksXG4gICAgfSxcbiAgICBsb2FkQXVkaW86IGZ1bmN0aW9uICgpIHtcbiAgICB9LFxuICAgIGFmdGVySW5qZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2xvd01vdGlvblVSTFBhcmFtID0gcGFyc2VGbG9hdCgobG9jYXRpb24uc2VhcmNoLnNwbGl0KCdjdXN0b21TbG93TW90aW9uPScpWzFdIHx8ICcnKS5zcGxpdCgnJicpWzBdKTtcbiAgICAgIENyYWZ0LmdhbWVDb250cm9sbGVyID0gbmV3IEdhbWVDb250cm9sbGVyKHtcbiAgICAgICAgUGhhc2VyOiB3aW5kb3cuUGhhc2VyLFxuICAgICAgICBjb250YWluZXJJZDogJ3BoYXNlci1nYW1lJyxcbiAgICAgICAgYXNzZXRSb290OiBDcmFmdC5za2luLmFzc2V0VXJsKCcnKSxcbiAgICAgICAgYXVkaW9QbGF5ZXI6IHtcbiAgICAgICAgICByZWdpc3Rlcjogc3R1ZGlvQXBwLnJlZ2lzdGVyQXVkaW8uYmluZChzdHVkaW9BcHApLFxuICAgICAgICAgIHBsYXk6IHN0dWRpb0FwcC5wbGF5QXVkaW8uYmluZChzdHVkaW9BcHApXG4gICAgICAgIH0sXG4gICAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgICAgY3VzdG9tU2xvd01vdGlvbjogc2xvd01vdGlvblVSTFBhcmFtLCAvLyBOYU4gaWYgbm90IHNldFxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyc3QgYXNzZXQgcGFja3MgdG8gbG9hZCB3aGlsZSB2aWRlbyBwbGF5aW5nLCBldGMuXG4gICAgICAgICAqIFdvbid0IG1hdHRlciBmb3IgbGV2ZWxzIHdpdGhvdXQgZGVsYXllZCBsZXZlbCBpbml0aWFsaXphdGlvblxuICAgICAgICAgKiAoZHVlIHRvIGUuZy4gY2hhcmFjdGVyIC8gaG91c2Ugc2VsZWN0IHBvcHVwcykuXG4gICAgICAgICAqL1xuICAgICAgICBlYXJseUxvYWRBc3NldFBhY2tzOiBDcmFmdC5lYXJseUxvYWRBc3NldHNGb3JMZXZlbChsZXZlbENvbmZpZy5wdXp6bGVfbnVtYmVyKSxcbiAgICAgICAgYWZ0ZXJBc3NldHNMb2FkZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBwcmVsb2FkIG11c2ljIGFmdGVyIGVzc2VudGlhbCBnYW1lIGFzc2V0IGRvd25sb2FkcyBjb21wbGV0ZWx5IGZpbmlzaGVkXG4gICAgICAgICAgQ3JhZnQubXVzaWNDb250cm9sbGVyLnByZWxvYWQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZWFybHlMb2FkTmljZVRvSGF2ZUFzc2V0UGFja3M6IENyYWZ0Lm5pY2VUb0hhdmVBc3NldHNGb3JMZXZlbChsZXZlbENvbmZpZy5wdXp6bGVfbnVtYmVyKSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWNvbmZpZy5sZXZlbC5zaG93UG9wdXBPbkxvYWQpIHtcbiAgICAgICAgQ3JhZnQuaW5pdGlhbGl6ZUFwcExldmVsKGNvbmZpZy5sZXZlbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0d2l0dGVyOiB7XG4gICAgICB0ZXh0OiBcIlNoYXJlIG9uIFR3aXR0ZXJcIixcbiAgICAgIGhhc2h0YWc6IFwiQ3JhZnRcIlxuICAgIH1cbiAgfSkpO1xuXG4gIHZhciBpbnRlcmZhY2VJbWFnZXNUb0xvYWQgPSBbXTtcbiAgaW50ZXJmYWNlSW1hZ2VzVG9Mb2FkID0gaW50ZXJmYWNlSW1hZ2VzVG9Mb2FkLmNvbmNhdChpbnRlcmZhY2VJbWFnZXMuREVGQVVMVCk7XG5cbiAgaWYgKGNvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyICYmIGludGVyZmFjZUltYWdlc1tjb25maWcubGV2ZWwucHV6emxlX251bWJlcl0pIHtcbiAgICBpbnRlcmZhY2VJbWFnZXNUb0xvYWQgPVxuICAgICAgICBpbnRlcmZhY2VJbWFnZXNUb0xvYWQuY29uY2F0KGludGVyZmFjZUltYWdlc1tjb25maWcubGV2ZWwucHV6emxlX251bWJlcl0pO1xuICB9XG5cbiAgaW50ZXJmYWNlSW1hZ2VzVG9Mb2FkLmZvckVhY2goZnVuY3Rpb24odXJsKSB7XG4gICAgcHJlbG9hZEltYWdlKHVybCk7XG4gIH0pO1xuXG4gIHZhciBzaGFyZUJ1dHRvbiA9ICQoJy5tYy1zaGFyZS1idXR0b24nKTtcbiAgaWYgKHNoYXJlQnV0dG9uLmxlbmd0aCkge1xuICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoc2hhcmVCdXR0b25bMF0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIENyYWZ0LnJlcG9ydFJlc3VsdCh0cnVlKTtcbiAgICB9KTtcbiAgfVxufTtcblxudmFyIHByZWxvYWRJbWFnZSA9IGZ1bmN0aW9uKHVybCkge1xuICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gIGltZy5zcmMgPSB1cmw7XG59O1xuXG5DcmFmdC5jaGFyYWN0ZXJBc3NldFBhY2tOYW1lID0gZnVuY3Rpb24gKHBsYXllck5hbWUpIHtcbiAgcmV0dXJuICdwbGF5ZXInICsgcGxheWVyTmFtZTtcbn07XG5cbkNyYWZ0LmdldEN1cnJlbnRDaGFyYWN0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWZ0U2VsZWN0ZWRQbGF5ZXInKSB8fCBERUZBVUxUX0NIQVJBQ1RFUjtcbn07XG5cbkNyYWZ0LnVwZGF0ZVVJRm9yQ2hhcmFjdGVyID0gZnVuY3Rpb24gKGNoYXJhY3Rlcikge1xuICBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4uc3RhdGljQXZhdGFyID0gY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLnN0YXRpY0F2YXRhcjtcbiAgQ3JhZnQuaW5pdGlhbENvbmZpZy5za2luLnNtYWxsU3RhdGljQXZhdGFyID0gY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLnNtYWxsU3RhdGljQXZhdGFyO1xuICBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4uZmFpbHVyZUF2YXRhciA9IGNoYXJhY3RlcnNbY2hhcmFjdGVyXS5mYWlsdXJlQXZhdGFyO1xuICBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4ud2luQXZhdGFyID0gY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLndpbkF2YXRhcjtcbiAgc3R1ZGlvQXBwLnNldEljb25zRnJvbVNraW4oQ3JhZnQuaW5pdGlhbENvbmZpZy5za2luKTtcbiAgJCgnI3Byb21wdC1pY29uJykuYXR0cignc3JjJywgY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLnNtYWxsU3RhdGljQXZhdGFyKTtcbn07XG5cbkNyYWZ0LnNob3dQbGF5ZXJTZWxlY3Rpb25Qb3B1cCA9IGZ1bmN0aW9uIChvblNlbGVjdGVkQ2FsbGJhY2spIHtcbiAgdmFyIHNlbGVjdGVkUGxheWVyID0gREVGQVVMVF9DSEFSQUNURVI7XG4gIHZhciBwb3B1cERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBwb3B1cERpdi5pbm5lckhUTUwgPSByZXF1aXJlKCcuL2RpYWxvZ3MvcGxheWVyU2VsZWN0aW9uLmh0bWwuZWpzJykoe1xuICAgIGltYWdlOiBzdHVkaW9BcHAuYXNzZXRVcmwoKVxuICB9KTtcbiAgdmFyIHBvcHVwRGlhbG9nID0gc3R1ZGlvQXBwLmNyZWF0ZU1vZGFsRGlhbG9nKHtcbiAgICBjb250ZW50RGl2OiBwb3B1cERpdixcbiAgICBkZWZhdWx0QnRuU2VsZWN0b3I6ICcjY2hvb3NlLXN0ZXZlJyxcbiAgICBvbkhpZGRlbjogZnVuY3Rpb24gKCkge1xuICAgICAgb25TZWxlY3RlZENhbGxiYWNrKHNlbGVjdGVkUGxheWVyKTtcbiAgICB9LFxuICAgIGlkOiAnY3JhZnQtcG9wdXAtcGxheWVyLXNlbGVjdGlvbicsXG4gIH0pO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjbG9zZS1jaGFyYWN0ZXItc2VsZWN0JylbMF0sIGZ1bmN0aW9uICgpIHtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nob29zZS1zdGV2ZScpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRQbGF5ZXIgPSBDSEFSQUNURVJfU1RFVkU7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2UtYWxleCcpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRQbGF5ZXIgPSBDSEFSQUNURVJfQUxFWDtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG4gIHBvcHVwRGlhbG9nLnNob3coKTtcbn07XG5cbkNyYWZ0LnNob3dIb3VzZVNlbGVjdGlvblBvcHVwID0gZnVuY3Rpb24gKG9uU2VsZWN0ZWRDYWxsYmFjaykge1xuICB2YXIgcG9wdXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgcG9wdXBEaXYuaW5uZXJIVE1MID0gcmVxdWlyZSgnLi9kaWFsb2dzL2hvdXNlU2VsZWN0aW9uLmh0bWwuZWpzJykoe1xuICAgIGltYWdlOiBzdHVkaW9BcHAuYXNzZXRVcmwoKVxuICB9KTtcbiAgdmFyIHNlbGVjdGVkSG91c2UgPSAnaG91c2VBJztcblxuICB2YXIgcG9wdXBEaWFsb2cgPSBzdHVkaW9BcHAuY3JlYXRlTW9kYWxEaWFsb2coe1xuICAgIGNvbnRlbnREaXY6IHBvcHVwRGl2LFxuICAgIGRlZmF1bHRCdG5TZWxlY3RvcjogJyNjaG9vc2UtaG91c2UtYScsXG4gICAgb25IaWRkZW46IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uU2VsZWN0ZWRDYWxsYmFjayhzZWxlY3RlZEhvdXNlKTtcbiAgICB9LFxuICAgIGlkOiAnY3JhZnQtcG9wdXAtaG91c2Utc2VsZWN0aW9uJyxcbiAgICBpY29uOiBjaGFyYWN0ZXJzW0NyYWZ0LmdldEN1cnJlbnRDaGFyYWN0ZXIoKV0uc3RhdGljQXZhdGFyXG4gIH0pO1xuXG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nsb3NlLWhvdXNlLXNlbGVjdCcpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2UtaG91c2UtYScpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRIb3VzZSA9IFwiaG91c2VBXCI7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2UtaG91c2UtYicpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRIb3VzZSA9IFwiaG91c2VCXCI7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2UtaG91c2UtYycpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRIb3VzZSA9IFwiaG91c2VDXCI7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHBvcHVwRGlhbG9nLnNob3coKTtcbn07XG5cbkNyYWZ0LmNsZWFyUGxheWVyU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhZnRIb3VzZUJsb2NrcycpO1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWZ0UGxheWVySW52ZW50b3J5Jyk7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhZnRTZWxlY3RlZFBsYXllcicpO1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWZ0U2VsZWN0ZWRIb3VzZScpO1xufTtcblxuQ3JhZnQub25Ib3VzZVNlbGVjdGVkID0gZnVuY3Rpb24gKGhvdXNlVHlwZSkge1xuICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdFNlbGVjdGVkSG91c2UnLCBob3VzZVR5cGUpO1xufTtcblxuQ3JhZnQuaW5pdGlhbGl6ZUFwcExldmVsID0gZnVuY3Rpb24gKGxldmVsQ29uZmlnKSB7XG4gIHZhciBob3VzZUJsb2NrcyA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFmdEhvdXNlQmxvY2tzJykpO1xuICBDcmFmdC5mb2xkSW5DdXN0b21Ib3VzZUJsb2Nrcyhob3VzZUJsb2NrcywgbGV2ZWxDb25maWcpO1xuXG4gIHZhciBmbHVmZlBsYW5lID0gW107XG4gIC8vIFRPRE8oYmpvcmRhbik6IHJlbW92ZSBjb25maWd1cmF0aW9uIHJlcXVpcmVtZW50IGluIHZpc3VhbGl6YXRpb25cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAobGV2ZWxDb25maWcuZ3JpZFdpZHRoIHx8IDEwKSAqIChsZXZlbENvbmZpZy5ncmlkSGVpZ2h0IHx8IDEwKTsgaSsrKSB7XG4gICAgZmx1ZmZQbGFuZS5wdXNoKCcnKTtcbiAgfVxuXG4gIHZhciBsZXZlbEFzc2V0UGFja3MgPSB7XG4gICAgYmVmb3JlTG9hZDogQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxXaXRoQ2hhcmFjdGVyKGxldmVsQ29uZmlnLnB1enpsZV9udW1iZXIpLFxuICAgIGFmdGVyTG9hZDogQ3JhZnQuYWZ0ZXJMb2FkQXNzZXRzRm9yTGV2ZWwobGV2ZWxDb25maWcucHV6emxlX251bWJlcilcbiAgfTtcblxuICBDcmFmdC5nYW1lQ29udHJvbGxlci5sb2FkTGV2ZWwoe1xuICAgIGlzRGF5dGltZTogbGV2ZWxDb25maWcuaXNEYXl0aW1lLFxuICAgIGdyb3VuZFBsYW5lOiBsZXZlbENvbmZpZy5ncm91bmRQbGFuZSxcbiAgICBncm91bmREZWNvcmF0aW9uUGxhbmU6IGxldmVsQ29uZmlnLmdyb3VuZERlY29yYXRpb25QbGFuZSxcbiAgICBhY3Rpb25QbGFuZTogbGV2ZWxDb25maWcuYWN0aW9uUGxhbmUsXG4gICAgZmx1ZmZQbGFuZTogZmx1ZmZQbGFuZSxcbiAgICBwbGF5ZXJTdGFydFBvc2l0aW9uOiBsZXZlbENvbmZpZy5wbGF5ZXJTdGFydFBvc2l0aW9uLFxuICAgIHBsYXllclN0YXJ0RGlyZWN0aW9uOiBsZXZlbENvbmZpZy5wbGF5ZXJTdGFydERpcmVjdGlvbixcbiAgICBwbGF5ZXJOYW1lOiBDcmFmdC5nZXRDdXJyZW50Q2hhcmFjdGVyKCksXG4gICAgYXNzZXRQYWNrczogbGV2ZWxBc3NldFBhY2tzLFxuICAgIHNwZWNpYWxMZXZlbFR5cGU6IGxldmVsQ29uZmlnLnNwZWNpYWxMZXZlbFR5cGUsXG4gICAgaG91c2VCb3R0b21SaWdodDogbGV2ZWxDb25maWcuaG91c2VCb3R0b21SaWdodCxcbiAgICBncmlkRGltZW5zaW9uczogbGV2ZWxDb25maWcuZ3JpZFdpZHRoICYmIGxldmVsQ29uZmlnLmdyaWRIZWlnaHQgP1xuICAgICAgICBbbGV2ZWxDb25maWcuZ3JpZFdpZHRoLCBsZXZlbENvbmZpZy5ncmlkSGVpZ2h0XSA6XG4gICAgICAgIG51bGwsXG4gICAgdmVyaWZpY2F0aW9uRnVuY3Rpb246IGV2YWwoJ1snICsgbGV2ZWxDb25maWcudmVyaWZpY2F0aW9uRnVuY3Rpb24gKyAnXScpWzBdIC8vIFRPRE8oYmpvcmRhbik6IGFkZCB0byB1dGlsc1xuICB9KTtcbn07XG5cbkNyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsV2l0aENoYXJhY3RlciA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICByZXR1cm4gQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxOdW1iZXIobGV2ZWxOdW1iZXIpXG4gICAgICAuY29uY2F0KFtDcmFmdC5jaGFyYWN0ZXJBc3NldFBhY2tOYW1lKENyYWZ0LmdldEN1cnJlbnRDaGFyYWN0ZXIoKSldKTtcbn07XG5cbkNyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsTnVtYmVyID0gZnVuY3Rpb24gKGxldmVsTnVtYmVyKSB7XG4gIHN3aXRjaCAobGV2ZWxOdW1iZXIpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gWydsZXZlbE9uZUFzc2V0cyddO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBbJ2xldmVsVHdvQXNzZXRzJ107XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFsnbGV2ZWxUaHJlZUFzc2V0cyddO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gWydhbGxBc3NldHNNaW51c1BsYXllciddO1xuICB9XG59O1xuXG5DcmFmdC5hZnRlckxvYWRBc3NldHNGb3JMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICAvLyBBZnRlciBsZXZlbCBsb2FkcyAmIHBsYXllciBzdGFydHMgcGxheWluZywga2ljayBvZmYgZnVydGhlciBhc3NldCBkb3dubG9hZHNcbiAgc3dpdGNoIChsZXZlbE51bWJlcikge1xuICAgIGNhc2UgMTpcbiAgICAgIC8vIGNhbiBkaXNhYmxlIGlmIHBlcmZvcm1hbmNlIGlzc3VlIG9uIGVhcmx5IGxldmVsIDFcbiAgICAgIHJldHVybiBDcmFmdC5taW5Bc3NldHNGb3JMZXZlbE51bWJlcigyKTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxOdW1iZXIoMyk7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIE1heSB3YW50IHRvIHB1c2ggdGhpcyB0byBvY2N1ciBvbiBsZXZlbCB3aXRoIHZpZGVvXG4gICAgICByZXR1cm4gWydhbGxBc3NldHNNaW51c1BsYXllciddO1xuICB9XG59O1xuXG5DcmFmdC5lYXJseUxvYWRBc3NldHNGb3JMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICBzd2l0Y2ggKGxldmVsTnVtYmVyKSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIENyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsTnVtYmVyKGxldmVsTnVtYmVyKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIENyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsV2l0aENoYXJhY3RlcihsZXZlbE51bWJlcik7XG4gIH1cbn07XG5cbkNyYWZ0Lm5pY2VUb0hhdmVBc3NldHNGb3JMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICBzd2l0Y2ggKGxldmVsTnVtYmVyKSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIFsncGxheWVyU3RldmUnLCAncGxheWVyQWxleCddO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gWydhbGxBc3NldHNNaW51c1BsYXllciddO1xuICB9XG59O1xuXG4vKiogRm9sZHMgYXJyYXkgQiBvbiB0b3Agb2YgYXJyYXkgQSAqL1xuQ3JhZnQuZm9sZEluQXJyYXkgPSBmdW5jdGlvbiAoYXJyYXlBLCBhcnJheUIpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheUEubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXJyYXlCW2ldICE9PSAnJykge1xuICAgICAgYXJyYXlBW2ldID0gYXJyYXlCW2ldO1xuICAgIH1cbiAgfVxufTtcblxuQ3JhZnQuZm9sZEluQ3VzdG9tSG91c2VCbG9ja3MgPSBmdW5jdGlvbiAoaG91c2VCbG9ja01hcCwgbGV2ZWxDb25maWcpIHtcbiAgdmFyIHBsYW5lc1RvQ3VzdG9taXplID0gW2xldmVsQ29uZmlnLmdyb3VuZFBsYW5lLCBsZXZlbENvbmZpZy5hY3Rpb25QbGFuZV07XG4gIHBsYW5lc1RvQ3VzdG9taXplLmZvckVhY2goZnVuY3Rpb24ocGxhbmUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYW5lLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IHBsYW5lW2ldO1xuICAgICAgaWYgKGl0ZW0ubWF0Y2goL2hvdXNlLykpIHtcbiAgICAgICAgcGxhbmVbaV0gPSAoaG91c2VCbG9ja01hcCAmJiBob3VzZUJsb2NrTWFwW2l0ZW1dKSA/XG4gICAgICAgICAgICBob3VzZUJsb2NrTWFwW2l0ZW1dIDogXCJwbGFua3NCaXJjaFwiO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlc2V0IHRoZSBhcHAgdG8gdGhlIHN0YXJ0IHBvc2l0aW9uIGFuZCBraWxsIGFueSBwZW5kaW5nIGFuaW1hdGlvbiB0YXNrcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZmlyc3QgdHJ1ZSBpZiBmaXJzdCByZXNldFxuICovXG5DcmFmdC5yZXNldCA9IGZ1bmN0aW9uIChmaXJzdCkge1xuICBpZiAoZmlyc3QpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgQ3JhZnQuZ2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSS5yZXNldEF0dGVtcHQoKTtcbn07XG5cbkNyYWZ0LnBoYXNlckxvYWRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIENyYWZ0LmdhbWVDb250cm9sbGVyICYmXG4gICAgICBDcmFmdC5nYW1lQ29udHJvbGxlci5nYW1lICYmXG4gICAgICAhQ3JhZnQuZ2FtZUNvbnRyb2xsZXIuZ2FtZS5sb2FkLmlzTG9hZGluZztcbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuQ3JhZnQucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghQ3JhZnQucGhhc2VyTG9hZGVkKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXRCdXR0b24nKTtcblxuICAvLyBFbnN1cmUgdGhhdCBSZXNldCBidXR0b24gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBSdW4gYnV0dG9uLlxuICBpZiAoIXJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoKSB7XG4gICAgcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGggPSBydW5CdXR0b24ub2Zmc2V0V2lkdGggKyAncHgnO1xuICB9XG5cbiAgc3R1ZGlvQXBwLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIHN0dWRpb0FwcC5hdHRlbXB0cysrO1xuXG4gIENyYWZ0LmV4ZWN1dGVVc2VyQ29kZSgpO1xuXG4gIGlmIChDcmFmdC5sZXZlbC5mcmVlUGxheSAmJiAhc3R1ZGlvQXBwLmhpZGVTb3VyY2UpIHtcbiAgICB2YXIgZmluaXNoQnRuQ29udGFpbmVyID0gJCgnI3JpZ2h0LWJ1dHRvbi1jZWxsJyk7XG5cbiAgICBpZiAoZmluaXNoQnRuQ29udGFpbmVyLmxlbmd0aCAmJlxuICAgICAgICAhZmluaXNoQnRuQ29udGFpbmVyLmhhc0NsYXNzKCdyaWdodC1idXR0b24tY2VsbC1lbmFibGVkJykpIHtcbiAgICAgIGZpbmlzaEJ0bkNvbnRhaW5lci5hZGRDbGFzcygncmlnaHQtYnV0dG9uLWNlbGwtZW5hYmxlZCcpO1xuICAgICAgc3R1ZGlvQXBwLm9uUmVzaXplKCk7XG5cbiAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgZXZlbnQuaW5pdEV2ZW50KCdmaW5pc2hCdXR0b25TaG93bicsIHRydWUsIHRydWUpO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfVxuICB9XG59O1xuXG5DcmFmdC5leGVjdXRlVXNlckNvZGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLmVkaXRfYmxvY2tzKSB7XG4gICAgdGhpcy5yZXBvcnRSZXN1bHQodHJ1ZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHN0dWRpb0FwcC5oYXNFeHRyYVRvcEJsb2NrcygpKSB7XG4gICAgLy8gaW1tZWRpYXRlbHkgY2hlY2sgYW5zd2VyIGluc3RlYWQgb2YgZXhlY3V0aW5nLCB3aGljaCB3aWxsIGZhaWwgYW5kXG4gICAgLy8gcmVwb3J0IHRvcCBsZXZlbCBibG9ja3MgKHJhdGhlciB0aGFuIGV4ZWN1dGluZyB0aGVtKVxuICAgIHRoaXMucmVwb3J0UmVzdWx0KGZhbHNlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBzdHVkaW9BcHAucGxheUF1ZGlvKCdzdGFydCcpO1xuXG4gIC8vIFN0YXJ0IHRyYWNpbmcgY2FsbHMuXG4gIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcblxuICB2YXIgYXBwQ29kZU9yZ0FQSSA9IENyYWZ0LmdhbWVDb250cm9sbGVyLmNvZGVPcmdBUEk7XG4gIGFwcENvZGVPcmdBUEkuc3RhcnRDb21tYW5kQ29sbGVjdGlvbigpO1xuICAvLyBSdW4gdXNlciBnZW5lcmF0ZWQgY29kZSwgY2FsbGluZyBhcHBDb2RlT3JnQVBJXG4gIHZhciBjb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICBjb2RlZ2VuLmV2YWxXaXRoKGNvZGUsIHtcbiAgICBtb3ZlRm9yd2FyZDogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkubW92ZUZvcndhcmQoc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCkpO1xuICAgIH0sXG4gICAgdHVybkxlZnQ6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLnR1cm4oc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksIFwibGVmdFwiKTtcbiAgICB9LFxuICAgIHR1cm5SaWdodDogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkudHVybihzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSwgXCJyaWdodFwiKTtcbiAgICB9LFxuICAgIGRlc3Ryb3lCbG9jazogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkuZGVzdHJveUJsb2NrKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpKTtcbiAgICB9LFxuICAgIHNoZWFyOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5kZXN0cm95QmxvY2soc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCkpO1xuICAgIH0sXG4gICAgdGlsbFNvaWw6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLnRpbGxTb2lsKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpKTtcbiAgICB9LFxuICAgIHdoaWxlUGF0aEFoZWFkOiBmdW5jdGlvbiAoYmxvY2tJRCwgY2FsbGJhY2spIHtcbiAgICAgIC8vIGlmIHJlc3VycmVjdGVkLCBtb3ZlIGJsb2NrSUQgYmUgbGFzdCBwYXJhbWV0ZXIgdG8gZml4IFwiU2hvdyBDb2RlXCJcbiAgICAgIGFwcENvZGVPcmdBUEkud2hpbGVQYXRoQWhlYWQoc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgICAgJycsXG4gICAgICAgICAgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgd2hpbGVCbG9ja0FoZWFkOiBmdW5jdGlvbiAoYmxvY2tJRCwgYmxvY2tUeXBlLCBjYWxsYmFjaykge1xuICAgICAgLy8gaWYgcmVzdXJyZWN0ZWQsIG1vdmUgYmxvY2tJRCBiZSBsYXN0IHBhcmFtZXRlciB0byBmaXggXCJTaG93IENvZGVcIlxuICAgICAgYXBwQ29kZU9yZ0FQSS53aGlsZVBhdGhBaGVhZChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgICBibG9ja1R5cGUsXG4gICAgICAgICAgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgaWZMYXZhQWhlYWQ6IGZ1bmN0aW9uIChjYWxsYmFjaywgYmxvY2tJRCkge1xuICAgICAgLy8gaWYgcmVzdXJyZWN0ZWQsIG1vdmUgYmxvY2tJRCBiZSBsYXN0IHBhcmFtZXRlciB0byBmaXggXCJTaG93IENvZGVcIlxuICAgICAgYXBwQ29kZU9yZ0FQSS5pZkJsb2NrQWhlYWQoc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgICAgXCJsYXZhXCIsXG4gICAgICAgICAgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgaWZCbG9ja0FoZWFkOiBmdW5jdGlvbiAoYmxvY2tUeXBlLCBjYWxsYmFjaywgYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5pZkJsb2NrQWhlYWQoc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgICAgYmxvY2tUeXBlLFxuICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICB9LFxuICAgIHBsYWNlQmxvY2s6IGZ1bmN0aW9uIChibG9ja1R5cGUsIGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkucGxhY2VCbG9jayhzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgYmxvY2tUeXBlKTtcbiAgICB9LFxuICAgIHBsYW50Q3JvcDogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkucGxhY2VCbG9jayhzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgXCJjcm9wV2hlYXRcIik7XG4gICAgfSxcbiAgICBwbGFjZVRvcmNoOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5wbGFjZUJsb2NrKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICBcInRvcmNoXCIpO1xuICAgIH0sXG4gICAgcGxhY2VCbG9ja0FoZWFkOiBmdW5jdGlvbiAoYmxvY2tUeXBlLCBibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLnBsYWNlSW5Gcm9udChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgYmxvY2tUeXBlKTtcbiAgICB9XG4gIH0pO1xuICBhcHBDb2RlT3JnQVBJLnN0YXJ0QXR0ZW1wdChmdW5jdGlvbiAoc3VjY2VzcywgbGV2ZWxNb2RlbCkge1xuICAgIGlmIChDcmFmdC5sZXZlbC5mcmVlUGxheSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlcG9ydFJlc3VsdChzdWNjZXNzKTtcblxuICAgIHZhciB0aWxlSURzVG9TdG9yZSA9IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuYmxvY2tzVG9TdG9yZTtcbiAgICBpZiAoc3VjY2VzcyAmJiB0aWxlSURzVG9TdG9yZSkge1xuICAgICAgdmFyIG5ld0hvdXNlQmxvY2tzID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWZ0SG91c2VCbG9ja3MnKSkgfHwge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsTW9kZWwuYWN0aW9uUGxhbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRpbGVJRHNUb1N0b3JlW2ldICE9PSAnJykge1xuICAgICAgICAgIG5ld0hvdXNlQmxvY2tzW3RpbGVJRHNUb1N0b3JlW2ldXSA9IGxldmVsTW9kZWwuYWN0aW9uUGxhbmVbaV0uYmxvY2tUeXBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdEhvdXNlQmxvY2tzJywgSlNPTi5zdHJpbmdpZnkobmV3SG91c2VCbG9ja3MpKTtcbiAgICB9XG5cbiAgICB2YXIgYXR0ZW1wdEludmVudG9yeVR5cGVzID0gbGV2ZWxNb2RlbC5nZXRJbnZlbnRvcnlUeXBlcygpO1xuICAgIHZhciBwbGF5ZXJJbnZlbnRvcnlUeXBlcyA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFmdFBsYXllckludmVudG9yeScpKSB8fCBbXTtcblxuICAgIHZhciBuZXdJbnZlbnRvcnlTZXQgPSB7fTtcbiAgICBhdHRlbXB0SW52ZW50b3J5VHlwZXMuY29uY2F0KHBsYXllckludmVudG9yeVR5cGVzKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIG5ld0ludmVudG9yeVNldFt0eXBlXSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdFBsYXllckludmVudG9yeScsIEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKG5ld0ludmVudG9yeVNldCkpKTtcbiAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbkNyYWZ0LmdldFRlc3RSZXN1bHRGcm9tID0gZnVuY3Rpb24gKHN1Y2Nlc3MsIHN0dWRpb1Rlc3RSZXN1bHRzKSB7XG4gIGlmIChzdHVkaW9UZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMKSB7XG4gICAgcmV0dXJuIFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICB9XG5cbiAgaWYgKENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuZnJlZVBsYXkpIHtcbiAgICByZXR1cm4gVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9XG5cbiAgcmV0dXJuIHN0dWRpb1Rlc3RSZXN1bHRzO1xufTtcblxuQ3JhZnQucmVwb3J0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgdmFyIHN0dWRpb1Rlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKHN1Y2Nlc3MpO1xuICB2YXIgdGVzdFJlc3VsdFR5cGUgPSBDcmFmdC5nZXRUZXN0UmVzdWx0RnJvbShzdWNjZXNzLCBzdHVkaW9UZXN0UmVzdWx0cyk7XG5cbiAgdmFyIGtlZXBQbGF5aW5nVGV4dCA9IENyYWZ0LnJlcGxheVRleHRGb3JSZXN1bHQodGVzdFJlc3VsdFR5cGUpO1xuXG4gIHN0dWRpb0FwcC5yZXBvcnQoe1xuICAgIGFwcDogJ2NyYWZ0JyxcbiAgICBsZXZlbDogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5pZCxcbiAgICByZXN1bHQ6IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuZnJlZVBsYXkgPyB0cnVlIDogc3VjY2VzcyxcbiAgICB0ZXN0UmVzdWx0OiB0ZXN0UmVzdWx0VHlwZSxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgIEJsb2NrbHkuWG1sLmRvbVRvVGV4dChcbiAgICAgICAgICAgIEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShcbiAgICAgICAgICAgICAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKSkpLFxuICAgIC8vIHR5cGljYWxseSBkZWxheSBmZWVkYmFjayB1bnRpbCByZXNwb25zZSBiYWNrXG4gICAgLy8gZm9yIHRoaW5ncyBsaWtlIGUuZy4gY3Jvd2Rzb3VyY2VkIGhpbnRzICYgaGludCBibG9ja3NcbiAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2soe1xuICAgICAgICBrZWVwUGxheWluZ1RleHQ6IGtlZXBQbGF5aW5nVGV4dCxcbiAgICAgICAgYXBwOiAnY3JhZnQnLFxuICAgICAgICBza2luOiBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4uaWQsXG4gICAgICAgIGZlZWRiYWNrVHlwZTogdGVzdFJlc3VsdFR5cGUsXG4gICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgbGV2ZWw6IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwsXG4gICAgICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgICAgICByZWluZkZlZWRiYWNrTXNnOiBjcmFmdE1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICAgICAgbmV4dExldmVsTXNnOiBjcmFmdE1zZy5uZXh0TGV2ZWxNc2coe1xuICAgICAgICAgICAgcHV6emxlTnVtYmVyOiBDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLnB1enpsZV9udW1iZXJcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0b29NYW55QmxvY2tzRmFpbE1zZ0Z1bmN0aW9uOiBjcmFmdE1zZy50b29NYW55QmxvY2tzRmFpbCxcbiAgICAgICAgICBnZW5lcmF0ZWRDb2RlRGVzY3JpcHRpb246IGNyYWZ0TXNnLmdlbmVyYXRlZENvZGVEZXNjcmlwdGlvbigpXG4gICAgICAgIH0sXG4gICAgICAgIGZlZWRiYWNrSW1hZ2U6IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuZnJlZVBsYXkgPyBDcmFmdC5nYW1lQ29udHJvbGxlci5nZXRTY3JlZW5zaG90KCkgOiBudWxsLFxuICAgICAgICBzaG93aW5nU2hhcmluZzogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5mcmVlUGxheVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn07XG5cbkNyYWZ0LnJlcGxheVRleHRGb3JSZXN1bHQgPSBmdW5jdGlvbiAodGVzdFJlc3VsdFR5cGUpIHtcbiAgaWYgKHRlc3RSZXN1bHRUeXBlID09PSBUZXN0UmVzdWx0cy5GUkVFX1BMQVkpIHtcbiAgICByZXR1cm4gY3JhZnRNc2cua2VlcFBsYXlpbmdCdXR0b24oKTtcbiAgfSBlbHNlIGlmICh0ZXN0UmVzdWx0VHlwZSA8PSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfQUNDRVBUQUJMRV9GQUlMKSB7XG4gICAgcmV0dXJuIGNvbW1vbk1zZy50cnlBZ2FpbigpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjcmFmdE1zZy5yZXBsYXlCdXR0b24oKTtcbiAgfVxufTtcblxuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8ZGl2IGlkPVwibWluZWNyYWZ0LWZyYW1lXCI+XFxuICA8ZGl2IGlkPVwicGhhc2VyLWdhbWVcIj5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG4vKiBnbG9iYWwgJCAqL1xuXG4vKipcbiAqIEBmaWxlIE1hcHBpbmcgdG8gaW5qZWN0IG1vcmUgcHJvcGVydGllcyBpbnRvIGxldmVsYnVpbGRlciBsZXZlbHMuXG4gKiBLZXllZCBieSBcInB1enpsZV9udW1iZXJcIiwgd2hpY2ggaXMgdGhlIG9yZGVyIG9mIGEgZ2l2ZW4gbGV2ZWwgaW4gaXRzIHNjcmlwdC5cbiAqL1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGkxOG4gPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgMToge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBpMThuLmxldmVsMUZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsMVRvb0Zld0Jsb2Nrc01lc3NhZ2UoKSxcbiAgICBzb25nczogWyd2aWduZXR0ZTQtaW50cm8nXSxcbiAgfSxcbiAgMjoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBpMThuLmxldmVsMkZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsMlRvb0Zld0Jsb2Nrc01lc3NhZ2UoKSxcbiAgICBzb25nczogWyd2aWduZXR0ZTUtc2hvcnRwaWFubyddLFxuICB9LFxuICAzOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWwzRmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWwzVG9vRmV3QmxvY2tzTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTUtc2hvcnRwaWFubycsXG4gICAgICAndmlnbmV0dGU0LWludHJvJ1xuICAgIF0sXG4gIH0sXG4gIDQ6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDRGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogaTE4bi5sZXZlbDRGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlNS1zaG9ydHBpYW5vJyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nXG4gICAgXSxcbiAgICBzb25nRGVsYXk6IDQwMDAsXG4gIH0sXG4gIDU6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDVGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogaTE4bi5sZXZlbDVGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGU3LWZ1bmt5LWNoaXJwcy1zaG9ydCcsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgXSxcbiAgfSxcbiAgNjoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBpMThuLmxldmVsNkZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsNkZhaWx1cmVNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTEnLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgIF0sXG4gICAgc29uZ0RlbGF5OiA0MDAwLFxuICB9LFxuICA3OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWw3RmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWw3RmFpbHVyZU1lc3NhZ2UoKSxcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU3LWZ1bmt5LWNoaXJwcy1zaG9ydCcsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTEnLFxuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgXSxcbiAgfSxcbiAgODoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBpMThuLmxldmVsOEZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsOEZhaWx1cmVNZXNzYWdlKCksXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTUtc2hvcnRwaWFubycsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTEnLFxuICAgICAgJ3ZpZ25ldHRlNC1pbnRybycsXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICBdLFxuICB9LFxuICA5OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWw5RmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6IGkxOG4ubGV2ZWw5RmFpbHVyZU1lc3NhZ2UoKSxcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgICAndmlnbmV0dGU1LXNob3J0cGlhbm8nLFxuICAgICAgJ3ZpZ25ldHRlNy1mdW5reS1jaGlycHMtc2hvcnQnLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTEnLFxuICAgIF0sXG5cbiAgfSxcbiAgMTA6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogaTE4bi5sZXZlbDEwRmFpbHVyZU1lc3NhZ2UoKSxcbiAgICB0b29GZXdCbG9ja3NNc2c6ICBpMThuLmxldmVsMTBGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgICAgJ3ZpZ25ldHRlNS1zaG9ydHBpYW5vJyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlNy1mdW5reS1jaGlycHMtc2hvcnQnLFxuICAgIF0sXG4gIH0sXG4gIDExOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWwxMUZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsMTFGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGU3LWZ1bmt5LWNoaXJwcy1zaG9ydCcsXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgIF0sXG4gIH0sXG4gIDEyOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWwxMkZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsMTJGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGU1LXNob3J0cGlhbm8nLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTEnLFxuICAgIF0sXG4gIH0sXG4gIDEzOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IGkxOG4ubGV2ZWwxM0ZhaWx1cmVNZXNzYWdlKCksXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBpMThuLmxldmVsMTNGYWlsdXJlTWVzc2FnZSgpLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGUxJyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICBdLFxuICB9LFxuICAxNDoge1xuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGU4LWZyZWUtcGxheScsXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlNC1pbnRybycsXG4gICAgICAndmlnbmV0dGUxJyxcbiAgICBdLFxuICB9LFxufTtcbiIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG4vKiBnbG9iYWwgJCAqL1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaG91c2VBOiB7XG4gICAgZ3JvdW5kUGxhbmU6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiXSxcbiAgICB2ZXJpZmljYXRpb25GdW5jdGlvbjogKGZ1bmN0aW9uICh2ZXJpZmljYXRpb25BUEkpIHtcbiAgICAgIHJldHVybiB2ZXJpZmljYXRpb25BUEkuc29sdXRpb25NYXBNYXRjaGVzUmVzdWx0TWFwKFtcbiAgICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJ2FueScsICdhbnknLCAnYW55JywgJ2FueScsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICdhbnknLCAnJywgJycsICdhbnknLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnYW55JywgJycsICcnLCAnYW55JywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJ2FueScsICdhbnknLCAnYW55JywgJ2FueScsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJyddKTtcbiAgICB9KS50b1N0cmluZygpLFxuICAgIGJsb2Nrc1RvU3RvcmU6IFtcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICdob3VzZVJpZ2h0QycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnaG91c2VSaWdodEInLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlTGVmdEEnLCAnJywgJycsICdob3VzZVJpZ2h0QScsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VCb3R0b21BJywgJ2hvdXNlQm90dG9tQicsICdob3VzZUJvdHRvbUMnLCAnaG91c2VCb3R0b21EJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJ10sXG5cbiAgICBob3VzZUJvdHRvbVJpZ2h0OiBbNSwgNV0sXG4gIH0sXG4gIGhvdXNlQzoge1xuICAgIFwiZ3JvdW5kUGxhbmVcIjogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIl0sXG4gICAgXCJncm91bmREZWNvcmF0aW9uUGxhbmVcIjogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwidGFsbEdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwidGFsbEdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCJdLFxuICAgIFwiYWN0aW9uUGxhbmVcIjogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiaG91c2VCb3R0b21BXCIsIFwiaG91c2VCb3R0b21CXCIsIFwiaG91c2VCb3R0b21DXCIsIFwiaG91c2VCb3R0b21EXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCJdLFxuICAgIFwidmVyaWZpY2F0aW9uRnVuY3Rpb25cIjogXCJmdW5jdGlvbiAodmVyaWZpY2F0aW9uQVBJKSB7XFxyXFxuICAgICAgcmV0dXJuIHZlcmlmaWNhdGlvbkFQSS5zb2x1dGlvbk1hcE1hdGNoZXNSZXN1bHRNYXAoXFxyXFxuICAgICAgICAgICAgW1xcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCJcXHJcXG4gICAgICAgICAgICBdKTtcXHJcXG59XCIsXG4gICAgXCJzdGFydEJsb2Nrc1wiOiBcIjx4bWw+PGJsb2NrIHR5cGU9XFxcIndoZW5fcnVuXFxcIiBkZWxldGFibGU9XFxcImZhbHNlXFxcIiBtb3ZhYmxlPVxcXCJmYWxzZVxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNvbnRyb2xzX3JlcGVhdF9kcm9wZG93blxcXCI+PHRpdGxlIG5hbWU9XFxcIlRJTUVTXFxcIiBjb25maWc9XFxcIjItMTBcXFwiPjI8L3RpdGxlPjxzdGF0ZW1lbnQgbmFtZT1cXFwiRE9cXFwiPjxibG9jayB0eXBlPVxcXCJjcmFmdF9tb3ZlRm9yd2FyZFxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X3BsYWNlQmxvY2tcXFwiPjx0aXRsZSBuYW1lPVxcXCJUWVBFXFxcIj5wbGFua3NCaXJjaDwvdGl0bGU+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L3N0YXRlbWVudD48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfdHVyblxcXCI+PHRpdGxlIG5hbWU9XFxcIkRJUlxcXCI+bGVmdDwvdGl0bGU+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X21vdmVGb3J3YXJkXFxcIj48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfcGxhY2VCbG9ja1xcXCI+PHRpdGxlIG5hbWU9XFxcIlRZUEVcXFwiPnBsYW5rc0JpcmNoPC90aXRsZT48bmV4dD48YmxvY2sgdHlwZT1cXFwiY3JhZnRfdHVyblxcXCI+PHRpdGxlIG5hbWU9XFxcIkRJUlxcXCI+cmlnaHQ8L3RpdGxlPjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC94bWw+XCIsXG5cbiAgICBibG9ja3NUb1N0b3JlOiBbXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnaG91c2VSaWdodEMnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJ2hvdXNlUmlnaHRCJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUxlZnRBJywgJycsICcnLCAnaG91c2VSaWdodEEnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlQm90dG9tQScsICdob3VzZUJvdHRvbUInLCAnaG91c2VCb3R0b21DJywgJ2hvdXNlQm90dG9tRCcsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJyddLFxuXG4gICAgaG91c2VCb3R0b21SaWdodDogWzUsIDVdLFxuICB9LFxuICBob3VzZUI6IHtcbiAgICBncm91bmRQbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIl0sXG4gICAgdmVyaWZpY2F0aW9uRnVuY3Rpb246IFwiZnVuY3Rpb24gKHZlcmlmaWNhdGlvbkFQSSkge1xcclxcbiAgICAgIHJldHVybiB2ZXJpZmljYXRpb25BUEkuc29sdXRpb25NYXBNYXRjaGVzUmVzdWx0TWFwKFxcclxcbiAgICAgICAgICAgIFtcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiXFxyXFxuICAgICAgICAgICAgXSk7XFxyXFxufVwiLFxuICAgIHN0YXJ0QmxvY2tzOiBcIjx4bWw+PGJsb2NrIHR5cGU9XFxcIndoZW5fcnVuXFxcIiBkZWxldGFibGU9XFxcImZhbHNlXFxcIiBtb3ZhYmxlPVxcXCJmYWxzZVxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNvbnRyb2xzX3JlcGVhdF9kcm9wZG93blxcXCI+PHRpdGxlIG5hbWU9XFxcIlRJTUVTXFxcIiBjb25maWc9XFxcIjItMTBcXFwiPjY8L3RpdGxlPjxzdGF0ZW1lbnQgbmFtZT1cXFwiRE9cXFwiPjxibG9jayB0eXBlPVxcXCJjcmFmdF9tb3ZlRm9yd2FyZFxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X3BsYWNlQmxvY2tcXFwiPjx0aXRsZSBuYW1lPVxcXCJUWVBFXFxcIj5wbGFua3NCaXJjaDwvdGl0bGU+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L3N0YXRlbWVudD48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwveG1sPlwiLFxuICAgIGJsb2Nrc1RvU3RvcmU6IFtcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJ2hvdXNlUmlnaHRDJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICdob3VzZVJpZ2h0QicsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VMZWZ0QScsICcnLCAnJywgJ2hvdXNlUmlnaHRBJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUJvdHRvbUEnLCAnaG91c2VCb3R0b21CJywgJ2hvdXNlQm90dG9tQycsICdob3VzZUJvdHRvbUQnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJ10sXG4gICAgYWN0aW9uUGxhbmU6IFtcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlQm90dG9tQScsICdob3VzZUJvdHRvbUInLCAnaG91c2VCb3R0b21DJywgJ2hvdXNlQm90dG9tRCcsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnXSxcbiAgICBwbGF5ZXJTdGFydFBvc2l0aW9uOiBbMywgN10sXG5cbiAgICBob3VzZUJvdHRvbVJpZ2h0OiBbNSwgNl0sXG4gIH1cbn07XG4iLCJpbXBvcnQgQ29tbWFuZFF1ZXVlIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9Db21tYW5kUXVldWUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9Db21tYW5kUXVldWUvQmFzZUNvbW1hbmQuanNcIjtcbmltcG9ydCBEZXN0cm95QmxvY2tDb21tYW5kIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9EZXN0cm95QmxvY2tDb21tYW5kLmpzXCI7XG5pbXBvcnQgTW92ZUZvcndhcmRDb21tYW5kIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9Nb3ZlRm9yd2FyZENvbW1hbmQuanNcIjtcbmltcG9ydCBUdXJuQ29tbWFuZCBmcm9tIFwiLi9Db21tYW5kUXVldWUvVHVybkNvbW1hbmQuanNcIjtcbmltcG9ydCBXaGlsZUNvbW1hbmQgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL1doaWxlQ29tbWFuZC5qc1wiO1xuaW1wb3J0IElmQmxvY2tBaGVhZENvbW1hbmQgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL0lmQmxvY2tBaGVhZENvbW1hbmQuanNcIjtcblxuaW1wb3J0IExldmVsTW9kZWwgZnJvbSBcIi4vTGV2ZWxNVkMvTGV2ZWxNb2RlbC5qc1wiO1xuaW1wb3J0IExldmVsVmlldyBmcm9tIFwiLi9MZXZlbE1WQy9MZXZlbFZpZXcuanNcIjtcbmltcG9ydCBBc3NldExvYWRlciBmcm9tIFwiLi9MZXZlbE1WQy9Bc3NldExvYWRlci5qc1wiO1xuXG5pbXBvcnQgKiBhcyBDb2RlT3JnQVBJIGZyb20gXCIuL0FQSS9Db2RlT3JnQVBJLmpzXCI7XG5cbnZhciBHQU1FX1dJRFRIID0gNDAwO1xudmFyIEdBTUVfSEVJR0hUID0gNDAwO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGEgbmV3IGluc3RhbmNlIG9mIGEgbWluaS1nYW1lIHZpc3VhbGl6YXRpb25cbiAqL1xuY2xhc3MgR2FtZUNvbnRyb2xsZXIge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGdhbWVDb250cm9sbGVyQ29uZmlnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBnYW1lQ29udHJvbGxlckNvbmZpZy5jb250YWluZXJJZCBET00gSUQgdG8gbW91bnQgdGhpcyBhcHBcbiAgICogQHBhcmFtIHtQaGFzZXJ9IGdhbWVDb250cm9sbGVyQ29uZmlnLlBoYXNlciBQaGFzZXIgcGFja2FnZVxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyQ29uZmlnKSB7XG4gICAgdGhpcy5ERUJVRyA9IGdhbWVDb250cm9sbGVyQ29uZmlnLmRlYnVnO1xuXG4gICAgLy8gUGhhc2VyIHByZS1pbml0aWFsaXphdGlvbiBjb25maWdcbiAgICB3aW5kb3cuUGhhc2VyR2xvYmFsID0ge1xuICAgICAgZGlzYWJsZUF1ZGlvOiB0cnVlLFxuICAgICAgZGlzYWJsZVdlYkF1ZGlvOiB0cnVlLFxuICAgICAgaGlkZUJhbm5lcjogIXRoaXMuREVCVUdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHB1YmxpYyB7T2JqZWN0fSBjb2RlT3JnQVBJIC0gQVBJIHdpdGggZXh0ZXJuYWxseS1jYWxsYWJsZSBtZXRob2RzIGZvclxuICAgICAqIHN0YXJ0aW5nIGFuIGF0dGVtcHQsIGlzc3VpbmcgY29tbWFuZHMsIGV0Yy5cbiAgICAgKi9cbiAgICB0aGlzLmNvZGVPcmdBUEkgPSBDb2RlT3JnQVBJLmdldCh0aGlzKTtcblxuICAgIHZhciBQaGFzZXIgPSBnYW1lQ29udHJvbGxlckNvbmZpZy5QaGFzZXI7XG5cbiAgICAvKipcbiAgICAgKiBNYWluIFBoYXNlciBnYW1lIGluc3RhbmNlLlxuICAgICAqIEBwcm9wZXJ0eSB7UGhhc2VyLkdhbWV9XG4gICAgICovXG4gICAgdGhpcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKHtcbiAgICAgIHdpZHRoOiBHQU1FX1dJRFRILFxuICAgICAgaGVpZ2h0OiBHQU1FX0hFSUdIVCxcbiAgICAgIHJlbmRlcmVyOiBQaGFzZXIuQ0FOVkFTLFxuICAgICAgcGFyZW50OiBnYW1lQ29udHJvbGxlckNvbmZpZy5jb250YWluZXJJZCxcbiAgICAgIHN0YXRlOiAnZWFybHlMb2FkJyxcbiAgICAgIC8vIFRPRE8oYmpvcmRhbik6IHJlbW92ZSBub3cgdGhhdCB1c2luZyBjYW52YXM/XG4gICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUgLy8gZW5hYmxlcyBzYXZpbmcgLnBuZyBzY3JlZW5ncmFic1xuICAgIH0pO1xuXG4gICAgdGhpcy5zcGVjaWFsTGV2ZWxUeXBlID0gbnVsbDtcbiAgICB0aGlzLnF1ZXVlID0gbmV3IENvbW1hbmRRdWV1ZSh0aGlzKTtcbiAgICB0aGlzLk9uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG5cbiAgICB0aGlzLmFzc2V0Um9vdCA9IGdhbWVDb250cm9sbGVyQ29uZmlnLmFzc2V0Um9vdDtcblxuICAgIHRoaXMuYXVkaW9QbGF5ZXIgPSBnYW1lQ29udHJvbGxlckNvbmZpZy5hdWRpb1BsYXllcjtcbiAgICB0aGlzLmFmdGVyQXNzZXRzTG9hZGVkID0gZ2FtZUNvbnRyb2xsZXJDb25maWcuYWZ0ZXJBc3NldHNMb2FkZWQ7XG4gICAgdGhpcy5hc3NldExvYWRlciA9IG5ldyBBc3NldExvYWRlcih0aGlzKTtcbiAgICB0aGlzLmVhcmx5TG9hZEFzc2V0UGFja3MgPVxuICAgICAgICBnYW1lQ29udHJvbGxlckNvbmZpZy5lYXJseUxvYWRBc3NldFBhY2tzIHx8IFtdO1xuICAgIHRoaXMuZWFybHlMb2FkTmljZVRvSGF2ZUFzc2V0UGFja3MgPVxuICAgICAgICBnYW1lQ29udHJvbGxlckNvbmZpZy5lYXJseUxvYWROaWNlVG9IYXZlQXNzZXRQYWNrcyB8fCBbXTtcblxuICAgIHRoaXMucmVzZXR0YWJsZVRpbWVycyA9IFtdO1xuXG4gICAgLy8gUGhhc2VyIFwic2xvdyBtb3Rpb25cIiBtb2RpZmllciB3ZSBvcmlnaW5hbGx5IHR1bmVkIGFuaW1hdGlvbnMgdXNpbmdcbiAgICB0aGlzLmFzc3VtZWRTbG93TW90aW9uID0gMS41O1xuICAgIHRoaXMuaW5pdGlhbFNsb3dNb3Rpb24gPSBnYW1lQ29udHJvbGxlckNvbmZpZy5jdXN0b21TbG93TW90aW9uIHx8IHRoaXMuYXNzdW1lZFNsb3dNb3Rpb247XG5cbiAgICB0aGlzLnBsYXllckRlbGF5RmFjdG9yID0gMS4wO1xuXG4gICAgdGhpcy5nYW1lLnN0YXRlLmFkZCgnZWFybHlMb2FkJywge1xuICAgICAgcHJlbG9hZDogKCkgPT4ge1xuICAgICAgICAvLyBkb24ndCBsZXQgc3RhdGUgY2hhbmdlIHN0b21wIGVzc2VudGlhbCBhc3NldCBkb3dubG9hZHMgaW4gcHJvZ3Jlc3NcbiAgICAgICAgdGhpcy5nYW1lLmxvYWQucmVzZXRMb2NrZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmFzc2V0TG9hZGVyLmxvYWRQYWNrcyh0aGlzLmVhcmx5TG9hZEFzc2V0UGFja3MpO1xuICAgICAgfSxcbiAgICAgIGNyZWF0ZTogKCkgPT4ge1xuICAgICAgICAvLyBvcHRpb25hbGx5IGxvYWQgc29tZSBtb3JlIGFzc2V0cyBpZiB3ZSBjb21wbGV0ZSBlYXJseSBsb2FkIGJlZm9yZSBsZXZlbCBsb2FkXG4gICAgICAgIHRoaXMuYXNzZXRMb2FkZXIubG9hZFBhY2tzKHRoaXMuZWFybHlMb2FkTmljZVRvSGF2ZUFzc2V0UGFja3MpO1xuICAgICAgICB0aGlzLmdhbWUubG9hZC5zdGFydCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5nYW1lLnN0YXRlLmFkZCgnbGV2ZWxSdW5uZXInLCB7XG4gICAgICBwcmVsb2FkOiB0aGlzLnByZWxvYWQuYmluZCh0aGlzKSxcbiAgICAgIGNyZWF0ZTogdGhpcy5jcmVhdGUuYmluZCh0aGlzKSxcbiAgICAgIHVwZGF0ZTogdGhpcy51cGRhdGUuYmluZCh0aGlzKSxcbiAgICAgIHJlbmRlcjogdGhpcy5yZW5kZXIuYmluZCh0aGlzKVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBsZXZlbENvbmZpZ1xuICAgKi9cbiAgbG9hZExldmVsKGxldmVsQ29uZmlnKSB7XG4gICAgdGhpcy5sZXZlbERhdGEgPSBPYmplY3QuZnJlZXplKGxldmVsQ29uZmlnKTtcblxuICAgIHRoaXMubGV2ZWxNb2RlbCA9IG5ldyBMZXZlbE1vZGVsKHRoaXMubGV2ZWxEYXRhKTtcbiAgICB0aGlzLmxldmVsVmlldyA9IG5ldyBMZXZlbFZpZXcodGhpcyk7XG4gICAgdGhpcy5zcGVjaWFsTGV2ZWxUeXBlID0gbGV2ZWxDb25maWcuc3BlY2lhbExldmVsVHlwZTtcblxuICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbGV2ZWxSdW5uZXInKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMubGV2ZWxNb2RlbC5yZXNldCgpO1xuICAgIHRoaXMubGV2ZWxWaWV3LnJlc2V0KHRoaXMubGV2ZWxNb2RlbCk7XG4gICAgdGhpcy5yZXNldHRhYmxlVGltZXJzLmZvckVhY2goKHRpbWVyKSA9PiB7XG4gICAgICB0aW1lci5zdG9wKHRydWUpO1xuICAgIH0pO1xuICAgIHRoaXMucmVzZXR0YWJsZVRpbWVycy5sZW5ndGggPSAwO1xuICB9XG5cbiAgcHJlbG9hZCgpIHtcbiAgICB0aGlzLmdhbWUubG9hZC5yZXNldExvY2tlZCA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnRpbWUuYWR2YW5jZWRUaW1pbmcgPSB0aGlzLkRFQlVHO1xuICAgIHRoaXMuZ2FtZS5zdGFnZS5kaXNhYmxlVmlzaWJpbGl0eUNoYW5nZSA9IHRydWU7XG4gICAgdGhpcy5hc3NldExvYWRlci5sb2FkUGFja3ModGhpcy5sZXZlbERhdGEuYXNzZXRQYWNrcy5iZWZvcmVMb2FkKTtcbiAgfVxuXG4gIGNyZWF0ZSgpIHtcbiAgICB0aGlzLmxldmVsVmlldy5jcmVhdGUodGhpcy5sZXZlbE1vZGVsKTtcbiAgICB0aGlzLmdhbWUudGltZS5zbG93TW90aW9uID0gdGhpcy5pbml0aWFsU2xvd01vdGlvbjtcbiAgICB0aGlzLmFkZENoZWF0S2V5cygpO1xuICAgIHRoaXMuYXNzZXRMb2FkZXIubG9hZFBhY2tzKHRoaXMubGV2ZWxEYXRhLmFzc2V0UGFja3MuYWZ0ZXJMb2FkKTtcbiAgICB0aGlzLmdhbWUubG9hZC5vbkxvYWRDb21wbGV0ZS5hZGRPbmNlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmFmdGVyQXNzZXRzTG9hZGVkKSB7XG4gICAgICAgIHRoaXMuYWZ0ZXJBc3NldHNMb2FkZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmdhbWUubG9hZC5zdGFydCgpO1xuICB9XG5cbiAgZm9sbG93aW5nUGxheWVyKCkge1xuICAgIHJldHVybiAhIXRoaXMubGV2ZWxEYXRhLmdyaWREaW1lbnNpb25zO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgICAgdGhpcy5xdWV1ZS50aWNrKCk7XG4gICAgICB0aGlzLmxldmVsVmlldy51cGRhdGUoKTtcblxuICAgICAgaWYgKHRoaXMucXVldWUuaXNGaW5pc2hlZCgpKSB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVFbmRTdGF0ZSgpO1xuICAgICAgfVxuICB9XG5cbiAgYWRkQ2hlYXRLZXlzKCkge1xuICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlRJTERFKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5VUCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IG1vdmUgZm9yd2FyZCBjb21tYW5kLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLm1vdmVGb3J3YXJkKGR1bW15RnVuYyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUklHSFQpLm9uVXAuYWRkKCgpID0+IHtcbiAgICAgICAgdmFyIGR1bW15RnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImhpZ2hsaWdodCB0dXJuIHJpZ2h0IGNvbW1hbmQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkudHVyblJpZ2h0KGR1bW15RnVuYyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IHR1cm4gbGVmdCBjb21tYW5kLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLnR1cm5MZWZ0KGR1bW15RnVuYyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IHBsYWNlQmxvY2sgY29tbWFuZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY29kZU9yZ0FQSS5wbGFjZUJsb2NrKGR1bW15RnVuYywgXCJsb2dPYWtcIik7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IGRlc3Ryb3kgYmxvY2sgY29tbWFuZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY29kZU9yZ0FQSS5kZXN0cm95QmxvY2soZHVtbXlGdW5jKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5FKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYEV4ZWN1dGUgY29tbWFuZCBsaXN0IGRvbmU6ICR7cmVzdWx0fSBgKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLnN0YXJ0QXR0ZW1wdChkdW1teUZ1bmMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlcpLm9uVXAuYWRkKCgpID0+IHtcbiAgICAgICAgdmFyIGR1bW15RnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgV2hpbGUgY29tbWFuZCBsaXN0XCIpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgYmxvY2tUeXBlID0gXCJlbXB0eVwiO1xuICAgICAgICB2YXIgY29kZUJsb2NrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSS5tb3ZlRm9yd2FyZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgV2hpbGUgY29tbWFuZCBtb3ZlIGJsb2NrXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSS5tb3ZlRm9yd2FyZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgV2hpbGUgY29tbWFuZCBtb3ZlIGJsb2NrMlwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLmNvZGVPcmdBUEkudHVybkxlZnQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFeGVjdXRlIFdoaWxlIGNvbW1hbmQgdHVyblwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLndoaWxlUGF0aEFoZWFkKGR1bW15RnVuYywgYmxvY2tUeXBlLCBjb2RlQmxvY2spO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBoYW5kbGVFbmRTdGF0ZSgpIHtcbiAgICAgIC8vIFRPRE86IGdvIGludG8gc3VjY2Vzcy9mYWlsdXJlIGFuaW1hdGlvbj8gKG9yIGFyZSB3ZSBjYWxsZWQgYnkgQ29kZU9yZyBmb3IgdGhhdD8pXG5cbiAgICAgIC8vIHJlcG9ydCBiYWNrIHRvIHRoZSBjb2RlLm9yZyBzaWRlIHRoZSBwYXNzL2ZhaWwgcmVzdWx0XG4gICAgICAvLyAgICAgdGhlbiBjbGVhciB0aGUgY2FsbGJhY2sgc28gd2UgZG9udCBrZWVwIGNhbGxpbmcgaXRcbiAgICAgIGlmICh0aGlzLk9uQ29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgIGlmICh0aGlzLnF1ZXVlLmlzU3VjY2VlZGVkKCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5PbkNvbXBsZXRlQ2FsbGJhY2sodHJ1ZSwgdGhpcy5sZXZlbE1vZGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuT25Db21wbGV0ZUNhbGxiYWNrKGZhbHNlLCB0aGlzLmxldmVsTW9kZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLk9uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG4gICAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuREVCVUcpIHtcbiAgICAgIHRoaXMuZ2FtZS5kZWJ1Zy50ZXh0KHRoaXMuZ2FtZS50aW1lLmZwcyB8fCAnLS0nLCAyLCAxNCwgXCIjMDBmZjAwXCIpO1xuICAgIH1cbiAgICB0aGlzLmxldmVsVmlldy5yZW5kZXIoKTtcbiAgfVxuXG4gIHNjYWxlRnJvbU9yaWdpbmFsKCkge1xuICAgIHZhciBbbmV3V2lkdGgsIG5ld0hlaWdodF0gPSB0aGlzLmxldmVsRGF0YS5ncmlkRGltZW5zaW9ucyB8fCBbMTAsIDEwXTtcbiAgICB2YXIgW29yaWdpbmFsV2lkdGgsIG9yaWdpbmFsSGVpZ2h0XSA9IFsxMCwgMTBdO1xuICAgIHJldHVybiBbbmV3V2lkdGggLyBvcmlnaW5hbFdpZHRoLCBuZXdIZWlnaHQgLyBvcmlnaW5hbEhlaWdodF07XG4gIH1cblxuICBnZXRTY3JlZW5zaG90KCkge1xuICAgIHJldHVybiB0aGlzLmdhbWUuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgfVxuXG4gIC8vIGNvbW1hbmQgcHJvY2Vzc29yc1xuICBtb3ZlRm9yd2FyZChjb21tYW5kUXVldWVJdGVtKSB7XG4gICAgdmFyIHBsYXllciA9IHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIsXG4gICAgICBhbGxGb3VuZENyZWVwZXJzLFxuICAgICAgZ3JvdW5kVHlwZSxcbiAgICAgIGp1bXBPZmY7XG5cbiAgICBpZiAodGhpcy5sZXZlbE1vZGVsLmNhbk1vdmVGb3J3YXJkKCkpIHtcbiAgICAgIGxldCB3YXNPbkJsb2NrID0gcGxheWVyLmlzT25CbG9jaztcbiAgICAgIHRoaXMubGV2ZWxNb2RlbC5tb3ZlRm9yd2FyZCgpO1xuICAgICAgLy8gVE9ETzogY2hlY2sgZm9yIExhdmEsIENyZWVwZXIsIHdhdGVyID0+IHBsYXkgYXBwcm9wIGFuaW1hdGlvbiAmIGNhbGwgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKVxuXG4gICAgICBqdW1wT2ZmID0gd2FzT25CbG9jayAmJiB3YXNPbkJsb2NrICE9IHBsYXllci5pc09uQmxvY2s7XG4gICAgICBpZihwbGF5ZXIuaXNPbkJsb2NrIHx8IGp1bXBPZmYpIHtcbiAgICAgICAgZ3JvdW5kVHlwZSA9IHRoaXMubGV2ZWxNb2RlbC5hY3Rpb25QbGFuZVt0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgocGxheWVyLnBvc2l0aW9uWzFdKSArIHBsYXllci5wb3NpdGlvblswXV0uYmxvY2tUeXBlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGdyb3VuZFR5cGUgPSB0aGlzLmxldmVsTW9kZWwuZ3JvdW5kUGxhbmVbdGhpcy5sZXZlbE1vZGVsLnlUb0luZGV4KHBsYXllci5wb3NpdGlvblsxXSkgKyBwbGF5ZXIucG9zaXRpb25bMF1dLmJsb2NrVHlwZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sZXZlbFZpZXcucGxheU1vdmVGb3J3YXJkQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywganVtcE9mZiwgcGxheWVyLmlzT25CbG9jaywgZ3JvdW5kVHlwZSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5SWRsZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2spO1xuXG4gICAgICAvL0ZpcnN0IGFyZyBpcyBpZiB3ZSBmb3VuZCBhIGNyZWVwZXJcbiAgICAgICAgYWxsRm91bmRDcmVlcGVycyA9IHRoaXMubGV2ZWxNb2RlbC5pc1BsYXllclN0YW5kaW5nTmVhckNyZWVwZXIoKTtcblxuICAgICAgICBpZiAodGhpcy5sZXZlbE1vZGVsLmlzUGxheWVyU3RhbmRpbmdJbldhdGVyKCkpIHtcbiAgICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlEcm93bkZhaWx1cmVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKCk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmxldmVsTW9kZWwuaXNQbGF5ZXJTdGFuZGluZ0luTGF2YSgpKSB7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUJ1cm5JbkxhdmFBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLmZhaWxlZCgpO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLmRlbGF5UGxheWVyTW92ZUJ5KDMwLCAyMDAsICgpID0+IHtcbiAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmKHRoaXMubGV2ZWxNb2RlbC5pc0ZvcndhcmRCbG9ja09mVHlwZShcImNyZWVwZXJcIikpXG4gICAgICB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlDcmVlcGVyRXhwbG9kZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHRoaXMubGV2ZWxNb2RlbC5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCksIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLmZhaWxlZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5QnVtcEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5kZWxheVBsYXllck1vdmVCeSg0MDAsIDgwMCwgKCkgPT4ge1xuICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHR1cm4oY29tbWFuZFF1ZXVlSXRlbSwgZGlyZWN0aW9uKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PSAtMSkge1xuICAgICAgdGhpcy5sZXZlbE1vZGVsLnR1cm5MZWZ0KCk7XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAxKSB7XG4gICAgICB0aGlzLmxldmVsTW9kZWwudHVyblJpZ2h0KCk7XG4gICAgfVxuICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZVBsYXllckRpcmVjdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZyk7XG5cbiAgICB0aGlzLmRlbGF5UGxheWVyTW92ZUJ5KDIwMCwgODAwLCAoKSA9PiB7XG4gICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgIH0pO1xuXG4gIH1cblxuICBkZXN0cm95QmxvY2tXaXRob3V0UGxheWVySW50ZXJhY3Rpb24ocG9zaXRpb24pIHtcbiAgICBsZXQgYmxvY2sgPSB0aGlzLmxldmVsTW9kZWwuYWN0aW9uUGxhbmVbdGhpcy5sZXZlbE1vZGVsLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIHBvc2l0aW9uWzBdXTtcbiAgICB0aGlzLmxldmVsTW9kZWwuZGVzdHJveUJsb2NrKHBvc2l0aW9uKTtcblxuICAgIGlmIChibG9jayAhPT0gbnVsbCkge1xuICAgICAgbGV0IGRlc3Ryb3lQb3NpdGlvbiA9IGJsb2NrLnBvc2l0aW9uO1xuICAgICAgbGV0IGJsb2NrVHlwZSA9IGJsb2NrLmJsb2NrVHlwZTtcblxuICAgICAgaWYgKGJsb2NrLmlzRGVzdHJveWFibGUpIHtcbiAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVGb3dQbGFuZSgpO1xuICAgICAgICBzd2l0Y2goYmxvY2tUeXBlKXtcbiAgICAgICAgICBjYXNlIFwibG9nQWNhY2lhXCI6XG4gICAgICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzQWNhY2lhXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImxvZ0JpcmNoXCI6XG4gICAgICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0JpcmNoXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImxvZ0p1bmdsZVwiOlxuICAgICAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0p1bmdsZVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJsb2dPYWtcIjpcbiAgICAgICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc09ha1wiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJsb2dTcHJ1Y2VcIjpcbiAgICAgICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NTcHJ1Y2VcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxldmVsVmlldy5hY3Rpb25QbGFuZUJsb2Nrc1t0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSArIGRlc3Ryb3lQb3NpdGlvblswXV0ua2lsbCgpO1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgKCk9Pnt9LCB0cnVlKTtcbiAgICAgIH0gZWxzZSBpZiAoYmxvY2suaXNVc2FibGUpIHtcbiAgICAgICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgICAgICBjYXNlIFwic2hlZXBcIjpcbiAgICAgICAgICAgIC8vIFRPRE86IFdoYXQgdG8gZG8gd2l0aCBhbHJlYWR5IHNoZWVyZWQgc2hlZXA/XG4gICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5U2hlYXJBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCAoKT0+e30pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZXN0cm95QmxvY2soY29tbWFuZFF1ZXVlSXRlbSkge1xuICAgIGxldCBwbGF5ZXIgPSB0aGlzLmxldmVsTW9kZWwucGxheWVyO1xuICAgIGlmICh0aGlzLmxldmVsTW9kZWwuY2FuRGVzdHJveUJsb2NrRm9yd2FyZCgpKSB7XG4gICAgICBsZXQgYmxvY2sgPSB0aGlzLmxldmVsTW9kZWwuZGVzdHJveUJsb2NrRm9yd2FyZCgpO1xuXG4gICAgICBpZiAoYmxvY2sgIT09IG51bGwpIHtcbiAgICAgICAgbGV0IGRlc3Ryb3lQb3NpdGlvbiA9IGJsb2NrLnBvc2l0aW9uO1xuICAgICAgICBsZXQgYmxvY2tUeXBlID0gYmxvY2suYmxvY2tUeXBlO1xuXG4gICAgICAgIGlmIChibG9jay5pc0Rlc3Ryb3lhYmxlKSB7XG4gICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICAgICAgc3dpdGNoKGJsb2NrVHlwZSl7XG4gICAgICAgICAgICBjYXNlIFwibG9nQWNhY2lhXCI6XG4gICAgICAgICAgICBjYXNlIFwidHJlZUFjYWNpYVwiOlxuICAgICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0FjYWNpYVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibG9nQmlyY2hcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0JpcmNoXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsb2dKdW5nbGVcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzSnVuZ2xlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsb2dPYWtcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NPYWtcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImxvZ1NwcnVjZVwiOlxuICAgICAgICAgICAgY2FzZSBcInRyZWVTcHJ1Y2VcIjpcbiAgICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NTcHJ1Y2VcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlEZXN0cm95QmxvY2tBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgdGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSwgdGhpcy5sZXZlbE1vZGVsLmZvd1BsYW5lLCAoKSA9PiB7XG4gICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGJsb2NrLmlzVXNhYmxlKSB7XG4gICAgICAgICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJzaGVlcFwiOlxuICAgICAgICAgICAgICAvLyBUT0RPOiBXaGF0IHRvIGRvIHdpdGggYWxyZWFkeSBzaGVlcmVkIHNoZWVwP1xuICAgICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5U2hlYXJTaGVlcEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxldmVsVmlldy5wbGF5UHVuY2hEZXN0cm95QWlyQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgdGhpcy5sZXZlbE1vZGVsLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwbGF5ZXIucG9zaXRpb25bMF0sIHBsYXllci5wb3NpdGlvblsxXSk7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgcGxheWVyLmlzT25CbG9jayk7XG4gICAgICAgIHRoaXMuZGVsYXlQbGF5ZXJNb3ZlQnkoMjAwLCA2MDAsICgpID0+IHtcbiAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNhblVzZVRpbnRzKCkge1xuICAgIC8vIFRPRE8oYmpvcmRhbik6IFJlbW92ZVxuICAgIC8vIGFsbCBicm93c2VycyBhcHBlYXIgdG8gd29yayB3aXRoIG5ldyB2ZXJzaW9uIG9mIFBoYXNlclxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY2hlY2tUbnRBbmltYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BlY2lhbExldmVsVHlwZSA9PT0gJ2ZyZWVwbGF5JztcbiAgfVxuXG4gIGNoZWNrTWluZWNhcnRMZXZlbEVuZEFuaW1hdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zcGVjaWFsTGV2ZWxUeXBlID09PSAnbWluZWNhcnQnO1xuICB9XG5cbiAgY2hlY2tIb3VzZUJ1aWx0RW5kQW5pbWF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnNwZWNpYWxMZXZlbFR5cGUgPT09ICdob3VzZUJ1aWxkJztcbiAgfVxuXG4gIGNoZWNrUmFpbEJsb2NrKGJsb2NrVHlwZSkge1xuICAgIHZhciBjaGVja1JhaWxCbG9jayA9IHRoaXMubGV2ZWxNb2RlbC5yYWlsTWFwW3RoaXMubGV2ZWxNb2RlbC55VG9JbmRleCh0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uWzFdKSArIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb25bMF1dO1xuICAgIGlmIChjaGVja1JhaWxCbG9jayAhPT0gXCJcIikge1xuICAgICAgYmxvY2tUeXBlID0gY2hlY2tSYWlsQmxvY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJsb2NrVHlwZSA9IFwicmFpbHNWZXJ0aWNhbFwiO1xuICAgIH1cbiAgICByZXR1cm4gYmxvY2tUeXBlO1xuICB9XG5cbiAgcGxhY2VCbG9jayhjb21tYW5kUXVldWVJdGVtLCBibG9ja1R5cGUpIHtcbiAgICB2YXIgYmxvY2tJbmRleCA9ICh0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgodGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvblsxXSkgKyB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uWzBdKTtcbiAgICB2YXIgYmxvY2tUeXBlQXRQb3NpdGlvbiA9IHRoaXMubGV2ZWxNb2RlbC5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGU7XG4gICAgaWYgKHRoaXMubGV2ZWxNb2RlbC5jYW5QbGFjZUJsb2NrKCkpIHtcbiAgICAgIGlmKHRoaXMuY2hlY2tNaW5lY2FydExldmVsRW5kQW5pbWF0aW9uKCkgJiYgYmxvY2tUeXBlID09IFwicmFpbFwiKSB7XG4gICAgICAgIGJsb2NrVHlwZSA9IHRoaXMuY2hlY2tSYWlsQmxvY2soYmxvY2tUeXBlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGJsb2NrVHlwZUF0UG9zaXRpb24gIT09IFwiXCIpIHtcbiAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmRlc3Ryb3lCbG9jayhibG9ja0luZGV4KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxldmVsTW9kZWwucGxhY2VCbG9jayhibG9ja1R5cGUpKSB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlQbGFjZUJsb2NrQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBibG9ja1R5cGUsIGJsb2NrVHlwZUF0UG9zaXRpb24sICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlU2hhZGluZ1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZUZvd1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5mb3dQbGFuZSk7XG4gICAgICAgICAgdGhpcy5kZWxheUJ5KDIwMCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUlkbGVBbmltYXRpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGZhbHNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmRlbGF5UGxheWVyTW92ZUJ5KDIwMCwgNDAwLCAoKSA9PiB7XG4gICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzaWduYWxCaW5kaW5nID0gdGhpcy5sZXZlbFZpZXcucGxheVBsYXllckFuaW1hdGlvbihcImp1bXBVcFwiLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgZmFsc2UpLm9uTG9vcC5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBmYWxzZSk7XG4gICAgICAgICAgc2lnbmFsQmluZGluZy5kZXRhY2goKTtcbiAgICAgICAgICB0aGlzLmRlbGF5QnkoODAwLCAoKSA9PiB7IGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7IH0pO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKTtcbiAgICB9XG4gIH1cblxuICBzZXRQbGF5ZXJBY3Rpb25EZWxheUJ5UXVldWVMZW5ndGgoKSB7XG4gICAgdmFyIFNUQVJUX1NQRUVEX1VQID0gMTA7XG4gICAgdmFyIEVORF9TUEVFRF9VUCA9IDIwO1xuXG4gICAgdmFyIHF1ZXVlTGVuZ3RoID0gdGhpcy5xdWV1ZS5nZXRMZW5ndGgoKTtcbiAgICB2YXIgc3BlZWRVcFJhbmdlTWF4ID0gRU5EX1NQRUVEX1VQIC0gU1RBUlRfU1BFRURfVVA7XG4gICAgdmFyIHNwZWVkVXBBbW91bnQgPSBNYXRoLm1pbihNYXRoLm1heChxdWV1ZUxlbmd0aCAtIFNUQVJUX1NQRUVEX1VQLCAwKSwgc3BlZWRVcFJhbmdlTWF4KTtcblxuICAgIHRoaXMucGxheWVyRGVsYXlGYWN0b3IgPSAxIC0gKHNwZWVkVXBBbW91bnQgLyBzcGVlZFVwUmFuZ2VNYXgpO1xuICB9XG5cbiAgZGVsYXlCeShtcywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgdGltZXIgPSB0aGlzLmdhbWUudGltZS5jcmVhdGUodHJ1ZSk7XG4gICAgdGltZXIuYWRkKHRoaXMub3JpZ2luYWxNc1RvU2NhbGVkKG1zKSwgY29tcGxldGlvbkhhbmRsZXIsIHRoaXMpO1xuICAgIHRpbWVyLnN0YXJ0KCk7XG4gICAgdGhpcy5yZXNldHRhYmxlVGltZXJzLnB1c2godGltZXIpO1xuICB9XG5cbiAgZGVsYXlQbGF5ZXJNb3ZlQnkobWluTXMsIG1heE1zLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMuZGVsYXlCeShNYXRoLm1heChtaW5NcywgbWF4TXMgKiB0aGlzLnBsYXllckRlbGF5RmFjdG9yKSwgY29tcGxldGlvbkhhbmRsZXIpO1xuICB9XG5cbiAgb3JpZ2luYWxNc1RvU2NhbGVkKG1zKSB7XG4gICAgdmFyIHJlYWxNcyA9IG1zIC8gdGhpcy5hc3N1bWVkU2xvd01vdGlvbjtcbiAgICByZXR1cm4gcmVhbE1zICogdGhpcy5nYW1lLnRpbWUuc2xvd01vdGlvbjtcbiAgfVxuXG4gIG9yaWdpbmFsRnBzVG9TY2FsZWQoZnBzKSB7XG4gICAgdmFyIHJlYWxGcHMgPSBmcHMgKiB0aGlzLmFzc3VtZWRTbG93TW90aW9uO1xuICAgIHJldHVybiByZWFsRnBzIC8gdGhpcy5nYW1lLnRpbWUuc2xvd01vdGlvbjtcbiAgfVxuXG4gIHBsYWNlQmxvY2tGb3J3YXJkKGNvbW1hbmRRdWV1ZUl0ZW0sIGJsb2NrVHlwZSkge1xuICAgIHZhciBmb3J3YXJkUG9zaXRpb24sXG4gICAgICAgIHBsYWNlbWVudFBsYW5lLFxuICAgICAgICBzb3VuZEVmZmVjdCA9ICgpPT57fTtcblxuICAgIGlmICghdGhpcy5sZXZlbE1vZGVsLmNhblBsYWNlQmxvY2tGb3J3YXJkKCkpIHtcbiAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlQdW5jaEFpckFuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5SWRsZUFuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgZmFsc2UpO1xuICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yd2FyZFBvc2l0aW9uID0gdGhpcy5sZXZlbE1vZGVsLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKTtcbiAgICBwbGFjZW1lbnRQbGFuZSA9IHRoaXMubGV2ZWxNb2RlbC5nZXRQbGFuZVRvUGxhY2VPbihmb3J3YXJkUG9zaXRpb24pO1xuICAgIGlmKHRoaXMubGV2ZWxNb2RlbC5pc0Jsb2NrT2ZUeXBlT25QbGFuZShmb3J3YXJkUG9zaXRpb24sIFwibGF2YVwiLCBwbGFjZW1lbnRQbGFuZSkpIHtcbiAgICAgIHNvdW5kRWZmZWN0ID0gKCk9Pnt0aGlzLmxldmVsVmlldy5hdWRpb1BsYXllci5wbGF5KFwiZml6elwiKTt9O1xuICAgIH1cbiAgICB0aGlzLmxldmVsTW9kZWwucGxhY2VCbG9ja0ZvcndhcmQoYmxvY2tUeXBlLCBwbGFjZW1lbnRQbGFuZSk7XG4gICAgdGhpcy5sZXZlbFZpZXcucGxheVBsYWNlQmxvY2tJbkZyb250QW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCB0aGlzLmxldmVsTW9kZWwuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpLCBwbGFjZW1lbnRQbGFuZSwgYmxvY2tUeXBlLCAoKSA9PiB7XG4gICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZVNoYWRpbmdQbGFuZSgpO1xuICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVGb3dQbGFuZSgpO1xuICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlU2hhZGluZ1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlRm93UGxhbmUodGhpcy5sZXZlbE1vZGVsLmZvd1BsYW5lKTtcbiAgICAgIHNvdW5kRWZmZWN0KCk7XG4gICAgICB0aGlzLmRlbGF5QnkoMjAwLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZGVsYXlQbGF5ZXJNb3ZlQnkoMjAwLCA0MDAsICgpID0+IHtcbiAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgY2hlY2tTb2x1dGlvbihjb21tYW5kUXVldWVJdGVtKSB7XG4gICAgbGV0IHBsYXllciA9IHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXI7XG4gICAgdGhpcy5sZXZlbFZpZXcuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocGxheWVyLnBvc2l0aW9uWzBdLCBwbGF5ZXIucG9zaXRpb25bMV0pO1xuXG4gICAgLy8gY2hlY2sgdGhlIGZpbmFsIHN0YXRlIHRvIHNlZSBpZiBpdHMgc29sdmVkXG4gICAgaWYgKHRoaXMubGV2ZWxNb2RlbC5pc1NvbHZlZCgpKSB7XG4gICAgICBpZih0aGlzLmNoZWNrSG91c2VCdWlsdEVuZEFuaW1hdGlvbigpKSB7XG4gICAgICAgIHZhciBob3VzZUJvdHRvbVJpZ2h0ID0gdGhpcy5sZXZlbE1vZGVsLmdldEhvdXNlQm90dG9tUmlnaHQoKTtcbiAgICAgICAgdmFyIGluRnJvbnRPZkRvb3IgPSBbaG91c2VCb3R0b21SaWdodFswXSAtIDEsIGhvdXNlQm90dG9tUmlnaHRbMV0gKyAyXTtcbiAgICAgICAgdmFyIGJlZFBvc2l0aW9uID0gW2hvdXNlQm90dG9tUmlnaHRbMF0sIGhvdXNlQm90dG9tUmlnaHRbMV1dO1xuICAgICAgICB2YXIgZG9vclBvc2l0aW9uID0gW2hvdXNlQm90dG9tUmlnaHRbMF0gLSAxLCBob3VzZUJvdHRvbVJpZ2h0WzFdICsgMV07XG4gICAgICAgIHRoaXMubGV2ZWxNb2RlbC5tb3ZlVG8oaW5Gcm9udE9mRG9vcik7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlTdWNjZXNzSG91c2VCdWlsdEFuaW1hdGlvbihcbiAgICAgICAgICAgIHBsYXllci5wb3NpdGlvbixcbiAgICAgICAgICAgIHBsYXllci5mYWNpbmcsXG4gICAgICAgICAgICBwbGF5ZXIuaXNPbkJsb2NrLFxuICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmhvdXNlR3JvdW5kVG9GbG9vckJsb2Nrcyhob3VzZUJvdHRvbVJpZ2h0KSxcbiAgICAgICAgICAgIFtiZWRQb3NpdGlvbiwgZG9vclBvc2l0aW9uXSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2soYmVkUG9zaXRpb24pO1xuICAgICAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuZGVzdHJveUJsb2NrKGRvb3JQb3NpdGlvbik7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlRm93UGxhbmUoKTtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlU2hhZGluZ1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgICAgICAgICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVGb3dQbGFuZSh0aGlzLmxldmVsTW9kZWwuZm93UGxhbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0aGlzLmNoZWNrTWluZWNhcnRMZXZlbEVuZEFuaW1hdGlvbigpKVxuICAgICAge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5TWluZWNhcnRBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLFxuICAgICAgICAgICAgKCkgPT4geyBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpOyB9LCB0aGlzLmxldmVsTW9kZWwuZ2V0TWluZWNhcnRUcmFjaygpLCB0aGlzLmxldmVsTW9kZWwuZ2V0VW5wb3dlcmVkUmFpbHMoKSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRoaXMuY2hlY2tUbnRBbmltYXRpb24oKSkge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5zY2FsZVNob3dXaG9sZVdvcmxkKCgpID0+IHt9KTtcbiAgICAgICAgdmFyIHRudCA9IHRoaXMubGV2ZWxNb2RlbC5nZXRUbnQoKTtcbiAgICAgICAgdmFyIHdhc09uQmxvY2sgPSBwbGF5ZXIuaXNPbkJsb2NrO1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5RGVzdHJveVRudEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssIHRoaXMubGV2ZWxNb2RlbC5nZXRUbnQoKSwgdGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGlmICh0bnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBTaGFrZXMgY2FtZXJhIChuZWVkIHRvIGF2b2lkIGNvbnRlbnRpb24gd2l0aCBwYW4/KVxuICAgICAgICAgICAgLy90aGlzLmdhbWUuY2FtZXJhLnNldFBvc2l0aW9uKDAsIDUpO1xuICAgICAgICAgICAgLy90aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMuZ2FtZS5jYW1lcmEpXG4gICAgICAgICAgICAvLyAgICAudG8oe3k6IC0xMH0sIDQwLCBQaGFzZXIuRWFzaW5nLlNpbnVzb2lkYWwuSW5PdXQsIGZhbHNlLCAwLCAzLCB0cnVlKVxuICAgICAgICAgICAgLy8gICAgLnRvKHt5OiAwfSwgMClcbiAgICAgICAgICAgIC8vICAgIC5zdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IodmFyIGkgaW4gdG50KSB7XG4gICAgICAgICAgICBpZiAodG50W2ldLnggPT09IHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24ueCAmJiB0bnRbaV0ueSA9PT0gdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbi55KSB7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuaXNPbkJsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3Vycm91bmRpbmdCbG9ja3MgPSB0aGlzLmxldmVsTW9kZWwuZ2V0QWxsQm9yZGVyaW5nUG9zaXRpb25Ob3RPZlR5cGUodG50W2ldLCBcInRudFwiKTtcbiAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2sodG50W2ldKTtcbiAgICAgICAgICAgIGZvcih2YXIgYiA9IDE7IGIgPCBzdXJyb3VuZGluZ0Jsb2Nrcy5sZW5ndGg7ICsrYikge1xuICAgICAgICAgICAgICBpZihzdXJyb3VuZGluZ0Jsb2Nrc1tiXVswXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveUJsb2NrV2l0aG91dFBsYXllckludGVyYWN0aW9uKHN1cnJvdW5kaW5nQmxvY2tzW2JdWzFdKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXBsYXllci5pc09uQmxvY2sgJiYgd2FzT25CbG9jaykge1xuICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVBsYXllckp1bXBEb3duVmVydGljYWxBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlU2hhZGluZ1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZUZvd1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5mb3dQbGFuZSk7XG4gICAgICAgICAgdGhpcy5kZWxheUJ5KDIwMCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVN1Y2Nlc3NBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVN1Y2Nlc3NBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLFxuICAgICAgICAgICAgKCkgPT4geyBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpOyB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUZhaWx1cmVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpc1BhdGhBaGVhZChibG9ja1R5cGUpICB7XG4gICAgICByZXR1cm4gdGhpcy5sZXZlbE1vZGVsLmlzRm9yd2FyZEJsb2NrT2ZUeXBlKGJsb2NrVHlwZSk7XG4gIH1cblxufVxuXG53aW5kb3cuR2FtZUNvbnRyb2xsZXIgPSBHYW1lQ29udHJvbGxlcjtcblxuZXhwb3J0IGRlZmF1bHQgR2FtZUNvbnRyb2xsZXI7XG4iLCJpbXBvcnQgRmFjaW5nRGlyZWN0aW9uIGZyb20gXCIuL0ZhY2luZ0RpcmVjdGlvbi5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXZlbFZpZXcge1xuICBjb25zdHJ1Y3Rvcihjb250cm9sbGVyKSB7XG4gICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICB0aGlzLmF1ZGlvUGxheWVyID0gY29udHJvbGxlci5hdWRpb1BsYXllcjtcbiAgICB0aGlzLmdhbWUgPSBjb250cm9sbGVyLmdhbWU7XG5cbiAgICB0aGlzLmJhc2VTaGFkaW5nID0gbnVsbDtcblxuICAgIHRoaXMucGxheWVyU3ByaXRlID0gbnVsbDtcbiAgICB0aGlzLnBsYXllckdob3N0ID0gbnVsbDsgICAgICAgIC8vIFRoZSBnaG9zdCBpcyBhIGNvcHkgb2YgdGhlIHBsYXllciBzcHJpdGUgdGhhdCBzaXRzIG9uIHRvcCBvZiBldmVyeXRoaW5nIGF0IDIwJSBvcGFjaXR5LCBzbyB0aGUgcGxheWVyIGNhbiBnbyB1bmRlciB0cmVlcyBhbmQgc3RpbGwgYmUgc2Vlbi5cbiAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvciA9IG51bGw7XG5cbiAgICB0aGlzLmdyb3VuZFBsYW5lID0gbnVsbDtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZSA9IG51bGw7XG4gICAgdGhpcy5hY3Rpb25QbGFuZSA9IG51bGw7XG4gICAgdGhpcy5mbHVmZlBsYW5lID0gbnVsbDtcbiAgICB0aGlzLmZvd1BsYW5lID0gbnVsbDtcblxuICAgIHRoaXMubWluaUJsb2NrcyA9IHtcbiAgICAgIFwiZGlydFwiOiBbXCJNaW5pYmxvY2tzXCIsIDAsIDVdLFxuICAgICAgXCJkaXJ0Q29hcnNlXCI6IFtcIk1pbmlibG9ja3NcIiwgNiwgMTFdLFxuICAgICAgXCJzYW5kXCI6IFtcIk1pbmlibG9ja3NcIiwgMTIsIDE3XSxcbiAgICAgIFwiZ3JhdmVsXCI6IFtcIk1pbmlibG9ja3NcIiwgMTgsIDIzXSxcbiAgICAgIFwiYnJpY2tzXCI6IFtcIk1pbmlibG9ja3NcIiwgMjQsIDI5XSxcbiAgICAgIFwibG9nQWNhY2lhXCI6IFtcIk1pbmlibG9ja3NcIiwgMzAsIDM1XSxcbiAgICAgIFwibG9nQmlyY2hcIjogW1wiTWluaWJsb2Nrc1wiLCAzNiwgNDFdLFxuICAgICAgXCJsb2dKdW5nbGVcIjogW1wiTWluaWJsb2Nrc1wiLCA0MiwgNDddLFxuICAgICAgXCJsb2dPYWtcIjogW1wiTWluaWJsb2Nrc1wiLCA0OCwgNTNdLFxuICAgICAgXCJsb2dTcHJ1Y2VcIjogW1wiTWluaWJsb2Nrc1wiLCA1NCwgNTldLFxuICAgICAgXCJwbGFua3NBY2FjaWFcIjogW1wiTWluaWJsb2Nrc1wiLCA2MCwgNjVdLFxuICAgICAgXCJwbGFua3NCaXJjaFwiOiBbXCJNaW5pYmxvY2tzXCIsIDY2LCA3MV0sXG4gICAgICBcInBsYW5rc0p1bmdsZVwiOiBbXCJNaW5pYmxvY2tzXCIsIDcyLCA3N10sXG4gICAgICBcInBsYW5rc09ha1wiOiBbXCJNaW5pYmxvY2tzXCIsIDc4LCA4M10sXG4gICAgICBcInBsYW5rc1NwcnVjZVwiOiBbXCJNaW5pYmxvY2tzXCIsIDg0LCA4OV0sXG4gICAgICBcImNvYmJsZXN0b25lXCI6IFtcIk1pbmlibG9ja3NcIiwgOTAsIDk1XSxcbiAgICAgIFwic2FuZHN0b25lXCI6IFtcIk1pbmlibG9ja3NcIiwgOTYsIDEwMV0sXG4gICAgICBcIndvb2xcIjogW1wiTWluaWJsb2Nrc1wiLCAxMDIsIDEwN10sXG4gICAgICBcInJlZHN0b25lRHVzdFwiOiBbXCJNaW5pYmxvY2tzXCIsIDEwOCwgMTEzXSxcbiAgICAgIFwibGFwaXNMYXp1bGlcIjogW1wiTWluaWJsb2Nrc1wiLCAxMTQsIDExOV0sXG4gICAgICBcImluZ290SXJvblwiOiBbXCJNaW5pYmxvY2tzXCIsIDEyMCwgMTI1XSxcbiAgICAgIFwiaW5nb3RHb2xkXCI6IFtcIk1pbmlibG9ja3NcIiwgMTI2LCAxMzFdLFxuICAgICAgXCJlbWVyYWxkXCI6IFtcIk1pbmlibG9ja3NcIiwgMTMyLCAxMzddLFxuICAgICAgXCJkaWFtb25kXCI6IFtcIk1pbmlibG9ja3NcIiwgMTM4LCAxNDNdLFxuICAgICAgXCJjb2FsXCI6IFtcIk1pbmlibG9ja3NcIiwgMTQ0LCAxNDldLFxuICAgICAgXCJidWNrZXRXYXRlclwiOiBbXCJNaW5pYmxvY2tzXCIsIDE1MCwgMTU1XSxcbiAgICAgIFwiYnVja2V0TGF2YVwiOiBbXCJNaW5pYmxvY2tzXCIsIDE1NiwgMTYxXSxcbiAgICAgIFwiZ3VuUG93ZGVyXCI6IFtcIk1pbmlibG9ja3NcIiwgMTYyLCAxNjddLFxuICAgICAgXCJ3aGVhdFwiOiBbXCJNaW5pYmxvY2tzXCIsIDE2OCwgMTczXSxcbiAgICAgIFwicG90YXRvXCI6IFtcIk1pbmlibG9ja3NcIiwgMTc0LCAxNzldLFxuICAgICAgXCJjYXJyb3RzXCI6IFtcIk1pbmlibG9ja3NcIiwgMTgwLCAxODVdLFxuXG4gICAgICBcInNoZWVwXCI6IFtcIk1pbmlibG9ja3NcIiwgMTAyLCAxMDddXG4gICAgfTtcblxuICAgIHRoaXMuYmxvY2tzID0ge1xuICAgICAgXCJiZWRyb2NrXCI6IFtcImJsb2Nrc1wiLCBcIkJlZHJvY2tcIiwgLTEzLCAwXSxcbiAgICAgIFwiYnJpY2tzXCI6IFtcImJsb2Nrc1wiLCBcIkJyaWNrc1wiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVDb2FsXCI6IFtcImJsb2Nrc1wiLCBcIkNvYWxfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcImRpcnRDb2Fyc2VcIjogW1wiYmxvY2tzXCIsIFwiQ29hcnNlX0RpcnRcIiwgLTEzLCAwXSxcbiAgICAgIFwiY29iYmxlc3RvbmVcIjogW1wiYmxvY2tzXCIsIFwiQ29iYmxlc3RvbmVcIiwgLTEzLCAwXSxcbiAgICAgIFwib3JlRGlhbW9uZFwiOiBbXCJibG9ja3NcIiwgXCJEaWFtb25kX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJkaXJ0XCI6IFtcImJsb2Nrc1wiLCBcIkRpcnRcIiwgLTEzLCAwXSxcbiAgICAgIFwib3JlRW1lcmFsZFwiOiBbXCJibG9ja3NcIiwgXCJFbWVyYWxkX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJmYXJtbGFuZFdldFwiOiBbXCJibG9ja3NcIiwgXCJGYXJtbGFuZF9XZXRcIiwgLTEzLCAwXSxcbiAgICAgIFwiZmxvd2VyRGFuZGVsaW9uXCI6IFtcImJsb2Nrc1wiLCBcIkZsb3dlcl9EYW5kZWxpb25cIiwgLTEzLCAwXSxcbiAgICAgIFwiZmxvd2VyT3hlZXllXCI6IFtcImJsb2Nrc1wiLCBcIkZsb3dlcl9PeGVleWVcIiwgLTEzLCAwXSxcbiAgICAgIFwiZmxvd2VyUm9zZVwiOiBbXCJibG9ja3NcIiwgXCJGbG93ZXJfUm9zZVwiLCAtMTMsIDBdLFxuICAgICAgXCJnbGFzc1wiOiBbXCJibG9ja3NcIiwgXCJHbGFzc1wiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVHb2xkXCI6IFtcImJsb2Nrc1wiLCBcIkdvbGRfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcImdyYXNzXCI6IFtcImJsb2Nrc1wiLCBcIkdyYXNzXCIsIC0xMywgMF0sXG4gICAgICBcImdyYXZlbFwiOiBbXCJibG9ja3NcIiwgXCJHcmF2ZWxcIiwgLTEzLCAwXSxcbiAgICAgIFwib3JlSXJvblwiOiBbXCJibG9ja3NcIiwgXCJJcm9uX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVMYXBpc1wiOiBbXCJibG9ja3NcIiwgXCJMYXBpc19PcmVcIiwgLTEzLCAwXSxcbiAgICAgIFwibGF2YVwiOiBbXCJibG9ja3NcIiwgXCJMYXZhXzBcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nQWNhY2lhXCI6IFtcImJsb2Nrc1wiLCBcIkxvZ19BY2FjaWFcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nQmlyY2hcIjogW1wiYmxvY2tzXCIsIFwiTG9nX0JpcmNoXCIsIC0xMywgMF0sXG4gICAgICBcImxvZ0p1bmdsZVwiOiBbXCJibG9ja3NcIiwgXCJMb2dfSnVuZ2xlXCIsIC0xMywgMF0sXG4gICAgICBcImxvZ09ha1wiOiBbXCJibG9ja3NcIiwgXCJMb2dfT2FrXCIsIC0xMywgMF0sXG4gICAgICBcImxvZ1NwcnVjZVwiOiBbXCJibG9ja3NcIiwgXCJMb2dfU3BydWNlXCIsIC0xMywgMF0sXG4gICAgICAvL1wib2JzaWRpYW5cIjogW1wiYmxvY2tzXCIsIFwiT2JzaWRpYW5cIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzQWNhY2lhXCI6IFtcImJsb2Nrc1wiLCBcIlBsYW5rc19BY2FjaWFcIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzQmlyY2hcIjogW1wiYmxvY2tzXCIsIFwiUGxhbmtzX0JpcmNoXCIsIC0xMywgMF0sXG4gICAgICBcInBsYW5rc0p1bmdsZVwiOiBbXCJibG9ja3NcIiwgXCJQbGFua3NfSnVuZ2xlXCIsIC0xMywgMF0sXG4gICAgICBcInBsYW5rc09ha1wiOiBbXCJibG9ja3NcIiwgXCJQbGFua3NfT2FrXCIsIC0xMywgMF0sXG4gICAgICBcInBsYW5rc1NwcnVjZVwiOiBbXCJibG9ja3NcIiwgXCJQbGFua3NfU3BydWNlXCIsIC0xMywgMF0sXG4gICAgICBcIm9yZVJlZHN0b25lXCI6IFtcImJsb2Nrc1wiLCBcIlJlZHN0b25lX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJzYW5kXCI6IFtcImJsb2Nrc1wiLCBcIlNhbmRcIiwgLTEzLCAwXSxcbiAgICAgIFwic2FuZHN0b25lXCI6IFtcImJsb2Nrc1wiLCBcIlNhbmRzdG9uZVwiLCAtMTMsIDBdLFxuICAgICAgXCJzdG9uZVwiOiBbXCJibG9ja3NcIiwgXCJTdG9uZVwiLCAtMTMsIDBdLFxuICAgICAgXCJ0bnRcIjogW1widG50XCIsIFwiVE5UZXhwbG9zaW9uMFwiLCAtODAsIC01OF0sXG4gICAgICBcIndhdGVyXCI6IFtcImJsb2Nrc1wiLCBcIldhdGVyXzBcIiwgLTEzLCAwXSxcbiAgICAgIFwid29vbFwiOiBbXCJibG9ja3NcIiwgXCJXb29sX1doaXRlXCIsIC0xMywgMF0sXG4gICAgICBcIndvb2xfb3JhbmdlXCI6IFtcImJsb2Nrc1wiLCBcIldvb2xfT3JhbmdlXCIsIC0xMywgMF0sXG5cbiAgICAgIFwibGVhdmVzQWNhY2lhXCI6IFtcImxlYXZlc0FjYWNpYVwiLCBcIkxlYXZlczBcIiwgLTQyLCA4MF0sXG4gICAgICBcImxlYXZlc0JpcmNoXCI6IFtcImxlYXZlc0JpcmNoXCIsIFwiTGVhdmVzMFwiLCAtMTAwLCAtMTBdLFxuICAgICAgXCJsZWF2ZXNKdW5nbGVcIjogW1wibGVhdmVzSnVuZ2xlXCIsIFwiTGVhdmVzMFwiLCAtNjksIDQzXSxcbiAgICAgIFwibGVhdmVzT2FrXCI6IFtcImxlYXZlc09ha1wiLCBcIkxlYXZlczBcIiwgLTEwMCwgMF0sXG4gICAgICBcImxlYXZlc1NwcnVjZVwiOiBbXCJsZWF2ZXNTcHJ1Y2VcIiwgXCJMZWF2ZXMwXCIsIC03NiwgNjBdLFxuXG4gICAgICBcIndhdGVyaW5nXCIgOiBbXCJibG9ja3NcIiwgXCJXYXRlcl8wXCIsIC0xMywgMF0sXG4gICAgICBcImNyb3BXaGVhdFwiOiBbXCJibG9ja3NcIiwgXCJXaGVhdDBcIiwgLTEzLCAwXSxcbiAgICAgIFwidG9yY2hcIjogW1widG9yY2hcIiwgXCJUb3JjaDBcIiwgLTEzLCAwXSxcblxuICAgICAgXCJ0YWxsR3Jhc3NcIjogW1widGFsbEdyYXNzXCIsIFwiXCIsIC0xMywgMF0sXG5cbiAgICAgIFwibGF2YVBvcFwiOiBbXCJsYXZhUG9wXCIsIFwiTGF2YVBvcDAxXCIsIC0xMywgMF0sXG4gICAgICBcImZpcmVcIjogW1wiZmlyZVwiLCBcIlwiLCAtMTEsIDEzNV0sXG4gICAgICBcImJ1YmJsZXNcIjogW1wiYnViYmxlc1wiLCBcIlwiLCAtMTEsIDEzNV0sXG4gICAgICBcImV4cGxvc2lvblwiOiBbXCJleHBsb3Npb25cIiwgXCJcIiwgLTcwLCA2MF0sXG5cbiAgICAgIFwiZG9vclwiOiBbXCJkb29yXCIsIFwiXCIsIC0xMiwgLTE1XSxcblxuICAgICAgXCJyYWlsc0JvdHRvbUxlZnRcIjogICAgICAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19Cb3R0b21MZWZ0XCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzQm90dG9tUmlnaHRcIjogICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX0JvdHRvbVJpZ2h0XCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzSG9yaXpvbnRhbFwiOiAgICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX0hvcml6b250YWxcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNUb3BMZWZ0XCI6ICAgICAgICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfVG9wTGVmdFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1RvcFJpZ2h0XCI6ICAgICAgICAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19Ub3BSaWdodFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1VucG93ZXJlZEhvcml6b250YWxcIjpbXCJibG9ja3NcIiwgXCJSYWlsc19VbnBvd2VyZWRIb3Jpem9udGFsXCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzVW5wb3dlcmVkVmVydGljYWxcIjogIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1VucG93ZXJlZFZlcnRpY2FsXCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzVmVydGljYWxcIjogICAgICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1ZlcnRpY2FsXCIsIC0xMywgLTBdLFxuICAgICAgXCJyYWlsc1Bvd2VyZWRIb3Jpem9udGFsXCI6ICBbXCJibG9ja3NcIiwgXCJSYWlsc19Qb3dlcmVkSG9yaXpvbnRhbFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1Bvd2VyZWRWZXJ0aWNhbFwiOiAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19Qb3dlcmVkVmVydGljYWxcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNSZWRzdG9uZVRvcmNoXCI6ICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfUmVkc3RvbmVUb3JjaFwiLCAtMTIsIDldLFxuICAgIH07XG5cbiAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzID0gW107XG4gICAgdGhpcy50b0Rlc3Ryb3kgPSBbXTtcbiAgICB0aGlzLnJlc2V0dGFibGVUd2VlbnMgPSBbXTtcbiAgfVxuXG4gIHlUb0luZGV4KHkpIHtcbiAgICByZXR1cm4gdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwueVRvSW5kZXgoeSk7XG4gIH1cblxuICBjcmVhdGUobGV2ZWxNb2RlbCkge1xuICAgIHRoaXMuY3JlYXRlUGxhbmVzKCk7XG4gICAgdGhpcy5yZXNldChsZXZlbE1vZGVsKTtcbiAgfVxuXG4gIHJlc2V0KGxldmVsTW9kZWwpIHtcbiAgICBsZXQgcGxheWVyID0gbGV2ZWxNb2RlbC5wbGF5ZXI7XG5cbiAgICB0aGlzLnJlc2V0dGFibGVUd2VlbnMuZm9yRWFjaCgodHdlZW4pID0+IHtcbiAgICAgIHR3ZWVuLnN0b3AoZmFsc2UpO1xuICAgIH0pO1xuICAgIHRoaXMucmVzZXR0YWJsZVR3ZWVucy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5yZXNldFBsYW5lcyhsZXZlbE1vZGVsKTtcbiAgICB0aGlzLnByZXBhcmVQbGF5ZXJTcHJpdGUocGxheWVyLm5hbWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuc3RvcCgpO1xuICAgIHRoaXMudXBkYXRlU2hhZGluZ1BsYW5lKGxldmVsTW9kZWwuc2hhZGluZ1BsYW5lKTtcbiAgICB0aGlzLnVwZGF0ZUZvd1BsYW5lKGxldmVsTW9kZWwuZm93UGxhbmUpO1xuICAgIHRoaXMuc2V0UGxheWVyUG9zaXRpb24ocGxheWVyLnBvc2l0aW9uWzBdLCBwbGF5ZXIucG9zaXRpb25bMV0sIHBsYXllci5pc09uQmxvY2spO1xuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocGxheWVyLnBvc2l0aW9uWzBdLCBwbGF5ZXIucG9zaXRpb25bMV0pO1xuICAgIHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yLnZpc2libGUgPSB0cnVlO1xuICAgIHRoaXMucGxheUlkbGVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrKTtcblxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuZm9sbG93aW5nUGxheWVyKCkpIHtcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgbGV2ZWxNb2RlbC5wbGFuZVdpZHRoICogNDAsIGxldmVsTW9kZWwucGxhbmVIZWlnaHQgKiA0MCk7XG4gICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllclNwcml0ZSk7XG4gICAgICB0aGlzLmdhbWUud29ybGQuc2NhbGUueCA9IDE7XG4gICAgICB0aGlzLmdhbWUud29ybGQuc2NhbGUueSA9IDE7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9EZXN0cm95Lmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLnRvRGVzdHJveVtpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG5cbiAgICBpZiAodGhpcy5wbGF5ZXJHaG9zdCkge1xuICAgICAgdGhpcy5wbGF5ZXJHaG9zdC5mcmFtZSA9IHRoaXMucGxheWVyU3ByaXRlLmZyYW1lO1xuICAgICAgdGhpcy5wbGF5ZXJHaG9zdC56ID0gMTAwMDtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5hY3Rpb25QbGFuZS5zb3J0KCdzb3J0T3JkZXInKTtcbiAgICB0aGlzLmZsdWZmUGxhbmUuc29ydCgneicpO1xuICB9XG5cbiAgZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpIHtcbiAgICB2YXIgZGlyZWN0aW9uO1xuXG4gICAgc3dpdGNoIChmYWNpbmcpIHtcbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlVwOlxuICAgICAgICBkaXJlY3Rpb24gPSBcIl91cFwiO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ6XG4gICAgICAgIGRpcmVjdGlvbiA9IFwiX3JpZ2h0XCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5Eb3duOlxuICAgICAgICBkaXJlY3Rpb24gPSBcIl9kb3duXCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5MZWZ0OlxuICAgICAgICBkaXJlY3Rpb24gPSBcIl9sZWZ0XCI7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBkaXJlY3Rpb247XG4gIH1cblxuICB1cGRhdGVQbGF5ZXJEaXJlY3Rpb24ocG9zaXRpb24sIGZhY2luZykge1xuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcblxuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIiArIGRpcmVjdGlvbik7XG4gIH1cblxuICBwbGF5UGxheWVyQW5pbWF0aW9uKGFuaW1hdGlvbk5hbWUsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaykge1xuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIDU7XG5cbiAgICBsZXQgYW5pbU5hbWUgPSBhbmltYXRpb25OYW1lICsgZGlyZWN0aW9uO1xuICAgIHJldHVybiB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltTmFtZSk7XG4gIH1cblxuICBwbGF5SWRsZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spIHtcbiAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJpZGxlXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gIH1cblxuICBzY2FsZVNob3dXaG9sZVdvcmxkKGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIFtzY2FsZVgsIHNjYWxlWV0gPSB0aGlzLmNvbnRyb2xsZXIuc2NhbGVGcm9tT3JpZ2luYWwoKTtcbiAgICB2YXIgc2NhbGVUd2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMuZ2FtZS53b3JsZC5zY2FsZSkudG8oe1xuICAgICAgeDogMSAvIHNjYWxlWCxcbiAgICAgIHk6IDEgLyBzY2FsZVlcbiAgICB9LCAxMDAwLCBQaGFzZXIuRWFzaW5nLkV4cG9uZW50aWFsLk91dCk7XG5cbiAgICB0aGlzLmdhbWUuY2FtZXJhLnVuZm9sbG93KCk7XG5cbiAgICB2YXIgcG9zaXRpb25Ud2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMuZ2FtZS5jYW1lcmEpLnRvKHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfSwgMTAwMCwgUGhhc2VyLkVhc2luZy5FeHBvbmVudGlhbC5PdXQpO1xuXG4gICAgc2NhbGVUd2Vlbi5vbkNvbXBsZXRlLmFkZE9uY2UoKCkgPT4ge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcblxuICAgIHBvc2l0aW9uVHdlZW4uc3RhcnQoKTtcbiAgICBzY2FsZVR3ZWVuLnN0YXJ0KCk7XG4gIH1cblxuICBwbGF5U3VjY2Vzc0FuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoMjUwLCAoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdWNjZXNzXCIpO1xuICAgICAgdGhpcy5vbkFuaW1hdGlvbkVuZCh0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJjZWxlYnJhdGVcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKSwgKCkgPT4ge1xuICAgICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5RmFpbHVyZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoNTAwLCAoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJmYWlsdXJlXCIpO1xuICAgICAgdGhpcy5vbkFuaW1hdGlvbkVuZCh0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJmYWlsXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayksICgpID0+IHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoODAwLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlCdW1wQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaykge1xuICAgIHZhciBhbmltYXRpb24gPSB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJidW1wXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gICAgYW5pbWF0aW9uLm9uQ29tcGxldGUuYWRkKCgpPT57XG4gICAgICB0aGlzLnBsYXlJZGxlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgfVxuXG4gIHBsYXlEcm93bkZhaWx1cmVBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgICAgdmFyIHNwcml0ZSxcbiAgICAgICAgICB0d2VlbjtcblxuICAgICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwiZmFpbFwiLCBwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spO1xuICAgICAgdGhpcy5jcmVhdGVCbG9jayh0aGlzLmZsdWZmUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgXCJidWJibGVzXCIpO1xuXG4gICAgICBzcHJpdGUgPSB0aGlzLmZsdWZmUGxhbmUuY3JlYXRlKDAsIDAsIFwiZmluaXNoT3ZlcmxheVwiKTtcbiAgICAgIHZhciBbc2NhbGVYLCBzY2FsZVldID0gdGhpcy5jb250cm9sbGVyLnNjYWxlRnJvbU9yaWdpbmFsKCk7XG4gICAgICBzcHJpdGUuc2NhbGUueCA9IHNjYWxlWDtcbiAgICAgIHNwcml0ZS5zY2FsZS55ID0gc2NhbGVZO1xuICAgICAgc3ByaXRlLmFscGhhID0gMDtcbiAgICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuY2FuVXNlVGludHMoKSkge1xuICAgICAgICBzcHJpdGUudGludCA9IDB4MzI0YmZmO1xuICAgICAgfVxuXG4gICAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgICAgIGFscGhhOiAwLjUsXG4gICAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuXG4gICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0d2Vlbi5zdGFydCgpO1xuICB9XG5cbiAgcGxheUJ1cm5JbkxhdmFBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBzcHJpdGUsXG4gICAgICAgIHR3ZWVuO1xuXG4gICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwianVtcFVwXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gICAgdGhpcy5jcmVhdGVCbG9jayh0aGlzLmZsdWZmUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgXCJmaXJlXCIpO1xuXG4gICAgc3ByaXRlID0gdGhpcy5mbHVmZlBsYW5lLmNyZWF0ZSgwLCAwLCBcImZpbmlzaE92ZXJsYXlcIik7XG4gICAgdmFyIFtzY2FsZVgsIHNjYWxlWV0gPSB0aGlzLmNvbnRyb2xsZXIuc2NhbGVGcm9tT3JpZ2luYWwoKTtcbiAgICBzcHJpdGUuc2NhbGUueCA9IHNjYWxlWDtcbiAgICBzcHJpdGUuc2NhbGUueSA9IHNjYWxlWTtcbiAgICBzcHJpdGUuYWxwaGEgPSAwO1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuY2FuVXNlVGludHMoKSkge1xuICAgICAgc3ByaXRlLnRpbnQgPSAweGQxNTgwZDtcbiAgICB9XG5cbiAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgYWxwaGE6IDAuNSxcbiAgICB9LCAyMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuXG4gICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcblxuICAgIHR3ZWVuLnN0YXJ0KCk7XG4gIH1cblxuICBwbGF5RGVzdHJveVRudEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIHRudEFycmF5ICwgbmV3U2hhZGluZ1BsYW5lRGF0YSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgYmxvY2ssXG4gICAgICAgIGxhc3RBbmltYXRpb247XG4gICAgaWYgKHRudEFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJmdXNlXCIpO1xuICAgIGZvcih2YXIgdG50IGluIHRudEFycmF5KSB7XG4gICAgICAgIGJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1t0aGlzLmNvb3JkaW5hdGVzVG9JbmRleCh0bnRBcnJheVt0bnRdKV07XG4gICAgICAgIGxhc3RBbmltYXRpb24gPSB0aGlzLnBsYXlTY2FsZWRTcGVlZChibG9jay5hbmltYXRpb25zLCBcImV4cGxvZGVcIik7XG4gICAgfVxuXG4gICAgdGhpcy5vbkFuaW1hdGlvbkVuZChsYXN0QW5pbWF0aW9uLCAoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJleHBsb2RlXCIpO1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgcGxheUNyZWVwZXJFeHBsb2RlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMuY29udHJvbGxlci5kZWxheUJ5KDE4MCwgKCkgPT4ge1xuICAgICAgLy90aGlzLm9uQW5pbWF0aW9uTG9vcE9uY2UoXG4gICAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJidW1wXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgIC8vYWRkIGNyZWVwZXIgd2luZHVwIHNvdW5kXG4gICAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImZ1c2VcIik7XG4gICAgICAgIHRoaXMucGxheUV4cGxvZGluZ0NyZWVwZXJBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCB0aGlzKTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSgyMDAsICgpPT57XG4gICAgICAgICAgdGhpcy5vbkFuaW1hdGlvbkxvb3BPbmNlKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImp1bXBVcFwiLCBwb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSksICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheUlkbGVBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlFeHBsb2RpbmdDcmVlcGVyQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcblxuICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSkgKyBkZXN0cm95UG9zaXRpb25bMF07XG4gICAgbGV0IGJsb2NrVG9FeHBsb2RlID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XTtcblxuICAgIHZhciBjcmVlcGVyRXhwbG9kZUFuaW1hdGlvbiA9IGJsb2NrVG9FeHBsb2RlLmFuaW1hdGlvbnMuZ2V0QW5pbWF0aW9uKFwiZXhwbG9kZVwiKTtcbiAgICBjcmVlcGVyRXhwbG9kZUFuaW1hdGlvbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB2YXIgYm9yZGVyaW5nUG9zaXRpb25zO1xuICAgICAgYmxvY2tUb0V4cGxvZGUua2lsbCgpO1xuICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuY29udHJvbGxlci5kZWxheUJ5KDEwMCwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGxheUZhaWx1cmVBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgZmFsc2UsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJleHBsb2RlXCIpO1xuICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQ2xvdWRBbmltYXRpb24oZGVzdHJveVBvc2l0aW9uKTtcbiAgICB9KTtcblxuICAgIGNyZWVwZXJFeHBsb2RlQW5pbWF0aW9uLnBsYXkoKTtcbiAgfVxuXG4gIHBsYXlFeHBsb3Npb25DbG91ZEFuaW1hdGlvbihwb3NpdGlvbil7XG4gICAgdGhpcy5jcmVhdGVCbG9jayh0aGlzLmZsdWZmUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgXCJleHBsb3Npb25cIik7XG4gIH1cblxuXG4gIGNvb3JkaW5hdGVzVG9JbmRleChjb29yZGluYXRlcykge1xuICAgIHJldHVybiAodGhpcy55VG9JbmRleChjb29yZGluYXRlc1sxXSkpICsgY29vcmRpbmF0ZXNbMF07XG4gIH1cblxuICBwbGF5TWluZWNhcnRUdXJuQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIHR1cm5EaXJlY3Rpb24pIHtcbiAgICB2YXIgYW5pbWF0aW9uID0gdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwibWluZUNhcnRfdHVyblwiICsgdHVybkRpcmVjdGlvbiwgcG9zaXRpb24sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCBmYWxzZSk7XG4gICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgfVxuXG4gIHBsYXlNaW5lY2FydE1vdmVGb3J3YXJkQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG5leHRQb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgYW5pbWF0aW9uLFxuICAgICAgICB0d2VlbjtcblxuICAgIC8vaWYgd2UgbG9vcCB0aGUgc2Z4IHRoYXQgbWlnaHQgYmUgYmV0dGVyP1xuICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcIm1pbmVjYXJ0XCIpO1xuICAgIHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcIm1pbmVDYXJ0XCIscG9zaXRpb24sIGZhY2luZywgZmFsc2UpO1xuICAgIHR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5wbGF5ZXJTcHJpdGUpLnRvKHtcbiAgICAgIHg6ICgtMTggKyA0MCAqIG5leHRQb3NpdGlvblswXSksXG4gICAgICB5OiAoLTMyICsgNDAgKiBuZXh0UG9zaXRpb25bMV0pLFxuICAgIH0sIHNwZWVkLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcbiAgICB0d2Vlbi5zdGFydCgpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgobmV4dFBvc2l0aW9uWzFdKSArIDU7XG5cbiAgICByZXR1cm4gdHdlZW47XG4gIH1cblxuXG4gIGFjdGl2YXRlVW5wb3dlcmVkUmFpbHModW5wb3dlcmVkUmFpbHMpIHtcbiAgICBmb3IodmFyIHJhaWxJbmRleCA9IDA7IHJhaWxJbmRleCA8IHVucG93ZXJlZFJhaWxzLmxlbmd0aDsgcmFpbEluZGV4ICs9IDIpIHtcbiAgICAgIHZhciByYWlsID0gdW5wb3dlcmVkUmFpbHNbcmFpbEluZGV4ICsgMV07XG4gICAgICB2YXIgcG9zaXRpb24gPSB1bnBvd2VyZWRSYWlsc1tyYWlsSW5kZXhdO1xuICAgICAgdGhpcy5jcmVhdGVBY3Rpb25QbGFuZUJsb2NrKHBvc2l0aW9uLCByYWlsKTtcbiAgICB9XG4gIH1cblxuXG5cbiAgcGxheU1pbmVjYXJ0QW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG1pbmVjYXJ0VHJhY2ssIHVucG93ZXJlZFJhaWxzKVxuICB7XG4gICAgdmFyIGFuaW1hdGlvbjtcbiAgICB0aGlzLnRyYWNrID0gbWluZWNhcnRUcmFjaztcbiAgICB0aGlzLmkgPSAwO1xuXG4gICAgLy9zdGFydCBhdCAzLDJcbiAgICB0aGlzLnNldFBsYXllclBvc2l0aW9uKDMsMiwgaXNPbkJsb2NrKTtcbiAgICBwb3NpdGlvbiA9IFszLDJdO1xuXG4gICAgYW5pbWF0aW9uID0gdGhpcy5wbGF5TGV2ZWxFbmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgZmFsc2UpO1xuXG4gICAgYW5pbWF0aW9uLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGVVbnBvd2VyZWRSYWlscyh1bnBvd2VyZWRSYWlscyk7XG4gICAgICB0aGlzLnBsYXlUcmFjayhwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBtaW5lY2FydFRyYWNrKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlUcmFjayhwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBtaW5lY2FydFRyYWNrKVxuICB7XG4gICAgaWYodGhpcy5pIDwgdGhpcy50cmFjay5sZW5ndGgpIHtcbiAgICAgIHZhciBkaXJlY3Rpb24sXG4gICAgICAgICAgYXJyYXlkaXJlY3Rpb24gPSB0aGlzLnRyYWNrW3RoaXMuaV1bMF0sXG4gICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy50cmFja1t0aGlzLmldWzFdLFxuICAgICAgICAgIHNwZWVkID0gdGhpcy50cmFja1t0aGlzLmldWzNdO1xuICAgICAgZmFjaW5nID0gdGhpcy50cmFja1t0aGlzLmldWzJdO1xuXG4gICAgICAvL3R1cm5cbiAgICAgIGlmKGFycmF5ZGlyZWN0aW9uLnN1YnN0cmluZygwLDQpID09PSBcInR1cm5cIikge1xuICAgICAgICBkaXJlY3Rpb24gPSBhcnJheWRpcmVjdGlvbi5zdWJzdHJpbmcoNSk7XG4gICAgICAgIHRoaXMucGxheU1pbmVjYXJ0VHVybkFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBkaXJlY3Rpb24pLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlNaW5lY2FydE1vdmVGb3J3YXJkQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG5leHRQb3NpdGlvbiwgc3BlZWQpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgICAgICAgICAgdGhpcy5wbGF5VHJhY2socG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbWluZWNhcnRUcmFjayk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucGxheU1pbmVjYXJ0TW92ZUZvcndhcmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbmV4dFBvc2l0aW9uLCBzcGVlZCkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGxheVRyYWNrKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG1pbmVjYXJ0VHJhY2spO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaSsrO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgdGhpcy5wbGF5U3VjY2Vzc0FuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGZ1bmN0aW9uKCl7fSk7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIGFkZEhvdXNlQmVkKGJvdHRvbUNvb3JkaW5hdGVzKSB7XG4gICAgLy9UZW1wb3JhcnksIHdpbGwgYmUgcmVwbGFjZWQgYnkgYmVkIGJsb2Nrc1xuICAgIHZhciBiZWRUb3BDb29yZGluYXRlID0gKGJvdHRvbUNvb3JkaW5hdGVzWzFdIC0gMSk7XG4gICAgdmFyIHNwcml0ZSA9IHRoaXMuYWN0aW9uUGxhbmUuY3JlYXRlKDM4ICogYm90dG9tQ29vcmRpbmF0ZXNbMF0sIDM1ICogYmVkVG9wQ29vcmRpbmF0ZSwgXCJiZWRcIik7XG4gICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoYm90dG9tQ29vcmRpbmF0ZXNbMV0pO1xuICB9XG5cbiAgYWRkRG9vcihjb29yZGluYXRlcykge1xuICAgIHZhciBzcHJpdGU7XG4gICAgbGV0IHRvRGVzdHJveSA9IHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoY29vcmRpbmF0ZXMpXTtcbiAgICB0aGlzLmNyZWF0ZUFjdGlvblBsYW5lQmxvY2soY29vcmRpbmF0ZXMsIFwiZG9vclwiKTtcbiAgICAvL05lZWQgdG8gZ3JhYiB0aGUgY29ycmVjdCBibG9ja3R5cGUgZnJvbSB0aGUgYWN0aW9uIGxheWVyXG4gICAgLy9BbmQgdXNlIHRoYXQgdHlwZSBibG9jayB0byBjcmVhdGUgdGhlIGdyb3VuZCBibG9jayB1bmRlciB0aGUgZG9vclxuICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgY29vcmRpbmF0ZXNbMF0sIGNvb3JkaW5hdGVzWzFdLCBcIndvb2xfb3JhbmdlXCIpO1xuICAgIHRvRGVzdHJveS5raWxsKCk7XG4gICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoNik7XG4gIH1cblxuICBwbGF5U3VjY2Vzc0hvdXNlQnVpbHRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjcmVhdGVGbG9vciwgaG91c2VPYmplY3RQb3NpdGlvbnMsIGNvbXBsZXRpb25IYW5kbGVyLCB1cGRhdGVTY3JlZW4pIHtcbiAgICAvL2ZhZGUgc2NyZWVuIHRvIHdoaXRlXG4gICAgLy9BZGQgaG91c2UgYmxvY2tzXG4gICAgLy9mYWRlIG91dCBvZiB3aGl0ZVxuICAgIC8vUGxheSBzdWNjZXNzIGFuaW1hdGlvbiBvbiBwbGF5ZXIuXG4gICAgdmFyIHR3ZWVuVG9XLFxuICAgICAgICB0d2VlbldUb0M7XG5cbiAgICB0d2VlblRvVyA9IHRoaXMucGxheUxldmVsRW5kQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgKCkgPT4ge1xuICAgICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoNDAwMCwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgIH0sIHRydWUpO1xuICAgIHR3ZWVuVG9XLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImhvdXNlU3VjY2Vzc1wiKTtcbiAgICAgIC8vQ2hhbmdlIGhvdXNlIGdyb3VuZCB0byBmbG9vclxuICAgICAgdmFyIHhDb29yZDtcbiAgICAgIHZhciB5Q29vcmQ7XG4gICAgICB2YXIgc3ByaXRlO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY3JlYXRlRmxvb3IubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgeENvb3JkID0gY3JlYXRlRmxvb3JbaV1bMV07XG4gICAgICAgIHlDb29yZCA9IGNyZWF0ZUZsb29yW2ldWzJdO1xuICAgICAgICAvKnRoaXMuZ3JvdW5kUGxhbmVbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoW3hDb29yZCx5Q29vcmRdKV0ua2lsbCgpOyovXG4gICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgeENvb3JkLCB5Q29vcmQsIFwid29vbF9vcmFuZ2VcIik7XG4gICAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHlDb29yZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWRkSG91c2VCZWQoaG91c2VPYmplY3RQb3NpdGlvbnNbMF0pO1xuICAgICAgdGhpcy5hZGREb29yKGhvdXNlT2JqZWN0UG9zaXRpb25zWzFdKTtcbiAgICAgIHRoaXMuZ3JvdW5kUGxhbmUuc29ydCgnc29ydE9yZGVyJyk7XG4gICAgICB1cGRhdGVTY3JlZW4oKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vVHdlZW5zIGluIGFuZCB0aGVuIG91dCBvZiB3aGl0ZS4gcmV0dXJucyB0aGUgdHdlZW4gdG8gd2hpdGUgZm9yIGFkZGluZyBjYWxsYmFja3NcbiAgcGxheUxldmVsRW5kQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIHBsYXlTdWNjZXNzQW5pbWF0aW9uKSB7XG4gICAgdmFyIHNwcml0ZSxcbiAgICAgICAgdHdlZW5Ub1csXG4gICAgICAgIHR3ZWVuV1RvQztcblxuICAgIHNwcml0ZSA9IHRoaXMuZmx1ZmZQbGFuZS5jcmVhdGUoMCwgMCwgXCJmaW5pc2hPdmVybGF5XCIpO1xuICAgIHZhciBbc2NhbGVYLCBzY2FsZVldID0gdGhpcy5jb250cm9sbGVyLnNjYWxlRnJvbU9yaWdpbmFsKCk7XG4gICAgc3ByaXRlLnNjYWxlLnggPSBzY2FsZVg7XG4gICAgc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVk7XG4gICAgc3ByaXRlLmFscGhhID0gMDtcblxuICAgIHR3ZWVuVG9XID0gdGhpcy50d2VlblRvV2hpdGUoc3ByaXRlKTtcbiAgICB0d2VlbldUb0MgPSB0aGlzLnR3ZWVuRnJvbVdoaXRlVG9DbGVhcihzcHJpdGUpO1xuXG4gICAgdHdlZW5Ub1cub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5zZXRQbGF5ZXJQb3NpdGlvbihwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIGlzT25CbG9jayk7XG4gICAgICB0d2VlbldUb0Muc3RhcnQoKTtcbiAgICB9KTtcbiAgICBpZihwbGF5U3VjY2Vzc0FuaW1hdGlvbilcbiAgICB7XG4gICAgICB0d2VlbldUb0Mub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICB0aGlzLnBsYXlTdWNjZXNzQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHR3ZWVuVG9XLnN0YXJ0KCk7XG5cbiAgICByZXR1cm4gdHdlZW5Ub1c7XG4gIH1cbiAgdHdlZW5Gcm9tV2hpdGVUb0NsZWFyKHNwcml0ZSkge1xuICAgIHZhciB0d2VlbldoaXRlVG9DbGVhcjtcblxuICAgIHR3ZWVuV2hpdGVUb0NsZWFyID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4oc3ByaXRlKS50byh7XG4gICAgICBhbHBoYTogMC4wLFxuICAgIH0sIDcwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG4gICAgcmV0dXJuIHR3ZWVuV2hpdGVUb0NsZWFyO1xuICB9XG5cbiAgdHdlZW5Ub1doaXRlKHNwcml0ZSl7XG4gICAgdmFyIHR3ZWVuVG9XaGl0ZTtcblxuICAgIHR3ZWVuVG9XaGl0ZSA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgYWxwaGE6IDEuMCxcbiAgICB9LCAzMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuICAgIHJldHVybiB0d2VlblRvV2hpdGU7XG4gIH1cblxuICBwbGF5QmxvY2tTb3VuZChncm91bmRUeXBlKSB7XG4gICAgdmFyIG9yZVN0cmluZyA9IGdyb3VuZFR5cGUuc3Vic3RyaW5nKDAsIDMpO1xuICAgIGlmKGdyb3VuZFR5cGUgPT09IFwic3RvbmVcIiB8fCBncm91bmRUeXBlID09PSBcImNvYmJsZXN0b25lXCIgfHwgZ3JvdW5kVHlwZSA9PT0gXCJiZWRyb2NrXCIgfHxcbiAgICAgICAgb3JlU3RyaW5nID09PSBcIm9yZVwiIHx8IGdyb3VuZFR5cGUgPT09IFwiYnJpY2tzXCIpIHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN0ZXBTdG9uZVwiKTtcbiAgICB9XG4gICAgZWxzZSBpZihncm91bmRUeXBlID09PSBcImdyYXNzXCIgfHwgZ3JvdW5kVHlwZSA9PT0gXCJkaXJ0XCIgfHwgZ3JvdW5kVHlwZSA9PT0gXCJkaXJ0Q29hcnNlXCIgfHxcbiAgICAgICAgZ3JvdW5kVHlwZSA9PSBcIndvb2xfb3JhbmdlXCIgfHwgZ3JvdW5kVHlwZSA9PSBcIndvb2xcIikge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwic3RlcEdyYXNzXCIpO1xuICAgIH1cbiAgICBlbHNlIGlmKGdyb3VuZFR5cGUgPT09IFwiZ3JhdmVsXCIpIHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN0ZXBHcmF2ZWxcIik7XG4gICAgfVxuICAgIGVsc2UgaWYoZ3JvdW5kVHlwZSA9PT0gXCJmYXJtbGFuZFdldFwiKSB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdGVwRmFybWxhbmRcIik7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdGVwV29vZFwiKTtcbiAgICB9XG4gIH1cblxuICBwbGF5TW92ZUZvcndhcmRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgc2hvdWxkSnVtcERvd24sIGlzT25CbG9jaywgZ3JvdW5kVHlwZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgdHdlZW4sXG4gICAgICAgIG9sZFBvc2l0aW9uLFxuICAgICAgICBuZXdQb3NWZWMsXG4gICAgICAgIGFuaW1OYW1lLFxuICAgICAgICB5T2Zmc2V0ID0gLTMyO1xuXG4gICAgLy9zdGVwcGluZyBvbiBzdG9uZSBzZnhcbiAgICB0aGlzLnBsYXlCbG9ja1NvdW5kKGdyb3VuZFR5cGUpO1xuXG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuXG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuICAgIC8vbWFrZSBzdXJlIHRvIHJlbmRlciBoaWdoIGZvciB3aGVuIG1vdmluZyB1cCBhZnRlciBwbGFjaW5nIGEgYmxvY2tcbiAgICB2YXIgek9yZGVyWUluZGV4ID0gcG9zaXRpb25bMV0gKyAoZmFjaW5nID09PSBGYWNpbmdEaXJlY3Rpb24uVXAgPyAxIDogMCk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleCh6T3JkZXJZSW5kZXgpICsgNTtcbiAgICBvbGRQb3NpdGlvbiA9IFtNYXRoLnRydW5jKCh0aGlzLnBsYXllclNwcml0ZS5wb3NpdGlvbi54ICsgMTgpLyA0MCksIE1hdGguY2VpbCgodGhpcy5wbGF5ZXJTcHJpdGUucG9zaXRpb24ueSsgMzIpIC8gNDApXTtcbiAgICBuZXdQb3NWZWMgPSBbcG9zaXRpb25bMF0gLSBvbGRQb3NpdGlvblswXSwgcG9zaXRpb25bMV0gLSBvbGRQb3NpdGlvblsxXV07XG5cbiAgICAvL2NoYW5nZSBvZmZzZXQgZm9yIG1vdmluZyBvbiB0b3Agb2YgYmxvY2tzXG4gICAgaWYoaXNPbkJsb2NrKSB7XG4gICAgICB5T2Zmc2V0IC09IDIyO1xuICAgIH1cblxuICAgIGlmICghc2hvdWxkSnVtcERvd24pIHtcbiAgICAgIGFuaW1OYW1lID0gXCJ3YWxrXCIgKyBkaXJlY3Rpb247XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltTmFtZSk7XG4gICAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMucGxheWVyU3ByaXRlKS50byh7XG4gICAgICAgIHg6ICgtMTggKyA0MCAqIHBvc2l0aW9uWzBdKSxcbiAgICAgICAgeTogKHlPZmZzZXQgKyA0MCAqIHBvc2l0aW9uWzFdKVxuICAgICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5pbU5hbWUgPSBcImp1bXBEb3duXCIgKyBkaXJlY3Rpb247XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltTmFtZSk7XG4gICAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMucGxheWVyU3ByaXRlKS50byh7XG4gICAgICAgIHg6IFstMTggKyA0MCAqIG9sZFBvc2l0aW9uWzBdLCAtMTggKyA0MCAqIChvbGRQb3NpdGlvblswXSArIG5ld1Bvc1ZlY1swXSksIC0xOCArIDQwICogcG9zaXRpb25bMF1dLFxuICAgICAgICB5OiBbLTMyICsgNDAgKiBvbGRQb3NpdGlvblsxXSwgLTMyICsgNDAgKiAob2xkUG9zaXRpb25bMV0gKyBuZXdQb3NWZWNbMV0pIC0gNTAsIC0zMiArIDQwICogcG9zaXRpb25bMV1dXG4gICAgICB9LCAzMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpLmludGVycG9sYXRpb24oKHYsaykgPT4ge1xuICAgICAgICByZXR1cm4gUGhhc2VyLk1hdGguYmV6aWVySW50ZXJwb2xhdGlvbih2LGspO1xuICAgICAgfSk7XG5cbiAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZmFsbFwiKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG5cbiAgICB0d2Vlbi5zdGFydCgpO1xuXG4gICAgcmV0dXJuIHR3ZWVuO1xuICB9XG5cbiAgcGxheVBsYXllckp1bXBEb3duVmVydGljYWxBbmltYXRpb24ocG9zaXRpb24sIGRpcmVjdGlvbikge1xuICAgIHZhciBhbmltTmFtZSA9IFwianVtcERvd25cIiArIHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShkaXJlY3Rpb24pO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1OYW1lKTtcbiAgICB2YXIgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2Vlbih0aGlzLnBsYXllclNwcml0ZSkudG8oe1xuICAgICAgeDogWy0xOCArIDQwICogcG9zaXRpb25bMF0sIC0xOCArIDQwICogcG9zaXRpb25bMF0sIC0xOCArIDQwICogcG9zaXRpb25bMF1dLFxuICAgICAgeTogWy0zMiArIDQwICogcG9zaXRpb25bMV0sIC0zMiArIDQwICogcG9zaXRpb25bMV0gLSA1MCwgLTMyICsgNDAgKiBwb3NpdGlvblsxXV1cbiAgICB9LCAzMDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpLmludGVycG9sYXRpb24oKHYsaykgPT4ge1xuICAgICAgcmV0dXJuIFBoYXNlci5NYXRoLmJlemllckludGVycG9sYXRpb24odixrKTtcbiAgICB9KTtcbiAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZE9uY2UoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZmFsbFwiKTtcbiAgICB9KTtcbiAgICB0d2Vlbi5zdGFydCgpO1xuICB9XG5cbiAgcGxheVBsYWNlQmxvY2tBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgYmxvY2tUeXBlLCBibG9ja1R5cGVBdFBvc2l0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBqdW1wQW5pbU5hbWU7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIHBvc2l0aW9uWzBdO1xuXG4gICAgaWYgKGJsb2NrVHlwZSA9PT0gXCJjcm9wV2hlYXRcIiB8fCBibG9ja1R5cGUgPT09IFwidG9yY2hcIiB8fCBibG9ja1R5cGUuc3Vic3RyaW5nKDAsIDUpID09PSBcInJhaWxzXCIpIHtcbiAgICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcblxuICAgICAgdmFyIHNpZ25hbERldGFjaGVyID0gdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwicHVuY2hcIiwgcG9zaXRpb24sIGZhY2luZywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgdmFyIHNwcml0ZTtcbiAgICAgICAgc2lnbmFsRGV0YWNoZXIuZGV0YWNoKCk7XG4gICAgICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pKSArIHBvc2l0aW9uWzBdO1xuICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgYmxvY2tUeXBlKTtcblxuICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XSA9IHNwcml0ZTtcbiAgICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJwbGFjZUJsb2NrXCIpO1xuXG4gICAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG5cbiAgICAgIGp1bXBBbmltTmFtZSA9IFwianVtcFVwXCIgKyBkaXJlY3Rpb247XG5cbiAgICAgIGlmKGJsb2NrVHlwZUF0UG9zaXRpb24gIT09IFwiXCIpIHtcbiAgICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIHBvc2l0aW9uLCBibG9ja1R5cGVBdFBvc2l0aW9uLCAoKCk9Pnt9KSwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBqdW1wQW5pbU5hbWUpO1xuICAgICAgdmFyIHBsYWNlbWVudFR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5wbGF5ZXJTcHJpdGUpLnRvKHtcbiAgICAgICAgeTogKC01NSArIDQwICogcG9zaXRpb25bMV0pXG4gICAgICB9LCAxMjUsIFBoYXNlci5FYXNpbmcuQ3ViaWMuRWFzZU91dCk7XG5cbiAgICAgIHBsYWNlbWVudFR3ZWVuLm9uQ29tcGxldGUuYWRkT25jZSgoKSA9PiB7XG4gICAgICAgIHBsYWNlbWVudFR3ZWVuID0gbnVsbDtcblxuICAgICAgICBpZiAoYmxvY2tUeXBlQXRQb3NpdGlvbiAhPT0gXCJcIikge1xuICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF0ua2lsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgYmxvY2tUeXBlKTtcblxuICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XSA9IHNwcml0ZTtcbiAgICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgICAgcGxhY2VtZW50VHdlZW4uc3RhcnQoKTtcbiAgICB9XG4gIH1cblxuICBwbGF5UGxhY2VCbG9ja0luRnJvbnRBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgYmxvY2tQb3NpdGlvbiwgcGxhbmUsIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKGJsb2NrUG9zaXRpb25bMF0sIGJsb2NrUG9zaXRpb25bMV0pO1xuXG4gICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwicHVuY2hcIiwgcGxheWVyUG9zaXRpb24sIGZhY2luZywgZmFsc2UpLm9uQ29tcGxldGUuYWRkT25jZSgoKSA9PiB7XG4gICAgICBpZiAocGxhbmUgPT09IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLmFjdGlvblBsYW5lKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQWN0aW9uUGxhbmVCbG9jayhibG9ja1Bvc2l0aW9uLCBibG9ja1R5cGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmUtbGF5IGdyb3VuZCB0aWxlcyBiYXNlZCBvbiBtb2RlbFxuICAgICAgICB0aGlzLnJlZnJlc2hHcm91bmRQbGFuZSgpO1xuICAgICAgfVxuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNyZWF0ZUFjdGlvblBsYW5lQmxvY2socG9zaXRpb24sIGJsb2NrVHlwZSkge1xuICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pKSArIHBvc2l0aW9uWzBdO1xuICAgIHZhciBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgYmxvY2tUeXBlKTtcblxuICAgIGlmIChzcHJpdGUpIHtcbiAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKTtcbiAgICB9XG5cbiAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdID0gc3ByaXRlO1xuICB9XG5cbiAgcGxheVNoZWFyQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgZGVzdHJveVBvc2l0aW9uWzBdO1xuICAgIGxldCBibG9ja1RvU2hlYXIgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdO1xuXG4gICAgYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMuc3RvcChudWxsLCB0cnVlKTtcbiAgICB0aGlzLm9uQW5pbWF0aW9uTG9vcE9uY2UodGhpcy5wbGF5U2NhbGVkU3BlZWQoYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMsIFwidXNlZFwiKSwgKCkgPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMsIFwiZmFjZVwiKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxheUV4cGxvc2lvbkFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIsIHRydWUpO1xuICB9XG5cbiAgcGxheVNoZWFyU2hlZXBBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24oZGVzdHJveVBvc2l0aW9uWzBdLCBkZXN0cm95UG9zaXRpb25bMV0pO1xuXG4gICAgdGhpcy5vbkFuaW1hdGlvbkVuZCh0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJwdW5jaFwiLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSksICgpID0+IHtcbiAgICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSkgKyBkZXN0cm95UG9zaXRpb25bMF07XG4gICAgICBsZXQgYmxvY2tUb1NoZWFyID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XTtcblxuICAgICAgYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMuc3RvcChudWxsLCB0cnVlKTtcbiAgICAgIHRoaXMub25BbmltYXRpb25Mb29wT25jZSh0aGlzLnBsYXlTY2FsZWRTcGVlZChibG9ja1RvU2hlYXIuYW5pbWF0aW9ucywgXCJ1c2VkXCIpLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKGJsb2NrVG9TaGVhci5hbmltYXRpb25zLCBcImZhY2VcIik7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlciwgdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5RGVzdHJveUJsb2NrQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBuZXdTaGFkaW5nUGxhbmVEYXRhLCBuZXdGb3dQbGFuZURhdGEsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihkZXN0cm95UG9zaXRpb25bMF0sIGRlc3Ryb3lQb3NpdGlvblsxXSk7XG5cbiAgICB2YXIgcGxheWVyQW5pbWF0aW9uID1cbiAgICAgICAgYmxvY2tUeXBlLm1hdGNoKC8ob3JlfHN0b25lfGNsYXl8YnJpY2tzfGJlZHJvY2spLykgPyBcIm1pbmVcIiA6IFwicHVuY2hEZXN0cm95XCI7XG4gICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKHBsYXllckFuaW1hdGlvbiwgcGxheWVyUG9zaXRpb24sIGZhY2luZywgZmFsc2UpO1xuICAgIHRoaXMucGxheU1pbmluZ1BhcnRpY2xlc0FuaW1hdGlvbihmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbik7XG4gICAgdGhpcy5wbGF5QmxvY2tEZXN0cm95T3ZlcmxheUFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgbmV3U2hhZGluZ1BsYW5lRGF0YSwgbmV3Rm93UGxhbmVEYXRhLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gIH1cblxuXG4gIHBsYXlQdW5jaERlc3Ryb3lBaXJBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMucGxheVB1bmNoQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgXCJwdW5jaERlc3Ryb3lcIiwgY29tcGxldGlvbkhhbmRsZXIpO1xuICB9XG5cbiAgcGxheVB1bmNoQWlyQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLnBsYXlQdW5jaEFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIFwicHVuY2hcIiwgY29tcGxldGlvbkhhbmRsZXIpO1xuICB9XG5cbiAgcGxheVB1bmNoQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYW5pbWF0aW9uVHlwZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKGRlc3Ryb3lQb3NpdGlvblswXSwgZGVzdHJveVBvc2l0aW9uWzFdKTtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihhbmltYXRpb25UeXBlLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSksICgpID0+IHtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5QmxvY2tEZXN0cm95T3ZlcmxheUFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgbmV3U2hhZGluZ1BsYW5lRGF0YSwgbmV3Rm93UGxhbmVEYXRhLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSkgKyBkZXN0cm95UG9zaXRpb25bMF07XG4gICAgbGV0IGJsb2NrVG9EZXN0cm95ID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XTtcbiAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG5cbiAgICBsZXQgZGVzdHJveU92ZXJsYXkgPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZSgtMTIgKyA0MCAqIGRlc3Ryb3lQb3NpdGlvblswXSwgLTIyICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMV0sIFwiZGVzdHJveU92ZXJsYXlcIiwgXCJkZXN0cm95MVwiKTtcbiAgICBkZXN0cm95T3ZlcmxheS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyAyO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQoZGVzdHJveU92ZXJsYXkuYW5pbWF0aW9ucy5hZGQoXCJkZXN0cm95XCIsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiZGVzdHJveVwiLCAxLCAxMiwgXCJcIiwgMCksIDMwLCBmYWxzZSksICgpID0+XG4gICAge1xuICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XSA9IG51bGw7XG5cbiAgICAgIGlmIChibG9ja1RvRGVzdHJveS5oYXNPd25Qcm9wZXJ0eShcIm9uQmxvY2tEZXN0cm95XCIpKSB7XG4gICAgICAgIGJsb2NrVG9EZXN0cm95Lm9uQmxvY2tEZXN0cm95KGJsb2NrVG9EZXN0cm95KTtcbiAgICAgIH1cblxuICAgICAgYmxvY2tUb0Rlc3Ryb3kua2lsbCgpO1xuICAgICAgZGVzdHJveU92ZXJsYXkua2lsbCgpO1xuICAgICAgdGhpcy50b0Rlc3Ryb3kucHVzaChibG9ja1RvRGVzdHJveSk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGRlc3Ryb3lPdmVybGF5KTtcbiAgICAgIHRoaXMudXBkYXRlU2hhZGluZ1BsYW5lKG5ld1NoYWRpbmdQbGFuZURhdGEpO1xuICAgICAgdGhpcy51cGRhdGVGb3dQbGFuZShuZXdGb3dQbGFuZURhdGEpO1xuXG4gICAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHBsYXllclBvc2l0aW9uWzBdLCBwbGF5ZXJQb3NpdGlvblsxXSk7XG5cbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheSgnZGlnX3dvb2QxJyk7XG4gICAgICB0aGlzLnBsYXlFeHBsb3Npb25BbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKGRlc3Ryb3lPdmVybGF5LmFuaW1hdGlvbnMsIFwiZGVzdHJveVwiKTtcbiAgfVxuXG4gIHBsYXlNaW5pbmdQYXJ0aWNsZXNBbmltYXRpb24oZmFjaW5nLCBkZXN0cm95UG9zaXRpb24pIHtcbiAgICBsZXQgbWluaW5nUGFydGljbGVzRGF0YSA9IFtcbiAgICAgIFsyNCwgLTEwMCwgLTgwXSwgICAvLyBsZWZ0XG4gICAgICBbMTIsIC0xMjAsIC04MF0sICAgLy8gYm90dG9tXG4gICAgICBbMCwgLTYwLCAtODBdLCAgIC8vIHJpZ2h0XG4gICAgICBbMzYsIC04MCwgLTYwXSwgICAvLyB0b3BcbiAgICBdO1xuXG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXNJbmRleCA9IChkaXJlY3Rpb24gPT09IFwiX2xlZnRcIiA/IDAgOiBkaXJlY3Rpb24gPT09IFwiX2JvdHRvbVwiID8gMSA6IGRpcmVjdGlvbiA9PT0gXCJfcmlnaHRcIiA/IDIgOiAzKTtcbiAgICBsZXQgbWluaW5nUGFydGljbGVzRmlyc3RGcmFtZSA9IG1pbmluZ1BhcnRpY2xlc0RhdGFbbWluaW5nUGFydGljbGVzSW5kZXhdWzBdO1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXNPZmZzZXRYID0gbWluaW5nUGFydGljbGVzRGF0YVttaW5pbmdQYXJ0aWNsZXNJbmRleF1bMV07XG4gICAgbGV0IG1pbmluZ1BhcnRpY2xlc09mZnNldFkgPSBtaW5pbmdQYXJ0aWNsZXNEYXRhW21pbmluZ1BhcnRpY2xlc0luZGV4XVsyXTtcbiAgICBsZXQgbWluaW5nUGFydGljbGVzID0gdGhpcy5hY3Rpb25QbGFuZS5jcmVhdGUobWluaW5nUGFydGljbGVzT2Zmc2V0WCArIDQwICogZGVzdHJveVBvc2l0aW9uWzBdLCBtaW5pbmdQYXJ0aWNsZXNPZmZzZXRZICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMV0sIFwibWluaW5nUGFydGljbGVzXCIsIFwiTWluaW5nUGFydGljbGVzXCIgKyBtaW5pbmdQYXJ0aWNsZXNGaXJzdEZyYW1lKTtcbiAgICBtaW5pbmdQYXJ0aWNsZXMuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgMjtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKG1pbmluZ1BhcnRpY2xlcy5hbmltYXRpb25zLmFkZChcIm1pbmluZ1BhcnRpY2xlc1wiLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmluZ1BhcnRpY2xlc1wiLCBtaW5pbmdQYXJ0aWNsZXNGaXJzdEZyYW1lLCBtaW5pbmdQYXJ0aWNsZXNGaXJzdEZyYW1lICsgMTEsIFwiXCIsIDApLCAzMCwgZmFsc2UpLCAoKSA9PiB7XG4gICAgICBtaW5pbmdQYXJ0aWNsZXMua2lsbCgpO1xuICAgICAgdGhpcy50b0Rlc3Ryb3kucHVzaChtaW5pbmdQYXJ0aWNsZXMpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKG1pbmluZ1BhcnRpY2xlcy5hbmltYXRpb25zLCBcIm1pbmluZ1BhcnRpY2xlc1wiKTtcbiAgfVxuXG4gIHBsYXlFeHBsb3Npb25BbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyLCBwbGFjZUJsb2NrKSB7XG4gICAgdmFyIHNpZ25hbEJpbmRpbmcsXG4gICAgICAgIGV4cGxvZGVBbmltID0gdGhpcy5hY3Rpb25QbGFuZS5jcmVhdGUoLTM2ICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMF0sIC0zMCArIDQwICogZGVzdHJveVBvc2l0aW9uWzFdLCBcImJsb2NrRXhwbG9kZVwiLCBcIkJsb2NrQnJlYWtQYXJ0aWNsZTBcIik7XG5cbiAgICAvL2V4cGxvZGVBbmltLnRpbnQgPSAweDMyNGJmZjtcbiAgICBpZiAodGhpcy5jb250cm9sbGVyLmNhblVzZVRpbnRzKCkpIHtcbiAgICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJ0cmVlQWNhY2lhXCI6XG4gICAgICAgIGNhc2UgXCJsb2dBY2FjaWFcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg2YzY1NWE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgICAgY2FzZSBcImxvZ0JpcmNoXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4ZGFkNmNjO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwidHJlZUp1bmdsZVwiOlxuICAgICAgICBjYXNlIFwibG9nSnVuZ2xlXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4NmE0ZjMxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgICBjYXNlIFwibG9nT2FrXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4Njc1MjMxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICBjYXNlIFwibG9nU3BydWNlXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4NGIzOTIzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJwbGFua3NBY2FjaWFcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHhiYTYzMzc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJwbGFua3NCaXJjaFwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweGQ3Y2I4ZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBsYW5rc0p1bmdsZVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweGI4ODc2NDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBsYW5rc09ha1wiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweGI0OTA1YTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBsYW5rc1NwcnVjZVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweDgwNWUzNjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInN0b25lXCI6XG4gICAgICAgIGNhc2UgXCJvcmVDb2FsXCI6XG4gICAgICAgIGNhc2UgXCJvcmVEaWFtb25kXCI6XG4gICAgICAgIGNhc2UgXCJvcmVJcm9uXCI6XG4gICAgICAgIGNhc2UgXCJvcmVHb2xkXCI6XG4gICAgICAgIGNhc2UgXCJvcmVFbWVyYWxkXCI6XG4gICAgICAgIGNhc2UgXCJvcmVSZWRzdG9uZVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweEM2QzZDNjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImdyYXNzXCI6XG4gICAgICAgIGNhc2UgXCJjcm9wV2hlYXRcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg1ZDhmMjM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJkaXJ0XCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4OGE1ZTMzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXhwbG9kZUFuaW0uc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgMjtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKGV4cGxvZGVBbmltLmFuaW1hdGlvbnMuYWRkKFwiZXhwbG9kZVwiLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkJsb2NrQnJlYWtQYXJ0aWNsZVwiLCAwLCA3LCBcIlwiLCAwKSwgMzAsIGZhbHNlKSwgKCkgPT5cbiAgICB7XG4gICAgICBleHBsb2RlQW5pbS5raWxsKCk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGV4cGxvZGVBbmltKTtcblxuICAgICAgaWYocGxhY2VCbG9jaylcbiAgICAgIHtcbiAgICAgICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwiaWRsZVwiLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSk7XG4gICAgICAgIHRoaXMucGxheUl0ZW1Ecm9wQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoZXhwbG9kZUFuaW0uYW5pbWF0aW9ucywgXCJleHBsb2RlXCIpO1xuICAgIGlmKCFwbGFjZUJsb2NrKVxuICAgIHtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfVxuICB9XG5cbiAgcGxheUl0ZW1Ecm9wQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBzcHJpdGUgPSB0aGlzLmNyZWF0ZU1pbmlCbG9jayhkZXN0cm95UG9zaXRpb25bMF0sIGRlc3Ryb3lQb3NpdGlvblsxXSwgYmxvY2tUeXBlKTtcbiAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgMjtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImFuaW1hdGVcIiksICgpID0+IHtcbiAgICAgIHRoaXMucGxheUl0ZW1BY3F1aXJlQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBzcHJpdGUsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlTY2FsZWRTcGVlZChhbmltYXRpb25NYW5hZ2VyLCBuYW1lKSB7XG4gICAgdmFyIGFuaW1hdGlvbiA9IGFuaW1hdGlvbk1hbmFnZXIuZ2V0QW5pbWF0aW9uKG5hbWUpO1xuICAgIGlmICghYW5pbWF0aW9uLm9yaWdpbmFsRnBzKSB7XG4gICAgICBhbmltYXRpb24ub3JpZ2luYWxGcHMgPSAxMDAwIC8gYW5pbWF0aW9uLmRlbGF5O1xuICAgIH1cbiAgICByZXR1cm4gYW5pbWF0aW9uTWFuYWdlci5wbGF5KG5hbWUsIHRoaXMuY29udHJvbGxlci5vcmlnaW5hbEZwc1RvU2NhbGVkKGFuaW1hdGlvbi5vcmlnaW5hbEZwcykpO1xuICB9XG5cbiAgcGxheUl0ZW1BY3F1aXJlQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBzcHJpdGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHR3ZWVuO1xuXG4gICAgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2VlbihzcHJpdGUpLnRvKHtcbiAgICAgIHg6ICgtMTggKyA0MCAqIHBsYXllclBvc2l0aW9uWzBdKSxcbiAgICAgIHk6ICgtMzIgKyA0MCAqIHBsYXllclBvc2l0aW9uWzFdKVxuICAgIH0sIDIwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG5cbiAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJjb2xsZWN0ZWRCbG9ja1wiKTtcbiAgICAgIHNwcml0ZS5raWxsKCk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKHNwcml0ZSk7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuXG4gICAgdHdlZW4uc3RhcnQoKTtcbiAgfVxuXG4gIHNldFBsYXllclBvc2l0aW9uKHgsIHksIGlzT25CbG9jaykge1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnggPSAtMTggKyA0MCAqIHg7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUueSA9IC0zMiArIChpc09uQmxvY2sgPyAtMjMgOiAwKSArIDQwICogeTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHkpICsgNTtcbiAgfVxuXG4gIHNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHgsIHkpIHtcbiAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvci54ID0gLTM1ICsgMjMgKyA0MCAqIHg7XG4gICAgdGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IueSA9IC01NSArIDQzICsgNDAgKiB5O1xuICB9XG5cbiAgY3JlYXRlUGxhbmVzKCkge1xuICAgIHRoaXMuZ3JvdW5kUGxhbmUgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5ncm91bmRQbGFuZS55T2Zmc2V0ID0gLTI7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUueU9mZnNldCA9IC0yO1xuICAgIHRoaXMuYWN0aW9uUGxhbmUgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5hY3Rpb25QbGFuZS55T2Zmc2V0ID0gLTIyO1xuICAgIHRoaXMuZmx1ZmZQbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmZsdWZmUGxhbmUueU9mZnNldCA9IC0xNjA7XG4gICAgdGhpcy5mb3dQbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmZvd1BsYW5lLnlPZmZzZXQgPSAwO1xuICB9XG5cbiAgcmVzZXRQbGFuZXMobGV2ZWxEYXRhKSB7XG4gICAgdmFyIHNwcml0ZSxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgaSxcbiAgICAgICAgYmxvY2tUeXBlLFxuICAgICAgICBmcmFtZUxpc3Q7XG5cbiAgICB0aGlzLmdyb3VuZFBsYW5lLnJlbW92ZUFsbCh0cnVlKTtcbiAgICB0aGlzLmFjdGlvblBsYW5lLnJlbW92ZUFsbCh0cnVlKTtcbiAgICB0aGlzLmZsdWZmUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIHRoaXMuc2hhZGluZ1BsYW5lLnJlbW92ZUFsbCh0cnVlKTtcbiAgICB0aGlzLmZvd1BsYW5lLnJlbW92ZUFsbCh0cnVlKTtcblxuICAgIHRoaXMuYmFzZVNoYWRpbmcgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICBmb3IgKHZhciBzaGFkZVggPSAwOyBzaGFkZVggPCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5wbGFuZVdpZHRoICogNDA7IHNoYWRlWCArPSA0MDApIHtcbiAgICAgIGZvciAodmFyIHNoYWRlWSA9IDA7IHNoYWRlWSA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lSGVpZ2h0ICogNDA7IHNoYWRlWSArPSA0MDApIHtcbiAgICAgICAgdGhpcy5iYXNlU2hhZGluZy5jcmVhdGUoc2hhZGVYLCBzaGFkZVksICdzaGFkZUxheWVyJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZWZyZXNoR3JvdW5kUGxhbmUoKTtcblxuICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3MgPSBbXTtcbiAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICBsZXQgYmxvY2tJbmRleCA9ICh0aGlzLnlUb0luZGV4KHkpKSArIHg7XG4gICAgICAgIHNwcml0ZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKCFsZXZlbERhdGEuZ3JvdW5kRGVjb3JhdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkpIHtcbiAgICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHgsIHksIGxldmVsRGF0YS5ncm91bmREZWNvcmF0aW9uUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlKTtcbiAgICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleCh5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzcHJpdGUgPSBudWxsO1xuICAgICAgICBpZiAoIWxldmVsRGF0YS5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5KSB7XG4gICAgICAgICAgYmxvY2tUeXBlID0gbGV2ZWxEYXRhLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmJsb2NrVHlwZTtcbiAgICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHgsIHksIGJsb2NrVHlwZSk7XG4gICAgICAgICAgaWYgKHNwcml0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoeSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrcy5wdXNoKHNwcml0ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh5ID0gMDsgeSA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleCh5KSkgKyB4O1xuICAgICAgICBpZiAoIWxldmVsRGF0YS5mbHVmZlBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkpIHtcbiAgICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZmx1ZmZQbGFuZSwgeCwgeSwgbGV2ZWxEYXRhLmZsdWZmUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlZnJlc2hHcm91bmRQbGFuZSgpIHtcbiAgICB0aGlzLmdyb3VuZFBsYW5lLnJlbW92ZUFsbCh0cnVlKTtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoeSkpICsgeDtcbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgeCwgeSwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlKTtcbiAgICAgICAgaWYgKHNwcml0ZSkge1xuICAgICAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU2hhZGluZ1BsYW5lKHNoYWRpbmdEYXRhKSB7XG4gICAgdmFyIGluZGV4LCBzaGFkb3dJdGVtLCBzeCwgc3ksIGF0bGFzO1xuXG4gICAgdGhpcy5zaGFkaW5nUGxhbmUucmVtb3ZlQWxsKCk7XG5cbiAgICB0aGlzLnNoYWRpbmdQbGFuZS5hZGQodGhpcy5iYXNlU2hhZGluZyk7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUuYWRkKHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yKTtcblxuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHNoYWRpbmdEYXRhLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgc2hhZG93SXRlbSA9IHNoYWRpbmdEYXRhW2luZGV4XTtcblxuICAgICAgYXRsYXMgPSBcIkFPXCI7XG4gICAgICBzeCA9IDQwICogc2hhZG93SXRlbS54O1xuICAgICAgc3kgPSAtMjIgKyA0MCAqIHNoYWRvd0l0ZW0ueTtcblxuICAgICAgc3dpdGNoIChzaGFkb3dJdGVtLnR5cGUpIHtcbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X0xlZnRcIjpcbiAgICAgICAgICBzeCArPSAyNjtcbiAgICAgICAgICBzeSArPSAyMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfUmlnaHRcIjpcbiAgICAgICAgICBzeCArPSAwO1xuICAgICAgICAgIHN5ICs9IDIyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Cb3R0b21cIjpcbiAgICAgICAgICBzeCArPSAwO1xuICAgICAgICAgIHN5ICs9IDIyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Cb3R0b21MZWZ0XCI6XG4gICAgICAgICAgc3ggKz0gMjU7XG4gICAgICAgICAgc3kgKz0gMjI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X0JvdHRvbVJpZ2h0XCI6XG4gICAgICAgICAgc3ggKz0gMDtcbiAgICAgICAgICBzeSArPSAyMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfVG9wXCI6XG4gICAgICAgICAgc3ggKz0gMDtcbiAgICAgICAgICBzeSArPSA0NztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfVG9wTGVmdFwiOlxuICAgICAgICAgIHN4ICs9IDI1O1xuICAgICAgICAgIHN5ICs9IDQ3O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Ub3BSaWdodFwiOlxuICAgICAgICAgIHN4ICs9IDA7XG4gICAgICAgICAgc3kgKz0gNDc7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIlNoYWRvd19QYXJ0c19GYWRlX2Jhc2UucG5nXCI6XG4gICAgICAgICAgYXRsYXMgPSBcImJsb2NrU2hhZG93c1wiO1xuICAgICAgICAgIHN4IC09IDUyO1xuICAgICAgICAgIHN5ICs9IDA7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIlNoYWRvd19QYXJ0c19GYWRlX3RvcC5wbmdcIjpcbiAgICAgICAgICBhdGxhcyA9IFwiYmxvY2tTaGFkb3dzXCI7XG4gICAgICAgICAgc3ggLT0gNTI7XG4gICAgICAgICAgc3kgKz0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5zaGFkaW5nUGxhbmUuY3JlYXRlKHN4LCBzeSwgYXRsYXMsIHNoYWRvd0l0ZW0udHlwZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlRm93UGxhbmUoZm93RGF0YSkge1xuICAgIHZhciBpbmRleCwgZngsIGZ5LCBhdGxhcztcblxuICAgIHRoaXMuZm93UGxhbmUucmVtb3ZlQWxsKCk7XG5cbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBmb3dEYXRhLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgbGV0IGZvd0l0ZW0gPSBmb3dEYXRhW2luZGV4XTtcblxuICAgICAgaWYgKGZvd0l0ZW0gIT09IFwiXCIpIHtcbiAgICAgICAgYXRsYXMgPSBcInVuZGVyZ3JvdW5kRm93XCI7XG4gICAgICAgIGZ4ID0gLTQwICsgNDAgKiBmb3dJdGVtLng7XG4gICAgICAgIGZ5ID0gLTQwICsgNDAgKiBmb3dJdGVtLnk7XG5cbiAgICAgICAgc3dpdGNoIChmb3dJdGVtLnR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwiRm9nT2ZXYXJfQ2VudGVyXCI6XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm93UGxhbmUuY3JlYXRlKGZ4LCBmeSwgYXRsYXMsIGZvd0l0ZW0udHlwZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcGxheVJhbmRvbVBsYXllcklkbGUoZmFjaW5nKSB7XG4gICAgdmFyIGZhY2luZ05hbWUsXG4gICAgICAgIHJhbmQsXG4gICAgICAgIGFuaW1hdGlvbk5hbWU7XG5cbiAgICBmYWNpbmdOYW1lID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG4gICAgcmFuZCA9IE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSAqIDQpICsgMTtcblxuICAgIHN3aXRjaChyYW5kKVxuICAgIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgIGFuaW1hdGlvbk5hbWUgPSBcImlkbGVcIjtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgYW5pbWF0aW9uTmFtZSA9IFwibG9va0xlZnRcIjtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgYW5pbWF0aW9uTmFtZSA9IFwibG9va1JpZ2h0XCI7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgIGFuaW1hdGlvbk5hbWUgPSBcImxvb2tBdENhbVwiO1xuICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cblxuICAgIGFuaW1hdGlvbk5hbWUgKz0gZmFjaW5nTmFtZTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltYXRpb25OYW1lKTtcbiAgfVxuXG4gIGdlbmVyYXRlUGxheWVyQ2VsZWJyYXRlRnJhbWVzKCkge1xuICAgIHZhciBmcmFtZUxpc3QgPSBbXSxcbiAgICAgICAgaTtcblxuICAgIC8vQ3JvdWNoIERvd25cbiAgIC8qIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI5LCAzMiwgXCJcIiwgMykpO1xuICAgIC8vQ3JvdWNoIERvd25cbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyOSwgMzIsIFwiXCIsIDMpKTtcbiAgICAvL3R1cm4gYW5kIHBhdXNlXG4gICAgZm9yIChpID0gMDsgaSA8IDQ7ICsraSkge1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDYxXCIpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgMjsgKytpKSB7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8xNDlcIik7XG4gICAgfVxuICAgICAgICAvL0Nyb3VjaCBVcFxuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE0OSwgMTUyLCBcIlwiLCAzKSk7XG4gICAgLy9Dcm91Y2ggVXBcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNDksIDE1MiwgXCJcIiwgMykpOyovXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vQWx0ZXJuYXRpdmUgQW5pbWF0aW9uLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy9GYWNlIERvd25cbiAgICAgZm9yIChpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIH1cbiAgICAvL0Nyb3VjaCBMZWZ0XG4gICAgLy9mcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMDksIDIxMiwgXCJcIiwgMykpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjU5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjYwXCIpO1xuXG4gICAgLy9KdW1wXG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjYxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI5N1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yOThcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjk3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI2MVwiKTtcbiAgICAvL0p1bXBcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNjFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjk3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI5OFwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yOTdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjYxXCIpO1xuICAgIC8vUGF1c2VcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIC8vSnVtcFxuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI2MVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yOTdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjk4XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI5N1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNjFcIik7XG4gICAgLy9KdW1wXG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjYxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI5N1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yOThcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjk3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI2MVwiKTtcblxuICAgIC8vZm9yIChpID0gMDsgaSA8IDU7ICsraSkge1xuICAgIC8vICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNjJcIik7XG4gICAgLy9cbiAgICByZXR1cm4gZnJhbWVMaXN0O1xuICB9XG5cbiAgZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoZnJhbWVOYW1lLCBzdGFydEZyYW1lLCBlbmRGcmFtZSwgZW5kRnJhbWVGdWxsTmFtZSwgYnVmZmVyLCBmcmFtZURlbGF5KSB7XG4gICAgdmFyIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKGZyYW1lTmFtZSwgc3RhcnRGcmFtZSwgZW5kRnJhbWUsIFwiXCIsIGJ1ZmZlcik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmcmFtZURlbGF5OyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKGVuZEZyYW1lRnVsbE5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gZnJhbWVMaXN0O1xuICB9XG5cbiAgcHJlcGFyZVBsYXllclNwcml0ZShwbGF5ZXJOYW1lKSB7XG4gICAgdmFyIGZyYW1lTGlzdCxcbiAgICAgICAgZ2VuRnJhbWVzLFxuICAgICAgICBpLFxuICAgICAgICBzaW5nbGVQdW5jaCxcbiAgICAgICAganVtcENlbGVicmF0ZUZyYW1lcyxcbiAgICAgICAgaWRsZUZyYW1lUmF0ZSA9IDEwO1xuXG4gICAgbGV0IGZyYW1lUmF0ZSA9IDIwO1xuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZSgwLCAwLCBgcGxheWVyJHtwbGF5ZXJOYW1lfWAsICdQbGF5ZXJfMTIxJyk7XG4gICAgaWYgKHRoaXMuY29udHJvbGxlci5mb2xsb3dpbmdQbGF5ZXIoKSkge1xuICAgICAgdGhpcy5nYW1lLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXJTcHJpdGUpO1xuICAgIH1cbiAgICB0aGlzLnBsYXllckdob3N0ID0gdGhpcy5mbHVmZlBsYW5lLmNyZWF0ZSgwLCAwLCBgcGxheWVyJHtwbGF5ZXJOYW1lfWAsICdQbGF5ZXJfMTIxJyk7XG4gICAgdGhpcy5wbGF5ZXJHaG9zdC5wYXJlbnQgPSB0aGlzLnBsYXllclNwcml0ZTtcbiAgICB0aGlzLnBsYXllckdob3N0LmFscGhhID0gMC4yO1xuXG4gICAgdGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IgPSB0aGlzLnNoYWRpbmdQbGFuZS5jcmVhdGUoMjQsIDQ0LCAnc2VsZWN0aW9uSW5kaWNhdG9yJyk7XG5cbiAgICBqdW1wQ2VsZWJyYXRlRnJhbWVzID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI4NSwgMjk2LCBcIlwiLCAzKTtcblxuICAgIGZyYW1lTGlzdCA9IFtdO1xuXG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwM1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDA3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwOVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDdcIik7XG4gICAgZm9yIChpID0gMDsgaSA8IDU7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIH1cblxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdpZGxlX2Rvd24nLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLkRvd24pO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDYsIDUsIFwiUGxheWVyXzAwNVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDZcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tMZWZ0X2Rvd24nLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX2Rvd25cIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMTIsIDExLCBcIlBsYXllcl8wMTFcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDEyXCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rUmlnaHRfZG93bicsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfZG93blwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAyNjMsIDI2MiwgXCJQbGF5ZXJfMjYyXCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI2M1wiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0F0Q2FtX2Rvd24nLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX2Rvd25cIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IDEzOyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICB9XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVQYXVzZV9kb3duJywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5Eb3duKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCd3YWxrX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTMsIGZyYW1lUmF0ZSwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgc2luZ2xlUHVuY2ggPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjEsIDI0LCBcIlwiLCAzKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hfZG93bicsIHNpbmdsZVB1bmNoLCBmcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJwdW5jaFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hEZXN0cm95X2Rvd24nLCBzaW5nbGVQdW5jaC5jb25jYXQoc2luZ2xlUHVuY2gpLmNvbmNhdChzaW5nbGVQdW5jaCksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdodXJ0X2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjUsIDI4LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY3JvdWNoX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjksIDMyLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcFVwX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMzMsIDM2LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2ZhaWxfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA0NSwgNDgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY2VsZWJyYXRlX2Rvd24nLCB0aGlzLmdlbmVyYXRlUGxheWVyQ2VsZWJyYXRlRnJhbWVzKCksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnYnVtcF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDQ5LCA1NCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgZmFsc2UpLm9uU3RhcnQuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImJ1bXBcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBEb3duX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgNTUsIDYwLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZV9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI0MSwgMjQ0LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDUsIDUsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfdHVybmxlZnRfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDYsIDYsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfdHVybnJpZ2h0X2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCAxMiwgMTIsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcblxuICAgIGZyYW1lTGlzdCA9IFtdO1xuXG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDYxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2M1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDY3XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2OVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjdcIik7XG4gICAgZm9yIChpID0gMDsgaSA8IDU7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDYxXCIpO1xuICAgIH1cblxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdpZGxlX3JpZ2h0JywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5SaWdodCk7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgNjYsIDY1LCBcIlBsYXllcl8wNjVcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDY2XCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rTGVmdF9yaWdodCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfcmlnaHRcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgNzIsIDcxLCBcIlBsYXllcl8wNzFcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDcyXCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rUmlnaHRfcmlnaHQnLGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfcmlnaHRcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMjcwLCAyNjksIFwiUGxheWVyXzI2OVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNzBcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tBdENhbV9yaWdodCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfcmlnaHRcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IDEzOyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2MVwiKTtcbiAgICB9XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVQYXVzZV9yaWdodCcsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uUmlnaHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3dhbGtfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgNzMsIDgwLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICBzaW5nbGVQdW5jaCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA4MSwgODQsIFwiXCIsIDMpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaF9yaWdodCcsIHNpbmdsZVB1bmNoLCBmcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJwdW5jaFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hEZXN0cm95X3JpZ2h0Jywgc2luZ2xlUHVuY2guY29uY2F0KHNpbmdsZVB1bmNoKS5jb25jYXQoc2luZ2xlUHVuY2gpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaHVydF9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA4NSwgODgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjcm91Y2hfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgODksIDkyLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcFVwX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDkzLCA5NiwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdmYWlsX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDEwNSwgMTA4LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjZWxlYnJhdGVfcmlnaHQnLCB0aGlzLmdlbmVyYXRlUGxheWVyQ2VsZWJyYXRlRnJhbWVzKCksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnYnVtcF9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxMDksIDExNCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgZmFsc2UpLm9uU3RhcnQuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImJ1bXBcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBEb3duX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDExNSwgMTIwLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZV9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyNDUsIDI0OCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgNywgNywgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuXG4gICAgZnJhbWVMaXN0ID0gW107XG5cbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTgzXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4MVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTg5XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4N1wiKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNTsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODFcIik7XG4gICAgfVxuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVfbGVmdCcsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uTGVmdCk7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMTg2LCAxODUsIFwiUGxheWVyXzE4NVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODZcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tMZWZ0X2xlZnQnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfbGVmdFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAxOTIsIDE5MSwgXCJQbGF5ZXJfMTkxXCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE5MlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va1JpZ2h0X2xlZnQnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX2xlZnRcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMjg0LCAyODMsIFwiUGxheWVyXzI4M1wiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yODRcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tBdENhbV9sZWZ0JywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9sZWZ0XCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCAxMzsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODFcIik7XG4gICAgfVxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdpZGxlUGF1c2VfbGVmdCcsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uTGVmdCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnd2Fsa19sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE5MywgMjAwLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICBzaW5nbGVQdW5jaCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMDEsIDIwNCwgXCJcIiwgMyk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoX2xlZnQnLCBzaW5nbGVQdW5jaCwgZnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwicHVuY2hcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoRGVzdHJveV9sZWZ0Jywgc2luZ2xlUHVuY2guY29uY2F0KHNpbmdsZVB1bmNoKS5jb25jYXQoc2luZ2xlUHVuY2gpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaHVydF9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIwNSwgMjA4LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY3JvdWNoX2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjA5LCAyMTIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wVXBfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMTMsIDIxNiwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdmYWlsX2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjI1LCAyMjgsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2NlbGVicmF0ZV9sZWZ0JywgdGhpcy5nZW5lcmF0ZVBsYXllckNlbGVicmF0ZUZyYW1lcygpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2J1bXBfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMjksIDIzNCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgZmFsc2UpLm9uU3RhcnQuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImJ1bXBcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBEb3duX2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjM1LCAyNDAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lX2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjUzLCAyNTYsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgMTEsIDExLCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG5cbiAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTIzXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTI5XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyN1wiKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNTsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjFcIik7XG4gICAgfVxuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVfdXAnLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLlVwKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAxMjYsIDEyNSwgXCJQbGF5ZXJfMTI1XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyNlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0xlZnRfdXAnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX3VwXCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDEzMiwgMTMxLCBcIlBsYXllcl8xMzFcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTMyXCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rUmlnaHRfdXAnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX3VwXCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDI3NywgMjc2LCBcIlBsYXllcl8yNzZcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjc3XCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rQXRDYW1fdXAnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX3VwXCIpO1xuICAgIH0pO1xuXG4gICAgZnJhbWVMaXN0ID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IDEzOyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyMVwiKTtcbiAgICB9XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVQYXVzZV91cCcsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uVXApO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCd3YWxrX3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDEzMywgMTQwLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICBzaW5nbGVQdW5jaCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNDEsIDE0NCwgXCJcIiwgMyk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoX3VwJywgc2luZ2xlUHVuY2gsIGZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInB1bmNoXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaERlc3Ryb3lfdXAnLCBzaW5nbGVQdW5jaC5jb25jYXQoc2luZ2xlUHVuY2gpLmNvbmNhdChzaW5nbGVQdW5jaCksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdodXJ0X3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE0NSwgMTQ4LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY3JvdWNoX3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE0OSwgMTUyLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcFVwX3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE1MywgMTU2LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2ZhaWxfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTY1LCAxNjgsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2NlbGVicmF0ZV91cCcsIHRoaXMuZ2VuZXJhdGVQbGF5ZXJDZWxlYnJhdGVGcmFtZXMoKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdidW1wX3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE2OSwgMTc0LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCBmYWxzZSkub25TdGFydC5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiYnVtcFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcERvd25fdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTc1LCAxODAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lX3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI0OSwgMjUyLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCA5LCA5LCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X3R1cm5sZWZ0X3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgMTAsIDEwLCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X3R1cm5yaWdodF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDgsIDgsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgfVxuXG4gIGNyZWF0ZU1pbmlCbG9jayh4LCB5LCBibG9ja1R5cGUpIHtcbiAgICB2YXIgZnJhbWUgPSBcIlwiLFxuICAgICAgICBzcHJpdGUgPSBudWxsLFxuICAgICAgICBmcmFtZUxpc3QsXG4gICAgICAgIGksIGxlbjtcblxuICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICBjYXNlIFwidHJlZUFjYWNpYVwiOlxuICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgY2FzZSBcInRyZWVKdW5nbGVcIjpcbiAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICBmcmFtZSA9IFwibG9nXCIgKyBibG9ja1R5cGUuc3Vic3RyaW5nKDQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJzdG9uZVwiOlxuICAgICAgICBmcmFtZSA9IFwiY29iYmxlc3RvbmVcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlQ29hbFwiOlxuICAgICAgICBmcmFtZSA9IFwiY29hbFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVEaWFtb25kXCI6XG4gICAgICAgIGZyYW1lID0gXCJkaWFtb25kXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZUlyb25cIjpcbiAgICAgICAgZnJhbWUgPSBcImluZ290SXJvblwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVMYXBpc1wiOlxuICAgICAgICBmcmFtZSA9IFwibGFwaXNMYXp1bGlcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlR29sZFwiOlxuICAgICAgICBmcmFtZSA9IFwiaW5nb3RHb2xkXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZUVtZXJhbGRcIjpcbiAgICAgICAgZnJhbWUgPSBcImVtZXJhbGRcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlUmVkc3RvbmVcIjpcbiAgICAgICAgZnJhbWUgPSBcInJlZHN0b25lRHVzdFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJncmFzc1wiOlxuICAgICAgICBmcmFtZSA9IFwiZGlydFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJ3b29sX29yYW5nZVwiOlxuICAgICAgICBmcmFtZSA9IFwid29vbFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJ0bnRcIjpcbiAgICAgICAgZnJhbWUgPSBcImd1blBvd2RlclwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGZyYW1lID0gYmxvY2tUeXBlO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBsZXQgYXRsYXMgPSBcIm1pbmlCbG9ja3NcIjtcbiAgICBsZXQgZnJhbWVQcmVmaXggPSB0aGlzLm1pbmlCbG9ja3NbZnJhbWVdWzBdO1xuICAgIGxldCBmcmFtZVN0YXJ0ID0gdGhpcy5taW5pQmxvY2tzW2ZyYW1lXVsxXTtcbiAgICBsZXQgZnJhbWVFbmQgPSB0aGlzLm1pbmlCbG9ja3NbZnJhbWVdWzJdO1xuICAgIGxldCB4T2Zmc2V0ID0gLTEwO1xuICAgIGxldCB5T2Zmc2V0ID0gMDtcblxuICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKGZyYW1lUHJlZml4LCBmcmFtZVN0YXJ0LCBmcmFtZUVuZCwgXCJcIiwgMyk7XG5cbiAgICBzcHJpdGUgPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgdGhpcy5hY3Rpb25QbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgXCJcIik7XG4gICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiYW5pbWF0ZVwiLCBmcmFtZUxpc3QsIDEwLCBmYWxzZSk7XG4gICAgcmV0dXJuIHNwcml0ZTtcbiAgfVxuXG4gIHBsYXlBbmltYXRpb25XaXRoT2Zmc2V0KHNwcml0ZSwgYW5pbWF0aW9uTmFtZSwgYW5pbWF0aW9uRnJhbWVUb3RhbCwgc3RhcnRGcmFtZSl7XG4gICAgdmFyIHJhbmQgPSBNYXRoLnRydW5jKE1hdGgucmFuZG9tKCkgKiBhbmltYXRpb25GcmFtZVRvdGFsKSArIHN0YXJ0RnJhbWU7XG4gICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIGFuaW1hdGlvbk5hbWUpLnNldEZyYW1lKHJhbmQsIHRydWUpO1xuICB9XG5cbiAgcGxheVJhbmRvbVNoZWVwQW5pbWF0aW9uKHNwcml0ZSkge1xuICAgIHZhciByYW5kID0gTWF0aC50cnVuYyhNYXRoLnJhbmRvbSgpICogMjAgKyAxKTtcblxuICAgIHN3aXRjaChyYW5kKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICBjYXNlIDI6XG4gICAgICBjYXNlIDM6XG4gICAgICBjYXNlIDQ6XG4gICAgICBjYXNlIDU6XG4gICAgICBjYXNlIDY6XG4gICAgICAvL2VhdCBncmFzc1xuICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlXCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICBjYXNlIDg6XG4gICAgICBjYXNlIDk6XG4gICAgICBjYXNlIDEwOlxuICAgICAgLy9sb29rIGxlZnRcbiAgICAgIHNwcml0ZS5wbGF5KFwibG9va0xlZnRcIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMTE6XG4gICAgICBjYXNlIDEyOlxuICAgICAgY2FzZSAxMzpcbiAgICAgIGNhc2UgMTQ6XG4gICAgICAvL2xvb2sgcmlnaHRcbiAgICAgIHNwcml0ZS5wbGF5KFwibG9va1JpZ2h0XCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE1OlxuICAgICAgY2FzZSAxNjpcbiAgICAgIGNhc2UgMTc6XG4gICAgICAvL2NhbVxuICAgICAgc3ByaXRlLnBsYXkoXCJsb29rQXRDYW1cIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMTg6XG4gICAgICBjYXNlIDE5OlxuICAgICAgLy9raWNrXG4gICAgICBzcHJpdGUucGxheShcImtpY2tcIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMjA6XG4gICAgICAvL2lkbGVQYXVzZVxuICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG5cbiAgcGxheVJhbmRvbUNyZWVwZXJBbmltYXRpb24oc3ByaXRlKSB7XG4gICAgdmFyIHJhbmQgPSBNYXRoLnRydW5jKHRoaXMueVRvSW5kZXgoTWF0aC5yYW5kb20oKSkgKyAxKTtcblxuICAgIHN3aXRjaChyYW5kKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICBjYXNlIDI6XG4gICAgICBjYXNlIDM6XG4gICAgICAvL2xvb2sgbGVmdFxuICAgICAgc3ByaXRlLnBsYXkoXCJsb29rTGVmdFwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgY2FzZSA1OlxuICAgICAgY2FzZSA2OlxuICAgICAgLy9sb29rIHJpZ2h0XG4gICAgICBzcHJpdGUucGxheShcImxvb2tSaWdodFwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgY2FzZSA4OlxuICAgICAgLy9sb29rIGF0IGNhbVxuICAgICAgc3ByaXRlLnBsYXkoXCJsb29rQXRDYW1cIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgIGNhc2UgMTA6XG4gICAgICAvL3NodWZmbGUgZmVldFxuICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlXCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUJsb2NrKHBsYW5lLCB4LCB5LCBibG9ja1R5cGUpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgc3ByaXRlID0gbnVsbCxcbiAgICAgICAgZnJhbWVMaXN0LFxuICAgICAgICBhdGxhcyxcbiAgICAgICAgZnJhbWUsXG4gICAgICAgIHhPZmZzZXQsXG4gICAgICAgIHlPZmZzZXQsXG4gICAgICAgIHN0aWxsRnJhbWVzO1xuXG4gICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgIGNhc2UgXCJ0cmVlQWNhY2lhXCI6XG4gICAgICBjYXNlIFwidHJlZUJpcmNoXCI6XG4gICAgICBjYXNlIFwidHJlZUp1bmdsZVwiOlxuICAgICAgY2FzZSBcInRyZWVPYWtcIjpcbiAgICAgIGNhc2UgXCJ0cmVlU3BydWNlXCI6XG4gICAgICAgIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2socGxhbmUsIHgsIHksIFwibG9nXCIgKyBibG9ja1R5cGUuc3Vic3RyaW5nKDQpKTtcbiAgICAgICAgc3ByaXRlLmZsdWZmID0gdGhpcy5jcmVhdGVCbG9jayh0aGlzLmZsdWZmUGxhbmUsIHgsIHksIFwibGVhdmVzXCIgKyBibG9ja1R5cGUuc3Vic3RyaW5nKDQpKTtcblxuICAgICAgICBzcHJpdGUub25CbG9ja0Rlc3Ryb3kgPSAobG9nU3ByaXRlKSA9PiB7XG4gICAgICAgICAgbG9nU3ByaXRlLmZsdWZmLmFuaW1hdGlvbnMuYWRkKFwiZGVzcGF3blwiLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkxlYXZlc1wiLCAwLCA2LCBcIlwiLCAwKSwgMTAsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGxvZ1Nwcml0ZS5mbHVmZik7XG4gICAgICAgICAgICBsb2dTcHJpdGUuZmx1ZmYua2lsbCgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQobG9nU3ByaXRlLmZsdWZmLmFuaW1hdGlvbnMsIFwiZGVzcGF3blwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJzaGVlcFwiOlxuICAgICAgICBsZXQgc0ZyYW1lcyA9IDEwO1xuICAgICAgICAvLyBGYWNpbmcgTGVmdDogRWF0IEdyYXNzOiAxOTktMjE2XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSgtMjIgKyA0MCAqIHgsIC0xMiArIDQwICogeSwgXCJzaGVlcFwiLCBcIlNoZWVwXzE5OVwiKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgMTk5LCAyMTUsIFwiXCIsIDApO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc0ZyYW1lczsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF8yMTVcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0xvb2sgUmlnaHRcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgMTg0LCAxODYsIFwiXCIsIDApO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc0ZyYW1lczsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF8xODZcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF8xODhcIik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImxvb2tSaWdodFwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0xvb2sgTGVmdFxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCAxOTMsIDE5NSwgXCJcIiwgMCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzE5NVwiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzE5N1wiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va0xlZnRcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9LaWNrXG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiU2hlZXBfXCIsIDIxNywgMjMzLCBcIlwiLCAwKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwia2lja1wiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0xvb2sgQXQgQ2FtZXJhXG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiU2hlZXBfXCIsIDQ4NCwgNDg1LCBcIlwiLCAwKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNGcmFtZXM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfNDg1XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfNDg2XCIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJsb29rQXRDYW1cIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnJhbWVMaXN0ID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNTsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF8yMTVcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVBhdXNlXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbGF5UmFuZG9tU2hlZXBBbmltYXRpb24oc3ByaXRlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVE9ETyhiam9yZGFuL2dhYWxsZW4pIC0gdXBkYXRlIG9uY2UgdXBkYXRlZCBTaGVlcC5qc29uXG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiU2hlZXBfXCIsIDQ5MCwgNDkxLCBcIlwiLCAwKTtcbiAgICAgICAgc3RpbGxGcmFtZXMgPSBNYXRoLnRydW5jKE1hdGgucmFuZG9tKCkgKiAzKSArIDM7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzdGlsbEZyYW1lczsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF80OTFcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbkFuaW1hdGlvblN0YXJ0KHNwcml0ZS5hbmltYXRpb25zLmFkZChcImZhY2VcIiwgZnJhbWVMaXN0LCAyLCB0cnVlKSwgKCk9PntcbiAgICAgICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzaGVlcEJhYVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgNDM5LCA0NTUsIFwiXCIsIDApO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMzsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF80NTVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJ1c2VkXCIsIGZyYW1lTGlzdCwgMTUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlBbmltYXRpb25XaXRoT2Zmc2V0KHNwcml0ZSxcImlkbGVcIiwxNywgMTk5KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJjcmVlcGVyXCI6XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSgtNiArIDQwICogeCwgMCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIFwiY3JlZXBlclwiLCBcIkNyZWVwZXJfMDUzXCIpO1xuXG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQ3JlZXBlcl9cIiwgMzcsIDUxLCBcIlwiLCAzKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiZXhwbG9kZVwiLCBmcmFtZUxpc3QsIDEwLCBmYWxzZSk7XG5cbiAgICAgICAgLy9Mb29rIExlZnRcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJDcmVlcGVyX1wiLCA0LCA3LCBcIlwiLCAzKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDA3XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMDhcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMDlcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMTBcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMTFcIik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImxvb2tMZWZ0XCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTG9vayBSaWdodFxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkNyZWVwZXJfXCIsIDE2LCAxOSwgXCJcIiwgMyk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAxNTsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAxOVwiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDIwXCIpO1xuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDIxXCIpO1xuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDIyXCIpO1xuICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDIzXCIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJsb29rUmlnaHRcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9Mb29rIEF0IENhbVxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkNyZWVwZXJfXCIsIDI0NCwgMjQ1LCBcIlwiLCAzKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMjQ1XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8yNDZcIik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImxvb2tBdENhbVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDA0XCIpO1xuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVQYXVzZVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGxheVJhbmRvbUNyZWVwZXJBbmltYXRpb24oc3ByaXRlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJDcmVlcGVyX1wiLCA1MywgNTksIFwiXCIsIDMpO1xuICAgICAgICBzdGlsbEZyYW1lcyA9IE1hdGgudHJ1bmModGhpcy55VG9JbmRleChNYXRoLnJhbmRvbSgpKSkgKyAyMDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHN0aWxsRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDA0XCIpO1xuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGxheUFuaW1hdGlvbldpdGhPZmZzZXQoc3ByaXRlLCBcImlkbGVcIiwgOCwgNTIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImNyb3BXaGVhdFwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiV2hlYXRcIiwgMCwgMiwgXCJcIiwgMCk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCAwLjQsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJ0b3JjaFwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiVG9yY2hcIiwgMCwgMjMsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgMTUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcIndhdGVyXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJXYXRlcl9cIiwgMCwgNSwgXCJcIiwgMCk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCA1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vZm9yIHBsYWNpbmcgd2V0bGFuZCBmb3IgY3JvcHMgaW4gZnJlZSBwbGF5XG4gICAgICBjYXNlIFwid2F0ZXJpbmdcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBzcHJpdGUua2lsbCgpO1xuICAgICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKHNwcml0ZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgeCwgeSwgXCJmYXJtbGFuZFdldFwiKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoR3JvdW5kUGxhbmUoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJsYXZhXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJMYXZhX1wiLCAwLCA1LCBcIlwiLCAwKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImxhdmFQb3BcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkxhdmFQb3BcIiwgMSwgNywgXCJcIiwgMik7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IDQ7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiTGF2YVBvcDA3XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJMYXZhUG9wXCIsIDgsIDEzLCBcIlwiLCAyKSk7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IDM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiTGF2YVBvcDEzXCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJMYXZhUG9wXCIsIDE0LCAzMCwgXCJcIiwgMikpO1xuICAgICAgICBmb3IoaSA9IDA7IGkgPCA4OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkxhdmFQb3AwMVwiKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheUFuaW1hdGlvbldpdGhPZmZzZXQoc3ByaXRlLCBcImlkbGVcIiwgMjksIDEpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImZpcmVcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkZpcmVcIiwgMCwgMTQsIFwiXCIsIDIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiYnViYmxlc1wiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQnViYmxlc1wiLCAwLCAxNCwgXCJcIiwgMik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCA1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJleHBsb3Npb25cIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkV4cGxvc2lvblwiLCAwLCAxNiwgXCJcIiwgMSk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKHNwcml0ZSk7XG4gICAgICAgICAgc3ByaXRlLmtpbGwoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiZG9vclwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG5cbiAgICAgICAgZnJhbWVMaXN0ID0gW107XG4gICAgICAgIGxldCBhbmltYXRpb25GcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkRvb3JcIiwgMCwgMywgXCJcIiwgMSk7XG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCA1OyArK2opXG4gICAgICAgIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkRvb3IwXCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoYW5pbWF0aW9uRnJhbWVzKTtcblxuICAgICAgICB2YXIgYW5pbWF0aW9uID0gc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwib3BlblwiLCBmcmFtZUxpc3QsIDUsIGZhbHNlKTtcbiAgICAgICAgYW5pbWF0aW9uLmVuYWJsZVVwZGF0ZSA9IHRydWU7XG4gICAgICAgIC8vcGxheSB3aGVuIHRoZSBkb29yIHN0YXJ0cyBvcGVuaW5nXG4gICAgICAgIGFuaW1hdGlvbi5vblVwZGF0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIGlmKGFuaW1hdGlvbi5mcmFtZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZG9vck9wZW5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwib3BlblwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJ0bnRcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlROVGV4cGxvc2lvblwiLCAwLCA4LCBcIlwiLCAwKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiZXhwbG9kZVwiLCBmcmFtZUxpc3QsIDcsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQ2xvdWRBbmltYXRpb24oW3gseV0pO1xuICAgICAgICAgIHNwcml0ZS5raWxsKCk7XG4gICAgICAgICAgdGhpcy50b0Rlc3Ryb3kucHVzaChzcHJpdGUpO1xuICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoW3gseV0pXSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gc3ByaXRlO1xuICB9XG5cbiAgb25BbmltYXRpb25FbmQoYW5pbWF0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBzaWduYWxCaW5kaW5nID0gYW5pbWF0aW9uLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHNpZ25hbEJpbmRpbmcuZGV0YWNoKCk7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgb25BbmltYXRpb25TdGFydChhbmltYXRpb24sIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHNpZ25hbEJpbmRpbmcgPSBhbmltYXRpb24ub25TdGFydC5hZGQoKCkgPT4ge1xuICAgICAgc2lnbmFsQmluZGluZy5kZXRhY2goKTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBvbkFuaW1hdGlvbkxvb3BPbmNlKGFuaW1hdGlvbiwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgc2lnbmFsQmluZGluZyA9IGFuaW1hdGlvbi5vbkxvb3AuYWRkKCgpID0+IHtcbiAgICAgIHNpZ25hbEJpbmRpbmcuZGV0YWNoKCk7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkge1xuICAgIHZhciB0d2VlbiA9IHRoaXMuZ2FtZS5hZGQudHdlZW4oc3ByaXRlKTtcbiAgICB0aGlzLnJlc2V0dGFibGVUd2VlbnMucHVzaCh0d2Vlbik7XG4gICAgcmV0dXJuIHR3ZWVuO1xuICB9XG5cbn1cbiIsImltcG9ydCBMZXZlbEJsb2NrIGZyb20gXCIuL0xldmVsQmxvY2suanNcIjtcbmltcG9ydCBGYWNpbmdEaXJlY3Rpb24gZnJvbSBcIi4vRmFjaW5nRGlyZWN0aW9uLmpzXCI7XG5cbi8vIGZvciBibG9ja3Mgb24gdGhlIGFjdGlvbiBwbGFuZSwgd2UgbmVlZCBhbiBhY3R1YWwgXCJibG9ja1wiIG9iamVjdCwgc28gd2UgY2FuIG1vZGVsXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExldmVsTW9kZWwge1xuICBjb25zdHJ1Y3RvcihsZXZlbERhdGEpIHtcbiAgICB0aGlzLnBsYW5lV2lkdGggPSBsZXZlbERhdGEuZ3JpZERpbWVuc2lvbnMgP1xuICAgICAgICBsZXZlbERhdGEuZ3JpZERpbWVuc2lvbnNbMF0gOiAxMDtcbiAgICB0aGlzLnBsYW5lSGVpZ2h0ID0gbGV2ZWxEYXRhLmdyaWREaW1lbnNpb25zID9cbiAgICAgICAgbGV2ZWxEYXRhLmdyaWREaW1lbnNpb25zWzFdIDogMTA7XG5cbiAgICB0aGlzLnBsYXllciA9IHt9O1xuXG4gICAgdGhpcy5yYWlsTWFwID0gXG4gICAgICBbXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcInJhaWxzVW5wb3dlcmVkVmVydGljYWxcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJyYWlsc1VucG93ZXJlZFZlcnRpY2FsXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcInJhaWxzVW5wb3dlcmVkVmVydGljYWxcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJyYWlsc0JvdHRvbUxlZnRcIixcInJhaWxzSG9yaXpvbnRhbFwiLFwicmFpbHNIb3Jpem9udGFsXCIsXCJyYWlsc0hvcml6b250YWxcIixcInJhaWxzSG9yaXpvbnRhbFwiLFwicmFpbHNIb3Jpem9udGFsXCIsXCJyYWlsc0hvcml6b250YWxcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiXTtcblxuICAgIHRoaXMuaW5pdGlhbExldmVsRGF0YSA9IE9iamVjdC5jcmVhdGUobGV2ZWxEYXRhKTtcblxuICAgIHRoaXMucmVzZXQoKTtcblxuICAgIHRoaXMuaW5pdGlhbFBsYXllclN0YXRlID0gT2JqZWN0LmNyZWF0ZSh0aGlzLnBsYXllcik7XG4gIH1cblxuICBwbGFuZUFyZWEoKSB7XG4gICAgcmV0dXJuIHRoaXMucGxhbmVXaWR0aCAqIHRoaXMucGxhbmVIZWlnaHQ7XG4gIH1cblxuICBpbkJvdW5kcyh4LCB5KSB7XG4gICAgcmV0dXJuIHggPj0gMCAmJiB4IDwgdGhpcy5wbGFuZVdpZHRoICYmIHkgPj0gMCAmJiB5IDwgdGhpcy5wbGFuZUhlaWdodDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuZ3JvdW5kUGxhbmUgPSB0aGlzLmNvbnN0cnVjdFBsYW5lKHRoaXMuaW5pdGlhbExldmVsRGF0YS5ncm91bmRQbGFuZSwgZmFsc2UpO1xuICAgIHRoaXMuZ3JvdW5kRGVjb3JhdGlvblBsYW5lID0gdGhpcy5jb25zdHJ1Y3RQbGFuZSh0aGlzLmluaXRpYWxMZXZlbERhdGEuZ3JvdW5kRGVjb3JhdGlvblBsYW5lLCBmYWxzZSk7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUgPSBbXTtcbiAgICB0aGlzLmFjdGlvblBsYW5lID0gdGhpcy5jb25zdHJ1Y3RQbGFuZSh0aGlzLmluaXRpYWxMZXZlbERhdGEuYWN0aW9uUGxhbmUsIHRydWUpO1xuICAgIHRoaXMuZmx1ZmZQbGFuZSA9IHRoaXMuY29uc3RydWN0UGxhbmUodGhpcy5pbml0aWFsTGV2ZWxEYXRhLmZsdWZmUGxhbmUsIGZhbHNlKTtcbiAgICB0aGlzLmZvd1BsYW5lID0gW107XG4gICAgdGhpcy5pc0RheXRpbWUgPSB0aGlzLmluaXRpYWxMZXZlbERhdGEuaXNEYXl0aW1lID09PSB1bmRlZmluZWQgfHwgdGhpcy5pbml0aWFsTGV2ZWxEYXRhLmlzRGF5dGltZTtcblxuICAgIGxldCBsZXZlbERhdGEgPSBPYmplY3QuY3JlYXRlKHRoaXMuaW5pdGlhbExldmVsRGF0YSk7XG4gICAgbGV0IFt4LCB5XSA9IFtsZXZlbERhdGEucGxheWVyU3RhcnRQb3NpdGlvblswXSwgbGV2ZWxEYXRhLnBsYXllclN0YXJ0UG9zaXRpb25bMV1dO1xuXG4gICAgdGhpcy5wbGF5ZXIubmFtZSA9IHRoaXMuaW5pdGlhbExldmVsRGF0YS5wbGF5ZXJOYW1lIHx8IFwiU3RldmVcIjtcbiAgICB0aGlzLnBsYXllci5wb3NpdGlvbiA9IGxldmVsRGF0YS5wbGF5ZXJTdGFydFBvc2l0aW9uO1xuICAgIHRoaXMucGxheWVyLmlzT25CbG9jayA9ICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSkgKyB4XS5nZXRJc0VtcHR5T3JFbnRpdHkoKTtcbiAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBsZXZlbERhdGEucGxheWVyU3RhcnREaXJlY3Rpb247XG5cbiAgICB0aGlzLnBsYXllci5pbnZlbnRvcnkgPSB7fTtcblxuICAgIHRoaXMuY29tcHV0ZVNoYWRpbmdQbGFuZSgpO1xuICAgIHRoaXMuY29tcHV0ZUZvd1BsYW5lKCk7XG4gIH1cblxuICB5VG9JbmRleCh5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLnBsYW5lV2lkdGg7XG4gIH1cblxuICBjb25zdHJ1Y3RQbGFuZShwbGFuZURhdGEsIGlzQWN0aW9uUGxhbmUpIHtcbiAgICB2YXIgaW5kZXgsXG4gICAgICAgIHJlc3VsdCA9IFtdLFxuICAgICAgICBibG9jaztcblxuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHBsYW5lRGF0YS5sZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgIGJsb2NrID0gbmV3IExldmVsQmxvY2socGxhbmVEYXRhW2luZGV4XSk7XG4gICAgICAvLyBUT0RPKGJqb3JkYW4pOiBwdXQgdGhpcyB0cnV0aCBpbiBjb25zdHJ1Y3RvciBsaWtlIG90aGVyIGF0dHJzXG4gICAgICBibG9jay5pc1dhbGthYmxlID0gYmxvY2suaXNXYWxrYWJsZSB8fCAhaXNBY3Rpb25QbGFuZTtcbiAgICAgIHJlc3VsdC5wdXNoKGJsb2NrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaXNTb2x2ZWQoKSAge1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbExldmVsRGF0YS52ZXJpZmljYXRpb25GdW5jdGlvbih0aGlzKTtcbiAgfVxuXG4gIGdldEhvdXNlQm90dG9tUmlnaHQoKSAge1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbExldmVsRGF0YS5ob3VzZUJvdHRvbVJpZ2h0O1xuICB9XG5cbiAgICAvLyBWZXJpZmljYXRpb25zXG4gIGlzUGxheWVyTmV4dFRvKGJsb2NrVHlwZSkge1xuICAgIHZhciBwb3NpdGlvbjtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAvLyBhYm92ZVxuICAgIHBvc2l0aW9uID0gW3RoaXMucGxheWVyLnBvc2l0aW9uWzBdLCB0aGlzLnBsYXllci5wb3NpdGlvblsxXSAtIDFdO1xuICAgIGlmICh0aGlzLmlzQmxvY2tPZlR5cGUocG9zaXRpb24sIGJsb2NrVHlwZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGJlbG93XG4gICAgcG9zaXRpb24gPSBbdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0sIHRoaXMucGxheWVyLnBvc2l0aW9uWzFdICsgMV07XG4gICAgaWYgKHRoaXMuaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gbGVmdFxuICAgIHBvc2l0aW9uID0gW3RoaXMucGxheWVyLnBvc2l0aW9uWzBdICsgMSwgdGhpcy5wbGF5ZXIucG9zaXRpb25bMV1dO1xuICAgIGlmICh0aGlzLmlzQmxvY2tPZlR5cGUocG9zaXRpb24sIGJsb2NrVHlwZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFJpZ2h0XG4gICAgcG9zaXRpb24gPSBbdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0gLSAxLCB0aGlzLnBsYXllci5wb3NpdGlvblsxXV07XG4gICAgaWYgKHRoaXMuaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZ2V0SW52ZW50b3J5QW1vdW50KGludmVudG9yeVR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5wbGF5ZXIuaW52ZW50b3J5W2ludmVudG9yeVR5cGVdIHx8IDA7XG4gIH1cblxuXG4gIGdldEludmVudG9yeVR5cGVzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBsYXllci5pbnZlbnRvcnkpO1xuICB9XG5cbiAgY291bnRPZlR5cGVPbk1hcChibG9ja1R5cGUpIHtcbiAgICB2YXIgY291bnQgPSAwLFxuICAgICAgICBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMucGxhbmVBcmVhKCk7ICsraSkge1xuICAgICAgaWYgKGJsb2NrVHlwZSA9PSB0aGlzLmFjdGlvblBsYW5lW2ldLmJsb2NrVHlwZSkge1xuICAgICAgICArK2NvdW50O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG4gIH1cblxuICBpc1BsYXllckF0KHBvc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0gPT09IHBvc2l0aW9uWzBdICYmXG4gICAgICAgICAgdGhpcy5wbGF5ZXIucG9zaXRpb25bMV0gPT09IHBvc2l0aW9uWzFdO1xuICB9XG5cbiAgc29sdXRpb25NYXBNYXRjaGVzUmVzdWx0TWFwKHNvbHV0aW9uTWFwKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYW5lQXJlYSgpOyBpKyspIHtcbiAgICAgIHZhciBzb2x1dGlvbkl0ZW1UeXBlID0gc29sdXRpb25NYXBbaV07XG5cbiAgICAgIC8vIFwiXCIgb24gdGhlIHNvbHV0aW9uIG1hcCBtZWFucyB3ZSBkb250IGNhcmUgd2hhdCdzIGF0IHRoYXQgc3BvdFxuICAgICAgaWYgKHNvbHV0aW9uSXRlbVR5cGUgIT09IFwiXCIpIHtcbiAgICAgICAgaWYgKHNvbHV0aW9uSXRlbVR5cGUgPT09IFwiZW1wdHlcIikge1xuICAgICAgICAgIGlmICghdGhpcy5hY3Rpb25QbGFuZVtpXS5pc0VtcHR5KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNvbHV0aW9uSXRlbVR5cGUgPT09IFwiYW55XCIpIHtcbiAgICAgICAgICBpZiAodGhpcy5hY3Rpb25QbGFuZVtpXS5pc0VtcHR5KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFjdGlvblBsYW5lW2ldLmJsb2NrVHlwZSAhPT0gc29sdXRpb25JdGVtVHlwZSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGdldFRudCgpIHtcbiAgICB2YXIgdG50ID0gW107XG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHRoaXMucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICBmb3IodmFyIHkgPSAwOyB5IDwgdGhpcy5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuY29vcmRpbmF0ZXNUb0luZGV4KFt4LHldKTtcbiAgICAgICAgdmFyIGJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZVtpbmRleF07XG4gICAgICAgIGlmKGJsb2NrLmJsb2NrVHlwZSA9PT0gXCJ0bnRcIikge1xuICAgICAgICAgIHRudC5wdXNoKFt4LHldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG50O1xuICB9XG5cbiAgZ2V0VW5wb3dlcmVkUmFpbHMoKSB7XG4gICAgdmFyIHVucG93ZXJlZFJhaWxzID0gW107XG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHRoaXMucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICBmb3IodmFyIHkgPSAwOyB5IDwgdGhpcy5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuY29vcmRpbmF0ZXNUb0luZGV4KFt4LHldKTtcbiAgICAgICAgdmFyIGJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZVtpbmRleF07XG4gICAgICAgIGlmKGJsb2NrLmJsb2NrVHlwZS5zdWJzdHJpbmcoMCw3KSA9PSBcInJhaWxzVW5cIikge1xuICAgICAgICAgIHVucG93ZXJlZFJhaWxzLnB1c2goW3gseV0sIFwicmFpbHNQb3dlcmVkXCIgKyB0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5ibG9ja1R5cGUuc3Vic3RyaW5nKDE0KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5wb3dlcmVkUmFpbHM7XG4gIH1cblxuICBnZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCkge1xuICAgIHZhciBjeCA9IHRoaXMucGxheWVyLnBvc2l0aW9uWzBdLFxuICAgICAgICBjeSA9IHRoaXMucGxheWVyLnBvc2l0aW9uWzFdO1xuXG4gICAgc3dpdGNoICh0aGlzLnBsYXllci5mYWNpbmcpIHtcbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlVwOlxuICAgICAgICAtLWN5O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uRG93bjpcbiAgICAgICAgKytjeTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkxlZnQ6XG4gICAgICAgIC0tY3g7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5SaWdodDpcbiAgICAgICAgKytjeDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtjeCwgY3ldOyAgICBcbiAgfVxuXG4gIGlzRm9yd2FyZEJsb2NrT2ZUeXBlKGJsb2NrVHlwZSkge1xuICAgIGxldCBibG9ja0ZvcndhcmRQb3NpdGlvbiA9IHRoaXMuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpO1xuXG4gICAgbGV0IGFjdGlvbklzRW1wdHkgPSB0aGlzLmlzQmxvY2tPZlR5cGVPblBsYW5lKGJsb2NrRm9yd2FyZFBvc2l0aW9uLCBcImVtcHR5XCIsIHRoaXMuYWN0aW9uUGxhbmUpO1xuXG4gICAgaWYgKGJsb2NrVHlwZSA9PT0gJycgJiYgYWN0aW9uSXNFbXB0eSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbklzRW1wdHkgP1xuICAgICAgICB0aGlzLmlzQmxvY2tPZlR5cGVPblBsYW5lKGJsb2NrRm9yd2FyZFBvc2l0aW9uLCBibG9ja1R5cGUsIHRoaXMuZ3JvdW5kUGxhbmUpIDpcbiAgICAgICAgdGhpcy5pc0Jsb2NrT2ZUeXBlT25QbGFuZShibG9ja0ZvcndhcmRQb3NpdGlvbiwgYmxvY2tUeXBlLCB0aGlzLmFjdGlvblBsYW5lKTtcbiAgfVxuXG4gIGlzQmxvY2tPZlR5cGUocG9zaXRpb24sIGJsb2NrVHlwZSkgIHtcbiAgICAgIHJldHVybiB0aGlzLmlzQmxvY2tPZlR5cGVPblBsYW5lKHBvc2l0aW9uLCBibG9ja1R5cGUsIHRoaXMuYWN0aW9uUGxhbmUpO1xuICB9XG5cbiAgaXNCbG9ja09mVHlwZU9uUGxhbmUocG9zaXRpb24sIGJsb2NrVHlwZSwgcGxhbmUpICB7XG4gICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChwb3NpdGlvblsxXSkgKyBwb3NpdGlvblswXTtcbiAgICAgIGlmIChibG9ja0luZGV4ID49IDAgJiYgYmxvY2tJbmRleCA8IHRoaXMucGxhbmVBcmVhKCkpIHtcblxuICAgICAgICAgIGlmIChibG9ja1R5cGUgPT0gXCJlbXB0eVwiKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9ICBwbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5O1xuICAgICAgICAgIH0gZWxzZSBpZiAoYmxvY2tUeXBlID09IFwidHJlZVwiKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHBsYW5lW2Jsb2NrSW5kZXhdLmdldElzVHJlZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IChibG9ja1R5cGUgPT0gcGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlKTtcbiAgICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpc1BsYXllclN0YW5kaW5nSW5XYXRlcigpe1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleCh0aGlzLnBsYXllci5wb3NpdGlvblsxXSkgKyB0aGlzLnBsYXllci5wb3NpdGlvblswXTtcbiAgICByZXR1cm4gdGhpcy5ncm91bmRQbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUgPT09IFwid2F0ZXJcIjtcbiAgfVxuXG4gIGlzUGxheWVyU3RhbmRpbmdJbkxhdmEoKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHRoaXMucGxheWVyLnBvc2l0aW9uWzFdKSArIHRoaXMucGxheWVyLnBvc2l0aW9uWzBdO1xuICAgIHJldHVybiB0aGlzLmdyb3VuZFBsYW5lW2Jsb2NrSW5kZXhdLmJsb2NrVHlwZSA9PT0gXCJsYXZhXCI7XG4gIH1cblxuICBjb29yZGluYXRlc1RvSW5kZXgoY29vcmRpbmF0ZXMpe1xuICAgIHJldHVybiB0aGlzLnlUb0luZGV4KGNvb3JkaW5hdGVzWzFdKSArIGNvb3JkaW5hdGVzWzBdO1xuICB9XG5cbiAgY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcG9zaXRpb24sIG9iamVjdEFycmF5KXtcbiAgICBpZiAoKCFibG9ja1R5cGUgJiYgKHRoaXMuYWN0aW9uUGxhbmVbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgocG9zaXRpb24pXS5ibG9ja1R5cGUgIT09IFwiXCIpKXx8IHRoaXMuaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSkge1xuICAgICAgb2JqZWN0QXJyYXkucHVzaChbdHJ1ZSwgcG9zaXRpb25dKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgb2JqZWN0QXJyYXkucHVzaChbZmFsc2UsIG51bGxdKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBob3VzZUdyb3VuZFRvRmxvb3JIZWxwZXIocG9zaXRpb24sIHdvb2xUeXBlLCBhcnJheUNoZWNrKVxuICB7XG4gICAgdmFyIGNoZWNrQWN0aW9uQmxvY2ssXG4gICAgICAgIGNoZWNrR3JvdW5kQmxvY2ssXG4gICAgICAgIHBvc0Fib3ZlLCBcbiAgICAgICAgcG9zQmVsb3csXG4gICAgICAgIHBvc1JpZ2h0LFxuICAgICAgICBwb3NMZWZ0LFxuICAgICAgICBjaGVja0luZGV4ID0gMCxcbiAgICAgICAgYXJyYXkgPSBhcnJheUNoZWNrO1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzJdKSArIHBvc2l0aW9uWzFdO1xuXG4gICAgICAgIGlmKGluZGV4ID09PSA0NClcbiAgICAgICAge1xuICAgICAgICAgIGluZGV4ID0gNDQ7XG4gICAgICAgIH1cblxuICAgIHBvc0Fib3ZlID0gIFswLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0gKyAxXTtcbiAgICBwb3NBYm92ZVswXSA9IHRoaXMueVRvSW5kZXgocG9zQWJvdmVbMl0pICsgcG9zQWJvdmVbMV07XG5cbiAgICBwb3NCZWxvdyA9ICBbMCwgcG9zaXRpb25bMV0sIHBvc2l0aW9uWzJdIC0gMV07XG4gICAgcG9zQmVsb3dbMF0gPSB0aGlzLnlUb0luZGV4KHBvc0JlbG93WzJdKSArIHBvc0JlbG93WzFdO1xuXG4gICAgcG9zUmlnaHQgPSAgWzAsIHBvc2l0aW9uWzFdICsgMSwgcG9zaXRpb25bMl1dO1xuICAgIHBvc1JpZ2h0WzBdID0gdGhpcy55VG9JbmRleChwb3NSaWdodFsyXSkgKyBwb3NSaWdodFsxXTtcbiAgICBcbiAgICBwb3NMZWZ0ID0gIFswLCBwb3NpdGlvblsxXSAtIDEsIHBvc2l0aW9uWzJdXTtcbiAgICBwb3NSaWdodFswXSA9IHRoaXMueVRvSW5kZXgocG9zUmlnaHRbMl0pICsgcG9zUmlnaHRbMV07XG5cbiAgICBjaGVja0FjdGlvbkJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZVtpbmRleF07XG4gICAgY2hlY2tHcm91bmRCbG9jayA9IHRoaXMuZ3JvdW5kUGxhbmVbaW5kZXhdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7ICsraSkge1xuICAgICAgaWYoYXJyYXlbaV1bMF0gPT09IGluZGV4KSB7XG4gICAgICAgIGNoZWNrSW5kZXggPSAtMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoY2hlY2tBY3Rpb25CbG9jay5ibG9ja1R5cGUgIT09IFwiXCIpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgZWxzZSBpZihhcnJheS5sZW5ndGggPiAwICYmIGNoZWNrSW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgYXJyYXkucHVzaChwb3NpdGlvbik7XG4gICAgYXJyYXkuY29uY2F0KHRoaXMuaG91c2VHcm91bmRUb0Zsb29ySGVscGVyKHBvc0Fib3ZlLCB3b29sVHlwZSwgYXJyYXkpKTtcbiAgICBhcnJheS5jb25jYXQodGhpcy5ob3VzZUdyb3VuZFRvRmxvb3JIZWxwZXIocG9zQmVsb3csIHdvb2xUeXBlLCBhcnJheSkpO1xuICAgIGFycmF5LmNvbmNhdCh0aGlzLmhvdXNlR3JvdW5kVG9GbG9vckhlbHBlcihwb3NSaWdodCwgd29vbFR5cGUsIGFycmF5KSk7XG4gICAgYXJyYXkuY29uY2F0KHRoaXMuaG91c2VHcm91bmRUb0Zsb29ySGVscGVyKHBvc0xlZnQsIHdvb2xUeXBlLCBhcnJheSkpO1xuXG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG5cbiAgaG91c2VHcm91bmRUb0Zsb29yQmxvY2tzKHN0YXJ0aW5nUG9zaXRpb24pIHtcbiAgICAvL2NoZWNrQ2FyZGluYWxEaXJlY3Rpb25zIGZvciBhY3Rpb25ibG9ja3MuXG4gICAgLy9JZiBubyBhY3Rpb24gYmxvY2sgYW5kIHNxdWFyZSBpc24ndCB0aGUgdHlwZSB3ZSB3YW50LlxuICAgIC8vQ2hhbmdlIGl0LlxuICAgIHZhciB3b29sVHlwZSA9IFwid29vbF9vcmFuZ2VcIjtcblxuICAgIC8vUGxhY2UgdGhpcyBibG9jayBoZXJlXG4gICAgLy90aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZ3JvdW5kUGxhbmUsIHN0YXJ0aW5nUG9zaXRpb25bMF0sIHN0YXJ0aW5nUG9zaXRpb25bMV0sIHdvb2xUeXBlKTtcbiAgICB2YXIgaGVscGVyU3RhcnREYXRhID0gWzAsIHN0YXJ0aW5nUG9zaXRpb25bMF0sIHN0YXJ0aW5nUG9zaXRpb25bMV1dO1xuICAgIHJldHVybiB0aGlzLmhvdXNlR3JvdW5kVG9GbG9vckhlbHBlcihoZWxwZXJTdGFydERhdGEsIHdvb2xUeXBlLCBbXSk7XG4gIH1cblxuICBnZXRBbGxCb3JkZXJpbmdQb3NpdGlvbk5vdE9mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSB7XG4gICAgdmFyIHN1cnJvdW5kaW5nQmxvY2tzID0gdGhpcy5nZXRBbGxCb3JkZXJpbmdQb3NpdGlvbihwb3NpdGlvbiwgbnVsbCk7XG4gICAgZm9yKHZhciBiID0gMTsgYiA8IHN1cnJvdW5kaW5nQmxvY2tzLmxlbmd0aDsgKytiKSB7XG4gICAgICBpZihzdXJyb3VuZGluZ0Jsb2Nrc1tiXVswXSAmJiB0aGlzLmFjdGlvblBsYW5lW3RoaXMuY29vcmRpbmF0ZXNUb0luZGV4KHN1cnJvdW5kaW5nQmxvY2tzW2JdWzFdKV0uYmxvY2tUeXBlID09IGJsb2NrVHlwZSkge1xuICAgICAgICBzdXJyb3VuZGluZ0Jsb2Nrc1tiXVswXSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3Vycm91bmRpbmdCbG9ja3M7XG4gIH1cblxuICBnZXRBbGxCb3JkZXJpbmdQb3NpdGlvbihwb3NpdGlvbiwgYmxvY2tUeXBlKSB7XG4gICAgdmFyIHA7XG4gICAgdmFyIGFsbEZvdW5kT2JqZWN0cyA9IFtmYWxzZV07XG4gICAgLy9DaGVjayBhbGwgOCBkaXJlY3Rpb25zXG5cbiAgICAvL1RvcCBSaWdodFxuICAgIHAgPSBbcG9zaXRpb25bMF0gKyAxLCBwb3NpdGlvblsxXSArIDFdO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG4gICAgLy9Ub3AgTGVmdFxuICAgIHAgPSBbcG9zaXRpb25bMF0gLSAxLCBwb3NpdGlvblsxXSArIDFdO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG4gICAgLy9Cb3QgUmlnaHRcbiAgICBwID0gW3Bvc2l0aW9uWzBdICsgMSwgcG9zaXRpb25bMV0gLSAxXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuICAgIC8vQm90IExlZnRcbiAgICBwID0gW3Bvc2l0aW9uWzBdIC0gMSwgcG9zaXRpb25bMV0gLSAxXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy9DaGVjayBjYXJkaW5hbCBEaXJlY3Rpb25zXG4gICAgLy9Ub3BcbiAgICBwID0gW3Bvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSArIDFdO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG4gICAgLy9Cb3RcbiAgICBwID0gW3Bvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSAtIDFdO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG4gICAgLy9SaWdodFxuICAgIHAgPSBbcG9zaXRpb25bMF0gKyAxLCBwb3NpdGlvblsxXV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL0xlZnRcbiAgICBwID0gW3Bvc2l0aW9uWzBdIC0gMSwgcG9zaXRpb25bMV1dO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxsRm91bmRPYmplY3RzO1xuICB9XG5cbiAgZ2V0QWxsQm9yZGVyaW5nUGxheWVyKGJsb2NrVHlwZSl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsQm9yZGVyaW5nUG9zaXRpb24odGhpcy5wbGF5ZXIucG9zaXRpb24sIGJsb2NrVHlwZSk7XG4gIH1cblxuICBpc1BsYXllclN0YW5kaW5nTmVhckNyZWVwZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsQm9yZGVyaW5nUGxheWVyKFwiY3JlZXBlclwiKTtcbiAgfVxuXG4gIGdldE1pbmVjYXJ0VHJhY2soKSB7XG4gICAgdmFyIHRyYWNrID0gW107XG4gICAgdHJhY2sucHVzaChbXCJkb3duXCIsIFszLDJdLCBGYWNpbmdEaXJlY3Rpb24uRG93biwgMzAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJkb3duXCIsIFszLDNdLCBGYWNpbmdEaXJlY3Rpb24uRG93biwgMzAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJkb3duXCIsIFszLDRdLCBGYWNpbmdEaXJlY3Rpb24uRG93biwgMzAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJkb3duXCIsIFszLDVdLCBGYWNpbmdEaXJlY3Rpb24uRG93biwgMzAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJkb3duXCIsIFszLDZdLCBGYWNpbmdEaXJlY3Rpb24uRG93biwgMzAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJkb3duXCIsIFszLDddLCBGYWNpbmdEaXJlY3Rpb24uRG93biwgMzAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJ0dXJuX2xlZnRcIiwgWzMsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbNCw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFs1LDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzYsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbNyw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFs4LDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzksN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbMTAsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbMTEsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgcmV0dXJuIHRyYWNrO1xufVxuXG4gIGNhbk1vdmVGb3J3YXJkKCkge1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcblxuICAgIGxldCBibG9ja0ZvcndhcmRQb3NpdGlvbiA9IHRoaXMuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpO1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChibG9ja0ZvcndhcmRQb3NpdGlvblsxXSkgKyBibG9ja0ZvcndhcmRQb3NpdGlvblswXTtcbiAgICBsZXQgW3gsIHldID0gW2Jsb2NrRm9yd2FyZFBvc2l0aW9uWzBdLCBibG9ja0ZvcndhcmRQb3NpdGlvblsxXV07XG5cbiAgICBpZiAodGhpcy5pbkJvdW5kcyh4LCB5KSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc1dhbGthYmxlIHx8XG4gICAgICAgICAgICAgICAodGhpcy5wbGF5ZXIuaXNPbkJsb2NrICYmICF0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBjYW5QbGFjZUJsb2NrKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY2FuUGxhY2VCbG9ja0ZvcndhcmQoKSB7XG4gICAgaWYgKHRoaXMucGxheWVyLmlzT25CbG9jaykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmdldFBsYW5lVG9QbGFjZU9uKHRoaXMuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpKSAhPT0gbnVsbDtcbiAgfVxuXG4gIGdldFBsYW5lVG9QbGFjZU9uKGNvb3JkaW5hdGVzKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGNvb3JkaW5hdGVzWzFdKSArIGNvb3JkaW5hdGVzWzBdO1xuICAgIGxldCBbeCwgeV0gPSBbY29vcmRpbmF0ZXNbMF0sIGNvb3JkaW5hdGVzWzFdXTtcblxuICAgIGlmICh0aGlzLmluQm91bmRzKHgsIHkpKSB7XG4gICAgICBsZXQgYWN0aW9uQmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdO1xuICAgICAgaWYgKGFjdGlvbkJsb2NrLmlzUGxhY2FibGUpIHtcbiAgICAgICAgbGV0IGdyb3VuZEJsb2NrID0gdGhpcy5ncm91bmRQbGFuZVtibG9ja0luZGV4XTtcbiAgICAgICAgaWYgKGdyb3VuZEJsb2NrLmlzUGxhY2FibGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ncm91bmRQbGFuZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25QbGFuZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNhbkRlc3Ryb3lCbG9ja0ZvcndhcmQoKSB7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLnBsYXllci5pc09uQmxvY2spIHtcbiAgICAgIGxldCBibG9ja0ZvcndhcmRQb3NpdGlvbiA9IHRoaXMuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpO1xuICAgICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdKSArIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzBdO1xuICAgICAgbGV0IFt4LCB5XSA9IFtibG9ja0ZvcndhcmRQb3NpdGlvblswXSwgYmxvY2tGb3J3YXJkUG9zaXRpb25bMV1dO1xuXG4gICAgICBpZiAodGhpcy5pbkJvdW5kcyh4LCB5KSkge1xuICAgICAgICBsZXQgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdO1xuICAgICAgICByZXN1bHQgPSAhYmxvY2suaXNFbXB0eSAmJiAoYmxvY2suaXNEZXN0cm95YWJsZSB8fCBibG9jay5pc1VzYWJsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIG1vdmVGb3J3YXJkKCkge1xuICAgIGxldCBibG9ja0ZvcndhcmRQb3NpdGlvbiA9IHRoaXMuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpO1xuICAgIHRoaXMubW92ZVRvKGJsb2NrRm9yd2FyZFBvc2l0aW9uKTtcbiAgfVxuXG4gIG1vdmVUbyhwb3NpdGlvbikge1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChwb3NpdGlvblsxXSkgKyBwb3NpdGlvblswXTtcblxuICAgIHRoaXMucGxheWVyLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgaWYgKHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSkge1xuICAgICAgdGhpcy5wbGF5ZXIuaXNPbkJsb2NrID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdHVybkxlZnQoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBsYXllci5mYWNpbmcpIHtcbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlVwOlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uTGVmdDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkxlZnQ6XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5Eb3duO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uRG93bjpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLlJpZ2h0O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ6XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5VcDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHVyblJpZ2h0KCkge1xuICAgIHN3aXRjaCAodGhpcy5wbGF5ZXIuZmFjaW5nKSB7XG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5VcDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLlJpZ2h0O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ6XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5Eb3duO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uRG93bjpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLkxlZnQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5MZWZ0OlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uVXA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHBsYWNlQmxvY2soYmxvY2tUeXBlKSB7XG4gICAgbGV0IGJsb2NrUG9zaXRpb24gPSB0aGlzLnBsYXllci5wb3NpdGlvbjtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoYmxvY2tQb3NpdGlvblsxXSkgKyBibG9ja1Bvc2l0aW9uWzBdO1xuICAgIHZhciBzaG91bGRQbGFjZSA9IGZhbHNlO1xuXG4gICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgIGNhc2UgXCJjcm9wV2hlYXRcIjpcbiAgICAgICAgc2hvdWxkUGxhY2UgPSB0aGlzLmdyb3VuZFBsYW5lW2Jsb2NrSW5kZXhdLmJsb2NrVHlwZSA9PT0gXCJmYXJtbGFuZFdldFwiO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc2hvdWxkUGxhY2UgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc2hvdWxkUGxhY2UgPT09IHRydWUpIHtcbiAgICAgIHZhciBibG9jayA9IG5ldyBMZXZlbEJsb2NrKGJsb2NrVHlwZSk7XG5cbiAgICAgIHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0gPSBibG9jaztcbiAgICAgIHRoaXMucGxheWVyLmlzT25CbG9jayA9ICFibG9jay5pc1dhbGthYmxlO1xuICAgIH1cblxuICAgIHJldHVybiBzaG91bGRQbGFjZTtcbiAgfVxuXG4gIHBsYWNlQmxvY2tGb3J3YXJkKGJsb2NrVHlwZSwgdGFyZ2V0UGxhbmUpIHtcbiAgICBsZXQgYmxvY2tQb3NpdGlvbiA9IHRoaXMuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpO1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChibG9ja1Bvc2l0aW9uWzFdKSArIGJsb2NrUG9zaXRpb25bMF07XG5cbiAgICAvL2ZvciBwbGFjaW5nIHdldGxhbmQgZm9yIGNyb3BzIGluIGZyZWUgcGxheVxuICAgIGlmKGJsb2NrVHlwZSA9PT0gXCJ3YXRlcmluZ1wiKSB7XG4gICAgICBibG9ja1R5cGUgPSBcImZhcm1sYW5kV2V0XCI7XG4gICAgICB0YXJnZXRQbGFuZSA9IHRoaXMuZ3JvdW5kUGxhbmU7XG4gICAgfVxuXG4gICAgdGFyZ2V0UGxhbmVbYmxvY2tJbmRleF0gPSBuZXcgTGV2ZWxCbG9jayhibG9ja1R5cGUpO1xuICB9XG5cbiAgZGVzdHJveUJsb2NrKHBvc2l0aW9uKSB7XG4gICAgdmFyIGksXG4gICAgICAgIGJsb2NrID0gbnVsbDtcblxuICAgIGxldCBibG9ja1Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrUG9zaXRpb25bMV0pICsgYmxvY2tQb3NpdGlvblswXTtcbiAgICBsZXQgW3gsIHldID0gW2Jsb2NrUG9zaXRpb25bMF0sIGJsb2NrUG9zaXRpb25bMV1dO1xuICAgIFxuICAgIGlmICh0aGlzLmluQm91bmRzKHgsIHkpKSB7XG4gICAgICBibG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF07XG4gICAgICBpZiAoYmxvY2sgIT09IG51bGwpIHtcbiAgICAgICAgYmxvY2sucG9zaXRpb24gPSBbeCwgeV07XG5cbiAgICAgICAgaWYgKGJsb2NrLmlzRGVzdHJveWFibGUpIHtcbiAgICAgICAgICB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdID0gbmV3IExldmVsQmxvY2soXCJcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBkZXN0cm95QmxvY2tGb3J3YXJkKCkge1xuICAgIHZhciBpLFxuICAgICAgICBzaG91bGRBZGRUb0ludmVudG9yeSA9IHRydWUsXG4gICAgICAgIGJsb2NrID0gbnVsbDtcblxuICAgIGxldCBibG9ja0ZvcndhcmRQb3NpdGlvbiA9IHRoaXMuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpO1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChibG9ja0ZvcndhcmRQb3NpdGlvblsxXSkgKyBibG9ja0ZvcndhcmRQb3NpdGlvblswXTtcbiAgICBsZXQgW3gsIHldID0gW2Jsb2NrRm9yd2FyZFBvc2l0aW9uWzBdLCBibG9ja0ZvcndhcmRQb3NpdGlvblsxXV07XG4gICAgXG4gICAgaWYgKHRoaXMuaW5Cb3VuZHMoeCwgeSkpIHtcbiAgICAgIGJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XTtcbiAgICAgIGlmIChibG9jayAhPT0gbnVsbCkge1xuICAgICAgICBibG9jay5wb3NpdGlvbiA9IFt4LCB5XTtcbiAgICAgICAgbGV0IGludmVudG9yeVR5cGUgPSB0aGlzLmdldEludmVudG9yeVR5cGUoYmxvY2suYmxvY2tUeXBlKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuaW52ZW50b3J5W2ludmVudG9yeVR5cGVdID1cbiAgICAgICAgICAgICh0aGlzLnBsYXllci5pbnZlbnRvcnlbaW52ZW50b3J5VHlwZV0gfHwgMCkgKyAxO1xuXG4gICAgICAgIGlmIChibG9jay5pc0Rlc3Ryb3lhYmxlKSB7XG4gICAgICAgICAgdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XSA9IG5ldyBMZXZlbEJsb2NrKFwiXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2NrO1xuICB9XG5cbiAgZ2V0SW52ZW50b3J5VHlwZShibG9ja1R5cGUpIHtcbiAgICBzd2l0Y2ggKGJsb2NrVHlwZSkge1xuICAgICAgY2FzZSBcInNoZWVwXCI6XG4gICAgICAgIHJldHVybiBcIndvb2xcIjtcbiAgICAgIGNhc2UgXCJzdG9uZVwiOlxuICAgICAgICByZXR1cm4gXCJjb2JibGVzdG9uZVwiO1xuICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgY2FzZSBcInRyZWVTcHJ1Y2VcIjpcbiAgICAgICAgcmV0dXJuIFwicGxhbmtzXCIgKyBibG9ja1R5cGUuc3Vic3RyaW5nKDQpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGJsb2NrVHlwZTtcbiAgICB9XG4gIH1cblxuICBzb2x2ZUZPV1R5cGVGb3JNYXAoKSB7XG4gICAgdmFyIGVtaXNzaXZlcyxcbiAgICAgICAgYmxvY2tzVG9Tb2x2ZTtcblxuICAgIGVtaXNzaXZlcyA9IHRoaXMuZ2V0QWxsRW1pc3NpdmVzKCk7XG4gICAgYmxvY2tzVG9Tb2x2ZSA9IHRoaXMuZmluZEJsb2Nrc0FmZmVjdGVkQnlFbWlzc2l2ZXMoZW1pc3NpdmVzKTtcblxuICAgIGZvcih2YXIgYmxvY2sgaW4gYmxvY2tzVG9Tb2x2ZSkge1xuICAgICAgaWYoYmxvY2tzVG9Tb2x2ZS5oYXNPd25Qcm9wZXJ0eShibG9jaykpIHtcbiAgICAgICAgdGhpcy5zb2x2ZUZPV1R5cGVGb3IoYmxvY2tzVG9Tb2x2ZVtibG9ja10sIGVtaXNzaXZlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc29sdmVGT1dUeXBlRm9yKHBvc2l0aW9uLCBlbWlzc2l2ZXMpIHtcbiAgICB2YXIgZW1pc3NpdmVzVG91Y2hpbmcsXG4gICAgICAgIHRvcExlZnRRdWFkID0gZmFsc2UsXG4gICAgICAgIGJvdExlZnRRdWFkID0gZmFsc2UsXG4gICAgICAgIGxlZnRRdWFkID0gZmFsc2UsXG4gICAgICAgIHRvcFJpZ2h0UXVhZCA9IGZhbHNlLFxuICAgICAgICBib3RSaWdodFF1YWQgPSBmYWxzZSxcbiAgICAgICAgcmlnaHRRdWFkID0gZmFsc2UsXG4gICAgICAgIHRvcFF1YWQgPSBmYWxzZSxcbiAgICAgICAgYm90UXVhZCA9IGZhbHNlLFxuICAgICAgICBhbmdsZSA9IDAsXG4gICAgICAgIGluZGV4ID0gdGhpcy5jb29yZGluYXRlc1RvSW5kZXgocG9zaXRpb24pLFxuICAgICAgICB4LFxuICAgICAgICB5O1xuXG4gICAgZW1pc3NpdmVzVG91Y2hpbmcgPSB0aGlzLmZpbmRFbWlzc2l2ZXNUaGF0VG91Y2gocG9zaXRpb24sIGVtaXNzaXZlcyk7XG5cbiAgICBmb3IodmFyIHRvcmNoIGluIGVtaXNzaXZlc1RvdWNoaW5nKSB7XG4gICAgICB2YXIgY3VycmVudFRvcmNoID0gZW1pc3NpdmVzVG91Y2hpbmdbdG9yY2hdO1xuICAgICAgeSA9IHBvc2l0aW9uWzFdO1xuICAgICAgeCA9IHBvc2l0aW9uWzBdO1xuXG4gICAgICBhbmdsZSA9IE1hdGguYXRhbjIoY3VycmVudFRvcmNoWzFdIC0gcG9zaXRpb25bMV0sIGN1cnJlbnRUb3JjaFswXSAtIHBvc2l0aW9uWzBdKTtcbiAgICAgIC8vaW52ZXJ0XG4gICAgICBhbmdsZSA9IC1hbmdsZTtcbiAgICAgIC8vTm9ybWFsaXplIHRvIGJlIGJldHdlZW4gMCBhbmQgMipwaVxuICAgICAgaWYoYW5nbGUgPCAwKSB7XG4gICAgICAgIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xuICAgICAgfVxuICAgICAgLy9jb252ZXJ0IHRvIGRlZ3JlZXMgZm9yIHNpbXBsaWNpdHlcbiAgICAgIGFuZ2xlICo9IDM2MCAvICgyKk1hdGguUEkpO1xuXG4gICAgICAvL3RvcCByaWdodFxuICAgICAgaWYoIXJpZ2h0UXVhZCAmJmFuZ2xlID4gMzIuNSAmJiBhbmdsZSA8PSA1Ny41KSB7XG4gICAgICAgIHRvcFJpZ2h0UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0luQ29ybmVyX1RvcFJpZ2h0XCIsIHByZWNlZGVuY2U6IDAgfSk7XG4gICAgICB9Ly90b3AgbGVmdFxuICAgICAgaWYoIWxlZnRRdWFkICYmYW5nbGUgPiAxMjIuNSAmJiBhbmdsZSA8PSAxNDcuNSkge1xuICAgICAgICB0b3BMZWZ0UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0luQ29ybmVyX1RvcExlZnRcIiwgcHJlY2VkZW5jZTogMH0pO1xuICAgICAgfS8vYm90IGxlZnRcbiAgICAgIGlmKCFsZWZ0UXVhZCAmJmFuZ2xlID4gMjEyLjUgJiYgYW5nbGUgPD0gMjM3LjUpIHtcbiAgICAgICAgYm90TGVmdFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9JbkNvcm5lcl9Cb3R0b21MZWZ0XCIsIHByZWNlZGVuY2U6IDB9KTtcbiAgICAgIH0vL2JvdHJpZ2h0XG4gICAgICBpZighcmlnaHRRdWFkICYmIGFuZ2xlID4gMzAyLjUgJiYgYW5nbGUgPD0gMzE3LjUpIHtcbiAgICAgICAgYm90UmlnaHRRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfSW5Db3JuZXJfQm90dG9tUmlnaHRcIiwgcHJlY2VkZW5jZTogMH0pO1xuICAgICAgfVxuICAgICAgLy9yaWdodFxuICAgICAgaWYoYW5nbGUgPj0gMzI3LjUgfHwgYW5nbGUgPD0gMzIuNSkge1xuICAgICAgICByaWdodFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9SaWdodFwiICwgcHJlY2VkZW5jZTogMX0pO1xuICAgICAgfS8vYm90XG4gICAgICBpZihhbmdsZSA+IDIzNy41ICYmIGFuZ2xlIDw9IDMwMi41KSB7XG4gICAgICAgIGJvdFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Cb3R0b21cIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgICAgfVxuICAgICAgLy9sZWZ0XG4gICAgICBpZihhbmdsZSA+IDE0Ny41ICYmIGFuZ2xlIDw9IDIxMi41KSB7XG4gICAgICAgIGxlZnRRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfTGVmdFwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgICB9XG4gICAgICAvL3RvcFxuICAgICAgaWYoYW5nbGUgPiA1Ny41ICYmIGFuZ2xlIDw9IDEyMi41KSB7XG4gICAgICAgIHRvcFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Ub3BcIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHRvcExlZnRRdWFkICYmIGJvdExlZnRRdWFkKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9MZWZ0XCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICB9XG4gICAgaWYodG9wUmlnaHRRdWFkICYmIGJvdFJpZ2h0UXVhZCkge1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfUmlnaHRcIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgIH1cbiAgICBpZih0b3BMZWZ0UXVhZCAmJiB0b3BSaWdodFF1YWQpIHtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX1RvcFwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgfVxuICAgIGlmKGJvdFJpZ2h0UXVhZCAmJiBib3RMZWZ0UXVhZCkge1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfQm90dG9tXCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICB9XG5cbiAgICAvL2Z1bGx5IGxpdFxuICAgIGlmKCAoYm90UmlnaHRRdWFkICYmIHRvcExlZnRRdWFkKSB8fCAoYm90TGVmdFF1YWQgJiYgdG9wUmlnaHRRdWFkKSB8fCBsZWZ0UXVhZCAmJiByaWdodFF1YWQgfHwgdG9wUXVhZCAmJiBib3RRdWFkIHx8IChyaWdodFF1YWQgJiYgYm90UXVhZCAmJiB0b3BMZWZ0UXVhZCkgfHxcbiAgICAgICAgKGJvdFF1YWQgJiYgdG9wUmlnaHRRdWFkICYmIHRvcExlZnRRdWFkKSB8fCAodG9wUXVhZCAmJiBib3RSaWdodFF1YWQgJiYgYm90TGVmdFF1YWQpIHx8IChsZWZ0UXVhZCAmJiB0b3BSaWdodFF1YWQgJiYgYm90UmlnaHRRdWFkKSB8fCAobGVmdFF1YWQgJiYgYm90UXVhZCAmJiB0b3BSaWdodFF1YWQpKSB7XG4gICAgICB0aGlzLmZvd1BsYW5lW2luZGV4XSA9IFwiXCI7XG4gICAgfVxuXG4gICAgLy9kYXJrZW5kIGJvdGxlZnQgY29ybmVyXG4gICAgZWxzZSBpZiggKGJvdFF1YWQgJiYgbGVmdFF1YWQpIHx8IChib3RRdWFkICYmIHRvcExlZnRRdWFkKSB8fCAobGVmdFF1YWQgJiYgYm90UmlnaHRRdWFkKSApe1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfQm90dG9tX0xlZnRcIiwgcHJlY2VkZW5jZTogMn0pO1xuICAgIH1cbiAgICAvL2RhcmtlbmQgYm90UmlnaHQgY29ybmVyXG4gICAgZWxzZSBpZigoYm90UXVhZCAmJiByaWdodFF1YWQpIHx8IChib3RRdWFkICYmIHRvcFJpZ2h0UXVhZCkgfHwgKHJpZ2h0UXVhZCAmJiBib3RMZWZ0UXVhZCkpIHtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0JvdHRvbV9SaWdodFwiLCBwcmVjZWRlbmNlOiAyfSk7XG4gICAgfVxuICAgIC8vZGFya2VuZCB0b3BSaWdodCBjb3JuZXJcbiAgICBlbHNlIGlmKCh0b3BRdWFkICYmIHJpZ2h0UXVhZCkgfHwgKHRvcFF1YWQgJiYgYm90UmlnaHRRdWFkKSB8fCAocmlnaHRRdWFkICYmIHRvcExlZnRRdWFkKSkge1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfVG9wX1JpZ2h0XCIsIHByZWNlZGVuY2U6IDJ9KTtcbiAgICB9XG4gICAgLy9kYXJrZW5kIHRvcExlZnQgY29ybmVyXG4gICAgZWxzZSBpZigodG9wUXVhZCAmJiBsZWZ0UXVhZCkgfHwgKHRvcFF1YWQgJiYgYm90TGVmdFF1YWQpIHx8IChsZWZ0UXVhZCAmJiB0b3BSaWdodFF1YWQpKXtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX1RvcF9MZWZ0XCIsIHByZWNlZGVuY2U6IDJ9KTtcbiAgICB9XG4gIH1cblxuICBwdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCBmb3dPYmplY3QpIHtcbiAgICBpZiAoZm93T2JqZWN0ID09PSBcIlwiKSB7XG4gICAgICB0aGlzLmZvd1BsYW5lW2luZGV4XSA9IFwiXCI7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBleGlzdGluZ0l0ZW0gPSB0aGlzLmZvd1BsYW5lW2luZGV4XTtcbiAgICBpZiAoZXhpc3RpbmdJdGVtICYmIGV4aXN0aW5nSXRlbS5wcmVjZWRlbmNlID4gZm93T2JqZWN0LnByZWNlZGVuY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5mb3dQbGFuZVtpbmRleF0gPSBmb3dPYmplY3Q7XG4gIH1cblxuICBnZXRBbGxFbWlzc2l2ZXMoKXtcbiAgICB2YXIgZW1pc3NpdmVzID0gW107XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoW3gseV0pO1xuICAgICAgICBpZighdGhpcy5hY3Rpb25QbGFuZVtpbmRleF0uaXNFbXB0eSAmJiB0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5pc0VtaXNzaXZlIHx8IHRoaXMuZ3JvdW5kUGxhbmVbaW5kZXhdLmlzRW1pc3NpdmUgJiYgdGhpcy5hY3Rpb25QbGFuZVtpbmRleF0uaXNFbXB0eSApIHtcbiAgICAgICAgICBlbWlzc2l2ZXMucHVzaChbeCx5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVtaXNzaXZlcztcbiAgfVxuXG4gIGZpbmRCbG9ja3NBZmZlY3RlZEJ5RW1pc3NpdmVzKGVtaXNzaXZlcykge1xuICAgIHZhciBibG9ja3NUb3VjaGVkQnlFbWlzc2l2ZXMgPSB7fTtcbiAgICAvL2ZpbmQgZW1pc3NpdmVzIHRoYXQgYXJlIGNsb3NlIGVub3VnaCB0byBsaWdodCB1cy5cbiAgICBmb3IodmFyIHRvcmNoIGluIGVtaXNzaXZlcylcbiAgICB7XG4gICAgICB2YXIgY3VycmVudFRvcmNoID0gZW1pc3NpdmVzW3RvcmNoXTtcbiAgICAgIGxldCB5ID0gY3VycmVudFRvcmNoWzFdO1xuICAgICAgbGV0IHggPSBjdXJyZW50VG9yY2hbMF07XG4gICAgICBmb3IgKHZhciB5SW5kZXggPSBjdXJyZW50VG9yY2hbMV0gLSAyOyB5SW5kZXggPD0gKGN1cnJlbnRUb3JjaFsxXSArIDIpOyArK3lJbmRleCkge1xuICAgICAgICBmb3IgKHZhciB4SW5kZXggPSBjdXJyZW50VG9yY2hbMF0gLSAyOyB4SW5kZXggPD0gKGN1cnJlbnRUb3JjaFswXSArIDIpOyArK3hJbmRleCkge1xuXG4gICAgICAgICAgLy9FbnN1cmUgd2UncmUgbG9va2luZyBpbnNpZGUgdGhlIG1hcFxuICAgICAgICAgIGlmKCF0aGlzLmluQm91bmRzKHhJbmRleCwgeUluZGV4KSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9JZ25vcmUgdGhlIGluZGV4ZXMgZGlyZWN0bHkgYXJvdW5kIHVzLlxuICAgICAgICAgIC8vVGhleXJlIHRha2VuIGNhcmUgb2Ygb24gdGhlIEZPVyBmaXJzdCBwYXNzIFxuICAgICAgICAgIGlmKCAoeUluZGV4ID49IHkgLSAxICYmIHlJbmRleCA8PSB5ICsgMSkgJiYgKHhJbmRleCA+PSB4IC0gMSAmJiB4SW5kZXggPD0geCArIDEpICkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy93ZSB3YW50IHVuaXF1ZSBjb3BpZXMgc28gd2UgdXNlIGEgbWFwLlxuICAgICAgICAgIGJsb2Nrc1RvdWNoZWRCeUVtaXNzaXZlc1t5SW5kZXgudG9TdHJpbmcoKSArIHhJbmRleC50b1N0cmluZygpXSA9IFt4SW5kZXgseUluZGV4XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBibG9ja3NUb3VjaGVkQnlFbWlzc2l2ZXM7XG4gIH1cblxuICBmaW5kRW1pc3NpdmVzVGhhdFRvdWNoKHBvc2l0aW9uLCBlbWlzc2l2ZXMpIHtcbiAgICB2YXIgZW1pc3NpdmVzVGhhdFRvdWNoID0gW107XG4gICAgbGV0IHkgPSBwb3NpdGlvblsxXTtcbiAgICBsZXQgeCA9IHBvc2l0aW9uWzBdO1xuICAgIC8vZmluZCBlbWlzc2l2ZXMgdGhhdCBhcmUgY2xvc2UgZW5vdWdoIHRvIGxpZ2h0IHVzLlxuICAgIGZvciAodmFyIHlJbmRleCA9IHkgLSAyOyB5SW5kZXggPD0gKHkgKyAyKTsgKyt5SW5kZXgpIHtcbiAgICAgIGZvciAodmFyIHhJbmRleCA9IHggLSAyOyB4SW5kZXggPD0gKHggKyAyKTsgKyt4SW5kZXgpIHtcblxuICAgICAgICAvL0Vuc3VyZSB3ZSdyZSBsb29raW5nIGluc2lkZSB0aGUgbWFwXG4gICAgICAgIGlmKCF0aGlzLmluQm91bmRzKHhJbmRleCwgeUluZGV4KSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9JZ25vcmUgdGhlIGluZGV4ZXMgZGlyZWN0bHkgYXJvdW5kIHVzLiBcbiAgICAgICAgaWYoICh5SW5kZXggPj0geSAtIDEgJiYgeUluZGV4IDw9IHkgKyAxKSAmJiAoeEluZGV4ID49IHggLSAxICYmIHhJbmRleCA8PSB4ICsgMSkgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IodmFyIHRvcmNoIGluIGVtaXNzaXZlcykge1xuICAgICAgICAgIGlmKGVtaXNzaXZlc1t0b3JjaF1bMF0gPT09IHhJbmRleCAmJiBlbWlzc2l2ZXNbdG9yY2hdWzFdID09PSB5SW5kZXgpIHtcbiAgICAgICAgICAgIGVtaXNzaXZlc1RoYXRUb3VjaC5wdXNoKGVtaXNzaXZlc1t0b3JjaF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBlbWlzc2l2ZXNUaGF0VG91Y2g7XG4gIH1cblxuICBjb21wdXRlRm93UGxhbmUoKSB7XG4gICAgdmFyIHgsIHk7XG5cbiAgICB0aGlzLmZvd1BsYW5lID0gW107XG4gICAgaWYgKHRoaXMuaXNEYXl0aW1lKSB7XG4gICAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICAgIC8vIHRoaXMuZm93UGxhbmUucHVzaFtcIlwiXTsgLy8gbm9vcCBhcyBvcmlnaW5hbGx5IHdyaXR0ZW5cbiAgICAgICAgICAvLyBUT0RPKGJqb3JkYW4pIGNvbXBsZXRlbHkgcmVtb3ZlP1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbXB1dGUgdGhlIGZvZyBvZiB3YXIgZm9yIGxpZ2h0IGVtaXR0aW5nIGJsb2Nrc1xuICAgICAgZm9yICh5ID0gMDsgeSA8IHRoaXMucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgICBmb3IgKHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgICB0aGlzLmZvd1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0NlbnRlclwiIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vc2Vjb25kIHBhc3MgZm9yIHBhcnRpYWwgbGl0IHNxdWFyZXNcbiAgICAgIHRoaXMuc29sdmVGT1dUeXBlRm9yTWFwKCk7XG5cbiAgICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHkpICsgeDtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAodGhpcy5ncm91bmRQbGFuZVtibG9ja0luZGV4XS5pc0VtaXNzaXZlICYmIHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSB8fFxuICAgICAgICAgICAgKCF0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkgJiYgdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtaXNzaXZlKSkge1xuICAgICAgICAgICAgdGhpcy5jbGVhckZvd0Fyb3VuZCh4LCB5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuXG4gICAgfVxuICB9XG5cbiAgY2xlYXJGb3dBcm91bmQoeCwgeSkge1xuICAgIHZhciBveCwgb3k7XG5cbiAgICBmb3IgKG95ID0gLTE7IG95IDw9IDE7ICsrb3kpIHtcbiAgICAgIGZvciAob3ggPSAtMTsgb3ggPD0gMTsgKytveCkge1xuICAgICAgICB0aGlzLmNsZWFyRm93QXQoeCArIG94LCB5ICsgb3kpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNsZWFyRm93QXQoeCwgeSkge1xuICAgIGlmICh4ID49IDAgJiYgeCA8IHRoaXMucGxhbmVXaWR0aCAmJiB5ID49IDAgJiYgeSA8IHRoaXMucGxhbmVIZWlnaHQpIHtcbiAgICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleCh5KSArIHg7XG4gICAgICB0aGlzLmZvd1BsYW5lW2Jsb2NrSW5kZXhdID0gXCJcIjtcbiAgICB9XG4gIH1cblxuICBjb21wdXRlU2hhZGluZ1BsYW5lKCkge1xuICAgIHZhciB4LFxuICAgICAgICB5LFxuICAgICAgICBpbmRleCxcbiAgICAgICAgaGFzTGVmdCxcbiAgICAgICAgaGFzUmlnaHQ7XG5cbiAgICB0aGlzLnNoYWRpbmdQbGFuZSA9IFtdO1xuXG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5wbGFuZUFyZWEoKTsgKytpbmRleCkge1xuICAgICAgeCA9IGluZGV4ICUgdGhpcy5wbGFuZVdpZHRoO1xuICAgICAgeSA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLnBsYW5lV2lkdGgpO1xuXG4gICAgICBoYXNMZWZ0ID0gZmFsc2U7XG4gICAgICBoYXNSaWdodCA9IGZhbHNlO1xuICAgICAgXG4gICAgICBpZiAodGhpcy5hY3Rpb25QbGFuZVtpbmRleF0uaXNFbXB0eSB8fCB0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5pc1RyYW5zcGFyZW50KSB7XG4gICAgICAgIGlmICh5ID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Cb3R0b20nIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHkgPT09IHRoaXMucGxhbmVIZWlnaHQgLSAxKSB7XG4gICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Ub3AnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHggPT09IDApIHtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1JpZ2h0JyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh4ID09PSB0aGlzLnBsYW5lV2lkdGggLSAxKSB7XG4gICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9MZWZ0JyB9KTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKHggPCB0aGlzLnBsYW5lV2lkdGggLSAxICYmICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSkgKyB4ICsgMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAvLyBuZWVkcyBhIGxlZnQgc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0xlZnQnIH0pO1xuICAgICAgICAgIGhhc0xlZnQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHggPiAwICYmICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSkgKyB4IC0gMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAvLyBuZWVkcyBhIHJpZ2h0IHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9SaWdodCcgfSk7XG4gICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdTaGFkb3dfUGFydHNfRmFkZV9iYXNlLnBuZycgfSk7XG5cbiAgICAgICAgICBpZiAoeSA+IDAgJiYgeCA+IDAgJiYgdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkgLSAxKSArIHggLSAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdTaGFkb3dfUGFydHNfRmFkZV90b3AucG5nJyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBoYXNSaWdodCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeSA+IDAgJiYgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5IC0gMSkgKyB4XS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgIC8vIG5lZWRzIGEgYm90dG9tIHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Cb3R0b20nIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHkgPiAwKSB7XG4gICAgICAgICAgaWYgKHggPCB0aGlzLnBsYW5lV2lkdGggLSAxICYmIFxuICAgICAgICAgICAgICAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkgLSAxKSArIHggKyAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSAmJlxuICAgICAgICAgICAgICB0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSkgKyB4ICsgMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAgIC8vIG5lZWRzIGEgYm90dG9tIGxlZnQgc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfQm90dG9tTGVmdCcgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFoYXNSaWdodCAmJiB4ID4gMCAmJiAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkgLSAxKSArIHggLSAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgICAgLy8gbmVlZHMgYSBib3R0b20gcmlnaHQgc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfQm90dG9tUmlnaHQnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh5IDwgdGhpcy5wbGFuZUhlaWdodCAtIDEpIHtcbiAgICAgICAgICBpZiAoeCA8IHRoaXMucGxhbmVXaWR0aCAtIDEgJiYgXG4gICAgICAgICAgICAgICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSArIDEpICsgeCArIDFdLmdldElzRW1wdHlPckVudGl0eSgpICYmXG4gICAgICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHggKyAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgICAgLy8gbmVlZHMgYSBib3R0b20gbGVmdCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Ub3BMZWZ0JyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWhhc1JpZ2h0ICYmIHggPiAwICYmICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSArIDEpICsgeCAtIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgICAvLyBuZWVkcyBhIGJvdHRvbSByaWdodCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Ub3BSaWdodCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBMZXZlbEJsb2NrIHtcbiAgY29uc3RydWN0b3IoYmxvY2tUeXBlKSB7XG4gICAgdGhpcy5ibG9ja1R5cGUgPSBibG9ja1R5cGU7XG5cbiAgICAvLyBEZWZhdWx0IHZhbHVlcyBhcHBseSB0byBzaW1wbGUsIGFjdGlvbi1wbGFuZSBkZXN0cm95YWJsZSBibG9ja3NcbiAgICB0aGlzLmlzRW50aXR5ID0gZmFsc2U7XG4gICAgdGhpcy5pc1dhbGthYmxlID0gZmFsc2U7XG4gICAgdGhpcy5pc0RlYWRseSA9IGZhbHNlO1xuICAgIHRoaXMuaXNQbGFjYWJsZSA9IGZhbHNlOyAvLyB3aGV0aGVyIGFub3RoZXIgYmxvY2sgY2FuIGJlIHBsYWNlZCBpbiB0aGlzIGJsb2NrJ3Mgc3BvdFxuICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IHRydWU7XG4gICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgdGhpcy5pc0VtcHR5ID0gZmFsc2U7XG4gICAgdGhpcy5pc0VtaXNzaXZlID0gZmFsc2U7XG4gICAgdGhpcy5pc1RyYW5zcGFyZW50ID0gZmFsc2U7XG5cbiAgICBpZiAoYmxvY2tUeXBlID09PSBcIlwiKSB7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc1BsYWNhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlLm1hdGNoKCd0b3JjaCcpKSB7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1BsYWNhYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZihibG9ja1R5cGUuc3Vic3RyaW5nKDAsIDUpID09IFwicmFpbHNcIilcbiAgICB7XG4gICAgICB0aGlzLmlzRW50aXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzVXNhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1RyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwic2hlZXBcIikge1xuICAgICAgdGhpcy5pc0VudGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJjcmVlcGVyXCIpe1xuICAgICAgdGhpcy5pc0VudGl0eSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcImdsYXNzXCIpe1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcImJlZHJvY2tcIil7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwibGF2YVwiKSB7XG4gICAgICB0aGlzLmlzRW1pc3NpdmUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZWFkbHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc1BsYWNhYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwid2F0ZXJcIikge1xuICAgICAgdGhpcy5pc1BsYWNhYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwidG9yY2hcIikge1xuICAgICAgdGhpcy5pc0VtaXNzaXZlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNFbnRpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJjcm9wV2hlYXRcIikge1xuICAgICAgdGhpcy5pc0VtaXNzaXZlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzRW50aXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzVXNhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1RyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwidG50XCIpIHtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZihibG9ja1R5cGUgPT0gXCJkb29yXCIpIHtcbiAgICAgIHRoaXMuaXNFbnRpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGdldElzVHJlZSgpIHtcbiAgICByZXR1cm4gISF0aGlzLmJsb2NrVHlwZS5tYXRjaCgvXnRyZWUvKTtcbiAgfVxuXG4gIGdldElzRW1wdHlPckVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0VtcHR5IHx8IHRoaXMuaXNFbnRpdHk7XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IE9iamVjdC5mcmVlemUoe1xuICAgIFVwOiAwLFxuICAgIFJpZ2h0OiAxLFxuICAgIERvd246IDIsXG4gICAgTGVmdDogM1xufSk7XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBBc3NldExvYWRlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRyb2xsZXIpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgIHRoaXMuYXVkaW9QbGF5ZXIgPSBjb250cm9sbGVyLmF1ZGlvUGxheWVyO1xuICAgIHRoaXMuZ2FtZSA9IGNvbnRyb2xsZXIuZ2FtZTtcbiAgICB0aGlzLmFzc2V0Um9vdCA9IGNvbnRyb2xsZXIuYXNzZXRSb290O1xuXG4gICAgdGhpcy5hc3NldHMgPSB7XG4gICAgICBlbnRpdHlTaGFkb3c6IHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0NoYXJhY3Rlcl9TaGFkb3cucG5nYFxuICAgICAgfSxcbiAgICAgIHNlbGVjdGlvbkluZGljYXRvcjoge1xuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICBwYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvU2VsZWN0aW9uX0luZGljYXRvci5wbmdgXG4gICAgICB9LFxuICAgICAgc2hhZGVMYXllcjoge1xuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICBwYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvU2hhZGVfTGF5ZXIucG5nYFxuICAgICAgfSxcbiAgICAgIHRhbGxHcmFzczoge1xuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICBwYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvVGFsbEdyYXNzLnBuZ2BcbiAgICAgIH0sXG4gICAgICBmaW5pc2hPdmVybGF5OiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9XaGl0ZVJlY3QucG5nYFxuICAgICAgfSxcbiAgICAgIGJlZDoge1xuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICBwYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQmVkLnBuZ2BcbiAgICAgIH0sXG4gICAgICBwbGF5ZXJTdGV2ZToge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1N0ZXZlMTAxMy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1N0ZXZlMTAxMy5qc29uYFxuICAgICAgfSxcbiAgICAgIHBsYXllckFsZXg6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9BbGV4MTAxMy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0FsZXgxMDEzLmpzb25gXG4gICAgICB9LFxuICAgICAgQU86IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9BTy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0FPLmpzb25gXG4gICAgICB9LFxuICAgICAgYmxvY2tTaGFkb3dzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQmxvY2tfU2hhZG93cy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Jsb2NrX1NoYWRvd3MuanNvbmBcbiAgICAgIH0sXG4gICAgICB1bmRlcmdyb3VuZEZvdzoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1VuZGVyZ3JvdW5kRm9XLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvVW5kZXJncm91bmRGb1cuanNvbmBcbiAgICAgIH0sXG4gICAgICBibG9ja3M6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja3MucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja3MuanNvbmBcbiAgICAgIH0sXG4gICAgICBsZWF2ZXNBY2FjaWE6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfQWNhY2lhX0RlY2F5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0FjYWNpYV9EZWNheS5qc29uYFxuICAgICAgfSxcbiAgICAgIGxlYXZlc0JpcmNoOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0JpcmNoX0RlY2F5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0JpcmNoX0RlY2F5Lmpzb25gXG4gICAgICB9LFxuICAgICAgbGVhdmVzSnVuZ2xlOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0p1bmdsZV9EZWNheS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19KdW5nbGVfRGVjYXkuanNvbmBcbiAgICAgIH0sXG4gICAgICBsZWF2ZXNPYWs6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfT2FrX0RlY2F5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX09ha19EZWNheS5qc29uYFxuICAgICAgfSxcbiAgICAgIGxlYXZlc1NwcnVjZToge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19TcHJ1Y2VfRGVjYXkucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfU3BydWNlX0RlY2F5Lmpzb25gXG4gICAgICB9LFxuICAgICAgc2hlZXA6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TaGVlcC5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1NoZWVwLmpzb25gXG4gICAgICB9LFxuICAgICAgY3JlZXBlcjoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0NyZWVwZXIucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9DcmVlcGVyLmpzb25gXG4gICAgICB9LFxuICAgICAgY3JvcHM6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9Dcm9wcy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Nyb3BzLmpzb25gXG4gICAgICB9LFxuICAgICAgdG9yY2g6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9Ub3JjaC5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1RvcmNoLmpzb25gXG4gICAgICB9LFxuICAgICAgZGVzdHJveU92ZXJsYXk6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9EZXN0cm95X092ZXJsYXkucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9EZXN0cm95X092ZXJsYXkuanNvbmBcbiAgICAgIH0sXG4gICAgICBibG9ja0V4cGxvZGU6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja0V4cGxvZGUucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja0V4cGxvZGUuanNvbmBcbiAgICAgIH0sXG4gICAgICBtaW5pbmdQYXJ0aWNsZXM6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9NaW5pbmdQYXJ0aWNsZXMucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9NaW5pbmdQYXJ0aWNsZXMuanNvbmBcbiAgICAgIH0sXG4gICAgICBtaW5pQmxvY2tzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTWluaWJsb2Nrcy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL01pbmlibG9ja3MuanNvbmBcbiAgICAgIH0sXG4gICAgICBsYXZhUG9wOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGF2YVBvcC5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xhdmFQb3AuanNvbmBcbiAgICAgIH0sXG4gICAgICBmaXJlOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRmlyZS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0ZpcmUuanNvbmBcbiAgICAgIH0sXG4gICAgICBidWJibGVzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQnViYmxlcy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0J1YmJsZXMuanNvbmBcbiAgICAgIH0sXG4gICAgICBleHBsb3Npb246IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9FeHBsb3Npb24ucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9FeHBsb3Npb24uanNvbmBcbiAgICAgIH0sXG4gICAgICBkb29yOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRG9vci5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Rvb3IuanNvbmBcbiAgICAgIH0sXG4gICAgICByYWlsczoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1JhaWxzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvUmFpbHMuanNvbmBcbiAgICAgIH0sXG4gICAgICB0bnQ6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9UTlQucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9UTlQuanNvbmBcbiAgICAgIH0sXG4gICAgICBkaWdfd29vZDE6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9kaWdfd29vZDEubXAzYCxcbiAgICAgICAgd2F2OiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9kaWdfd29vZDEud2F2YCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9kaWdfd29vZDEub2dnYFxuICAgICAgfSxcbiAgICAgIHN0ZXBHcmFzczoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3N0ZXBfZ3Jhc3MxLm1wM2AsXG4gICAgICAgIHdhdjogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vc3RlcF9ncmFzczEud2F2YCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zdGVwX2dyYXNzMS5vZ2dgXG4gICAgICB9LFxuICAgICAgc3RlcFdvb2Q6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby93b29kMi5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3dvb2QyLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzdGVwU3RvbmU6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zdG9uZTIubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zdG9uZTIub2dnYFxuICAgICAgfSxcbiAgICAgIHN0ZXBHcmF2ZWw6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9ncmF2ZWwxLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZ3JhdmVsMS5vZ2dgXG4gICAgICB9LFxuICAgICAgc3RlcEZhcm1sYW5kOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGg0Lm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGg0Lm9nZ2BcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vYnJlYWsubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9icmVhay5vZ2dgXG4gICAgICB9LFxuICAgICAgc3VjY2Vzczoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2xldmVsdXAubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9sZXZlbHVwLm9nZ2BcbiAgICAgIH0sXG4gICAgICBmYWxsOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZmFsbHNtYWxsLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZmFsbHNtYWxsLm9nZ2BcbiAgICAgIH0sXG4gICAgICBmdXNlOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZnVzZS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Z1c2Uub2dnYFxuICAgICAgfSxcbiAgICAgIGV4cGxvZGU6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9leHBsb2RlMy5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2V4cGxvZGUzLm9nZ2BcbiAgICAgIH0sXG4gICAgICBwbGFjZUJsb2NrOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGgxLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vY2xvdGgxLm9nZ2BcbiAgICAgIH0sXG4gICAgICBjb2xsZWN0ZWRCbG9jazoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3BvcC5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3BvcC5vZ2dgXG4gICAgICB9LFxuICAgICAgYnVtcDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2hpdDMubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9oaXQzLm9nZ2BcbiAgICAgIH0sXG4gICAgICBwdW5jaDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Nsb3RoMS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Nsb3RoMS5vZ2dgXG4gICAgICB9LFxuICAgICAgZml6ejoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2ZpenoubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9maXp6Lm9nZ2BcbiAgICAgIH0sXG4gICAgICBkb29yT3Blbjoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Rvb3Jfb3Blbi5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Rvb3Jfb3Blbi5vZ2dgXG4gICAgICB9LFxuICAgICAgaG91c2VTdWNjZXNzOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbGF1bmNoMS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2xhdW5jaDEub2dnYFxuICAgICAgfSxcbiAgICAgIG1pbmVjYXJ0OiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbWluZWNhcnRCYXNlLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbWluZWNhcnRCYXNlLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzaGVlcEJhYToge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3NheTMubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zYXkzLm9nZ2BcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5hc3NldFBhY2tzID0ge1xuICAgICAgbGV2ZWxPbmVBc3NldHM6IFtcbiAgICAgICAgJ2VudGl0eVNoYWRvdycsXG4gICAgICAgICdzZWxlY3Rpb25JbmRpY2F0b3InLFxuICAgICAgICAnc2hhZGVMYXllcicsXG4gICAgICAgICdBTycsXG4gICAgICAgICdibG9ja1NoYWRvd3MnLFxuICAgICAgICAnbGVhdmVzT2FrJyxcbiAgICAgICAgJ2xlYXZlc0JpcmNoJyxcbiAgICAgICAgJ3RhbGxHcmFzcycsXG4gICAgICAgICdibG9ja3MnLFxuICAgICAgICAnc2hlZXAnLFxuICAgICAgICAnYnVtcCcsXG4gICAgICAgICdzdGVwR3Jhc3MnLFxuICAgICAgICAnZmFpbHVyZScsXG4gICAgICAgICdzdWNjZXNzJ1xuICAgICAgXSxcbiAgICAgIGxldmVsVHdvQXNzZXRzOiBbXG4gICAgICAgICdlbnRpdHlTaGFkb3cnLFxuICAgICAgICAnc2VsZWN0aW9uSW5kaWNhdG9yJyxcbiAgICAgICAgJ3NoYWRlTGF5ZXInLFxuICAgICAgICAnQU8nLFxuICAgICAgICAnYmxvY2tTaGFkb3dzJyxcbiAgICAgICAgJ2xlYXZlc1NwcnVjZScsXG4gICAgICAgICd0YWxsR3Jhc3MnLFxuICAgICAgICAnYmxvY2tzJyxcbiAgICAgICAgJ3NoZWVwJyxcbiAgICAgICAgJ2J1bXAnLFxuICAgICAgICAnc3RlcEdyYXNzJyxcbiAgICAgICAgJ2ZhaWx1cmUnLFxuICAgICAgICAncGxheWVyU3RldmUnLFxuICAgICAgICAnc3VjY2VzcycsXG4gICAgICAgICdtaW5pQmxvY2tzJyxcbiAgICAgICAgJ2Jsb2NrRXhwbG9kZScsXG4gICAgICAgICdtaW5pbmdQYXJ0aWNsZXMnLFxuICAgICAgICAnZGVzdHJveU92ZXJsYXknLFxuICAgICAgICAnZGlnX3dvb2QxJyxcbiAgICAgICAgJ2NvbGxlY3RlZEJsb2NrJyxcbiAgICAgICAgJ3B1bmNoJyxcbiAgICAgIF0sXG4gICAgICBsZXZlbFRocmVlQXNzZXRzOiBbXG4gICAgICAgICdlbnRpdHlTaGFkb3cnLFxuICAgICAgICAnc2VsZWN0aW9uSW5kaWNhdG9yJyxcbiAgICAgICAgJ3NoYWRlTGF5ZXInLFxuICAgICAgICAnQU8nLFxuICAgICAgICAnYmxvY2tTaGFkb3dzJyxcbiAgICAgICAgJ2xlYXZlc09haycsXG4gICAgICAgICd0YWxsR3Jhc3MnLFxuICAgICAgICAnYmxvY2tzJyxcbiAgICAgICAgJ3NoZWVwJyxcbiAgICAgICAgJ2J1bXAnLFxuICAgICAgICAnc3RlcEdyYXNzJyxcbiAgICAgICAgJ2ZhaWx1cmUnLFxuICAgICAgICAncGxheWVyU3RldmUnLFxuICAgICAgICAnc3VjY2VzcycsXG4gICAgICAgICdtaW5pQmxvY2tzJyxcbiAgICAgICAgJ2Jsb2NrRXhwbG9kZScsXG4gICAgICAgICdtaW5pbmdQYXJ0aWNsZXMnLFxuICAgICAgICAnZGVzdHJveU92ZXJsYXknLFxuICAgICAgICAnZGlnX3dvb2QxJyxcbiAgICAgICAgJ2NvbGxlY3RlZEJsb2NrJyxcbiAgICAgICAgJ3NoZWVwQmFhJyxcbiAgICAgICAgJ3B1bmNoJyxcbiAgICAgIF0sXG4gICAgICBhbGxBc3NldHNNaW51c1BsYXllcjogW1xuICAgICAgICAnZW50aXR5U2hhZG93JyxcbiAgICAgICAgJ3NlbGVjdGlvbkluZGljYXRvcicsXG4gICAgICAgICdzaGFkZUxheWVyJyxcbiAgICAgICAgJ3RhbGxHcmFzcycsXG4gICAgICAgICdmaW5pc2hPdmVybGF5JyxcbiAgICAgICAgJ2JlZCcsXG4gICAgICAgICdBTycsXG4gICAgICAgICdibG9ja1NoYWRvd3MnLFxuICAgICAgICAndW5kZXJncm91bmRGb3cnLFxuICAgICAgICAnYmxvY2tzJyxcbiAgICAgICAgJ2xlYXZlc0FjYWNpYScsXG4gICAgICAgICdsZWF2ZXNCaXJjaCcsXG4gICAgICAgICdsZWF2ZXNKdW5nbGUnLFxuICAgICAgICAnbGVhdmVzT2FrJyxcbiAgICAgICAgJ2xlYXZlc1NwcnVjZScsXG4gICAgICAgICdzaGVlcCcsXG4gICAgICAgICdjcmVlcGVyJyxcbiAgICAgICAgJ2Nyb3BzJyxcbiAgICAgICAgJ3RvcmNoJyxcbiAgICAgICAgJ2Rlc3Ryb3lPdmVybGF5JyxcbiAgICAgICAgJ2Jsb2NrRXhwbG9kZScsXG4gICAgICAgICdtaW5pbmdQYXJ0aWNsZXMnLFxuICAgICAgICAnbWluaUJsb2NrcycsXG4gICAgICAgICdsYXZhUG9wJyxcbiAgICAgICAgJ2ZpcmUnLFxuICAgICAgICAnYnViYmxlcycsXG4gICAgICAgICdleHBsb3Npb24nLFxuICAgICAgICAnZG9vcicsXG4gICAgICAgICdyYWlscycsXG4gICAgICAgICd0bnQnLFxuICAgICAgICAnZGlnX3dvb2QxJyxcbiAgICAgICAgJ3N0ZXBHcmFzcycsXG4gICAgICAgICdzdGVwV29vZCcsXG4gICAgICAgICdzdGVwU3RvbmUnLFxuICAgICAgICAnc3RlcEdyYXZlbCcsXG4gICAgICAgICdzdGVwRmFybWxhbmQnLFxuICAgICAgICAnZmFpbHVyZScsXG4gICAgICAgICdzdWNjZXNzJyxcbiAgICAgICAgJ2ZhbGwnLFxuICAgICAgICAnZnVzZScsXG4gICAgICAgICdleHBsb2RlJyxcbiAgICAgICAgJ3BsYWNlQmxvY2snLFxuICAgICAgICAnY29sbGVjdGVkQmxvY2snLFxuICAgICAgICAnYnVtcCcsXG4gICAgICAgICdwdW5jaCcsXG4gICAgICAgICdmaXp6JyxcbiAgICAgICAgJ2Rvb3JPcGVuJyxcbiAgICAgICAgJ2hvdXNlU3VjY2VzcycsXG4gICAgICAgICdtaW5lY2FydCcsXG4gICAgICAgICdzaGVlcEJhYSdcbiAgICAgIF0sXG4gICAgICBwbGF5ZXJTdGV2ZTogW1xuICAgICAgICAncGxheWVyU3RldmUnXG4gICAgICBdLFxuICAgICAgcGxheWVyQWxleDogW1xuICAgICAgICAncGxheWVyQWxleCdcbiAgICAgIF0sXG4gICAgICBncmFzczogW1xuICAgICAgICAndGFsbEdyYXNzJ1xuICAgICAgXVxuICAgIH07XG4gIH1cblxuICBsb2FkUGFja3MocGFja0xpc3QpIHtcbiAgICBwYWNrTGlzdC5mb3JFYWNoKChwYWNrTmFtZSkgPT4ge1xuICAgICAgdGhpcy5sb2FkUGFjayhwYWNrTmFtZSk7XG4gICAgfSk7XG4gIH1cblxuICBsb2FkUGFjayhwYWNrTmFtZSkge1xuICAgIGxldCBwYWNrQXNzZXRzID0gdGhpcy5hc3NldFBhY2tzW3BhY2tOYW1lXTtcbiAgICB0aGlzLmxvYWRBc3NldHMocGFja0Fzc2V0cyk7XG4gIH1cblxuICBsb2FkQXNzZXRzKGFzc2V0TmFtZXMpIHtcbiAgICBhc3NldE5hbWVzLmZvckVhY2goKGFzc2V0S2V5KSA9PiB7XG4gICAgICBsZXQgYXNzZXRDb25maWcgPSB0aGlzLmFzc2V0c1thc3NldEtleV07XG4gICAgICB0aGlzLmxvYWRBc3NldChhc3NldEtleSwgYXNzZXRDb25maWcpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9hZEFzc2V0KGtleSwgY29uZmlnKSB7XG4gICAgc3dpdGNoKGNvbmZpZy50eXBlKSB7XG4gICAgICBjYXNlICdpbWFnZSc6XG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLmltYWdlKGtleSwgY29uZmlnLnBhdGgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NvdW5kJzpcbiAgICAgICAgdGhpcy5hdWRpb1BsYXllci5yZWdpc3Rlcih7XG4gICAgICAgICAgaWQ6IGtleSxcbiAgICAgICAgICBtcDM6IGNvbmZpZy5tcDMsXG4gICAgICAgICAgb2dnOiBjb25maWcub2dnXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2F0bGFzSlNPTic6XG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzSlNPTkhhc2goa2V5LCBjb25maWcucG5nUGF0aCwgY29uZmlnLmpzb25QYXRoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBgQXNzZXQgJHtrZXl9IG5lZWRzIGNvbmZpZy50eXBlIHNldCBpbiBjb25maWd1cmF0aW9uLmA7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgQ29tbWFuZFF1ZXVlIGZyb20gXCIuLi9Db21tYW5kUXVldWUvQ29tbWFuZFF1ZXVlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9CYXNlQ29tbWFuZC5qc1wiO1xuaW1wb3J0IERlc3Ryb3lCbG9ja0NvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9EZXN0cm95QmxvY2tDb21tYW5kLmpzXCI7XG5pbXBvcnQgUGxhY2VCbG9ja0NvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9QbGFjZUJsb2NrQ29tbWFuZC5qc1wiO1xuaW1wb3J0IFBsYWNlSW5Gcm9udENvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9QbGFjZUluRnJvbnRDb21tYW5kLmpzXCI7XG5pbXBvcnQgTW92ZUZvcndhcmRDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvTW92ZUZvcndhcmRDb21tYW5kLmpzXCI7XG5pbXBvcnQgVHVybkNvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9UdXJuQ29tbWFuZC5qc1wiO1xuaW1wb3J0IFdoaWxlQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL1doaWxlQ29tbWFuZC5qc1wiO1xuaW1wb3J0IElmQmxvY2tBaGVhZENvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9JZkJsb2NrQWhlYWRDb21tYW5kLmpzXCI7XG5pbXBvcnQgQ2hlY2tTb2x1dGlvbkNvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9DaGVja1NvbHV0aW9uQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KGNvbnRyb2xsZXIpIHtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBDYWxsZWQgYmVmb3JlIGEgbGlzdCBvZiB1c2VyIGNvbW1hbmRzIHdpbGwgYmUgaXNzdWVkLlxuICAgICAqL1xuICAgIHN0YXJ0Q29tbWFuZENvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDb2xsZWN0aW5nIGNvbW1hbmRzLlwiKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gYW4gYXR0ZW1wdCBzaG91bGQgYmUgc3RhcnRlZCwgYW5kIHRoZSBlbnRpcmUgc2V0IG9mXG4gICAgICogY29tbWFuZC1xdWV1ZSBBUEkgY2FsbHMgaGF2ZSBiZWVuIGlzc3VlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IG9uQXR0ZW1wdENvbXBsZXRlIC0gY2FsbGJhY2sgd2l0aCB0d28gcGFyYW1ldGVycyxcbiAgICAgKiBcInN1Y2Nlc3NcIiwgaS5lLiwgdHJ1ZSBpZiBhdHRlbXB0IHdhcyBzdWNjZXNzZnVsIChsZXZlbCBjb21wbGV0ZWQpLFxuICAgICAqIGZhbHNlIGlmIHVuc3VjY2Vzc2Z1bCAobGV2ZWwgbm90IGNvbXBsZXRlZCksIGFuZCB0aGUgY3VycmVudCBsZXZlbCBtb2RlbC5cbiAgICAgKi9cbiAgICBzdGFydEF0dGVtcHQ6IGZ1bmN0aW9uKG9uQXR0ZW1wdENvbXBsZXRlKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuT25Db21wbGV0ZUNhbGxiYWNrID0gb25BdHRlbXB0Q29tcGxldGU7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgQ2hlY2tTb2x1dGlvbkNvbW1hbmQoY29udHJvbGxlcikpO1xuXG4gICAgICAgIGNvbnRyb2xsZXIuc2V0UGxheWVyQWN0aW9uRGVsYXlCeVF1ZXVlTGVuZ3RoKCk7XG5cbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5iZWdpbigpO1xuICAgIH0sXG5cbiAgICByZXNldEF0dGVtcHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb250cm9sbGVyLnJlc2V0KCk7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUucmVzZXQoKTtcbiAgICAgICAgY29udHJvbGxlci5PbkNvbXBsZXRlQ2FsbGJhY2sgPSBudWxsO1xuICAgIH0sXG5cbiAgICBtb3ZlRm9yd2FyZDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2spIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBNb3ZlRm9yd2FyZENvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spKTtcbiAgICB9LFxuXG4gICAgdHVybjogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2ssIGRpcmVjdGlvbikge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IFR1cm5Db21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBkaXJlY3Rpb24gPT09ICdyaWdodCcgPyAxIDogLTEpKTtcbiAgICB9LFxuXG4gICAgdHVyblJpZ2h0OiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IFR1cm5Db21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCAxKSk7XG4gICAgfSxcblxuICAgIHR1cm5MZWZ0OiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IFR1cm5Db21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCAtMSkpO1xuICAgIH0sXG5cbiAgICBkZXN0cm95QmxvY2s6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgRGVzdHJveUJsb2NrQ29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaykpO1xuICAgIH0sXG5cbiAgICBwbGFjZUJsb2NrOiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgUGxhY2VCbG9ja0NvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSkpO1xuICAgIH0sXG5cbiAgICBwbGFjZUluRnJvbnQ6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUpIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBQbGFjZUluRnJvbnRDb21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUpKTtcbiAgICB9LFxuXG4gICAgdGlsbFNvaWw6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgUGxhY2VJbkZyb250Q29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgJ3dhdGVyaW5nJykpO1xuICAgIH0sXG5cbiAgICB3aGlsZVBhdGhBaGVhZDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY29kZUJsb2NrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgV2hpbGVDb21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUsIGNvZGVCbG9jaykpO1xuICAgIH0sXG5cbiAgICBpZkJsb2NrQWhlYWQ6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUsIGNvZGVCbG9jaykge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IElmQmxvY2tBaGVhZENvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY29kZUJsb2NrKSk7XG4gICAgfSxcblxuICAgIGdldFNjcmVlbnNob3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY29udHJvbGxlci5nZXRTY3JlZW5zaG90KCk7XG4gICAgfVxuICB9O1xufVxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IENvbW1hbmRRdWV1ZSBmcm9tIFwiLi9Db21tYW5kUXVldWUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaGlsZUNvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLml0ZXJhdGlvbnNMZWZ0ID0gMTU7IFxuICAgICAgICB0aGlzLkJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcbiAgICAgICAgdGhpcy5XaGlsZUNvZGUgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5xdWV1ZSA9IG5ldyBDb21tYW5kUXVldWUodGhpcyk7XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgICAgLy8gZG8gc3R1ZmZcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLldPUktJTkcgKSB7XG4gICAgICAgICAgICAvLyB0aWNrIG91ciBjb21tYW5kIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnRpY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnF1ZXVlLmlzRmFpbGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMucXVldWUuaXNTdWNjZWVkZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVXaGlsZUNoZWNrKCk7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV0hJTEUgY29tbWFuZDogQkVHSU5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXR1cCB0aGUgd2hpbGUgY2hlY2sgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgdGhpcy5oYW5kbGVXaGlsZUNoZWNrKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlV2hpbGVDaGVjaygpIHtcbiAgICAgICAgaWYgKHRoaXMuaXRlcmF0aW9uc0xlZnQgPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuaXNQYXRoQWhlYWQodGhpcy5CbG9ja1R5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLnF1ZXVlLnNldFdoaWxlQ29tbWFuZEluc2VydFN0YXRlKHRoaXMucXVldWUpO1xuICAgICAgICAgICAgdGhpcy5XaGlsZUNvZGUoKTtcbiAgICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucXVldWUuc2V0V2hpbGVDb21tYW5kSW5zZXJ0U3RhdGUobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLmJlZ2luKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLml0ZXJhdGlvbnNMZWZ0LS07XG4gICAgICAgIGlmICh0aGlzLkdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgV2hpbGUgY29tbWFuZDogSXRlcmF0aW9uc2xlZnQgICAke3RoaXMuaXRlcmF0aW9uc0xlZnR9IGApO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUdXJuQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGRpcmVjdGlvbikge1xuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5EaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgICAgLy8gZG8gc3R1ZmY/P1xuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBUVVJOIGNvbW1hbmQ6IEJFR0lOIHR1cm5pbmcgJHt0aGlzLkRpcmVjdGlvbn0gIGApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIudHVybih0aGlzLCB0aGlzLkRpcmVjdGlvbik7XG4gICAgfVxuXG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGFjZUluRnJvbnRDb21tYW5kIGV4dGVuZHMgQmFzZUNvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLkJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZj8/XG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLnBsYWNlQmxvY2tGb3J3YXJkKHRoaXMsIHRoaXMuQmxvY2tUeXBlKTtcbiAgICB9XG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGFjZUJsb2NrQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSkge1xuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5CbG9ja1R5cGUgPSBibG9ja1R5cGU7XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgICAgLy8gZG8gc3R1ZmY/P1xuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5wbGFjZUJsb2NrKHRoaXMsIHRoaXMuQmxvY2tUeXBlKTtcbiAgICB9XG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZlRm9yd2FyZENvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKSB7XG5cbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZlxuICAgIH1cblxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLm1vdmVGb3J3YXJkKHRoaXMpO1xuICAgIH1cblxufVxuXG4iLCJcbmltcG9ydCBDb21tYW5kU3RhdGUgZnJvbSBcIi4vQ29tbWFuZFN0YXRlLmpzXCI7XG5pbXBvcnQgQ29tbWFuZFF1ZXVlIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElmQmxvY2tBaGVhZENvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG5cbiAgICAgICAgdGhpcy5ibG9ja1R5cGUgPSBibG9ja1R5cGU7XG4gICAgICAgIHRoaXMuaWZDb2RlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICB0aGlzLnF1ZXVlID0gbmV3IENvbW1hbmRRdWV1ZSh0aGlzKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLldPUktJTkcgKSB7XG4gICAgICAgICAgICAvLyB0aWNrIG91ciBjb21tYW5kIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnRpY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnF1ZXVlLmlzRmFpbGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnF1ZXVlLmlzU3VjY2VlZGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIHN1cGVyLmJlZ2luKCk7XG4gICAgICAgIGlmICh0aGlzLkdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIldISUxFIGNvbW1hbmQ6IEJFR0lOXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0dXAgdGhlIFwiaWZcIiBjaGVja1xuICAgICAgICB0aGlzLmhhbmRsZUlmQ2hlY2soKTtcbiAgICB9XG5cbiAgICBoYW5kbGVJZkNoZWNrKCkge1xuICAgICAgICBpZiAodGhpcy5HYW1lQ29udHJvbGxlci5pc1BhdGhBaGVhZCh0aGlzLmJsb2NrVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMucXVldWUucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucXVldWUuc2V0V2hpbGVDb21tYW5kSW5zZXJ0U3RhdGUodGhpcy5xdWV1ZSk7XG4gICAgICAgICAgICB0aGlzLmlmQ29kZUNhbGxiYWNrKCk7IC8vIGluc2VydHMgY29tbWFuZHMgdmlhIENvZGVPcmdBUElcbiAgICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucXVldWUuc2V0V2hpbGVDb21tYW5kSW5zZXJ0U3RhdGUobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLmJlZ2luKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc3Ryb3lCbG9ja0NvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKSB7XG5cbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZlxuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5kZXN0cm95QmxvY2sodGhpcyk7XG4gICAgfVxuXG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBDb21tYW5kUXVldWUgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4vQmFzZUNvbW1hbmQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hlY2tTb2x1dGlvbkNvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIpIHtcbiAgICAgICAgdmFyIGR1bW15RnVuYyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFeGVjdXRlIHNvbHZlIGNvbW1hbmRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGR1bW15RnVuYyk7XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgICAgLy8gZG8gc3R1ZmZcbiAgICB9XG4gICAgXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIHN1cGVyLmJlZ2luKCk7XG4gICAgICAgIGlmICh0aGlzLkdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNvbHZlIGNvbW1hbmQ6IEJFR0lOXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLkdhbWVDb250cm9sbGVyLmNoZWNrU29sdXRpb24odGhpcyk7XG4gICAgfVxuXG59XG5cbiIsImltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZFwiO1xuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kUXVldWUge1xuICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlcikge1xuICAgIHRoaXMuZ2FtZUNvbnRyb2xsZXIgPSBnYW1lQ29udHJvbGxlcjtcbiAgICB0aGlzLmdhbWUgPSBnYW1lQ29udHJvbGxlci5nYW1lO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIGFkZENvbW1hbmQoY29tbWFuZCkge1xuICAgIC8vIGlmIHdlJ3JlIGhhbmRsaW5nIGEgd2hpbGUgY29tbWFuZCwgYWRkIHRvIHRoZSB3aGlsZSBjb21tYW5kJ3MgcXVldWUgaW5zdGVhZCBvZiB0aGlzIHF1ZXVlXG4gICAgaWYgKHRoaXMud2hpbGVDb21tYW5kUXVldWUpIHtcbiAgICAgIHRoaXMud2hpbGVDb21tYW5kUXVldWUuYWRkQ29tbWFuZChjb21tYW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb21tYW5kTGlzdF8ucHVzaChjb21tYW5kKTtcbiAgICB9XG4gIH1cblxuICBzZXRXaGlsZUNvbW1hbmRJbnNlcnRTdGF0ZShxdWV1ZSkge1xuICAgIHRoaXMud2hpbGVDb21tYW5kUXVldWUgPSBxdWV1ZTtcbiAgfVxuXG4gIGJlZ2luKCkge1xuICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuV09SS0lORztcbiAgICBpZiAodGhpcy5nYW1lQ29udHJvbGxlci5ERUJVRykge1xuICAgICAgY29uc29sZS5sb2coXCJEZWJ1ZyBRdWV1ZTogQkVHSU5cIik7XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5OT1RfU1RBUlRFRDtcbiAgICB0aGlzLmN1cnJlbnRDb21tYW5kID0gbnVsbDtcbiAgICB0aGlzLmNvbW1hbmRMaXN0XyA9IFtdO1xuICAgIGlmICh0aGlzLndoaWxlQ29tbWFuZFF1ZXVlKSB7XG4gICAgICB0aGlzLndoaWxlQ29tbWFuZFF1ZXVlLnJlc2V0KCk7XG4gICAgfVxuICAgIHRoaXMud2hpbGVDb21tYW5kUXVldWUgPSBudWxsO1xuICB9XG5cbiAgdGljaygpIHtcbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLldPUktJTkcpIHtcbiAgICAgIGlmICghdGhpcy5jdXJyZW50Q29tbWFuZCkge1xuICAgICAgICBpZiAodGhpcy5jb21tYW5kTGlzdF8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5TVUNDRVNTO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRDb21tYW5kID0gdGhpcy5jb21tYW5kTGlzdF8uc2hpZnQoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmN1cnJlbnRDb21tYW5kLmlzU3RhcnRlZCgpKSB7XG4gICAgICAgIHRoaXMuY3VycmVudENvbW1hbmQuYmVnaW4oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY3VycmVudENvbW1hbmQudGljaygpO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBpZiBjb21tYW5kIGlzIGRvbmVcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRDb21tYW5kLmlzU3VjY2VlZGVkKCkpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q29tbWFuZCA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudENvbW1hbmQuaXNGYWlsZWQoKSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0TGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLmNvbW1hbmRMaXN0XyA/IHRoaXMuY29tbWFuZExpc3RfLmxlbmd0aCA6IDA7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgc3RhcnRlZCB3b3JraW5nLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU3RhcnRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSAhPT0gQ29tbWFuZFN0YXRlLk5PVF9TVEFSVEVEO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIHN1Y2NlZWRlZCBvciBmYWlsZWQsIGFuZCBpc1xuICAgKiBmaW5pc2hlZCB3aXRoIGl0cyB3b3JrLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRmluaXNoZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNTdWNjZWVkZWQoKSB8fCB0aGlzLmlzRmFpbGVkKCk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgZmluaXNoZWQgd2l0aCBpdHMgd29yayBhbmQgcmVwb3J0ZWQgc3VjY2Vzcy5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1N1Y2NlZWRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgZmluaXNoZWQgd2l0aCBpdHMgd29yayBhbmQgcmVwb3J0ZWQgZmFpbHVyZS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0ZhaWxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gIH1cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIgPSBnYW1lQ29udHJvbGxlcjtcbiAgICAgICAgdGhpcy5HYW1lID0gZ2FtZUNvbnRyb2xsZXIuZ2FtZTtcbiAgICAgICAgdGhpcy5IaWdobGlnaHRDYWxsYmFjayA9IGhpZ2hsaWdodENhbGxiYWNrO1xuICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLk5PVF9TVEFSVEVEO1xuICAgIH1cblxuICAgIHRpY2soKSB7XG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBpZiAodGhpcy5IaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICAgICAgdGhpcy5IaWdobGlnaHRDYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuV09SS0lORztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBzdGFydGVkIHdvcmtpbmcuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTdGFydGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSAhPSBDb21tYW5kU3RhdGUuTk9UX1NUQVJURUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgc3VjY2VlZGVkIG9yIGZhaWxlZCwgYW5kIGlzXG4gICAgICogZmluaXNoZWQgd2l0aCBpdHMgd29yay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0ZpbmlzaGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1N1Y2NlZWRlZCgpIHx8IHRoaXMuaXNGYWlsZWQoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgZmluaXNoZWQgd2l0aCBpdHMgd29yayBhbmQgcmVwb3J0ZWQgc3VjY2Vzcy5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgIGlzU3VjY2VlZGVkKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuc3RhdGUgPT09IENvbW1hbmRTdGF0ZS5TVUNDRVNTKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBmaW5pc2hlZCB3aXRoIGl0cyB3b3JrIGFuZCByZXBvcnRlZCBmYWlsdXJlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgaXNGYWlsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgIH1cblxuICAgc3VjY2VlZGVkKCkge1xuICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgIH1cbiAgICBcbiAgIGZhaWxlZCgpIHtcbiAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gICB9XG59XG5cbiIsIlxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmZyZWV6ZSh7XG4gICAgTk9UX1NUQVJURUQ6IDAsXG4gICAgV09SS0lORzogMSxcbiAgICBTVUNDRVNTOiAyLFxuICAgIEZBSUxVUkU6IDNcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgaTE4biA9IHJlcXVpcmUoJy4uL2xvY2FsZScpOyA7IGJ1Zi5wdXNoKCdcXG48aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIiBpZD1cImdldHRpbmctc3RhcnRlZC1oZWFkZXJcIj4nLCBlc2NhcGUoKDIsICBpMThuLnBsYXllclNlbGVjdExldHNHZXRTdGFydGVkKCkgKSksICc8L2gxPlxcblxcbjxoMiBpZD1cInNlbGVjdC1jaGFyYWN0ZXItdGV4dFwiPicsIGVzY2FwZSgoNCwgIGkxOG4ucGxheWVyU2VsZWN0Q2hvb3NlQ2hhcmFjdGVyKCkgKSksICc8L2gyPlxcblxcbjxkaXYgaWQ9XCJjaG9vc2UtY2hhcmFjdGVyLWNvbnRhaW5lclwiPlxcbiAgPGRpdiBjbGFzcz1cIm1pbmVjcmFmdC1jaGFyYWN0ZXJcIiBpZD1cImNob29zZS1zdGV2ZVwiPlxcbiAgICA8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIj5TdGV2ZTwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XCJjaGFyYWN0ZXItcG9ydHJhaXRcIiBpZD1cInN0ZXZlLXBvcnRyYWl0XCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJjaG9vc2UtY2hhcmFjdGVyLWJ1dHRvblwiIGlkPVwiY2hvb3NlLXN0ZXZlLXNlbGVjdFwiPicsIGVzY2FwZSgoMTAsICBpMThuLnNlbGVjdENob29zZUJ1dHRvbigpICkpLCAnPC9kaXY+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtaW5lY3JhZnQtY2hhcmFjdGVyXCIgaWQ9XCJjaG9vc2UtYWxleFwiPlxcbiAgICA8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIj5BbGV4PC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cImNoYXJhY3Rlci1wb3J0cmFpdFwiIGlkPVwiYWxleC1wb3J0cmFpdFwiPjwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiY2hvb3NlLWNoYXJhY3Rlci1idXR0b25cIiBpZD1cImNob29zZS1hbGV4LXNlbGVjdFwiPicsIGVzY2FwZSgoMTUsICBpMThuLnNlbGVjdENob29zZUJ1dHRvbigpICkpLCAnPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG5cXG48ZGl2IGlkPVwiY2xvc2UtY2hhcmFjdGVyLXNlbGVjdFwiPjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIGkxOG4gPSByZXF1aXJlKCcuLi9sb2NhbGUnKTsgOyBidWYucHVzaCgnXFxuPGgxIGNsYXNzPVwibWluZWNyYWZ0LWJpZy15ZWxsb3ctaGVhZGVyXCIgaWQ9XCJnZXR0aW5nLXN0YXJ0ZWQtaGVhZGVyXCI+JywgZXNjYXBlKCgyLCAgaTE4bi5ob3VzZVNlbGVjdExldHNCdWlsZCgpICkpLCAnPC9oMT5cXG5cXG48aDIgaWQ9XCJzZWxlY3QtaG91c2UtdGV4dFwiPicsIGVzY2FwZSgoNCwgIGkxOG4uaG91c2VTZWxlY3RDaG9vc2VGbG9vclBsYW4oKSApKSwgJzwvaDI+XFxuXFxuPGRpdiBpZD1cImNob29zZS1ob3VzZS1jb250YWluZXJcIj5cXG4gIDxkaXYgY2xhc3M9XCJtaW5lY3JhZnQtaG91c2VcIiBpZD1cImNob29zZS1ob3VzZS1hXCI+XFxuICAgIDxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiPicsIGVzY2FwZSgoOCwgIGkxOG4uaG91c2VTZWxlY3RFYXN5KCkgKSksICc8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVwiaG91c2Utb3V0bGluZS1jb250YWluZXJcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVwiaG91c2UtcGhvdG9cIiBpZD1cImhvdXNlLWEtcGljdHVyZVwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNob29zZS1ob3VzZS1idXR0b25cIj4nLCBlc2NhcGUoKDEyLCAgaTE4bi5zZWxlY3RDaG9vc2VCdXR0b24oKSApKSwgJzwvZGl2PlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwibWluZWNyYWZ0LWhvdXNlXCIgaWQ9XCJjaG9vc2UtaG91c2UtYlwiPlxcbiAgICA8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIj4nLCBlc2NhcGUoKDE1LCAgaTE4bi5ob3VzZVNlbGVjdE1lZGl1bSgpICkpLCAnPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cImhvdXNlLW91dGxpbmUtY29udGFpbmVyXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cImhvdXNlLXBob3RvXCIgaWQ9XCJob3VzZS1iLXBpY3R1cmVcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJjaG9vc2UtaG91c2UtYnV0dG9uXCI+JywgZXNjYXBlKCgxOSwgIGkxOG4uc2VsZWN0Q2hvb3NlQnV0dG9uKCkgKSksICc8L2Rpdj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cIm1pbmVjcmFmdC1ob3VzZVwiIGlkPVwiY2hvb3NlLWhvdXNlLWNcIj5cXG4gICAgPGgxIGNsYXNzPVwibWluZWNyYWZ0LWJpZy15ZWxsb3ctaGVhZGVyXCI+JywgZXNjYXBlKCgyMiwgIGkxOG4uaG91c2VTZWxlY3RIYXJkKCkgKSksICc8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVwiaG91c2Utb3V0bGluZS1jb250YWluZXJcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVwiaG91c2UtcGhvdG9cIiBpZD1cImhvdXNlLWMtcGljdHVyZVwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNob29zZS1ob3VzZS1idXR0b25cIj4nLCBlc2NhcGUoKDI2LCAgaTE4bi5zZWxlY3RDaG9vc2VCdXR0b24oKSApKSwgJzwvZGl2PlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXFxuPGRpdiBpZD1cImNsb3NlLWhvdXNlLXNlbGVjdFwiPjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcblxcbjxkaXYgaWQ9XCJyaWdodC1idXR0b24tY2VsbFwiPlxcbiAgPGJ1dHRvbiBpZD1cInJpZ2h0QnV0dG9uXCIgY2xhc3M9XCJzaGFyZSBtYy1zaGFyZS1idXR0b25cIj5cXG4gICAgPGRpdj4nLCBlc2NhcGUoKDUsICBtc2cuZmluaXNoKCkgKSksICc8L2Rpdj5cXG4gIDwvYnV0dG9uPlxcbjwvZGl2PlxcblxcbjwhLS0gVGhpcyBpcyBhIGNvbW1lbnQgdW5pcXVlIHRvIENyYWZ0IC0tPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGkxOG4gPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuXG52YXIgYmxvY2tzVG9EaXNwbGF5VGV4dCA9IHtcbiAgYmVkcm9jazogaTE4bi5ibG9ja1R5cGVCZWRyb2NrKCksXG4gIGJyaWNrczogaTE4bi5ibG9ja1R5cGVCcmlja3MoKSxcbiAgY2xheTogaTE4bi5ibG9ja1R5cGVDbGF5KCksXG4gIG9yZUNvYWw6IGkxOG4uYmxvY2tUeXBlT3JlQ29hbCgpLFxuICBkaXJ0Q29hcnNlOiBpMThuLmJsb2NrVHlwZURpcnRDb2Fyc2UoKSxcbiAgY29iYmxlc3RvbmU6IGkxOG4uYmxvY2tUeXBlQ29iYmxlc3RvbmUoKSxcbiAgb3JlRGlhbW9uZDogaTE4bi5ibG9ja1R5cGVPcmVEaWFtb25kKCksXG4gIGRpcnQ6IGkxOG4uYmxvY2tUeXBlRGlydCgpLFxuICBvcmVFbWVyYWxkOiBpMThuLmJsb2NrVHlwZU9yZUVtZXJhbGQoKSxcbiAgZmFybWxhbmRXZXQ6IGkxOG4uYmxvY2tUeXBlRmFybWxhbmRXZXQoKSxcbiAgZ2xhc3M6IGkxOG4uYmxvY2tUeXBlR2xhc3MoKSxcbiAgb3JlR29sZDogaTE4bi5ibG9ja1R5cGVPcmVHb2xkKCksXG4gIGdyYXNzOiBpMThuLmJsb2NrVHlwZUdyYXNzKCksXG4gIGdyYXZlbDogaTE4bi5ibG9ja1R5cGVHcmF2ZWwoKSxcbiAgY2xheUhhcmRlbmVkOiBpMThuLmJsb2NrVHlwZUNsYXlIYXJkZW5lZCgpLFxuICBvcmVJcm9uOiBpMThuLmJsb2NrVHlwZU9yZUlyb24oKSxcbiAgb3JlTGFwaXM6IGkxOG4uYmxvY2tUeXBlT3JlTGFwaXMoKSxcbiAgbGF2YTogaTE4bi5ibG9ja1R5cGVMYXZhKCksXG4gIGxvZ0FjYWNpYTogaTE4bi5ibG9ja1R5cGVMb2dBY2FjaWEoKSxcbiAgbG9nQmlyY2g6IGkxOG4uYmxvY2tUeXBlTG9nQmlyY2goKSxcbiAgbG9nSnVuZ2xlOiBpMThuLmJsb2NrVHlwZUxvZ0p1bmdsZSgpLFxuICBsb2dPYWs6IGkxOG4uYmxvY2tUeXBlTG9nT2FrKCksXG4gIGxvZ1NwcnVjZTogaTE4bi5ibG9ja1R5cGVMb2dTcHJ1Y2UoKSxcbiAgcGxhbmtzQWNhY2lhOiBpMThuLmJsb2NrVHlwZVBsYW5rc0FjYWNpYSgpLFxuICBwbGFua3NCaXJjaDogaTE4bi5ibG9ja1R5cGVQbGFua3NCaXJjaCgpLFxuICBwbGFua3NKdW5nbGU6IGkxOG4uYmxvY2tUeXBlUGxhbmtzSnVuZ2xlKCksXG4gIHBsYW5rc09hazogaTE4bi5ibG9ja1R5cGVQbGFua3NPYWsoKSxcbiAgcGxhbmtzU3BydWNlOiBpMThuLmJsb2NrVHlwZVBsYW5rc1NwcnVjZSgpLFxuICBvcmVSZWRzdG9uZTogaTE4bi5ibG9ja1R5cGVPcmVSZWRzdG9uZSgpLFxuICByYWlsOiBpMThuLmJsb2NrVHlwZVJhaWwoKSxcbiAgc2FuZDogaTE4bi5ibG9ja1R5cGVTYW5kKCksXG4gIHNhbmRzdG9uZTogaTE4bi5ibG9ja1R5cGVTYW5kc3RvbmUoKSxcbiAgc3RvbmU6IGkxOG4uYmxvY2tUeXBlU3RvbmUoKSxcbiAgdG50OiBpMThuLmJsb2NrVHlwZVRudCgpLFxuICB0cmVlOiBpMThuLmJsb2NrVHlwZVRyZWUoKSxcbiAgd2F0ZXI6IGkxOG4uYmxvY2tUeXBlV2F0ZXIoKSxcbiAgd29vbDogaTE4bi5ibG9ja1R5cGVXb29sKCksXG4gICcnOiBpMThuLmJsb2NrVHlwZUVtcHR5KClcbn07XG5cbnZhciBhbGxCbG9ja3MgPSBbXG4gICdiZWRyb2NrJyxcbiAgJ2JyaWNrcycsXG4gICdjbGF5JyxcbiAgJ29yZUNvYWwnLFxuICAnZGlydENvYXJzZScsXG4gICdjb2JibGVzdG9uZScsXG4gICdvcmVEaWFtb25kJyxcbiAgJ2RpcnQnLFxuICAnb3JlRW1lcmFsZCcsXG4gICdmYXJtbGFuZFdldCcsXG4gICdnbGFzcycsXG4gICdvcmVHb2xkJyxcbiAgJ2dyYXNzJyxcbiAgJ2dyYXZlbCcsXG4gICdjbGF5SGFyZGVuZWQnLFxuICAnb3JlSXJvbicsXG4gICdvcmVMYXBpcycsXG4gICdsYXZhJyxcbiAgJ2xvZ0FjYWNpYScsXG4gICdsb2dCaXJjaCcsXG4gICdsb2dKdW5nbGUnLFxuICAnbG9nT2FrJyxcbiAgJ2xvZ1NwcnVjZScsXG4gICdwbGFua3NBY2FjaWEnLFxuICAncGxhbmtzQmlyY2gnLFxuICAncGxhbmtzSnVuZ2xlJyxcbiAgJ3BsYW5rc09haycsXG4gICdwbGFua3NTcHJ1Y2UnLFxuICAnb3JlUmVkc3RvbmUnLFxuICAnc2FuZCcsXG4gICdzYW5kc3RvbmUnLFxuICAnc3RvbmUnLFxuICAndG50JyxcbiAgJ3RyZWUnLFxuICAnd29vbCddO1xuXG5mdW5jdGlvbiBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoa2V5c0xpc3QpIHtcbiAgcmV0dXJuIGtleXNMaXN0Lm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGRpc3BsYXlUZXh0ID0gKGJsb2Nrc1RvRGlzcGxheVRleHRba2V5XSB8fCBrZXkpO1xuICAgIHJldHVybiBbZGlzcGxheVRleHQsIGtleV07XG4gIH0pO1xufVxuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uIChibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBkcm9wZG93bkJsb2NrcyA9IChibG9ja0luc3RhbGxPcHRpb25zLmxldmVsLmF2YWlsYWJsZUJsb2NrcyB8fCBbXSkuY29uY2F0KFxuICAgIEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFmdFBsYXllckludmVudG9yeScpKSB8fCBbXSk7XG5cbiAgdmFyIGRyb3Bkb3duQmxvY2tTZXQgPSB7fTtcblxuICBkcm9wZG93bkJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBkcm9wZG93bkJsb2NrU2V0W3R5cGVdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgdmFyIGNyYWZ0QmxvY2tPcHRpb25zID0ge1xuICAgIGludmVudG9yeUJsb2NrczogT2JqZWN0LmtleXMoZHJvcGRvd25CbG9ja1NldCksXG4gICAgaWZCbG9ja09wdGlvbnM6IGJsb2NrSW5zdGFsbE9wdGlvbnMubGV2ZWwuaWZCbG9ja09wdGlvbnMsXG4gICAgcGxhY2VCbG9ja09wdGlvbnM6IGJsb2NrSW5zdGFsbE9wdGlvbnMubGV2ZWwucGxhY2VCbG9ja09wdGlvbnNcbiAgfTtcblxuICB2YXIgaW52ZW50b3J5QmxvY2tzRW1wdHkgPSAhY3JhZnRCbG9ja09wdGlvbnMuaW52ZW50b3J5QmxvY2tzIHx8XG4gICAgICBjcmFmdEJsb2NrT3B0aW9ucy5pbnZlbnRvcnlCbG9ja3MubGVuZ3RoID09PSAwO1xuICB2YXIgYWxsRHJvcGRvd25CbG9ja3MgPSBpbnZlbnRvcnlCbG9ja3NFbXB0eSA/XG4gICAgICBhbGxCbG9ja3MgOiBjcmFmdEJsb2NrT3B0aW9ucy5pbnZlbnRvcnlCbG9ja3M7XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfbW92ZUZvcndhcmQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoaTE4bi5ibG9ja01vdmVGb3J3YXJkKCkpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X21vdmVGb3J3YXJkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdtb3ZlRm9yd2FyZChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF90dXJuID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvVHVybicsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF90dXJuLkRJUkVDVElPTlMgPVxuICAgICAgW1tpMThuLmJsb2NrVHVybkxlZnQoKSArICcgXFx1MjFCQScsICdsZWZ0J10sXG4gICAgICAgW2kxOG4uYmxvY2tUdXJuUmlnaHQoKSArICcgXFx1MjFCQicsICdyaWdodCddXTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF90dXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIHZhciBkaXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpO1xuICAgIHZhciBtZXRob2RDYWxsID0gZGlyID09PSBcImxlZnRcIiA/IFwidHVybkxlZnRcIiA6IFwidHVyblJpZ2h0XCI7XG4gICAgcmV0dXJuIG1ldGhvZENhbGwgKyAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9kZXN0cm95QmxvY2sgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoaTE4bi5ibG9ja0Rlc3Ryb3lCbG9jaygpKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9kZXN0cm95QmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ2Rlc3Ryb3lCbG9jayhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfc2hlYXIgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoaTE4bi5ibG9ja1NoZWFyKCkpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3NoZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdzaGVhcihcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfd2hpbGVCbG9ja0FoZWFkID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkcm9wZG93bk9wdGlvbnMgPSBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoY3JhZnRCbG9ja09wdGlvbnMuaWZCbG9ja09wdGlvbnMgfHwgYWxsRHJvcGRvd25CbG9ja3MpO1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihkcm9wZG93bk9wdGlvbnMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUoZHJvcGRvd25PcHRpb25zWzBdWzFdKTtcblxuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tXaGlsZVhBaGVhZFdoaWxlKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVFlQRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tXaGlsZVhBaGVhZEFoZWFkKCkpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrV2hpbGVYQWhlYWREbygpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3doaWxlQmxvY2tBaGVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lckNvZGUgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGJsb2NrVHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiAnd2hpbGVCbG9ja0FoZWFkKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyxcXG5cIicgK1xuICAgICAgICAgICAgYmxvY2tUeXBlICsgJ1wiLCAnICtcbiAgICAgICAgJyAgZnVuY3Rpb24oKSB7ICcrXG4gICAgICAgICAgICBpbm5lckNvZGUgK1xuICAgICAgICAnICB9JyArXG4gICAgICAgICcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfaWZCbG9ja0FoZWFkID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkcm9wZG93bk9wdGlvbnMgPSBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoY3JhZnRCbG9ja09wdGlvbnMuaWZCbG9ja09wdGlvbnMgfHwgYWxsRHJvcGRvd25CbG9ja3MpO1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihkcm9wZG93bk9wdGlvbnMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUoZHJvcGRvd25PcHRpb25zWzBdWzFdKTtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tJZigpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1RZUEUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrV2hpbGVYQWhlYWRBaGVhZCgpKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja1doaWxlWEFoZWFkRG8oKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9pZkJsb2NrQWhlYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5uZXJDb2RlID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jykuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBibG9ja1R5cGUgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1RZUEUnKTtcbiAgICByZXR1cm4gJ2lmQmxvY2tBaGVhZChcIicgKyBibG9ja1R5cGUgKyAnXCIsIGZ1bmN0aW9uKCkge1xcbicgK1xuICAgICAgaW5uZXJDb2RlICtcbiAgICAnfSwgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfaWZMYXZhQWhlYWQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja0lmTGF2YUFoZWFkKCkpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrV2hpbGVYQWhlYWREbygpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X2lmTGF2YUFoZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlubmVyQ29kZSA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICByZXR1cm4gJ2lmTGF2YUFoZWFkKGZ1bmN0aW9uKCkge1xcbicgK1xuICAgICAgaW5uZXJDb2RlICtcbiAgICAnfSwgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3BsYWNlQmxvY2sgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRyb3Bkb3duT3B0aW9ucyA9IGtleXNUb0Ryb3Bkb3duT3B0aW9ucyhjcmFmdEJsb2NrT3B0aW9ucy5wbGFjZUJsb2NrT3B0aW9ucyB8fCBhbGxEcm9wZG93bkJsb2Nrcyk7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKGRyb3Bkb3duT3B0aW9ucyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZShkcm9wZG93bk9wdGlvbnNbMF1bMV0pO1xuXG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja1BsYWNlWFBsYWNlKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVFlQRScpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfcGxhY2VCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBibG9ja1R5cGUgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1RZUEUnKTtcbiAgICByZXR1cm4gJ3BsYWNlQmxvY2soXCInICsgYmxvY2tUeXBlICsgJ1wiLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfcGxhY2VUb3JjaCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoaTE4bi5ibG9ja1BsYWNlVG9yY2goKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9wbGFjZVRvcmNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdwbGFjZVRvcmNoKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9wbGFudENyb3AgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tQbGFudENyb3AoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9wbGFudENyb3AgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ3BsYW50Q3JvcChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfdGlsbFNvaWwgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGkxOG4uYmxvY2tUaWxsU29pbCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF90aWxsU29pbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAndGlsbFNvaWwoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3BsYWNlQmxvY2tBaGVhZCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZHJvcGRvd25PcHRpb25zID0ga2V5c1RvRHJvcGRvd25PcHRpb25zKGNyYWZ0QmxvY2tPcHRpb25zLnBsYWNlQmxvY2tPcHRpb25zIHx8IGFsbERyb3Bkb3duQmxvY2tzKTtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oZHJvcGRvd25PcHRpb25zKTtcbiAgICAgIGRyb3Bkb3duLnNldFZhbHVlKGRyb3Bkb3duT3B0aW9uc1swXVsxXSk7XG5cbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrUGxhY2VYQWhlYWRQbGFjZSgpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1RZUEUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShpMThuLmJsb2NrUGxhY2VYQWhlYWRBaGVhZCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3BsYWNlQmxvY2tBaGVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBibG9ja1R5cGUgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1RZUEUnKTtcbiAgICByZXR1cm4gJ3BsYWNlQmxvY2tBaGVhZChcIicgKyBibG9ja1R5cGUgKyAnXCIsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxufTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5jcmFmdF9sb2NhbGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklpSXNJbVpwYkdVaU9pSmlkV2xzWkM5cWN5OWpjbUZtZEM5aGNHa3Vhbk1pTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2VzExOSJdfQ==
