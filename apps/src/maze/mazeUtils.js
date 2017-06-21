import Bee from './bee';
import Collector from './collector';
import WordSearch from './wordsearch';
import Scrat from './scrat';
import Farmer from './farmer';
import Harvester from './harvester';
import Planter from './planter';

/**
 * Is skin either bee or bee_night
 */
exports.isBeeSkin = function (skinId) {
  return (/bee(_night)?/).test(skinId);
};

/**
 * Is skin either collector or collector_night
 */
exports.isCollectorSkin = function (skinId) {
  return (/collector(_night)?/).test(skinId);
};

/**
 * Is skin scrat
 */
exports.isScratSkin = function (skinId) {
  return (/scrat/).test(skinId);
};

exports.isPlanterSkin = function (skinId) {
  return (/planter/).test(skinId);
};

exports.isHarvesterSkin = function (skinId) {
  return (/harvester/).test(skinId);
};

exports.isWordSearchSkin = function (skinId) {
  return skinId === 'letters';
};

exports.getSubtypeForSkin = function (skinId) {
  if (exports.isBeeSkin(skinId)) {
    return Bee;
  }
  if (exports.isCollectorSkin(skinId)) {
    return Collector;
  }
  if (exports.isWordSearchSkin(skinId)) {
    return WordSearch;
  }
  if (exports.isScratSkin(skinId)) {
    return Scrat;
  }
  if (exports.isHarvesterSkin(skinId)) {
    return Harvester;
  }
  if (exports.isPlanterSkin(skinId)) {
    return Planter;
  }
  return Farmer;
};
