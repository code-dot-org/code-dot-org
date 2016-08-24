/**
 * @fileoverview Base class for drawing the various Maze Skins (Bee,
 * Farmer, Collector). Intended to be inherited from to provide
 * skin-specific functionality.
 */
import Drawer from './drawer';
import color from '../color';

/**
 * @param {MaseMap} map The map from the maze, which shows the current
 *        state of the dirt, flowers/honey, or treasure.
 * @param {string} asset the asset url to draw
 */
export default class WordSearchDrawer extends Drawer {

  /**
   * @override
   */
  drawTile(svg, letter, row, col) {
    const backgroundId = Drawer.cellId(row, col, 'backgroundLetter');
    const textId = Drawer.cellId(row, col, 'letter');

    const group = document.createElementNS(Drawer.SVG_NS, 'g');
    const background = document.createElementNS(Drawer.SVG_NS, 'rect');
    background.setAttribute('id', backgroundId);
    background.setAttribute('width', Drawer.SQUARE_SIZE);
    background.setAttribute('height', Drawer.SQUARE_SIZE);
    background.setAttribute('x', col * Drawer.SQUARE_SIZE);
    background.setAttribute('y', row * Drawer.SQUARE_SIZE);
    background.setAttribute('stroke', '#000000');
    background.setAttribute('stroke-width', 3);
    group.appendChild(background);

    const text = document.createElementNS(Drawer.SVG_NS, 'text');
    text.setAttribute('id', textId);
    text.setAttribute('class', 'search-letter');
    text.setAttribute('width', Drawer.SQUARE_SIZE);
    text.setAttribute('height', Drawer.SQUARE_SIZE);
    text.setAttribute('x', (col + 0.5) * Drawer.SQUARE_SIZE);
    text.setAttribute('y', (row + 0.5) * Drawer.SQUARE_SIZE);
    text.setAttribute('font-size', 32);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Verdana');
    text.textContent = letter;
    group.appendChild(text);
    svg.appendChild(group);
  }

  /**
   * Update a tile's highlighting. If we've flown over it, it should be green.
   * Otherwise we have a checkboard approach.
   */
  updateTileHighlight(row, col, highlighted) {
    let backColor = (row + col) % 2 === 0 ? '#dae3f3' : '#ffffff';
    const textColor = highlighted ? color.white : color.black;
    if (highlighted) {
      backColor = '#00b050';
    }
    const backgroundId = Drawer.cellId(row, col, 'backgroundLetter');
    const textId = Drawer.cellId(row, col, 'letter');

    document.getElementById(backgroundId).setAttribute('fill', backColor);
    const text = document.getElementById(textId);
    text.setAttribute('fill', textColor);

    // should only be false in unit tests
    if (text.getBBox) {
      // center text.
      const bbox = text.getBBox();
      const heightDiff = Drawer.SQUARE_SIZE - bbox.height;
      const targetTopY = row * Drawer.SQUARE_SIZE + heightDiff / 2;
      const offset = targetTopY - bbox.y;

      text.setAttribute("transform", `translate(0, ${offset})`);
    }
  }

}
