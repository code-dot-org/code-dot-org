const FacingDirection = require("./FacingDirection.js");

/**
 * Converts entities found within the levelConfig.actionPlane to a
 * levelConfig.entities suitable for loading by the game initializer.
 *
 * ['sheepRight', 'creeperUp] -> [['sheep', 0, 0, 1], ['creeper', 1, 0, 0]]
 *
 * @param levelConfig
 */
module.exports.convertActionPlaneEntitiesToConfig = function (levelConfig) {
  const [width, height] = levelConfig.gridWidth && levelConfig.gridHeight ?
    [levelConfig.gridWidth, levelConfig.gridHeight] : [10, 10];

  var planesToCustomize = [levelConfig.actionPlane];
  planesToCustomize.forEach(function (plane) {
    for (let i = 0; i < plane.length; i++) {
      const x = i % width;
      const y = Math.floor(i / height);
      const entity = module.exports.convertNameToEntity(plane[i], x, y);

      if (entity) {
        levelConfig.entities = levelConfig.entities || [];
        levelConfig.entities.push(entity);
        plane[i] = '';
      }
    }
  });
};

module.exports.randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

const suffixToDirection = {
  Up: FacingDirection.North,
  Down: FacingDirection.South,
  Left: FacingDirection.West,
  Right: FacingDirection.East,
};

module.exports.convertNameToEntity = function (item, x, y) {
  if (item.match(/^(sheep|zombie|ironGolem|creeper|cod|cow|chicken|dolphin|ghast|boat|salmon|squid|tropicalFish|seaTurtle)(Right|Left|Up|Down|$)/)) {
    const directionMatch = item.match(/(.*)(Right|Left|Up|Down)/);
    const directionToUse = directionMatch ?
      suffixToDirection[directionMatch[2]] : FacingDirection.East;
    const entityToUse = directionMatch ? directionMatch[1] : item;
    return [entityToUse, x, y, directionToUse];
  }
};
