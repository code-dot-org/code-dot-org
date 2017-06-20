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
const isBeeSkin = function (skinId) {
  return (/bee(_night)?/).test(skinId);
};

/**
 * Is skin either collector or collector_night
 */
const isCollectorSkin = function (skinId) {
  return (/collector(_night)?/).test(skinId);
};

/**
 * Is skin scrat
 */
const isScratSkin = function (skinId) {
  return (/scrat/).test(skinId);
};

const isPlanterSkin = function (skinId) {
  return (/planter/).test(skinId);
};

const isHarvesterSkin = function (skinId) {
  return (/harvester/).test(skinId);
};

const isWordSearchSkin = function (skinId) {
  return skinId === 'letters';
};

export default function getSubtypeForSkin(skinId) {
  if (isBeeSkin(skinId)) {
    return Bee;
  }
  if (isCollectorSkin(skinId)) {
    return Collector;
  }
  if (isWordSearchSkin(skinId)) {
    return WordSearch;
  }
  if (isScratSkin(skinId)) {
    return Scrat;
  }
  if (isHarvesterSkin(skinId)) {
    return Harvester;
  }
  if (isPlanterSkin(skinId)) {
    return Planter;
  }
  return Farmer;
}
