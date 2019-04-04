function ifStandingOn(blockType, callback) {
  if (getStandingOnBlockType() === blockType) {
    callback();
  }
}