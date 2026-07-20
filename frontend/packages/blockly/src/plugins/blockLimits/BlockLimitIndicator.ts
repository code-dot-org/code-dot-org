import * as Blockly from 'blockly/core';

import type {Theme} from '../../types';

const BUBBLE_SIZE = 18;
const HALF_BUBBLE_SIZE = BUBBLE_SIZE / 2;

/**
 * Represents a bubble on a Blockly block, displaying the count of blocks remaining
 * based on a limit initially stated in the toolbox XML.
 */
class BlockLimitIndicator {
  private readonly blockSvg: Blockly.BlockSvg;
  private count: number;
  private readonly limitGroup: SVGElement;
  private readonly limitRect: SVGElement;
  private readonly limitText: SVGElement;
  private theme: Theme;

  /**
   * Constructs an SVG group to track a block limit.
   * @param {BlockSvg} element - The block associated with the limit.
   * @param {number} count - The initial count to display.
   */
  constructor(element: Blockly.BlockSvg, count: number, theme: Theme) {
    this.blockSvg = element;
    this.count = count;
    this.theme = theme;

    // Initialize the SVG elements within the constructor
    this.limitGroup = Blockly.utils.dom.createSvgElement(
      'g',
      {},
      this.blockSvg.getSvgRoot(),
    );

    this.limitRect = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        height: BUBBLE_SIZE,
        width: BUBBLE_SIZE,
        x: -HALF_BUBBLE_SIZE,
        y: -HALF_BUBBLE_SIZE,
        rx: HALF_BUBBLE_SIZE,
        ry: HALF_BUBBLE_SIZE,
      },
      this.limitGroup,
    );

    this.limitText = Blockly.utils.dom.createSvgElement(
      'text',
      {
        class: 'blocklyText',
        'dominant-baseline': 'central',
        'text-anchor': 'middle',
      },
      this.limitGroup,
    );

    this.updateTextAndClass();
  }

  /**
   * Updates the displayed count within the limit bubble and adjusts styling based
   * on the count.
   * @param {number} newCount The new count to display.
   */
  public updateCount(newCount: number) {
    this.count = newCount;
    this.updateTextAndClass();
  }

  /**
   * Updates the text and class of the limit bubble depending on whether the student
   * has blocks remaining. If over the limit, displays an exclamation mark and changes
   * the bubble and text color.
   */
  private updateTextAndClass() {
    if (this.count >= 0) {
      this.limitText.textContent = `${this.count}`;
      this.limitRect.style.fill =
        this.theme?.definition?.blockLimits?.indicator?.fill || '#333';
      this.limitText.style.fill =
        this.theme?.definition?.blockLimits?.indicator?.text || '#333';
    } else {
      this.limitText.textContent = '!';
      this.limitRect.style.fill =
        this.theme?.definition?.blockLimits?.overLimit?.fill || '#f33';
      this.limitText.style.fill =
        this.theme?.definition?.blockLimits?.overLimit?.text || '#f33';
    }
    this.render();
  }

  /**
   * Renders the limit bubble, adjusting its size and position based on the
   * current count text. Called automatically when the instance is created or
   * updated.
   */
  private render() {
    const textBBox = (this.limitText as SVGGraphicsElement).getBBox();
    const rectWidth = Math.max(textBBox.width + HALF_BUBBLE_SIZE, BUBBLE_SIZE);
    const rectHeight = Math.max(
      textBBox.height + HALF_BUBBLE_SIZE / 2,
      BUBBLE_SIZE,
    );

    // Stretch the bubble to to fit longer numbers as text.
    this.limitRect.setAttribute('width', `${rectWidth}`);
    this.limitRect.setAttribute('height', `${rectHeight}`);
    // Center the text in the bubble.
    this.limitText.setAttribute('x', `${rectWidth / 2 - HALF_BUBBLE_SIZE}`);
    this.limitText.setAttribute(
      'y',
      `${Math.ceil(rectHeight / 2) - HALF_BUBBLE_SIZE}`,
    );
  }
}

export default BlockLimitIndicator;
