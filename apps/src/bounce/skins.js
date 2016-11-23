/**
 * Load Skin for Bounce.
 */
// tiles: A 250x200 set of 20 map images.
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.
// graph: Colour of optional grid lines, or false.

var skinsBase = require('../skins');
var msg = require('./locale');

var CONFIGS = {
  bounce: {
    nonDisappearingPegmanHittingObstacle: true,
    backgrounds: [
      'hardcourt',
      'retro'
    ],
    balls: [
      'hardcourt',
      'retro'
    ],
    ballYOffset: 10,
    drawTiles: true,
    markerHeight: 43,
    markerWidth: 50,
    blockMsgs: {
      launchBall: msg.launchBall(),
      launchBallTooltip: msg.launchBallTooltip(),
      paddleCollide: msg.whenPaddleCollided(),
      paddleCollideTooltip: msg.whenPaddleCollidedTooltip(),
      paddleMiss: msg.whenBallMissesPaddle(),
      paddleSpeedRandom: msg.setPaddleSpeedRandom(),
      paddleSpeedVerySlow: msg.setPaddleSpeedVerySlow(),
      paddleSpeedSlow: msg.setPaddleSpeedSlow(),
      paddleSpeedNormal: msg.setPaddleSpeedNormal(),
      paddleSpeedFast: msg.setPaddleSpeedFast(),
      paddleSpeedVeryFast: msg.setPaddleSpeedVeryFast(),
      paddleSpeedTooltip: msg.setPaddleSpeedTooltip(),
      setPaddle: msg.setPaddle(),
    },
  },

  basketball: {
    drawTiles: true,
    goalSuccess: 'goal.png',
    paddle: 'hand_1.png',
    markerHeight: 61,
    markerWidth: 54,
    balls: [
      'hardcourt',
      'retro'
    ],
    paddles: [
      'hand_1',
      'hand_2'
    ],
    teams: [
      'Atlanta Dream',
      'Atlanta Hawks',
      'Boston Celtics',
      'Brooklyn Nets',
      'Charlotte Hornets',
      'Chicago Bulls',
      'Chicago Sky',
      'Cleveland Cavaliers',
      'Connecticut Sun',
      'Dallas Mavericks',
      'Dallas Wings',
      'Denver Nuggets',
      'Detroit Pistons',
      'Golden State Warriors',
      'Houston Rockets',
      'Indiana Fever',
      'Indiana Pacers',
      'Los Angeles Clippers',
      'Los Angeles Lakers',
      'Los Angeles Sparks',
      'Memphis Grizzlies',
      'Miami Heat',
      'Milwaukee Bucks',
      'Minnesota Lynx',
      'Minnesota Timberwolves',
      'New Orleans Pelicans',
      'New York Knicks',
      'New York Liberty',
      'Oklahoma City Thunder',
      'Orlando Magic',
      'Philadelphia 76ers',
      'Phoenix Mercury',
      'Phoenix Suns',
      'Portland Trail Blazers',
      'Sacramento Kings',
      'San Antonio Spurs',
      'San Antonio Stars',
      'Seattle Storm',
      'Toronto Raptors',
      'Utah Jazz',
      'Washington Mystics',
      'Washington Wizards',
    ],
    blockMsgs: {
      launchBall: msg.basketballLaunchBall(),
      launchBallTooltip: msg.basketballLaunchBallTooltip(),
      paddleCollide: msg.basketballWhenPaddleCollided(),
      paddleCollideTooltip: msg.whenPaddleCollidedTooltip(),
      paddleMiss: msg.basketballWhenBallMissesPaddle(),
      paddleSpeedRandom: msg.basketballSetPaddleSpeedRandom(),
      paddleSpeedVerySlow: msg.basketballSetPaddleSpeedVerySlow(),
      paddleSpeedSlow: msg.basketballSetPaddleSpeedSlow(),
      paddleSpeedNormal: msg.basketballSetPaddleSpeedNormal(),
      paddleSpeedFast: msg.basketballSetPaddleSpeedFast(),
      paddleSpeedVeryFast: msg.basketballSetPaddleSpeedVeryFast(),
      paddleSpeedTooltip: msg.basketballSetPaddleSpeedTooltip(),
      setPaddle: msg.basketballSetPaddle(),
    },
  },

  sports: {
    drawTiles: true,
    backgrounds: [
      'basketball',
      'football',
      'hockey',
      'soccer'
    ],
    balls: [
      'basketball',
      'football',
      'hockey',
      'soccer'
    ],
    paddles: [
      'hand_1',
      'hand_2',
      'hockey_stick',
      'foot'
    ],
    background: 'basketball_background.png',
    ball: 'basketball_ball.png',
    paddle: 'basketball_paddle.png',
    disableAudio: true,
    blockMsgs: {
      launchBall: msg.basketballLaunchBall(),
      launchBallTooltip: msg.basketballLaunchBallTooltip(),
      paddleCollide: msg.whenPlayerCollided(),
      paddleCollideTooltip: msg.whenPlayerCollidedTooltip(),
      paddleMiss: msg.whenBallMissesPlayer(),
      paddleSpeedRandom: msg.setPlayerSpeedRandom(),
      paddleSpeedVerySlow: msg.setPlayerSpeedVerySlow(),
      paddleSpeedSlow: msg.setPlayerSpeedSlow(),
      paddleSpeedNormal: msg.setPlayerSpeedNormal(),
      paddleSpeedFast: msg.setPlayerSpeedFast(),
      paddleSpeedVeryFast: msg.setPlayerSpeedVeryFast(),
      paddleSpeedTooltip: msg.setPlayerSpeedTooltip(),
      setPaddle: msg.setPlayer(),
    },
  }
};

