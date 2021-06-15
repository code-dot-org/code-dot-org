import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import trackEvent from '../../util/trackEvent';
var studioApp = require('../../StudioApp').singleton;
var craftMsg = require('../locale');
import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {
  GameController,
  EventType,
  utils as CraftUtils
} from '@code-dot-org/craft';
import {handlePlayerSelection} from '@cdo/apps/craft/utils';
var dom = require('../../dom');
import {trySetLocalStorage} from '@cdo/apps/utils';
var houseLevels = require('./houseLevels');
var levelbuilderOverrides = require('./levelbuilderOverrides');
var MusicController = require('../../MusicController');
var Provider = require('react-redux').Provider;
import AppView from '../../templates/AppView';
var CraftVisualizationColumn = require('./CraftVisualizationColumn');
import {getStore} from '../../redux';
import Sounds from '../../Sounds';

import {TestResults} from '../../constants';
import {captureThumbnailFromCanvas} from '../../util/thumbnail';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import PlayerSelectionDialog from '@cdo/apps/craft/PlayerSelectionDialog';
import reducers from '@cdo/apps/craft/redux';

var MEDIA_URL = '/blockly/media/craft/';

/**
 * Create a namespace for the application.
 */
var Craft = module.exports;

var characters = {
  Steve: {
    name: 'Steve',
    staticAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Steve_Neutral.png',
    smallStaticAvatar:
      MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Steve_Neutral.png',
    failureAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Steve_Fail.png',
    winAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Steve_Win.png'
  },
  Alex: {
    name: 'Alex',
    staticAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Alex_Neutral.png',
    smallStaticAvatar:
      MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Alex_Neutral.png',
    failureAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Alex_Fail.png',
    winAvatar: MEDIA_URL + 'Sliced_Parts/Pop_Up_Character_Alex_Win.png'
  }
};

var interfaceImages = {
  DEFAULT: [
    MEDIA_URL + 'Sliced_Parts/MC_Loading_Spinner.gif',
    MEDIA_URL + 'Sliced_Parts/Frame_Large_Plus_Logo.png',
    MEDIA_URL + 'Sliced_Parts/Pop_Up_Slice.png',
    MEDIA_URL + 'Sliced_Parts/X_Button.png',
    MEDIA_URL + 'Sliced_Parts/Button_Grey_Slice.png',
    MEDIA_URL + 'Sliced_Parts/Run_Button_Up_Slice.png',
    MEDIA_URL + 'Sliced_Parts/MC_Run_Arrow_Icon_Smaller.png',
    MEDIA_URL + 'Sliced_Parts/Run_Button_Down_Slice.png',
    MEDIA_URL + 'Sliced_Parts/Reset_Button_Up_Slice.png',
    MEDIA_URL + 'Sliced_Parts/MC_Reset_Arrow_Icon.png',
    MEDIA_URL + 'Sliced_Parts/Reset_Button_Down_Slice.png',
    MEDIA_URL + 'Sliced_Parts/Callout_Tail.png'
  ],
  1: [
    MEDIA_URL + 'Sliced_Parts/Steve_Character_Select.png',
    MEDIA_URL + 'Sliced_Parts/Alex_Character_Select.png',
    characters.Steve.staticAvatar,
    characters.Steve.smallStaticAvatar,
    characters.Alex.staticAvatar,
    characters.Alex.smallStaticAvatar
  ],
  2: [
    // TODO(bjordan): find different pre-load point for feedback images,
    // bucket by selected character
    characters.Alex.winAvatar,
    characters.Steve.winAvatar,
    characters.Alex.failureAvatar,
    characters.Steve.failureAvatar
  ],
  6: [
    MEDIA_URL + 'Sliced_Parts/House_Option_A_v3.png',
    MEDIA_URL + 'Sliced_Parts/House_Option_B_v3.png',
    MEDIA_URL + 'Sliced_Parts/House_Option_C_v3.png'
  ]
};

