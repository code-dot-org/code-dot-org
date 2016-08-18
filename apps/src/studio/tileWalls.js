import Walls from './walls';

export default class TileWalls extends Walls {
  /**
   * @override
   */
  willRectTouchWall(xCenter, yCenter, collidableWidth, collidableHeight) {
    var colsOffset = Math.floor(xCenter) + 1;
    var rowsOffset = Math.floor(yCenter) + 1;
    var xGrid = Math.floor(xCenter / Studio.SQUARE_SIZE);
    var iYGrid = Math.floor(yCenter / Studio.SQUARE_SIZE);


    // Compare against regular wall tiles.
    for (var col = Math.max(0, xGrid - colsOffset);
         col < Math.min(Studio.COLS, xGrid + colsOffset);
         col++) {
      for (var row = Math.max(0, iYGrid - rowsOffset);
           row < Math.min(Studio.ROWS, iYGrid + rowsOffset);
           row++) {
        if (Studio.getWallValue(row, col)) {
          Studio.drawDebugRect("avatarCollision",
                               (col + 0.5) * Studio.SQUARE_SIZE,
                               (row + 0.5) * Studio.SQUARE_SIZE,
                               Studio.SQUARE_SIZE,
                               Studio.SQUARE_SIZE);
          if (this.overlappingTest(xCenter,
                                   (col + 0.5) * Studio.SQUARE_SIZE,
                                   Studio.SQUARE_SIZE / 2 + collidableWidth / 2,
                                   yCenter,
                                   (row + 0.5) * Studio.SQUARE_SIZE,
                                   Studio.SQUARE_SIZE / 2 + collidableHeight / 2)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
