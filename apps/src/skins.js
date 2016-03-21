// avatar: A 1029x51 set of 21 avatar images.

exports.load = function(assetUrl, id) {
  var skinUrl = function(path) {
    if (path !== undefined) {
      return assetUrl('media/skins/' + id + '/' + path);
    } else {
      return null;
    }
  };

  var skin = {
    id: id,
    assetUrl: skinUrl,
    // Images
    avatar: skinUrl('avatar.png'),
    avatar_2x: skinUrl('avatar_2x.png'),
    goal: skinUrl('goal.png'),
    obstacle: skinUrl('obstacle.png'),
    smallStaticAvatar: skinUrl('small_static_avatar.png'),
    staticAvatar: skinUrl('static_avatar.png'),
    winAvatar: skinUrl('win_avatar.png'),
    failureAvatar: skinUrl('failure_avatar.png'),
    decorationAnimation: skinUrl('decoration_animation.png'),
    decorationAnimation_2x: skinUrl('decoration_animation_2x.png'),
    repeatImage: assetUrl('media/common_images/repeat-arrows.png'),
    leftArrow: assetUrl('media/common_images/moveleft.png'),
    downArrow: assetUrl('media/common_images/movedown.png'),
    upArrow: assetUrl('media/common_images/moveup.png'),
    rightArrow: assetUrl('media/common_images/moveright.png'),
    leftJumpArrow: assetUrl('media/common_images/jumpleft.png'),
    downJumpArrow: assetUrl('media/common_images/jumpdown.png'),
    upJumpArrow: assetUrl('media/common_images/jumpup.png'),
    rightJumpArrow: assetUrl('media/common_images/jumpright.png'),
    northLineDraw: assetUrl('media/common_images/draw-north.png'),
    southLineDraw: assetUrl('media/common_images/draw-south.png'),
    eastLineDraw: assetUrl('media/common_images/draw-east.png'),
    westLineDraw: assetUrl('media/common_images/draw-west.png'),
    shortLineDraw: assetUrl('media/common_images/draw-short.png'),
    longLineDraw: assetUrl('media/common_images/draw-long.png'),
    shortLineDrawRight: assetUrl('media/common_images/draw-short-right.png'),
    longLineDrawRight: assetUrl('media/common_images/draw-long-right.png'),
    longLine: assetUrl('media/common_images/move-long.png'),
    shortLine: assetUrl('media/common_images/move-short.png'),
    soundIcon: assetUrl('media/common_images/play-sound.png'),
    clickIcon: assetUrl('media/common_images/when-click-hand.png'),
    startIcon: assetUrl('media/common_images/when-run.png'),
    runArrow: assetUrl('media/common_images/run-arrow.png'),
    endIcon: assetUrl('media/common_images/end-icon.png'),
    speedFast: assetUrl('media/common_images/speed-fast.png'),
    speedMedium: assetUrl('media/common_images/speed-medium.png'),
    speedSlow: assetUrl('media/common_images/speed-slow.png'),
    scoreCard: assetUrl('media/common_images/increment-score-75percent.png'),
    rainbowMenu: assetUrl('media/common_images/rainbow-menuicon.png'),
    ropeMenu: assetUrl('media/common_images/rope-menuicon.png'),
    squigglyMenu: assetUrl('media/common_images/squiggly-menuicon.png'),
    swirlyMenu: assetUrl('media/common_images/swirlyline-menuicon.png'),
    patternDefault: assetUrl('media/common_images/defaultline-menuicon.png'),
    rainbowLine: assetUrl('media/common_images/rainbow.png'),
    ropeLine: assetUrl('media/common_images/rope.png'),
    squigglyLine: assetUrl('media/common_images/squiggly.png'),
    swirlyLine: assetUrl('media/common_images/swirlyline.png'),
    randomPurpleIcon: assetUrl('media/common_images/random-purple.png'),

    // Sounds
    startSound: [skinUrl('start.mp3'), skinUrl('start.ogg')],
    winSound: [skinUrl('win.mp3'), skinUrl('win.ogg')],
    failureSound: [skinUrl('failure.mp3'), skinUrl('failure.ogg')],

    // Stickers
    stickers: {
      elephant: assetUrl('media/common_images/stickers/elephant.png'),
      dragon: assetUrl('media/common_images/stickers/dragon.png'),
      triceratops: assetUrl('media/common_images/stickers/triceratops.png'),
      monkey: assetUrl('media/common_images/stickers/monkey.png'),
      cat: assetUrl('media/common_images/stickers/cat.png'),
      turtle: assetUrl('media/common_images/stickers/turtle.png'),
      goat: assetUrl('media/common_images/stickers/goat.png'),
      zebra: assetUrl('media/common_images/stickers/zebra.png'),
      hippo: assetUrl('media/common_images/stickers/hippo.png'),
      bunny: assetUrl('media/common_images/stickers/bunny.png'),
      peacock: assetUrl('media/common_images/stickers/peacock.png'),
      llama: assetUrl('media/common_images/stickers/llama.png'),
      giraffe: assetUrl('media/common_images/stickers/giraffe.png'),
      mouse: assetUrl('media/common_images/stickers/mouse.png'),
      beaver: assetUrl('media/common_images/stickers/beaver.png'),
      bat: assetUrl('media/common_images/stickers/bat.png'),
      grasshopper: assetUrl('media/common_images/stickers/grasshopper.png'),
      chicken: assetUrl('media/common_images/stickers/chicken.png'),
      moose: assetUrl('media/common_images/stickers/moose.png'),
      owl: assetUrl('media/common_images/stickers/owl.png'),
      penguin: assetUrl('media/common_images/stickers/penguin.png'),
      lion: assetUrl('media/common_images/stickers/lion.png'),
      robot: assetUrl('media/common_images/stickers/robot.png'),
      rocket: assetUrl('media/common_images/stickers/rocket.png'),
    }
  };

  return skin;
};
