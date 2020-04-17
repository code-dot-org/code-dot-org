var msg = require('@cdo/locale');

/** @const {string} */
module.exports.GAMELAB_DPAD_CONTAINER_ID = 'studio-dpad-container';

module.exports.AnimationCategories = {
  category_animals: msg.costumeCategoryAnimals(),
  category_backgrounds: msg.costumeCategoryBackground(),
  category_generic_items: msg.costumeCategoryGenericItems(),
  category_vehicles: msg.costumeCategoryVehicles(),
  category_characters: msg.costumeCategoryCharacters(),
  category_environment: msg.costumeCategoryEnvironment(),
  category_food: msg.costumeCategoryFood(),
  category_tools: msg.costumeCategoryTools(),
  category_gameplay: msg.costumeCategoryBoardGames(),
  category_music: msg.costumeCategoryMusic(),
  category_obstacles: msg.costumeCategoryObstacles(),
  category_all: msg.costumeCategoryAll()
};