var MUSIC_METADATA = [
  {volume: 1, hasOgg: true, name: 'vignette1'},
  {volume: 1, hasOgg: true, name: 'vignette2-quiet'},
  {volume: 1, hasOgg: true, name: 'vignette3'},
  {volume: 1, hasOgg: true, name: 'vignette4-intro'},
  {volume: 1, hasOgg: true, name: 'vignette5-shortpiano'},
  {volume: 1, hasOgg: true, name: 'vignette7-funky-chirps-short'},
  {volume: 1, hasOgg: true, name: 'vignette8-free-play'}
];

var CHARACTER_STEVE = 'Steve';
var CHARACTER_ALEX = 'Alex';
var DEFAULT_CHARACTER = CHARACTER_STEVE;

/**
 * Initialize Blockly and the Craft app. Called on page load.
 */
Craft.init = function(config) {
  if (config.level.puzzle_number === 1 && config.level.lesson_total === 1) {
    // Not viewing level within a script, bump puzzle # to unused one so
    // asset loading system and levelbuilder overrides don't think this is
    // level 1 or any other special level.
    config.level.puzzle_number = 999;
  }

  if (config.level.isTestLevel) {
    config.level.customSlowMotion = 0.1;
  }

  config.level.disableFinalLessonMessage = true;

  // Return the version of Internet Explorer (8+) or undefined if not IE.
  var getIEVersion = function() {
    return document.documentMode;
  };

  var ieVersionNumber = getIEVersion();
  if (ieVersionNumber) {
    $('body').addClass('ieVersion' + ieVersionNumber);
  }

  var bodyElement = document.body;
  bodyElement.className = bodyElement.className + ' minecraft';

  // Always add a hook for after the video but before the level proper begins.
  // Use this to start music, and sometimes to show an extra dialog.
  config.level.afterVideoBeforeInstructionsFn = showInstructions => {
    Craft.beginBackgroundMusic();
    if (config.level.showPopupOnLoad) {
      if (config.level.showPopupOnLoad === 'playerSelection') {
        const onPlayerSelected = selectedPlayer => {
          Craft.setCurrentCharacter(selectedPlayer);
          Craft.initializeAppLevel(config.level);
          showInstructions();
        };
        handlePlayerSelection(DEFAULT_CHARACTER, onPlayerSelected);
      } else if (config.level.showPopupOnLoad === 'houseLayoutSelection') {
        Craft.showHouseSelectionPopup(function(selectedHouse) {
          trackEvent('Minecraft', 'ChoseHouse', selectedHouse);
          if (!levelConfig.edit_blocks) {
            Object.assign(config.level, houseLevels[selectedHouse]);

            Blockly.mainBlockSpace.clear();
            studioApp().setStartBlocks_(config, true);
          }
          Craft.initializeAppLevel(config.level);

          // Fire a custom event on the document to trigger a callout
          // showing up.
          var event = document.createEvent('Event');
          event.initEvent('houseLayoutSelected', true, true);
          document.dispatchEvent(event);

          showInstructions();
        });
      }
    } else {
      showInstructions();
    }
  };

  if (
    config.level.puzzle_number &&
    levelbuilderOverrides[config.level.puzzle_number]
  ) {
    Object.assign(
      config.level,
      levelbuilderOverrides[config.level.puzzle_number]
    );
  }
  Craft.initialConfig = config;

  // replace studioApp() methods with our own
  studioApp().reset = this.reset.bind(this);
  studioApp().runButtonClick = this.runButtonClick.bind(this);

  Craft.level = config.level;
  Craft.skin = config.skin;

  var levelTracks = [];
  if (Craft.level.songs && MUSIC_METADATA) {
    levelTracks = MUSIC_METADATA.filter(function(trackMetadata) {
      return Craft.level.songs.indexOf(trackMetadata.name) !== -1;
    });
  }

  Craft.musicController = new MusicController(
    Sounds.getSingleton(),
    function(filename) {
      return config.skin.assetUrl(`music/${filename}`);
    },
    levelTracks,
    levelTracks.length > 1 ? 7500 : null
  );

  // Play music when the instructions are shown
  Craft.beginBackgroundMusic = function() {
    Sounds.getSingleton().whenAudioUnlocked(function() {
      var hasSongInLevel = Craft.level.songs && Craft.level.songs.length > 1;
      var songToPlayFirst = hasSongInLevel ? Craft.level.songs[0] : null;
      Craft.musicController.play(songToPlayFirst);
    });
  };

  var character = characters[Craft.getCurrentCharacter()];
  config.skin.staticAvatar = character.staticAvatar;
  config.skin.smallStaticAvatar = character.smallStaticAvatar;
  config.skin.failureAvatar = character.failureAvatar;
  config.skin.winAvatar = character.winAvatar;

  var levelConfig = config.level;
  var specialLevelType = levelConfig.specialLevelType;
  switch (specialLevelType) {
    case 'houseWallBuild':
      levelConfig.blocksToStore = [
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'houseBottomA',
        'houseBottomB',
        'houseBottomC',
        'houseBottomD',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ];
      break;
  }

  var onMount = function() {
    studioApp().init(
      Object.assign({}, config, {
        forceInsertTopBlock: 'when_run',
        appStrings: {
          generatedCodeDescription: craftMsg.generatedCodeDescription()
        },
        loadAudio: function() {},
        afterInject: function() {
          // NaN if not set
          var slowMotionURLParam = parseFloat(
            (location.search.split('customSlowMotion=')[1] || '').split('&')[0]
          );
          Craft.gameController = new GameController({
            Phaser: window.Phaser,
            containerId: 'phaser-game',
            assetRoot: Craft.skin.assetUrl(''),
            audioPlayer: {
              register: studioApp().registerAudio.bind(studioApp()),
              play: studioApp().playAudio.bind(studioApp())
            },
            debug: false,
            customSlowMotion: config.level.isTestLevel
              ? 0.5
              : slowMotionURLParam,
            /**
             * First asset packs to load while video playing, etc.
             * Won't matter for levels without delayed level initialization
             * (due to e.g. character / house select popups).
             */
            earlyLoadAssetPacks: Craft.earlyLoadAssetsForLevel(
              levelConfig.puzzle_number
            ),
            afterAssetsLoaded: function() {
              // preload music after essential game asset downloads completely finished
              Craft.musicController.preload();
            },
            earlyLoadNiceToHaveAssetPacks: Craft.niceToHaveAssetsForLevel(
              levelConfig.puzzle_number
            )
          });

          if (!config.level.showPopupOnLoad) {
            Craft.initializeAppLevel(config.level);
          }

          if (studioApp().hideSource) {
            // Set visualizationColumn width in share mode so it can be centered
            var visualizationColumn = document.getElementById(
              'visualizationColumn'
            );
            visualizationColumn.style.width = this.nativeVizWidth + 'px';
          }

          // Prevent Phaser from scrolling up on iPhones when it receives a resize event.
          Craft.gameController.game.device.whenReady(
            () => {
              Craft.gameController.game.scale.compatibility.scrollTo = false;
            },
            this,
            false
          );
        },
        twitter: {
          text: 'Share on Twitter',
          hashtag: 'Craft'
        }
      })
    );

    var interfaceImagesToLoad = [];
    interfaceImagesToLoad = interfaceImagesToLoad.concat(
      interfaceImages.DEFAULT
    );

    if (
      config.level.puzzle_number &&
      interfaceImages[config.level.puzzle_number]
    ) {
      interfaceImagesToLoad = interfaceImagesToLoad.concat(
        interfaceImages[config.level.puzzle_number]
      );
    }

    interfaceImagesToLoad.forEach(function(url) {
      preloadImage(url);
    });

    var shareButton = $('.mc-share-button');
    if (shareButton.length) {
      dom.addClickTouchEvent(shareButton[0], function() {
        Craft.reportResult(true);
      });
    }
  };

  // Push initial level properties into the Redux store
  studioApp().setPageConstants(config, {
    isMinecraft: true
  });

  ReactDOM.render(
    <Provider store={getStore()}>
      <div>
        <AppView
          visualizationColumn={
            <CraftVisualizationColumn
              showFinishButton={!config.level.isProjectLevel}
            />
          }
          onMount={onMount}
        />
        <PlayerSelectionDialog players={[CHARACTER_STEVE, CHARACTER_ALEX]} />
      </div>
    </Provider>,
    document.getElementById(config.containerId)
  );
};

