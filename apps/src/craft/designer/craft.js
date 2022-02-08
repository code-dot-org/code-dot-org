import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Hammer from 'hammerjs';

import {singleton as studioApp} from '../../StudioApp';
import craftMsg from '../locale';
import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {
  GameController,
  FacingDirection,
  utils as CraftUtils
} from '@code-dot-org/craft';
import dom from '../../dom';
import {trySetLocalStorage} from '@cdo/apps/utils';
import eventsLevelbuilderOverrides from './eventsLevelbuilderOverrides';
import MusicController from '../../MusicController';
import {Provider} from 'react-redux';
import AppView from '../../templates/AppView';
import CraftVisualizationColumn from './CraftVisualizationColumn';
import {ENTITY_ACTION_BLOCKS, ENTITY_TARGET_ACTION_BLOCKS} from './blocks';
import {getStore} from '../../redux';
import Sounds from '../../Sounds';
import {TestResults} from '../../constants';
import trackEvent from '../../util/trackEvent';
import {captureThumbnailFromCanvas} from '../../util/thumbnail';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {ARROW_KEY_NAMES, handlePlayerSelection} from '@cdo/apps/craft/utils';
import {
  showArrowButtons,
  hideArrowButtons,
  dismissSwipeOverlay
} from '@cdo/apps/templates/arrowDisplayRedux';
import PlayerSelectionDialog from '@cdo/apps/craft/PlayerSelectionDialog';
import reducers from '@cdo/apps/craft/redux';

const MEDIA_URL = '/blockly/media/craft/';

/**
 * The first level where character selection shows up.
 * @type {number}
 */
const FIRST_CHARACTER_LEVEL = 4;

const ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton'
};

/**
 * Create a namespace for the application.
 */
var Craft = module.exports;

window.Craft = Craft;
window.Blockly = Blockly;

const eventsCharacters = {
  Steve: {
    name: 'Steve',
    staticAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Steve_Neutral.png',
    smallStaticAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Steve_Neutral.png',
    failureAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Steve_Fail.png',
    winAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Steve_Win.png'
  },
  Alex: {
    name: 'Alex',
    staticAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Alex_Neutral.png',
    smallStaticAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Alex_Neutral.png',
    failureAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Alex_Fail.png',
    winAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Alex_Win.png'
  },
  Chicken: {
    staticAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Chicken_Neutral.png',
    smallStaticAvatar:
      MEDIA_URL + 'Events/Pop_Up_Character_Chicken_Neutral.png',
    failureAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Chicken_Fail.png',
    winAvatar: MEDIA_URL + 'Events/Pop_Up_Character_Chicken_Win.png'
  }
};

const CHICKEN_ASSETS = [
  eventsCharacters.Chicken.staticAvatar,
  eventsCharacters.Chicken.smallStaticAvatar,
  eventsCharacters.Chicken.winAvatar,
  eventsCharacters.Chicken.failureAvatar
];
const CHARACTER_ASSETS = [
  MEDIA_URL + 'Events/Steve_Character_Select.png',
  MEDIA_URL + 'Events/Alex_Character_Select.png',
  eventsCharacters.Steve.staticAvatar,
  eventsCharacters.Steve.smallStaticAvatar,
  eventsCharacters.Alex.staticAvatar,
  eventsCharacters.Alex.smallStaticAvatar
];
const COMMON_UI_ASSETS = [
  MEDIA_URL + 'Sliced_Parts/MC_Loading_Spinner.gif',
  MEDIA_URL + 'Sliced_Parts/Frame_Large_Plus_Logo.png',
  MEDIA_URL + 'Sliced_Parts/Pop_Up_Slice.png',
  MEDIA_URL + 'Sliced_Parts/X_Button.png',
  MEDIA_URL + 'Sliced_Parts/Button_Grey_Slice.png',
  MEDIA_URL + 'Sliced_Parts/MC_Button_Pressed.png',
  MEDIA_URL + 'Sliced_Parts/Run_Button_Up_Slice.png',
  MEDIA_URL + 'Sliced_Parts/Run_Button_Down_Slice.png',
  MEDIA_URL + 'Sliced_Parts/MC_Run_Arrow_Icon_Smaller.png',
  MEDIA_URL + 'Sliced_Parts/MC_Up_Arrow_Icon.png',
  MEDIA_URL + 'Sliced_Parts/MC_Down_Arrow_Icon.png',
  MEDIA_URL + 'Sliced_Parts/Reset_Button_Up_Slice.png',
  MEDIA_URL + 'Sliced_Parts/MC_Reset_Arrow_Icon.png',
  MEDIA_URL + 'Sliced_Parts/Reset_Button_Down_Slice.png',
  MEDIA_URL + 'Sliced_Parts/Callout_Tail.png'
];
const interfaceImages = {
  DEFAULT: COMMON_UI_ASSETS,
  1: CHICKEN_ASSETS,
  2: CHICKEN_ASSETS,
  3: CHICKEN_ASSETS,
  4: CHARACTER_ASSETS,
  5: CHARACTER_ASSETS,
  6: CHARACTER_ASSETS,
  7: CHARACTER_ASSETS,
  8: CHARACTER_ASSETS,
  9: CHARACTER_ASSETS,
  10: CHARACTER_ASSETS,
  11: CHARACTER_ASSETS,
  12: CHARACTER_ASSETS
};

