/**
 * Is skin either farmer or farmer_night
 */
exports.isFarmerSkin = function (skinId) {
  return (/farmer(_night)?/).test(skinId);
};

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
  if (exports.isFarmerSkin(skinId)) {
    return require('./farmer');
  }
  if (exports.isBeeSkin(skinId)) {
    return require('./bee');
  }
  if (exports.isCollectorSkin(skinId)) {
    return require('./collector');
  }
  if (exports.isWordSearchSkin(skinId)) {
    return require('./wordsearch');
  }
  if (exports.isScratSkin(skinId)) {
    return require('./scrat');
  }
  if (exports.isHarvesterSkin(skinId)) {
    return require('./harvester');
  }
  if (exports.isPlanterSkin(skinId)) {
    return require('./planter');
  }

  return require('./subtype');
};

/**
 * Rotate the given 2d array.
 * @param data
 */
exports.rotate = function (data) {
  return data[0].map((x, i) => data.map(x => x[data.length - i - 1]));
};
