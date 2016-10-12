
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