const MUSIC_METADATA = [
  {volume: 1, hasOgg: true, name: 'vignette1', group: 'day'},
  {volume: 1, hasOgg: true, name: 'vignette2-quiet', group: 'night'},
  {volume: 1, hasOgg: true, name: 'vignette3', group: 'night'},
  {volume: 1, hasOgg: true, name: 'vignette4-intro', group: 'day'},
  {volume: 1, hasOgg: true, name: 'vignette5-shortpiano', group: 'day'},
  {volume: 1, hasOgg: true, name: 'vignette7-funky-chirps-short', group: 'day'},
  {volume: 1, hasOgg: true, name: 'vignette8-free-play', group: 'day'}
];

const CHARACTER_STEVE = 'Steve';
const CHARACTER_ALEX = 'Alex';
const DEFAULT_CHARACTER = CHARACTER_ALEX;

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
  config.showInstructionsInTopPane = true;

  // Return the version of Internet Explorer (8+) or undefined if not IE.
  var getIEVersion = function() {
    return document.documentMode;
  };

  var ieVersionNumber = getIEVersion();
  if (ieVersionNumber) {
    $('body').addClass('ieVersion' + ieVersionNumber);
  }

  if (config.level.useScore) {
    $('body').addClass('minecraft-scoring');
  }

  if (config.level.isEventLevel) {
    $('body').addClass('minecraft-events');
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
        handlePlayerSelection(
          DEFAULT_CHARACTER,
          onPlayerSelected,
          'MinecraftDesigner'
        );
      }
    } else {
      showInstructions();
    }
  };

  if (
    config.level.puzzle_number &&
    eventsLevelbuilderOverrides[config.level.puzzle_number]
  ) {
    Object.assign(
      config.level,
      eventsLevelbuilderOverrides[config.level.puzzle_number]
    );
  }
  Craft.initialConfig = config;

  // replace studioApp methods with our own
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
    config.level.dayNightCycleTime ? 100 : levelTracks.length > 1 ? 7500 : null
  );

  // Play music when the instructions are shown
  Craft.beginBackgroundMusic = function() {
    Sounds.getSingleton().whenAudioUnlocked(function() {
      var hasSongInLevel = Craft.level.songs && Craft.level.songs.length > 1;
      var songToPlayFirst = hasSongInLevel ? Craft.level.songs[0] : null;
      Craft.musicController.play(songToPlayFirst);
    });
  };

  const character = config.level.usePlayer
    ? eventsCharacters[Craft.getCurrentCharacter()]
    : eventsCharacters['Chicken'];

  config.skin.staticAvatar = character.staticAvatar;
  config.skin.smallStaticAvatar = character.smallStaticAvatar;
  config.skin.failureAvatar = character.failureAvatar;
  config.skin.winAvatar = character.winAvatar;

  const onMount = function() {
    studioApp().init({
      ...config,
      forceInsertTopBlock: null,
      appStrings: {
        generatedCodeDescription: craftMsg.generatedCodeDescription()
      },
      enableShowCode: false,
      enableShowBlockCount: false,
      loadAudio: function() {},
      afterInject: function() {
        if (config.level.showMovementBanner) {
          studioApp().displayWorkspaceAlert(
            'warning',
            <div>{craftMsg.useArrowKeys()}</div>
          );
        }

        var slowMotionURLParam = parseFloat(
          (location.search.split('customSlowMotion=')[1] || '').split('&')[0]
        );
        Craft.gameController = new GameController({
          Phaser: window.Phaser,
          containerId: 'phaser-game',
          onScoreUpdate: config.level.useScore
            ? s => $('#score-number').text(s)
            : null,
          assetRoot: Craft.skin.assetUrl(''),
          audioPlayer: {
            register: studioApp().registerAudio.bind(studioApp()),
            play: studioApp().playAudio.bind(studioApp())
          },
          debug: false,
          customSlowMotion: slowMotionURLParam, // NaN if not set
          /**
           * First asset packs to load while video playing, etc.
           * Won't matter for levels without delayed level initialization
           * (due to e.g. character popup).
           */
          earlyLoadAssetPacks: Craft.earlyLoadAssetsForLevel(
            config.level.puzzle_number
          ),
          afterAssetsLoaded: function() {
            // preload music after essential game asset downloads completely finished
            Craft.musicController.preload();
          },
          earlyLoadNiceToHaveAssetPacks: Craft.niceToHaveAssetsForLevel(
            config.level.puzzle_number
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

        for (var btn in ArrowIds) {
          dom.addMouseUpTouchEvent(
            document.getElementById(ArrowIds[btn]),
            (function(btn) {
              return () => {
                Craft.onArrowButtonUp(ArrowIds[btn]);
              };
            })(btn)
          );
          dom.addMouseDownTouchEvent(
            document.getElementById(ArrowIds[btn]),
            (function(btn) {
              return e => {
                Craft.onArrowButtonDown(e, ArrowIds[btn]);
              };
            })(btn)
          );
        }

        dom.addMouseUpTouchEvent(document, Craft.onDocumentMouseUp, false);
        $('#soft-buttons').addClass('soft-buttons-' + 4);
        Craft.hideSoftButtons();

        const phaserGame = document.getElementById('phaser-game');
        const hammerToButton = {
          [Hammer.DIRECTION_LEFT]: 'leftButton',
          [Hammer.DIRECTION_RIGHT]: 'rightButton',
          [Hammer.DIRECTION_UP]: 'upButton',
          [Hammer.DIRECTION_DOWN]: 'downButton'
        };

        const onDrag = function(e) {
          if (hammerToButton[e.direction]) {
            Craft.gameController.codeOrgAPI.arrowDown(
              directionToFacing[hammerToButton[e.direction]]
            );
          }
          e.preventDefault();
        };

        const onDragEnd = function(e) {
          if (hammerToButton[e.direction]) {
            Craft.gameController.codeOrgAPI.arrowUp(
              directionToFacing[hammerToButton[e.direction]]
            );
          }
          e.preventDefault();
        };

        var mc = new Hammer.Manager(phaserGame);
        mc.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL}));
        mc.add(new Hammer.Press({time: 150}));
        mc.add(new Hammer.Tap());
        mc.on('pan', onDrag);
        mc.on('panend pancancel', onDragEnd);
        mc.on('press', () =>
          Craft.gameController.codeOrgAPI.clickDown(() => {})
        );
        mc.on('tap', () => {
          Craft.gameController.codeOrgAPI.clickDown(() => {});
          Craft.gameController.codeOrgAPI.clickUp(() => {});
        });
        mc.on('pressup', () =>
          Craft.gameController.codeOrgAPI.clickUp(() => {})
        );

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
    });

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
              showScore={!!config.level.useScore}
            />
          }
          onMount={onMount}
        />
        <PlayerSelectionDialog
          players={[CHARACTER_ALEX, CHARACTER_STEVE]}
          title={craftMsg.playerSelectChooseCharacter()}
          titleClassName="minecraft-big-gray-header"
          hideSubtitle
        />
      </div>
    </Provider>,
    document.getElementById(config.containerId)
  );
};

