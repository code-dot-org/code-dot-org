/**
 * Base class for drawing the various Maze Skins (Bee,
 * Farmer, Collector). Intended to be inherited from to provide
 * skin-specific functionality.
 */

import Cell from './Cell';
import {SVG_NS} from './constants';
import MazeMap from './MazeMap';

export const SQUARE_SIZE = 50;

class Drawer<T extends Cell> {
  svg_: SVGSVGElement;
  asset_: string;
  map_: MazeMap<Cell>;

  /**
   * Constructs a drawer.
   * @param map - The map from the maze, which shows the current
   *        state of the dirt, flowers/honey, or treasure.
   * @param asset - the asset url to draw
   */
  constructor(map: MazeMap<T>, asset: string, svg: SVGSVGElement) {
    this.map_ = map;
    this.asset_ = asset;
    this.svg_ = svg;
  }

  /**
   * Generalized function for generating ids for cells in a table
   */
  static cellId(prefix: string, row: number, col: number) {
    return prefix + '_' + row.toString() + '_' + col.toString();
  }

  /**
   * Return the appropriate asset url for the given location. Overridden
   * by child classes to do much more interesting things.
   */
  getAsset(_prefix: string, _row: number, _col: number): string | undefined {
    return this.asset_;
  }

  /**
   * Intentional noop function; BeeItemDrawer needs to be able to reset
   * between runs, so we implement a shared reset function so that we can
   * call drawer.reset() blindly. Overridden by BeeItemDrawer
   */
  reset() {}

  /**
   * Update the image at the given row,col
   *
   * @param row - Row position
   * @param col - Column position
   * @param running - Is user code currently running
   * @param squareSize - The size of the square
   */
  updateItemImage(
    row: number,
    col: number,
    _running: boolean = false,
    squareSize: number = SQUARE_SIZE,
  ): SVGImageElement | undefined {
    return this.drawImage_('', row, col, squareSize);
  }

  /**
   * Creates/Update the image at the given row,col with the given prefix
   */
  drawImage_(
    prefix: string,
    row: number,
    col: number,
    squareSize: number = SQUARE_SIZE,
  ): SVGImageElement | undefined {
    let img = this.svg_.querySelector('#' + Drawer.cellId(prefix, row, col)) as
      | SVGImageElement
      | undefined;
    const href = this.getAsset(prefix, row, col);

    // if we have not already created this image and don't want one,
    // return
    if (!img && !href) {
      return;
    }

    // otherwise create the image if we don't already have one, update
    // the href to whatever we want it to be, and hide it if we don't
    // have one
    img = this.getOrCreateImage_(prefix, row, col, true, squareSize);
    if (img) {
      img.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        href || '',
      );
      img.setAttribute('visibility', href ? 'visible' : 'hidden');
    }

