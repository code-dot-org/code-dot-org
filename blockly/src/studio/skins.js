/**
 * Load Skin for Studio.
 */
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.

var skinsBase = require('../skins');

var CONFIGS = {
  studio: {
  }
};

exports.load = function(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  skin.hardcourt = {
    background: skin.assetUrl('background.png'),
  };
  skin.black = {
    background: skin.assetUrl('retro_background.png'),
  };
  skin.cave = {
    background: skin.assetUrl('background_cave.png'),
  };
  skin.night = {
    background: skin.assetUrl('background_santa.png'),
  };
  skin.cloudy = {
    background: skin.assetUrl('background_scifi.png'),
  };
  skin.underwater = {
    background: skin.assetUrl('background_underwater.png'),
  };
  skin.city = {
    background: skin.assetUrl('background_city.png'),
  };
  skin.desert = {
    background: skin.assetUrl('background_desert.png'),
  };
  skin.rainbow = {
    background: skin.assetUrl('background_rainbow.png'),
  };
  skin.soccer = {
    background: skin.assetUrl('background_soccer.png'),
  };
  skin.space = {
    background: skin.assetUrl('background_space.png'),
  };
  skin.tennis = {
    background: skin.assetUrl('background_tennis.png'),
  };
  skin.winter = {
    background: skin.assetUrl('background_winter.png'),
  };
  skin.grid = {
    background: skin.assetUrl('background_grid.png'),
  };

  skin.avatarList = [ "dog", "cat", "penguin", "dinosaur", "octopus", "witch",
    "bat", "bird", "dragon", "squirrel", "wizard", "alien", "ghost", "monster",
    "robot", "unicorn", "zombie", "knight", "ninja", "pirate", "caveboy",
    "cavegirl", "princess", "spacebot", "soccergirl", "soccerboy", "tennisgirl",
    "tennisboy"];

  /**
   * Sprite thumbs generated with:
   * `brew install graphicsmagick`
   * `gm convert +adjoin -crop 200x200 -resize 100x100 *spritesheet* output%02d.png`
   */
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl(name + '_spritesheet_200px.png'),
      dropdownThumbnail: skin.assetUrl(name + '_thumb.png'),
      spriteFlags: 28  // flags: emotions, animation, turns
    };
  });

  // Images
  skin.yellow_hearts = skin.assetUrl('yellow_hearts.gif');
  skin.purple_hearts = skin.assetUrl('purple_hearts.gif');
  skin.red_hearts = skin.assetUrl('red_hearts.gif');
  skin.blue_fireball = skin.assetUrl('blue_fireball.png');
  skin.purple_fireball = skin.assetUrl('purple_fireball.png');
  skin.red_fireball = skin.assetUrl('red_fireball.png');
  skin.explosion = skin.assetUrl('explosion.gif');
  skin.explosionThumbnail = skin.assetUrl('explosion_thumb.png');
  skin.whenUp = skin.assetUrl('when-up.png');
  skin.whenDown = skin.assetUrl('when-down.png');
  skin.whenLeft = skin.assetUrl('when-left.png');
  skin.whenRight = skin.assetUrl('when-right.png');
  skin.collide = skin.assetUrl('when-sprite-collide.png');
  skin.emotionAngry = skin.assetUrl('emotion-angry.png');
  skin.emotionNormal = skin.assetUrl('emotion-nothing.png');
  skin.emotionSad = skin.assetUrl('emotion-sad.png');
  skin.emotionHappy = skin.assetUrl('emotion-happy.png');
  skin.speechBubble = skin.assetUrl('say-sprite.png');
  skin.goal = skin.assetUrl('goal.png');
  skin.goalSuccess = skin.assetUrl('goal_success.png');
  skin.approachingGoalAnimation =
      skin.assetUrl(config.approachingGoalAnimation);
  // Sounds
  skin.rubberSound = [skin.assetUrl('wall.mp3'), skin.assetUrl('wall.ogg')];
  skin.flagSound = [skin.assetUrl('win_goal.mp3'),
                    skin.assetUrl('win_goal.ogg')];
  skin.crunchSound = [skin.assetUrl('wall0.mp3'), skin.assetUrl('wall0.ogg')];
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

  // Settings
  if (config.background !== undefined) {
    var index = Math.floor(Math.random() * config.background);
    skin.background = skin.assetUrl('background' + index + '.png');
  } else {
    skin.background = skin.assetUrl('background.png');
  }
  skin.spriteHeight = config.spriteHeight || 100;
  skin.spriteWidth = config.spriteWidth || 100;
  skin.dropdownThumbnailWidth = 50;
  skin.dropdownThumbnailHeight = 50;
  return skin;
};
