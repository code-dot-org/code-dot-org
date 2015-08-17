/**
 * Load Skin for Flappy.
 */
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.
// graph: Colour of optional grid lines, or false.

var skinsBase = require('../skins');

var CONFIGS = {

  flappy: {
  }

};

exports.load = function(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  // todo: the way these are organized ends up being a little bit ugly as
  // lot of our assets are individual items not necessarily attached to a
  // specific theme

  skin.scifi = {
    background: skin.assetUrl('background_scifi.png'),
    avatar: skin.assetUrl('avatar_scifi.png'),
    obstacle_bottom: skin.assetUrl('obstacle_bottom_scifi.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_scifi_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_scifi.png'),
    ground: skin.assetUrl('ground_scifi.png'),
    ground_thumb: skin.assetUrl('ground_scifi_thumb.png')
  };

  skin.underwater = {
    background: skin.assetUrl('background_underwater.png'),
    avatar: skin.assetUrl('avatar_underwater.png'),
    obstacle_bottom: skin.assetUrl('obstacle_bottom_underwater.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_underwater_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_underwater.png'),
    ground: skin.assetUrl('ground_underwater.png'),
    ground_thumb: skin.assetUrl('ground_underwater_thumb.png')
  };

  skin.cave = {
    background: skin.assetUrl('background_cave.png'),
    avatar: skin.assetUrl('avatar_cave.png'),
    obstacle_bottom: skin.assetUrl('obstacle_bottom_cave.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_cave_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_cave.png'),
    ground: skin.assetUrl('ground_cave.png'),
    ground_thumb: skin.assetUrl('ground_cave_thumb.png')
  };

  skin.santa = {
    background: skin.assetUrl('background_santa.png'),
    avatar: skin.assetUrl('santa.png'),
    obstacle_bottom: skin.assetUrl('obstacle_bottom_santa.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_santa_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_santa.png'),
    ground: skin.assetUrl('ground_santa.png'),
    ground_thumb: skin.assetUrl('ground_santa_thumb.png')
  };

  skin.night = {
    background: skin.assetUrl('background_night.png')
  };

  skin.redbird = {
    avatar: skin.assetUrl('avatar_redbird.png')
  };

  skin.laser = {
    obstacle_bottom: skin.assetUrl('obstacle_bottom_laser.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_laser_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_laser.png')
  };

  skin.lava = {
    ground: skin.assetUrl('ground_lava.png'),
    ground_thumb: skin.assetUrl('ground_lava_thumb.png')
  };

  skin.shark = {
    avatar: skin.assetUrl('shark.png')
  };

  skin.easter = {
    avatar: skin.assetUrl('easterbunny.png')
  };

  skin.batman = {
    avatar: skin.assetUrl('batman.png')
  };

  skin.submarine = {
    avatar: skin.assetUrl('submarine.png')
  };

  skin.unicorn = {
    avatar: skin.assetUrl('unicorn.png')
  };

  skin.fairy = {
    avatar: skin.assetUrl('fairy.png')
  };

  skin.superman = {
    avatar: skin.assetUrl('superman.png')
  };

  skin.turkey = {
    avatar: skin.assetUrl('turkey.png')
  };

  // Images
  skin.ground = skin.assetUrl('ground.png');
  skin.ground_thumb = skin.assetUrl('ground_thumb.png');
  skin.obstacle_top = skin.assetUrl('obstacle_top.png');
  skin.obstacle_bottom = skin.assetUrl('obstacle_bottom.png');
  skin.obstacle_bottom_thumb = skin.assetUrl('obstacle_bottom_thumb.png');
  skin.instructions = skin.assetUrl('instructions.png');
  skin.clickrun = skin.assetUrl('clickrun.png');
  skin.getready = skin.assetUrl('getready.png');
  skin.gameover = skin.assetUrl('gameover.png');
  skin.flapIcon = skin.assetUrl('flap-bird.png');
  skin.crashIcon = skin.assetUrl('when-crash.png');
  skin.collideObstacleIcon = skin.assetUrl('when-obstacle.png');
  skin.collideGroundIcon = skin.assetUrl('when-crash.png');
  skin.enterObstacleIcon = skin.assetUrl('when-pass.png');
  skin.tiles = skin.assetUrl('tiles.png');
  skin.goal = skin.assetUrl('goal.png');
  skin.goalSuccess = skin.assetUrl('goal_success.png');
  skin.obstacle = skin.assetUrl('obstacle.png');
  skin.obstacleScale = config.obstacleScale || 1.0;
  skin.largerObstacleAnimationTiles =
      skin.assetUrl(config.largerObstacleAnimationTiles);
  skin.hittingWallAnimation =
      skin.assetUrl(config.hittingWallAnimation);
  skin.approachingGoalAnimation =
      skin.assetUrl(config.approachingGoalAnimation);
  // Sounds
  skin.obstacleSound =
      [skin.assetUrl('obstacle.mp3'), skin.assetUrl('obstacle.ogg')];
  skin.wallSound = [skin.assetUrl('wall.mp3'), skin.assetUrl('wall.ogg')];
  skin.winGoalSound = [skin.assetUrl('win_goal.mp3'),
                       skin.assetUrl('win_goal.ogg')];
  skin.wall0Sound = [skin.assetUrl('wall0.mp3'), skin.assetUrl('wall0.ogg')];

  skin.dieSound = [skin.assetUrl('sfx_die.mp3'), skin.assetUrl('sfx_die.ogg')];
  skin.hitSound = [skin.assetUrl('sfx_hit.mp3'), skin.assetUrl('sfx_hit.ogg')];
  skin.pointSound = [skin.assetUrl('sfx_point.mp3'), skin.assetUrl('sfx_point.ogg')];
  skin.swooshingSound = [skin.assetUrl('sfx_swooshing.mp3'), skin.assetUrl('sfx_swooshing.ogg')];
  skin.wingSound = [skin.assetUrl('sfx_wing.mp3'), skin.assetUrl('sfx_wing.ogg')];

  skin.jetSound = [skin.assetUrl('jet.mp3'), skin.assetUrl('jet.ogg')];
  skin.crashSound = [skin.assetUrl('crash.mp3'), skin.assetUrl('crash.ogg')];
  skin.jingleSound = [skin.assetUrl('jingle.mp3'), skin.assetUrl('jingle.ogg')];
  skin.laserSound = [skin.assetUrl('laser.mp3'), skin.assetUrl('laser.ogg')];
  skin.splashSound = [skin.assetUrl('splash.mp3'), skin.assetUrl('splash.ogg')];

  // Settings
  skin.graph = config.graph;
  skin.background = skin.assetUrl('background.png');

  return skin;
};
