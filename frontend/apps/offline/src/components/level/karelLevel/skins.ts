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
};

export default skins;
