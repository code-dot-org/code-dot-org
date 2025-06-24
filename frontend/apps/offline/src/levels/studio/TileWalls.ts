import type {Skin} from './skin';
import type {StudioData} from './Studio';
import Walls, {DrawDebugRectFunction} from './Walls';

class TileWalls extends Walls {
  readonly squareSize: number;
  readonly rows: number;
  readonly columns: number;
  readonly getWallValue: (row: number, col: number) => number;

  constructor(
    level: StudioData,
    skin: Skin,
    drawDebugRect: DrawDebugRectFunction,
    squareSize: number,
    rows: number,
    columns: number,
    getWallValue: (row: number, col: number) => number,
  ) {
    super(level, skin, drawDebugRect);

    this.squareSize = squareSize;
    this.rows = rows;
    this.columns = columns;
    this.getWallValue = getWallValue;
  }

  /** @override */
  willRectTouchWall(
    xCenter: number,
    yCenter: number,
    collidableWidth: number,
    collidableHeight: number,
  ): boolean {
    const colsOffset = Math.floor(xCenter) + 1;
    const rowsOffset = Math.floor(yCenter) + 1;
    const xGrid = Math.floor(xCenter / this.squareSize);
    const iYGrid = Math.floor(yCenter / this.squareSize);

    // Compare against regular wall tiles.
    for (
      let col = Math.max(0, xGrid - colsOffset);
      col < Math.min(this.columns, xGrid + colsOffset);
      col++
    ) {
      for (
        let row = Math.max(0, iYGrid - rowsOffset);
        row < Math.min(this.rows, iYGrid + rowsOffset);
        row++
      ) {
        if (this.getWallValue(row, col)) {
          this.drawDebugRect(
            'avatarCollision',
            (col + 0.5) * this.squareSize,
            (row + 0.5) * this.squareSize,
            this.squareSize,
            this.squareSize,
          );

          if (
            this.overlappingTest(
              xCenter,
              (col + 0.5) * this.squareSize,
              this.squareSize / 2 + collidableWidth / 2,
              yCenter,
              (row + 0.5) * this.squareSize,
              this.squareSize / 2 + collidableHeight / 2,
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

export default TileWalls;
