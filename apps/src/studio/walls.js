export default class Walls {
  constructor(level, skin, drawDebugRect) {
    this.gridAlignedMovement = skin.gridAlignedMovement;
    this.wallCollisionRectOffsetX = skin.wallCollisionRectOffsetX;
    this.wallCollisionRectOffsetY = skin.wallCollisionRectOffsetY;
    this.wallCollisionRectWidth = skin.wallCollisionRectWidth;
    this.wallCollisionRectHeight = skin.wallCollisionRectHeight;
    this.drawDebugRect = drawDebugRect;
  }

  setBackground(background) {
    this.background = background;
  }

  setWallMapRequested(wallMapRequested) {
    this.wallMapRequested = wallMapRequested;
  }

  /**
   * Test to see if a collidable will be touching a wall given particular X/Y
   * position coordinates (center)
   */
  willCollidableTouchWall(collidable, xCenter, yCenter) {
    var width = collidable.width;
    var height = collidable.height;

    if (!this.gridAlignedMovement) {
      xCenter += this.wallCollisionRectOffsetX;
      yCenter += this.wallCollisionRectOffsetY;
      width = this.wallCollisionRectWidth || width;
      height = this.wallCollisionRectHeight || height;
    }

    this.drawDebugRect("avatarCollision", xCenter, yCenter, width, height);
    return this.willRectTouchWall(xCenter, yCenter, width, height);
  }

  /**
   * Overriden in subclasses
   */
  willRectTouchWall(xCenter, yCenter, width, height) {
    return false;
  }

  overlappingTest(x1, x2, xVariance, y1, y2, yVariance) {
    return (Math.abs(x1 - x2) < xVariance) && (Math.abs(y1 - y2) < yVariance);
  }

  /**
   * Overriden in subclasses, for drawing walls
   */
  getWallOverlayURI() {
    return null;
  }

  /**
   * Overriden in subclasses
   * @param {string} color new wall color as a hex triplet
   */
  setColor(color) {}
}