var preloadImage = function(url) {
  var img = new Image();
  img.src = url;
};

Craft.getAppReducers = function() {
  return reducers;
};

Craft.characterAssetPackName = function(playerName) {
  return 'player' + playerName;
};

Craft.getCurrentCharacter = function() {
  return (
    window.localStorage.getItem('craftSelectedPlayer') || DEFAULT_CHARACTER
  );
};

Craft.setCurrentCharacter = function(name) {
  trackEvent('Minecraft', 'ChoseCharacter', name);
  Craft.clearPlayerState();
  trySetLocalStorage('craftSelectedPlayer', name);
  Craft.updateUIForCharacter(name);
};

Craft.updateUIForCharacter = function(character) {
  Craft.initialConfig.skin.staticAvatar = characters[character].staticAvatar;
  Craft.initialConfig.skin.smallStaticAvatar =
    characters[character].smallStaticAvatar;
  Craft.initialConfig.skin.failureAvatar = characters[character].failureAvatar;
  Craft.initialConfig.skin.winAvatar = characters[character].winAvatar;
  studioApp().setIconsFromSkin(Craft.initialConfig.skin);
  $('#prompt-icon').attr('src', characters[character].smallStaticAvatar);
};

Craft.showHouseSelectionPopup = function(onSelectedCallback) {
  var popupDiv = document.createElement('div');
  popupDiv.innerHTML = require('./dialogs/houseSelection.html.ejs')({
    image: studioApp().assetUrl()
  });
  var selectedHouse = 'houseA';

  var popupDialog = studioApp().createModalDialog({
    contentDiv: popupDiv,
    defaultBtnSelector: '#choose-house-a',
    onHidden: function() {
      onSelectedCallback(selectedHouse);
    },
    id: 'craft-popup-house-selection',
    icon: characters[Craft.getCurrentCharacter()].staticAvatar
  });

  dom.addClickTouchEvent(
    $('#close-house-select')[0],
    function() {
      popupDialog.hide();
    }.bind(this)
  );
  dom.addClickTouchEvent(
    $('#choose-house-a')[0],
    function() {
      selectedHouse = 'houseA';
      trackEvent('Minecraft', 'ClickedHouse', selectedHouse);
      popupDialog.hide();
    }.bind(this)
  );
  dom.addClickTouchEvent(
    $('#choose-house-b')[0],
    function() {
      selectedHouse = 'houseB';
      trackEvent('Minecraft', 'ClickedHouse', selectedHouse);
      popupDialog.hide();
    }.bind(this)
  );
  dom.addClickTouchEvent(
    $('#choose-house-c')[0],
    function() {
      selectedHouse = 'houseC';
      trackEvent('Minecraft', 'ClickedHouse', selectedHouse);
      popupDialog.hide();
    }.bind(this)
  );

  popupDialog.show();
};