Craft.getAppReducers = function() {
  return reducers;
};

const directionToFacing = {
  upButton: FacingDirection.North,
  downButton: FacingDirection.South,
  leftButton: FacingDirection.West,
  rightButton: FacingDirection.East
};

Craft.onArrowButtonDown = function(e, btn) {
  let store = getStore();
  if (!store.getState().arrowDisplay.swipeOverlayHasBeenDismissed) {
    store.dispatch(dismissSwipeOverlay('buttonPress'));
  }
  Craft.gameController.codeOrgAPI.arrowDown(directionToFacing[btn]);
  e.preventDefault(); // Stop normal events so we see mouseup later.
};

Craft.onArrowButtonUp = function(btn) {
  Craft.gameController.codeOrgAPI.arrowUp(directionToFacing[btn]);
};

Craft.onDocumentMouseUp = function() {
  if (!Craft.phaserLoaded() || !Craft.levelInitialized()) {
    return;
  }

  for (var direction in directionToFacing) {
    Craft.gameController.codeOrgAPI.arrowUp(directionToFacing[direction]);
  }
};

var preloadImage = function(url) {
  var img = new Image();
  img.src = url;
};

Craft.characterAssetPackName = function(playerName) {
  return 'player' + playerName + 'Events';
};

Craft.getCurrentCharacter = function() {
  return (
    window.localStorage.getItem('craftSelectedPlayer') || DEFAULT_CHARACTER
  );
};

