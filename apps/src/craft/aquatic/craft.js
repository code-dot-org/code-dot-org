import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import trackEvent from '../../util/trackEvent';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import craftMsg from '../locale';
import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {
  GameController,
  EventType,
  utils as CraftUtils
} from '@code-dot-org/craft';
import dom from '@cdo/apps/dom';
import MusicController from '@cdo/apps/MusicController';
var Provider = require('react-redux').Provider;
import AppView from '../../templates/AppView';
var CraftVisualizationColumn = require('../simple/CraftVisualizationColumn');
import {getStore} from '@cdo/apps/redux';
import Sounds from '@cdo/apps/Sounds';

import {TestResults} from '@cdo/apps/constants';
import {captureThumbnailFromCanvas} from '@cdo/apps/util/thumbnail';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';

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
Craft.init = function(config) {
  if (config.level.puzzle_number === 1 && config.level.stage_total === 1) {
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
        Craft.showPlayerSelectionPopup(function(selectedPlayer) {
          trackEvent('Minecraft', 'ChoseCharacter', selectedPlayer);
          Craft.clearPlayerState();
          trySetLocalStorageItem('craftSelectedPlayer', selectedPlayer);
          Craft.updateUIForCharacter(selectedPlayer);
          Craft.initializeAppLevel(config.level);
          showInstructions();
        });
      }
    } else {
      showInstructions();
    }
  };

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
      <AppView
        visualizationColumn={
          <CraftVisualizationColumn
            showFinishButton={!config.level.isProjectLevel}
          />
        }
        onMount={onMount}
      />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

var preloadImage = function(url) {
  var img = new Image();
  img.src = url;
};

Craft.characterAssetPackName = function(playerName) {
  return 'player' + playerName + 'Aquatic';
};

Craft.getCurrentCharacter = function() {
  return (
    window.localStorage.getItem('craftSelectedPlayer') || DEFAULT_CHARACTER
  );
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

Craft.showPlayerSelectionPopup = function(onSelectedCallback) {
  var selectedPlayer = DEFAULT_CHARACTER;
  var popupDiv = document.createElement('div');
  popupDiv.innerHTML = require('../simple/dialogs/playerSelection.html.ejs')({
    image: studioApp().assetUrl()
  });
  var popupDialog = studioApp().createModalDialog({
    contentDiv: popupDiv,
    defaultBtnSelector: '#choose-steve',
    onHidden: function() {
      onSelectedCallback(selectedPlayer);
    },
    id: 'craft-popup-player-selection'
  });
  dom.addClickTouchEvent(
    $('#close-character-select')[0],
    function() {
      popupDialog.hide();
    }.bind(this)
  );
  dom.addClickTouchEvent(
    $('#choose-steve')[0],
    function() {
      selectedPlayer = CHARACTER_STEVE;
      trackEvent('Minecraft', 'ClickedCharacter', selectedPlayer);
      popupDialog.hide();
    }.bind(this)
  );
  dom.addClickTouchEvent(
    $('#choose-alex')[0],
    function() {
      selectedPlayer = CHARACTER_ALEX;
      trackEvent('Minecraft', 'ClickedCharacter', selectedPlayer);
      popupDialog.hide();
    }.bind(this)
  );
  popupDialog.show();
};

Craft.clearPlayerState = function() {
  window.localStorage.removeItem('craftSelectedPlayer');
};

Craft.initializeAppLevel = function(levelConfig) {
  CraftUtils.convertActionPlaneEntitiesToConfig(levelConfig);

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
    isAquaticLevel: levelConfig.isAquaticLevel,
    boat: levelConfig.boat,
    ocean: levelConfig.ocean,
    isDaytime: levelConfig.isDaytime,
    groundPlane: levelConfig.groundPlane,
    groundDecorationPlane: levelConfig.groundDecorationPlane,
    actionPlane: levelConfig.actionPlane,
    fluffPlane: fluffPlane,
    entities: levelConfig.entities,
    playerStartPosition: levelConfig.playerStartPosition,
    playerStartDirection: levelConfig.playerStartDirection,
    playerName: Craft.getCurrentCharacter() + 'Aquatic',
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
      return ['aquaticIslandAssets'];
    case 2:
      return ['aquaticIslandAssets'];
    case 3:
      return ['aquaticLevelThreeAndFourAssets'];
    case 4:
      return ['aquaticLevelThreeAndFourAssets'];
    default:
      return ['aquaticAllAssetsMinusPlayer'];
  }
};

Craft.afterLoadAssetsForLevel = function(levelNumber) {
  // After level loads & player starts playing, kick off further asset downloads
  // TODO
  return [];
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
  let interpreter;

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

  let code = '';
  if (this.level.sharedBlocks) {
    code +=
      this.level.sharedBlocks
        .map(blockOptions => blockOptions.helperCode)
        .filter(helperCode => helperCode)
        .join('\n') + '\n';
  }

  const resume = callback => () => {
    callback();
    interpreter.run();
  };

  const asyncMethods = {
    moveForward: function(callback) {
      appCodeOrgAPI.moveForward(null, 'Player', resume(callback));
    },
    turnLeft: function(callback) {
      appCodeOrgAPI.turnLeft(null, 'Player', resume(callback));
    },
    turnRight: function(callback) {
      appCodeOrgAPI.turnRight(null, 'Player', resume(callback));
    }
  };

  // Run user code.
  let codeBlocks = Blockly.mainBlockSpace.getTopBlocks(true);
  code += Blockly.Generator.blocksToCode('JavaScript', codeBlocks);
  interpreter = CustomMarshalingInterpreter.evalWith(
    code,
    {
      console: {
        log: console.log
      },
      ...asyncMethods,
      api: appCodeOrgAPI,
      walkableAhead: () => Craft.gameController.levelModel.canMoveForward()[0],
      walkableToRight: () => {
        Craft.gameController.levelModel.turnRight();
        const value = Craft.gameController.levelModel.canMoveForward()[0];
        Craft.gameController.levelModel.turnLeft();
        return value;
      },
      walkableToLeft: () => {
        Craft.gameController.levelModel.turnLeft();
        const value = Craft.gameController.levelModel.canMoveForward()[0];
        Craft.gameController.levelModel.turnRight();
        return value;
      },
      getStandingOnBlockType: () =>
        Craft.gameController.levelModel.groundPlane.getBlockAt(
          Craft.gameController.getEntity().position
        ).blockType,
      isStandingOnMiniBlock: () =>
        Craft.gameController.levelModel.actionPlane
          .getBlockAt(Craft.gameController.getEntity().position)
          .getIsMiniblock(),
      isFinished: () =>
        Craft.gameController.levelModel.isFailed() ||
        Craft.gameController.levelModel.isSolved()
    },
    {
      asyncFunctionList: Object.values(asyncMethods)
    }
  );

  appCodeOrgAPI.startAttempt(
    function(success, levelModel) {
      if (Craft.level.freePlay) {
        return;
      }
      this.reportResult(success);
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
