import type {StudioData} from './Studio';

export interface Rect {
  width: number;
  height: number;
}

/**
 * Represents logic related to walls and collisions within Studio maps.
 */
class Walls {
  readonly gridAlignedMovement: boolean;
  readonly drawDebugRect: boolean;
  readonly wallCollisionRectOffsetX: number;
  readonly wallCollisionRectOffsetY: number;
  readonly wallCollisionRectWidth: number;
  readonly wallCollisionRectHeight: number;
  readonly background?: string;
  readonly wallMapRequested?: string;

  constructor(level: StudioData, skin: Skin, drawDebugRect: boolean) {
    this.gridAlignedMovement = skin.gridAlignedMovement;
    this.wallCollisionRectOffsetX = skin.wallCollisionRectOffsetX;
    this.wallCollisionRectOffsetY = skin.wallCollisionRectOffsetY;
    this.wallCollisionRectWidth = skin.wallCollisionRectWidth;
    this.wallCollisionRectHeight = skin.wallCollisionRectHeight;
    this.drawDebugRect = drawDebugRect;
  }

  setBackground(background: string) {
    this.background = background;
  }

  setWallMapRequested(wallMapRequested: string) {
    this.wallMapRequested = wallMapRequested;
  }

  /**
   * Test to see if a collidable will be touching a wall given particular X/Y
   * position coordinates (center)
   */
  willCollidableTouchWall(
    collidable: Rect,
    xCenter: number,
    yCenter: number,
  ): boolean {
    let width = collidable.width;
    let height = collidable.height;

    if (!this.gridAlignedMovement) {
      xCenter += this.wallCollisionRectOffsetX;
      yCenter += this.wallCollisionRectOffsetY;
      width = this.wallCollisionRectWidth || width;
      height = this.wallCollisionRectHeight || height;
    }

    this.drawDebugRect('avatarCollision', xCenter, yCenter, width, height);
    return this.willRectTouchWall(xCenter, yCenter, width, height);
  }

  /**
   * Overriden in subclasses
   */
  willRectTouchWall(
    _xCenter: number,
    _yCenter: number,
    _widtf: number,
    _height: number,
  ): boolean {
    return false;
  }

  overlappingTest(
    x1: number,
    x2: number,
    xVariance: number,
    y1: number,
    y2: number,
    yVariance: number,
  ): boolean {
    return Math.abs(x1 - x2) < xVariance && Math.abs(y1 - y2) < yVariance;
  }

  /**
   * Overriden in subclasses, for drawing walls
   */
  getWallOverlayURI(): string | undefined {
    return;
  }

  /**
   * Overriden in subclasses
   * @param color - new wall color as a hex triplet
   */
  setColor(_color: string) {}
}

export default Walls;