Craft.setCurrentCharacter = function(name = DEFAULT_CHARACTER) {
  trackEvent('MinecraftDesigner', 'ChoseCharacter', name);
  Craft.clearPlayerState();
  trySetLocalStorage('craftSelectedPlayer', name);
  Craft.updateUIForCharacter(name);
};

Craft.updateUIForCharacter = function(character) {
  let characters = eventsCharacters;
  Craft.initialConfig.skin.staticAvatar = characters[character].staticAvatar;
  Craft.initialConfig.skin.smallStaticAvatar =
    characters[character].smallStaticAvatar;
  Craft.initialConfig.skin.failureAvatar = characters[character].failureAvatar;
  Craft.initialConfig.skin.winAvatar = characters[character].winAvatar;
  studioApp().setIconsFromSkin(Craft.initialConfig.skin);
  $('#prompt-icon').attr('src', characters[character].smallStaticAvatar);
};

Craft.clearPlayerState = function() {
  window.localStorage.removeItem('craftSelectedPlayer');
};

Craft.initializeAppLevel = function(levelConfig) {
  CraftUtils.convertActionPlaneEntitiesToConfig(levelConfig);

  // Fluff plane is no longer configured by level builders, pass in an empty plane
  const fluffPlane = [];
  for (
    var i = 0;
    i < (levelConfig.gridWidth || 10) * (levelConfig.gridHeight || 10);
    i++
  ) {
    fluffPlane.push('');
  }

  const levelAssetPacks = {
    beforeLoad: Craft.minAssetsForLevelWithCharacter(levelConfig.puzzle_number),
    afterLoad: Craft.afterLoadAssetsForLevel(levelConfig.puzzle_number)
  };

  const doNotShowPlayer = levelConfig.usePlayer === false;

  Craft.gameController.loadLevel({
    onDayCallback: () => {
      Craft.musicController.setGroup('day');
      Craft.musicController.fadeOut();
    },
    onNightCallback: () => {
      Craft.musicController.setGroup('night');
      Craft.musicController.fadeOut();
    },
    levelVerificationTimeout: levelConfig.levelVerificationTimeout,
    isDaytime: levelConfig.isDaytime,
    groundPlane: levelConfig.groundPlane,
    usePlayer: !doNotShowPlayer,
    useScore: levelConfig.useScore,
    entities: levelConfig.entities,
    isEventLevel: levelConfig.isEventLevel,
    groundDecorationPlane: levelConfig.groundDecorationPlane,
    actionPlane: levelConfig.actionPlane,
    fluffPlane: fluffPlane,
    playerStartPosition: levelConfig.playerStartPosition,
    playerStartDirection: levelConfig.playerStartDirection,
    playerName: Craft.getCurrentCharacter() + 'Events',
    assetPacks: levelAssetPacks,
    gridDimensions:
      levelConfig.gridWidth && levelConfig.gridHeight
        ? [levelConfig.gridWidth, levelConfig.gridHeight]
        : null,
    // eslint-disable-next-line no-eval
    verificationFunction: eval('[' + levelConfig.verificationFunction + ']')[0], // TODO(bjordan): add to utils
    // eslint-disable-next-line no-eval
    failureCheckFunction: eval('[' + levelConfig.failureCheckFunction + ']')[0], // TODO(bjordan): add to utils
    // eslint-disable-next-line no-eval
    timeoutResult: eval(
      '[' +
        (levelConfig.timeoutVerificationFunction ||
          `function() { return false; }`) +
        ']'
    )[0]
  });
};

Craft.minAssetsForLevelWithCharacter = function(levelNumber) {
  const extraAssets =
    levelNumber >= FIRST_CHARACTER_LEVEL
      ? [Craft.characterAssetPackName(Craft.getCurrentCharacter())]
      : [];
  return Craft.minAssetsForLevelNumber(levelNumber).concat(extraAssets);
};

