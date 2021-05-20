/** @file Sprite Lab constants */
var utils = require('@cdo/apps/utils');

module.exports.LocationPickerMode = utils.makeEnum('IDLE', 'SELECTING');

module.exports.SpritelabReservedWords = [
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
  'setupSim'
];
