/**
 * Is skin either farmer or farmer_night
 */
export function isFarmerSkin(skinId) {
  return (/farmer(_night)?/).test(skinId);
}

/**
 * Is skin either bee or bee_night
 */
export function isBeeSkin(skinId) {
  return (/bee(_night)?/).test(skinId);
}

/**
 * Is skin either collector or collector_night
 */
export function isCollectorSkin(skinId) {
  return (/collector(_night)?/).test(skinId);
}

/**
 * Is skin scrat
 */
export function isScratSkin(skinId) {
  return (/scrat/).test(skinId);
}

export function isPlanterSkin(skinId) {
  return (/planter/).test(skinId);
}

export function isHarvesterSkin(skinId) {
  return (/harvester/).test(skinId);
}

export function isWordSearchSkin(skinId) {
  return skinId === 'letters';
}

export function getSubtypeForSkin(skinId) {
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
}

/**
 * Rotate the given 2d array.
 * @param data
 */
export function rotate(data) {
  return data[0].map((x, i) => data.map(x => x[data.length - i - 1]));
}
