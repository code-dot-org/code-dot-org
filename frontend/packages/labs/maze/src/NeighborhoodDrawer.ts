import {SVG_NS} from './constants';
import Drawer, {SQUARE_SIZE} from './Drawer';
import MazeMap from './MazeMap';
import type Neighborhood from './Neighborhood';
import type NeighborhoodCell from './NeighborhoodCell';
import type {Skin} from './skin';
import {SquareType} from './tiles';

const TRIANGLE = 'triangle';
const SMALLTRI = 'smallCorner';
const CENTER = 'center';
const PATH = 'path';

// These multipliers control how far across the grid the corners are cut
// To keep the corners "even", they should add up to 1
const SMALLMULT = 0.3;
const LARGEMULT = 0.7;

// This creates the js equivalent of an Enum for the corner names
const Corners = {
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottomLeft: 'bottomLeft',
  bottomRight: 'bottomRight',
} as const;

type Corner = (typeof Corners)[keyof typeof Corners];

type ColorList = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

/**
 * This is a helper for creating SVG Elements.
 * Groups are created by grid tile, under which paths are nested. These groups
 * begin with "g" in the id. By checking for this when determining its position
 * within the hierarchy, we can nest these groups just before the pegman,
 * ensuring the pegman will appear on top of the paint.
 *
 * @param tag representing the element type, 'g' for group, 'path' for paths
 * @param props representing the details of the element
 * @param parent the parent it should be nested under
 * @param id the unique identifier, beginning with 'g' if a group element
 * @returns the element itself
 */
function svgElement(
  tag: string,
  props: {
    [key: string]: string;
  },
  parent: SVGElement | null | undefined,
  id: string,
) {
  let node = document.getElementById(id) as SVGElement | null;
  if (!node) {
    node = document.createElementNS(SVG_NS, tag) as SVGElement;
    node.setAttribute('id', id);
  }

  Object.keys(props).map(key => {
    node.setAttribute(key, props[key]);
  });

  if (parent && id.startsWith('g')) {
    const pegmanElement = parent.getElementsByClassName('pegman-location')[0];
    if (pegmanElement) {
      parent.insertBefore(node, pegmanElement);
    }
  } else if (parent) {
    parent.appendChild(node);
  }

  return node;
}

/**
 * The following functions create SVGs for the small corner cutouts
 *
 * @param color the stroke and fill colors
 * @param grid the parent element
 * @param id the id label
 * @param size the square size
 * @param corner the enum stating which corner to draw
 */
function smallCornerSvg(
  color: string,
  grid: SVGElement,
  id: string,
  size: number,
  corner: Corner,
) {
  let finalId = '';
  let shape = '';
  if (corner === Corners.topLeft) {
    finalId = `${id}-${SMALLTRI}-tl`;
    shape = `m0,0 L${SMALLMULT * size},0 L0,${SMALLMULT * size} Z`;
  } else if (corner === Corners.topRight) {
    finalId = `${id}-${SMALLTRI}-tr`;
    shape = `m${size},0 L${LARGEMULT * size},0 L${size},${SMALLMULT * size} Z`;
  } else if (corner === Corners.bottomLeft) {
    finalId = `${id}-${SMALLTRI}-bl`;
    shape = `m0,${size} L0,${LARGEMULT * size} L${SMALLMULT * size},${size} Z`;
  } else if (corner === Corners.bottomRight) {
    finalId = `${id}-${SMALLTRI}-br`;
    shape = `m${size},${size} L${LARGEMULT * size},${size} L${size},${
      LARGEMULT * size
    } Z`;
  }
  svgElement(
    PATH,
    {
      d: shape,
      stroke: color,
      fill: color,
    },
    grid,
    finalId,
  );
}

/**
 * Returns the svg element for the half-grid triangle depending on which
 * corner is the source. For example, the following two are Corners.bottomLeft
 * and Corners.bottomRight:
 * .          .
 * | \      / |
 * |___\  /___|
 *
 * @param color - The stroke and fill colors
 * @param grid - The parent element
 * @param id - The id label
 * @param size - The square size
 * @param corner - The enum stating which corner to draw
 */
function triangleSvg(
  color: string,
  grid: SVGElement,
  id: string,
  size: number,
  corner: Corner,
) {
  let finalId = '';
  let shape = '';
  if (corner === Corners.topLeft) {
    finalId = `${id}-${TRIANGLE}-tl`;
    shape = `m0,0 L${size},0 L0,${size} Z`;
  } else if (corner === Corners.topRight) {
    finalId = `${id}-${TRIANGLE}-tr`;
    shape = `m${size},0 L${size},${size} L0,0 Z`;
  } else if (corner === Corners.bottomLeft) {
    finalId = `${id}-${TRIANGLE}-bl`;
    shape = `m0,${size} L${size},${size} L0,0 Z`;
  } else if (corner === Corners.bottomRight) {
    finalId = `${id}-${TRIANGLE}-br`;
    shape = `m${size},${size} L${size},0 L0,${size} Z`;
  }
  svgElement(
    PATH,
    {
      d: shape,
      stroke: color,
      fill: color,
    },
    grid,
    finalId,
  );
}

