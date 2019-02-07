function allSpritesWithCostume(costumeName) {
  if(costumeGroups.hasOwnProperty(costumeName)) {
    console.log(costumeGroups[costumeName].length);
    return costumeGroups[costumeName];
  }
  return [];
}