/**
 * Creates a map of entity name to entity version where the version is the highest for that name
 * @param {Array<{metadata: {name: string, version: number}}>} foormEntities foorm entities (forms or libraries)
 * @returns map from name to latest version for that name
 */
export const getLatestVersionMap = foormEntities => {
  const getName = entity => entity['metadata']['name'];
  const getVersion = entity => Number(entity['metadata']['version']);
  const latestVersionMap = foormEntities.reduce((map, entity) => {
    if (!map[getName(entity)] || getVersion(entity) > map[getName(entity)]) {
      map[getName(entity)] = getVersion(entity);
    }
    return map;
  }, {});
  return latestVersionMap;
};
