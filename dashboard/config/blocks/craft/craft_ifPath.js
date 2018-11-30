function ifPath(dir, callback) {
  var condition, blockType;
  if (dir === 'ahead') {
    condition = walkableAhead();
  } else if (dir === 'right') {
    condition = walkableToRight();
  } else {
    condition = walkableToLeft();
  }

  if (condition) {
    callback();
  }
}