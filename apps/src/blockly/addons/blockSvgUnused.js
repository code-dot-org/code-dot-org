import msg from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BlockSvgFrame from './blockSvgFrame.js';
import {frameSizes} from './cdoConstants.js';

export default class BlockSvgUnused extends BlockSvgFrame {
  constructor(block, helpClickFunc) {
    var className = 'blocklyUnusedFrame';
    var text = msg.unusedCode();
    // Use dark text with lighter header fill color
    var textColor = color.black;
    var headerColor = color.lighter_gray;
    super(block, text, className, textColor, headerColor);
    this.helpClickFunc_ = helpClickFunc;
    this.frameHelp_ = undefined;
    this.initFrameHelp();
  }

  initFrameHelp() {
    this.frameHelp_ = Blockly.utils.dom.createSvgElement(
      'g',
      {
        class: 'blocklyHelp'
      },
      this.frameGroup_
    );
    Blockly.utils.dom.createSvgElement(
      'circle',
      {
        fill: '#7665a0',
        r: frameSizes.HEADER_HEIGHT * 0.75 * 0.5
      },
      this.frameHelp_
    );
    Blockly.utils.dom
      .createSvgElement(
        'text',
        {
          class: 'blocklyText',
          y: Blockly.utils.userAgent.IE ? 4 : 0 // again, offset text manually in IE
        },
        this.frameHelp_
      )
      .appendChild(document.createTextNode('?'));
  }
  bindClickEvent() {
    if (this.isbound_) {
      return;
    }
    this.isbound_ = true;

    // We bind to mousedown rather than click so we can interrupt the drag
    // that would otherwise be initiated.
    Blockly.cdoUtils.bindBrowserEvent(
      this.frameHelp_,
      'mousedown',
      this,
      function(e) {
        if (Blockly.utils.isRightButton(e)) {
          // Right-click.
          return;
        }

        this.helpClickFunc_(e);
        e.stopPropagation();
        e.preventDefault();
      }
    );
  }
  render(svgGroup, isRtl) {
    this.bindClickEvent();
    var groupRect = svgGroup.getBoundingClientRect();
    var minWidthAdjustment = this.frameHelp_.getBoundingClientRect().width;
    var width =
      Math.max(groupRect.width, minWidthAdjustment) +
      2 * frameSizes.MARGIN_SIDE;
    super.render(svgGroup, isRtl, width);
    this.frameHelp_.setAttribute(
      'transform',
      'translate(' +
        (width - 2 * frameSizes.MARGIN_SIDE) +
        ',' +
        -(frameSizes.MARGIN_TOP + frameSizes.HEADER_HEIGHT / 2) +
        ')'
    );
  }
  dispose() {
    this.frameGroup_.remove();
    this.frameGroup_ = undefined;
    this.frameClipRect_ = undefined;
    this.frameBase_ = undefined;
    this.frameHeader_ = undefined;
    this.frameText_ = undefined;
    this.frameHelp_ = undefined;
  }
}
