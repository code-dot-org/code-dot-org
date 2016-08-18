import Walls from './walls';

export default class TileWalls extends Walls {
  constructor(level, skin, drawDebugRect, squareSize, rows, columns, getWallValue) {
    super(level, skin, drawDebugRect);

    this.squareSize = squareSize;
    this.rows = rows;
    this.columns = columns;
    this.getWallValue = getWallValue;
  }
  /**
   * @override
   */
  willRectTouchWall(xCenter, yCenter, collidableWidth, collidableHeight) {
    var colsOffset = Math.floor(xCenter) + 1;
    var rowsOffset = Math.floor(yCenter) + 1;
    var xGrid = Math.floor(xCenter / this.squareSize);
    var iYGrid = Math.floor(yCenter / this.squareSize);


    // Compare against regular wall tiles.
    for (var col = Math.max(0, xGrid - colsOffset);
         col < Math.min(this.columns, xGrid + colsOffset);
         col++) {
      for (var row = Math.max(0, iYGrid - rowsOffset);
           row < Math.min(this.rows, iYGrid + rowsOffset);
           row++) {
        if (this.getWallValue(row, col)) {
          this.drawDebugRect("avatarCollision",
                               (col + 0.5) * this.squareSize,
                               (row + 0.5) * this.squareSize,
                               this.squareSize,
                               this.squareSize);
          if (this.overlappingTest(xCenter,
                                   (col + 0.5) * this.squareSize,
                                   this.squareSize / 2 + collidableWidth / 2,
                                   yCenter,
                                   (row + 0.5) * this.squareSize,
                                   this.squareSize / 2 + collidableHeight / 2)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
