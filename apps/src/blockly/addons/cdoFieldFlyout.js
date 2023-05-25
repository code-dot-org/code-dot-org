import GoogleBlockly from 'blockly/core';
import CdoBlockFlyout from './cdoBlockFlyout';

/**
 * @param value The initial value of the field.
 *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
 * subclasses that want to handle configuration and setting the field value
 * after their own constructors have run).
 * @param opt_validator  A function that is called to validate changes to the
 *     field's value. Takes in a value & returns a validated value, or null to
 *     abort the change.
 * @param opt_config A map of options used to configure the field.
 *    Refer to the individual field's documentation for a list of properties
 * this parameter supports.
 */
export default class CdoFieldFlyout extends GoogleBlockly.Field {
  constructor(value, opt_config) {
    super(value);
    this.configure_(opt_config);
  }

  static fromJson(options) {
    return new CdoFieldFlyout(options.flyoutKey, options);
  }

  EDITABLE = false;
  CURSOR = 'default';

  configure_(config) {
    config &&
      ((this.foldoutText_ = config.foldoutText),
      (this.sizingBehavior_ = config.sizingBehavior),
      (this.minWidth_ = config.minWidth),
      (this.maxWidth_ = config.maxWidth));
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

  /**
   * Used by getSize() to move/resize any DOM elements, and get the new size.
   *
   * All rendering that has an effect on the size/shape of the block should be
   * done here, and should be triggered by getSize().
   */
  render_() {
    const fieldGroupBBox = this.fieldGroup_.getBBox();
    if (this.flyout_.isVisible()) {
      const textElementBBox = this.textElement_.getBBox();
      // maybe figure out how to remove global reference?
      this.size_ = new Blockly.utils.Size(
        Math.max(textElementBBox.width, this.flyout_.getWidth() + 16),
        fieldGroupBBox.height + 14
      );
    } else {
      this.size_ = new Blockly.utils.Size(
        fieldGroupBBox.width,
        fieldGroupBBox.height
      );
    }
  }

  setFlyoutVisible(isVisible) {
    this.flyout_.targetWorkspace_ ||
      (this.flyout_.init(this.workspace_), this.flyout_.svgGroup);
    isVisible
      ? ((this.arrow_.nodeValue = '\u25be'), this.flyout_.show(this.getValue()))
      : ((this.arrow_.nodeValue = '\u25b8'), this.flyout_.hide());
    this.forceRerender();
  }

  isFlyoutVisible() {
    return this.flyout_.isVisible();
  }
}
