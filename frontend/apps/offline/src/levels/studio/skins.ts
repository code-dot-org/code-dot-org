import {RANDOM_VALUE} from '@/levels/studio/constants';

import type {Skin} from './skin';

export const assetUrl: (path: string) => string = path => `/blockly/${path}`;

export const buildSkinUrl: (id: string, path: string) => string = (id, path) =>
  `/skins/${id}/${path}`;

// Just iterate through a string array and build the skin data or do it via skinFor
export function baseFor(id: string): Skin {
  const skinUrl = buildSkinUrl.bind(null, id);
  return {
    id,
    assetUrl: skinUrl,
    avatar: skinUrl('avatar.png'),
    avatar_2x: skinUrl('avatar_2x.png'),
    avatarList: [],
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
    ProjectileClassNames: [
      'airplane',
      'basketball',
      'disc',
      'pie',
      'pumpkin',
      'star',
      'sandwich',
      'snowball',
      'blue_fireball',
      'purple_fireball',
      'red_fireball',
      'purple_hearts',
      'red_hearts',
      'yellow_hearts',
    ],
    specialProjectileProperties: {
      airplane: {frames: 10},
      basketball: {frames: 10},
      disc: {frames: 10},
      pie: {frames: 10},
      pumpkin: {frames: 10},
      star: {frames: 10},
      sandwich: {frames: 10},
      snowball: {frames: 10},
    },
    ItemClassNames: [
      'item_airplane',
      'item_basketball',
      'item_disc',
      'item_pie',
      'item_pumpkin',
      'item_star',
      'item_sandwich',
      'item_snowball',
      'item_blue_fireball',
      'item_purple_fireball',
      'item_red_fireball',
      'item_purple_hearts',
      'item_red_hearts',
      'item_yellow_hearts',
    ],

    // Images
    items: {
      airplane: skinUrl('projectile_airplane.png'),
      basketball: skinUrl('projectile_basketball.png'),
      disc: skinUrl('projectile_disc.png'),
      pie: skinUrl('projectile_pie.png'),
      pumpkin: skinUrl('projectile_pumpkin.png'),
      star: skinUrl('projectile_star.png'),
      sandwich: skinUrl('projectile_sandwich.png'),
      snowball: skinUrl('projectile_snowball.png'),
      yellow_hearts: skinUrl('yellow_hearts.gif'),
      purple_hearts: skinUrl('purple_hearts.gif'),
      red_hearts: skinUrl('red_hearts.gif'),
      blue_fireball: skinUrl('blue_fireball.png'),
      purple_fireball: skinUrl('purple_fireball.png'),
      red_fireball: skinUrl('red_fireball.png'),

      item_airplane: skinUrl('projectile_airplane.png'),
      item_basketball: skinUrl('projectile_basketball.png'),
      item_disc: skinUrl('projectile_disc.png'),
      item_pie: skinUrl('projectile_pie.png'),
      item_pumpkin: skinUrl('projectile_pumpkin.png'),
      item_star: skinUrl('projectile_star.png'),
      item_sandwich: skinUrl('projectile_sandwich.png'),
      item_snowball: skinUrl('projectile_snowball.png'),
      item_yellow_hearts: skinUrl('yellow_hearts.gif'),
      item_purple_hearts: skinUrl('purple_hearts.gif'),
      item_red_hearts: skinUrl('red_hearts.gif'),
      item_blue_fireball: skinUrl('blue_fireball.png'),
      item_purple_fireball: skinUrl('purple_fireball.png'),
      item_red_fireball: skinUrl('red_fireball.png'),

      whenUp: skinUrl('when-up.png'),
      whenDown: skinUrl('when-down.png'),
      whenLeft: skinUrl('when-left.png'),
      whenRight: skinUrl('when-right.png'),
      collide: skinUrl('when-sprite-collide.png'),
      emotionAngry: skinUrl('emotion-angry.png'),
      emotionNormal: skinUrl('emotion-nothing.png'),
      emotionSad: skinUrl('emotion-sad.png'),
      emotionHappy: skinUrl('emotion-happy.png'),
      speechBubble: skinUrl('say-sprite.png'),
    },

    goal: skinUrl('goal.png'),
    goalSuccess: skinUrl('goal_success.png'),

    // Sounds
    builtinSounds: ['start', 'win', 'failure', 'flag'],
    sounds: [
      'rubber',
      'crunch',
      'goal1',
      'goal2',
      'wood',
      'retro',
      'slap',
      'hit',
      'winpoint',
      'winpoint2',
      'losepoint',
      'losepoint2',
    ],

    soundChoices: [
      ['play random sound', RANDOM_VALUE],
      ['play hit sound', 'hit'],
      ['play wood sound', 'wood'],
      ['play retro sound', 'retro'],
      ['play slap sound', 'slap'],
      ['play rubber sound', 'rubber'],
      ['play crunch sound', 'crunch'],
      ['play win point sound', 'winpoint'],
      ['play win point 2 sound', 'winpoint2'],
      ['play lose point sound', 'losepoint'],
      ['play lose point 2 sound', 'losepoint2'],
      ['play goal 1 sound', 'goal1'],
      ['play goal 2 sound', 'goal2'],
    ],

    soundChoicesK1: [
      ['random', RANDOM_VALUE],
      ['hit', 'hit'],
      ['wood', 'wood'],
      ['retro', 'retro'],
      ['slap', 'slap'],
      ['rubber', 'rubber'],
      ['crunch', 'crunch'],
      ['win point', 'winpoint'],
      ['win point 2', 'winpoint2'],
      ['lose point', 'losepoint'],
      ['lose point 2', 'losepoint2'],
      ['goal 1', 'goal1'],
      ['goal 2', 'goal2'],
    ],

    // Settings
    background: assetUrl('background.png'),
    defaultBackground: 'cave',
    spriteHeight: 100,
    spriteWidth: 100,
    dropdownThumbnailWidth: 50,
    dropdownThumbnailHeight: 50,
    preloadAssets: true,
    projectileFrames: 8,
    itemFrames: 8,
    explosion: skinUrl('explosion.png'),

    // Offset for the rectangle in collidable in which wall collisions occur.
    // Default to no offset here and allow other skins to override.
    wallCollisionRectOffsetX: 0,
    wallCollisionRectOffsetY: 0,

    setSpritePrefix: 'set',

    activityChoices: [
      ['set activity to random for', RANDOM_VALUE],
      ['set activity to roam for', '"roam"'],
      ['set activity to chase for', '"chase"'],
      ['set activity to flee for', '"flee"'],
      ['set activity to none for', '"none"'],
    ],

    backgrounds: {
      ...Object.fromEntries(
        [
          'characters',
          'checkers',
          'clouds',
          'cornered',
          'dots',
          'graffiti',
          'space',
          'squares',
          'stripes',
          'wood',
        ].map(name => [
          name,
          {
            background: skinUrl(`background_${name}.png`),
            tiles: '',
          },
        ]),
      ),
    },
  };
}

export function skinFor(
  id: string,
  builder: (skinUrl: (path: string) => string) => Partial<Skin>,
): Skin {
  const base = baseFor(id);
  const skinUrl = buildSkinUrl.bind(null, id);
  const options = builder(skinUrl);

  return {
    ...base,
    ...options,
    items: {
      ...(base.items || {}),
      ...(options.items || {}),
    },
    backgrounds: {
      ...(base.backgrounds || {}),
      ...(options.backgrounds || {}),
    },
  };
}