Craft.clearPlayerState = function() {
  window.localStorage.removeItem('craftHouseBlocks');
  window.localStorage.removeItem('craftPlayerInventory');
  window.localStorage.removeItem('craftSelectedPlayer');
  window.localStorage.removeItem('craftSelectedHouse');
};

Craft.onHouseSelected = function(houseType) {
  trySetLocalStorage('craftSelectedHouse', houseType);
};

Craft.initializeAppLevel = function(levelConfig) {
  CraftUtils.convertActionPlaneEntitiesToConfig(levelConfig);

  var houseBlocks = JSON.parse(window.localStorage.getItem('craftHouseBlocks'));
  Craft.foldInCustomHouseBlocks(houseBlocks, levelConfig);

  var fluffPlane = [];
  // TODO(bjordan): remove configuration requirement in visualization
  for (
    var i = 0;
    i < (levelConfig.gridWidth || 10) * (levelConfig.gridHeight || 10);
    i++
  ) {
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
    entities: levelConfig.entities,
    playerStartPosition: levelConfig.playerStartPosition,
    playerStartDirection: levelConfig.playerStartDirection,
    playerName: Craft.getCurrentCharacter(),
    assetPacks: levelAssetPacks,
    specialLevelType: levelConfig.specialLevelType,
    houseBottomRight: levelConfig.houseBottomRight,
    gridDimensions:
      levelConfig.gridWidth && levelConfig.gridHeight
        ? [levelConfig.gridWidth, levelConfig.gridHeight]
        : null,
    // eslint-disable-next-line no-eval
    verificationFunction: eval('[' + levelConfig.verificationFunction + ']')[0] // TODO(bjordan): add to utils
  });
};

