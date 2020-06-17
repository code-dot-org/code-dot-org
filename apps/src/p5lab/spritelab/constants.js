/** @file Sprite Lab constants */
var utils = require('@cdo/apps/utils');
var msg = require('@cdo/locale');

module.exports.LocationPickerMode = utils.makeEnum('IDLE', 'SELECTING');

module.exports.CostumeCategories = {
  category_animals: msg.costumeCategoryAnimals(),
  category_generic_items: msg.costumeCategoryGenericItems(),
  category_vehicles: msg.costumeCategoryVehicles(),
  category_characters: msg.costumeCategoryCharacters(),
  category_environment: msg.costumeCategoryEnvironment(),
  category_food: msg.costumeCategoryFood(),
  category_tools: msg.costumeCategoryTools(),
  category_gameplay: msg.costumeCategoryGameplay(),
  category_obstacles: msg.costumeCategoryObstacles(),
  category_all: msg.costumeCategoryAll()
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
