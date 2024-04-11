import {BlockSvg} from 'blockly';

/**
 * Represents a bubble on a Blockly block, displaying the count of blocks remaining
 * based on a limit initially stated in the toolbox XML.
 */
export default class BlockSvgLimitIndicator {
  private readonly blockSvg: BlockSvg;
  private count: number;
  private readonly bubbleSize: number = 18;
  private readonly halfBubbleSize: number;
  private limitGroup: SVGElement | undefined;
  private limitRect: SVGElement | undefined;
  private limitText: SVGElement | undefined;

  /**
   * Constructs an SVG group to track a block limit.
   * @param {Element} element - The block associated with the limit.
   * @param {string} [count] - The initial count to display.
   */
  constructor(element: BlockSvg, count: number) {
    this.blockSvg = element;
    this.count = count;
    this.halfBubbleSize = this.bubbleSize / 2;

    this.limitGroup = undefined;
    this.limitRect = undefined;
    this.limitText = undefined;
    this.initializeSvgElements();
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
    if (!this.limitText || !this.limitGroup) {
      return;
    }
    if (this.count >= 0) {
      this.limitText.textContent = `${this.count}`;
      Blockly.utils.dom.removeClass(this.limitGroup, 'overLimit');
      Blockly.utils.dom.removeClass(this.limitText, 'overLimit');
    } else {
      this.limitText.textContent = '!';
      Blockly.utils.dom.addClass(this.limitGroup, 'overLimit');
      Blockly.utils.dom.addClass(this.limitText, 'overLimit');
    }
    this.render();
  }

  /**
   * Initializes the SVG elements that make up the limit bubble.
   */
  private initializeSvgElements() {
    this.limitGroup = Blockly.utils.dom.createSvgElement(
      'g',
      {
        class: 'blocklyLimit',
      },
      this.blockSvg.getSvgRoot()
    );

    this.limitRect = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        height: this.bubbleSize,
        width: this.bubbleSize,
        x: -this.halfBubbleSize,
        y: -this.halfBubbleSize,
        rx: this.halfBubbleSize,
        ry: this.halfBubbleSize,
      },
      this.limitGroup
    );

    this.limitText = Blockly.utils.dom.createSvgElement(
      'text',
      {
        class: 'blocklyText blocklyLimit',
        'dominant-baseline': 'central',
        'text-anchor': 'middle',
      },
      this.limitGroup
    );
    this.updateTextAndClass();
  }

  /**
   * Renders the limit bubble, adjusting its size and position based on the
   * current count text. Called automatically when the instance is created or
   * updated.
   */
  private render() {
    if (!this.limitGroup || !this.limitRect || !this.limitText) {
      // If we haven't initialized the children yet, do nothing.
      return;
    }

    const textBBox = (this.limitText as SVGGraphicsElement).getBBox();
    const rectWidth = Math.max(
      textBBox.width + this.halfBubbleSize,
      this.bubbleSize
    );
    const rectHeight = Math.max(
      textBBox.height + this.halfBubbleSize / 2,
      this.bubbleSize
    );

    // Stretch the bubble to to fit longer numbers as text.
    this.limitRect.setAttribute('width', `${rectWidth}`);
    this.limitRect.setAttribute('height', `${rectHeight}`);
    // Center the text in the bubble.
    this.limitText.setAttribute('x', `${rectWidth / 2 - this.halfBubbleSize}`);
    this.limitText.setAttribute(
      'y',
      `${Math.ceil(rectHeight / 2) - this.halfBubbleSize}`
    );
  }
}