    return img;
  }

  /**
   * Creates a new image and optional clipPath, or returns the image if
   * it already exists
   */
  getOrCreateImage_(
    prefix: string,
    row: number,
    col: number,
    createClipPath: boolean = true,
    squareSize: number = SQUARE_SIZE,
  ): SVGImageElement | undefined {
    const href = this.getAsset(prefix, row, col);

    const imgId = Drawer.cellId(prefix, row, col);

    // Don't create an image if one with this identifier already exists
    let img = this.svg_.querySelector('#' + imgId) as
      | SVGImageElement
      | undefined;
    if (img) {
      return img;
    }

    // Don't create an empty image
    if (!href) {
      return;
    }

    const pegmanElement =
      this.svg_.getElementsByClassName('pegman-location')[0];

    let clipId;
    // Create clip path.
    if (createClipPath) {
      clipId = Drawer.cellId(prefix + 'Clip', row, col);
      const clip = document.createElementNS(SVG_NS, 'clipPath');
      clip.setAttribute('id', clipId);
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', (col * squareSize).toString());
      rect.setAttribute('y', (row * squareSize).toString());
      rect.setAttribute('width', squareSize.toString());
      rect.setAttribute('height', squareSize.toString());
      clip.appendChild(rect);
      this.svg_.insertBefore(clip, pegmanElement);
    }

    // Create image.
    img = document.createElementNS(SVG_NS, 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    img.setAttribute('height', squareSize.toString());
    img.setAttribute('width', squareSize.toString());
    img.setAttribute('x', (squareSize * col).toString());
    img.setAttribute('y', (squareSize * row).toString());
    img.setAttribute('id', imgId);
    if (createClipPath) {
      img.setAttribute('clip-path', 'url(#' + clipId + ')');
    }
    this.svg_.insertBefore(img, pegmanElement);

    return img;
  }

  /**
   * Create SVG text element for given cell
   * @param prefix
   * @param row
   * @param col
   * @param text
   * @param squareSize - (optional): size of tile
   * @param hPadding - (optional): horizontal padding from bottom left corner
   * @param vPadding - (optional): vertical padding from bottom left corner
   * @param className - (optional): css class name to apply to the text element
   */
  updateOrCreateText_(
    prefix: string,
    row: number,
    col: number,
    text: string,
    squareSize: number = SQUARE_SIZE,
    hPadding: number = 2,
    vPadding: number = 2,
    className: string = 'karel-counter-text',
  ): SVGTextElement {
    const pegmanElement =
      this.svg_.getElementsByClassName('pegman-location')[0];
    let textElement = this.svg_.querySelector(
      '#' + Drawer.cellId(prefix, row, col),
    ) as SVGTextElement | undefined;

    if (!textElement) {
      // Create text.
      textElement = document.createElementNS(SVG_NS, 'text');
      textElement.setAttribute('class', className);

      // Position text just inside the bottom right corner.
      textElement.setAttribute(
        'x',
        ((col + 1) * squareSize - hPadding).toString(),
      );
      textElement.setAttribute(
        'y',
        ((row + 1) * squareSize - vPadding).toString(),
      );
      textElement.setAttribute('id', Drawer.cellId(prefix, row, col));
      textElement.appendChild(document.createTextNode(''));
      this.svg_.insertBefore(textElement, pegmanElement);
    }

    if (textElement.firstChild) {
      textElement.firstChild.nodeValue = text;
    }

    return textElement;
  }

  /**
   * Draw the given tile at row, col from a
   * tile sheet that is SQUARE_SIZE * 5 x SQUARE_SIZE * 4
   */
  drawTile(
    svg: SVGSVGElement,
    tileSheetLocation: [number, number],
    row: number,
    col: number,
    tileId: string | number,
    tileSheetHref: string,
  ) {
    const tileSheetWidth = SQUARE_SIZE * 5;
    const tileSheetHeight = SQUARE_SIZE * 4;

    this.drawTileHelper(
      svg,
      tileSheetLocation,
      row,
      col,
      tileId,
      tileSheetHref,
      tileSheetWidth,
      tileSheetHeight,
      SQUARE_SIZE,
    );
  }

  /**
   * Helper function for drawing a tile from a tile sheet
   * with the given dimensions and square size.
   */
  drawTileHelper(
    svg: SVGSVGElement,
    tileSheetLocation: [number, number],
    row: number,
    col: number,
    tileId: string | number,
    tileSheetHref: string,
    tileSheetWidth: number,
    tileSheetHeight: number,
    squareSize: number,
  ) {
    const [left, top] = tileSheetLocation;

    // Tile's clipPath element.
    const tileClip = document.createElementNS(SVG_NS, 'clipPath');
    tileClip.setAttribute('id', 'tileClipPath' + tileId.toString());
    const tileClipRect = document.createElementNS(SVG_NS, 'rect');
    tileClipRect.setAttribute('width', squareSize.toString());
    tileClipRect.setAttribute('height', squareSize.toString());

    tileClipRect.setAttribute('x', (col * squareSize).toString());
    tileClipRect.setAttribute('y', (row * squareSize).toString());
    tileClip.appendChild(tileClipRect);
    svg.appendChild(tileClip);

    // Tile sprite.
    const tileElement = document.createElementNS(SVG_NS, 'image');
    tileElement.setAttribute('id', 'tileElement' + tileId.toString());
    tileElement.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      tileSheetHref,
    );
    tileElement.setAttribute('height', tileSheetHeight.toString());
    tileElement.setAttribute('width', tileSheetWidth.toString());
    tileElement.setAttribute(
      'clip-path',
      'url(#tileClipPath' + tileId.toString() + ')',
    );
    tileElement.setAttribute('x', ((col - left) * squareSize).toString());
    tileElement.setAttribute('y', ((row - top) * squareSize).toString());
    svg.appendChild(tileElement);

    // Tile animation
    const tileAnimation = document.createElementNS(SVG_NS, 'animate');
    tileAnimation.setAttribute('id', 'tileAnimation' + tileId.toString());
    tileAnimation.setAttribute('attributeType', 'CSS');
    tileAnimation.setAttribute('attributeName', 'opacity');
    tileAnimation.setAttribute('from', '1');
    tileAnimation.setAttribute('to', '0');
    tileAnimation.setAttribute('dur', '1s');
    tileAnimation.setAttribute('begin', 'indefinite');
    tileElement.appendChild(tileAnimation);
  }
}

export default Drawer;
