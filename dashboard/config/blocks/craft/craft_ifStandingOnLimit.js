function ifStandingOnLimit(blockType, callback) {
  if (getStandingOnBlockType() === blockType) {
    callback();
  }
}