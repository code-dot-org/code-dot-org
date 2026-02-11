import Cell, {type CellConstructor} from './Cell';
import type MazeController from './MazeController';
import MazeMap from './MazeMap';
import NeighborhoodCell from './NeighborhoodCell';
import NeighborhoodDrawer from './NeighborhoodDrawer';
import type {SpriteMap} from './skin';
import Subtype, {type SubtypeConfiguration} from './Subtype';
import {Direction} from './tiles';

class Neighborhood extends Subtype<NeighborhoodCell, NeighborhoodDrawer> {
  private spriteMap: SpriteMap;
  private sheetRows: {
    [key: string]: number;
  };
  private assetList: string[];
  private squareSize: number;

  constructor(maze: MazeController, config: SubtypeConfiguration) {
    super(maze, config);

    this.spriteMap = this.skin_.spriteMap || {};
    this.sheetRows = this.skin_.sheetRows || {};

    this.squareSize = this.skin_.squareSize || 1;
    this.assetList = [];
  }

  /** @override */
  isNeighborhood() {
    return true;
  }

  /** @override */
  allowMultiplePegmen() {
    return true;
  }

  /** @override */
  getCellClass(): CellConstructor {
    return NeighborhoodCell;
  }

  getNeighborhoodMap(): MazeMap<NeighborhoodCell> | undefined {
    return this.maze_.map as MazeMap<NeighborhoodCell> | undefined;
  }

  /**
   * Draw the tiles making up the maze map.
   * @override
   */
  drawMapTiles(svg: SVGSVGElement) {
    // Compute and draw the tile for each square.
    let tileId = 0;
    this.getNeighborhoodMap()?.forEachCell(
      (_cell: Cell, row: number, col: number) => {
        // draw blank tile
        this.drawTile(svg, [0, 0], row, col, tileId);

        const asset = this.drawer.getBackgroundTileInfo(row, col);
        if (asset) {
          // add asset id to the assetList
          this.assetList.push('tileElement' + `${tileId}-asset`);
          // add assset on top of blank tile if it exists
          // asset is in format {name: 'sample name', sheet: x, row: y, column: z}
          const assetHref = this.skin_.assetUrl(asset.sheet);
          const [sheetWidth, sheetHeight] = this.getDimensionsForSheet(
            asset.sheet,
          );
          this.drawer.drawTileHelper(
            svg,
            [asset.column, asset.row],
            row,
            col,
            `${tileId}-asset`,
            assetHref,
            sheetWidth,
            sheetHeight,
            this.squareSize,
          );
        }
        this.drawer.updateItemImage(row, col, false);
        tileId++;
      },
    );
  }

  /** @override **/
  createDrawer(svg: SVGSVGElement) {
    const map = this.getNeighborhoodMap();
    if (map) {
      this.drawer = new NeighborhoodDrawer(
        map,
        this.skin_,
        svg,
        this.squareSize,
        this,
      );
    }
  }

  /**
   * Paint the current location of the pegman with id pegmanId.
   * @param pegmanId - The id of the pegman to query the location to paint.
   * @param color - Color to paint current location. Must be hex or html color.
   **/
  addPaint(pegmanId: string, color: string) {
    const col = this.maze_.getPegmanX(pegmanId) || 0;
    const row = this.maze_.getPegmanY(pegmanId) || 0;

    const cell = this.getCell(row, col) as NeighborhoodCell | undefined;
    cell?.setColor(color);
    this.drawer.updateItemImage(row, col, true);
    this.drawer.drawAssets();
  }

  /**
   * Remove paint from the location of the pegman with id pegmanId.
   **/
  removePaint(pegmanId?: string) {
    const col = this.maze_.getPegmanX(pegmanId) || 0;
    const row = this.maze_.getPegmanY(pegmanId) || 0;

    this.drawer.resetTile(row, col);
    this.drawer.updateItemImage(row, col, true);
    this.drawer.drawAssets();
  }

  /**
   * Turns the painter left by one direction.
   */
  turnLeft(pegmanId?: string) {
    let newDirection;
    switch (this.maze_.getPegmanD(pegmanId)) {
      case Direction.NORTH:
        newDirection = Direction.WEST;
        break;
      case Direction.EAST:
        newDirection = Direction.NORTH;
        break;
      case Direction.SOUTH:
        newDirection = Direction.EAST;
        break;
      case Direction.WEST:
        newDirection = Direction.SOUTH;
        break;
    }
    this.maze_.animatedCardinalTurn(newDirection || 0, pegmanId);
  }

  takePaint(pegmanId?: string) {
    const col = this.maze_.getPegmanX(pegmanId) || 0;
    const row = this.maze_.getPegmanY(pegmanId) || 0;

    const cell = this.getCell(row, col);
    cell?.setCurrentValue((cell?.getCurrentValue() || 0) - 1);
    this.drawer.updateItemImage(row, col, true);
  }

  setBucketVisibility(showBuckets: boolean) {
    if (this.drawer.getBucketVisibility() !== showBuckets) {
      this.drawer.setBucketVisibility(showBuckets);
      this.redrawBucketTiles();
    }
  }

  redrawBucketTiles() {
    this.maze_.map?.forEachCell((cell: Cell, row: number, col: number) => {
      // if the cell has a value > 0, it has a bucket. Only update tiles with a bucket.
      if ((cell.getCurrentValue() || 0) > 0) {
        this.drawer.updateItemImage(row, col, true);
      }
    });
  }

  reset() {
    this.drawer.resetTiles();
  }

  // Sprite map maps asset ids to sprites within a spritesheet.
  getSpriteMap(): SpriteMap {
    return this.spriteMap;
  }

  // Get dimensions for spritesheet of static images.
  getDimensionsForSheet(sheet: string): [number, number] {
    return [10 * this.squareSize, this.sheetRows[sheet] * this.squareSize];
  }

  // Retrieve the asset list
  getAssetList(): string[] {
    return this.assetList;
  }
}

export default Neighborhood;
