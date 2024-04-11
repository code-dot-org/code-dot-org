import color from '@cdo/apps/util/color';
import {BlockSvg} from 'blockly';

const BUBBLE_SIZE = 18;
const HALF_BUBBLE_SIZE = BUBBLE_SIZE / 2;
/**
 * Represents a bubble on a Blockly block, displaying the count of blocks remaining
 * based on a limit initially stated in the toolbox XML.
 */
export default class BlockSvgLimit {
  protected element_: BlockSvg;
  protected count: number;
  protected className: string;
  protected limitGroup_: SVGElement | undefined;
  protected limitRect_: SVGElement | undefined;
  protected limitText_: SVGElement | undefined;

  /**
   * Constructs an SVG group to track a block limit.
   * @param {Element} element - The block associated with the limit.
   * @param {string} [count] - The initial count to display.
   */
  constructor(element: BlockSvg, count: number) {
    this.element_ = element;
    this.count = count;
    this.className = 'blocklyLimit';

    this.limitGroup_ = undefined;
    this.limitRect_ = undefined;
    this.limitText_ = undefined;
    this.element_;
    this.initChildren();
  }

  /**
   * Updates the displayed count within the limit bubble and adjusts styling based
   * on the count.
   * @param {number} newCount The new count to display.
   */
  updateCount(newCount: number) {
    // Update the count and text content
    this.count = newCount;
    this.updateTextAndClass();
  }

  /**
   * Updates the text and class of the limit bubble depending on whether the student
   * has blocks remaining. If over the limit, displays an exclamation mark and changes
   * the bubble and text color.
   */
  updateTextAndClass() {
    if (!this.limitText_ || !this.limitGroup_) {
      return;
    }
    if (this.count >= 0) {
      this.limitText_.textContent = `${this.count}`;
      Blockly.utils.dom.removeClass(this.limitGroup_, 'overLimit');
      Blockly.utils.dom.removeClass(this.limitText_, 'overLimit');
    } else {
      this.limitText_.textContent = '!';
      Blockly.utils.dom.addClass(this.limitGroup_, 'overLimit');
      Blockly.utils.dom.addClass(this.limitText_, 'overLimit');
    }
    this.render();
  }

  /**
   * Disposes of the limit group and its children, cleaning up all references.
   */
  dispose() {
    this.limitGroup_?.remove();
    this.limitGroup_ = undefined;
    this.limitRect_ = undefined;
    this.limitText_ = undefined;
  }

  /**
   * Initializes the SVG elements that make up the limit bubble.
   */
  initChildren() {
    const position = this.element_.getRelativeToSurfaceXY();
    // Google Blockly's block ids are randomly generated and can
    // include invalid characters for element ids. Remove everything
    // except alphanumeric characters and whitespace, then collapse
    // multiple adjacent whitespace to single spaces.
    const safeCharBlockId = this.element_.id
      .replace(/[^\w\s\']|_/g, '')
      .replace(/\s+/g, ' ');

    this.limitGroup_ = Blockly.utils.dom.createSvgElement(
      'g',
      {
        class: this.className,
      },
      this.element_.getSvgRoot()
    );

    this.limitRect_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        height: BUBBLE_SIZE,
        width: BUBBLE_SIZE,
        x: -HALF_BUBBLE_SIZE,
        y: -HALF_BUBBLE_SIZE,
        rx: HALF_BUBBLE_SIZE,
        ry: HALF_BUBBLE_SIZE,
      },
      this.limitGroup_
    );

    this.limitText_ = Blockly.utils.dom.createSvgElement(
      'text',
      {
        class: 'blocklyText blocklyLimit',
        'dominant-baseline': 'central',
        'text-anchor': 'middle',
      },
      this.limitGroup_
    );
    this.updateTextAndClass();
  }

  /**
   * Renders the limit bubble, adjusting its size and position based on the
   * current count text. Called automatically when the instance is created or
   * updated.
   */
  render() {
    if (!this.limitGroup_ || !this.limitRect_ || !this.limitText_) {
      // If we haven't initialized the children yet, do nothing.
      return;
    }

    const svgGroup = this.element_.getSvgRoot();
    svgGroup.append(this.limitGroup_);

    const textBBox = (this.limitText_ as SVGGraphicsElement).getBBox();
    const rectWidth = Math.max(textBBox.width + HALF_BUBBLE_SIZE, BUBBLE_SIZE);

    // Stretch the bubble to to fit longer numbers as text.
    this.limitRect_.setAttribute('width', `${rectWidth}`);
    // Center the text in the bubble.
    this.limitText_.setAttribute(
      'x',
      `${Math.round(rectWidth * 0.5) - HALF_BUBBLE_SIZE}`
    );
  }
}
