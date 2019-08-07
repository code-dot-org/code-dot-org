/** @file Sprite Lab constants */
var utils = require('@cdo/apps/utils');

module.exports.LocationPickerMode = utils.makeEnum('IDLE', 'SELECTING');

module.exports.CostumeCategories = {
  category_animals: 'Animals',
  category_generic_items: 'Generic items',
  category_vehicles: 'Vehicles',
  category_characters: 'Characters',
  category_environment: 'Environment',
  category_food: 'Food',
  category_tools: 'Tools',
  category_gameplay: 'Board games',
  category_obstacles: 'Obstacles',
  category_all: 'All'
};

module.exports.SpritelabReservedWords = [
  // p5 globals
  'CENTER',
  'World',
  'background',
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
