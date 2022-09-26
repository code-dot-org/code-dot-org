var SPRITE_SIZE = 25;
var MIN_XY = SPRITE_SIZE / 2 + 5;
var MAX_XY = 400 - MIN_XY;

function layoutGrid() {
  var spriteIds = getSpriteIdsInUse();
  var count = spriteIds.length;
  var numRows = Math.ceil(Math.sqrt(count));
  var numCols = Math.ceil(count / numRows);
  for (var i = 0; i < count; i++) {
    var spriteIdArg = {id: spriteIds[i]};
    var row = Math.floor(i / numCols);
    var col = i % numCols;
    var colFraction = col / (numCols - 1) || 0;
    var x = MIN_XY + colFraction * (MAX_XY - MIN_XY);
    var rowFraction = row / (numRows - 1) || 0;
    var y = MIN_XY + rowFraction * (MAX_XY - MIN_XY);

    jumpTo(spriteIdArg, {x: x, y: y});
  }
}