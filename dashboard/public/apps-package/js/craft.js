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
  1: [MEDIA_URL + "Sliced_Parts/MC_Loading_Spinner.gif", MEDIA_URL + "Sliced_Parts/Game_Window_BG_Frame.png", MEDIA_URL + "Sliced_Parts/Pop_Up_Slice.png", MEDIA_URL + "Sliced_Parts/Steve_Character_Select.png", MEDIA_URL + "Sliced_Parts/Alex_Character_Select.png", MEDIA_URL + "Sliced_Parts/X_Button.png", MEDIA_URL + "Sliced_Parts/Button_Grey_Slice.png", MEDIA_URL + "Sliced_Parts/Run_Button_Up_Slice.png", MEDIA_URL + "Sliced_Parts/MC_Run_Arrow_Icon.png", MEDIA_URL + "Sliced_Parts/Run_Button_Down_Slice.png", MEDIA_URL + "Sliced_Parts/Reset_Button_Up_Slice.png", MEDIA_URL + "Sliced_Parts/MC_Reset_Arrow_Icon.png", MEDIA_URL + "Sliced_Parts/Reset_Button_Down_Slice.png", MEDIA_URL + "Sliced_Parts/Callout_Tail.png", characters.Steve.staticAvatar, characters.Steve.smallStaticAvatar, characters.Alex.staticAvatar, characters.Alex.smallStaticAvatar],
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

  var levelTracks = [];
  if (Craft.level.songs && MUSIC_METADATA) {
    levelTracks = MUSIC_METADATA.filter(function (trackMetadata) {
      return Craft.level.songs.indexOf(trackMetadata.name) !== -1;
    });
  }

  Craft.musicController = new MusicController(studioApp.cdoSounds, function (filename) {
    return config.skin.assetUrl('music/' + filename);
  }, levelTracks, levelTracks.length > 1 ? 7500 : null);
  if (studioApp.cdoSounds && !studioApp.cdoSounds.isAudioUnlocked()) {
    // Would use addClickTouchEvent, but iOS9 does not let you unlock audio
    // on touchstart, only on touchend.
    var removeEvent = dom.addMouseUpTouchEvent(document, function () {
      studioApp.cdoSounds.unlockAudio();
      removeEvent();
    });
  }

  // Play music when the instructions are shown
  var playOnce = function playOnce() {
    if (studioApp.cdoSounds && studioApp.cdoSounds.isAudioUnlocked()) {
      document.removeEventListener('instructionsShown', playOnce);
      document.removeEventListener('instructionsHidden', playOnce);

      var hasSongInLevel = Craft.level.songs && Craft.level.songs.length > 1;
      var songToPlayFirst = hasSongInLevel ? Craft.level.songs[0] : null;
      Craft.musicController.play(songToPlayFirst);
    }
  };
  document.addEventListener('instructionsShown', playOnce);
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
        earlyLoadNiceToHaveAssetPacks: Craft.niceToHaveAssetsForLevel(levelConfig.puzzle_number)
      });

      if (!config.level.showPopupOnLoad) {
        Craft.initializeAppLevel(config.level);
      }

      // preload music after essential game initialization assets kicked off loading
      Craft.musicController.preload();
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
    return "Keep Playing";
  } else if (testResultType <= TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL) {
    return commonMsg.tryAgain();
  } else {
    return "Replay";
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
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/craft/locale.js":[function(require,module,exports){
"use strict";

module.exports = window.blockly.craft_locale;

},{}],"/home/ubuntu/staging/apps/build/js/craft/levelbuilderOverrides.js":[function(require,module,exports){
/*jshint multistr: true */
/* global $ */

/**
 * @file Mapping to inject more properties into levelbuilder levels.
 * Keyed by "puzzle_number", which is the order of a given level in its script.
 */

"use strict";

var utils = require('../utils');

module.exports = {
  1: {
    appSpecificFailError: "You need to use commands to walk to the sheep.",
    tooFewBlocksMsg: "Try using more commands to walk to the sheep.",
    songs: ['vignette4-intro']
  },
  2: {
    appSpecificFailError: "To chop down a tree, walk to its trunk and use the \"destroy block\" command.",
    tooFewBlocksMsg: "Try using more commands to chop down the tree. Walk to its trunk and use the \"destroy block\" command.",
    songs: ['vignette5-shortpiano']
  },
  3: {
    appSpecificFailError: "To gather wool from both sheep, walk to each one and use the \"shear\" command. Remember to use turn commands to reach the sheep.",
    tooFewBlocksMsg: "Try using more commands to gather wool from both sheep. Walk to each one and use the \"shear\" command.",
    songs: ['vignette2-quiet', 'vignette5-shortpiano', 'vignette4-intro']
  },
  4: {
    appSpecificFailError: "You must use the \"destroy block\" command on each of the three tree trunks.",
    tooFewBlocksMsg: "You must use the \"destroy block\" command on each of the three tree trunks.",
    songs: ['vignette3', 'vignette2-quiet', 'vignette5-shortpiano', 'vignette4-intro'],
    songDelay: 4000
  },
  5: {
    appSpecificFailError: "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\".",
    tooFewBlocksMsg: "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\".",
    songs: ['vignette7-funky-chirps-short', 'vignette2-quiet', 'vignette4-intro', 'vignette3']
  },
  6: {
    appSpecificFailError: "Place blocks on the dirt outline of the house to complete the puzzle.",
    tooFewBlocksMsg: "Place blocks on the dirt outline of the house to complete the puzzle.",
    songs: ['vignette1', 'vignette2-quiet', 'vignette4-intro', 'vignette3'],
    songDelay: 4000
  },
  7: {
    appSpecificFailError: "Use the \"plant\" command to place crops on each patch of dark tilled soil.",
    tooFewBlocksMsg: "Use the \"plant\" command to place crops on each patch of dark tilled soil.",
    songs: ['vignette2-quiet', 'vignette7-funky-chirps-short', 'vignette4-intro', 'vignette1', 'vignette3']
  },
  8: {
    appSpecificFailError: "If you touch a creeper it will explode. Sneak around them and enter your house.",
    tooFewBlocksMsg: "If you touch a creeper it will explode. Sneak around them and enter your house.",
    songs: ['vignette5-shortpiano', 'vignette2-quiet', 'vignette1', 'vignette4-intro', 'vignette3']
  },
  9: {
    appSpecificFailError: "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal.",
    tooFewBlocksMsg: "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal.",
    songs: ['vignette3', 'vignette5-shortpiano', 'vignette7-funky-chirps-short', 'vignette2-quiet', 'vignette4-intro', 'vignette1']

  },
  10: {
    appSpecificFailError: "Cover up the lava to walk across, then mine two of the iron blocks on the other side.",
    tooFewBlocksMsg: "Cover up the lava to walk across, then mine two of the iron blocks on the other side.",
    songs: ['vignette4-intro', 'vignette3', 'vignette5-shortpiano', 'vignette2-quiet', 'vignette7-funky-chirps-short']
  },
  11: {
    appSpecificFailError: "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources.",
    tooFewBlocksMsg: "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources.",
    songs: ['vignette7-funky-chirps-short', 'vignette3', 'vignette2-quiet']
  },
  12: {
    appSpecificFailError: "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava.",
    tooFewBlocksMsg: "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava.",
    songs: ['vignette5-shortpiano', 'vignette2-quiet', 'vignette4-intro', 'vignette1']
  },
  13: {
    appSpecificFailError: "Place \"rail\" along the dirt path leading from your door to the edge of the map.",
    tooFewBlocksMsg: "Place \"rail\" along the dirt path leading from your door to the edge of the map.",
    songs: ['vignette1', 'vignette3', 'vignette2-quiet', 'vignette4-intro']
  },
  14: {
    songs: ['vignette8-free-play', 'vignette3', 'vignette2-quiet', 'vignette4-intro', 'vignette1']
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9jcmFmdC9tYWluLmpzIiwiYnVpbGQvanMvY3JhZnQvc2tpbnMuanMiLCJidWlsZC9qcy9jcmFmdC9sZXZlbHMuanMiLCJidWlsZC9qcy9jcmFmdC9jcmFmdC5qcyIsImJ1aWxkL2pzL2NyYWZ0L3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9jcmFmdC9sb2NhbGUuanMiLCJidWlsZC9qcy9jcmFmdC9sZXZlbGJ1aWxkZXJPdmVycmlkZXMuanMiLCJidWlsZC9qcy9jcmFmdC9ob3VzZUxldmVscy5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvR2FtZUNvbnRyb2xsZXIuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0xldmVsTVZDL0xldmVsVmlldy5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvTGV2ZWxNb2RlbC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvTGV2ZWxCbG9jay5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvTGV2ZWxNVkMvRmFjaW5nRGlyZWN0aW9uLmpzIiwiYnVpbGQvanMvY3JhZnQvZ2FtZS9MZXZlbE1WQy9Bc3NldExvYWRlci5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQVBJL0NvZGVPcmdBUEkuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9XaGlsZUNvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9UdXJuQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL1BsYWNlSW5Gcm9udENvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9QbGFjZUJsb2NrQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL01vdmVGb3J3YXJkQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL0lmQmxvY2tBaGVhZENvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9EZXN0cm95QmxvY2tDb21tYW5kLmpzIiwiYnVpbGQvanMvY3JhZnQvZ2FtZS9Db21tYW5kUXVldWUvQ2hlY2tTb2x1dGlvbkNvbW1hbmQuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9Db21tYW5kUXVldWUuanMiLCJidWlsZC9qcy9jcmFmdC9nYW1lL0NvbW1hbmRRdWV1ZS9CYXNlQ29tbWFuZC5qcyIsImJ1aWxkL2pzL2NyYWZ0L2dhbWUvQ29tbWFuZFF1ZXVlL0NvbW1hbmRTdGF0ZS5qcyIsImJ1aWxkL2pzL2NyYWZ0L2RpYWxvZ3MvcGxheWVyU2VsZWN0aW9uLmh0bWwuZWpzIiwiYnVpbGQvanMvY3JhZnQvZGlhbG9ncy9ob3VzZVNlbGVjdGlvbi5odG1sLmVqcyIsImJ1aWxkL2pzL2NyYWZ0L2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvY3JhZnQvYmxvY2tzLmpzIiwiYnVpbGQvanMvY3JhZnQvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUJBLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEMsSUFBSSxPQUFPLEdBQUc7QUFDWixPQUFLLEVBQUUsRUFDTjtDQUNGLENBQUM7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFB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T0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUN6Rjs7QUFFRCx5QkFBcUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7QUFFbEQsZUFBVyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN0RSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQ2hELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUM3Qzs7QUFFRCxjQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDL0MsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQ2hEO0dBQ0Y7QUFDRCxLQUFHLEVBQUU7QUFDSCxvQkFBZ0IsRUFBRSxFQUFFO0FBQ3BCLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLGFBQVMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxHQUNuQyxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQ3ZCLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FDekI7QUFDRCxpQkFBYSxFQUFFLGlFQUFpRTs7QUFFaEYsdUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUUzQixlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3BHLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDdkcsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQ3pGOztBQUVELHlCQUFxQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1RCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDOztBQUVsRCxlQUFXLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3RFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFDaEQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUM1QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQzdDOztBQUVELGNBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQy9DLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDaEQ7O0FBRUQsd0JBQW9CLEVBQUUsOEJBQVUsZUFBZSxFQUFFO0FBQy9DLGFBQU8sZUFBZSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNqRDs7R0FFRjtBQUNELEtBQUcsRUFBRTtBQUNILG9CQUFnQixFQUFFLEVBQUU7QUFDcEIsY0FBVSxFQUFFLElBQUk7QUFDaEIsYUFBUyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQ25DLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FDdkIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUN0QixVQUFVLENBQUMsY0FBYyxDQUFDLEdBQzFCLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FDeEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQ3hCLGNBQWMsR0FDZCxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FDaEM7QUFDRCxpQkFBYSxFQUFFLGlFQUFpRTs7QUFFaEYsZUFBVyxFQUFFLENBQ1gsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RixPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RyxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3ZILE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEcsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUN4RyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQ3hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDeEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUN6Rjs7QUFFRCx5QkFBcUIsRUFBRSxDQUNyQixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUMvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRWxELGVBQVcsRUFBRSxDQUNYLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDdkM7O0FBRUQsY0FBVSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFF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RUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEYsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxF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QVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7QUFDejdCLHdCQUFvQixFQUFFLENBQUMsVUFBVSxlQUFlLEVBQUU7QUFDaEQsYUFBTyxlQUFlLENBQUMsMkJBQTJCLENBQUMsQ0FDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNsRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzVDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDNUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNsRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM1QyxDQUFBLENBQUUsUUFBUSxFQUFFO0FBQ2IsaUJBQWEsRUFBRSxDQUNiLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDakQsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQzNELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEYsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7QUFFekMsb0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQ3pCO0FBQ0QsUUFBTSxFQUFFO0FBQ04saUJBQWEsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQztBQUM5OUIsMkJBQXVCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDM2IsaUJBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVB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RUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUNqRCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ2pELEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDM0QsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0RixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUN6QyxlQUFXLEVBQUUsQ0FDWCxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN0QyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQ3RDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFDdEYsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFB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LENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLGVBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7QUFHM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsZUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTNDLGVB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R0FDVixDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFDOUIsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUM3QixFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyx3QkFBd0IsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFDbkQsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsd0JBQXdCLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQ25ELEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLHdCQUF3QixFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUNuRCxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyx3QkFBd0IsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFDbkQsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsd0JBQXdCLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQ25ELEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLGlCQUFpQixFQUFDLGlCQUFpQixFQUFDLGlCQUFpQixFQUFDLGlCQUFpQixFQUFDLGlCQUFpQixFQUFDLGlCQUFpQixFQUFDLGlCQUFpQixFQUN0SSxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFB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LFNBQVMsQ0FBQyxDQUFDO0tBQzlDOzs7V0FFZSw0QkFBRztBQUNqQixVQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDZixXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3RCxXQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLCtCQUFnQixL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ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xud2luZG93LkNyYWZ0ID0gcmVxdWlyZSgnLi9jcmFmdCcpO1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIGdsb2JhbC5DcmFmdCA9IHdpbmRvdy5DcmFmdDtcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5jcmFmdE1haW4gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG5cbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIG9wdGlvbnMubWF4VmlzdWFsaXphdGlvbldpZHRoID0gNjAwO1xuICB2YXIgYXBwV2lkdGggPSA0MzQ7XG4gIHZhciBhcHBIZWlnaHQgPSA0Nzc7XG4gIG9wdGlvbnMubmF0aXZlVml6V2lkdGggPSBhcHBXaWR0aDtcbiAgb3B0aW9ucy52aXpBc3BlY3RSYXRpbyA9IGFwcFdpZHRoIC8gYXBwSGVpZ2h0O1xuXG4gIGFwcE1haW4od2luZG93LkNyYWZ0LCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbUoxYVd4a0wycHpMMk55WVdaMEwyMWhhVzR1YW5NaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWpzN08wRkJRVUVzU1VGQlNTeFBRVUZQTEVkQlFVY3NUMEZCVHl4RFFVRkRMRmxCUVZrc1EwRkJReXhEUVVGRE8wRkJRM0JETEUxQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETzBGQlEyeERMRWxCUVVrc1QwRkJUeXhOUVVGTkxFdEJRVXNzVjBGQlZ5eEZRVUZGTzBGQlEycERMRkZCUVUwc1EwRkJReXhMUVVGTExFZEJRVWNzVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXp0RFFVTTNRanRCUVVORUxFbEJRVWtzVFVGQlRTeEhRVUZITEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRCUVVOcVF5eEpRVUZKTEUxQlFVMHNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03UVVGRGFrTXNTVUZCU1N4TFFVRkxMRWRCUVVjc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZET3p0QlFVVXZRaXhOUVVGTkxFTkJRVU1zVTBGQlV5eEhRVUZITEZWQlFWTXNUMEZCVHl4RlFVRkZPMEZCUTI1RExGTkJRVThzUTBGQlF5eFhRVUZYTEVkQlFVY3NTMEZCU3l4RFFVRkRPenRCUVVVMVFpeFRRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRTFCUVUwc1EwRkJRenRCUVVNNVFpeFRRVUZQTEVOQlFVTXNjVUpCUVhGQ0xFZEJRVWNzUjBGQlJ5eERRVUZETzBGQlEzQkRMRTFCUVVrc1VVRkJVU3hIUVVGSExFZEJRVWNzUTBGQlF6dEJRVU51UWl4TlFVRkpMRk5CUVZNc1IwRkJSeXhIUVVGSExFTkJRVU03UVVGRGNFSXNVMEZCVHl4RFFVRkRMR05CUVdNc1IwRkJSeXhSUVVGUkxFTkJRVU03UVVGRGJFTXNVMEZCVHl4RFFVRkRMR05CUVdNc1IwRkJSeXhSUVVGUkxFZEJRVWNzVTBGQlV5eERRVUZET3p0QlFVVTVReXhUUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NSVUZCUlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03UTBGRGVFTXNRMEZCUXlJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lkbUZ5SUdGd2NFMWhhVzRnUFNCeVpYRjFhWEpsS0NjdUxpOWhjSEJOWVdsdUp5azdYRzUzYVc1a2IzY3VRM0poWm5RZ1BTQnlaWEYxYVhKbEtDY3VMMk55WVdaMEp5azdYRzVwWmlBb2RIbHdaVzltSUdkc2IySmhiQ0FoUFQwZ0ozVnVaR1ZtYVc1bFpDY3BJSHRjYmlBZ1oyeHZZbUZzTGtOeVlXWjBJRDBnZDJsdVpHOTNMa055WVdaME8xeHVmVnh1ZG1GeUlHSnNiMk5yY3lBOUlISmxjWFZwY21Vb0p5NHZZbXh2WTJ0ekp5azdYRzUyWVhJZ2JHVjJaV3h6SUQwZ2NtVnhkV2x5WlNnbkxpOXNaWFpsYkhNbktUdGNiblpoY2lCemEybHVjeUE5SUhKbGNYVnBjbVVvSnk0dmMydHBibk1uS1R0Y2JseHVkMmx1Wkc5M0xtTnlZV1owVFdGcGJpQTlJR1oxYm1OMGFXOXVLRzl3ZEdsdmJuTXBJSHRjYmlBZ2IzQjBhVzl1Y3k1emEybHVjMDF2WkhWc1pTQTlJSE5yYVc1ek8xeHVYRzRnSUc5d2RHbHZibk11WW14dlkydHpUVzlrZFd4bElEMGdZbXh2WTJ0ek8xeHVJQ0J2Y0hScGIyNXpMbTFoZUZacGMzVmhiR2w2WVhScGIyNVhhV1IwYUNBOUlEWXdNRHRjYmlBZ2RtRnlJR0Z3Y0ZkcFpIUm9JRDBnTkRNME8xeHVJQ0IyWVhJZ1lYQndTR1ZwWjJoMElEMGdORGMzTzF4dUlDQnZjSFJwYjI1ekxtNWhkR2wyWlZacGVsZHBaSFJvSUQwZ1lYQndWMmxrZEdnN1hHNGdJRzl3ZEdsdmJuTXVkbWw2UVhOd1pXTjBVbUYwYVc4Z1BTQmhjSEJYYVdSMGFDQXZJR0Z3Y0VobGFXZG9kRHRjYmx4dUlDQmhjSEJOWVdsdUtIZHBibVJ2ZHk1RGNtRm1kQ3dnYkdWMlpXeHpMQ0J2Y0hScGIyNXpLVHRjYm4wN1hHNGlYWDA9IiwidmFyIHNraW5zQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbnZhciBDT05GSUdTID0ge1xuICBjcmFmdDoge1xuICB9XG59O1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luc0Jhc2UubG9hZChhc3NldFVybCwgaWQpO1xuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuLyogZ2xvYmFsICQgKi9cblxudmFyIHRiID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKS5jcmVhdGVUb29sYm94O1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGNhdGVnb3J5ID0gZnVuY3Rpb24gKG5hbWUsIGJsb2Nrcykge1xuICByZXR1cm4gJzxjYXRlZ29yeSBpZD1cIicgKyBuYW1lICsgJ1wiIG5hbWU9XCInICsgbmFtZSArICdcIj4nICsgYmxvY2tzICsgJzwvY2F0ZWdvcnk+Jztcbn07XG5cbnZhciBtb3ZlRm9yd2FyZEJsb2NrID0gJzxibG9jayB0eXBlPVwiY3JhZnRfbW92ZUZvcndhcmRcIj48L2Jsb2NrPic7XG5cbmZ1bmN0aW9uIGNyYWZ0QmxvY2sodHlwZSkge1xuICByZXR1cm4gYmxvY2soXCJjcmFmdF9cIiArIHR5cGUpO1xufVxuXG5mdW5jdGlvbiBibG9jayh0eXBlKSB7XG4gIHJldHVybiAnPGJsb2NrIHR5cGU9XCInICsgdHlwZSArICdcIj48L2Jsb2NrPic7XG59XG5cbnZhciByZXBlYXREcm9wZG93biA9ICc8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9kcm9wZG93blwiPicgK1xuICAnICA8dGl0bGUgbmFtZT1cIlRJTUVTXCIgY29uZmlnPVwiMy0xMFwiPj8/PzwvdGl0bGU+JyArXG4gICc8L2Jsb2NrPic7XG5cbnZhciB0dXJuTGVmdEJsb2NrID0gJzxibG9jayB0eXBlPVwiY3JhZnRfdHVyblwiPicgK1xuICAnICA8dGl0bGUgbmFtZT1cIkRJUlwiPmxlZnQ8L3RpdGxlPicgK1xuICAnPC9ibG9jaz4nO1xuXG52YXIgdHVyblJpZ2h0QmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJjcmFmdF90dXJuXCI+JyArXG4gICAgJzx0aXRsZSBuYW1lPVwiRElSXCI+cmlnaHQ8L3RpdGxlPicgK1xuICAnPC9ibG9jaz4nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ3BsYXlncm91bmQnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW10sXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHRiKGNyYWZ0QmxvY2soJ21vdmVGb3J3YXJkJykgK1xuICAgICAgICBjcmFmdEJsb2NrKCd0dXJuUmlnaHQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3R1cm5MZWZ0JykgK1xuICAgICAgICBjcmFmdEJsb2NrKCdkZXN0cm95QmxvY2snKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3BsYWNlQmxvY2snKSArXG4gICAgICAgIGJsb2NrKCdjb250cm9sc19yZXBlYXQnKSArXG4gICAgICAgIHJlcGVhdERyb3Bkb3duICtcbiAgICAgICAgY3JhZnRCbG9jaygnd2hpbGVCbG9ja0FoZWFkJylcbiAgICApLFxuICAgICdzdGFydEJsb2Nrcyc6ICc8YmxvY2sgdHlwZT1cIndoZW5fcnVuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPicsXG5cbiAgICBncm91bmRQbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiY29hcnNlRGlydFwiLCBcImNvYXJzZURpcnRcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIlxuICAgIF0sXG5cbiAgICBncm91bmREZWNvcmF0aW9uUGxhbmU6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcInRhbGxHcmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSxcblxuICAgIGFjdGlvblBsYW5lOiBbXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJcIiwgXCJncmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImdyYXNzXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIlxuICAgIF0sXG5cbiAgICBmbHVmZlBsYW5lOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcImxlYXZlc09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIlxuICAgIF0sXG4gIH0sXG4gICcxJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtdLFxuICAgICdmcmVlUGxheSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB0YihjcmFmdEJsb2NrKCdtb3ZlRm9yd2FyZCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygndHVyblJpZ2h0JykgK1xuICAgICAgICBjcmFmdEJsb2NrKCd0dXJuTGVmdCcpXG4gICAgKSxcbiAgICAnc3RhcnRCbG9ja3MnOiAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nLFxuXG4gICAgcGxheWVyU3RhcnRQb3NpdGlvbjogWzMsIDRdLFxuXG4gICAgZ3JvdW5kUGxhbmU6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImNvYXJzZURpcnRcIiwgXCJjb2Fyc2VEaXJ0XCIsIFwiY29hcnNlRGlydFwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCJcbiAgICBdLFxuXG4gICAgZ3JvdW5kRGVjb3JhdGlvblBsYW5lOiBbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sXG5cbiAgICBhY3Rpb25QbGFuZTogW1wiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiXCIsIFwiZ3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJncmFzc1wiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImxvZ09ha1wiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJsb2dPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibG9nT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCJcbiAgICBdLFxuXG4gICAgZmx1ZmZQbGFuZTogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJsZWF2ZXNPYWtcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwibGVhdmVzT2FrXCIsIFwiXCIsIFwiXCIsIFwiXCJcbiAgICBdLFxuXG4gICAgdmVyaWZpY2F0aW9uRnVuY3Rpb246IGZ1bmN0aW9uICh2ZXJpZmljYXRpb25BUEkpIHtcbiAgICAgIHJldHVybiB2ZXJpZmljYXRpb25BUEkuaXNQbGF5ZXJOZXh0VG8oXCJsb2dPYWtcIik7XG4gICAgfSxcblxuICB9LFxuICAnMic6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgICAnZnJlZVBsYXknOiB0cnVlLFxuICAgICd0b29sYm94JzogdGIoY3JhZnRCbG9jaygnbW92ZUZvcndhcmQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ3R1cm5SaWdodCcpICtcbiAgICAgICAgY3JhZnRCbG9jaygndHVybkxlZnQnKSArXG4gICAgICAgIGNyYWZ0QmxvY2soJ2Rlc3Ryb3lCbG9jaycpICtcbiAgICAgICAgY3JhZnRCbG9jaygncGxhY2VCbG9jaycpICtcbiAgICAgICAgYmxvY2soJ2NvbnRyb2xzX3JlcGVhdCcpICtcbiAgICAgICAgcmVwZWF0RHJvcGRvd24gK1xuICAgICAgICBjcmFmdEJsb2NrKCd3aGlsZUJsb2NrQWhlYWQnKVxuICAgICksXG4gICAgJ3N0YXJ0QmxvY2tzJzogJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+JyxcblxuICAgIGdyb3VuZFBsYW5lOiBbXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJjb2Fyc2VEaXJ0XCIsIFwiY29hcnNlRGlydFwiLCBcImNvYXJzZURpcnRcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJwbGFua3NPYWtcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIixcbiAgICAgIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwicGxhbmtzT2FrXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsXG4gICAgICBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcInBsYW5rc09ha1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLFxuICAgICAgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiXG4gICAgXSxcblxuICAgIGdyb3VuZERlY29yYXRpb25QbGFuZTogW1xuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcInRhbGxHcmFzc1wiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJ0YWxsR3Jhc3NcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0sXG5cbiAgICBhY3Rpb25QbGFuZTogW1xuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICBdLFxuXG4gICAgZmx1ZmZQbGFuZTogW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgICBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLFxuICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsIFwiXCIsXG4gICAgXSxcbiAgfSxcbiAgJ2N1c3RvbSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAndG9vbGJveCc6IHRiKG1vdmVGb3J3YXJkQmxvY2sgKyB0dXJuTGVmdEJsb2NrICsgdHVyblJpZ2h0QmxvY2spXG4gIH1cbn07XG4iLCIvKmpzaGludCAtVzA2MSAqL1xuLy8gV2UgdXNlIGV2YWwgaW4gb3VyIGNvZGUsIHRoaXMgYWxsb3dzIGl0LlxuLy8gQHNlZSBodHRwczovL2pzbGludGVycm9ycy5jb20vZXZhbC1pcy1ldmlsXG5cbid1c2Ugc3RyaWN0JztcbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgY3JhZnRNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgR2FtZUNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2dhbWUvR2FtZUNvbnRyb2xsZXInKTtcbnZhciBkb20gPSByZXF1aXJlKCcuLi9kb20nKTtcbnZhciBob3VzZUxldmVscyA9IHJlcXVpcmUoJy4vaG91c2VMZXZlbHMnKTtcbnZhciBsZXZlbGJ1aWxkZXJPdmVycmlkZXMgPSByZXF1aXJlKCcuL2xldmVsYnVpbGRlck92ZXJyaWRlcycpO1xudmFyIE11c2ljQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL011c2ljQ29udHJvbGxlcicpO1xuXG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG52YXIgTUVESUFfVVJMID0gJy9ibG9ja2x5L21lZGlhL2NyYWZ0Lyc7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmFtZXNwYWNlIGZvciB0aGUgYXBwbGljYXRpb24uXG4gKi9cbnZhciBDcmFmdCA9IG1vZHVsZS5leHBvcnRzO1xuXG52YXIgY2hhcmFjdGVycyA9IHtcbiAgU3RldmU6IHtcbiAgICBuYW1lOiBcIlN0ZXZlXCIsXG4gICAgc3RhdGljQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX1N0ZXZlX05ldXRyYWwucG5nXCIsXG4gICAgc21hbGxTdGF0aWNBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfU3RldmVfTmV1dHJhbC5wbmdcIixcbiAgICBmYWlsdXJlQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX1N0ZXZlX0ZhaWwucG5nXCIsXG4gICAgd2luQXZhdGFyOiBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfQ2hhcmFjdGVyX1N0ZXZlX1dpbi5wbmdcIixcbiAgfSxcbiAgQWxleDoge1xuICAgIG5hbWU6IFwiQWxleFwiLFxuICAgIHN0YXRpY0F2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9BbGV4X05ldXRyYWwucG5nXCIsXG4gICAgc21hbGxTdGF0aWNBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfQWxleF9OZXV0cmFsLnBuZ1wiLFxuICAgIGZhaWx1cmVBdmF0YXI6IE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL1BvcF9VcF9DaGFyYWN0ZXJfQWxleF9GYWlsLnBuZ1wiLFxuICAgIHdpbkF2YXRhcjogTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUG9wX1VwX0NoYXJhY3Rlcl9BbGV4X1dpbi5wbmdcIixcbiAgfVxufTtcblxudmFyIGludGVyZmFjZUltYWdlcyA9IHtcbiAgMTogW1xuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL01DX0xvYWRpbmdfU3Bpbm5lci5naWZcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9HYW1lX1dpbmRvd19CR19GcmFtZS5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9Qb3BfVXBfU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvU3RldmVfQ2hhcmFjdGVyX1NlbGVjdC5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9BbGV4X0NoYXJhY3Rlcl9TZWxlY3QucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvWF9CdXR0b24ucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvQnV0dG9uX0dyZXlfU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUnVuX0J1dHRvbl9VcF9TbGljZS5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9NQ19SdW5fQXJyb3dfSWNvbi5wbmdcIixcbiAgICBNRURJQV9VUkwgKyBcIlNsaWNlZF9QYXJ0cy9SdW5fQnV0dG9uX0Rvd25fU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUmVzZXRfQnV0dG9uX1VwX1NsaWNlLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL01DX1Jlc2V0X0Fycm93X0ljb24ucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvUmVzZXRfQnV0dG9uX0Rvd25fU2xpY2UucG5nXCIsXG4gICAgTUVESUFfVVJMICsgXCJTbGljZWRfUGFydHMvQ2FsbG91dF9UYWlsLnBuZ1wiLFxuICAgIGNoYXJhY3RlcnMuU3RldmUuc3RhdGljQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuU3RldmUuc21hbGxTdGF0aWNBdmF0YXIsXG4gICAgY2hhcmFjdGVycy5BbGV4LnN0YXRpY0F2YXRhcixcbiAgICBjaGFyYWN0ZXJzLkFsZXguc21hbGxTdGF0aWNBdmF0YXIsXG4gIF0sXG4gIDI6IFtcbiAgICAvLyBUT0RPKGJqb3JkYW4pOiBmaW5kIGRpZmZlcmVudCBwcmUtbG9hZCBwb2ludCBmb3IgZmVlZGJhY2sgaW1hZ2VzLFxuICAgIC8vIGJ1Y2tldCBieSBzZWxlY3RlZCBjaGFyYWN0ZXJcbiAgICBjaGFyYWN0ZXJzLkFsZXgud2luQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuU3RldmUud2luQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuQWxleC5mYWlsdXJlQXZhdGFyLFxuICAgIGNoYXJhY3RlcnMuU3RldmUuZmFpbHVyZUF2YXRhcixcbiAgXSxcbiAgNjogW1xuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0hvdXNlX09wdGlvbl9BX3YzLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0hvdXNlX09wdGlvbl9CX3YzLnBuZ1wiLFxuICAgIE1FRElBX1VSTCArIFwiU2xpY2VkX1BhcnRzL0hvdXNlX09wdGlvbl9DX3YzLnBuZ1wiLFxuICBdXG59O1xuXG52YXIgTVVTSUNfTUVUQURBVEEgPSBbXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTFcIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTItcXVpZXRcIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTNcIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTQtaW50cm9cIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTUtc2hvcnRwaWFub1wifSxcbiAge3ZvbHVtZTogMSwgaGFzT2dnOiB0cnVlLCBuYW1lOiBcInZpZ25ldHRlNy1mdW5reS1jaGlycHMtc2hvcnRcIn0sXG4gIHt2b2x1bWU6IDEsIGhhc09nZzogdHJ1ZSwgbmFtZTogXCJ2aWduZXR0ZTgtZnJlZS1wbGF5XCJ9LFxuXTtcblxudmFyIENIQVJBQ1RFUl9TVEVWRSA9ICdTdGV2ZSc7XG52YXIgQ0hBUkFDVEVSX0FMRVggPSAnQWxleCc7XG52YXIgREVGQVVMVF9DSEFSQUNURVIgPSBDSEFSQUNURVJfU1RFVkU7XG52YXIgQVVUT19MT0FEX0NIQVJBQ1RFUl9BU1NFVF9QQUNLID0gJ3BsYXllcicgKyBERUZBVUxUX0NIQVJBQ1RFUjtcblxuZnVuY3Rpb24gdHJ5U2V0TG9jYWxTdG9yYWdlSXRlbShrZXksIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLyoqXG4gICAgICogbG9jYWxzdG9yYWdlIC5zZXRJdGVtIGluIGlPUyBTYWZhcmkgUHJpdmF0ZSBNb2RlIGFsd2F5cyBjYXVzZXMgYW5cbiAgICAgKiBleGNlcHRpb24sIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDU1NTM2MVxuICAgICAqL1xuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkNvdWxkbid0IHNldCBsb2NhbCBzdG9yYWdlIGl0ZW0gZm9yIGtleSBcIiArIGtleSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGUgQ3JhZnQgYXBwLiBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5DcmFmdC5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXIgPT09IDEgJiYgY29uZmlnLmxldmVsLnN0YWdlX3RvdGFsID09PSAxKSB7XG4gICAgLy8gTm90IHZpZXdpbmcgbGV2ZWwgd2l0aGluIGEgc2NyaXB0LCBidW1wIHB1enpsZSAjIHRvIHVudXNlZCBvbmUgc29cbiAgICAvLyBhc3NldCBsb2FkaW5nIHN5c3RlbSBhbmQgbGV2ZWxidWlsZGVyIG92ZXJyaWRlcyBkb24ndCB0aGluayB0aGlzIGlzXG4gICAgLy8gbGV2ZWwgMSBvciBhbnkgb3RoZXIgc3BlY2lhbCBsZXZlbC5cbiAgICBjb25maWcubGV2ZWwucHV6emxlX251bWJlciA9IDk5OTtcbiAgfVxuXG4gIGlmIChjb25maWcubGV2ZWwuaXNUZXN0TGV2ZWwpIHtcbiAgICBjb25maWcubGV2ZWwuY3VzdG9tU2xvd01vdGlvbiA9IDAuMTtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgdmVyc2lvbiBvZiBJbnRlcm5ldCBFeHBsb3JlciAoOCspIG9yIHVuZGVmaW5lZCBpZiBub3QgSUUuXG4gIHZhciBnZXRJRVZlcnNpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRNb2RlO1xuICB9O1xuXG4gIHZhciBpZVZlcnNpb25OdW1iZXIgPSBnZXRJRVZlcnNpb24oKTtcbiAgaWYgKGllVmVyc2lvbk51bWJlcikge1xuICAgICQoJ2JvZHknKS5hZGRDbGFzcyhcImllVmVyc2lvblwiICsgaWVWZXJzaW9uTnVtYmVyKTtcbiAgfVxuXG4gIHZhciBib2R5RWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XG4gIGJvZHlFbGVtZW50LmNsYXNzTmFtZSA9IGJvZHlFbGVtZW50LmNsYXNzTmFtZSArIFwiIG1pbmVjcmFmdFwiO1xuXG4gIGlmIChjb25maWcubGV2ZWwuc2hvd1BvcHVwT25Mb2FkKSB7XG4gICAgY29uZmlnLmxldmVsLmFmdGVyVmlkZW9CZWZvcmVJbnN0cnVjdGlvbnNGbiA9IChzaG93SW5zdHJ1Y3Rpb25zKSA9PiB7XG4gICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgIGV2ZW50LmluaXRFdmVudCgnaW5zdHJ1Y3Rpb25zU2hvd24nLCB0cnVlLCB0cnVlKTtcbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXG4gICAgICBpZiAoY29uZmlnLmxldmVsLnNob3dQb3B1cE9uTG9hZCA9PT0gJ3BsYXllclNlbGVjdGlvbicpIHtcbiAgICAgICAgQ3JhZnQuc2hvd1BsYXllclNlbGVjdGlvblBvcHVwKGZ1bmN0aW9uIChzZWxlY3RlZFBsYXllcikge1xuICAgICAgICAgIENyYWZ0LmNsZWFyUGxheWVyU3RhdGUoKTtcbiAgICAgICAgICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdFNlbGVjdGVkUGxheWVyJywgc2VsZWN0ZWRQbGF5ZXIpO1xuICAgICAgICAgIENyYWZ0LnVwZGF0ZVVJRm9yQ2hhcmFjdGVyKHNlbGVjdGVkUGxheWVyKTtcbiAgICAgICAgICBDcmFmdC5pbml0aWFsaXplQXBwTGV2ZWwoY29uZmlnLmxldmVsKTtcbiAgICAgICAgICBzaG93SW5zdHJ1Y3Rpb25zKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcubGV2ZWwuc2hvd1BvcHVwT25Mb2FkID09PSAnaG91c2VMYXlvdXRTZWxlY3Rpb24nKSB7XG4gICAgICAgIENyYWZ0LnNob3dIb3VzZVNlbGVjdGlvblBvcHVwKGZ1bmN0aW9uKHNlbGVjdGVkSG91c2UpIHtcbiAgICAgICAgICBpZiAoIWxldmVsQ29uZmlnLmVkaXRfYmxvY2tzKSB7XG4gICAgICAgICAgICAkLmV4dGVuZChjb25maWcubGV2ZWwsIGhvdXNlTGV2ZWxzW3NlbGVjdGVkSG91c2VdKTtcblxuICAgICAgICAgICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5jbGVhcigpO1xuICAgICAgICAgICAgc3R1ZGlvQXBwLnNldFN0YXJ0QmxvY2tzXyhjb25maWcsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBDcmFmdC5pbml0aWFsaXplQXBwTGV2ZWwoY29uZmlnLmxldmVsKTtcbiAgICAgICAgICBzaG93SW5zdHJ1Y3Rpb25zKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBpZiAoY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXIgJiYgbGV2ZWxidWlsZGVyT3ZlcnJpZGVzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXSkge1xuICAgICQuZXh0ZW5kKGNvbmZpZy5sZXZlbCwgbGV2ZWxidWlsZGVyT3ZlcnJpZGVzW2NvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyXSk7XG4gIH1cbiAgQ3JhZnQuaW5pdGlhbENvbmZpZyA9IGNvbmZpZztcblxuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucmVzZXQgPSB0aGlzLnJlc2V0LmJpbmQodGhpcyk7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBDcmFmdC5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcbiAgQ3JhZnQuc2tpbiA9IGNvbmZpZy5za2luO1xuXG4gIHZhciBsZXZlbFRyYWNrcyA9IFtdO1xuICBpZiAoQ3JhZnQubGV2ZWwuc29uZ3MgJiYgTVVTSUNfTUVUQURBVEEpIHtcbiAgICBsZXZlbFRyYWNrcyA9IE1VU0lDX01FVEFEQVRBLmZpbHRlcihmdW5jdGlvbih0cmFja01ldGFkYXRhKSB7XG4gICAgICByZXR1cm4gQ3JhZnQubGV2ZWwuc29uZ3MuaW5kZXhPZih0cmFja01ldGFkYXRhLm5hbWUpICE9PSAtMTtcbiAgICB9KTtcbiAgfVxuXG4gIENyYWZ0Lm11c2ljQ29udHJvbGxlciA9IG5ldyBNdXNpY0NvbnRyb2xsZXIoXG4gICAgICBzdHVkaW9BcHAuY2RvU291bmRzLFxuICAgICAgZnVuY3Rpb24gKGZpbGVuYW1lKSB7XG4gICAgICAgIHJldHVybiBjb25maWcuc2tpbi5hc3NldFVybChgbXVzaWMvJHtmaWxlbmFtZX1gKTtcbiAgICAgIH0sXG4gICAgICBsZXZlbFRyYWNrcyxcbiAgICAgIGxldmVsVHJhY2tzLmxlbmd0aCA+IDEgPyA3NTAwIDogbnVsbFxuICApO1xuICBpZiAoc3R1ZGlvQXBwLmNkb1NvdW5kcyAmJiAhc3R1ZGlvQXBwLmNkb1NvdW5kcy5pc0F1ZGlvVW5sb2NrZWQoKSkge1xuICAgIC8vIFdvdWxkIHVzZSBhZGRDbGlja1RvdWNoRXZlbnQsIGJ1dCBpT1M5IGRvZXMgbm90IGxldCB5b3UgdW5sb2NrIGF1ZGlvXG4gICAgLy8gb24gdG91Y2hzdGFydCwgb25seSBvbiB0b3VjaGVuZC5cbiAgICB2YXIgcmVtb3ZlRXZlbnQgPSBkb20uYWRkTW91c2VVcFRvdWNoRXZlbnQoZG9jdW1lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0dWRpb0FwcC5jZG9Tb3VuZHMudW5sb2NrQXVkaW8oKTtcbiAgICAgIHJlbW92ZUV2ZW50KCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBQbGF5IG11c2ljIHdoZW4gdGhlIGluc3RydWN0aW9ucyBhcmUgc2hvd25cbiAgdmFyIHBsYXlPbmNlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChzdHVkaW9BcHAuY2RvU291bmRzICYmIHN0dWRpb0FwcC5jZG9Tb3VuZHMuaXNBdWRpb1VubG9ja2VkKCkpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2luc3RydWN0aW9uc1Nob3duJywgcGxheU9uY2UpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5zdHJ1Y3Rpb25zSGlkZGVuJywgcGxheU9uY2UpO1xuXG4gICAgICB2YXIgaGFzU29uZ0luTGV2ZWwgPSBDcmFmdC5sZXZlbC5zb25ncyAmJiBDcmFmdC5sZXZlbC5zb25ncy5sZW5ndGggPiAxO1xuICAgICAgdmFyIHNvbmdUb1BsYXlGaXJzdCA9IGhhc1NvbmdJbkxldmVsID8gQ3JhZnQubGV2ZWwuc29uZ3NbMF0gOiBudWxsO1xuICAgICAgQ3JhZnQubXVzaWNDb250cm9sbGVyLnBsYXkoc29uZ1RvUGxheUZpcnN0KTtcbiAgICB9XG4gIH07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2luc3RydWN0aW9uc1Nob3duJywgcGxheU9uY2UpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdpbnN0cnVjdGlvbnNIaWRkZW4nLCBwbGF5T25jZSk7XG5cbiAgdmFyIGNoYXJhY3RlciA9IGNoYXJhY3RlcnNbQ3JhZnQuZ2V0Q3VycmVudENoYXJhY3RlcigpXTtcbiAgY29uZmlnLnNraW4uc3RhdGljQXZhdGFyID0gY2hhcmFjdGVyLnN0YXRpY0F2YXRhcjtcbiAgY29uZmlnLnNraW4uc21hbGxTdGF0aWNBdmF0YXIgPSBjaGFyYWN0ZXIuc21hbGxTdGF0aWNBdmF0YXI7XG4gIGNvbmZpZy5za2luLmZhaWx1cmVBdmF0YXIgPSBjaGFyYWN0ZXIuZmFpbHVyZUF2YXRhcjtcbiAgY29uZmlnLnNraW4ud2luQXZhdGFyID0gY2hhcmFjdGVyLndpbkF2YXRhcjtcblxuICB2YXIgbGV2ZWxDb25maWcgPSBjb25maWcubGV2ZWw7XG4gIHZhciBzcGVjaWFsTGV2ZWxUeXBlID0gbGV2ZWxDb25maWcuc3BlY2lhbExldmVsVHlwZTtcbiAgc3dpdGNoIChzcGVjaWFsTGV2ZWxUeXBlKSB7XG4gICAgY2FzZSAnaG91c2VXYWxsQnVpbGQnOlxuICAgICAgbGV2ZWxDb25maWcuYmxvY2tzVG9TdG9yZSA9IFtcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJob3VzZUJvdHRvbUFcIiwgXCJob3VzZUJvdHRvbUJcIiwgXCJob3VzZUJvdHRvbUNcIiwgXCJob3VzZUJvdHRvbURcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIixcbiAgICAgICAgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIiwgXCJcIlxuICAgICAgXTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgc3R1ZGlvQXBwLmluaXQoJC5leHRlbmQoe30sIGNvbmZpZywge1xuICAgIGZvcmNlSW5zZXJ0VG9wQmxvY2s6ICd3aGVuX3J1bicsXG4gICAgaHRtbDogcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKSh7XG4gICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgZGF0YToge1xuICAgICAgICBsb2NhbGVEaXJlY3Rpb246IHN0dWRpb0FwcC5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgICAgICBzaGFyZWFibGU6IGNvbmZpZy5sZXZlbC5zaGFyZWFibGVcbiAgICAgICAgfSksXG4gICAgICAgIGVkaXRDb2RlOiBjb25maWcubGV2ZWwuZWRpdENvZGUsXG4gICAgICAgIGJsb2NrQ291bnRlckNsYXNzOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgfVxuICAgIH0pLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIGdlbmVyYXRlZENvZGVEZXNjcmlwdGlvbjogY3JhZnRNc2cuZ2VuZXJhdGVkQ29kZURlc2NyaXB0aW9uKCksXG4gICAgfSxcbiAgICBsb2FkQXVkaW86IGZ1bmN0aW9uICgpIHtcbiAgICB9LFxuICAgIGFmdGVySW5qZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2xvd01vdGlvblVSTFBhcmFtID0gcGFyc2VGbG9hdCgobG9jYXRpb24uc2VhcmNoLnNwbGl0KCdjdXN0b21TbG93TW90aW9uPScpWzFdIHx8ICcnKS5zcGxpdCgnJicpWzBdKTtcbiAgICAgIENyYWZ0LmdhbWVDb250cm9sbGVyID0gbmV3IEdhbWVDb250cm9sbGVyKHtcbiAgICAgICAgUGhhc2VyOiB3aW5kb3cuUGhhc2VyLFxuICAgICAgICBjb250YWluZXJJZDogJ3BoYXNlci1nYW1lJyxcbiAgICAgICAgYXNzZXRSb290OiBDcmFmdC5za2luLmFzc2V0VXJsKCcnKSxcbiAgICAgICAgYXVkaW9QbGF5ZXI6IHtcbiAgICAgICAgICByZWdpc3Rlcjogc3R1ZGlvQXBwLnJlZ2lzdGVyQXVkaW8uYmluZChzdHVkaW9BcHApLFxuICAgICAgICAgIHBsYXk6IHN0dWRpb0FwcC5wbGF5QXVkaW8uYmluZChzdHVkaW9BcHApXG4gICAgICAgIH0sXG4gICAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgICAgY3VzdG9tU2xvd01vdGlvbjogc2xvd01vdGlvblVSTFBhcmFtLCAvLyBOYU4gaWYgbm90IHNldFxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyc3QgYXNzZXQgcGFja3MgdG8gbG9hZCB3aGlsZSB2aWRlbyBwbGF5aW5nLCBldGMuXG4gICAgICAgICAqIFdvbid0IG1hdHRlciBmb3IgbGV2ZWxzIHdpdGhvdXQgZGVsYXllZCBsZXZlbCBpbml0aWFsaXphdGlvblxuICAgICAgICAgKiAoZHVlIHRvIGUuZy4gY2hhcmFjdGVyIC8gaG91c2Ugc2VsZWN0IHBvcHVwcykuXG4gICAgICAgICAqL1xuICAgICAgICBlYXJseUxvYWRBc3NldFBhY2tzOiBDcmFmdC5lYXJseUxvYWRBc3NldHNGb3JMZXZlbChsZXZlbENvbmZpZy5wdXp6bGVfbnVtYmVyKSxcbiAgICAgICAgZWFybHlMb2FkTmljZVRvSGF2ZUFzc2V0UGFja3M6IENyYWZ0Lm5pY2VUb0hhdmVBc3NldHNGb3JMZXZlbChsZXZlbENvbmZpZy5wdXp6bGVfbnVtYmVyKSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWNvbmZpZy5sZXZlbC5zaG93UG9wdXBPbkxvYWQpIHtcbiAgICAgICAgQ3JhZnQuaW5pdGlhbGl6ZUFwcExldmVsKGNvbmZpZy5sZXZlbCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHByZWxvYWQgbXVzaWMgYWZ0ZXIgZXNzZW50aWFsIGdhbWUgaW5pdGlhbGl6YXRpb24gYXNzZXRzIGtpY2tlZCBvZmYgbG9hZGluZ1xuICAgICAgQ3JhZnQubXVzaWNDb250cm9sbGVyLnByZWxvYWQoKTtcbiAgICB9LFxuICAgIHR3aXR0ZXI6IHtcbiAgICAgIHRleHQ6IFwiU2hhcmUgb24gVHdpdHRlclwiLFxuICAgICAgaGFzaHRhZzogXCJDcmFmdFwiXG4gICAgfVxuICB9KSk7XG5cbiAgaWYgKGNvbmZpZy5sZXZlbC5wdXp6bGVfbnVtYmVyICYmIGludGVyZmFjZUltYWdlc1tjb25maWcubGV2ZWwucHV6emxlX251bWJlcl0pIHtcbiAgICBpbnRlcmZhY2VJbWFnZXNbY29uZmlnLmxldmVsLnB1enpsZV9udW1iZXJdLmZvckVhY2goZnVuY3Rpb24odXJsKSB7XG4gICAgICBwcmVsb2FkSW1hZ2UodXJsKTtcbiAgICB9KTtcbiAgfVxufTtcblxudmFyIHByZWxvYWRJbWFnZSA9IGZ1bmN0aW9uKHVybCkge1xuICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gIGltZy5zcmMgPSB1cmw7XG59O1xuXG5DcmFmdC5jaGFyYWN0ZXJBc3NldFBhY2tOYW1lID0gZnVuY3Rpb24gKHBsYXllck5hbWUpIHtcbiAgcmV0dXJuICdwbGF5ZXInICsgcGxheWVyTmFtZTtcbn07XG5cbkNyYWZ0LmdldEN1cnJlbnRDaGFyYWN0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWZ0U2VsZWN0ZWRQbGF5ZXInKSB8fCBERUZBVUxUX0NIQVJBQ1RFUjtcbn07XG5cbkNyYWZ0LnVwZGF0ZVVJRm9yQ2hhcmFjdGVyID0gZnVuY3Rpb24gKGNoYXJhY3Rlcikge1xuICBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4uc3RhdGljQXZhdGFyID0gY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLnN0YXRpY0F2YXRhcjtcbiAgQ3JhZnQuaW5pdGlhbENvbmZpZy5za2luLnNtYWxsU3RhdGljQXZhdGFyID0gY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLnNtYWxsU3RhdGljQXZhdGFyO1xuICBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4uZmFpbHVyZUF2YXRhciA9IGNoYXJhY3RlcnNbY2hhcmFjdGVyXS5mYWlsdXJlQXZhdGFyO1xuICBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4ud2luQXZhdGFyID0gY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLndpbkF2YXRhcjtcbiAgc3R1ZGlvQXBwLnNldEljb25zRnJvbVNraW4oQ3JhZnQuaW5pdGlhbENvbmZpZy5za2luKTtcbiAgJCgnI3Byb21wdC1pY29uJykuYXR0cignc3JjJywgY2hhcmFjdGVyc1tjaGFyYWN0ZXJdLnNtYWxsU3RhdGljQXZhdGFyKTtcbn07XG5cbkNyYWZ0LnNob3dQbGF5ZXJTZWxlY3Rpb25Qb3B1cCA9IGZ1bmN0aW9uIChvblNlbGVjdGVkQ2FsbGJhY2spIHtcbiAgdmFyIHNlbGVjdGVkUGxheWVyID0gREVGQVVMVF9DSEFSQUNURVI7XG4gIHZhciBwb3B1cERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBwb3B1cERpdi5pbm5lckhUTUwgPSByZXF1aXJlKCcuL2RpYWxvZ3MvcGxheWVyU2VsZWN0aW9uLmh0bWwuZWpzJykoe1xuICAgIGltYWdlOiBzdHVkaW9BcHAuYXNzZXRVcmwoKVxuICB9KTtcbiAgdmFyIHBvcHVwRGlhbG9nID0gc3R1ZGlvQXBwLmNyZWF0ZU1vZGFsRGlhbG9nKHtcbiAgICBjb250ZW50RGl2OiBwb3B1cERpdixcbiAgICBkZWZhdWx0QnRuU2VsZWN0b3I6ICcjY2hvb3NlLXN0ZXZlJyxcbiAgICBvbkhpZGRlbjogZnVuY3Rpb24gKCkge1xuICAgICAgb25TZWxlY3RlZENhbGxiYWNrKHNlbGVjdGVkUGxheWVyKTtcbiAgICB9LFxuICAgIGlkOiAnY3JhZnQtcG9wdXAtcGxheWVyLXNlbGVjdGlvbicsXG4gIH0pO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjbG9zZS1jaGFyYWN0ZXItc2VsZWN0JylbMF0sIGZ1bmN0aW9uICgpIHtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nob29zZS1zdGV2ZScpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRQbGF5ZXIgPSBDSEFSQUNURVJfU1RFVkU7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2UtYWxleCcpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRQbGF5ZXIgPSBDSEFSQUNURVJfQUxFWDtcbiAgICBwb3B1cERpYWxvZy5oaWRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG4gIHBvcHVwRGlhbG9nLnNob3coKTtcbn07XG5cbkNyYWZ0LnNob3dIb3VzZVNlbGVjdGlvblBvcHVwID0gZnVuY3Rpb24gKG9uU2VsZWN0ZWRDYWxsYmFjaykge1xuICB2YXIgcG9wdXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgcG9wdXBEaXYuaW5uZXJIVE1MID0gcmVxdWlyZSgnLi9kaWFsb2dzL2hvdXNlU2VsZWN0aW9uLmh0bWwuZWpzJykoe1xuICAgIGltYWdlOiBzdHVkaW9BcHAuYXNzZXRVcmwoKVxuICB9KTtcbiAgdmFyIHNlbGVjdGVkSG91c2UgPSAnaG91c2VBJztcblxuICB2YXIgcG9wdXBEaWFsb2cgPSBzdHVkaW9BcHAuY3JlYXRlTW9kYWxEaWFsb2coe1xuICAgIGNvbnRlbnREaXY6IHBvcHVwRGl2LFxuICAgIGRlZmF1bHRCdG5TZWxlY3RvcjogJyNjaG9vc2UtaG91c2UtYScsXG4gICAgb25IaWRkZW46IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uU2VsZWN0ZWRDYWxsYmFjayhzZWxlY3RlZEhvdXNlKTtcbiAgICB9LFxuICAgIGlkOiAnY3JhZnQtcG9wdXAtaG91c2Utc2VsZWN0aW9uJyxcbiAgICBpY29uOiBjaGFyYWN0ZXJzW0NyYWZ0LmdldEN1cnJlbnRDaGFyYWN0ZXIoKV0uc3RhdGljQXZhdGFyXG4gIH0pO1xuXG4gIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoJCgnI2Nsb3NlLWhvdXNlLXNlbGVjdCcpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2UtaG91c2UtYScpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRIb3VzZSA9IFwiaG91c2VBXCI7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2UtaG91c2UtYicpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRIb3VzZSA9IFwiaG91c2VCXCI7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KCQoJyNjaG9vc2UtaG91c2UtYycpWzBdLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZWN0ZWRIb3VzZSA9IFwiaG91c2VDXCI7XG4gICAgcG9wdXBEaWFsb2cuaGlkZSgpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHBvcHVwRGlhbG9nLnNob3coKTtcbn07XG5cbkNyYWZ0LmNsZWFyUGxheWVyU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhZnRIb3VzZUJsb2NrcycpO1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWZ0UGxheWVySW52ZW50b3J5Jyk7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY3JhZnRTZWxlY3RlZFBsYXllcicpO1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2NyYWZ0U2VsZWN0ZWRIb3VzZScpO1xufTtcblxuQ3JhZnQub25Ib3VzZVNlbGVjdGVkID0gZnVuY3Rpb24gKGhvdXNlVHlwZSkge1xuICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdFNlbGVjdGVkSG91c2UnLCBob3VzZVR5cGUpO1xufTtcblxuQ3JhZnQuaW5pdGlhbGl6ZUFwcExldmVsID0gZnVuY3Rpb24gKGxldmVsQ29uZmlnKSB7XG4gIHZhciBob3VzZUJsb2NrcyA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFmdEhvdXNlQmxvY2tzJykpO1xuICBDcmFmdC5mb2xkSW5DdXN0b21Ib3VzZUJsb2Nrcyhob3VzZUJsb2NrcywgbGV2ZWxDb25maWcpO1xuXG4gIHZhciBmbHVmZlBsYW5lID0gW107XG4gIC8vIFRPRE8oYmpvcmRhbik6IHJlbW92ZSBjb25maWd1cmF0aW9uIHJlcXVpcmVtZW50IGluIHZpc3VhbGl6YXRpb25cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAobGV2ZWxDb25maWcuZ3JpZFdpZHRoIHx8IDEwKSAqIChsZXZlbENvbmZpZy5ncmlkSGVpZ2h0IHx8IDEwKTsgaSsrKSB7XG4gICAgZmx1ZmZQbGFuZS5wdXNoKCcnKTtcbiAgfVxuXG4gIHZhciBsZXZlbEFzc2V0UGFja3MgPSB7XG4gICAgYmVmb3JlTG9hZDogQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxXaXRoQ2hhcmFjdGVyKGxldmVsQ29uZmlnLnB1enpsZV9udW1iZXIpLFxuICAgIGFmdGVyTG9hZDogQ3JhZnQuYWZ0ZXJMb2FkQXNzZXRzRm9yTGV2ZWwobGV2ZWxDb25maWcucHV6emxlX251bWJlcilcbiAgfTtcblxuICBDcmFmdC5nYW1lQ29udHJvbGxlci5sb2FkTGV2ZWwoe1xuICAgIGlzRGF5dGltZTogbGV2ZWxDb25maWcuaXNEYXl0aW1lLFxuICAgIGdyb3VuZFBsYW5lOiBsZXZlbENvbmZpZy5ncm91bmRQbGFuZSxcbiAgICBncm91bmREZWNvcmF0aW9uUGxhbmU6IGxldmVsQ29uZmlnLmdyb3VuZERlY29yYXRpb25QbGFuZSxcbiAgICBhY3Rpb25QbGFuZTogbGV2ZWxDb25maWcuYWN0aW9uUGxhbmUsXG4gICAgZmx1ZmZQbGFuZTogZmx1ZmZQbGFuZSxcbiAgICBwbGF5ZXJTdGFydFBvc2l0aW9uOiBsZXZlbENvbmZpZy5wbGF5ZXJTdGFydFBvc2l0aW9uLFxuICAgIHBsYXllclN0YXJ0RGlyZWN0aW9uOiBsZXZlbENvbmZpZy5wbGF5ZXJTdGFydERpcmVjdGlvbixcbiAgICBwbGF5ZXJOYW1lOiBDcmFmdC5nZXRDdXJyZW50Q2hhcmFjdGVyKCksXG4gICAgYXNzZXRQYWNrczogbGV2ZWxBc3NldFBhY2tzLFxuICAgIHNwZWNpYWxMZXZlbFR5cGU6IGxldmVsQ29uZmlnLnNwZWNpYWxMZXZlbFR5cGUsXG4gICAgaG91c2VCb3R0b21SaWdodDogbGV2ZWxDb25maWcuaG91c2VCb3R0b21SaWdodCxcbiAgICBncmlkRGltZW5zaW9uczogbGV2ZWxDb25maWcuZ3JpZFdpZHRoICYmIGxldmVsQ29uZmlnLmdyaWRIZWlnaHQgP1xuICAgICAgICBbbGV2ZWxDb25maWcuZ3JpZFdpZHRoLCBsZXZlbENvbmZpZy5ncmlkSGVpZ2h0XSA6XG4gICAgICAgIG51bGwsXG4gICAgdmVyaWZpY2F0aW9uRnVuY3Rpb246IGV2YWwoJ1snICsgbGV2ZWxDb25maWcudmVyaWZpY2F0aW9uRnVuY3Rpb24gKyAnXScpWzBdIC8vIFRPRE8oYmpvcmRhbik6IGFkZCB0byB1dGlsc1xuICB9KTtcbn07XG5cbkNyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsV2l0aENoYXJhY3RlciA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICByZXR1cm4gQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxOdW1iZXIobGV2ZWxOdW1iZXIpXG4gICAgICAuY29uY2F0KFtDcmFmdC5jaGFyYWN0ZXJBc3NldFBhY2tOYW1lKENyYWZ0LmdldEN1cnJlbnRDaGFyYWN0ZXIoKSldKTtcbn07XG5cbkNyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsTnVtYmVyID0gZnVuY3Rpb24gKGxldmVsTnVtYmVyKSB7XG4gIHN3aXRjaCAobGV2ZWxOdW1iZXIpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gWydsZXZlbE9uZUFzc2V0cyddO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBbJ2xldmVsVHdvQXNzZXRzJ107XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFsnbGV2ZWxUaHJlZUFzc2V0cyddO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gWydhbGxBc3NldHNNaW51c1BsYXllciddO1xuICB9XG59O1xuXG5DcmFmdC5hZnRlckxvYWRBc3NldHNGb3JMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICAvLyBBZnRlciBsZXZlbCBsb2FkcyAmIHBsYXllciBzdGFydHMgcGxheWluZywga2ljayBvZmYgZnVydGhlciBhc3NldCBkb3dubG9hZHNcbiAgc3dpdGNoIChsZXZlbE51bWJlcikge1xuICAgIGNhc2UgMTpcbiAgICAgIC8vIGNhbiBkaXNhYmxlIGlmIHBlcmZvcm1hbmNlIGlzc3VlIG9uIGVhcmx5IGxldmVsIDFcbiAgICAgIHJldHVybiBDcmFmdC5taW5Bc3NldHNGb3JMZXZlbE51bWJlcigyKTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gQ3JhZnQubWluQXNzZXRzRm9yTGV2ZWxOdW1iZXIoMyk7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIE1heSB3YW50IHRvIHB1c2ggdGhpcyB0byBvY2N1ciBvbiBsZXZlbCB3aXRoIHZpZGVvXG4gICAgICByZXR1cm4gWydhbGxBc3NldHNNaW51c1BsYXllciddO1xuICB9XG59O1xuXG5DcmFmdC5lYXJseUxvYWRBc3NldHNGb3JMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICBzd2l0Y2ggKGxldmVsTnVtYmVyKSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIENyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsTnVtYmVyKGxldmVsTnVtYmVyKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIENyYWZ0Lm1pbkFzc2V0c0ZvckxldmVsV2l0aENoYXJhY3RlcihsZXZlbE51bWJlcik7XG4gIH1cbn07XG5cbkNyYWZ0Lm5pY2VUb0hhdmVBc3NldHNGb3JMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbE51bWJlcikge1xuICBzd2l0Y2ggKGxldmVsTnVtYmVyKSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIFsncGxheWVyU3RldmUnLCAncGxheWVyQWxleCddO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gWydhbGxBc3NldHNNaW51c1BsYXllciddO1xuICB9XG59O1xuXG4vKiogRm9sZHMgYXJyYXkgQiBvbiB0b3Agb2YgYXJyYXkgQSAqL1xuQ3JhZnQuZm9sZEluQXJyYXkgPSBmdW5jdGlvbiAoYXJyYXlBLCBhcnJheUIpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheUEubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXJyYXlCW2ldICE9PSAnJykge1xuICAgICAgYXJyYXlBW2ldID0gYXJyYXlCW2ldO1xuICAgIH1cbiAgfVxufTtcblxuQ3JhZnQuZm9sZEluQ3VzdG9tSG91c2VCbG9ja3MgPSBmdW5jdGlvbiAoaG91c2VCbG9ja01hcCwgbGV2ZWxDb25maWcpIHtcbiAgdmFyIHBsYW5lc1RvQ3VzdG9taXplID0gW2xldmVsQ29uZmlnLmdyb3VuZFBsYW5lLCBsZXZlbENvbmZpZy5hY3Rpb25QbGFuZV07XG4gIHBsYW5lc1RvQ3VzdG9taXplLmZvckVhY2goZnVuY3Rpb24ocGxhbmUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYW5lLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IHBsYW5lW2ldO1xuICAgICAgaWYgKGl0ZW0ubWF0Y2goL2hvdXNlLykpIHtcbiAgICAgICAgcGxhbmVbaV0gPSAoaG91c2VCbG9ja01hcCAmJiBob3VzZUJsb2NrTWFwW2l0ZW1dKSA/XG4gICAgICAgICAgICBob3VzZUJsb2NrTWFwW2l0ZW1dIDogXCJwbGFua3NCaXJjaFwiO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlc2V0IHRoZSBhcHAgdG8gdGhlIHN0YXJ0IHBvc2l0aW9uIGFuZCBraWxsIGFueSBwZW5kaW5nIGFuaW1hdGlvbiB0YXNrcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZmlyc3QgdHJ1ZSBpZiBmaXJzdCByZXNldFxuICovXG5DcmFmdC5yZXNldCA9IGZ1bmN0aW9uIChmaXJzdCkge1xuICBpZiAoZmlyc3QpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgQ3JhZnQuZ2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSS5yZXNldEF0dGVtcHQoKTtcbn07XG5cbkNyYWZ0LnBoYXNlckxvYWRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIENyYWZ0LmdhbWVDb250cm9sbGVyICYmXG4gICAgICBDcmFmdC5nYW1lQ29udHJvbGxlci5nYW1lICYmXG4gICAgICAhQ3JhZnQuZ2FtZUNvbnRyb2xsZXIuZ2FtZS5sb2FkLmlzTG9hZGluZztcbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuQ3JhZnQucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghQ3JhZnQucGhhc2VyTG9hZGVkKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXRCdXR0b24nKTtcblxuICAvLyBFbnN1cmUgdGhhdCBSZXNldCBidXR0b24gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBSdW4gYnV0dG9uLlxuICBpZiAoIXJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoKSB7XG4gICAgcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGggPSBydW5CdXR0b24ub2Zmc2V0V2lkdGggKyAncHgnO1xuICB9XG5cbiAgc3R1ZGlvQXBwLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIHN0dWRpb0FwcC5hdHRlbXB0cysrO1xuXG4gIENyYWZ0LmV4ZWN1dGVVc2VyQ29kZSgpO1xufTtcblxuQ3JhZnQuZXhlY3V0ZVVzZXJDb2RlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5lZGl0X2Jsb2Nrcykge1xuICAgIHRoaXMucmVwb3J0UmVzdWx0KHRydWUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChzdHVkaW9BcHAuaGFzRXh0cmFUb3BCbG9ja3MoKSkge1xuICAgIC8vIGltbWVkaWF0ZWx5IGNoZWNrIGFuc3dlciBpbnN0ZWFkIG9mIGV4ZWN1dGluZywgd2hpY2ggd2lsbCBmYWlsIGFuZFxuICAgIC8vIHJlcG9ydCB0b3AgbGV2ZWwgYmxvY2tzIChyYXRoZXIgdGhhbiBleGVjdXRpbmcgdGhlbSlcbiAgICB0aGlzLnJlcG9ydFJlc3VsdChmYWxzZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnc3RhcnQnKTtcblxuICAvLyBTdGFydCB0cmFjaW5nIGNhbGxzLlxuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG5cbiAgdmFyIGFwcENvZGVPcmdBUEkgPSBDcmFmdC5nYW1lQ29udHJvbGxlci5jb2RlT3JnQVBJO1xuICBhcHBDb2RlT3JnQVBJLnN0YXJ0Q29tbWFuZENvbGxlY3Rpb24oKTtcbiAgLy8gUnVuIHVzZXIgZ2VuZXJhdGVkIGNvZGUsIGNhbGxpbmcgYXBwQ29kZU9yZ0FQSVxuICB2YXIgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgbW92ZUZvcndhcmQ6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLm1vdmVGb3J3YXJkKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpKTtcbiAgICB9LFxuICAgIHR1cm5MZWZ0OiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS50dXJuKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLCBcImxlZnRcIik7XG4gICAgfSxcbiAgICB0dXJuUmlnaHQ6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLnR1cm4oc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksIFwicmlnaHRcIik7XG4gICAgfSxcbiAgICBkZXN0cm95QmxvY2s6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLmRlc3Ryb3lCbG9jayhzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSk7XG4gICAgfSxcbiAgICBzaGVhcjogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkuZGVzdHJveUJsb2NrKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpKTtcbiAgICB9LFxuICAgIHRpbGxTb2lsOiBmdW5jdGlvbiAoYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS50aWxsU29pbChzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSk7XG4gICAgfSxcbiAgICB3aGlsZVBhdGhBaGVhZDogZnVuY3Rpb24gKGJsb2NrSUQsIGNhbGxiYWNrKSB7XG4gICAgICAvLyBpZiByZXN1cnJlY3RlZCwgbW92ZSBibG9ja0lEIGJlIGxhc3QgcGFyYW1ldGVyIHRvIGZpeCBcIlNob3cgQ29kZVwiXG4gICAgICBhcHBDb2RlT3JnQVBJLndoaWxlUGF0aEFoZWFkKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICAgICcnLFxuICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICB9LFxuICAgIHdoaWxlQmxvY2tBaGVhZDogZnVuY3Rpb24gKGJsb2NrSUQsIGJsb2NrVHlwZSwgY2FsbGJhY2spIHtcbiAgICAgIC8vIGlmIHJlc3VycmVjdGVkLCBtb3ZlIGJsb2NrSUQgYmUgbGFzdCBwYXJhbWV0ZXIgdG8gZml4IFwiU2hvdyBDb2RlXCJcbiAgICAgIGFwcENvZGVPcmdBUEkud2hpbGVQYXRoQWhlYWQoc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgICAgYmxvY2tUeXBlLFxuICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICB9LFxuICAgIGlmTGF2YUFoZWFkOiBmdW5jdGlvbiAoY2FsbGJhY2ssIGJsb2NrSUQpIHtcbiAgICAgIC8vIGlmIHJlc3VycmVjdGVkLCBtb3ZlIGJsb2NrSUQgYmUgbGFzdCBwYXJhbWV0ZXIgdG8gZml4IFwiU2hvdyBDb2RlXCJcbiAgICAgIGFwcENvZGVPcmdBUEkuaWZCbG9ja0FoZWFkKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICAgIFwibGF2YVwiLFxuICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICB9LFxuICAgIGlmQmxvY2tBaGVhZDogZnVuY3Rpb24gKGJsb2NrVHlwZSwgY2FsbGJhY2ssIGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkuaWZCbG9ja0FoZWFkKHN0dWRpb0FwcC5oaWdobGlnaHQuYmluZChzdHVkaW9BcHAsIGJsb2NrSUQpLFxuICAgICAgICAgIGJsb2NrVHlwZSxcbiAgICAgICAgICBjYWxsYmFjayk7XG4gICAgfSxcbiAgICBwbGFjZUJsb2NrOiBmdW5jdGlvbiAoYmxvY2tUeXBlLCBibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLnBsYWNlQmxvY2soc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgIGJsb2NrVHlwZSk7XG4gICAgfSxcbiAgICBwbGFudENyb3A6IGZ1bmN0aW9uIChibG9ja0lEKSB7XG4gICAgICBhcHBDb2RlT3JnQVBJLnBsYWNlQmxvY2soc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgIFwiY3JvcFdoZWF0XCIpO1xuICAgIH0sXG4gICAgcGxhY2VUb3JjaDogZnVuY3Rpb24gKGJsb2NrSUQpIHtcbiAgICAgIGFwcENvZGVPcmdBUEkucGxhY2VCbG9jayhzdHVkaW9BcHAuaGlnaGxpZ2h0LmJpbmQoc3R1ZGlvQXBwLCBibG9ja0lEKSxcbiAgICAgICAgXCJ0b3JjaFwiKTtcbiAgICB9LFxuICAgIHBsYWNlQmxvY2tBaGVhZDogZnVuY3Rpb24gKGJsb2NrVHlwZSwgYmxvY2tJRCkge1xuICAgICAgYXBwQ29kZU9yZ0FQSS5wbGFjZUluRnJvbnQoc3R1ZGlvQXBwLmhpZ2hsaWdodC5iaW5kKHN0dWRpb0FwcCwgYmxvY2tJRCksXG4gICAgICAgIGJsb2NrVHlwZSk7XG4gICAgfVxuICB9KTtcbiAgYXBwQ29kZU9yZ0FQSS5zdGFydEF0dGVtcHQoZnVuY3Rpb24gKHN1Y2Nlc3MsIGxldmVsTW9kZWwpIHtcbiAgICB0aGlzLnJlcG9ydFJlc3VsdChzdWNjZXNzKTtcblxuICAgIHZhciB0aWxlSURzVG9TdG9yZSA9IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuYmxvY2tzVG9TdG9yZTtcbiAgICBpZiAoc3VjY2VzcyAmJiB0aWxlSURzVG9TdG9yZSkge1xuICAgICAgdmFyIG5ld0hvdXNlQmxvY2tzID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NyYWZ0SG91c2VCbG9ja3MnKSkgfHwge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxldmVsTW9kZWwuYWN0aW9uUGxhbmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRpbGVJRHNUb1N0b3JlW2ldICE9PSAnJykge1xuICAgICAgICAgIG5ld0hvdXNlQmxvY2tzW3RpbGVJRHNUb1N0b3JlW2ldXSA9IGxldmVsTW9kZWwuYWN0aW9uUGxhbmVbaV0uYmxvY2tUeXBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdEhvdXNlQmxvY2tzJywgSlNPTi5zdHJpbmdpZnkobmV3SG91c2VCbG9ja3MpKTtcbiAgICB9XG5cbiAgICB2YXIgYXR0ZW1wdEludmVudG9yeVR5cGVzID0gbGV2ZWxNb2RlbC5nZXRJbnZlbnRvcnlUeXBlcygpO1xuICAgIHZhciBwbGF5ZXJJbnZlbnRvcnlUeXBlcyA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFmdFBsYXllckludmVudG9yeScpKSB8fCBbXTtcblxuICAgIHZhciBuZXdJbnZlbnRvcnlTZXQgPSB7fTtcbiAgICBhdHRlbXB0SW52ZW50b3J5VHlwZXMuY29uY2F0KHBsYXllckludmVudG9yeVR5cGVzKS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIG5ld0ludmVudG9yeVNldFt0eXBlXSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICB0cnlTZXRMb2NhbFN0b3JhZ2VJdGVtKCdjcmFmdFBsYXllckludmVudG9yeScsIEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKG5ld0ludmVudG9yeVNldCkpKTtcbiAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbkNyYWZ0LmdldFRlc3RSZXN1bHRGcm9tID0gZnVuY3Rpb24gKHN1Y2Nlc3MsIHN0dWRpb1Rlc3RSZXN1bHRzKSB7XG4gIGlmIChDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLmZyZWVQbGF5KSB7XG4gICAgcmV0dXJuIFRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgfVxuXG4gIGlmIChzdHVkaW9UZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMKSB7XG4gICAgcmV0dXJuIFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICB9XG5cbiAgcmV0dXJuIHN0dWRpb1Rlc3RSZXN1bHRzO1xufTtcblxuQ3JhZnQucmVwb3J0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgdmFyIHN0dWRpb1Rlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKHN1Y2Nlc3MpO1xuICB2YXIgdGVzdFJlc3VsdFR5cGUgPSBDcmFmdC5nZXRUZXN0UmVzdWx0RnJvbShzdWNjZXNzLCBzdHVkaW9UZXN0UmVzdWx0cyk7XG5cbiAgdmFyIGtlZXBQbGF5aW5nVGV4dCA9IENyYWZ0LnJlcGxheVRleHRGb3JSZXN1bHQodGVzdFJlc3VsdFR5cGUpO1xuXG4gIHN0dWRpb0FwcC5yZXBvcnQoe1xuICAgIGFwcDogJ2NyYWZ0JyxcbiAgICBsZXZlbDogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5pZCxcbiAgICByZXN1bHQ6IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuZnJlZVBsYXkgPyB0cnVlIDogc3VjY2VzcyxcbiAgICB0ZXN0UmVzdWx0OiB0ZXN0UmVzdWx0VHlwZSxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgIEJsb2NrbHkuWG1sLmRvbVRvVGV4dChcbiAgICAgICAgICAgIEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShcbiAgICAgICAgICAgICAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKSkpLFxuICAgIC8vIHR5cGljYWxseSBkZWxheSBmZWVkYmFjayB1bnRpbCByZXNwb25zZSBiYWNrXG4gICAgLy8gZm9yIHRoaW5ncyBsaWtlIGUuZy4gY3Jvd2Rzb3VyY2VkIGhpbnRzICYgaGludCBibG9ja3NcbiAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2soe1xuICAgICAgICBrZWVwUGxheWluZ1RleHQ6IGtlZXBQbGF5aW5nVGV4dCxcbiAgICAgICAgYXBwOiAnY3JhZnQnLFxuICAgICAgICBza2luOiBDcmFmdC5pbml0aWFsQ29uZmlnLnNraW4uaWQsXG4gICAgICAgIGZlZWRiYWNrVHlwZTogdGVzdFJlc3VsdFR5cGUsXG4gICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgbGV2ZWw6IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwsXG4gICAgICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgICAgICByZWluZkZlZWRiYWNrTXNnOiBjcmFmdE1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICAgICAgbmV4dExldmVsTXNnOiBjcmFmdE1zZy5uZXh0TGV2ZWxNc2coe1xuICAgICAgICAgICAgcHV6emxlTnVtYmVyOiBDcmFmdC5pbml0aWFsQ29uZmlnLmxldmVsLnB1enpsZV9udW1iZXJcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0b29NYW55QmxvY2tzRmFpbE1zZ0Z1bmN0aW9uOiBjcmFmdE1zZy50b29NYW55QmxvY2tzRmFpbCxcbiAgICAgICAgICBnZW5lcmF0ZWRDb2RlRGVzY3JpcHRpb246IGNyYWZ0TXNnLmdlbmVyYXRlZENvZGVEZXNjcmlwdGlvbigpXG4gICAgICAgIH0sXG4gICAgICAgIGZlZWRiYWNrSW1hZ2U6IENyYWZ0LmluaXRpYWxDb25maWcubGV2ZWwuZnJlZVBsYXkgPyBDcmFmdC5nYW1lQ29udHJvbGxlci5nZXRTY3JlZW5zaG90KCkgOiBudWxsLFxuICAgICAgICBzaG93aW5nU2hhcmluZzogQ3JhZnQuaW5pdGlhbENvbmZpZy5sZXZlbC5mcmVlUGxheVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn07XG5cbkNyYWZ0LnJlcGxheVRleHRGb3JSZXN1bHQgPSBmdW5jdGlvbiAodGVzdFJlc3VsdFR5cGUpIHtcbiAgaWYgKHRlc3RSZXN1bHRUeXBlID09PSBUZXN0UmVzdWx0cy5GUkVFX1BMQVkpIHtcbiAgICByZXR1cm4gXCJLZWVwIFBsYXlpbmdcIjtcbiAgfSBlbHNlIGlmICh0ZXN0UmVzdWx0VHlwZSA8PSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfQUNDRVBUQUJMRV9GQUlMKSB7XG4gICAgcmV0dXJuIGNvbW1vbk1zZy50cnlBZ2FpbigpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBcIlJlcGxheVwiO1xuICB9XG59O1xuXG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxkaXYgaWQ9XCJtaW5lY3JhZnQtZnJhbWVcIj5cXG4gIDxkaXYgaWQ9XCJwaGFzZXItZ2FtZVwiPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5jcmFmdF9sb2NhbGU7XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuLyogZ2xvYmFsICQgKi9cblxuLyoqXG4gKiBAZmlsZSBNYXBwaW5nIHRvIGluamVjdCBtb3JlIHByb3BlcnRpZXMgaW50byBsZXZlbGJ1aWxkZXIgbGV2ZWxzLlxuICogS2V5ZWQgYnkgXCJwdXp6bGVfbnVtYmVyXCIsIHdoaWNoIGlzIHRoZSBvcmRlciBvZiBhIGdpdmVuIGxldmVsIGluIGl0cyBzY3JpcHQuXG4gKi9cblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIDE6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJZb3UgbmVlZCB0byB1c2UgY29tbWFuZHMgdG8gd2FsayB0byB0aGUgc2hlZXAuXCIsXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBcIlRyeSB1c2luZyBtb3JlIGNvbW1hbmRzIHRvIHdhbGsgdG8gdGhlIHNoZWVwLlwiLFxuICAgIHNvbmdzOiBbJ3ZpZ25ldHRlNC1pbnRybyddLFxuICB9LFxuICAyOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IFwiVG8gY2hvcCBkb3duIGEgdHJlZSwgd2FsayB0byBpdHMgdHJ1bmsgYW5kIHVzZSB0aGUgXFxcImRlc3Ryb3kgYmxvY2tcXFwiIGNvbW1hbmQuXCIsXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBcIlRyeSB1c2luZyBtb3JlIGNvbW1hbmRzIHRvIGNob3AgZG93biB0aGUgdHJlZS4gV2FsayB0byBpdHMgdHJ1bmsgYW5kIHVzZSB0aGUgXFxcImRlc3Ryb3kgYmxvY2tcXFwiIGNvbW1hbmQuXCIsXG4gICAgc29uZ3M6IFsndmlnbmV0dGU1LXNob3J0cGlhbm8nXSxcbiAgfSxcbiAgMzoge1xuICAgIGFwcFNwZWNpZmljRmFpbEVycm9yOiBcIlRvIGdhdGhlciB3b29sIGZyb20gYm90aCBzaGVlcCwgd2FsayB0byBlYWNoIG9uZSBhbmQgdXNlIHRoZSBcXFwic2hlYXJcXFwiIGNvbW1hbmQuIFJlbWVtYmVyIHRvIHVzZSB0dXJuIGNvbW1hbmRzIHRvIHJlYWNoIHRoZSBzaGVlcC5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiVHJ5IHVzaW5nIG1vcmUgY29tbWFuZHMgdG8gZ2F0aGVyIHdvb2wgZnJvbSBib3RoIHNoZWVwLiBXYWxrIHRvIGVhY2ggb25lIGFuZCB1c2UgdGhlIFxcXCJzaGVhclxcXCIgY29tbWFuZC5cIixcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU1LXNob3J0cGlhbm8nLFxuICAgICAgJ3ZpZ25ldHRlNC1pbnRybydcbiAgICBdLFxuICB9LFxuICA0OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IFwiWW91IG11c3QgdXNlIHRoZSBcXFwiZGVzdHJveSBibG9ja1xcXCIgY29tbWFuZCBvbiBlYWNoIG9mIHRoZSB0aHJlZSB0cmVlIHRydW5rcy5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiWW91IG11c3QgdXNlIHRoZSBcXFwiZGVzdHJveSBibG9ja1xcXCIgY29tbWFuZCBvbiBlYWNoIG9mIHRoZSB0aHJlZSB0cmVlIHRydW5rcy5cIixcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTUtc2hvcnRwaWFubycsXG4gICAgICAndmlnbmV0dGU0LWludHJvJ1xuICAgIF0sXG4gICAgc29uZ0RlbGF5OiA0MDAwLFxuICB9LFxuICA1OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IFwiUGxhY2UgeW91ciBibG9ja3Mgb24gdGhlIGRpcnQgb3V0bGluZSB0byBidWlsZCBhIHdhbGwuIFRoZSBwaW5rIFxcXCJyZXBlYXRcXFwiIGNvbW1hbmQgd2lsbCBydW4gY29tbWFuZHMgcGxhY2VkIGluc2lkZSBpdCwgbGlrZSBcXFwicGxhY2UgYmxvY2tcXFwiIGFuZCBcXFwibW92ZSBmb3J3YXJkXFxcIi5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiUGxhY2UgeW91ciBibG9ja3Mgb24gdGhlIGRpcnQgb3V0bGluZSB0byBidWlsZCBhIHdhbGwuIFRoZSBwaW5rIFxcXCJyZXBlYXRcXFwiIGNvbW1hbmQgd2lsbCBydW4gY29tbWFuZHMgcGxhY2VkIGluc2lkZSBpdCwgbGlrZSBcXFwicGxhY2UgYmxvY2tcXFwiIGFuZCBcXFwibW92ZSBmb3J3YXJkXFxcIi5cIixcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlNy1mdW5reS1jaGlycHMtc2hvcnQnLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgIF0sXG4gIH0sXG4gIDY6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJQbGFjZSBibG9ja3Mgb24gdGhlIGRpcnQgb3V0bGluZSBvZiB0aGUgaG91c2UgdG8gY29tcGxldGUgdGhlIHB1enpsZS5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiUGxhY2UgYmxvY2tzIG9uIHRoZSBkaXJ0IG91dGxpbmUgb2YgdGhlIGhvdXNlIHRvIGNvbXBsZXRlIHRoZSBwdXp6bGUuXCIsXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTEnLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgIF0sXG4gICAgc29uZ0RlbGF5OiA0MDAwLFxuICB9LFxuICA3OiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IFwiVXNlIHRoZSBcXFwicGxhbnRcXFwiIGNvbW1hbmQgdG8gcGxhY2UgY3JvcHMgb24gZWFjaCBwYXRjaCBvZiBkYXJrIHRpbGxlZCBzb2lsLlwiLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogXCJVc2UgdGhlIFxcXCJwbGFudFxcXCIgY29tbWFuZCB0byBwbGFjZSBjcm9wcyBvbiBlYWNoIHBhdGNoIG9mIGRhcmsgdGlsbGVkIHNvaWwuXCIsXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlNy1mdW5reS1jaGlycHMtc2hvcnQnLFxuICAgICAgJ3ZpZ25ldHRlNC1pbnRybycsXG4gICAgICAndmlnbmV0dGUxJyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgIF0sXG4gIH0sXG4gIDg6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJJZiB5b3UgdG91Y2ggYSBjcmVlcGVyIGl0IHdpbGwgZXhwbG9kZS4gU25lYWsgYXJvdW5kIHRoZW0gYW5kIGVudGVyIHlvdXIgaG91c2UuXCIsXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBcIklmIHlvdSB0b3VjaCBhIGNyZWVwZXIgaXQgd2lsbCBleHBsb2RlLiBTbmVhayBhcm91bmQgdGhlbSBhbmQgZW50ZXIgeW91ciBob3VzZS5cIixcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlNS1zaG9ydHBpYW5vJyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgICAndmlnbmV0dGU0LWludHJvJyxcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgIF0sXG4gIH0sXG4gIDk6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJEb24ndCBmb3JnZXQgdG8gcGxhY2UgYXQgbGVhc3QgMiB0b3JjaGVzIHRvIGxpZ2h0IHlvdXIgd2F5IEFORCBtaW5lIGF0IGxlYXN0IDIgY29hbC5cIixcbiAgICB0b29GZXdCbG9ja3NNc2c6IFwiRG9uJ3QgZm9yZ2V0IHRvIHBsYWNlIGF0IGxlYXN0IDIgdG9yY2hlcyB0byBsaWdodCB5b3VyIHdheSBBTkQgbWluZSBhdCBsZWFzdCAyIGNvYWwuXCIsXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTMnLFxuICAgICAgJ3ZpZ25ldHRlNS1zaG9ydHBpYW5vJyxcbiAgICAgICd2aWduZXR0ZTctZnVua3ktY2hpcnBzLXNob3J0JyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlNC1pbnRybycsXG4gICAgICAndmlnbmV0dGUxJyxcbiAgICBdLFxuXG4gIH0sXG4gIDEwOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IFwiQ292ZXIgdXAgdGhlIGxhdmEgdG8gd2FsayBhY3Jvc3MsIHRoZW4gbWluZSB0d28gb2YgdGhlIGlyb24gYmxvY2tzIG9uIHRoZSBvdGhlciBzaWRlLlwiLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogXCJDb3ZlciB1cCB0aGUgbGF2YSB0byB3YWxrIGFjcm9zcywgdGhlbiBtaW5lIHR3byBvZiB0aGUgaXJvbiBibG9ja3Mgb24gdGhlIG90aGVyIHNpZGUuXCIsXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgICAndmlnbmV0dGU1LXNob3J0cGlhbm8nLFxuICAgICAgJ3ZpZ25ldHRlMi1xdWlldCcsXG4gICAgICAndmlnbmV0dGU3LWZ1bmt5LWNoaXJwcy1zaG9ydCcsXG4gICAgXSxcbiAgfSxcbiAgMTE6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJNYWtlIHN1cmUgdG8gcGxhY2UgY29iYmxlc3RvbmUgYWhlYWQgaWYgdGhlcmUgaXMgbGF2YSBhaGVhZC4gVGhpcyB3aWxsIGxldCB5b3Ugc2FmZWx5IG1pbmUgdGhpcyByb3cgb2YgcmVzb3VyY2VzLlwiLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogXCJNYWtlIHN1cmUgdG8gcGxhY2UgY29iYmxlc3RvbmUgYWhlYWQgaWYgdGhlcmUgaXMgbGF2YSBhaGVhZC4gVGhpcyB3aWxsIGxldCB5b3Ugc2FmZWx5IG1pbmUgdGhpcyByb3cgb2YgcmVzb3VyY2VzLlwiLFxuICAgIHNvbmdzOiBbXG4gICAgICAndmlnbmV0dGU3LWZ1bmt5LWNoaXJwcy1zaG9ydCcsXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgIF0sXG4gIH0sXG4gIDEyOiB7XG4gICAgYXBwU3BlY2lmaWNGYWlsRXJyb3I6IFwiQmUgc3VyZSB0byBtaW5lIDMgcmVkc3RvbmUgYmxvY2tzLiBUaGlzIGNvbWJpbmVzIHdoYXQgeW91IGxlYXJuZWQgZnJvbSBidWlsZGluZyB5b3VyIGhvdXNlIGFuZCB1c2luZyBcXFwiaWZcXFwiIHN0YXRlbWVudHMgdG8gYXZvaWQgZmFsbGluZyBpbiBsYXZhLlwiLFxuICAgIHRvb0Zld0Jsb2Nrc01zZzogXCJCZSBzdXJlIHRvIG1pbmUgMyByZWRzdG9uZSBibG9ja3MuIFRoaXMgY29tYmluZXMgd2hhdCB5b3UgbGVhcm5lZCBmcm9tIGJ1aWxkaW5nIHlvdXIgaG91c2UgYW5kIHVzaW5nIFxcXCJpZlxcXCIgc3RhdGVtZW50cyB0byBhdm9pZCBmYWxsaW5nIGluIGxhdmEuXCIsXG4gICAgc29uZ3M6IFtcbiAgICAgICd2aWduZXR0ZTUtc2hvcnRwaWFubycsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgXSxcbiAgfSxcbiAgMTM6IHtcbiAgICBhcHBTcGVjaWZpY0ZhaWxFcnJvcjogXCJQbGFjZSBcXFwicmFpbFxcXCIgYWxvbmcgdGhlIGRpcnQgcGF0aCBsZWFkaW5nIGZyb20geW91ciBkb29yIHRvIHRoZSBlZGdlIG9mIHRoZSBtYXAuXCIsXG4gICAgdG9vRmV3QmxvY2tzTXNnOiBcIlBsYWNlIFxcXCJyYWlsXFxcIiBhbG9uZyB0aGUgZGlydCBwYXRoIGxlYWRpbmcgZnJvbSB5b3VyIGRvb3IgdG8gdGhlIGVkZ2Ugb2YgdGhlIG1hcC5cIixcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgICAndmlnbmV0dGUzJyxcbiAgICAgICd2aWduZXR0ZTItcXVpZXQnLFxuICAgICAgJ3ZpZ25ldHRlNC1pbnRybycsXG4gICAgXSxcbiAgfSxcbiAgMTQ6IHtcbiAgICBzb25nczogW1xuICAgICAgJ3ZpZ25ldHRlOC1mcmVlLXBsYXknLFxuICAgICAgJ3ZpZ25ldHRlMycsXG4gICAgICAndmlnbmV0dGUyLXF1aWV0JyxcbiAgICAgICd2aWduZXR0ZTQtaW50cm8nLFxuICAgICAgJ3ZpZ25ldHRlMScsXG4gICAgXSxcbiAgfSxcbn07XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuLyogZ2xvYmFsICQgKi9cblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGhvdXNlQToge1xuICAgIGdyb3VuZFBsYW5lOiBbXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIl0sXG4gICAgdmVyaWZpY2F0aW9uRnVuY3Rpb246IChmdW5jdGlvbiAodmVyaWZpY2F0aW9uQVBJKSB7XG4gICAgICByZXR1cm4gdmVyaWZpY2F0aW9uQVBJLnNvbHV0aW9uTWFwTWF0Y2hlc1Jlc3VsdE1hcChbXG4gICAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICdhbnknLCAnYW55JywgJ2FueScsICdhbnknLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnYW55JywgJycsICcnLCAnYW55JywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJ2FueScsICcnLCAnJywgJ2FueScsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICdhbnknLCAnYW55JywgJ2FueScsICdhbnknLCAnJywgJycsICcnLFxuICAgICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnXSk7XG4gICAgfSkudG9TdHJpbmcoKSxcbiAgICBibG9ja3NUb1N0b3JlOiBbXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnaG91c2VSaWdodEMnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJ2hvdXNlUmlnaHRCJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUxlZnRBJywgJycsICcnLCAnaG91c2VSaWdodEEnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlQm90dG9tQScsICdob3VzZUJvdHRvbUInLCAnaG91c2VCb3R0b21DJywgJ2hvdXNlQm90dG9tRCcsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJyddLFxuXG4gICAgaG91c2VCb3R0b21SaWdodDogWzUsIDVdLFxuICB9LFxuICBob3VzZUI6IHtcbiAgICBcImdyb3VuZFBsYW5lXCI6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCJdLFxuICAgIFwiZ3JvdW5kRGVjb3JhdGlvblBsYW5lXCI6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcInRhbGxHcmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcInRhbGxHcmFzc1wiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSxcbiAgICBcImFjdGlvblBsYW5lXCI6IFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcImhvdXNlQm90dG9tQVwiLCBcImhvdXNlQm90dG9tQlwiLCBcImhvdXNlQm90dG9tQ1wiLCBcImhvdXNlQm90dG9tRFwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSxcbiAgICBcInZlcmlmaWNhdGlvbkZ1bmN0aW9uXCI6IFwiZnVuY3Rpb24gKHZlcmlmaWNhdGlvbkFQSSkge1xcclxcbiAgICAgIHJldHVybiB2ZXJpZmljYXRpb25BUEkuc29sdXRpb25NYXBNYXRjaGVzUmVzdWx0TWFwKFxcclxcbiAgICAgICAgICAgIFtcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiXFxyXFxuICAgICAgICAgICAgXSk7XFxyXFxufVwiLFxuICAgIFwic3RhcnRCbG9ja3NcIjogXCI8eG1sPjxibG9jayB0eXBlPVxcXCJ3aGVuX3J1blxcXCIgZGVsZXRhYmxlPVxcXCJmYWxzZVxcXCIgbW92YWJsZT1cXFwiZmFsc2VcXFwiPjxuZXh0PjxibG9jayB0eXBlPVxcXCJjb250cm9sc19yZXBlYXRfZHJvcGRvd25cXFwiPjx0aXRsZSBuYW1lPVxcXCJUSU1FU1xcXCIgY29uZmlnPVxcXCIyLTEwXFxcIj4yPC90aXRsZT48c3RhdGVtZW50IG5hbWU9XFxcIkRPXFxcIj48YmxvY2sgdHlwZT1cXFwiY3JhZnRfbW92ZUZvcndhcmRcXFwiPjxuZXh0PjxibG9jayB0eXBlPVxcXCJjcmFmdF9wbGFjZUJsb2NrXFxcIj48dGl0bGUgbmFtZT1cXFwiVFlQRVxcXCI+cGxhbmtzQmlyY2g8L3RpdGxlPjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9zdGF0ZW1lbnQ+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X3R1cm5cXFwiPjx0aXRsZSBuYW1lPVxcXCJESVJcXFwiPmxlZnQ8L3RpdGxlPjxuZXh0PjxibG9jayB0eXBlPVxcXCJjcmFmdF9tb3ZlRm9yd2FyZFxcXCI+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X3BsYWNlQmxvY2tcXFwiPjx0aXRsZSBuYW1lPVxcXCJUWVBFXFxcIj5wbGFua3NCaXJjaDwvdGl0bGU+PG5leHQ+PGJsb2NrIHR5cGU9XFxcImNyYWZ0X3R1cm5cXFwiPjx0aXRsZSBuYW1lPVxcXCJESVJcXFwiPnJpZ2h0PC90aXRsZT48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwvbmV4dD48L2Jsb2NrPjwveG1sPlwiLFxuXG4gICAgYmxvY2tzVG9TdG9yZTogW1xuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJ2hvdXNlUmlnaHRDJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICdob3VzZVJpZ2h0QicsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VMZWZ0QScsICcnLCAnJywgJ2hvdXNlUmlnaHRBJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUJvdHRvbUEnLCAnaG91c2VCb3R0b21CJywgJ2hvdXNlQm90dG9tQycsICdob3VzZUJvdHRvbUQnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnXSxcblxuICAgIGhvdXNlQm90dG9tUmlnaHQ6IFs1LCA1XSxcbiAgfSxcbiAgaG91c2VDOiB7XG4gICAgZ3JvdW5kUGxhbmU6IFtcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZ3Jhc3NcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZGlydENvYXJzZVwiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImRpcnRDb2Fyc2VcIiwgXCJkaXJ0Q29hcnNlXCIsIFwiZGlydENvYXJzZVwiLCBcImRpcnRDb2Fyc2VcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCIsIFwiZ3Jhc3NcIiwgXCJncmFzc1wiLCBcImdyYXNzXCJdLFxuICAgIHZlcmlmaWNhdGlvbkZ1bmN0aW9uOiBcImZ1bmN0aW9uICh2ZXJpZmljYXRpb25BUEkpIHtcXHJcXG4gICAgICByZXR1cm4gdmVyaWZpY2F0aW9uQVBJLnNvbHV0aW9uTWFwTWF0Y2hlc1Jlc3VsdE1hcChcXHJcXG4gICAgICAgICAgICBbXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcImFueVxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiYW55XFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIixcXHJcXG4gICAgICAgICAgICAgIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiYW55XFxcIiwgXFxcImFueVxcXCIsIFxcXCJhbnlcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLFxcclxcbiAgICAgICAgICAgICAgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsXFxyXFxuICAgICAgICAgICAgICBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIiwgXFxcIlxcXCIsIFxcXCJcXFwiLCBcXFwiXFxcIlxcclxcbiAgICAgICAgICAgIF0pO1xcclxcbn1cIixcbiAgICBzdGFydEJsb2NrczogXCI8eG1sPjxibG9jayB0eXBlPVxcXCJ3aGVuX3J1blxcXCIgZGVsZXRhYmxlPVxcXCJmYWxzZVxcXCIgbW92YWJsZT1cXFwiZmFsc2VcXFwiPjxuZXh0PjxibG9jayB0eXBlPVxcXCJjb250cm9sc19yZXBlYXRfZHJvcGRvd25cXFwiPjx0aXRsZSBuYW1lPVxcXCJUSU1FU1xcXCIgY29uZmlnPVxcXCIyLTEwXFxcIj42PC90aXRsZT48c3RhdGVtZW50IG5hbWU9XFxcIkRPXFxcIj48YmxvY2sgdHlwZT1cXFwiY3JhZnRfbW92ZUZvcndhcmRcXFwiPjxuZXh0PjxibG9jayB0eXBlPVxcXCJjcmFmdF9wbGFjZUJsb2NrXFxcIj48dGl0bGUgbmFtZT1cXFwiVFlQRVxcXCI+cGxhbmtzQmlyY2g8L3RpdGxlPjwvYmxvY2s+PC9uZXh0PjwvYmxvY2s+PC9zdGF0ZW1lbnQ+PC9ibG9jaz48L25leHQ+PC9ibG9jaz48L3htbD5cIixcbiAgICBibG9ja3NUb1N0b3JlOiBbXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICdob3VzZVJpZ2h0QycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnaG91c2VSaWdodEInLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJ2hvdXNlTGVmdEEnLCAnJywgJycsICdob3VzZVJpZ2h0QScsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnaG91c2VCb3R0b21BJywgJ2hvdXNlQm90dG9tQicsICdob3VzZUJvdHRvbUMnLCAnaG91c2VCb3R0b21EJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJyddLFxuICAgIGFjdGlvblBsYW5lOiBbXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJyxcbiAgICAgICcnLCAnJywgJycsICdob3VzZUJvdHRvbUEnLCAnaG91c2VCb3R0b21CJywgJ2hvdXNlQm90dG9tQycsICdob3VzZUJvdHRvbUQnLCAnJywgJycsICcnLFxuICAgICAgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsXG4gICAgICAnJywgJycsICcnLCAnJywgJycsICcnLCAnJywgJycsICcnLCAnJ10sXG4gICAgcGxheWVyU3RhcnRQb3NpdGlvbjogWzMsIDddLFxuXG4gICAgaG91c2VCb3R0b21SaWdodDogWzUsIDZdLFxuICB9XG59O1xuIiwiaW1wb3J0IENvbW1hbmRRdWV1ZSBmcm9tIFwiLi9Db21tYW5kUXVldWUvQ29tbWFuZFF1ZXVlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL0Jhc2VDb21tYW5kLmpzXCI7XG5pbXBvcnQgRGVzdHJveUJsb2NrQ29tbWFuZCBmcm9tIFwiLi9Db21tYW5kUXVldWUvRGVzdHJveUJsb2NrQ29tbWFuZC5qc1wiO1xuaW1wb3J0IE1vdmVGb3J3YXJkQ29tbWFuZCBmcm9tIFwiLi9Db21tYW5kUXVldWUvTW92ZUZvcndhcmRDb21tYW5kLmpzXCI7XG5pbXBvcnQgVHVybkNvbW1hbmQgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlL1R1cm5Db21tYW5kLmpzXCI7XG5pbXBvcnQgV2hpbGVDb21tYW5kIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9XaGlsZUNvbW1hbmQuanNcIjtcbmltcG9ydCBJZkJsb2NrQWhlYWRDb21tYW5kIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS9JZkJsb2NrQWhlYWRDb21tYW5kLmpzXCI7XG5cbmltcG9ydCBMZXZlbE1vZGVsIGZyb20gXCIuL0xldmVsTVZDL0xldmVsTW9kZWwuanNcIjtcbmltcG9ydCBMZXZlbFZpZXcgZnJvbSBcIi4vTGV2ZWxNVkMvTGV2ZWxWaWV3LmpzXCI7XG5pbXBvcnQgQXNzZXRMb2FkZXIgZnJvbSBcIi4vTGV2ZWxNVkMvQXNzZXRMb2FkZXIuanNcIjtcblxuaW1wb3J0ICogYXMgQ29kZU9yZ0FQSSBmcm9tIFwiLi9BUEkvQ29kZU9yZ0FQSS5qc1wiO1xuXG52YXIgR0FNRV9XSURUSCA9IDQwMDtcbnZhciBHQU1FX0hFSUdIVCA9IDQwMDtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhIG5ldyBpbnN0YW5jZSBvZiBhIG1pbmktZ2FtZSB2aXN1YWxpemF0aW9uXG4gKi9cbmNsYXNzIEdhbWVDb250cm9sbGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBnYW1lQ29udHJvbGxlckNvbmZpZ1xuICAgKiBAcGFyYW0ge1N0cmluZ30gZ2FtZUNvbnRyb2xsZXJDb25maWcuY29udGFpbmVySWQgRE9NIElEIHRvIG1vdW50IHRoaXMgYXBwXG4gICAqIEBwYXJhbSB7UGhhc2VyfSBnYW1lQ29udHJvbGxlckNvbmZpZy5QaGFzZXIgUGhhc2VyIHBhY2thZ2VcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlckNvbmZpZykge1xuICAgIHRoaXMuREVCVUcgPSBnYW1lQ29udHJvbGxlckNvbmZpZy5kZWJ1ZztcblxuICAgIC8vIFBoYXNlciBwcmUtaW5pdGlhbGl6YXRpb24gY29uZmlnXG4gICAgd2luZG93LlBoYXNlckdsb2JhbCA9IHtcbiAgICAgIGRpc2FibGVBdWRpbzogdHJ1ZSxcbiAgICAgIGhpZGVCYW5uZXI6ICF0aGlzLkRFQlVHXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWMge09iamVjdH0gY29kZU9yZ0FQSSAtIEFQSSB3aXRoIGV4dGVybmFsbHktY2FsbGFibGUgbWV0aG9kcyBmb3JcbiAgICAgKiBzdGFydGluZyBhbiBhdHRlbXB0LCBpc3N1aW5nIGNvbW1hbmRzLCBldGMuXG4gICAgICovXG4gICAgdGhpcy5jb2RlT3JnQVBJID0gQ29kZU9yZ0FQSS5nZXQodGhpcyk7XG5cbiAgICB2YXIgUGhhc2VyID0gZ2FtZUNvbnRyb2xsZXJDb25maWcuUGhhc2VyO1xuXG4gICAgLyoqXG4gICAgICogTWFpbiBQaGFzZXIgZ2FtZSBpbnN0YW5jZS5cbiAgICAgKiBAcHJvcGVydHkge1BoYXNlci5HYW1lfVxuICAgICAqL1xuICAgIHRoaXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSh7XG4gICAgICB3aWR0aDogR0FNRV9XSURUSCxcbiAgICAgIGhlaWdodDogR0FNRV9IRUlHSFQsXG4gICAgICByZW5kZXJlcjogUGhhc2VyLkNBTlZBUyxcbiAgICAgIHBhcmVudDogZ2FtZUNvbnRyb2xsZXJDb25maWcuY29udGFpbmVySWQsXG4gICAgICBzdGF0ZTogJ2Vhcmx5TG9hZCcsXG4gICAgICAvLyBUT0RPKGJqb3JkYW4pOiByZW1vdmUgbm93IHRoYXQgdXNpbmcgY2FudmFzP1xuICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlIC8vIGVuYWJsZXMgc2F2aW5nIC5wbmcgc2NyZWVuZ3JhYnNcbiAgICB9KTtcblxuICAgIHRoaXMuc3BlY2lhbExldmVsVHlwZSA9IG51bGw7XG4gICAgdGhpcy5xdWV1ZSA9IG5ldyBDb21tYW5kUXVldWUodGhpcyk7XG4gICAgdGhpcy5PbkNvbXBsZXRlQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgdGhpcy5hc3NldFJvb3QgPSBnYW1lQ29udHJvbGxlckNvbmZpZy5hc3NldFJvb3Q7XG5cbiAgICB0aGlzLmF1ZGlvUGxheWVyID0gZ2FtZUNvbnRyb2xsZXJDb25maWcuYXVkaW9QbGF5ZXI7XG4gICAgdGhpcy5hc3NldExvYWRlciA9IG5ldyBBc3NldExvYWRlcih0aGlzKTtcbiAgICB0aGlzLmVhcmx5TG9hZEFzc2V0UGFja3MgPVxuICAgICAgICBnYW1lQ29udHJvbGxlckNvbmZpZy5lYXJseUxvYWRBc3NldFBhY2tzIHx8IFtdO1xuICAgIHRoaXMuZWFybHlMb2FkTmljZVRvSGF2ZUFzc2V0UGFja3MgPVxuICAgICAgICBnYW1lQ29udHJvbGxlckNvbmZpZy5lYXJseUxvYWROaWNlVG9IYXZlQXNzZXRQYWNrcyB8fCBbXTtcblxuICAgIHRoaXMucmVzZXR0YWJsZVRpbWVycyA9IFtdO1xuXG4gICAgLy8gUGhhc2VyIFwic2xvdyBtb3Rpb25cIiBtb2RpZmllciB3ZSBvcmlnaW5hbGx5IHR1bmVkIGFuaW1hdGlvbnMgdXNpbmdcbiAgICB0aGlzLmFzc3VtZWRTbG93TW90aW9uID0gMS41O1xuICAgIHRoaXMuaW5pdGlhbFNsb3dNb3Rpb24gPSBnYW1lQ29udHJvbGxlckNvbmZpZy5jdXN0b21TbG93TW90aW9uIHx8IHRoaXMuYXNzdW1lZFNsb3dNb3Rpb247XG5cbiAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKCdlYXJseUxvYWQnLCB7XG4gICAgICBwcmVsb2FkOiAoKSA9PiB7XG4gICAgICAgIC8vIGRvbid0IGxldCBzdGF0ZSBjaGFuZ2Ugc3RvbXAgZXNzZW50aWFsIGFzc2V0IGRvd25sb2FkcyBpbiBwcm9ncmVzc1xuICAgICAgICB0aGlzLmdhbWUubG9hZC5yZXNldExvY2tlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuYXNzZXRMb2FkZXIubG9hZFBhY2tzKHRoaXMuZWFybHlMb2FkQXNzZXRQYWNrcyk7XG4gICAgICB9LFxuICAgICAgY3JlYXRlOiAoKSA9PiB7XG4gICAgICAgIC8vIG9wdGlvbmFsbHkgbG9hZCBzb21lIG1vcmUgYXNzZXRzIGlmIHdlIGNvbXBsZXRlIGVhcmx5IGxvYWQgYmVmb3JlIGxldmVsIGxvYWRcbiAgICAgICAgdGhpcy5hc3NldExvYWRlci5sb2FkUGFja3ModGhpcy5lYXJseUxvYWROaWNlVG9IYXZlQXNzZXRQYWNrcyk7XG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmdhbWUuc3RhdGUuYWRkKCdsZXZlbFJ1bm5lcicsIHtcbiAgICAgIHByZWxvYWQ6IHRoaXMucHJlbG9hZC5iaW5kKHRoaXMpLFxuICAgICAgY3JlYXRlOiB0aGlzLmNyZWF0ZS5iaW5kKHRoaXMpLFxuICAgICAgdXBkYXRlOiB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLFxuICAgICAgcmVuZGVyOiB0aGlzLnJlbmRlci5iaW5kKHRoaXMpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGxldmVsQ29uZmlnXG4gICAqL1xuICBsb2FkTGV2ZWwobGV2ZWxDb25maWcpIHtcbiAgICB0aGlzLmxldmVsRGF0YSA9IE9iamVjdC5mcmVlemUobGV2ZWxDb25maWcpO1xuXG4gICAgdGhpcy5sZXZlbE1vZGVsID0gbmV3IExldmVsTW9kZWwodGhpcy5sZXZlbERhdGEpO1xuICAgIHRoaXMubGV2ZWxWaWV3ID0gbmV3IExldmVsVmlldyh0aGlzKTtcbiAgICB0aGlzLnNwZWNpYWxMZXZlbFR5cGUgPSBsZXZlbENvbmZpZy5zcGVjaWFsTGV2ZWxUeXBlO1xuXG4gICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdsZXZlbFJ1bm5lcicpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5sZXZlbE1vZGVsLnJlc2V0KCk7XG4gICAgdGhpcy5sZXZlbFZpZXcucmVzZXQodGhpcy5sZXZlbE1vZGVsKTtcbiAgICB0aGlzLnJlc2V0dGFibGVUaW1lcnMuZm9yRWFjaCgodGltZXIpID0+IHtcbiAgICAgIHRpbWVyLnN0b3AodHJ1ZSk7XG4gICAgfSk7XG4gICAgdGhpcy5yZXNldHRhYmxlVGltZXJzLmxlbmd0aCA9IDA7XG4gIH1cblxuICBwcmVsb2FkKCkge1xuICAgIHRoaXMuZ2FtZS5sb2FkLnJlc2V0TG9ja2VkID0gdHJ1ZTtcbiAgICB0aGlzLmdhbWUudGltZS5hZHZhbmNlZFRpbWluZyA9IHRoaXMuREVCVUc7XG4gICAgdGhpcy5nYW1lLnN0YWdlLmRpc2FibGVWaXNpYmlsaXR5Q2hhbmdlID0gdHJ1ZTtcbiAgICB0aGlzLmFzc2V0TG9hZGVyLmxvYWRQYWNrcyh0aGlzLmxldmVsRGF0YS5hc3NldFBhY2tzLmJlZm9yZUxvYWQpO1xuICB9XG5cbiAgY3JlYXRlKCkge1xuICAgIHRoaXMubGV2ZWxWaWV3LmNyZWF0ZSh0aGlzLmxldmVsTW9kZWwpO1xuICAgIHRoaXMuZ2FtZS50aW1lLnNsb3dNb3Rpb24gPSB0aGlzLmluaXRpYWxTbG93TW90aW9uO1xuICAgIHRoaXMuYWRkQ2hlYXRLZXlzKCk7XG4gICAgdGhpcy5hc3NldExvYWRlci5sb2FkUGFja3ModGhpcy5sZXZlbERhdGEuYXNzZXRQYWNrcy5hZnRlckxvYWQpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLnN0YXJ0KCk7XG4gIH1cblxuICBmb2xsb3dpbmdQbGF5ZXIoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5sZXZlbERhdGEuZ3JpZERpbWVuc2lvbnM7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgICB0aGlzLnF1ZXVlLnRpY2soKTtcbiAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZSgpO1xuXG4gICAgICBpZiAodGhpcy5xdWV1ZS5pc0ZpbmlzaGVkKCkpIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUVuZFN0YXRlKCk7XG4gICAgICB9IFxuICB9XG5cbiAgYWRkQ2hlYXRLZXlzKCkge1xuICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlRJTERFKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5VUCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IG1vdmUgZm9yd2FyZCBjb21tYW5kLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLm1vdmVGb3J3YXJkKGR1bW15RnVuYyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUklHSFQpLm9uVXAuYWRkKCgpID0+IHtcbiAgICAgICAgdmFyIGR1bW15RnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImhpZ2hsaWdodCB0dXJuIHJpZ2h0IGNvbW1hbmQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvZGVPcmdBUEkudHVyblJpZ2h0KGR1bW15RnVuYyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IHR1cm4gbGVmdCBjb21tYW5kLlwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLnR1cm5MZWZ0KGR1bW15RnVuYyk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuUCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IHBsYWNlQmxvY2sgY29tbWFuZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY29kZU9yZ0FQSS5wbGFjZUJsb2NrKGR1bW15RnVuYywgXCJsb2dPYWtcIik7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRCkub25VcC5hZGQoKCkgPT4ge1xuICAgICAgICB2YXIgZHVtbXlGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGlnaGxpZ2h0IGRlc3Ryb3kgYmxvY2sgY29tbWFuZC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY29kZU9yZ0FQSS5kZXN0cm95QmxvY2soZHVtbXlGdW5jKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5FKS5vblVwLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBkdW1teUZ1bmMgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYEV4ZWN1dGUgY29tbWFuZCBsaXN0IGRvbmU6ICR7cmVzdWx0fSBgKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLnN0YXJ0QXR0ZW1wdChkdW1teUZ1bmMpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlcpLm9uVXAuYWRkKCgpID0+IHtcbiAgICAgICAgdmFyIGR1bW15RnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgV2hpbGUgY29tbWFuZCBsaXN0XCIpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgYmxvY2tUeXBlID0gXCJlbXB0eVwiO1xuICAgICAgICB2YXIgY29kZUJsb2NrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSS5tb3ZlRm9yd2FyZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgV2hpbGUgY29tbWFuZCBtb3ZlIGJsb2NrXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIuY29kZU9yZ0FQSS5tb3ZlRm9yd2FyZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4ZWN1dGUgV2hpbGUgY29tbWFuZCBtb3ZlIGJsb2NrMlwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLmNvZGVPcmdBUEkudHVybkxlZnQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFeGVjdXRlIFdoaWxlIGNvbW1hbmQgdHVyblwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb2RlT3JnQVBJLndoaWxlUGF0aEFoZWFkKGR1bW15RnVuYywgYmxvY2tUeXBlLCBjb2RlQmxvY2spO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBoYW5kbGVFbmRTdGF0ZSgpIHtcbiAgICAgIC8vIFRPRE86IGdvIGludG8gc3VjY2Vzcy9mYWlsdXJlIGFuaW1hdGlvbj8gKG9yIGFyZSB3ZSBjYWxsZWQgYnkgQ29kZU9yZyBmb3IgdGhhdD8pXG5cbiAgICAgIC8vIHJlcG9ydCBiYWNrIHRvIHRoZSBjb2RlLm9yZyBzaWRlIHRoZSBwYXNzL2ZhaWwgcmVzdWx0IFxuICAgICAgLy8gICAgIHRoZW4gY2xlYXIgdGhlIGNhbGxiYWNrIHNvIHdlIGRvbnQga2VlcCBjYWxsaW5nIGl0XG4gICAgICBpZiAodGhpcy5PbkNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICBpZiAodGhpcy5xdWV1ZS5pc1N1Y2NlZWRlZCgpKSB7XG4gICAgICAgICAgICAgIHRoaXMuT25Db21wbGV0ZUNhbGxiYWNrKHRydWUsIHRoaXMubGV2ZWxNb2RlbCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLk9uQ29tcGxldGVDYWxsYmFjayhmYWxzZSwgdGhpcy5sZXZlbE1vZGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5PbkNvbXBsZXRlQ2FsbGJhY2sgPSBudWxsO1xuICAgICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLkRFQlVHKSB7XG4gICAgICB0aGlzLmdhbWUuZGVidWcudGV4dCh0aGlzLmdhbWUudGltZS5mcHMgfHwgJy0tJywgMiwgMTQsIFwiIzAwZmYwMFwiKTtcbiAgICB9XG4gICAgdGhpcy5sZXZlbFZpZXcucmVuZGVyKCk7XG4gIH1cblxuICBzY2FsZUZyb21PcmlnaW5hbCgpIHtcbiAgICB2YXIgW25ld1dpZHRoLCBuZXdIZWlnaHRdID0gdGhpcy5sZXZlbERhdGEuZ3JpZERpbWVuc2lvbnMgfHwgWzEwLCAxMF07XG4gICAgdmFyIFtvcmlnaW5hbFdpZHRoLCBvcmlnaW5hbEhlaWdodF0gPSBbMTAsIDEwXTtcbiAgICByZXR1cm4gW25ld1dpZHRoIC8gb3JpZ2luYWxXaWR0aCwgbmV3SGVpZ2h0IC8gb3JpZ2luYWxIZWlnaHRdO1xuICB9XG5cbiAgZ2V0U2NyZWVuc2hvdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nYW1lLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gIH1cblxuICAvLyBjb21tYW5kIHByb2Nlc3NvcnNcbiAgbW92ZUZvcndhcmQoY29tbWFuZFF1ZXVlSXRlbSkge1xuICAgIHZhciBwbGF5ZXIgPSB0aGlzLmxldmVsTW9kZWwucGxheWVyLFxuICAgICAgYWxsRm91bmRDcmVlcGVycyxcbiAgICAgIGdyb3VuZFR5cGUsXG4gICAgICBqdW1wT2ZmO1xuXG4gICAgaWYgKHRoaXMubGV2ZWxNb2RlbC5jYW5Nb3ZlRm9yd2FyZCgpKSB7XG4gICAgICBsZXQgd2FzT25CbG9jayA9IHBsYXllci5pc09uQmxvY2s7XG4gICAgICB0aGlzLmxldmVsTW9kZWwubW92ZUZvcndhcmQoKTtcbiAgICAgIC8vIFRPRE86IGNoZWNrIGZvciBMYXZhLCBDcmVlcGVyLCB3YXRlciA9PiBwbGF5IGFwcHJvcCBhbmltYXRpb24gJiBjYWxsIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKClcblxuICAgICAganVtcE9mZiA9IHdhc09uQmxvY2sgJiYgd2FzT25CbG9jayAhPSBwbGF5ZXIuaXNPbkJsb2NrO1xuICAgICAgaWYocGxheWVyLmlzT25CbG9jayB8fCBqdW1wT2ZmKSB7XG4gICAgICAgIGdyb3VuZFR5cGUgPSB0aGlzLmxldmVsTW9kZWwuYWN0aW9uUGxhbmVbdGhpcy5sZXZlbE1vZGVsLnlUb0luZGV4KHBsYXllci5wb3NpdGlvblsxXSkgKyBwbGF5ZXIucG9zaXRpb25bMF1dLmJsb2NrVHlwZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBncm91bmRUeXBlID0gdGhpcy5sZXZlbE1vZGVsLmdyb3VuZFBsYW5lW3RoaXMubGV2ZWxNb2RlbC55VG9JbmRleChwbGF5ZXIucG9zaXRpb25bMV0pICsgcGxheWVyLnBvc2l0aW9uWzBdXS5ibG9ja1R5cGU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlNb3ZlRm9yd2FyZEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIGp1bXBPZmYsIHBsYXllci5pc09uQmxvY2ssIGdyb3VuZFR5cGUsICgpID0+IHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUlkbGVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrKTtcblxuICAgICAgLy9GaXJzdCBhcmcgaXMgaWYgd2UgZm91bmQgYSBjcmVlcGVyXG4gICAgICAgIGFsbEZvdW5kQ3JlZXBlcnMgPSB0aGlzLmxldmVsTW9kZWwuaXNQbGF5ZXJTdGFuZGluZ05lYXJDcmVlcGVyKCk7XG5cbiAgICAgICAgaWYgKHRoaXMubGV2ZWxNb2RlbC5pc1BsYXllclN0YW5kaW5nSW5XYXRlcigpKSB7XG4gICAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5RHJvd25GYWlsdXJlQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgcGxheWVyLmlzT25CbG9jaywgKCkgPT4ge1xuICAgICAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLmZhaWxlZCgpO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9IFxuICAgICAgICBlbHNlIGlmKHRoaXMubGV2ZWxNb2RlbC5pc1BsYXllclN0YW5kaW5nSW5MYXZhKCkpIHtcbiAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5QnVybkluTGF2YUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssICgpID0+IHtcbiAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKCk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuZGVsYXlCeSgyMDAsICgpID0+IHtcbiAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICBpZih0aGlzLmxldmVsTW9kZWwuaXNGb3J3YXJkQmxvY2tPZlR5cGUoXCJjcmVlcGVyXCIpKVxuICAgICAge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5Q3JlZXBlckV4cGxvZGVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCB0aGlzLmxldmVsTW9kZWwuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpLCBwbGF5ZXIuaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5mYWlsZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUJ1bXBBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZGVsYXlCeSg4MDAsICgpID0+IHtcbiAgICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0dXJuKGNvbW1hbmRRdWV1ZUl0ZW0sIGRpcmVjdGlvbikge1xuICAgIGlmIChkaXJlY3Rpb24gPT0gLTEpIHtcbiAgICAgIHRoaXMubGV2ZWxNb2RlbC50dXJuTGVmdCgpO1xuICAgIH1cblxuICAgIGlmIChkaXJlY3Rpb24gPT0gMSkge1xuICAgICAgdGhpcy5sZXZlbE1vZGVsLnR1cm5SaWdodCgpO1xuICAgIH1cbiAgICB0aGlzLmxldmVsVmlldy51cGRhdGVQbGF5ZXJEaXJlY3Rpb24odGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcpO1xuXG4gICAgdGhpcy5kZWxheUJ5KDgwMCwgKCkgPT4ge1xuICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICB9KTtcblxuICB9XG5cbiAgZGVzdHJveUJsb2NrV2l0aG91dFBsYXllckludGVyYWN0aW9uKHBvc2l0aW9uKSB7XG4gICAgbGV0IGJsb2NrID0gdGhpcy5sZXZlbE1vZGVsLmFjdGlvblBsYW5lW3RoaXMubGV2ZWxNb2RlbC55VG9JbmRleChwb3NpdGlvblsxXSkgKyBwb3NpdGlvblswXV07XG4gICAgdGhpcy5sZXZlbE1vZGVsLmRlc3Ryb3lCbG9jayhwb3NpdGlvbik7XG5cbiAgICBpZiAoYmxvY2sgIT09IG51bGwpIHtcbiAgICAgIGxldCBkZXN0cm95UG9zaXRpb24gPSBibG9jay5wb3NpdGlvbjtcbiAgICAgIGxldCBibG9ja1R5cGUgPSBibG9jay5ibG9ja1R5cGU7XG5cbiAgICAgIGlmIChibG9jay5pc0Rlc3Ryb3lhYmxlKSB7XG4gICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlRm93UGxhbmUoKTtcbiAgICAgICAgc3dpdGNoKGJsb2NrVHlwZSl7XG4gICAgICAgICAgY2FzZSBcImxvZ0FjYWNpYVwiOlxuICAgICAgICAgIGNhc2UgXCJ0cmVlQWNhY2lhXCI6XG4gICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0FjYWNpYVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJsb2dCaXJjaFwiOlxuICAgICAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NCaXJjaFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJsb2dKdW5nbGVcIjpcbiAgICAgICAgICBjYXNlIFwidHJlZUp1bmdsZVwiOlxuICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NKdW5nbGVcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwibG9nT2FrXCI6XG4gICAgICAgICAgY2FzZSBcInRyZWVPYWtcIjpcbiAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NPYWtcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwibG9nU3BydWNlXCI6XG4gICAgICAgICAgY2FzZSBcInRyZWVTcHJ1Y2VcIjpcbiAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzU3BydWNlXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sZXZlbFZpZXcuYWN0aW9uUGxhbmVCbG9ja3NbdGhpcy5sZXZlbE1vZGVsLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyBkZXN0cm95UG9zaXRpb25bMF1dLmtpbGwoKTtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUV4cGxvc2lvbkFuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsICgpPT57fSwgdHJ1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGJsb2NrLmlzVXNhYmxlKSB7XG4gICAgICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICAgICAgY2FzZSBcInNoZWVwXCI6XG4gICAgICAgICAgICAvLyBUT0RPOiBXaGF0IHRvIGRvIHdpdGggYWxyZWFkeSBzaGVlcmVkIHNoZWVwP1xuICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVNoZWFyQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgKCk9Pnt9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveUJsb2NrKGNvbW1hbmRRdWV1ZUl0ZW0pIHtcbiAgICBsZXQgcGxheWVyID0gdGhpcy5sZXZlbE1vZGVsLnBsYXllcjtcbiAgICBpZiAodGhpcy5sZXZlbE1vZGVsLmNhbkRlc3Ryb3lCbG9ja0ZvcndhcmQoKSkge1xuICAgICAgbGV0IGJsb2NrID0gdGhpcy5sZXZlbE1vZGVsLmRlc3Ryb3lCbG9ja0ZvcndhcmQoKTtcblxuICAgICAgaWYgKGJsb2NrICE9PSBudWxsKSB7XG4gICAgICAgIGxldCBkZXN0cm95UG9zaXRpb24gPSBibG9jay5wb3NpdGlvbjtcbiAgICAgICAgbGV0IGJsb2NrVHlwZSA9IGJsb2NrLmJsb2NrVHlwZTtcblxuICAgICAgICBpZiAoYmxvY2suaXNEZXN0cm95YWJsZSkge1xuICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVGb3dQbGFuZSgpO1xuICAgICAgICAgIHN3aXRjaChibG9ja1R5cGUpe1xuICAgICAgICAgICAgY2FzZSBcImxvZ0FjYWNpYVwiOlxuICAgICAgICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NBY2FjaWFcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImxvZ0JpcmNoXCI6XG4gICAgICAgICAgICBjYXNlIFwidHJlZUJpcmNoXCI6XG4gICAgICAgICAgICAgYmxvY2tUeXBlID0gXCJwbGFua3NCaXJjaFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibG9nSnVuZ2xlXCI6XG4gICAgICAgICAgICBjYXNlIFwidHJlZUp1bmdsZVwiOlxuICAgICAgICAgICAgICBibG9ja1R5cGUgPSBcInBsYW5rc0p1bmdsZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibG9nT2FrXCI6XG4gICAgICAgICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzT2FrXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsb2dTcHJ1Y2VcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0cmVlU3BydWNlXCI6XG4gICAgICAgICAgICAgIGJsb2NrVHlwZSA9IFwicGxhbmtzU3BydWNlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5RGVzdHJveUJsb2NrQW5pbWF0aW9uKHBsYXllci5wb3NpdGlvbiwgcGxheWVyLmZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUsIHRoaXMubGV2ZWxNb2RlbC5mb3dQbGFuZSwgKCkgPT4ge1xuICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChibG9jay5pc1VzYWJsZSkge1xuICAgICAgICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwic2hlZXBcIjpcbiAgICAgICAgICAgICAgLy8gVE9ETzogV2hhdCB0byBkbyB3aXRoIGFscmVhZHkgc2hlZXJlZCBzaGVlcD9cbiAgICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVNoZWFyU2hlZXBBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVB1bmNoRGVzdHJveUFpckFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHRoaXMubGV2ZWxNb2RlbC5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCksICgpID0+IHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocGxheWVyLnBvc2l0aW9uWzBdLCBwbGF5ZXIucG9zaXRpb25bMV0pO1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5SWRsZUFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2spO1xuICAgICAgICB0aGlzLmRlbGF5QnkoNjAwLCAoKSA9PiB7XG4gICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjYW5Vc2VUaW50cygpIHtcbiAgICAvLyBUT0RPKGJqb3JkYW4pOiBSZW1vdmVcbiAgICAvLyBhbGwgYnJvd3NlcnMgYXBwZWFyIHRvIHdvcmsgd2l0aCBuZXcgdmVyc2lvbiBvZiBQaGFzZXJcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNoZWNrVG50QW5pbWF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnNwZWNpYWxMZXZlbFR5cGUgPT09ICdmcmVlcGxheSc7XG4gIH1cblxuICBjaGVja01pbmVjYXJ0TGV2ZWxFbmRBbmltYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BlY2lhbExldmVsVHlwZSA9PT0gJ21pbmVjYXJ0JztcbiAgfVxuXG4gIGNoZWNrSG91c2VCdWlsdEVuZEFuaW1hdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zcGVjaWFsTGV2ZWxUeXBlID09PSAnaG91c2VCdWlsZCc7XG4gIH1cblxuICBjaGVja1JhaWxCbG9jayhibG9ja1R5cGUpIHtcbiAgICB2YXIgY2hlY2tSYWlsQmxvY2sgPSB0aGlzLmxldmVsTW9kZWwucmFpbE1hcFt0aGlzLmxldmVsTW9kZWwueVRvSW5kZXgodGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvblsxXSkgKyB0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uWzBdXTtcbiAgICBpZiAoY2hlY2tSYWlsQmxvY2sgIT09IFwiXCIpIHtcbiAgICAgIGJsb2NrVHlwZSA9IGNoZWNrUmFpbEJsb2NrO1xuICAgIH0gZWxzZSB7XG4gICAgICBibG9ja1R5cGUgPSBcInJhaWxzVmVydGljYWxcIjtcbiAgICB9XG4gICAgcmV0dXJuIGJsb2NrVHlwZTtcbiAgfVxuXG4gIHBsYWNlQmxvY2soY29tbWFuZFF1ZXVlSXRlbSwgYmxvY2tUeXBlKSB7XG4gICAgdmFyIGJsb2NrSW5kZXggPSAodGhpcy5sZXZlbE1vZGVsLnlUb0luZGV4KHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb25bMV0pICsgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvblswXSk7XG4gICAgdmFyIGJsb2NrVHlwZUF0UG9zaXRpb24gPSB0aGlzLmxldmVsTW9kZWwuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlO1xuICAgIGlmICh0aGlzLmxldmVsTW9kZWwuY2FuUGxhY2VCbG9jaygpKSB7XG4gICAgICBpZih0aGlzLmNoZWNrTWluZWNhcnRMZXZlbEVuZEFuaW1hdGlvbigpICYmIGJsb2NrVHlwZSA9PSBcInJhaWxcIikge1xuICAgICAgICBibG9ja1R5cGUgPSB0aGlzLmNoZWNrUmFpbEJsb2NrKGJsb2NrVHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChibG9ja1R5cGVBdFBvc2l0aW9uICE9PSBcIlwiKSB7XG4gICAgICAgIHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2soYmxvY2tJbmRleCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5sZXZlbE1vZGVsLnBsYWNlQmxvY2soYmxvY2tUeXBlKSkge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5UGxhY2VCbG9ja0FuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgYmxvY2tUeXBlLCBibG9ja1R5cGVBdFBvc2l0aW9uLCAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVGb3dQbGFuZSgpO1xuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZVNoYWRpbmdQbGFuZSh0aGlzLmxldmVsTW9kZWwuc2hhZGluZ1BsYW5lKTtcbiAgICAgICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVGb3dQbGFuZSh0aGlzLmxldmVsTW9kZWwuZm93UGxhbmUpO1xuICAgICAgICAgIHRoaXMuZGVsYXlCeSgyMDAsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBmYWxzZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5kZWxheUJ5KDQwMCwgKCkgPT4ge1xuICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc2lnbmFsQmluZGluZyA9IHRoaXMubGV2ZWxWaWV3LnBsYXlQbGF5ZXJBbmltYXRpb24oXCJqdW1wVXBcIiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5mYWNpbmcsIGZhbHNlKS5vbkxvb3AuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5SWRsZUFuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgZmFsc2UpO1xuICAgICAgICAgIHNpZ25hbEJpbmRpbmcuZGV0YWNoKCk7XG4gICAgICAgICAgdGhpcy5kZWxheUJ5KDgwMCwgKCkgPT4geyBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpOyB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKCk7XG4gICAgfVxuICB9XG5cbiAgZGVsYXlCeShtcywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgdGltZXIgPSB0aGlzLmdhbWUudGltZS5jcmVhdGUodHJ1ZSk7XG4gICAgdGltZXIuYWRkKHRoaXMub3JpZ2luYWxNc1RvU2NhbGVkKG1zKSwgY29tcGxldGlvbkhhbmRsZXIsIHRoaXMpO1xuICAgIHRpbWVyLnN0YXJ0KCk7XG4gICAgdGhpcy5yZXNldHRhYmxlVGltZXJzLnB1c2godGltZXIpO1xuICB9XG5cbiAgb3JpZ2luYWxNc1RvU2NhbGVkKG1zKSB7XG4gICAgdmFyIHJlYWxNcyA9IG1zIC8gdGhpcy5hc3N1bWVkU2xvd01vdGlvbjtcbiAgICByZXR1cm4gcmVhbE1zICogdGhpcy5nYW1lLnRpbWUuc2xvd01vdGlvbjtcbiAgfVxuXG4gIG9yaWdpbmFsRnBzVG9TY2FsZWQoZnBzKSB7XG4gICAgdmFyIHJlYWxGcHMgPSBmcHMgKiB0aGlzLmFzc3VtZWRTbG93TW90aW9uO1xuICAgIHJldHVybiByZWFsRnBzIC8gdGhpcy5nYW1lLnRpbWUuc2xvd01vdGlvbjtcbiAgfVxuXG4gIHBsYWNlQmxvY2tGb3J3YXJkKGNvbW1hbmRRdWV1ZUl0ZW0sIGJsb2NrVHlwZSkge1xuICAgIHZhciBmb3J3YXJkUG9zaXRpb24sXG4gICAgICAgIHBsYWNlbWVudFBsYW5lLFxuICAgICAgICBzb3VuZEVmZmVjdCA9ICgpPT57fTtcblxuICAgIGlmICghdGhpcy5sZXZlbE1vZGVsLmNhblBsYWNlQmxvY2tGb3J3YXJkKCkpIHtcbiAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlQdW5jaEFpckFuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5SWRsZUFuaW1hdGlvbih0aGlzLmxldmVsTW9kZWwucGxheWVyLnBvc2l0aW9uLCB0aGlzLmxldmVsTW9kZWwucGxheWVyLmZhY2luZywgZmFsc2UpO1xuICAgICAgICBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yd2FyZFBvc2l0aW9uID0gdGhpcy5sZXZlbE1vZGVsLmdldE1vdmVGb3J3YXJkUG9zaXRpb24oKTtcbiAgICBwbGFjZW1lbnRQbGFuZSA9IHRoaXMubGV2ZWxNb2RlbC5nZXRQbGFuZVRvUGxhY2VPbihmb3J3YXJkUG9zaXRpb24pO1xuICAgIGlmKHRoaXMubGV2ZWxNb2RlbC5pc0Jsb2NrT2ZUeXBlT25QbGFuZShmb3J3YXJkUG9zaXRpb24sIFwibGF2YVwiLCBwbGFjZW1lbnRQbGFuZSkpIHtcbiAgICAgIHNvdW5kRWZmZWN0ID0gKCk9Pnt0aGlzLmxldmVsVmlldy5hdWRpb1BsYXllci5wbGF5KFwiZml6elwiKTt9O1xuICAgIH1cbiAgICB0aGlzLmxldmVsTW9kZWwucGxhY2VCbG9ja0ZvcndhcmQoYmxvY2tUeXBlLCBwbGFjZW1lbnRQbGFuZSk7XG4gICAgdGhpcy5sZXZlbFZpZXcucGxheVBsYWNlQmxvY2tJbkZyb250QW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCB0aGlzLmxldmVsTW9kZWwuZ2V0TW92ZUZvcndhcmRQb3NpdGlvbigpLCBwbGFjZW1lbnRQbGFuZSwgYmxvY2tUeXBlLCAoKSA9PiB7XG4gICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZVNoYWRpbmdQbGFuZSgpO1xuICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVGb3dQbGFuZSgpO1xuICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlU2hhZGluZ1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlRm93UGxhbmUodGhpcy5sZXZlbE1vZGVsLmZvd1BsYW5lKTtcbiAgICAgIHNvdW5kRWZmZWN0KCk7XG4gICAgICB0aGlzLmRlbGF5QnkoMjAwLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlJZGxlQW5pbWF0aW9uKHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24sIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuZmFjaW5nLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZGVsYXlCeSg0MDAsICgpID0+IHtcbiAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgY2hlY2tTb2x1dGlvbihjb21tYW5kUXVldWVJdGVtKSB7XG4gICAgbGV0IHBsYXllciA9IHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXI7XG4gICAgdGhpcy5sZXZlbFZpZXcuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocGxheWVyLnBvc2l0aW9uWzBdLCBwbGF5ZXIucG9zaXRpb25bMV0pO1xuXG4gICAgLy8gY2hlY2sgdGhlIGZpbmFsIHN0YXRlIHRvIHNlZSBpZiBpdHMgc29sdmVkXG4gICAgaWYgKHRoaXMubGV2ZWxNb2RlbC5pc1NvbHZlZCgpKSB7XG4gICAgICBpZih0aGlzLmNoZWNrSG91c2VCdWlsdEVuZEFuaW1hdGlvbigpKSB7XG4gICAgICAgIHZhciBob3VzZUJvdHRvbVJpZ2h0ID0gdGhpcy5sZXZlbE1vZGVsLmdldEhvdXNlQm90dG9tUmlnaHQoKTtcbiAgICAgICAgdmFyIGluRnJvbnRPZkRvb3IgPSBbaG91c2VCb3R0b21SaWdodFswXSAtIDEsIGhvdXNlQm90dG9tUmlnaHRbMV0gKyAyXTtcbiAgICAgICAgdmFyIGJlZFBvc2l0aW9uID0gW2hvdXNlQm90dG9tUmlnaHRbMF0sIGhvdXNlQm90dG9tUmlnaHRbMV1dO1xuICAgICAgICB2YXIgZG9vclBvc2l0aW9uID0gW2hvdXNlQm90dG9tUmlnaHRbMF0gLSAxLCBob3VzZUJvdHRvbVJpZ2h0WzFdICsgMV07XG4gICAgICAgIHRoaXMubGV2ZWxNb2RlbC5tb3ZlVG8oaW5Gcm9udE9mRG9vcik7XG4gICAgICAgIHRoaXMubGV2ZWxWaWV3LnBsYXlTdWNjZXNzSG91c2VCdWlsdEFuaW1hdGlvbihcbiAgICAgICAgICAgIHBsYXllci5wb3NpdGlvbixcbiAgICAgICAgICAgIHBsYXllci5mYWNpbmcsXG4gICAgICAgICAgICBwbGF5ZXIuaXNPbkJsb2NrLFxuICAgICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmhvdXNlR3JvdW5kVG9GbG9vckJsb2Nrcyhob3VzZUJvdHRvbVJpZ2h0KSxcbiAgICAgICAgICAgIFtiZWRQb3NpdGlvbiwgZG9vclBvc2l0aW9uXSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgY29tbWFuZFF1ZXVlSXRlbS5zdWNjZWVkZWQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2soYmVkUG9zaXRpb24pO1xuICAgICAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuZGVzdHJveUJsb2NrKGRvb3JQb3NpdGlvbik7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5jb21wdXRlRm93UGxhbmUoKTtcbiAgICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlU2hhZGluZ1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgICAgICAgICAgICB0aGlzLmxldmVsVmlldy51cGRhdGVGb3dQbGFuZSh0aGlzLmxldmVsTW9kZWwuZm93UGxhbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0aGlzLmNoZWNrTWluZWNhcnRMZXZlbEVuZEFuaW1hdGlvbigpKVxuICAgICAge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5TWluZWNhcnRBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLFxuICAgICAgICAgICAgKCkgPT4geyBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpOyB9LCB0aGlzLmxldmVsTW9kZWwuZ2V0TWluZWNhcnRUcmFjaygpLCB0aGlzLmxldmVsTW9kZWwuZ2V0VW5wb3dlcmVkUmFpbHMoKSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHRoaXMuY2hlY2tUbnRBbmltYXRpb24oKSkge1xuICAgICAgICB0aGlzLmxldmVsVmlldy5zY2FsZVNob3dXaG9sZVdvcmxkKCgpID0+IHt9KTtcbiAgICAgICAgdmFyIHRudCA9IHRoaXMubGV2ZWxNb2RlbC5nZXRUbnQoKTtcbiAgICAgICAgdmFyIHdhc09uQmxvY2sgPSBwbGF5ZXIuaXNPbkJsb2NrO1xuICAgICAgICB0aGlzLmxldmVsVmlldy5wbGF5RGVzdHJveVRudEFuaW1hdGlvbihwbGF5ZXIucG9zaXRpb24sIHBsYXllci5mYWNpbmcsIHBsYXllci5pc09uQmxvY2ssIHRoaXMubGV2ZWxNb2RlbC5nZXRUbnQoKSwgdGhpcy5sZXZlbE1vZGVsLnNoYWRpbmdQbGFuZSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGlmICh0bnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBTaGFrZXMgY2FtZXJhIChuZWVkIHRvIGF2b2lkIGNvbnRlbnRpb24gd2l0aCBwYW4/KVxuICAgICAgICAgICAgLy90aGlzLmdhbWUuY2FtZXJhLnNldFBvc2l0aW9uKDAsIDUpO1xuICAgICAgICAgICAgLy90aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMuZ2FtZS5jYW1lcmEpXG4gICAgICAgICAgICAvLyAgICAudG8oe3k6IC0xMH0sIDQwLCBQaGFzZXIuRWFzaW5nLlNpbnVzb2lkYWwuSW5PdXQsIGZhbHNlLCAwLCAzLCB0cnVlKVxuICAgICAgICAgICAgLy8gICAgLnRvKHt5OiAwfSwgMClcbiAgICAgICAgICAgIC8vICAgIC5zdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IodmFyIGkgaW4gdG50KSB7XG4gICAgICAgICAgICBpZiAodG50W2ldLnggPT09IHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIucG9zaXRpb24ueCAmJiB0bnRbaV0ueSA9PT0gdGhpcy5sZXZlbE1vZGVsLnBsYXllci5wb3NpdGlvbi55KSB7XG4gICAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5wbGF5ZXIuaXNPbkJsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3Vycm91bmRpbmdCbG9ja3MgPSB0aGlzLmxldmVsTW9kZWwuZ2V0QWxsQm9yZGVyaW5nUG9zaXRpb25Ob3RPZlR5cGUodG50W2ldLCBcInRudFwiKTtcbiAgICAgICAgICAgIHRoaXMubGV2ZWxNb2RlbC5kZXN0cm95QmxvY2sodG50W2ldKTtcbiAgICAgICAgICAgIGZvcih2YXIgYiA9IDE7IGIgPCBzdXJyb3VuZGluZ0Jsb2Nrcy5sZW5ndGg7ICsrYikge1xuICAgICAgICAgICAgICBpZihzdXJyb3VuZGluZ0Jsb2Nrc1tiXVswXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveUJsb2NrV2l0aG91dFBsYXllckludGVyYWN0aW9uKHN1cnJvdW5kaW5nQmxvY2tzW2JdWzFdKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXBsYXllci5pc09uQmxvY2sgJiYgd2FzT25CbG9jaykge1xuICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVBsYXllckp1bXBEb3duVmVydGljYWxBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sZXZlbE1vZGVsLmNvbXB1dGVTaGFkaW5nUGxhbmUoKTtcbiAgICAgICAgICB0aGlzLmxldmVsTW9kZWwuY29tcHV0ZUZvd1BsYW5lKCk7XG4gICAgICAgICAgdGhpcy5sZXZlbFZpZXcudXBkYXRlU2hhZGluZ1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5zaGFkaW5nUGxhbmUpO1xuICAgICAgICAgIHRoaXMubGV2ZWxWaWV3LnVwZGF0ZUZvd1BsYW5lKHRoaXMubGV2ZWxNb2RlbC5mb3dQbGFuZSk7XG4gICAgICAgICAgdGhpcy5kZWxheUJ5KDIwMCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVN1Y2Nlc3NBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uc3VjY2VlZGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sZXZlbFZpZXcucGxheVN1Y2Nlc3NBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLFxuICAgICAgICAgICAgKCkgPT4geyBjb21tYW5kUXVldWVJdGVtLnN1Y2NlZWRlZCgpOyB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sZXZlbFZpZXcucGxheUZhaWx1cmVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrLCAoKSA9PiB7XG4gICAgICAgIGNvbW1hbmRRdWV1ZUl0ZW0uZmFpbGVkKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpc1BhdGhBaGVhZChibG9ja1R5cGUpICB7XG4gICAgICByZXR1cm4gdGhpcy5sZXZlbE1vZGVsLmlzRm9yd2FyZEJsb2NrT2ZUeXBlKGJsb2NrVHlwZSk7XG4gIH1cblxufVxuXG53aW5kb3cuR2FtZUNvbnRyb2xsZXIgPSBHYW1lQ29udHJvbGxlcjtcblxuZXhwb3J0IGRlZmF1bHQgR2FtZUNvbnRyb2xsZXI7XG4iLCJpbXBvcnQgRmFjaW5nRGlyZWN0aW9uIGZyb20gXCIuL0ZhY2luZ0RpcmVjdGlvbi5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXZlbFZpZXcge1xuICBjb25zdHJ1Y3Rvcihjb250cm9sbGVyKSB7XG4gICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICB0aGlzLmF1ZGlvUGxheWVyID0gY29udHJvbGxlci5hdWRpb1BsYXllcjtcbiAgICB0aGlzLmdhbWUgPSBjb250cm9sbGVyLmdhbWU7XG5cbiAgICB0aGlzLmJhc2VTaGFkaW5nID0gbnVsbDtcblxuICAgIHRoaXMucGxheWVyU3ByaXRlID0gbnVsbDtcbiAgICB0aGlzLnBsYXllckdob3N0ID0gbnVsbDsgICAgICAgIC8vIFRoZSBnaG9zdCBpcyBhIGNvcHkgb2YgdGhlIHBsYXllciBzcHJpdGUgdGhhdCBzaXRzIG9uIHRvcCBvZiBldmVyeXRoaW5nIGF0IDIwJSBvcGFjaXR5LCBzbyB0aGUgcGxheWVyIGNhbiBnbyB1bmRlciB0cmVlcyBhbmQgc3RpbGwgYmUgc2Vlbi5cbiAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvciA9IG51bGw7XG5cbiAgICB0aGlzLmdyb3VuZFBsYW5lID0gbnVsbDtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZSA9IG51bGw7XG4gICAgdGhpcy5hY3Rpb25QbGFuZSA9IG51bGw7XG4gICAgdGhpcy5mbHVmZlBsYW5lID0gbnVsbDtcbiAgICB0aGlzLmZvd1BsYW5lID0gbnVsbDtcblxuICAgIHRoaXMubWluaUJsb2NrcyA9IHtcbiAgICAgIFwiZGlydFwiOiBbXCJNaW5pYmxvY2tzXCIsIDAsIDVdLFxuICAgICAgXCJkaXJ0Q29hcnNlXCI6IFtcIk1pbmlibG9ja3NcIiwgNiwgMTFdLFxuICAgICAgXCJzYW5kXCI6IFtcIk1pbmlibG9ja3NcIiwgMTIsIDE3XSxcbiAgICAgIFwiZ3JhdmVsXCI6IFtcIk1pbmlibG9ja3NcIiwgMTgsIDIzXSxcbiAgICAgIFwiYnJpY2tzXCI6IFtcIk1pbmlibG9ja3NcIiwgMjQsIDI5XSxcbiAgICAgIFwibG9nQWNhY2lhXCI6IFtcIk1pbmlibG9ja3NcIiwgMzAsIDM1XSxcbiAgICAgIFwibG9nQmlyY2hcIjogW1wiTWluaWJsb2Nrc1wiLCAzNiwgNDFdLFxuICAgICAgXCJsb2dKdW5nbGVcIjogW1wiTWluaWJsb2Nrc1wiLCA0MiwgNDddLFxuICAgICAgXCJsb2dPYWtcIjogW1wiTWluaWJsb2Nrc1wiLCA0OCwgNTNdLFxuICAgICAgXCJsb2dTcHJ1Y2VcIjogW1wiTWluaWJsb2Nrc1wiLCA1NCwgNTldLFxuICAgICAgXCJwbGFua3NBY2FjaWFcIjogW1wiTWluaWJsb2Nrc1wiLCA2MCwgNjVdLFxuICAgICAgXCJwbGFua3NCaXJjaFwiOiBbXCJNaW5pYmxvY2tzXCIsIDY2LCA3MV0sXG4gICAgICBcInBsYW5rc0p1bmdsZVwiOiBbXCJNaW5pYmxvY2tzXCIsIDcyLCA3N10sXG4gICAgICBcInBsYW5rc09ha1wiOiBbXCJNaW5pYmxvY2tzXCIsIDc4LCA4M10sXG4gICAgICBcInBsYW5rc1NwcnVjZVwiOiBbXCJNaW5pYmxvY2tzXCIsIDg0LCA4OV0sXG4gICAgICBcImNvYmJsZXN0b25lXCI6IFtcIk1pbmlibG9ja3NcIiwgOTAsIDk1XSxcbiAgICAgIFwic2FuZHN0b25lXCI6IFtcIk1pbmlibG9ja3NcIiwgOTYsIDEwMV0sXG4gICAgICBcIndvb2xcIjogW1wiTWluaWJsb2Nrc1wiLCAxMDIsIDEwN10sXG4gICAgICBcInJlZHN0b25lRHVzdFwiOiBbXCJNaW5pYmxvY2tzXCIsIDEwOCwgMTEzXSxcbiAgICAgIFwibGFwaXNMYXp1bGlcIjogW1wiTWluaWJsb2Nrc1wiLCAxMTQsIDExOV0sXG4gICAgICBcImluZ290SXJvblwiOiBbXCJNaW5pYmxvY2tzXCIsIDEyMCwgMTI1XSxcbiAgICAgIFwiaW5nb3RHb2xkXCI6IFtcIk1pbmlibG9ja3NcIiwgMTI2LCAxMzFdLFxuICAgICAgXCJlbWVyYWxkXCI6IFtcIk1pbmlibG9ja3NcIiwgMTMyLCAxMzddLFxuICAgICAgXCJkaWFtb25kXCI6IFtcIk1pbmlibG9ja3NcIiwgMTM4LCAxNDNdLFxuICAgICAgXCJjb2FsXCI6IFtcIk1pbmlibG9ja3NcIiwgMTQ0LCAxNDldLFxuICAgICAgXCJidWNrZXRXYXRlclwiOiBbXCJNaW5pYmxvY2tzXCIsIDE1MCwgMTU1XSxcbiAgICAgIFwiYnVja2V0TGF2YVwiOiBbXCJNaW5pYmxvY2tzXCIsIDE1NiwgMTYxXSxcbiAgICAgIFwiZ3VuUG93ZGVyXCI6IFtcIk1pbmlibG9ja3NcIiwgMTYyLCAxNjddLFxuICAgICAgXCJ3aGVhdFwiOiBbXCJNaW5pYmxvY2tzXCIsIDE2OCwgMTczXSxcbiAgICAgIFwicG90YXRvXCI6IFtcIk1pbmlibG9ja3NcIiwgMTc0LCAxNzldLFxuICAgICAgXCJjYXJyb3RzXCI6IFtcIk1pbmlibG9ja3NcIiwgMTgwLCAxODVdLFxuXG4gICAgICBcInNoZWVwXCI6IFtcIk1pbmlibG9ja3NcIiwgMTAyLCAxMDddXG4gICAgfTtcblxuICAgIHRoaXMuYmxvY2tzID0ge1xuICAgICAgXCJiZWRyb2NrXCI6IFtcImJsb2Nrc1wiLCBcIkJlZHJvY2tcIiwgLTEzLCAwXSxcbiAgICAgIFwiYnJpY2tzXCI6IFtcImJsb2Nrc1wiLCBcIkJyaWNrc1wiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVDb2FsXCI6IFtcImJsb2Nrc1wiLCBcIkNvYWxfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcImRpcnRDb2Fyc2VcIjogW1wiYmxvY2tzXCIsIFwiQ29hcnNlX0RpcnRcIiwgLTEzLCAwXSxcbiAgICAgIFwiY29iYmxlc3RvbmVcIjogW1wiYmxvY2tzXCIsIFwiQ29iYmxlc3RvbmVcIiwgLTEzLCAwXSxcbiAgICAgIFwib3JlRGlhbW9uZFwiOiBbXCJibG9ja3NcIiwgXCJEaWFtb25kX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJkaXJ0XCI6IFtcImJsb2Nrc1wiLCBcIkRpcnRcIiwgLTEzLCAwXSxcbiAgICAgIFwib3JlRW1lcmFsZFwiOiBbXCJibG9ja3NcIiwgXCJFbWVyYWxkX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJmYXJtbGFuZFdldFwiOiBbXCJibG9ja3NcIiwgXCJGYXJtbGFuZF9XZXRcIiwgLTEzLCAwXSxcbiAgICAgIFwiZmxvd2VyRGFuZGVsaW9uXCI6IFtcImJsb2Nrc1wiLCBcIkZsb3dlcl9EYW5kZWxpb25cIiwgLTEzLCAwXSxcbiAgICAgIFwiZmxvd2VyT3hlZXllXCI6IFtcImJsb2Nrc1wiLCBcIkZsb3dlcl9PeGVleWVcIiwgLTEzLCAwXSxcbiAgICAgIFwiZmxvd2VyUm9zZVwiOiBbXCJibG9ja3NcIiwgXCJGbG93ZXJfUm9zZVwiLCAtMTMsIDBdLFxuICAgICAgXCJnbGFzc1wiOiBbXCJibG9ja3NcIiwgXCJHbGFzc1wiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVHb2xkXCI6IFtcImJsb2Nrc1wiLCBcIkdvbGRfT3JlXCIsIC0xMywgMF0sXG4gICAgICBcImdyYXNzXCI6IFtcImJsb2Nrc1wiLCBcIkdyYXNzXCIsIC0xMywgMF0sXG4gICAgICBcImdyYXZlbFwiOiBbXCJibG9ja3NcIiwgXCJHcmF2ZWxcIiwgLTEzLCAwXSxcbiAgICAgIFwib3JlSXJvblwiOiBbXCJibG9ja3NcIiwgXCJJcm9uX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJvcmVMYXBpc1wiOiBbXCJibG9ja3NcIiwgXCJMYXBpc19PcmVcIiwgLTEzLCAwXSxcbiAgICAgIFwibGF2YVwiOiBbXCJibG9ja3NcIiwgXCJMYXZhXzBcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nQWNhY2lhXCI6IFtcImJsb2Nrc1wiLCBcIkxvZ19BY2FjaWFcIiwgLTEzLCAwXSxcbiAgICAgIFwibG9nQmlyY2hcIjogW1wiYmxvY2tzXCIsIFwiTG9nX0JpcmNoXCIsIC0xMywgMF0sXG4gICAgICBcImxvZ0p1bmdsZVwiOiBbXCJibG9ja3NcIiwgXCJMb2dfSnVuZ2xlXCIsIC0xMywgMF0sXG4gICAgICBcImxvZ09ha1wiOiBbXCJibG9ja3NcIiwgXCJMb2dfT2FrXCIsIC0xMywgMF0sXG4gICAgICBcImxvZ1NwcnVjZVwiOiBbXCJibG9ja3NcIiwgXCJMb2dfU3BydWNlXCIsIC0xMywgMF0sXG4gICAgICAvL1wib2JzaWRpYW5cIjogW1wiYmxvY2tzXCIsIFwiT2JzaWRpYW5cIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzQWNhY2lhXCI6IFtcImJsb2Nrc1wiLCBcIlBsYW5rc19BY2FjaWFcIiwgLTEzLCAwXSxcbiAgICAgIFwicGxhbmtzQmlyY2hcIjogW1wiYmxvY2tzXCIsIFwiUGxhbmtzX0JpcmNoXCIsIC0xMywgMF0sXG4gICAgICBcInBsYW5rc0p1bmdsZVwiOiBbXCJibG9ja3NcIiwgXCJQbGFua3NfSnVuZ2xlXCIsIC0xMywgMF0sXG4gICAgICBcInBsYW5rc09ha1wiOiBbXCJibG9ja3NcIiwgXCJQbGFua3NfT2FrXCIsIC0xMywgMF0sXG4gICAgICBcInBsYW5rc1NwcnVjZVwiOiBbXCJibG9ja3NcIiwgXCJQbGFua3NfU3BydWNlXCIsIC0xMywgMF0sXG4gICAgICBcIm9yZVJlZHN0b25lXCI6IFtcImJsb2Nrc1wiLCBcIlJlZHN0b25lX09yZVwiLCAtMTMsIDBdLFxuICAgICAgXCJzYW5kXCI6IFtcImJsb2Nrc1wiLCBcIlNhbmRcIiwgLTEzLCAwXSxcbiAgICAgIFwic2FuZHN0b25lXCI6IFtcImJsb2Nrc1wiLCBcIlNhbmRzdG9uZVwiLCAtMTMsIDBdLFxuICAgICAgXCJzdG9uZVwiOiBbXCJibG9ja3NcIiwgXCJTdG9uZVwiLCAtMTMsIDBdLFxuICAgICAgXCJ0bnRcIjogW1widG50XCIsIFwiVE5UZXhwbG9zaW9uMFwiLCAtODAsIC01OF0sXG4gICAgICBcIndhdGVyXCI6IFtcImJsb2Nrc1wiLCBcIldhdGVyXzBcIiwgLTEzLCAwXSxcbiAgICAgIFwid29vbFwiOiBbXCJibG9ja3NcIiwgXCJXb29sX1doaXRlXCIsIC0xMywgMF0sXG4gICAgICBcIndvb2xfb3JhbmdlXCI6IFtcImJsb2Nrc1wiLCBcIldvb2xfT3JhbmdlXCIsIC0xMywgMF0sXG5cbiAgICAgIFwibGVhdmVzQWNhY2lhXCI6IFtcImxlYXZlc0FjYWNpYVwiLCBcIkxlYXZlczBcIiwgLTQyLCA4MF0sXG4gICAgICBcImxlYXZlc0JpcmNoXCI6IFtcImxlYXZlc0JpcmNoXCIsIFwiTGVhdmVzMFwiLCAtMTAwLCAtMTBdLFxuICAgICAgXCJsZWF2ZXNKdW5nbGVcIjogW1wibGVhdmVzSnVuZ2xlXCIsIFwiTGVhdmVzMFwiLCAtNjksIDQzXSxcbiAgICAgIFwibGVhdmVzT2FrXCI6IFtcImxlYXZlc09ha1wiLCBcIkxlYXZlczBcIiwgLTEwMCwgMF0sXG4gICAgICBcImxlYXZlc1NwcnVjZVwiOiBbXCJsZWF2ZXNTcHJ1Y2VcIiwgXCJMZWF2ZXMwXCIsIC03NiwgNjBdLFxuXG4gICAgICBcIndhdGVyaW5nXCIgOiBbXCJibG9ja3NcIiwgXCJXYXRlcl8wXCIsIC0xMywgMF0sXG4gICAgICBcImNyb3BXaGVhdFwiOiBbXCJibG9ja3NcIiwgXCJXaGVhdDBcIiwgLTEzLCAwXSxcbiAgICAgIFwidG9yY2hcIjogW1widG9yY2hcIiwgXCJUb3JjaDBcIiwgLTEzLCAwXSxcblxuICAgICAgXCJ0YWxsR3Jhc3NcIjogW1widGFsbEdyYXNzXCIsIFwiXCIsIC0xMywgMF0sXG5cbiAgICAgIFwibGF2YVBvcFwiOiBbXCJsYXZhUG9wXCIsIFwiTGF2YVBvcDAxXCIsIC0xMywgMF0sXG4gICAgICBcImZpcmVcIjogW1wiZmlyZVwiLCBcIlwiLCAtMTEsIDEzNV0sXG4gICAgICBcImJ1YmJsZXNcIjogW1wiYnViYmxlc1wiLCBcIlwiLCAtMTEsIDEzNV0sXG4gICAgICBcImV4cGxvc2lvblwiOiBbXCJleHBsb3Npb25cIiwgXCJcIiwgLTcwLCA2MF0sXG5cbiAgICAgIFwiZG9vclwiOiBbXCJkb29yXCIsIFwiXCIsIC0xMiwgLTE1XSxcblxuICAgICAgXCJyYWlsc0JvdHRvbUxlZnRcIjogICAgICAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19Cb3R0b21MZWZ0XCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzQm90dG9tUmlnaHRcIjogICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX0JvdHRvbVJpZ2h0XCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzSG9yaXpvbnRhbFwiOiAgICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX0hvcml6b250YWxcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNUb3BMZWZ0XCI6ICAgICAgICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfVG9wTGVmdFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1RvcFJpZ2h0XCI6ICAgICAgICAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19Ub3BSaWdodFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1VucG93ZXJlZEhvcml6b250YWxcIjpbXCJibG9ja3NcIiwgXCJSYWlsc19VbnBvd2VyZWRIb3Jpem9udGFsXCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzVW5wb3dlcmVkVmVydGljYWxcIjogIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1VucG93ZXJlZFZlcnRpY2FsXCIsIC0xMywgMF0sXG4gICAgICBcInJhaWxzVmVydGljYWxcIjogICAgICAgICAgIFtcImJsb2Nrc1wiLCBcIlJhaWxzX1ZlcnRpY2FsXCIsIC0xMywgLTBdLFxuICAgICAgXCJyYWlsc1Bvd2VyZWRIb3Jpem9udGFsXCI6ICBbXCJibG9ja3NcIiwgXCJSYWlsc19Qb3dlcmVkSG9yaXpvbnRhbFwiLCAtMTMsIDBdLFxuICAgICAgXCJyYWlsc1Bvd2VyZWRWZXJ0aWNhbFwiOiAgICBbXCJibG9ja3NcIiwgXCJSYWlsc19Qb3dlcmVkVmVydGljYWxcIiwgLTEzLCAwXSxcbiAgICAgIFwicmFpbHNSZWRzdG9uZVRvcmNoXCI6ICAgICAgW1wiYmxvY2tzXCIsIFwiUmFpbHNfUmVkc3RvbmVUb3JjaFwiLCAtMTIsIDldLFxuICAgIH07XG5cbiAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzID0gW107XG4gICAgdGhpcy50b0Rlc3Ryb3kgPSBbXTtcbiAgICB0aGlzLnJlc2V0dGFibGVUd2VlbnMgPSBbXTtcbiAgfVxuXG4gIHlUb0luZGV4KHkpIHtcbiAgICByZXR1cm4gdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwueVRvSW5kZXgoeSk7XG4gIH1cblxuICBjcmVhdGUobGV2ZWxNb2RlbCkge1xuICAgIHRoaXMuY3JlYXRlUGxhbmVzKCk7XG4gICAgdGhpcy5yZXNldChsZXZlbE1vZGVsKTtcbiAgfVxuXG4gIHJlc2V0KGxldmVsTW9kZWwpIHtcbiAgICBsZXQgcGxheWVyID0gbGV2ZWxNb2RlbC5wbGF5ZXI7XG5cbiAgICB0aGlzLnJlc2V0dGFibGVUd2VlbnMuZm9yRWFjaCgodHdlZW4pID0+IHtcbiAgICAgIHR3ZWVuLnN0b3AoZmFsc2UpO1xuICAgIH0pO1xuICAgIHRoaXMucmVzZXR0YWJsZVR3ZWVucy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5yZXNldFBsYW5lcyhsZXZlbE1vZGVsKTtcbiAgICB0aGlzLnByZXBhcmVQbGF5ZXJTcHJpdGUocGxheWVyLm5hbWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuc3RvcCgpO1xuICAgIHRoaXMudXBkYXRlU2hhZGluZ1BsYW5lKGxldmVsTW9kZWwuc2hhZGluZ1BsYW5lKTtcbiAgICB0aGlzLnVwZGF0ZUZvd1BsYW5lKGxldmVsTW9kZWwuZm93UGxhbmUpO1xuICAgIHRoaXMuc2V0UGxheWVyUG9zaXRpb24ocGxheWVyLnBvc2l0aW9uWzBdLCBwbGF5ZXIucG9zaXRpb25bMV0sIHBsYXllci5pc09uQmxvY2spO1xuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocGxheWVyLnBvc2l0aW9uWzBdLCBwbGF5ZXIucG9zaXRpb25bMV0pO1xuICAgIHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yLnZpc2libGUgPSB0cnVlO1xuICAgIHRoaXMucGxheUlkbGVBbmltYXRpb24ocGxheWVyLnBvc2l0aW9uLCBwbGF5ZXIuZmFjaW5nLCBwbGF5ZXIuaXNPbkJsb2NrKTtcblxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXIuZm9sbG93aW5nUGxheWVyKCkpIHtcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5zZXRCb3VuZHMoMCwgMCwgbGV2ZWxNb2RlbC5wbGFuZVdpZHRoICogNDAsIGxldmVsTW9kZWwucGxhbmVIZWlnaHQgKiA0MCk7XG4gICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllclNwcml0ZSk7XG4gICAgICB0aGlzLmdhbWUud29ybGQuc2NhbGUueCA9IDE7XG4gICAgICB0aGlzLmdhbWUud29ybGQuc2NhbGUueSA9IDE7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9EZXN0cm95Lmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLnRvRGVzdHJveVtpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG5cbiAgICBpZiAodGhpcy5wbGF5ZXJHaG9zdCkge1xuICAgICAgdGhpcy5wbGF5ZXJHaG9zdC5mcmFtZSA9IHRoaXMucGxheWVyU3ByaXRlLmZyYW1lO1xuICAgICAgdGhpcy5wbGF5ZXJHaG9zdC56ID0gMTAwMDtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5hY3Rpb25QbGFuZS5zb3J0KCdzb3J0T3JkZXInKTtcbiAgICB0aGlzLmZsdWZmUGxhbmUuc29ydCgneicpO1xuICB9XG5cbiAgZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpIHtcbiAgICB2YXIgZGlyZWN0aW9uO1xuXG4gICAgc3dpdGNoIChmYWNpbmcpIHtcbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlVwOlxuICAgICAgICBkaXJlY3Rpb24gPSBcIl91cFwiO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ6XG4gICAgICAgIGRpcmVjdGlvbiA9IFwiX3JpZ2h0XCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5Eb3duOlxuICAgICAgICBkaXJlY3Rpb24gPSBcIl9kb3duXCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5MZWZ0OlxuICAgICAgICBkaXJlY3Rpb24gPSBcIl9sZWZ0XCI7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBkaXJlY3Rpb247XG4gIH1cblxuICB1cGRhdGVQbGF5ZXJEaXJlY3Rpb24ocG9zaXRpb24sIGZhY2luZykge1xuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcblxuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIiArIGRpcmVjdGlvbik7XG4gIH1cblxuICBwbGF5UGxheWVyQW5pbWF0aW9uKGFuaW1hdGlvbk5hbWUsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaykge1xuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIDU7XG5cbiAgICBsZXQgYW5pbU5hbWUgPSBhbmltYXRpb25OYW1lICsgZGlyZWN0aW9uO1xuICAgIHJldHVybiB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltTmFtZSk7XG4gIH1cblxuICBwbGF5SWRsZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spIHtcbiAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJpZGxlXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gIH1cblxuICBzY2FsZVNob3dXaG9sZVdvcmxkKGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIFtzY2FsZVgsIHNjYWxlWV0gPSB0aGlzLmNvbnRyb2xsZXIuc2NhbGVGcm9tT3JpZ2luYWwoKTtcbiAgICB2YXIgc2NhbGVUd2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMuZ2FtZS53b3JsZC5zY2FsZSkudG8oe1xuICAgICAgeDogMSAvIHNjYWxlWCxcbiAgICAgIHk6IDEgLyBzY2FsZVlcbiAgICB9LCAxMDAwLCBQaGFzZXIuRWFzaW5nLkV4cG9uZW50aWFsLk91dCk7XG5cbiAgICB0aGlzLmdhbWUuY2FtZXJhLnVuZm9sbG93KCk7XG5cbiAgICB2YXIgcG9zaXRpb25Ud2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMuZ2FtZS5jYW1lcmEpLnRvKHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfSwgMTAwMCwgUGhhc2VyLkVhc2luZy5FeHBvbmVudGlhbC5PdXQpO1xuXG4gICAgc2NhbGVUd2Vlbi5vbkNvbXBsZXRlLmFkZE9uY2UoKCkgPT4ge1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcblxuICAgIHBvc2l0aW9uVHdlZW4uc3RhcnQoKTtcbiAgICBzY2FsZVR3ZWVuLnN0YXJ0KCk7XG4gIH1cblxuICBwbGF5U3VjY2Vzc0FuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoMjUwLCAoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdWNjZXNzXCIpO1xuICAgICAgdGhpcy5vbkFuaW1hdGlvbkVuZCh0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJjZWxlYnJhdGVcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKSwgKCkgPT4ge1xuICAgICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5RmFpbHVyZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoNTAwLCAoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJmYWlsdXJlXCIpO1xuICAgICAgdGhpcy5vbkFuaW1hdGlvbkVuZCh0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJmYWlsXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayksICgpID0+IHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoMTQwMCwgY29tcGxldGlvbkhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5QnVtcEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spIHtcbiAgICB2YXIgYW5pbWF0aW9uID0gdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwiYnVtcFwiLCBwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spO1xuICAgIGFuaW1hdGlvbi5vbkNvbXBsZXRlLmFkZCgoKT0+e1xuICAgICAgdGhpcy5wbGF5SWRsZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spO1xuICAgIH0pO1xuICAgIHJldHVybiBhbmltYXRpb247XG4gIH1cblxuICBwbGF5RHJvd25GYWlsdXJlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICAgIHZhciBzcHJpdGUsXG4gICAgICAgICAgdHdlZW47XG5cbiAgICAgIHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImZhaWxcIiwgcG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrKTtcbiAgICAgIHRoaXMuY3JlYXRlQmxvY2sodGhpcy5mbHVmZlBsYW5lLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIFwiYnViYmxlc1wiKTtcblxuICAgICAgc3ByaXRlID0gdGhpcy5mbHVmZlBsYW5lLmNyZWF0ZSgwLCAwLCBcImZpbmlzaE92ZXJsYXlcIik7XG4gICAgICB2YXIgW3NjYWxlWCwgc2NhbGVZXSA9IHRoaXMuY29udHJvbGxlci5zY2FsZUZyb21PcmlnaW5hbCgpO1xuICAgICAgc3ByaXRlLnNjYWxlLnggPSBzY2FsZVg7XG4gICAgICBzcHJpdGUuc2NhbGUueSA9IHNjYWxlWTtcbiAgICAgIHNwcml0ZS5hbHBoYSA9IDA7XG4gICAgICBpZiAodGhpcy5jb250cm9sbGVyLmNhblVzZVRpbnRzKCkpIHtcbiAgICAgICAgc3ByaXRlLnRpbnQgPSAweDMyNGJmZjtcbiAgICAgIH1cblxuICAgICAgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2VlbihzcHJpdGUpLnRvKHtcbiAgICAgICAgICBhbHBoYTogMC41LFxuICAgICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcblxuICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgICB9KTtcblxuICAgICAgdHdlZW4uc3RhcnQoKTtcbiAgfVxuXG4gIHBsYXlCdXJuSW5MYXZhQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgc3ByaXRlLFxuICAgICAgICB0d2VlbjtcblxuICAgIHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcImp1bXBVcFwiLCBwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2spO1xuICAgIHRoaXMuY3JlYXRlQmxvY2sodGhpcy5mbHVmZlBsYW5lLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIFwiZmlyZVwiKTtcblxuICAgIHNwcml0ZSA9IHRoaXMuZmx1ZmZQbGFuZS5jcmVhdGUoMCwgMCwgXCJmaW5pc2hPdmVybGF5XCIpO1xuICAgIHZhciBbc2NhbGVYLCBzY2FsZVldID0gdGhpcy5jb250cm9sbGVyLnNjYWxlRnJvbU9yaWdpbmFsKCk7XG4gICAgc3ByaXRlLnNjYWxlLnggPSBzY2FsZVg7XG4gICAgc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVk7XG4gICAgc3ByaXRlLmFscGhhID0gMDtcbiAgICBpZiAodGhpcy5jb250cm9sbGVyLmNhblVzZVRpbnRzKCkpIHtcbiAgICAgIHNwcml0ZS50aW50ID0gMHhkMTU4MGQ7XG4gICAgfVxuXG4gICAgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2VlbihzcHJpdGUpLnRvKHtcbiAgICAgIGFscGhhOiAwLjUsXG4gICAgfSwgMjAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcblxuICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG5cbiAgICB0d2Vlbi5zdGFydCgpO1xuICB9XG5cbiAgcGxheURlc3Ryb3lUbnRBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCB0bnRBcnJheSAsIG5ld1NoYWRpbmdQbGFuZURhdGEsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIGJsb2NrLFxuICAgICAgICBsYXN0QW5pbWF0aW9uO1xuICAgIGlmICh0bnRBcnJheS5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZnVzZVwiKTtcbiAgICBmb3IodmFyIHRudCBpbiB0bnRBcnJheSkge1xuICAgICAgICBibG9jayA9IHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgodG50QXJyYXlbdG50XSldO1xuICAgICAgICBsYXN0QW5pbWF0aW9uID0gdGhpcy5wbGF5U2NhbGVkU3BlZWQoYmxvY2suYW5pbWF0aW9ucywgXCJleHBsb2RlXCIpO1xuICAgIH1cblxuICAgIHRoaXMub25BbmltYXRpb25FbmQobGFzdEFuaW1hdGlvbiwgKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZXhwbG9kZVwiKTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIHBsYXlDcmVlcGVyRXhwbG9kZUFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSgxODAsICgpID0+IHtcbiAgICAgIC8vdGhpcy5vbkFuaW1hdGlvbkxvb3BPbmNlKFxuICAgICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwiYnVtcFwiLCBwb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAvL2FkZCBjcmVlcGVyIHdpbmR1cCBzb3VuZFxuICAgICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJmdXNlXCIpO1xuICAgICAgICB0aGlzLnBsYXlFeHBsb2RpbmdDcmVlcGVyQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5jb250cm9sbGVyLmRlbGF5QnkoMjAwLCAoKT0+e1xuICAgICAgICAgIHRoaXMub25BbmltYXRpb25Mb29wT25jZSh0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJqdW1wVXBcIiwgcG9zaXRpb24sIGZhY2luZywgZmFsc2UpLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlJZGxlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jayk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5RXhwbG9kaW5nQ3JlZXBlckFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG5cbiAgICBsZXQgYmxvY2tJbmRleCA9ICh0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkpICsgZGVzdHJveVBvc2l0aW9uWzBdO1xuICAgIGxldCBibG9ja1RvRXhwbG9kZSA9IHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF07XG5cbiAgICB2YXIgY3JlZXBlckV4cGxvZGVBbmltYXRpb24gPSBibG9ja1RvRXhwbG9kZS5hbmltYXRpb25zLmdldEFuaW1hdGlvbihcImV4cGxvZGVcIik7XG4gICAgY3JlZXBlckV4cGxvZGVBbmltYXRpb24ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdmFyIGJvcmRlcmluZ1Bvc2l0aW9ucztcbiAgICAgIGJsb2NrVG9FeHBsb2RlLmtpbGwoKTtcbiAgICAgIHRoaXMucGxheUV4cGxvc2lvbkFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGlzT25CbG9jaywgKCkgPT4ge1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuZGVsYXlCeSgxMDAsICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlGYWlsdXJlQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgfSwgZmFsc2UpO1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiZXhwbG9kZVwiKTtcbiAgICAgIHRoaXMucGxheUV4cGxvc2lvbkNsb3VkQW5pbWF0aW9uKGRlc3Ryb3lQb3NpdGlvbik7XG4gICAgfSk7XG5cbiAgICBjcmVlcGVyRXhwbG9kZUFuaW1hdGlvbi5wbGF5KCk7XG4gIH1cblxuICBwbGF5RXhwbG9zaW9uQ2xvdWRBbmltYXRpb24ocG9zaXRpb24pe1xuICAgIHRoaXMuY3JlYXRlQmxvY2sodGhpcy5mbHVmZlBsYW5lLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIFwiZXhwbG9zaW9uXCIpO1xuICB9XG5cblxuICBjb29yZGluYXRlc1RvSW5kZXgoY29vcmRpbmF0ZXMpIHtcbiAgICByZXR1cm4gKHRoaXMueVRvSW5kZXgoY29vcmRpbmF0ZXNbMV0pKSArIGNvb3JkaW5hdGVzWzBdO1xuICB9XG5cbiAgcGxheU1pbmVjYXJ0VHVybkFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCB0dXJuRGlyZWN0aW9uKSB7XG4gICAgdmFyIGFuaW1hdGlvbiA9IHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcIm1pbmVDYXJ0X3R1cm5cIiArIHR1cm5EaXJlY3Rpb24sIHBvc2l0aW9uLCBGYWNpbmdEaXJlY3Rpb24uRG93biwgZmFsc2UpO1xuICAgIHJldHVybiBhbmltYXRpb247XG4gIH1cblxuICBwbGF5TWluZWNhcnRNb3ZlRm9yd2FyZEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBuZXh0UG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGFuaW1hdGlvbixcbiAgICAgICAgdHdlZW47XG5cbiAgICAvL2lmIHdlIGxvb3AgdGhlIHNmeCB0aGF0IG1pZ2h0IGJlIGJldHRlcj9cbiAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJtaW5lY2FydFwiKTtcbiAgICB0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJtaW5lQ2FydFwiLHBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKTtcbiAgICB0d2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMucGxheWVyU3ByaXRlKS50byh7XG4gICAgICB4OiAoLTE4ICsgNDAgKiBuZXh0UG9zaXRpb25bMF0pLFxuICAgICAgeTogKC0zMiArIDQwICogbmV4dFBvc2l0aW9uWzFdKSxcbiAgICB9LCBzcGVlZCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG4gICAgdHdlZW4uc3RhcnQoKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KG5leHRQb3NpdGlvblsxXSkgKyA1O1xuXG4gICAgcmV0dXJuIHR3ZWVuO1xuICB9XG5cblxuICBhY3RpdmF0ZVVucG93ZXJlZFJhaWxzKHVucG93ZXJlZFJhaWxzKSB7XG4gICAgZm9yKHZhciByYWlsSW5kZXggPSAwOyByYWlsSW5kZXggPCB1bnBvd2VyZWRSYWlscy5sZW5ndGg7IHJhaWxJbmRleCArPSAyKSB7XG4gICAgICB2YXIgcmFpbCA9IHVucG93ZXJlZFJhaWxzW3JhaWxJbmRleCArIDFdO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdW5wb3dlcmVkUmFpbHNbcmFpbEluZGV4XTtcbiAgICAgIHRoaXMuY3JlYXRlQWN0aW9uUGxhbmVCbG9jayhwb3NpdGlvbiwgcmFpbCk7XG4gICAgfVxuICB9XG5cblxuXG4gIHBsYXlNaW5lY2FydEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBtaW5lY2FydFRyYWNrLCB1bnBvd2VyZWRSYWlscylcbiAge1xuICAgIHZhciBhbmltYXRpb247XG4gICAgdGhpcy50cmFjayA9IG1pbmVjYXJ0VHJhY2s7XG4gICAgdGhpcy5pID0gMDtcblxuICAgIC8vc3RhcnQgYXQgMywyXG4gICAgdGhpcy5zZXRQbGF5ZXJQb3NpdGlvbigzLDIsIGlzT25CbG9jayk7XG4gICAgcG9zaXRpb24gPSBbMywyXTtcblxuICAgIGFuaW1hdGlvbiA9IHRoaXMucGxheUxldmVsRW5kQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIGZhbHNlKTtcblxuICAgIGFuaW1hdGlvbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmFjdGl2YXRlVW5wb3dlcmVkUmFpbHModW5wb3dlcmVkUmFpbHMpO1xuICAgICAgdGhpcy5wbGF5VHJhY2socG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbWluZWNhcnRUcmFjayk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5VHJhY2socG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgbWluZWNhcnRUcmFjaylcbiAge1xuICAgIGlmKHRoaXMuaSA8IHRoaXMudHJhY2subGVuZ3RoKSB7XG4gICAgICB2YXIgZGlyZWN0aW9uLFxuICAgICAgICAgIGFycmF5ZGlyZWN0aW9uID0gdGhpcy50cmFja1t0aGlzLmldWzBdLFxuICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMudHJhY2tbdGhpcy5pXVsxXSxcbiAgICAgICAgICBzcGVlZCA9IHRoaXMudHJhY2tbdGhpcy5pXVszXTtcbiAgICAgIGZhY2luZyA9IHRoaXMudHJhY2tbdGhpcy5pXVsyXTtcblxuICAgICAgLy90dXJuXG4gICAgICBpZihhcnJheWRpcmVjdGlvbi5zdWJzdHJpbmcoMCw0KSA9PT0gXCJ0dXJuXCIpIHtcbiAgICAgICAgZGlyZWN0aW9uID0gYXJyYXlkaXJlY3Rpb24uc3Vic3RyaW5nKDUpO1xuICAgICAgICB0aGlzLnBsYXlNaW5lY2FydFR1cm5BbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBjb21wbGV0aW9uSGFuZGxlciwgZGlyZWN0aW9uKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbGF5TWluZWNhcnRNb3ZlRm9yd2FyZEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBuZXh0UG9zaXRpb24sIHNwZWVkKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICAgICAgICAgIHRoaXMucGxheVRyYWNrKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG1pbmVjYXJ0VHJhY2spO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnBsYXlNaW5lY2FydE1vdmVGb3J3YXJkQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY29tcGxldGlvbkhhbmRsZXIsIG5leHRQb3NpdGlvbiwgc3BlZWQpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlUcmFjayhwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBtaW5lY2FydFRyYWNrKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLmkrKztcbiAgICB9XG4gICAgZWxzZVxuICAgIHtcbiAgICAgIHRoaXMucGxheVN1Y2Nlc3NBbmltYXRpb24ocG9zaXRpb24sIGZhY2luZywgaXNPbkJsb2NrLCBmdW5jdGlvbigpe30pO1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9XG4gIH1cblxuICBhZGRIb3VzZUJlZChib3R0b21Db29yZGluYXRlcykge1xuICAgIC8vVGVtcG9yYXJ5LCB3aWxsIGJlIHJlcGxhY2VkIGJ5IGJlZCBibG9ja3NcbiAgICB2YXIgYmVkVG9wQ29vcmRpbmF0ZSA9IChib3R0b21Db29yZGluYXRlc1sxXSAtIDEpO1xuICAgIHZhciBzcHJpdGUgPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZSgzOCAqIGJvdHRvbUNvb3JkaW5hdGVzWzBdLCAzNSAqIGJlZFRvcENvb3JkaW5hdGUsIFwiYmVkXCIpO1xuICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGJvdHRvbUNvb3JkaW5hdGVzWzFdKTtcbiAgfVxuXG4gIGFkZERvb3IoY29vcmRpbmF0ZXMpIHtcbiAgICB2YXIgc3ByaXRlO1xuICAgIGxldCB0b0Rlc3Ryb3kgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW3RoaXMuY29vcmRpbmF0ZXNUb0luZGV4KGNvb3JkaW5hdGVzKV07XG4gICAgdGhpcy5jcmVhdGVBY3Rpb25QbGFuZUJsb2NrKGNvb3JkaW5hdGVzLCBcImRvb3JcIik7XG4gICAgLy9OZWVkIHRvIGdyYWIgdGhlIGNvcnJlY3QgYmxvY2t0eXBlIGZyb20gdGhlIGFjdGlvbiBsYXllclxuICAgIC8vQW5kIHVzZSB0aGF0IHR5cGUgYmxvY2sgdG8gY3JlYXRlIHRoZSBncm91bmQgYmxvY2sgdW5kZXIgdGhlIGRvb3JcbiAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZ3JvdW5kUGxhbmUsIGNvb3JkaW5hdGVzWzBdLCBjb29yZGluYXRlc1sxXSwgXCJ3b29sX29yYW5nZVwiKTtcbiAgICB0b0Rlc3Ryb3kua2lsbCgpO1xuICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KDYpO1xuICB9XG5cbiAgcGxheVN1Y2Nlc3NIb3VzZUJ1aWx0QW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGlzT25CbG9jaywgY3JlYXRlRmxvb3IsIGhvdXNlT2JqZWN0UG9zaXRpb25zLCBjb21wbGV0aW9uSGFuZGxlciwgdXBkYXRlU2NyZWVuKSB7XG4gICAgLy9mYWRlIHNjcmVlbiB0byB3aGl0ZVxuICAgIC8vQWRkIGhvdXNlIGJsb2Nrc1xuICAgIC8vZmFkZSBvdXQgb2Ygd2hpdGVcbiAgICAvL1BsYXkgc3VjY2VzcyBhbmltYXRpb24gb24gcGxheWVyLlxuICAgIHZhciB0d2VlblRvVyxcbiAgICAgICAgdHdlZW5XVG9DO1xuXG4gICAgdHdlZW5Ub1cgPSB0aGlzLnBsYXlMZXZlbEVuZEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssICgpID0+IHtcbiAgICAgIHRoaXMuY29udHJvbGxlci5kZWxheUJ5KDQwMDAsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9LCB0cnVlKTtcbiAgICB0d2VlblRvVy5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJob3VzZVN1Y2Nlc3NcIik7XG4gICAgICAvL0NoYW5nZSBob3VzZSBncm91bmQgdG8gZmxvb3JcbiAgICAgIHZhciB4Q29vcmQ7XG4gICAgICB2YXIgeUNvb3JkO1xuICAgICAgdmFyIHNwcml0ZTtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNyZWF0ZUZsb29yLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHhDb29yZCA9IGNyZWF0ZUZsb29yW2ldWzFdO1xuICAgICAgICB5Q29vcmQgPSBjcmVhdGVGbG9vcltpXVsyXTtcbiAgICAgICAgLyp0aGlzLmdyb3VuZFBsYW5lW3RoaXMuY29vcmRpbmF0ZXNUb0luZGV4KFt4Q29vcmQseUNvb3JkXSldLmtpbGwoKTsqL1xuICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZ3JvdW5kUGxhbmUsIHhDb29yZCwgeUNvb3JkLCBcIndvb2xfb3JhbmdlXCIpO1xuICAgICAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleCh5Q29vcmQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFkZEhvdXNlQmVkKGhvdXNlT2JqZWN0UG9zaXRpb25zWzBdKTtcbiAgICAgIHRoaXMuYWRkRG9vcihob3VzZU9iamVjdFBvc2l0aW9uc1sxXSk7XG4gICAgICB0aGlzLmdyb3VuZFBsYW5lLnNvcnQoJ3NvcnRPcmRlcicpO1xuICAgICAgdXBkYXRlU2NyZWVuKCk7XG4gICAgfSk7XG4gIH1cblxuICAvL1R3ZWVucyBpbiBhbmQgdGhlbiBvdXQgb2Ygd2hpdGUuIHJldHVybnMgdGhlIHR3ZWVuIHRvIHdoaXRlIGZvciBhZGRpbmcgY2FsbGJhY2tzXG4gIHBsYXlMZXZlbEVuZEFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyLCBwbGF5U3VjY2Vzc0FuaW1hdGlvbikge1xuICAgIHZhciBzcHJpdGUsXG4gICAgICAgIHR3ZWVuVG9XLFxuICAgICAgICB0d2VlbldUb0M7XG5cbiAgICBzcHJpdGUgPSB0aGlzLmZsdWZmUGxhbmUuY3JlYXRlKDAsIDAsIFwiZmluaXNoT3ZlcmxheVwiKTtcbiAgICB2YXIgW3NjYWxlWCwgc2NhbGVZXSA9IHRoaXMuY29udHJvbGxlci5zY2FsZUZyb21PcmlnaW5hbCgpO1xuICAgIHNwcml0ZS5zY2FsZS54ID0gc2NhbGVYO1xuICAgIHNwcml0ZS5zY2FsZS55ID0gc2NhbGVZO1xuICAgIHNwcml0ZS5hbHBoYSA9IDA7XG5cbiAgICB0d2VlblRvVyA9IHRoaXMudHdlZW5Ub1doaXRlKHNwcml0ZSk7XG4gICAgdHdlZW5XVG9DID0gdGhpcy50d2VlbkZyb21XaGl0ZVRvQ2xlYXIoc3ByaXRlKTtcblxuICAgIHR3ZWVuVG9XLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0UGxheWVyUG9zaXRpb24ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBpc09uQmxvY2spO1xuICAgICAgdHdlZW5XVG9DLnN0YXJ0KCk7XG4gICAgfSk7XG4gICAgaWYocGxheVN1Y2Nlc3NBbmltYXRpb24pXG4gICAge1xuICAgICAgdHdlZW5XVG9DLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgdGhpcy5wbGF5U3VjY2Vzc0FuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBpc09uQmxvY2ssIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0d2VlblRvVy5zdGFydCgpO1xuXG4gICAgcmV0dXJuIHR3ZWVuVG9XO1xuICB9XG4gIHR3ZWVuRnJvbVdoaXRlVG9DbGVhcihzcHJpdGUpIHtcbiAgICB2YXIgdHdlZW5XaGl0ZVRvQ2xlYXI7XG5cbiAgICB0d2VlbldoaXRlVG9DbGVhciA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHNwcml0ZSkudG8oe1xuICAgICAgYWxwaGE6IDAuMCxcbiAgICB9LCA3MDAsIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUpO1xuICAgIHJldHVybiB0d2VlbldoaXRlVG9DbGVhcjtcbiAgfVxuXG4gIHR3ZWVuVG9XaGl0ZShzcHJpdGUpe1xuICAgIHZhciB0d2VlblRvV2hpdGU7XG5cbiAgICB0d2VlblRvV2hpdGUgPSB0aGlzLmFkZFJlc2V0dGFibGVUd2VlbihzcHJpdGUpLnRvKHtcbiAgICAgIGFscGhhOiAxLjAsXG4gICAgfSwgMzAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKTtcbiAgICByZXR1cm4gdHdlZW5Ub1doaXRlO1xuICB9XG5cbiAgcGxheUJsb2NrU291bmQoZ3JvdW5kVHlwZSkge1xuICAgIHZhciBvcmVTdHJpbmcgPSBncm91bmRUeXBlLnN1YnN0cmluZygwLCAzKTtcbiAgICBpZihncm91bmRUeXBlID09PSBcInN0b25lXCIgfHwgZ3JvdW5kVHlwZSA9PT0gXCJjb2JibGVzdG9uZVwiIHx8IGdyb3VuZFR5cGUgPT09IFwiYmVkcm9ja1wiIHx8XG4gICAgICAgIG9yZVN0cmluZyA9PT0gXCJvcmVcIiB8fCBncm91bmRUeXBlID09PSBcImJyaWNrc1wiKSB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdGVwU3RvbmVcIik7XG4gICAgfVxuICAgIGVsc2UgaWYoZ3JvdW5kVHlwZSA9PT0gXCJncmFzc1wiIHx8IGdyb3VuZFR5cGUgPT09IFwiZGlydFwiIHx8IGdyb3VuZFR5cGUgPT09IFwiZGlydENvYXJzZVwiIHx8XG4gICAgICAgIGdyb3VuZFR5cGUgPT0gXCJ3b29sX29yYW5nZVwiIHx8IGdyb3VuZFR5cGUgPT0gXCJ3b29sXCIpIHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInN0ZXBHcmFzc1wiKTtcbiAgICB9XG4gICAgZWxzZSBpZihncm91bmRUeXBlID09PSBcImdyYXZlbFwiKSB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJzdGVwR3JhdmVsXCIpO1xuICAgIH1cbiAgICBlbHNlIGlmKGdyb3VuZFR5cGUgPT09IFwiZmFybWxhbmRXZXRcIikge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwic3RlcEZhcm1sYW5kXCIpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwic3RlcFdvb2RcIik7XG4gICAgfVxuICB9XG5cbiAgcGxheU1vdmVGb3J3YXJkQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIHNob3VsZEp1bXBEb3duLCBpc09uQmxvY2ssIGdyb3VuZFR5cGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHR3ZWVuLFxuICAgICAgICBvbGRQb3NpdGlvbixcbiAgICAgICAgbmV3UG9zVmVjLFxuICAgICAgICBhbmltTmFtZSxcbiAgICAgICAgeU9mZnNldCA9IC0zMjtcblxuICAgIC8vc3RlcHBpbmcgb24gc3RvbmUgc2Z4XG4gICAgdGhpcy5wbGF5QmxvY2tTb3VuZChncm91bmRUeXBlKTtcblxuICAgIGxldCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbk5hbWUoZmFjaW5nKTtcblxuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICAvL21ha2Ugc3VyZSB0byByZW5kZXIgaGlnaCBmb3Igd2hlbiBtb3ZpbmcgdXAgYWZ0ZXIgcGxhY2luZyBhIGJsb2NrXG4gICAgdmFyIHpPcmRlcllJbmRleCA9IHBvc2l0aW9uWzFdICsgKGZhY2luZyA9PT0gRmFjaW5nRGlyZWN0aW9uLlVwID8gMSA6IDApO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoek9yZGVyWUluZGV4KSArIDU7XG4gICAgb2xkUG9zaXRpb24gPSBbTWF0aC50cnVuYygodGhpcy5wbGF5ZXJTcHJpdGUucG9zaXRpb24ueCArIDE4KS8gNDApLCBNYXRoLmNlaWwoKHRoaXMucGxheWVyU3ByaXRlLnBvc2l0aW9uLnkrIDMyKSAvIDQwKV07XG4gICAgbmV3UG9zVmVjID0gW3Bvc2l0aW9uWzBdIC0gb2xkUG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdIC0gb2xkUG9zaXRpb25bMV1dO1xuXG4gICAgLy9jaGFuZ2Ugb2Zmc2V0IGZvciBtb3Zpbmcgb24gdG9wIG9mIGJsb2Nrc1xuICAgIGlmKGlzT25CbG9jaykge1xuICAgICAgeU9mZnNldCAtPSAyMjtcbiAgICB9XG5cbiAgICBpZiAoIXNob3VsZEp1bXBEb3duKSB7XG4gICAgICBhbmltTmFtZSA9IFwid2Fsa1wiICsgZGlyZWN0aW9uO1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgYW5pbU5hbWUpO1xuICAgICAgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2Vlbih0aGlzLnBsYXllclNwcml0ZSkudG8oe1xuICAgICAgICB4OiAoLTE4ICsgNDAgKiBwb3NpdGlvblswXSksXG4gICAgICAgIHk6ICh5T2Zmc2V0ICsgNDAgKiBwb3NpdGlvblsxXSlcbiAgICAgIH0sIDIwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFuaW1OYW1lID0gXCJqdW1wRG93blwiICsgZGlyZWN0aW9uO1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgYW5pbU5hbWUpO1xuICAgICAgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2Vlbih0aGlzLnBsYXllclNwcml0ZSkudG8oe1xuICAgICAgICB4OiBbLTE4ICsgNDAgKiBvbGRQb3NpdGlvblswXSwgLTE4ICsgNDAgKiAob2xkUG9zaXRpb25bMF0gKyBuZXdQb3NWZWNbMF0pLCAtMTggKyA0MCAqIHBvc2l0aW9uWzBdXSxcbiAgICAgICAgeTogWy0zMiArIDQwICogb2xkUG9zaXRpb25bMV0sIC0zMiArIDQwICogKG9sZFBvc2l0aW9uWzFdICsgbmV3UG9zVmVjWzFdKSAtIDUwLCAtMzIgKyA0MCAqIHBvc2l0aW9uWzFdXVxuICAgICAgfSwgMzAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKS5pbnRlcnBvbGF0aW9uKCh2LGspID0+IHtcbiAgICAgICAgcmV0dXJuIFBoYXNlci5NYXRoLmJlemllckludGVycG9sYXRpb24odixrKTtcbiAgICAgIH0pO1xuXG4gICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImZhbGxcIik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuXG4gICAgdHdlZW4uc3RhcnQoKTtcblxuICAgIHJldHVybiB0d2VlbjtcbiAgfVxuXG4gIHBsYXlQbGF5ZXJKdW1wRG93blZlcnRpY2FsQW5pbWF0aW9uKHBvc2l0aW9uLCBkaXJlY3Rpb24pIHtcbiAgICB2YXIgYW5pbU5hbWUgPSBcImp1bXBEb3duXCIgKyB0aGlzLmdldERpcmVjdGlvbk5hbWUoZGlyZWN0aW9uKTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltTmFtZSk7XG4gICAgdmFyIHR3ZWVuID0gdGhpcy5hZGRSZXNldHRhYmxlVHdlZW4odGhpcy5wbGF5ZXJTcHJpdGUpLnRvKHtcbiAgICAgIHg6IFstMTggKyA0MCAqIHBvc2l0aW9uWzBdLCAtMTggKyA0MCAqIHBvc2l0aW9uWzBdLCAtMTggKyA0MCAqIHBvc2l0aW9uWzBdXSxcbiAgICAgIHk6IFstMzIgKyA0MCAqIHBvc2l0aW9uWzFdLCAtMzIgKyA0MCAqIHBvc2l0aW9uWzFdIC0gNTAsIC0zMiArIDQwICogcG9zaXRpb25bMV1dXG4gICAgfSwgMzAwLCBQaGFzZXIuRWFzaW5nLkxpbmVhci5Ob25lKS5pbnRlcnBvbGF0aW9uKCh2LGspID0+IHtcbiAgICAgIHJldHVybiBQaGFzZXIuTWF0aC5iZXppZXJJbnRlcnBvbGF0aW9uKHYsayk7XG4gICAgfSk7XG4gICAgdHdlZW4ub25Db21wbGV0ZS5hZGRPbmNlKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcImZhbGxcIik7XG4gICAgfSk7XG4gICAgdHdlZW4uc3RhcnQoKTtcbiAgfVxuXG4gIHBsYXlQbGFjZUJsb2NrQW5pbWF0aW9uKHBvc2l0aW9uLCBmYWNpbmcsIGJsb2NrVHlwZSwgYmxvY2tUeXBlQXRQb3NpdGlvbiwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIganVtcEFuaW1OYW1lO1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChwb3NpdGlvblsxXSkgKyBwb3NpdGlvblswXTtcblxuICAgIGlmIChibG9ja1R5cGUgPT09IFwiY3JvcFdoZWF0XCIgfHwgYmxvY2tUeXBlID09PSBcInRvcmNoXCIgfHwgYmxvY2tUeXBlLnN1YnN0cmluZygwLCA1KSA9PT0gXCJyYWlsc1wiKSB7XG4gICAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG5cbiAgICAgIHZhciBzaWduYWxEZXRhY2hlciA9IHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcInB1bmNoXCIsIHBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgIHZhciBzcHJpdGU7XG4gICAgICAgIHNpZ25hbERldGFjaGVyLmRldGFjaCgpO1xuICAgICAgICBsZXQgYmxvY2tJbmRleCA9ICh0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSkgKyBwb3NpdGlvblswXTtcbiAgICAgICAgc3ByaXRlID0gdGhpcy5jcmVhdGVCbG9jayh0aGlzLmFjdGlvblBsYW5lLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIGJsb2NrVHlwZSk7XG5cbiAgICAgICAgaWYgKHNwcml0ZSkge1xuICAgICAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF0gPSBzcHJpdGU7XG4gICAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwicGxhY2VCbG9ja1wiKTtcblxuICAgICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuICAgICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuXG4gICAgICBqdW1wQW5pbU5hbWUgPSBcImp1bXBVcFwiICsgZGlyZWN0aW9uO1xuXG4gICAgICBpZihibG9ja1R5cGVBdFBvc2l0aW9uICE9PSBcIlwiKSB7XG4gICAgICAgIHRoaXMucGxheUV4cGxvc2lvbkFuaW1hdGlvbihwb3NpdGlvbiwgZmFjaW5nLCBwb3NpdGlvbiwgYmxvY2tUeXBlQXRQb3NpdGlvbiwgKCgpPT57fSksIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywganVtcEFuaW1OYW1lKTtcbiAgICAgIHZhciBwbGFjZW1lbnRUd2VlbiA9IHRoaXMuYWRkUmVzZXR0YWJsZVR3ZWVuKHRoaXMucGxheWVyU3ByaXRlKS50byh7XG4gICAgICAgIHk6ICgtNTUgKyA0MCAqIHBvc2l0aW9uWzFdKVxuICAgICAgfSwgMTI1LCBQaGFzZXIuRWFzaW5nLkN1YmljLkVhc2VPdXQpO1xuXG4gICAgICBwbGFjZW1lbnRUd2Vlbi5vbkNvbXBsZXRlLmFkZE9uY2UoKCkgPT4ge1xuICAgICAgICBwbGFjZW1lbnRUd2VlbiA9IG51bGw7XG5cbiAgICAgICAgaWYgKGJsb2NrVHlwZUF0UG9zaXRpb24gIT09IFwiXCIpIHtcbiAgICAgICAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdLmtpbGwoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3ByaXRlID0gdGhpcy5jcmVhdGVCbG9jayh0aGlzLmFjdGlvblBsYW5lLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIGJsb2NrVHlwZSk7XG5cbiAgICAgICAgaWYgKHNwcml0ZSkge1xuICAgICAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3NbYmxvY2tJbmRleF0gPSBzcHJpdGU7XG4gICAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICAgIHBsYWNlbWVudFR3ZWVuLnN0YXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgcGxheVBsYWNlQmxvY2tJbkZyb250QW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGJsb2NrUG9zaXRpb24sIHBsYW5lLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihibG9ja1Bvc2l0aW9uWzBdLCBibG9ja1Bvc2l0aW9uWzFdKTtcblxuICAgIHRoaXMucGxheVBsYXllckFuaW1hdGlvbihcInB1bmNoXCIsIHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICBpZiAocGxhbmUgPT09IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLmFjdGlvblBsYW5lKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQWN0aW9uUGxhbmVCbG9jayhibG9ja1Bvc2l0aW9uLCBibG9ja1R5cGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmUtbGF5IGdyb3VuZCB0aWxlcyBiYXNlZCBvbiBtb2RlbFxuICAgICAgICB0aGlzLnJlZnJlc2hHcm91bmRQbGFuZSgpO1xuICAgICAgfVxuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNyZWF0ZUFjdGlvblBsYW5lQmxvY2socG9zaXRpb24sIGJsb2NrVHlwZSkge1xuICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgocG9zaXRpb25bMV0pKSArIHBvc2l0aW9uWzBdO1xuICAgIHZhciBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgYmxvY2tUeXBlKTtcblxuICAgIGlmIChzcHJpdGUpIHtcbiAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKTtcbiAgICB9XG5cbiAgICB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdID0gc3ByaXRlO1xuICB9XG5cbiAgcGxheVNoZWFyQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgZGVzdHJveVBvc2l0aW9uWzBdO1xuICAgIGxldCBibG9ja1RvU2hlYXIgPSB0aGlzLmFjdGlvblBsYW5lQmxvY2tzW2Jsb2NrSW5kZXhdO1xuXG4gICAgYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMuc3RvcChudWxsLCB0cnVlKTtcbiAgICB0aGlzLm9uQW5pbWF0aW9uTG9vcE9uY2UodGhpcy5wbGF5U2NhbGVkU3BlZWQoYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMsIFwidXNlZFwiKSwgKCkgPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMsIFwiZmFjZVwiKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxheUV4cGxvc2lvbkFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgY29tcGxldGlvbkhhbmRsZXIsIHRydWUpO1xuICB9XG5cbiAgcGxheVNoZWFyU2hlZXBBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuICAgIHRoaXMuc2V0U2VsZWN0aW9uSW5kaWNhdG9yUG9zaXRpb24oZGVzdHJveVBvc2l0aW9uWzBdLCBkZXN0cm95UG9zaXRpb25bMV0pO1xuXG4gICAgdGhpcy5vbkFuaW1hdGlvbkVuZCh0aGlzLnBsYXlQbGF5ZXJBbmltYXRpb24oXCJwdW5jaFwiLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSksICgpID0+IHtcbiAgICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSkgKyBkZXN0cm95UG9zaXRpb25bMF07XG4gICAgICBsZXQgYmxvY2tUb1NoZWFyID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XTtcblxuICAgICAgYmxvY2tUb1NoZWFyLmFuaW1hdGlvbnMuc3RvcChudWxsLCB0cnVlKTtcbiAgICAgIHRoaXMub25BbmltYXRpb25Mb29wT25jZSh0aGlzLnBsYXlTY2FsZWRTcGVlZChibG9ja1RvU2hlYXIuYW5pbWF0aW9ucywgXCJ1c2VkXCIpLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKGJsb2NrVG9TaGVhci5hbmltYXRpb25zLCBcImZhY2VcIik7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5wbGF5RXhwbG9zaW9uQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlciwgdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5RGVzdHJveUJsb2NrQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBuZXdTaGFkaW5nUGxhbmVEYXRhLCBuZXdGb3dQbGFuZURhdGEsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdGhpcy5zZXRTZWxlY3Rpb25JbmRpY2F0b3JQb3NpdGlvbihkZXN0cm95UG9zaXRpb25bMF0sIGRlc3Ryb3lQb3NpdGlvblsxXSk7XG5cbiAgICB2YXIgcGxheWVyQW5pbWF0aW9uID1cbiAgICAgICAgYmxvY2tUeXBlLm1hdGNoKC8ob3JlfHN0b25lfGNsYXl8YnJpY2tzfGJlZHJvY2spLykgPyBcIm1pbmVcIiA6IFwicHVuY2hEZXN0cm95XCI7XG4gICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKHBsYXllckFuaW1hdGlvbiwgcGxheWVyUG9zaXRpb24sIGZhY2luZywgZmFsc2UpO1xuICAgIHRoaXMucGxheU1pbmluZ1BhcnRpY2xlc0FuaW1hdGlvbihmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbik7XG4gICAgdGhpcy5wbGF5QmxvY2tEZXN0cm95T3ZlcmxheUFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgbmV3U2hhZGluZ1BsYW5lRGF0YSwgbmV3Rm93UGxhbmVEYXRhLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gIH1cblxuXG4gIHBsYXlQdW5jaERlc3Ryb3lBaXJBbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHRoaXMucGxheVB1bmNoQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgXCJwdW5jaERlc3Ryb3lcIiwgY29tcGxldGlvbkhhbmRsZXIpO1xuICB9XG5cbiAgcGxheVB1bmNoQWlyQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLnBsYXlQdW5jaEFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIFwicHVuY2hcIiwgY29tcGxldGlvbkhhbmRsZXIpO1xuICB9XG5cbiAgcGxheVB1bmNoQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYW5pbWF0aW9uVHlwZSwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKGRlc3Ryb3lQb3NpdGlvblswXSwgZGVzdHJveVBvc2l0aW9uWzFdKTtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVBsYXllckFuaW1hdGlvbihhbmltYXRpb25UeXBlLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSksICgpID0+IHtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBwbGF5QmxvY2tEZXN0cm95T3ZlcmxheUFuaW1hdGlvbihwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBkZXN0cm95UG9zaXRpb24sIGJsb2NrVHlwZSwgbmV3U2hhZGluZ1BsYW5lRGF0YSwgbmV3Rm93UGxhbmVEYXRhLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoZGVzdHJveVBvc2l0aW9uWzFdKSkgKyBkZXN0cm95UG9zaXRpb25bMF07XG4gICAgbGV0IGJsb2NrVG9EZXN0cm95ID0gdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XTtcbiAgICBsZXQgZGlyZWN0aW9uID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG5cbiAgICBsZXQgZGVzdHJveU92ZXJsYXkgPSB0aGlzLmFjdGlvblBsYW5lLmNyZWF0ZSgtMTIgKyA0MCAqIGRlc3Ryb3lQb3NpdGlvblswXSwgLTIyICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMV0sIFwiZGVzdHJveU92ZXJsYXlcIiwgXCJkZXN0cm95MVwiKTtcbiAgICBkZXN0cm95T3ZlcmxheS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KGRlc3Ryb3lQb3NpdGlvblsxXSkgKyAyO1xuICAgIHRoaXMub25BbmltYXRpb25FbmQoZGVzdHJveU92ZXJsYXkuYW5pbWF0aW9ucy5hZGQoXCJkZXN0cm95XCIsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiZGVzdHJveVwiLCAxLCAxMiwgXCJcIiwgMCksIDMwLCBmYWxzZSksICgpID0+XG4gICAge1xuICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1tibG9ja0luZGV4XSA9IG51bGw7XG5cbiAgICAgIGlmIChibG9ja1RvRGVzdHJveS5oYXNPd25Qcm9wZXJ0eShcIm9uQmxvY2tEZXN0cm95XCIpKSB7XG4gICAgICAgIGJsb2NrVG9EZXN0cm95Lm9uQmxvY2tEZXN0cm95KGJsb2NrVG9EZXN0cm95KTtcbiAgICAgIH1cblxuICAgICAgYmxvY2tUb0Rlc3Ryb3kua2lsbCgpO1xuICAgICAgZGVzdHJveU92ZXJsYXkua2lsbCgpO1xuICAgICAgdGhpcy50b0Rlc3Ryb3kucHVzaChibG9ja1RvRGVzdHJveSk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGRlc3Ryb3lPdmVybGF5KTtcbiAgICAgIHRoaXMudXBkYXRlU2hhZGluZ1BsYW5lKG5ld1NoYWRpbmdQbGFuZURhdGEpO1xuICAgICAgdGhpcy51cGRhdGVGb3dQbGFuZShuZXdGb3dQbGFuZURhdGEpO1xuXG4gICAgICB0aGlzLnNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHBsYXllclBvc2l0aW9uWzBdLCBwbGF5ZXJQb3NpdGlvblsxXSk7XG5cbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheSgnZGlnX3dvb2QxJyk7XG4gICAgICB0aGlzLnBsYXlFeHBsb3Npb25BbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKGRlc3Ryb3lPdmVybGF5LmFuaW1hdGlvbnMsIFwiZGVzdHJveVwiKTtcbiAgfVxuXG4gIHBsYXlNaW5pbmdQYXJ0aWNsZXNBbmltYXRpb24oZmFjaW5nLCBkZXN0cm95UG9zaXRpb24pIHtcbiAgICBsZXQgbWluaW5nUGFydGljbGVzRGF0YSA9IFtcbiAgICAgIFsyNCwgLTEwMCwgLTgwXSwgICAvLyBsZWZ0XG4gICAgICBbMTIsIC0xMjAsIC04MF0sICAgLy8gYm90dG9tXG4gICAgICBbMCwgLTYwLCAtODBdLCAgIC8vIHJpZ2h0XG4gICAgICBbMzYsIC04MCwgLTYwXSwgICAvLyB0b3BcbiAgICBdO1xuXG4gICAgbGV0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0RGlyZWN0aW9uTmFtZShmYWNpbmcpO1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXNJbmRleCA9IChkaXJlY3Rpb24gPT09IFwiX2xlZnRcIiA/IDAgOiBkaXJlY3Rpb24gPT09IFwiX2JvdHRvbVwiID8gMSA6IGRpcmVjdGlvbiA9PT0gXCJfcmlnaHRcIiA/IDIgOiAzKTtcbiAgICBsZXQgbWluaW5nUGFydGljbGVzRmlyc3RGcmFtZSA9IG1pbmluZ1BhcnRpY2xlc0RhdGFbbWluaW5nUGFydGljbGVzSW5kZXhdWzBdO1xuICAgIGxldCBtaW5pbmdQYXJ0aWNsZXNPZmZzZXRYID0gbWluaW5nUGFydGljbGVzRGF0YVttaW5pbmdQYXJ0aWNsZXNJbmRleF1bMV07XG4gICAgbGV0IG1pbmluZ1BhcnRpY2xlc09mZnNldFkgPSBtaW5pbmdQYXJ0aWNsZXNEYXRhW21pbmluZ1BhcnRpY2xlc0luZGV4XVsyXTtcbiAgICBsZXQgbWluaW5nUGFydGljbGVzID0gdGhpcy5hY3Rpb25QbGFuZS5jcmVhdGUobWluaW5nUGFydGljbGVzT2Zmc2V0WCArIDQwICogZGVzdHJveVBvc2l0aW9uWzBdLCBtaW5pbmdQYXJ0aWNsZXNPZmZzZXRZICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMV0sIFwibWluaW5nUGFydGljbGVzXCIsIFwiTWluaW5nUGFydGljbGVzXCIgKyBtaW5pbmdQYXJ0aWNsZXNGaXJzdEZyYW1lKTtcbiAgICBtaW5pbmdQYXJ0aWNsZXMuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgMjtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKG1pbmluZ1BhcnRpY2xlcy5hbmltYXRpb25zLmFkZChcIm1pbmluZ1BhcnRpY2xlc1wiLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmluZ1BhcnRpY2xlc1wiLCBtaW5pbmdQYXJ0aWNsZXNGaXJzdEZyYW1lLCBtaW5pbmdQYXJ0aWNsZXNGaXJzdEZyYW1lICsgMTEsIFwiXCIsIDApLCAzMCwgZmFsc2UpLCAoKSA9PiB7XG4gICAgICBtaW5pbmdQYXJ0aWNsZXMua2lsbCgpO1xuICAgICAgdGhpcy50b0Rlc3Ryb3kucHVzaChtaW5pbmdQYXJ0aWNsZXMpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKG1pbmluZ1BhcnRpY2xlcy5hbmltYXRpb25zLCBcIm1pbmluZ1BhcnRpY2xlc1wiKTtcbiAgfVxuXG4gIHBsYXlFeHBsb3Npb25BbmltYXRpb24ocGxheWVyUG9zaXRpb24sIGZhY2luZywgZGVzdHJveVBvc2l0aW9uLCBibG9ja1R5cGUsIGNvbXBsZXRpb25IYW5kbGVyLCBwbGFjZUJsb2NrKSB7XG4gICAgdmFyIHNpZ25hbEJpbmRpbmcsXG4gICAgICAgIGV4cGxvZGVBbmltID0gdGhpcy5hY3Rpb25QbGFuZS5jcmVhdGUoLTM2ICsgNDAgKiBkZXN0cm95UG9zaXRpb25bMF0sIC0zMCArIDQwICogZGVzdHJveVBvc2l0aW9uWzFdLCBcImJsb2NrRXhwbG9kZVwiLCBcIkJsb2NrQnJlYWtQYXJ0aWNsZTBcIik7XG5cbiAgICAvL2V4cGxvZGVBbmltLnRpbnQgPSAweDMyNGJmZjtcbiAgICBpZiAodGhpcy5jb250cm9sbGVyLmNhblVzZVRpbnRzKCkpIHtcbiAgICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJ0cmVlQWNhY2lhXCI6XG4gICAgICAgIGNhc2UgXCJsb2dBY2FjaWFcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg2YzY1NWE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgICAgY2FzZSBcImxvZ0JpcmNoXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4ZGFkNmNjO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwidHJlZUp1bmdsZVwiOlxuICAgICAgICBjYXNlIFwibG9nSnVuZ2xlXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4NmE0ZjMxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgICBjYXNlIFwibG9nT2FrXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4Njc1MjMxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICBjYXNlIFwibG9nU3BydWNlXCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4NGIzOTIzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJwbGFua3NBY2FjaWFcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHhiYTYzMzc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJwbGFua3NCaXJjaFwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweGQ3Y2I4ZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBsYW5rc0p1bmdsZVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweGI4ODc2NDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBsYW5rc09ha1wiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweGI0OTA1YTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInBsYW5rc1NwcnVjZVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweDgwNWUzNjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInN0b25lXCI6XG4gICAgICAgIGNhc2UgXCJvcmVDb2FsXCI6XG4gICAgICAgIGNhc2UgXCJvcmVEaWFtb25kXCI6XG4gICAgICAgIGNhc2UgXCJvcmVJcm9uXCI6XG4gICAgICAgIGNhc2UgXCJvcmVHb2xkXCI6XG4gICAgICAgIGNhc2UgXCJvcmVFbWVyYWxkXCI6XG4gICAgICAgIGNhc2UgXCJvcmVSZWRzdG9uZVwiOlxuICAgICAgICAgIGV4cGxvZGVBbmltLnRpbnQgPSAweEM2QzZDNjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImdyYXNzXCI6XG4gICAgICAgIGNhc2UgXCJjcm9wV2hlYXRcIjpcbiAgICAgICAgICBleHBsb2RlQW5pbS50aW50ID0gMHg1ZDhmMjM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJkaXJ0XCI6XG4gICAgICAgICAgZXhwbG9kZUFuaW0udGludCA9IDB4OGE1ZTMzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXhwbG9kZUFuaW0uc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgMjtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKGV4cGxvZGVBbmltLmFuaW1hdGlvbnMuYWRkKFwiZXhwbG9kZVwiLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkJsb2NrQnJlYWtQYXJ0aWNsZVwiLCAwLCA3LCBcIlwiLCAwKSwgMzAsIGZhbHNlKSwgKCkgPT5cbiAgICB7XG4gICAgICBleHBsb2RlQW5pbS5raWxsKCk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGV4cGxvZGVBbmltKTtcblxuICAgICAgaWYocGxhY2VCbG9jaylcbiAgICAgIHtcbiAgICAgICAgdGhpcy5wbGF5UGxheWVyQW5pbWF0aW9uKFwiaWRsZVwiLCBwbGF5ZXJQb3NpdGlvbiwgZmFjaW5nLCBmYWxzZSk7XG4gICAgICAgIHRoaXMucGxheUl0ZW1Ecm9wQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoZXhwbG9kZUFuaW0uYW5pbWF0aW9ucywgXCJleHBsb2RlXCIpO1xuICAgIGlmKCFwbGFjZUJsb2NrKVxuICAgIHtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfVxuICB9XG5cbiAgcGxheUl0ZW1Ecm9wQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBzcHJpdGUgPSB0aGlzLmNyZWF0ZU1pbmlCbG9jayhkZXN0cm95UG9zaXRpb25bMF0sIGRlc3Ryb3lQb3NpdGlvblsxXSwgYmxvY2tUeXBlKTtcbiAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleChkZXN0cm95UG9zaXRpb25bMV0pICsgMjtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kKHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImFuaW1hdGVcIiksICgpID0+IHtcbiAgICAgIHRoaXMucGxheUl0ZW1BY3F1aXJlQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBzcHJpdGUsIGNvbXBsZXRpb25IYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlTY2FsZWRTcGVlZChhbmltYXRpb25NYW5hZ2VyLCBuYW1lKSB7XG4gICAgdmFyIGFuaW1hdGlvbiA9IGFuaW1hdGlvbk1hbmFnZXIuZ2V0QW5pbWF0aW9uKG5hbWUpO1xuICAgIGlmICghYW5pbWF0aW9uLm9yaWdpbmFsRnBzKSB7XG4gICAgICBhbmltYXRpb24ub3JpZ2luYWxGcHMgPSAxMDAwIC8gYW5pbWF0aW9uLmRlbGF5O1xuICAgIH1cbiAgICByZXR1cm4gYW5pbWF0aW9uTWFuYWdlci5wbGF5KG5hbWUsIHRoaXMuY29udHJvbGxlci5vcmlnaW5hbEZwc1RvU2NhbGVkKGFuaW1hdGlvbi5vcmlnaW5hbEZwcykpO1xuICB9XG5cbiAgcGxheUl0ZW1BY3F1aXJlQW5pbWF0aW9uKHBsYXllclBvc2l0aW9uLCBmYWNpbmcsIGRlc3Ryb3lQb3NpdGlvbiwgYmxvY2tUeXBlLCBzcHJpdGUsIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHR3ZWVuO1xuXG4gICAgdHdlZW4gPSB0aGlzLmFkZFJlc2V0dGFibGVUd2VlbihzcHJpdGUpLnRvKHtcbiAgICAgIHg6ICgtMTggKyA0MCAqIHBsYXllclBvc2l0aW9uWzBdKSxcbiAgICAgIHk6ICgtMzIgKyA0MCAqIHBsYXllclBvc2l0aW9uWzFdKVxuICAgIH0sIDIwMCwgUGhhc2VyLkVhc2luZy5MaW5lYXIuTm9uZSk7XG5cbiAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJjb2xsZWN0ZWRCbG9ja1wiKTtcbiAgICAgIHNwcml0ZS5raWxsKCk7XG4gICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKHNwcml0ZSk7XG4gICAgICBjb21wbGV0aW9uSGFuZGxlcigpO1xuICAgIH0pO1xuXG4gICAgdHdlZW4uc3RhcnQoKTtcbiAgfVxuXG4gIHNldFBsYXllclBvc2l0aW9uKHgsIHksIGlzT25CbG9jaykge1xuICAgIHRoaXMucGxheWVyU3ByaXRlLnggPSAtMTggKyA0MCAqIHg7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUueSA9IC0zMiArIChpc09uQmxvY2sgPyAtMjMgOiAwKSArIDQwICogeTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHkpICsgNTtcbiAgfVxuXG4gIHNldFNlbGVjdGlvbkluZGljYXRvclBvc2l0aW9uKHgsIHkpIHtcbiAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvci54ID0gLTM1ICsgMjMgKyA0MCAqIHg7XG4gICAgdGhpcy5zZWxlY3Rpb25JbmRpY2F0b3IueSA9IC01NSArIDQzICsgNDAgKiB5O1xuICB9XG5cbiAgY3JlYXRlUGxhbmVzKCkge1xuICAgIHRoaXMuZ3JvdW5kUGxhbmUgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5ncm91bmRQbGFuZS55T2Zmc2V0ID0gLTI7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUueU9mZnNldCA9IC0yO1xuICAgIHRoaXMuYWN0aW9uUGxhbmUgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG4gICAgdGhpcy5hY3Rpb25QbGFuZS55T2Zmc2V0ID0gLTIyO1xuICAgIHRoaXMuZmx1ZmZQbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmZsdWZmUGxhbmUueU9mZnNldCA9IC0xNjA7XG4gICAgdGhpcy5mb3dQbGFuZSA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICB0aGlzLmZvd1BsYW5lLnlPZmZzZXQgPSAwO1xuICB9XG5cbiAgcmVzZXRQbGFuZXMobGV2ZWxEYXRhKSB7XG4gICAgdmFyIHNwcml0ZSxcbiAgICAgICAgeCxcbiAgICAgICAgeSxcbiAgICAgICAgaSxcbiAgICAgICAgYmxvY2tUeXBlLFxuICAgICAgICBmcmFtZUxpc3Q7XG5cbiAgICB0aGlzLmdyb3VuZFBsYW5lLnJlbW92ZUFsbCh0cnVlKTtcbiAgICB0aGlzLmFjdGlvblBsYW5lLnJlbW92ZUFsbCh0cnVlKTtcbiAgICB0aGlzLmZsdWZmUGxhbmUucmVtb3ZlQWxsKHRydWUpO1xuICAgIHRoaXMuc2hhZGluZ1BsYW5lLnJlbW92ZUFsbCh0cnVlKTtcbiAgICB0aGlzLmZvd1BsYW5lLnJlbW92ZUFsbCh0cnVlKTtcblxuICAgIHRoaXMuYmFzZVNoYWRpbmcgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XG5cbiAgICBmb3IgKHZhciBzaGFkZVggPSAwOyBzaGFkZVggPCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5wbGFuZVdpZHRoICogNDA7IHNoYWRlWCArPSA0MDApIHtcbiAgICAgIGZvciAodmFyIHNoYWRlWSA9IDA7IHNoYWRlWSA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lSGVpZ2h0ICogNDA7IHNoYWRlWSArPSA0MDApIHtcbiAgICAgICAgdGhpcy5iYXNlU2hhZGluZy5jcmVhdGUoc2hhZGVYLCBzaGFkZVksICdzaGFkZUxheWVyJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZWZyZXNoR3JvdW5kUGxhbmUoKTtcblxuICAgIHRoaXMuYWN0aW9uUGxhbmVCbG9ja3MgPSBbXTtcbiAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICBsZXQgYmxvY2tJbmRleCA9ICh0aGlzLnlUb0luZGV4KHkpKSArIHg7XG4gICAgICAgIHNwcml0ZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKCFsZXZlbERhdGEuZ3JvdW5kRGVjb3JhdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkpIHtcbiAgICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHgsIHksIGxldmVsRGF0YS5ncm91bmREZWNvcmF0aW9uUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlKTtcbiAgICAgICAgICBpZiAoc3ByaXRlKSB7XG4gICAgICAgICAgICBzcHJpdGUuc29ydE9yZGVyID0gdGhpcy55VG9JbmRleCh5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzcHJpdGUgPSBudWxsO1xuICAgICAgICBpZiAoIWxldmVsRGF0YS5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5KSB7XG4gICAgICAgICAgYmxvY2tUeXBlID0gbGV2ZWxEYXRhLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmJsb2NrVHlwZTtcbiAgICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuYWN0aW9uUGxhbmUsIHgsIHksIGJsb2NrVHlwZSk7XG4gICAgICAgICAgaWYgKHNwcml0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc3ByaXRlLnNvcnRPcmRlciA9IHRoaXMueVRvSW5kZXgoeSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrcy5wdXNoKHNwcml0ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh5ID0gMDsgeSA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLmNvbnRyb2xsZXIubGV2ZWxNb2RlbC5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgbGV0IGJsb2NrSW5kZXggPSAodGhpcy55VG9JbmRleCh5KSkgKyB4O1xuICAgICAgICBpZiAoIWxldmVsRGF0YS5mbHVmZlBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHkpIHtcbiAgICAgICAgICBzcHJpdGUgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZmx1ZmZQbGFuZSwgeCwgeSwgbGV2ZWxEYXRhLmZsdWZmUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlZnJlc2hHcm91bmRQbGFuZSgpIHtcbiAgICB0aGlzLmdyb3VuZFBsYW5lLnJlbW92ZUFsbCh0cnVlKTtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuY29udHJvbGxlci5sZXZlbE1vZGVsLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgIGxldCBibG9ja0luZGV4ID0gKHRoaXMueVRvSW5kZXgoeSkpICsgeDtcbiAgICAgICAgdmFyIHNwcml0ZSA9IHRoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgeCwgeSwgdGhpcy5jb250cm9sbGVyLmxldmVsTW9kZWwuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlKTtcbiAgICAgICAgaWYgKHNwcml0ZSkge1xuICAgICAgICAgIHNwcml0ZS5zb3J0T3JkZXIgPSB0aGlzLnlUb0luZGV4KHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU2hhZGluZ1BsYW5lKHNoYWRpbmdEYXRhKSB7XG4gICAgdmFyIGluZGV4LCBzaGFkb3dJdGVtLCBzeCwgc3ksIGF0bGFzO1xuXG4gICAgdGhpcy5zaGFkaW5nUGxhbmUucmVtb3ZlQWxsKCk7XG5cbiAgICB0aGlzLnNoYWRpbmdQbGFuZS5hZGQodGhpcy5iYXNlU2hhZGluZyk7XG4gICAgdGhpcy5zaGFkaW5nUGxhbmUuYWRkKHRoaXMuc2VsZWN0aW9uSW5kaWNhdG9yKTtcblxuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHNoYWRpbmdEYXRhLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgc2hhZG93SXRlbSA9IHNoYWRpbmdEYXRhW2luZGV4XTtcblxuICAgICAgYXRsYXMgPSBcIkFPXCI7XG4gICAgICBzeCA9IDQwICogc2hhZG93SXRlbS54O1xuICAgICAgc3kgPSAtMjIgKyA0MCAqIHNoYWRvd0l0ZW0ueTtcblxuICAgICAgc3dpdGNoIChzaGFkb3dJdGVtLnR5cGUpIHtcbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X0xlZnRcIjpcbiAgICAgICAgICBzeCArPSAyNjtcbiAgICAgICAgICBzeSArPSAyMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfUmlnaHRcIjpcbiAgICAgICAgICBzeCArPSAwO1xuICAgICAgICAgIHN5ICs9IDIyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Cb3R0b21cIjpcbiAgICAgICAgICBzeCArPSAwO1xuICAgICAgICAgIHN5ICs9IDIyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Cb3R0b21MZWZ0XCI6XG4gICAgICAgICAgc3ggKz0gMjU7XG4gICAgICAgICAgc3kgKz0gMjI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIkFPZWZmZWN0X0JvdHRvbVJpZ2h0XCI6XG4gICAgICAgICAgc3ggKz0gMDtcbiAgICAgICAgICBzeSArPSAyMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfVG9wXCI6XG4gICAgICAgICAgc3ggKz0gMDtcbiAgICAgICAgICBzeSArPSA0NztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiQU9lZmZlY3RfVG9wTGVmdFwiOlxuICAgICAgICAgIHN4ICs9IDI1O1xuICAgICAgICAgIHN5ICs9IDQ3O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJBT2VmZmVjdF9Ub3BSaWdodFwiOlxuICAgICAgICAgIHN4ICs9IDA7XG4gICAgICAgICAgc3kgKz0gNDc7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIlNoYWRvd19QYXJ0c19GYWRlX2Jhc2UucG5nXCI6XG4gICAgICAgICAgYXRsYXMgPSBcImJsb2NrU2hhZG93c1wiO1xuICAgICAgICAgIHN4IC09IDUyO1xuICAgICAgICAgIHN5ICs9IDA7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIlNoYWRvd19QYXJ0c19GYWRlX3RvcC5wbmdcIjpcbiAgICAgICAgICBhdGxhcyA9IFwiYmxvY2tTaGFkb3dzXCI7XG4gICAgICAgICAgc3ggLT0gNTI7XG4gICAgICAgICAgc3kgKz0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5zaGFkaW5nUGxhbmUuY3JlYXRlKHN4LCBzeSwgYXRsYXMsIHNoYWRvd0l0ZW0udHlwZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlRm93UGxhbmUoZm93RGF0YSkge1xuICAgIHZhciBpbmRleCwgZngsIGZ5LCBhdGxhcztcblxuICAgIHRoaXMuZm93UGxhbmUucmVtb3ZlQWxsKCk7XG5cbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBmb3dEYXRhLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgbGV0IGZvd0l0ZW0gPSBmb3dEYXRhW2luZGV4XTtcblxuICAgICAgaWYgKGZvd0l0ZW0gIT09IFwiXCIpIHtcbiAgICAgICAgYXRsYXMgPSBcInVuZGVyZ3JvdW5kRm93XCI7XG4gICAgICAgIGZ4ID0gLTQwICsgNDAgKiBmb3dJdGVtLng7XG4gICAgICAgIGZ5ID0gLTQwICsgNDAgKiBmb3dJdGVtLnk7XG5cbiAgICAgICAgc3dpdGNoIChmb3dJdGVtLnR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwiRm9nT2ZXYXJfQ2VudGVyXCI6XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm93UGxhbmUuY3JlYXRlKGZ4LCBmeSwgYXRsYXMsIGZvd0l0ZW0udHlwZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcGxheVJhbmRvbVBsYXllcklkbGUoZmFjaW5nKSB7XG4gICAgdmFyIGZhY2luZ05hbWUsXG4gICAgICAgIHJhbmQsXG4gICAgICAgIGFuaW1hdGlvbk5hbWU7XG5cbiAgICBmYWNpbmdOYW1lID0gdGhpcy5nZXREaXJlY3Rpb25OYW1lKGZhY2luZyk7XG4gICAgcmFuZCA9IE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSAqIDQpICsgMTtcblxuICAgIHN3aXRjaChyYW5kKVxuICAgIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgIGFuaW1hdGlvbk5hbWUgPSBcImlkbGVcIjtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgYW5pbWF0aW9uTmFtZSA9IFwibG9va0xlZnRcIjtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgYW5pbWF0aW9uTmFtZSA9IFwibG9va1JpZ2h0XCI7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgIGFuaW1hdGlvbk5hbWUgPSBcImxvb2tBdENhbVwiO1xuICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cblxuICAgIGFuaW1hdGlvbk5hbWUgKz0gZmFjaW5nTmFtZTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBhbmltYXRpb25OYW1lKTtcbiAgfVxuXG4gIGdlbmVyYXRlUGxheWVyQ2VsZWJyYXRlRnJhbWVzKCkge1xuICAgIHZhciBmcmFtZUxpc3QgPSBbXSxcbiAgICAgICAgaTtcblxuICAgIC8vQ3JvdWNoIERvd25cbiAgIC8qIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI5LCAzMiwgXCJcIiwgMykpO1xuICAgIC8vQ3JvdWNoIERvd25cbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyOSwgMzIsIFwiXCIsIDMpKTtcbiAgICAvL3R1cm4gYW5kIHBhdXNlXG4gICAgZm9yIChpID0gMDsgaSA8IDQ7ICsraSkge1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMDYxXCIpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgMjsgKytpKSB7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8xNDlcIik7XG4gICAgfVxuICAgICAgICAvL0Nyb3VjaCBVcFxuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE0OSwgMTUyLCBcIlwiLCAzKSk7XG4gICAgLy9Dcm91Y2ggVXBcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNDksIDE1MiwgXCJcIiwgMykpOyovXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vQWx0ZXJuYXRpdmUgQW5pbWF0aW9uLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy9GYWNlIERvd25cbiAgICAgZm9yIChpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIH1cbiAgICAvL0Nyb3VjaCBMZWZ0XG4gICAgLy9mcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMDksIDIxMiwgXCJcIiwgMykpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjA5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjA5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjExXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjExXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjExXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjExXCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjA5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjA5XCIpO1xuICAgIGZyYW1lTGlzdCA9IGZyYW1lTGlzdC5jb25jYXQoXCJQbGF5ZXJfMjA5XCIpO1xuICAgIC8vQ3JvdWNoIExlZnRcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzIxMVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzIxMVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzIxMVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzIxMVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzIwOVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzIwOVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzIwOVwiKTtcbiAgICAvL0Nyb3VjaCBSaWdodFxuICAgIC8vZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgODksIDkyLCBcIlwiLCAzKSk7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wODlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wODlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wOTFcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wOTFcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wOTFcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wOTFcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wODlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wODlcIik7XG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChcIlBsYXllcl8wODlcIik7XG4gICAgLy9Dcm91Y2ggUmlnaHRcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA5MVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA5MVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA5MVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA5MVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA4OVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA4OVwiKTtcbiAgICBmcmFtZUxpc3QgPSBmcmFtZUxpc3QuY29uY2F0KFwiUGxheWVyXzA4OVwiKTtcbiAgICAvL0ZhY2UgRG93biAoZm9yIHBhdXNlKVxuICAgICBmb3IgKGkgPSAwOyBpIDwgMzsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgfVxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvL0p1bXAgc3VjY2Vzc1xuICAgIC8qZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjg1LCAyOTYsIFwiXCIsIDMpKTtcbiAgICAvL2Zyb2xpY2sgY2VsZWJyYXRlXG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMzcsIDQ0LCBcIlwiLCAzKSk7Ki9cbiAgICAvL2xvb2sgYXQgY2FtXG4gICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjYzLCAyNjIsIFwiXCIsIDMpKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNTsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNjJcIik7XG4gICAgfVxuICAgIHJldHVybiBmcmFtZUxpc3Q7XG4gIH1cblxuICBnZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShmcmFtZU5hbWUsIHN0YXJ0RnJhbWUsIGVuZEZyYW1lLCBlbmRGcmFtZUZ1bGxOYW1lLCBidWZmZXIsIGZyYW1lRGVsYXkpIHtcbiAgICB2YXIgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoZnJhbWVOYW1lLCBzdGFydEZyYW1lLCBlbmRGcmFtZSwgXCJcIiwgYnVmZmVyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZyYW1lRGVsYXk7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goZW5kRnJhbWVGdWxsTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBmcmFtZUxpc3Q7XG4gIH1cblxuICBwcmVwYXJlUGxheWVyU3ByaXRlKHBsYXllck5hbWUpIHtcbiAgICB2YXIgZnJhbWVMaXN0LFxuICAgICAgICBnZW5GcmFtZXMsXG4gICAgICAgIGksXG4gICAgICAgIHNpbmdsZVB1bmNoLFxuICAgICAgICBqdW1wQ2VsZWJyYXRlRnJhbWVzLFxuICAgICAgICBpZGxlRnJhbWVSYXRlID0gMTA7XG5cbiAgICBsZXQgZnJhbWVSYXRlID0gMjA7XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZSA9IHRoaXMuYWN0aW9uUGxhbmUuY3JlYXRlKDAsIDAsIGBwbGF5ZXIke3BsYXllck5hbWV9YCwgJ1BsYXllcl8xMjEnKTtcbiAgICBpZiAodGhpcy5jb250cm9sbGVyLmZvbGxvd2luZ1BsYXllcigpKSB7XG4gICAgICB0aGlzLmdhbWUuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllclNwcml0ZSk7XG4gICAgfVxuICAgIHRoaXMucGxheWVyR2hvc3QgPSB0aGlzLmZsdWZmUGxhbmUuY3JlYXRlKDAsIDAsIGBwbGF5ZXIke3BsYXllck5hbWV9YCwgJ1BsYXllcl8xMjEnKTtcbiAgICB0aGlzLnBsYXllckdob3N0LnBhcmVudCA9IHRoaXMucGxheWVyU3ByaXRlO1xuICAgIHRoaXMucGxheWVyR2hvc3QuYWxwaGEgPSAwLjI7XG5cbiAgICB0aGlzLnNlbGVjdGlvbkluZGljYXRvciA9IHRoaXMuc2hhZGluZ1BsYW5lLmNyZWF0ZSgyNCwgNDQsICdzZWxlY3Rpb25JbmRpY2F0b3InKTtcblxuICAgIGp1bXBDZWxlYnJhdGVGcmFtZXMgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjg1LCAyOTYsIFwiXCIsIDMpO1xuXG4gICAgZnJhbWVMaXN0ID0gW107XG5cbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAzXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDA5XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwN1wiKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNTsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMDFcIik7XG4gICAgfVxuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVfZG93bicsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uRG93bik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgNiwgNSwgXCJQbGF5ZXJfMDA1XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzAwNlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0xlZnRfZG93bicsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfZG93blwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAxMiwgMTEsIFwiUGxheWVyXzAxMVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wMTJcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tSaWdodF9kb3duJywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9kb3duXCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDI2MywgMjYyLCBcIlBsYXllcl8yNjJcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMjYzXCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rQXRDYW1fZG93bicsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfZG93blwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMTM7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDAxXCIpO1xuICAgIH1cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZVBhdXNlX2Rvd24nLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLkRvd24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3dhbGtfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxMywgZnJhbWVSYXRlLCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICBzaW5nbGVQdW5jaCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMSwgMjQsIFwiXCIsIDMpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaF9kb3duJywgc2luZ2xlUHVuY2gsIGZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInB1bmNoXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaERlc3Ryb3lfZG93bicsIHNpbmdsZVB1bmNoLmNvbmNhdChzaW5nbGVQdW5jaCkuY29uY2F0KHNpbmdsZVB1bmNoKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2h1cnRfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyNSwgMjgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjcm91Y2hfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyOSwgMzIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wVXBfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAzMywgMzYsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnZmFpbF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDQ1LCA0OCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjZWxlYnJhdGVfZG93bicsIHRoaXMuZ2VuZXJhdGVQbGF5ZXJDZWxlYnJhdGVGcmFtZXMoKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdidW1wX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgNDksIDU0LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCBmYWxzZSkub25TdGFydC5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiYnVtcFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcERvd25fZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA1NSwgNjAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lX2Rvd24nLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjQxLCAyNDQsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgNSwgNSwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF90dXJubGVmdF9kb3duJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgNiwgNiwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF90dXJucmlnaHRfZG93bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDEyLCAxMiwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuXG4gICAgZnJhbWVMaXN0ID0gW107XG5cbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjFcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDYzXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2MVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjdcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDY5XCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzA2N1wiKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgNTsgKytpKSB7XG4gICAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjFcIik7XG4gICAgfVxuXG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVfcmlnaHQnLCBmcmFtZUxpc3QsIGZyYW1lUmF0ZSAvIDMsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVJhbmRvbVBsYXllcklkbGUoRmFjaW5nRGlyZWN0aW9uLlJpZ2h0KTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCA2NiwgNjUsIFwiUGxheWVyXzA2NVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNjZcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tMZWZ0X3JpZ2h0JywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9yaWdodFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCA3MiwgNzEsIFwiUGxheWVyXzA3MVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8wNzJcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tSaWdodF9yaWdodCcsZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9yaWdodFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAyNzAsIDI2OSwgXCJQbGF5ZXJfMjY5XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI3MFwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0F0Q2FtX3JpZ2h0JywgZnJhbWVMaXN0LCBpZGxlRnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9yaWdodFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMTM7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMDYxXCIpO1xuICAgIH1cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZVBhdXNlX3JpZ2h0JywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5SaWdodCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnd2Fsa19yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA3MywgODAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHNpbmdsZVB1bmNoID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDgxLCA4NCwgXCJcIiwgMyk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoX3JpZ2h0Jywgc2luZ2xlUHVuY2gsIGZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInB1bmNoXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdwdW5jaERlc3Ryb3lfcmlnaHQnLCBzaW5nbGVQdW5jaC5jb25jYXQoc2luZ2xlUHVuY2gpLmNvbmNhdChzaW5nbGVQdW5jaCksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdodXJ0X3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDg1LCA4OCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2Nyb3VjaF9yaWdodCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCA4OSwgOTIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wVXBfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgOTMsIDk2LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2ZhaWxfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTA1LCAxMDgsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2NlbGVicmF0ZV9yaWdodCcsIHRoaXMuZ2VuZXJhdGVQbGF5ZXJDZWxlYnJhdGVGcmFtZXMoKSwgZnJhbWVSYXRlIC8gMiwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdidW1wX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDEwOSwgMTE0LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCBmYWxzZSkub25TdGFydC5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiYnVtcFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcERvd25fcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTE1LCAxMjAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lX3JpZ2h0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDI0NSwgMjQ4LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfcmlnaHQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCA3LCA3LCBcIlwiLCAyKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG5cbiAgICBmcmFtZUxpc3QgPSBbXTtcblxuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4MVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODNcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTgxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4N1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xODlcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTg3XCIpO1xuICAgIGZvciAoaSA9IDA7IGkgPCA1OyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4MVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZV9sZWZ0JywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5MZWZ0KTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAxODYsIDE4NSwgXCJQbGF5ZXJfMTg1XCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4NlwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0xlZnRfbGVmdCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZCh0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVQYXVzZV9sZWZ0XCIpO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDE5MiwgMTkxLCBcIlBsYXllcl8xOTFcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTkyXCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rUmlnaHRfbGVmdCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfbGVmdFwiKTtcbiAgICB9KTtcbiAgICBmcmFtZUxpc3QgPSB0aGlzLmdlbmVyYXRlRnJhbWVzV2l0aEVuZERlbGF5KFwiUGxheWVyX1wiLCAyODQsIDI4MywgXCJQbGF5ZXJfMjgzXCIsIDMsIDUpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzI4NFwiKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbG9va0F0Q2FtX2xlZnQnLCBmcmFtZUxpc3QsIGlkbGVGcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKT0+IHtcbiAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVBhdXNlX2xlZnRcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IDEzOyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzE4MVwiKTtcbiAgICB9XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2lkbGVQYXVzZV9sZWZ0JywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5MZWZ0KTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCd3YWxrX2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTkzLCAyMDAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHNpbmdsZVB1bmNoID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIwMSwgMjA0LCBcIlwiLCAzKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hfbGVmdCcsIHNpbmdsZVB1bmNoLCBmcmFtZVJhdGUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJwdW5jaFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hEZXN0cm95X2xlZnQnLCBzaW5nbGVQdW5jaC5jb25jYXQoc2luZ2xlUHVuY2gpLmNvbmNhdChzaW5nbGVQdW5jaCksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdodXJ0X2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjA1LCAyMDgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjcm91Y2hfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMDksIDIxMiwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2p1bXBVcF9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIxMywgMjE2LCBcIlwiLCAzKSwgZnJhbWVSYXRlIC8gMiwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2ZhaWxfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMjUsIDIyOCwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY2VsZWJyYXRlX2xlZnQnLCB0aGlzLmdlbmVyYXRlUGxheWVyQ2VsZWJyYXRlRnJhbWVzKCksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnYnVtcF9sZWZ0JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDIyOSwgMjM0LCBcIlwiLCAzKSwgZnJhbWVSYXRlLCBmYWxzZSkub25TdGFydC5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwiYnVtcFwiKTtcbiAgICB9KTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnanVtcERvd25fbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyMzUsIDI0MCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVfbGVmdCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAyNTMsIDI1NiwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVDYXJ0X2xlZnQnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCAxMSwgMTEsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcblxuICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyMVwiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjNcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTIxXCIpO1xuICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyN1wiKTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMjlcIik7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTI3XCIpO1xuICAgIGZvciAoaSA9IDA7IGkgPCA1OyArK2kpIHtcbiAgICAgIGZyYW1lTGlzdC5wdXNoKFwiUGxheWVyXzEyMVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZV91cCcsIGZyYW1lTGlzdCwgZnJhbWVSYXRlIC8gMywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5UmFuZG9tUGxheWVySWRsZShGYWNpbmdEaXJlY3Rpb24uVXApO1xuICAgIH0pO1xuICAgIGZyYW1lTGlzdCA9IHRoaXMuZ2VuZXJhdGVGcmFtZXNXaXRoRW5kRGVsYXkoXCJQbGF5ZXJfXCIsIDEyNiwgMTI1LCBcIlBsYXllcl8xMjVcIiwgMywgNSk7XG4gICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTI2XCIpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdsb29rTGVmdF91cCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfdXBcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMTMyLCAxMzEsIFwiUGxheWVyXzEzMVwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8xMzJcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tSaWdodF91cCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfdXBcIik7XG4gICAgfSk7XG4gICAgZnJhbWVMaXN0ID0gdGhpcy5nZW5lcmF0ZUZyYW1lc1dpdGhFbmREZWxheShcIlBsYXllcl9cIiwgMjc3LCAyNzYsIFwiUGxheWVyXzI3NlwiLCAzLCA1KTtcbiAgICBmcmFtZUxpc3QucHVzaChcIlBsYXllcl8yNzdcIik7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2xvb2tBdENhbV91cCcsIGZyYW1lTGlzdCwgaWRsZUZyYW1lUmF0ZSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpPT4ge1xuICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQodGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlUGF1c2VfdXBcIik7XG4gICAgfSk7XG5cbiAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMTM7ICsraSkge1xuICAgICAgZnJhbWVMaXN0LnB1c2goXCJQbGF5ZXJfMTIxXCIpO1xuICAgIH1cbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnaWRsZVBhdXNlX3VwJywgZnJhbWVMaXN0LCBmcmFtZVJhdGUgLyAzLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCk9PiB7XG4gICAgICB0aGlzLnBsYXlSYW5kb21QbGF5ZXJJZGxlKEZhY2luZ0RpcmVjdGlvbi5VcCk7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3dhbGtfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTMzLCAxNDAsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHNpbmdsZVB1bmNoID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJQbGF5ZXJfXCIsIDE0MSwgMTQ0LCBcIlwiLCAzKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgncHVuY2hfdXAnLCBzaW5nbGVQdW5jaCwgZnJhbWVSYXRlLCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5hdWRpb1BsYXllci5wbGF5KFwicHVuY2hcIik7XG4gICAgfSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ3B1bmNoRGVzdHJveV91cCcsIHNpbmdsZVB1bmNoLmNvbmNhdChzaW5nbGVQdW5jaCkuY29uY2F0KHNpbmdsZVB1bmNoKSwgZnJhbWVSYXRlLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2h1cnRfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTQ1LCAxNDgsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdjcm91Y2hfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTQ5LCAxNTIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wVXBfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTUzLCAxNTYsIFwiXCIsIDMpLCBmcmFtZVJhdGUgLyAyLCB0cnVlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnZmFpbF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNjUsIDE2OCwgXCJcIiwgMyksIGZyYW1lUmF0ZSAvIDIsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnY2VsZWJyYXRlX3VwJywgdGhpcy5nZW5lcmF0ZVBsYXllckNlbGVicmF0ZUZyYW1lcygpLCBmcmFtZVJhdGUgLyAyLCBmYWxzZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ2J1bXBfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMTY5LCAxNzQsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIGZhbHNlKS5vblN0YXJ0LmFkZCgoKSA9PiB7XG4gICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJidW1wXCIpO1xuICAgIH0pO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdqdW1wRG93bl91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiUGxheWVyX1wiLCAxNzUsIDE4MCwgXCJcIiwgMyksIGZyYW1lUmF0ZSwgdHJ1ZSk7XG4gICAgdGhpcy5wbGF5ZXJTcHJpdGUuYW5pbWF0aW9ucy5hZGQoJ21pbmVfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlBsYXllcl9cIiwgMjQ5LCAyNTIsIFwiXCIsIDMpLCBmcmFtZVJhdGUsIHRydWUpO1xuICAgIHRoaXMucGxheWVyU3ByaXRlLmFuaW1hdGlvbnMuYWRkKCdtaW5lQ2FydF91cCcsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTWluZWNhcnRfXCIsIDksIDksIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfdHVybmxlZnRfdXAnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIk1pbmVjYXJ0X1wiLCAxMCwgMTAsIFwiXCIsIDIpLCBmcmFtZVJhdGUsIGZhbHNlKTtcbiAgICB0aGlzLnBsYXllclNwcml0ZS5hbmltYXRpb25zLmFkZCgnbWluZUNhcnRfdHVybnJpZ2h0X3VwJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJNaW5lY2FydF9cIiwgOCwgOCwgXCJcIiwgMiksIGZyYW1lUmF0ZSwgZmFsc2UpO1xuICB9XG5cbiAgY3JlYXRlTWluaUJsb2NrKHgsIHksIGJsb2NrVHlwZSkge1xuICAgIHZhciBmcmFtZSA9IFwiXCIsXG4gICAgICAgIHNwcml0ZSA9IG51bGwsXG4gICAgICAgIGZyYW1lTGlzdCxcbiAgICAgICAgaSwgbGVuO1xuXG4gICAgc3dpdGNoIChibG9ja1R5cGUpIHtcbiAgICAgIGNhc2UgXCJ0cmVlQWNhY2lhXCI6XG4gICAgICBjYXNlIFwidHJlZUJpcmNoXCI6XG4gICAgICBjYXNlIFwidHJlZUp1bmdsZVwiOlxuICAgICAgY2FzZSBcInRyZWVPYWtcIjpcbiAgICAgIGNhc2UgXCJ0cmVlU3BydWNlXCI6XG4gICAgICAgIGZyYW1lID0gXCJsb2dcIiArIGJsb2NrVHlwZS5zdWJzdHJpbmcoNCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInN0b25lXCI6XG4gICAgICAgIGZyYW1lID0gXCJjb2JibGVzdG9uZVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVDb2FsXCI6XG4gICAgICAgIGZyYW1lID0gXCJjb2FsXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZURpYW1vbmRcIjpcbiAgICAgICAgZnJhbWUgPSBcImRpYW1vbmRcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlSXJvblwiOlxuICAgICAgICBmcmFtZSA9IFwiaW5nb3RJcm9uXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm9yZUxhcGlzXCI6XG4gICAgICAgIGZyYW1lID0gXCJsYXBpc0xhenVsaVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVHb2xkXCI6XG4gICAgICAgIGZyYW1lID0gXCJpbmdvdEdvbGRcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib3JlRW1lcmFsZFwiOlxuICAgICAgICBmcmFtZSA9IFwiZW1lcmFsZFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJvcmVSZWRzdG9uZVwiOlxuICAgICAgICBmcmFtZSA9IFwicmVkc3RvbmVEdXN0XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImdyYXNzXCI6XG4gICAgICAgIGZyYW1lID0gXCJkaXJ0XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIndvb2xfb3JhbmdlXCI6XG4gICAgICAgIGZyYW1lID0gXCJ3b29sXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInRudFwiOlxuICAgICAgICBmcmFtZSA9IFwiZ3VuUG93ZGVyXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZnJhbWUgPSBibG9ja1R5cGU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBhdGxhcyA9IFwibWluaUJsb2Nrc1wiO1xuICAgIGxldCBmcmFtZVByZWZpeCA9IHRoaXMubWluaUJsb2Nrc1tmcmFtZV1bMF07XG4gICAgbGV0IGZyYW1lU3RhcnQgPSB0aGlzLm1pbmlCbG9ja3NbZnJhbWVdWzFdO1xuICAgIGxldCBmcmFtZUVuZCA9IHRoaXMubWluaUJsb2Nrc1tmcmFtZV1bMl07XG4gICAgbGV0IHhPZmZzZXQgPSAtMTA7XG4gICAgbGV0IHlPZmZzZXQgPSAwO1xuXG4gICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoZnJhbWVQcmVmaXgsIGZyYW1lU3RhcnQsIGZyYW1lRW5kLCBcIlwiLCAzKTtcblxuICAgIHNwcml0ZSA9IHRoaXMuYWN0aW9uUGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyB0aGlzLmFjdGlvblBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBcIlwiKTtcbiAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJhbmltYXRlXCIsIGZyYW1lTGlzdCwgMTAsIGZhbHNlKTtcbiAgICByZXR1cm4gc3ByaXRlO1xuICB9XG5cbiAgcGxheUFuaW1hdGlvbldpdGhPZmZzZXQoc3ByaXRlLCBhbmltYXRpb25OYW1lLCBhbmltYXRpb25GcmFtZVRvdGFsLCBzdGFydEZyYW1lKXtcbiAgICB2YXIgcmFuZCA9IE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSAqIGFuaW1hdGlvbkZyYW1lVG90YWwpICsgc3RhcnRGcmFtZTtcbiAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgYW5pbWF0aW9uTmFtZSkuc2V0RnJhbWUocmFuZCwgdHJ1ZSk7XG4gIH1cblxuICBwbGF5UmFuZG9tU2hlZXBBbmltYXRpb24oc3ByaXRlKSB7XG4gICAgdmFyIHJhbmQgPSBNYXRoLnRydW5jKE1hdGgucmFuZG9tKCkgKiAyMCArIDEpO1xuXG4gICAgc3dpdGNoKHJhbmQpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgIGNhc2UgMjpcbiAgICAgIGNhc2UgMzpcbiAgICAgIGNhc2UgNDpcbiAgICAgIGNhc2UgNTpcbiAgICAgIGNhc2UgNjpcbiAgICAgIC8vZWF0IGdyYXNzXG4gICAgICBzcHJpdGUucGxheShcImlkbGVcIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgIGNhc2UgODpcbiAgICAgIGNhc2UgOTpcbiAgICAgIGNhc2UgMTA6XG4gICAgICAvL2xvb2sgbGVmdFxuICAgICAgc3ByaXRlLnBsYXkoXCJsb29rTGVmdFwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxMTpcbiAgICAgIGNhc2UgMTI6XG4gICAgICBjYXNlIDEzOlxuICAgICAgY2FzZSAxNDpcbiAgICAgIC8vbG9vayByaWdodFxuICAgICAgc3ByaXRlLnBsYXkoXCJsb29rUmlnaHRcIik7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMTU6XG4gICAgICBjYXNlIDE2OlxuICAgICAgY2FzZSAxNzpcbiAgICAgIC8vY2FtXG4gICAgICBzcHJpdGUucGxheShcImxvb2tBdENhbVwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxODpcbiAgICAgIGNhc2UgMTk6XG4gICAgICAvL2tpY2tcbiAgICAgIHNwcml0ZS5wbGF5KFwia2lja1wiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyMDpcbiAgICAgIC8vaWRsZVBhdXNlXG4gICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH1cblxuICBwbGF5UmFuZG9tQ3JlZXBlckFuaW1hdGlvbihzcHJpdGUpIHtcbiAgICB2YXIgcmFuZCA9IE1hdGgudHJ1bmModGhpcy55VG9JbmRleChNYXRoLnJhbmRvbSgpKSArIDEpO1xuXG4gICAgc3dpdGNoKHJhbmQpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgIGNhc2UgMjpcbiAgICAgIGNhc2UgMzpcbiAgICAgIC8vbG9vayBsZWZ0XG4gICAgICBzcHJpdGUucGxheShcImxvb2tMZWZ0XCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICBjYXNlIDU6XG4gICAgICBjYXNlIDY6XG4gICAgICAvL2xvb2sgcmlnaHRcbiAgICAgIHNwcml0ZS5wbGF5KFwibG9va1JpZ2h0XCIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICBjYXNlIDg6XG4gICAgICAvL2xvb2sgYXQgY2FtXG4gICAgICBzcHJpdGUucGxheShcImxvb2tBdENhbVwiKTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgY2FzZSAxMDpcbiAgICAgIC8vc2h1ZmZsZSBmZWV0XG4gICAgICBzcHJpdGUucGxheShcImlkbGVcIik7XG4gICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQmxvY2socGxhbmUsIHgsIHksIGJsb2NrVHlwZSkge1xuICAgIHZhciBpLFxuICAgICAgICBzcHJpdGUgPSBudWxsLFxuICAgICAgICBmcmFtZUxpc3QsXG4gICAgICAgIGF0bGFzLFxuICAgICAgICBmcmFtZSxcbiAgICAgICAgeE9mZnNldCxcbiAgICAgICAgeU9mZnNldCxcbiAgICAgICAgc3RpbGxGcmFtZXM7XG5cbiAgICBzd2l0Y2ggKGJsb2NrVHlwZSkge1xuICAgICAgY2FzZSBcInRyZWVBY2FjaWFcIjpcbiAgICAgIGNhc2UgXCJ0cmVlQmlyY2hcIjpcbiAgICAgIGNhc2UgXCJ0cmVlSnVuZ2xlXCI6XG4gICAgICBjYXNlIFwidHJlZU9ha1wiOlxuICAgICAgY2FzZSBcInRyZWVTcHJ1Y2VcIjpcbiAgICAgICAgc3ByaXRlID0gdGhpcy5jcmVhdGVCbG9jayhwbGFuZSwgeCwgeSwgXCJsb2dcIiArIGJsb2NrVHlwZS5zdWJzdHJpbmcoNCkpO1xuICAgICAgICBzcHJpdGUuZmx1ZmYgPSB0aGlzLmNyZWF0ZUJsb2NrKHRoaXMuZmx1ZmZQbGFuZSwgeCwgeSwgXCJsZWF2ZXNcIiArIGJsb2NrVHlwZS5zdWJzdHJpbmcoNCkpO1xuXG4gICAgICAgIHNwcml0ZS5vbkJsb2NrRGVzdHJveSA9IChsb2dTcHJpdGUpID0+IHtcbiAgICAgICAgICBsb2dTcHJpdGUuZmx1ZmYuYW5pbWF0aW9ucy5hZGQoXCJkZXNwYXduXCIsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTGVhdmVzXCIsIDAsIDYsIFwiXCIsIDApLCAxMCwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudG9EZXN0cm95LnB1c2gobG9nU3ByaXRlLmZsdWZmKTtcbiAgICAgICAgICAgIGxvZ1Nwcml0ZS5mbHVmZi5raWxsKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChsb2dTcHJpdGUuZmx1ZmYuYW5pbWF0aW9ucywgXCJkZXNwYXduXCIpO1xuICAgICAgICB9O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInNoZWVwXCI6XG4gICAgICAgIGxldCBzRnJhbWVzID0gMTA7XG4gICAgICAgIC8vIEZhY2luZyBMZWZ0OiBFYXQgR3Jhc3M6IDE5OS0yMTZcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKC0yMiArIDQwICogeCwgLTEyICsgNDAgKiB5LCBcInNoZWVwXCIsIFwiU2hlZXBfMTk5XCIpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCAxOTksIDIxNSwgXCJcIiwgMCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzIxNVwiKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTG9vayBSaWdodFxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCAxODQsIDE4NiwgXCJcIiwgMCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzE4NlwiKTtcbiAgICAgICAgfVxuICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzE4OFwiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va1JpZ2h0XCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTG9vayBMZWZ0XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiU2hlZXBfXCIsIDE5MywgMTk1LCBcIlwiLCAwKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNGcmFtZXM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfMTk1XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiU2hlZXBfMTk3XCIpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJsb29rTGVmdFwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0tpY2tcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgMjE3LCAyMzMsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJraWNrXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vTG9vayBBdCBDYW1lcmFcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgNDg0LCA0ODUsIFwiXCIsIDApO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc0ZyYW1lczsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF80ODVcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJTaGVlcF80ODZcIik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImxvb2tBdENhbVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzIxNVwiKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlUGF1c2VcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlSYW5kb21TaGVlcEFuaW1hdGlvbihzcHJpdGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUT0RPKGJqb3JkYW4vZ2FhbGxlbikgLSB1cGRhdGUgb25jZSB1cGRhdGVkIFNoZWVwLmpzb25cbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJTaGVlcF9cIiwgNDkwLCA0OTEsIFwiXCIsIDApO1xuICAgICAgICBzdGlsbEZyYW1lcyA9IE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSAqIDMpICsgMztcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHN0aWxsRnJhbWVzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzQ5MVwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uQW5pbWF0aW9uU3RhcnQoc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiZmFjZVwiLCBmcmFtZUxpc3QsIDIsIHRydWUpLCAoKT0+e1xuICAgICAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucGxheShcInNoZWVwQmFhXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIlNoZWVwX1wiLCA0MzksIDQ1NSwgXCJcIiwgMCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIlNoZWVwXzQ1NVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcInVzZWRcIiwgZnJhbWVMaXN0LCAxNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheUFuaW1hdGlvbldpdGhPZmZzZXQoc3ByaXRlLFwiaWRsZVwiLDE3LCAxOTkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImNyZWVwZXJcIjpcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKC02ICsgNDAgKiB4LCAwICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgXCJjcmVlcGVyXCIsIFwiQ3JlZXBlcl8wNTNcIik7XG5cbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJDcmVlcGVyX1wiLCAzNywgNTEsIFwiXCIsIDMpO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJleHBsb2RlXCIsIGZyYW1lTGlzdCwgMTAsIGZhbHNlKTtcblxuICAgICAgICAvL0xvb2sgTGVmdFxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkNyZWVwZXJfXCIsIDQsIDcsIFwiXCIsIDMpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMDdcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAwOFwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAwOVwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAxMFwiKTtcbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzAxMVwiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va0xlZnRcIiwgZnJhbWVMaXN0LCAxNSwgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICBzcHJpdGUucGxheShcImlkbGVQYXVzZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9Mb29rIFJpZ2h0XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQ3JlZXBlcl9cIiwgMTYsIDE5LCBcIlwiLCAzKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDE1OyArK2kpIHtcbiAgICAgICAgICBmcmFtZUxpc3QucHVzaChcIkNyZWVwZXJfMDE5XCIpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMjBcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMjFcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMjJcIik7XG4gICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMjNcIik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImxvb2tSaWdodFwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL0xvb2sgQXQgQ2FtXG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiQ3JlZXBlcl9cIiwgMjQ0LCAyNDUsIFwiXCIsIDMpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8yNDVcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJDcmVlcGVyXzI0NlwiKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwibG9va0F0Q2FtXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgc3ByaXRlLnBsYXkoXCJpZGxlUGF1c2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZyYW1lTGlzdCA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTU7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMDRcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVBhdXNlXCIsIGZyYW1lTGlzdCwgMTUsIGZhbHNlKS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbGF5UmFuZG9tQ3JlZXBlckFuaW1hdGlvbihzcHJpdGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkNyZWVwZXJfXCIsIDUzLCA1OSwgXCJcIiwgMyk7XG4gICAgICAgIHN0aWxsRnJhbWVzID0gTWF0aC50cnVuYyh0aGlzLnlUb0luZGV4KE1hdGgucmFuZG9tKCkpKSArIDIwO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3RpbGxGcmFtZXM7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiQ3JlZXBlcl8wMDRcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHNwcml0ZS5wbGF5KFwiaWRsZVBhdXNlXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wbGF5QW5pbWF0aW9uV2l0aE9mZnNldChzcHJpdGUsIFwiaWRsZVwiLCA4LCA1Mik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiY3JvcFdoZWF0XCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJXaGVhdFwiLCAwLCAyLCBcIlwiLCAwKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDAuNCwgZmFsc2UpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInRvcmNoXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJUb3JjaFwiLCAwLCAyMywgXCJcIiwgMCk7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCAxNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwid2F0ZXJcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIldhdGVyX1wiLCAwLCA1LCBcIlwiLCAwKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy9mb3IgcGxhY2luZyB3ZXRsYW5kIGZvciBjcm9wcyBpbiBmcmVlIHBsYXlcbiAgICAgIGNhc2UgXCJ3YXRlcmluZ1wiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIHNwcml0ZS5raWxsKCk7XG4gICAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goc3ByaXRlKTtcbiAgICAgICAgdGhpcy5jcmVhdGVCbG9jayh0aGlzLmdyb3VuZFBsYW5lLCB4LCB5LCBcImZhcm1sYW5kV2V0XCIpO1xuICAgICAgICB0aGlzLnJlZnJlc2hHcm91bmRQbGFuZSgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImxhdmFcIjpcbiAgICAgICAgYXRsYXMgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzBdO1xuICAgICAgICBmcmFtZSA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMV07XG4gICAgICAgIHhPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzJdO1xuICAgICAgICB5T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVszXTtcbiAgICAgICAgc3ByaXRlID0gcGxhbmUuY3JlYXRlKHhPZmZzZXQgKyA0MCAqIHgsIHlPZmZzZXQgKyBwbGFuZS55T2Zmc2V0ICsgNDAgKiB5LCBhdGxhcywgZnJhbWUpO1xuICAgICAgICBmcmFtZUxpc3QgPSBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkxhdmFfXCIsIDAsIDUsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJpZGxlXCIsIGZyYW1lTGlzdCwgNSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheVNjYWxlZFNwZWVkKHNwcml0ZS5hbmltYXRpb25zLCBcImlkbGVcIik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwibGF2YVBvcFwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiTGF2YVBvcFwiLCAxLCA3LCBcIlwiLCAyKTtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJMYXZhUG9wMDdcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkxhdmFQb3BcIiwgOCwgMTMsIFwiXCIsIDIpKTtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgMzsgKytpKSB7XG4gICAgICAgICAgZnJhbWVMaXN0LnB1c2goXCJMYXZhUG9wMTNcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcyhcIkxhdmFQb3BcIiwgMTQsIDMwLCBcIlwiLCAyKSk7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IDg7ICsraSkge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiTGF2YVBvcDAxXCIpO1xuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCA1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5QW5pbWF0aW9uV2l0aE9mZnNldChzcHJpdGUsIFwiaWRsZVwiLCAyOSwgMSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiZmlyZVwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiRmlyZVwiLCAwLCAxNCwgXCJcIiwgMik7XG4gICAgICAgIHNwcml0ZS5hbmltYXRpb25zLmFkZChcImlkbGVcIiwgZnJhbWVMaXN0LCA1LCB0cnVlKTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJidWJibGVzXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcbiAgICAgICAgZnJhbWVMaXN0ID0gUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoXCJCdWJibGVzXCIsIDAsIDE0LCBcIlwiLCAyKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDUsIHRydWUpO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJpZGxlXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImV4cGxvc2lvblwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiRXhwbG9zaW9uXCIsIDAsIDE2LCBcIlwiLCAxKTtcbiAgICAgICAgc3ByaXRlLmFuaW1hdGlvbnMuYWRkKFwiaWRsZVwiLCBmcmFtZUxpc3QsIDE1LCBmYWxzZSkub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudG9EZXN0cm95LnB1c2goc3ByaXRlKTtcbiAgICAgICAgICBzcHJpdGUua2lsbCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wbGF5U2NhbGVkU3BlZWQoc3ByaXRlLmFuaW1hdGlvbnMsIFwiaWRsZVwiKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJkb29yXCI6XG4gICAgICAgIGF0bGFzID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVswXTtcbiAgICAgICAgZnJhbWUgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzFdO1xuICAgICAgICB4T2Zmc2V0ID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsyXTtcbiAgICAgICAgeU9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bM107XG4gICAgICAgIHNwcml0ZSA9IHBsYW5lLmNyZWF0ZSh4T2Zmc2V0ICsgNDAgKiB4LCB5T2Zmc2V0ICsgcGxhbmUueU9mZnNldCArIDQwICogeSwgYXRsYXMsIGZyYW1lKTtcblxuICAgICAgICBmcmFtZUxpc3QgPSBbXTtcbiAgICAgICAgbGV0IGFuaW1hdGlvbkZyYW1lcyA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiRG9vclwiLCAwLCAzLCBcIlwiLCAxKTtcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IDU7ICsrailcbiAgICAgICAge1xuICAgICAgICAgIGZyYW1lTGlzdC5wdXNoKFwiRG9vcjBcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWVMaXN0ID0gZnJhbWVMaXN0LmNvbmNhdChhbmltYXRpb25GcmFtZXMpO1xuXG4gICAgICAgIHZhciBhbmltYXRpb24gPSBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJvcGVuXCIsIGZyYW1lTGlzdCwgNSwgZmFsc2UpO1xuICAgICAgICBhbmltYXRpb24uZW5hYmxlVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgLy9wbGF5IHdoZW4gdGhlIGRvb3Igc3RhcnRzIG9wZW5pbmdcbiAgICAgICAgYW5pbWF0aW9uLm9uVXBkYXRlLmFkZCgoKSA9PiB7XG4gICAgICAgICAgaWYoYW5pbWF0aW9uLmZyYW1lID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvUGxheWVyLnBsYXkoXCJkb29yT3BlblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBsYXlTY2FsZWRTcGVlZChzcHJpdGUuYW5pbWF0aW9ucywgXCJvcGVuXCIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInRudFwiOlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGZyYW1lTGlzdCA9IFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKFwiVE5UZXhwbG9zaW9uXCIsIDAsIDgsIFwiXCIsIDApO1xuICAgICAgICBzcHJpdGUuYW5pbWF0aW9ucy5hZGQoXCJleHBsb2RlXCIsIGZyYW1lTGlzdCwgNywgZmFsc2UpLm9uQ29tcGxldGUuYWRkKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsYXlFeHBsb3Npb25DbG91ZEFuaW1hdGlvbihbeCx5XSk7XG4gICAgICAgICAgc3ByaXRlLmtpbGwoKTtcbiAgICAgICAgICB0aGlzLnRvRGVzdHJveS5wdXNoKHNwcml0ZSk7XG4gICAgICAgICAgdGhpcy5hY3Rpb25QbGFuZUJsb2Nrc1t0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChbeCx5XSldID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhdGxhcyA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMF07XG4gICAgICAgIGZyYW1lID0gdGhpcy5ibG9ja3NbYmxvY2tUeXBlXVsxXTtcbiAgICAgICAgeE9mZnNldCA9IHRoaXMuYmxvY2tzW2Jsb2NrVHlwZV1bMl07XG4gICAgICAgIHlPZmZzZXQgPSB0aGlzLmJsb2Nrc1tibG9ja1R5cGVdWzNdO1xuICAgICAgICBzcHJpdGUgPSBwbGFuZS5jcmVhdGUoeE9mZnNldCArIDQwICogeCwgeU9mZnNldCArIHBsYW5lLnlPZmZzZXQgKyA0MCAqIHksIGF0bGFzLCBmcmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBzcHJpdGU7XG4gIH1cblxuICBvbkFuaW1hdGlvbkVuZChhbmltYXRpb24sIGNvbXBsZXRpb25IYW5kbGVyKSB7XG4gICAgdmFyIHNpZ25hbEJpbmRpbmcgPSBhbmltYXRpb24ub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xuICAgICAgc2lnbmFsQmluZGluZy5kZXRhY2goKTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBvbkFuaW1hdGlvblN0YXJ0KGFuaW1hdGlvbiwgY29tcGxldGlvbkhhbmRsZXIpIHtcbiAgICB2YXIgc2lnbmFsQmluZGluZyA9IGFuaW1hdGlvbi5vblN0YXJ0LmFkZCgoKSA9PiB7XG4gICAgICBzaWduYWxCaW5kaW5nLmRldGFjaCgpO1xuICAgICAgY29tcGxldGlvbkhhbmRsZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uQW5pbWF0aW9uTG9vcE9uY2UoYW5pbWF0aW9uLCBjb21wbGV0aW9uSGFuZGxlcikge1xuICAgIHZhciBzaWduYWxCaW5kaW5nID0gYW5pbWF0aW9uLm9uTG9vcC5hZGQoKCkgPT4ge1xuICAgICAgc2lnbmFsQmluZGluZy5kZXRhY2goKTtcbiAgICAgIGNvbXBsZXRpb25IYW5kbGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBhZGRSZXNldHRhYmxlVHdlZW4oc3ByaXRlKSB7XG4gICAgdmFyIHR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2VlbihzcHJpdGUpO1xuICAgIHRoaXMucmVzZXR0YWJsZVR3ZWVucy5wdXNoKHR3ZWVuKTtcbiAgICByZXR1cm4gdHdlZW47XG4gIH1cblxufVxuIiwiaW1wb3J0IExldmVsQmxvY2sgZnJvbSBcIi4vTGV2ZWxCbG9jay5qc1wiO1xuaW1wb3J0IEZhY2luZ0RpcmVjdGlvbiBmcm9tIFwiLi9GYWNpbmdEaXJlY3Rpb24uanNcIjtcblxuLy8gZm9yIGJsb2NrcyBvbiB0aGUgYWN0aW9uIHBsYW5lLCB3ZSBuZWVkIGFuIGFjdHVhbCBcImJsb2NrXCIgb2JqZWN0LCBzbyB3ZSBjYW4gbW9kZWxcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGV2ZWxNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKGxldmVsRGF0YSkge1xuICAgIHRoaXMucGxhbmVXaWR0aCA9IGxldmVsRGF0YS5ncmlkRGltZW5zaW9ucyA/XG4gICAgICAgIGxldmVsRGF0YS5ncmlkRGltZW5zaW9uc1swXSA6IDEwO1xuICAgIHRoaXMucGxhbmVIZWlnaHQgPSBsZXZlbERhdGEuZ3JpZERpbWVuc2lvbnMgP1xuICAgICAgICBsZXZlbERhdGEuZ3JpZERpbWVuc2lvbnNbMV0gOiAxMDtcblxuICAgIHRoaXMucGxheWVyID0ge307XG5cbiAgICB0aGlzLnJhaWxNYXAgPSBcbiAgICAgIFtcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJyYWlsc1VucG93ZXJlZFZlcnRpY2FsXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcInJhaWxzVW5wb3dlcmVkVmVydGljYWxcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwicmFpbHNVbnBvd2VyZWRWZXJ0aWNhbFwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJyYWlsc1VucG93ZXJlZFZlcnRpY2FsXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXG4gICAgICBcIlwiLFwiXCIsXCJcIixcInJhaWxzQm90dG9tTGVmdFwiLFwicmFpbHNIb3Jpem9udGFsXCIsXCJyYWlsc0hvcml6b250YWxcIixcInJhaWxzSG9yaXpvbnRhbFwiLFwicmFpbHNIb3Jpem9udGFsXCIsXCJyYWlsc0hvcml6b250YWxcIixcInJhaWxzSG9yaXpvbnRhbFwiLFxuICAgICAgXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcbiAgICAgIFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCIsXCJcIixcIlwiLFwiXCJdO1xuXG4gICAgdGhpcy5pbml0aWFsTGV2ZWxEYXRhID0gT2JqZWN0LmNyZWF0ZShsZXZlbERhdGEpO1xuXG4gICAgdGhpcy5yZXNldCgpO1xuXG4gICAgdGhpcy5pbml0aWFsUGxheWVyU3RhdGUgPSBPYmplY3QuY3JlYXRlKHRoaXMucGxheWVyKTtcbiAgfVxuXG4gIHBsYW5lQXJlYSgpIHtcbiAgICByZXR1cm4gdGhpcy5wbGFuZVdpZHRoICogdGhpcy5wbGFuZUhlaWdodDtcbiAgfVxuXG4gIGluQm91bmRzKHgsIHkpIHtcbiAgICByZXR1cm4geCA+PSAwICYmIHggPCB0aGlzLnBsYW5lV2lkdGggJiYgeSA+PSAwICYmIHkgPCB0aGlzLnBsYW5lSGVpZ2h0O1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5ncm91bmRQbGFuZSA9IHRoaXMuY29uc3RydWN0UGxhbmUodGhpcy5pbml0aWFsTGV2ZWxEYXRhLmdyb3VuZFBsYW5lLCBmYWxzZSk7XG4gICAgdGhpcy5ncm91bmREZWNvcmF0aW9uUGxhbmUgPSB0aGlzLmNvbnN0cnVjdFBsYW5lKHRoaXMuaW5pdGlhbExldmVsRGF0YS5ncm91bmREZWNvcmF0aW9uUGxhbmUsIGZhbHNlKTtcbiAgICB0aGlzLnNoYWRpbmdQbGFuZSA9IFtdO1xuICAgIHRoaXMuYWN0aW9uUGxhbmUgPSB0aGlzLmNvbnN0cnVjdFBsYW5lKHRoaXMuaW5pdGlhbExldmVsRGF0YS5hY3Rpb25QbGFuZSwgdHJ1ZSk7XG4gICAgdGhpcy5mbHVmZlBsYW5lID0gdGhpcy5jb25zdHJ1Y3RQbGFuZSh0aGlzLmluaXRpYWxMZXZlbERhdGEuZmx1ZmZQbGFuZSwgZmFsc2UpO1xuICAgIHRoaXMuZm93UGxhbmUgPSBbXTtcbiAgICB0aGlzLmlzRGF5dGltZSA9IHRoaXMuaW5pdGlhbExldmVsRGF0YS5pc0RheXRpbWUgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmluaXRpYWxMZXZlbERhdGEuaXNEYXl0aW1lO1xuXG4gICAgbGV0IGxldmVsRGF0YSA9IE9iamVjdC5jcmVhdGUodGhpcy5pbml0aWFsTGV2ZWxEYXRhKTtcbiAgICBsZXQgW3gsIHldID0gW2xldmVsRGF0YS5wbGF5ZXJTdGFydFBvc2l0aW9uWzBdLCBsZXZlbERhdGEucGxheWVyU3RhcnRQb3NpdGlvblsxXV07XG5cbiAgICB0aGlzLnBsYXllci5uYW1lID0gdGhpcy5pbml0aWFsTGV2ZWxEYXRhLnBsYXllck5hbWUgfHwgXCJTdGV2ZVwiO1xuICAgIHRoaXMucGxheWVyLnBvc2l0aW9uID0gbGV2ZWxEYXRhLnBsYXllclN0YXJ0UG9zaXRpb247XG4gICAgdGhpcy5wbGF5ZXIuaXNPbkJsb2NrID0gIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHhdLmdldElzRW1wdHlPckVudGl0eSgpO1xuICAgIHRoaXMucGxheWVyLmZhY2luZyA9IGxldmVsRGF0YS5wbGF5ZXJTdGFydERpcmVjdGlvbjtcblxuICAgIHRoaXMucGxheWVyLmludmVudG9yeSA9IHt9O1xuXG4gICAgdGhpcy5jb21wdXRlU2hhZGluZ1BsYW5lKCk7XG4gICAgdGhpcy5jb21wdXRlRm93UGxhbmUoKTtcbiAgfVxuXG4gIHlUb0luZGV4KHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMucGxhbmVXaWR0aDtcbiAgfVxuXG4gIGNvbnN0cnVjdFBsYW5lKHBsYW5lRGF0YSwgaXNBY3Rpb25QbGFuZSkge1xuICAgIHZhciBpbmRleCxcbiAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgIGJsb2NrO1xuXG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgcGxhbmVEYXRhLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgYmxvY2sgPSBuZXcgTGV2ZWxCbG9jayhwbGFuZURhdGFbaW5kZXhdKTtcbiAgICAgIC8vIFRPRE8oYmpvcmRhbik6IHB1dCB0aGlzIHRydXRoIGluIGNvbnN0cnVjdG9yIGxpa2Ugb3RoZXIgYXR0cnNcbiAgICAgIGJsb2NrLmlzV2Fsa2FibGUgPSBibG9jay5pc1dhbGthYmxlIHx8ICFpc0FjdGlvblBsYW5lO1xuICAgICAgcmVzdWx0LnB1c2goYmxvY2spO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpc1NvbHZlZCgpICB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsTGV2ZWxEYXRhLnZlcmlmaWNhdGlvbkZ1bmN0aW9uKHRoaXMpO1xuICB9XG5cbiAgZ2V0SG91c2VCb3R0b21SaWdodCgpICB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsTGV2ZWxEYXRhLmhvdXNlQm90dG9tUmlnaHQ7XG4gIH1cblxuICAgIC8vIFZlcmlmaWNhdGlvbnNcbiAgaXNQbGF5ZXJOZXh0VG8oYmxvY2tUeXBlKSB7XG4gICAgdmFyIHBvc2l0aW9uO1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcblxuICAgIC8vIGFib3ZlXG4gICAgcG9zaXRpb24gPSBbdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0sIHRoaXMucGxheWVyLnBvc2l0aW9uWzFdIC0gMV07XG4gICAgaWYgKHRoaXMuaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gYmVsb3dcbiAgICBwb3NpdGlvbiA9IFt0aGlzLnBsYXllci5wb3NpdGlvblswXSwgdGhpcy5wbGF5ZXIucG9zaXRpb25bMV0gKyAxXTtcbiAgICBpZiAodGhpcy5pc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBsZWZ0XG4gICAgcG9zaXRpb24gPSBbdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0gKyAxLCB0aGlzLnBsYXllci5wb3NpdGlvblsxXV07XG4gICAgaWYgKHRoaXMuaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmlnaHRcbiAgICBwb3NpdGlvbiA9IFt0aGlzLnBsYXllci5wb3NpdGlvblswXSAtIDEsIHRoaXMucGxheWVyLnBvc2l0aW9uWzFdXTtcbiAgICBpZiAodGhpcy5pc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXRJbnZlbnRvcnlBbW91bnQoaW52ZW50b3J5VHlwZSkge1xuICAgIHJldHVybiB0aGlzLnBsYXllci5pbnZlbnRvcnlbaW52ZW50b3J5VHlwZV0gfHwgMDtcbiAgfVxuXG5cbiAgZ2V0SW52ZW50b3J5VHlwZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGxheWVyLmludmVudG9yeSk7XG4gIH1cblxuICBjb3VudE9mVHlwZU9uTWFwKGJsb2NrVHlwZSkge1xuICAgIHZhciBjb3VudCA9IDAsXG4gICAgICAgIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5wbGFuZUFyZWEoKTsgKytpKSB7XG4gICAgICBpZiAoYmxvY2tUeXBlID09IHRoaXMuYWN0aW9uUGxhbmVbaV0uYmxvY2tUeXBlKSB7XG4gICAgICAgICsrY291bnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb3VudDtcbiAgfVxuXG4gIGlzUGxheWVyQXQocG9zaXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnBsYXllci5wb3NpdGlvblswXSA9PT0gcG9zaXRpb25bMF0gJiZcbiAgICAgICAgICB0aGlzLnBsYXllci5wb3NpdGlvblsxXSA9PT0gcG9zaXRpb25bMV07XG4gIH1cblxuICBzb2x1dGlvbk1hcE1hdGNoZXNSZXN1bHRNYXAoc29sdXRpb25NYXApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxhbmVBcmVhKCk7IGkrKykge1xuICAgICAgdmFyIHNvbHV0aW9uSXRlbVR5cGUgPSBzb2x1dGlvbk1hcFtpXTtcblxuICAgICAgLy8gXCJcIiBvbiB0aGUgc29sdXRpb24gbWFwIG1lYW5zIHdlIGRvbnQgY2FyZSB3aGF0J3MgYXQgdGhhdCBzcG90XG4gICAgICBpZiAoc29sdXRpb25JdGVtVHlwZSAhPT0gXCJcIikge1xuICAgICAgICBpZiAoc29sdXRpb25JdGVtVHlwZSA9PT0gXCJlbXB0eVwiKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmFjdGlvblBsYW5lW2ldLmlzRW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc29sdXRpb25JdGVtVHlwZSA9PT0gXCJhbnlcIikge1xuICAgICAgICAgIGlmICh0aGlzLmFjdGlvblBsYW5lW2ldLmlzRW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aW9uUGxhbmVbaV0uYmxvY2tUeXBlICE9PSBzb2x1dGlvbkl0ZW1UeXBlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZ2V0VG50KCkge1xuICAgIHZhciB0bnQgPSBbXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgIGZvcih2YXIgeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoW3gseV0pO1xuICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2luZGV4XTtcbiAgICAgICAgaWYoYmxvY2suYmxvY2tUeXBlID09PSBcInRudFwiKSB7XG4gICAgICAgICAgdG50LnB1c2goW3gseV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0bnQ7XG4gIH1cblxuICBnZXRVbnBvd2VyZWRSYWlscygpIHtcbiAgICB2YXIgdW5wb3dlcmVkUmFpbHMgPSBbXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgIGZvcih2YXIgeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoW3gseV0pO1xuICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2luZGV4XTtcbiAgICAgICAgaWYoYmxvY2suYmxvY2tUeXBlLnN1YnN0cmluZygwLDcpID09IFwicmFpbHNVblwiKSB7XG4gICAgICAgICAgdW5wb3dlcmVkUmFpbHMucHVzaChbeCx5XSwgXCJyYWlsc1Bvd2VyZWRcIiArIHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmJsb2NrVHlwZS5zdWJzdHJpbmcoMTQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bnBvd2VyZWRSYWlscztcbiAgfVxuXG4gIGdldE1vdmVGb3J3YXJkUG9zaXRpb24oKSB7XG4gICAgdmFyIGN4ID0gdGhpcy5wbGF5ZXIucG9zaXRpb25bMF0sXG4gICAgICAgIGN5ID0gdGhpcy5wbGF5ZXIucG9zaXRpb25bMV07XG5cbiAgICBzd2l0Y2ggKHRoaXMucGxheWVyLmZhY2luZykge1xuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uVXA6XG4gICAgICAgIC0tY3k7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5Eb3duOlxuICAgICAgICArK2N5O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uTGVmdDpcbiAgICAgICAgLS1jeDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0OlxuICAgICAgICArK2N4O1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gW2N4LCBjeV07ICAgIFxuICB9XG5cbiAgaXNGb3J3YXJkQmxvY2tPZlR5cGUoYmxvY2tUeXBlKSB7XG4gICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG5cbiAgICBsZXQgYWN0aW9uSXNFbXB0eSA9IHRoaXMuaXNCbG9ja09mVHlwZU9uUGxhbmUoYmxvY2tGb3J3YXJkUG9zaXRpb24sIFwiZW1wdHlcIiwgdGhpcy5hY3Rpb25QbGFuZSk7XG5cbiAgICBpZiAoYmxvY2tUeXBlID09PSAnJyAmJiBhY3Rpb25Jc0VtcHR5KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uSXNFbXB0eSA/XG4gICAgICAgIHRoaXMuaXNCbG9ja09mVHlwZU9uUGxhbmUoYmxvY2tGb3J3YXJkUG9zaXRpb24sIGJsb2NrVHlwZSwgdGhpcy5ncm91bmRQbGFuZSkgOlxuICAgICAgICB0aGlzLmlzQmxvY2tPZlR5cGVPblBsYW5lKGJsb2NrRm9yd2FyZFBvc2l0aW9uLCBibG9ja1R5cGUsIHRoaXMuYWN0aW9uUGxhbmUpO1xuICB9XG5cbiAgaXNCbG9ja09mVHlwZShwb3NpdGlvbiwgYmxvY2tUeXBlKSAge1xuICAgICAgcmV0dXJuIHRoaXMuaXNCbG9ja09mVHlwZU9uUGxhbmUocG9zaXRpb24sIGJsb2NrVHlwZSwgdGhpcy5hY3Rpb25QbGFuZSk7XG4gIH1cblxuICBpc0Jsb2NrT2ZUeXBlT25QbGFuZShwb3NpdGlvbiwgYmxvY2tUeXBlLCBwbGFuZSkgIHtcbiAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIHBvc2l0aW9uWzBdO1xuICAgICAgaWYgKGJsb2NrSW5kZXggPj0gMCAmJiBibG9ja0luZGV4IDwgdGhpcy5wbGFuZUFyZWEoKSkge1xuXG4gICAgICAgICAgaWYgKGJsb2NrVHlwZSA9PSBcImVtcHR5XCIpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gIHBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1wdHk7XG4gICAgICAgICAgfSBlbHNlIGlmIChibG9ja1R5cGUgPT0gXCJ0cmVlXCIpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gcGxhbmVbYmxvY2tJbmRleF0uZ2V0SXNUcmVlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gKGJsb2NrVHlwZSA9PSBwbGFuZVtibG9ja0luZGV4XS5ibG9ja1R5cGUpO1xuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlzUGxheWVyU3RhbmRpbmdJbldhdGVyKCl7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHRoaXMucGxheWVyLnBvc2l0aW9uWzFdKSArIHRoaXMucGxheWVyLnBvc2l0aW9uWzBdO1xuICAgIHJldHVybiB0aGlzLmdyb3VuZFBsYW5lW2Jsb2NrSW5kZXhdLmJsb2NrVHlwZSA9PT0gXCJ3YXRlclwiO1xuICB9XG5cbiAgaXNQbGF5ZXJTdGFuZGluZ0luTGF2YSgpIHtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgodGhpcy5wbGF5ZXIucG9zaXRpb25bMV0pICsgdGhpcy5wbGF5ZXIucG9zaXRpb25bMF07XG4gICAgcmV0dXJuIHRoaXMuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlID09PSBcImxhdmFcIjtcbiAgfVxuXG4gIGNvb3JkaW5hdGVzVG9JbmRleChjb29yZGluYXRlcyl7XG4gICAgcmV0dXJuIHRoaXMueVRvSW5kZXgoY29vcmRpbmF0ZXNbMV0pICsgY29vcmRpbmF0ZXNbMF07XG4gIH1cblxuICBjaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwb3NpdGlvbiwgb2JqZWN0QXJyYXkpe1xuICAgIGlmICgoIWJsb2NrVHlwZSAmJiAodGhpcy5hY3Rpb25QbGFuZVt0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChwb3NpdGlvbildLmJsb2NrVHlwZSAhPT0gXCJcIikpfHwgdGhpcy5pc0Jsb2NrT2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpKSB7XG4gICAgICBvYmplY3RBcnJheS5wdXNoKFt0cnVlLCBwb3NpdGlvbl0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICBvYmplY3RBcnJheS5wdXNoKFtmYWxzZSwgbnVsbF0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhvdXNlR3JvdW5kVG9GbG9vckhlbHBlcihwb3NpdGlvbiwgd29vbFR5cGUsIGFycmF5Q2hlY2spXG4gIHtcbiAgICB2YXIgY2hlY2tBY3Rpb25CbG9jayxcbiAgICAgICAgY2hlY2tHcm91bmRCbG9jayxcbiAgICAgICAgcG9zQWJvdmUsIFxuICAgICAgICBwb3NCZWxvdyxcbiAgICAgICAgcG9zUmlnaHQsXG4gICAgICAgIHBvc0xlZnQsXG4gICAgICAgIGNoZWNrSW5kZXggPSAwLFxuICAgICAgICBhcnJheSA9IGFycmF5Q2hlY2s7XG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMueVRvSW5kZXgocG9zaXRpb25bMl0pICsgcG9zaXRpb25bMV07XG5cbiAgICAgICAgaWYoaW5kZXggPT09IDQ0KVxuICAgICAgICB7XG4gICAgICAgICAgaW5kZXggPSA0NDtcbiAgICAgICAgfVxuXG4gICAgcG9zQWJvdmUgPSAgWzAsIHBvc2l0aW9uWzFdLCBwb3NpdGlvblsyXSArIDFdO1xuICAgIHBvc0Fib3ZlWzBdID0gdGhpcy55VG9JbmRleChwb3NBYm92ZVsyXSkgKyBwb3NBYm92ZVsxXTtcblxuICAgIHBvc0JlbG93ID0gIFswLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0gLSAxXTtcbiAgICBwb3NCZWxvd1swXSA9IHRoaXMueVRvSW5kZXgocG9zQmVsb3dbMl0pICsgcG9zQmVsb3dbMV07XG5cbiAgICBwb3NSaWdodCA9ICBbMCwgcG9zaXRpb25bMV0gKyAxLCBwb3NpdGlvblsyXV07XG4gICAgcG9zUmlnaHRbMF0gPSB0aGlzLnlUb0luZGV4KHBvc1JpZ2h0WzJdKSArIHBvc1JpZ2h0WzFdO1xuICAgIFxuICAgIHBvc0xlZnQgPSAgWzAsIHBvc2l0aW9uWzFdIC0gMSwgcG9zaXRpb25bMl1dO1xuICAgIHBvc1JpZ2h0WzBdID0gdGhpcy55VG9JbmRleChwb3NSaWdodFsyXSkgKyBwb3NSaWdodFsxXTtcblxuICAgIGNoZWNrQWN0aW9uQmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2luZGV4XTtcbiAgICBjaGVja0dyb3VuZEJsb2NrID0gdGhpcy5ncm91bmRQbGFuZVtpbmRleF07XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKSB7XG4gICAgICBpZihhcnJheVtpXVswXSA9PT0gaW5kZXgpIHtcbiAgICAgICAgY2hlY2tJbmRleCA9IC0xO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihjaGVja0FjdGlvbkJsb2NrLmJsb2NrVHlwZSAhPT0gXCJcIikge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBlbHNlIGlmKGFycmF5Lmxlbmd0aCA+IDAgJiYgY2hlY2tJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBhcnJheS5wdXNoKHBvc2l0aW9uKTtcbiAgICBhcnJheS5jb25jYXQodGhpcy5ob3VzZUdyb3VuZFRvRmxvb3JIZWxwZXIocG9zQWJvdmUsIHdvb2xUeXBlLCBhcnJheSkpO1xuICAgIGFycmF5LmNvbmNhdCh0aGlzLmhvdXNlR3JvdW5kVG9GbG9vckhlbHBlcihwb3NCZWxvdywgd29vbFR5cGUsIGFycmF5KSk7XG4gICAgYXJyYXkuY29uY2F0KHRoaXMuaG91c2VHcm91bmRUb0Zsb29ySGVscGVyKHBvc1JpZ2h0LCB3b29sVHlwZSwgYXJyYXkpKTtcbiAgICBhcnJheS5jb25jYXQodGhpcy5ob3VzZUdyb3VuZFRvRmxvb3JIZWxwZXIocG9zTGVmdCwgd29vbFR5cGUsIGFycmF5KSk7XG5cbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICBob3VzZUdyb3VuZFRvRmxvb3JCbG9ja3Moc3RhcnRpbmdQb3NpdGlvbikge1xuICAgIC8vY2hlY2tDYXJkaW5hbERpcmVjdGlvbnMgZm9yIGFjdGlvbmJsb2Nrcy5cbiAgICAvL0lmIG5vIGFjdGlvbiBibG9jayBhbmQgc3F1YXJlIGlzbid0IHRoZSB0eXBlIHdlIHdhbnQuXG4gICAgLy9DaGFuZ2UgaXQuXG4gICAgdmFyIHdvb2xUeXBlID0gXCJ3b29sX29yYW5nZVwiO1xuXG4gICAgLy9QbGFjZSB0aGlzIGJsb2NrIGhlcmVcbiAgICAvL3RoaXMuY3JlYXRlQmxvY2sodGhpcy5ncm91bmRQbGFuZSwgc3RhcnRpbmdQb3NpdGlvblswXSwgc3RhcnRpbmdQb3NpdGlvblsxXSwgd29vbFR5cGUpO1xuICAgIHZhciBoZWxwZXJTdGFydERhdGEgPSBbMCwgc3RhcnRpbmdQb3NpdGlvblswXSwgc3RhcnRpbmdQb3NpdGlvblsxXV07XG4gICAgcmV0dXJuIHRoaXMuaG91c2VHcm91bmRUb0Zsb29ySGVscGVyKGhlbHBlclN0YXJ0RGF0YSwgd29vbFR5cGUsIFtdKTtcbiAgfVxuXG4gIGdldEFsbEJvcmRlcmluZ1Bvc2l0aW9uTm90T2ZUeXBlKHBvc2l0aW9uLCBibG9ja1R5cGUpIHtcbiAgICB2YXIgc3Vycm91bmRpbmdCbG9ja3MgPSB0aGlzLmdldEFsbEJvcmRlcmluZ1Bvc2l0aW9uKHBvc2l0aW9uLCBudWxsKTtcbiAgICBmb3IodmFyIGIgPSAxOyBiIDwgc3Vycm91bmRpbmdCbG9ja3MubGVuZ3RoOyArK2IpIHtcbiAgICAgIGlmKHN1cnJvdW5kaW5nQmxvY2tzW2JdWzBdICYmIHRoaXMuYWN0aW9uUGxhbmVbdGhpcy5jb29yZGluYXRlc1RvSW5kZXgoc3Vycm91bmRpbmdCbG9ja3NbYl1bMV0pXS5ibG9ja1R5cGUgPT0gYmxvY2tUeXBlKSB7XG4gICAgICAgIHN1cnJvdW5kaW5nQmxvY2tzW2JdWzBdID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdXJyb3VuZGluZ0Jsb2NrcztcbiAgfVxuXG4gIGdldEFsbEJvcmRlcmluZ1Bvc2l0aW9uKHBvc2l0aW9uLCBibG9ja1R5cGUpIHtcbiAgICB2YXIgcDtcbiAgICB2YXIgYWxsRm91bmRPYmplY3RzID0gW2ZhbHNlXTtcbiAgICAvL0NoZWNrIGFsbCA4IGRpcmVjdGlvbnNcblxuICAgIC8vVG9wIFJpZ2h0XG4gICAgcCA9IFtwb3NpdGlvblswXSArIDEsIHBvc2l0aW9uWzFdICsgMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL1RvcCBMZWZ0XG4gICAgcCA9IFtwb3NpdGlvblswXSAtIDEsIHBvc2l0aW9uWzFdICsgMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL0JvdCBSaWdodFxuICAgIHAgPSBbcG9zaXRpb25bMF0gKyAxLCBwb3NpdGlvblsxXSAtIDFdO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG4gICAgLy9Cb3QgTGVmdFxuICAgIHAgPSBbcG9zaXRpb25bMF0gLSAxLCBwb3NpdGlvblsxXSAtIDFdO1xuICAgIGlmKHRoaXMuY2hlY2tQb3NpdGlvbkZvclR5cGVBbmRQdXNoKGJsb2NrVHlwZSwgcCwgYWxsRm91bmRPYmplY3RzKSkge1xuICAgICAgYWxsRm91bmRPYmplY3RzWzBdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvL0NoZWNrIGNhcmRpbmFsIERpcmVjdGlvbnNcbiAgICAvL1RvcFxuICAgIHAgPSBbcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdICsgMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL0JvdFxuICAgIHAgPSBbcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdIC0gMV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cbiAgICAvL1JpZ2h0XG4gICAgcCA9IFtwb3NpdGlvblswXSArIDEsIHBvc2l0aW9uWzFdXTtcbiAgICBpZih0aGlzLmNoZWNrUG9zaXRpb25Gb3JUeXBlQW5kUHVzaChibG9ja1R5cGUsIHAsIGFsbEZvdW5kT2JqZWN0cykpIHtcbiAgICAgIGFsbEZvdW5kT2JqZWN0c1swXSA9IHRydWU7XG4gICAgfVxuICAgIC8vTGVmdFxuICAgIHAgPSBbcG9zaXRpb25bMF0gLSAxLCBwb3NpdGlvblsxXV07XG4gICAgaWYodGhpcy5jaGVja1Bvc2l0aW9uRm9yVHlwZUFuZFB1c2goYmxvY2tUeXBlLCBwLCBhbGxGb3VuZE9iamVjdHMpKSB7XG4gICAgICBhbGxGb3VuZE9iamVjdHNbMF0gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBhbGxGb3VuZE9iamVjdHM7XG4gIH1cblxuICBnZXRBbGxCb3JkZXJpbmdQbGF5ZXIoYmxvY2tUeXBlKXtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxCb3JkZXJpbmdQb3NpdGlvbih0aGlzLnBsYXllci5wb3NpdGlvbiwgYmxvY2tUeXBlKTtcbiAgfVxuXG4gIGlzUGxheWVyU3RhbmRpbmdOZWFyQ3JlZXBlcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxCb3JkZXJpbmdQbGF5ZXIoXCJjcmVlcGVyXCIpO1xuICB9XG5cbiAgZ2V0TWluZWNhcnRUcmFjaygpIHtcbiAgICB2YXIgdHJhY2sgPSBbXTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsMl0sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsM10sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsNF0sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsNV0sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsNl0sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcImRvd25cIiwgWzMsN10sIEZhY2luZ0RpcmVjdGlvbi5Eb3duLCAzMDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInR1cm5fbGVmdFwiLCBbMyw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFs0LDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzUsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbNiw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFs3LDddLCBGYWNpbmdEaXJlY3Rpb24uUmlnaHQsIDQwMF0pO1xuICAgIHRyYWNrLnB1c2goW1wicmlnaHRcIiwgWzgsN10sIEZhY2luZ0RpcmVjdGlvbi5SaWdodCwgNDAwXSk7XG4gICAgdHJhY2sucHVzaChbXCJyaWdodFwiLCBbOSw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFsxMCw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICB0cmFjay5wdXNoKFtcInJpZ2h0XCIsIFsxMSw3XSwgRmFjaW5nRGlyZWN0aW9uLlJpZ2h0LCA0MDBdKTtcbiAgICByZXR1cm4gdHJhY2s7XG59XG5cbiAgY2FuTW92ZUZvcndhcmQoKSB7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdKSArIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzBdO1xuICAgIGxldCBbeCwgeV0gPSBbYmxvY2tGb3J3YXJkUG9zaXRpb25bMF0sIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdXTtcblxuICAgIGlmICh0aGlzLmluQm91bmRzKHgsIHkpKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzV2Fsa2FibGUgfHxcbiAgICAgICAgICAgICAgICh0aGlzLnBsYXllci5pc09uQmxvY2sgJiYgIXRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGNhblBsYWNlQmxvY2soKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjYW5QbGFjZUJsb2NrRm9yd2FyZCgpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXIuaXNPbkJsb2NrKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0UGxhbmVUb1BsYWNlT24odGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCkpICE9PSBudWxsO1xuICB9XG5cbiAgZ2V0UGxhbmVUb1BsYWNlT24oY29vcmRpbmF0ZXMpIHtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoY29vcmRpbmF0ZXNbMV0pICsgY29vcmRpbmF0ZXNbMF07XG4gICAgbGV0IFt4LCB5XSA9IFtjb29yZGluYXRlc1swXSwgY29vcmRpbmF0ZXNbMV1dO1xuXG4gICAgaWYgKHRoaXMuaW5Cb3VuZHMoeCwgeSkpIHtcbiAgICAgIGxldCBhY3Rpb25CbG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF07XG4gICAgICBpZiAoYWN0aW9uQmxvY2suaXNQbGFjYWJsZSkge1xuICAgICAgICBsZXQgZ3JvdW5kQmxvY2sgPSB0aGlzLmdyb3VuZFBsYW5lW2Jsb2NrSW5kZXhdO1xuICAgICAgICBpZiAoZ3JvdW5kQmxvY2suaXNQbGFjYWJsZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdyb3VuZFBsYW5lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGlvblBsYW5lO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY2FuRGVzdHJveUJsb2NrRm9yd2FyZCgpIHtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMucGxheWVyLmlzT25CbG9jaykge1xuICAgICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoYmxvY2tGb3J3YXJkUG9zaXRpb25bMV0pICsgYmxvY2tGb3J3YXJkUG9zaXRpb25bMF07XG4gICAgICBsZXQgW3gsIHldID0gW2Jsb2NrRm9yd2FyZFBvc2l0aW9uWzBdLCBibG9ja0ZvcndhcmRQb3NpdGlvblsxXV07XG5cbiAgICAgIGlmICh0aGlzLmluQm91bmRzKHgsIHkpKSB7XG4gICAgICAgIGxldCBibG9jayA9IHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF07XG4gICAgICAgIHJlc3VsdCA9ICFibG9jay5pc0VtcHR5ICYmIChibG9jay5pc0Rlc3Ryb3lhYmxlIHx8IGJsb2NrLmlzVXNhYmxlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgbW92ZUZvcndhcmQoKSB7XG4gICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgdGhpcy5tb3ZlVG8oYmxvY2tGb3J3YXJkUG9zaXRpb24pO1xuICB9XG5cbiAgbW92ZVRvKHBvc2l0aW9uKSB7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHBvc2l0aW9uWzFdKSArIHBvc2l0aW9uWzBdO1xuXG4gICAgdGhpcy5wbGF5ZXIucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBpZiAodGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5KSB7XG4gICAgICB0aGlzLnBsYXllci5pc09uQmxvY2sgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB0dXJuTGVmdCgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGxheWVyLmZhY2luZykge1xuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uVXA6XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5MZWZ0O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGYWNpbmdEaXJlY3Rpb24uTGVmdDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLkRvd247XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5Eb3duOlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5SaWdodDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLlVwO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0dXJuUmlnaHQoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBsYXllci5mYWNpbmcpIHtcbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLlVwOlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uUmlnaHQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5SaWdodDpcbiAgICAgICAgdGhpcy5wbGF5ZXIuZmFjaW5nID0gRmFjaW5nRGlyZWN0aW9uLkRvd247XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZhY2luZ0RpcmVjdGlvbi5Eb3duOlxuICAgICAgICB0aGlzLnBsYXllci5mYWNpbmcgPSBGYWNpbmdEaXJlY3Rpb24uTGVmdDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRmFjaW5nRGlyZWN0aW9uLkxlZnQ6XG4gICAgICAgIHRoaXMucGxheWVyLmZhY2luZyA9IEZhY2luZ0RpcmVjdGlvbi5VcDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcGxhY2VCbG9jayhibG9ja1R5cGUpIHtcbiAgICBsZXQgYmxvY2tQb3NpdGlvbiA9IHRoaXMucGxheWVyLnBvc2l0aW9uO1xuICAgIGxldCBibG9ja0luZGV4ID0gdGhpcy55VG9JbmRleChibG9ja1Bvc2l0aW9uWzFdKSArIGJsb2NrUG9zaXRpb25bMF07XG4gICAgdmFyIHNob3VsZFBsYWNlID0gZmFsc2U7XG5cbiAgICBzd2l0Y2ggKGJsb2NrVHlwZSkge1xuICAgICAgY2FzZSBcImNyb3BXaGVhdFwiOlxuICAgICAgICBzaG91bGRQbGFjZSA9IHRoaXMuZ3JvdW5kUGxhbmVbYmxvY2tJbmRleF0uYmxvY2tUeXBlID09PSBcImZhcm1sYW5kV2V0XCI7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzaG91bGRQbGFjZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRQbGFjZSA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIGJsb2NrID0gbmV3IExldmVsQmxvY2soYmxvY2tUeXBlKTtcblxuICAgICAgdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XSA9IGJsb2NrO1xuICAgICAgdGhpcy5wbGF5ZXIuaXNPbkJsb2NrID0gIWJsb2NrLmlzV2Fsa2FibGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNob3VsZFBsYWNlO1xuICB9XG5cbiAgcGxhY2VCbG9ja0ZvcndhcmQoYmxvY2tUeXBlLCB0YXJnZXRQbGFuZSkge1xuICAgIGxldCBibG9ja1Bvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrUG9zaXRpb25bMV0pICsgYmxvY2tQb3NpdGlvblswXTtcblxuICAgIC8vZm9yIHBsYWNpbmcgd2V0bGFuZCBmb3IgY3JvcHMgaW4gZnJlZSBwbGF5XG4gICAgaWYoYmxvY2tUeXBlID09PSBcIndhdGVyaW5nXCIpIHtcbiAgICAgIGJsb2NrVHlwZSA9IFwiZmFybWxhbmRXZXRcIjtcbiAgICAgIHRhcmdldFBsYW5lID0gdGhpcy5ncm91bmRQbGFuZTtcbiAgICB9XG5cbiAgICB0YXJnZXRQbGFuZVtibG9ja0luZGV4XSA9IG5ldyBMZXZlbEJsb2NrKGJsb2NrVHlwZSk7XG4gIH1cblxuICBkZXN0cm95QmxvY2socG9zaXRpb24pIHtcbiAgICB2YXIgaSxcbiAgICAgICAgYmxvY2sgPSBudWxsO1xuXG4gICAgbGV0IGJsb2NrUG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoYmxvY2tQb3NpdGlvblsxXSkgKyBibG9ja1Bvc2l0aW9uWzBdO1xuICAgIGxldCBbeCwgeV0gPSBbYmxvY2tQb3NpdGlvblswXSwgYmxvY2tQb3NpdGlvblsxXV07XG4gICAgXG4gICAgaWYgKHRoaXMuaW5Cb3VuZHMoeCwgeSkpIHtcbiAgICAgIGJsb2NrID0gdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XTtcbiAgICAgIGlmIChibG9jayAhPT0gbnVsbCkge1xuICAgICAgICBibG9jay5wb3NpdGlvbiA9IFt4LCB5XTtcblxuICAgICAgICBpZiAoYmxvY2suaXNEZXN0cm95YWJsZSkge1xuICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0gPSBuZXcgTGV2ZWxCbG9jayhcIlwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIGRlc3Ryb3lCbG9ja0ZvcndhcmQoKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHNob3VsZEFkZFRvSW52ZW50b3J5ID0gdHJ1ZSxcbiAgICAgICAgYmxvY2sgPSBudWxsO1xuXG4gICAgbGV0IGJsb2NrRm9yd2FyZFBvc2l0aW9uID0gdGhpcy5nZXRNb3ZlRm9yd2FyZFBvc2l0aW9uKCk7XG4gICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdKSArIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzBdO1xuICAgIGxldCBbeCwgeV0gPSBbYmxvY2tGb3J3YXJkUG9zaXRpb25bMF0sIGJsb2NrRm9yd2FyZFBvc2l0aW9uWzFdXTtcbiAgICBcbiAgICBpZiAodGhpcy5pbkJvdW5kcyh4LCB5KSkge1xuICAgICAgYmxvY2sgPSB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdO1xuICAgICAgaWYgKGJsb2NrICE9PSBudWxsKSB7XG4gICAgICAgIGJsb2NrLnBvc2l0aW9uID0gW3gsIHldO1xuICAgICAgICBsZXQgaW52ZW50b3J5VHlwZSA9IHRoaXMuZ2V0SW52ZW50b3J5VHlwZShibG9jay5ibG9ja1R5cGUpO1xuICAgICAgICB0aGlzLnBsYXllci5pbnZlbnRvcnlbaW52ZW50b3J5VHlwZV0gPVxuICAgICAgICAgICAgKHRoaXMucGxheWVyLmludmVudG9yeVtpbnZlbnRvcnlUeXBlXSB8fCAwKSArIDE7XG5cbiAgICAgICAgaWYgKGJsb2NrLmlzRGVzdHJveWFibGUpIHtcbiAgICAgICAgICB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdID0gbmV3IExldmVsQmxvY2soXCJcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBnZXRJbnZlbnRvcnlUeXBlKGJsb2NrVHlwZSkge1xuICAgIHN3aXRjaCAoYmxvY2tUeXBlKSB7XG4gICAgICBjYXNlIFwic2hlZXBcIjpcbiAgICAgICAgcmV0dXJuIFwid29vbFwiO1xuICAgICAgY2FzZSBcInN0b25lXCI6XG4gICAgICAgIHJldHVybiBcImNvYmJsZXN0b25lXCI7XG4gICAgICBjYXNlIFwidHJlZUFjYWNpYVwiOlxuICAgICAgY2FzZSBcInRyZWVCaXJjaFwiOlxuICAgICAgY2FzZSBcInRyZWVKdW5nbGVcIjpcbiAgICAgIGNhc2UgXCJ0cmVlT2FrXCI6XG4gICAgICBjYXNlIFwidHJlZVNwcnVjZVwiOlxuICAgICAgICByZXR1cm4gXCJwbGFua3NcIiArIGJsb2NrVHlwZS5zdWJzdHJpbmcoNCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gYmxvY2tUeXBlO1xuICAgIH1cbiAgfVxuXG4gIHNvbHZlRk9XVHlwZUZvck1hcCgpIHtcbiAgICB2YXIgZW1pc3NpdmVzLFxuICAgICAgICBibG9ja3NUb1NvbHZlO1xuXG4gICAgZW1pc3NpdmVzID0gdGhpcy5nZXRBbGxFbWlzc2l2ZXMoKTtcbiAgICBibG9ja3NUb1NvbHZlID0gdGhpcy5maW5kQmxvY2tzQWZmZWN0ZWRCeUVtaXNzaXZlcyhlbWlzc2l2ZXMpO1xuXG4gICAgZm9yKHZhciBibG9jayBpbiBibG9ja3NUb1NvbHZlKSB7XG4gICAgICBpZihibG9ja3NUb1NvbHZlLmhhc093blByb3BlcnR5KGJsb2NrKSkge1xuICAgICAgICB0aGlzLnNvbHZlRk9XVHlwZUZvcihibG9ja3NUb1NvbHZlW2Jsb2NrXSwgZW1pc3NpdmVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzb2x2ZUZPV1R5cGVGb3IocG9zaXRpb24sIGVtaXNzaXZlcykge1xuICAgIHZhciBlbWlzc2l2ZXNUb3VjaGluZyxcbiAgICAgICAgdG9wTGVmdFF1YWQgPSBmYWxzZSxcbiAgICAgICAgYm90TGVmdFF1YWQgPSBmYWxzZSxcbiAgICAgICAgbGVmdFF1YWQgPSBmYWxzZSxcbiAgICAgICAgdG9wUmlnaHRRdWFkID0gZmFsc2UsXG4gICAgICAgIGJvdFJpZ2h0UXVhZCA9IGZhbHNlLFxuICAgICAgICByaWdodFF1YWQgPSBmYWxzZSxcbiAgICAgICAgdG9wUXVhZCA9IGZhbHNlLFxuICAgICAgICBib3RRdWFkID0gZmFsc2UsXG4gICAgICAgIGFuZ2xlID0gMCxcbiAgICAgICAgaW5kZXggPSB0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChwb3NpdGlvbiksXG4gICAgICAgIHgsXG4gICAgICAgIHk7XG5cbiAgICBlbWlzc2l2ZXNUb3VjaGluZyA9IHRoaXMuZmluZEVtaXNzaXZlc1RoYXRUb3VjaChwb3NpdGlvbiwgZW1pc3NpdmVzKTtcblxuICAgIGZvcih2YXIgdG9yY2ggaW4gZW1pc3NpdmVzVG91Y2hpbmcpIHtcbiAgICAgIHZhciBjdXJyZW50VG9yY2ggPSBlbWlzc2l2ZXNUb3VjaGluZ1t0b3JjaF07XG4gICAgICB5ID0gcG9zaXRpb25bMV07XG4gICAgICB4ID0gcG9zaXRpb25bMF07XG5cbiAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihjdXJyZW50VG9yY2hbMV0gLSBwb3NpdGlvblsxXSwgY3VycmVudFRvcmNoWzBdIC0gcG9zaXRpb25bMF0pO1xuICAgICAgLy9pbnZlcnRcbiAgICAgIGFuZ2xlID0gLWFuZ2xlO1xuICAgICAgLy9Ob3JtYWxpemUgdG8gYmUgYmV0d2VlbiAwIGFuZCAyKnBpXG4gICAgICBpZihhbmdsZSA8IDApIHtcbiAgICAgICAgYW5nbGUgKz0gMiAqIE1hdGguUEk7XG4gICAgICB9XG4gICAgICAvL2NvbnZlcnQgdG8gZGVncmVlcyBmb3Igc2ltcGxpY2l0eVxuICAgICAgYW5nbGUgKj0gMzYwIC8gKDIqTWF0aC5QSSk7XG5cbiAgICAgIC8vdG9wIHJpZ2h0XG4gICAgICBpZighcmlnaHRRdWFkICYmYW5nbGUgPiAzMi41ICYmIGFuZ2xlIDw9IDU3LjUpIHtcbiAgICAgICAgdG9wUmlnaHRRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfSW5Db3JuZXJfVG9wUmlnaHRcIiwgcHJlY2VkZW5jZTogMCB9KTtcbiAgICAgIH0vL3RvcCBsZWZ0XG4gICAgICBpZighbGVmdFF1YWQgJiZhbmdsZSA+IDEyMi41ICYmIGFuZ2xlIDw9IDE0Ny41KSB7XG4gICAgICAgIHRvcExlZnRRdWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfSW5Db3JuZXJfVG9wTGVmdFwiLCBwcmVjZWRlbmNlOiAwfSk7XG4gICAgICB9Ly9ib3QgbGVmdFxuICAgICAgaWYoIWxlZnRRdWFkICYmYW5nbGUgPiAyMTIuNSAmJiBhbmdsZSA8PSAyMzcuNSkge1xuICAgICAgICBib3RMZWZ0UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0luQ29ybmVyX0JvdHRvbUxlZnRcIiwgcHJlY2VkZW5jZTogMH0pO1xuICAgICAgfS8vYm90cmlnaHRcbiAgICAgIGlmKCFyaWdodFF1YWQgJiYgYW5nbGUgPiAzMDIuNSAmJiBhbmdsZSA8PSAzMTcuNSkge1xuICAgICAgICBib3RSaWdodFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9JbkNvcm5lcl9Cb3R0b21SaWdodFwiLCBwcmVjZWRlbmNlOiAwfSk7XG4gICAgICB9XG4gICAgICAvL3JpZ2h0XG4gICAgICBpZihhbmdsZSA+PSAzMjcuNSB8fCBhbmdsZSA8PSAzMi41KSB7XG4gICAgICAgIHJpZ2h0UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX1JpZ2h0XCIgLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgICB9Ly9ib3RcbiAgICAgIGlmKGFuZ2xlID4gMjM3LjUgJiYgYW5nbGUgPD0gMzAyLjUpIHtcbiAgICAgICAgYm90UXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0JvdHRvbVwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgICB9XG4gICAgICAvL2xlZnRcbiAgICAgIGlmKGFuZ2xlID4gMTQ3LjUgJiYgYW5nbGUgPD0gMjEyLjUpIHtcbiAgICAgICAgbGVmdFF1YWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9MZWZ0XCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICAgIH1cbiAgICAgIC8vdG9wXG4gICAgICBpZihhbmdsZSA+IDU3LjUgJiYgYW5nbGUgPD0gMTIyLjUpIHtcbiAgICAgICAgdG9wUXVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX1RvcFwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodG9wTGVmdFF1YWQgJiYgYm90TGVmdFF1YWQpIHtcbiAgICAgIHRoaXMucHVzaElmSGlnaGVyUHJlY2VkZW5jZShpbmRleCwgeyB4OiB4LCB5OiB5LCB0eXBlOiBcIkZvZ09mV2FyX0xlZnRcIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgIH1cbiAgICBpZih0b3BSaWdodFF1YWQgJiYgYm90UmlnaHRRdWFkKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9SaWdodFwiLCBwcmVjZWRlbmNlOiAxfSk7XG4gICAgfVxuICAgIGlmKHRvcExlZnRRdWFkICYmIHRvcFJpZ2h0UXVhZCkge1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfVG9wXCIsIHByZWNlZGVuY2U6IDF9KTtcbiAgICB9XG4gICAgaWYoYm90UmlnaHRRdWFkICYmIGJvdExlZnRRdWFkKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Cb3R0b21cIiwgcHJlY2VkZW5jZTogMX0pO1xuICAgIH1cblxuICAgIC8vZnVsbHkgbGl0XG4gICAgaWYoIChib3RSaWdodFF1YWQgJiYgdG9wTGVmdFF1YWQpIHx8IChib3RMZWZ0UXVhZCAmJiB0b3BSaWdodFF1YWQpIHx8IGxlZnRRdWFkICYmIHJpZ2h0UXVhZCB8fCB0b3BRdWFkICYmIGJvdFF1YWQgfHwgKHJpZ2h0UXVhZCAmJiBib3RRdWFkICYmIHRvcExlZnRRdWFkKSB8fFxuICAgICAgICAoYm90UXVhZCAmJiB0b3BSaWdodFF1YWQgJiYgdG9wTGVmdFF1YWQpIHx8ICh0b3BRdWFkICYmIGJvdFJpZ2h0UXVhZCAmJiBib3RMZWZ0UXVhZCkgfHwgKGxlZnRRdWFkICYmIHRvcFJpZ2h0UXVhZCAmJiBib3RSaWdodFF1YWQpIHx8IChsZWZ0UXVhZCAmJiBib3RRdWFkICYmIHRvcFJpZ2h0UXVhZCkpIHtcbiAgICAgIHRoaXMuZm93UGxhbmVbaW5kZXhdID0gXCJcIjtcbiAgICB9XG5cbiAgICAvL2RhcmtlbmQgYm90bGVmdCBjb3JuZXJcbiAgICBlbHNlIGlmKCAoYm90UXVhZCAmJiBsZWZ0UXVhZCkgfHwgKGJvdFF1YWQgJiYgdG9wTGVmdFF1YWQpIHx8IChsZWZ0UXVhZCAmJiBib3RSaWdodFF1YWQpICl7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Cb3R0b21fTGVmdFwiLCBwcmVjZWRlbmNlOiAyfSk7XG4gICAgfVxuICAgIC8vZGFya2VuZCBib3RSaWdodCBjb3JuZXJcbiAgICBlbHNlIGlmKChib3RRdWFkICYmIHJpZ2h0UXVhZCkgfHwgKGJvdFF1YWQgJiYgdG9wUmlnaHRRdWFkKSB8fCAocmlnaHRRdWFkICYmIGJvdExlZnRRdWFkKSkge1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfQm90dG9tX1JpZ2h0XCIsIHByZWNlZGVuY2U6IDJ9KTtcbiAgICB9XG4gICAgLy9kYXJrZW5kIHRvcFJpZ2h0IGNvcm5lclxuICAgIGVsc2UgaWYoKHRvcFF1YWQgJiYgcmlnaHRRdWFkKSB8fCAodG9wUXVhZCAmJiBib3RSaWdodFF1YWQpIHx8IChyaWdodFF1YWQgJiYgdG9wTGVmdFF1YWQpKSB7XG4gICAgICB0aGlzLnB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIHsgeDogeCwgeTogeSwgdHlwZTogXCJGb2dPZldhcl9Ub3BfUmlnaHRcIiwgcHJlY2VkZW5jZTogMn0pO1xuICAgIH1cbiAgICAvL2RhcmtlbmQgdG9wTGVmdCBjb3JuZXJcbiAgICBlbHNlIGlmKCh0b3BRdWFkICYmIGxlZnRRdWFkKSB8fCAodG9wUXVhZCAmJiBib3RMZWZ0UXVhZCkgfHwgKGxlZnRRdWFkICYmIHRvcFJpZ2h0UXVhZCkpe1xuICAgICAgdGhpcy5wdXNoSWZIaWdoZXJQcmVjZWRlbmNlKGluZGV4LCB7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfVG9wX0xlZnRcIiwgcHJlY2VkZW5jZTogMn0pO1xuICAgIH1cbiAgfVxuXG4gIHB1c2hJZkhpZ2hlclByZWNlZGVuY2UoaW5kZXgsIGZvd09iamVjdCkge1xuICAgIGlmIChmb3dPYmplY3QgPT09IFwiXCIpIHtcbiAgICAgIHRoaXMuZm93UGxhbmVbaW5kZXhdID0gXCJcIjtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGV4aXN0aW5nSXRlbSA9IHRoaXMuZm93UGxhbmVbaW5kZXhdO1xuICAgIGlmIChleGlzdGluZ0l0ZW0gJiYgZXhpc3RpbmdJdGVtLnByZWNlZGVuY2UgPiBmb3dPYmplY3QucHJlY2VkZW5jZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZvd1BsYW5lW2luZGV4XSA9IGZvd09iamVjdDtcbiAgfVxuXG4gIGdldEFsbEVtaXNzaXZlcygpe1xuICAgIHZhciBlbWlzc2l2ZXMgPSBbXTtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmNvb3JkaW5hdGVzVG9JbmRleChbeCx5XSk7XG4gICAgICAgIGlmKCF0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5pc0VtcHR5ICYmIHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmlzRW1pc3NpdmUgfHwgdGhpcy5ncm91bmRQbGFuZVtpbmRleF0uaXNFbWlzc2l2ZSAmJiB0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5pc0VtcHR5ICkge1xuICAgICAgICAgIGVtaXNzaXZlcy5wdXNoKFt4LHldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZW1pc3NpdmVzO1xuICB9XG5cbiAgZmluZEJsb2Nrc0FmZmVjdGVkQnlFbWlzc2l2ZXMoZW1pc3NpdmVzKSB7XG4gICAgdmFyIGJsb2Nrc1RvdWNoZWRCeUVtaXNzaXZlcyA9IHt9O1xuICAgIC8vZmluZCBlbWlzc2l2ZXMgdGhhdCBhcmUgY2xvc2UgZW5vdWdoIHRvIGxpZ2h0IHVzLlxuICAgIGZvcih2YXIgdG9yY2ggaW4gZW1pc3NpdmVzKVxuICAgIHtcbiAgICAgIHZhciBjdXJyZW50VG9yY2ggPSBlbWlzc2l2ZXNbdG9yY2hdO1xuICAgICAgbGV0IHkgPSBjdXJyZW50VG9yY2hbMV07XG4gICAgICBsZXQgeCA9IGN1cnJlbnRUb3JjaFswXTtcbiAgICAgIGZvciAodmFyIHlJbmRleCA9IGN1cnJlbnRUb3JjaFsxXSAtIDI7IHlJbmRleCA8PSAoY3VycmVudFRvcmNoWzFdICsgMik7ICsreUluZGV4KSB7XG4gICAgICAgIGZvciAodmFyIHhJbmRleCA9IGN1cnJlbnRUb3JjaFswXSAtIDI7IHhJbmRleCA8PSAoY3VycmVudFRvcmNoWzBdICsgMik7ICsreEluZGV4KSB7XG5cbiAgICAgICAgICAvL0Vuc3VyZSB3ZSdyZSBsb29raW5nIGluc2lkZSB0aGUgbWFwXG4gICAgICAgICAgaWYoIXRoaXMuaW5Cb3VuZHMoeEluZGV4LCB5SW5kZXgpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL0lnbm9yZSB0aGUgaW5kZXhlcyBkaXJlY3RseSBhcm91bmQgdXMuXG4gICAgICAgICAgLy9UaGV5cmUgdGFrZW4gY2FyZSBvZiBvbiB0aGUgRk9XIGZpcnN0IHBhc3MgXG4gICAgICAgICAgaWYoICh5SW5kZXggPj0geSAtIDEgJiYgeUluZGV4IDw9IHkgKyAxKSAmJiAoeEluZGV4ID49IHggLSAxICYmIHhJbmRleCA8PSB4ICsgMSkgKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL3dlIHdhbnQgdW5pcXVlIGNvcGllcyBzbyB3ZSB1c2UgYSBtYXAuXG4gICAgICAgICAgYmxvY2tzVG91Y2hlZEJ5RW1pc3NpdmVzW3lJbmRleC50b1N0cmluZygpICsgeEluZGV4LnRvU3RyaW5nKCldID0gW3hJbmRleCx5SW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2Nrc1RvdWNoZWRCeUVtaXNzaXZlcztcbiAgfVxuXG4gIGZpbmRFbWlzc2l2ZXNUaGF0VG91Y2gocG9zaXRpb24sIGVtaXNzaXZlcykge1xuICAgIHZhciBlbWlzc2l2ZXNUaGF0VG91Y2ggPSBbXTtcbiAgICBsZXQgeSA9IHBvc2l0aW9uWzFdO1xuICAgIGxldCB4ID0gcG9zaXRpb25bMF07XG4gICAgLy9maW5kIGVtaXNzaXZlcyB0aGF0IGFyZSBjbG9zZSBlbm91Z2ggdG8gbGlnaHQgdXMuXG4gICAgZm9yICh2YXIgeUluZGV4ID0geSAtIDI7IHlJbmRleCA8PSAoeSArIDIpOyArK3lJbmRleCkge1xuICAgICAgZm9yICh2YXIgeEluZGV4ID0geCAtIDI7IHhJbmRleCA8PSAoeCArIDIpOyArK3hJbmRleCkge1xuXG4gICAgICAgIC8vRW5zdXJlIHdlJ3JlIGxvb2tpbmcgaW5zaWRlIHRoZSBtYXBcbiAgICAgICAgaWYoIXRoaXMuaW5Cb3VuZHMoeEluZGV4LCB5SW5kZXgpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL0lnbm9yZSB0aGUgaW5kZXhlcyBkaXJlY3RseSBhcm91bmQgdXMuIFxuICAgICAgICBpZiggKHlJbmRleCA+PSB5IC0gMSAmJiB5SW5kZXggPD0geSArIDEpICYmICh4SW5kZXggPj0geCAtIDEgJiYgeEluZGV4IDw9IHggKyAxKSApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcih2YXIgdG9yY2ggaW4gZW1pc3NpdmVzKSB7XG4gICAgICAgICAgaWYoZW1pc3NpdmVzW3RvcmNoXVswXSA9PT0geEluZGV4ICYmIGVtaXNzaXZlc1t0b3JjaF1bMV0gPT09IHlJbmRleCkge1xuICAgICAgICAgICAgZW1pc3NpdmVzVGhhdFRvdWNoLnB1c2goZW1pc3NpdmVzW3RvcmNoXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVtaXNzaXZlc1RoYXRUb3VjaDtcbiAgfVxuXG4gIGNvbXB1dGVGb3dQbGFuZSgpIHtcbiAgICB2YXIgeCwgeTtcblxuICAgIHRoaXMuZm93UGxhbmUgPSBbXTtcbiAgICBpZiAodGhpcy5pc0RheXRpbWUpIHtcbiAgICAgIGZvciAoeSA9IDA7IHkgPCB0aGlzLnBsYW5lSGVpZ2h0OyArK3kpIHtcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHRoaXMucGxhbmVXaWR0aDsgKyt4KSB7XG4gICAgICAgICAgLy8gdGhpcy5mb3dQbGFuZS5wdXNoW1wiXCJdOyAvLyBub29wIGFzIG9yaWdpbmFsbHkgd3JpdHRlblxuICAgICAgICAgIC8vIFRPRE8oYmpvcmRhbikgY29tcGxldGVseSByZW1vdmU/XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29tcHV0ZSB0aGUgZm9nIG9mIHdhciBmb3IgbGlnaHQgZW1pdHRpbmcgYmxvY2tzXG4gICAgICBmb3IgKHkgPSAwOyB5IDwgdGhpcy5wbGFuZUhlaWdodDsgKyt5KSB7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCB0aGlzLnBsYW5lV2lkdGg7ICsreCkge1xuICAgICAgICAgIHRoaXMuZm93UGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6IFwiRm9nT2ZXYXJfQ2VudGVyXCIgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9zZWNvbmQgcGFzcyBmb3IgcGFydGlhbCBsaXQgc3F1YXJlc1xuICAgICAgdGhpcy5zb2x2ZUZPV1R5cGVGb3JNYXAoKTtcblxuICAgICAgZm9yICh5ID0gMDsgeSA8IHRoaXMucGxhbmVIZWlnaHQ7ICsreSkge1xuICAgICAgICBmb3IgKHggPSAwOyB4IDwgdGhpcy5wbGFuZVdpZHRoOyArK3gpIHtcbiAgICAgICAgICBsZXQgYmxvY2tJbmRleCA9IHRoaXMueVRvSW5kZXgoeSkgKyB4O1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICh0aGlzLmdyb3VuZFBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1pc3NpdmUgJiYgdGhpcy5hY3Rpb25QbGFuZVtibG9ja0luZGV4XS5pc0VtcHR5IHx8XG4gICAgICAgICAgICAoIXRoaXMuYWN0aW9uUGxhbmVbYmxvY2tJbmRleF0uaXNFbXB0eSAmJiB0aGlzLmFjdGlvblBsYW5lW2Jsb2NrSW5kZXhdLmlzRW1pc3NpdmUpKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyRm93QXJvdW5kKHgsIHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICB9XG4gIH1cblxuICBjbGVhckZvd0Fyb3VuZCh4LCB5KSB7XG4gICAgdmFyIG94LCBveTtcblxuICAgIGZvciAob3kgPSAtMTsgb3kgPD0gMTsgKytveSkge1xuICAgICAgZm9yIChveCA9IC0xOyBveCA8PSAxOyArK294KSB7XG4gICAgICAgIHRoaXMuY2xlYXJGb3dBdCh4ICsgb3gsIHkgKyBveSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2xlYXJGb3dBdCh4LCB5KSB7XG4gICAgaWYgKHggPj0gMCAmJiB4IDwgdGhpcy5wbGFuZVdpZHRoICYmIHkgPj0gMCAmJiB5IDwgdGhpcy5wbGFuZUhlaWdodCkge1xuICAgICAgbGV0IGJsb2NrSW5kZXggPSB0aGlzLnlUb0luZGV4KHkpICsgeDtcbiAgICAgIHRoaXMuZm93UGxhbmVbYmxvY2tJbmRleF0gPSBcIlwiO1xuICAgIH1cbiAgfVxuXG4gIGNvbXB1dGVTaGFkaW5nUGxhbmUoKSB7XG4gICAgdmFyIHgsXG4gICAgICAgIHksXG4gICAgICAgIGluZGV4LFxuICAgICAgICBoYXNMZWZ0LFxuICAgICAgICBoYXNSaWdodDtcblxuICAgIHRoaXMuc2hhZGluZ1BsYW5lID0gW107XG5cbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnBsYW5lQXJlYSgpOyArK2luZGV4KSB7XG4gICAgICB4ID0gaW5kZXggJSB0aGlzLnBsYW5lV2lkdGg7XG4gICAgICB5ID0gTWF0aC5mbG9vcihpbmRleCAvIHRoaXMucGxhbmVXaWR0aCk7XG5cbiAgICAgIGhhc0xlZnQgPSBmYWxzZTtcbiAgICAgIGhhc1JpZ2h0ID0gZmFsc2U7XG4gICAgICBcbiAgICAgIGlmICh0aGlzLmFjdGlvblBsYW5lW2luZGV4XS5pc0VtcHR5IHx8IHRoaXMuYWN0aW9uUGxhbmVbaW5kZXhdLmlzVHJhbnNwYXJlbnQpIHtcbiAgICAgICAgaWYgKHkgPT09IDApIHtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0JvdHRvbScgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeSA9PT0gdGhpcy5wbGFuZUhlaWdodCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1RvcCcgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfUmlnaHQnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHggPT09IHRoaXMucGxhbmVXaWR0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0xlZnQnIH0pO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoeCA8IHRoaXMucGxhbmVXaWR0aCAtIDEgJiYgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHggKyAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgIC8vIG5lZWRzIGEgbGVmdCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgIHRoaXMuc2hhZGluZ1BsYW5lLnB1c2goeyB4OiB4LCB5OiB5LCB0eXBlOiAnQU9lZmZlY3RfTGVmdCcgfSk7XG4gICAgICAgICAgaGFzTGVmdCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeCA+IDAgJiYgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHggLSAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgIC8vIG5lZWRzIGEgcmlnaHQgc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1JpZ2h0JyB9KTtcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ1NoYWRvd19QYXJ0c19GYWRlX2Jhc2UucG5nJyB9KTtcblxuICAgICAgICAgIGlmICh5ID4gMCAmJiB4ID4gMCAmJiB0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSAtIDEpICsgeCAtIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ1NoYWRvd19QYXJ0c19GYWRlX3RvcC5wbmcnIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGhhc1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh5ID4gMCAmJiAhdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkgLSAxKSArIHhdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgLy8gbmVlZHMgYSBib3R0b20gc2lkZSBBTyBzaGFkb3dcbiAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X0JvdHRvbScgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoeSA+IDApIHtcbiAgICAgICAgICBpZiAoeCA8IHRoaXMucGxhbmVXaWR0aCAtIDEgJiYgXG4gICAgICAgICAgICAgICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSAtIDEpICsgeCArIDFdLmdldElzRW1wdHlPckVudGl0eSgpICYmXG4gICAgICAgICAgICAgIHRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5KSArIHggKyAxXS5nZXRJc0VtcHR5T3JFbnRpdHkoKSkge1xuICAgICAgICAgICAgLy8gbmVlZHMgYSBib3R0b20gbGVmdCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Cb3R0b21MZWZ0JyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWhhc1JpZ2h0ICYmIHggPiAwICYmICF0aGlzLmFjdGlvblBsYW5lW3RoaXMueVRvSW5kZXgoeSAtIDEpICsgeCAtIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgICAvLyBuZWVkcyBhIGJvdHRvbSByaWdodCBzaWRlIEFPIHNoYWRvd1xuICAgICAgICAgICAgdGhpcy5zaGFkaW5nUGxhbmUucHVzaCh7IHg6IHgsIHk6IHksIHR5cGU6ICdBT2VmZmVjdF9Cb3R0b21SaWdodCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHkgPCB0aGlzLnBsYW5lSGVpZ2h0IC0gMSkge1xuICAgICAgICAgIGlmICh4IDwgdGhpcy5wbGFuZVdpZHRoIC0gMSAmJiBcbiAgICAgICAgICAgICAgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5ICsgMSkgKyB4ICsgMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkgJiZcbiAgICAgICAgICAgICAgdGhpcy5hY3Rpb25QbGFuZVt0aGlzLnlUb0luZGV4KHkpICsgeCArIDFdLmdldElzRW1wdHlPckVudGl0eSgpKSB7XG4gICAgICAgICAgICAvLyBuZWVkcyBhIGJvdHRvbSBsZWZ0IHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1RvcExlZnQnIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghaGFzUmlnaHQgJiYgeCA+IDAgJiYgIXRoaXMuYWN0aW9uUGxhbmVbdGhpcy55VG9JbmRleCh5ICsgMSkgKyB4IC0gMV0uZ2V0SXNFbXB0eU9yRW50aXR5KCkpIHtcbiAgICAgICAgICAgIC8vIG5lZWRzIGEgYm90dG9tIHJpZ2h0IHNpZGUgQU8gc2hhZG93XG4gICAgICAgICAgICB0aGlzLnNoYWRpbmdQbGFuZS5wdXNoKHsgeDogeCwgeTogeSwgdHlwZTogJ0FPZWZmZWN0X1RvcFJpZ2h0JyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIExldmVsQmxvY2sge1xuICBjb25zdHJ1Y3RvcihibG9ja1R5cGUpIHtcbiAgICB0aGlzLmJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcblxuICAgIC8vIERlZmF1bHQgdmFsdWVzIGFwcGx5IHRvIHNpbXBsZSwgYWN0aW9uLXBsYW5lIGRlc3Ryb3lhYmxlIGJsb2Nrc1xuICAgIHRoaXMuaXNFbnRpdHkgPSBmYWxzZTtcbiAgICB0aGlzLmlzV2Fsa2FibGUgPSBmYWxzZTtcbiAgICB0aGlzLmlzRGVhZGx5ID0gZmFsc2U7XG4gICAgdGhpcy5pc1BsYWNhYmxlID0gZmFsc2U7IC8vIHdoZXRoZXIgYW5vdGhlciBibG9jayBjYW4gYmUgcGxhY2VkIGluIHRoaXMgYmxvY2sncyBzcG90XG4gICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVXNhYmxlID0gdHJ1ZTtcbiAgICB0aGlzLmlzRW1wdHkgPSBmYWxzZTtcbiAgICB0aGlzLmlzRW1pc3NpdmUgPSBmYWxzZTtcbiAgICB0aGlzLmlzVHJhbnNwYXJlbnQgPSBmYWxzZTtcblxuICAgIGlmIChibG9ja1R5cGUgPT09IFwiXCIpIHtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzUGxhY2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUubWF0Y2goJ3RvcmNoJykpIHtcbiAgICAgIHRoaXMuaXNXYWxrYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzUGxhY2FibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmKGJsb2NrVHlwZS5zdWJzdHJpbmcoMCwgNSkgPT0gXCJyYWlsc1wiKVxuICAgIHtcbiAgICAgIHRoaXMuaXNFbnRpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJzaGVlcFwiKSB7XG4gICAgICB0aGlzLmlzRW50aXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcImNyZWVwZXJcIil7XG4gICAgICB0aGlzLmlzRW50aXR5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwiZ2xhc3NcIil7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2tUeXBlID09IFwiYmVkcm9ja1wiKXtcbiAgICAgIHRoaXMuaXNEZXN0cm95YWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJsYXZhXCIpIHtcbiAgICAgIHRoaXMuaXNFbWlzc2l2ZSA9IHRydWU7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0RlYWRseSA9IHRydWU7XG4gICAgICB0aGlzLmlzUGxhY2FibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJ3YXRlclwiKSB7XG4gICAgICB0aGlzLmlzUGxhY2FibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJ0b3JjaFwiKSB7XG4gICAgICB0aGlzLmlzRW1pc3NpdmUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0VudGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNUcmFuc3BhcmVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrVHlwZSA9PSBcImNyb3BXaGVhdFwiKSB7XG4gICAgICB0aGlzLmlzRW1pc3NpdmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNFbnRpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5pc1dhbGthYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNVc2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc0Rlc3Ryb3lhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChibG9ja1R5cGUgPT0gXCJ0bnRcIikge1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmKGJsb2NrVHlwZSA9PSBcImRvb3JcIikge1xuICAgICAgdGhpcy5pc0VudGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmlzV2Fsa2FibGUgPSB0cnVlO1xuICAgICAgdGhpcy5pc1VzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLmlzRGVzdHJveWFibGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNUcmFuc3BhcmVudCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0SXNUcmVlKCkge1xuICAgIHJldHVybiAhIXRoaXMuYmxvY2tUeXBlLm1hdGNoKC9edHJlZS8pO1xuICB9XG5cbiAgZ2V0SXNFbXB0eU9yRW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLmlzRW1wdHkgfHwgdGhpcy5pc0VudGl0eTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmZyZWV6ZSh7XG4gICAgVXA6IDAsXG4gICAgUmlnaHQ6IDEsXG4gICAgRG93bjogMixcbiAgICBMZWZ0OiAzXG59KTtcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEFzc2V0TG9hZGVyIHtcbiAgY29uc3RydWN0b3IoY29udHJvbGxlcikge1xuICAgIHRoaXMuY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgdGhpcy5hdWRpb1BsYXllciA9IGNvbnRyb2xsZXIuYXVkaW9QbGF5ZXI7XG4gICAgdGhpcy5nYW1lID0gY29udHJvbGxlci5nYW1lO1xuICAgIHRoaXMuYXNzZXRSb290ID0gY29udHJvbGxlci5hc3NldFJvb3Q7XG5cbiAgICB0aGlzLmFzc2V0cyA9IHtcbiAgICAgIGVudGl0eVNoYWRvdzoge1xuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICBwYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQ2hhcmFjdGVyX1NoYWRvdy5wbmdgXG4gICAgICB9LFxuICAgICAgc2VsZWN0aW9uSW5kaWNhdG9yOiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TZWxlY3Rpb25fSW5kaWNhdG9yLnBuZ2BcbiAgICAgIH0sXG4gICAgICBzaGFkZUxheWVyOiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TaGFkZV9MYXllci5wbmdgXG4gICAgICB9LFxuICAgICAgdGFsbEdyYXNzOiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9UYWxsR3Jhc3MucG5nYFxuICAgICAgfSxcbiAgICAgIGZpbmlzaE92ZXJsYXk6IHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1doaXRlUmVjdC5wbmdgXG4gICAgICB9LFxuICAgICAgYmVkOiB7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CZWQucG5nYFxuICAgICAgfSxcbiAgICAgIHBsYXllclN0ZXZlOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvU3RldmUucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TdGV2ZS5qc29uYFxuICAgICAgfSxcbiAgICAgIHBsYXllckFsZXg6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9BbGV4LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQWxleC5qc29uYFxuICAgICAgfSxcbiAgICAgIEFPOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQU8ucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9BTy5qc29uYFxuICAgICAgfSxcbiAgICAgIGJsb2NrU2hhZG93czoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Jsb2NrX1NoYWRvd3MucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CbG9ja19TaGFkb3dzLmpzb25gXG4gICAgICB9LFxuICAgICAgdW5kZXJncm91bmRGb3c6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9VbmRlcmdyb3VuZEZvVy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1VuZGVyZ3JvdW5kRm9XLmpzb25gXG4gICAgICB9LFxuICAgICAgYmxvY2tzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQmxvY2tzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQmxvY2tzLmpzb25gXG4gICAgICB9LFxuICAgICAgbGVhdmVzQWNhY2lhOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX0FjYWNpYV9EZWNheS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19BY2FjaWFfRGVjYXkuanNvbmBcbiAgICAgIH0sXG4gICAgICBsZWF2ZXNCaXJjaDoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19CaXJjaF9EZWNheS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19CaXJjaF9EZWNheS5qc29uYFxuICAgICAgfSxcbiAgICAgIGxlYXZlc0p1bmdsZToge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19KdW5nbGVfRGVjYXkucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfSnVuZ2xlX0RlY2F5Lmpzb25gXG4gICAgICB9LFxuICAgICAgbGVhdmVzT2FrOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX09ha19EZWNheS5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xlYXZlc19PYWtfRGVjYXkuanNvbmBcbiAgICAgIH0sXG4gICAgICBsZWF2ZXNTcHJ1Y2U6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MZWF2ZXNfU3BydWNlX0RlY2F5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTGVhdmVzX1NwcnVjZV9EZWNheS5qc29uYFxuICAgICAgfSxcbiAgICAgIHNoZWVwOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvU2hlZXAucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9TaGVlcC5qc29uYFxuICAgICAgfSxcbiAgICAgIGNyZWVwZXI6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9DcmVlcGVyLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQ3JlZXBlci5qc29uYFxuICAgICAgfSxcbiAgICAgIGNyb3BzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQ3JvcHMucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9Dcm9wcy5qc29uYFxuICAgICAgfSxcbiAgICAgIHRvcmNoOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvVG9yY2gucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9Ub3JjaC5qc29uYFxuICAgICAgfSxcbiAgICAgIGRlc3Ryb3lPdmVybGF5OiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRGVzdHJveV9PdmVybGF5LnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRGVzdHJveV9PdmVybGF5Lmpzb25gXG4gICAgICB9LFxuICAgICAgYmxvY2tFeHBsb2RlOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQmxvY2tFeHBsb2RlLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvQmxvY2tFeHBsb2RlLmpzb25gXG4gICAgICB9LFxuICAgICAgbWluaW5nUGFydGljbGVzOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTWluaW5nUGFydGljbGVzLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvTWluaW5nUGFydGljbGVzLmpzb25gXG4gICAgICB9LFxuICAgICAgbWluaUJsb2Nrczoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL01pbmlibG9ja3MucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9NaW5pYmxvY2tzLmpzb25gXG4gICAgICB9LFxuICAgICAgbGF2YVBvcDoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0xhdmFQb3AucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9MYXZhUG9wLmpzb25gXG4gICAgICB9LFxuICAgICAgZmlyZToge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0ZpcmUucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9GaXJlLmpzb25gXG4gICAgICB9LFxuICAgICAgYnViYmxlczoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0J1YmJsZXMucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9CdWJibGVzLmpzb25gXG4gICAgICB9LFxuICAgICAgZXhwbG9zaW9uOiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRXhwbG9zaW9uLnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvRXhwbG9zaW9uLmpzb25gXG4gICAgICB9LFxuICAgICAgZG9vcjoge1xuICAgICAgICB0eXBlOiAnYXRsYXNKU09OJyxcbiAgICAgICAgcG5nUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL0Rvb3IucG5nYCxcbiAgICAgICAganNvblBhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9Eb29yLmpzb25gXG4gICAgICB9LFxuICAgICAgcmFpbHM6IHtcbiAgICAgICAgdHlwZTogJ2F0bGFzSlNPTicsXG4gICAgICAgIHBuZ1BhdGg6IGAke3RoaXMuYXNzZXRSb290fWltYWdlcy9SYWlscy5wbmdgLFxuICAgICAgICBqc29uUGF0aDogYCR7dGhpcy5hc3NldFJvb3R9aW1hZ2VzL1JhaWxzLmpzb25gXG4gICAgICB9LFxuICAgICAgdG50OiB7XG4gICAgICAgIHR5cGU6ICdhdGxhc0pTT04nLFxuICAgICAgICBwbmdQYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvVE5ULnBuZ2AsXG4gICAgICAgIGpzb25QYXRoOiBgJHt0aGlzLmFzc2V0Um9vdH1pbWFnZXMvVE5ULmpzb25gXG4gICAgICB9LFxuICAgICAgZGlnX3dvb2QxOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZGlnX3dvb2QxLm1wM2AsXG4gICAgICAgIHdhdjogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZGlnX3dvb2QxLndhdmAsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZGlnX3dvb2QxLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzdGVwR3Jhc3M6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zdGVwX2dyYXNzMS5tcDNgLFxuICAgICAgICB3YXY6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL3N0ZXBfZ3Jhc3MxLndhdmAsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vc3RlcF9ncmFzczEub2dnYFxuICAgICAgfSxcbiAgICAgIHN0ZXBXb29kOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vd29vZDIubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby93b29kMi5vZ2dgXG4gICAgICB9LFxuICAgICAgc3RlcFN0b25lOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vc3RvbmUyLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vc3RvbmUyLm9nZ2BcbiAgICAgIH0sXG4gICAgICBzdGVwR3JhdmVsOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZ3JhdmVsMS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2dyYXZlbDEub2dnYFxuICAgICAgfSxcbiAgICAgIHN0ZXBGYXJtbGFuZDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Nsb3RoNC5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Nsb3RoNC5vZ2dgXG4gICAgICB9LFxuICAgICAgZmFpbHVyZToge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2JyZWFrLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vYnJlYWsub2dnYFxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3M6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9sZXZlbHVwLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vbGV2ZWx1cC5vZ2dgXG4gICAgICB9LFxuICAgICAgZmFsbDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2ZhbGxzbWFsbC5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2ZhbGxzbWFsbC5vZ2dgXG4gICAgICB9LFxuICAgICAgZnVzZToge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Z1c2UubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9mdXNlLm9nZ2BcbiAgICAgIH0sXG4gICAgICBleHBsb2RlOiB7XG4gICAgICAgIHR5cGU6ICdzb3VuZCcsXG4gICAgICAgIG1wMzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZXhwbG9kZTMubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9leHBsb2RlMy5vZ2dgXG4gICAgICB9LFxuICAgICAgcGxhY2VCbG9jazoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Nsb3RoMS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2Nsb3RoMS5vZ2dgXG4gICAgICB9LFxuICAgICAgY29sbGVjdGVkQmxvY2s6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9wb3AubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9wb3Aub2dnYFxuICAgICAgfSxcbiAgICAgIGJ1bXA6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9oaXQzLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vaGl0My5vZ2dgXG4gICAgICB9LFxuICAgICAgcHVuY2g6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9jbG90aDEubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9jbG90aDEub2dnYFxuICAgICAgfSxcbiAgICAgIGZpeno6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9maXp6Lm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vZml6ei5vZ2dgXG4gICAgICB9LFxuICAgICAgZG9vck9wZW46IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9kb29yX29wZW4ubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9kb29yX29wZW4ub2dnYFxuICAgICAgfSxcbiAgICAgIGhvdXNlU3VjY2Vzczoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL2xhdW5jaDEubXAzYCxcbiAgICAgICAgb2dnOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9sYXVuY2gxLm9nZ2BcbiAgICAgIH0sXG4gICAgICBtaW5lY2FydDoge1xuICAgICAgICB0eXBlOiAnc291bmQnLFxuICAgICAgICBtcDM6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL21pbmVjYXJ0QmFzZS5tcDNgLFxuICAgICAgICBvZ2c6IGAke3RoaXMuYXNzZXRSb290fWF1ZGlvL21pbmVjYXJ0QmFzZS5vZ2dgXG4gICAgICB9LFxuICAgICAgc2hlZXBCYWE6IHtcbiAgICAgICAgdHlwZTogJ3NvdW5kJyxcbiAgICAgICAgbXAzOiBgJHt0aGlzLmFzc2V0Um9vdH1hdWRpby9zYXkzLm1wM2AsXG4gICAgICAgIG9nZzogYCR7dGhpcy5hc3NldFJvb3R9YXVkaW8vc2F5My5vZ2dgXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuYXNzZXRQYWNrcyA9IHtcbiAgICAgIGxldmVsT25lQXNzZXRzOiBbXG4gICAgICAgICdlbnRpdHlTaGFkb3cnLFxuICAgICAgICAnc2VsZWN0aW9uSW5kaWNhdG9yJyxcbiAgICAgICAgJ3NoYWRlTGF5ZXInLFxuICAgICAgICAnQU8nLFxuICAgICAgICAnYmxvY2tTaGFkb3dzJyxcbiAgICAgICAgJ2xlYXZlc09haycsXG4gICAgICAgICdsZWF2ZXNCaXJjaCcsXG4gICAgICAgICd0YWxsR3Jhc3MnLFxuICAgICAgICAnYmxvY2tzJyxcbiAgICAgICAgJ3NoZWVwJyxcbiAgICAgICAgJ2J1bXAnLFxuICAgICAgICAnc3RlcEdyYXNzJyxcbiAgICAgICAgJ2ZhaWx1cmUnLFxuICAgICAgICAnc3VjY2VzcydcbiAgICAgIF0sXG4gICAgICBsZXZlbFR3b0Fzc2V0czogW1xuICAgICAgICAnZW50aXR5U2hhZG93JyxcbiAgICAgICAgJ3NlbGVjdGlvbkluZGljYXRvcicsXG4gICAgICAgICdzaGFkZUxheWVyJyxcbiAgICAgICAgJ0FPJyxcbiAgICAgICAgJ2Jsb2NrU2hhZG93cycsXG4gICAgICAgICdsZWF2ZXNTcHJ1Y2UnLFxuICAgICAgICAndGFsbEdyYXNzJyxcbiAgICAgICAgJ2Jsb2NrcycsXG4gICAgICAgICdzaGVlcCcsXG4gICAgICAgICdidW1wJyxcbiAgICAgICAgJ3N0ZXBHcmFzcycsXG4gICAgICAgICdmYWlsdXJlJyxcbiAgICAgICAgJ3BsYXllclN0ZXZlJyxcbiAgICAgICAgJ3N1Y2Nlc3MnLFxuICAgICAgICAnbWluaUJsb2NrcycsXG4gICAgICAgICdibG9ja0V4cGxvZGUnLFxuICAgICAgICAnbWluaW5nUGFydGljbGVzJyxcbiAgICAgICAgJ2Rlc3Ryb3lPdmVybGF5JyxcbiAgICAgICAgJ2RpZ193b29kMScsXG4gICAgICAgICdjb2xsZWN0ZWRCbG9jaycsXG4gICAgICAgICdwdW5jaCcsXG4gICAgICBdLFxuICAgICAgbGV2ZWxUaHJlZUFzc2V0czogW1xuICAgICAgICAnZW50aXR5U2hhZG93JyxcbiAgICAgICAgJ3NlbGVjdGlvbkluZGljYXRvcicsXG4gICAgICAgICdzaGFkZUxheWVyJyxcbiAgICAgICAgJ0FPJyxcbiAgICAgICAgJ2Jsb2NrU2hhZG93cycsXG4gICAgICAgICdsZWF2ZXNPYWsnLFxuICAgICAgICAndGFsbEdyYXNzJyxcbiAgICAgICAgJ2Jsb2NrcycsXG4gICAgICAgICdzaGVlcCcsXG4gICAgICAgICdidW1wJyxcbiAgICAgICAgJ3N0ZXBHcmFzcycsXG4gICAgICAgICdmYWlsdXJlJyxcbiAgICAgICAgJ3BsYXllclN0ZXZlJyxcbiAgICAgICAgJ3N1Y2Nlc3MnLFxuICAgICAgICAnbWluaUJsb2NrcycsXG4gICAgICAgICdibG9ja0V4cGxvZGUnLFxuICAgICAgICAnbWluaW5nUGFydGljbGVzJyxcbiAgICAgICAgJ2Rlc3Ryb3lPdmVybGF5JyxcbiAgICAgICAgJ2RpZ193b29kMScsXG4gICAgICAgICdjb2xsZWN0ZWRCbG9jaycsXG4gICAgICAgICdzaGVlcEJhYScsXG4gICAgICAgICdwdW5jaCcsXG4gICAgICBdLFxuICAgICAgYWxsQXNzZXRzTWludXNQbGF5ZXI6IFtcbiAgICAgICAgJ2VudGl0eVNoYWRvdycsXG4gICAgICAgICdzZWxlY3Rpb25JbmRpY2F0b3InLFxuICAgICAgICAnc2hhZGVMYXllcicsXG4gICAgICAgICd0YWxsR3Jhc3MnLFxuICAgICAgICAnZmluaXNoT3ZlcmxheScsXG4gICAgICAgICdiZWQnLFxuICAgICAgICAnQU8nLFxuICAgICAgICAnYmxvY2tTaGFkb3dzJyxcbiAgICAgICAgJ3VuZGVyZ3JvdW5kRm93JyxcbiAgICAgICAgJ2Jsb2NrcycsXG4gICAgICAgICdsZWF2ZXNBY2FjaWEnLFxuICAgICAgICAnbGVhdmVzQmlyY2gnLFxuICAgICAgICAnbGVhdmVzSnVuZ2xlJyxcbiAgICAgICAgJ2xlYXZlc09haycsXG4gICAgICAgICdsZWF2ZXNTcHJ1Y2UnLFxuICAgICAgICAnc2hlZXAnLFxuICAgICAgICAnY3JlZXBlcicsXG4gICAgICAgICdjcm9wcycsXG4gICAgICAgICd0b3JjaCcsXG4gICAgICAgICdkZXN0cm95T3ZlcmxheScsXG4gICAgICAgICdibG9ja0V4cGxvZGUnLFxuICAgICAgICAnbWluaW5nUGFydGljbGVzJyxcbiAgICAgICAgJ21pbmlCbG9ja3MnLFxuICAgICAgICAnbGF2YVBvcCcsXG4gICAgICAgICdmaXJlJyxcbiAgICAgICAgJ2J1YmJsZXMnLFxuICAgICAgICAnZXhwbG9zaW9uJyxcbiAgICAgICAgJ2Rvb3InLFxuICAgICAgICAncmFpbHMnLFxuICAgICAgICAndG50JyxcbiAgICAgICAgJ2RpZ193b29kMScsXG4gICAgICAgICdzdGVwR3Jhc3MnLFxuICAgICAgICAnc3RlcFdvb2QnLFxuICAgICAgICAnc3RlcFN0b25lJyxcbiAgICAgICAgJ3N0ZXBHcmF2ZWwnLFxuICAgICAgICAnc3RlcEZhcm1sYW5kJyxcbiAgICAgICAgJ2ZhaWx1cmUnLFxuICAgICAgICAnc3VjY2VzcycsXG4gICAgICAgICdmYWxsJyxcbiAgICAgICAgJ2Z1c2UnLFxuICAgICAgICAnZXhwbG9kZScsXG4gICAgICAgICdwbGFjZUJsb2NrJyxcbiAgICAgICAgJ2NvbGxlY3RlZEJsb2NrJyxcbiAgICAgICAgJ2J1bXAnLFxuICAgICAgICAncHVuY2gnLFxuICAgICAgICAnZml6eicsXG4gICAgICAgICdkb29yT3BlbicsXG4gICAgICAgICdob3VzZVN1Y2Nlc3MnLFxuICAgICAgICAnbWluZWNhcnQnLFxuICAgICAgICAnc2hlZXBCYWEnXG4gICAgICBdLFxuICAgICAgcGxheWVyU3RldmU6IFtcbiAgICAgICAgJ3BsYXllclN0ZXZlJ1xuICAgICAgXSxcbiAgICAgIHBsYXllckFsZXg6IFtcbiAgICAgICAgJ3BsYXllckFsZXgnXG4gICAgICBdLFxuICAgICAgZ3Jhc3M6IFtcbiAgICAgICAgJ3RhbGxHcmFzcydcbiAgICAgIF1cbiAgICB9O1xuICB9XG5cbiAgbG9hZFBhY2tzKHBhY2tMaXN0KSB7XG4gICAgcGFja0xpc3QuZm9yRWFjaCgocGFja05hbWUpID0+IHtcbiAgICAgIHRoaXMubG9hZFBhY2socGFja05hbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9hZFBhY2socGFja05hbWUpIHtcbiAgICBsZXQgcGFja0Fzc2V0cyA9IHRoaXMuYXNzZXRQYWNrc1twYWNrTmFtZV07XG4gICAgdGhpcy5sb2FkQXNzZXRzKHBhY2tBc3NldHMpO1xuICB9XG5cbiAgbG9hZEFzc2V0cyhhc3NldE5hbWVzKSB7XG4gICAgYXNzZXROYW1lcy5mb3JFYWNoKChhc3NldEtleSkgPT4ge1xuICAgICAgbGV0IGFzc2V0Q29uZmlnID0gdGhpcy5hc3NldHNbYXNzZXRLZXldO1xuICAgICAgdGhpcy5sb2FkQXNzZXQoYXNzZXRLZXksIGFzc2V0Q29uZmlnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRBc3NldChrZXksIGNvbmZpZykge1xuICAgIHN3aXRjaChjb25maWcudHlwZSkge1xuICAgICAgY2FzZSAnaW1hZ2UnOlxuICAgICAgICB0aGlzLmdhbWUubG9hZC5pbWFnZShrZXksIGNvbmZpZy5wYXRoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzb3VuZCc6XG4gICAgICAgIHRoaXMuYXVkaW9QbGF5ZXIucmVnaXN0ZXIoe1xuICAgICAgICAgIGlkOiBrZXksXG4gICAgICAgICAgbXAzOiBjb25maWcubXAzLFxuICAgICAgICAgIG9nZzogY29uZmlnLm9nZ1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdhdGxhc0pTT04nOlxuICAgICAgICB0aGlzLmdhbWUubG9hZC5hdGxhc0pTT05IYXNoKGtleSwgY29uZmlnLnBuZ1BhdGgsIGNvbmZpZy5qc29uUGF0aCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgYEFzc2V0ICR7a2V5fSBuZWVkcyBjb25maWcudHlwZSBzZXQgaW4gY29uZmlndXJhdGlvbi5gO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IENvbW1hbmRRdWV1ZSBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL0NvbW1hbmRRdWV1ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvQmFzZUNvbW1hbmQuanNcIjtcbmltcG9ydCBEZXN0cm95QmxvY2tDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvRGVzdHJveUJsb2NrQ29tbWFuZC5qc1wiO1xuaW1wb3J0IFBsYWNlQmxvY2tDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvUGxhY2VCbG9ja0NvbW1hbmQuanNcIjtcbmltcG9ydCBQbGFjZUluRnJvbnRDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvUGxhY2VJbkZyb250Q29tbWFuZC5qc1wiO1xuaW1wb3J0IE1vdmVGb3J3YXJkQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFF1ZXVlL01vdmVGb3J3YXJkQ29tbWFuZC5qc1wiO1xuaW1wb3J0IFR1cm5Db21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvVHVybkNvbW1hbmQuanNcIjtcbmltcG9ydCBXaGlsZUNvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRRdWV1ZS9XaGlsZUNvbW1hbmQuanNcIjtcbmltcG9ydCBJZkJsb2NrQWhlYWRDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvSWZCbG9ja0FoZWFkQ29tbWFuZC5qc1wiO1xuaW1wb3J0IENoZWNrU29sdXRpb25Db21tYW5kIGZyb20gXCIuLi9Db21tYW5kUXVldWUvQ2hlY2tTb2x1dGlvbkNvbW1hbmQuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldChjb250cm9sbGVyKSB7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGJlZm9yZSBhIGxpc3Qgb2YgdXNlciBjb21tYW5kcyB3aWxsIGJlIGlzc3VlZC5cbiAgICAgKi9cbiAgICBzdGFydENvbW1hbmRDb2xsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChjb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ29sbGVjdGluZyBjb21tYW5kcy5cIik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIGFuIGF0dGVtcHQgc2hvdWxkIGJlIHN0YXJ0ZWQsIGFuZCB0aGUgZW50aXJlIHNldCBvZlxuICAgICAqIGNvbW1hbmQtcXVldWUgQVBJIGNhbGxzIGhhdmUgYmVlbiBpc3N1ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkF0dGVtcHRDb21wbGV0ZSAtIGNhbGxiYWNrIHdpdGggdHdvIHBhcmFtZXRlcnMsXG4gICAgICogXCJzdWNjZXNzXCIsIGkuZS4sIHRydWUgaWYgYXR0ZW1wdCB3YXMgc3VjY2Vzc2Z1bCAobGV2ZWwgY29tcGxldGVkKSxcbiAgICAgKiBmYWxzZSBpZiB1bnN1Y2Nlc3NmdWwgKGxldmVsIG5vdCBjb21wbGV0ZWQpLCBhbmQgdGhlIGN1cnJlbnQgbGV2ZWwgbW9kZWwuXG4gICAgICovXG4gICAgc3RhcnRBdHRlbXB0OiBmdW5jdGlvbihvbkF0dGVtcHRDb21wbGV0ZSkge1xuICAgICAgICBjb250cm9sbGVyLk9uQ29tcGxldGVDYWxsYmFjayA9IG9uQXR0ZW1wdENvbXBsZXRlO1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IENoZWNrU29sdXRpb25Db21tYW5kKGNvbnRyb2xsZXIpKTtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5iZWdpbigpO1xuICAgIH0sXG5cbiAgICByZXNldEF0dGVtcHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb250cm9sbGVyLnJlc2V0KCk7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUucmVzZXQoKTtcbiAgICAgICAgY29udHJvbGxlci5PbkNvbXBsZXRlQ2FsbGJhY2sgPSBudWxsO1xuICAgIH0sXG5cbiAgICBtb3ZlRm9yd2FyZDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2spIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBNb3ZlRm9yd2FyZENvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spKTtcbiAgICB9LFxuXG4gICAgdHVybjogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2ssIGRpcmVjdGlvbikge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IFR1cm5Db21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBkaXJlY3Rpb24gPT09ICdyaWdodCcgPyAxIDogLTEpKTtcbiAgICB9LFxuXG4gICAgdHVyblJpZ2h0OiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IFR1cm5Db21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCAxKSk7XG4gICAgfSxcblxuICAgIHR1cm5MZWZ0OiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IFR1cm5Db21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCAtMSkpO1xuICAgIH0sXG5cbiAgICBkZXN0cm95QmxvY2s6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgRGVzdHJveUJsb2NrQ29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaykpO1xuICAgIH0sXG5cbiAgICBwbGFjZUJsb2NrOiBmdW5jdGlvbihoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgUGxhY2VCbG9ja0NvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSkpO1xuICAgIH0sXG5cbiAgICBwbGFjZUluRnJvbnQ6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUpIHtcbiAgICAgICAgY29udHJvbGxlci5xdWV1ZS5hZGRDb21tYW5kKG5ldyBQbGFjZUluRnJvbnRDb21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUpKTtcbiAgICB9LFxuXG4gICAgdGlsbFNvaWw6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgUGxhY2VJbkZyb250Q29tbWFuZChjb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgJ3dhdGVyaW5nJykpO1xuICAgIH0sXG5cbiAgICB3aGlsZVBhdGhBaGVhZDogZnVuY3Rpb24oaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY29kZUJsb2NrKSB7XG4gICAgICAgIGNvbnRyb2xsZXIucXVldWUuYWRkQ29tbWFuZChuZXcgV2hpbGVDb21tYW5kKGNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUsIGNvZGVCbG9jaykpO1xuICAgIH0sXG5cbiAgICBpZkJsb2NrQWhlYWQ6IGZ1bmN0aW9uKGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUsIGNvZGVCbG9jaykge1xuICAgICAgICBjb250cm9sbGVyLnF1ZXVlLmFkZENvbW1hbmQobmV3IElmQmxvY2tBaGVhZENvbW1hbmQoY29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSwgY29kZUJsb2NrKSk7XG4gICAgfSxcblxuICAgIGdldFNjcmVlbnNob3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY29udHJvbGxlci5nZXRTY3JlZW5zaG90KCk7XG4gICAgfVxuICB9O1xufVxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IENvbW1hbmRRdWV1ZSBmcm9tIFwiLi9Db21tYW5kUXVldWUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaGlsZUNvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLml0ZXJhdGlvbnNMZWZ0ID0gMTU7IFxuICAgICAgICB0aGlzLkJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcbiAgICAgICAgdGhpcy5XaGlsZUNvZGUgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5xdWV1ZSA9IG5ldyBDb21tYW5kUXVldWUodGhpcyk7XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgICAgLy8gZG8gc3R1ZmZcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLldPUktJTkcgKSB7XG4gICAgICAgICAgICAvLyB0aWNrIG91ciBjb21tYW5kIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnRpY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnF1ZXVlLmlzRmFpbGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMucXVldWUuaXNTdWNjZWVkZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVXaGlsZUNoZWNrKCk7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV0hJTEUgY29tbWFuZDogQkVHSU5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXR1cCB0aGUgd2hpbGUgY2hlY2sgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgdGhpcy5oYW5kbGVXaGlsZUNoZWNrKCk7XG4gICAgfVxuXG4gICAgaGFuZGxlV2hpbGVDaGVjaygpIHtcbiAgICAgICAgaWYgKHRoaXMuaXRlcmF0aW9uc0xlZnQgPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuaXNQYXRoQWhlYWQodGhpcy5CbG9ja1R5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLnF1ZXVlLnNldFdoaWxlQ29tbWFuZEluc2VydFN0YXRlKHRoaXMucXVldWUpO1xuICAgICAgICAgICAgdGhpcy5XaGlsZUNvZGUoKTtcbiAgICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucXVldWUuc2V0V2hpbGVDb21tYW5kSW5zZXJ0U3RhdGUobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLmJlZ2luKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLml0ZXJhdGlvbnNMZWZ0LS07XG4gICAgICAgIGlmICh0aGlzLkdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgV2hpbGUgY29tbWFuZDogSXRlcmF0aW9uc2xlZnQgICAke3RoaXMuaXRlcmF0aW9uc0xlZnR9IGApO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUdXJuQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGRpcmVjdGlvbikge1xuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5EaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgICAgLy8gZG8gc3R1ZmY/P1xuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgaWYgKHRoaXMuR2FtZUNvbnRyb2xsZXIuREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBUVVJOIGNvbW1hbmQ6IEJFR0lOIHR1cm5pbmcgJHt0aGlzLkRpcmVjdGlvbn0gIGApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIudHVybih0aGlzLCB0aGlzLkRpcmVjdGlvbik7XG4gICAgfVxuXG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGFjZUluRnJvbnRDb21tYW5kIGV4dGVuZHMgQmFzZUNvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaywgYmxvY2tUeXBlKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLkJsb2NrVHlwZSA9IGJsb2NrVHlwZTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZj8/XG4gICAgfVxuICAgIFxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLnBsYWNlQmxvY2tGb3J3YXJkKHRoaXMsIHRoaXMuQmxvY2tUeXBlKTtcbiAgICB9XG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGFjZUJsb2NrQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2ssIGJsb2NrVHlwZSkge1xuICAgICAgICBzdXBlcihnYW1lQ29udHJvbGxlciwgaGlnaGxpZ2h0Q2FsbGJhY2spO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5CbG9ja1R5cGUgPSBibG9ja1R5cGU7XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgICAgLy8gZG8gc3R1ZmY/P1xuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5wbGFjZUJsb2NrKHRoaXMsIHRoaXMuQmxvY2tUeXBlKTtcbiAgICB9XG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZlRm9yd2FyZENvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKSB7XG5cbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZlxuICAgIH1cblxuICAgIGJlZ2luKCkge1xuICAgICAgICBzdXBlci5iZWdpbigpO1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyLm1vdmVGb3J3YXJkKHRoaXMpO1xuICAgIH1cblxufVxuXG4iLCJcbmltcG9ydCBDb21tYW5kU3RhdGUgZnJvbSBcIi4vQ29tbWFuZFN0YXRlLmpzXCI7XG5pbXBvcnQgQ29tbWFuZFF1ZXVlIGZyb20gXCIuL0NvbW1hbmRRdWV1ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElmQmxvY2tBaGVhZENvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrLCBibG9ja1R5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHN1cGVyKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjayk7XG5cbiAgICAgICAgdGhpcy5ibG9ja1R5cGUgPSBibG9ja1R5cGU7XG4gICAgICAgIHRoaXMuaWZDb2RlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgICAgICB0aGlzLnF1ZXVlID0gbmV3IENvbW1hbmRRdWV1ZSh0aGlzKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLldPUktJTkcgKSB7XG4gICAgICAgICAgICAvLyB0aWNrIG91ciBjb21tYW5kIHF1ZXVlXG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnRpY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnF1ZXVlLmlzRmFpbGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuRkFJTFVSRTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnF1ZXVlLmlzU3VjY2VlZGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuU1VDQ0VTUztcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIHN1cGVyLmJlZ2luKCk7XG4gICAgICAgIGlmICh0aGlzLkdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIldISUxFIGNvbW1hbmQ6IEJFR0lOXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0dXAgdGhlIFwiaWZcIiBjaGVja1xuICAgICAgICB0aGlzLmhhbmRsZUlmQ2hlY2soKTtcbiAgICB9XG5cbiAgICBoYW5kbGVJZkNoZWNrKCkge1xuICAgICAgICBpZiAodGhpcy5HYW1lQ29udHJvbGxlci5pc1BhdGhBaGVhZCh0aGlzLmJsb2NrVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMucXVldWUucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucXVldWUuc2V0V2hpbGVDb21tYW5kSW5zZXJ0U3RhdGUodGhpcy5xdWV1ZSk7XG4gICAgICAgICAgICB0aGlzLmlmQ29kZUNhbGxiYWNrKCk7IC8vIGluc2VydHMgY29tbWFuZHMgdmlhIENvZGVPcmdBUElcbiAgICAgICAgICAgIHRoaXMuR2FtZUNvbnRyb2xsZXIucXVldWUuc2V0V2hpbGVDb21tYW5kSW5zZXJ0U3RhdGUobnVsbCk7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLmJlZ2luKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuIiwiXG5pbXBvcnQgQ29tbWFuZFN0YXRlIGZyb20gXCIuL0NvbW1hbmRTdGF0ZS5qc1wiO1xuaW1wb3J0IEJhc2VDb21tYW5kIGZyb20gXCIuL0Jhc2VDb21tYW5kLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc3Ryb3lCbG9ja0NvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKSB7XG5cbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGhpZ2hsaWdodENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgICAgICAvLyBkbyBzdHVmZlxuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgc3VwZXIuYmVnaW4oKTtcbiAgICAgICAgdGhpcy5HYW1lQ29udHJvbGxlci5kZXN0cm95QmxvY2sodGhpcyk7XG4gICAgfVxuXG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcbmltcG9ydCBDb21tYW5kUXVldWUgZnJvbSBcIi4vQ29tbWFuZFF1ZXVlLmpzXCI7XG5pbXBvcnQgQmFzZUNvbW1hbmQgZnJvbSBcIi4vQmFzZUNvbW1hbmQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hlY2tTb2x1dGlvbkNvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZUNvbnRyb2xsZXIpIHtcbiAgICAgICAgdmFyIGR1bW15RnVuYyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFeGVjdXRlIHNvbHZlIGNvbW1hbmRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc3VwZXIoZ2FtZUNvbnRyb2xsZXIsIGR1bW15RnVuYyk7XG4gICAgfVxuXG4gICAgdGljaygpIHtcbiAgICAgICAgLy8gZG8gc3R1ZmZcbiAgICB9XG4gICAgXG4gICAgYmVnaW4oKSB7XG4gICAgICAgIHN1cGVyLmJlZ2luKCk7XG4gICAgICAgIGlmICh0aGlzLkdhbWVDb250cm9sbGVyLkRFQlVHKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNvbHZlIGNvbW1hbmQ6IEJFR0lOXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLkdhbWVDb250cm9sbGVyLmNoZWNrU29sdXRpb24odGhpcyk7XG4gICAgfVxuXG59XG5cbiIsImltcG9ydCBCYXNlQ29tbWFuZCBmcm9tIFwiLi9CYXNlQ29tbWFuZFwiO1xuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kUXVldWUge1xuICBjb25zdHJ1Y3RvcihnYW1lQ29udHJvbGxlcikge1xuICAgIHRoaXMuZ2FtZUNvbnRyb2xsZXIgPSBnYW1lQ29udHJvbGxlcjtcbiAgICB0aGlzLmdhbWUgPSBnYW1lQ29udHJvbGxlci5nYW1lO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIGFkZENvbW1hbmQoY29tbWFuZCkge1xuICAgIC8vIGlmIHdlJ3JlIGhhbmRsaW5nIGEgd2hpbGUgY29tbWFuZCwgYWRkIHRvIHRoZSB3aGlsZSBjb21tYW5kJ3MgcXVldWUgaW5zdGVhZCBvZiB0aGlzIHF1ZXVlXG4gICAgaWYgKHRoaXMud2hpbGVDb21tYW5kUXVldWUpIHtcbiAgICAgIHRoaXMud2hpbGVDb21tYW5kUXVldWUuYWRkQ29tbWFuZChjb21tYW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb21tYW5kTGlzdF8ucHVzaChjb21tYW5kKTtcbiAgICB9XG4gIH1cblxuICBzZXRXaGlsZUNvbW1hbmRJbnNlcnRTdGF0ZShxdWV1ZSkge1xuICAgIHRoaXMud2hpbGVDb21tYW5kUXVldWUgPSBxdWV1ZTtcbiAgfVxuXG4gIGJlZ2luKCkge1xuICAgIHRoaXMuc3RhdGUgPSBDb21tYW5kU3RhdGUuV09SS0lORztcbiAgICBpZiAodGhpcy5nYW1lQ29udHJvbGxlci5ERUJVRykge1xuICAgICAgY29uc29sZS5sb2coXCJEZWJ1ZyBRdWV1ZTogQkVHSU5cIik7XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5OT1RfU1RBUlRFRDtcbiAgICB0aGlzLmN1cnJlbnRDb21tYW5kID0gbnVsbDtcbiAgICB0aGlzLmNvbW1hbmRMaXN0XyA9IFtdO1xuICAgIGlmICh0aGlzLndoaWxlQ29tbWFuZFF1ZXVlKSB7XG4gICAgICB0aGlzLndoaWxlQ29tbWFuZFF1ZXVlLnJlc2V0KCk7XG4gICAgfVxuICAgIHRoaXMud2hpbGVDb21tYW5kUXVldWUgPSBudWxsO1xuICB9XG5cbiAgdGljaygpIHtcbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLldPUktJTkcpIHtcbiAgICAgIGlmICghdGhpcy5jdXJyZW50Q29tbWFuZCkge1xuICAgICAgICBpZiAodGhpcy5jb21tYW5kTGlzdF8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5TVUNDRVNTO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRDb21tYW5kID0gdGhpcy5jb21tYW5kTGlzdF8uc2hpZnQoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmN1cnJlbnRDb21tYW5kLmlzU3RhcnRlZCgpKSB7XG4gICAgICAgIHRoaXMuY3VycmVudENvbW1hbmQuYmVnaW4oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY3VycmVudENvbW1hbmQudGljaygpO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBpZiBjb21tYW5kIGlzIGRvbmVcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRDb21tYW5kLmlzU3VjY2VlZGVkKCkpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q29tbWFuZCA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudENvbW1hbmQuaXNGYWlsZWQoKSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIHN0YXJ0ZWQgd29ya2luZy5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1N0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgIT09IENvbW1hbmRTdGF0ZS5OT1RfU1RBUlRFRDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjb21tYW5kIGhhcyBzdWNjZWVkZWQgb3IgZmFpbGVkLCBhbmQgaXNcbiAgICogZmluaXNoZWQgd2l0aCBpdHMgd29yay5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0ZpbmlzaGVkKCkge1xuICAgIHJldHVybiB0aGlzLmlzU3VjY2VlZGVkKCkgfHwgdGhpcy5pc0ZhaWxlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIGZpbmlzaGVkIHdpdGggaXRzIHdvcmsgYW5kIHJlcG9ydGVkIHN1Y2Nlc3MuXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNTdWNjZWVkZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IENvbW1hbmRTdGF0ZS5TVUNDRVNTO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIGZpbmlzaGVkIHdpdGggaXRzIHdvcmsgYW5kIHJlcG9ydGVkIGZhaWx1cmUuXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNGYWlsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICB9XG59XG5cbiIsIlxuaW1wb3J0IENvbW1hbmRTdGF0ZSBmcm9tIFwiLi9Db21tYW5kU3RhdGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUNvbW1hbmQge1xuICAgIGNvbnN0cnVjdG9yKGdhbWVDb250cm9sbGVyLCBoaWdobGlnaHRDYWxsYmFjaykge1xuICAgICAgICB0aGlzLkdhbWVDb250cm9sbGVyID0gZ2FtZUNvbnRyb2xsZXI7XG4gICAgICAgIHRoaXMuR2FtZSA9IGdhbWVDb250cm9sbGVyLmdhbWU7XG4gICAgICAgIHRoaXMuSGlnaGxpZ2h0Q2FsbGJhY2sgPSBoaWdobGlnaHRDYWxsYmFjaztcbiAgICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5OT1RfU1RBUlRFRDtcbiAgICB9XG5cbiAgICB0aWNrKCkge1xuICAgIH1cbiAgICBcbiAgICBiZWdpbigpIHtcbiAgICAgICAgaWYgKHRoaXMuSGlnaGxpZ2h0Q2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRoaXMuSGlnaGxpZ2h0Q2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLldPUktJTkc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgc3RhcnRlZCB3b3JraW5nLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzU3RhcnRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgIT0gQ29tbWFuZFN0YXRlLk5PVF9TVEFSVEVEO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIHN1Y2NlZWRlZCBvciBmYWlsZWQsIGFuZCBpc1xuICAgICAqIGZpbmlzaGVkIHdpdGggaXRzIHdvcmsuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNGaW5pc2hlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNTdWNjZWVkZWQoKSB8fCB0aGlzLmlzRmFpbGVkKCk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGNvbW1hbmQgaGFzIGZpbmlzaGVkIHdpdGggaXRzIHdvcmsgYW5kIHJlcG9ydGVkIHN1Y2Nlc3MuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICBpc1N1Y2NlZWRlZCgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlID09PSBDb21tYW5kU3RhdGUuU1VDQ0VTUyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgY29tbWFuZCBoYXMgZmluaXNoZWQgd2l0aCBpdHMgd29yayBhbmQgcmVwb3J0ZWQgZmFpbHVyZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgIGlzRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gQ29tbWFuZFN0YXRlLkZBSUxVUkU7XG4gICB9XG5cbiAgIHN1Y2NlZWRlZCgpIHtcbiAgICAgICB0aGlzLnN0YXRlID0gQ29tbWFuZFN0YXRlLlNVQ0NFU1M7XG4gICB9XG4gICAgXG4gICBmYWlsZWQoKSB7XG4gICAgICAgdGhpcy5zdGF0ZSA9IENvbW1hbmRTdGF0ZS5GQUlMVVJFO1xuICAgfVxufVxuXG4iLCJcbmV4cG9ydCBkZWZhdWx0IE9iamVjdC5mcmVlemUoe1xuICAgIE5PVF9TVEFSVEVEOiAwLFxuICAgIFdPUktJTkc6IDEsXG4gICAgU1VDQ0VTUzogMixcbiAgICBGQUlMVVJFOiAzXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPGgxIGNsYXNzPVwibWluZWNyYWZ0LWJpZy15ZWxsb3ctaGVhZGVyXCIgaWQ9XCJnZXR0aW5nLXN0YXJ0ZWQtaGVhZGVyXCI+TGV0XFwncyBnZXQgc3RhcnRlZC48L2gxPlxcblxcbjxoMiBpZD1cInNlbGVjdC1jaGFyYWN0ZXItdGV4dFwiPkNob29zZSB5b3VyIGNoYXJhY3Rlci48L2gyPlxcblxcbjxkaXYgaWQ9XCJjaG9vc2UtY2hhcmFjdGVyLWNvbnRhaW5lclwiPlxcbiAgPGRpdiBjbGFzcz1cIm1pbmVjcmFmdC1jaGFyYWN0ZXJcIiBpZD1cImNob29zZS1zdGV2ZVwiPlxcbiAgICA8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIj5TdGV2ZTwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XCJjaGFyYWN0ZXItcG9ydHJhaXRcIiBpZD1cInN0ZXZlLXBvcnRyYWl0XCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJjaG9vc2UtY2hhcmFjdGVyLWJ1dHRvblwiIGlkPVwiY2hvb3NlLXN0ZXZlLXNlbGVjdFwiPlNlbGVjdDwvZGl2PlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwibWluZWNyYWZ0LWNoYXJhY3RlclwiIGlkPVwiY2hvb3NlLWFsZXhcIj5cXG4gICAgPGgxIGNsYXNzPVwibWluZWNyYWZ0LWJpZy15ZWxsb3ctaGVhZGVyXCI+QWxleDwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XCJjaGFyYWN0ZXItcG9ydHJhaXRcIiBpZD1cImFsZXgtcG9ydHJhaXRcIj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cImNob29zZS1jaGFyYWN0ZXItYnV0dG9uXCIgaWQ9XCJjaG9vc2UtYWxleC1zZWxlY3RcIj5TZWxlY3Q8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgaWQ9XCJjbG9zZS1jaGFyYWN0ZXItc2VsZWN0XCI+PC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIiBpZD1cImdldHRpbmctc3RhcnRlZC1oZWFkZXJcIj5MZXRcXCdzIGJ1aWxkIGEgaG91c2UuPC9oMT5cXG5cXG48aDIgaWQ9XCJzZWxlY3QtaG91c2UtdGV4dFwiPkNob29zZSB0aGUgZmxvb3IgcGxhbiBmb3IgeW91ciBob3VzZS48L2gyPlxcblxcbjxkaXYgaWQ9XCJjaG9vc2UtaG91c2UtY29udGFpbmVyXCI+XFxuICA8ZGl2IGNsYXNzPVwibWluZWNyYWZ0LWhvdXNlXCIgaWQ9XCJjaG9vc2UtaG91c2UtYVwiPlxcbiAgICA8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIj5FYXN5PC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cImhvdXNlLW91dGxpbmUtY29udGFpbmVyXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cImhvdXNlLXBob3RvXCIgaWQ9XCJob3VzZS1hLXBpY3R1cmVcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJjaG9vc2UtaG91c2UtYnV0dG9uXCI+U2VsZWN0PC9kaXY+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XCJtaW5lY3JhZnQtaG91c2VcIiBpZD1cImNob29zZS1ob3VzZS1iXCI+XFxuICAgIDxoMSBjbGFzcz1cIm1pbmVjcmFmdC1iaWcteWVsbG93LWhlYWRlclwiPk1lZGl1bTwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XCJob3VzZS1vdXRsaW5lLWNvbnRhaW5lclwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XCJob3VzZS1waG90b1wiIGlkPVwiaG91c2UtYi1waWN0dXJlXCI+PC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiY2hvb3NlLWhvdXNlLWJ1dHRvblwiPlNlbGVjdDwvZGl2PlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwibWluZWNyYWZ0LWhvdXNlXCIgaWQ9XCJjaG9vc2UtaG91c2UtY1wiPlxcbiAgICA8aDEgY2xhc3M9XCJtaW5lY3JhZnQtYmlnLXllbGxvdy1oZWFkZXJcIj5IYXJkPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cImhvdXNlLW91dGxpbmUtY29udGFpbmVyXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cImhvdXNlLXBob3RvXCIgaWQ9XCJob3VzZS1jLXBpY3R1cmVcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCJjaG9vc2UtaG91c2UtYnV0dG9uXCI+U2VsZWN0PC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG5cXG48ZGl2IGlkPVwiY2xvc2UtaG91c2Utc2VsZWN0XCI+PC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInJpZ2h0LWJ1dHRvbi1jZWxsXCI+XFxuICA8YnV0dG9uIGlkPVwicmlnaHRCdXR0b25cIiBjbGFzcz1cInNoYXJlXCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg1LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiPicsIGVzY2FwZSgoNSwgIG1zZy5maW5pc2goKSApKSwgJ1xcbiAgPC9idXR0b24+XFxuPC9kaXY+XFxuXFxuPCEtLSBUaGlzIGlzIGEgY29tbWVudCB1bmlxdWUgdG8gQ3JhZnQgLS0+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmxvY2tzVG9EaXNwbGF5VGV4dCA9IHtcbiAgYmVkcm9jazogJ2JlZHJvY2snLFxuICBicmlja3M6ICdicmlja3MnLFxuICBjbGF5OiAnY2xheScsXG4gIG9yZUNvYWw6ICdjb2FsIG9yZScsXG4gIGRpcnRDb2Fyc2U6ICdjb2Fyc2UgZGlydCcsXG4gIGNvYmJsZXN0b25lOiAnY29iYmxlc3RvbmUnLFxuICBvcmVEaWFtb25kOiAnZGlhbW9uZCBvcmUnLFxuICBkaXJ0OiAnZGlydCcsXG4gIG9yZUVtZXJhbGQ6ICdlbWVyYWxkIG9yZScsXG4gIGZhcm1sYW5kV2V0OiAnZmFybWxhbmQnLFxuICBnbGFzczogJ2dsYXNzJyxcbiAgb3JlR29sZDogJ2dvbGQgb3JlJyxcbiAgZ3Jhc3M6ICdncmFzcycsXG4gIGdyYXZlbDogJ2dyYXZlbCcsXG4gIGNsYXlIYXJkZW5lZDogJ2hhcmRlbmVkIGNsYXknLFxuICBvcmVJcm9uOiAnaXJvbiBvcmUnLFxuICBvcmVMYXBpczogJ2xhcGlzIG9yZScsXG4gIGxhdmE6ICdsYXZhJyxcbiAgbG9nQWNhY2lhOiAnYWNhY2lhIGxvZycsXG4gIGxvZ0JpcmNoOiAnYmlyY2ggbG9nJyxcbiAgbG9nSnVuZ2xlOiAnanVuZ2xlIGxvZycsXG4gIGxvZ09hazogJ29hayBsb2cnLFxuICBsb2dTcHJ1Y2U6ICdzcHJ1Y2UgbG9nJyxcbiAgcGxhbmtzQWNhY2lhOiAnYWNhY2lhIHBsYW5rcycsXG4gIHBsYW5rc0JpcmNoOiAnYmlyY2ggcGxhbmtzJyxcbiAgcGxhbmtzSnVuZ2xlOiAnanVuZ2xlIHBsYW5rcycsXG4gIHBsYW5rc09hazogJ29hayBwbGFua3MnLFxuICBwbGFua3NTcHJ1Y2U6ICdzcHJ1Y2UgcGxhbmtzJyxcbiAgb3JlUmVkc3RvbmU6ICdyZWRzdG9uZSBvcmUnLFxuICByYWlsOiAncmFpbCcsXG4gIHNhbmQ6ICdzYW5kJyxcbiAgc2FuZHN0b25lOiAnc2FuZHN0b25lJyxcbiAgc3RvbmU6ICdzdG9uZScsXG4gIHRudDogJ3RudCcsXG4gIHRyZWU6ICd0cmVlJyxcbiAgd2F0ZXI6ICd3YXRlcicsXG4gIHdvb2w6ICd3b29sJyxcbiAgJyc6ICdlbXB0eSdcbn07XG5cbnZhciBhbGxCbG9ja3MgPSBbXG4gICdiZWRyb2NrJyxcbiAgJ2JyaWNrcycsXG4gICdjbGF5JyxcbiAgJ29yZUNvYWwnLFxuICAnZGlydENvYXJzZScsXG4gICdjb2JibGVzdG9uZScsXG4gICdvcmVEaWFtb25kJyxcbiAgJ2RpcnQnLFxuICAnb3JlRW1lcmFsZCcsXG4gICdmYXJtbGFuZFdldCcsXG4gICdnbGFzcycsXG4gICdvcmVHb2xkJyxcbiAgJ2dyYXNzJyxcbiAgJ2dyYXZlbCcsXG4gICdjbGF5SGFyZGVuZWQnLFxuICAnb3JlSXJvbicsXG4gICdvcmVMYXBpcycsXG4gICdsYXZhJyxcbiAgJ2xvZ0FjYWNpYScsXG4gICdsb2dCaXJjaCcsXG4gICdsb2dKdW5nbGUnLFxuICAnbG9nT2FrJyxcbiAgJ2xvZ1NwcnVjZScsXG4gICdwbGFua3NBY2FjaWEnLFxuICAncGxhbmtzQmlyY2gnLFxuICAncGxhbmtzSnVuZ2xlJyxcbiAgJ3BsYW5rc09haycsXG4gICdwbGFua3NTcHJ1Y2UnLFxuICAnb3JlUmVkc3RvbmUnLFxuICAnc2FuZCcsXG4gICdzYW5kc3RvbmUnLFxuICAnc3RvbmUnLFxuICAndG50JyxcbiAgJ3RyZWUnLFxuICAnd29vbCddO1xuXG5mdW5jdGlvbiBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoa2V5c0xpc3QpIHtcbiAgcmV0dXJuIGtleXNMaXN0Lm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGRpc3BsYXlUZXh0ID0gKGJsb2Nrc1RvRGlzcGxheVRleHRba2V5XSB8fCBrZXkpO1xuICAgIHJldHVybiBbZGlzcGxheVRleHQsIGtleV07XG4gIH0pO1xufVxuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uIChibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBkcm9wZG93bkJsb2NrcyA9IChibG9ja0luc3RhbGxPcHRpb25zLmxldmVsLmF2YWlsYWJsZUJsb2NrcyB8fCBbXSkuY29uY2F0KFxuICAgIEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdjcmFmdFBsYXllckludmVudG9yeScpKSB8fCBbXSk7XG5cbiAgdmFyIGRyb3Bkb3duQmxvY2tTZXQgPSB7fTtcblxuICBkcm9wZG93bkJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBkcm9wZG93bkJsb2NrU2V0W3R5cGVdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgdmFyIGNyYWZ0QmxvY2tPcHRpb25zID0ge1xuICAgIGludmVudG9yeUJsb2NrczogT2JqZWN0LmtleXMoZHJvcGRvd25CbG9ja1NldCksXG4gICAgaWZCbG9ja09wdGlvbnM6IGJsb2NrSW5zdGFsbE9wdGlvbnMubGV2ZWwuaWZCbG9ja09wdGlvbnMsXG4gICAgcGxhY2VCbG9ja09wdGlvbnM6IGJsb2NrSW5zdGFsbE9wdGlvbnMubGV2ZWwucGxhY2VCbG9ja09wdGlvbnNcbiAgfTtcblxuICB2YXIgaW52ZW50b3J5QmxvY2tzRW1wdHkgPSAhY3JhZnRCbG9ja09wdGlvbnMuaW52ZW50b3J5QmxvY2tzIHx8XG4gICAgICBjcmFmdEJsb2NrT3B0aW9ucy5pbnZlbnRvcnlCbG9ja3MubGVuZ3RoID09PSAwO1xuICB2YXIgYWxsRHJvcGRvd25CbG9ja3MgPSBpbnZlbnRvcnlCbG9ja3NFbXB0eSA/XG4gICAgICBhbGxCbG9ja3MgOiBjcmFmdEJsb2NrT3B0aW9ucy5pbnZlbnRvcnlCbG9ja3M7XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfbW92ZUZvcndhcmQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoXCJtb3ZlIGZvcndhcmRcIikpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfbW92ZUZvcndhcmQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ21vdmVGb3J3YXJkKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3R1cm4gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9UdXJuJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3R1cm4uRElSRUNUSU9OUyA9XG4gICAgICBbW1widHVybiBsZWZ0XCIgKyAnIFxcdTIxQkEnLCAnbGVmdCddLFxuICAgICAgIFtcInR1cm4gcmlnaHRcIiArICcgXFx1MjFCQicsICdyaWdodCddXTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF90dXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIHZhciBkaXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpO1xuICAgIHZhciBtZXRob2RDYWxsID0gZGlyID09PSBcImxlZnRcIiA/IFwidHVybkxlZnRcIiA6IFwidHVyblJpZ2h0XCI7XG4gICAgcmV0dXJuIG1ldGhvZENhbGwgKyAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9kZXN0cm95QmxvY2sgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoXCJkZXN0cm95IGJsb2NrXCIpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X2Rlc3Ryb3lCbG9jayA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnZGVzdHJveUJsb2NrKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9zaGVhciA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChcInNoZWFyXCIpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3NoZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdzaGVhcihcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfd2hpbGVCbG9ja0FoZWFkID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkcm9wZG93bk9wdGlvbnMgPSBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoY3JhZnRCbG9ja09wdGlvbnMuaWZCbG9ja09wdGlvbnMgfHwgYWxsRHJvcGRvd25CbG9ja3MpO1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihkcm9wZG93bk9wdGlvbnMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUoZHJvcGRvd25PcHRpb25zWzBdWzFdKTtcblxuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKFwid2hpbGVcIilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdUWVBFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJhaGVhZFwiKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJkb1wiKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X3doaWxlQmxvY2tBaGVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lckNvZGUgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGJsb2NrVHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiAnd2hpbGVCbG9ja0FoZWFkKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyxcXG5cIicgK1xuICAgICAgICAgICAgYmxvY2tUeXBlICsgJ1wiLCAnICtcbiAgICAgICAgJyAgZnVuY3Rpb24oKSB7ICcrXG4gICAgICAgICAgICBpbm5lckNvZGUgK1xuICAgICAgICAnICB9JyArXG4gICAgICAgICcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfaWZCbG9ja0FoZWFkID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkcm9wZG93bk9wdGlvbnMgPSBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoY3JhZnRCbG9ja09wdGlvbnMuaWZCbG9ja09wdGlvbnMgfHwgYWxsRHJvcGRvd25CbG9ja3MpO1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihkcm9wZG93bk9wdGlvbnMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUoZHJvcGRvd25PcHRpb25zWzBdWzFdKTtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKFwiaWZcIilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdUWVBFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJhaGVhZFwiKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoXCJkb1wiKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpLmNyYWZ0X2lmQmxvY2tBaGVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lckNvZGUgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGJsb2NrVHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiAnaWZCbG9ja0FoZWFkKFwiJyArIGJsb2NrVHlwZSArICdcIiwgZnVuY3Rpb24oKSB7XFxuJyArXG4gICAgICBpbm5lckNvZGUgK1xuICAgICd9LCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9pZkxhdmFBaGVhZCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShcImlmIGxhdmEgYWhlYWRcIik7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKFwiZG9cIik7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9pZkxhdmFBaGVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lckNvZGUgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgcmV0dXJuICdpZkxhdmFBaGVhZChmdW5jdGlvbigpIHtcXG4nICtcbiAgICAgIGlubmVyQ29kZSArXG4gICAgJ30sIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9wbGFjZUJsb2NrID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkcm9wZG93bk9wdGlvbnMgPSBrZXlzVG9Ecm9wZG93bk9wdGlvbnMoY3JhZnRCbG9ja09wdGlvbnMucGxhY2VCbG9ja09wdGlvbnMgfHwgYWxsRHJvcGRvd25CbG9ja3MpO1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihkcm9wZG93bk9wdGlvbnMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUoZHJvcGRvd25PcHRpb25zWzBdWzFdKTtcblxuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKFwicGxhY2VcIilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdUWVBFJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9wbGFjZUJsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJsb2NrVHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiAncGxhY2VCbG9jayhcIicgKyBibG9ja1R5cGUgKyAnXCIsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmFmdF9wbGFjZVRvcmNoID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShcInBsYWNlIHRvcmNoXCIpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfcGxhY2VUb3JjaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAncGxhY2VUb3JjaChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JhZnRfcGxhbnRDcm9wID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZSgncGxhbnQgY3JvcCcpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0JykuY3JhZnRfcGxhbnRDcm9wID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdwbGFudENyb3AoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3RpbGxTb2lsID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZSgndGlsbCBzb2lsJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF90aWxsU29pbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAndGlsbFNvaWwoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyYWZ0X3BsYWNlQmxvY2tBaGVhZCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZHJvcGRvd25PcHRpb25zID0ga2V5c1RvRHJvcGRvd25PcHRpb25zKGNyYWZ0QmxvY2tPcHRpb25zLnBsYWNlQmxvY2tPcHRpb25zIHx8IGFsbERyb3Bkb3duQmxvY2tzKTtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oZHJvcGRvd25PcHRpb25zKTtcbiAgICAgIGRyb3Bkb3duLnNldFZhbHVlKGRyb3Bkb3duT3B0aW9uc1swXVsxXSk7XG5cbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShcInBsYWNlXCIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVFlQRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKFwiYWhlYWRcIik7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKS5jcmFmdF9wbGFjZUJsb2NrQWhlYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYmxvY2tUeXBlID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdUWVBFJyk7XG4gICAgcmV0dXJuICdwbGFjZUJsb2NrQWhlYWQoXCInICsgYmxvY2tUeXBlICsgJ1wiLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lKaWRXbHNaQzlxY3k5amNtRm1kQzloY0drdWFuTWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXMTE5Il19