Craft.minAssetsForLevelWithCharacter = function(levelNumber) {
  return Craft.minAssetsForLevelNumber(levelNumber).concat([
    Craft.characterAssetPackName(Craft.getCurrentCharacter())
  ]);
};

Craft.minAssetsForLevelNumber = function(levelNumber) {
  switch (levelNumber) {
    case 1:
      return ['adventurerLevelOneAssets'];
    case 2:
      return ['adventurerLevelTwoAssets'];
    case 3:
      return ['adventurerLevelThreeAssets'];
    default:
      return ['adventurerAllAssetsMinusPlayer'];
  }
};

Craft.afterLoadAssetsForLevel = function(levelNumber) {
  // After level loads & player starts playing, kick off further asset downloads
  switch (levelNumber) {
    case 1:
      // can disable if performance issue on early level 1
      return Craft.minAssetsForLevelNumber(2);
    case 2:
      return Craft.minAssetsForLevelNumber(3);
    default:
      // May want to push this to occur on level with video
      return ['adventurerAllAssetsMinusPlayer'];
  }
};

Craft.earlyLoadAssetsForLevel = function(levelNumber) {
  switch (levelNumber) {
    case 1:
      return Craft.minAssetsForLevelNumber(levelNumber);
    default:
      return Craft.minAssetsForLevelWithCharacter(levelNumber);
  }
};

Craft.niceToHaveAssetsForLevel = function(levelNumber) {
  switch (levelNumber) {
    case 1:
      return ['playerSteve', 'playerAlex'];
    default:
      return ['adventurerAllAssetsMinusPlayer'];
  }
};

Craft.foldInCustomHouseBlocks = function(houseBlockMap, levelConfig) {
  var planesToCustomize = [levelConfig.groundPlane, levelConfig.actionPlane];
  planesToCustomize.forEach(function(plane) {
    for (var i = 0; i < plane.length; i++) {
      var item = plane[i];
      if (item.match(/house/)) {
        plane[i] =
          houseBlockMap && houseBlockMap[item]
            ? houseBlockMap[item]
            : 'planksBirch';
      }
    }
  });
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first true if first reset
 */
Craft.reset = function(first) {
  if (first) {
    return;
  }
  captureThumbnailFromCanvas($('#minecraft-frame canvas')[0]);
  Craft.gameController.codeOrgAPI.resetAttempt();
};

Craft.phaserLoaded = function() {
  return (
    Craft.gameController &&
    Craft.gameController.game &&
    !Craft.gameController.game.load.isLoading
  );
};

/**
 * Click the run button.  Start the program.
 */
Craft.runButtonClick = function() {
  if (!Craft.phaserLoaded()) {
    return;
  }

  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }

  studioApp().toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  studioApp().attempts++;

  Craft.executeUserCode();

  if (Craft.level.freePlay && !studioApp().hideSource) {
    var finishBtnContainer = $('#right-button-cell');

    if (
      finishBtnContainer.length &&
      !finishBtnContainer.hasClass('right-button-cell-enabled')
    ) {
      finishBtnContainer.addClass('right-button-cell-enabled');
      studioApp().onResize();

      var event = document.createEvent('Event');
      event.initEvent('finishButtonShown', true, true);
      document.dispatchEvent(event);
    }
  }
};

