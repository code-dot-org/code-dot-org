const skins = {
  collector: {
    wallPegmanAnimation: 'wall_avatar.png',
    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1,
    movePegmanAnimationFrameNumber: 8,
    pegmanHeight: 50,
    pegmanWidth: 50,

    goal: 'gem.png',
    collectBlock: 'gem_cropped.png',
    corners: 'corners.png',

    collectSounds: ['get_gem_2.mp3', 'get_gem_4.mp3', 'get_gem_6.mp3'],

    // Walk sound works, but the current available audio is a bit too harsh for
    // classroom usage. Temporarily disabling until we get some milder audio
    //walkSound: 'walk.mp3',

    look: '#000',
    transparentTileEnding: true,
    nonDisappearingPegmanHittingObstacle: true,
    background: 'background.png',
    danceOnLoad: true,
  },
  farmer: {
    obstacleIdle: 'obstacle.png',
    dirt: 'dirt.png',
    fillSound: 'fill.mp3',
    digSound: 'dig.mp3',
    look: '#000',
    transparentTileEnding: true,
    nonDisappearingPegmanHittingObstacle: true,
    background: 'background' + Math.floor(Math.random() * 4) + '.png',
    dirtSound: true,
    pegmanYOffset: -8,
    danceOnLoad: true,
  },
  bee: {
    obstacleIdle: 'obstacle.png',
    redFlower: 'redFlower.png',
    purpleFlower: 'purpleFlower.png',
    honey: 'honey.png',
    cloud: 'cloud.png',
    cloudAnimation: 'cloud_hide.gif',
    beeSound: true,
    nectarSound: 'getNectar.mp3',
    honeySound: 'makeHoney.mp3',

    look: '#000',
    nonDisappearingPegmanHittingObstacle: true,
    idlePegmanAnimation: 'idle_avatar.gif',
    wallPegmanAnimation: 'wall_avatar.png',
    movePegmanAnimation: 'move_avatar.png',
    hittingWallAnimation: 'wall.gif',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,
    actionSpeedScale: {
      nectar: 1,
    },
    pegmanYOffset: 0,
    pegmanHeight: 50,
    pegmanWidth: 50,
  },
};

export default skins;