Craft.minAssetsForLevelNumber = function(levelNumber) {
  switch (levelNumber) {
    case 1:
      return ['levelOneAssets'];
    case 2:
      return ['levelTwoAssets'];
    case 3:
      return ['levelThreeAssets'];
    default:
      return ['designerAllAssetsMinusPlayer'];
  }
};

Craft.afterLoadAssetsForLevel = function(levelNumber) {
  // After level loads & player starts playing, kick off further asset downloads
  switch (levelNumber) {
    case 1:
      // can disable if performance issue on early level 1
      return Craft.minAssetsForLevelNumber(2);
    default:
      // May want to push this to occur on level with video
      return ['designerAllAssetsMinusPlayer'];
  }
};

Craft.earlyLoadAssetsForLevel = function(levelNumber) {
  if (levelNumber <= FIRST_CHARACTER_LEVEL) {
    return Craft.minAssetsForLevelNumber(levelNumber);
  }

  return Craft.minAssetsForLevelWithCharacter(levelNumber);
};

Craft.niceToHaveAssetsForLevel = function(levelNumber) {
  if (levelNumber === FIRST_CHARACTER_LEVEL) {
    return ['playerSteveEvents', 'playerAlexEvents'];
  }
  return ['designerAllAssetsMinusPlayer'];
};

Craft.hideSoftButtons = function() {
  getStore().dispatch(hideArrowButtons());
  studioApp().resizePinnedBelowVisualizationArea();
};

