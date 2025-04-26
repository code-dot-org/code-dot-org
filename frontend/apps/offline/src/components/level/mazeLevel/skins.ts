import {SkinDefinition} from './types';

const skins = {
  birds: {
    goalIdle: 'goalIdle.gif',
    obstacleIdle: 'obstacle.png',

    goalAnimation: 'goal.gif',
    maze_forever: 'maze_forever.png',
    largerObstacleAnimationTiles: 'tiles-broken.png',

    obstacleScale: 1.2,
    additionalSound: true,
    idlePegmanAnimation: 'idle_avatar.gif',
    wallPegmanAnimation: 'wall_avatar.png',
    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,
    hittingWallAnimation: 'wall.gif',
    approachingGoalAnimation: 'close_goal.png',
    pegmanHeight: 68,
    pegmanWidth: 51,
    pegmanYOffset: -14,
    turnAfterVictory: true,
  },
};

export const skinFor: (id: string) => SkinDefinition = id => {
  const assetUrl: (path: string) => string = (path: string) =>
    `/blockly/${path}`;

  const skinUrl: (path: string) => string = (path: string) =>
    `/skins/${id}/${path}`;

  // (1) Properties common across Blockly apps
  const skin = {
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
    upLeftArrow: assetUrl('media/common_images/moveupleft.png'),
    upRightArrow: assetUrl('media/common_images/moveupright.png'),
    downLeftArrow: assetUrl('media/common_images/movedownleft.png'),
    downRightArrow: assetUrl('media/common_images/movedownright.png'),
    leftJumpArrow: assetUrl('media/common_images/jumpleft.png'),
    downJumpArrow: assetUrl('media/common_images/jumpdown.png'),
    upJumpArrow: assetUrl('media/common_images/jumpup.png'),
    rightJumpArrow: assetUrl('media/common_images/jumpright.png'),
    upLeftJumpArrow: assetUrl('media/common_images/jumpupleft.png'),
    upRightJumpArrow: assetUrl('media/common_images/jumpupright.png'),
    downLeftJumpArrow: assetUrl('media/common_images/jumpdownleft.png'),
    downRightJumpArrow: assetUrl('media/common_images/jumpdownright.png'),
    northLineDraw: assetUrl('media/common_images/draw-north.png'),
    southLineDraw: assetUrl('media/common_images/draw-south.png'),
    eastLineDraw: assetUrl('media/common_images/draw-east.png'),
    westLineDraw: assetUrl('media/common_images/draw-west.png'),
    northwestLineDraw: assetUrl('media/common_images/draw-north-west.png'),
    northeastLineDraw: assetUrl('media/common_images/draw-north-east.png'),
    southwestLineDraw: assetUrl('media/common_images/draw-south-west.png'),
    southeastLineDraw: assetUrl('media/common_images/draw-south-east.png'),
    shortLineDraw: assetUrl('media/common_images/draw-short.png'),
    longLineDraw: assetUrl('media/common_images/draw-long.png'),
    shortLineDrawRight: assetUrl('media/common_images/draw-short-right.png'),
    longLineDrawRight: assetUrl('media/common_images/draw-long-right.png'),
    longLine: assetUrl('media/common_images/move-long.png'),
    shortLine: assetUrl('media/common_images/move-short.png'),
    soundIcon: assetUrl('media/common_images/play-sound.png'),
    clickIcon: assetUrl('media/common_images/when-click-hand.png'),
    clockIcon: assetUrl('media/common_images/clock-icon.png'),
    startIcon: assetUrl('media/common_images/when-run.png'),
    runArrow: assetUrl('media/common_images/run-arrow.png'),
    endIcon: assetUrl('media/common_images/end-icon.png'),
    speedFast: assetUrl('media/common_images/speed-fast.png'),
    speedMedium: assetUrl('media/common_images/speed-medium.png'),
    speedSlow: assetUrl('media/common_images/speed-slow.png'),
    scoreCard: assetUrl('media/common_images/increment-score-75percent.png'),
    randomPurpleIcon: assetUrl('media/common_images/random-purple.png'),

    // Sounds
    startSound: [skinUrl('start.mp3'), skinUrl('start.ogg')],
    winSound: [skinUrl('win.mp3'), skinUrl('win.ogg')],
    failureSound: [skinUrl('failure.mp3'), skinUrl('failure.ogg')],
  };

  // Load individual skin
  const config = skins[id];

  // (2) Default values for properties common across maze skins.
  skin.obstacleScale = 1.0;
  skin.obstacleAnimation = skin.assetUrl('obstacle.gif');
  skin.movePegmanAnimationSpeedScale = 1;
  skin.look = '#FFF';
  skin.background = skin.assetUrl('background.png');
  skin.tiles = skin.assetUrl('tiles.png');
  skin.pegmanHeight = 52;
  skin.pegmanWidth = 49;
  skin.pegmanYOffset = 0;
  // do we turn to the direction we're facing after performing our victory
  // animation?
  skin.turnAfterVictory = false;
  skin.danceOnLoad = false;

  // Sounds
  const soundAssetUrls = (skin, mp3Sound) => [
    skin.assetUrl(mp3Sound),
    skin.assetUrl(mp3Sound.match(/^(.*)\.mp3$/)[1] + '.ogg'),
  ];

  skin.obstacleSound = soundAssetUrls(skin, 'obstacle.mp3');
  skin.wallSound = soundAssetUrls(skin, 'wall.mp3');
  skin.winGoalSound = soundAssetUrls(skin, 'win_goal.mp3');
  skin.wall0Sound = soundAssetUrls(skin, 'wall0.mp3');
  skin.wall1Sound = soundAssetUrls(skin, 'wall1.mp3');
  skin.wall2Sound = soundAssetUrls(skin, 'wall2.mp3');
  skin.wall3Sound = soundAssetUrls(skin, 'wall3.mp3');
  skin.wall4Sound = soundAssetUrls(skin, 'wall4.mp3');

  // (3) Get properties from config
  const isAsset = /\.\S{3}$/; // ends in dot followed by three non-whitespace chars
  const isSound = /^(.*)\.mp3$/; // something.mp3

  function determineAssetUrl(val) {
    if (isSound.test(val)) {
      val = soundAssetUrls(skin, val);
    } else if (isAsset.test(val)) {
      val = skin.assetUrl(val);
    }

    return val;
  }

  for (const [prop, val] of Object.entries(config)) {
    console.log(prop, val);
    if (Array.isArray(val)) {
      skin[prop] = val.map(determineAssetUrl);
    } else {
      skin[prop] = determineAssetUrl(val);
    }
  }

  return skin;
};
