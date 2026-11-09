/* global $, GameController, levels, Sounds */

var defaults = {
  assetPacks: {
    beforeLoad: ['allAssetsMinusPlayer', 'playerAlex', 'playerAgent'],
    afterLoad: [],
  },
  gridDimensions: [10, 10],
  fluffPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  playerName: 'Alex',
  playerStartPosition: [],
};

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var levelParam = getParameterByName('level');
var testLevelToLoad = levels[levelParam] || levels['default'];
testLevelToLoad = Object.assign({}, defaults, testLevelToLoad);

// Initialize test instance of game, exposed to window for debugging.
var gameController = new GameController({
  Phaser: window.Phaser,
  containerId: 'phaser-game',
  assetRoot: 'assets/',
  audioPlayer: new Sounds(),
  debug: true,
  earlyLoadAssetPacks: testLevelToLoad.earlyLoadAssetPacks,
  earlyLoadNiceToHaveAssetPacks: testLevelToLoad.earlyLoadNiceToHaveAssetPacks,
  afterAssetsLoaded: () => {
    gameController.codeOrgAPI.startAttempt();
  },
});

gameController.loadLevel(testLevelToLoad);

var $levelselect = $('#level-load');
Object.keys(levels).forEach(key => {
  $levelselect.append($('<option/>', {text: key, selected: key === levelParam}));
});

$levelselect.on('change', () => {
  location.search = `level=${$levelselect.val()}`;
});

$('input[type=range]').on('input', function () {
  $("#speed-display").html('Speed: ' + $(this).val() + 'x');
  gameController.game.time.slowMotion = 1.5 / parseFloat($(this).val(), 10);
});

$('#reset-button').click(function () {
  gameController.codeOrgAPI.resetAttempt();
  gameController.codeOrgAPI.startAttempt();
});

if (!gameController.levelData.isAgentLevel) {
  $('#entity-select').hide();
}

window.addEventListener('keydown', e => {
  if (e.target !== document.body) {
    e.preventDefault();
  }
  e.stopImmediatePropagation();

  var target = $('input[name=target]:checked').val();
  var instance = target === 'Player' ? gameController.player : gameController.agent;

  if (instance.queue.getLength() > 0) {
    return;
  }

  switch (e.keyCode) {
    case 8:
    case 46:
      gameController.codeOrgAPI.destroyBlock(null, target);
      break;
    case 13:
      gameController.codeOrgAPI.placeInFront(null, $('#block-type').val(), target);
      break;
    case 16:
      $('input[name=target]:not(:checked)').prop('checked', true);
      break;
    case 38:
    case 87:
      gameController.codeOrgAPI.moveDirection(null, target, 0);
      break;
    case 40:
    case 83:
      gameController.codeOrgAPI.moveDirection(null, target, 2);
      break;
    case 37:
    case 65:
      gameController.codeOrgAPI.moveDirection(null, target, 3);
      break;
    case 39:
    case 68:
      gameController.codeOrgAPI.moveDirection(null, target, 1);
      break;
  }
}, true);

window.gameController = gameController;
