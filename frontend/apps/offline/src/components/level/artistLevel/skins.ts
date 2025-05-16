import {load as linePatternsLoader} from './linePatterns';

export interface AvatarSettings {
  width: number;
  height: number;
  numHeadings: number;
  numFrames: number;
  visible: boolean;
}

/**
 * Represents a complete skin for an artist level (or derivative).
 */
export interface Skin {
  id: string;
  assetUrl: (path: string) => string;
  avatar: string;
  avatar_2x: string;
  goal: string;
  obstacle: string;
  tiles?: string;
  smallStaticAvatar: string;
  staticAvatar: string;
  winAvatar: string;
  failureAvatar: string;
  obstacleAnimation?: string;
  decorationAnimation: string;
  decorationAnimation_2x: string;
  repeatImage: string;
  leftArrow: string;
  downArrow: string;
  upArrow: string;
  rightArrow: string;
  upLeftArrow: string;
  upRightArrow: string;
  downLeftArrow: string;
  downRightArrow: string;
  leftJumpArrow: string;
  downJumpArrow: string;
  upJumpArrow: string;
  rightJumpArrow: string;
  upLeftJumpArrow: string;
  upRightJumpArrow: string;
  downLeftJumpArrow: string;
  downRightJumpArrow: string;
  northLineDraw: string;
  southLineDraw: string;
  eastLineDraw: string;
  westLineDraw: string;
  northwestLineDraw: string;
  northeastLineDraw: string;
  southwestLineDraw: string;
  southeastLineDraw: string;
  shortLineDraw: string;
  longLineDraw: string;
  shortLineDrawRight: string;
  longLineDrawRight: string;
  longLine: string;
  shortLine: string;
  soundIcon: string;
  clickIcon: string;
  clockIcon: string;
  startIcon: string;
  runArrow: string;
  endIcon: string;
  speedFast: string;
  speedMedium: string;
  speedSlow: string;
  scoreCard: string;
  speedModifier: number;
  randomPurpleIcon: string;
  smoothAnimate?: boolean;
  consolidateTurnAndMove?: boolean;

  avatarSettings?: AvatarSettings;

  lineStylePatternOptions?: [string, string][];

  linePatterns: {
    [key: string]: string;
  };

  stickers?: {
    [key: string]: string;
  };

  shapes?: {
    [key: string]: string;
  };

  artistOptions?: string[];
  avatarAllowedScripts?: string[];
  blankAvatar?: string;

  // Sounds [mp3, ogg]
  startSound: [string, string];
  winSound: [string, string];
  failureSound: [string, string];
}

export const skinFor = (id: string) => {
  const assetUrl: (path: string) => string = (path: string) =>
    `/blockly/${path}`;

  const skinUrl: (path: string) => string = (path: string) =>
    `/skins/${id}/${path}`;

  const linePatterns = linePatternsLoader(assetUrl);

  const configs: {
    [key: string]: Partial<Skin>;
  } = {
    artist: {
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [
        [linePatterns.brickMenu, 'brickLine'],
        [linePatterns.candycaneMenu, 'candycaneLine'],
        [linePatterns.dashMenu, 'dashLine'],
        [linePatterns.diamondMenu, 'diamondLine'],
        [linePatterns.dotMenu, 'dotLine'],
        [linePatterns.flowerPinkMenu, 'flowerPinkLine'],
        [linePatterns.flowerPurpleMenu, 'flowerPurpleLine'],
        [linePatterns.flowerYellowMenu, 'flowerYellowLine'],
        [linePatterns.heartPinkMenu, 'heartPinkLine'],
        [linePatterns.lightningMenu, 'lightningLine'],
        [linePatterns.pawprintMenu, 'pawprintLine'],
        [linePatterns.rainbowMenu, 'rainbowLine'],
        [linePatterns.ropeMenu, 'ropeLine'],
        [linePatterns.smileyMenu, 'smileyLine'],
        [linePatterns.smokeMenu, 'smokeLine'],
        [linePatterns.smoke2Menu, 'smoke2Line'],
        [linePatterns.spikyMenu, 'spikyLine'],
        [linePatterns.squigglyMenu, 'squigglyLine'],
        [linePatterns.swirlyMenu, 'swirlyLine'],
        [linePatterns.swirly2Menu, 'swirly2Line'],
        [linePatterns.tiretrackMenu, 'tiretrackLine'],
        [linePatterns.traintrackMenu, 'traintrackLine'],
        [linePatterns.waterMenu, 'waterLine'],
      ],
    },
    anna: {
      // slider speed gets divided by this value
      speedModifier: 10,
      avatarSettings: {
        width: 73,
        height: 100,
        numHeadings: 36,
        numFrames: 10,
        visible: true,
      },
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      linePatterns: {
        patternDefault: assetUrl(
          'media/common_images/defaultline-menuicon.png',
        ),
        annaLine: skinUrl('annaline.png'),
        annaLine_2x: skinUrl('annaline_2x.png'),
      },
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [[skinUrl('annaline-menuicon.png'), 'annaLine']],
      artistOptions: ['anna', 'elsa'],
      avatarAllowedScripts: ['frozen'],
      blankAvatar: skinUrl('blank.png'),
    },
    elsa: {
      speedModifier: 10,
      avatarSettings: {
        width: 73,
        height: 100,
        numHeadings: 18,
        numFrames: 20,
        visible: true,
      },
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      linePatterns: {
        patternDefault: assetUrl(
          'media/common_images/defaultline-menuicon.png',
        ),
        elsaLine: skinUrl('elsaline.png'),
        elsaLine_2x: skinUrl('elsaline_2x.png'),
      },
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [[skinUrl('elsaline-menuicon.png'), 'elsaLine']],
      artistOptions: ['anna', 'elsa'],
      avatarAllowedScripts: ['frozen'],
      blankAvatar: skinUrl('blank.png'),
    },
  };

  // (1) Properties common across Blockly apps
  const skin: Skin = {
    id: id,
    assetUrl: skinUrl,
    linePatterns,

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
    smoothAnimate: false,
    consolidateTurnAndMove: false,
    speedModifier: 1,
    avatarSettings: {
      width: 70,
      height: 51,
      numHeadings: 180,
      numFrames: 1,
      visible: true,
    },

    // Sounds
    startSound: [skinUrl('start.mp3'), skinUrl('start.ogg')] as [
      string,
      string,
    ],
    winSound: [skinUrl('win.mp3'), skinUrl('win.ogg')] as [string, string],
    failureSound: [skinUrl('failure.mp3'), skinUrl('failure.ogg')] as [
      string,
      string,
    ],

    // Combine with config properties
    ...(configs[id] || {}),

    // Declare available line style patterns. This array of arrays is eventually used
    // to populate the image dropdown in the Set Pattern block.
    lineStylePatternOptions: [
      [linePatterns.patternDefault, 'DEFAULT'],
      ...(configs[id]?.lineStylePatternOptions || []),
    ],
  };

  return skin;
};
