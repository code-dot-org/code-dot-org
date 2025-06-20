import {SpriteSpeed} from '@/levels/studio/constants';
import type {MusicTrackDefinition} from '@/levels/studio/skin';
import {assetUrl, baseFor} from '@/levels/studio/skins';

const skins = {
  hoc2015x: {
    ...baseFor('hoc2015x'),
    preloadAssets: true,
    sortDrawOrder: true,
    hideIconInClearPuzzle: true,
    defaultBackground: 'endor',
    projectileFrames: 10,
    itemFrames: 10,
    instructions2ImageSubstitutions: {
      pufferpig: assetUrl('instructions_pufferpig.png'),
      mynock: assetUrl('instructions_mynock.png'),
      rebelpilot: assetUrl('instructions_rebelpilot.png'),
      stormtrooper: assetUrl('instructions_stormtrooper.png'),
      mousedroid: assetUrl('instructions_mousedroid.png'),
      tauntaun: assetUrl('instructions_tauntaun.png'),
      probot: assetUrl('instructions_probot.png'),
    },

    // NOTE: all class names should be unique.  eventhandler naming won't work
    // if we name a projectile class 'left' for example.
    ProjectileClassNames: [],

    ItemClassNames: [
      'pufferpig',
      'stormtrooper',
      'tauntaun',
      'mynock',
      'probot',
      'mousedroid',
      'rebelpilot',
    ],

    AutohandlerTouchItems: {
      whenTouchPufferPig: 'pufferpig',
      whenTouchStormtrooper: 'stormtrooper',
      whenTouchTauntaun: 'tauntaun',
      whenTouchMynock: 'mynock',
      whenTouchProbot: 'probot',
      whenTouchMouseDroid: 'mousedroid',
      whenTouchRebelPilot: 'rebelpilot',
      whenGetPufferPig: 'pufferpig',
      whenGetStormtrooper: 'stormtrooper',
      whenGetTauntaun: 'tauntaun',
      whenGetMynock: 'mynock',
      whenGetProbot: 'probot',
      whenGetMouseDroid: 'mousedroid',
      whenGetRebelPilot: 'rebelpilot',
    },

    AutohandlerGetAllItems: {
      whenGetAllPufferPigs: 'pufferpig',
      whenGetAllStormtroopers: 'stormtrooper',
      whenGetAllTauntauns: 'tauntaun',
      whenGetAllMynocks: 'mynock',
      whenGetAllProbots: 'probot',
      whenGetAllMouseDroids: 'mousedroid',
      whenGetAllRebelPilots: 'rebelpilot',
    },

    specialItemProperties: {
      pufferpig: {
        frames: 12,
        width: 100,
        height: 100,
        scale: 1,
        renderOffset: {x: 0, y: -15},
        activity: 'roam',
        speed: SpriteSpeed.VERY_SLOW,
        spritesCounterclockwise: true,
      },
      stormtrooper: {
        frames: 12,
        width: 100,
        height: 100,
        scale: 1.1,
        renderOffset: {x: 0, y: -15},
        activity: 'chase',
        speed: SpriteSpeed.VERY_SLOW,
        spritesCounterclockwise: true,
      },
      tauntaun: {
        frames: 15,
        width: 100,
        height: 100,
        scale: 1.6,
        renderOffset: {x: 0, y: 20},
        activity: 'roam',
        speed: SpriteSpeed.SLOW,
        spritesCounterclockwise: true,
      },
      mynock: {
        frames: 8,
        width: 100,
        height: 100,
        scale: 0.9,
        renderOffset: {x: 0, y: -20},
        activity: 'roam',
        speed: SpriteSpeed.SLOW,
        spritesCounterclockwise: true,
      },
      probot: {
        frames: 12,
        width: 100,
        height: 100,
        scale: 1.2,
        renderOffset: {x: 0, y: -10},
        activity: 'chase',
        speed: SpriteSpeed.LITTLE_SLOW,
        spritesCounterclockwise: true,
      },
      mousedroid: {
        frames: 1,
        width: 100,
        height: 100,
        scale: 0.5,
        renderOffset: {x: 0, y: -20},
        activity: 'flee',
        speed: SpriteSpeed.LITTLE_SLOW,
        spritesCounterclockwise: true,
      },
      rebelpilot: {
        frames: 13,
        width: 100,
        height: 100,
        scale: 1,
        renderOffset: {x: 0, y: -20},
        activity: 'flee',
        speed: SpriteSpeed.SLOW,
        spritesCounterclockwise: true,
      },
    },
  },
};

/**
 * Music tracks and associated metadata for both hoc2015 and hoc2015x tutorials.
 * Individual levels don't load all of these, only the subset they request.
 */
export const HOC2015_MUSIC_METADATA: MusicTrackDefinition[] = [
  {name: 'song1', volume: 0.5},
  {name: 'song2', volume: 0.5},
  {name: 'song3', volume: 0.5},
  {name: 'song4', volume: 0.4},
  {name: 'song5', volume: 0.4},
  {name: 'song6', volume: 0.5},
  {name: 'song7', volume: 0.4},
  {name: 'song8', volume: 0.4},
  {name: 'song9', volume: 0.4},
  {name: 'song10', volume: 0.5},
  {name: 'song11', volume: 0.45},
  {name: 'song12', volume: 0.4},
  {name: 'song13', volume: 0.4},
  {name: 'song14', volume: 0.5},
  {name: 'song15', volume: 0.55},
];

export default skins;