Craft.executeUserCode = function() {
  if (Craft.initialConfig.level.edit_blocks) {
    this.reportResult(true);
    return;
  }

  if (studioApp().hasUnwantedExtraTopBlocks()) {
    // immediately check answer instead of executing, which will fail and
    // report top level blocks (rather than executing them)
    this.reportResult(false);
    return;
  }

  studioApp().playAudio('start');

  // Start tracing calls.
  Blockly.mainBlockSpace.traceOn(true);

  var appCodeOrgAPI = Craft.gameController.codeOrgAPI;
  appCodeOrgAPI.startCommandCollection();
  appCodeOrgAPI.registerEventCallback(null, event => {
    if (
      event.eventType === EventType.WhenUsed &&
      event.targetType === 'sheep'
    ) {
      appCodeOrgAPI.drop(null, 'wool', event.targetIdentifier);
    }
    if (
      event.eventType === EventType.WhenTouched &&
      event.targetType === 'creeper'
    ) {
      appCodeOrgAPI.flashEntity(null, event.targetIdentifier);
      appCodeOrgAPI.explodeEntity(null, event.targetIdentifier);
    }
  });

  // Run user generated code, calling appCodeOrgAPI
  var code = '';
  let codeBlocks = Blockly.mainBlockSpace.getTopBlocks(true);
  if (studioApp().initializationBlocks) {
    codeBlocks = studioApp().initializationBlocks.concat(codeBlocks);
  }

  code = Blockly.Generator.blocksToCode('JavaScript', codeBlocks);
  CustomMarshalingInterpreter.evalWith(
    code,
    {
      moveForward: function(blockID) {
        appCodeOrgAPI.moveForward(
          studioApp().highlight.bind(studioApp(), blockID),
          'Player'
        );
      },
      turnLeft: function(blockID) {
        appCodeOrgAPI.turnLeft(
          studioApp().highlight.bind(studioApp(), blockID),
          'Player'
        );
      },
      turnRight: function(blockID) {
        appCodeOrgAPI.turnRight(
          studioApp().highlight.bind(studioApp(), blockID),
          'Player'
        );
      },
      destroyBlock: function(blockID) {
        appCodeOrgAPI.destroyBlock(
          studioApp().highlight.bind(studioApp(), blockID),
          'Player'
        );
      },
      shear: function(blockID) {
        appCodeOrgAPI.use(
          studioApp().highlight.bind(studioApp(), blockID),
          'Player'
        );
      },
      tillSoil: function(blockID) {
        appCodeOrgAPI.tillSoil(
          studioApp().highlight.bind(studioApp(), blockID),
          'Player'
        );
      },
      ifLavaAhead: function(callback, blockID) {
        appCodeOrgAPI.ifBlockAhead(
          studioApp().highlight.bind(studioApp(), blockID),
          'lava',
          'Player',
          callback
        );
      },
      ifBlockAhead: function(blockType, callback, blockID) {
        appCodeOrgAPI.ifBlockAhead(
          studioApp().highlight.bind(studioApp(), blockID),
          blockType,
          'Player',
          callback
        );
      },
      placeBlock: function(blockType, blockID) {
        appCodeOrgAPI.placeBlock(
          studioApp().highlight.bind(studioApp(), blockID),
          blockType,
          'Player'
        );
      },
      plantCrop: function(blockID) {
        appCodeOrgAPI.placeBlock(
          studioApp().highlight.bind(studioApp(), blockID),
          'cropWheat',
          'Player'
        );
      },
      placeTorch: function(blockID) {
        appCodeOrgAPI.placeBlock(
          studioApp().highlight.bind(studioApp(), blockID),
          'torch',
          'Player'
        );
      },
      placeBlockAhead: function(blockType, blockID) {
        appCodeOrgAPI.placeInFront(
          studioApp().highlight.bind(studioApp(), blockID),
          blockType,
          'Player'
        );
      }
    },
    {legacy: true}
  );
  appCodeOrgAPI.startAttempt(
    function(success, levelModel) {
      if (Craft.level.freePlay) {
        return;
      }
      this.reportResult(success);

      var tileIDsToStore = Craft.initialConfig.level.blocksToStore;
      if (success && tileIDsToStore) {
        var newHouseBlocks =
          JSON.parse(window.localStorage.getItem('craftHouseBlocks')) || {};
        for (var i = 0; i < levelModel.actionPlane.length; i++) {
          if (tileIDsToStore[i] !== '') {
            newHouseBlocks[tileIDsToStore[i]] =
              levelModel.actionPlane[i].blockType;
          }
        }
        trySetLocalStorage('craftHouseBlocks', JSON.stringify(newHouseBlocks));
      }

      var attemptInventoryTypes = levelModel.getInventoryTypes();
      var playerInventoryTypes =
        JSON.parse(window.localStorage.getItem('craftPlayerInventory')) || [];

      var newInventorySet = {};
      attemptInventoryTypes
        .concat(playerInventoryTypes)
        .forEach(function(type) {
          newInventorySet[type] = true;
        });

      trySetLocalStorage(
        'craftPlayerInventory',
        JSON.stringify(Object.keys(newInventorySet))
      );
    }.bind(this)
  );
};