Craft.showSoftButtons = function() {
  getStore().dispatch(showArrowButtons());
  studioApp().resizePinnedBelowVisualizationArea();
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first true if first reset
 */
Craft.reset = function(first) {
  if (first) {
    return;
  }
  if (Craft.level.usePlayer) {
    Craft.hideSoftButtons();
  }
  captureThumbnailFromCanvas($('#minecraft-frame canvas')[0]);
  Craft.gameController.codeOrgAPI.resetAttempt();
};

Craft.phaserLoaded = function() {
  return (
    Craft.gameController &&
    Craft.gameController.game &&
    Craft.gameController.game.load &&
    !Craft.gameController.game.load.isLoading
  );
};

Craft.levelInitialized = function() {
  return Craft.gameController && Craft.gameController.levelModel;
};

/**
 * Click the run button.  Start the program.
 */
Craft.runButtonClick = function() {
  if (!Craft.phaserLoaded()) {
    return;
  }

  let store = getStore();
  if (!store.getState().arrowDisplay.swipeOverlayHasBeenDismissed) {
    window.addEventListener('keydown', function hideOverlay(e) {
      if (ARROW_KEY_NAMES.includes(e.key)) {
        store.dispatch(dismissSwipeOverlay('keyPress'));
        window.removeEventListener('keydown', hideOverlay);
      }
    });
  }

  if (Craft.level.usePlayer) {
    Craft.showSoftButtons();
  }
  Craft.gameController.game.input.touch.preventDefault = false;

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
  // Run user generated code, calling appCodeOrgAPI
  let codeBlocks = Blockly.mainBlockSpace.getTopBlocks(true);
  if (studioApp().initializationBlocks) {
    codeBlocks = studioApp().initializationBlocks.concat(codeBlocks);
  }
  const code = Blockly.Generator.blocksToCode('JavaScript', codeBlocks);

  const evalApiMethods = {
    moveForward: function(blockID) {
      appCodeOrgAPI.moveForward(
        studioApp().highlight.bind(studioApp(), blockID)
      );
    },
    drop: function(blockType, targetEntity, blockID) {
      appCodeOrgAPI.drop(
        studioApp().highlight.bind(studioApp(), blockID),
        blockType,
        targetEntity
      );
    },
    turnLeft: function(blockID) {
      appCodeOrgAPI.turn(
        studioApp().highlight.bind(studioApp(), blockID),
        'left'
      );
    },
    turnRight: function(blockID) {
      appCodeOrgAPI.turn(
        studioApp().highlight.bind(studioApp(), blockID),
        'right'
      );
    },
    destroyBlock: function(blockID) {
      appCodeOrgAPI.destroyBlock(
        studioApp().highlight.bind(studioApp(), blockID)
      );
    },
    repeat: function(blockID, callback, iterations, targetEntity) {
      // if resurrected, move blockID be last parameter to fix "Show Code"
      appCodeOrgAPI.repeat(
        studioApp().highlight.bind(studioApp(), blockID),
        callback.bind(null, {targetIdentifier: targetEntity}),
        iterations,
        targetEntity
      );
    },
    repeatRandom: function(blockID, callback, targetEntity) {
      // if resurrected, move blockID be last parameter to fix "Show Code"
      appCodeOrgAPI.repeatRandom(
        studioApp().highlight.bind(studioApp(), blockID),
        callback,
        targetEntity
      );
    },
    playSound: function(soundID, targetEntity, blockID) {
      appCodeOrgAPI.playSound(
        studioApp().highlight.bind(studioApp(), blockID),
        soundID,
        targetEntity
      );
    },
    addScore: function(scoreAmount, blockID) {
      appCodeOrgAPI.addScore(
        studioApp().highlight.bind(studioApp(), blockID),
        parseInt(scoreAmount)
      );
    },
    moveDirection: function(direction, targetEntity, blockID) {
      const dirStringToDirection = {
        up: FacingDirection.North,
        down: FacingDirection.South,
        left: FacingDirection.West,
        right: FacingDirection.East
      };
      appCodeOrgAPI.moveDirection(
        studioApp().highlight.bind(studioApp(), blockID),
        dirStringToDirection[direction],
        targetEntity
      );
    },
    spawnEntity: function(type, direction, blockID) {
      appCodeOrgAPI.spawnEntity(
        studioApp().highlight.bind(studioApp(), blockID),
        type,
        direction
      );
    },
    wait: function(time, targetEntity, blockID) {
      const randomMin = 0.1;
      const randomMax = 3;
      appCodeOrgAPI.wait(
        studioApp().highlight.bind(studioApp(), blockID),
        time === 'random' ? _.random(randomMin, randomMax, true) : time,
        targetEntity
      );
    },
    spawnEntityRandom: function(type, blockID) {
      var locationOptions = ['up', 'middle', 'right', 'down', 'left'];
      const randomDirection = _.sample(locationOptions);

      appCodeOrgAPI.spawnEntity(
        studioApp().highlight.bind(studioApp(), blockID),
        type,
        randomDirection
      );
    }
  };

  ENTITY_ACTION_BLOCKS.concat(['turnLeft', 'turnRight', 'turnRandom']).forEach(
    methodName => {
      evalApiMethods[methodName] = function(targetEntity, blockID) {
        appCodeOrgAPI[methodName](
          studioApp().highlight.bind(studioApp(), blockID),
          targetEntity
        );
      };
    }
  );

  ENTITY_TARGET_ACTION_BLOCKS.forEach(methodName => {
    evalApiMethods[methodName] = function(targetEntity, moveTo, blockID) {
      appCodeOrgAPI[methodName](
        studioApp().highlight.bind(studioApp(), blockID),
        targetEntity,
        moveTo
      );
    };
  });

  const userEvents = {};
  const eventGenerationMethods = {
    onEventTriggered: function(type, eventType, callback, blockID) {
      userEvents[`event-${type}-${eventType}`] = {
        code: callback,
        args: ['event']
      };
    },
    onGlobalEventTriggered: function(eventType, callback, blockID) {
      userEvents[`event--${eventType}`] = {code: callback, args: ['event']};
    }
  };

  CustomMarshalingInterpreter.evalWith(code, eventGenerationMethods);

  const customMarshalObjects = [
    {
      instance: evalApiMethods.repeat,
      methodOpts: {
        nativeCallsBackInterpreter: true,
        run: true
      }
    }
  ];

  const hooks = {};
  CustomMarshalingInterpreter.evalWithEvents(
    evalApiMethods,
    userEvents,
    '',
    customMarshalObjects
  ).hooks.forEach(hook => {
    hooks[hook.name] = hook.func;
  });

  appCodeOrgAPI.registerEventCallback(() => {}, function(event) {
    const type = event.targetType || '[^-]*';
    const eventType = event.eventType;
    const regex = new RegExp(`^event-${type}-${eventType}$`);

    Object.keys(hooks).forEach(name => {
      if (regex.test(name)) {
        hooks[name](event);
      }
    });
  });

  appCodeOrgAPI.startAttempt(
    function(success) {
      Craft.hideSoftButtons();
      if (Craft.level.freePlay) {
        return;
      }
      this.reportResult(success);
    }.bind(this)
  );

  if (Craft.initialConfig.level.dayNightCycleTime) {
    appCodeOrgAPI.setDayNightCycle(
      Craft.initialConfig.level.dayNightCycleStart,
      Craft.initialConfig.level.dayNightCycleTime || 0,
      Craft.initialConfig.level.isDaytime ? 'night' : 'day'
    );
  }
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