/**
 * Creates a path for a square with any number of corners 0-4 "cut out".
 * For example, if only topRightIsTruncated = true:
 *  _____
 * |     \
 * |      |
 * |______|
 */
function generateCenterPath(
  size: number,
  topLeftIsTruncated: boolean,
  topRightIsTruncated: boolean,
  bottomRightIsTruncated: boolean,
  bottomLeftIsTruncated: boolean,
) {
  const topLeftCorner = topLeftIsTruncated
    ? `m0,${size * SMALLMULT} L${size * SMALLMULT},0`
    : `m0,0`;
  const topRightCorner = topRightIsTruncated
    ? `L${size * LARGEMULT},0 L${size},${size * SMALLMULT}`
    : `L${size},0`;
  const bottomRightCorner = bottomRightIsTruncated
    ? `L${size},${size * LARGEMULT} L${size * LARGEMULT},${size}`
    : `L${size},${size}`;
  const bottomLeftCorner = bottomLeftIsTruncated
    ? `L${size * SMALLMULT},${size} L0,${size * LARGEMULT}`
    : `L0,${size}`;
  return `${topLeftCorner} ${topRightCorner} ${bottomRightCorner} ${bottomLeftCorner} Z`;
}

/**
 * Determines whether we should create a small corner SVG or a grid half triangle SVG,
 * if either. Add the corner cutout if the corner is the same color as the adjacent
 * cells, and at least one of the two corners on the other sides of the adjacent cells
 * with that same color. Add the triangle half-grids if the corner is the same color as
 * the adjacent cells, or has no color at all.
 */
function cornerFill(
  grid: SVGElement,
  id: string,
  size: number,
  adjacentColor: string,
  cornerColor: string,
  farCorner1: string,
  farCorner2: string,
  corner: Corner,
) {
  if (
    cornerColor &&
    cornerColor === adjacentColor &&
    (cornerColor === farCorner1 || cornerColor === farCorner2)
  ) {
    smallCornerSvg(adjacentColor, grid, id, size, corner);
  } else if (!cornerColor || cornerColor === adjacentColor) {
    triangleSvg(adjacentColor, grid, id, size, corner);
  }
}

/**
 * This drawer hosts all paint glomming logic.
 */
class NeighborhoodDrawer extends Drawer<NeighborhoodCell> {
  private skin_: Skin;
  private neighborhood: Neighborhood;
  private squareSize: number;
  private showBuckets: boolean;

  constructor(
    map: MazeMap<NeighborhoodCell>,
    skin: Skin,
    svg: SVGSVGElement,
    squareSize: number,
    neighborhood: Neighborhood,
  ) {
    super(map, '', svg);

    this.squareSize = squareSize;
    this.neighborhood = neighborhood;
    this.skin_ = skin;
    this.showBuckets = true;
  }

  getNeighborhoodMap(): MazeMap<NeighborhoodCell> {
    return this.map_ as MazeMap<NeighborhoodCell>;
  }

  setBucketVisibility(showBuckets: boolean) {
    this.showBuckets = showBuckets;
  }

  getBucketVisibility(): boolean {
    return this.showBuckets;
  }

  /**
   * Set the color of this tile back to null, and remove any svg elements
   * (colors) that currently exist on this tile and its neighbors.
   */
  resetTile(row: number, col: number) {
    const subjectTile = 'g' + row + '.' + col;
    const cell = this.neighborhood.getCell(row, col) as
      | NeighborhoodCell
      | undefined;
    cell?.setColor();
    const node = document.getElementById(subjectTile);
    if (node) {
      node.querySelectorAll('*').forEach(n => n.remove());
    }
  }

  /**
   * @override
   */
  getAsset(_prefix: string, row: number, col: number): string | undefined {
    const cell = this.neighborhood.getCell(row, col) as
      | NeighborhoodCell
      | undefined;
    // If a cell has a value, it is a paint bucket. Return the paintCan asset
    // if we currently are showing buckets.
    if (cell?.getCurrentValue() && this.showBuckets) {
      return this.skin_.paintCan;
    }
  }