Craft.getTestResultFrom = function(success, studioTestResults) {
  if (studioTestResults === TestResults.LEVEL_INCOMPLETE_FAIL) {
    return TestResults.APP_SPECIFIC_FAIL;
  }

  if (Craft.initialConfig.level.freePlay) {
    return TestResults.FREE_PLAY;
  }

  return studioTestResults;
};

Craft.reportResult = function(success) {
  var studioTestResults = studioApp().getTestResults(success);
  var testResultType = Craft.getTestResultFrom(success, studioTestResults);

  const image = Craft.initialConfig.level.freePlay
    ? Craft.gameController.getScreenshot()
    : null;
  // Grab the encoded image, stripping out the metadata, e.g. `data:image/png;base64,`
  const encodedImage = image ? encodeURIComponent(image.split(',')[1]) : null;

  studioApp().report({
    app: 'craft',
    level: Craft.initialConfig.level.id,
    result: Craft.initialConfig.level.freePlay ? true : success,
    testResult: testResultType,
    image: encodedImage,
    program: encodeURIComponent(
      Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace))
    ),
    // typically delay feedback until response back
    // for things like e.g. crowdsourced hints & hint blocks
    onComplete: function(response) {
      const isSignedIn =
        getStore().getState().currentUser.signInState === SignInState.SignedIn;
      studioApp().displayFeedback({
        feedbackType: testResultType,
        response: response,
        level: Craft.initialConfig.level,
        defaultToContinue: Craft.shouldDefaultToContinue(testResultType),
        appStrings: {
          reinfFeedbackMsg: craftMsg.reinfFeedbackMsg(),
          nextLevelMsg: craftMsg.nextLevelMsg({
            puzzleNumber: Craft.initialConfig.level.puzzle_number
          }),
          tooManyBlocksFailMsgFunction: craftMsg.tooManyBlocksFail,
          generatedCodeDescription: craftMsg.generatedCodeDescription()
        },
        feedbackImage: image,
        showingSharing: Craft.initialConfig.level.freePlay,
        saveToProjectGallery: true,
        disableSaveToGallery: !isSignedIn
      });
    }
  });
};

/**
 * Whether pressing "x" or pressing the backdrop of the "level completed" dialog
 * should default to auto-advancing to the next level.
 * @param {string} testResultType TestResults type of this level completion
 * @returns {boolean} whether to continue
 */
Craft.shouldDefaultToContinue = function(testResultType) {
  var isFreePlay = testResultType === TestResults.FREE_PLAY;
  var isSuccess = testResultType > TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
  return isSuccess && !isFreePlay;
};
