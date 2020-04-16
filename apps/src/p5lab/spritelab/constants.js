/** @file Sprite Lab constants */
var utils = require('@cdo/apps/utils');
var spritelabMsg = require('@cdo/spritelab/locale');

module.exports.LocationPickerMode = utils.makeEnum('IDLE', 'SELECTING');

module.exports.CostumeCategories = {
  category_animals: spritelabMsg.costumeCategoryAnimals(),
  category_generic_items: spritelabMsg.costumeCategoryGenericItems(),
  category_vehicles: spritelabMsg.costumeCategoryVehicles(),
  category_characters: spritelabMsg.costumeCategoryCharacters(),
  category_environment: spritelabMsg.costumeCategoryEnvironment(),
  category_food: spritelabMsg.costumeCategoryFood(),
  category_tools: spritelabMsg.costumeCategoryTools(),
  category_gameplay: spritelabMsg.costumeCategoryGameplay(),
  category_obstacles: spritelabMsg.costumeCategoryObstacles(),
  category_all: spritelabMsg.costumeCategoryAll()
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
