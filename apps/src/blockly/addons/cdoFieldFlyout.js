import GoogleBlockly from 'blockly/core';
import CdoBlockFlyout from './cdoBlockFlyout';

export default class CdoFieldFlyout extends GoogleBlockly.Field {
  constructor(a, b) {
    super(a);
    this.configure_(b);
  }

  static fromJson(a) {
    return new CdoFieldFlyout(a.flyoutKey, a);
  }

  EDITABLE = false;
  CURSOR = 'default';

  configure_(a) {
    a &&
      ((this.foldoutText_ = a.foldoutText),
      (this.sizingBehavior_ = a.sizingBehavior),
      (this.minWidth_ = a.minWidth),
      (this.maxWidth_ = a.maxWidth));
  }

  initView() {
    this.createTextElement_();
    this.textContent_.nodeValue = this.foldoutText_;
    var a = Blockly.utils.dom.createSvgElement('tspan', {}, null);
    this.arrow_ = document.createTextNode('\u25b8');
    a.appendChild(this.arrow_);
    this.textElement_.insertBefore(a, this.textContent_);
    this.workspace_ = this.getSourceBlock().workspace;
    this.flyout_ = new CdoBlockFlyout({
      ...Blockly.getMainWorkspace().options,
      disabledPatternId: this.workspace_.options.disabledPatternId,
      parentWorkspace: this.workspace_,
      RTL: this.workspace_.RTL,
      sizingBehavior: this.sizingBehavior_,
      minWidth: this.minWidth_,
      maxWidth: this.maxWidth_,
    });
    this.flyout_.setSourceBlock_(this.getSourceBlock());
    this.fieldGroup_.appendChild(this.flyout_.createDom('g'));
  }

  showEditor_() {
    this.setFlyoutVisible(!this.isFlyoutVisible());
  }

  render_() {
    var a = this.fieldGroup_.getBBox();
    if (this.flyout_.isVisible()) {
      var b = this.textElement_.getBBox();
      // maybe figure out how to remove global reference?
      this.size_ = new Blockly.utils.Size(
        Math.max(b.width, this.flyout_.getWidth() + 16),
        a.height + 14
      );
    } else {
      this.size_ = new Blockly.utils.Size(a.width, a.height);
    }
  }

  setFlyoutVisible(a) {
    this.flyout_.targetWorkspace_ ||
      (this.flyout_.init(this.workspace_), this.flyout_.svgGroup);
    a
      ? ((this.arrow_.nodeValue = '\u25be'), this.flyout_.show(this.getValue()))
      : ((this.arrow_.nodeValue = '\u25b8'), this.flyout_.hide());
    this.forceRerender();
  }

  isFlyoutVisible() {
    return this.flyout_.isVisible();
  }
}