exports.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  skin.retro = {
    background: skin.assetUrl('retro_background.png'),
    tiles: skin.assetUrl('retro_tiles_wall.png'),
    goaltiles: skin.assetUrl('retro_tiles_goal.png'),
    paddle: skin.assetUrl('retro_paddle.png'),
    ball: skin.assetUrl('retro_ball.png')
  };
  skin.hand_1 = {
    paddle: skin.assetUrl('hand_1.png'),
  };
  skin.hand_2 = {
    paddle: skin.assetUrl('hand_2.png'),
  };
  skin.hockey_stick = {
    paddle: skin.assetUrl('hockey_paddle.png'),
  };
  skin.foot = {
    paddle: skin.assetUrl('soccer_paddle.png'),
  };
  skin.basketball = {
    background: skin.assetUrl('basketball_background.png'),
    ball: skin.assetUrl('basketball_ball.png'),
    paddle: skin.hand_1.paddle,
  };
  skin.soccer = {
    background: skin.assetUrl('soccer_background.png'),
    ball: skin.assetUrl('soccer_ball.png'),
    drawTiles: false,
    paddle: skin.foot.paddle,
  };
  skin.hockey = {
    background: skin.assetUrl('hockey_background.png'),
    ball: skin.assetUrl('hockey_ball.png'),
    drawTiles: false,
    paddle: skin.hockey_stick.paddle,
  };
  skin.football = {
    background: skin.assetUrl('football_background.png'),
    ball: skin.assetUrl('football_ball.png'),
    drawTiles: false,
    paddle: skin.foot.paddle,
    rotateBall: true,
  };

  // Images
  skin.tiles = skin.assetUrl(config.tiles ||'tiles_wall.png');
  skin.goalTiles = skin.assetUrl(config.goalTiles ||'tiles_goal.png');
  skin.goal = skin.assetUrl(config.goal ||'goal.png');
  skin.goalSuccess = skin.assetUrl(config.goalSuccess ||'goal_success.png');
  skin.flagGoal = skin.assetUrl('flag_goal.png');
  skin.flagGoalSuccess = skin.assetUrl('flag_goal_success.png');
  skin.ball = skin.assetUrl(config.ball ||'ball.png');
  skin.paddle = skin.assetUrl(config.paddle ||'paddle.png');
  skin.obstacle = skin.assetUrl(config.obstacle ||'obstacle.png');
  skin.background = skin.assetUrl(config.background || 'background.png');

  skin.nonDisappearingPegmanHittingObstacle =
      !!config.nonDisappearingPegmanHittingObstacle;

  skin.obstacleScale = config.obstacleScale || 1.0;

  skin.largerObstacleAnimationTiles =
      skin.assetUrl(config.largerObstacleAnimationTiles);
  skin.hittingWallAnimation =
      skin.assetUrl(config.hittingWallAnimation);
  skin.approachingGoalAnimation =
      skin.assetUrl(config.approachingGoalAnimation);
  skin.drawTiles = config.drawTiles;
  skin.backgrounds = config.backgrounds || [];
  skin.balls = config.balls || [];
  skin.paddles = config.paddles || [];
  skin.teams = config.teams || [];
  skin.teamBackgrounds = {};
  skin.teams.forEach((team) =>
      skin.teamBackgrounds[team] = skin.assetUrl(`teams/${team}.png`));
  skin.disableAudio = config.disableAudio || false;
  skin.blockMsgs = config.blockMsgs;

  // Sounds
  skin.rubberSound = [skin.assetUrl('wall.mp3'), skin.assetUrl('wall.ogg')];
  skin.flagSound = [skin.assetUrl('win_goal.mp3'),
                    skin.assetUrl('win_goal.ogg')];
  skin.crunchSound = [skin.assetUrl('wall0.mp3'), skin.assetUrl('wall0.ogg')];
  skin.ballStartSound = [skin.assetUrl('ball_start.mp3'),
                         skin.assetUrl('ball_start.ogg')];
  skin.winPointSound = [skin.assetUrl('1_we_win.mp3'),
                        skin.assetUrl('1_we_win.ogg')];
  skin.winPoint2Sound = [skin.assetUrl('2_we_win.mp3'),
                         skin.assetUrl('2_we_win.ogg')];
  skin.losePointSound = [skin.assetUrl('1_we_lose.mp3'),
                         skin.assetUrl('1_we_lose.ogg')];
  skin.losePoint2Sound = [skin.assetUrl('2_we_lose.mp3'),
                          skin.assetUrl('2_we_lose.ogg')];
  skin.goal1Sound = [skin.assetUrl('1_goal.mp3'), skin.assetUrl('1_goal.ogg')];
  skin.goal2Sound = [skin.assetUrl('2_goal.mp3'), skin.assetUrl('2_goal.ogg')];
  skin.woodSound = [skin.assetUrl('1_paddle_bounce.mp3'),
                    skin.assetUrl('1_paddle_bounce.ogg')];
  skin.retroSound = [skin.assetUrl('2_paddle_bounce.mp3'),
                     skin.assetUrl('2_paddle_bounce.ogg')];
  skin.slapSound = [skin.assetUrl('1_wall_bounce.mp3'),
                    skin.assetUrl('1_wall_bounce.ogg')];
  skin.hitSound = [skin.assetUrl('2_wall_bounce.mp3'),
                   skin.assetUrl('2_wall_bounce.ogg')];

  skin.pegmanHeight = config.pegmanHeight || 52;
  skin.pegmanWidth = config.pegmanWidth || 49;
  skin.ballYOffset = config.ballYOffset || 0;
  skin.paddleYOffset = config.paddleYOffset || 0;
  skin.markerHeight = config.markerHeight || 50;
  skin.markerWidth = config.markerWidth || 50;
  return skin;
};
