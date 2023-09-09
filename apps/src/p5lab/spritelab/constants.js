/** @file Sprite Lab constants */
import utils from '@cdo/apps/utils';

export const LocationPickerMode = utils.makeEnum('IDLE', 'SELECTING');

export const SpritelabReservedWords = [
  // p5 globals
  'CENTER',
  'World',
  'background',
  'color',
  'createEdgeSprites',
  'createGroup',
  'createSprite',
  'drawSprites',
  'edges',
  'fill',
  'keyDown',
  'keyWentDown',
  'keyWentUp',
  'mousePressedOver',
  'mouseWentDown',
  'randomNumber',
  'rect',
  'text',
  'textAlign',
  'textSize',
  'setup',
  // NativeSpriteLab.interpreted.js
  'extraArgs',
  'draw',
  'clickedOn',
  'draggable',
  'pointInDirection',
  'randColor',
  'randomColor',
  'mouseLocation',
  'setSizes',
  'whenDownArrow',
  'whenKey',
  'whenLeftArrow',
  'whenRightArrow',
  'whenTouching',
  'whenUpArrow',
  'whileDownArrow',
  'whileKey',
  'whileLeftArrow',
  'whileRightArrow',
  'whileTouching',
  'whileUpArrow',
  'xLocationOf',
  'yLocationOf',
  'setupSim',
  'everyInterval',
];

export const valueTypeTabShapeMap = function (blockly) {
  return {
    [blockly.BlockValueType.SPRITE]: 'angle',
    [blockly.BlockValueType.BEHAVIOR]: 'rounded',
    [blockly.BlockValueType.LOCATION]: 'square',
  };
};

// The metadata for a single costume and a single background for previews. This can be used to render
// previews for a thumbnail or when a whole list of sprites aren't needed.
export const exampleSprites = {
  orderedKeys: [
    '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2',
    '8ca751af-ef34-4fd4-9e96-6e985f93f4c2',
  ],
  propsByKey: {
    '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2': {
      name: 'bear',
      sourceUrl:
        'https://studio.code.org/api/v1/animation-library/spritelab/wAQoTe9lNAp19q.JxOmT6hRtv1GceGwp/category_animals/bear.png',
      frameSize: {x: 254, y: 333},
      frameCount: 1,
      looping: true,
      frameDelay: 2,
      version: 'wAQoTe9lNAp19q.JxOmT6hRtv1GceGwp',
      categories: ['animals'],
    },
    '8ca751af-ef34-4fd4-9e96-6e985f93f4c2': {
      name: 'cave',
      sourceUrl:
        'https://studio.code.org/api/v1/animation-library/spritelab/3LUT4MZxHDWhZbAtYtEmQD1ZrfwQ7jFG/category_backgrounds/background_cave.png',
      frameSize: {
        x: 400,
        y: 400,
      },
      frameCount: 1,
      looping: true,
      frameDelay: 2,
      version: '3LUT4MZxHDWhZbAtYtEmQD1ZrfwQ7jFG',
      categories: ['backgrounds'],
    },
  },
};

// Big numbers in some blocks can cause performance issues. Combined with live-preview,
// this results in hanging the tab and students unable to edit their blocks. We
// guard against this by capping number of sprites.
// The sprite cap is MAX_NUM_SPRITES, and a workspace alert will be dispatched
// at (MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER) number of sprites.
export const MAX_NUM_SPRITES = 1000;
export const SPRITE_WARNING_BUFFER = 1;
export const MAX_NUM_TEXTS = 1000;
