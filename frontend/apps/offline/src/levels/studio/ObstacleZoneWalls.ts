import type {ObstacleZones, Skin} from './skin';
import type {StudioData} from './Studio';
import Walls from './Walls';

class ObstacleZoneWalls extends Walls {
  readonly obstacleZones: ObstacleZones;

  constructor(level: StudioData, skin: Skin, drawDebugRect: boolean) {
    super(level, skin, drawDebugRect);

    this.obstacleZones = skin.customObstacleZones || {};
  }

  /** @override */
  willRectTouchWall(
    xCenter: number,
    yCenter: number,
    collidableWidth: number,
    collidableHeight: number,
  ) {
    const collisionRects =
      this.obstacleZones[this.background]?.[this.wallMapRequested] || [];

    // Compare against a set of specific rectangles.
    for (const rect in collisionRects) {
      const rectWidth = rect.maxX - rect.minX + 1;
      const rectHeight = rect.maxY - rect.minY + 1;
      const rectCenterX = rect.minX + rectWidth / 2;
      const rectCenterY = rect.minY + rectHeight / 2;
      this.drawDebugRect(
        'avatarCollision',
        rectCenterX,
        rectCenterY,
        rectWidth,
        rectHeight,
      );

      if (
        this.overlappingTest(
          xCenter,
          rectCenterX,
          rectWidth / 2 + collidableWidth / 2,
          yCenter,
          rectCenterY,
          rectHeight / 2 + collidableHeight / 2,
        )
      ) {
        return true;
      }
    }

    return false;
  }
}

export default ObstacleZoneWalls;