  getBackgroundTileInfo(row: number, col: number) {
    const cell = this.neighborhood.getCell(row, col) as
      | NeighborhoodCell
      | undefined;
    // If the tile has an asset id and it is > 0 (0 is a blank tile and will always be added),
    // return the sprite asset.
    // Ignore the asset id if this is a start tile or the cell has an original value.
    // Start tiles will handle placing the pegman separately,
    // and tiles with a value are paint cans, which are handled as images instead of background tiles.
    if (
      cell &&
      cell.getAssetId() !== undefined &&
      cell.getAssetId() > 0 &&
      cell.getTile() !== SquareType.START &&
      !cell.getOriginalValue()
    ) {
      return this.getSpriteData(cell);
    }
  }

  getSpriteData(cell: NeighborhoodCell) {
    return this.neighborhood.getSpriteMap()[cell.getAssetId()];
  }

  /**
   * Calls resetTile for each tile in the grid, clearing all paint.
   */
  resetTiles() {
    this.showBuckets = true;
    for (let row = 0; row < this.getNeighborhoodMap().ROWS; row++) {
      for (let col = 0; col < this.getNeighborhoodMap().COLS; col++) {
        this.resetTile(row, col);
      }
    }
  }

  // Quick helper to retrieve the color stored in this cell
  // Ensures 'padding cells' (row/col < 0) have no color
  cellColor(row: number, col: number): string | undefined {
    if (row >= this.getNeighborhoodMap().ROWS || row < 0) return;
    if (col >= this.getNeighborhoodMap().COLS || col < 0) return;
    return this.getNeighborhoodMap().getCell(row, col)?.getColor();
  }

  /**
   * Determines how much of this tile should be colored in based on the colors
   * of the adjacent neighbors.
   */
  centerFill(cellColorList: ColorList, grid: SVGElement, id: string) {
    const topLeft = cellColorList[0];
    const top = cellColorList[1];
    const topRight = cellColorList[2];
    const left = cellColorList[3];
    const center = cellColorList[4];
    const right = cellColorList[5];
    const bottomLeft = cellColorList[6];
    const bottom = cellColorList[7];
    const bottomRight = cellColorList[8];
    let path;
    if (
      center == top &&
      center == right &&
      !bottom &&
      !left &&
      !topLeft &&
      !bottomRight
    )
      path = generateCenterPath(this.squareSize, false, false, false, true);
    else if (
      center == right &&
      center == bottom &&
      !left &&
      !top &&
      !topRight &&
      !bottomLeft
    )
      path = generateCenterPath(this.squareSize, true, false, false, false);
    else if (
      center == bottom &&
      center == left &&
      !top &&
      !right &&
      !bottomRight &&
      !topLeft
    )
      path = generateCenterPath(this.squareSize, false, true, false, false);
    else if (
      center == left &&
      center == top &&
      !right &&
      !bottom &&
      !bottomLeft &&
      !topRight
    )
      path = generateCenterPath(this.squareSize, false, false, true, false);
    else {
      path = generateCenterPath(this.squareSize, false, false, false, false);
    }
    svgElement(
      'path',
      {
        d: path,
        stroke: center,
        fill: center,
      },
      grid,
      `${id}-${CENTER}`,
    );
  }

  /**
   * Holds the bulk of the logic of coloring based on neighbor cells. The order
   * of cells in the input list is as follows, and are labeled accordingly:
   *
   * 0 1 2
   * 3 4 5
   * 6 7 8
   *
   * @param cellColorList representing the colors of a grid of 9 cells
   * @param grid the parent element we will add svg elements to
   * @param id the row and column we're on in id form
   */
  colorCells(cellColorList: ColorList, grid: SVGElement, id: string) {
    const size = this.squareSize;

    const topLeft = cellColorList[0];
    const top = cellColorList[1];
    const topRight = cellColorList[2];
    const left = cellColorList[3];
    const center = cellColorList[4];
    const right = cellColorList[5];
    const bottomLeft = cellColorList[6];
    const bottom = cellColorList[7];
    const bottomRight = cellColorList[8];

    // If anything has been drawn in this cell already, remove it
    const gridId = 'g' + id;
    const node = document.getElementById(gridId);
    if (node) {
      node.querySelectorAll('*').forEach(n => n.remove());
    }
    // if the center cell has paint, calculate its fill and corners
    if (center) {
      this.centerFill(cellColorList, grid, id);
    } else {
      // Check each set of adjacent neighbors and the corresponding corner cell
      // to determine if small corners or triangle half-grids should be added.
      if (top && right && top === right) {
        cornerFill(
          grid,
          id,
          size,
          top,
          topRight,
          topLeft,
          bottomRight,
          Corners.topRight,
        );
      }
      if (right && bottom && right === bottom) {
        cornerFill(
          grid,
          id,
          size,
          right,
          bottomRight,
          topRight,
          bottomLeft,
          Corners.bottomRight,
        );
      }
      if (bottom && left && bottom === left) {
        cornerFill(
          grid,
          id,
          size,
          bottom,
          bottomLeft,
          bottomRight,
          topLeft,
          Corners.bottomLeft,
        );
      }
      if (left && top && left === top) {
        cornerFill(
          grid,
          id,
          size,
          left,
          topLeft,
          bottomLeft,
          topRight,
          Corners.topLeft,
        );
      }
    }
  }

