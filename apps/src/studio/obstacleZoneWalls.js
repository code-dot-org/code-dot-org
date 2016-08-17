import Walls from './walls';

export default class ObstacleZoneWalls extends Walls {
  constructor(level, skin) {
    super(level, skin);
    this.obstacleZones = skin.customObstacleZones;
  }

  willRectTouchWall(xCenter, yCenter, collidableWidth, collidableHeight) {
    if (this.obstacleZones[this.background] &&
        this.obstacleZones[this.background][this.wallMapRequested]) {
      const collisionRects =
        this.obstacleZones[this.background][this.wallMapRequested];

      // Compare against a set of specific rectangles.
      for (let i = 0; i < collisionRects.length; i++) {
        const rect = collisionRects[i];
        const rectWidth = rect.maxX-rect.minX+1;
        const rectHeight = rect.maxY-rect.minY+1;
        const rectCenterX = rect.minX + rectWidth/2;
        const rectCenterY = rect.minY + rectHeight/2;
        Studio.drawDebugRect("avatarCollision", rectCenterX, rectCenterY,
            rectWidth, rectHeight);

        if (this.overlappingTest(
            xCenter,
            rectCenterX,
            rectWidth / 2 + collidableWidth / 2,
            yCenter,
            rectCenterY,
            rectHeight / 2 + collidableHeight / 2)) {
          return true;
        }
      }
    }
    return false;
  }
}
