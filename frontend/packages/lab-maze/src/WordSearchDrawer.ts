/**
 * Wordsearch drawer to implement drawing specific to wordsearch levels.
 */
import Cell from './Cell';
import {SVG_NS} from './constants';
import Drawer, {SQUARE_SIZE} from './Drawer';

const color = {
  black: '#000',
  white: '#fff',
};

class WordSearchDrawer extends Drawer<Cell> {
  /** @override */
  drawTile(
    svg: SVGSVGElement,
    _tileSheetLocation: [number, number],
    row: number,
    col: number,
    letter: string,
    _tileSheetHref: string,
  ) {
    const backgroundId = Drawer.cellId('backgroundLetter', row, col);
    const group = document.createElementNS(SVG_NS, 'g');
    const background = document.createElementNS(SVG_NS, 'rect');

    background.setAttribute('id', backgroundId);
    background.setAttribute('width', SQUARE_SIZE.toString());
    background.setAttribute('height', SQUARE_SIZE.toString());
    background.setAttribute('x', (col * SQUARE_SIZE).toString());
    background.setAttribute('y', (row * SQUARE_SIZE).toString());
    background.setAttribute('stroke', '#000000');
    background.setAttribute('stroke-width', '3');
    group.appendChild(background);

    const textElement = this.updateOrCreateText_('letter', row, col, letter);
    group.appendChild(textElement);
    svg.appendChild(group);
  }

  /** @override */
  updateOrCreateText_(
    prefix: string,
    row: number,
    col: number,
    text: string,
  ): SVGTextElement {
    const textElement = super.updateOrCreateText_(prefix, row, col, text);
    textElement.setAttribute('class', 'search-letter');
    textElement.setAttribute('width', SQUARE_SIZE.toString());
    textElement.setAttribute('height', SQUARE_SIZE.toString());
    textElement.setAttribute('x', ((col + 0.5) * SQUARE_SIZE).toString());
    textElement.setAttribute('y', ((row + 0.5) * SQUARE_SIZE).toString());
    textElement.setAttribute('font-size', '32');
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('font-family', 'Verdana');
    return textElement;
  }

  /**
   * Update a tile's highlighting. If we've flown over it, it should be green.
   * Otherwise we have a checkboard approach.
   */
  updateTileHighlight(row: number, col: number, highlighted: boolean) {
    let backColor = (row + col) % 2 === 0 ? '#dae3f3' : '#ffffff';
    const textColor = highlighted ? color.white : color.black;
    if (highlighted) {
      backColor = '#00b050';
    }
    const backgroundId = Drawer.cellId('backgroundLetter', row, col);
    const textId = Drawer.cellId('letter', row, col);

    document.getElementById(backgroundId)?.setAttribute('fill', backColor);
    const text = document.getElementById(textId) as SVGTextElement | null;
    if (text) {
      text.setAttribute('fill', textColor);

      // should only be false in unit tests
      if (text.getBBox) {
        // center text.
        const bbox = text.getBBox();
        const heightDiff = SQUARE_SIZE - bbox.height;
        const targetTopY = row * SQUARE_SIZE + heightDiff / 2;
        const offset = targetTopY - bbox.y;

        text.setAttribute('transform', `translate(0, ${offset})`);
      }
    }
  }
}

export default WordSearchDrawer;