  // Creates the parent svg for this grid tile
  makeGrid(row: number, col: number, svg: SVGSVGElement) {
    const id = 'g' + row + '.' + col;
    svgElement(
      'g',
      {
        transform: `translate(${col * this.squareSize}, 
        ${row * this.squareSize})`,
      },
      svg,
      id,
    );
  }

  // Returns the group grid element given a row and column
  getGrid(row: number, col: number): SVGElement | undefined {
    const id = 'g' + row + '.' + col;
    return (document.getElementById(id) || undefined) as SVGElement | undefined;
  }

  /**
   * @override
   * Draw the given tile at row, col
   */
  drawTile(
    svg: SVGSVGElement,
    tileSheetLocation: [number, number],
    row: number,
    col: number,
    tileId: string | number,
    tileSheetHref: string,
  ) {
    // we have one background tile for neighborhood (we don't define paths like
    // the other skins). Therefore our 'tile sheet' is just one square.
    const tileSheetWidth = this.squareSize;
    const tileSheetHeight = this.squareSize;

    super.drawTileHelper(
      svg,
      tileSheetLocation,
      row,
      col,
      tileId,
      tileSheetHref,
      tileSheetWidth,
      tileSheetHeight,
      this.squareSize,
    );
  }

  // Iterates through all neighborhood assets and inserts them after the pegman
  drawAssets() {
    const assetList = this.neighborhood.getAssetList();
    let i;
    for (i = 0; i < assetList.length; i++) {
      const asset = assetList[i];
      const node = document.getElementById(asset);
      const pegmanElement =
        this.svg_.getElementsByClassName('pegman-location')[0];
      if (pegmanElement && node) {
        this.svg_.insertBefore(node, pegmanElement);
      }
    }
  }

  /**
   * @override
   * This method is used to display the paint and paint buckets.
   * It only updates the bucket at the specified row and col if necessary, and
   * only updates the paint on the neighborhing cells.
   * @param row - row of update
   * @param col - column of update
   * @param running - if the maze is currently running (not used here, but part of signature of super)
   */
  updateItemImage(
    row: number,
    col: number,
    _running: boolean = false,
    _squareSize: number = SQUARE_SIZE,
  ): SVGImageElement | undefined {
    const cell = this.getNeighborhoodMap().getCell(row, col);
    let ret: SVGImageElement | undefined;

    // if the cell value has ever been greater than 0, this has been or
    // is a paint can square. Ensure it is shown/hidden appropriately
    // and with the correct value.
    if (cell && (cell.getOriginalValue() || 0) > 0) {
      // The new value is the number of paint units to show on the screen. If we have > 0 units and we
      // are showing buckets, return the value, otherwise return an empty string so we hide the bucket and value.
      const newValue =
        (cell.getCurrentValue() || 0) > 0 && this.showBuckets
          ? cell.getCurrentValue() || 0
          : '';
      // drawImage_ calls getAsset. If currentValue() is 0 or we want to hide buckets, getAsset will return
      // undefined and the paint can will be hidden. Otherwise we will get the paint can image.
      ret = super.drawImage_('', row, col, this.squareSize);
      super.updateOrCreateText_(
        'counter',
        row,
        col,
        newValue.toString(),
        this.squareSize,
        1,
        1,
        'karel-counter-text paint',
      );
    }

    // Create grid block group for this center focus cell
    this.makeGrid(row, col, this.svg_);

    // Only calculate colors for all neighbors if this cell has a color
    if (this.cellColor(row, col)) {
      for (let r = row - 1; r < row + 2; r++) {
        for (let c = col - 1; c < col + 2; c++) {
          const id = r + '.' + c;

          const cells: ColorList = [
            this.cellColor(r - 1, c - 1) || '', // Top left
            this.cellColor(r - 1, c) || '', // Top
            this.cellColor(r - 1, c + 1) || '', // Top right
            this.cellColor(r, c - 1) || '', // Middle left
            this.cellColor(r, c) || '', // Target cell
            this.cellColor(r, c + 1) || '', // Middle right
            this.cellColor(r + 1, c - 1) || '', // Bottom left
            this.cellColor(r + 1, c) || '', // Bottom
            this.cellColor(r + 1, c + 1) || '', // Bottom right
          ];

          const grid = this.getGrid(r, c);

          // Calculate all the svg paths based on neighboring cell colors
          if (grid) {
            this.colorCells(cells, grid, id);
          }
        }
      }
    }

    return ret;
  }
}

export default NeighborhoodDrawer;
